import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  CheckCircle,
  ShoppingCart,
  ChevronDown,
  MapPin,
  Search,
  Loader2,
} from "lucide-react";
// Sesuaikan import config dengan konstanta Anda
import {
  API_ENDPOINTS,
  API_BASE_URLS,
  getFileUrl,
} from "../../../config/constants.js";

/* ===================== DEFINISI REQUIREMENTS (DARI KEBUN) ===================== */
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
    code: "P2_2_1_ANGGOTA",
  },
  {
    id: 2,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.1 Organisasi Kelembagaan Pekebun",
    label: "SK pengurus & pembagian tugas",
    deskripsi:
      "Upload dokumen yang menjelaskan: Daftar pengurus serta Peran dan tanggung jawab masing-masing (Contoh: siapa yang menjadi manajer ICS, dll).",
    code: "P2_2_1_SK_PENGURUS",
  },
  {
    id: 3,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.1 Organisasi Kelembagaan Pekebun",
    label: "AD/ART kelompok",
    deskripsi:
      "Upload dokumen Anggaran Dasar dan Anggaran Rumah Tangga (Berisi aturan internal kelompok).",
    code: "P2_2_1_ADART",
  },
  {
    id: 4,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.1 Organisasi Kelembagaan Pekebun",
    label: "Dokumen badan hukum",
    deskripsi:
      "Upload dokumen yang menunjukkan legalitas koperasi / organisasi (Sesuai peraturan yang berlaku).",
    code: "P2_2_1_BADAN_HUKUM",
  },
  {
    id: 5,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.1 Organisasi Kelembagaan Pekebun",
    label: "Berita acara pembentukan",
    deskripsi: "Upload bukti resmi saat kelompok tani / koperasi didirikan.",
    code: "P2_2_1_BERITA_ACARA",
  },

  // Kriteria 2.2
  {
    id: 6,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.2 Pengelolaan Perkebunan",
    label: "Rencana operasional kebun",
    deskripsi:
      "Upload dokumen yang memuat: Rencana kegiatan kebun berdasarkan data petani, Kebutuhan sarana produksi, Perkiraan hasil panen, Kegiatan pemeliharaan dan pengendalian hama, Proses panen dan pengangkutan TBS, Pemeliharaan lahan (terasering, drainase, jalan produksi), dan Rencana peremajaan kebun (jika diperlukan).",
    code: "P2_2_2_RENCANA_KERJA",
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
    code: "P2_2_3_1_SOP_LAHAN",
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
    code: "P2_2_3_9_SOSIALISASI_BENIH",
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
    code: "P2_2_3_3_SOP_GAP",
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
    code: "P2_2_3_3_SOP_TEKNIS",
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
    code: "P2_2_3_5_SOP_PEMELIHARAAN",
  },
  {
    id: 12,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.6 Pengendalian OPT",
    label: "SOP pengendalian hama terpadu (PHT/IPM)",
    deskripsi: "Upload dokumen SOP pengendalian hama.",
    code: "P2_2_3_6_SOP_HAMA",
  },
  {
    id: 13,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.6 Pengendalian OPT",
    label: "SOP penanganan limbah pestisida",
    deskripsi: "Upload dokumen SOP pengelolaan limbah pestisida.",
    code: "P2_2_3_6_SOP_LIMBAH",
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
    code: "P2_2_3_6_SERTIFIKASI_PESTISIDA",
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
    code: "P2_2_3_7_SOP_MATANG",
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
    code: "P2_2_3_8_SOP_TRANSPORT",
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
    code: "P2_2_3_8_SOP_KUALITAS",
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
    code: "P3_3_1_PENANGGULANGAN_KEBAKARAN",
  },
  {
    id: 19,
    prinsip:
      "Prinsip 3. Pengelolaan Lingkungan Hidup, SDA, dan Keanekaragaman Hayati",
    kriteria: "Kriteria 3.1 Pencegahan dan Penanggulangan Kebakaran",
    label: "Informasi area rawan kebakaran",
    deskripsi:
      "Upload dokumen yang memuat: Peta atau data lokasi area rawan kebakaran dan Cakupan seluruh lahan anggota kelompok.",
    code: "P3_3_2_4_AREAL_RAWAN_KEBAKARAN",
  },
  {
    id: 20,
    prinsip:
      "Prinsip 3. Pengelolaan Lingkungan Hidup, SDA, dan Keanekaragaman Hayati",
    kriteria: "Kriteria 3.1 Pencegahan dan Penanggulangan Kebakaran",
    label: "Dokumentasi simulasi tanggap darurat",
    deskripsi:
      "Upload bukti bahwa telah dilakukan simulasi kebakaran, seperti: Foto, laporan, atau berita acara kegiatan.",
    code: "P3_3_2_5_SIMULASI_TANGGAP_DARURAT",
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
    code: "P3_3_2_1_SOP_IDENTIFIKASI_HAYATI",
  },
  {
    id: 22,
    prinsip:
      "Prinsip 3. Pengelolaan Lingkungan Hidup, SDA, dan Keanekaragaman Hayati",
    kriteria: "Kriteria 3.2 Pelestarian Keanekaragaman Hayati",
    label: "SOP perlindungan satwa dan tumbuhan langka",
    deskripsi:
      "Upload dokumen yang menjelaskan upaya perlindungan terhadap satwa dan tumbuhan langka di area kebun.",
    code: "P3_3_2_2_PERLINDUNGAN_HAYATI",
  },

  // --- Prinsip 4. Penerapan Transparansi ---
  // Kriteria 4.1
  {
    id: 23,
    prinsip: "Prinsip 4. Penerapan Transparansi",
    kriteria: "Kriteria 4.1 Penjualan dan Kesepakatan Harga TBS",
    label: "Informasi harga TBS dari pemerintah",
    deskripsi:
      "Pantau grafik pergerakan harga TBS sesuai standar pemerintah di halaman utama dashboard Anda.",
    // KUNCI: Tambahkan properti ini agar sistem tahu ini hanya link
    isRedirect: true,
    redirectPath: "/general_manager_distrik/dashboard",
    code: "P4_1_HARGA",
  },
  {
    id: 24,
    prinsip: "Prinsip 4. Penerapan Transparansi",
    kriteria: "Kriteria 4.1 Penjualan dan Kesepakatan Harga TBS",
    label: "Dokumen kerja sama kemitraan",
    deskripsi:
      "Upload dokumen yang menjelaskan: Bentuk kerja sama dengan mitra serta Hak dan kewajiban masing-masing pihak.",
    code: "P4_4_2_KERJASAMA_KEMITRAAN",
  },

  // Kriteria 4.2
  {
    id: 25,
    prinsip: "Prinsip 4. Penerapan Transparansi",
    kriteria: "Kriteria 4.2 Penyediaan Data dan Informasi",
    label: "SOP pelayanan informasi",
    deskripsi:
      "Upload dokumen yang menjelaskan: Prosedur permintaan dan pemberian informasi serta Mekanisme pelayanan kepada pihak terkait.",
    code: "P4_4_1_SOP_PELAYANAN_INFORMASI",
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

const Operasional2 = () => {
  const navigate = useNavigate();

  // -- STATE IDENTITAS & ROLE --
  const [userRole, setUserRole] = useState(null);
  const [daftarKebun, setDaftarKebun] = useState([]);
  const [selectedKebunId, setSelectedKebunId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // -- STATE DATA PER KEBUN (Object Key: kebun_id) --
  const [dataOrganisasi, setDataOrganisasi] = useState({});
  const [loadingKebun, setLoadingKebun] = useState({});
  const [dataPengurus, setDataPengurus] = useState({});
  const [loadingPengurus, setLoadingPengurus] = useState({});

  // 1. Ambil Role dari Token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.role);
      } catch {
        console.error("Invalid token");
      }
    }
  }, []);

  const isGM = userRole === "general_manager_distrik";

  // 1. Bungkus fetchDataOrganisasi dengan useCallback agar referensinya stabil
  const fetchDataOrganisasi = useCallback(
    async (kebunAuthId) => {
      if (!kebunAuthId) return;
      setLoadingKebun((prev) => ({ ...prev, [kebunAuthId]: true }));
      try {
        const token = localStorage.getItem("token");
        // Logika BE: Jika GM, kirim target_kebun_auth_id untuk melihat data kebun tertentu
        const queryParam = isGM ? `?target_kebun_auth_id=${kebunAuthId}` : "";

        // Fetch dokumen satu per satu ke endpoint ISPO menggunakan DOKUMEN_CONFIG
        const fetchPromises = DOKUMEN_CONFIG.map(async (docConfig) => {
          if (docConfig.isRedirect) return null;

          try {
            // Gunakan endpoint ISPO submission + query param untuk GM
            const url = `${API_ENDPOINTS.ISPO.KEBUN.SUBMISSION}/${docConfig.code}${queryParam}`;

            const response = await fetch(url, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const dataServer = await response.json();
              return {
                tipe_dokumen: docConfig.code,
                file_url: dataServer.file_url,
                status: dataServer.status,
              };
            }
            return null;
          } catch {
            return null;
          }
        });

        const results = await Promise.all(fetchPromises);

        // Map hasil menjadi Object (key: tipe_dokumen) agar lookup cepat
        const docsMap = {};
        results.forEach((res) => {
          if (res) docsMap[res.tipe_dokumen] = res;
        });

        // Simpan data dokumen yang valid ke state sesuai kebunAuthId
        setDataOrganisasi((prev) => ({ ...prev, [kebunAuthId]: docsMap }));
      } catch (error) {
        console.error("Fetch organisasi error:", error);
      } finally {
        setLoadingKebun((prev) => ({ ...prev, [kebunAuthId]: false }));
      }
    },
    [isGM],
  );

  // 2. Fungsi Fetch Data Pengurus
  const fetchDataPengurus = useCallback(
    async (kebunAuthId) => {
      if (!kebunAuthId) return;
      setLoadingPengurus((prev) => ({ ...prev, [kebunAuthId]: true }));
      try {
        const token = localStorage.getItem("token");
        const queryParam = isGM ? `?target_kebun_auth_id=${kebunAuthId}` : "";
        const url = `${API_ENDPOINTS.USER.KEBUN.PENGURUS.MAIN}${queryParam}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Pastikan data berupa array sebelum disimpan
          setDataPengurus((prev) => ({
            ...prev,
            [kebunAuthId]: Array.isArray(data) ? data : [],
          }));
        } else {
          setDataPengurus((prev) => ({ ...prev, [kebunAuthId]: [] }));
        }
      } catch (error) {
        console.error("Fetch pengurus error:", error);
        setDataPengurus((prev) => ({ ...prev, [kebunAuthId]: [] }));
      } finally {
        setLoadingPengurus((prev) => ({ ...prev, [kebunAuthId]: false }));
      }
    },
    [isGM],
  );

  // fetchDataOrganisasi ke dalam dependency array fetchDaftarKebun
  const fetchDaftarKebun = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (isGM) {
        const res = await fetch(
          `${API_BASE_URLS.USER}/users/gm/me/kebun-list`,
          { headers },
        );
        if (res.ok) {
          const data = await res.json();
          setDaftarKebun(data);

          if (data.length > 0) {
            const firstId = data[0].auth_id || data[0].id || "kebun-0";
            setSelectedKebunId(firstId);
            fetchDataOrganisasi(firstId);
          }
        }
      } else {
        const res = await fetch(`${API_BASE_URLS.USER}/users/me`, { headers });
        if (res.ok) {
          const data = await res.json();
          const validId = data.auth_id || data.id || "kebun-0";

          const single = [
            { auth_id: validId, nama_lengkap: data.nama_lengkap },
          ];
          setDaftarKebun(single);
          setSelectedKebunId(validId);
          fetchDataOrganisasi(validId);
        }
      }
    } catch (error) {
      console.error("Fetch kebun error:", error);
    }
  }, [isGM, fetchDataOrganisasi]);

  useEffect(() => {
    if (userRole) fetchDaftarKebun();
  }, [userRole, fetchDaftarKebun]);

  useEffect(() => {
    if (selectedKebunId) {
      if (!dataOrganisasi[selectedKebunId])
        fetchDataOrganisasi(selectedKebunId);
      if (!dataPengurus[selectedKebunId]) fetchDataPengurus(selectedKebunId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKebunId]);

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <ShoppingCart className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Manajemen Operasional
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Pantau dokumen organisasi dan legalitas operasional kebun
              (Read-Only).
            </p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto overflow-hidden">
          <button
            onClick={() => navigate("../manajemenoperasional")}
            className="flex-1 flex justify-center items-center gap-1 sm:gap-2 px-1 sm:px-6 py-2.5 rounded-lg text-[8px] sm:text-xs font-bold transition-all text-gray-500 hover:bg-gray-200"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="whitespace-nowrap">Penjualan/Peminjaman</span>
          </button>
          <button className="flex-1 flex justify-center items-center gap-1 sm:gap-2 px-1 sm:px-6 py-2.5 rounded-lg text-[8px] sm:text-xs font-bold transition-all bg-white text-[#B5302D] shadow-sm">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="whitespace-nowrap">Organisasi</span>
          </button>
        </div>
      </div>

      {/* --- UI DROPDOWN PILIH KEBUN (Memanjang Penuh) --- */}
      {isGM && (
        <div className="mb-8 relative z-30">
          {/* Overlay tersembunyi untuk menutup dropdown saat klik luar */}
          {isDropdownOpen && (
            <div
              className="fixed inset-0 z-20"
              onClick={() => setIsDropdownOpen(false)}
            />
          )}

          {/* Tombol Utama (Bentuk Bar Memanjang) */}
          <div
            onClick={() =>
              daftarKebun.length > 0 && setIsDropdownOpen(!isDropdownOpen)
            }
            className={`flex items-center justify-between w-full px-5 py-3 rounded-xl border cursor-pointer transition-all relative z-30 ${
              isDropdownOpen
                ? "bg-[#B5302D] border-[#B5302D] text-white shadow-md"
                : "bg-red-50 border-red-100 text-[#B5302D] hover:bg-red-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin
                className={`w-5 h-5 ${isDropdownOpen ? "text-white" : "text-[#B5302D]"}`}
              />
              <div className="flex flex-col text-left">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${isDropdownOpen ? "text-red-200" : "text-[#B5302D]"}`}
                >
                  Pilih Kebun untuk Dipantau:
                </span>
                <span
                  className={`font-bold text-sm ${isDropdownOpen ? "text-white" : "text-gray-800"}`}
                >
                  {daftarKebun.length === 0
                    ? "Memuat data..."
                    : daftarKebun.find(
                        (k) => (k.auth_id || k.id) === selectedKebunId,
                      )?.nama_lengkap ||
                      daftarKebun.find(
                        (k) => (k.auth_id || k.id) === selectedKebunId,
                      )?.nama_kebun ||
                      "-- Silakan Pilih --"}
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-white" : "text-[#B5302D]"}`}
            />
          </div>

          {/* Menu Pilihan (Dropdown Menjuntai Lebar Penuh) */}
          <div
            className={`absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden transition-all duration-200 origin-top z-30 ${
              isDropdownOpen
                ? "opacity-100 scale-y-100"
                : "opacity-0 scale-y-0 pointer-events-none"
            }`}
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {daftarKebun.map((kb) => {
                const idKebun = kb.auth_id || kb.id;
                const namaKebun =
                  kb.nama_lengkap || kb.nama_kebun || "Kebun Tanpa Nama";
                const isSelected = idKebun === selectedKebunId;

                return (
                  <div
                    key={idKebun}
                    onClick={() => {
                      setSelectedKebunId(idKebun);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-5 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-red-50 text-[#B5302D] font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {namaKebun}
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#B5302D]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- KONTEN ORGANISASI (Hanya muncul jika kebun sudah dipilih) --- */}
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 z-10 relative">
        {(() => {
          if (!selectedKebunId) return null;

          const safeId = selectedKebunId;

          // Data Dokumen Map (Key: requirement_code, Value: Object)
          const docsMap = dataOrganisasi[safeId] || {};
          const isDocLoading = loadingKebun[safeId];

          // Gabungkan Config Statis dengan Data Dinamis dari BE
          const combinedDocs = DOKUMEN_CONFIG.map((config) => {
            const fetchedData = docsMap[config.code];
            return {
              ...config,
              file_url: fetchedData ? fetchedData.file_url : null,
              status: fetchedData ? fetchedData.status : null,
              isFetchingData: isDocLoading,
            };
          });

          // Data Pengurus
          const pengurusList = dataPengurus[safeId] || [];
          const isLoadingPeng = loadingPengurus[safeId];

          return (
            <div className="grid grid-cols-1 gap-8 bg-transparent">
              {/* --- CARD DAFTAR ANGGOTA PENGURUS (READ ONLY) --- */}
              <SectionCard title="Daftar Anggota Pengurus (Read Only)">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-xs text-gray-500">
                    Struktur organisasi kelompok tani dari kebun yang dipilih.
                  </p>
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#EF8523] text-white text-[11px] uppercase tracking-wider">
                        <th className="p-4 font-bold rounded-tl-xl">No</th>
                        <th className="p-4 font-bold">Nama Anggota</th>
                        <th className="p-4 font-bold">Jabatan</th>
                        <th className="p-4 font-bold">No. HP</th>
                        <th className="p-4 font-bold rounded-tr-xl">
                          Tugas & Tanggung Jawab
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-gray-700 bg-white">
                      {isLoadingPeng ? (
                        <tr>
                          <td colSpan="5" className="p-4 text-center">
                            Memuat data pengurus...
                          </td>
                        </tr>
                      ) : pengurusList.length > 0 ? (
                        pengurusList.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                          >
                            <td className="p-4 font-bold text-center">
                              {index + 1}
                            </td>
                            <td className="p-4 font-bold">
                              {item.nama_anggota}
                            </td>
                            <td className="p-4 font-medium text-[#B5302D]">
                              {item.jabatan_pengurus}
                            </td>
                            <td className="p-4 text-gray-500">
                              {item.no_hp || "-"}
                            </td>
                            <td className="p-4 text-gray-500">
                              {item.tugas_pengurus || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-4 text-center">
                            Belum ada data pengurus.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              {/* SEKSI 2: DOKUMEN ORGANISASI (GROUPING PRINSIP & KRITERIA KEMBAR DENGAN KEBUN) */}
              <SectionCard title="Kelengkapan Dokumen ISPO (Read Only)">
                <div className="-mt-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                  <div className="max-w-3xl">
                    <h4 className="text-gray-900 font-bold text-sm sm:text-base mb-1.5">
                      Pemantauan Dokumen Sertifikasi
                    </h4>
                    <p className="text-[13px] text-gray-500 font-normal leading-relaxed">
                      Pantau kelengkapan dokumen standar Indonesian Sustainable
                      Palm Oil (ISPO) dari kebun ini. Role Anda hanya dapat
                      melihat (Read-Only) dokumen yang telah diunggah.
                    </p>
                  </div>
                </div>

                {/* LIST DOKUMEN DENGAN GROUPING BERDASARKAN PRINSIP DAN KRITERIA */}
                <div className="space-y-12">
                  {/* 1. Looping Berdasarkan Prinsip */}
                  {Array.from(new Set(combinedDocs.map((d) => d.prinsip))).map(
                    (namaPrinsip, prinsipIdx) => {
                      const prinsipMatch = namaPrinsip.match(
                        /^(Prinsip \d+)\.\s*(.*)/,
                      );
                      const prinsipNumber = prinsipMatch ? prinsipMatch[1] : "";
                      const prinsipText = prinsipMatch
                        ? prinsipMatch[2]
                        : namaPrinsip;

                      const docsInPrinsip = combinedDocs.filter(
                        (d) => d.prinsip === namaPrinsip,
                      );
                      const kriteriaList = Array.from(
                        new Set(docsInPrinsip.map((d) => d.kriteria)),
                      );

                      return (
                        <div key={prinsipIdx} className="relative">
                          {/* Judul Level 1 (Prinsip) */}
                          <div className="mb-6 flex items-center gap-3">
                            <div className="h-8 w-1.5 bg-[#B5302D] rounded-full shrink-0"></div>
                            <h3 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
                              <span className="text-[#B5302D] mr-2 uppercase tracking-wider text-sm md:text-base">
                                {prinsipNumber}
                              </span>
                              <span className="text-gray-800">
                                {prinsipText}
                              </span>
                            </h3>
                          </div>

                          {/* 2. Looping Berdasarkan Kriteria */}
                          <div className="grid grid-cols-1 gap-6">
                            {kriteriaList.map((namaKriteria, kriteriaIdx) => {
                              const docsInKriteria = docsInPrinsip.filter(
                                (d) => d.kriteria === namaKriteria,
                              );

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
                                  {/* Header Level 2 (Kriteria) */}
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
                                      const isUploaded = !!doc.file_url;

                                      return (
                                        <div
                                          key={doc.id}
                                          className={`p-5 sm:p-6 flex flex-col md:flex-row md:items-start gap-5 transition-all duration-300 ${
                                            isUploaded
                                              ? "bg-emerald-50/20"
                                              : "hover:bg-gray-50/80"
                                          }`}
                                        >
                                          {/* Ikon Status & Informasi Dokumen */}
                                          <div className="flex-1 flex items-start gap-4 sm:gap-5 min-w-0">
                                            <div
                                              className={`mt-1 p-3 rounded-xl flex-shrink-0 transition-all duration-300 ${
                                                isUploaded
                                                  ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
                                                  : "bg-gray-50 text-gray-400 border border-gray-200"
                                              }`}
                                            >
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

                                              {/* --- BAGIAN STATUS BADGE --- */}
                                              <div className="pt-1.5">
                                                {doc.isRedirect ? (
                                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                                    Ditampilkan di Dashboard
                                                  </span>
                                                ) : doc.isFetchingData ? (
                                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-500 border border-blue-100">
                                                    <Loader2 className="w-3 h-3 animate-spin" />{" "}
                                                    Memuat status...
                                                  </span>
                                                ) : isUploaded ? (
                                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    <CheckCircle className="w-3 h-3" />{" "}
                                                    Diunggah (
                                                    {doc.status || "Selesai"})
                                                  </span>
                                                ) : (
                                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-200">
                                                    Belum diunggah oleh Kebun
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          {/* --- BAGIAN TOMBOL AKSI (KANAN) --- */}
                                          <div className="flex flex-col gap-2.5 md:w-40 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 shrink-0">
                                            {doc.isRedirect ? (
                                              <button
                                                onClick={() =>
                                                  navigate(doc.redirectPath)
                                                }
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-[#EF8523] hover:text-[#EF8523] hover:bg-orange-50 text-xs font-bold transition-all shadow-sm"
                                                title="Lihat Grafik di Dashboard"
                                              >
                                                Cek Dashboard &rarr;
                                              </button>
                                            ) : isUploaded ? (
                                              <button
                                                onClick={() =>
                                                  window.open(
                                                    getFileUrl(
                                                      doc.file_url,
                                                      "ISPO",
                                                    ),
                                                    "_blank",
                                                  )
                                                }
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all shadow-sm"
                                              >
                                                <Search className="w-4 h-4" />{" "}
                                                Lihat File
                                              </button>
                                            ) : (
                                              <div className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 text-xs font-bold cursor-not-allowed">
                                                Belum Ada File
                                              </div>
                                            )}
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
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// HELPER COMPONENT (Tetap butuh di sini)
const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden group hover:shadow-md transition-all">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />
    <h3 className="text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

export default Operasional2;
