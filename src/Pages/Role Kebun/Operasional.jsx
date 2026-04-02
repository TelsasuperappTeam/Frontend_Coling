import React, { useState, useEffect } from "react";
import {
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
import { API_ENDPOINTS, API_BASE_URLS } from "../../config/constants.js";

// DATA KEGIATAN - TETAP STATIC
const MOCK_KEGIATAN = [
  {
    id: 1,
    kegiatan: "Rapat Anggota Tahunan (RAT)",
    tanggal: "10 Okt 2025",
    status: "Rencana",
  },
  {
    id: 2,
    kegiatan: "Pelatihan ISPO Batch 2",
    tanggal: "15 Okt 2025",
    status: "Rencana",
  },
];

/* ===================== DEFINISI REQUIREMENTS (SESUAI BE MAHAR) ===================== */
// Mapping Label Frontend ke Requirement Code Backend
const DOKUMEN_CONFIG = [
  {
    id: 1,
    label: "Berita acara pembentukan kelompok tani",
    code: "P2_2_1_BERITA_ACARA", // Code untuk backend
  },
  {
    id: 2,
    label: "Surat Bukti Keanggotaan Kelompok Tani/Koperasi",
    code: "P2_2_1_ANGGOTA", // Code untuk backend
  },
  {
    id: 3,
    label: "Akta Pendirian dan AD/ART",
    code: "P2_2_1_ADART", // Code untuk backend
  },
];

const Operasional = () => {
  const [activeTab, setActiveTab] = useState("transaksi"); // 'transaksi' | 'organisasi'

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

  // Panggil Fetch Petani & Peralatan otomatis saat tab transaksi aktif
  useEffect(() => {
    if (activeTab === "transaksi") {
      fetchOpsiPetani();
      fetchOpsiPeralatan();
    }
  }, [activeTab]);

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

  // GET DOKUMEN YANG SUDAH DI-UPLOAD (DYNAMIC ISPO)
  const fetchDokumenExisting = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(API_ENDPOINTS.ISPO.KEBUN.SUBMISSION, {
        method: "GET", // Mengambil data
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const dataServer = await response.json();

        // KITA GABUNGKAN DATA SERVER DENGAN CONFIG LOKAL
        setDokumenStatus((prevStatus) =>
          prevStatus.map((docConfig) => {
            const foundData = dataServer.find(
              (serverItem) => serverItem.requirement_code === docConfig.code,
            );

            if (foundData) {
              return {
                ...docConfig,
                file_url: foundData.file_url,
                status: foundData.status,
              };
            }
            return docConfig;
          }),
        );
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // FETCH DATA BERDASARKAN TAB AKTIF
  useEffect(() => {
    if (activeTab === "organisasi") {
      fetchPengurus();
      fetchDokumenExisting();
    } else if (activeTab === "transaksi") {
      fetchRiwayatTransaksi();
    }
  }, [activeTab]);

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
        setShowModalPengurus(false);
        fetchPengurus();
      } else {
        alert("Gagal menyimpan data pengurus.");
      }
    } catch (error) {
      console.error("Error submitting:", error);
    }
  };

  const handleDeletePengurus = async (id) => {
    if (!window.confirm("Apakah anda yakin ingin menghapus pengurus ini?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const url = API_ENDPOINTS.USER.KEBUN.PENGURUS.BY_ID(id);

      const response = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchPengurus();
      } else {
        alert("Gagal menghapus data.");
      }
    } catch (error) {
      console.error("Error deleting:", error);
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
      alert("Mohon upload file SK Pemerintah.");
      return;
    }
    // Pastikan bulan dan tahun adalah angka valid
    if (
      isNaN(parseInt(tbsFormData.bulan)) ||
      isNaN(parseInt(tbsFormData.tahun))
    ) {
      alert("Format Bulan atau Tahun salah.");
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        alert("Data Harga TBS berhasil dikirim!");
        setShowModalTBS(false);
        setTbsFormData({
          bulan: "",
          tahun: "",
          harga: "",
          file: null,
        });
      } else {
        const errorData = await response.json();
        console.log("Error Detail:", errorData);
        alert(
          `Gagal mengirim data: ${JSON.stringify(errorData.detail) || "Cek input Anda"}`,
        );
      }
    } catch (error) {
      console.error("Error submitting TBS:", error);
      alert("Terjadi kesalahan jaringan.");
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
      alert("Harap pilih Petani, Barang, dan isi Jumlah dengan benar!");
      setIsSubmittingJual(false);
      return; // Berhenti di sini, jangan tembak BE
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
        alert("Berhasil mencatat penjualan barang ke petani!");
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
        console.log("Error Jual:", errorData);
        alert(
          `Gagal Jual: ${JSON.stringify(errorData.detail) || "Cek input Anda"}`,
        );
      }
    } catch (error) {
      console.error("Error submit jual:", error);
      alert("Terjadi kesalahan jaringan.");
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
      alert("Harap pilih Petani, Peralatan, dan isi Jumlah dengan benar!");
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
        alert("Berhasil mencatat peminjaman alat ke petani!");
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
        console.log("Error Pinjam:", errorData);
        alert(
          `Gagal Pinjam: ${JSON.stringify(errorData.detail) || "Cek input Anda"}`,
        );
      }
    } catch (error) {
      console.error("Error submit pinjam:", error);
      alert("Terjadi kesalahan jaringan.");
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

    // Set status loading lokal
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

        alert("Berhasil upload dokumen!");
        fetchDokumenExisting();
      } else {
        const errorData = await response.json();
        alert(`Gagal upload: ${errorData.detail || "Terjadi kesalahan"}`);

        const updatedDocs = [...dokumenStatus];
        updatedDocs[index].isUploading = false;
        setDokumenStatus(updatedDocs);
      }
    } catch (error) {
      console.error("Error upload:", error);
      alert("Terjadi kesalahan jaringan saat upload.");

      const updatedDocs = [...dokumenStatus];
      updatedDocs[index].isUploading = false;
      setDokumenStatus(updatedDocs);
    }
  };

  // Handler Lihat Dokumen
  const handleViewDocument = (url) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans relative">
      {/* --- HEADER & TAB SWITCHER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            {activeTab === "transaksi" ? (
              <ShoppingCart className="w-8 h-8 text-[#B5302D]" />
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
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("transaksi")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "transaksi"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Penjualan/Peminjaman</span>
          </button>
          <button
            onClick={() => setActiveTab("organisasi")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "organisasi"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500"
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Organisasi</span>
          </button>
        </div>
      </div>

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
                      <th className="p-4 font-bold rounded-tr-xl">ID/Nota</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-700 bg-white">
                    {isLoadingTransaksi ? (
                      <tr>
                        <td colSpan="8" className="p-4 text-center">
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
                          <td className="p-4 text-gray-400 italic">
                            #{item.id}
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
                        <td colSpan="6" className="p-4 text-center">
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
                        <td colSpan="6" className="p-4 text-center">
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
            <SectionCard title="Kelengkapan Dokumen Organisasi">
              <div className="-mt-4 mb-6">
                {/* Garis Pemisah */}
                <div className="w-full h-[1px] bg-gray-300 mb-4 mt-2" />
                <p className="text-sm text-gray-500 font-light mb-4">
                  Upload Dokumen organisasi Untuk Petani Mitra
                </p>

                {/* TOMBOL TAMBAH HARGA TBS */}
                <button
                  onClick={() => setShowModalTBS(true)}
                  className="flex items-center gap-2 bg-[#D1F7C4] hover:bg-green-200 text-green-900 border border-green-300 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  <FileText className="w-4 h-4" /> Tambah Harga TBS
                </button>
              </div>

              {/* Grid Card Dokumen (SUDAH DINAMIS DENGAN FETCH EXISTING) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dokumenStatus.map((doc, idx) => {
                  const isUploaded = !!doc.file_url;
                  return (
                    <div
                      key={idx}
                      className={`group bg-white border rounded-xl p-4 flex flex-row items-center gap-4 transition-all hover:shadow-md ${
                        isUploaded
                          ? "border-green-400 bg-green-50/30"
                          : "border-gray-400"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-full flex-shrink-0 ${
                          isUploaded
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-500 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors"
                        }`}
                      >
                        {isUploaded ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <FileText className="w-6 h-6" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2">
                          {doc.label}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {isUploaded ? (
                            <span className="text-green-600 font-medium">
                              Sudah diupload ({doc.status})
                            </span>
                          ) : (
                            "Belum ada file"
                          )}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label
                          className={`cursor-pointer p-2 rounded-lg transition-colors border ${
                            doc.isUploading
                              ? "bg-gray-100 border-gray-200 text-gray-400"
                              : "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100"
                          }`}
                        >
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleUploadDokumen(idx, e)}
                            disabled={doc.isUploading}
                          />
                          {doc.isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </label>
                        {isUploaded && (
                          <button
                            onClick={() => handleViewDocument(doc.file_url)}
                            className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Lihat Dokumen"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </>
        )}
      </div>

      {/* --- MODAL PENGURUS --- */}
      {showModalPengurus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModalPengurus(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="bg-[#B5302D] p-5 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {isEditMode ? "Edit Pengurus" : "Tambah Pengurus Baru"}
              </h3>
              <button
                onClick={() => setShowModalPengurus(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPengurus} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nama Anggota
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_anggota}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_anggota: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  placeholder="Masukkan nama"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Jabatan
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
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    placeholder="Contoh: Ketua"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    No. HP
                  </label>
                  <input
                    type="text"
                    value={formData.no_hp}
                    onChange={(e) =>
                      setFormData({ ...formData, no_hp: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    placeholder="0812..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tugas & Tanggung Jawab
                </label>
                <textarea
                  rows="3"
                  value={formData.tugas_pengurus}
                  onChange={(e) =>
                    setFormData({ ...formData, tugas_pengurus: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                  placeholder="Jelaskan secara singkat..."
                />
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600 transition-colors"
                >
                  <Save className="w-4 h-4" /> Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowModalPengurus(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-800 bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  Batal
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
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModalTBS(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="bg-[#D1F7C4] p-5 text-green-900 border-b border-green-300 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" /> Input SK TBS
              </h3>
              <button
                onClick={() => setShowModalTBS(false)}
                className="p-1 hover:bg-green-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTBS} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Bulan
                  </label>
                  <select
                    name="bulan"
                    required
                    value={tbsFormData.bulan}
                    onChange={handleTBSChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tahun
                  </label>
                  <input
                    type="number"
                    name="tahun"
                    required
                    value={tbsFormData.tahun}
                    onChange={handleTBSChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                    placeholder="Contoh: 2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Harga per Kg (Rp)
                </label>
                <input
                  type="number"
                  name="harga"
                  step="0.01"
                  required
                  value={tbsFormData.harga}
                  onChange={handleTBSChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  placeholder="Contoh: 2500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Upload SK (.pdf)
                </label>
                <input
                  type="file"
                  name="file"
                  accept="application/pdf"
                  required
                  onChange={handleTBSChange}
                  className="w-full px-4 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 cursor-pointer"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingTBS}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
                >
                  {isSubmittingTBS ? "Mengupload..." : "Simpan Harga"}
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
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModalJual(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="bg-[#EF8523] p-5 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Catat Penjualan Barang</h3>
              <button
                onClick={() => setShowModalJual(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitJual} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
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
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                >
                  <option value="">-- Pilih Petani --</option>
                  {opsiPetani.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_lengkap}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Jenis Barang <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={jualFormData.jenis_barang}
                  onChange={(e) => {
                    const jenis = e.target.value;
                    // Reset dinamis_item_id jika jenis diganti, lalu fetch barang baru
                    setJualFormData({
                      ...jualFormData,
                      jenis_barang: jenis,
                      dinamis_item_id: "",
                    });
                    fetchOpsiBarang(jenis);
                  }}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                >
                  <option value="">-- Pilih Jenis --</option>
                  <option value="Bibit">Bibit</option>
                  <option value="Pupuk">Pupuk</option>
                  <option value="Pestisida">Pestisida</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
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
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none disabled:bg-gray-200"
                >
                  <option value="">
                    {jualFormData.jenis_barang
                      ? "-- Pilih Barang --"
                      : "Pilih Jenis Barang Dulu"}
                  </option>

                  {/* JIKA BE MENGIRIM ARRAY KOSONG (Stok di DB Habis/Belum diinput) */}
                  {opsiBarang.length === 0 && jualFormData.jenis_barang && (
                    <option value="" disabled>
                      -- Stok Kosong di Inventaris Barang Anda! --
                    </option>
                  )}

                  {opsiBarang.map((b, index) => {
                    let itemId = "";
                    if (jualFormData.jenis_barang === "Bibit") {
                      itemId = b.dinamis_varietas_id;
                    } else if (jualFormData.jenis_barang === "Pupuk") {
                      itemId = b.dinamis_pupuk_id;
                    } else if (jualFormData.jenis_barang === "Pestisida") {
                      itemId = b.dinamis_pestisida_id;
                    } else {
                      itemId = b.id;
                    }

                    // 2. AMBIL NAMA BARANG
                    const itemName =
                      b.nama_varietas ||
                      b.nama_pupuk ||
                      b.nama_pestisida ||
                      b.nama_item ||
                      b.nama ||
                      "Item Tidak Bernama";

                    const sisa =
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
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
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Total Harga
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
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingJual}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600"
                >
                  {isSubmittingJual ? "Memproses..." : "Catat Penjualan"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModalJual(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-800 bg-gray-200"
                >
                  Batal
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
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModalPinjam(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="bg-[#EF8523] p-5 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Catat Peminjaman Alat</h3>
              <button
                onClick={() => setShowModalPinjam(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitPinjam} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
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
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                >
                  <option value="">-- Pilih Petani --</option>
                  {opsiPetani.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_lengkap}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
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
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
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

                    // DI SINI KITA TAMBAHKAN "alat.jumlah_per_buah" SESUAI RESPONS BE TERBARU
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
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
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
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
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingPinjam}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600"
                >
                  {isSubmittingPinjam ? "Memproses..." : "Catat Peminjaman"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModalPinjam(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-800 bg-gray-200"
                >
                  Batal
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
