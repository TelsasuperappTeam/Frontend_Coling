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
} from "lucide-react";

// --- Komponen Card Reusable ---
const Card = ({ title, icon: Icon, children, rightContent }) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col h-full overflow-hidden">
    <div className="bg-[#EF8523] px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center flex-shrink-0">
      <div className="flex items-center gap-3">
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

    {/* Content Body */}
    <div className="p-4 sm:p-5 text-gray-800 bg-white h-64 sm:h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
      {children}
    </div>
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

  // --- State Widget Lain (Dummy: Penjualan) ---
  const [riwayatPenjualan, setRiwayatPenjualan] = useState([]);
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

    // Data dummy untuk fitur Riwayat Penjualan (Sementara/Static)
    setRiwayatPenjualan([
      { tanggal: "2023-10-20", berat: 1500, total: 3750000 },
      { tanggal: "2023-10-18", berat: 2100, total: 5355000 },
    ]);
  }, [fetchRencanaKerja, fetchIspoProgress]);

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
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        
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
  }, [profile.kebun_id, tahunTbs]); // <-- Dependency Logic untuk Mandor

  // -----------------------------------------------------------------------------
  // FUNGSI: Menambah Rencana Kerja Manual (POST)
  // (SESUAI BE MAHAR) - Mengirim payload kegiatan baru ke server
  // -----------------------------------------------------------------------------
  const handleSaveRencana = async () => {
    if (!newRencana.judul_kegiatan || !newRencana.tanggal_kerja) {
      alert("Judul dan Tanggal wajib diisi!");
      return;
    }

    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      // (SESUAI BE MAHAR) Request POST ke endpoint ADD
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

      if (!response.ok) throw new Error("Gagal menambah rencana");

      setShowPopupRencana(false);

      // Reset form ke default
      setNewRencana({
        judul_kegiatan: "",
        tanggal_kerja: getTodayDateString(),
        kegiatan_kerja: "",
      });

      // (SESUAI BE MAHAR) Refresh data list setelah penyimpanan berhasil
      fetchRencanaKerja();
    } catch (error) {
      console.error("Error saving rencana:", error);
      alert("Terjadi kesalahan saat menyimpan rencana.");
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

      // (SESUAI BE MAHAR) Endpoint update status dengan query param
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

      // Refresh list
      fetchRencanaKerja();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // -----------------------------------------------------------------------------
  // FUNGSI: Hapus Rencana Kerja (DELETE)
  // (SESUAI BE MAHAR) - Menghapus kegiatan spesifik berdasarkan ID
  // -----------------------------------------------------------------------------
  const handleDeleteRencana = async (id) => {
    if (!window.confirm("Yakin ingin menghapus kegiatan ini?")) return;

    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      // (SESUAI BE MAHAR) Request DELETE
      const response = await fetch(
        API_ENDPOINTS.FARM.PETANI.RENCANA_KERJA.DELETE(id),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Gagal menghapus");

      fetchRencanaKerja();
    } catch (error) {
      console.error("Error deleting rencana:", error);
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

  const currentGambut =
    selectedGambutIndex !== null
      ? lahanData.lahan_gambut[selectedGambutIndex]
      : null;

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
              className="bg-white/20 backdrop-blur-md text-black/80 border border-white/50 rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold hover:bg-white hover:text-[#EF8523] transition-all duration-300"
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

              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 w-full text-white">
                <div className="space-y-1">
                  <DataRow label="Nama Lengkap" value={profile.nama_lengkap} />
                  <DataRow label="Role" value={profile.role} />
                </div>
                <div className="space-y-1">
                  <DataRow label="Nomor Telepon" value={profile.nomor_hp} />
                  <DataRow label="Email" value={profile.email} />
                </div>
                <div className="space-y-1">
                  <DataRow
                    label="Relasi Kebun"
                    value={profile.nama_kebun_naungan}
                  />
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
        Dashboard Fitur Utama Mandor
      </h2>

      {/* --- SECTION 2: WIDGETS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* FITUR 1: Luas Lahan */}
        <Card
          title="Luas Lahan (Mineral & Gambut)"
          icon={Map}
          rightContent={
            <button
              onClick={() => navigate("/petani/luaslahan")}
              className="bg-white hover:bg-[#B5302D] text-black hover:text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all shadow-sm"
            >
              Tambah/Perbarui Lahan
            </button>
          }
        >
          <div className="space-y-4">
            {/* Bagian Lahan Mineral */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-bold text-[#B5302D] uppercase">
                  Lahan Mineral
                </p>
                {lahanData.lahan_mineral && (
                  <BadgeSengketa
                    isSengketa={lahanData.lahan_mineral.ada_sengketa}
                  />
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span>
                  Total:{" "}
                  <b>
                    {lahanData.lahan_mineral
                      ? lahanData.lahan_mineral.luas_total_lahan_mineral
                      : 0}{" "}
                    ha
                  </b>
                </span>
                <span className="text-green-600 font-bold">
                  Digunakan:{" "}
                  {lahanData.lahan_mineral
                    ? lahanData.lahan_mineral.lahan_digunakan_mineral
                    : 0}{" "}
                  ha
                </span>
              </div>
            </div>

            {/* Bagian Lahan Gambut */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-bold text-[#B5302D] uppercase">
                  Lahan Gambut
                </p>
                {selectedGambutIndex !== null && (
                  <button
                    onClick={() => setSelectedGambutIndex(null)}
                    className="text-[10px] font-bold text-blue-600 hover:underline"
                  >
                    ← Kembali
                  </button>
                )}
              </div>

              {lahanData.lahan_gambut && lahanData.lahan_gambut.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-2">
                  Tidak ada data lahan gambut.
                </p>
              ) : selectedGambutIndex === null ? (
                <div className="space-y-2">
                  {lahanData.lahan_gambut.map((g, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedGambutIndex(idx)}
                      className="cursor-pointer p-2 bg-white border border-gray-100 rounded-lg hover:border-[#EF8523] text-xs flex justify-between items-center"
                    >
                      <div className="flex flex-col">
                        <span>{g.nama_lahan_gambut}</span>
                        <BadgeSengketa isSengketa={g.ada_sengketa} />
                      </div>
                      <span className="font-bold">
                        {g.luas_total_diajukan} ha
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs space-y-2 bg-white p-3 rounded-lg border border-orange-100">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-gray-800">
                      {currentGambut.nama_lahan_gambut}
                    </p>
                    <BadgeSengketa isSengketa={currentGambut.ada_sengketa} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-600">
                    <p>Thn Buka: {currentGambut.tahun_buka_lahan}</p>
                    <p>Konservasi: {currentGambut.luas_total_konservasi} ha</p>
                    <p>
                      Boleh Tanam: {currentGambut.luas_total_boleh_ditanam} ha
                    </p>
                    <p>Sisa: {currentGambut.lahan_tidak_digunakan_gambut} ha</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* FITUR 2: Monitoring Sertifikasi ISPO (DINAMIS SESUAI BE MAHAR) */}
        <Card title="Monitoring Sertifikasi ISPO" icon={Award}>
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
            <button
              onClick={() => navigate("/petani/pantauISPO")}
              className="w-full bg-[#B5302D] hover:bg-[#B5302D]/80 text-white py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-xs font-bold uppercase transition-all shadow-sm"
            >
              Lihat Lebih Detail
            </button>
          </div>
        </Card>

        {/* FITUR 3: Rencana Kegiatan */}
        <Card
          title="Daftar Kegiatan Kerja Hari Ini"
          icon={ClipboardList}
          rightContent={
            <button
              onClick={() => setShowPopupRencana(true)}
              className="bg-white hover:bg-[#B5302D] text-black hover:text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all shadow-sm flex items-center gap-1"
            >
              <Plus size={12} /> Tambah Kegiatan
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
          title="Riwayat Penjualan"
          icon={TrendingUp}
          rightContent={
            <button
              onClick={() => navigate("/petani/riwayatpenjualan")}
              className="bg-white hover:bg-[#B5302D] text-black hover:text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all shadow-sm"
            >
              Lihat Detail
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-[10px] text-gray-400 uppercase font-bold">
                  <th className="pb-3">Tanggal</th>
                  <th className="pb-3">Berat (kg)</th>
                  <th className="pb-3 text-right">Total (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {riwayatPenjualan.slice(0, 5).map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 text-gray-600">{r.tanggal}</td>
                    <td className="py-3 font-semibold">
                      {r.berat.toLocaleString()} kg
                    </td>
                    <td className="py-3 text-right font-bold text-green-600">
                      Rp {r.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-[#EF8523] px-6 py-4 flex justify-between items-center text-black font-bold">
              <h3>Tambah Rencana Kegiatan</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Nama Kegiatan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Beli Pupuk NPK"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-black focus:border-[#EF8523] transition-colors"
                  value={newRencana.judul_kegiatan}
                  onChange={(e) =>
                    setNewRencana({
                      ...newRencana,
                      judul_kegiatan: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Tanggal Pelaksanaan
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-black focus:border-[#EF8523] transition-colors"
                  value={newRencana.tanggal_kerja}
                  onChange={(e) =>
                    setNewRencana({
                      ...newRencana,
                      tanggal_kerja: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Deskripsi Detail
                </label>
                <textarea
                  rows="3"
                  placeholder="Contoh: Beli 2 sak di toko Pak Budi..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-black resize-none focus:border-[#EF8523] transition-colors"
                  value={newRencana.kegiatan_kerja}
                  onChange={(e) =>
                    setNewRencana({
                      ...newRencana,
                      kegiatan_kerja: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPopupRencana(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveRencana}
                  className="flex-1 py-3 rounded-xl bg-[#B5302D] font-bold text-white hover:bg-black transition-all shadow-md"
                >
                  Simpan Rencana
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
