import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_ENDPOINTS, API_BASE_URLS } from "../../../config/constants";
import { ArrowLeft, Eye, AlertTriangle, Loader2 } from "lucide-react";
import { showToast, confirmDialog } from "../../../utils/notif";
import Swal from "sweetalert2";

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

// (BE MAHARANI) Mapping Value UI -> BE Pydantic Enum
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

export default function DetailRencanaTanam() {
  const navigate = useNavigate();
  const { id } = useParams();

  // === STATE DATA ===
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // === STATE DATA TAMBAHAN ===
  const [listLahanGambut, setListLahanGambut] = useState([]);
  const [listLahanMineral, setListLahanMineral] = useState([]);
  const [listInventarisBibit, setListInventarisBibit] = useState([]);

  // === STATE FORM PENGAJUAN KEMBALI ===
  const [showPengajuan, setShowPengajuan] = useState(false);
  const [formData, setFormData] = useState({
    nama_unit: "",
    jenis_tanah: "",
    tanggal_tanam_blok: "",
    luas_unit: "",
    jenis_bibit: "",
    varietas_bibit_nama: "",
    jumlah_total_tanaman: "",
    jumlah_tanaman_per_ha: "",
    jenis_lahan: "",
    jarak_tanam: "",
    jarak_tanam_lainnya: "",
    jenis_terasering: "",
    jenis_drainase: "",
    dok_bukti_terasering_url: null,
    dok_bukti_drainase_url: null,

    // STATE UNTUK KERANJANG DAN GAMBUT
    gambut_lapisan_mineral: [],
    gambut_kematangan: [],
    keranjang_lahan_gambut: [],
    keranjang_lahan_mineral: [],
  });

  const [fileTerasering, setFileTerasering] = useState(null);
  const [fileDrainase, setFileDrainase] = useState(null);

  // === HELPER URL GAMBAR ===
  const getFileUrl = (path) => {
    if (!path) return "#";
    if (path.startsWith("http") || path.startsWith("https")) {
      return path;
    }
    const baseUrl = API_BASE_URLS.FARM?.replace(/\/+$/, "") || "";
    const cleanPath = path.replace(/^\/+/, "");
    return `${baseUrl}/${cleanPath}`;
  };

  // --- FETCH LAHAN USER ---
  const fetchLahanUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URLS.FARM}/farm/me/lahan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        if (data && Array.isArray(data.lahan_gambut)) {
          setListLahanGambut(data.lahan_gambut);
        } else if (Array.isArray(data)) {
          setListLahanGambut(data);
        }
        if (data && data.lahan_mineral) {
          const mineralData =
            data.lahan_mineral.detail_batch || data.lahan_mineral;
          setListLahanMineral(Array.isArray(mineralData) ? mineralData : []);
        }
      }
    } catch (error) {
      console.error("Error fetching lahan:", error);
    }
  };

  // --- FETCH INVENTARIS BIBIT & FETCH DATA DETAIL ---
  useEffect(() => {
    const fetchInventarisBibit = async () => {
      try {
        const response = await fetch(
          API_ENDPOINTS.FARM.PETANI.INVENTARIS.GET_BIBIT,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setListInventarisBibit(data);
        }
      } catch (error) {
        console.error("Error fetching bibit:", error);
      }
    };
    fetchInventarisBibit();
    fetchLahanUser(); // Load lahan dimuka
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");

        const baseUrl = API_ENDPOINTS.FARM.PETANI.AMBIL_RENCANA_TANAM;
        const cleanUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
        const finalUrl = `${cleanUrl}/${id}`;

        const response = await fetch(finalUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Pastikan response sukses (status 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse data JSON dari Backend
        const data = await response.json();

        // --- TAMBAHKAN CONSOLE.LOG DI SINI ---
        console.log("Data Detail Rencana Tanam dari BE:", data);

        if (response.ok) {
          setDetailData(data);

          setFormData((prev) => ({
            ...prev,
            nama_unit: data.nama_unit || "",
            jenis_tanah: data.jenis_tanah || "",
            tanggal_tanam_blok: data.tanggal_tanam_blok || "",
            luas_unit: data.luas_unit || "",
            jenis_bibit: data.jenis_bibit || "",
            jumlah_total_tanaman: data.jumlah_total_tanaman || "",
            jumlah_tanaman_per_ha: data.jumlah_tanaman_per_ha || "",
            jenis_lahan: data.jenis_lahan || "",
            jarak_tanam: data.jarak_tanam || "",
            jenis_terasering: data.jenis_terasering_mineral || "",
            jenis_drainase: data.jenis_drainase_mineral || "",
            dok_bukti_terasering_url: data.dok_bukti_terasering_url || null,
            dok_bukti_drainase_url: data.dok_bukti_drainase_url || null,

            gambut_lapisan_mineral: data.gambut_lapisan_mineral
              ? data.gambut_lapisan_mineral.map((item) => {
                  if (item === "pasir_kuarsa") return "Pasir kuarsa";
                  if (item === "tanah_mineral_lainnya") return "Lainnya";
                  return item.charAt(0).toUpperCase() + item.slice(1);
                })
              : [],

            gambut_kematangan: data.gambut_kematangan
              ? data.gambut_kematangan.map(
                  (item) => item.charAt(0).toUpperCase() + item.slice(1),
                )
              : [],
          }));
        }
      } catch (error) {
        console.error("Error koneksi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // === HANDLERS ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let newData = { ...prev, [name]: value };

      if (name === "jenis_tanah") {
        fetchLahanUser(); // Refresh data lahan jika jenis tanah berubah
        if (value === "Gambut") {
          newData.jenis_lahan = "Datar";
          newData.jenis_terasering = "";
          newData.jenis_drainase = "";
          newData.keranjang_lahan_mineral = [];
        } else if (value === "Mineral") {
          newData.gambut_lapisan_mineral = [];
          newData.gambut_kematangan = [];
          newData.keranjang_lahan_gambut = [];
          newData.jenis_lahan = "";
        }
      }
      return newData;
    });
  };

  const handleCheckboxGambut = (e, field) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const currentList = prev[field] || [];
      if (checked) return { ...prev, [field]: [...currentList, value] };
      return { ...prev, [field]: currentList.filter((item) => item !== value) };
    });
  };

  const handleJenisLahanChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      jenis_lahan: value,
      jenis_terasering: "",
      jenis_drainase: "",
    }));
    setFileTerasering(null);
    setFileDrainase(null);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "terasering") setFileTerasering(file);
    if (type === "drainase") setFileDrainase(file);
  };

  // === FUNGSI UPDATE (DISAMAKAN DENGAN BUDIDAYA MONITORING) ===
  const handleUpdate = async () => {
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
      title: "Ajukan Revisi Tanam?",
      text: "Pastikan data yang Anda perbaiki sudah benar sebelum diteruskan kembali ke Kebun.",
      confirmText: "Ya, Ajukan!",
      cancelText: "Periksa Lagi",
      isDanger: false,
    });

    if (!isSetuju) {
      return;
    }

    setLoadingSubmit(true);
    showToast.loading("Sedang menyimpan revisi data ke sistem...");

    try {
      const token = localStorage.getItem("token");

      // Siapkan Payload JSON sesuai BE MAHARANI
      const dataPayload = {
        id: parseInt(id),
        lahan_id: detailData?.lahan_id || 1,
        kebun_profile_id: detailData?.kebun_profile_id || 1,

        nama_unit: formData.nama_unit,
        tanggal_tanam_blok: formData.tanggal_tanam_blok,
        luas_unit: parseFloat(formData.luas_unit || 0),
        jumlah_tanaman_per_ha: parseInt(formData.jumlah_tanaman_per_ha || 0),
        jumlah_total_tanaman: parseInt(formData.jumlah_total_tanaman || 0),

        jenis_tanah: formData.jenis_tanah,
        jenis_lahan: isGambut ? "Datar" : formData.jenis_lahan,

        jenis_bibit: formData.jenis_bibit,
        varietas_bibit_nama:
          formData.jenis_bibit === "Tenera"
            ? formData.varietas_bibit_nama
            : null,

        jarak_tanam: formData.jarak_tanam,
        jarak_tanam_lainnya:
          formData.jarak_tanam === "Lainnya"
            ? formData.jarak_tanam_lainnya
            : null,

        // Logic Sumber Lahan
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

        // Logic Mineral
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

        // Logic Gambut
        nama_lahan_gambut: isGambut ? formData.nama_lahan_gambut : null,
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

        dok_bukti_terasering_url: formData.dok_bukti_terasering_url,
        dok_bukti_drainase_url: formData.dok_bukti_drainase_url,
        varietas_bibit_non_tenera: null,
      };

      const formDataUpload = new FormData();
      formDataUpload.append("data_json", JSON.stringify(dataPayload));

      if (isMineral && (isMiring || isKonservasi) && fileTerasering) {
        formDataUpload.append("file_bukti_terasering", fileTerasering);
      }
      if (isMineral && isKonservasi && fileDrainase) {
        formDataUpload.append("file_bukti_drainase", fileDrainase);
      }

      const url = API_ENDPOINTS.FARM.PETANI.RESUBMIT_RENCANA_TANAM(id);

      const response = await fetch(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      showToast.dismiss(); // Matikan toast loading

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
            JSON.stringify(errorData) ||
            "Gagal mengajukan revisi",
        );
      }

      // MUNCULKAN POPUP SUKSES & INFO ALUR SELANJUTNYA
      Swal.fire({
        icon: "success",
        title: "Revisi Berhasil Diajukan!",
        html: `
          <div style="text-align: left; font-size: 14px; line-height: 1.6; color: #4B5563; margin-top: 10px;">
            <p style="margin-bottom: 8px;">Rencana tanam Anda telah berhasil diperbarui dan diteruskan kembali ke <b>Role Kebun</b> untuk divalidasi ulang.</p>
            <p><b>Apa langkah selanjutnya?</b></p>
            <ul style="list-style-type: disc; margin-left: 20px; margin-top: 4px;">
              <li>Tunggu proses validasi dari pihak Kebun.</li>
              <li>Status pengajuan ini akan berubah menjadi <b>Menunggu Persetujuan</b>.</li>
            </ul>
          </div>
        `,
        confirmButtonText: "Mengerti",
        confirmButtonColor: "#10B981",
        customClass: {
          popup: "rounded-[24px] shadow-2xl border border-gray-100",
          confirmButton: "rounded-xl px-6 py-2 shadow-md",
        },
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      showToast.dismiss(); // Matikan toast loading
      console.error("Error update:", error);
      showToast.error(`Gagal menyimpan: ${error.message}`);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === "disetujui")
      return (
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs sm:text-sm font-medium">
          Disetujui
        </span>
      );
    if (s === "ditolak")
      return (
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs sm:text-sm font-medium">
          Ditolak
        </span>
      );
    return (
      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-xs sm:text-sm font-medium">
        Menunggu Persetujuan
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="w-10 h-10 text-[#EF8523] animate-spin" />
        <p className="text-sm font-medium text-gray-500">
          Memuat data detail rencana tanam...
        </p>
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="p-8 text-center text-gray-500">Data tidak ditemukan.</div>
    );
  }

  const isEditable = detailData.status_approval?.toLowerCase() === "ditolak";

  return (
    <div className="p-3 sm:p-6 md:p-10 w-full min-h-screen bg-white">
      {/* === TOMBOL KEMBALI (TIDAK DIUBAH SAMA SEKALI) === */}
      <button
        onClick={() => navigate("/petani/manajemenkebun/budidayamonitoring")}
        className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-black hover:text-[#EF8523] transition mb-4 sm:mb-6"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        Kembali
      </button>

      {/* === MAIN CARD CONTAINER === */}
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 sm:p-6 lg:p-8 text-gray-800">
        {/* HEADER */}
        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-5 sm:mb-8 flex items-center gap-2 sm:gap-3">
          <span className="w-1.5 h-6 sm:h-8 bg-[#B5302D] rounded-full inline-block"></span>
          Detail Rencana Tanam
        </h2>

        {/* READ ONLY INFO - UI/UX Modern Grid (Identik dengan Dashboard Mandor) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 relative overflow-hidden">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1">
              Nama Unit
            </p>
            <p className="text-xs sm:text-sm font-black text-gray-800">
              {detailData.nama_unit}
            </p>
          </div>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 relative overflow-hidden">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1">
              Jenis Tanah
            </p>
            <p className="text-xs sm:text-sm font-black text-[#EF8523]">
              {detailData.jenis_tanah}
            </p>
          </div>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 relative overflow-hidden">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1">
              Tanggal Tanam
            </p>
            <p className="text-xs sm:text-sm font-black text-gray-800">
              {detailData.tanggal_tanam_blok}
            </p>
          </div>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 relative overflow-hidden">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1">
              Luas Unit
            </p>
            <p className="text-xs sm:text-sm font-black text-gray-800">
              {detailData.luas_unit}{" "}
              <span className="text-[9px] sm:text-[10px] text-gray-500 font-semibold">
                Ha
              </span>
            </p>
          </div>

          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 relative overflow-hidden">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1">
              Jenis Bibit
            </p>
            <p className="text-xs sm:text-sm font-black text-gray-800">
              {detailData.jenis_bibit}
            </p>
          </div>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 relative overflow-hidden">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1">
              Total Bibit
            </p>
            <p className="text-xs sm:text-sm font-black text-gray-800">
              {detailData.jumlah_total_tanaman}{" "}
              <span className="text-[9px] sm:text-[10px] text-gray-500 font-semibold">
                Pohon
              </span>
            </p>
          </div>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 relative overflow-hidden">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1">
              Tanaman / Ha
            </p>
            <p className="text-xs sm:text-sm font-black text-gray-800">
              {detailData.jumlah_tanaman_per_ha}
            </p>
          </div>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 relative overflow-hidden">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1">
              Jenis Lahan
            </p>
            <p className="text-xs sm:text-sm font-black text-gray-800">
              {detailData.jenis_lahan}
            </p>
          </div>

          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 relative overflow-hidden">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1">
              Jarak Tanam
            </p>
            <p className="text-xs sm:text-sm font-black text-gray-800">
              {detailData.jarak_tanam}
            </p>
          </div>

          {/* KHUSUS GAMBUT */}
          {detailData.jenis_tanah === "Gambut" && (
            <>
              <div className="bg-emerald-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-100 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-80" />
                <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5 sm:mb-1 ml-1 sm:ml-0">
                  Lapisan Mineral
                </p>
                <p className="text-xs sm:text-sm font-black text-emerald-900 ml-1 sm:ml-0">
                  {detailData.gambut_lapisan_mineral?.length > 0
                    ? detailData.gambut_lapisan_mineral
                        .map((item) => item.replace(/_/g, " ").toUpperCase())
                        .join(", ")
                    : "-"}
                </p>
              </div>
              <div className="bg-emerald-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-100 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-80" />
                <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5 sm:mb-1 ml-1 sm:ml-0">
                  Kematangan Gambut
                </p>
                <p className="text-xs sm:text-sm font-black text-emerald-900 ml-1 sm:ml-0">
                  {detailData.gambut_kematangan?.length > 0
                    ? detailData.gambut_kematangan
                        .map((item) => item.replace(/_/g, " ").toUpperCase())
                        .join(", ")
                    : "-"}
                </p>
              </div>
            </>
          )}

          {/* KHUSUS MINERAL MIRING/KONSERVASI */}
          {detailData.jenis_terasering_mineral && (
            <div className="bg-orange-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-orange-100 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EF8523] opacity-80" />
              <p className="text-[9px] sm:text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-0.5 sm:mb-1 ml-1 sm:ml-0">
                Terasering
              </p>
              <p className="text-xs sm:text-sm font-black text-orange-900 ml-1 sm:ml-0">
                {detailData.jenis_terasering_mineral}
              </p>
            </div>
          )}
          {detailData.jenis_drainase_mineral && (
            <div className="bg-blue-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-100 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-80" />
              <p className="text-[9px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5 sm:mb-1 ml-1 sm:ml-0">
                Drainase
              </p>
              <p className="text-xs sm:text-sm font-black text-blue-900 ml-1 sm:ml-0">
                {detailData.jenis_drainase_mineral}
              </p>
            </div>
          )}

          {/* LINK LAMPIRAN */}
          {detailData.dok_bukti_terasering_url && (
            <div className="col-span-2 lg:col-span-1 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 flex flex-col justify-center relative overflow-hidden">
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Bukti Terasering
              </p>
              <a
                href={getFileUrl(detailData.dok_bukti_terasering_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 bg-blue-50 w-fit px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> Lihat Dokumen
              </a>
            </div>
          )}
          {detailData.dok_bukti_drainase_url && (
            <div className="col-span-2 lg:col-span-1 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 flex flex-col justify-center relative overflow-hidden">
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Bukti Drainase
              </p>
              <a
                href={getFileUrl(detailData.dok_bukti_drainase_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 bg-blue-50 w-fit px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> Lihat Dokumen
              </a>
            </div>
          )}
        </div>

        <hr className="border-gray-100 mb-6 sm:mb-8" />

        {/* === SECTION STATUS & ALASAN PENOLAKAN === */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
              Status Pengajuan
            </span>
            {getStatusBadge(detailData.status_approval)}
          </div>

          {detailData.status_approval?.toLowerCase() === "ditolak" &&
            detailData.catatan_penolakan && (
              <div className="bg-red-50 border border-red-200 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                <div className="flex items-start gap-3 sm:gap-4 ml-1 sm:ml-0">
                  <div className="p-2 sm:p-2.5 bg-red-100 rounded-lg sm:rounded-xl flex-shrink-0 text-red-600">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-red-800 font-extrabold text-xs sm:text-sm mb-0.5 sm:mb-1 uppercase tracking-wider">
                      Ditolak & Butuh Revisi
                    </h3>
                    <p className="text-[11px] sm:text-xs text-red-700/90 leading-relaxed font-medium">
                      {detailData.catatan_penolakan}
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* ACTION BUTTONS (Jika Belum Buka Form) */}
        {!showPengajuan && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => isEditable && setShowPengajuan(true)}
              disabled={!isEditable}
              className={`w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 text-[11px] sm:text-sm font-bold rounded-xl transition-all duration-300 shadow-sm ${
                isEditable
                  ? "bg-[#EF8523] text-white hover:bg-[#d6741b] hover:shadow-md hover:-translate-y-0.5"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Ajukan Revisi Data
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* FORM PENGISIAN KEMBALI (REVISI) */}
        {/* ========================================================= */}
        {showPengajuan && isEditable && (
          <div className="mt-6 sm:mt-8 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-base sm:text-lg font-black text-[#B5302D] mb-5 sm:mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              Formulir Revisi Rencana Tanam
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <FormInput
                label="1. Nama Unit"
                name="nama_unit"
                value={formData.nama_unit}
                onChange={handleInputChange}
              />
              <FormInput
                label="2. Tanggal Tanam"
                type="date"
                name="tanggal_tanam_blok"
                value={formData.tanggal_tanam_blok}
                onChange={handleInputChange}
              />
              <FormInput
                label="3. Luas Unit (Ha)"
                type="number"
                name="luas_unit"
                value={formData.luas_unit}
                onChange={handleInputChange}
              />
              <FormInput
                label="4. Jumlah Bibit"
                type="number"
                name="jumlah_total_tanaman"
                value={formData.jumlah_total_tanaman}
                onChange={handleInputChange}
              />
              <FormInput
                label="5. Tanaman / Ha"
                type="number"
                name="jumlah_tanaman_per_ha"
                value={formData.jumlah_tanaman_per_ha}
                onChange={handleInputChange}
              />

              <FormSelect
                label="6. Jenis Tanah"
                name="jenis_tanah"
                value={formData.jenis_tanah}
                onChange={handleInputChange}
                options={["Mineral", "Gambut"]}
              />

              {formData.jenis_tanah !== "Gambut" && (
                <FormSelect
                  label="7. Jenis Lahan"
                  name="jenis_lahan"
                  value={formData.jenis_lahan}
                  onChange={handleJenisLahanChange}
                  options={["Datar", "Miring", "Konservasi"]}
                />
              )}

              {/* Jarak Tanam Dinamis */}
              <div className="w-full">
                <label className="block font-bold text-gray-700 mb-2 text-sm">
                  8. Jarak Tanam
                </label>
                <select
                  name="jarak_tanam"
                  value={formData.jarak_tanam}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-50 focus:border-[#EF8523] transition-all outline-none text-gray-800 shadow-sm"
                >
                  <option value="">-- Pilih --</option>
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
                    className="w-full mt-3 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#EF8523] focus:border-[#EF8523] outline-none shadow-sm"
                  />
                )}
              </div>

              {/* Jenis Bibit & Varietas Dinamis */}
              <div className="w-full">
                <label className="block font-bold text-gray-700 mb-2 text-sm">
                  9. Jenis Bibit
                </label>
                <select
                  name="jenis_bibit"
                  value={formData.jenis_bibit}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-50 focus:border-[#EF8523] transition-all outline-none text-gray-800 shadow-sm"
                >
                  <option value="" disabled>
                    -- Pilih --
                  </option>
                  <option value="Dura">Dura</option>
                  <option value="Tenera">Tenera</option>
                  <option value="Pisifera">Pisifera</option>
                </select>

                {formData.jenis_bibit === "Tenera" && (
                  <div className="mt-4 p-4 bg-orange-50/50 border border-orange-100 rounded-xl shadow-sm">
                    <label className="text-xs font-bold text-orange-800 mb-2 block">
                      Pilih Varietas Bibit (Dari Inventaris){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="varietas_bibit_nama"
                      value={formData.varietas_bibit_nama}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-orange-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-100 focus:border-[#EF8523] outline-none text-gray-800 shadow-sm"
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
                          Stok kosong...
                        </option>
                      )}
                    </select>
                  </div>
                )}
              </div>

              {/* SECTION GAMBUT (KERANJANG & MULTI-SELECT) */}
              {formData.jenis_tanah === "Gambut" && (
                <div className="col-span-1 sm:col-span-2 bg-emerald-50/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-emerald-200 space-y-4 sm:space-y-5 mt-2 shadow-sm">
                  <p className="text-sm sm:text-base font-black text-emerald-800 flex items-center gap-2">
                    Data Lahan Gambut (Wajib)
                  </p>
                  <div>
                    <label className="block font-bold text-gray-700 mb-2 text-sm">
                      Pilih Lahan Gambut & Masukkan Luas (Ha){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2 bg-white p-3 sm:p-4 rounded-xl border border-emerald-200 max-h-60 overflow-y-auto shadow-inner">
                      {listLahanGambut.map((lahan) => {
                        const selectedItem =
                          formData.keranjang_lahan_gambut.find(
                            (item) => item.id === lahan.id,
                          );
                        const isChecked = !!selectedItem;
                        const sisaGambut =
                          lahan.lahan_tidak_digunakan_gambut ??
                          lahan.luas_total_boleh_ditanam ??
                          0;
                        return (
                          <div
                            key={lahan.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:border-emerald-200 transition-colors shadow-sm"
                          >
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  // LOGIKA TIDAK DIUBAH
                                  setFormData((prev) => ({
                                    ...prev,
                                    keranjang_lahan_gambut: e.target.checked
                                      ? [
                                          ...prev.keranjang_lahan_gambut,
                                          { id: lahan.id, luas_diambil: "" },
                                        ]
                                      : prev.keranjang_lahan_gambut.filter(
                                          (item) => item.id !== lahan.id,
                                        ),
                                  }));
                                }}
                                className="w-5 h-5 text-emerald-600 rounded-md border-gray-300 focus:ring-emerald-500"
                              />
                              <span className="text-sm font-bold text-gray-700">
                                {lahan.nama_lahan_gambut}{" "}
                                <span className="text-xs font-medium text-emerald-600 ml-1">
                                  (Sisa: {sisaGambut} Ha)
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
                                    // LOGIKA TIDAK DIUBAH
                                    setFormData((prev) => ({
                                      ...prev,
                                      keranjang_lahan_gambut:
                                        prev.keranjang_lahan_gambut.map(
                                          (item) =>
                                            item.id === lahan.id
                                              ? {
                                                  ...item,
                                                  luas_diambil: e.target.value,
                                                }
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

              {/* SECTION MINERAL (KERANJANG MULTI-SELECT) */}
              {formData.jenis_tanah === "Mineral" && (
                <div className="col-span-1 sm:col-span-2 bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 mt-2 shadow-sm">
                  <label className="block font-bold text-gray-700 mb-2 text-sm">
                    Pilih Lahan Mineral & Masukkan Luas (Ha){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3 bg-white p-3 sm:p-4 rounded-xl border border-gray-300 max-h-60 overflow-y-auto shadow-inner">
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
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:border-[#EF8523]/30 transition-colors shadow-sm"
                        >
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                // LOGIKA TIDAK DIUBAH
                                setFormData((prev) => ({
                                  ...prev,
                                  keranjang_lahan_mineral: e.target.checked
                                    ? [
                                        ...prev.keranjang_lahan_mineral,
                                        { id: lahan.id, luas_diambil: "" },
                                      ]
                                    : prev.keranjang_lahan_mineral.filter(
                                        (item) => item.id !== lahan.id,
                                      ),
                                }));
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
                                  // LOGIKA TIDAK DIUBAH
                                  setFormData((prev) => ({
                                    ...prev,
                                    keranjang_lahan_mineral:
                                      prev.keranjang_lahan_mineral.map(
                                        (item) =>
                                          item.id === lahan.id
                                            ? {
                                                ...item,
                                                luas_diambil: e.target.value,
                                              }
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
                  </div>
                </div>
              )}

              {/* BAGIAN FILE - Responsive */}
              {(formData.jenis_lahan === "Miring" ||
                formData.jenis_lahan === "Konservasi") && (
                <div className="col-span-1 sm:col-span-2 space-y-5 mt-2">
                  <div className="bg-yellow-50/50 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-yellow-200 shadow-sm">
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
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none shadow-sm"
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
                            className="w-full mt-3 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none shadow-sm"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-2 text-sm">
                          Upload Bukti Terasering
                        </label>
                        {formData.dok_bukti_terasering_url &&
                          !fileTerasering && (
                            <div className="mb-3 text-xs font-bold flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-orange-200 shadow-sm">
                              <span className="text-orange-600">
                                File tersedia di sistem
                              </span>
                              <a
                                href={getFileUrl(
                                  formData.dok_bukti_terasering_url,
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Lihat
                              </a>
                            </div>
                          )}
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, "terasering")}
                          className="block w-full text-sm text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-yellow-100 file:text-yellow-800 hover:file:bg-yellow-200 transition-colors"
                        />
                        <span className="text-xs font-medium text-gray-500 block mt-2 ml-1">
                          {fileTerasering
                            ? fileTerasering.name
                            : "Belum ada file baru dipilih"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {formData.jenis_lahan === "Konservasi" && (
                    <div className="bg-blue-50/50 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-blue-200 shadow-sm">
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
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
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
                              className="w-full mt-3 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
                            />
                          )}
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 mb-2 text-sm">
                            Upload Bukti Drainase
                          </label>
                          {formData.dok_bukti_drainase_url && !fileDrainase && (
                            <div className="mb-3 text-xs font-bold flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-blue-200 shadow-sm">
                              <span className="text-blue-600">
                                File tersedia di sistem
                              </span>
                              <a
                                href={getFileUrl(
                                  formData.dok_bukti_drainase_url,
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#EF8523] hover:underline"
                              >
                                Lihat
                              </a>
                            </div>
                          )}
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(e, "drainase")}
                            className="block w-full text-sm text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 transition-colors"
                          />
                          <span className="text-xs font-medium text-gray-500 block mt-2 ml-1">
                            {fileDrainase
                              ? fileDrainase.name
                              : "Belum ada file baru dipilih"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* --- HASIL AUTO-CALCULATE LUAS UNIT (DIPERBAIKI AGAR TIDAK NABRAK) --- */}
            {formData.jenis_tanah && (
              <div className="mt-8 bg-gradient-to-r from-orange-50 to-[#fff8f3] border border-orange-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    // DIBERIKAN pr-16 AGAR ANGKA TIDAK MENABRAK TULISAN HEKTAR
                    className="w-full bg-white border border-orange-200 rounded-lg pl-4 pr-16 py-2.5 sm:py-3 text-lg font-black text-gray-800 cursor-not-allowed outline-none text-right shadow-inner"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    Hektar
                  </span>
                </div>
              </div>
            )}

            {/* BUTTONS SAVE/CANCEL */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowPengajuan(false)}
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 sm:px-8 py-3 rounded-xl text-sm font-bold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUpdate}
                disabled={loadingSubmit}
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 ${
                  loadingSubmit
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#B5302D] text-white hover:bg-[#962522] hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                {loadingSubmit && <Loader2 className="w-4 h-4 animate-spin" />}
                {loadingSubmit ? "Menyimpan Data..." : "Simpan & Kirim Ulang"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// === KOMPONEN HELPER ===

function FormInput({ label, type = "text", name, value, onChange }) {
  return (
    <div>
      <label className="block font-bold text-gray-700 mb-2 text-sm">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-50 focus:border-[#EF8523] transition-all outline-none text-gray-800 shadow-sm"
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options = [], name }) {
  return (
    <div>
      <label className="block font-bold text-gray-700 mb-2 text-sm">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-50 focus:border-[#EF8523] transition-all outline-none text-gray-800 shadow-sm"
      >
        <option value="" disabled>
          -- Pilih --
        </option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
