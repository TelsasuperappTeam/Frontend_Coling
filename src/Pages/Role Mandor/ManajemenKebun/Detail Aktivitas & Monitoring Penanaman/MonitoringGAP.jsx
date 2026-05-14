import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom"; // TAMBAHAN UNTUK HALAMAN PENUH
import {
  ChevronDown,
  Plus,
  X,
  FileText,
  Save,
  ClipboardList,
  RefreshCw,
  ArrowLeft, // TAMBAHAN IKON BACK
  Sprout, // TAMBAHAN IKON JUDUL
} from "lucide-react";
import { API_ENDPOINTS, getFileUrl } from "../../../../config/constants";
import { showToast, confirmDialog } from "../../../../utils/notif";

// CONFIG & ENUM
// Dokumentasi: Bagian ini mendefinisikan pilihan (dropdown) yang akan
// muncul di Form. Struktur ini disesuaikan dengan skema database backend.
// (SESUAI BE MAHAR)

const ENUM_OPTIONS = {
  // --- SANITASI ---
  aktivitas_perawatan_sanitasi: [
    { value: "Penyiangan Manual", label: "Penyiangan Manual" },
    { value: "Penyiangan Chemist", label: "Penyiangan Chemist" },
    { value: "Pembersihan Parit", label: "Pembersihan Parit" },
    { value: "Pembersihan Sampah", label: "Pembersihan Sampah" },
  ],
  kondisi_gulma: [
    { value: "Bersih", label: "Bersih / Rumput Pendek" },
    { value: "Sedikit Gulma", label: "Sedikit Gulma (Ringan)" },
    { value: "Banyak Gulma", label: "Banyak Gulma (Berat)" },
    { value: "Tidak terawat", label: "Tidak terawat (Semak)" },
  ],
  kondisi_parit: [
    { value: "Lancar", label: "Lancar" },
    { value: "Tersumbat Ringan", label: "Tersumbat Ringan" },
    { value: "Tersumbat Berat", label: "Tersumbat Berat" },
    { value: "Rusak", label: "Rusak" },
  ],
  kondisi_lingkungan: [
    { value: "Bersih", label: "Bersih" },
    { value: "Ada Sampah Ringan", label: "Ada Sampah Ringan" },
    { value: "Ada Sampah Berbahaya", label: "Ada Sampah Berbahaya" },
    { value: "Tercemar", label: "Tercemar" },
  ],

  // --- COVER CROP ---
  aktivitas_perawatan_cc: [
    { value: "Penyiangan", label: "Penyiangan" },
    { value: "Penyulaman", label: "Penyulaman" },
    { value: "Pemangkasan", label: "Pemangkasan" },
    { value: "Monitoring", label: "Monitoring" },
  ],
  jenis_tanaman: [
    { value: "Mucuna bracteata", label: "Mucuna bracteata" },
    { value: "Peuraria javanica (Pj)", label: "Peuraria javanica (Pj)" },
    {
      value: "Calopogonium caerulium (Cc)",
      label: "Calopogonium caerulium (Cc)",
    },
    {
      value: "Calopogonium mucunoides (Cm)",
      label: "Calopogonium mucunoides (Cm)",
    },
    { value: "Centrocema pubescens (Cp)", label: "Centrocema pubescens (Cp)" },
    { value: "Centrosema plumeria (Cpl)", label: "Centrosema plumeria (Cpl)" },
    { value: "Lainnya", label: "Lainnya" },
  ],
  kondisi_tanaman: [
    { value: "Baik", label: "Baik" },
    { value: "Mati Sebagian", label: "Mati Sebagian" },
    { value: "Mati Total", label: "Mati Total" },
  ],
  kelembapan_tanah: [
    { value: "Lembab", label: "Lembab" },
    { value: "Kering", label: "Kering" },
    { value: "Sangat Kering", label: "Sangat Kering" },
  ],

  // --- PIRINGAN ---
  aktivitas_kegiatan_piringan: [
    { value: "Monitoring", label: "Monitoring" },
    { value: "Pembersihan Gulma", label: "Pembersihan Gulma" },
    { value: "Perbaikan Drainase", label: "Perbaikan Drainase" },
  ],

  // --- PUPUK ---
  cuaca_pemupukan: [
    { value: "Cerah", label: "Cerah" },
    { value: "Hujan", label: "Hujan" },
  ],

  // --- PESTISIDA ---
  satuan_dosis_opt: [
    { value: "ml", label: "Mililiter (ml)" },
    { value: "gr", label: "Gram (gr)" },
  ],
};

// MONITORING CONFIGURATION (STRICT COLUMNS)
// Dokumentasi: Mengatur kolom tabel dan field input form.
// (SESUAI BE MAHAR)

