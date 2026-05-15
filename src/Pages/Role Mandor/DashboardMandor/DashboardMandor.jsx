import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  API_ENDPOINTS,
  API_BASE_URLS,
  ROLES,
  getFileUrl,
} from "../../../config/constants";
import DataDiriMandor from "./DataDiriMandor";
import {
  Loader2,
  Trash2,
  CheckCircle,
  Circle,
  Plus,
  Calendar,
  Map,
  Award,
  ClipboardList,
  TrendingUp,
  Coins,
  User,
  Layers,
  Droplets,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
} from "lucide-react";
import { showToast, confirmDialog } from "../../../utils/notif";

// --- Komponen Card Reusable ---
const Card = ({ title, children, rightContent, footer, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col h-[320px] overflow-hidden">
    <div className="bg-[#EF8523] px-4 py-3 sm:px-4 flex justify-between items-center flex-shrink-0">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="bg-white/20 p-1.5 rounded-lg shadow-sm flex items-center justify-center">
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

// FUNGSI: Validasi sederhana kelengkapan data diri
const isProfileIncomplete = (p) => {
  return !p.alamat_kebun || !p.koordinat_lahan || !p.foto;
};

// FUNGSI: Mengambil tanggal hari ini format YYYY-MM-DD
const getTodayDateString = () => {
  const d = new Date();
  return d.toLocaleDateString("en-CA");
};

// --- Tambahkan Komponen Badge Sengketa Ini ---
const BadgeSengketa = ({ isSengketa }) => {
  if (isSengketa) {
    return (
      <span className="inline-block px-2.5 py-0.5 mt-2 rounded-full text-[10px] sm:text-xs font-bold bg-red-100 text-red-700 border border-red-200">
        Sengketa Aktif
      </span>
    );
  }
  return (
    <span className="inline-block px-2.5 py-0.5 mt-2 rounded-full text-[10px] sm:text-xs font-bold bg-green-100 text-green-700 border border-green-200">
      Bebas Sengketa
    </span>
  );
};

export default function DashboardMandor() {
  const navigate = useNavigate();
  const [showPopupDataDiri, setShowPopupDataDiri] = useState(false);

  // State Loading Data User
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // --- State Profile (Menampung data user) ---
  const [profile, setProfile] = useState({
    nama_lengkap: "",
    role: "Mandor",
    email: "",
    nomor_hp: "",
    foto: "",
    nama_kebun_naungan: "-",
    alamat_kebun: "",
    koordinat_lahan: null,
  });

  // --- State Lahan (Mineral & Gambut) ---
  const [lahanData, setLahanData] = useState({
    lahan_mineral: null,
    lahan_gambut: [],
  });
  // --- STATE GRAFIK HARGA TBS (Dinamis) ---
  const [hargaTbsData, setHargaTbsData] = useState([]);
  const [isLoadingHargaTbs, setIsLoadingHargaTbs] = useState(false);
  const [tahunTbs, setTahunTbs] = useState(new Date().getFullYear());

  // --- STATE NAVIGASI WIDGET LUAS LAHAN ---
  const [showModalMineral, setShowModalMineral] = useState(false);
  const [selectedMineralIndex, setSelectedMineralIndex] = useState(null);

  const [showModalGambut, setShowModalGambut] = useState(false);
  const [selectedGambutIndex, setSelectedGambutIndex] = useState(null);

  // --- State Progress ISPO (Dinamis) ---
  // (SESUAI BE MAHAR) Menyimpan persentase progres per Prinsip (1-5)
  const [ispoProgress, setIspoProgress] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });

  // STATE & LOGIC UNTUK RENCANA KERJA (TO DO LIST HARIAN)
  const [rencanaHariIni, setRencanaHariIni] = useState([]);
  const [isLoadingRencana, setIsLoadingRencana] = useState(false);
  const [showPopupRencana, setShowPopupRencana] = useState(false);

  // State form untuk tambah rencana baru
  const [newRencana, setNewRencana] = useState({
    judul_kegiatan: "",
    tanggal_kerja: "",
    kegiatan_kerja: "",
  });

  // -----------------------------------------------------------------------------
  // FUNGSI: Mengambil Data Rencana Kerja (GET)
  // (SESUAI BE MAHAR) - Mengambil list kegiatan berdasarkan query tanggal hari ini
  // -----------------------------------------------------------------------------
  const fetchRencanaKerja = useCallback(async () => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) return;

      setIsLoadingRencana(true);
      const today = getTodayDateString();

      // (SESUAI BE MAHAR) Endpoint GET dengan filter tanggal
      const response = await fetch(
        `${API_ENDPOINTS.FARM.PETANI.RENCANA_KERJA.GET_LIST}?tanggal=${today}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const listRencana = Array.isArray(data) ? data : data.data || [];

        // Validasi manual tanggal di sisi client
        const filteredByDate = listRencana.filter((item) => {
          // (SESUAI BE MAHAR) Cek field 'tanggal' atau 'tanggal_kerja' dari response
          const serverDate = item.tanggal || item.tanggal_kerja;
          if (!serverDate) return false;

          // Ambil 10 karakter pertama (YYYY-MM-DD)
          const dateString = serverDate.toString().substring(0, 10);
          return dateString === today;
        });

        // Urutkan: Status TERJADWAL tampil paling atas
        const sorted = filteredByDate.sort((a, b) => {
          if (a.status_kegiatan === b.status_kegiatan) return 0;
          return a.status_kegiatan === "TERJADWAL" ? -1 : 1;
        });

        setRencanaHariIni(sorted);
      } else {
        const errorText = await response.text();
        console.warn("Gagal mengambil data rencana kerja:", errorText);
      }
    } catch (error) {
      console.error("Error fetching rencana kerja:", error);
    } finally {
      setIsLoadingRencana(false);
    }
  }, []);

  // -----------------------------------------------------------------------------
  // FUNGSI: Mengambil Data Progres ISPO (GET)
  // (SESUAI INSTRUKSI BE MAHAR)
  // -----------------------------------------------------------------------------
  const fetchIspoProgress = useCallback(async () => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        API_ENDPOINTS.ISPO.PETANI.GET_PROGRES_ISPO_PETANI,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();

        // Cukup ambil langsung dari progress_summary bawaan Backend!
        // Tidak perlu dilooping atau dihitung manual lagi.
        if (data.progress_summary) {
          setIspoProgress({
            1: Math.round(data.progress_summary.prinsip_1 || 0),
            2: Math.round(data.progress_summary.prinsip_2 || 0),
            3: Math.round(data.progress_summary.prinsip_3 || 0),
            4: Math.round(data.progress_summary.prinsip_4 || 0),
            5: Math.round(data.progress_summary.prinsip_5 || 0),
          });
        } else {
          console.warn("Data progress_summary tidak ditemukan di response");
        }
      } else {
        console.warn("Gagal mengambil data progres ISPO");
      }
    } catch (error) {
      console.error("Error fetching ISPO progress:", error);
    }
  }, []);

  // --- INITIAL DATA FETCHING ---
  useEffect(() => {
    const initData = async () => {
      setIsLoadingProfile(true);

      // (SESUAI BE MAHAR) Load Profil User
      await fetchUserProfile();

      // (SESUAI BE MAHAR) Load Data Lahan User
      await fetchLahanData();

      setIsLoadingProfile(false);

      // Fetch Rencana Kerja setelah user init
      fetchRencanaKerja();

      // (SESUAI BE MAHAR) Fetch Data ISPO
      fetchIspoProgress();
    };
    initData();
  }, [fetchRencanaKerja, fetchIspoProgress]);

  // --- STATE RIWAYAT PENJUALAN TBS (MINI - TAB SELESAI) ---
  const [riwayatPenjualanMini, setRiwayatPenjualanMini] = useState([]);
  const [isLoadingRiwayatMini, setIsLoadingRiwayatMini] = useState(false);

  // --- FETCH RIWAYAT PENJUALAN TBS (MINI) ---
  useEffect(() => {
    const fetchRiwayatSelesaiMini = async () => {
      setIsLoadingRiwayatMini(true);
      try {
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");
        if (!token) return;

        // Fetch endpoint history
        const response = await fetch(
          `${API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.GET_LIST}?is_history=true`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const data = await response.json();

          // Filter hanya yang ADA PEMERIKSAAN (selesai) dan BUKAN Ditolak
          const dataSelesai = data.filter((item) => {
            const sudahDiperiksa =
              item.pemeriksaan !== null && item.pemeriksaan !== undefined;
            const tidakDitolak =
              item.status_permintaan?.toLowerCase() !== "ditolak";
            return sudahDiperiksa && tidakDitolak;
          });

          // Urutkan terbaru ke atas dan ambil 3 saja
          const dataTerbaru = dataSelesai
            .sort((a, b) => b.id - a.id)
            .slice(0, 3);

          setRiwayatPenjualanMini(dataTerbaru);
        } else {
          setRiwayatPenjualanMini([]);
        }
      } catch (error) {
        console.error("Error fetching riwayat penjualan mini:", error);
      } finally {
        setIsLoadingRiwayatMini(false);
      }
    };

    fetchRiwayatSelesaiMini();
  }, []);

  /**
   * --- FETCH GRAFIK HARGA TBS (Dinamis u/ Mandor) ---
   * Bergantung pada profile.kebun_id dan tahunTbs
   */
  useEffect(() => {
    const fetchGrafikHarga = async () => {
      // Tunggu sampai ID Kebun dari profil sudah didapatkan
      if (!profile.kebun_id || profile.kebun_id === "-") return;

      setIsLoadingHargaTbs(true);
      try {
        // PERBAIKAN: Ambil token langsung dari localStorage seperti fungsi lainnya di file ini
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");

        if (!token) return;

        // Gunakan .replace untuk memasukkan ID ke parameter {kebun_id}
        const baseUrl =
          API_ENDPOINTS.FARM?.KEBUN?.TRANSAKSI?.GET_HARGA_TBS_GRAPH.replace(
            "{kebun_id}",
            profile.kebun_id,
          );

        const url = `${baseUrl}?tahun=${tahunTbs}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Gagal mengambil data grafik TBS");

        const resData = await response.json();

        // Mapping Objek BE ke format Array untuk SVG
        let chartData = [];
        if (resData && resData.labels && resData.data_harga) {
          chartData = resData.labels.map((namaBulan, index) => ({
            bulan: namaBulan,
            harga: Number(resData.data_harga[index]) || 0,
          }));
        }
        setHargaTbsData(chartData);
      } catch (error) {
        console.error("Error fetching grafik harga:", error);
      } finally {
        setIsLoadingHargaTbs(false);
      }
    };

    fetchGrafikHarga();
  }, [profile.kebun_id, tahunTbs]);

  // -----------------------------------------------------------------------------
  // FUNGSI: Menambah Rencana Kerja Manual (POST)
  // (SESUAI BE MAHAR) - Mengirim payload kegiatan baru ke server
  // -----------------------------------------------------------------------------
  const handleSaveRencana = async () => {
    if (!newRencana.judul_kegiatan || !newRencana.tanggal_kerja) {
      // GANTI: Gunakan Toast Error
      showToast.error("Judul dan Tanggal wajib diisi!");
      return;
    }

    try {
      // TAMBAHAN: Toast Loading
      showToast.loading("Menyimpan rencana kerja...");

      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      const response = await fetch(
        API_ENDPOINTS.FARM.PETANI.RENCANA_KERJA.ADD,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            judul_kegiatan: newRencana.judul_kegiatan,
            kegiatan_kerja: newRencana.kegiatan_kerja,
            tanggal_kerja: newRencana.tanggal_kerja,
          }),
        },
      );

      showToast.dismiss(); // Matikan loading

      if (!response.ok) throw new Error("Gagal menambah rencana");

      // GANTI: Gunakan Toast Sukses
      showToast.success("Rencana kerja berhasil ditambahkan!");

      setShowPopupRencana(false);

      // Reset form ke default
      setNewRencana({
        judul_kegiatan: "",
        tanggal_kerja: getTodayDateString(),
        kegiatan_kerja: "",
      });

      fetchRencanaKerja();
    } catch (error) {
      showToast.dismiss(); // Matikan loading
      console.error("Error saving rencana:", error);
      // GANTI: Gunakan Toast Error
      showToast.error("Terjadi kesalahan saat menyimpan rencana.");
    }
  };

  // -----------------------------------------------------------------------------
  // FUNGSI: Update Status Kegiatan (PATCH)
  // (SESUAI BE MAHAR) - Mengubah status antara TERJADWAL dan SELESAI
  // -----------------------------------------------------------------------------
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      const newStatus = currentStatus === "TERJADWAL" ? "SELESAI" : "TERJADWAL";

      const url = `${API_ENDPOINTS.FARM.PETANI.RENCANA_KERJA.UPDATE_STATUS(
        id,
      )}?status=${newStatus}`;

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Gagal update status");

      // TAMBAHAN: Beri respons sukses agar user tahu data tersimpan di server
      if (newStatus === "SELESAI") {
        showToast.success("Kegiatan telah diselesaikan!");
      } else {
        showToast.success("Kegiatan dikembalikan ke jadwal.");
      }

      // Refresh list
      fetchRencanaKerja();
    } catch (error) {
      console.error("Error updating status:", error);
      showToast.error("Gagal mengubah status kegiatan.");
    }
  };

  // -----------------------------------------------------------------------------
  // FUNGSI: Hapus Rencana Kerja (DELETE)
  // (SESUAI BE MAHAR) - Menghapus kegiatan spesifik berdasarkan ID
  // -----------------------------------------------------------------------------
  const handleDeleteRencana = async (id) => {
    const isSetuju = await confirmDialog({
      title: "Hapus Rencana Kerja?",
      text: "Kegiatan ini akan dihapus dari daftar secara permanen.",
      confirmText: "Ya, Hapus!",
      cancelText: "Batal",
      isDanger: true, // Tombol warna merah
    });

    if (!isSetuju) return; // Berhenti jika user klik Batal

    try {
      showToast.loading("Menghapus kegiatan...");

      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      const response = await fetch(
        API_ENDPOINTS.FARM.PETANI.RENCANA_KERJA.DELETE(id),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      showToast.dismiss(); // Matikan loading

      if (!response.ok) throw new Error("Gagal menghapus");

      showToast.success("Kegiatan berhasil dihapus!");
      fetchRencanaKerja();
    } catch (error) {
      showToast.dismiss(); // Matikan loading
      console.error("Error deleting rencana:", error);
      showToast.error("Terjadi kesalahan. Gagal menghapus kegiatan.");
    }
  };

  // =================================================================================

  // FUNGSI: Mengambil Data Profil (User Me)
  // (SESUAI BE MAHAR) - Mendapatkan detail user (nama, role, foto, dll)
  const fetchUserProfile = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) return;

      setIsLoadingProfile(true);

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
      let finalKoordinat = null;

      // (SESUAI BE MAHAR) Normalisasi field koordinat (bisa object atau lat/long terpisah)
      if (userData.koordinat) {
        finalKoordinat = userData.koordinat;
      } else if (userData.latitude && userData.longitude) {
        finalKoordinat = { lat: userData.latitude, lng: userData.longitude };
      }

      setProfile({
        nama_lengkap: userData.nama_lengkap || "-",
        role: "Mandor",
        email: userData.email || "-",
        nomor_hp: userData.no_hp || "-",
        alamat_kebun: userData.alamat || "",
        foto: getFileUrl(userData.foto_profil_url) || "",
        kebun_id: userData.kebun_ref_id || userData.kebun_id || "-",
        nama_kebun_naungan: userData.nama_kebun_naungan || "Belum Terhubung",
        koordinat_lahan: finalKoordinat,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // FUNGSI: Mengambil Data Lahan
  // (SESUAI BE MAHAR) - Endpoint khusus untuk mendapatkan data lahan mineral & gambut
  const fetchLahanData = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) return;

      const urlLahan = `${API_BASE_URLS.FARM}/farm/me/lahan`;

      const response = await fetch(urlLahan, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) return;

      const realData = await response.json();

      // --- TAMBAHKAN CONSOLE.LOG DI SINI ---
      console.log("Data Lahan dari BE:", realData);
      // -------------------------------------

      setLahanData({
        lahan_mineral: realData.lahan_mineral,
        lahan_gambut: realData.lahan_gambut || [],
      });
    } catch (error) {
      console.error("Error fetching lahan:", error);
    }
  };

  // Konfigurasi field yang tidak boleh diedit jika sudah ada isinya
  const lockedFieldsConfig = {
    foto: !!profile.foto && profile.foto !== "",
    alamat: !!profile.alamat_kebun && profile.alamat_kebun.trim() !== "",
    koordinat:
      profile.koordinat_lahan !== null && profile.koordinat_lahan !== undefined,
  };

  const handleProfileSaved = (success) => {
    if (success) fetchUserProfile();
    setShowPopupDataDiri(false);
  };

  // Component kecil untuk menampilkan baris data di kartu Data Diri
  const DataRow = ({ label, value }) => (
    <div className="mb-1 sm:mb-2 last:mb-0">
      <p className="text-black/70 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-0">
        {label}
      </p>
      <p className="text-white text-[14px] sm:text-[16px] font-medium leading-tight tracking-wide break-words">
        {value && value !== "" ? value : "—"}
      </p>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-10 min-h-screen font-sans bg-white">
      {/* SECTION 1: DATA DIRI (Custom Layout, tidak pakai Card reusable) */}
      <div className="bg-gradient-to-r from-[#EF8523] to-[#f19d4e] rounded-2xl p-5 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex flex-row items-center justify-between mb-6 sm:mb-8 border-b border-black/10 pb-4 gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
              Data Diri Anda
            </h3>
            <button
              onClick={() => setShowPopupDataDiri(true)}
              className="bg-white/20 text-black/80 border border-white/50 rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold hover:bg-white hover:text-[#EF8523] transition-all duration-300"
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
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="p-1 bg-white/20 rounded-2xl">
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

              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 w-full text-white">
                <div className="space-y-1">
                  <DataRow label="Nama Lengkap" value={profile.nama_lengkap} />
                  <DataRow label="Role" value={profile.role} />
                  <DataRow
                    label="Relasi Kebun"
                    value={profile.nama_kebun_naungan}
                  />
                </div>
                <div className="space-y-1">
                  <DataRow label="Nomor Telepon" value={profile.nomor_hp} />
                  <DataRow label="Email" value={profile.email} />
                </div>
                <div className="space-y-1">
                  <DataRow
                    label="Alamat / Lokasi Kebun"
                    value={profile.alamat_kebun}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-[#B5302D] mt-6 sm:mt-8 mb-6 sm:mb-10 px-1 border-l-4 border-[#B5302D] pl-3">
        Tampilan Utama Fitur Mandor
      </h2>

      {/* --- SECTION 2: WIDGETS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <div className="md:col-span-2">
          {/* --- SECTION CARD LAHAN --- */}
          <Card
            title="Informasi Luas Lahan"
            icon={Map}
            rightContent={
              <div className="flex items-center gap-2 sm:gap-3">
                {/* --- TOMBOL MANAJEMEN SENGKETA --- */}
                {/* Dibuat mencolok dengan background putih solid, teks merah, dan efek bayangan */}
                <button
                  onClick={() => navigate("/petani/manajemensengketa")}
                  className="flex items-center gap-1.5 sm:gap-2 bg-white text-red-600 border border-transparent rounded-full px-3 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold hover:bg-red-50 hover:text-red-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  title="Manajemen Sengketa Lahan"
                >
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Sengketa</span>
                </button>

                {/* --- TOMBOL TAMBAH LAHAN --- */}
                {/* Dibuat mencolok dengan background putih solid, teks oranye, dan efek bayangan */}
                <button
                  onClick={() => navigate("/petani/luaslahan")}
                  className="flex items-center gap-1.5 sm:gap-2 bg-white text-black border border-transparent rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold hover:bg-orange-50 hover:text-[#d9751d] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  title="Daftar Lahan Baru"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                  <span className="hidden sm:inline">
                    Tambah/Perbarui Lahan
                  </span>
                  <span className="sm:hidden">Tambah</span>
                </button>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* --- BAGIAN 1: LAHAN MINERAL (WARNA HIJAU TUA) --- */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group h-full flex flex-col">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-700 opacity-80" />

                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-50 p-2.5 rounded-lg text-green-700">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-extrabold text-gray-900 uppercase tracking-wide">
                      Lahan Mineral
                    </h4>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                      Tanah padat konvensional
                    </p>
                  </div>
                </div>

                {!lahanData.lahan_mineral ? (
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 text-center mb-4">
                    <p className="text-[11px] text-gray-500 font-medium">
                      Tidak ada data lahan mineral.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">
                        Total Luas
                      </p>
                      <p className="text-sm font-black text-gray-900 mt-0.5">
                        {lahanData.lahan_mineral.luas_total_lahan_mineral || 0}{" "}
                        <span className="text-[10px] text-gray-500 font-semibold">
                          Ha
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">
                        Telah Digunakan
                      </p>
                      <p className="text-sm font-black text-green-700 mt-0.5">
                        {lahanData.lahan_mineral.lahan_digunakan_mineral || 0}{" "}
                        <span className="text-[10px] text-gray-500 font-semibold">
                          Ha
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* TOMBOL LIHAT DETAIL (KEMBALI KE BAWAH) */}
                <button
                  onClick={() => setShowModalMineral(true)}
                  className="mt-auto w-full flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-green-700 hover:bg-green-800 py-2.5 rounded-lg transition-colors shadow-sm active:scale-[0.98]"
                >
                  Lihat Detail Lahan Mineral{" "}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* --- BAGIAN 2: LAHAN GAMBUT (WARNA MERAH) --- */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group h-full flex flex-col">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B5302D] opacity-80" />

                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-50 p-2.5 rounded-lg text-[#B5302D]">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-extrabold text-gray-900 uppercase tracking-wide">
                      Lahan Gambut
                    </h4>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                      Area rawa & konservasi
                    </p>
                  </div>
                </div>

                {!lahanData.lahan_gambut ||
                lahanData.lahan_gambut.length === 0 ? (
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 text-center mb-4">
                    <p className="text-[11px] text-gray-500 font-medium">
                      Tidak ada data lahan gambut.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">
                        Jumlah Unit
                      </p>
                      <p className="text-sm font-black text-gray-900 mt-0.5">
                        {lahanData.lahan_gambut.length}{" "}
                        <span className="text-[10px] text-gray-500 font-semibold">
                          Blok
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">
                        Total Luas
                      </p>
                      <p className="text-sm font-black text-[#B5302D] mt-0.5">
                        {lahanData.lahan_gambut
                          .reduce(
                            (sum, item) =>
                              sum + (item.luas_total_diajukan || 0),
                            0,
                          )
                          .toFixed(2)}{" "}
                        <span className="text-[10px] text-gray-500 font-semibold">
                          Ha
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* TOMBOL LIHAT DETAIL (KEMBALI KE BAWAH) */}
                <button
                  onClick={() => setShowModalGambut(true)}
                  className="mt-auto w-full flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#B5302D] hover:bg-[#9a2826] py-2.5 rounded-lg transition-colors shadow-sm active:scale-[0.98]"
                >
                  Lihat Detail Lahan Gambut <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* FITUR 2: Monitoring Sertifikasi ISPO (DINAMIS SESUAI BE MAHAR) */}
        <Card
          title="Monitoring Sertifikasi ISPO"
          icon={Award}
          footer={
            <button
              onClick={() => navigate("/petani/pantauISPO")}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#EF8523] border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm"
            >
              Lihat Rincian &rarr;
            </button>
          }
        >
          <div className="flex flex-col h-full justify-between">
            <div className="flex flex-wrap sm:flex-nowrap justify-center gap-y-3 gap-x-1 sm:gap-2 py-2 sm:py-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className="flex flex-col items-center w-[30%] sm:flex-1"
                >
                  <div className="relative w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center bg-white rounded-full shadow-sm ring-1 ring-black/5 p-1.5 sm:p-2">
                    {/* --- SVG LINGKARAN PROGRES ULTRA-TIPIS & ELEGAN (MENERIMA REVISI) --- */}
                    <svg
                      viewBox="0 0 36 36"
                      className="absolute top-0 left-0 w-full h-full transform -rotate-90"
                    >
                      {/* Definisi Gradien Linier Merah Halus */}
                      <defs>
                        <linearGradient
                          id={`ispoGradient-elegant-${num}`}
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#FF7875" />{" "}
                          {/* Merah Terang */}
                          <stop offset="100%" stopColor="#B5302D" />{" "}
                          {/* Merah Tua */}
                        </linearGradient>
                      </defs>

                      {/* Lingkaran Track (Abu-abu Pudar Ultra-Tipis) */}
                      <path
                        className="text-gray-100"
                        stroke="currentColor"
                        strokeWidth="1"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />

                      {/* Lingkaran Progres Dinamis Merah-Merah (Garis Ultra-Tipis) */}
                      <path
                        stroke={`url(#ispoGradient-elegant-${num})`}
                        strokeWidth="1.5"
                        strokeDasharray={`${ispoProgress[num]}, 100`}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-1000 ease-in-out"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>

                    {/* (SESUAI BE MAHAR) Menampilkan Teks Persentase Kecil & Elegan di Tengah */}
                    <div className="relative z-10 flex flex-col items-center">
                      <span className="text-lg sm:text-xl font-semibold text-[#B5302D] leading-none">
                        {ispoProgress[num]}%
                      </span>
                      <p className="text-[7px] sm:text-[8px] font-medium text-gray-400 mt-0.5 uppercase tracking-tighter">
                        Progres
                      </p>
                    </div>
                  </div>
                  <p className="text-[9px] sm:text-[11px] font-bold text-gray-500 mt-2 text-center uppercase tracking-tighter">
                    Prinsip {num}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* FITUR 3: Rencana Kegiatan */}
        <Card
          title="Daftar Kegiatan Kerja Hari Ini"
          icon={ClipboardList}
          footer={
            <button
              onClick={() => setShowPopupRencana(true)}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#EF8523] border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm"
            >
              Tambah Kegiatan &rarr;
            </button>
          }
        >
          {isLoadingRencana ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : rencanaHariIni.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
              <Calendar size={32} className="opacity-20" />
              <p className="text-xs text-center">
                Tidak ada rencana kerja untuk hari ini.
              </p>
              <button
                onClick={() => setShowPopupRencana(true)}
                className="text-[10px] text-[#EF8523] font-bold underline cursor-pointer"
              >
                Buat rencana sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-3 pb-2">
              {rencanaHariIni.map((item) => {
                // Ambil status dengan pengecekan ganda
                const statusReal =
                  item.status_kegiatan || item.status || "TERJADWAL";
                const isSelesai = statusReal.toUpperCase() === "SELESAI";
                const displayDeskripsi =
                  item.deskripsi_singkat || item.kegiatan_kerja || "-";
                const displayTanggal = item.tanggal || item.tanggal_kerja || "";

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border flex flex-col group transition-all duration-200 ${
                      isSelesai
                        ? "bg-green-50 border-green-100 opacity-80"
                        : "bg-gray-50 border-gray-100 hover:border-[#EF8523]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <div className="flex items-start gap-2 overflow-hidden">
                        <button
                          onClick={() =>
                            handleToggleStatus(item.id, statusReal)
                          }
                          className={`mt-0.5 flex-shrink-0 transition-colors ${
                            isSelesai
                              ? "text-green-600"
                              : "text-gray-300 hover:text-[#EF8523]"
                          }`}
                        >
                          {isSelesai ? (
                            <CheckCircle size={18} />
                          ) : (
                            <Circle size={18} />
                          )}
                        </button>

                        <div className="flex flex-col">
                          <p
                            className={`font-bold text-[13px] text-gray-800 ${
                              isSelesai ? "line-through text-gray-500" : ""
                            }`}
                          >
                            {item.judul_kegiatan}
                          </p>
                          <p className="text-[11px] text-gray-500 break-words line-clamp-2">
                            {displayDeskripsi}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                            isSelesai
                              ? "text-green-600 bg-green-100 border-green-200"
                              : "text-[#EF8523] bg-orange-50 border-orange-100"
                          }`}
                        >
                          {displayTanggal}
                        </span>

                        <button
                          onClick={() => handleDeleteRencana(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* FITUR 4: Riwayat Penjualan */}
        <Card
          title="Riwayat Penjualan TBS (Selesai)"
          icon={TrendingUp}
          footer={
            <button
              onClick={() => navigate("/petani/riwayatpenjualan")}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#EF8523] border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm"
            >
              Lihat Semua &rarr;
            </button>
          }
        >
          <div className="flex flex-col h-full relative">
            <div className="space-y-4 flex-grow">
              {isLoadingRiwayatMini ? (
                <div className="h-full flex items-center justify-center text-gray-400 min-h-[150px]">
                  <Loader2 className="w-8 h-8 animate-spin text-[#EF8523]" />
                </div>
              ) : riwayatPenjualanMini.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-gray-200 min-h-[150px]">
                  <p className="text-xs">
                    Belum ada riwayat penjualan selesai.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pb-4">
                  {riwayatPenjualanMini.map((item) => {
                    // KODE YANG BARU
                    const tglPemeriksaan = item.pemeriksaan?.created_at
                      ? new Date(
                          item.pemeriksaan.created_at,
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-";

                    const beratNetto =
                      item.pemeriksaan?.final_weigh ||
                      item.pemeriksaan?.netto ||
                      0;
                    const totalHarga = item.pemeriksaan?.harga_final || 0;

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-[16px] border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow relative overflow-hidden group"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                              Pabrik Tujuan
                            </p>
                            <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-1 pr-2">
                              {item.alamat_pengiriman_pabrik}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-bold border flex items-center gap-1 shrink-0 bg-green-50 text-green-700 border-green-100">
                            <CheckCircle2 className="w-3 h-3" />
                            Selesai
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                          <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">
                              Tgl Ditimbang
                            </p>
                            <p className="text-[11px] font-medium text-gray-700 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-gray-400" />{" "}
                              {tglPemeriksaan}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">
                              Netto & Total
                            </p>
                            <div className="text-[11px] mt-0.5 flex flex-col gap-0.5">
                              <p className="font-bold text-gray-700">
                                {beratNetto.toLocaleString("id-ID")} Kg
                              </p>
                              <p className="font-bold text-green-600">
                                Rp {totalHarga.toLocaleString("id-ID")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* FITUR 5: Harga TBS - SCROLLABLE VERSION */}
        <Card title="Harga TBS Sesuai Aturan Pemerintah" icon={Coins}>
          <div className="relative h-full flex flex-col pt-2 w-full">
            <div className="flex justify-between items-center mb-4 px-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-400 bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1 animate-pulse">
                  <span className="text-xs">↔</span> Geser grafik
                </span>
              </div>

              {/* Dropdown Filter Tahun Dinamis */}
              <select
                value={tahunTbs}
                onChange={(e) => setTahunTbs(parseInt(e.target.value))}
                className="bg-orange-50 border border-orange-200 text-[#EF8523] px-2 py-1 rounded-lg text-[10px] font-black shadow-sm outline-none cursor-pointer"
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* State Handling: Loading, Empty, atau Tampilkan SVG */}
            {isLoadingHargaTbs ? (
              <div className="flex-1 min-h-[180px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#EF8523]" />
              </div>
            ) : hargaTbsData.length === 0 ? (
              <div className="flex-1 min-h-[180px] flex items-center justify-center text-gray-400 text-xs font-medium italic">
                Belum ada riwayat harga TBS untuk tahun ini.
              </div>
            ) : (
              (() => {
                const dataBE = hargaTbsData;
                const hargaTertinggi = Math.max(
                  ...dataBE.map((d) => d.harga || 0),
                );
                const maxHarga = Math.max(4000, hargaTertinggi + 500);
                const svgHeight = 140;

                const yLabels = [
                  `${(maxHarga / 1000).toFixed(1)}k`,
                  `${((maxHarga * 0.75) / 1000).toFixed(1)}k`,
                  `${((maxHarga * 0.5) / 1000).toFixed(1)}k`,
                  `${((maxHarga * 0.25) / 1000).toFixed(1)}k`,
                  "0",
                ];

                const minWidthPerPoint = 70;
                const svgWidth = Math.max(
                  dataBE.length * minWidthPerPoint,
                  500,
                );
                const paddingX = 40;
                const effectiveWidth = svgWidth - paddingX * 2;

                const points = dataBE.map((d, i) => {
                  const divider = dataBE.length > 1 ? dataBE.length - 1 : 1;
                  const x = paddingX + (i / divider) * effectiveWidth;
                  const y = svgHeight - (d.harga / maxHarga) * svgHeight;
                  return { x, y, harga: d.harga, bulan: d.bulan };
                });

                const linePath = points.map((p) => `${p.x},${p.y}`).join(" ");
                const areaPath = `M ${points[0].x},${svgHeight} ${linePath} ${points[points.length - 1].x},${svgHeight} Z`;

                return (
                  <div className="flex flex-1 w-full min-h-[180px] relative overflow-hidden">
                    {/* SUMBU Y FIXED */}
                    <div className="absolute left-0 top-0 bottom-8 w-10 z-10 bg-white/95 flex flex-col justify-between text-[9px] text-gray-400 font-bold border-r border-gray-100 shadow-sm">
                      {yLabels.map((l, idx) => (
                        <span key={idx} className="text-right pr-2">
                          {l.replace(".0k", "k")}
                        </span>
                      ))}
                    </div>

                    {/* AREA GRAFIK SCROLLABLE */}
                    <div className="flex-1 overflow-x-auto pl-10 pb-2 scrollbar-thin">
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
                              id="mandorGradient"
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
                          {/* Garis Grid */}
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
                          <path d={areaPath} fill="url(#mandorGradient)" />
                          <polyline
                            fill="none"
                            stroke="#EF8523"
                            strokeWidth="3"
                            points={linePath}
                            strokeLinejoin="round"
                          />
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
                        {/* Label Bulan */}
                        <div className="absolute bottom-0 left-0 w-full h-6">
                          {points.map((pt, i) => (
                            <div
                              key={i}
                              className="absolute flex flex-col items-center"
                              style={{
                                left: `${pt.x}px`,
                                transform: "translateX(-50%)",
                              }}
                            >
                              <div className="w-1 h-1 bg-gray-300 rounded-full mb-1"></div>
                              <span className="text-[9px] font-bold text-gray-500 uppercase">
                                {pt.bulan.substring(0, 3)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}

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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="w-full max-w-3xl h-[85vh] rounded-3xl animate-fade-in-up flex relative">
            <DataDiriMandor
              onClose={() => setShowPopupDataDiri(false)}
              onSave={handleProfileSaved}
              initialData={profile}
              lockedFields={lockedFieldsConfig}
            />
          </div>
        </div>
      )}

      {/* --- POPUP TAMBAH RENCANA (DINAMIS FORM) --- */}
      {showPopupRencana && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
            {/* --- Header Modal --- */}
            <div className="bg-[#EF8523] px-6 py-4 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Calendar className="w-5 h-5 text-white" />{" "}
                  {/* Tambahkan import Calendar jika belum ada */}
                </div>
                <h3 className="text-white font-bold text-lg tracking-wide">
                  Tambah Rencana
                </h3>
              </div>
              <button
                onClick={() => setShowPopupRencana(false)}
                className="relative z-10 p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* --- Body Form --- */}
            <div className="p-6 sm:p-8 space-y-5 bg-gray-50/30">
              {/* Field: Nama Kegiatan */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider ml-1">
                  Nama Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Beli Pupuk NPK / Pemupukan Lahan"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 outline-none text-gray-900 text-sm font-medium focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all shadow-sm placeholder-gray-300"
                  value={newRencana.judul_kegiatan}
                  onChange={(e) =>
                    setNewRencana({
                      ...newRencana,
                      judul_kegiatan: e.target.value,
                    })
                  }
                />
              </div>

              {/* Field: Tanggal Pelaksanaan */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider ml-1">
                  Tanggal Pelaksanaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 outline-none text-gray-900 text-sm font-medium focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all shadow-sm"
                  value={newRencana.tanggal_kerja}
                  onChange={(e) =>
                    setNewRencana({
                      ...newRencana,
                      tanggal_kerja: e.target.value,
                    })
                  }
                />
              </div>

              {/* Field: Deskripsi */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider ml-1 flex items-center justify-between">
                  <span>Deskripsi Detail</span>
                  <span className="text-[9px] font-medium text-gray-400 normal-case">
                    (Opsional)
                  </span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Tuliskan rincian kegiatan di sini..."
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 outline-none text-gray-900 text-sm font-medium resize-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all shadow-sm placeholder-gray-300"
                  value={newRencana.kegiatan_kerja}
                  onChange={(e) =>
                    setNewRencana({
                      ...newRencana,
                      kegiatan_kerja: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* --- Footer Action Buttons --- */}
            <div className="p-6 pt-0 bg-gray-50/30 flex gap-3">
              <button
                onClick={() => setShowPopupRencana(false)}
                className="flex-1 py-3.5 rounded-xl bg-white border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors text-sm shadow-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSaveRencana}
                className="flex-1 py-3.5 rounded-xl bg-[#B5302D] font-bold text-white hover:bg-red-800 transition-all shadow-md shadow-red-200 text-sm flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Simpan Rencana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* POPUP: MODAL LAHAN MINERAL */}
      {/* ======================================================= */}
      {showModalMineral && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="w-full max-w-2xl bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header Modal */}
            <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 flex justify-between items-center relative">
              <div className="flex items-center gap-3">
                {selectedMineralIndex !== null ? (
                  <button
                    onClick={() => setSelectedMineralIndex(null)}
                    className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 transition shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="bg-orange-100 p-2.5 rounded-xl text-[#EF8523]">
                    <Layers className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-[#EF8523] font-black text-lg">
                    {selectedMineralIndex !== null
                      ? "Rincian Batch Lahan"
                      : "Daftar Lahan Mineral"}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {selectedMineralIndex !== null
                      ? "Spesifikasi penggunaan tanah"
                      : "Pilih salah satu batch untuk melihat detail"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModalMineral(false);
                  setSelectedMineralIndex(null);
                }}
                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">
              {selectedMineralIndex === null ? (
                // DAFTAR LIST MINERAL
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                  {lahanData.lahan_mineral?.detail_batch?.map((batch, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedMineralIndex(idx)}
                      className="cursor-pointer group flex flex-col p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#EF8523] hover:shadow-md transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#EF8523] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-800 text-sm sm:text-base group-hover:text-[#EF8523]">
                          {batch.nama_lahan_mineral}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#EF8523]" />
                      </div>
                      <BadgeSengketa isSengketa={batch.ada_sengketa} />
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-end">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Luas Lahan
                        </p>
                        <p className="text-sm font-black text-gray-900">
                          {batch.luas_batch}{" "}
                          <span className="text-[10px] text-gray-500 font-semibold">
                            Ha
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // DETAIL SPESIFIK MINERAL
                <div className="bg-orange-50/40 p-5 rounded-2xl border border-orange-100 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-5 border-b border-orange-200/60 pb-4">
                    <div>
                      <p className="text-xs font-bold text-[#EF8523] uppercase tracking-wider mb-1">
                        Nama Lahan
                      </p>
                      <h4 className="text-lg font-black text-gray-900">
                        {
                          lahanData.lahan_mineral.detail_batch[
                            selectedMineralIndex
                          ]?.nama_lahan_mineral
                        }
                      </h4>
                    </div>
                    <BadgeSengketa
                      isSengketa={
                        lahanData.lahan_mineral.detail_batch[
                          selectedMineralIndex
                        ]?.ada_sengketa
                      }
                    />
                  </div>

                  {/* KOTAK STATUS LUAS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-orange-100/50 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                        Total Luas Batch
                      </p>
                      <p className="text-base font-black text-gray-900">
                        {
                          lahanData.lahan_mineral.detail_batch[
                            selectedMineralIndex
                          ]?.luas_batch
                        }{" "}
                        Ha
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-orange-100/50 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                        Status Penggunaan
                      </p>
                      <p className="text-base font-black text-gray-900">
                        {
                          lahanData.lahan_mineral.detail_batch[
                            selectedMineralIndex
                          ]?.status_label
                        }
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                      <p className="text-[10px] font-bold text-green-600 uppercase mb-1">
                        Luas Terpakai
                      </p>
                      <p className="text-base font-black text-green-600">
                        {
                          lahanData.lahan_mineral.detail_batch[
                            selectedMineralIndex
                          ]?.luas_terpakai
                        }{" "}
                        Ha
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm">
                      <p className="text-[10px] font-bold text-orange-500 uppercase mb-1">
                        Sisa Lahan Kosong
                      </p>
                      <p className="text-base font-black text-orange-600">
                        {
                          lahanData.lahan_mineral.detail_batch[
                            selectedMineralIndex
                          ]?.luas_sisa
                        }{" "}
                        Ha
                      </p>
                    </div>
                  </div>

                  {/* ========================================= */}
                  {/* DOKUMEN LAHAN MINERAL (FIX SESUAI LOG BE) */}
                  {/* ========================================= */}
                  <div className="mt-5 pt-5 border-t border-orange-200/60">
                    <h5 className="text-[11px] font-extrabold text-[#EF8523] uppercase tracking-wider mb-3">
                      Dokumen Pendukung Lahan
                    </h5>

                    {(() => {
                      // KUNCI PERBAIKAN: Gunakan key 'dokumen' sesuai Log BE Anda
                      const batchDocs = lahanData.lahan_mineral.detail_batch[selectedMineralIndex]?.dokumen || [];
                      const parentDocs = lahanData.lahan_mineral.dokumen || [];
                      
                      // Gabungkan dokumen dari Batch dan Induk
                      const combinedDocs = [...batchDocs, ...parentDocs];

                      if (combinedDocs.length === 0) {
                        return (
                          <div className="bg-white/60 border border-dashed border-orange-200 rounded-xl p-4 text-center">
                            <p className="text-[11px] text-orange-600/70 font-bold">
                              Tidak ada dokumen pendukung yang dilampirkan.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {combinedDocs.map((doc, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-white rounded-xl border border-orange-100 shadow-sm hover:border-[#EF8523] transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 rounded-lg text-[#EF8523]">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
                                    {doc.tipe_dokumen?.replace(/_/g, " ") || "DOKUMEN"}
                                  </p>
                                  <p className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-0.5">
                                    {doc.judul_dokumen || "Lampiran Lahan"}
                                  </p>
                                </div>
                              </div>

                              {/* KUNCI PERBAIKAN: Gunakan url_penyimpanan sesuai Log BE */}
                              {doc.url_penyimpanan ? (
                                <a
                                  href={getFileUrl(doc.url_penyimpanan, "FARM")}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                              ) : (
                                <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded shrink-0">
                                  Kosong
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* --- TAMBAHAN LOGIKA SENGKETA MINERAL --- */}
                  {lahanData.lahan_mineral.detail_batch[selectedMineralIndex]
                    ?.ada_sengketa && (
                    <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
                      <div>
                        <h4 className="font-extrabold text-red-800 text-sm flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          Lahan Dalam Status Sengketa!
                        </h4>
                        <p className="text-[11px] sm:text-xs text-red-600/90 mt-1 leading-relaxed max-w-lg">
                          Lahan ini tidak dapat digunakan maksimal dan terhambat
                          proses ISPO. Silakan unggah dokumen progres (Peta
                          Konflik/Mediasi) atau selesaikan sengketa.
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/petani/manajemensengketa`)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-transform active:scale-95 whitespace-nowrap"
                      >
                        Kelola Sengketa &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => {
                  setShowModalMineral(false);
                  setSelectedMineralIndex(null);
                }}
                className="px-6 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* POPUP: MODAL LAHAN GAMBUT */}
      {/* ======================================================= */}
      {showModalGambut && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="w-full max-w-2xl bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header Modal */}
            <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 flex justify-between items-center relative">
              <div className="flex items-center gap-3">
                {selectedGambutIndex !== null ? (
                  <button
                    onClick={() => setSelectedGambutIndex(null)}
                    className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 transition shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="bg-red-100 p-2.5 rounded-xl text-[#B5302D]">
                    <Droplets className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-[#B5302D] font-black text-lg">
                    {selectedGambutIndex !== null
                      ? "Rincian Lahan Gambut"
                      : "Daftar Lahan Gambut"}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {selectedGambutIndex !== null
                      ? "Spesifikasi perizinan rawa"
                      : "Pilih salah satu area untuk melihat detail"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModalGambut(false);
                  setSelectedGambutIndex(null);
                }}
                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">
              {selectedGambutIndex === null ? (
                // DAFTAR LIST GAMBUT
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                  {lahanData.lahan_gambut?.map((g, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedGambutIndex(idx)}
                      className="cursor-pointer group flex flex-col p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#B5302D] hover:shadow-md transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#B5302D] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-800 text-sm sm:text-base group-hover:text-[#B5302D]">
                          {g.nama_lahan_gambut}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#B5302D]" />
                      </div>
                      <BadgeSengketa isSengketa={g.ada_sengketa} />
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-end">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Luas Lahan
                        </p>
                        <p className="text-sm font-black text-[#B5302D]">
                          {g.luas_total_diajukan}{" "}
                          <span className="text-[10px] text-gray-500 font-semibold">
                            Ha
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // DETAIL SPESIFIK GAMBUT
                <div className="bg-red-50/40 p-5 rounded-2xl border border-red-100 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-5 border-b border-red-200/60 pb-4">
                    <div>
                      <p className="text-xs font-bold text-[#B5302D] uppercase tracking-wider mb-1">
                        Nama Area
                      </p>
                      <h4 className="text-lg font-black text-gray-900">
                        {
                          lahanData.lahan_gambut[selectedGambutIndex]
                            ?.nama_lahan_gambut
                        }
                      </h4>
                    </div>
                    <BadgeSengketa
                      isSengketa={
                        lahanData.lahan_gambut[selectedGambutIndex]
                          ?.ada_sengketa
                      }
                    />
                  </div>

                  {/* KOTAK STATUS LUAS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-red-100/50 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                        Tahun Buka Lahan
                      </p>
                      <p className="text-base font-black text-gray-900">
                        {
                          lahanData.lahan_gambut[selectedGambutIndex]
                            ?.tahun_buka_lahan
                        }
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                      <p className="text-[10px] font-bold text-green-600 uppercase mb-1">
                        Luas Boleh Ditanam
                      </p>
                      <p className="text-base font-black text-green-600">
                        {
                          lahanData.lahan_gambut[selectedGambutIndex]
                            ?.luas_total_boleh_ditanam
                        }{" "}
                        Ha
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                      <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">
                        Area Konservasi
                      </p>
                      <p className="text-base font-black text-blue-600">
                        {
                          lahanData.lahan_gambut[selectedGambutIndex]
                            ?.luas_total_konservasi
                        }{" "}
                        Ha
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm">
                      <p className="text-[10px] font-bold text-orange-500 uppercase mb-1">
                        Lahan Belum Dipakai
                      </p>
                      <p className="text-base font-black text-orange-600">
                        {
                          lahanData.lahan_gambut[selectedGambutIndex]
                            ?.lahan_tidak_digunakan_gambut
                        }{" "}
                        Ha
                      </p>
                    </div>
                  </div>

                  {/* ========================================= */}
                  {/* DOKUMEN LAHAN GAMBUT (FIX SESUAI LOG BE)  */}
                  {/* ========================================= */}
                  <div className="mt-5 pt-5 border-t border-red-200/60">
                    <h5 className="text-[11px] font-extrabold text-[#B5302D] uppercase tracking-wider mb-3">
                      Dokumen Pendukung Lahan
                    </h5>

                    {(() => {
                      // KUNCI PERBAIKAN: Gunakan key 'dokumen' sesuai Log BE
                      const dokumenList = lahanData.lahan_gambut[selectedGambutIndex]?.dokumen || [];

                      if (dokumenList.length === 0) {
                        return (
                          <div className="bg-white/60 border border-dashed border-red-200 rounded-xl p-4 text-center">
                            <p className="text-[11px] text-red-600/70 font-bold">
                              Tidak ada dokumen pendukung yang dilampirkan.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {dokumenList.map((doc, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-white rounded-xl border border-red-100 shadow-sm hover:border-[#B5302D] transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 rounded-lg text-[#B5302D]">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
                                    {doc.tipe_dokumen?.replace(/_/g, " ") || "DOKUMEN"}
                                  </p>
                                  <p className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-0.5">
                                    {doc.judul_dokumen || "Lampiran Lahan"}
                                  </p>
                                </div>
                              </div>

                              {/* KUNCI PERBAIKAN: Gunakan url_penyimpanan sesuai Log BE */}
                              {doc.url_penyimpanan ? (
                                <a
                                  href={getFileUrl(doc.url_penyimpanan, "FARM")}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                              ) : (
                                <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded shrink-0">
                                  Kosong
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* --- TAMBAHAN LOGIKA SENGKETA GAMBUT --- */}
                  {lahanData.lahan_gambut[selectedGambutIndex]
                    ?.ada_sengketa && (
                    <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
                      <div>
                        <h4 className="font-extrabold text-red-800 text-sm flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          Area Dalam Status Sengketa!
                        </h4>
                        <p className="text-[11px] sm:text-xs text-red-600/90 mt-1 leading-relaxed max-w-lg">
                          Area gambut ini sedang bermasalah. Anda wajib
                          melaporkan progres mediasi atau mengunggah berita
                          acara penyelesaian agar data diteruskan ke pusat.
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/petani/manajemensengketa`)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-transform active:scale-95 whitespace-nowrap"
                      >
                        Tindak Lanjuti &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => {
                  setShowModalGambut(false);
                  setSelectedGambutIndex(null);
                }}
                className="px-6 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
