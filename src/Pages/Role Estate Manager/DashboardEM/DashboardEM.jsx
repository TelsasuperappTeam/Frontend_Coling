import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, ROLES, getFileUrl } from "../../../config/constants.js";
import DataDiriEM from "./DataDiriEM";
import {
  Loader2,
  Check,
  X,
  User,
  MapPin,
  Phone,
  FileText,
  Truck,
  Calendar,
  Coins,
} from "lucide-react";

/**
 * --- Komponen Card Reusable ---
 * Menggunakan styling yang lebih modern dengan rounded corners yang lebih besar,
 * shadow yang lebih soft, dan header yang lebih clean.
 */
const Card = ({ title, children, rightContent, footer, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col h-full overflow-hidden">
    {/* Header Lebih Compact (Versi Petani) */}
    <div className="bg-[#EF8523] px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center flex-shrink-0">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm shadow-sm flex items-center justify-center">
            <Icon className="text-white w-5 h-5" />
          </div>
        )}
        <h3 className="font-bold text-white text-base sm:text-lg tracking-wide">
          {title}
        </h3>
      </div>
      {rightContent && <div>{rightContent}</div>}
    </div>

    {/* Body dengan Padding Lebih Kecil agar Grafik Lega */}
    <div className="p-4 sm:p-5 flex-grow flex flex-col relative">
      {children}
    </div>

    {/* Footer Opsional */}
    {footer && (
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
        {footer}
      </div>
    )}
  </div>
);

// Helper untuk mengecek kelengkapan profil
const isProfileIncomplete = (p) => {
  return (
    !p.nama_kebun ||
    !p.nomor_telepon ||
    !p.email ||
    !p.foto ||
    !p.alamat_kebun ||
    !p.koordinat
  );
};

