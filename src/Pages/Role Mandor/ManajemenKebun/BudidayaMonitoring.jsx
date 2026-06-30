import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Activity,
  Info,
  ClipboardCheck,
  Leaf,
  Grid2X2,
  Sprout,
  Map,
  RefreshCw,
  History,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DetailRencanaTanam from "./DetailRencanaTanam";
import { API_ENDPOINTS, API_BASE_URLS } from "../../../config/constants";
import { showToast, confirmDialog } from "../../../utils/notif";
import Swal from "sweetalert2";

// (BE MAHARANI) Enum untuk Dropdown UI
const ENUM_DRAINASE = [
  "Field Drain",
  "Collection Drain",
  "Main Drain",
  "Outlet Drain",
  "Parit Jalan",
  "Lainnya",
];

const ENUM_TERASERING = [
  "Teras bangku",
  "Teras Tapak Kuda",
  "Teras kontur",
  "Lainnya",
];

// (BE MAHARANI) Mapping Value UI -> BE Pydantic Enum (Strict Validation)
const MAPPING_LAPISAN_MINERAL = {
  "Pasir kuarsa": "pasir_kuarsa",
  Liat: "tanah_mineral_lainnya",
  "Tanah Mineral": "tanah_mineral_lainnya",
  Lainnya: "tanah_mineral_lainnya",
};

const MAPPING_KEMATANGAN_GAMBUT = {
  Sapirik: "sapirik",
  Hemik: "hemik",
  Fibrik: "fibrik",
};

