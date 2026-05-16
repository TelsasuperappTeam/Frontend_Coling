import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ClipboardList,
  ShoppingCart,
  Users,
  Plus,
  FileText,
  Trash2,
  Edit,
  Upload,
  Search,
  CheckCircle,
  X,
  Save,
  Loader2, // Icon loading tambahan
} from "lucide-react";

import {
  API_ENDPOINTS,
  API_BASE_URLS,
  getFileUrl,
} from "../../config/constants.js";

import { showToast, confirmDialog } from "../../utils/notif";

/* ===================== DEFINISI REQUIREMENTS (SESUAI BE MAHAR) ===================== */
const DOKUMEN_CONFIG = [
  // --- Prinsip 2. Penerapan Praktik Pertanian yang Baik ---
  // Kriteria 2.1
  {
    id: 1,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.1 Organisasi Kelembagaan Pekebun",
    label: "Daftar anggota kelompok tani / koperasi",
    deskripsi:
      "Upload dokumen berisi: Nama anggota, NIK, Lokasi lahan, dan Luas lahan. (Minimal 20–30 orang per kelompok).",
    code: "P2_2_1_ANGGOTA", // SUDAH
  },
  {
    id: 2,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.1 Organisasi Kelembagaan Pekebun",
    label: "SK pengurus & pembagian tugas",
    deskripsi:
      "Upload dokumen yang menjelaskan: Daftar pengurus serta Peran dan tanggung jawab masing-masing (Contoh: siapa yang menjadi manajer ICS, dll).",
    code: "P2_2_1_SK_PENGURUS", // SUDAH
  },
  {
    id: 3,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.1 Organisasi Kelembagaan Pekebun",
    label: "AD/ART kelompok",
    deskripsi:
      "Upload dokumen Anggaran Dasar dan Anggaran Rumah Tangga (Berisi aturan internal kelompok).",
    code: "P2_2_1_ADART", // SUDAH
  },
  {
    id: 4,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.1 Organisasi Kelembagaan Pekebun",
    label: "Dokumen badan hukum",
    deskripsi:
      "Upload dokumen yang menunjukkan legalitas koperasi / organisasi (Sesuai peraturan yang berlaku).",
    code: "P2_2_1_BADAN_HUKUM", // SUDAH
  },
  {
    id: 5,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.1 Organisasi Kelembagaan Pekebun",
    label: "Berita acara pembentukan",
    deskripsi: "Upload bukti resmi saat kelompok tani / koperasi didirikan.",
    code: "P2_2_1_BERITA_ACARA", // SUDAH
  },

  // Kriteria 2.2
  {
    id: 6,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.2 Pengelolaan Perkebunan",
    label: "Rencana operasional kebun",
    deskripsi:
      "Upload dokumen yang memuat: Rencana kegiatan kebun berdasarkan data petani, Kebutuhan sarana produksi, Perkiraan hasil panen, Kegiatan pemeliharaan dan pengendalian hama, Proses panen dan pengangkutan TBS, Pemeliharaan lahan (terasering, drainase, jalan produksi), dan Rencana peremajaan kebun (jika diperlukan).",
    code: "P2_2_2_RENCANA_KERJA", // SUDAH
  },

  // Kriteria 2.3
  {
    id: 7,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.1 Pembukaan Lahan",
    label: "SOP pembukaan lahan tanpa bakar",
    deskripsi:
      "Upload dokumen SOP yang mengacu pada pedoman resmi (Dirjen Perkebunan atau instansi terkait).",
    code: "P2_2_3_1_SOP_LAHAN", // SESUAIKAN DENGAN BE
  },

  {
    id: 8,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.2 pembenihan",
    label: "Bukti sosialisasi informasi benih",
    deskripsi:
      "Upload dokumen/foto/video bukti sosialisasi informasi benih melalui kelompok tani.",
    code: "P2_2_3_9_SOSIALISASI_BENIH", // SUDAH
  },

  {
    id: 9,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.3 Penanaman pada Lahan Mineral",
    label: "SOP penanaman sesuai GAP",
    deskripsi:
      "Upload SOP yang mengatur: Praktik budidaya yang berkelanjutan dan ramah lingkungan serta Upaya peningkatan produktivitas dan kualitas hasil.",
    code: "P2_2_3_3_SOP_GAP", // SUDAH
  },
  {
    id: 10,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.3 Penanaman pada Lahan Mineral",
    label: "SOP pedoman teknis penanaman",
    deskripsi:
      "Upload dokumen yang memuat: Luas areal tanam, Jumlah tanaman dan jarak tanam, dan Pembuatan terasering untuk lahan miring.",
    code: "P2_2_3_3_SOP_TEKNIS", // SUDAH
  },
  {
    id: 11,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.5 Pemeliharaan Tanaman",
    label: "SOP pemeliharaan tanaman",
    deskripsi:
      "Upload dokumen SOP dan instruksi kerja terkait pemeliharaan tanaman.",
    code: "P2_2_3_5_SOP_PEMELIHARAAN", // SESUAIKAN DENGAN BE
  },
  {
    id: 12,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.6 Pengendalian OPT",
    label: "SOP pengendalian hama terpadu (PHT/IPM)",
    deskripsi: "Upload dokumen SOP pengendalian hama.",
    code: "P2_2_3_6_SOP_HAMA", // SESUAIKAN DENGAN BE
  },
  {
    id: 13,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.6 Pengendalian OPT",
    label: "SOP penanganan limbah pestisida",
    deskripsi: "Upload dokumen SOP pengelolaan limbah pestisida.",
    code: "P2_2_3_6_SOP_LIMBAH", // SESUAIKAN DENGAN BE
  },
  {
    id: 14,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.6 Pengendalian OPT",
    label: "Bukti sertifikasi pestisida",
    deskripsi:
      "Upload dokumen bukti bahwa pestisida yang digunakan telah terdaftar di komisi pestisida.",
    code: "P2_2_3_6_SERTIFIKASI_PESTISIDA", // SESUAIKAN DENGAN BE
  },
  {
    id: 15,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.7 Pemanenan",
    label: "SOP kriteria buah matang",
    deskripsi:
      "Upload dokumen yang menjelaskan standar kematangan panen: Kurang matang (12,5–25% buah membrondol), Matang 1 (26–60% merah mengkilap), Matang 2 (61–75% oranye).",
    code: "P2_2_3_7_SOP_MATANG", // SESUAIKAN DENGAN BE
  },
  {
    id: 16,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.8 Pengiriman",
    label: "SOP alat transportasi",
    deskripsi:
      "Upload dokumen SOP terkait alat transportasi dan sarana pendukung.",
    code: "P2_2_3_8_SOP_TRANSPORT", // SESUAIKAN DENGAN BE
  },
  {
    id: 17,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.8 Pengiriman",
    label: "SOP penjagaan kualitas",
    deskripsi:
      "Upload dokumen SOP yang memastikan: Buah tidak rusak atau terkontaminasi, Tidak terjadi kehilangan, dan Pengiriman tepat waktu ke tempat pengolahan.",
    code: "P2_2_3_8_SOP_KUALITAS", // SESUAIKAN DENGAN BE
  },

  // --- Prinsip 3. Pengelolaan Lingkungan Hidup, SDA, dan Keanekaragaman Hayati ---
  // Kriteria 3.1
  {
    id: 18,
    prinsip:
      "Prinsip 3. Pengelolaan Lingkungan Hidup, SDA, dan Keanekaragaman Hayati",
    kriteria: "Kriteria 3.1 Pencegahan dan Penanggulangan Kebakaran",
    label: "SOP pencegahan dan penanggulangan kebakaran",
    deskripsi:
      "Upload dokumen yang menjelaskan: Prosedur pencegahan kebakaran dan Langkah penanggulangan saat terjadi kebakaran.",
    code: "P3_3_1_PENANGGULANGAN_KEBAKARAN", // SESUAIKAN DENGAN BE
  },

  // BE BELUM ADA
  {
    id: 19,
    prinsip:
      "Prinsip 3. Pengelolaan Lingkungan Hidup, SDA, dan Keanekaragaman Hayati",
    kriteria: "Kriteria 3.1 Pencegahan dan Penanggulangan Kebakaran",
    label: "Informasi area rawan kebakaran",
    deskripsi:
      "Upload dokumen yang memuat: Peta atau data lokasi area rawan kebakaran dan Cakupan seluruh lahan anggota kelompok.",
    code: "P3_3_2_4_AREAL_RAWAN_KEBAKARAN", // SUDAH
  },

  // BE BELUM ADA
  {
    id: 20,
    prinsip:
      "Prinsip 3. Pengelolaan Lingkungan Hidup, SDA, dan Keanekaragaman Hayati",
    kriteria: "Kriteria 3.1 Pencegahan dan Penanggulangan Kebakaran",
    label: "Dokumentasi simulasi tanggap darurat",
    deskripsi:
      "Upload bukti bahwa telah dilakukan simulasi kebakaran, seperti: Foto, laporan, atau berita acara kegiatan.",
    code: "P3_3_2_5_SIMULASI_TANGGAP_DARURAT", // BE BELUM
  },

  // Kriteria 3.2
  {
    id: 21,
    prinsip:
      "Prinsip 3. Pengelolaan Lingkungan Hidup, SDA, dan Keanekaragaman Hayati",
    kriteria: "Kriteria 3.2 Pelestarian Keanekaragaman Hayati",
    label: "SOP identifikasi satwa dan tumbuhan langka",
    deskripsi:
      "Upload dokumen yang menjelaskan cara mengidentifikasi satwa dan tumbuhan langka di area kebun.",
    code: "P3_3_2_1_SOP_IDENTIFIKASI_HAYATI", // SESUAIKAN DENGAN BE
  },
  {
    id: 22,
    prinsip:
      "Prinsip 3. Pengelolaan Lingkungan Hidup, SDA, dan Keanekaragaman Hayati",
    kriteria: "Kriteria 3.2 Pelestarian Keanekaragaman Hayati",
    label: "SOP perlindungan satwa dan tumbuhan langka",
    deskripsi:
      "Upload dokumen yang menjelaskan upaya perlindungan terhadap satwa dan tumbuhan langka di area kebun.",
    code: "P3_3_2_2_PERLINDUNGAN_HAYATI", // SESUAIKAN DENGAN BE
  },

  // --- Prinsip 4. Penerapan Transparansi ---
  // Kriteria 4.1
  {
    id: 23,
    prinsip: "Prinsip 4. Penerapan Transparansi",
    kriteria: "Kriteria 4.1 Penjualan dan Kesepakatan Harga TBS",
    label: "Informasi harga TBS dari pemerintah",
    deskripsi:
      "Upload dokumen yang memuat: Harga TBS terbaru sesuai standar pemerintah, Sumber resmi (dokumen pemerintah), dan Catatan harga untuk kebutuhan monitoring. Hasil input akan di tampilkan dalam grafik di halaman tampilan utama",
    code: "P4_1_HARGA", // SESUAIKAN DENGAN BE
  },
  {
    id: 24,
    prinsip: "Prinsip 4. Penerapan Transparansi",
    kriteria: "Kriteria 4.1 Penjualan dan Kesepakatan Harga TBS",
    label: "Dokumen kerja sama kemitraan",
    deskripsi:
      "Upload dokumen yang menjelaskan: Bentuk kerja sama dengan mitra serta Hak dan kewajiban masing-masing pihak.",
    code: "P4_4_2_KERJASAMA_KEMITRAAN", // SESUAIKAN DENGAN BE
  },

  // Kriteria 4.2
  {
    id: 25,
    prinsip: "Prinsip 4. Penerapan Transparansi",
    kriteria: "Kriteria 4.2 Penyediaan Data dan Informasi",
    label: "SOP pelayanan informasi",
    deskripsi:
      "Upload dokumen yang menjelaskan: Prosedur permintaan dan pemberian informasi serta Mekanisme pelayanan kepada pihak terkait.",
    code: "P4_4_1_SOP_PELAYANAN_INFORMASI", // SUDAH
  },

  // --- Prinsip 5. Peningkatan Usaha Secara Berkelanjutan ---
  // Kriteria 5.1
  {
    id: 26,
    prinsip: "Prinsip 5. Peningkatan Usaha Secara Berkelanjutan",
    kriteria: "Kriteria 5.1 Peningkatan Kinerja",
    label: "Rencana aksi peningkatan produksi kelapa sawit",
    deskripsi:
      "Upload dokumen yang memuat: Rencana peningkatan produksi kelapa sawit, Langkah atau strategi yang akan dilakukan, dan Bukti bahwa rencana dibagikan ke seluruh anggota.",
    code: "P5_5_1_SOP_RENCANA_PENINGKATAN_PRODUKSI",
  },
];

