import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronDown,
  Plus,
  X,
  FileText,
  Save,
  ClipboardList,
} from "lucide-react";
import { API_ENDPOINTS, getFileUrl } from "../../../../config/constants";

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
  master_pupuk: [
    { value: 1, label: "Urea" },
    { value: 2, label: "NPK" },
    { value: 3, label: "Kieserite" },
    { value: 4, label: "Dolomite" },
    { value: 5, label: "Borate" },
  ],
  cuaca_pemupukan: [
    { value: "Cerah", label: "Cerah" },
    { value: "Hujan", label: "Hujan" },
  ],

  // --- PESTISIDA ---
  master_pestisida: [
    { value: 1, label: "Glifosat (RoundUp)" },
    { value: 2, label: "Parakuat (Gramoxone)" },
    { value: 3, label: "Metil Metsulfuron" },
    { value: 4, label: "Insektisida Ulat" },
  ],
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
    title: "Monitoring Kebersihan & Sanitasi Kebun",
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
    title: "Monitoring Tanaman Penutup Tanah (LCC)",
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
        label: "Jenis Lainnya",
        placeholder: "Jika pilih Lainnya",
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
    title: "Monitoring Kondisi Pemeliharaan Piringan",
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
      { key: "tanggal_monitoring", label: "Tanggal Sensus", type: "date" },
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
    title: "Monitoring Aktivitas Pemeliharaan Piringan",
    columns: [
      {
        header: "ID Parent",
        key: "monitoring_piringan_id",
        width: "100px",
        align: "left",
      },
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
        label: "Pilih Hasil Sensus Kondisi (Tautan)",
        type: "select_parent_piringan", // Kita gunakan tipe kustom
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
    title: "Monitoring Penggunaan Pupuk",
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
      {
        key: "dinamis_pupuk_id",
        label: "Jenis Pupuk",
        type: "select",
        options: ENUM_OPTIONS.master_pupuk,
      },
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
    title: "Monitoring Penggunaan Pestisida dan Pengendalian OPT",
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
      {
        key: "dinamis_pestisida_id",
        label: "Pestisida",
        type: "select",
        options: ENUM_OPTIONS.master_pestisida,
      },
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

// MAIN COMPONENT
// Dokumentasi: Komponen utama yang mengatur state monitoring,

export default function MonitoringGAP({
  monitoringData,
  setMonitoringData,
  openSection,
  setOpenSection,
  blokId,
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // --- FETCHING DATA ---
  // Dokumentasi: Mengambil data dari Backend berdasarkan endpoint yang sesuai.
  // URL diambil dari constants API_ENDPOINTS.
  // (SESUAI BE MAHAR)
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
    [blokId, setMonitoringData],
  );

  useEffect(() => {
    if (openSection) {
      if (openSection === "piringan_aktivitas")
        fetchSectionData("piringan_kondisi");
      else fetchSectionData(openSection);
    }
  }, [openSection, fetchSectionData]);

  // --- FORM HANDLERS (SAVE) ---
  // Dokumentasi: Menyimpan data baru via POST request. Payload menggunakan FormData.
  // (SESUAI BE MAHAR)
  const handleSave = async () => {
    if (!popupType || !blokId) return;
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = new FormData();

      Object.keys(formData).forEach((key) => {
        let value = formData[key];

        // LOGIKA KHUSUS: Ubah Date menjadi Datetime untuk field tertentu
        // Backend minta format: "YYYY-MM-DDTHH:mm:ss"
        if (
          (key === "tanggal_pemupukan" || key === "tanggal_pemakaian") &&
          value
        ) {
          // Jika value cuma "2023-10-25", kita tambah jam default "T00:00:00"
          // Hasil akhir: "2023-10-25T00:00:00" (Valid Datetime)
          value = `${value}T00:00:00`;
        }

        if (value) payload.append(key, value);
      });

      let url = "";
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

      const res = await fetch(url, { method: "POST", headers, body: payload });
      if (!res.ok) throw new Error("Gagal simpan data");

      alert("Berhasil disimpan!");
      setShowPopup(false);
      if (popupType.includes("piringan")) fetchSectionData("piringan_kondisi");
      else fetchSectionData(popupType);
    } catch (e) {
      alert(e.message);
    }
  };

  // --- RENDER TABLE SECTION ---
  // Dokumentasi: Merender tabel monitoring.
  const renderTable = (configKey, customTitle = null) => {
    const config = MONITORING_CONFIG[configKey];
    const data = Array.isArray(monitoringData[configKey])
      ? monitoringData[configKey]
      : [];
    const title = customTitle || config.title;

    return (
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex justify-between items-center bg-gray-50 p-2.5 sm:p-3 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 sm:h-5 bg-[#EF8523] rounded-full"></div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-800 tracking-wide">
              {title}
            </h4>
          </div>
          <button
            onClick={() => {
              setPopupType(configKey);
              setFormData({});
              setShowPopup(true);
            }}
            className="flex items-center gap-1.5 sm:gap-2 bg-[#EF8523] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-[10px] sm:text-xs font-bold hover:bg-[#d9751d] transition shadow-sm active:scale-95"
          >
            <Plus size={14} className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> TAMBAH DATA
          </button>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white pb-2 custom-scrollbar">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 text-xs sm:text-sm animate-pulse">
              Memuat data...
            </div>
          ) : (
            <table className="min-w-full" style={{ tableLayout: "fixed" }}>
              {/* HEADER DEFINITION - FORCED CENTER */}
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

              {/* BODY - DYNAMIC ALIGNMENT */}
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
  // Dokumentasi: Modal Form untuk input data.
  const renderPopup = () => {
    if (!showPopup || !popupType) return null;
    const config = MONITORING_CONFIG[popupType];

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
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
                      {field.options.map((opt, i) => (
                        <option key={i} value={opt.value}>
                          {opt.label || opt.value}
                        </option>
                      ))}
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
                      <option value="">-- Pilih Sensus Kondisi --</option>
                      {monitoringData.piringan_kondisi &&
                      monitoringData.piringan_kondisi.length > 0 ? (
                        monitoringData.piringan_kondisi.map((parent) => (
                          <option key={parent.id} value={parent.id}>
                            Sensus Tgl:{" "}
                            {String(parent.tanggal_monitoring).split("T")[0]}{" "}
                            (Bersih: {parent.kondpi_bersih} Pkk)
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Belum ada data Sensus Kondisi!
                        </option>
                      )}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                      size={14}
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
              className="px-5 py-2 text-xs sm:text-sm bg-[#EF8523] text-white font-bold rounded-lg hover:bg-[#d9751d] shadow-md hover:shadow-lg transition flex items-center gap-2 active:scale-95"
            >
              <Save size={14} className="sm:w-4 sm:h-4" /> Simpan
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

          {/* PANAH */}
          <ChevronDown
            className={`flex-none transition-transform duration-300 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 ${
              isOpen ? "rotate-180 text-[#EF8523]" : ""
            }`}
          />
        </div>

        {/* CONTENT */}
        {isOpen && (
          <div className="p-3 sm:p-6 border-t border-orange-100">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4 pb-20 sm:pb-24">
      <AccordionItem id="sanitasi" title={MONITORING_CONFIG.sanitasi.title}>
        {renderTable("sanitasi")}
      </AccordionItem>

      <AccordionItem id="coverCrop" title={MONITORING_CONFIG.coverCrop.title}>
        {renderTable("coverCrop")}
      </AccordionItem>

      <AccordionItem
        id="piringan_aktivitas"
        title="Monitoring Piringan (Kondisi & Aktivitas)"
      >
        <div className="space-y-6 sm:space-y-8">
          {renderTable("piringan_aktivitas")}
          <div className="border-t border-dashed border-gray-300 relative">
            <span className="absolute left-1/2 -top-2.5 sm:-top-3 -translate-x-1/2 bg-white px-2 sm:px-3 text-[10px] sm:text-xs text-gray-400 font-medium">
              Data Sensus
            </span>
          </div>
          {renderTable("piringan_kondisi")}
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
  );
}