export default function BudidayaMonitoring() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openSection, setOpenSection] = useState(null);
  const [loading, setLoading] = useState(false);

  // === STATE RIWAYAT ===
  const [riwayatBlok, setRiwayatBlok] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);

  // (BE MAHARANI) State List Lahan Gambut (Data Dinamis User)
  const [listLahanGambut, setListLahanGambut] = useState([]);
  const [listLahanMineral, setListLahanMineral] = useState([]);

  // === STATE POPUP ARSIP SIKLUS ===
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [selectedBlokIdHistory, setSelectedBlokIdHistory] = useState(null);

  // --- FETCH LIST ARSIP SIKLUS UNTUK POPUP ---
  const fetchListArsipSiklus = async (blokId) => {
    setSelectedBlokIdHistory(blokId);
    setShowHistoryModal(true); // Buka popup langsung
    setLoadingHistory(true);
    setHistoryList([]); // Kosongkan data lama

    try {
      const token = localStorage.getItem("token");
      const url =
        API_ENDPOINTS.FARM.PETANI.ACTIVITY.GET_LIST_ARSIP_SIKLUS(blokId);

      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setHistoryList(data);
      }
    } catch (error) {
      console.error("Gagal mengambil list arsip:", error);
      showToast.error("Gagal memuat daftar riwayat siklus.");
    } finally {
      setLoadingHistory(false);
    }
  };

  // === STATE FORM ===
  const [formData, setFormData] = useState({
    // Catatan: lahan_id dan kebun_profile_id dihapus dari payload submit
    // karena tidak ada di Schema BE BlokLahanCreateRequest
    nama_unit: "",
    tanggal_tanam_blok: "",
    luas_unit: "",
    jumlah_tanaman_per_ha: "",
    jumlah_total_tanaman: "",

    // (BE MAHARANI) Titik Percabangan Utama
    jenis_tanah: "", // Mineral / Gambut
    sumber_lahan: [],
    jenis_lahan: "", // Datar / Miring / Konservasi

    // Bibit
    jenis_bibit: "",
    varietas_bibit_nama: "", // Wajib jika Tenera

    // Jarak Tanam
    jarak_tanam: "",
    jarak_tanam_lainnya: "",

    // Terasering & Drainase (Mapping ke field _mineral di BE)
    jenis_terasering: "",
    jenis_terasering_lainnya: "",
    jenis_drainase: "",
    jenis_drainase_lainnya: "",

    // Data Gambut dan mineral (BE MAHARANI)
    nama_lahan_gambut: "",
    id_lahan_mineral: "",
    gambut_lapisan_mineral: [],
    gambut_kematangan: [],
    // STATE BARU UNTUK KERANJANG LAHAN
    keranjang_lahan_gambut: [], // Array of: { id: string, luas_diambil: string }
    keranjang_lahan_mineral: [], // Array of: { id: string, luas_diambil: string }
  });

  // === STATE FILE ===
  const [fileTerasering, setFileTerasering] = useState(null);
  const [fileDrainase, setFileDrainase] = useState(null);

  // --- FETCH RIWAYAT ---
  const fetchRiwayat = async () => {
    setLoadingRiwayat(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        API_ENDPOINTS.FARM.PETANI.ADD_RENCANA_TANAM,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (response.ok) {
        setRiwayatBlok(data);
      }
    } catch (error) {
      console.error("Error koneksi:", error);
      showToast.error("Gagal memuat riwayat lahan. Periksa koneksi Anda.");
    } finally {
      setLoadingRiwayat(false);
    }
  };

  // (BE MAHARANI) FETCH DROPDOWN LAHAN GAMBUT (REVISI LOGIC)
  const fetchLahanUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = `${API_BASE_URLS.FARM}/farm/me/lahan`;

      console.log("[DEBUG] Fetching Lahan URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("[DEBUG] Response Lahan:", data);

      if (response.ok) {
        // (BE MAHARANI) PERBAIKAN: Mengambil array dari key 'lahan_gambut'
        if (data && Array.isArray(data.lahan_gambut)) {
          console.log("Data lahan gambut ditemukan:", data.lahan_gambut);
          setListLahanGambut(data.lahan_gambut);
        } else if (Array.isArray(data)) {
          // Fallback jika API berubah format menjadi array langsung
          setListLahanGambut(data);
        } else {
          console.warn(
            "Struktur data lahan tidak dikenali (tidak ada key lahan_gambut), set empty array.",
          );
          setListLahanGambut([]);
        }

        if (data && data.lahan_mineral) {
          // Mengambil dari detail_batch jika ada, atau langsung dari lahan_mineral jika itu array
          const mineralData =
            data.lahan_mineral.detail_batch || data.lahan_mineral;
          setListLahanMineral(Array.isArray(mineralData) ? mineralData : []);
        }
      } else {
        console.error("Gagal fetch lahan, status:", response.status);
        showToast.error("Gagal mengambil data lahan dari sistem.");
      }
    } catch (error) {
      console.error("Error fetching lahan:", error);
      showToast.error("Terjadi kesalahan jaringan saat memuat lahan.");
      setListLahanGambut([]);
    }
  };

  // STATE BARU: Menyimpan daftar bibit dari Inventaris
  const [listInventarisBibit, setListInventarisBibit] = useState([]);

  // FUNGSI BARU: Ambil data inventaris bibit saat halaman dimuat
  useEffect(() => {
    const fetchInventarisBibit = async () => {
      try {
        // PERHATIKAN: Sesuaikan endpoint '/inventaris/bibit' dengan rute aslinya di Swagger/BE kamu
        const url = API_ENDPOINTS.FARM.PETANI.INVENTARIS.GET_BIBIT;

        const response = await fetch(url, {
          headers: {
            // Sesuaikan cara kamu mengambil token (misal dari localStorage atau context)
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data inventaris bibit");
        }

        const data = await response.json();
        setListInventarisBibit(data);
      } catch (error) {
        console.error("Error fetching inventaris bibit:", error);
        showToast.error("Gagal memuat inventaris bibit.");
      }
    };

    fetchInventarisBibit();
  }, []); // Array kosong memastikan API hanya dipanggil 1x saat halaman dibuka

  // (BE MAHARANI) AUTO-CALCULATE LUAS UNIT
  // Otomatis menjumlahkan input dari keranjang lahan mineral/gambut
  useEffect(() => {
    let total = 0;
    if (formData.jenis_tanah === "Mineral") {
      total = formData.keranjang_lahan_mineral.reduce(
        (sum, item) => sum + (parseFloat(item.luas_diambil) || 0),
        0,
      );
    } else if (formData.jenis_tanah === "Gambut") {
      total = formData.keranjang_lahan_gambut.reduce(
        (sum, item) => sum + (parseFloat(item.luas_diambil) || 0),
        0,
      );
    }

    // Update State Luas Unit secara otomatis
    setFormData((prev) => {
      // Mencegah re-render yang tidak perlu jika nilainya sama
      if (prev.luas_unit !== total.toString()) {
        return { ...prev, luas_unit: total.toString() };
      }
      return prev;
    });
  }, [
    formData.keranjang_lahan_mineral,
    formData.keranjang_lahan_gambut,
    formData.jenis_tanah,
  ]);

  useEffect(() => {
    fetchRiwayat();
    fetchLahanUser();
  }, []);

  const toggleSection = (key) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  // (BE MAHARANI) Handle Input Change dengan Reset Logic
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // --- LOGIC REDIRECT JIKA LAHAN KOSONG ---
    if (name === "jenis_tanah") {
      if (value === "Gambut" && listLahanGambut.length === 0) {
        showToast.error(
          "Data inventaris Lahan Gambut kosong. Silakan tambah data lahan terlebih dahulu.",
        );
        navigate("/petani/luaslahan");
        return;
      }
      if (value === "Mineral" && listLahanMineral.length === 0) {
        showToast.error(
          "Data inventaris Lahan Mineral kosong. Silakan tambah data lahan terlebih dahulu.",
        );
        navigate("/petani/luaslahan");
        return;
      }
    }

    // --- LOGIC REDIRECT JIKA INVENTARIS BIBIT KOSONG ---
    if (name === "jenis_bibit") {
      if (listInventarisBibit.length === 0) {
        // Gunakan SweetAlert agar bisa memberi tombol shortcut ke halaman inventaris
        Swal.fire({
          icon: "warning",
          title: "Inventaris Bibit Kosong!",
          text: "Anda harus mengisi data inventaris bibit di menu Inventaris terlebih dahulu sebelum bisa menggunakannya.",
          showCancelButton: true,
          confirmButtonText: "Isi Inventaris Sekarang",
          cancelButtonText: "Tutup",
          confirmButtonColor: "#EF8523",
        }).then((result) => {
          if (result.isConfirmed) {
            // Pastikan path ini sesuai dengan rute di aplikasimu
            navigate("/petani/manajemenkebun/inventaris");
          }
        });

        return; // Hentikan eksekusi di sini agar dropdown tidak berubah dan state tetap bersih
      }
    }

    setFormData((prev) => {
      let newData = { ...prev, [name]: value };

      // Jika Jenis Tanah berubah, reset field turunannya agar payload bersih
      if (name === "jenis_tanah") {
        // PANGGIL API DI SINI, agar berlaku untuk Gambut MAUPUN Mineral
        fetchLahanUser();

        if (value === "Gambut") {
          // Reset data Mineral
          newData.jenis_lahan = "Datar"; // Default dummy untuk Gambut
          newData.jenis_terasering = "";
          newData.jenis_terasering_lainnya = "";
          newData.jenis_drainase = "";
          newData.jenis_drainase_lainnya = "";
          newData.keranjang_lahan_mineral = [];
        } else if (value === "Mineral") {
          // Reset data Gambut
          newData.nama_lahan_gambut = "";
          newData.gambut_lapisan_mineral = [];
          newData.gambut_kematangan = [];
          newData.keranjang_lahan_gambut = [];
          newData.jenis_lahan = ""; // Force user pilih ulang Datar/Miring/Konservasi
        }
      }

      return newData;
    });
  };

  const handleCheckboxGambut = (e, field) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const currentList = prev[field] || [];
      if (checked) {
        return { ...prev, [field]: [...currentList, value] };
      } else {
        return {
          ...prev,
          [field]: currentList.filter((item) => item !== value),
        };
      }
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "terasering") setFileTerasering(file);
    if (type === "drainase") setFileDrainase(file);
  };

  // --- SUBMIT DATA (CORE LOGIC) ---
  const handleSubmit = async () => {
    // Validasi Frontend Dasar
    if (!formData.nama_unit || !formData.tanggal_tanam_blok) {
      showToast.error("Mohon lengkapi data wajib (Nama Unit & Tanggal Tanam)!");
      return;
    }

    const isGambut = formData.jenis_tanah === "Gambut";
    const isMineral = formData.jenis_tanah === "Mineral";
    const isMiring = formData.jenis_lahan === "Miring";
    const isKonservasi = formData.jenis_lahan === "Konservasi";

    // Validasi Mineral: Terasering wajib jika Miring/Konservasi
    if (isMineral && (isMiring || isKonservasi) && !formData.jenis_terasering) {
      showToast.error(
        `Untuk lahan Mineral ${formData.jenis_lahan}, wajib memilih Jenis Terasering!`,
      );
      return;
    }

    // Validasi Mineral: Drainase wajib jika Konservasi
    if (isMineral && isKonservasi && !formData.jenis_drainase) {
      showToast.error(
        "Untuk lahan Mineral Konservasi, wajib memilih Jenis Drainase!",
      );
      return;
    }

    // Validasi Bibit Tenera
    if (formData.jenis_bibit === "Tenera" && !formData.varietas_bibit_nama) {
      showToast.error("Untuk bibit Tenera, Nama Varietas wajib diisi!");
      return;
    }

    // Validasi Keranjang Lahan
    let totalDiambil = 0;

    if (isMineral) {
      if (formData.keranjang_lahan_mineral.length === 0) {
        showToast.error("Wajib memilih minimal satu Lahan Mineral!");
        return;
      }
      totalDiambil = formData.keranjang_lahan_mineral.reduce(
        (sum, item) => sum + parseFloat(item.luas_diambil || 0),
        0,
      );
    } else if (isGambut) {
      if (formData.keranjang_lahan_gambut.length === 0) {
        showToast.error("Wajib memilih minimal satu Lahan Gambut!");
        return;
      }
      totalDiambil = formData.keranjang_lahan_gambut.reduce(
        (sum, item) => sum + parseFloat(item.luas_diambil || 0),
        0,
      );
    }

    // Validasi Keranjang Lahan Kosong
    if (totalDiambil <= 0) {
      showToast.error(
        "Luas Unit tidak boleh 0! Silakan centang dan masukkan luas (Ha) pada daftar lahan di bawah.",
      );
      return;
    }

    // Validasi Lanjutan Gambut
    if (isGambut) {
      if (formData.gambut_lapisan_mineral.length === 0) {
        showToast.error(
          "Untuk lahan Gambut, wajib memilih minimal satu Lapisan Mineral!",
        );
        return;
      }
      if (formData.gambut_kematangan.length === 0) {
        showToast.error("Untuk lahan Gambut, wajib memilih Kematangan Gambut!");
        return;
      }
    }

    // =========================================================
    // POPUP KONFIRMASI SEBELUM MENYIMPAN KE DATABASE
    // =========================================================
    const isSetuju = await confirmDialog({
      title: "Simpan Rencana Tanam?",
      text: "Pastikan data yang Anda isi sudah benar sebelum diteruskan.",
      confirmText: "Ya, Simpan!",
      cancelText: "Periksa Lagi",
      isDanger: false,
    });

    if (!isSetuju) {
      return;
    }

    // Jika user setuju, mulai proses loading
    setLoading(true);

    // (Opsional) Memunculkan toast loading kecil di atas
    // Anda harus memanggil showToast.dismiss() di akhir agar toast ini hilang
    showToast.loading("Sedang menyimpan data ke sistem...");

    try {
      const token = localStorage.getItem("token");
      // Siapkan Payload JSON (BE MAHARANI)
      const dataPayload = {
        nama_unit: formData.nama_unit,
        tanggal_tanam_blok: formData.tanggal_tanam_blok,
        luas_unit: parseFloat(formData.luas_unit || 0),
        jumlah_tanaman_per_ha: parseInt(formData.jumlah_tanaman_per_ha || 0),
        jumlah_total_tanaman: parseInt(formData.jumlah_total_tanaman || 0),

        jenis_tanah: formData.jenis_tanah,

        // Tetap bypass Datar jika di UI disembunyikan, BE menerima "Datar" untuk Gambut
        jenis_lahan: isGambut ? "Datar" : formData.jenis_lahan,

        // Logic Bibit
        jenis_bibit: formData.jenis_bibit,
        varietas_bibit_nama:
          formData.jenis_bibit === "Tenera"
            ? formData.varietas_bibit_nama
            : null,

        // Logic Jarak Tanam
        jarak_tanam: formData.jarak_tanam,
        jarak_tanam_lainnya:
          formData.jarak_tanam === "Lainnya"
            ? formData.jarak_tanam_lainnya
            : null,

        sumber_lahan: isMineral
          ? formData.keranjang_lahan_mineral.map((lahan) => ({
              lahan_mineral_id: parseInt(lahan.id),
              lahan_gambut_id: null,
              luas_diambil: parseFloat(lahan.luas_diambil || 0),
            }))
          : formData.keranjang_lahan_gambut.map((lahan) => ({
              lahan_mineral_id: null,
              lahan_gambut_id: parseInt(lahan.id),
              luas_diambil: parseFloat(lahan.luas_diambil || 0),
            })),

        // LOGIC MINERAL
        jenis_terasering_mineral:
          isMineral && (isMiring || isKonservasi)
            ? formData.jenis_terasering
            : null,
        jenis_terasering_mineral_lainnya:
          isMineral &&
          (isMiring || isKonservasi) &&
          formData.jenis_terasering === "Lainnya"
            ? formData.jenis_terasering_lainnya
            : null,

        jenis_drainase_mineral:
          isMineral && isKonservasi ? formData.jenis_drainase : null,
        jenis_drainase_mineral_lainnya:
          isMineral && isKonservasi && formData.jenis_drainase === "Lainnya"
            ? formData.jenis_drainase_lainnya
            : null,

        // LOGIC GAMBUT
        nama_lahan_gambut: isGambut ? formData.nama_lahan_gambut : null,

        // Convert List Label UI ke Enum BE (Mapping Strict)
        gambut_lapisan_mineral: isGambut
          ? formData.gambut_lapisan_mineral?.map(
              (item) => MAPPING_LAPISAN_MINERAL[item],
            )
          : [],

        gambut_kematangan: isGambut
          ? formData.gambut_kematangan?.map(
              (item) => MAPPING_KEMATANGAN_GAMBUT[item],
            )
          : [],
      };

      console.log("SENDING PAYLOAD:", JSON.stringify(dataPayload));

      // Bungkus dalam FormData untuk Upload File
      const formDataUpload = new FormData();
      formDataUpload.append("data_json", JSON.stringify(dataPayload));

      // Upload file HANYA jika Mineral & Kondisi Lahan memerlukan
      if (isMineral && (isMiring || isKonservasi) && fileTerasering) {
        formDataUpload.append("file_bukti_terasering", fileTerasering);
      }
      if (isMineral && isKonservasi && fileDrainase) {
        formDataUpload.append("file_bukti_drainase", fileDrainase);
      }

      // 4. Kirim Request
      const response = await fetch(
        API_ENDPOINTS.FARM.PETANI.ADD_RENCANA_TANAM,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataUpload,
        },
      );

      // Matikan toast loading saat ada respon dari BE
      showToast.dismiss();

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
            JSON.stringify(errorData) ||
            "Gagal menyimpan data",
        );
      }

      const result = await response.json();
      console.log("Sukses:", result);

      // MUNCULKAN POPUP SUKSES & INFO ALUR SELANJUTNYA
      Swal.fire({
        icon: "success",
        title: "Berhasil Disimpan!",
        html: `
          <div style="text-align: left; font-size: 14px; line-height: 1.6; color: #4B5563; margin-top: 10px;">
            <p style="margin-bottom: 8px;">Rencana tanam Anda telah berhasil diteruskan ke <b>Role Kebun</b> untuk divalidasi.</p>
            <p><b>Apa langkah selanjutnya?</b></p>
            <ul style="list-style-type: disc; margin-left: 20px; margin-top: 4px;">
              <li>Tunggu proses validasi (ACC) dari pihak Kebun.</li>
              <li>Lahan yang disetujui akan otomatis muncul di menu <b>Aktivitas & Monitoring</b>.</li>
              <li>Setelah muncul, Anda baru bisa mulai mencatat <i>Realisasi Tanam, Monitoring harian, dan Panen</i>.</li>
            </ul>
          </div>
        `,
        confirmButtonText: "Mengerti",
        confirmButtonColor: "#10B981", // Warna hijau sukses
        customClass: {
          popup: "rounded-[24px] shadow-2xl border border-gray-100",
          confirmButton: "rounded-xl px-6 py-2 shadow-md",
        },
      });

      // Reset Form Total
      setFormData({
        nama_unit: "",
        tanggal_tanam_blok: "",
        luas_unit: "",
        jumlah_tanaman_per_ha: "",
        jumlah_total_tanaman: "",
        jenis_tanah: "",
        jenis_lahan: "",
        jenis_bibit: "",
        varietas_bibit_nama: "",
        jarak_tanam: "",
        jarak_tanam_lainnya: "",
        jenis_terasering: "",
        jenis_terasering_lainnya: "",
        jenis_drainase: "",
        jenis_drainase_lainnya: "",
        nama_lahan_gambut: "",
        gambut_lapisan_mineral: [],
        gambut_kematangan: [],
      });
      setFileTerasering(null);
      setFileDrainase(null);
      fetchRiwayat();
    } catch (error) {
      showToast.dismiss(); // Pastikan loading mati kalau error
      console.error("Error submit:", error);

      // MUNCULKAN TOAST ERROR API
      showToast.error(`Gagal menyimpan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (location.pathname.includes("detailrencanatanam")) {
    return <DetailRencanaTanam />;
  }

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === "disetujui") {
      return (
        <span className="bg-green-100 border border-green-500 text-green-700 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap">
          Disetujui
        </span>
      );
    } else if (s === "ditolak") {
      return (
        <span className="bg-red-100 border border-red-500 text-red-700 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap">
          Ditolak
        </span>
      );
    } else {
      return (
        <span className="bg-yellow-100 border border-yellow-500 text-yellow-800 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap">
          Menunggu
        </span>
      );
    }
  };

  const approvedBloks = riwayatBlok.filter(
    (blok) => blok.status_approval?.toLowerCase() === "disetujui",
  );

  return (
    <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-4 sm:p-8">
      {/* Header Info Box - Adjusted padding for mobile */}
      <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8 bg-blue-50 p-4 rounded-xl border border-blue-100">
        <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800 leading-relaxed">
          Catat budidaya dan monitoring praktik budidaya sesuai GAP meliputi,
          rencana tanam, perbenihan, penanaman, pemeliharaan, pengendalian OPT,
          panen dan pengangkutan.
        </p>
      </div>

      {/* Accordion Rencana Tanam */}
      <div className="border border-gray-300 rounded-xl mb-6 overflow-hidden">
        <button
          onClick={() => toggleSection("rencanaTanam")}
          className="w-full flex justify-between items-center px-4 py-4 sm:px-5 sm:py-5 bg-[#EF8523] hover:bg-[#e07a1f] transition-colors font-bold text-white text-left"
        >
          <div className="flex items-center gap-3">
            <Grid2X2 className="w-5 h-5 flex-shrink-0" />
            {/* Container Vertikal untuk Judul dan Catatan */}
            <div className="flex flex-col">
              <span className="text-base leading-tight">
                Input Data Blok/Rencana Tanam
              </span>
              <span className="text-[11px] sm:text-xs font-normal opacity-90 mt-1 leading-tight">
                *Harap isi menu tambah lahan (di dashboard) dan inventaris
                terlebih dahulu sebelum input data blok/rencana tanam.
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 transition-transform flex-shrink-0 ${
              openSection === "rencanaTanam" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSection === "rencanaTanam" && (
          <div className="p-3 sm:p-6 space-y-5 sm:space-y-6 animate-fadeIn">
            {/* ===================================================================== */}
            {/* BANNER PRASYARAT (KEDAP-KEDIP) UNTUK MENGARAHKAN USER */}
            {/* ===================================================================== */}
            <div className="bg-gradient-to-r from-green-50 to-[#fff8f3] border border-green-200 p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-5">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-green-600"></div>

              {/* Teks & Ikon */}
              <div className="flex items-start gap-3 w-full">
                {/* Ikon dengan efek berdenyut (Pulse) disesuaikan ukurannya untuk HP */}
                <div className="bg-green-600 p-1.5 sm:p-2.5 rounded-full text-white shrink-0 shadow-md animate-pulse mt-0.5 sm:mt-0">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-green-600 text-xs sm:text-base leading-tight">
                    Penting: Lengkapi Data Prasyarat!
                  </h4>
                  <p className="text-[10px] sm:text-xs text-black mt-1 sm:mt-0.5 leading-relaxed font-medium">
                    Pastikan Anda telah mengisi{" "}
                    <strong className="font-black text-gray-800">
                      Daftar Lahan
                    </strong>{" "}
                    dan{" "}
                    <strong className="font-black text-gray-800">
                      Inventaris Bibit
                    </strong>{" "}
                    sebelum membuat rencana tanam ini.
                  </p>
                </div>
              </div>

              {/* Tombol Jalan Pintas (Shortcut) - Diperbaiki untuk Mobile */}
              <div className="flex flex-col min-[400px]:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto shrink-0 mt-1 md:mt-0">
                <button
                  onClick={() => navigate("/petani/luaslahan")}
                  className="flex-1 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-green-600 text-green-700 hover:bg-orange-50 rounded-xl text-[10px] sm:text-xs font-bold transition-all shadow-sm whitespace-nowrap"
                >
                  <Map className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> Tambah Lahan
                </button>
                <button
                  onClick={() => navigate("/petani/manajemenkebun/inventaris")}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all shadow-sm"
                >
                  <Sprout className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> Isi
                  Inventaris
                </button>
              </div>
            </div>
            {/* ===================================================================== */}

            {/* GRID LAYOUT UTAMA: 1 Kolom di Mobile, 2 Kolom di Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="w-full">
                <label className="block font-bold text-gray-700 mb-2 text-sm">
                  1. Nama Unit
                </label>
                <input
                  name="nama_unit"
                  value={formData.nama_unit}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Contoh: Unit 3A"
                  className="w-full bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-50 focus:border-[#EF8523] transition-all outline-none text-gray-800"
                />
              </div>

              <div className="w-full">
                <label className="block font-bold text-gray-700 mb-2 text-sm">
                  2. Tanggal Tanam
                </label>
                <input
                  name="tanggal_tanam_blok"
                  value={formData.tanggal_tanam_blok}
                  onChange={handleInputChange}
                  type="date"
                  className="w-full bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-50 focus:border-[#EF8523] transition-all outline-none text-gray-800"
                />
              </div>

              {/* Dropdown 1: Jenis Bibit */}
              <div className="flex flex-col">
                <label className="block font-bold text-gray-700 mb-2 text-sm">
                  3. Jenis Bibit <span className="text-red-500">*</span>
                </label>
                <select
                  name="jenis_bibit"
                  value={formData.jenis_bibit || ""}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-50 focus:border-[#EF8523] transition-all outline-none text-gray-800"
                  required
                >
                  <option value="" disabled>
                    Pilih Jenis Bibit
                  </option>
                  <option value="Tenera">Tenera</option>
                  <option value="Dura">Dura</option>
                  <option value="Pisifera">Pisifera</option>
                </select>

                {/* Dropdown 2: Varietas (HANYA MUNCUL KALAU TENERA) */}
                {formData.jenis_bibit === "Tenera" && (
                  <div className="flex flex-col mt-4 p-3 bg-orange-50/50 border border-orange-100 rounded-xl">
                    <label className="text-xs font-bold text-orange-800 mb-2">
                      Pilih Varietas Bibit (Dari Inventaris){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="varietas_bibit_nama"
                      value={formData.varietas_bibit_nama || ""}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-orange-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] outline-none text-gray-800"
                      required
                    >
                      <option value="" disabled>
                        -- Pilih Varietas --
                      </option>
                      {Array.isArray(listInventarisBibit) &&
                      listInventarisBibit.length > 0 ? (
                        listInventarisBibit
                          .filter((bibit) => bibit.jenis_bibit === "Tenera")
                          .map((bibit, index) => (
                            <option
                              key={bibit.id || index}
                              value={bibit.nama_varietas}
                            >
                              {bibit.nama_varietas}
                            </option>
                          ))
                      ) : (
                        <option value="" disabled>
                          Sedang memuat atau stok kosong...
                        </option>
                      )}
                    </select>
                  </div>
                )}
              </div>

              <div className="w-full">
                <label className="block font-bold text-gray-700 mb-2 text-sm">
                  4. Jumlah Bibit
                </label>
                <input
                  name="jumlah_total_tanaman"
                  value={formData.jumlah_total_tanaman}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="Contoh: 260"
                  className="w-full bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-50 focus:border-[#EF8523] transition-all outline-none text-gray-800"
                />
              </div>

              <div className="w-full">
                <label className="block font-bold text-gray-700 mb-2 text-sm">
                  5. Jumlah Tanam/ha
                </label>
                <input
                  name="jumlah_tanaman_per_ha"
                  value={formData.jumlah_tanaman_per_ha}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="Contoh: 130"
                  className="w-full bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-50 focus:border-[#EF8523] transition-all outline-none text-gray-800"
                />
              </div>

              {/* --- Jenis Tanah (Mineral / Gambut) --- */}
              <div className="w-full">
                <label className="block font-bold text-gray-700 mb-2 text-sm">
                  6. Jenis Tanah
                </label>
                <select
                  name="jenis_tanah"
                  value={formData.jenis_tanah}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-50 focus:border-[#EF8523] transition-all outline-none text-gray-800"
                >
                  <option value="">Pilih Jenis Tanah</option>
                  <option value="Mineral">Mineral</option>
                  <option value="Gambut">Gambut</option>
                </select>
              </div>

              {/* --- Jenis Lahan --- */}
              {formData.jenis_tanah !== "Gambut" && (
                <div className="w-full">
                  <label className="block font-bold text-gray-700 mb-2 text-sm">
                    7. Jenis Lahan
                  </label>
                  <select
                    name="jenis_lahan"
                    value={formData.jenis_lahan}
                    onChange={(e) => {
                      setFileTerasering(null);
                      setFileDrainase(null);
                      handleInputChange(e);
                    }}
                    className="w-full bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-50 focus:border-[#EF8523] transition-all outline-none text-gray-800"
                  >
                    <option value="">Pilih Jenis Lahan</option>
                    <option value="Datar">Datar</option>
                    <option value="Miring">Miring</option>
                    <option value="Konservasi">Konservasi</option>
                  </select>
                </div>
              )}

              <div className="w-full">
                <label className="block font-bold text-gray-700 mb-2 text-sm">
                  8. Jarak Tanam
                </label>
                <select
                  name="jarak_tanam"
                  value={formData.jarak_tanam}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-50 focus:border-[#EF8523] transition-all outline-none text-gray-800"
                >
                  <option value="">Pilih Jarak Tanam</option>
                  <option value="8x9">8 x 9 Meter</option>
                  <option value="9x9">9 x 9 Meter</option>
                  <option value="7x9">7 x 9 Meter</option>
                  <option value="Lainnya">Lainnya (Input Manual)</option>
                </select>
                {formData.jarak_tanam === "Lainnya" && (
                  <input
                    name="jarak_tanam_lainnya"
                    value={formData.jarak_tanam_lainnya}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="Tuliskan Jarak Tanam (Cth: 10x10)"
                    className="w-full mt-3 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#EF8523] focus:border-[#EF8523] outline-none"
                  />
                )}
              </div>

              {/* (BE MAHARANI) SECTION KHUSUS GAMBUT */}
              {formData.jenis_tanah === "Gambut" && (
                <div className="col-span-1 sm:col-span-2 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 space-y-5 mt-2">
                  <p className="text-sm font-black text-emerald-800">
                    Data Lahan Gambut (Wajib Diisi)
                  </p>

                  {/* Keranjang Lahan Gambut */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2 text-sm">
                      Pilih Lahan Gambut & Masukkan Luas (Ha){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-emerald-200 max-h-60 overflow-y-auto shadow-inner">
                      {listLahanGambut.map((lahan) => {
                        const selectedItem =
                          formData.keranjang_lahan_gambut.find(
                            (item) => item.id === lahan.id,
                          );
                        const isChecked = !!selectedItem;

                        return (
                          <div
                            key={lahan.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-gray-100 rounded-lg hover:border-emerald-200 transition-colors"
                          >
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setFormData((prev) => {
                                    if (checked) {
                                      return {
                                        ...prev,
                                        keranjang_lahan_gambut: [
                                          ...prev.keranjang_lahan_gambut,
                                          { id: lahan.id, luas_diambil: "" },
                                        ],
                                      };
                                    } else {
                                      return {
                                        ...prev,
                                        keranjang_lahan_gambut:
                                          prev.keranjang_lahan_gambut.filter(
                                            (item) => item.id !== lahan.id,
                                          ),
                                      };
                                    }
                                  });
                                }}
                                className="w-5 h-5 text-emerald-600 rounded-md border-gray-300 focus:ring-emerald-500"
                              />
                              {(() => {
                                const sisaGambut =
                                  lahan.lahan_tidak_digunakan_gambut ??
                                  lahan.luas_total_boleh_ditanam ??
                                  0;
                                return (
                                  <span className="text-sm font-bold text-gray-700">
                                    {lahan.nama_lahan_gambut}{" "}
                                    <span className="text-xs font-medium text-emerald-600 ml-1">
                                      (Sisa: {sisaGambut} Ha)
                                    </span>
                                  </span>
                                );
                              })()}
                            </label>

                            {isChecked && (
                              <div className="flex items-center gap-2 pl-8 sm:pl-0">
                                <input
                                  type="number"
                                  placeholder="Luas (Ha)"
                                  value={selectedItem.luas_diambil}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => ({
                                      ...prev,
                                      keranjang_lahan_gambut:
                                        prev.keranjang_lahan_gambut.map(
                                          (item) =>
                                            item.id === lahan.id
                                              ? { ...item, luas_diambil: val }
                                              : item,
                                        ),
                                    }));
                                  }}
                                  className="w-24 px-3 py-1.5 text-sm font-bold text-gray-800 bg-emerald-50 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-center"
                                />
                                <span className="text-xs font-bold text-gray-500">
                                  Ha
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {listLahanGambut.length === 0 && (
                        <p className="text-sm text-gray-500 italic text-center py-4">
                          Tidak ada lahan gambut tersedia.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Lapisan Mineral */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2 text-sm">
                      Lapisan Mineral
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {Object.keys(MAPPING_LAPISAN_MINERAL).map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer bg-white px-3 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors shadow-sm"
                        >
                          <input
                            type="checkbox"
                            value={opt}
                            checked={formData.gambut_lapisan_mineral.includes(
                              opt,
                            )}
                            onChange={(e) =>
                              handleCheckboxGambut(e, "gambut_lapisan_mineral")
                            }
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Kematangan Gambut */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2 text-sm">
                      Kematangan Gambut
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {Object.keys(MAPPING_KEMATANGAN_GAMBUT).map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer bg-white px-3 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors shadow-sm"
                        >
                          <input
                            type="checkbox"
                            value={opt}
                            checked={formData.gambut_kematangan.includes(opt)}
                            onChange={(e) =>
                              handleCheckboxGambut(e, "gambut_kematangan")
                            }
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* BLOK MINERAL (REVISI MULTI-SELECT KERANJANG) */}
              {formData.jenis_tanah === "Mineral" && (
                <div className="col-span-1 sm:col-span-2 mb-2 mt-2 bg-gray-50/80 p-5 rounded-2xl border border-gray-200">
                  <label className="block font-bold text-gray-700 mb-2 text-sm">
                    Pilih Lahan Mineral & Masukkan Luas (Ha){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-300 max-h-60 overflow-y-auto shadow-inner">
                    {listLahanMineral.map((lahan) => {
                      const selectedItem =
                        formData.keranjang_lahan_mineral.find(
                          (item) => item.id === lahan.id,
                        );
                      const isChecked = !!selectedItem;
                      const labelLuas = lahan.luas_sisa ?? 0;

                      return (
                        <div
                          key={lahan.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-gray-100 rounded-lg hover:border-[#EF8523]/30 transition-colors"
                        >
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData((prev) => {
                                  if (checked) {
                                    return {
                                      ...prev,
                                      keranjang_lahan_mineral: [
                                        ...prev.keranjang_lahan_mineral,
                                        { id: lahan.id, luas_diambil: "" },
                                      ],
                                    };
                                  } else {
                                    return {
                                      ...prev,
                                      keranjang_lahan_mineral:
                                        prev.keranjang_lahan_mineral.filter(
                                          (item) => item.id !== lahan.id,
                                        ),
                                    };
                                  }
                                });
                              }}
                              className="w-5 h-5 text-[#EF8523] rounded-md border-gray-300 focus:ring-[#EF8523]"
                            />
                            <span className="text-sm font-bold text-gray-700">
                              {lahan.nama_lahan_mineral ||
                                `Lahan ID: ${lahan.id}`}{" "}
                              <span className="text-xs font-medium text-blue-600 ml-1">
                                (Sisa: {labelLuas} Ha)
                              </span>
                            </span>
                          </label>

                          {isChecked && (
                            <div className="flex items-center gap-2 pl-8 sm:pl-0">
                              <input
                                type="number"
                                placeholder="Luas (Ha)"
                                value={selectedItem.luas_diambil}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => ({
                                    ...prev,
                                    keranjang_lahan_mineral:
                                      prev.keranjang_lahan_mineral.map(
                                        (item) =>
                                          item.id === lahan.id
                                            ? { ...item, luas_diambil: val }
                                            : item,
                                      ),
                                  }));
                                }}
                                className="w-24 px-3 py-1.5 text-sm font-bold text-gray-800 bg-orange-50 border border-orange-200 rounded-lg focus:ring-2 focus:ring-[#EF8523] outline-none text-center"
                              />
                              <span className="text-xs font-bold text-gray-500">
                                Ha
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {listLahanMineral.length === 0 && (
                      <p className="text-sm text-gray-500 italic text-center py-4">
                        Tidak ada lahan mineral tersedia.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* (BE MAHARANI) SECTION KHUSUS MINERAL (Miring/Konservasi) */}
              {formData.jenis_tanah === "Mineral" &&
                (formData.jenis_lahan === "Miring" ||
                  formData.jenis_lahan === "Konservasi") && (
                  <div className="col-span-1 sm:col-span-2 space-y-5 mt-2">
                    {/* Form Terasering */}
                    <div className="bg-yellow-50/50 p-5 rounded-2xl border border-yellow-200 shadow-sm">
                      <p className="text-sm font-black text-yellow-800 mb-4 border-b border-yellow-200 pb-2">
                        Data Terasering (Wajib Mineral Miring/Konservasi)
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block font-bold text-gray-700 mb-2 text-sm">
                            Jenis Terasering{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="jenis_terasering"
                            value={formData.jenis_terasering}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                          >
                            <option value="">Pilih Jenis Terasering</option>
                            {ENUM_TERASERING.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                          {formData.jenis_terasering === "Lainnya" && (
                            <input
                              name="jenis_terasering_lainnya"
                              value={formData.jenis_terasering_lainnya}
                              onChange={handleInputChange}
                              placeholder="Sebutkan jenis terasering..."
                              className="w-full mt-3 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-2 text-sm">
                            Bukti Foto/Video Terasering
                          </label>
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(e, "terasering")}
                            className="block w-full text-sm text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-yellow-100 file:text-yellow-800 hover:file:bg-yellow-200 transition-colors"
                          />
                          <span className="text-xs font-medium text-gray-500 block mt-2 ml-1">
                            {fileTerasering
                              ? fileTerasering.name
                              : "Belum ada file terpilih"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Form Drainase (Hanya Konservasi) */}
                    {formData.jenis_lahan === "Konservasi" && (
                      <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200 shadow-sm">
                        <p className="text-sm font-black text-blue-800 mb-4 border-b border-blue-200 pb-2">
                          Data Drainase (Wajib Mineral Konservasi)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label className="block font-bold text-gray-700 mb-2 text-sm">
                              Jenis Drainase{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="jenis_drainase"
                              value={formData.jenis_drainase}
                              onChange={handleInputChange}
                              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                            >
                              <option value="">Pilih Jenis Drainase</option>
                              {ENUM_DRAINASE.map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                            {formData.jenis_drainase === "Lainnya" && (
                              <input
                                name="jenis_drainase_lainnya"
                                value={formData.jenis_drainase_lainnya}
                                onChange={handleInputChange}
                                placeholder="Sebutkan jenis drainase..."
                                className="w-full mt-3 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                              />
                            )}
                          </div>

                          <div>
                            <label className="block font-bold text-gray-700 mb-2 text-sm">
                              Bukti Foto/Video Drainase
                            </label>
                            <input
                              type="file"
                              onChange={(e) => handleFileChange(e, "drainase")}
                              className="block w-full text-sm text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 transition-colors"
                            />
                            <span className="text-xs font-medium text-gray-500 block mt-2 ml-1">
                              {fileDrainase
                                ? fileDrainase.name
                                : "Belum ada file terpilih"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* --- HASIL AUTO-CALCULATE LUAS UNIT --- */}
            {formData.jenis_tanah && (
              <div className="mt-6 bg-gradient-to-r from-orange-50 to-[#fff8f3] border border-orange-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#EF8523]"></div>
                <div className="flex-1 pl-2">
                  <h4 className="font-bold text-[#EF8523] text-sm sm:text-base">
                    Total Luas Unit Blok (Ha)
                  </h4>
                  <p className="text-[10px] sm:text-xs text-orange-800 mt-1 max-w-md font-medium leading-relaxed">
                    *Terhitung otomatis berdasarkan akumulasi luas area yang
                    Anda input pada daftar lahan di atas.
                  </p>
                </div>
                <div className="w-full sm:w-1/3 relative">
                  <input
                    name="luas_unit"
                    value={formData.luas_unit || "0"}
                    readOnly
                    type="number"
                    // PERBAIKAN: Ditambahkan pr-16 (padding-right) agar angka tidak menabrak teks "Hektar"
                    className="w-full bg-white border border-orange-200 rounded-lg pl-4 pr-16 py-2.5 sm:py-3 text-lg font-black text-gray-800 cursor-not-allowed outline-none text-right shadow-inner"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    Hektar
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-8">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-black text-white transition-all transform active:scale-95 shadow-md ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                {loading ? "Menyimpan Data..." : "Simpan Rencana Tanam"}
              </button>
            </div>


            <div className="border-t-2 border-dashed border-gray-200 pt-8 mt-8">
              <h3 className="font-black mb-6 text-[#B5302D] text-lg flex items-center gap-2">
                Riwayat Rencana Tanam
              </h3>

              {!loadingRiwayat && riwayatBlok.length === 0 && (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                  <p className="text-sm font-bold text-gray-400">
                    Belum ada riwayat rencana tanam yang tersimpan.
                  </p>
                </div>
              )}

              {/* PERUBAHAN: Dari flex-col menjadi GRID 2 Kolom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {riwayatBlok.map((blok) => (
                  <div
                    key={blok.id}
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
                  >
                    {/* Bagian Atas: Info Utama */}
                    <div className="p-4 sm:p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-black text-gray-800 text-base">
                          {blok.nama_unit}
                        </h4>
                        {/* Memanggil fungsi getStatusBadge bawaan Anda */}
                        <div className="shrink-0 scale-90 origin-top-right">
                          {getStatusBadge(blok.status_approval)}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 mt-2">
                        <span className="text-xs font-bold text-gray-500 bg-gray-50 w-fit px-2.5 py-1 rounded-md border border-gray-100">
                          Luas:{" "}
                          <span className="text-gray-800">
                            {blok.luas_unit} Hektar
                          </span>
                        </span>
                        <span className="text-xs font-bold text-gray-500 bg-gray-50 w-fit px-2.5 py-1 rounded-md border border-gray-100">
                          Tanggal Tanam:{" "}
                          <span className="text-gray-800">
                            {blok.tanggal_tanam_blok}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Bagian Bawah: Tombol Aksi */}
                    <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 flex justify-end">
                      <button
                        onClick={() =>
                          navigate(
                            `/petani/manajemenkebun/budidayamonitoring/detailrencanatanam/${blok.id}`,
                          )
                        }
                        className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm active:scale-95"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border border-gray-300 rounded-xl overflow-hidden mt-6">
        <button
          onClick={() => toggleSection("monitoring")}
          className="w-full flex justify-between items-center px-4 py-4 sm:px-5 sm:py-5 bg-[#EF8523] hover:bg-[#e07a1f] transition-colors font-bold text-white text-left"
        >
          {/* Container Horizontal Utama */}
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 flex-shrink-0" />

            {/* Container Vertikal khusus untuk Teks (Judul & Catatan) */}
            <div className="flex flex-col">
              <span className="text-base leading-tight">
                Aktivitas & Monitoring
              </span>
              <span className="text-[11px] sm:text-xs font-normal opacity-90 mt-1 leading-tight">
                *Bisa mencatat aktivitas harian dan memantau perkembangan
                tanaman jika rencana tanam sudah disetujui oleh Kebun.
              </span>
            </div>
          </div>

          <ChevronDown
            className={`w-5 h-5 transition-transform flex-shrink-0 ${
              openSection === "monitoring" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSection === "monitoring" && (
          <div className="p-4 sm:p-6 space-y-4">
            {approvedBloks.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Belum ada Rencana Tanam yang disetujui.
              </p>
            ) : (
              approvedBloks.map((blok) => (
                <div
                  key={blok.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between bg-white border border-gray-200 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition duration-300 gap-4"
                >
                  {/* --- BAGIAN KIRI: Info Blok --- */}
                  <div className="flex flex-col min-w-0">
                    <p className="font-bold text-gray-800 text-sm sm:text-base truncate">
                      {blok.nama_unit}
                    </p>
                    <span className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span>
                        Luas:{" "}
                        <span className="font-bold text-gray-700">
                          {blok.luas_unit} Ha
                        </span>
                      </span>
                      <span className="text-gray-300">|</span>
                      <span>
                        Tgl Tanam:{" "}
                        <span className="font-bold text-gray-700">
                          {blok.tanggal_tanam_blok}
                        </span>
                      </span>
                    </span>
                  </div>

                  {/* --- BAGIAN KANAN: Tombol Aksi --- */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-row items-center gap-2 sm:gap-2.5 shrink-0 w-full lg:w-auto mt-3 lg:mt-0">
                    
                    {/* 1. Tombol Realisasi Tanam */}
                    <button
                      onClick={() =>
                        navigate(
                          `/petani/manajemenkebun/budidayamonitoring/realisasitanam/${blok.id}`,
                        )
                      }
                      className="w-full lg:w-auto flex items-center justify-center gap-1.5 sm:gap-2 text-blue-700 border border-blue-200 bg-blue-50 rounded-lg py-1.5 px-2 sm:py-2 sm:px-4 font-bold text-[10px] sm:text-[11px] lg:text-xs hover:bg-blue-100 transition whitespace-nowrap shadow-sm"
                      title="Realisasi Tanam"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span>Realisasi Tanam</span>
                    </button>

                    {/* 2. Tombol Monitoring */}
                    <button
                      onClick={() =>
                        navigate(
                          `/petani/manajemenkebun/budidayamonitoring/monitoring/${blok.id}`,
                        )
                      }
                      className="w-full lg:w-auto flex items-center justify-center gap-1.5 sm:gap-2 text-green-700 border border-green-200 bg-green-50 rounded-lg py-1.5 px-2 sm:py-2 sm:px-4 font-bold text-[10px] sm:text-[11px] lg:text-xs hover:bg-green-100 transition whitespace-nowrap shadow-sm"
                      title="Catat Monitoring Harian"
                    >
                      <Sprout className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span>Monitoring</span>
                    </button>

                    {/* 3. Tombol Panen */}
                    <button
                      onClick={() =>
                        navigate(
                          `/petani/manajemenkebun/budidayamonitoring/panen/${blok.id}`,
                        )
                      }
                      className="w-full lg:w-auto flex items-center justify-center gap-1.5 sm:gap-2 text-[#EF8523] border border-orange-200 bg-orange-50 rounded-lg py-1.5 px-2 sm:py-2 sm:px-4 font-bold text-[10px] sm:text-[11px] lg:text-xs hover:bg-orange-100 transition whitespace-nowrap shadow-sm"
                      title="Jadwal & Realisasi Panen"
                    >
                      <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span>Panen</span>
                    </button>

                    {/* 4. Tombol Arsip Siklus */}
                    <button
                      onClick={() => fetchListArsipSiklus(blok.id)}
                      className="w-full lg:w-auto flex items-center justify-center gap-1.5 sm:gap-2 text-purple-700 border border-purple-200 bg-purple-50 rounded-lg py-1.5 px-2 sm:py-2 sm:px-4 font-bold text-[10px] sm:text-[11px] lg:text-xs hover:bg-purple-100 transition whitespace-nowrap shadow-sm"
                      title="Lihat Arsip Siklus"
                    >
                      <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span>Arsip Siklus</span>
                    </button>

                  </div>
                </div>
              ))
            )}

            {/* ================= MODAL RIWAYAT SIKLUS ================= */}
            {showHistoryModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl w-[95%] sm:w-full max-w-lg flex flex-col max-h-[85vh]">
                  <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div>
                      <h3 className="text-sm sm:text-lg font-bold text-[#B5302D]">
                        Daftar Riwayat Siklus
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        Pilih siklus untuk melihat detail rekam jejak
                      </p>
                    </div>
                    <button
                      onClick={() => setShowHistoryModal(false)}
                      className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-full transition"
                    >
                      <X className="w-5 h-5 text-gray-500 hover:text-red-600" />
                    </button>
                  </div>

                  <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                    {loadingHistory ? (
                      <div className="text-center py-10">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#EF8523]" />
                        <p className="text-xs text-gray-500 mt-2 font-medium">
                          Memuat daftar siklus...
                        </p>
                      </div>
                    ) : historyList.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <History className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-400 font-medium text-xs sm:text-sm">
                          Belum ada riwayat siklus yang diarsipkan untuk blok
                          ini.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {historyList.map((item) => (
                          <div
                            key={item.nomor_siklus}
                            // --- NAVIGATE SAAT DIPILIH ---
                            onClick={() =>
                              navigate(
                                `/petani/manajemenkebun/budidayamonitoring/panen/${selectedBlokIdHistory}/arsip/${item.nomor_siklus}`,
                              )
                            }
                            className={`border rounded-xl p-4 flex justify-between items-center transition cursor-pointer shadow-sm hover:shadow-md ${
                              item.status === "AKTIF"
                                ? "bg-green-50 border-green-200 hover:bg-green-100"
                                : "bg-white border-gray-200 hover:border-[#EF8523]"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-extrabold text-black text-sm sm:text-base">
                                  Siklus Ke-{item.nomor_siklus}
                                </p>
                                {item.status === "AKTIF" && (
                                  <span className="text-[9px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
                                    Berjalan
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                                Mulai: {item.tanggal_mulai} • Produksi:{" "}
                                <span className="font-bold text-black">
                                  {item.total_produksi} Kg
                                </span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