const Operasional = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Membaca URL saat ini untuk menentukan tab mana yang aktif.
  // Jika URL mengandung kata "organisasi", maka tab organisasi aktif. Defaultnya transaksi.
  const isOrganisasi = location.pathname.includes("organisasi");
  const activeTab = isOrganisasi ? "organisasi" : "transaksi";

  // -- STATE UNTUK PENGURUS (DYNAMIC) --
  const [pengurusList, setPengurusList] = useState([]);
  const [isLoadingPengurus, setIsLoadingPengurus] = useState(false);
  const [showModalPengurus, setShowModalPengurus] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Schema Form Pengurus
  const [formData, setFormData] = useState({
    nama_anggota: "",
    jabatan_pengurus: "",
    tugas_pengurus: "",
    no_hp: "",
  });

  // -- STATE UNTUK HARGA TBS (DYNAMIC BE) --
  const [showModalTBS, setShowModalTBS] = useState(false);
  const [isSubmittingTBS, setIsSubmittingTBS] = useState(false); // State loading untuk submit TBS
  const [tbsFormData, setTbsFormData] = useState({
    bulan: "",
    tahun: "",
    harga: "",
    file: null,
  });

  // -- STATE UNTUK TRANSAKSI (JUAL & PINJAM) --
  const [riwayatJual, setRiwayatJual] = useState([]);
  const [riwayatPinjam, setRiwayatPinjam] = useState([]);
  const [isLoadingTransaksi, setIsLoadingTransaksi] = useState(false);

  const [showModalJual, setShowModalJual] = useState(false);
  const [isSubmittingJual, setIsSubmittingJual] = useState(false);
  const [jualFormData, setJualFormData] = useState({
    petani_user_id: "",
    jenis_barang: "", // BIBIT, PUPUK, PESTISIDA
    dinamis_item_id: "",
    jumlah: "",
    total_harga: "",
  });

  const [showModalPinjam, setShowModalPinjam] = useState(false);
  const [isSubmittingPinjam, setIsSubmittingPinjam] = useState(false);
  const [pinjamFormData, setPinjamFormData] = useState({
    petani_user_id: "",
    dinamis_peralatan_id: "",
    jumlah_dipinjam: "",
    tanggal_peminjaman: "",
  });

  // -- STATE UNTUK DOKUMEN ORGANISASI (DINAMIS SESUAI BE MAHAR) --
  const [dokumenStatus, setDokumenStatus] = useState(
    DOKUMEN_CONFIG.map((doc) => ({
      ...doc,
      file_url: null, // Jika null, berarti belum upload
      status: null, // PENDING, APPROVED, etc
      isUploading: false,
      isFetchingData: true,
    })),
  );

  // -- STATE UNTUK OPSI DROPDOWN (DARI BE) --
  const [opsiPetani, setOpsiPetani] = useState([]);
  const [opsiPeralatan, setOpsiPeralatan] = useState([]);
  const [opsiBarang, setOpsiBarang] = useState([]); // Berubah tergantung jenis barang (Bibit/Pupuk/Pestisida)

  // 1. Fetch Daftar Petani
  const fetchOpsiPetani = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URLS.USER}/users/kebun/me/petani-members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setOpsiPetani(data);
      }
    } catch (e) {
      console.error("Gagal fetch petani", e);
    }
  };

  // 2. Fetch Daftar Peralatan (Untuk Peminjaman)
  const fetchOpsiPeralatan = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URLS.FARM}/farm/kebun/inventaris/peralatan`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        console.log("[DEBUG] Data PERALATAN dari BE:", data); // Lihat di Inspect Element -> Console
        const arrayData = Array.isArray(data)
          ? data
          : data.data || data.items || [];
        setOpsiPeralatan(arrayData);
      }
    } catch (e) {
      console.error("Gagal fetch peralatan", e);
    }
  };

  // 3. Fetch Daftar Barang (Bibit/Pupuk/Pestisida) - Dipanggil saat Jenis Barang dipilih
  const fetchOpsiBarang = async (jenis) => {
    if (!jenis) {
      setOpsiBarang([]);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const path = jenis.toLowerCase();
      const res = await fetch(
        `${API_BASE_URLS.FARM}/farm/kebun/inventaris/${path}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        console.log(`[DEBUG] Data ${jenis.toUpperCase()} dari BE:`, data); // Lihat di Inspect Element -> Console
        const arrayData = Array.isArray(data)
          ? data
          : data.data || data.items || [];
        setOpsiBarang(arrayData);
      }
    } catch (e) {
      console.error("Gagal fetch barang", e);
    }
  };

  // ===================== LOGIC GET TRANSAKSI =====================
  const fetchRiwayatTransaksi = async () => {
    setIsLoadingTransaksi(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Fetch Riwayat Penjualan
      const resJual = await fetch(API_ENDPOINTS.FARM.KEBUN.TRANSAKSI.JUAL, {
        method: "GET",
        headers,
      });
      if (resJual.ok) {
        const dataJual = await resJual.json();
        setRiwayatJual(dataJual);
      }

      // Fetch Riwayat Peminjaman
      const resPinjam = await fetch(
        API_ENDPOINTS.FARM.KEBUN.TRANSAKSI.PINJAMKAN,
        { method: "GET", headers },
      );
      if (resPinjam.ok) {
        const dataPinjam = await resPinjam.json();
        setRiwayatPinjam(dataPinjam);
      }
    } catch (error) {
      console.error("Error fetching riwayat transaksi:", error);
    } finally {
      setIsLoadingTransaksi(false);
    }
  };

  // ===================== LOGIC PENGURUS (GET, POST, PATCH, DELETE) =====================

  // GET PENGURUS
  const fetchPengurus = async () => {
    setIsLoadingPengurus(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.USER.KEBUN.PENGURUS.MAIN, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPengurusList(data);
      } else {
        console.error("Gagal mengambil data pengurus");
      }
    } catch (error) {
      console.error("Error fetching pengurus:", error);
    } finally {
      setIsLoadingPengurus(false);
    }
  };

  // GET DOKUMEN YANG SUDAH DI-UPLOAD (PROGRESSIVE RENDERING)
  const fetchDokumenExisting = async () => {
    const token = localStorage.getItem("token");

    // Kita gunakan forEach agar setiap fetch jalan sendiri-sendiri secara paralel,
    // tanpa memblokir atau menunggu dokumen yang lain selesai (Promise.all dihapus).
    DOKUMEN_CONFIG.forEach(async (docConfig, index) => {
      if (docConfig.code === "P4_1_HARGA") {
        setDokumenStatus((prevDocs) => {
          const newDocs = [...prevDocs];
          newDocs[index] = {
            ...newDocs[index],
            isFetchingData: false, // Langsung matikan loading
            file_url: null,
            status: "SISTEM", // Status penanda
          };
          return newDocs;
        });
        return; // Hentikan eksekusi di sini agar tidak memanggil fetch() ke bawah
      }

      try {
        const url = `${API_ENDPOINTS.ISPO.KEBUN.SUBMISSION}/${docConfig.code}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const dataServer = await response.json();
          // Begitu data 1 dokumen tiba, LANGSUNG update state-nya
          setDokumenStatus((prevDocs) => {
            const newDocs = [...prevDocs];
            newDocs[index] = {
              ...newDocs[index],
              file_url: dataServer.file_url,
              status: dataServer.status,
              isFetchingData: false, // Matikan loading khusus untuk dokumen ini
            };
            return newDocs;
          });
        } else if (response.status === 404) {
          // Jika 404, artinya belum di-upload. Matikan loading, kembalikan ke state awal
          setDokumenStatus((prevDocs) => {
            const newDocs = [...prevDocs];
            newDocs[index] = {
              ...newDocs[index],
              file_url: null,
              status: null,
              isFetchingData: false, // Matikan loading
            };
            return newDocs;
          });
        } else {
          // Error lain (500, dll), matikan loading agar tidak stuck
          setDokumenStatus((prevDocs) => {
            const newDocs = [...prevDocs];
            newDocs[index] = { ...newDocs[index], isFetchingData: false };
            return newDocs;
          });
        }
      } catch (err) {
        console.error(`Gagal fetch dokumen ${docConfig.code}:`, err);
        // Error jaringan, matikan loading
        setDokumenStatus((prevDocs) => {
          const newDocs = [...prevDocs];
          newDocs[index] = { ...newDocs[index], isFetchingData: false };
          return newDocs;
        });
      }
    });
  };

  // --- FETCH SEMUA DATA SAAT HALAMAN PERTAMA KALI DIBUKA ---
  useEffect(() => {
    // Jalankan semua fetch secara paralel agar tidak saling menunggu
    const fetchAllData = async () => {
      // Data untuk tab Transaksi
      fetchOpsiPetani();
      fetchOpsiPeralatan();
      fetchRiwayatTransaksi();

      // Data untuk tab Organisasi
      fetchPengurus();
      fetchDokumenExisting();
    };

    fetchAllData();
  }, []);

  // HANDLER FORM PENGURUS
  const handleAddPengurus = () => {
    setIsEditMode(false);
    setFormData({
      nama_anggota: "",
      jabatan_pengurus: "",
      tugas_pengurus: "",
      no_hp: "",
    });
    setShowModalPengurus(true);
  };

  const handleEditPengurus = (item) => {
    setIsEditMode(true);
    setSelectedId(item.id);
    setFormData({
      nama_anggota: item.nama_anggota,
      jabatan_pengurus: item.jabatan_pengurus,
      tugas_pengurus: item.tugas_pengurus || "",
      no_hp: item.no_hp || "",
    });
    setShowModalPengurus(true);
  };

  const handleSubmitPengurus = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      let url = API_ENDPOINTS.USER.KEBUN.PENGURUS.MAIN;
      let method = "POST";

      if (isEditMode && selectedId) {
        url = API_ENDPOINTS.USER.KEBUN.PENGURUS.BY_ID(selectedId);
        method = "PATCH";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast.success("Data pengurus berhasil disimpan!");
        setShowModalPengurus(false);
        fetchPengurus();
      } else {
        showToast.error("Gagal menyimpan data pengurus.");
      }
    } catch (error) {
      console.error("Error submitting:", error);
    }
  };

  const handleDeletePengurus = async (id) => {
    // Menggunakan confirmDialog dari notif.js
    const isSetuju = await confirmDialog({
      title: "Yakin ingin menghapus?",
      text: "Data pengurus ini akan terhapus dari sistem.",
      confirmText: "Ya, Hapus!",
      isDanger: true,
    });

    if (!isSetuju) return; // Batalkan jika user klik 'Batal'

    try {
      const token = localStorage.getItem("token");
      const url = API_ENDPOINTS.USER.KEBUN.PENGURUS.BY_ID(id);

      const response = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast.success("Pengurus berhasil dihapus!");
        fetchPengurus();
      } else {
        showToast.error("Gagal menghapus data pengurus.");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      showToast.error("Terjadi kesalahan jaringan.");
    }
  };

  // ===================== LOGIC FORM TBS (DINAMIS SESUAI BE) =====================
  const handleTBSChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setTbsFormData({ ...tbsFormData, file: files[0] });
    } else {
      setTbsFormData({ ...tbsFormData, [name]: value });
    }
  };

  const handleSubmitTBS = async (e) => {
    e.preventDefault();

    // Validasi Tambahan
    if (!tbsFormData.file) {
      showToast.error("Mohon upload file SK Pemerintah.");
      return;
    }
    if (
      isNaN(parseInt(tbsFormData.bulan)) ||
      isNaN(parseInt(tbsFormData.tahun))
    ) {
      showToast.error("Format Bulan atau Tahun salah.");
      return;
    }

    setIsSubmittingTBS(true);

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      formDataToSend.append("periode_bulan", parseInt(tbsFormData.bulan));
      formDataToSend.append("periode_tahun", parseInt(tbsFormData.tahun));
      formDataToSend.append("harga_per_kg", parseFloat(tbsFormData.harga));
      formDataToSend.append("file", tbsFormData.file);

      const url = API_ENDPOINTS.FARM.KEBUN.TRANSAKSI.HARGA_TBS;

      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (response.ok) {
        showToast.success("Data Harga TBS berhasil dikirim!");
        setShowModalTBS(false);
        setTbsFormData({ bulan: "", tahun: "", harga: "", file: null });
      } else {
        const errorData = await response.json();
        showToast.error(
          `Gagal mengirim: ${errorData.detail || "Cek input Anda"}`,
        );
      }
    } catch (error) {
      console.error("Error submitting TBS:", error);
      showToast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmittingTBS(false);
    }
  };

  // ===================== LOGIC TRANSAKSI (JUAL BARANG) =====================
  const handleSubmitJual = async (e) => {
    e.preventDefault();
    setIsSubmittingJual(true);

    // 1. CEGAH ERROR 422: Validasi angka
    const parsedPetaniId = parseInt(jualFormData.petani_user_id);
    const parsedItemId = parseInt(jualFormData.dinamis_item_id);
    const parsedJumlah = parseFloat(jualFormData.jumlah);

    if (isNaN(parsedPetaniId) || isNaN(parsedItemId) || isNaN(parsedJumlah)) {
      showToast.error(
        "Harap pilih Petani, Barang, dan isi Jumlah dengan benar!",
      );
      setIsSubmittingJual(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        petani_user_id: parsedPetaniId,
        jenis_barang: jualFormData.jenis_barang,
        dinamis_item_id: parsedItemId,
        jumlah: parsedJumlah,
        total_harga: jualFormData.total_harga
          ? parseFloat(jualFormData.total_harga)
          : null,
      };

      const response = await fetch(
        `${API_BASE_URLS.FARM}/farm/kebun/transaksi/jual`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        showToast.success("Berhasil mencatat penjualan barang!");
        setShowModalJual(false);
        setJualFormData({
          petani_user_id: "",
          jenis_barang: "",
          dinamis_item_id: "",
          jumlah: "",
          total_harga: "",
        });
        fetchRiwayatTransaksi();
      } else {
        const errorData = await response.json();
        showToast.error(`Gagal Jual: ${errorData.detail || "Cek input Anda"}`);
      }
    } catch (error) {
      console.error("Error submit jual:", error);
      showToast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmittingJual(false);
    }
  };

  // ===================== LOGIC TRANSAKSI (PINJAM ALAT) =====================
  const handleSubmitPinjam = async (e) => {
    e.preventDefault();
    setIsSubmittingPinjam(true);

    // 1. CEGAH ERROR 422: Validasi angka
    const parsedPetaniId = parseInt(pinjamFormData.petani_user_id);
    const parsedAlatId = parseInt(pinjamFormData.dinamis_peralatan_id);
    const parsedJumlah = parseInt(pinjamFormData.jumlah_dipinjam);

    if (isNaN(parsedPetaniId) || isNaN(parsedAlatId) || isNaN(parsedJumlah)) {
      showToast.error(
        "Harap pilih Petani, Peralatan, dan isi Jumlah dengan benar!",
      );
      setIsSubmittingPinjam(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        petani_user_id: parsedPetaniId,
        dinamis_peralatan_id: parsedAlatId,
        jumlah_dipinjam: parsedJumlah,
        tanggal_peminjaman: pinjamFormData.tanggal_peminjaman,
      };

      const response = await fetch(
        `${API_BASE_URLS.FARM}/farm/kebun/transaksi/pinjamkan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        showToast.success("Berhasil mencatat peminjaman alat!");
        setShowModalPinjam(false);
        setPinjamFormData({
          petani_user_id: "",
          dinamis_peralatan_id: "",
          jumlah_dipinjam: "",
          tanggal_peminjaman: "",
        });
        fetchRiwayatTransaksi();
      } else {
        const errorData = await response.json();
        showToast.error(
          `Gagal Pinjam: ${errorData.detail || "Cek input Anda"}`,
        );
      }
    } catch (error) {
      console.error("Error submit pinjam:", error);
      showToast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmittingPinjam(false);
    }
  };

  // ===================== LOGIC UPLOAD DOKUMEN (SESUAI BE MAHAR) =====================

  // Fungsi Upload ke Endpoint /submission
  const handleUploadDokumen = async (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Ambil requirement_code dari state berdasarkan index
    const targetDoc = dokumenStatus[index];
    const requirementCode = targetDoc.code;

    // Panggil toast loading
    showToast.loading("Sedang mengunggah dokumen...");

    const newDocs = [...dokumenStatus];
    newDocs[index].isUploading = true;
    setDokumenStatus(newDocs);

    try {
      const token = localStorage.getItem("token");

      const formDataUpload = new FormData();
      formDataUpload.append("requirement_code", requirementCode);
      formDataUpload.append("file", file);

      const response = await fetch(API_ENDPOINTS.ISPO.KEBUN.SUBMISSION, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      if (response.ok) {
        const result = await response.json();

        // Update state lokal jika sukses
        const updatedDocs = [...dokumenStatus];
        updatedDocs[index].file_url = result.url;
        updatedDocs[index].status = result.status;
        updatedDocs[index].isUploading = false;
        setDokumenStatus(updatedDocs);

        showToast.success("Berhasil mengunggah dokumen ISPO!");
        await fetchDokumenExisting();
      } else {
        const errorData = await response.json();
        showToast.error(
          `Gagal upload: ${errorData.detail || "Terjadi kesalahan"}`,
        );

        const updatedDocs = [...dokumenStatus];
        updatedDocs[index].isUploading = false;
        setDokumenStatus(updatedDocs);
      }
    } catch (error) {
      console.error("Error upload:", error);
      showToast.error("Terjadi kesalahan jaringan saat mengunggah.");

      const updatedDocs = [...dokumenStatus];
      updatedDocs[index].isUploading = false;
      setDokumenStatus(updatedDocs);
    } finally {
      showToast.dismiss();
    }
  };

  // Handler Lihat Dokumen
  const handleViewDocument = (url) => {
    if (url) {
      // Gunakan getFileUrl dan secara eksplisit beri tahu ini adalah service "ISPO"
      const fullUrl = getFileUrl(url, "ISPO");

      // Buka URL lengkap di tab baru
      window.open(fullUrl, "_blank");
    }
  };

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans relative">
      {/* --- HEADER & TAB SWITCHER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            {activeTab === "transaksi" ? (
              <ClipboardList className="w-8 h-8 text-[#B5302D]" />
            ) : (
              <Users className="w-8 h-8 text-[#B5302D]" />
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Manajemen Operasional
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              {activeTab === "transaksi"
                ? "Kelola penjualan barang dan peminjaman inventaris."
                : "Kelola struktur organisasi dan dokumen legalitas."}
            </p>
          </div>
        </div>

        {/* Custom Tab Switcher */}
        <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto">
          <button
            // --- UBAH ONCLICK MENJADI NAVIGATE ---
            onClick={() => navigate("/kebun/manajemenoperasional/transaksi")}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "transaksi"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="sm:inline">Transaksi</span>
          </button>

          <button
            // --- UBAH ONCLICK MENJADI NAVIGATE ---
            onClick={() => navigate("/kebun/manajemenoperasional/organisasi")}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "organisasi"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500"
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="sm:inline">Organisasi</span>
          </button>
        </div>
      </div>

      {/* --- GARIS PEMBATAS --- */}
      <hr className="border-gray-200 mb-8" />

      {/* --- MAIN CONTENT AREA --- */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {/* ================= TRANSAKSI (DYNAMIC) ================= */}
        {activeTab === "transaksi" && (
          <>
            {/* SECTION 1 PENJUALAN BARANG */}
            <SectionCard title="Penjualan Barang">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs text-gray-500">
                  Tabel riwayat penjualan barang ke petani/anggota.
                </p>
                <button
                  onClick={() => setShowModalJual(true)}
                  className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg shadow-green-100 transition-all"
                >
                  <Plus className="w-3 h-3" /> Jual Barang
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EF8523] text-white text-[11px] uppercase tracking-wider">
                      <th className="p-4 font-bold rounded-tl-xl">No</th>
                      <th className="p-4 font-bold">Nama Petani</th>
                      <th className="p-4 font-bold">Tgl Pembelian</th>
                      <th className="p-4 font-bold">Jenis</th>
                      <th className="p-4 font-bold">Nama Barang</th>
                      <th className="p-4 font-bold">Jumlah</th>
                      <th className="p-4 font-bold">Total Harga</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-700 bg-white">
                    {isLoadingTransaksi ? (
                      <tr>
                        <td colSpan="6" className="p-4 text-center font-bold">
                          Memuat data...
                        </td>
                      </tr>
                    ) : riwayatJual.length > 0 ? (
                      riwayatJual.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                        >
                          <td className="p-4 font-bold text-center">
                            {index + 1}
                          </td>
                          <td className="p-4 font-medium">
                            {item.nama_petani || "Tidak Diketahui"}
                          </td>
                          <td className="p-4 text-gray-500">
                            {item.tanggal_pembelian}
                          </td>
                          <td className="p-4">
                            <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold text-gray-600">
                              {item.jenis_barang}
                            </span>
                          </td>
                          <td className="p-4 font-bold">
                            {item.nama_barang_tercatat}
                          </td>
                          <td className="p-4">{item.jumlah}</td>
                          <td className="p-4 font-bold text-[#B5302D]">
                            {item.total_harga
                              ? `Rp ${item.total_harga.toLocaleString("id-ID")}`
                              : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="p-4 text-center">
                          Belum ada riwayat penjualan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {/* SECTION 2 PEMINJAMAN */}
            <SectionCard title="Peminjaman Inventaris">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs text-gray-500">
                  Tabel riwayat peminjaman aset kebun.
                </p>
                <button
                  onClick={() => setShowModalPinjam(true)}
                  className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg shadow-green-100 transition-all"
                >
                  <Plus className="w-3 h-3" /> Peminjaman
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EF8523] text-white text-[11px] uppercase tracking-wider">
                      <th className="p-4 font-bold rounded-tl-xl">No</th>
                      <th className="p-4 font-bold">Nama Peminjam</th>
                      <th className="p-4 font-bold">Tgl Pinjam</th>
                      <th className="p-4 font-bold">Nama Barang</th>
                      <th className="p-4 font-bold text-center">
                        Jumlah Dipinjam
                      </th>
                      <th className="p-4 font-bold text-center">
                        Jumlah Kembali
                      </th>
                      <th className="p-4 font-bold rounded-tr-xl">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-700 bg-white">
                    {isLoadingTransaksi ? (
                      <tr>
                        <td colSpan="6" className="p-4 text-center font-bold">
                          Memuat data...
                        </td>
                      </tr>
                    ) : riwayatPinjam.length > 0 ? (
                      riwayatPinjam.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                        >
                          <td className="p-4 font-bold text-center">
                            {index + 1}
                          </td>
                          <td className="p-4 font-medium">
                            {item.nama_petani || "Tidak Diketahui"}
                          </td>
                          <td className="p-4 text-gray-500">
                            {item.tanggal_peminjaman}
                          </td>
                          <td className="p-4 font-bold">
                            {item.dinamis_peralatan?.nama_alat ||
                              item.dinamis_peralatan?.nama ||
                              "Alat"}
                          </td>
                          <td className="p-4 text-center font-bold text-orange-600">
                            {item.jumlah_dipinjam}
                          </td>
                          <td className="p-4 text-center font-bold text-green-600">
                            {item.jumlah_dikembalikan}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                                item.status === "DIPINJAMKAN" ||
                                item.status === "DIPINJAM"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-green-50 text-green-700 border-green-200"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-4 text-center">
                          Belum ada riwayat peminjaman.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </>
        )}

        {/* ================= ORGANISASI ================= */}
        {activeTab === "organisasi" && (
          <>
            {/* SECTION 1 DAFTAR PENGURUS (DYNAMIC CRUD EXISTING) */}
            <SectionCard title="Daftar Anggota Pengurus">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs text-gray-500">
                  Struktur organisasi kelompok tani.
                </p>
                <button
                  onClick={handleAddPengurus}
                  className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg shadow-green-100 transition-all"
                >
                  <Plus className="w-3 h-3" /> Tambah
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EF8523] text-white text-[11px] uppercase tracking-wider">
                      <th className="p-4 font-bold rounded-tl-xl">No</th>
                      <th className="p-4 font-bold">Nama Anggota</th>
                      <th className="p-4 font-bold">Jabatan</th>
                      <th className="p-4 font-bold">No. HP</th>
                      <th className="p-4 font-bold">Tugas & Tanggung Jawab</th>
                      <th className="p-4 font-bold text-center rounded-tr-xl">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-700 bg-white">
                    {isLoadingPengurus ? (
                      <tr>
                        <td colSpan="6" className="p-4 text-center font-bold">
                          Memuat data...
                        </td>
                      </tr>
                    ) : pengurusList.length > 0 ? (
                      pengurusList.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                        >
                          <td className="p-4 font-bold text-center">
                            {index + 1}
                          </td>
                          <td className="p-4 font-bold">{item.nama_anggota}</td>
                          <td className="p-4 font-medium text-[#B5302D]">
                            {item.jabatan_pengurus}
                          </td>
                          <td className="p-4 text-gray-500">
                            {item.no_hp || "-"}
                          </td>
                          <td className="p-4 text-gray-500">
                            {item.tugas_pengurus}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditPengurus(item)}
                                className="p-2 bg-gray-100 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePengurus(item.id)}
                                className="p-2 bg-gray-100 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-4 text-center">
                          Belum ada data pengurus.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {/* SECTION 2 DOKUMEN ORGANISASI (DINAMIS SESUAI BE MAHAR) */}
            <SectionCard title="Kelengkapan Dokumen ISPO untuk Petani Mitra">
              <div className="-mt-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div className="max-w-3xl">
                  <h4 className="text-gray-900 font-bold text-sm sm:text-base mb-1.5">
                    Upload Dokumen Sertifikasi
                  </h4>
                  <p className="text-[13px] text-gray-500 font-normal leading-relaxed">
                    Pastikan semua dokumen yang dibutuhkan untuk memenuhi
                    standar Indonesian Sustainable Palm Oil (ISPO) telah
                    diunggah dengan lengkap dan benar sesuai dengan kriteria
                    yang berlaku.
                  </p>
                </div>
              </div>

              {/* LIST DOKUMEN DENGAN GROUPING BERDASARKAN PRINSIP DAN KRITERIA */}
              <div className="space-y-12">
                {/* 1. Looping Berdasarkan Prinsip */}
                {Array.from(new Set(dokumenStatus.map((d) => d.prinsip))).map(
                  (namaPrinsip, prinsipIdx) => {
                    // Regex untuk memisahkan "Prinsip X" dan teks sisanya
                    const prinsipMatch = namaPrinsip.match(
                      /^(Prinsip \d+)\.\s*(.*)/,
                    );
                    const prinsipNumber = prinsipMatch ? prinsipMatch[1] : "";
                    const prinsipText = prinsipMatch
                      ? prinsipMatch[2]
                      : namaPrinsip;

                    const docsInPrinsip = dokumenStatus.filter(
                      (d) => d.prinsip === namaPrinsip,
                    );
                    const kriteriaList = Array.from(
                      new Set(docsInPrinsip.map((d) => d.kriteria)),
                    );

                    return (
                      <div key={prinsipIdx} className="relative">
                        {/* Judul Level 1 (Prinsip) - Minimalist & Elegant */}
                        <div className="mb-6 flex items-center gap-3">
                          <div className="h-8 w-1.5 bg-[#B5302D] rounded-full shrink-0"></div>
                          <h3 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
                            <span className="text-[#B5302D] mr-2 uppercase tracking-wider text-sm md:text-base">
                              {prinsipNumber}
                            </span>
                            <span className="text-gray-800">{prinsipText}</span>
                          </h3>
                        </div>

                        {/* 2. Looping Berdasarkan Kriteria */}
                        <div className="grid grid-cols-1 gap-6">
                          {kriteriaList.map((namaKriteria, kriteriaIdx) => {
                            const docsInKriteria = docsInPrinsip.filter(
                              (d) => d.kriteria === namaKriteria,
                            );

                            // Ekstrak Kriteria X.X
                            const kriteriaMatch = namaKriteria.match(
                              /^(Kriteria \d+\.\d+)\s*(.*)/,
                            );
                            const kriteriaNumber = kriteriaMatch
                              ? kriteriaMatch[1]
                              : "";
                            const kriteriaText = kriteriaMatch
                              ? kriteriaMatch[2]
                              : namaKriteria;

                            return (
                              <div
                                key={kriteriaIdx}
                                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                              >
                                {/* Header Level 2 (Kriteria) - Clean White */}
                                <div className="bg-white px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                  {kriteriaNumber && (
                                    <span className="bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-extrabold px-3 py-1 rounded-full shrink-0 uppercase tracking-widest">
                                      {kriteriaNumber}
                                    </span>
                                  )}
                                  <h4 className="text-sm font-bold text-gray-800 leading-snug">
                                    {kriteriaText}
                                  </h4>
                                </div>

                                {/* 3. Render Dokumen dalam Kriteria */}
                                <div className="divide-y divide-gray-100">
                                  {docsInKriteria.map((doc) => {
                                    const originalIndex =
                                      dokumenStatus.findIndex(
                                        (d) => d.id === doc.id,
                                      );
                                    const isUploaded = !!doc.file_url;

                                    return (
                                      <div
                                        key={doc.id}
                                        // Hapus class "group" agar efek hover tidak menyebar ke anak elemen
                                        className={`p-5 sm:p-6 flex flex-col md:flex-row md:items-start gap-5 transition-all duration-300 ${
                                          isUploaded
                                            ? "bg-emerald-50/20"
                                            : "hover:bg-gray-50/80"
                                        }`}
                                      >
                                        {/* Ikon Status & Informasi Dokumen */}
                                        <div className="flex-1 flex items-start gap-4 sm:gap-5 min-w-0">
                                          <div
                                            // Hapus group-hover kuning, ganti dengan warna statis yang elegan
                                            className={`mt-1 p-3 rounded-xl flex-shrink-0 transition-all duration-300 ${
                                              isUploaded
                                                ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
                                                : "bg-gray-50 text-gray-400 border border-gray-200"
                                            }`}
                                          >
                                            {/* IKON SELALU TETAP FILETEXT (Sesuai Permintaan) */}
                                            <FileText className="w-5 h-5" />
                                          </div>

                                          <div className="flex-1 min-w-0 space-y-1.5">
                                            {doc.subKriteria && (
                                              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                                                {doc.subKriteria}
                                              </p>
                                            )}

                                            <h5 className="text-[14px] font-bold text-gray-900 leading-snug">
                                              {doc.label}
                                            </h5>

                                            <p className="text-[12px] text-gray-500 leading-relaxed max-w-3xl pb-1">
                                              {doc.deskripsi}
                                            </p>

                                            {/* --- UPDATE STATUS BADGE DI SINI --- */}
                                            <div className="pt-1.5">
                                              {doc.code === "P4_1_HARGA" ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                                  <FileText className="w-3 h-3" />{" "}
                                                  Dikelola via Input Manual
                                                </span>
                                              ) : doc.isFetchingData ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-500 border border-blue-100">
                                                  <Loader2 className="w-3 h-3 animate-spin" />{" "}
                                                  Memeriksa status...
                                                </span>
                                              ) : isUploaded ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                  <CheckCircle className="w-3 h-3" />{" "}
                                                  Diunggah (
                                                  {doc.status || "APPROVED"})
                                                </span>
                                              ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-200">
                                                  Menunggu Unggahan
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Area Aksi (Kanan) - Buttons Clean Outline */}
                                        <div className="flex flex-col gap-2.5 md:w-40 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 shrink-0">
                                          {/* --- TOMBOL KHUSUS UNTUK INPUT HARGA TBS --- */}
                                          {doc.code === "P4_1_HARGA" && (
                                            <button
                                              onClick={() =>
                                                setShowModalTBS(true)
                                              }
                                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-[#EF8523] hover:bg-orange-100 text-xs font-bold transition-all shadow-sm"
                                              title="Input Harga TBS"
                                            >
                                              <FileText className="w-4 h-4" />{" "}
                                              Input Data TBS
                                            </button>
                                          )}

                                          <div className="flex flex-row md:flex-col gap-2.5">
                                            {/* Tombol Lihat */}
                                            {isUploaded && (
                                              <button
                                                onClick={() =>
                                                  handleViewDocument(
                                                    doc.file_url,
                                                  )
                                                }
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all shadow-sm"
                                                title="Lihat Dokumen"
                                              >
                                                <Search className="w-4 h-4" />{" "}
                                                Lihat File
                                              </button>
                                            )}

                                            {/* --- TOMBOL UPLOAD REGULER --- */}
                                            {doc.code !== "P4_1_HARGA" && (
                                              <label
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm border ${
                                                  doc.isUploading
                                                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                                    : isUploaded
                                                      ? "bg-white border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                                                      : "bg-white border-gray-200 text-gray-700 hover:border-[#B5302D] hover:text-[#B5302D] hover:bg-red-50"
                                                }`}
                                              >
                                                <input
                                                  type="file"
                                                  className="hidden"
                                                  onChange={(e) =>
                                                    handleUploadDokumen(
                                                      originalIndex,
                                                      e,
                                                    )
                                                  }
                                                  disabled={doc.isUploading}
                                                />
                                                {doc.isUploading ? (
                                                  <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />{" "}
                                                    Proses...
                                                  </>
                                                ) : (
                                                  <>
                                                    <Upload className="w-4 h-4" />{" "}
                                                    {isUploaded
                                                      ? "Ubah File"
                                                      : "Unggah File"}
                                                  </>
                                                )}
                                              </label>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </SectionCard>
          </>
        )}
      </div>

      {/* --- MODAL PENGURUS --- */}
      {showModalPengurus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowModalPengurus(false)}
          />
          <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            {/* Header Modal */}
            <div className="bg-[#EF8523] p-5 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <h3 className="font-bold text-lg flex items-center gap-2 relative z-10">
                <Users className="w-5 h-5" />{" "}
                {isEditMode ? "Edit Pengurus" : "Tambah Pengurus Baru"}
              </h3>
              <button
                onClick={() => setShowModalPengurus(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPengurus} className="p-6 space-y-4">
              {/* Nama Anggota */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                  Nama Anggota <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_anggota}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_anggota: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              {/* Jabatan & No HP */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jabatan_pengurus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jabatan_pengurus: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all"
                    placeholder="Contoh: Ketua"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                    No. HP
                  </label>
                  <input
                    type="text"
                    value={formData.no_hp}
                    onChange={(e) =>
                      setFormData({ ...formData, no_hp: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all"
                    placeholder="0812..."
                  />
                </div>
              </div>

              {/* Tugas & Tanggung Jawab */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                  Tugas & Tanggung Jawab
                </label>
                <textarea
                  rows="3"
                  value={formData.tugas_pengurus}
                  onChange={(e) =>
                    setFormData({ ...formData, tugas_pengurus: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all resize-none"
                  placeholder="Jelaskan secara singkat..."
                />
              </div>

              {/* Tombol Aksi */}
              <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModalPengurus(false)}
                  className="flex-1 py-3 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold text-white bg-[#EF8523] hover:bg-[#d6731b] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL HARGA TBS --- */}
      {showModalTBS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowModalTBS(false)}
          />
          <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            {/* Header Modal */}
            <div className="bg-[#EF8523] p-5 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <h3 className="font-bold text-lg flex items-center gap-2 relative z-10">
                <FileText className="w-5 h-5" /> Input SK TBS
              </h3>
              <button
                onClick={() => setShowModalTBS(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTBS} className="p-6 space-y-4">
              {/* Row Bulan & Tahun */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                    Bulan <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="bulan"
                    required
                    value={tbsFormData.bulan}
                    onChange={handleTBSChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all"
                  >
                    <option value="">Pilih...</option>
                    <option value="1">Januari</option>
                    <option value="2">Februari</option>
                    <option value="3">Maret</option>
                    <option value="4">April</option>
                    <option value="5">Mei</option>
                    <option value="6">Juni</option>
                    <option value="7">Juli</option>
                    <option value="8">Agustus</option>
                    <option value="9">September</option>
                    <option value="10">Oktober</option>
                    <option value="11">November</option>
                    <option value="12">Desember</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                    Tahun <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="tahun"
                    required
                    value={tbsFormData.tahun}
                    onChange={handleTBSChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all"
                    placeholder="Contoh: 2026"
                  />
                </div>
              </div>

              {/* Input Harga */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                  Harga per Kg (Rp) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold text-sm">Rp</span>
                  </div>
                  <input
                    type="number"
                    name="harga"
                    step="0.01"
                    required
                    value={tbsFormData.harga}
                    onChange={handleTBSChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all"
                    placeholder="2500"
                  />
                </div>
              </div>

              {/* Input File SK */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                  Upload SK (.pdf) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".pdf"
                  required
                  onChange={handleTBSChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#EF8523] file:text-white hover:file:bg-[#d6731b] cursor-pointer"
                />
              </div>

              {/* Tombol Aksi */}
              <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModalTBS(false)}
                  className="flex-1 py-3 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTBS}
                  className="flex-1 py-3 text-xs font-bold text-white bg-[#EF8523] hover:bg-[#d6731b] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmittingTBS ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Proses...
                    </>
                  ) : (
                    "Simpan Data"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL FORM JUAL BARANG --- */}
      {showModalJual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowModalJual(false)}
          />
          <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            {/* Header Modal */}
            <div className="bg-[#EF8523] p-5 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <h3 className="font-bold text-lg flex items-center gap-2 relative z-10">
                <ShoppingCart className="w-5 h-5" /> Catat Penjualan Barang
              </h3>
              <button
                onClick={() => setShowModalJual(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitJual} className="p-6 space-y-4">
              {/* Pilih Petani */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                  Pilih Petani <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={jualFormData.petani_user_id}
                  onChange={(e) =>
                    setJualFormData({
                      ...jualFormData,
                      petani_user_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all"
                >
                  <option value="">-- Pilih Petani --</option>
                  {opsiPetani.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_lengkap}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jenis Barang */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                  Jenis Barang <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={jualFormData.jenis_barang}
                  onChange={(e) => {
                    const jenis = e.target.value;
                    setJualFormData({
                      ...jualFormData,
                      jenis_barang: jenis,
                      dinamis_item_id: "",
                    });
                    fetchOpsiBarang(jenis);
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all"
                >
                  <option value="">-- Pilih Jenis --</option>
                  <option value="Bibit">Bibit</option>
                  <option value="Pupuk">Pupuk</option>
                  <option value="Pestisida">Pestisida</option>
                </select>
              </div>

              {/* Pilih Barang dari Inventaris */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                  Pilih Barang di Inventaris{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  disabled={!jualFormData.jenis_barang}
                  value={jualFormData.dinamis_item_id}
                  onChange={(e) =>
                    setJualFormData({
                      ...jualFormData,
                      dinamis_item_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] disabled:bg-gray-200 transition-all"
                >
                  <option value="">
                    {jualFormData.jenis_barang
                      ? "-- Pilih Barang --"
                      : "Pilih Jenis Barang Dulu"}
                  </option>

                  {opsiBarang.length === 0 && jualFormData.jenis_barang && (
                    <option value="" disabled>
                      -- Stok Kosong di Inventaris Barang Anda! --
                    </option>
                  )}

                  {opsiBarang.map((b, index) => {
                    let itemId = "";
                    if (jualFormData.jenis_barang === "Bibit") {
                      itemId =
                        b.dinamis_varietas_id ??
                        b.dinamis_varietas_bibit?.id ??
                        b.id;
                    } else if (jualFormData.jenis_barang === "Pupuk") {
                      itemId = b.dinamis_pupuk_id ?? b.pupuk?.id ?? b.id;
                    } else if (jualFormData.jenis_barang === "Pestisida") {
                      itemId =
                        b.dinamis_pestisida_id ?? b.pestisida?.id ?? b.id;
                    } else {
                      itemId = b.id;
                    }

                    const itemName =
                      b.nama_varietas ||
                      b.nama_pupuk ||
                      b.nama_pestisida ||
                      b.nama_item ||
                      b.nama ||
                      "Item Tidak Bernama";

                    const sisa =
                      b.jumlah_tersisa_kg ??
                      b.jumlah_tersisa ??
                      b.jumlah_per_buah ??
                      b.jumlah ??
                      b.stok ??
                      0;

                    return (
                      <option key={b.id || `brg-${index}`} value={itemId}>
                        {itemName} (Sisa Stok: {sisa})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Jumlah dan Total Harga */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                    Jumlah Barang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={jualFormData.jumlah}
                    onChange={(e) =>
                      setJualFormData({
                        ...jualFormData,
                        jumlah: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                    Total Harga (Rp)
                  </label>
                  <input
                    type="number"
                    value={jualFormData.total_harga}
                    onChange={(e) =>
                      setJualFormData({
                        ...jualFormData,
                        total_harga: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModalJual(false)}
                  className="flex-1 py-3 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingJual}
                  className="flex-1 py-3 text-xs font-bold text-white bg-[#EF8523] hover:bg-[#d6731b] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmittingJual ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Proses...
                    </>
                  ) : (
                    "Catat Penjualan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL FORM PINJAM ALAT --- */}
      {showModalPinjam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowModalPinjam(false)}
          />
          <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            {/* Header Modal */}
            <div className="bg-[#EF8523] p-5 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <h3 className="font-bold text-lg flex items-center gap-2 relative z-10">
                <ClipboardList className="w-5 h-5" /> Catat Peminjaman Alat
              </h3>
              <button
                onClick={() => setShowModalPinjam(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPinjam} className="p-6 space-y-4">
              {/* Pilih Petani */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                  Pilih Petani <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={pinjamFormData.petani_user_id}
                  onChange={(e) =>
                    setPinjamFormData({
                      ...pinjamFormData,
                      petani_user_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all"
                >
                  <option value="">-- Pilih Petani --</option>
                  {opsiPetani.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_lengkap}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilih Peralatan */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                  Pilih Peralatan <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={pinjamFormData.dinamis_peralatan_id}
                  onChange={(e) =>
                    setPinjamFormData({
                      ...pinjamFormData,
                      dinamis_peralatan_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all"
                >
                  <option value="">-- Pilih Alat di Inventaris --</option>

                  {/* JIKA BE MENGIRIM ARRAY KOSONG */}
                  {opsiPeralatan.length === 0 && (
                    <option value="" disabled>
                      -- Stok Kosong di Inventaris Alat Anda!! --
                    </option>
                  )}

                  {opsiPeralatan.map((alat, index) => {
                    const alatId =
                      alat.dinamis_item_id ||
                      alat.id ||
                      alat.dinamis_peralatan_id;
                    const alatName =
                      alat.nama_item ||
                      alat.nama_peralatan ||
                      alat.nama_alat ||
                      alat.nama ||
                      "Alat Tidak Bernama";

                    // Mengambil nilai sisa stok sesuai dengan respons BE
                    const sisaAlat =
                      alat.jumlah_per_buah ??
                      alat.jumlah_tersisa ??
                      alat.jumlah ??
                      alat.stok ??
                      alat.total_stok ??
                      alat.sisa_stok ??
                      alat.stok_tersisa ??
                      0;

                    return (
                      <option key={alatId || `alat-${index}`} value={alatId}>
                        {alatName} (Sisa: {sisaAlat})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Row Jumlah dan Tanggal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                    Jumlah Dipinjam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={pinjamFormData.jumlah_dipinjam}
                    onChange={(e) =>
                      setPinjamFormData({
                        ...pinjamFormData,
                        jumlah_dipinjam: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-widest">
                    Tanggal Peminjaman <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={pinjamFormData.tanggal_peminjaman}
                    onChange={(e) =>
                      setPinjamFormData({
                        ...pinjamFormData,
                        tanggal_peminjaman: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] transition-all text-gray-700"
                  />
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModalPinjam(false)}
                  className="flex-1 py-3 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPinjam}
                  className="flex-1 py-3 text-xs font-bold text-white bg-[#EF8523] hover:bg-[#d6731b] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmittingPinjam ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Proses...
                    </>
                  ) : (
                    "Catat Peminjaman"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===================== COMPONENT HELPERS ===================== */

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden group hover:shadow-md transition-all">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />

    <h3 className="text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

export default Operasional;
