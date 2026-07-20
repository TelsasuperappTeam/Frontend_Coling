import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, ROLES, getFileUrl } from "../../../config/constants";
import DataDiriTransport from "./DataDiriTransport";
import {
  Loader2,
  Inbox,
  Send,
  Truck,
  MapPin,
  User,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
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

export default function DashboardLogistik() {
  const navigate = useNavigate();
  const [showPopupDataDiri, setShowPopupDataDiri] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // --- STATE PERMINTAAN MASUK ---
  const [permintaanMasuk, setPermintaanMasuk] = useState([]);
  const [isLoadingPermintaan, setIsLoadingPermintaan] = useState(true);

  // --- STATE PANTAU PENGIRIMAN ---
  const [pengirimanAktif, setPengirimanAktif] = useState([]);
  const [isLoadingPengiriman, setIsLoadingPengiriman] = useState(true);

  // --- STATE ARMADA LOGISTIK ---
  const [isLoadingArmada, setIsLoadingArmada] = useState(true);
  const [armadaStats, setArmadaStats] = useState({
    totalKendaraan: 0,
    readyKendaraan: 0,
    totalKru: 0,
    readyKru: 0,
  });

  // --- STATE PROFILE  ---
  const [profile, setProfile] = useState({
    nama_logistik: "",
    role: ROLES.TRANSPORT,
    email: "",
    nomor_telepon: "",
    alamat_pabrik: "",
    foto: "",
    koordinat: "",
  });

  // --- FETCH DATA USER (API) ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");
        if (!token) {
          console.error("Token tidak ditemukan");
          return;
        }

        const response = await fetch(API_ENDPOINTS.USER.ME, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data profil");
        }

        const userData = await response.json();
        console.log("Data Profil Logistik:", userData);
        //const generatedUrl = getFileUrl(userData.foto_profil_url);
        //console.log("URL FOTO FINAL:", generatedUrl);

        // Mapping Data Backend ke State Frontend
        setProfile({
          nama_logistik: userData.nama_lengkap || "-",
          role: "Logistik",
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

  // --- FETCH SEMUA DATA DASHBOARD SECARA PARALEL & EFISIEN ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Nyalakan semua loading
      setIsLoadingPermintaan(true);
      setIsLoadingPengiriman(true);
      setIsLoadingArmada(true);

      try {
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");
        if (!token) return;

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        // 1. Tembak semua API secara serentak (Paralel)
        // Menggunakan .catch(() => null) agar jika salah satu error, yang lain tetap jalan
        const [resManagement, resKendaraan, resKru] = await Promise.all([
          fetch(API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.GET_LIST, {
            headers,
          }).catch(() => null),
          fetch(API_ENDPOINTS.TRACEABILITY.LOGISTIK.KENDARAAN.GET_ALL, {
            headers,
          }).catch(() => null),
          fetch(API_ENDPOINTS.TRACEABILITY.LOGISTIK.KRU.GET_ALL, {
            headers,
          }).catch(() => null),
        ]);

        // 2. PROSES DATA PESANAN & PENGIRIMAN (1x Panggil API untuk 2 Card)
        if (resManagement && resManagement.ok) {
          const mgmtData = await resManagement.json();
          const dataArray = Array.isArray(mgmtData)
            ? mgmtData
            : mgmtData.data || [];

          // PISAHKAN UNTUK CARD 1: Permintaan Masuk
          // Syarat: HANYA Menunggu Konfirmasi DAN tanggal belum lewat
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Normalisasi ke jam 00:00:00

          const pendingRequests = dataArray
            .filter((item) => {
              // 1. Standarisasi status
              const statusP = String(item.status_permintaan || "")
                .trim()
                .toLowerCase();
              const isPending =
                statusP === "menunggu konfirmasi" ||
                statusP === "menunggu_konfirmasi";

              // Jika status bukan pending, langsung tolak
              if (!isPending) return false;

              // 2. Filter Tanggal Kadaluwarsa
              // Jika data dari BE tidak menyertakan tanggal, biarkan lolos
              if (!item.tanggal_permintaan_sampai) return true;

              const targetDate = new Date(item.tanggal_permintaan_sampai);
              targetDate.setHours(0, 0, 0, 0);

              // Lolos hanya jika targetDate sama dengan atau setelah hari ini
              return targetDate >= today;
            })
            .sort((a, b) => b.id - a.id); // Urutkan ID terbaru di atas

          setPermintaanMasuk(pendingRequests);

          // PISAHKAN UNTUK CARD 2: Pantau Pengiriman Aktif
          // Mengikuti logika Pengiriman.jsx: Tampilkan SEMUA yang statusnya "diterima"
          // tanpa memandang progress perjalanannya (progress_db).
          const activeDeliveries = dataArray
            .filter((item) => {
              const statusP = String(item.status_permintaan || "")
                .trim()
                .toLowerCase();
              return statusP === "diterima";
            })
            .sort((a, b) => b.id - a.id); // Urutkan ID terbaru di atas

          setPengirimanAktif(activeDeliveries);
        }

        // Matikan loading pesanan & pengiriman
        setIsLoadingPermintaan(false);
        setIsLoadingPengiriman(false);

        // 3. PROSES DATA ARMADA
        let kendaraan = [];
        let kru = [];

        if (resKendaraan && resKendaraan.ok) {
          const data = await resKendaraan.json();
          kendaraan = Array.isArray(data) ? data : [];
        }

        if (resKru && resKru.ok) {
          const data = await resKru.json();
          kru = Array.isArray(data) ? data : [];
        }

        setArmadaStats({
          totalKendaraan: kendaraan.length,
          readyKendaraan: kendaraan.filter(
            (v) => v.status_kendaraan?.toUpperCase() === "TERSEDIA",
          ).length,
          totalKru: kru.length,
          readyKru: kru.filter((k) => k.status?.toUpperCase() === "TERSEDIA")
            .length,
        });

        // Matikan loading armada
        setIsLoadingArmada(false);
      } catch (error) {
        console.error("Fatal Error memuat Dashboard:", error);
        // Pastikan loading mati jika terjadi error parah (misal internet putus)
        setIsLoadingPermintaan(false);
        setIsLoadingPengiriman(false);
        setIsLoadingArmada(false);
      }
    };

    fetchDashboardData();
  }, []);

  // =========================================================
  // 1. LOGIKA PENGUNCIAN KOLOM (LOCKED FIELDS) UNTUK TRANSPORT
  // =========================================================
  const lockedFieldsConfig = {
    foto: !!profile.foto && profile.foto !== "",
    alamat:
      !!profile.alamat_pabrik &&
      profile.alamat_pabrik !== "" &&
      profile.alamat_pabrik !== "-",
    nama_logistik: !!profile.nama_logistik && profile.nama_logistik !== "-",
    nomor_telepon: !!profile.nomor_telepon && profile.nomor_telepon !== "-",
  };

  // =========================================================
  // 2. HANDLER SIMPAN PROFIL
  // =========================================================
  const handleProfileSaved = (dataSaved) => {
    if (dataSaved) {
      window.location.reload();
    }
    setShowPopupDataDiri(false);
  };

  // =========================================================
  // 3. LOGIKA PENGECEKAN PROFIL BELUM LENGKAP (TOMBOL BERDENYUT)
  // =========================================================
  const isProfileIncomplete = (prof) => {
    if (!prof) return true;
    // Tombol akan berdenyut jika nama, nomor telepon, alamat, atau foto masih kosong/"-"
    return (
      !prof.nama_logistik ||
      prof.nama_logistik === "-" ||
      !prof.nomor_telepon ||
      prof.nomor_telepon === "-" ||
      !prof.alamat_pabrik ||
      prof.alamat_pabrik === "" ||
      !prof.foto ||
      prof.foto === ""
    );
  };

  // =========================================================
  // 4. KOMPONEN BARIS DATA
  // =========================================================
  const DataRow = ({ label, value }) => (
    <div className="mb-3 sm:mb-4 last:mb-0">
      <p className="text-black/70 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
        {label}
      </p>
      <p className="text-white text-[14px] sm:text-[16px] font-medium leading-snug tracking-wide break-words">
        {value && value !== "" && value !== "-" ? value : "—"}
      </p>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-8 min-h-screen font-sans">
      <div className="bg-gradient-to-r from-[#EF8523] to-[#f19d4e] rounded-2xl p-5 sm:p-8 shadow-lg relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex flex-row items-center justify-between mb-6 sm:mb-8 border-b border-black/10 pb-4 gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
              Data Diri Anda
            </h3>

            <button
              onClick={() => setShowPopupDataDiri(true)}
              className={`rounded-full px-4 sm:px-5 py-1.5 sm:py-2 transition-all duration-300 flex items-center justify-center gap-1.5 ${
                isProfileIncomplete(profile)
                  ? "bg-orange-50 text-black border border-orange-200 shadow-sm animate-pulse hover:bg-orange-100"
                  : "bg-gray-50 text-black border border-gray-200/80 shadow-sm hover:bg-gray-100 hover:text-[#EF8523]"
              }`}
            >
              {isProfileIncomplete(profile) ? (
                <>
                  {/* Titik Notifikasi Berdenyut (Ping Badge) tetap warna Oranye */}
                  <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF8523] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-[#EF8523]"></span>
                  </span>

                  {/* Teks Ekstra Tegas (Warna Hitam) */}
                  <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider leading-[1.2] text-left sm:text-center">
                    Lengkapi
                    <br className="block sm:hidden" /> Data Diri
                  </span>

                  {/* Panah Pancingan Aksi */}
                  <svg
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </>
              ) : (
                <span className="text-[9px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                  Lihat Profil
                </span>
              )}
            </button>
          </div>

          {isLoadingProfile ? (
            <div className="flex flex-col justify-center items-center h-32 text-white space-y-2">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-semibold">Memuat Profil...</span>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              {/* --- BAGIAN FOTO PROFIL (LOGIKA ICON) --- */}
              <div className="flex-shrink-0 mx-auto md:mx-0 group">
                <div className="p-1 bg-white/20 rounded-2xl backdrop-blur-sm">
                  {profile.foto ? (
                    /* Jika ada foto, tampilkan IMG */
                    <img
                      src={profile.foto}
                      alt="Foto Profil"
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl object-cover shadow-inner bg-white"
                    />
                  ) : (
                    /* Jika tidak ada foto, tampilkan ICON */
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl shadow-inner bg-white flex items-center justify-center text-gray-400">
                      <User
                        className="w-12 h-12 sm:w-16 sm:h-16"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* --- AKHIR BAGIAN FOTO --- */}

              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-y-1 sm:gap-y-2 w-full">
                <div className="space-y-1 sm:space-y-2">
                  <DataRow
                    label="Nama Logistik"
                    value={profile.nama_logistik}
                  />
                  <DataRow label="Role" value={profile.role} />
                  <DataRow
                    label="Nomor Telepon"
                    value={profile.nomor_telepon}
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <DataRow label="Email" value={profile.email} />
                  <DataRow
                    label="Alamat Logistik"
                    value={profile.alamat_pabrik}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-[#B5302D] mt-6 sm:mt-8 mb-6 sm:mb-10 px-1 border-l-4 border-[#B5302D] pl-3">
        Tampilan Utama Fitur Logistik
      </h2>

      {/* SECTION 2 WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* FITUR 1 Permintaan Jasa Logistik */}
        <Card
          title="Permintaan Jasa Logistik"
          icon={Inbox}
          footer={
            <button
              onClick={() => navigate("/logistik/manajemenpesanan")}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#EF8523] border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm"
            >
              Lihat Semua &rarr;
            </button>
          }
          rightContent={
            <span className="bg-white text-black text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {permintaanMasuk.length} Permintaan
            </span>
          }
        >
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex-grow space-y-3">
              {isLoadingPermintaan ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Memuat data...
                </div>
              ) : permintaanMasuk.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  Tidak ada permintaan baru
                </div>
              ) : (
                [...permintaanMasuk]
                  .sort(
                    (a, b) =>
                      new Date(a.tanggal_rencana_panen) -
                      new Date(b.tanggal_rencana_panen),
                  )
                  .slice(0, 5)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="group relative bg-white p-3.5 sm:p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#EF8523]/40 transition-all duration-300 flex items-start gap-3 sm:gap-4 overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B5302D] opacity-80 group-hover:bg-[#EF8523] transition-colors" />

                      <div className="bg-red-50 p-2 sm:p-2.5 rounded-lg flex-shrink-0 mt-0.5 group-hover:bg-orange-50 transition-colors">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#B5302D] group-hover:text-[#EF8523] transition-colors" />
                      </div>

                      {/* Konten Data */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-[13px] sm:text-sm truncate">
                          {item.nama_gapoktan || "-"}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mt-2">
                          {/* Tgl Panen */}
                          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-500">
                            <Calendar className="w-3 h-3 opacity-70" />
                            <span>
                              Panen:{" "}
                              <span className="font-semibold text-gray-700">
                                {item.tanggal_rencana_panen || "-"}
                              </span>
                            </span>
                          </div>

                          {/* Target Tiba */}
                          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-[#B5302D] bg-red-50/80 px-2 py-0.5 rounded-md w-fit border border-red-100">
                            <Clock className="w-3 h-3" />
                            <span>
                              Tiba: {item.tanggal_permintaan_sampai || "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </Card>

        {/* FITUR 2 Pantau Pengiriman */}
        <Card
          title="Pantau Pengiriman"
          icon={MapPin}
          footer={
            <button
              onClick={() => navigate("/logistik/pengiriman")}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#EF8523] border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm"
            >
              Lihat Semua &rarr;
            </button>
          }
          rightContent={
            <span className="bg-white text-black text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {pengirimanAktif.length} Aktif
            </span>
          }
        >
          <div className="space-y-3 h-full flex flex-col relative">
            <div className="flex-grow space-y-3 pb-8">
              {isLoadingPengiriman ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Memuat data...
                </div>
              ) : pengirimanAktif.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Truck className="w-8 h-8 mb-2 opacity-50 text-gray-400" />
                  <span className="text-[11px] font-medium">
                    Tidak ada armada di perjalanan
                  </span>
                </div>
              ) : (
                pengirimanAktif.slice(0, 5).map((log) => {
                  // Dinamika Badge berdasarkan progress_db
                  const rawProgress = log.progress_db || "menunggu_pengiriman";
                  const pDB = rawProgress.toLowerCase().replace(/\s+/g, "_");
                  let statusLabel = log.progress_publik || "Menunggu Penugasan";

                  // Styling Badge yang lebih cerah dan tegas
                  let badgeColor = "bg-gray-100 text-gray-600 border-gray-200";
                  let IconStatus = Clock;

                  if (pDB === "mengirim") {
                    badgeColor =
                      "bg-orange-50 text-[#EF8523] border-orange-200";
                    IconStatus = Truck;
                  }
                  if (pDB === "menuju_pabrik") {
                    badgeColor = "bg-blue-50 text-blue-600 border-blue-200";
                    IconStatus = Send;
                  }

                  return (
                    <div
                      key={log.id}
                      className="group relative bg-white rounded-[16px] p-3 sm:p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 flex flex-col gap-2 overflow-hidden"
                    >
                      {/* Efek Garis Samping Saat Hover */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#EF8523] to-[#B5302D] opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Header Item: Badge Status & Resi */}
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-mono font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                          {log.kode_resi || `REQ-${log.id}`}
                        </span>
                        <div
                          className={`px-2 py-0.5 rounded-md text-[9px] font-bold border flex items-center gap-1 shadow-sm ${badgeColor}`}
                        >
                          <IconStatus className="w-3 h-3" />
                          <span>{statusLabel}</span>
                        </div>
                      </div>

                      {/* Info Rute Cepat */}
                      <div>
                        <h4 className="font-bold text-[13px] text-gray-800 line-clamp-1 group-hover:text-[#B5302D] transition-colors">
                          {log.nama_gapoktan || "Data Kebun Tidak Tersedia"}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <p className="text-[10px] text-gray-500 line-clamp-1">
                            Ke:{" "}
                            <span className="font-medium text-gray-700">
                              {log.alamat_pengiriman_pabrik || "-"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Info Tanggal Ringkas (Bawah) */}
                      <div className="mt-2 bg-gray-50/80 rounded-lg p-2 flex justify-between items-center border border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase font-bold text-gray-400 tracking-wider">
                            Tgl Berangkat
                          </span>
                          <span className="text-[10px] font-semibold text-gray-800 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 opacity-70" />{" "}
                            {log.tanggal_keberangkatan || "-"}
                          </span>
                        </div>
                        <div className="h-4 w-px bg-gray-200 mx-2"></div>
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] uppercase font-bold text-[#B5302D] tracking-wider">
                            Target Tiba
                          </span>
                          <span className="text-[10px] font-bold text-[#B5302D] flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />{" "}
                            {log.tanggal_permintaan_sampai || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>

        {/* FITUR 3 Armada Logistik */}
        <Card
          title="Armada Logistik"
          icon={Truck}
          footer={
            <button
              onClick={() => navigate("/logistik/armada")}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#EF8523] border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm"
            >
              Lihat Semua &rarr;
            </button>
          }
        >
          <div className="space-y-3 h-full flex flex-col justify-between relative">
            <div className="flex-grow flex flex-col gap-3">
              {isLoadingArmada ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Memuat data...
                </div>
              ) : (
                <div className="flex flex-col gap-3 mt-1 pb-4">
                  {/* --- ROW 1: KENDARAAN --- */}
                  <div className="bg-gradient-to-br from-red-50 to-white p-3.5 sm:p-4 rounded-xl border border-red-100 flex items-center justify-between hover:shadow-md hover:border-red-200 transition-all group">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="bg-white p-2 sm:p-2.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform text-[#B5302D]">
                        <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          Kendaraan
                        </p>
                        <p className="text-xl sm:text-2xl font-black text-gray-800 leading-none mt-1">
                          {armadaStats.totalKendaraan}{" "}
                          <span className="text-[10px] font-semibold text-gray-400 lowercase">
                            Total unit
                          </span>
                        </p>
                      </div>
                    </div>
                    {/* Badge Ready */}
                    <div className="bg-green-100 text-green-700 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold border border-green-200 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
                      {armadaStats.readyKendaraan} Ready
                    </div>
                  </div>

                  {/* --- ROW 2: KRU / DRIVER --- */}
                  <div className="bg-gradient-to-br from-orange-50 to-white p-3.5 sm:p-4 rounded-xl border border-orange-100 flex items-center justify-between hover:shadow-md hover:border-orange-200 transition-all group">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="bg-white p-2 sm:p-2.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform text-[#EF8523]">
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          Kru / Driver
                        </p>
                        <p className="text-xl sm:text-2xl font-black text-gray-800 leading-none mt-1">
                          {armadaStats.totalKru}{" "}
                          <span className="text-[10px] font-semibold text-gray-400 lowercase">
                            Total personil
                          </span>
                        </p>
                      </div>
                    </div>
                    {/* Badge Ready */}
                    <div className="bg-green-100 text-green-700 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold border border-green-200 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
                      {armadaStats.readyKru} Ready
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* --- POPUP DATA DIRI --- */}
      {showPopupDataDiri && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="w-full max-w-2xl h-auto max-h-[90vh] rounded-3xl animate-fade-in-up flex relative shadow-2xl">
            <DataDiriTransport
              onClose={() => setShowPopupDataDiri(false)}
              onSave={handleProfileSaved}
              initialData={{
                ...profile,
                alamat_kebun: profile.alamat_pabrik,
              }}
              lockedFields={lockedFieldsConfig}
            />
          </div>
        </div>
      )}
    </div>
  );
}