export default function DashboardEM() {
  const navigate = useNavigate();
  // --- STATE UI & LOADING ---
  const [showPopupDataDiri, setShowPopupDataDiri] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidasiLoading, setIsValidasiLoading] = useState(false);

  // --- STATE DATA ---
  const [profile, setProfile] = useState({
    nama_kebun: "",
    role: "Estate Manager",
    email: "",
    nomor_telepon: "",
    alamat_kebun: "",
    foto: "",
    koordinat: "",
    kebun_id: "",
  });

  // Data dinamis dari API
  const [pendingPetani, setPendingPetani] = useState([]);

  // --- DATA VALIDASI (DINAMIS & STATIC) ---
  // Rencana Tanam & Panen diubah menjadi array kosong untuk diisi API
  // Dokumen ISPO tetap static sesuai instruksi
  const [validasiData, setValidasiData] = useState({
    rencanaTanam: [],
    rencanaPanen: [],
    dokumenISPO: [
      { id: 1, nama: "Joko Anwar" },
      { id: 2, nama: "Rina Nose" },
    ],
  });

  // --- MOCK DATA LAINNYA (Tetap sama sesuai request) ---
  const [progresPenjualan] = useState([
    {
      id: 1,
      pabrik: "PT. Agro Lestari Pabrik",
      tanggal: "20 Okt 2023",
      status: "Diterima",
    },
    {
      id: 2,
      pabrik: "PT. Sawit Makmur",
      tanggal: "21 Okt 2023",
      status: "Ditolak",
    },
  ]);

  const [pengirimanTBS] = useState([
    {
      id: 1,
      pabrik: "PT. Agro Lestari Pabrik",
      steps: ["Proses", "Penjemputan", "Pengiriman"],
    },
    {
      id: 2,
      pabrik: "PT. Sawit Makmur",
      steps: ["Proses", "Penjemputan", "Pengiriman"],
    },
  ]);

  // --- HELPER AUTH ---
  const getToken = () =>
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  /**
   * --- FETCH USER PROFILE ---
   */
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const token = getToken();
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
          nama_kebun: userData.nama_lengkap || "-",
          role: "Estate Manager",
          email: userData.email || "-",
          nomor_telepon: userData.no_hp || "-",
          alamat_kebun: userData.alamat || "",
          foto: getFileUrl(userData.foto_profil_url) || "",
          kebun_id: userData.kebun_id || "-",
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

  /**
   * --- FETCH PENDING PETANI ---
   */
  const fetchPendingPetani = useCallback(async () => {
    setIsLoadingPending(true);
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(API_ENDPOINTS.USER.KEBUN.PENDING_PETANI, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok)
        throw new Error("Gagal mengambil data permintaan petani");

      const data = await response.json();
      setPendingPetani(data);
    } catch (error) {
      console.error("Error fetching pending petani:", error);
    } finally {
      setIsLoadingPending(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingPetani();
  }, [fetchPendingPetani]);

  /**
   * --- FETCH VALIDASI ITEMS (RENCANA TANAM & PANEN) ---
   * Mengambil data dinamis untuk widget validasi dari endpoint backend.
   * (SESUAI BE MAHAR)
   */
  const fetchValidasiRequests = useCallback(async () => {
    setIsValidasiLoading(true);
    try {
      const token = getToken();
      if (!token) return;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // 1. Fetch Pending Rencana Panen (SESUAI BE MAHAR)
      const resPanen = await fetch(
        API_ENDPOINTS.FARM.KEBUN.APPROVAL.GET_RENCANA_PANEN_PENDING,
        { headers },
      );
      const dataPanen = resPanen.ok ? await resPanen.json() : [];

      // 2. Fetch Pending Rencana Tanam / Blok (SESUAI BE MAHAR)
      const resTanam = await fetch(
        API_ENDPOINTS.FARM.KEBUN.APPROVAL.GET_PENDING_BLOK,
        { headers },
      );
      const dataTanam = resTanam.ok ? await resTanam.json() : [];

      // Update state validasiData, merge dengan dokumenISPO static
      setValidasiData((prev) => ({
        ...prev,
        rencanaPanen: Array.isArray(dataPanen) ? dataPanen : [],
        rencanaTanam: Array.isArray(dataTanam) ? dataTanam : [],
      }));
    } catch (error) {
      console.error("Error fetching validasi data:", error);
    } finally {
      setIsValidasiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchValidasiRequests();
  }, [fetchValidasiRequests]);

  /**
   * --- HANDLE MANAGE PETANI ---
   */
  const handleManagePetani = async (petaniId, actionType) => {
    if (isProcessing) return;
    const confirmMsg =
      actionType === "approve"
        ? "Terima permintaan petani ini?"
        : "Tolak permintaan petani ini?";

    if (!window.confirm(confirmMsg)) return;

    setIsProcessing(true);
    try {
      const token = getToken();
      const response = await fetch(
        API_ENDPOINTS.USER.KEBUN.MANAGE_PETANI(petaniId),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: actionType }),
        },
      );

      if (!response.ok) throw new Error(`Gagal ${actionType} petani`);

      await fetchPendingPetani();
      alert(
        `Berhasil ${actionType === "approve" ? "menerima" : "menolak"} petani.`,
      );
    } catch (error) {
      console.error("Error manage petani:", error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProfileSaved = (dataSaved) => {
    if (dataSaved) {
      window.location.reload();
    }
    setShowPopupDataDiri(false);
  };

  const lockedFieldsConfig = {
    foto: !!profile.foto && profile.foto !== "",
    alamat:
      !!profile.alamat_kebun &&
      profile.alamat_kebun !== "" &&
      profile.alamat_kebun !== "-",
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
        {value && value !== "" && value !== "-" ? value : "—"}
      </p>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-10 min-h-screen font-sans bg-white">
      {/* =========================================
          SECTION 1: DATA DIRI
         ========================================= */}
      <div className="bg-gradient-to-r from-[#EF8523] to-[#f19d4e] rounded-2xl p-5 sm:p-8 shadow-lg relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 sm:h-72 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

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
              {/* --- BAGIAN FOTO PROFIL (YANG DIUBAH) --- */}
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

              {/* BAGIAN DATA TEKS (TETAP SAMA) */}
              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-4 gap-y-1 sm:gap-y-2 w-full">
                <div className="space-y-1 sm:space-y-2">
                  <DataRow label="Nama Kebun" value={profile.nama_kebun} />
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
                  <DataRow label="Kebun Id" value={profile.kebun_id} />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <DataRow label="Alamat Kebun" value={profile.alamat_kebun} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-[#B5302D] mt-6 sm:mt-8 mb-6 sm:mb-10 px-1 border-l-4 border-[#B5302D] pl-3">
        Dashboard Fitur Utama Estate Manager
      </h2>

      {/* =========================================
          SECTION 2: WIDGETS
         ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* CARD 1: PERMINTAAN RELASI (Design: Clean List with Actions) */}
        <Card title="Permintaan Relasi Petani" icon={User}>
          {isLoadingPending ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#EF8523]" />
            </div>
          ) : pendingPetani.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-medium">Tidak ada permintaan baru.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPetani.map((item) => (
                <div
                  key={item.id}
                  className="group border border-gray-100 rounded-2xl p-4 relative bg-white hover:bg-orange-50/30 hover:border-orange-200 transition-all duration-300 shadow-sm"
                >
                  {/* Indikator Garis Kiri */}
                  <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#EF8523] rounded-r-full"></div>

                  <div className="pl-3 pr-16">
                    <h4 className="font-bold text-gray-800 text-sm mb-1">
                      {item.nama_lengkap}
                    </h4>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-gray-400" />{" "}
                        {item.no_hp}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-gray-400" />{" "}
                        <span className="truncate">{item.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Aksi Floating */}
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2">
                    <button
                      onClick={() => handleManagePetani(item.id, "approve")}
                      className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition-all shadow-sm"
                      title="Terima"
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => handleManagePetani(item.id, "reject")}
                      className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      title="Tolak"
                    >
                      <X size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* CARD 2: PERMINTAAN VALIDASI */}
        <Card
          title="Permintaan Validasi Operasional Perkebunan"
          icon={FileText}
          footer={
            <button
              // TAMBAHKAN ONCLICK DI SINI:
              onClick={() => navigate("/kebun/kemitraanpetani")}
              className="bg-[#B5302D] text-white text-xs px-5 py-2.5 rounded-full font-bold hover:bg-red-800 hover:shadow-lg transition-all transform active:scale-95"
            >
              Detail Validasi
            </button>
          }
        >
          {isValidasiLoading ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#EF8523]" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Loop Validasi Data (Tanam, Panen, Dokumen) */}
              {Object.entries({
                "Rencana Tanam": validasiData.rencanaTanam,
                "Rencana Panen": validasiData.rencanaPanen,
                "Dokumen ISPO": validasiData.dokumenISPO, // Static
              }).map(([title, items], idx) => (
                <div
                  key={idx}
                  className="bg-gray-50/80 rounded-xl p-4 border border-gray-100"
                >
                  <h4 className="text-[#B5302D] text-[11px] uppercase font-bold tracking-wider mb-3 border-b border-gray-200 pb-1">
                    Validasi {title}
                  </h4>
                  {items.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">
                      Tidak ada data pending.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {items.map((item, i) => (
                        <li
                          key={item.id || i}
                          className="flex items-center justify-between text-xs group cursor-pointer"
                        >
                          <span className="font-medium text-gray-700 group-hover:text-black transition-colors flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full group-hover:bg-[#EF8523]"></span>
                            {/* LOGIC DISPLAY NAMA (Sesuai Data Source) */}
                            {title === "Dokumen ISPO" ? (
                              item.nama
                            ) : (
                              <span>
                                {item.nama_petani}
                                <span className="text-[10px] text-gray-400 ml-1 font-normal">
                                  -{" "}
                                  {title === "Rencana Tanam"
                                    ? item.nama_unit || `Blok #${item.id}`
                                    : item.nama_blok || `Unit ${item.id}`}
                                </span>
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                            Pending
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* CARD 3: PROGRES PENJUALAN TBS (Design: Timeline Modern) */}
        <Card title="Progres Penjualan TBS" icon={Calendar}>
          <div className="space-y-0">
            {progresPenjualan.map((item, index) => (
              <div key={item.id} className="relative pl-6 py-3 group">
                {/* Garis Konektor Vertical */}
                {index !== progresPenjualan.length - 1 && (
                  <div className="absolute left-[9px] top-6 bottom-[-12px] w-0.5 bg-gray-200 group-hover:bg-green-200 transition-colors"></div>
                )}

                {/* Dot Indikator */}
                <div
                  className={`absolute left-0 top-4 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 ${
                    item.status === "Diterima" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>

                <div className="flex justify-between items-start bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">
                      {item.pabrik}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                      <Calendar size={10} /> {item.tanggal}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      item.status === "Diterima"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* CARD 4: PENGIRIMAN TBS (Design: Stepper Modern) */}
        <Card title="Pengiriman TBS" icon={Truck}>
          <div className="space-y-6">
            {pengirimanTBS.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm text-[#EF8523]">
                    <Truck size={16} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800">
                    {item.pabrik}
                  </h4>
                </div>

                {/* Visualisasi Steps */}
                <div className="flex items-center justify-between relative px-2">
                  {/* Garis Background */}
                  <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -z-0 rounded-full"></div>

                  {item.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="relative z-10 flex flex-col items-center"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-sm transition-all ${
                          idx === 1
                            ? "bg-white border-[#EF8523] text-[#EF8523]" // Step Aktif (Contoh)
                            : "bg-white border-gray-300 text-gray-400"
                        }`}
                      >
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold mt-2 px-2 py-0.5 rounded-full ${
                          idx === 1
                            ? "text-[#EF8523] bg-orange-50"
                            : "text-gray-400"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* FITUR 5: Harga TBS - SCROLLABLE VERSION */}
        <Card title="Harga TBS Sesuai Aturan Pemerintah" icon={Coins}>
          <div className="relative h-full flex flex-col pt-2 w-full">
            {/* Badge Tahun & Indikator Scroll */}
            <div className="flex justify-between items-center mb-4 px-1">
              <div className="flex items-center gap-2">
                {/* Petunjuk Scroll (Hanya muncul jika layar kecil/data banyak) */}
                <span className="text-[9px] text-gray-400 bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1 animate-pulse">
                  <span className="text-xs">↔</span> Geser grafik
                </span>
              </div>
              <div className="bg-orange-50 border border-orange-200 text-orange-600 px-3 py-0.5 rounded-lg text-[10px] font-black shadow-sm">
                2025
              </div>
            </div>

            {(() => {
              // --- DATA DUMMY (Bisa Ditambah Sepuasnya) ---
              const dataBE = [
                { bulan: "JANUARI", harga: 1100 },
                { bulan: "FEBRUARI", harga: 1350 },
                { bulan: "MARET", harga: 2100 },
                { bulan: "APRIL", harga: 1800 },
                { bulan: "MEI", harga: 2000 },
                { bulan: "JUNI", harga: 2500 },
                { bulan: "JULI", harga: 2200 },
                { bulan: "AGUSTUS", harga: 2400 },
                { bulan: "SEPTEMBER", harga: 2150 },
                { bulan: "OKTOBER", harga: 2600 }, // Data banyak tetap aman
              ];

              // KONFIGURASI
              const maxHarga = 4000;
              const svgHeight = 140;

              // LOGIKA LEBAR DINAMIS (SCROLLABLE)
              // Setiap data poin kita beri jatah lebar minimal 70px
              // Jika datanya sedikit, dia akan memenuhi lebar container (100%)
              // Jika datanya banyak, dia akan melebar melebihi container sehingga bisa di-scroll
              const minWidthPerPoint = 70;
              const calculatedWidth = Math.max(
                dataBE.length * minWidthPerPoint,
                500,
              ); // Minimal lebar 500px agar tidak gepeng
              const svgWidth = calculatedWidth;

              // PADDING AGAR TIDAK KEPOTONG
              const paddingX = 40;
              const effectiveWidth = svgWidth - paddingX * 2;

              const points = dataBE.map((d, i) => {
                const x = paddingX + (i / (dataBE.length - 1)) * effectiveWidth;
                const y = svgHeight - (d.harga / maxHarga) * svgHeight;
                return { x, y, harga: d.harga, bulan: d.bulan };
              });

              const linePath = points.map((p) => `${p.x},${p.y}`).join(" ");
              const areaPath = `M ${points[0].x},${svgHeight} ${linePath} ${points[points.length - 1].x},${svgHeight} Z`;

              return (
                <div className="flex flex-1 w-full min-h-[180px] relative overflow-hidden">
                  {/* BAGIAN 1: SUMBU Y (FIXED / DIAM) */}
                  {/* Kita taruh di layer paling atas (z-10) dan background putih agar menutupi grafik saat discroll */}
                  <div className="absolute left-0 top-0 bottom-8 w-10 z-10 bg-white/95 backdrop-blur-[1px] flex flex-col justify-between text-[9px] text-gray-400 font-bold border-r border-gray-100 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                    {["4k", "3k", "2k", "1k", "0"].map((l) => (
                      <span key={l} className="text-right pr-2">
                        {l}
                      </span>
                    ))}
                  </div>

                  {/* BAGIAN 2: AREA GRAFIK (SCROLLABLE) */}
                  {/* Margin-left disesuaikan dengan lebar Sumbu Y (w-10) */}
                  <div className="flex-1 overflow-x-auto pl-10 pb-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    <div
                      style={{ width: `${svgWidth}px`, height: "100%" }}
                      className="relative"
                    >
                      <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        preserveAspectRatio="none"
                        className="block w-full h-full overflow-visible"
                      >
                        <defs>
                          <linearGradient
                            id="scrollGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#EF8523"
                              stopOpacity="0.2"
                            />
                            <stop
                              offset="100%"
                              stopColor="#EF8523"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>

                        {/* Grid Lines Horizontal */}
                        {[0, 35, 70, 105, 140].map((y) => (
                          <line
                            key={y}
                            x1="0"
                            y1={y}
                            x2={svgWidth}
                            y2={y}
                            stroke="#f8f9fa"
                            strokeWidth="1"
                          />
                        ))}

                        {/* Area & Line */}
                        <path d={areaPath} fill="url(#scrollGradient)" />
                        <polyline
                          fill="none"
                          stroke="#EF8523"
                          strokeWidth="3"
                          strokeLinejoin="round"
                          points={linePath}
                        />

                        {/* Data Points */}
                        {points.map((pt, i) => (
                          <g key={i}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="4"
                              fill="white"
                              stroke="#EF8523"
                              strokeWidth="2.5"
                            />
                            <g
                              transform={`translate(${pt.x - 22}, ${pt.y - 28})`}
                            >
                              <rect
                                width="44"
                                height="16"
                                rx="4"
                                fill="black"
                              />
                              <text
                                x="22"
                                y="11"
                                textAnchor="middle"
                                className="text-[9px] font-black fill-white"
                              >
                                {pt.harga.toLocaleString()}
                              </text>
                            </g>
                          </g>
                        ))}
                      </svg>

                      {/* Label Bulan (Ikut Scroll) */}
                      <div className="absolute bottom-0 left-0 w-full h-6">
                        {points.map((pt, i) => (
                          <div
                            key={i}
                            className="absolute flex flex-col items-center top-0"
                            style={{
                              left: `${pt.x}px`,
                              transform: "translateX(-50%)",
                            }}
                          >
                            <div className="w-1 h-1 bg-gray-300 rounded-full mb-1"></div>
                            <span className="text-[9px] font-bold text-gray-500 uppercase whitespace-nowrap">
                              {pt.bulan.substring(0, 3)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Footer Info */}
            <div className="mt-2 border-t border-gray-50 pt-2 flex justify-between items-center">
              <p className="text-[8px] text-gray-400 italic font-medium">
                * Geser untuk melihat riwayat harga
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* --- POPUP DATA DIRI --- */}
      {showPopupDataDiri && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="w-full max-w-3xl h-[85vh] rounded-2xl animate-fade-in-up flex relative shadow-2xl">
            <DataDiriEM
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
