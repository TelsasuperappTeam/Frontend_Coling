import React, { useState } from "react";
import {
  ClipboardList,
  FileText,
  Activity,
  CheckSquare,
  Square,
  Sprout,
  Eye,
  Upload,
  Info,
  FileCheck,
  AlertCircle,
  Clock,
  Printer,
  Loader,
} from "lucide-react";

import { API_ENDPOINTS, API_BASE_URLS } from "./../../config/constants";

export default function PantauISPO() {
  // State untuk Tab Prinsip (1-5)
  const [activeSubTab, setActiveSubTab] = useState(1);
  
  // (SESUAI BE MAHAR) State untuk handle loading saat generate dokumen
  const [loadingDoc, setLoadingDoc] = useState(false);

  // ==========================================================================
  // DATA SUMBER (PRINSIP 1 - 5) - STATIC DATA (Belum Dinamis)
  // ==========================================================================

  // DATA PRINSIP 1 (Legalitas)
  const prinsip1Data = [
    {
      kriteria: "1. Legalitas dan Pengelolaan Pekebun (Kriteria 1.1)",
      items: [
        {
          label:
            "Dokumen Bukti Kepemilikan Tanah (HGU/SHM/Akta Jual Beli/Girik)",
          checked: true,
        },
        {
          label:
            "Surat Proses Pengurusan Hak Atas Tanah (bukti pengajuan ke BPN)",
          checked: false,
        },
        { label: "Dokumen STDB (Surat Tanda Daftar Budidaya)", checked: true },
        { label: "Daftar Luas Lahan Kelola per Pekebun", checked: true },
        { label: "Peta/Sketsa Kepemilikan Lahan Pekebun", checked: false },
      ],
    },
    {
      kriteria: "2. Lokasi Pekebun (Kriteria 1.2)",
      items: [
        { label: "Dokumen Izin Lokasi dari Pemerintah Daerah", checked: false },
        { label: "Surat Pernyataan Lokasi sesuai RTRW", checked: false },
        { label: "Peta Lokasi Kebun sesuai RTRW", checked: false },
      ],
    },
    {
      kriteria: "3. Sengketa Lahan dan Kompensasi (Kriteria 1.3)",
      items: [
        { label: "Dokumen Identifikasi Areal Sengketa", checked: false },
        { label: "Peta/Sketsa Lahan Sengketa", checked: false },
        { label: "Laporan Penyelesaian Sengketa", checked: false },
        {
          label:
            "Surat/Perjanjian Kesepakatan Penyelesaian Sengketa (bermaterai)",
          checked: false,
        },
        { label: "Bukti Dokumentasi Proses Mediasi", checked: false },
      ],
    },
    {
      kriteria: "4. Legalitas Usaha Pekebun (Kriteria 1.4)",
      items: [
        { label: "Dokumen STDB Usaha Perkebunan (<25 Ha)", checked: false },
        {
          label: "Surat Keterangan Usaha Perkebunan dari Instansi Terkait",
          checked: false,
        },
        { label: "Fotokopi Identitas Pekebun (KTP, KK)", checked: false },
      ],
    },
    {
      kriteria: "5. Kewajiban Izin Lingkungan (Kriteria 1.5)",
      items: [
        {
          label: "Dokumen SPPL (Surat Pernyataan Pengelolaan Lingkungan)",
          checked: false,
        },
        {
          label: "Catatan Penerapan SPPL (monitoring kegiatan lingkungan)",
          checked: false,
        },
        {
          label: "Laporan Pelaksanaan SPPL ke Instansi Terkait (Dinas LH)",
          checked: false,
        },
      ],
    },
  ];

  // DATA PRINSIP 2 (Praktek Perkebunan)
  // REVISI: Menambahkan actionType: "system" pada item yang diminta agar muncul tombol "Menunggu Kebun"
  const prinsip2Data = [
    {
      kriteria: "1. Organisasi Kelembagaan Pekebun (Kriteria 2.1)",
      items: [
        {
          label: "Surat Bukti Keanggotaan Kelompok Tani/Koperasi",
          checked: false,
          actionType: "system",
        },
        {
          label: "Berita Acara Pembentukan Kelompok Tani/Koperasi",
          checked: false,
          actionType: "system",
        },
        { 
          label: "Daftar Susunan Pengurus & Uraian Tugas", 
          checked: false,
          actionType: "system",
        },
        { 
          label: "Akta Pendirian dan AD/ART Koperasi", 
          checked: false,
          actionType: "system", 
        },
        { 
          label: "Dokumen Badan Hukum Koperasi", 
          checked: false,
          actionType: "system",
        },
        { 
          label: "Daftar Anggota (20–30 Pekebun)", 
          checked: false,
          actionType: "system",
        },
      ],
    },
    {
      kriteria: "2. Pengelolaan Pekebun (Kriteria 2.2)",
      items: [
        {
          label: "Rencana Kegiatan Operasional (RKO) Pekebun/Kelompok",
          checked: false,
          actionType: "system",
        },
        { label: "Laporan Kegiatan Bulanan/Tahunan Pekebun", checked: false },
        { label: "Dokumen Rencana Peremajaan (jika ada)", checked: false },
      ],
    },
    {
      kriteria: "3. Pembukaan Lahan (Kriteria 2.3.1)",
      items: [
        { 
          label: "SOP Pembukaan Lahan Tanpa Bakar", 
          checked: false,
          actionType: "system",
        },
        { label: "Dokumentasi Kegiatan Pembukaan Lahan", checked: false },
        {
          label: "Rekaman Penanaman pada Lahan Miring (terasering)",
          checked: false,
        },
        { label: "Rekaman Sistem Drainase Lahan", checked: false },
      ],
    },
    {
      kriteria: "4. Perbenihan (Kriteria 2.3.2)",
      items: [
        { 
          label: "Rekaman Penggunaan Benih Bersertifikat", 
          checked: false,
          actionType: "system",
        },
        {
          label: "Dokumen Sosialisasi Benih Bersertifikat (via Gapoktan)",
          checked: false,
        },
        {
          label: "Surat Keterangan Benih dari Dinas Perkebunan/UPTD",
          checked: false,
        },
        {
          label: "Catatan Asal Benih dan Distribusi ke Pekebun",
          checked: false,
        },
        {
          label: "Dokumen Rekaman Perbenihan (pencatatan bibit)",
          checked: false,
        },
      ],
    },
    {
      kriteria: "5. Penanaman di Lahan Mineral (Kriteria 2.3.3)",
      items: [
        { 
          label: "SOP Penanaman sesuai GAP", 
          checked: false,
          actionType: "system",
        },
        {
          label:
            "Data Tahun Tanam, Sumber Bibit, Luas Lahan, Jumlah Tanaman/Ha",
          checked: false,
          actionType: "system",
        },
        {
          label:
            "Rekaman Pemupukan, Pengendalian Hama, dan Penggunaan Pestisida",
          checked: false,
          actionType: "system",
        },
        { 
          label: "Catatan Pembuatan Terasering", 
          checked: false,
          actionType: "system",
        },
      ],
    },
    {
      kriteria: "6. Penanaman di Lahan Gambut (Kriteria 2.3.4)",
      items: [
        {
          label: "Rekaman Penanaman Sesuai Regulasi (PP 71/2014, PP 57/2018)",
          checked: false,
        },
        { label: "Rekaman Jarak Tanam dan Tata Air Kebun", checked: false },
        { label: "Rekaman Tanaman Penutup Tanah (Cover Crop)", checked: false },
        {
          label: "Catatan Pengaturan Tinggi Air Tanah (60–80 cm)",
          checked: false,
        },
      ],
    },
    {
      kriteria: "7. Pemeliharaan Tanaman (Kriteria 2.3.5)",
      items: [
        { 
          label: "SOP dan instruksi kerja pemeliharaan tanaman", 
          checked: false,
          actionType: "system",
        },
        { label: "Data Populasi Tanaman dan Penyisipan", checked: false },
        { label: "Rekaman Pemeliharaan Piringan", checked: false },
        { label: "Rekaman Pemeliharaan Cover Crop (TBM)", checked: false },
        { label: "Catatan Penggunaan Pupuk & Pestisida", checked: false },
      ],
    },
    {
      kriteria: "8. Pengendalian OPT (Kriteria 2.3.6)",
      items: [
        { 
          label: "SOP Pengendalian Hama Terpadu (PHT/IPM)", 
          checked: false,
          actionType: "system",
        },
        {
          label: "Daftar Pestisida yang Digunakan (terdaftar di Kementan)",
          checked: false,
        },
        { label: "Foto Ruang Penyimpanan Bahan Kimia", checked: false },
        { 
          label: "SOP Penanganan Limbah Pestisida", 
          checked: false,
          actionType: "system",
        },
      ],
    },
    {
      kriteria: "9. Pemanenan (Kriteria 2.3.7)",
      items: [
        { 
          label: "SOP Penetapan Kriteria Buah Matang Panen", 
          checked: false,
          actionType: "system",
        },
        { label: "Rekaman Rencana Pemanenan", checked: false },
        { label: "Catatan dan Laporan Hasil Panen", checked: false },
        { label: "Data Tenaga Kerja dan Alat Panen", checked: false },
      ],
    },
    {
      kriteria: "10. Pengangkutan Buah (Kriteria 2.3.8)",
      items: [
        { 
          label: "SOP Pengangkutan TBS", 
          checked: false,
          actionType: "system",
        },
        { label: "Rekaman Transportasi & Sarana Pendukung", checked: false },
        { 
          label: "Dokumen Kualitas TBS di Pengiriman", 
          checked: false,
          actionType: "system",
        },
      ],
    },
  ];


  // DATA PRINSIP 3 (LINGKUNGAN)
  const prinsip3Data = [
    {
      kriteria: "1. Pencegahan & Penanggulangan Kebakaran (Kriteria 3.1)",
      items: [
        {
          label: "SOP Pencegahan & Penanggulangan Kebakaran",
          checked: false,
          actionType: "system",
        },
        {
          label: "Peta Area Rawan Kebakaran",
          checked: false,
          actionType: "system",
        },
        {
          label: "Daftar dan Foto Peralatan Pemadam",
          checked: false,
          actionType: "info",
          infoText: "Lihat di Inventaris Anda",
        },
        {
          label: "Rekaman Simulasi Tanggap Darurat Kebakaran",
          checked: false,
          actionType: "system",
        },
      ],
    },
    {
      kriteria: "2. Pelestarian Keanekaragaman Hayati (Kriteria 3.2)",
      items: [
        {
          label: "SOP Identifikasi Satwa & Tumbuhan Langka",
          checked: false,
          actionType: "system",
        },
        {
          label: "SOP Perlindungan Satwa & Tumbuhan Langka",
          checked: false,
          actionType: "system",
        },
        {
          label: "Daftar Satwa & Tumbuhan yang Ditemukan",
          checked: false, 
          actionType: "manual",
        },
      ],
    },
  ];

  // DATA PRINSIP 4 (Transparansi)
  // REVISI: Menambahkan actionType: "system" agar muncul tombol "Menunggu Kebun"
  const prinsip4Data = [
    {
      kriteria: "1. Penjualan dan Kesepakatan Harga (Kriteria 4.1)",
      items: [
        { 
          label: "Dokumen Acuan Harga TBS dari Pemerintah", 
          checked: false,
          actionType: "system",
        },
        { label: "Rekaman Harga TBS dan Realisasi Penjualan", checked: false },
        {
          label: "Sumber Informasi Harga (web, dinas, koperasi)",
          checked: false,
        },
        {
          label:
            "Dokumen Perjanjian Kerja Sama Kemitraan (dengan TTD kedua pihak & Kepala Dinas)",
          checked: false,
          actionType: "system",
        },
      ],
    },
    {
      kriteria: "2. Penyediaan Data & Informasi (Kriteria 4.2)",
      items: [
        {
          label: "SOP Pelayanan Informasi (alur permintaan & tindak lanjut)",
          checked: false,
          actionType: "system",
        },
        {
          label: "Rekaman Pemberian Informasi ke Pemangku Kepentingan",
          checked: false,
        },
        {
          label: "Rekaman Tanggapan terhadap Permintaan Informasi",
          checked: false,
        },
      ],
    },
  ];

  // DATA PRINSIP 5 (Peningkatan Usaha)
  // REVISI: Menambahkan actionType: "system" agar muncul tombol "Menunggu Kebun"
  const prinsip5Data = [
    {
      kriteria: "1. Meningkatkan Kinerja (Kriteria 5.1)",
      items: [
        { label: "Dokumen Identifikasi Potensi Perbaikan", checked: false },
        { 
          label: "Rekaman Tindakan Perbaikan & Inovasi Usaha", 
          checked: false,
          actionType: "system",
        },
        {
          label: "Rencana Peningkatan Produktivitas & Efisiensi Kebun",
          checked: false,
          actionType: "system",
        },
      ],
    },
  ];

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  const calculateProgress = (data) => {
    let totalItems = 0;
    let checkedItems = 0;
    data.forEach((group) => {
      totalItems += group.items.length;
      checkedItems += group.items.filter((item) => item.checked).length;
    });
    return totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);
  };

  const progressPrinsip1 = calculateProgress(prinsip1Data);
  const progressPrinsip2 = calculateProgress(prinsip2Data);
  const progressPrinsip3 = calculateProgress(prinsip3Data);
  const progressPrinsip4 = calculateProgress(prinsip4Data);
  const progressPrinsip5 = calculateProgress(prinsip5Data);

  const tabs = [
    { id: 1, title: "Prinsip 1", percentage: progressPrinsip1 },
    { id: 2, title: "Prinsip 2", percentage: progressPrinsip2 },
    { id: 3, title: "Prinsip 3", percentage: progressPrinsip3 },
    { id: 4, title: "Prinsip 4", percentage: progressPrinsip4 },
    { id: 5, title: "Prinsip 5", percentage: progressPrinsip5 },
  ];

  // ==========================================================================
  // RENDER COMPONENT
  // ==========================================================================

  const renderPrinsipView = (title, data, progress) => {
    let IconComponent = FileText;
    if (title.includes("Prinsip 2") || title.includes("Prinsip 3")) {
      IconComponent = Sprout;
    } else if (title.includes("Prinsip 5")) {
      IconComponent = Activity;
    }

    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          <IconComponent className="text-[#B5302D]" size={24} />
          <div className="flex flex-col">
            <h3 className="font-bold text-gray-800 text-sm sm:text-base">
              {title}
            </h3>
            <span className="text-xs text-gray-500 font-medium mt-0.5">
              Progres kelengkapan:{" "}
              <span
                className={`font-bold ${progress === 100 ? "text-green-600" : "text-[#B5302D]"}`}
              >
                {progress}%
              </span>
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {data.map((group, idx) => (
            <div
              key={idx}
              className="bg-gray-50 rounded-xl p-4 border border-gray-100"
            >
              <h4 className="font-bold text-[#B5302D] text-xs sm:text-sm mb-4">
                {group.kriteria}
              </h4>
              <ul className="space-y-3">
                {group.items.map((item, itemIdx) => {
                  if (item.actionType) {
                    return (
                      <li
                        key={itemIdx}
                        className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-orange-100 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 shrink-0 ${item.checked ? "text-green-600" : "text-gray-300"}`}
                          >
                            {item.checked ? (
                              <FileCheck size={20} />
                            ) : (
                              <AlertCircle size={20} />
                            )}
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-gray-700 leading-snug">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {item.checked
                                ? "Dokumen tersedia"
                                : "Dokumen belum tersedia"}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex justify-end">
                          {item.actionType === "system" &&
                            (item.checked ? (
                              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                <Eye size={14} />
                                Lihat File
                              </button>
                            ) : (
                              <button
                                disabled
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                              >
                                <Clock size={14} />
                                Menunggu Kebun
                              </button>
                            ))}

                          {item.actionType === "info" &&
                            (item.checked ? (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                                <Info size={14} />
                                {item.infoText}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-400 border border-red-100">
                                <AlertCircle size={14} />
                                Data Kosong
                              </div>
                            ))}

                          {item.actionType === "manual" &&
                            (item.checked ? (
                              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                                <Eye size={14} />
                                Lihat/Ubah
                              </button>
                            ) : (
                              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-[#EF8523] hover:bg-orange-100 transition-colors shadow-sm">
                                <Upload size={14} />
                                Upload Dokumen
                              </button>
                            ))}
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li
                      key={itemIdx}
                      className="flex items-start gap-3 text-xs sm:text-sm text-gray-600"
                    >
                      <div
                        className={`mt-0.5 shrink-0 ${item.checked ? "text-green-600" : "text-gray-300"}`}
                      >
                        {item.checked ? (
                          <CheckSquare size={16} />
                        ) : (
                          <Square size={16} />
                        )}
                      </div>
                      <span
                        className={`${item.checked ? "text-gray-800 font-medium" : "text-gray-500"} leading-snug`}
                      >
                        {item.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSubTab) {
      case 1:
        return renderPrinsipView(
          "Prinsip 1 (Kepatuhan Terhadap Peraturan dan Perundangan)",
          prinsip1Data,
          progressPrinsip1,
        );
      case 2:
        return renderPrinsipView(
          "Prinsip 2 (Penerapan Praktek Perkebunan yang Baik)",
          prinsip2Data,
          progressPrinsip2,
        );
      case 3:
        return renderPrinsipView(
          "Prinsip 3 (Pengelolaan Lingkungan, SDA, & Keanekaragaman Hayati)",
          prinsip3Data,
          progressPrinsip3,
        );
      case 4:
        return renderPrinsipView(
          "Prinsip 4 (Penerapan Transparansi)",
          prinsip4Data,
          progressPrinsip4,
        );
      case 5:
        return renderPrinsipView(
          "Prinsip 5 (Peningkatan Usaha Secara Berkelanjutan)",
          prinsip5Data,
          progressPrinsip5,
        );
      default:
        return null;
    }
  };

  // ==========================================================================
  // DATA UNTUK FITUR: BUAT DOKUMEN OTOMATIS
  // ==========================================================================
  const autoDocs = [
    { id: 1, title: "Dokumen Laporan Operasional Kebun" },
    {
      id: 2,
      title:
        "Dokumen Laporan Pelaksanaan SPPL (Surat Pengelolaan dan Pemantauan Lingkungan)",
    },
    { id: 3, title: "Dokumen Realisasi Penjualan Sawit" },
  ];

 // (SESUAI BE MAHAR) Fungsi Logic Generate Dokumen
  const handleGenerateDocument = async (docId, title) => {
    if (docId === 1) { // Laporan Operasional Kebun
      setLoadingDoc(true);
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(API_ENDPOINTS.ISPO.PETANI.GENERATE_DOKUMEN_ISPO_OPERASIONAL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        // Ambil data balasan dari Backend sebagai JSON
        const data = await response.json();

        // Tangani jika status HTTP Error (misal 403 / 500)
        if (!response.ok) {
          alert(`Gagal: ${data.detail || data.message || "Terjadi kesalahan"}`);
          setLoadingDoc(false);
          return;
        }

        if (data.download_url) {

          const fullPdfUrl = `${API_BASE_URLS.ISPO}${data.download_url}`;

          window.open(fullPdfUrl, '_blank');

          // Tampilkan pesan sukses dari Backend ke pengguna
          // "Dokumen berhasil dibuat (Preview). Silakan 'Ajukan ke Kebun' jika sudah sesuai."
          alert(data.message); 

          // (Opsional) Jika Anda butuh ID ini untuk tombol selanjutnya:
          console.log("Status Dokumen:", data.status);
          console.log("Submission ID:", data.submission_id);

        } else {
          alert("Gagal memuat dokumen: URL tidak ditemukan dari server.");
        }

      } catch (error) {
        console.error("Error generating document:", error);
        alert("Terjadi gangguan jaringan atau server tidak merespon.");
      } finally {
        setLoadingDoc(false);
      }
    } else {
      alert(`Fitur generate untuk "${title}" belum tersedia.`);
    }
  };

  return (
    <div className="p-4 sm:p-10 min-h-screen font-sans">
      {/* ======================== HEADER HALAMAN UTAMA ============================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl shadow-sm border border-red-100 shrink-0">
            <ClipboardList className="text-[#B5302D]" size={28} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#B5302D]">
              Pantau ISPO
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Progres sertifikasi ISPO anda serta lengkapi dokumen yang
              dibutuhkan, dan buat dokumen laporan secara otomatis.
            </p>
          </div>
        </div>
      </div>
      <hr className="border-gray-200 mb-8" />

      {/* ======================== BAGIAN 1: BUAT DOKUMEN OTOMATIS ============================ */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-[#B5302D] mb-4 flex items-center gap-2">
          <FileText size={20} />
          Buat Dokumen Otomatis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
          {autoDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-[24px] border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              {/* REVISI UTAMA: MOBILE = FLEX-ROW (Sebelahan), DESKTOP = FLEX-COL (Atas Bawah) */}
              <div className="flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-full flex items-center justify-center sm:mb-4 text-[#B5302D] shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-bold text-gray-800 text-xs sm:text-sm leading-snug sm:leading-relaxed">
                  {doc.title}
                </h3>
              </div>
              
              {/* (SESUAI BE MAHAR) Tombol Generate Dokumen Dinamis */}
              <button 
                onClick={() => handleGenerateDocument(doc.id, doc.title)}
                disabled={loadingDoc && doc.id === 1} // Disable saat loading khusus doc ini
                className={`mt-3 sm:mt-4 w-full flex items-center justify-center gap-2 text-white py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-colors ${
                    loadingDoc && doc.id === 1 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-[#EF8523] hover:bg-[#e5761c]"
                }`}
              >
                {loadingDoc && doc.id === 1 ? (
                    <>
                        <Loader className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                        Memproses...
                    </>
                ) : (
                    <>
                        <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Buat Dokumen
                    </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ======================== BAGIAN 2: MONITORING ISPO ============================ */}
      <div className="animate-fadeIn mt-6">
        <div className="mb-6 px-1">
          <h2 className="text-lg font-bold text-[#B5302D] mb-1">
            Progres Sertifikasi ISPO Anda
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Daftar periksa kelengkapan dokumen berdasarkan prinsip ISPO.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-[32px] shadow-sm overflow-hidden">
          {/* Tab Header - Grid 5 Kolom (Prinsip 1-5) */}
          <div className="grid grid-cols-5 border-b border-gray-100 bg-gray-100 text-[10px] sm:text-xs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-4 font-bold transition-all duration-300 
                  ${activeSubTab === tab.id ? "bg-white text-[#B5302D]" : "text-gray-400 hover:text-[#EF8523] hover:bg-white"}`}
              >
                <span className="text-center px-1 mb-1 truncate w-full">
                  {tab.title}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                    activeSubTab === tab.id
                      ? "bg-red-50 text-[#B5302D]"
                      : "bg-gray-100 text-gray-400 group-hover:bg-orange-50 group-hover:text-[#EF8523]"
                  }`}
                >
                  {tab.percentage}%
                </span>
                {activeSubTab === tab.id && (
                  <div className="absolute bottom-0 w-full h-1 bg-[#B5302D]"></div>
                )}
              </button>
            ))}
          </div>

          {/* Tab Body (Isi Checklist) */}
          <div className="p-4 sm:p-8 bg-white min-h-[300px]">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}