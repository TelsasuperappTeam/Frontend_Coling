import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Users,
  Plus,
  FileText,
  Calendar,
  Trash2,
  Edit,
  Upload,
  Search,
  CheckCircle,
  X,
  Save,
  Loader2, // Icon loading tambahan
} from "lucide-react";
import { API_ENDPOINTS } from "../../config/constants.js";

/* ===================== MOCK DATA (STATIC) ===================== */

// DATA TAB 1 TRANSAKSI (PENJUALAN & PEMINJAMAN) - TETAP STATIC
const MOCK_PENJUALAN = [
  {
    id: 1,
    petani: "Pak Budi",
    tanggal: "24 Sep 2025",
    jenis: "Pupuk",
    barang: "NPK Mutiara",
    jumlah: "2 Sak",
    total: "Rp 1.200.000",
    nota: "INV-001",
  },
  {
    id: 2,
    petani: "Bu Siti",
    tanggal: "23 Sep 2025",
    jenis: "Alat",
    barang: "Egrek Sawit",
    jumlah: "1 Pcs",
    total: "Rp 450.000",
    nota: "INV-002",
  },
];

const MOCK_PEMINJAMAN = [
  {
    id: 1,
    petani: "Pak Joko",
    tanggal: "20 Sep 2025",
    barang: "Truk Engkel",
    jumlah: "1 Unit",
    status: "Sedang Dipinjam",
  },
  {
    id: 2,
    petani: "Pak Wahyu",
    tanggal: "18 Sep 2025",
    barang: "Mesin Genset",
    jumlah: "1 Unit",
    status: "Dikembalikan",
  },
];

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

  useEffect(() => {
    if (activeTab === "organisasi") {
      fetchPengurus();
      fetchDokumenExisting();
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

      // Backend mengharapkan Int, ParseInt di sini sekarang aman karena inputnya dropdown value="1", "2", dst
      formDataToSend.append("periode_bulan", parseInt(tbsFormData.bulan));
      formDataToSend.append("periode_tahun", parseInt(tbsFormData.tahun));
      formDataToSend.append("harga_per_kg", parseFloat(tbsFormData.harga));
      formDataToSend.append("file", tbsFormData.file);

      const url = API_ENDPOINTS.FARM.KEBUN.TRANSAKSI.HARGA_TBS;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Jangan set Content-Type manual saat pakai FormData!
        },
        body: formDataToSend,
      });

      if (response.ok) {
        alert("Data Harga TBS berhasil dikirim!");
        setShowModalTBS(false);
        // Reset form
        setTbsFormData({
          bulan: "",
          tahun: "",
          harga: "",
          file: null,
        });
      } else {
        const errorData = await response.json();
        // Tampilkan pesan error detail dari backend jika ada
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

    try {
      const token = localStorage.getItem("token");
      const payload = {
        petani_user_id: parseInt(jualFormData.petani_user_id),
        jenis_barang: jualFormData.jenis_barang,
        dinamis_item_id: parseInt(jualFormData.dinamis_item_id),
        jumlah: parseFloat(jualFormData.jumlah),
        total_harga: jualFormData.total_harga
          ? parseFloat(jualFormData.total_harga)
          : null,
      };

      const response = await fetch(API_ENDPOINTS.FARM.KEBUN.TRANSAKSI.JUAL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

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
        // TODO: Anda bisa menambahkan trigger fetch ulang data tabel penjualan di sini jika endpoint GET-nya sudah tersedia
      } else {
        const errorData = await response.json();
        console.log("Response Error Backend:", errorData);
        alert(`Gagal: ${JSON.stringify(errorData.detail) || "Cek input Anda"}`);
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

    try {
      const token = localStorage.getItem("token");
      const payload = {
        petani_user_id: parseInt(pinjamFormData.petani_user_id),
        dinamis_peralatan_id: parseInt(pinjamFormData.dinamis_peralatan_id),
        jumlah_dipinjam: parseInt(pinjamFormData.jumlah_dipinjam),
        tanggal_peminjaman: pinjamFormData.tanggal_peminjaman, // Format YYYY-MM-DD
      };

      const response = await fetch(
        API_ENDPOINTS.FARM.KEBUN.TRANSAKSI.PINJAMKAN,
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
        // TODO: Anda bisa menambahkan trigger fetch ulang data tabel peminjaman di sini jika endpoint GET-nya sudah tersedia
      } else {
        const errorData = await response.json();
        alert(`Gagal: ${JSON.stringify(errorData.detail) || "Cek input Anda"}`);
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
        {/* ================= TRANSAKSI (STATIC) ================= */}
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
                      <th className="p-4 font-bold rounded-tr-xl">Nota</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-700 bg-white">
                    {MOCK_PENJUALAN.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                      >
                        <td className="p-4 font-bold text-center">
                          {index + 1}
                        </td>
                        <td className="p-4 font-medium">{item.petani}</td>
                        <td className="p-4 text-gray-500">{item.tanggal}</td>
                        <td className="p-4">
                          <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold text-gray-600">
                            {item.jenis}
                          </span>
                        </td>
                        <td className="p-4 font-bold">{item.barang}</td>
                        <td className="p-4">{item.jumlah}</td>
                        <td className="p-4 font-bold text-[#B5302D]">
                          {item.total}
                        </td>
                        <td className="p-4 text-blue-600 underline cursor-pointer">
                          {item.nota}
                        </td>
                      </tr>
                    ))}
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
                      <th className="p-4 font-bold">Jumlah</th>
                      <th className="p-4 font-bold rounded-tr-xl">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-700 bg-white">
                    {MOCK_PEMINJAMAN.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                      >
                        <td className="p-4 font-bold text-center">
                          {index + 1}
                        </td>
                        <td className="p-4 font-medium">{item.petani}</td>
                        <td className="p-4 text-gray-500">{item.tanggal}</td>
                        <td className="p-4 font-bold">{item.barang}</td>
                        <td className="p-4">{item.jumlah}</td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                              item.status === "Sedang Dipinjam"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-green-50 text-green-700 border-green-200"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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

                {/* TOMBOL BARU: TAMBAH HARGA TBS (YANG KITA DYNAMISKAN) */}
                <button
                  onClick={() => setShowModalTBS(true)}
                  className="flex items-center gap-2 bg-[#D1F7C4] hover:bg-green-200 text-green-900 border border-green-300 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  Tambah Harga TBS
                </button>
              </div>

              {/* Grid Card Dokumen (SUDAH DINAMIS DENGAN FETCH EXISTING) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dokumenStatus.map((doc, idx) => {
                  // Cek apakah dokumen sudah ada URL (berarti sudah upload)
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
                      {/* Kolom Kiri: Ikon & Tombol Aksi */}
                      <div className="flex flex-col items-center justify-center gap-2 min-w-[60px]">
                        {/* 1. STATUS IKON */}
                        {doc.isUploading ? (
                          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        ) : isUploaded ? (
                          <CheckCircle className="w-8 h-8 text-green-500 stroke-[2]" />
                        ) : (
                          <FileText className="w-8 h-8 text-black stroke-[1.5]" />
                        )}

                        {/* 2. TOMBOL (UPLOAD / LIHAT) */}
                        {doc.isUploading ? (
                          <span className="text-[10px] text-gray-400 font-bold">
                            Proses...
                          </span>
                        ) : isUploaded ? (
                          // Jika sudah upload -> Tombol "Lihat"
                          <button
                            onClick={() => handleViewDocument(doc.file_url)}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold px-4 py-0.5 rounded-full transition-colors shadow-sm"
                          >
                            Lihat
                          </button>
                        ) : (
                          // Jika belum upload -> Tombol "Upload" (Memicu Endpoint Submission)
                          <label className="cursor-pointer bg-[#4CD964] hover:bg-green-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full transition-colors shadow-sm text-center">
                            Upload
                            <input
                              type="file"
                              className="hidden"
                              // (SESUAI BE MAHAR) Kirim file ke endpoint
                              onChange={(e) => handleUploadDokumen(idx, e)}
                            />
                          </label>
                        )}
                      </div>

                      {/* Kolom Kanan: Teks Label */}
                      <div className="flex-1">
                        <p
                          className={`text-sm leading-snug font-normal ${
                            isUploaded
                              ? "text-green-800 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          {doc.label}
                        </p>
                        {isUploaded && (
                          <p className="text-[10px] text-green-600 mt-1 italic">
                            Tersimpan
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* SECTION 3 RENCANA KEGIATAN (STATIC) */}
            <SectionCard title="Monitoring & Rencana Kegiatan">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs text-gray-500">
                  Jadwal kegiatan organisasi mendatang.
                </p>
                <button className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg shadow-green-100 transition-all">
                  <Plus className="w-3 h-3" /> Tambah
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EF8523] text-white text-[11px] uppercase tracking-wider">
                      <th className="p-4 font-bold rounded-tl-xl">No</th>
                      <th className="p-4 font-bold">Nama Kegiatan</th>
                      <th className="p-4 font-bold">Tanggal Pelaksanaan</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold text-center rounded-tr-xl">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-700 bg-white">
                    {MOCK_KEGIATAN.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                      >
                        <td className="p-4 font-bold text-center">
                          {index + 1}
                        </td>
                        <td className="p-4 font-bold">{item.kegiatan}</td>
                        <td className="p-4 flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-400" />{" "}
                          {item.tanggal}
                        </td>
                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-100">
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 bg-gray-100 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-2 bg-gray-100 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </>
        )}
      </div>

      {/* --- MODAL FORM PENGURUS (SESUAI BE MAHAR) --- */}
      {showModalPengurus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">
                {isEditMode ? "Edit Pengurus" : "Tambah Pengurus Baru"}
              </h3>
              <button
                onClick={() => setShowModalPengurus(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitPengurus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Nama Anggota <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_anggota}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_anggota: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                  placeholder="Contoh: H. Samsul"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
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
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                  placeholder="Contoh: Ketua"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Nomor HP
                </label>
                <input
                  type="number"
                  value={formData.no_hp}
                  onChange={(e) =>
                    setFormData({ ...formData, no_hp: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                  placeholder="0812..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Tugas & Tanggung Jawab
                </label>
                <textarea
                  rows={3}
                  value={formData.tugas_pengurus}
                  onChange={(e) =>
                    setFormData({ ...formData, tugas_pengurus: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none resize-none"
                  placeholder="Deskripsi tugas..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModalPengurus(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#B5302D] hover:bg-[#982321] flex items-center justify-center gap-2 shadow-lg shadow-red-100"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL FORM TBS (DINAMIS - DENGAN LOGIKA BE) --- */}
      {showModalTBS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#B5302D] mb-6">
              Tambah Harga TBS Dari Pemerintah
            </h3>

            <form onSubmit={handleSubmitTBS} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Periode bulan
                </label>
                <select
                  name="bulan"
                  value={tbsFormData.bulan}
                  onChange={handleTBSChange}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                  required
                >
                  <option value="">Pilih Bulan</option>
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
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Periode Tahun
                </label>
                <input
                  type="number"
                  name="tahun"
                  value={tbsFormData.tahun}
                  onChange={handleTBSChange}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                  placeholder="Contoh: 2025"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Harga per kg (Rp)
                </label>
                <input
                  type="number"
                  name="harga"
                  value={tbsFormData.harga}
                  onChange={handleTBSChange}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                  placeholder="Rp 1.400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Upload File SK
                </label>
                <input
                  type="file"
                  name="file"
                  onChange={handleTBSChange}
                  className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#EF8523] file:text-white hover:file:bg-[#d06d1e]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  disabled={isSubmittingTBS}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-800 shadow-sm flex justify-center items-center gap-2 ${
                    isSubmittingTBS
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-[#B0F0B5] hover:shadow-md hover:bg-green-300 border border-green-300"
                  }`}
                >
                  {isSubmittingTBS && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  {isSubmittingTBS ? "Mengirim..." : "Kirim"}
                </button>
                <button
                  type="button"
                  disabled={isSubmittingTBS}
                  onClick={() => setShowModalTBS(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-800 bg-gray-200 hover:bg-gray-300 shadow-sm border-black"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL FORM JUAL BARANG --- */}
      {showModalJual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#B5302D] mb-6">
              Jual Barang ke Petani
            </h3>
            <form onSubmit={handleSubmitJual} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  User ID Petani <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={jualFormData.petani_user_id}
                  onChange={(e) =>
                    setJualFormData({
                      ...jualFormData,
                      petani_user_id: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border outline-none"
                  placeholder="ID Petani"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Jenis Barang <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={jualFormData.jenis_barang}
                  onChange={(e) =>
                    setJualFormData({
                      ...jualFormData,
                      jenis_barang: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border outline-none"
                >
                  <option value="Bibit">Bibit</option>
                  <option value="Pupuk">Pupuk</option>
                  <option value="Pestisida">Pestisida</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  ID Item / Barang <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={jualFormData.dinamis_item_id}
                  onChange={(e) =>
                    setJualFormData({
                      ...jualFormData,
                      dinamis_item_id: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border outline-none"
                  placeholder="ID Item di Inventaris"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Jumlah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={jualFormData.jumlah}
                    onChange={(e) =>
                      setJualFormData({
                        ...jualFormData,
                        jumlah: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border outline-none"
                    placeholder="Cth: 2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Total Harga (Opsional)
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
                    className="w-full p-2.5 rounded-xl border outline-none"
                    placeholder="Rp"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  disabled={isSubmittingJual}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600"
                >
                  {isSubmittingJual ? "Memproses..." : "Simpan Penjualan"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#B5302D] mb-6">
              Pinjamkan Alat ke Petani
            </h3>
            <form onSubmit={handleSubmitPinjam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  User ID Petani <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={pinjamFormData.petani_user_id}
                  onChange={(e) =>
                    setPinjamFormData({
                      ...pinjamFormData,
                      petani_user_id: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border outline-none"
                  placeholder="ID Petani"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  ID Peralatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={pinjamFormData.dinamis_peralatan_id}
                  onChange={(e) =>
                    setPinjamFormData({
                      ...pinjamFormData,
                      dinamis_peralatan_id: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border outline-none"
                  placeholder="ID Alat di Inventaris"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Jml Dipinjam <span className="text-red-500">*</span>
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
                    className="w-full p-2.5 rounded-xl border outline-none"
                    placeholder="Cth: 1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Tanggal <span className="text-red-500">*</span>
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
                    className="w-full p-2.5 rounded-xl border outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-6">
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
    {/* Decorative Header Line */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />

    <h3 className="text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

const EmptyState = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
    <Search className="w-10 h-10 mb-3 opacity-20" />
    <p className="text-xs italic">{text}</p>
  </div>
);

export default Operasional;
