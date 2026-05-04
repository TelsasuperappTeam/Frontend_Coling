import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, ROLES, getFileUrl } from "../../../config/constants";
import DataDiriPabrik from "./DataDiriPabrik";
import {
  Loader2,
  Truck,
  Droplets,
  Factory,
  User,
  Database,
  Clock,
  Package,
} from "lucide-react";

const Card = ({ title, children, rightContent, footer, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col h-[320px] overflow-hidden">
    <div className="bg-[#EF8523] px-4 py-3 sm:px-4 flex justify-between items-center flex-shrink-0">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm shadow-sm flex items-center justify-center">
            <Icon className="text-white w-4 h-4" />
          </div>
        )}
        <h3 className="font-bold text-white text-sm sm:text-base tracking-wide">
          {title}
        </h3>
      </div>
      {rightContent && <div>{rightContent}</div>}
    </div>

    <div className="p-3 sm:p-4 flex-grow flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
      {children}
    </div>

    {footer && (
      <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-100 text-sm text-gray-500 flex-shrink-0">
        {footer}
      </div>
    )}
  </div>
);

const isProfileIncomplete = (p) => {
  return (
    !p.nama_pabrik ||
    !p.nomor_telepon ||
    !p.email ||
    !p.foto ||
    !p.alamat_pabrik ||
    !p.koordinat
  );
};

