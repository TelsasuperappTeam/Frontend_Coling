import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, ROLES, getFileUrl } from "../../../config/constants";
import DataDiriTransport from "./DataDiriTransport";
import { Loader2, Inbox, Send, Truck, MapPin, User } from "lucide-react";

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

  // --- LOGIKA PENGUNCIAN FIELD---
  const lockedFieldsConfig = {
    foto: !!profile.foto && profile.foto !== "",
    // KUNCI: Gunakan key 'alamat' (bukan alamat_kebun) karena child component mengecek lockedFields.alamat
    alamat:
      !!profile.alamat_pabrik &&
      profile.alamat_pabrik !== "" &&
      profile.alamat_pabrik !== "-",
  };

  // --- DATA DUMMY FITUR LAIN ---
  const listPermintaan = [
    {
      id: 1,
      kebun: "Kebun Sinar Makmur",
      tglKirim: "15/12/2025",
      tglTiba: "16/12/2025",
    },
    {
      id: 2,
      kebun: "Kebun Sinar Jaya",
      tglKirim: "17/12/2025",
      tglTiba: "18/12/2025",
    },
  ];

  const listAjukan = [
    { id: 1, kebun: "Kebun Mutiara", status: "Menunggu Konfirmasi" },
    { id: 2, kebun: "Kebun Sawit Sejahtera", status: "Diproses" },
    { id: 3, kebun: "Kebun Lestari", status: "Baru" },
  ];

  const armadaStats = {
    totalKendaraan: 25,
    totalKru: 50,
    readyKendaraan: 18,
    readyKru: 35,
  };

  const pantauPengiriman = [
    {
      id: 1,
      kebun: "Kebun Sinar Makmur",
      tujuan: "PKS Utama",
      tglBerangkat: "14/12/2025",
      estimasiTiba: "15/12/2025",
    },
    {
      id: 2,
      kebun: "Kebun Sejahtera",
      tujuan: "PKS Blok B",
      tglBerangkat: "14/12/2025",
      estimasiTiba: "14/12/2025",
    },
  ];

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

              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 sm:gap-y-2 w-full">
                <div className="space-y-1 sm:space-y-2">
                  <DataRow
                    label="Nama Logistik"
                    value={profile.nama_logistik}
                  />
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
        Dashboard Utama Fitur Transport
      </h2>

      {/* SECTION 2 WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* FITUR 1 Permintaan Jasa Logistik */}
        <Card
          title="Permintaan Jasa Logistik"
          icon={Inbox}
          rightContent={
            <span className="bg-white text-[#B5302D] text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {listPermintaan.length} Permintaan
            </span>
          }
        >
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex-grow space-y-3">
              {listPermintaan.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-300"
                >
                  <p className="font-bold text-[#B5302D] text-sm">
                    {item.kebun}
                  </p>
                  <p className="text-[11px] text-gray-600 mt-1">
                    Tgl Pengiriman: {item.tglKirim}
                  </p>
                  <p className="text-[11px] text-gray-600">
                    Tgl Permintaan Tiba: {item.tglTiba}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/logistik/manajemenpesanan")}
              className="mt-2 text-right text-xs font-bold text-[#B5302D] hover:underline"
            >
              Lihat semua &rarr;
            </button>
          </div>
        </Card>

        {/* FITUR 2 Ajukan Jasa Logistik */}
        <Card
          title="Ajukan Jasa Logistik Ke Kebun"
          icon={Send}
          rightContent={
            <span className="bg-white text-[#B5302D] text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {listAjukan.length} Pengajuan
            </span>
          }
        >
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex-grow space-y-3">
              {listAjukan.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-300"
                >
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {item.kebun}
                    </p>
                    <p className="text-[10px] text-gray-500 italic">
                      {item.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/logistik/manajemenpesanan")}
              className="mt-2 text-right text-xs font-bold text-[#B5302D] hover:underline"
            >
              Lihat semua &rarr;
            </button>
          </div>
        </Card>

        {/* FITUR 3 Armada (Style Statistik) */}
        <Card title="Armada Logistik" icon={Truck}>
          <div className="space-y-5 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-300 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Total Kendaraan
                </p>
                <div className="bg-yellow-100 border border-yellow-400 py-1 rounded-lg font-bold text-xl">
                  {armadaStats.totalKendaraan}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-300 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Total Kru
                </p>
                <div className="bg-yellow-100 border border-yellow-400 py-1 rounded-lg font-bold text-xl">
                  {armadaStats.totalKru}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                <p className="text-[10px] font-bold text-green-600 uppercase mb-1">
                  Kendaraan Ready
                </p>
                <div className="bg-yellow-100 border border-yellow-400 py-1 rounded-lg font-bold text-xl">
                  {armadaStats.readyKendaraan}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                <p className="text-[10px] font-bold text-green-600 uppercase mb-1">
                  Kru Ready
                </p>
                <div className="bg-yellow-100 border border-yellow-400 py-1 rounded-lg font-bold text-xl">
                  {armadaStats.readyKru}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* FITUR 4 Pantau Pengiriman */}
        <Card title="Pantau Pengiriman" icon={MapPin}>
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex-grow space-y-3">
              {pantauPengiriman.map((log) => (
                <div
                  key={log.id}
                  className="relative bg-gray-50 rounded-xl p-3 border border-gray-300 shadow-sm"
                >
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-blue-50 text-blue-600 border border-blue-100">
                      Aktif
                    </span>
                  </div>
                  <p className="font-bold text-sm text-gray-800">{log.kebun}</p>
                  <p className="text-[11px] text-gray-600 mt-1">
                    Tujuan: {log.tujuan}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 border-t border-gray-200 pt-2">
                    <p className="text-[10px] text-gray-500">
                      Berangkat: {log.tglBerangkat}
                    </p>
                    <p className="text-[10px] text-gray-500 text-right">
                      Estimasi: {log.estimasiTiba}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/logistik/pengiriman")}
              className="mt-2 text-right text-xs font-bold text-[#B5302D] hover:underline"
            >
              Lihat semua &rarr;
            </button>
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
