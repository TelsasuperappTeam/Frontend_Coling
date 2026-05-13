import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // TAMBAHAN: Untuk navigasi Link
import {
  FileText,
  Activity,
  Sprout,
  Eye,
  Upload,
  Info,
  AlertCircle,
  Clock,
  Printer,
  Loader,
  Loader2,
  CheckCircle2,
  ArrowRight,
  FileCheck,
} from "lucide-react";

import {
  API_ENDPOINTS,
  API_BASE_URLS,
  getFileUrl,
} from "./../../config/constants";

import { showToast } from "./../../utils/notif";

export default function PantauISPO() {
  const navigate = useNavigate(); // TAMBAHAN: Inisialisasi navigasi

  // State untuk Tab Prinsip (1-5)
  const [activeSubTab, setActiveSubTab] = useState(1);

  // State Dokumen Dinamis
  const [manualDocsStatus, setManualDocsStatus] = useState({});
  const [fetchingDocs, setFetchingDocs] = useState({}); // TAMBAHAN: Untuk loading per-dokumen

  // ==========================================================================
  // DATA SUMBER (PRINSIP 1 - 5) - SESUAI INSTRUKSI 56 ITEM
  // ==========================================================================

  const prinsip1Data = [
    {
      kriteria: "Kriteria 1.1 Legalitas dan Pengelolaan Kebun",
      items: [
        {
          label: "Legalitas Kepemilikan Lahan",
          deskripsi:
            "SHM, Girik, AJB, atau Surat Keterangan Proses. Diunggah melalui fitur tampilan utama saat menambahkan data luas tanah. Jika sudah dilengkapi, akan otomatis tersinkronisasi.",
          actionType: "sync",
          requirementCode: "P1_KEPEMILIKAN",
          link: "/petani/luaslahan",
        },
      ],
    },
    {
      kriteria: "Kriteria 1.2 Lokasi Kebun",
      items: [
        {
          label:
            "Peta lokasi lahan sesuai dengan Rencana Tata Ruang Wilayah (RT RW)",
          deskripsi:
            "Unggah dokumen peta lokasi lahan yang sesuai dengan RT RW pada menu ini.",
          actionType: "manual",
          requirementCode: "P1_RTRW",
        },
      ],
    },
    {
      kriteria: "Kriteria 1.3 Sengketa Lahan dan Kompensasi",
      items: [
        // Belum ada requirementCode di BE
        {
          label:
            "Dokumen progres musyawarah dan peta lahan sengketa (opsional)",
          deskripsi:
            "Jika lahan dalam sengketa, unggah melalui fitur luas tanah. Data akan otomatis ditampilkan di sini.",
          actionType: "sync",
          requirementCode: "--",
          link: "/petani/manajemensengketa",
        },

        // Cek lagi apakah ada di DB apa tidak? karna tidak muncul
        {
          label: "Dokumen kesepakatan terkait penyelesaian sengketa (opsional)",
          deskripsi:
            "Diunggah melalui fitur luas tanah saat proses sengketa berlangsung atau selesai.",
          actionType: "sync",
          requirementCode: "P1_SENGKETA",
          link: "/petani/manajemensengketa",
        },
      ],
    },
    {
      kriteria: "Kriteria 1.4 Legalitas Usaha Perkebunan",
      items: [
        {
          label: "Dokumen STD-B atau Surat Tanda Daftar Usaha Perkebunan",
          deskripsi:
            "Wajib diunggah saat melengkapi data tanah. Gunakan STD-B untuk <25ha, dan IUP untuk >25ha.",
          actionType: "sync",
          requirementCode: "P1_IZIN_USAHA", // DONE
          link: "/petani/luaslahan",
        },
      ],
    },
    {
      kriteria: "Kriteria 1.5 Memiliki Izin Lingkungan sesuai SPPL",
      items: [
        {
          label: "Dokumen SPPL (Surat Pengelolaan dan Pemantauan Lingkungan)",
          deskripsi:
            "Diunggah melalui fitur tampilan utama saat melengkapi data tanah.",
          actionType: "sync",
          requirementCode: "P1_SPPL", // DONE
          link: "/petani/luaslahan",
        },
        {
          label: "Catatan pelaksanaan penerapan SPPL",
          deskripsi:
            "Silahkan lakukan pencatatan dilakukan melalui fitur Manajemen Kebun pada bagian Budidaya dan Monitoring.",
          actionType: "link",
          link: "/petani/manajemenkebun/budidayamonitoring",
        },
        {
          label: "Dokumen laporan pelaksanaan SPPL",
          deskripsi:
            "Laporan ini dibuat otomatis oleh sistem berdasarkan catatan pelaksanaan SPPL yang telah diinput di menu Pantau ISPO, dan petani harus mengajukan ke kebun dulu baru data bisa muncul di sini.",
          actionType: "auto",
          requirementCode: "P1_LAPORAN_SPPL",
        },
      ],
    },
  ];

  const prinsip2Data = [
    {
      kriteria: "Kriteria 2.1 Organisasi Kelembagaan Pekebun",
      items: [
        {
          label: "Daftar anggota kelompok tani / koperasi",
          deskripsi:
            "Dokumen dari Kebun berisi Nama anggota, NIK, Lokasi, dan Luas lahan.",
          actionType: "system",
          requirementCode: "P2_2_1_ANGGOTA",
        },
        {
          label: "SK pengurus & pembagian tugas",
          deskripsi:
            "Dokumen dari Kebun menjelaskan daftar pengurus serta peran dan tanggung jawab.",
          actionType: "system",
          requirementCode: "P2_2_1_SK_PENGURUS",
        },
        {
          label: "AD/ART kelompok",
          deskripsi:
            "Dokumen dari Kebun berisi Anggaran Dasar dan Anggaran Rumah Tangga.",
          actionType: "system",
          requirementCode: "P2_2_1_ADART",
        },
        {
          label: "Dokumen badan hukum",
          deskripsi:
            "Dokumen dari Kebun yang menunjukkan legalitas koperasi / organisasi.",
          actionType: "system",
          requirementCode: "P2_2_1_BADAN_HUKUM",
        },
        {
          label: "Berita acara pembentukan",
          deskripsi:
            "Bukti resmi saat kelompok tani / koperasi didirikan (dari Kebun).",
          actionType: "system",
          requirementCode: "P2_2_1_BERITA_ACARA",
        },
      ],
    },
    {
      kriteria: "Kriteria 2.2 Pengelolaan Perkebunan",
      items: [
        {
          label: "Rencana operasional kebun",
          deskripsi:
            "Dokumen rencana kegiatan kebun berdasarkan data petani, sarana produksi, dll (dari Kebun).",
          actionType: "system",
          requirementCode: "P2_2_2_RENCANA_KERJA",
        },
        {
          label: "Dokumen Laporan operasional kegiatan pekebun",
          deskripsi:
            "Laporan ini dibuat secara otomatis oleh sistem berdasarkan kegiatan operasional Anda.",
          actionType: "auto",
          requirementCode: "P2_2_2_LAPORAN_REALISASI",
        },
      ],
    },
    {
      kriteria: "2.3.1 Pembukaan Lahan",
      items: [
        {
          label: "SOP pembukaan lahan tanpa bakar",
          deskripsi:
            "Dokumen SOP yang mengacu pada pedoman resmi (dari Kebun).",
          actionType: "system",
          requirementCode: "P2_2_3_1_SOP_LAHAN",
        },
        {
          label: "Rekaman kegiatan pembukaan lahan tanpa membakar",
          deskripsi:
            "Bukti ini diunggah melalui fitur luas lahan saat melengkapi data tanah.",
          actionType: "link",
          link: "/petani/luaslahan",
        },
        {
          label: "Rekaman penanaman pada lahan miring/konservasi",
          deskripsi:
            "Diunggah melalui manajemen kebun saat melengkapi input blok/rencana tanam.",
          actionType: "link",
          link: "/petani/manajemenkebun/budidayamonitoring",
        },
      ],
    },
    {
      kriteria: "2.3.2 Pembenihan",
      items: [
        {
          label: "Catatan penggunaan benih bersertifikat",
          deskripsi:
            "Catat penggunaan ini di fitur manajemen kebun (Budidaya Monitoring).",
          actionType: "link",
          link: "/petani/manajemenkebun/budidayamonitoring",
        },
        {
          label: "Catatan asal benih bibit",
          deskripsi: "Catat asal benih di fitur inventaris manajemen kebun.",
          actionType: "link",
          link: "/petani/manajemenkebun/inventaris",
        },
        {
          label: "Bukti sosialisasi informasi benih",
          deskripsi:
            "Dokumen/foto/video sosialisasi dari Kebun melalui kelompok tani.",
          actionType: "system",
          requirementCode: "P2_2_3_9_SOSIALISASI_BENIH", // SUDAH
        },
      ],
    },
    {
      kriteria: "2.3.3 Penanaman pada Lahan Mineral",
      items: [
        {
          label: "SOP penanaman sesuai GAP",
          deskripsi: "SOP praktik budidaya berkelanjutan dari Kebun.",
          actionType: "system",
          requirementCode: "P2_2_3_3_SOP_GAP",
        },
        {
          label: "SOP pedoman teknis penanaman",
          deskripsi: "SOP luas areal, jarak tanam, terasering dari Kebun.",
          actionType: "system",
          requirementCode: "P2_2_3_3_SOP_TEKNIS",
        },
        {
          label: "Catatan pelaksanaan tanam",
          deskripsi:
            "Catat pelaksanaan tanam blok lahan mineral di bagian aktivitas dan monitoring.",
          actionType: "link",
          link: "/petani/manajemenkebun/budidayamonitoring",
        },
      ],
    },
    {
      kriteria: "2.3.4 Penanaman pada Lahan Gambut",
      items: [
        {
          label: "Catatan penanaman pada lahan gambut",
          deskripsi:
            "Catat pelaksanaan penanaman di blok lahan gambut anda pada aktivitas monitoring.",
          actionType: "link",
          link: "/petani/manajemenkebun/budidayamonitoring",
        },
        {
          label: "Monitoring pengaturan tinggi air tanah",
          deskripsi:
            "Catat pelaksanaan monitoring tata air di blok lahan gambut anda pada aktivitas monitoring.",
          actionType: "link",
          link: "/petani/manajemenkebun/budidayamonitoring",
        },
      ],
    },
    {
      kriteria: "2.3.5 Pemeliharaan Tanaman",
      items: [
        {
          label: "SOP pemeliharaan tanaman",
          deskripsi:
            "Instruksi kerja terkait pemeliharaan tanaman (dari Kebun).",
          actionType: "system",
          requirementCode: "P2_2_3_5_SOP_PEMELIHARAAN",
        },
        {
          label: "Data populasi tanaman",
          deskripsi:
            "Lihat atau catat data populasi tanaman di blok lahan anda pada manajemen kebun.",
          actionType: "link",
          link: "/petani/manajemenkebun/budidayamonitoring",
        },
        {
          label: "Catatan pemeliharaan piringan",
          deskripsi:
            "Catat pemeliharaan piringan di blok lahan anda pada aktivitas monitoring.",
          actionType: "link",
          link: "/petani/manajemenkebun/budidayamonitoring",
        },
        {
          label: "Catatan pemeliharaan tanaman penutup tanah",
          deskripsi:
            "Catat pemeliharaan cover crop di blok lahan anda pada aktivitas monitoring.",
          actionType: "link",
          link: "/petani/manajemenkebun/budidayamonitoring",
        },
        {
          label: "Catatan pemupukan",
          deskripsi:
            "Catat aktivitas pemupukan lahan di blok lahan anda pada aktivitas monitoring.",
          actionType: "link",
          link: "/petani/manajemenkebun/budidayamonitoring",
        },
        {
          label: "Catatan perawatan sanitasi kebun",
          deskripsi:
            "Catat perawatan sanitasi blok lahan di blok lahan anda pada aktivitas monitoring.",
          actionType: "link",
          link: "/petani/manajemenkebun/budidayamonitoring",
        },
        {
          label: "Catatan jenis dan jumlah pestisida",
          deskripsi:
            "Catat penggunaan pestisida di blok lahan anda pada aktivitas monitoring.",
          actionType: "link",
          link: "/petani/manajemenkebun/budidayamonitoring",
        },
      ],
    },
    {
      kriteria: "2.3.6 Pengendalian OPT",
      items: [
        {
          label: "SOP pengendalian hama terpadu (PHT/IPM)",
          deskripsi: "Dokumen SOP pengendalian hama (dari Kebun).",
          actionType: "system",
          requirementCode: "P2_2_3_6_SOP_HAMA",
        },
        {
          label: "SOP penanganan limbah pestisida",
          deskripsi: "Dokumen SOP pengelolaan limbah pestisida (dari Kebun).",
          actionType: "system",
          requirementCode: "P2_2_3_6_SOP_LIMBAH",
        },
        {
          label: "Bukti sertifikasi pestisida",
          deskripsi:
            "Bukti bahwa pestisida terdaftar di komisi pestisida (dari Kebun).",
          actionType: "system",
          requirementCode: "P2_2_3_6_SERTIFIKASI_PESTISIDA",
        },
      ],
    },
    {
      kriteria: "2.3.7 Pemanenan",
      items: [
        {
          label: "SOP kriteria buah matang",
          deskripsi: "Standar kematangan panen TBS (dari Kebun).",
          actionType: "system",
          requirementCode: "P2_2_3_7_SOP_MATANG",
        },
        {
          label: "Catatan penyiapan tenaga kerja dan peralatan panen",
          deskripsi:
            "Catat data tenaga kerja dan peralatan di aktivitas monitoring bagian menu panen.",
          actionType: "link",
          link: "/petani/manajemenkebun/budidayamonitoring",
        },
        {
          label: "Catatan rencana panen dan realisasi hasil panen",
          deskripsi:
            "Catat rencana panen dan realisasi hasil panen di aktivitas monitoring bagian menu panen.",
          actionType: "link",
          link: "/petani/manajemenkebun/budidayamonitoring",
        },
      ],
    },
    {
      kriteria: "2.3.8 Pengiriman",
      items: [
        {
          label: "SOP alat transportasi",
          deskripsi: "Dokumen SOP terkait transportasi (dari Kebun).",
          actionType: "system",
          requirementCode: "P2_2_3_8_SOP_TRANSPORT",
        },
        {
          label: "SOP penjagaan kualitas",
          deskripsi: "Dokumen SOP penjagaan kualitas buah (dari Kebun).",
          actionType: "system",
          requirementCode: "P2_2_3_8_SOP_KUALITAS",
        },
        {
          label: "Rekaman kualitas TBS",
          deskripsi:
            "Lihat rekaman pengiriman TBS di riwayat penjualan selesai.",
          actionType: "link",
          link: "/petani/riwayatpenjualan",
        },
      ],
    },
  ];

  const prinsip3Data = [
    {
      kriteria: "Kriteria 3.1 Pencegahan dan Penanggulangan Kebakaran",
      items: [
        {
          label: "SOP pencegahan dan penanggulangan kebakaran",
          deskripsi: "Dokumen prosedur dari Kebun saat terjadi kebakaran.",
          actionType: "system",
          requirementCode: "P3_3_1_PENANGGULANGAN_KEBAKARAN",
        },
        {
          label: "Informasi area rawan kebakaran",
          deskripsi: "Peta atau data lokasi area rawan dari Kebun.",
          actionType: "system",
          requirementCode: "P3_3_2_4_AREAL_RAWAN_KEBAKARAN",
        },
        {
          label: "Catatan daftar peralatan pencegah kebakaran",
          deskripsi:
            "Tambahkan dan lihat daftar peralatan pemadam di fitur inventaris pada manajemen kebun.",
          actionType: "link",
          link: "/petani/manajemenkebun/inventaris",
        },
        {
          label: "Dokumentasi simulasi tanggap darurat",
          deskripsi: "Bukti telah dilakukan simulasi kebakaran (dari Kebun).",
          actionType: "system",
          requirementCode: "P3_3_2_5_SIMULASI_TANGGAP_DARURAT",
        },
      ],
    },
    {
      kriteria: "Kriteria 3.2 Pelestarian Keanekaragaman Hayati",
      items: [
        {
          label: "SOP identifikasi satwa dan tumbuhan langka",
          deskripsi: "Cara mengidentifikasi flora/fauna (dari Kebun).",
          actionType: "system",
          requirementCode: "P3_3_2_1_SOP_IDENTIFIKASI_HAYATI",
        },
        {
          label: "SOP perlindungan satwa dan tumbuhan langka",
          deskripsi: "Upaya perlindungan flora/fauna (dari Kebun).",
          actionType: "system",
          requirementCode: "P3_3_2_2_PERLINDUNGAN_HAYATI",
        },
        {
          label: "Dokumen Catatan keberadaan satwa dan tumbuhan langka",
          deskripsi:
            "Unggah dokumen atau catatan jika menemukan flora/fauna langka di kebun.",
          actionType: "manual",
          requirementCode: "P3_3_2_3_DOKUMEN_KEBERADAAN_SATWA",
        },
      ],
    },
  ];

  const prinsip4Data = [
    {
      kriteria: "Kriteria 4.1 Penjualan dan Kesepakatan Harga TBS",
      items: [
        {
          label: "Catatan harga realisasi pembelian TBS",
          deskripsi: "Lihat harga realisasi pembelian di riwayat penjualan.",
          actionType: "link",
          link: "/petani/riwayatpenjualan",
        },
        {
          label: "Dokumen realisasi penjualan",
          deskripsi:
            "Dokumen ini dibuat otomatis oleh sistem berdasarkan transaksi selesai. Serta memerlukan pengajuan ke kebun untuk bisa muncul di menu ini.",
          actionType: "auto",
          requirementCode: "P4_4_3_DOKUMEN_REALISASI_PENJUALAN",
        },
        {
          label: "Informasi harga TBS dari pemerintah",
          deskripsi:
            "Dokumen SK/Acuan harga terbaru (dari Kebun), silahkan lihat di menu tampilan utama pada bagian grafik harga TBS berdasarkan standar pemerintah wilayah.",
          actionType: "link",
          link: "/petani/dashboard",
        },
        {
          label: "Dokumen kerja sama kemitraan",
          deskripsi:
            "Bentuk kerja sama dengan mitra dan pihak terkait (dari Kebun).",
          actionType: "system",
          requirementCode: "P4_4_2_KERJASAMA_KEMITRAAN",
        },
      ],
    },
    {
      kriteria: "Kriteria 4.2 Penyediaan Data dan Informasi",
      items: [
        {
          label: "SOP pelayanan informasi",
          deskripsi: "Prosedur permintaan informasi (dari Kebun).",
          actionType: "system",
          requirementCode: "P4_4_1_SOP_PELAYANAN_INFORMASI",
        },
      ],
    },
  ];

  const prinsip5Data = [
    {
      kriteria: "Kriteria 5.1 Peningkatan Kinerja",
      items: [
        {
          label: "Rencana aksi peningkatan produksi",
          deskripsi:
            "Langkah/strategi peningkatan produksi kelapa sawit (dari Kebun).",
          actionType: "system",
          requirementCode: "P5_5_1_SOP_RENCANA_PENINGKATAN_PRODUKSI",
        },
      ],
    },
  ];

  // ==========================================================================
  // PROGRESSIVE RENDERING & UPLOAD LOGIC
  // ==========================================================================

  const fetchSingleDocStatus = async (requirementCode) => {
    if (!requirementCode) return;

    // Set loading aktif untuk dokumen ini
    setFetchingDocs((prev) => ({ ...prev, [requirementCode]: true }));

    try {
      const token = localStorage.getItem("token");
      const cleanCode = encodeURIComponent(requirementCode.trim());
      const url = `${API_BASE_URLS.ISPO}/ispo/submission/${cleanCode}`;

      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setManualDocsStatus((prev) => ({
          ...prev,
          [requirementCode]: data,
        }));
      }
    } catch (error) {
      console.error(
        `Gagal mengambil status dokumen ${requirementCode}:`,
        error,
      );
    } finally {
      // Matikan loading
      setFetchingDocs((prev) => ({ ...prev, [requirementCode]: false }));
    }
  };

  const handleUploadDanAjukan = async (requirementCode, file) => {
    if (!file) return;
    if (!requirementCode) {
      showToast.error("Kode dokumen tidak ditemukan!");
      return;
    }

    showToast.loading("Sedang mengunggah dokumen...");
    setFetchingDocs((prev) => ({ ...prev, [requirementCode]: true }));

    try {
      const token = localStorage.getItem("token");

      // TAHAP 1: UPLOAD
      const formData = new FormData();
      formData.append("requirement_code", requirementCode);
      formData.append("file", file);

      const uploadRes = await fetch(API_ENDPOINTS.ISPO.KEBUN.SUBMISSION, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Gagal mengunggah dokumen.");
      const uploadData = await uploadRes.json();
      const submissionId = uploadData.id || uploadData.submission_id;

      // TAHAP 2: AJUKAN
      if (submissionId) {
        const ajukanUrl = API_ENDPOINTS.ISPO.PETANI.AJUKAN_DOKUMEN_ISPO.replace(
          "{id}",
          submissionId,
        );

        const ajukanRes = await fetch(ajukanUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!ajukanRes.ok)
          throw new Error("Gagal mengajukan dokumen ke sistem.");
      }

      showToast.success("Dokumen berhasil diunggah dan diajukan!");

      // Refresh status spesifik untuk UI update
      await fetchSingleDocStatus(requirementCode);
    } catch (error) {
      console.error("Proses upload error:", error);
      showToast.error(error.message || "Terjadi kesalahan.");
    } finally {
      showToast.dismiss();
      setFetchingDocs((prev) => ({ ...prev, [requirementCode]: false }));
    }
  };

  // State untuk nyimpan progres persentase dinamis
  const [ispoProgress, setIspoProgress] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });

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
        if (data.progress_summary) {
          setIspoProgress({
            1: Math.round(data.progress_summary.prinsip_1 || 0),
            2: Math.round(data.progress_summary.prinsip_2 || 0),
            3: Math.round(data.progress_summary.prinsip_3 || 0),
            4: Math.round(data.progress_summary.prinsip_4 || 0),
            5: Math.round(data.progress_summary.prinsip_5 || 0),
          });
        }
      }
    } catch (error) {
      console.error("Error fetching ISPO progress:", error);
    }
  }, []);

  // Panggil Fetch API ketika halaman dibuka
  useEffect(() => {
    fetchIspoProgress();

    // Mengumpulkan otomatis semua kode dokumen
    const allPrinsipData = [
      ...prinsip1Data,
      ...prinsip2Data,
      ...prinsip3Data,
      ...prinsip4Data,
      ...prinsip5Data,
    ];
    const codesToFetch = [];

    allPrinsipData.forEach((group) => {
      group.items.forEach((item) => {
        if (
          item.requirementCode &&
          (item.actionType === "system" ||
            item.actionType === "manual" ||
            item.actionType === "sync" ||
            item.actionType === "auto")
        ) {
          codesToFetch.push(item.requirementCode);
        }
      });
    });

    // Panggil fetch status paralel (Progressive Rendering)
    codesToFetch.forEach((code) => fetchSingleDocStatus(code));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchIspoProgress]);

  const tabs = [
    { id: 1, title: "Prinsip 1", percentage: ispoProgress[1] },
    { id: 2, title: "Prinsip 2", percentage: ispoProgress[2] },
    { id: 3, title: "Prinsip 3", percentage: ispoProgress[3] },
    { id: 4, title: "Prinsip 4", percentage: ispoProgress[4] },
    { id: 5, title: "Prinsip 5", percentage: ispoProgress[5] },
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
              className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
            >
              <h4 className="font-bold text-[#B5302D] text-xs sm:text-sm mb-4 border-b border-gray-200 pb-2">
                {group.kriteria}
              </h4>
              <div className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                {group.items.map((item, itemIdx) => {
                  // Analisis Data Status
                  const reqCode = item.requirementCode;
                  const serverData = reqCode ? manualDocsStatus[reqCode] : null;
                  const isFetching = reqCode ? fetchingDocs[reqCode] : false;

                  // Cek kelengkapan
                  let isUploaded = false;
                  let badgeLabel = "Menunggu Unggahan";
                  let badgeClass =
                    "bg-gray-50 text-gray-500 border border-gray-200";

                  if (
                    item.actionType === "system" ||
                    item.actionType === "manual" ||
                    item.actionType === "sync" ||
                    item.actionType === "auto"
                  ) {
                    // --- FE DILONGGARKAN AGAR MEMBACA STATUS DRAFT ---
                    isUploaded = serverData
                      ? serverData.status === "APPROVED" ||
                        serverData.status === "PENDING" ||
                        serverData.status === "DRAFT" ||
                        !!serverData.file_url ||
                        !!serverData.url
                      : false;

                    if (isUploaded) {
                      const statusTeks = serverData.status
                        ? serverData.status
                        : "TERSEDIA";

                      if (item.actionType === "auto") {
                        if (statusTeks === "DRAFT") {
                          badgeLabel = "Draft (Belum Diajukan)";
                          badgeClass =
                            "bg-orange-50 text-orange-600 border border-orange-200";
                        } else if (statusTeks === "PENDING") {
                          badgeLabel = "Menunggu Persetujuan";
                          badgeClass =
                            "bg-yellow-50 text-yellow-600 border border-yellow-200";
                        } else {
                          badgeLabel = `Diunggah (${statusTeks})`;
                          badgeClass =
                            "bg-emerald-50 text-emerald-700 border border-emerald-100";
                        }
                      } else {
                        badgeLabel = `Diunggah (${statusTeks})`;
                        badgeClass =
                          "bg-emerald-50 text-emerald-700 border border-emerald-100";
                      }
                    } else if (item.actionType === "sync") {
                      badgeLabel = "Belum Disinkronisasi";
                    } else if (item.actionType === "auto") {
                      badgeLabel = "Belum Dibuat";
                    }
                  } else if (
                    item.actionType === "link" ||
                    item.actionType === "info"
                  ) {
                    isUploaded = true;
                    badgeLabel =
                      item.actionType === "link"
                        ? "Tersinkronisasi Otomatis"
                        : "Dikelola Oleh Sistem";
                    badgeClass =
                      "bg-blue-50 text-blue-700 border border-blue-100";
                  }

                  // --- DETEKSI SUMBER FILE ---
                  let targetService = "ISPO"; // Default ke port 8004 (ISPO)
                  if (item.actionType === "sync") {
                    targetService = "FARM"; // Ke port 8002 jika sync
                  }

                  const fileUrl = serverData
                    ? getFileUrl(
                        serverData.file_url || serverData.url,
                        targetService,
                      )
                    : null;

                  return (
                    <div
                      key={itemIdx}
                      // HILANGKAN KELAS "group" DI SINI agar tidak ada efek hover kuning menyebar
                      className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-start gap-4 transition-all duration-300 ${
                        isUploaded ? "bg-emerald-50/10" : "hover:bg-gray-50/80"
                      }`}
                    >
                      {/* IKON & TEKS KIRI */}
                      <div className="flex-1 flex items-start gap-3 sm:gap-4 min-w-0">
                        <div
                          // Ganti warna statis agar kalem (Sama persis seperti Operasional Kebun)
                          className={`mt-0.5 p-2.5 rounded-xl flex-shrink-0 transition-all ${
                            isUploaded
                              ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
                              : "bg-gray-50 text-gray-400 border border-gray-200"
                          }`}
                        >
                          {/* LOGO DOKUMEN SELALU TETAP "FileText" */}
                          <FileText className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <h5 className="text-[13px] sm:text-[14px] font-bold text-gray-900 leading-snug">
                            {item.label}
                          </h5>
                          <p className="text-[11px] text-gray-500 leading-relaxed max-w-2xl">
                            {item.deskripsi}
                          </p>

                          {/* STATUS BADGE */}
                          <div className="pt-2">
                            {isFetching ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold bg-blue-50 text-blue-500 border border-blue-100">
                                <Loader2 className="w-3 h-3 animate-spin" />{" "}
                                Memeriksa status...
                              </span>
                            ) : (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold ${badgeClass}`}
                              >
                                {isUploaded ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <AlertCircle className="w-3 h-3" />
                                )}
                                {badgeLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* AREA AKSI KANAN */}
                      <div className="flex flex-row md:flex-col gap-2 shrink-0 md:w-40 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                        {/* --- UNTUK ACTION TYPE: SYSTEM --- */}
                        {item.actionType === "system" &&
                          !isFetching &&
                          (isUploaded ? (
                            <button
                              onClick={() =>
                                fileUrl
                                  ? window.open(fileUrl, "_blank")
                                  : showToast.error("URL tidak tersedia")
                              }
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 text-[11px] font-bold transition-all shadow-sm"
                            >
                              <Eye size={14} /> Lihat File
                            </button>
                          ) : (
                            <button
                              disabled
                              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 text-[10px] font-bold cursor-not-allowed"
                            >
                              <Clock size={12} /> Menunggu Kebun
                            </button>
                          ))}

                        {/* --- UNTUK ACTION TYPE: MANUAL (UPLOAD) --- */}
                        {item.actionType === "manual" && !isFetching && (
                          <>
                            {isUploaded && (
                              <button
                                onClick={() => window.open(fileUrl, "_blank")}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 text-[11px] font-bold transition-all shadow-sm"
                              >
                                <Eye size={14} /> Lihat File
                              </button>
                            )}
                            <label
                              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-sm border ${isUploaded ? "bg-white border-gray-200 text-gray-700 hover:bg-gray-50" : "bg-white border-gray-200 text-gray-700 hover:border-[#B5302D] hover:text-[#B5302D] hover:bg-red-50"}`}
                            >
                              <Upload size={14} />
                              <span>
                                {isUploaded ? "Ubah File" : "Unggah File"}
                              </span>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) =>
                                  handleUploadDanAjukan(
                                    item.requirementCode,
                                    e.target.files[0],
                                  )
                                }
                              />
                            </label>
                          </>
                        )}

                        {/* --- UNTUK ACTION TYPE: SYNC --- */}
                        {item.actionType === "sync" &&
                          !isFetching &&
                          (isUploaded ? (
                            <button
                              onClick={() =>
                                fileUrl
                                  ? window.open(fileUrl, "_blank")
                                  : showToast.error("URL tidak tersedia")
                              }
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 text-[11px] font-bold transition-all shadow-sm"
                            >
                              <Eye size={14} /> Lihat File
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(item.link)}
                              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-[#EF8523] hover:bg-[#EF8523] hover:text-white text-[10px] sm:text-[11px] font-bold transition-all shadow-sm"
                            >
                              Lengkapi Data <ArrowRight size={14} />
                            </button>
                          ))}

                        {/* --- UNTUK ACTION TYPE: LINK --- */}
                        {item.actionType === "link" && (
                          <button
                            onClick={() => navigate(item.link)}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-[#EF8523] hover:bg-[#EF8523] hover:text-white text-[10px] sm:text-[11px] font-bold transition-all shadow-sm"
                          >
                            Pergi ke Fitur <ArrowRight size={14} />
                          </button>
                        )}

                        {/* --- UNTUK ACTION TYPE: INFO --- */}
                        {item.actionType === "info" && (
                          <div className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-bold">
                            <Info size={14} /> Hanya Info
                          </div>
                        )}

                        {/* --- UNTUK ACTION TYPE: AUTO (GENERATE) --- */}
                        {item.actionType === "auto" &&
                          !isFetching &&
                          (isUploaded ? (
                            serverData.status === "PENDING" ||
                            serverData.status === "DRAFT" ? (
                              // TAMPILAN JIKA MASIH PENDING ATAU DRAFT
                              <div className="w-full flex flex-col gap-1.5">
                                <button
                                  onClick={() =>
                                    fileUrl
                                      ? window.open(fileUrl, "_blank")
                                      : showToast.error("URL tidak tersedia")
                                  }
                                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-[10px] font-bold transition-all shadow-sm"
                                >
                                  <Eye size={12} /> Pratinjau File
                                </button>
                                <div
                                  className={`w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-[9px] font-bold text-center leading-none border ${serverData.status === "DRAFT" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}
                                >
                                  <Clock size={10} />{" "}
                                  {serverData.status === "DRAFT"
                                    ? "Harap Ajukan Ulang"
                                    : "Menunggu Kebun"}
                                </div>
                              </div>
                            ) : (
                              // TAMPILAN JIKA SUDAH APPROVED (Normal)
                              <button
                                onClick={() =>
                                  fileUrl
                                    ? window.open(fileUrl, "_blank")
                                    : showToast.error("URL tidak tersedia")
                                }
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 text-[11px] font-bold transition-all shadow-sm"
                              >
                                <Eye size={14} /> Lihat File
                              </button>
                            )
                          ) : (
                            <div className="w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 text-[10px] font-bold text-center leading-tight">
                              <Printer size={12} /> Buat di Menu Atas
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
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
          ispoProgress[1],
        );
      case 2:
        return renderPrinsipView(
          "Prinsip 2 (Penerapan Praktek Perkebunan yang Baik)",
          prinsip2Data,
          ispoProgress[2],
        );
      case 3:
        return renderPrinsipView(
          "Prinsip 3 (Pengelolaan Lingkungan, SDA, & Keanekaragaman Hayati)",
          prinsip3Data,
          ispoProgress[3],
        );
      case 4:
        return renderPrinsipView(
          "Prinsip 4 (Penerapan Transparansi)",
          prinsip4Data,
          ispoProgress[4],
        );
      case 5:
        return renderPrinsipView(
          "Prinsip 5 (Peningkatan Usaha Secara Berkelanjutan)",
          prinsip5Data,
          ispoProgress[5],
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
      title: "Dokumen Laporan Pelaksanaan SPPL (Surat Pengelolaan Lingkungan)",
    },
    { id: 3, title: "Dokumen Realisasi Penjualan Sawit" },
  ];

  // State untuk Pop-up Konfirmasi Ajukan Draft Dokumen Otomatis
  const [draftDocToSubmit, setDraftDocToSubmit] = useState(null);

  const [loadingDocId, setLoadingDocId] = useState(null);

  const handleGenerateDocument = async (docId, title) => {
    if (loadingDocId !== null) return;
    setLoadingDocId(docId);

    try {
      const token = localStorage.getItem("token");
      let endpointUrl = "";
      let reqCode = ""; // Tambahan untuk memanggil ID Submission secara manual

      switch (docId) {
        case 1:
          endpointUrl =
            API_ENDPOINTS.ISPO.PETANI.GENERATE_DOKUMEN_ISPO_OPERASIONAL;
          reqCode = "P2_2_2_LAPORAN_REALISASI";
          break;
        case 2:
          endpointUrl = API_ENDPOINTS.ISPO.PETANI.GENERATE_DOKUMEN_SPPL;
          reqCode = "P1_LAPORAN_SPPL";
          break;
        case 3:
          endpointUrl = API_ENDPOINTS.ISPO.PETANI.GENERATE_DOKUMEN_PENJUALAN;
          reqCode = "P4_4_3_DOKUMEN_REALISASI_PENJUALAN";
          break;
        default:
          showToast.info(`Fitur generate untuk "${title}" belum tersedia.`);
          setLoadingDocId(null);
          return;
      }

      if (!endpointUrl) {
        showToast.error("Endpoint URL tidak ditemukan di konfigurasi.");
        setLoadingDocId(null);
        return;
      }

      // 1. HIT ENDPOINT GENERATE DOKUMEN
      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();
      console.log(`[DEBUG] Respon Generate Dokumen (${title}):`, data);

      if (!response.ok) {
        showToast.error(
          `Gagal: ${data.detail || data.message || "Terjadi kesalahan"}`,
        );
        setLoadingDocId(null);
        return;
      }

      const payload = data.data ? data.data : data;
      const pdfUrl = payload.download_url || payload.file_url || payload.url;
      let subId = payload.submission_id || payload.id;

      if (pdfUrl) {
        const fullPdfUrl = pdfUrl.startsWith("http")
          ? pdfUrl
          : `${API_BASE_URLS.ISPO}${pdfUrl}`;

        // Buka Preview PDF di Tab Baru
        window.open(fullPdfUrl, "_blank");

        // 2. JIKA SUBMISSION ID TIDAK DIKIRIM BE, KITA TARIK MANUAL DARI REQUIREMENT CODE!
        if (!subId && reqCode) {
          try {
            const statusRes = await fetch(
              `${API_BASE_URLS.ISPO}/ispo/submission/${reqCode}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            if (statusRes.ok) {
              const statusData = await statusRes.json();
              // Ambil ID dari hasil tarikan manual
              subId = statusData.id || statusData.submission_id;
            }
          } catch (err) {
            console.warn("Gagal fetch ID manual:", err);
          }
        }

        // 3. TAMPILKAN POP-UP DRAFT UNTUK DIAJUKAN
        if (subId) {
          setDraftDocToSubmit({
            submissionId: subId,
            title: title,
          });

          // Refresh list utama untuk update status di background
          fetchSingleDocStatus(reqCode);
        } else {
          showToast.error(
            "Gagal memproses pengajuan Dokumen tidak ditemukan dari sistem.",
          );
        }
      } else {
        showToast.error(
          "Gagal memuat dokumen: URL File tidak ditemukan dari sistem.",
        );
      }
    } catch (error) {
      console.error("Error generating document:", error);
      showToast.error("Terjadi gangguan jaringan atau sistem tidak merespon.");
    } finally {
      setLoadingDocId(null);
    }
  };

  // Fungsi untuk mengeksekusi endpoint "AJUKAN_DOKUMEN_ISPO"
  const handleSubmitDraftDocument = async () => {
    if (!draftDocToSubmit || !draftDocToSubmit.submissionId) return;

    showToast.loading("Sedang mengajukan dokumen ke Kebun...");

    try {
      const token = localStorage.getItem("token");

      // Ambil template URL dari konstanta, ganti {id} dengan submissionId yg ada di state
      const ajukanUrl = API_ENDPOINTS.ISPO.PETANI.AJUKAN_DOKUMEN_ISPO.replace(
        "{id}",
        draftDocToSubmit.submissionId,
      );

      const response = await fetch(ajukanUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.detail || errData.message || "Gagal mengajukan dokumen.",
        );
      }

      showToast.dismiss();
      showToast.success(
        `Berhasil! Dokumen "${draftDocToSubmit.title}" telah diajukan ke Kebun (Status: PENDING).`,
      );

      // Tutup Modal
      setDraftDocToSubmit(null);

      // (Opsional) Jika ada fitur Refresh progres ISPO keseluruhan, panggil di sini
      // fetchIspoProgress();
    } catch (error) {
      showToast.dismiss();
      console.error("Error Submit Draft:", error);
      showToast.error(error.message);
    }
  };

  return (
    <div className="p-4 sm:p-10 min-h-screen font-sans relative bg-gray-50/30">
      {/* ======================== HEADER HALAMAN UTAMA ============================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl shadow-sm border border-red-100 shrink-0">
            <FileCheck className="text-[#B5302D]" size={28} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#B5302D]">
              Pantau ISPO
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Progres sertifikasi ISPO anda serta lengkapi dokumen yang
              dibutuhkan, dan buat laporan secara otomatis.
            </p>
          </div>
        </div>
      </div>
      <hr className="border-gray-200 mb-8" />

      {/* ======================== BAGIAN 1: BUAT DOKUMEN OTOMATIS ============================ */}
      <div className="mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-2">
        <h2 className="text-base sm:text-lg font-bold text-[#B5302D] mb-3 sm:mb-4 flex items-center gap-2">
          Buat Dokumen Otomatis
        </h2>

        {/* Gap diperkecil di mobile (gap-3) dan normal di desktop (sm:gap-6) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
          {autoDocs.map((doc) => {
            // Cek apakah KARTU INI yang sedang loading
            const isThisLoading = loadingDocId === doc.id;
            // Cek apakah ada KARTU LAIN yang sedang loading (jika ya, disable tombol ini juga agar aman)
            const isAnyLoading = loadingDocId !== null;

            return (
              <div
                key={doc.id}
                // Padding dirampingkan di mobile (p-3.5)
                className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                {/* Gap ikon dan teks dirampingkan di mobile (gap-3) */}
                <div className="flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                  <div
                    // Ukuran kotak ikon diperkecil di mobile (w-10 h-10), desktop tetap (w-12 h-12)
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-xl flex items-center justify-center sm:mb-4 text-[#B5302D] shrink-0 border border-red-100 group-hover:bg-[#B5302D] group-hover:text-white transition-colors"
                  >
                    <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-[12px] sm:text-sm leading-snug">
                      {doc.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => handleGenerateDocument(doc.id, doc.title)}
                  disabled={isAnyLoading} // Disable tombol jika ada proses yang sedang berjalan
                  // Margin top dan padding Y diperkecil di mobile (mt-3 py-2 text-[11px])
                  className={`mt-4 sm:mt-5 w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-sm ${
                    isAnyLoading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" // Warna saat disabled
                      : "bg-[#EF8523] text-white hover:bg-[#e5761c] hover:shadow-[#EF8523]/30"
                  }`}
                >
                  {isThisLoading ? (
                    <>
                      <Loader className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />{" "}
                      Memproses...
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Buat
                      Dokumen
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================== BAGIAN 2: MONITORING ISPO ============================ */}
      <div className="animate-in fade-in slide-in-from-bottom-4 mt-6">
        <div className="mb-6 px-1">
          <h2 className="text-base sm:text-lg font-bold text-[#B5302D] mb-3 sm:mb-4 flex items-center gap-2">
            Daftar Periksa Persyaratan ISPO
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Daftar kelengkapan dokumen berdasarkan prinsip Indonesian
            Sustainable Palm Oil.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-[32px] shadow-sm overflow-hidden">
          {/* Tab Header */}
          <div className="grid grid-cols-5 border-b border-gray-100 bg-gray-50/50 text-[10px] sm:text-xs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-4 font-bold transition-all duration-300 
                  ${activeSubTab === tab.id ? "bg-white text-[#B5302D] shadow-[0_-4px_10px_rgba(0,0,0,0.02)]" : "text-gray-400 hover:text-[#EF8523] hover:bg-white"}`}
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
                  <div className="absolute bottom-0 w-full h-1 bg-[#B5302D] rounded-t-md"></div>
                )}
              </button>
            ))}
          </div>

          {/* Tab Body */}
          <div className="p-4 sm:p-8 bg-white min-h-[300px]">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* ======================== POP-UP KONFIRMASI AJUKAN DRAFT ============================ */}
      {draftDocToSubmit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60  animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <div className="bg-blue-50 p-6 flex flex-col items-center justify-center text-center border-b border-blue-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">
                Dokumen Berhasil Dibuat!
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Kami telah membuka *preview* PDF <b>{draftDocToSubmit.title}</b>{" "}
                di tab baru (Pastikan *pop-up blocker* Anda mati).
              </p>
            </div>

            <div className="p-6 bg-white space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
                <p className="text-[11px] text-yellow-800 leading-snug">
                  Status dokumen saat ini masih <b>DRAFT</b>. Jika isi dokumen
                  sudah sesuai, silakan tekan tombol di bawah agar dokumen resmi
                  diajukan ke meja kerja Kebun untuk divalidasi.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDraftDocToSubmit(null)}
                  className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
                >
                  Nanti Saja (Tutup)
                </button>
                <button
                  onClick={handleSubmitDraftDocument}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                >
                  Ya, Ajukan ke Kebun
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