export default function DashboardPabrik() {
  const navigate = useNavigate();
  const [showPopupDataDiri, setShowPopupDataDiri] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // --- STATE PROFILE  ---
  const [profile, setProfile] = useState({
    nama_pabrik: "",
    role: "Pabrik",
    email: "",
    nomor_telepon: "",
    alamat_pabrik: "",
    foto: "",
    koordinat: "",
  });

  // STATE: Untuk Pantau Pengiriman (Aktif)
  const [pengirimanAktif, setPengirimanAktif] = useState([]);
  const [isLoadingAktif, setIsLoadingAktif] = useState(true);

  // STATE BARU: Untuk Kapasitas Stok RAM
  const [kapasitasRAM, setKapasitasRAM] = useState({ total: 0, terpakai: 0 });
  const [isLoadingRAM, setIsLoadingRAM] = useState(true);

  // STATE BARU: Untuk Siklus Produksi Aktif
  const [siklusAktif, setSiklusAktif] = useState([]);
  const [isLoadingSiklus, setIsLoadingSiklus] = useState(true);

  // Helper Format Waktu (ISO -> DD/MM/YYYY, HH:mm)
  const formatWaktu = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date
      .toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(/\./g, ":");
  };

  // --- FETCH DATA USER (API) ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(API_ENDPOINTS.USER.ME, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Gagal mengambil data profil");

        const userData = await response.json();

        setProfile({
          nama_pabrik: userData.nama_lengkap || "-",
          role: "Pabrik",
          email: userData.email || "-",
          nomor_telepon: userData.no_hp || "-",
          alamat_pabrik: userData.alamat || "",
          foto: getFileUrl(userData.foto_profil_url) || "",
          koordinat: userData.koordinat
            ? JSON.stringify(userData.koordinat)
            : "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  // --- FETCH KETIGA DATA (TRUK AKTIF, STOK RAM, & PRODUKSI) PARALEL ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoadingAktif(true);
      setIsLoadingRAM(true);
      setIsLoadingSiklus(true);
      try {
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");
        if (!token) return;

        // Tembak 3 API sekaligus agar performa dashboard sangat cepat
        const [resAktif, resRam, resSiklus] = await Promise.all([
          fetch(API_ENDPOINTS.TRACEABILITY.PABRIK.PEMERIKSAAN.DASHBOARD, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),

          fetch(API_ENDPOINTS.TRACEABILITY.PABRIK.STOK_RAM, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),
          // Tambahan: Fetch API Siklus Aktif
          fetch(
            `${API_ENDPOINTS.TRACEABILITY.PABRIK.PRODUKSI.GET_LIST}?is_history=false`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ).catch(() => null),
        ]);

        // 1. Proses Data Aktif (Riwayat Pemeriksaan / Truk)
        if (resAktif && resAktif.ok) {
          const dataAktif = await resAktif.json();

          // ---> [TAMBAHAN] CONSOLE LOG DATA AKTIF / PEMERIKSAAN <---
          console.log(
            "=== DATA DASHBOARD PEMERIKSAAN (DARI BE) ===",
            dataAktif,
          );

          const filteredAktif = dataAktif.filter(
            (item) => item.status_permintaan?.toLowerCase() === "diterima",
          );
          setPengirimanAktif(filteredAktif);
        }

        // 2. Proses Data Kapasitas RAM
        if (resRam && resRam.ok) {
          const dataRam = await resRam.json();

          // ---> [TAMBAHAN] CONSOLE LOG DATA STOK RAM <---
          console.log("=== DATA STOK RAM (DARI BE) ===", dataRam);

          setKapasitasRAM({
            total: (dataRam.kuota_kapasitas_kg || 0) / 1000,
            terpakai: (dataRam.total_sisa_stok_tbs || 0) / 1000,
          });
        }

        // 3. Proses Data Siklus Produksi Aktif
        if (resSiklus && resSiklus.ok) {
          const dataSiklus = await resSiklus.json();

          // ---> [TAMBAHAN] CONSOLE LOG DATA SIKLUS PRODUKSI <---
          console.log(
            "=== DATA SIKLUS PRODUKSI AKTIF (DARI BE) ===",
            dataSiklus,
          );

          setSiklusAktif(dataSiklus);
        }
      } catch (error) {
        console.error("Fatal Error fetching dashboard data:", error);
      } finally {
        setIsLoadingAktif(false);
        setIsLoadingRAM(false);
        setIsLoadingSiklus(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleProfileSaved = (dataSaved) => {
    if (dataSaved) {
      window.location.reload();
    }
    setShowPopupDataDiri(false);
  };

  const lockedFieldsConfig = {
    foto: !!profile.foto && profile.foto !== "",
    alamat:
      !!profile.alamat_pabrik &&
      profile.alamat_pabrik !== "" &&
      profile.alamat_pabrik !== "-",
    koordinat:
      !!profile.koordinat &&
      profile.koordinat !== "" &&
      profile.koordinat !== "-",
  };

  const DataRow = ({ label, value }) => (
    <div className="mb-3 sm:mb-4 last:mb-0">
      <p className="text-black/70 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
        {label}
      </p>
      <p className="text-white text-[14px] sm:text-[16px] font-medium leading-snug tracking-wide break-words">
        {value && value !== "" ? value : "—"}
      </p>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-10 min-h-screen font-sans bg-white">
      {/* SECTION 1: DATA DIRI */}
      <div className="bg-gradient-to-r from-[#EF8523] to-[#f19d4e] rounded-2xl p-5 sm:p-8 shadow-lg relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex flex-row items-center justify-between mb-6 sm:mb-8 border-b border-black/10 pb-4 gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
              Data Diri Anda
            </h3>
            <button
              onClick={() => setShowPopupDataDiri(true)}
              className="bg-white/20 backdrop-blur-md text-black/80 border border-white/50 rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold hover:bg-white hover:text-[#EF8523] transition-all duration-300 whitespace-nowrap"
            >
              {isProfileIncomplete(profile)
                ? "Lengkapi Data Diri"
                : "Lihat Profil"}
            </button>
          </div>

          {isLoadingProfile ? (
            <div className="flex flex-col justify-center items-center h-32 text-white space-y-2">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-semibold">
                Memuat Data Profil...
              </span>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              <div className="flex-shrink-0 mx-auto md:mx-0 group">
                <div className="p-1 bg-white/20 rounded-2xl backdrop-blur-sm">
                  {profile.foto ? (
                    <img
                      src={profile.foto}
                      alt="Foto Profil"
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl object-cover shadow-inner bg-white"
                    />
                  ) : (
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl shadow-inner bg-white flex items-center justify-center text-gray-400">
                      <User
                        className="w-12 h-12 sm:w-16 sm:h-16"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 sm:gap-y-2 w-full">
                <div className="space-y-1 sm:space-y-2">
                  <DataRow label="Nama Pabrik" value={profile.nama_pabrik} />
                  <DataRow label="Role" value={profile.role} />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <DataRow label="Email" value={profile.email} />
                  <DataRow
                    label="Nomor Telepon"
                    value={profile.nomor_telepon}
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <DataRow
                    label="Alamat Pabrik"
                    value={profile.alamat_pabrik}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-[#B5302D] mt-6 sm:mt-8 mb-6 sm:mb-10 px-1 border-l-4 border-[#B5302D] pl-3">
        Tampilan Utama Fitur Pabrik
      </h2>

      {/* SECTION 1: WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* ========================================================= */}
        {/* FITUR 1: RIWAYAT PEMERIKSAAN TBS       */}
        {/* ========================================================= */}
        <Card
          title="Periksa TBS Tiba"
          icon={Truck}
          footer={
            <button
              onClick={() => navigate("/pabrik/penerimaanTBS")}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#EF8523] border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm"
            >
              Lihat Semua &rarr;
            </button>
          }
          rightContent={
            <span className="bg-white text-black text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {pengirimanAktif.length} Antrian
            </span>
          }
        >
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex-grow space-y-3 sm:space-y-4 pr-1">
              {isLoadingAktif ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Memuat data...
                </div>
              ) : pengirimanAktif.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 py-10">
                  Tidak ada armada yang menuju pabrik saat ini.
                </div>
              ) : (
                pengirimanAktif.map((log) => {
                  // Logika Warna Badge & Garis Aksen Dinamis
                  const rawProgress = log.progress_db || "menunggu_pengiriman";
                  const pDB = rawProgress.toLowerCase().replace(/\s+/g, "_");
                  let statusLabel = log.progress_publik || "Menunggu";

                  let badgeColor = "bg-gray-100 text-gray-600 border-gray-200";
                  let lineColor = "bg-gray-400";
                  let iconBg = "bg-gray-50";

                  if (pDB === "mengirim") {
                    badgeColor =
                      "bg-orange-50 text-[#EF8523] border-orange-200";
                    lineColor = "bg-[#EF8523]";
                    iconBg = "bg-orange-100/50";
                  } else if (pDB === "menuju_pabrik") {
                    badgeColor = "bg-blue-50 text-blue-600 border-blue-200";
                    lineColor = "bg-blue-500";
                    iconBg = "bg-blue-100/50";
                  } else if (pDB === "terima") {
                    badgeColor = "bg-green-50 text-green-700 border-green-200";
                    lineColor = "bg-green-500";
                    statusLabel = "Validasi";
                    iconBg = "bg-green-100/50";
                  }

                  return (
                    <div
                      key={log.id}
                      className="relative bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all overflow-hidden group"
                    >
                      {/* Garis Aksen Samping Dinamis */}
                      <div
                        className={`absolute top-0 left-0 w-1.5 h-full opacity-80 group-hover:opacity-100 transition-opacity rounded-l-2xl ${lineColor}`}
                      />

                      {/* KEPALA KARTU (Nama Kebun & Resi) */}
                      <div className="flex justify-between items-start gap-2 sm:gap-3 pl-2 sm:pl-3 mb-3">
                        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                          {/* Ikon Visual Armada */}
                          <div
                            className={`p-2 sm:p-2.5 rounded-xl shrink-0 border border-white shadow-sm mt-0.5 ${iconBg}`}
                          >
                            <Truck
                              className={`w-4 h-4 sm:w-5 sm:h-5 ${badgeColor.split(" ")[1]}`}
                            />
                          </div>

                          {/* Info Teks (Dibuat Fleksibel) */}
                          <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-[12px] sm:text-sm text-gray-900 line-clamp-2 leading-tight">
                              {log.nama_gapoktan || "-"}
                            </p>

                            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5">
                              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
                                RESI:
                              </span>
                              <span className="font-mono text-[9px] sm:text-[11px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded break-all sm:truncate">
                                {log.kode_resi || "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Badge Status */}
                        <span
                          className={`px-2 sm:px-2.5 py-1 rounded-lg text-[8px] sm:text-[9px] font-bold uppercase tracking-widest border shadow-sm shrink-0 text-center ${badgeColor}`}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      {/* BADAN KARTU (Detail Supir & Waktu dibungkus kotak abu) */}
                      <div className="ml-2 sm:ml-3 grid grid-cols-2 gap-2 sm:gap-3 bg-gray-50/80 rounded-xl p-2.5 sm:p-3.5 border border-gray-100/60">
                        <div className="min-w-0">
                          <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />{" "}
                            Supir
                          </p>
                          <p className="text-[10px] sm:text-xs font-bold text-gray-700 truncate">
                            {log.kru?.nama_supir || "-"}
                          </p>
                        </div>
                        <div className="text-right min-w-0">
                          <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-end gap-1.5">
                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />{" "}
                            Est. Tiba
                          </p>
                          <p className="text-[10px] sm:text-xs font-extrabold text-[#B5302D] truncate">
                            {log.tanggal_permintaan_sampai || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>

        {/* ========================================================= */}
        {/* FITUR 2: Monitoring Stok RAM (TERHUBUNG API)              */}
        {/* ========================================================= */}
        <Card
          title="Monitoring Stok RAM"
          icon={Database}
          footer={
            <button
              onClick={() => navigate("/pabrik/stokram")}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#EF8523] border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm"
            >
              Lihat Semua &rarr;
            </button>
          }
        >
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex-grow flex flex-col justify-center space-y-4">
              {isLoadingRAM ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Memuat data kapasitas...
                </div>
              ) : (
                <>
                  {/* 1. BAGIAN ATAS: Terbagi 2 (Angka Kiri | Progress Kanan) */}
                  <div className="flex items-center bg-gray-50/50 p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm">
                    {/* KIRI: Teks & Angka Kapasitas */}
                    <div className="flex-1 pr-3 sm:pr-5 border-r border-gray-200">
                      <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Kapasitas Terpakai
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-black text-gray-900 leading-none tracking-tight">
                          {kapasitasRAM.terpakai.toLocaleString("id-ID")}
                        </span>
                        <span className="text-[10px] sm:text-xs font-semibold text-gray-400">
                          / {kapasitasRAM.total.toLocaleString("id-ID")} Ton
                        </span>
                      </div>
                    </div>

                    {/* KANAN: Progress Line & Persentase (Sejajar) */}
                    <div className="flex-1 pl-3 sm:pl-5 flex flex-col justify-center">
                      <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block mb-2">
                        Persentase Terisi
                      </span>

                      {/* Baris Pembungkus Garis & Persentase */}
                      <div className="flex items-center gap-2 sm:gap-3 w-full">
                        {/* Garis Progress Bar */}
                        <div className="flex-1 bg-gray-200 rounded-full h-2 sm:h-2.5 overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-[#EF8523] to-[#B5302D] h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${Math.min(kapasitasRAM.total > 0 ? (kapasitasRAM.terpakai / kapasitasRAM.total) * 100 : 0, 100)}%`,
                            }}
                          ></div>
                        </div>

                        {/* Badge Persentase (Sejajar Garis) */}
                        <span className="shrink-0 bg-red-50 text-[#B5302D] border border-red-100 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shadow-sm">
                          {kapasitasRAM.total > 0
                            ? (
                                (kapasitasRAM.terpakai / kapasitasRAM.total) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. BAGIAN BAWAH: Kotak Sisa Ruang */}
                  <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-100 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-[#B5302D]/70 uppercase tracking-widest mb-1">
                        Sisa Ruang RAM
                      </p>
                      <p className="text-2xl font-black text-[#EF8523] leading-none">
                        {(kapasitasRAM.total - kapasitasRAM.terpakai > 0
                          ? kapasitasRAM.total - kapasitasRAM.terpakai
                          : 0
                        ).toLocaleString("id-ID")}{" "}
                        <span className="text-xs font-semibold">Ton</span>
                      </p>
                    </div>
                    {/* Icon Pemanis di Kanan */}
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-orange-100/50">
                      <Database className="w-5 h-5 text-orange-500" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* ========================================================= */}
        {/* FITUR 3: Produksi Yang Masih Berjalan (TERHUBUNG API)     */}
        {/* ========================================================= */}
        <Card
          title="Produksi Yang Berjalan"
          icon={Factory}
                    footer={
            <button
              onClick={() => navigate("/pabrik/produksi")}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#EF8523] border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm"
            >
              Lihat Semua &rarr;
            </button>
          }
          rightContent={
            <span className="bg-white text-black text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {siklusAktif.length} Siklus
            </span>
          }
        >
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex-grow space-y-3 sm:space-y-4 pr-1">
              {isLoadingSiklus ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Memuat data produksi...
                </div>
              ) : siklusAktif.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 py-10">
                  Tidak ada siklus produksi yang sedang berjalan.
                </div>
              ) : (
                siklusAktif.map((item) => (
                  <div
                    key={item.id}
                    className="relative bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden group"
                  >
                    {/* Garis Aksen Samping (Warna Biru agar beda dengan truk) */}
                    <div className="absolute top-0 left-0 w-1.5 h-full opacity-80 group-hover:opacity-100 transition-opacity bg-blue-500 rounded-l-2xl" />

                    {/* KEPALA KARTU (Siklus & Status) */}
                    <div className="flex justify-between items-start gap-2 sm:gap-3 pl-2 sm:pl-3 mb-3">
                      <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                        {/* Ikon Visual Produksi */}
                        <div className="p-2 sm:p-2.5 rounded-xl shrink-0 border border-white shadow-sm mt-0.5 bg-blue-50">
                          <Factory className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                        </div>

                        {/* Info Teks (Fleksibel) */}
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-[12px] sm:text-sm text-gray-900 line-clamp-2 leading-tight">
                            Siklus Ke-{item.no_siklus_produksi}
                          </p>

                          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5">
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
                              STATUS:
                            </span>
                            <span className="font-semibold text-[9px] sm:text-[10px] text-yellow-700 bg-yellow-50 border border-yellow-200 px-1.5 py-0.5 rounded break-all sm:truncate uppercase">
                              Sedang Diproses
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Badge Tipe */}
                      <span className="px-2 sm:px-2.5 py-1 rounded-lg text-[8px] sm:text-[9px] font-bold uppercase tracking-widest border shadow-sm shrink-0 text-center bg-blue-50 text-blue-600 border-blue-200">
                        PRODUKSI
                      </span>
                    </div>

                    {/* BADAN KARTU (Detail Waktu & TBS dibungkus kotak abu) */}
                    <div className="ml-2 sm:ml-3 grid grid-cols-2 gap-2 sm:gap-3 bg-gray-50/80 rounded-xl p-2.5 sm:p-3.5 border border-gray-100/60">
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />{" "}
                          Waktu Mulai
                        </p>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-700 truncate">
                          {formatWaktu(item.waktu_mulai)}
                        </p>
                      </div>
                      <div className="text-right min-w-0">
                        <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-end gap-1.5">
                          <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />{" "}
                          TBS Diproses
                        </p>
                        <p className="text-[10px] sm:text-xs font-extrabold text-[#B5302D] truncate">
                          {item.jumlah_tbs?.toLocaleString("id-ID")} Kg
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* --- POPUP DATA DIRI --- */}
      {showPopupDataDiri && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="w-full max-w-3xl h-[85vh] rounded-3xl animate-fade-in-up flex relative">
            <DataDiriPabrik
              onClose={() => setShowPopupDataDiri(false)}
              onSave={handleProfileSaved}
              initialData={profile}
              lockedFields={lockedFieldsConfig}
            />
          </div>
        </div>
      )}
    </div>
  );
}