const MONITORING_CONFIG = {
  sanitasi: {
    title: "Kegiatan Kebersihan & Rawat Kebun",
    columns: [
      {
        header: "Tanggal",
        key: "tanggal_monitoring",
        width: "120px",
        type: "date",
        align: "left",
      },
      {
        header: "Aktivitas",
        key: "aktivitas_perawatan",
        width: "180px",
        align: "left",
      },
      {
        header: "Deskripsi",
        key: "deskripsi_kegiatan",
        width: "200px",
        truncate: true,
        align: "left",
      },
      {
        header: "Jumlah Petugas",
        key: "jumlah_petugas",
        width: "80px",
        align: "left",
        type: "number",
      },
      {
        header: "Kondisi Gulma",
        key: "kondisi_gulma",
        width: "140px",
        isBadge: true,
        align: "left",
      },
      {
        header: "Kondisi Parit",
        key: "kondisi_parit",
        width: "140px",
        isBadge: true,
        align: "left",
      },
      {
        header: "Kondisi Lingkungan",
        key: "kondisi_lingkungan",
        width: "140px",
        isBadge: true,
        align: "left",
      },
      {
        header: "Foto",
        key: "dokumentasi_kebersihan_url",
        width: "100px",
        type: "link",
        align: "left",
      },
    ],
    fields: [
      { key: "tanggal_monitoring", label: "Tanggal Monitoring", type: "date" },
      {
        key: "aktivitas_perawatan",
        label: "Aktivitas Perawatan",
        type: "select",
        options: ENUM_OPTIONS.aktivitas_perawatan_sanitasi,
      },
      {
        key: "deskripsi_kegiatan",
        label: "Deskripsi (Opsional)",
        placeholder: "Keterangan kegiatan yang dilakukan...",
      },
      { key: "jumlah_petugas", label: "Jumlah Petugas", type: "number" },
      {
        key: "kondisi_gulma",
        label: "Kondisi Gulma",
        type: "select",
        options: ENUM_OPTIONS.kondisi_gulma,
      },
      {
        key: "kondisi_parit",
        label: "Kondisi Parit",
        type: "select",
        options: ENUM_OPTIONS.kondisi_parit,
      },
      {
        key: "kondisi_lingkungan",
        label: "Kondisi Lingkungan",
        type: "select",
        options: ENUM_OPTIONS.kondisi_lingkungan,
      },
      { key: "f", label: "Upload Foto", type: "file" },
    ],
  },
  coverCrop: {
    title: "Kegiatan Tanaman Penutup Tanah (Kacangan)",
    columns: [
      {
        header: "Tanggal",
        key: "tanggal_monitoring",
        width: "120px",
        type: "date",
        align: "left",
      },
      {
        header: "Jenis LCC",
        key: "jenis_tanaman_penutup",
        width: "160px",
        align: "left",
      },
      {
        header: "Aktivitas",
        key: "aktivitas_perawatan",
        width: "150px",
        align: "left",
      },
      {
        header: "Kondisi Tanaman",
        key: "kondisi_tanaman",
        width: "130px",
        isBadge: true,
        align: "left",
      },
      {
        header: "Kelembapan Tanah",
        key: "kelembaban_tanah",
        width: "130px",
        isBadge: true,
        align: "left",
      },
      {
        header: "Jumlah Petugas",
        key: "jumlah_petugas",
        width: "80px",
        align: "left",
        type: "number",
      },
      {
        header: "Foto",
        key: "dokumentasi_covercrop_url",
        width: "100px",
        type: "link",
        align: "left",
      },
    ],
    fields: [
      { key: "tanggal_monitoring", label: "Tanggal", type: "date" },
      {
        key: "aktivitas_perawatan",
        label: "Aktivitas",
        type: "select",
        options: ENUM_OPTIONS.aktivitas_perawatan_cc,
      },
      {
        key: "jenis_tanaman_penutup",
        label: "Jenis LCC",
        type: "select",
        options: ENUM_OPTIONS.jenis_tanaman,
      },
      {
        key: "jenis_tanaman_penutup_lainnya",
        label: "Opsional Untuk Jenis Lainnya",
        placeholder: "Jika pilih Lainnya Pada Jenis LCC",
      },
      {
        key: "kondisi_tanaman",
        label: "Kondisi Tanaman",
        type: "select",
        options: ENUM_OPTIONS.kondisi_tanaman,
      },
      {
        key: "kelembaban_tanah",
        label: "Kelembapan Tanah",
        type: "select",
        options: ENUM_OPTIONS.kelembapan_tanah,
      },
      { key: "jumlah_petugas", label: "Jumlah Petugas", type: "number" },
      {
        key: "deskripsi_kegiatan",
        label: "Deskripsi (Opsional)",
        placeholder: "Keterangan kegiatan yang dilakukan...",
      },
      { key: "f", label: "Upload Foto", type: "file" },
    ],
  },
  piringan_kondisi: {
    title: "Kegiatan Kondisi Pemeliharaan Piringan",
    columns: [
      {
        header: "Tanggal",
        key: "tanggal_monitoring",
        width: "120px",
        type: "date",
        align: "left",
      },
      {
        header: "Bersih (Pkk)",
        key: "kondpi_bersih",
        width: "110px",
        align: "left",
      },
      {
        header: "Gulma Ringan",
        key: "kondpi_bergulma_ringan",
        width: "120px",
        align: "left",
      },
      {
        header: "Gulma Berat",
        key: "kondpi_bergulma_lebat",
        width: "120px",
        align: "left",
      },
      {
        header: "Tanah Kering",
        key: "kondper_kering",
        width: "110px",
        align: "left",
      },
      {
        header: "Tanah Lembab",
        key: "kondper_lembab",
        width: "110px",
        align: "left",
      },
      {
        header: "Tanah Genang",
        key: "kondper_menggenang",
        width: "110px",
        align: "left",
      },
      {
        header: "Catatan Tindakan",
        key: "catatan_tindakan",
        width: "200px",
        truncate: true,
        align: "left",
      },
    ],
    fields: [
      { key: "tanggal_monitoring", label: "Tanggal Cek Kondisi", type: "date" },
      {
        key: "kondpi_bersih",
        label: "Jumlah Piringan Bersih (Pokok)",
        type: "number",
      },
      {
        key: "kondpi_bergulma_ringan",
        label: "Jumlah Gulma Ringan (Pokok)",
        type: "number",
      },
      {
        key: "kondpi_bergulma_lebat",
        label: "Jumlah Gulma Lebat (Pokok)",
        type: "number",
      },
      {
        key: "kondper_kering",
        label: "Jumlah Tanah Kering (Pokok)",
        type: "number",
      },
      {
        key: "kondper_lembab",
        label: "Jumlah Tanah Lembab (Pokok)",
        type: "number",
      },
      {
        key: "kondper_menggenang",
        label: "Jumlah Tanah Menggenang (Pokok)",
        type: "number",
      },
      {
        key: "catatan_tindakan",
        label: "Catatan Tindakan (Opsional)",
        placeholder: "catatan tindakan kegiatan yang dilakukan...",
      },
    ],
  },
  piringan_aktivitas: {
    title: "Catat Aktivitas Pemeliharaan Piringan",
    columns: [
      {
        header: "Tanggal",
        key: "tanggal_monitoring",
        width: "120px",
        align: "left",
        type: "date",
      },
      {
        header: "Aktivitas",
        key: "aktivitas_kegiatan",
        width: "200px",
        align: "left",
      },
      {
        header: "Deskripsi",
        key: "deskripsi_kegiatan",
        width: "200px",
        align: "left",
      },
      {
        header: "Jumlah Petugas",
        key: "jumlah_petugas",
        width: "80px",
        align: "left",
        type: "number",
      },
      {
        header: "Foto",
        key: "dokumentasi_aktivitas_url",
        width: "100px",
        type: "link",
        align: "left",
      },
    ],
    fields: [
      {
        key: "monitoring_piringan_id",
        label: "Berdasarkan Pengecekan Tanggal Berapa?",
        type: "select_parent_piringan",
      },
      { key: "tanggal_monitoring", label: "Tanggal Aktivitas", type: "date" },
      {
        key: "aktivitas_kegiatan",
        label: "Aktivitas",
        type: "select",
        options: ENUM_OPTIONS.aktivitas_kegiatan_piringan,
      },
      {
        key: "deskripsi_kegiatan",
        label: "Deskripsi",
        placeholder: "Opsional",
      },
      { key: "jumlah_petugas", label: "Jumlah Petugas", type: "number" },
      { key: "f", label: "Upload Foto", type: "file" },
    ],
  },
  pupuk: {
    title: "Kegiatan Penggunaan Pupuk",
    columns: [
      {
        header: "Tanggal",
        key: "tanggal_pemupukan",
        width: "120px",
        type: "date",
        align: "left",
      },
      {
        header: "Nama Pupuk",
        key: "nama_pupuk",
        width: "150px",
        align: "left",
      },
      {
        header: "Total Digunakan (Kg)",
        key: "jumlah_total_pupuk_digunakan_kg",
        width: "120px",
        align: "left",
        type: "number",
      },
      {
        header: "Cuaca Pemupukan",
        key: "cuaca_saat_pemupukan",
        width: "100px",
        isBadge: true,
        align: "left",
      },
      {
        header: "Jumlah Petugas",
        key: "jumlah_petugas",
        width: "80px",
        align: "left",
        type: "number",
      },
      {
        header: "Foto",
        key: "dokumentasi_pemupukan_url",
        width: "100px",
        type: "link",
        align: "left",
      },
    ],
    fields: [
      { key: "tanggal_pemupukan", label: "Tanggal", type: "date" },
      // --- INI YANG BENAR UNTUK PUPUK ---
      {
        key: "dinamis_pupuk_id",
        label: "PILIH PUPUK DARI INVENTARIS",
        type: "select",
        options: [], // Dikosongkan, akan diisi dinamis dari state
      },
      // -----------------------------------
      {
        key: "dosis_diberikan_per_gram",
        label: "Dosis per Pokok (gr)",
        type: "number",
      },
      {
        key: "jumlah_total_pupuk_digunakan_kg",
        label: "Total Pupuk (Kg)",
        type: "number",
      },
      { key: "jumlah_pohon_dipupuk", label: "Jumlah Pokok", type: "number" },
      {
        key: "cuaca_saat_pemupukan",
        label: "Cuaca Pemupukan",
        type: "select",
        options: ENUM_OPTIONS.cuaca_pemupukan,
      },
      { key: "jumlah_petugas", label: "Jumlah Petugas", type: "number" },
      { key: "f", label: "Foto Bukti", type: "file" },
    ],
  },
  opt: {
    title: "Kegiatan Penggunaan Racun / Obat Hama (Pestisida)",
    columns: [
      {
        header: "Tanggal",
        key: "tanggal_pemakaian",
        width: "120px",
        type: "date",
        align: "left",
      },
      {
        header: "Nama Pestisida",
        key: "nama_pestisida",
        width: "180px",
        align: "left",
      },
      {
        header: "Dosis",
        key: "tampilan_dosis_lengkap",
        width: "130px",
        align: "left",
      },
      {
        header: "Total Pakai",
        key: "jumlah_total_digunakan",
        width: "130px",
        align: "left",
        type: "number",
      },
      {
        header: "Sasaran OPT",
        key: "opt_sasaran",
        width: "150px",
        align: "left",
      },
      {
        header: "Luas Area Terkendali (ha)",
        key: "luas_area_terkendali_ha",
        width: "100px",
        align: "left",
      },
      {
        header: "Jumlah Petugas",
        key: "jumlah_petugas",
        width: "80px",
        align: "left",
        type: "number",
      },
      {
        header: "Foto",
        key: "dokumentasi_pestisida_url",
        width: "100px",
        type: "link",
        align: "left",
      },
    ],
    fields: [
      { key: "tanggal_pemakaian", label: "Tanggal Aplikasi", type: "date" },
      // --- INI YANG BENAR UNTUK PESTISIDA ---
      {
        key: "dinamis_pestisida_id",
        label: "PILIH PESTISIDA DARI INVENTARIS",
        type: "select",
        options: [], // Dikosongkan, akan diisi dinamis dari state
      },
      // ---------------------------------------
      { key: "dosis_diberikan", label: "Jumlah Dosis", type: "number" },
      {
        key: "satuan_dosis",
        label: "Satuan",
        type: "select",
        options: ENUM_OPTIONS.satuan_dosis_opt,
      },
      {
        key: "jumlah_total_digunakan",
        label: "Total Pakai (L/Kg)",
        type: "number",
      },
      {
        key: "opt_sasaran",
        label: "Sasaran (Hama)",
        placeholder: "Contoh: Ulat Api",
      },
      {
        key: "luas_area_terkendali_ha",
        label: "Luas Area Terkendali (ha)",
        type: "number",
      },
      { key: "jumlah_petugas", label: " Jumlah Petugas", type: "number" },
      { key: "f", label: "Foto Bukti", type: "file" },
    ],
  },
};

