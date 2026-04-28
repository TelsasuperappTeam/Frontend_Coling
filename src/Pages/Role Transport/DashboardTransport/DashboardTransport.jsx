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
} from "lucide-react";

// --- Komponen Card Reusable ---
const Card = ({ title, icon: Icon, children, rightContent }) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col h-full overflow-hidden">
    {/* Header Card: Background Orange, Judul Putih + Icon Wrapped */}
    <div className="bg-[#EF8523] px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Render Icon jika ada dengan wrapper transparan (white/20) */}
        {Icon && (
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm shadow-sm flex items-center justify-center">
            <Icon className="text-white w-5 h-5" />
          </div>
        )}
        <h3 className="text-[14px] sm:text-[16px] font-bold text-white tracking-wide">
          {title}
        </h3>
      </div>

      {rightContent && (
        <div className="scale-90 sm:scale-100 origin-right">{rightContent}</div>
      )}
    </div>

    <div className="p-4 sm:p-5 text-gray-800 bg-white h-64 sm:h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
      {children}
    </div>
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
          role: "Transport",
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

          // Pisahkan untuk Card Permintaan Masuk (Menunggu Konfirmasi)
          const pending = dataArray.filter(
            (item) =>
              item.status_permintaan?.toLowerCase() === "menunggu konfirmasi",
          );
          setPermintaanMasuk(pending);

          // Pisahkan untuk Card Pengiriman Aktif (Diterima)
          const filteredPengiriman = dataArray.filter(
            (item) => item.status_permintaan?.toLowerCase() === "diterima",
          );
          setPengirimanAktif(filteredPengiriman);
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

  // --- LOGIKA PENGUNCIAN FIELD---
  const lockedFieldsConfig = {
    foto: !!profile.foto && profile.foto !== "",
    // KUNCI: Gunakan key 'alamat' (bukan alamat_kebun) karena child component mengecek lockedFields.alamat
    alamat:
      !!profile.alamat_pabrik &&
      profile.alamat_pabrik !== "" &&
      profile.alamat_pabrik !== "-",
  };

  const handleProfileSaved = (dataSaved) => {
    if (dataSaved) {
      window.location.reload();
    }
    setShowPopupDataDiri(false);
  };

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
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-10 min-h-screen font-sans bg-white">
      {/* SECTION 1: DATA DIRI  */}
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
              Lengkapi Data Diri
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
        Tampilan Utama Fitur Transport
      </h2>

      {/* SECTION 2 WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* FITUR 1 Permintaan Jasa Logistik */}
        <Card
          title="Permintaan Jasa Logistik"
          icon={Inbox}
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

            <div className="sticky -bottom-4 sm:-bottom-5 bg-white pt-3 pb-4 mt-2 z-10 border-t border-gray-50 text-right">
              <button
                onClick={() => navigate("/logistik/manajemenpesanan")}
                className="text-xs font-bold text-[#B5302D] hover:text-black hover:underline transition-all inline-block"
              >
                Lihat semua &rarr;
              </button>
            </div>
          </div>
        </Card>

        {/* FITUR 2 Pantau Pengiriman */}
        <Card
          title="Pantau Pengiriman"
          icon={MapPin}
          rightContent={
            <span className="bg-white text-black text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {pengirimanAktif.length} Pengiriman
            </span>
          }
        >
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex-grow space-y-3">
              {isLoadingPengiriman ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Memuat data...
                </div>
              ) : pengirimanAktif.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  Tidak ada pengiriman aktif
                </div>
              ) : (
                pengirimanAktif.slice(0, 5).map((log) => {
                  // Dinamika Badge berdasarkan progress_db
                  const rawProgress = log.progress_db || "menunggu_pengiriman";
                  const pDB = rawProgress.toLowerCase().replace(/\s+/g, "_");
                  let statusLabel = log.progress_publik || "Menunggu";

                  let badgeColor = "bg-gray-50 text-gray-600 border-gray-200"; // menunggu_pengiriman
                  if (pDB === "mengirim")
                    badgeColor =
                      "bg-orange-50 text-[#EF8523] border-orange-100";
                  if (pDB === "menuju_pabrik")
                    badgeColor = "bg-blue-50 text-blue-600 border-blue-100";

                  return (
                    <div
                      key={log.id}
                      className="relative bg-gray-50 rounded-xl p-3 border border-gray-300 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${badgeColor}`}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      {/* Asal dan Tujuan */}
                      <p className="font-bold text-sm text-gray-800 pr-20 truncate">
                        {log.nama_gapoktan || "-"}
                      </p>
                      <p className="text-[11px] text-gray-600 mt-1 truncate">
                        Tujuan: {log.alamat_pengiriman_pabrik || "-"}
                      </p>

                      {/* Tanggal */}
                      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-gray-200 pt-2">
                        <p className="text-[10px] text-gray-500">
                          Berangkat:{" "}
                          <span className="font-semibold text-gray-700">
                            {log.tanggal_keberangkatan || "-"}
                          </span>
                        </p>
                        <p className="text-[10px] text-gray-500 text-right">
                          Estimasi:{" "}
                          <span className="font-semibold text-[#B5302D]">
                            {log.tanggal_permintaan_sampai || "-"}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Tombol Lihat Semua yang dirapikan (Sticky & Background Putih) */}
            <div className="sticky -bottom-4 sm:-bottom-5 bg-white pt-3 pb-4 mt-2 z-10 border-t border-gray-50 text-right">
              <button
                onClick={() => navigate("/logistik/pengiriman")}
                className="text-xs font-bold text-[#B5302D] hover:text-black hover:underline transition-all inline-block"
              >
                Lihat semua &rarr;
              </button>
            </div>
          </div>
        </Card>

        {/* FITUR 3 Armada Logistik */}
        <Card title="Armada Logistik" icon={Truck}>
          <div className="space-y-3 h-full flex flex-col justify-between">
            {isLoadingArmada ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <p className="text-[10px]">Memuat data...</p>
              </div>
            ) : (
              <div className="flex-grow flex flex-col gap-3 mt-1">
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

            {/* --- TOMBOL MANAJEMEN (DIRAPIHKAN & SERAGAM) --- */}
            <div className="sticky -bottom-4 sm:-bottom-5 bg-white pt-3 pb-4 mt-2 z-10 border-t border-gray-50 text-right">
              <button
                onClick={() => navigate("/logistik/armada")}
                className="text-xs font-bold text-[#B5302D] hover:text-black hover:underline transition-all inline-block"
              >
                Lihat Semua &rarr;
              </button>
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
