import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, ROLES, getFileUrl } from "../../../config/constants.js";
import DataDiriKebun from "./DataDiriKebun.jsx";
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
  CheckCircle2,
  History,
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

export default function DashboardKebun() {
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
    role: "Kebun",
    email: "",
    nomor_telepon: "",
    alamat_kebun: "",
    foto: "",
    koordinat: "",
    kebun_id: "",
    distrik_id: "",
    user_id: "",
  });

  // Data dinamis dari API
  const [pendingPetani, setPendingPetani] = useState([]);

  // --- STATE GRAFIK HARGA TBS ---
  const [hargaTbsData, setHargaTbsData] = useState([]);
  const [isLoadingHargaTbs, setIsLoadingHargaTbs] = useState(false);
  const [tahunTbs, setTahunTbs] = useState(new Date().getFullYear()); // Default tahun saat ini

  // --- DATA VALIDASI (DINAMIS & STATIC) ---
  // Rencana Tanam & Panen diubah menjadi array kosong untuk diisi API
  // Dokumen ISPO tetap static sesuai instruksi
  const [validasiData, setValidasiData] = useState({
    rencanaTanam: [],
    rencanaPanen: [],
    dokumenISPO: [],
  });

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

        console.log("==== DATA GET DARI BE ====", userData);

        setProfile({
          nama_kebun: userData.nama_lengkap || "-",
          role: userData.role || ROLES.KEBUN,
          email: userData.email || "-",
          nomor_telepon: userData.no_hp || "-",
          alamat_kebun: userData.alamat || "",
          foto: getFileUrl(userData.foto_profil_url) || "",
          kebun_id: userData.kebun_id || userData.id || "-",
          user_id: userData.id || "-",
          distrik_id: userData.distrik_id || "-",
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
   * --- FETCH GRAFIK HARGA TBS ---
   */
  useEffect(() => {
    const fetchGrafikHarga = async () => {
      // UBAH: Gunakan user_id bukan kebun_id
      if (!profile.user_id || profile.user_id === "-") {
        return;
      }

      setIsLoadingHargaTbs(true);
      try {
        const token = getToken();
        if (!token) return;

        const rawEndpoint =
          API_ENDPOINTS?.FARM?.KEBUN?.TRANSAKSI?.GET_HARGA_TBS_GRAPH;

        // UBAH: Ganti dengan profile.user_id
        const baseUrl = rawEndpoint.replace("{kebun_id}", profile.user_id);
        const url = `${baseUrl}?tahun=${tahunTbs}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok)
          throw new Error("Gagal mengambil data grafik Harga TBS");

        const resData = await response.json();

        let chartData = [];
        if (resData && resData.labels && resData.data_harga) {
          chartData = resData.labels.map((namaBulan, index) => ({
            bulan: namaBulan,
            harga: Number(resData.data_harga[index]) || 0,
            dokumen: resData.meta_dokumen ? resData.meta_dokumen[index] : null,
          }));
        } else {
          chartData = Array.isArray(resData)
            ? resData
            : resData.data || resData.grafik || [];
        }

        setHargaTbsData(chartData);
      } catch (error) {
        console.error("Error saat proses grafik:", error);
      } finally {
        setIsLoadingHargaTbs(false);
      }
    };

    fetchGrafikHarga();
  }, [profile.user_id, tahunTbs]);

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
        throw new Error("Gagal mengambil data permintaan mandor");

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

      // 1. Fetch Pending Rencana Panen
      const resPanen = await fetch(
        API_ENDPOINTS.FARM.KEBUN.APPROVAL.GET_RENCANA_PANEN_PENDING,
        { headers },
      );
      const dataPanen = resPanen.ok ? await resPanen.json() : [];

      // 2. Fetch Pending Rencana Tanam / Blok
      const resTanam = await fetch(
        API_ENDPOINTS.FARM.KEBUN.APPROVAL.GET_PENDING_BLOK,
        { headers },
      );
      const dataTanam = resTanam.ok ? await resTanam.json() : [];

      // 3. Fetch Pending Dokumen ISPO (TAMBAHAN BARU)
      const resDokumen = await fetch(
        API_ENDPOINTS.ISPO.KEBUN.GET_PETANI_PENDING_SUBMISSION_ISPO,
        { headers },
      );
      const dataDokumen = resDokumen.ok ? await resDokumen.json() : [];

      // Update state validasiData dengan ketiga data asli
      setValidasiData((prev) => ({
        ...prev,
        rencanaPanen: Array.isArray(dataPanen) ? dataPanen : [],
        rencanaTanam: Array.isArray(dataTanam) ? dataTanam : [],
        dokumenISPO: Array.isArray(dataDokumen) ? dataDokumen : [],
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

  // --- STATE RIWAYAT PENJUALAN TBS (MINI) ---
  const [riwayatPenjualanMini, setRiwayatPenjualanMini] = useState([]);
  const [isLoadingRiwayatMini, setIsLoadingRiwayatMini] = useState(false);

  // --- FETCH RIWAYAT PENJUALAN TBS (MINI) ---
  useEffect(() => {
    const fetchRiwayatMini = async () => {
      setIsLoadingRiwayatMini(true);
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(
          API_ENDPOINTS.FARM.MARKETPLACE.GET_PENGAJUAN_MASUK,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const data = await response.json();
          // Hanya ambil 3 data teratas (terbaru)
          setRiwayatPenjualanMini(data.slice(0, 3));
        } else {
          setRiwayatPenjualanMini([]);
        }
      } catch (error) {
        console.error("Error fetching riwayat mini:", error);
      } finally {
        setIsLoadingRiwayatMini(false);
      }
    };

    fetchRiwayatMini();
  }, []);

  // --- STATE PENGIRIMAN TBS (MINI) ---
  const [pengirimanMini, setPengirimanMini] = useState([]);
  const [isLoadingPengirimanMini, setIsLoadingPengirimanMini] = useState(false);

  // --- FETCH PENGIRIMAN TBS (MINI) ---
  useEffect(() => {
    const fetchPengirimanMini = async () => {
      setIsLoadingPengirimanMini(true);
      try {
        const token = getToken();
        if (!token) return;
        const urlBase = API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.GET_LIST;

        // Ambil data aktif dan histori secara bersamaan (Sama seperti DistribusiLogistik.jsx)
        const [resAktif, resHistori] = await Promise.all([
          fetch(`${urlBase}?is_history=false`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${urlBase}?is_history=true`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        let dataAktif = resAktif.ok ? await resAktif.json() : [];
        let dataHistori = resHistori.ok ? await resHistori.json() : [];

        let combinedData = [...dataAktif, ...dataHistori];

        // Filter: Belum diperiksa pabrik & tidak ditolak
        combinedData = combinedData.filter(
          (item) =>
            (item.pemeriksaan === null || item.pemeriksaan === undefined) &&
            item.status_permintaan?.toLowerCase() !== "ditolak",
        );

        // Urutkan ID terbaru ke atas
        combinedData.sort((a, b) => b.id - a.id);

        // Ambil 3 teratas untuk dashboard mini
        setPengirimanMini(combinedData.slice(0, 3));
      } catch (error) {
        console.error("Error fetching pengiriman mini:", error);
      } finally {
        setIsLoadingPengirimanMini(false);
      }
    };

    fetchPengirimanMini();
  }, []);

  /**
   * --- HANDLE MANAGE PETANI ---
   */
  const handleManagePetani = async (petaniId, actionType) => {
    if (isProcessing) return;
    const confirmMsg =
      actionType === "approve"
        ? "Terima permintaan mandor ini?"
        : "Tolak permintaan mandor ini?";

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
        `Berhasil ${actionType === "approve" ? "menerima" : "menolak"} mandor.`,
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

              {/* BAGIAN DATA TEKS */}
              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 w-full">
                {/* KOLOM 1 */}
                <div className="space-y-3">
                  <DataRow label="Nama Kebun" value={profile.nama_kebun} />
                  <DataRow label="Role" value="Kebun" />
                  <DataRow label="Kode Kebun Relasi" value={profile.kebun_id} />
                </div>

                {/* KOLOM 2 */}
                <div className="space-y-3">
                  <DataRow label="Email" value={profile.email} />
                  <DataRow
                    label="Nomor Telepon"
                    value={profile.nomor_telepon}
                  />
                  <DataRow label="Kode Distrik" value={profile.distrik_id} />
                </div>

                {/* KOLOM 3 */}
                <div className="space-y-3">
                  <DataRow label="Alamat Kebun" value={profile.alamat_kebun} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-[#B5302D] mt-6 sm:mt-8 mb-6 sm:mb-10 px-1 border-l-4 border-[#B5302D] pl-3">
        Tampilan Utama Fitur Kebun
      </h2>

      {/* =========================================
          SECTION 2: WIDGETS
         ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* CARD 1: PERMINTAAN RELASI */}
        <Card title="Permintaan Relasi Mandor" icon={User}>
          {isLoadingPending ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Memuat data...
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
          title="Permintaan Validasi Operasional Perkebunan "
          icon={FileText}
          footer={
            <button
              onClick={() => navigate("/kebun/kemitraanpetani/validasi")}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#EF8523] border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm"
            >
              Lihat Semua &rarr;
            </button>
          }
        >
          {isValidasiLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Memuat data...
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
                            {/* LOGIC DISPLAY NAMA */}
                            {title === "Dokumen ISPO" ? (
                              <span>
                                {item.nama_petani || "Petani"}
                                <span className="text-[10px] text-gray-400 ml-1 font-normal truncate max-w-[120px] inline-block align-bottom">
                                  -{" "}
                                  {item.jenis_dokumen ||
                                    item.requirement_code ||
                                    "Dokumen Sertifikasi"}
                                </span>
                              </span>
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

        {/* CARD 3: PROGRES PENJUALAN TBS (Tampilan Mini dari Penjualan.jsx) */}
        <Card
          title="Status Pengajuan Penjualan TBS"
          icon={Calendar}
          footer={
            <button
              onClick={() => navigate("/kebun/penjualan/progrespengajuan")}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#EF8523] border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm"
            >
              Lihat Semua &rarr;
            </button>
          }
        >
          <div className="space-y-4">
            {isLoadingRiwayatMini ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Memuat data...
              </div>
            ) : riwayatPenjualanMini.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-xs">Belum ada pengajuan penjualan.</p>
              </div>
            ) : (
              riwayatPenjualanMini.map((item) => {
                // Formatting Tanggal
                const tglAjuanFormat = new Date(
                  item.created_at,
                ).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });

                // Menentukan warna label status
                const statusRaw = (item.status_pengajuan || "").toLowerCase();
                let badgeClass =
                  "bg-yellow-50 text-yellow-700 border-yellow-100";
                let IconStatus = History;

                if (statusRaw.includes("setuju")) {
                  badgeClass = "bg-green-50 text-green-700 border-green-100";
                  IconStatus = CheckCircle2;
                }
                if (statusRaw.includes("tolak")) {
                  badgeClass = "bg-red-50 text-red-700 border-red-100";
                  IconStatus = X;
                }

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-[16px] border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B5302D] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                          Nama Grup
                        </p>
                        <p className="text-sm font-bold text-gray-800 leading-snug">
                          {item.nama_grup}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold border flex items-center gap-1 shrink-0 ${badgeClass}`}
                      >
                        <IconStatus className="w-3 h-3" />
                        {item.status_pengajuan || "MENUNGGU"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          Tgl Pengajuan
                        </p>
                        <p className="text-[11px] font-medium text-gray-700 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-gray-400" />{" "}
                          {tglAjuanFormat}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          Est. Muatan (TBS)
                        </p>
                        <p className="text-[11px] font-bold text-[#B5302D] mt-0.5">
                          {item.estimasi_total_tbs_grup_kg} Kg
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* CARD 4: PENGIRIMAN TBS (Tampilan Mini) */}
        <Card
          title="Status Pengiriman TBS"
          icon={Truck}
          footer={
            <button
              onClick={() =>
                navigate("/kebun/distribusi&logistik/statuspengiriman")
              }
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#EF8523] border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm"
            >
              Lihat Semua &rarr;
            </button>
          }
        >
          <div className="space-y-4">
            {isLoadingPengirimanMini ? (
              <div className="h-32 flex items-center justify-center text-gray-400 text-xs">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Memuat data...
              </div>
            ) : pengirimanMini.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-xs">
                  Belum ada armada yang sedang berjalan.
                </p>
              </div>
            ) : (
              pengirimanMini.map((item) => {
                // Logika Status dari DistribusiLogistik.jsx
                const statusPermintaan = (
                  item.status_permintaan || "menunggu"
                ).toLowerCase();
                const rawProgress = item.progress_db || "menunggu_pengiriman";
                const pDB = rawProgress.toLowerCase().replace(/\s+/g, "_");

                let badgeClass =
                  "bg-yellow-50 text-yellow-700 border-yellow-100";
                let label = "Menunggu Konfirmasi";
                let IconStatus = History;

                if (statusPermintaan === "diterima") {
                  if (pDB === "terima") {
                    badgeClass = "bg-green-50 text-green-700 border-green-100";
                    label = "Tiba di Pabrik";
                    IconStatus = CheckCircle2;
                  } else {
                    badgeClass = "bg-blue-50 text-blue-700 border-blue-100";
                    label = item.progress_publik || "Dalam Perjalanan";
                    IconStatus = Truck;
                  }
                }

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-[16px] border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EF8523] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                          Tujuan Pabrik
                        </p>
                        <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-1 pr-2">
                          {item.alamat_pengiriman_pabrik || "Pabrik Tujuan"}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold border flex items-center gap-1 shrink-0 ${badgeClass}`}
                      >
                        <IconStatus className="w-3 h-3" />
                        {label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          No. Resi
                        </p>
                        <p className="text-[11px] font-mono font-bold text-gray-700 mt-0.5">
                          {item.kode_resi || `REQ-${item.id}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          Est. Tiba
                        </p>
                        <p className="text-[11px] font-bold text-[#EF8523] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-orange-400" />
                          {item.tanggal_permintaan_sampai || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* FITUR 5: Harga TBS - ROLE KEBUN (MOBILE OPTIMIZED) */}
        <Card
          title="Harga TBS Sesuai Aturan Pemerintah"
          icon={Coins}
          footer={
            // TOMBOL KHUSUS ROLE KEBUN TETAP DIPERTAHANKAN
            <button
              onClick={() => navigate("/kebun/manajemenoperasional/organisasi")}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#EF8523] border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm"
            >
              Tambahkan Informasi Harga Terbaru &rarr;
            </button>
          }
        >
          <div className="relative w-full flex flex-col">
            {/* --- HEADER & FILTER --- */}
            <div className="flex justify-between items-center mb-3 px-1 mt-2">
              <div className="flex items-center">
                {/* 1. BADGE LEBIH MENCARI PERHATIAN */}
                <div className="flex items-center gap-1.5 bg-orange-50 text-[#EF8523] border border-orange-200/80 px-3 py-1 rounded-full shadow-sm animate-pulse">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M8 7h8M8 17h8M7 12h10M10 12l-3-3m0 0l3-3m-3 3h10"
                    />
                  </svg>
                  <span className="text-[9px] sm:text-[10px] font-extrabold tracking-wide uppercase">
                    Geser Grafik
                  </span>
                </div>
              </div>

              {/* Dropdown Filter (Touch-Friendly) */}
              <div className="relative group">
                <select
                  value={tahunTbs}
                  onChange={(e) => setTahunTbs(parseInt(e.target.value))}
                  className="appearance-none bg-white border border-gray-200 text-gray-700 hover:border-[#EF8523] pl-3 pr-8 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold shadow-sm outline-none cursor-pointer transition-all focus:ring-1 focus:ring-[#EF8523]"
                >
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        Tahun {year}
                      </option>
                    );
                  })}
                </select>
                <svg
                  className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-[#EF8523] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>

            {/* --- KONTEN GRAFIK --- */}
            {isLoadingHargaTbs ? (
              <div className="w-full h-[220px] sm:h-[240px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#EF8523]" />
              </div>
            ) : hargaTbsData.length === 0 ? (
              <div className="w-full h-[220px] sm:h-[240px] flex items-center justify-center">
                <p className="text-gray-400 text-[10px] sm:text-xs font-medium bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
                  Belum ada data harga TBS untuk tahun {tahunTbs}.
                </p>
              </div>
            ) : (
              (() => {
                const dataBE = hargaTbsData;

                // Konversi aman menggunakan Number() seperti kode asli Anda
                const hargaTerendah = Math.min(
                  ...dataBE.map((d) => Number(d.harga) || 0),
                );
                const hargaTertinggi = Math.max(
                  ...dataBE.map((d) => Number(d.harga) || 0),
                );

                let minHarga = Math.max(
                  0,
                  Math.floor(hargaTerendah / 500) * 500 - 500,
                );
                let maxHarga = Math.ceil(hargaTertinggi / 500) * 500 + 500;

                const diff = maxHarga - minHarga;
                if (diff <= 2000) maxHarga = minHarga + 2000;
                else if (diff <= 4000) maxHarga = minHarga + 4000;

                const yLabels = [
                  maxHarga,
                  minHarga + (maxHarga - minHarga) * 0.75,
                  minHarga + (maxHarga - minHarga) * 0.5,
                  minHarga + (maxHarga - minHarga) * 0.25,
                  minHarga,
                ];

                const svgHeight = 220;
                const paddingTop = 35;
                const paddingBottom = 25;
                const graphHeight = svgHeight - paddingTop - paddingBottom;

                const minWidthPerPoint = 75;
                const svgWidth = Math.max(
                  dataBE.length * minWidthPerPoint,
                  500,
                );
                const paddingX = 35;
                const effectiveWidth = svgWidth - paddingX * 2;

                const points = dataBE.map((d, i) => {
                  const divider = dataBE.length > 1 ? dataBE.length - 1 : 1;
                  const x = paddingX + (i / divider) * effectiveWidth;

                  // Pastikan d.harga di-parse ke Number
                  const hargaNum = Number(d.harga) || 0;
                  const y =
                    paddingTop +
                    graphHeight -
                    ((hargaNum - minHarga) / (maxHarga - minHarga)) *
                      graphHeight;
                  return { x, y, harga: hargaNum, bulan: d.bulan || "-" };
                });

                const linePath = points.map((p) => `${p.x},${p.y}`).join(" L ");
                const areaPath = `M ${points[0].x},${paddingTop + graphHeight} L ${linePath} L ${points[points.length - 1].x},${paddingTop + graphHeight} Z`;

                return (
                  <div className="w-full h-[220px] sm:h-[240px] relative overflow-hidden bg-white rounded-xl border border-gray-100 shadow-[inset_0_1px_4px_rgba(0,0,0,0.03)] mt-1">
                    {/* SUMBU Y FIXED (Efek Glassmorphism Kaca Buram) */}
                    <div
                      className="absolute left-0 w-9 sm:w-11 z-20 bg-white/80 backdrop-blur-md flex flex-col justify-between text-[8px] sm:text-[9px] text-gray-500 font-extrabold border-r border-white/50 shadow-[2px_0_5px_rgba(0,0,0,0.03)]"
                      style={{
                        top: `${paddingTop}px`,
                        height: `${graphHeight}px`,
                      }}
                    >
                      {yLabels.map((val, idx) => (
                        <span
                          key={idx}
                          className="text-right pr-1.5 sm:pr-2 -translate-y-1/2"
                        >
                          {val === 0 ? "0" : `${(val / 1000).toFixed(1)}k`}
                        </span>
                      ))}
                    </div>

                    {/* 2. EFEK BAYANGAN KANAN (MEMBERI TAHU ADA KONTEN TERSEMBUNYI) */}
                    <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-l from-white via-white/70 to-transparent z-20 pointer-events-none flex items-center justify-end pr-1 sm:pr-2">
                      <svg
                        className="w-4 h-4 text-[#EF8523]/50 animate-pulse"
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
                    </div>

                    {/* AREA GRAFIK SCROLLABLE */}
                    <div
                      className="w-full h-full overflow-x-auto overflow-y-hidden pl-9 sm:pl-11"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      <style>{`
                        div::-webkit-scrollbar { display: none; }
                      `}</style>

                      <div
                        style={{
                          width: `${svgWidth}px`,
                          height: `${svgHeight}px`,
                        }}
                        className="relative pr-6"
                      >
                        <svg
                          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                          preserveAspectRatio="none"
                          className="block w-full h-full overflow-visible"
                        >
                          <defs>
                            <linearGradient
                              id="chartGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#EF8523"
                                stopOpacity="0.25"
                              />
                              <stop
                                offset="100%"
                                stopColor="#EF8523"
                                stopOpacity="0"
                              />
                            </linearGradient>

                            <filter
                              id="glow"
                              x="-20%"
                              y="-20%"
                              width="140%"
                              height="140%"
                            >
                              <feDropShadow
                                dx="0"
                                dy="4"
                                stdDeviation="4"
                                floodColor="#EF8523"
                                floodOpacity="0.15"
                              />
                            </filter>
                          </defs>

                          {yLabels.map((_, idx) => {
                            const yPos = paddingTop + (idx / 4) * graphHeight;
                            return (
                              <line
                                key={`h-grid-${idx}`}
                                x1="0"
                                y1={yPos}
                                x2={svgWidth}
                                y2={yPos}
                                stroke="#f1f5f9"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                              />
                            );
                          })}

                          <path d={areaPath} fill="url(#chartGradient)" />

                          {points.map((pt, i) => (
                            <line
                              key={`v-grid-${i}`}
                              x1={pt.x}
                              y1={pt.y}
                              x2={pt.x}
                              y2={paddingTop + graphHeight}
                              stroke="#e2e8f0"
                              strokeWidth="1.5"
                              strokeDasharray="4 4"
                            />
                          ))}

                          <path
                            d={`M ${linePath}`}
                            fill="none"
                            stroke="#EF8523"
                            strokeWidth="3.5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            filter="url(#glow)"
                          />

                          {points.map((pt, i) => (
                            <g key={`data-point-${i}`}>
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="4.5"
                                fill="white"
                                stroke="#EF8523"
                                strokeWidth="3"
                                className="transition-all duration-300"
                              />

                              <g transform={`translate(${pt.x}, ${pt.y - 20})`}>
                                <rect
                                  x="-23"
                                  y="-11"
                                  width="46"
                                  height="18"
                                  rx="9"
                                  fill="#000"
                                  opacity="0.08"
                                  transform="translate(0, 2)"
                                />
                                <rect
                                  x="-23"
                                  y="-11"
                                  width="46"
                                  height="18"
                                  rx="9"
                                  fill="#EF8523"
                                />
                                <polygon
                                  points="-3,6 3,6 0,10"
                                  fill="#EF8523"
                                />
                                <text
                                  x="0"
                                  y="1"
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  className="text-[8px] sm:text-[9px] font-bold fill-white tracking-wide"
                                >
                                  {pt.harga.toLocaleString("id-ID")}
                                </text>
                              </g>

                              <text
                                x={pt.x}
                                y={paddingTop + graphHeight + 16}
                                textAnchor="middle"
                                className="text-[8px] sm:text-[9px] font-bold fill-gray-500 uppercase tracking-widest"
                              >
                                {pt.bulan.substring(0, 3)}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}

            {/* 3. TEKS KETERANGAN DI BAWAH (FOOTER HINT) */}
            {hargaTbsData && hargaTbsData.length > 0 && !isLoadingHargaTbs && (
              <div className="mt-2.5 flex items-center justify-center sm:justify-start px-2">
                <p className="text-[9px] sm:text-[10px] text-gray-400 italic font-medium tracking-wide">
                  * Sapu layar ke kiri atau kanan untuk melihat riwayat bulan
                  lainnya.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* --- POPUP DATA DIRI --- */}
      {showPopupDataDiri && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="w-full max-w-3xl h-[85vh] rounded-2xl animate-fade-in-up flex relative shadow-2xl">
            <DataDiriKebun
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