// HELPER RENDER CELL
// Dokumentasi: Fungsi ini merender isi sel tabel secara dinamis.

function renderCell(col, row) {
  const value = row[col.key];

  // Handle Empty/Null
  if (value === null || value === undefined || value === "") {
    return <span className="text-gray-300">-</span>;
  }

  // Handle Date
  if (col.type === "date") {
    return (
      <span className="text-gray-700 font-medium text-[11px] sm:text-xs">
        {String(value).split("T")[0]}
      </span>
    );
  }

  // Handle Link/Foto
  if (col.type === "link") {
    const fullUrl = getFileUrl(value, "FARM");

    return (
      <a
        href={fullUrl}
        target="_blank"
        rel="noreferrer"
        className="text-[#EF8523] hover:underline flex items-center gap-1 text-[10px] sm:text-xs font-bold"
      >
        <FileText size={14} className="w-3 h-3 sm:w-4 sm:h-4" /> Lihat
      </a>
    );
  }

  // Handle Badge (Kondisi/Status)
  if (col.isBadge) {
    let colorClass = "bg-gray-100 text-gray-600 border-gray-200";
    const valLower = String(value).toLowerCase();

    if (
      ["bersih", "baik", "lancar", "lembab", "cerah"].some((k) =>
        valLower.includes(k),
      )
    )
      colorClass = "bg-green-50 text-green-700 border-green-200";
    else if (
      ["ringan", "sedikit", "kering", "mendung"].some((k) =>
        valLower.includes(k),
      )
    )
      colorClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
    else if (
      ["berat", "rusak", "mati", "banyak", "menggenang", "hujan"].some((k) =>
        valLower.includes(k),
      )
    )
      colorClass = "bg-red-50 text-red-700 border-red-200";

    return (
      <span
        className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-[11px] font-bold border ${colorClass} inline-block whitespace-nowrap`}
      >
        {value}
      </span>
    );
  }

  // Handle Truncate (Deskripsi panjang)
  if (col.truncate) {
    return (
      <div className="group relative">
        <div
          className="truncate max-w-full text-gray-600 text-[11px] sm:text-xs"
          title={value}
        >
          {value}
        </div>
      </div>
    );
  }

  // Handle Manual Alignment for Text
  if (col.align === "right")
    return (
      <span className="block text-right text-gray-700 text-[11px] sm:text-xs">
        {value}
      </span>
    );
  if (col.align === "center")
    return (
      <span className="block text-center text-gray-700 text-[11px] sm:text-xs">
        {value}
      </span>
    );

  // Default Left
  return <span className="text-gray-700 text-[11px] sm:text-xs">{value}</span>;
}

// MAIN COMPONENT (SEKARANG HALAMAN PENUH)
export default function MonitoringGAP() {
  const { id: paramId } = useParams(); // Ambil ID dari URL
  const navigate = useNavigate();

  // KARENA INI SEKARANG HALAMAN PENUH, KITA BUTUH STATE SENDIRI UNTUK DATA
  const [monitoringData, setMonitoringData] = useState({
    sanitasi: [],
    coverCrop: [],
    piringan_aktivitas: [],
    piringan_kondisi: [],
    pupuk: [],
    opt: [],
  });

  const [openSection, setOpenSection] = useState("sanitasi");
  const [unitData, setUnitData] = useState(null); // Menyimpan info Blok Header

  const blokId = paramId;

  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // STATE UNTUK OPSI DROPDOWN DINAMIS
  const [pupukOptions, setPupukOptions] = useState([]);
  const [pestisidaOptions, setPestisidaOptions] = useState([]);

  // FUNGSI FETCH HEADER BLOK (Untuk tampilan judul halaman)
  useEffect(() => {
    const fetchUnitInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const url = API_ENDPOINTS.FARM.PETANI.ACTIVITY.GET_BLOK_DETAIL(blokId);
        const response = await fetch(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUnitData(data);
        }
      } catch (error) {
        console.error("Gagal mengambil info unit:", error);
      }
    };

    if (blokId) fetchUnitInfo();
  }, [blokId]);

  // FUNGSI FETCH DATA INVENTARIS
  const fetchInventarisOptions = async (type) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      let url = "";
      if (type === "pupuk") {
        url = API_ENDPOINTS.FARM.PETANI.INVENTARIS.GET_PUPUK;
      } else if (type === "opt") {
        url = API_ENDPOINTS.FARM.PETANI.INVENTARIS.GET_PESTISIDA;
      }

      if (!url) return;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();

        if (type === "pupuk") {
          const options = data.map((item) => ({
            value: item.pupuk.id,
            label: `${item.nama_pupuk} (Sisa ${item.jumlah_tersisa_kg} Kg)`,
          }));
          setPupukOptions(options);
        } else if (type === "opt") {
          const options = data.map((item) => ({
            value: item.pestisida.id,
            label: `${item.nama_pestisida} (Sisa ${item.jumlah_tersisa} ${item.satuan})`,
          }));
          setPestisidaOptions(options);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data inventaris:", error);
    }
  };

  // --- FETCHING DATA ---
  const fetchSectionData = useCallback(
    async (sectionKey) => {
      if (!blokId) return;
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        let url = "";

        if (sectionKey === "sanitasi")
          url =
            API_ENDPOINTS.FARM.PETANI.ACTIVITY.ADD_MONITORING_SANITASI(blokId);
        else if (sectionKey === "coverCrop")
          url =
            API_ENDPOINTS.FARM.PETANI.ACTIVITY.ADD_MONITORING_COVER_CROP(
              blokId,
            );
        else if (sectionKey === "pupuk")
          url = API_ENDPOINTS.FARM.PETANI.ACTIVITY.ADD_MONITORING_PUPUK(blokId);
        else if (sectionKey === "opt")
          url =
            API_ENDPOINTS.FARM.PETANI.ACTIVITY.ADD_MONITORING_PESTISIDA(blokId);
        else if (
          sectionKey === "piringan_kondisi" ||
          sectionKey === "piringan_aktivitas"
        ) {
          url = API_ENDPOINTS.FARM.PETANI.ACTIVITY.ADD_PIRINGAN_KONDISI(
            blokId,
          ).replace("-kondisi", "");
        }

        if (url) {
          const response = await fetch(url, { method: "GET", headers });
          if (!response.ok) throw new Error("Gagal mengambil data");
          const result = await response.json();

          if (
            sectionKey === "piringan_kondisi" ||
            sectionKey === "piringan_aktivitas"
          ) {
            const aktivitasFlat = result.flatMap(
              (item) => item.aktivitas || [],
            );
            setMonitoringData((prev) => ({
              ...prev,
              piringan_kondisi: result,
              piringan_aktivitas: aktivitasFlat,
            }));
          } else {
            setMonitoringData((prev) => ({ ...prev, [sectionKey]: result }));
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [blokId],
  );

  useEffect(() => {
    if (openSection) {
      if (openSection === "piringan_aktivitas")
        fetchSectionData("piringan_kondisi");
      else fetchSectionData(openSection);
    }
  }, [openSection, fetchSectionData]);

  // --- FORM HANDLERS (SAVE) ---
  const handleSave = async () => {
    if (isSaving) return;

    if (!blokId) {
      showToast.error("Gagal: Data Blok tidak ditemukan.");
      return;
    }
    if (!popupType) return;

    // Popup Konfirmasi sebelum menyimpan
    const isSetuju = await confirmDialog({
      title: "Simpan Data Monitoring?",
      text: "Pastikan data aktivitas dan foto bukti yang diunggah sudah benar.",
      confirmText: "Ya, Simpan Data",
      cancelText: "Periksa Lagi",
      isDanger: false,
    });

    if (!isSetuju) return;

    setShowPopup(false); 

    setIsSaving(true);
    showToast.loading("Menyimpan data monitoring...");

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      let url = "";
      let finalBody;

      if (popupType === "sanitasi")
        url =
          API_ENDPOINTS.FARM.PETANI.ACTIVITY.ADD_MONITORING_SANITASI(blokId);
      else if (popupType === "coverCrop")
        url =
          API_ENDPOINTS.FARM.PETANI.ACTIVITY.ADD_MONITORING_COVER_CROP(blokId);
      else if (popupType === "pupuk")
        url = API_ENDPOINTS.FARM.PETANI.ACTIVITY.ADD_MONITORING_PUPUK(blokId);
      else if (popupType === "opt")
        url =
          API_ENDPOINTS.FARM.PETANI.ACTIVITY.ADD_MONITORING_PESTISIDA(blokId);
      else if (popupType === "piringan_kondisi")
        url = API_ENDPOINTS.FARM.PETANI.ACTIVITY.ADD_PIRINGAN_KONDISI(blokId);
      else if (popupType === "piringan_aktivitas")
        url = API_ENDPOINTS.FARM.PETANI.ACTIVITY.ADD_PIRINGAN_AKTIVITAS();

      if (popupType === "piringan_kondisi") {
        if (!formData.tanggal_monitoring) {
          showToast.dismiss();
          showToast.error(
            "Kolom Tanggal belum diisi. Silakan lengkapi terlebih dahulu.",
          );
          return;
        }
        headers["Content-Type"] = "application/json";

        finalBody = JSON.stringify({
          tanggal_monitoring: formData.tanggal_monitoring,
          kondpi_bersih: Number(formData.kondpi_bersih) || 0,
          kondpi_bergulma_ringan: Number(formData.kondpi_bergulma_ringan) || 0,
          kondpi_bergulma_lebat: Number(formData.kondpi_bergulma_lebat) || 0,
          kondper_kering: Number(formData.kondper_kering) || 0,
          kondper_lembab: Number(formData.kondper_lembab) || 0,
          kondper_menggenang: Number(formData.kondper_menggenang) || 0,
          catatan_tindakan: formData.catatan_tindakan || null,
        });
      } else {
        const payload = new FormData();
        Object.keys(formData).forEach((key) => {
          let value = formData[key];

          if (value === undefined || value === null || value === "") return;

          if (
            (key === "tanggal_pemupukan" || key === "tanggal_pemakaian") &&
            value
          ) {
            value = `${value}T00:00:00`;
          }

          if (
            key === "dinamis_pupuk_id" ||
            key === "dinamis_pestisida_id" ||
            key === "monitoring_piringan_id"
          ) {
            value = parseInt(value);
          } else if (
            [
              "dosis_diberikan",
              "jumlah_total_digunakan",
              "luas_area_terkendali_ha",
              "dosis_diberikan_per_gram",
              "jumlah_total_pupuk_digunakan_kg",
              "jumlah_pohon_dipupuk",
              "jumlah_petugas",
            ].includes(key)
          ) {
            value = parseFloat(value);
          }

          payload.append(key, value);
        });
        finalBody = payload;
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: finalBody,
      });

      showToast.dismiss();

      if (!res.ok) {
        let errorMsg = "Gagal simpan data";
        try {
          const errResponse = await res.json();
          if (Array.isArray(errResponse.detail)) {
            errorMsg =
              "Masih ada kolom atau file dokumen yang belum diisi. Silakan lengkapi form terlebih dahulu.";
          } else {
            errorMsg = errResponse.detail || errorMsg;
          }
        } catch {
          errorMsg = res.statusText;
        }
        throw new Error(errorMsg);
      }


      // BARU MUNCULKAN TOAST SUKSESNYA
      showToast.success("Data monitoring berhasil disimpan!");

      if (popupType.includes("piringan")) fetchSectionData("piringan_kondisi");
      else fetchSectionData(popupType);
    } catch (e) {
      showToast.dismiss();
      console.error("Error Detail:", e);
      showToast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDER TABLE SECTION ---
  const renderTable = (configKey) => {
    const config = MONITORING_CONFIG[configKey];
    const data = Array.isArray(monitoringData[configKey])
      ? monitoringData[configKey]
      : [];
    return (
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-orange-50/40 p-3 sm:p-4 rounded-lg border border-orange-100/50">
          <div className="flex items-start gap-2.5">
            <div className="w-1.5 h-full min-h-[28px] bg-[#EF8523] rounded-full mt-0.5"></div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                Daftar Riwayat Data Tersimpan
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1 leading-relaxed">
                Tabel di bawah berisi riwayat aktivitas Anda. Klik tombol{" "}
                <span className="font-semibold text-green-600">
                  + Tambah Data
                </span>{" "}
                untuk mencatat yang baru.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setPopupType(configKey);
              setFormData({});

              if (configKey === "pupuk" || configKey === "opt") {
                fetchInventarisOptions(configKey);
              }

              setShowPopup(true);
            }}
            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-md shadow-green-100 transition-all"
          >
            <Plus size={14} className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Tambah Data
          </button>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white pb-2 custom-scrollbar">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 text-xs sm:text-sm animate-pulse">
              Memuat data...
            </div>
          ) : (
            <table className="min-w-full" style={{ tableLayout: "fixed" }}>
              <thead className="bg-[#EF8523] text-white text-[10px] sm:text-xs uppercase font-bold">
                <tr>
                  <th className="px-2 py-2 sm:px-3 sm:py-3 text-center w-[40px] sm:w-[50px] border-r border-orange-400/50">
                    No
                  </th>
                  {config.columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-2 py-2 sm:px-3 sm:py-3 text-center whitespace-nowrap overflow-hidden text-ellipsis border-r border-orange-400/50 last:border-0"
                      style={{ width: col.width }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[10px] sm:text-sm">
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={config.columns.length + 1}
                      className="py-10 sm:py-12 text-center bg-gray-50"
                    >
                      <div className="flex flex-col items-center justify-center opacity-60">
                        <ClipboardList
                          size={28}
                          className="mb-2 text-gray-400 sm:w-8 sm:h-8"
                        />
                        <span className="text-[10px] sm:text-xs font-medium text-gray-500">
                          Belum ada data inputan
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-orange-50/50 transition-colors"
                    >
                      <td className="px-2 py-2 sm:px-3 sm:py-3 text-center border-r border-gray-100 font-medium text-gray-500">
                        {rIdx + 1}
                      </td>
                      {config.columns.map((col, cIdx) => (
                        <td
                          key={cIdx}
                          className={`px-2 py-2 sm:px-3 sm:py-3 border-r border-gray-100 last:border-0`}
                          style={{
                            width: col.width,
                            textAlign: col.align || "left",
                          }}
                        >
                          <div
                            className={`flex w-full ${
                              col.align === "center"
                                ? "justify-center"
                                : col.align === "right"
                                  ? "justify-end"
                                  : "justify-start"
                            }`}
                          >
                            {renderCell(col, row)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  // --- RENDER POPUP ---
  const renderPopup = () => {
    if (!showPopup || !popupType) return null;
    const config = MONITORING_CONFIG[popupType];

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh]">
          <div className="flex justify-between items-center px-4 py-3 sm:p-5 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <h3 className="font-bold text-gray-800 text-sm sm:text-base">
              Form Input {config.title}
            </h3>
            <button
              onClick={() => setShowPopup(false)}
              className="text-gray-400 hover:text-red-500 transition p-1"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4 custom-scrollbar">
            {config.fields.map((field, idx) => (
              <div key={idx}>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <div className="relative">
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#EF8523] focus:border-[#EF8523] outline-none appearance-none bg-white transition"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.key]: e.target.value,
                        })
                      }
                    >
                      <option value="">-- Pilih --</option>
                      {(() => {
                        let optionsToRender = field.options;
                        if (field.key === "dinamis_pupuk_id")
                          optionsToRender = pupukOptions;
                        if (field.key === "dinamis_pestisida_id")
                          optionsToRender = pestisidaOptions;

                        return optionsToRender?.map((opt, i) => (
                          <option key={i} value={opt.value}>
                            {opt.label || opt.value}
                          </option>
                        ));
                      })()}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                      size={14}
                    />
                  </div>
                ) : field.type === "file" ? (
                  <div className="border border-dashed border-gray-300 rounded-lg p-3 sm:p-4 bg-gray-50 text-center hover:bg-gray-100 transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.key]: e.target.files[0],
                        })
                      }
                      className="text-[10px] sm:text-xs w-full cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] sm:file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                  </div>
                ) : field.type === "select_parent_piringan" ? (
                  <div className="hidden">
                    <input
                      type="hidden"
                      value={formData[field.key] || ""}
                      readOnly
                    />
                  </div>
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#EF8523] outline-none transition shadow-sm"
                    onChange={(e) =>
                      setFormData({ ...formData, [field.key]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}
          </div>

          <div className="p-4 sm:p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
            <button
              onClick={() => setShowPopup(false)}
              className="px-4 py-2 text-xs sm:text-sm text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-5 py-2 text-xs sm:text-sm text-white font-bold rounded-lg shadow-md transition flex items-center gap-2 ${
                isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#EF8523] hover:bg-[#d9751d] hover:shadow-lg active:scale-95"
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw size={14} className="sm:w-4 sm:h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={14} className="sm:w-4 sm:h-4" />
                  Simpan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AccordionItem = ({ id, title, children }) => {
    const isOpen = openSection === id;

    return (
      <div
        className={`border rounded-xl overflow-hidden bg-white transition-all duration-300 ${
          isOpen
            ? "ring-1 ring-[#EF8523] shadow-md"
            : "border-gray-200 hover:border-orange-200"
        }`}
      >
        <div
          onClick={() => setOpenSection(isOpen ? null : id)}
          className={`px-4 py-3 sm:px-6 sm:py-4 flex items-center cursor-pointer select-none gap-3 sm:gap-4 ${
            isOpen ? "bg-orange-50" : "bg-white hover:bg-gray-50"
          }`}
        >
          <h3
            className={`flex-1 text-left font-bold text-sm sm:text-base tracking-wide transition-colors ${
              isOpen ? "text-[#EF8523]" : "text-gray-700"
            }`}
          >
            {title}
          </h3>
          <ChevronDown
            className={`flex-none transition-transform duration-300 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 ${
              isOpen ? "rotate-180 text-[#EF8523]" : ""
            }`}
          />
        </div>

        {isOpen && (
          <div className="p-3 sm:p-6 border-t border-orange-100">
            {children}
          </div>
        )}
      </div>
    );
  };

  // RENDER UTAMA HALAMAN
  return (
    <div className="p-3 sm:p-6 min-h-screen font-sans text-black pb-24">
      {/* HEADER NAVIGASI */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#EF8523] transition px-2 py-1.5 rounded-lg hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5" /> Kembali
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* TITLE PAGE */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-5 sm:mb-8 border-b border-gray-200 pb-3">
          <div className="flex-1 flex items-center gap-3">
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg text-green-700">
              <Sprout className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-green-700 leading-tight">
                Monitoring Budidaya
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Catat seluruh aktivitas perawatan dan pengecekan lahan Anda.
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto mt-2 sm:mt-0 bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-[10px] sm:text-sm shadow-sm font-medium tracking-wide">
            Unit: {unitData ? unitData.nama_unit : "..."}
          </span>
        </div>

        {/* LIST AKORDION MONITORING */}
        <div className="space-y-3 sm:space-y-4">
          <AccordionItem id="sanitasi" title={MONITORING_CONFIG.sanitasi.title}>
            {renderTable("sanitasi")}
          </AccordionItem>

          <AccordionItem
            id="coverCrop"
            title={MONITORING_CONFIG.coverCrop.title}
          >
            {renderTable("coverCrop")}
          </AccordionItem>

          <AccordionItem
            id="piringan_aktivitas"
            title="Kegiatan Piringan (Pengecekan & Perawatan)"
          >
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex justify-between items-center bg-blue-50/50 p-3 sm:p-4 rounded-lg border border-blue-100">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-blue-900">
                    Data Pengecekan Piringan
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPopupType("piringan_kondisi");
                    setFormData({});
                    setShowPopup(true);
                  }}
                  className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-md shadow-green-100 transition-all"
                >
                  <Plus size={14} /> Tambah Cek Kondisi
                </button>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white pb-2 custom-scrollbar">
                <table
                  className="min-w-full text-left"
                  style={{ tableLayout: "auto" }}
                >
                  <thead className="bg-[#EF8523] text-white text-[10px] sm:text-xs uppercase font-bold">
                    <tr>
                      <th className="px-3 py-3 text-center w-[50px] border-r border-orange-400/50">
                        No
                      </th>
                      <th className="px-3 py-3 border-r border-orange-400/50">
                        Tanggal Cek
                      </th>
                      <th className="px-3 py-3 border-r border-orange-400/50 min-w-[180px]">
                        Hasil Kondisi
                      </th>
                      <th className="px-3 py-3 min-w-[200px]">
                        Tindakan Perawatan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[10px] sm:text-sm">
                    {!monitoringData.piringan_kondisi ||
                    monitoringData.piringan_kondisi.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-12 text-center bg-gray-50"
                        >
                          <div className="flex flex-col items-center justify-center opacity-60">
                            <ClipboardList
                              size={28}
                              className="mb-2 text-gray-400"
                            />
                            <span className="text-[10px] sm:text-xs font-medium text-gray-500">
                              Belum ada data pengecekan
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      monitoringData.piringan_kondisi.map((kondisi, idx) => {
                        const aktivitasList =
                          monitoringData.piringan_aktivitas?.filter(
                            (a) => a.monitoring_piringan_id === kondisi.id,
                          ) || [];

                        return (
                          <tr
                            key={idx}
                            className="hover:bg-orange-50/30 transition-colors"
                          >
                            <td className="px-3 py-3 text-center border-r border-gray-100 font-medium text-gray-500 align-top">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-3 border-r border-gray-100 font-bold text-gray-700 align-top">
                              {String(kondisi.tanggal_monitoring).split("T")[0]}
                            </td>

                            <td className="px-3 py-3 border-r border-gray-100 align-top">
                              <div className="text-[10px] sm:text-xs text-gray-600 space-y-1.5">
                                <div>
                                  <p>
                                    <span className="font-semibold text-green-600">
                                      Bersih:
                                    </span>{" "}
                                    {kondisi.kondpi_bersih} Pkk
                                  </p>
                                  <p>
                                    <span className="font-semibold text-yellow-600">
                                      Gulma Ringan:
                                    </span>{" "}
                                    {kondisi.kondpi_bergulma_ringan} Pkk
                                  </p>
                                  <p>
                                    <span className="font-semibold text-red-600">
                                      Gulma Berat:
                                    </span>{" "}
                                    {kondisi.kondpi_bergulma_lebat} Pkk
                                  </p>
                                </div>
                                <div className="pt-1.5 border-t border-gray-100/80">
                                  <p>
                                    <span className="font-medium text-gray-500">
                                      Tanah Kering:
                                    </span>{" "}
                                    {kondisi.kondper_kering} Pkk
                                  </p>
                                  <p>
                                    <span className="font-medium text-gray-500">
                                      Tanah Lembab:
                                    </span>{" "}
                                    {kondisi.kondper_lembab} Pkk
                                  </p>
                                  <p>
                                    <span className="font-medium text-gray-500">
                                      Tanah Genang:
                                    </span>{" "}
                                    {kondisi.kondper_menggenang} Pkk
                                  </p>
                                </div>
                                {kondisi.catatan_tindakan && (
                                  <div className="pt-1">
                                    <p className="italic text-gray-500 bg-gray-50 p-1 rounded">
                                      " {kondisi.catatan_tindakan} "
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="px-3 py-3 bg-gray-50/50 align-top">
                              {aktivitasList.length > 0 ? (
                                <div className="space-y-2">
                                  {aktivitasList.map((akt, i) => (
                                    <div
                                      key={i}
                                      className="bg-white border border-green-200 p-2.5 rounded-md shadow-sm"
                                    >
                                      <p className="font-bold text-green-700 text-xs">
                                        {akt.aktivitas_kegiatan}
                                      </p>
                                      {akt.deskripsi_kegiatan ? (
                                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1 mb-1.5">
                                          {akt.deskripsi_kegiatan}
                                        </p>
                                      ) : null}
                                      <div className="flex justify-between items-end mt-1.5 pt-1.5 border-t border-green-50">
                                        <div className="text-[10px] text-gray-500 leading-tight">
                                          <p>
                                            Tgl Tindakan:{" "}
                                            <span className="font-medium text-gray-700">
                                              {akt.tanggal_monitoring
                                                ? String(
                                                    akt.tanggal_monitoring,
                                                  ).split("T")[0]
                                                : String(
                                                    kondisi.tanggal_monitoring,
                                                  ).split("T")[0]}
                                            </span>
                                          </p>
                                          <p>
                                            Petugas:{" "}
                                            <span className="font-medium text-gray-700">
                                              {akt.jumlah_petugas
                                                ? `${akt.jumlah_petugas} Orang`
                                                : "-"}
                                            </span>
                                          </p>
                                        </div>
                                        {akt.dokumentasi_aktivitas_url && (
                                          <a
                                            href={getFileUrl(
                                              akt.dokumentasi_aktivitas_url,
                                              "FARM",
                                            )}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[#EF8523] hover:underline flex items-center gap-1 text-[10px] font-bold bg-orange-50 px-1.5 py-0.5 rounded"
                                          >
                                            <FileText size={12} /> Foto
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setPopupType("piringan_aktivitas");
                                    setFormData({
                                      monitoring_piringan_id: kondisi.id,
                                    });
                                    setShowPopup(true);
                                  }}
                                  className="w-full bg-green-100 text-green-700 hover:bg-green-500 hover:text-white px-3 py-2.5 rounded-lg text-xs font-bold transition-all border border-green-200 hover:border-green-500 flex items-center justify-center gap-1.5 shadow-sm mt-1"
                                >
                                  <Plus size={14} /> Catat Tindakan Perawatan
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem id="pupuk" title={MONITORING_CONFIG.pupuk.title}>
            {renderTable("pupuk")}
          </AccordionItem>

          <AccordionItem id="opt" title={MONITORING_CONFIG.opt.title}>
            {renderTable("opt")}
          </AccordionItem>

          {renderPopup()}
        </div>
      </div>
    </div>
  );
}
