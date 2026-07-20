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
  ClipboardList,
} from "lucide-react";
import {
  API_ENDPOINTS,
  API_BASE_URLS,
  getFileUrl,
} from "../../../config/constants.js";

/* ===================== DEFINISI REQUIREMENTS ===================== */
const DOKUMEN_CONFIG = [
  // --- Prinsip 2. Penerapan Praktik Pertanian yang Baik ---
  {
    id: 1,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.1 Organisasi Kelembagaan Pekebun",
    label: "Daftar anggota kelompok tani / koperasi",
    deskripsi:
      "Upload dokumen berisi: Nama anggota, NIK, Lokasi lahan, dan Luas lahan.",
    code: "P2_2_1_ANGGOTA",
  },
  {
    id: 2,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.1 Organisasi Kelembagaan Pekebun",
    label: "SK pengurus & pembagian tugas",
    deskripsi: "Upload dokumen daftar pengurus serta peran dan tanggung jawab.",
    code: "P2_2_1_SK_PENGURUS",
  },
  {
    id: 3,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.1 Organisasi Kelembagaan Pekebun",
    label: "AD/ART kelompok",
    deskripsi: "Upload dokumen Anggaran Dasar dan Anggaran Rumah Tangga.",
    code: "P2_2_1_ADART",
  },
  {
    id: 4,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.1 Organisasi Kelembagaan Pekebun",
    label: "Dokumen badan hukum",
    deskripsi: "Upload dokumen legalitas koperasi / organisasi.",
    code: "P2_2_1_BADAN_HUKUM",
  },
  {
    id: 5,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.1 Organisasi Kelembagaan Pekebun",
    label: "Berita acara pembentukan",
    deskripsi: "Upload bukti resmi saat kelompok tani didirikan.",
    code: "P2_2_1_BERITA_ACARA",
  },
  {
    id: 6,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria: "Kriteria 2.2 Pengelolaan Perkebunan",
    label: "Rencana operasional kebun",
    deskripsi: "Upload dokumen rencana kegiatan kebun berdasarkan data petani.",
    code: "P2_2_2_RENCANA_KERJA",
  },
  {
    id: 7,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.1 Pembukaan Lahan",
    label: "SOP pembukaan lahan tanpa bakar",
    deskripsi: "Upload dokumen SOP yang mengacu pada pedoman resmi.",
    code: "P2_2_3_1_SOP_LAHAN",
  },
  {
    id: 8,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.2 pembenihan",
    label: "Bukti sosialisasi informasi benih",
    deskripsi: "Upload dokumen berita acara bukti kegiatan sosialisasi informasi benih.",
    code: "P2_2_3_9_SOSIALISASI_BENIH",
  },
  {
    id: 9,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.3 Penanaman pada Lahan Mineral",
    label: "SOP penanaman sesuai GAP",
    deskripsi: "Upload SOP yang mengatur praktik budidaya yang berkelanjutan.",
    code: "P2_2_3_3_SOP_GAP",
  },
  {
    id: 10,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.3 Penanaman pada Lahan Mineral",
    label: "SOP pedoman teknis penanaman",
    deskripsi: "Upload dokumen memuat luas areal tanam, jarak tanam, dll.",
    code: "P2_2_3_3_SOP_TEKNIS",
  },
  {
    id: 11,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.5 Pemeliharaan Tanaman",
    label: "SOP pemeliharaan tanaman",
    deskripsi: "Upload dokumen SOP instruksi kerja pemeliharaan.",
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
    deskripsi: "Upload bukti pestisida terdaftar di komisi pestisida.",
    code: "P2_2_3_6_SERTIFIKASI_PESTISIDA",
  },
  {
    id: 15,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.7 Pemanenan",
    label: "SOP kriteria buah matang",
    deskripsi: "Upload standar kematangan panen.",
    code: "P2_2_3_7_SOP_MATANG",
  },
  {
    id: 16,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.8 Pengiriman",
    label: "SOP alat transportasi",
    deskripsi: "Upload dokumen SOP terkait alat transportasi.",
    code: "P2_2_3_8_SOP_TRANSPORT",
  },
  {
    id: 17,
    prinsip: "Prinsip 2. Penerapan Praktik Pertanian yang Baik",
    kriteria:
      "Kriteria 2.3 Penerapan Teknik Budidaya dan Pengangkutan Kelapa Sawit",
    subKriteria: "2.3.8 Pengiriman",
    label: "SOP penjagaan kualitas",
    deskripsi: "Upload dokumen SOP menjaga kualitas buah.",
    code: "P2_2_3_8_SOP_KUALITAS",
  },

  // --- Prinsip 3. Pengelolaan Lingkungan Hidup ---
  {
    id: 18,
    prinsip:
      "Prinsip 3. Pengelolaan Lingkungan Hidup, SDA, dan Keanekaragaman Hayati",
    kriteria: "Kriteria 3.1 Pencegahan dan Penanggulangan Kebakaran",
    label: "SOP pencegahan dan penanggulangan kebakaran",
    deskripsi: "Upload dokumen prosedur pencegahan kebakaran.",
    code: "P3_3_1_PENANGGULANGAN_KEBAKARAN",
  },
  {
    id: 19,
    prinsip:
      "Prinsip 3. Pengelolaan Lingkungan Hidup, SDA, dan Keanekaragaman Hayati",
    kriteria: "Kriteria 3.1 Pencegahan dan Penanggulangan Kebakaran",
    label: "Informasi area rawan kebakaran",
    deskripsi: "Upload peta atau data lokasi area rawan kebakaran.",
    code: "P3_3_2_4_AREAL_RAWAN_KEBAKARAN",
  },
  {
    id: 20,
    prinsip:
      "Prinsip 3. Pengelolaan Lingkungan Hidup, SDA, dan Keanekaragaman Hayati",
    kriteria: "Kriteria 3.1 Pencegahan dan Penanggulangan Kebakaran",
    label: "Dokumentasi simulasi tanggap darurat",
    deskripsi: "Upload bukti bahwa telah dilakukan simulasi kebakaran.",
    code: "P3_3_2_5_SIMULASI_TANGGAP_DARURAT",
  },
  {
    id: 21,
    prinsip:
      "Prinsip 3. Pengelolaan Lingkungan Hidup, SDA, dan Keanekaragaman Hayati",
    kriteria: "Kriteria 3.2 Pelestarian Keanekaragaman Hayati",
    label: "SOP identifikasi satwa dan tumbuhan langka",
    deskripsi: "Upload dokumen identifikasi satwa langka.",
    code: "P3_3_2_1_SOP_IDENTIFIKASI_HAYATI",
  },
  {
    id: 22,
    prinsip:
      "Prinsip 3. Pengelolaan Lingkungan Hidup, SDA, dan Keanekaragaman Hayati",
    kriteria: "Kriteria 3.2 Pelestarian Keanekaragaman Hayati",
    label: "SOP perlindungan satwa dan tumbuhan langka",
    deskripsi: "Upload dokumen perlindungan satwa.",
    code: "P3_3_2_2_PERLINDUNGAN_HAYATI",
  },

  // --- Prinsip 4. Penerapan Transparansi ---
  {
    id: 23,
    prinsip: "Prinsip 4. Penerapan Transparansi",
    kriteria: "Kriteria 4.1 Penjualan dan Kesepakatan Harga TBS",
    label: "Informasi harga TBS dari pemerintah",
    deskripsi:
      "Pantau grafik pergerakan harga TBS sesuai standar pemerintah di halaman utama dashboard Anda.",
    isRedirect: true,
    redirectPath: "/estate_manager/dashboard",
    code: "P4_1_HARGA",
  },
  {
    id: 24,
    prinsip: "Prinsip 4. Penerapan Transparansi",
    kriteria: "Kriteria 4.1 Penjualan dan Kesepakatan Harga TBS",
    label: "Dokumen kerja sama kemitraan",
    deskripsi: "Upload dokumen kerja sama mitra.",
    code: "P4_4_2_KERJASAMA_KEMITRAAN",
  },
  {
    id: 25,
    prinsip: "Prinsip 4. Penerapan Transparansi",
    kriteria: "Kriteria 4.2 Penyediaan Data dan Informasi",
    label: "SOP pelayanan informasi",
    deskripsi: "Upload dokumen SOP layanan informasi.",
    code: "P4_4_1_SOP_PELAYANAN_INFORMASI",
  },

  // --- Prinsip 5. Peningkatan Usaha Secara Berkelanjutan ---
  {
    id: 26,
    prinsip: "Prinsip 5. Peningkatan Usaha Secara Berkelanjutan",
    kriteria: "Kriteria 5.1 Peningkatan Kinerja",
    label: "Rencana aksi peningkatan produksi kelapa sawit",
    deskripsi: "Upload rencana peningkatan produksi.",
    code: "P5_5_1_SOP_RENCANA_PENINGKATAN_PRODUKSI",
  },
];

const Operasional2 = () => {
  const navigate = useNavigate();

  // -- STATE IDENTITAS & ROLE --
  const [userRole, setUserRole] = useState(null);
  const [daftarKebun, setDaftarKebun] = useState([]);
  const [selectedKebunId, setSelectedKebunId] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // -- PERBAIKAN STATE DATA (Langsung jadi 1, BUKAN Cache Object Dictionary lagi) --
  const [dataOrganisasi, setDataOrganisasi] = useState({});
  const [loadingOrganisasi, setLoadingOrganisasi] = useState(false);

  const [pengurusList, setPengurusList] = useState([]);
  const [loadingPengurus, setLoadingPengurus] = useState(false);

  // Ambil Role dari Token
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

  // 1. Fetch Dokumen
  const fetchDataOrganisasi = useCallback(
    async (kebunAuthId) => {
      if (!kebunAuthId) return;
      setLoadingOrganisasi(true);
      setDataOrganisasi({}); // KOSONGKAN DOKUMEN LAMA SEBELUM FETCH BARU

      try {
        const token = localStorage.getItem("token");
        const queryParam = isGM ? `?target_kebun_auth_id=${kebunAuthId}` : "";

        const fetchPromises = DOKUMEN_CONFIG.map(async (docConfig) => {
          if (docConfig.isRedirect) return null;
          try {
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

        const docsMap = {};
        results.forEach((res) => {
          if (res) docsMap[res.tipe_dokumen] = res;
        });

        setDataOrganisasi(docsMap);
      } catch (error) {
        console.error("Fetch organisasi error:", error);
      } finally {
        setLoadingOrganisasi(false);
      }
    },
    [isGM],
  );

  // 2. Fetch Pengurus
  const fetchDataPengurus = useCallback(
    async (kebunAuthId) => {
      if (!kebunAuthId) return;
      setLoadingPengurus(true);
      setPengurusList([]); // KOSONGKAN TABEL PENGURUS LAMA SEBELUM FETCH BARU

      try {
        const token = localStorage.getItem("token");
        const queryParam = isGM ? `?target_kebun_auth_id=${kebunAuthId}` : "";
        const url = `${API_ENDPOINTS.USER.KEBUN.PENGURUS.MAIN}${queryParam}`;

        // --- 1. CONSOLE LOG URL API ---
        console.log(`[DEBUG FE] Menembak API Pengurus URL: ${url}`);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          // --- 2. CONSOLE LOG RESPONS BE ---
          console.log(
            `[DEBUG FE] Respon Data Pengurus BE untuk Kebun ID ${kebunAuthId}:`,
            data,
          );

          setPengurusList(Array.isArray(data) ? data : []);
        } else {
          // --- CONSOLE LOG JIKA ERROR DARI BE ---
          console.warn(
            `[DEBUG FE] Respon Pengurus Gagal. Status: ${response.status}`,
          );
          setPengurusList([]);
        }
      } catch (error) {
        console.error("Fetch pengurus error:", error);
        setPengurusList([]);
      } finally {
        setLoadingPengurus(false);
      }
    },
    [isGM],
  );

  // Fetch Daftar Kebun
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
          }
        }
      } else {
        // Jika bukan GM, ambil data diri saja (EM)
        const res = await fetch(`${API_BASE_URLS.USER}/users/me`, { headers });
        if (res.ok) {
          const data = await res.json();
          const validId = data.auth_id || data.id || "kebun-0";
          const single = [
            { auth_id: validId, nama_lengkap: data.nama_lengkap },
          ];
          setDaftarKebun(single);
          setSelectedKebunId(validId);
        }
      }
    } catch (error) {
      console.error("Fetch kebun error:", error);
    }
  }, [isGM]);

  // Jalankan fetchDaftarKebun saat pertama mount
  useEffect(() => {
    if (userRole) fetchDaftarKebun();
  }, [userRole, fetchDaftarKebun]);

  // JALANKAN FETCH ULANG SETIAP KALI selectedKebunId BERUBAH
  useEffect(() => {
    if (selectedKebunId) {
      fetchDataOrganisasi(selectedKebunId);
      fetchDataPengurus(selectedKebunId);
    }
  }, [selectedKebunId, fetchDataOrganisasi, fetchDataPengurus]);

  // Gabungkan Config Statis dengan Data Dinamis
  const combinedDocs = DOKUMEN_CONFIG.map((config) => {
    const fetchedData = dataOrganisasi[config.code];
    return {
      ...config,
      file_url: fetchedData ? fetchedData.file_url : null,
      status: fetchedData ? fetchedData.status : null,
      isFetchingData: loadingOrganisasi,
    };
  });

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <ClipboardList className="w-8 h-8 text-[#B5302D]" />
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

        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto">
          <button className="flex-1 flex justify-center items-center gap-1.5 sm:gap-2 px-1 sm:px-6 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all bg-white text-[#B5302D] shadow-sm">
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span className="leading-tight text-center">
              Penjualan/Peminjaman
            </span>
          </button>
          <button
            onClick={() =>
              navigate("/estate_manager/manajemenoperasional/organisasi")
            }
            className="flex-1 flex justify-center items-center gap-1.5 sm:gap-2 px-1 sm:px-6 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all text-gray-500 hover:bg-gray-200"
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="leading-tight text-center">Organisasi</span>
          </button>
        </div>
      </div>

      <hr className="border-gray-200 mb-6 sm:mb-8" />

      {/* --- UI DROPDOWN PILIH KEBUN --- */}
      {isGM && (
        <div className="mb-8 relative z-30">
          {isDropdownOpen && (
            <div
              className="fixed inset-0 z-20"
              onClick={() => setIsDropdownOpen(false)}
            />
          )}

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

      {/* --- KONTEN ORGANISASI --- */}
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 z-10 relative">
        {selectedKebunId && (
          <div className="grid grid-cols-1 gap-8 bg-transparent">
            {/* --- CARD DAFTAR ANGGOTA PENGURUS --- */}
            <SectionCard title="Daftar Anggota Pengurus">
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
                    {loadingPengurus ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-8 text-center text-gray-400 font-bold"
                        >
                          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#EF8523] font-bold" />
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
                          <td className="p-4 font-bold">{item.nama_anggota}</td>
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
                        <td
                          colSpan="5"
                          className="p-8 text-center text-gray-400 font-bold italic"
                        >
                          Belum ada data pengurus di kebun ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {/* SEKSI 2: DOKUMEN ORGANISASI */}
            <SectionCard title="Kelengkapan Dokumen ISPO">
              <div className="-mt-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div className="max-w-3xl">
                  <h4 className="text-gray-900 font-bold text-sm sm:text-base mb-1.5">
                    Pemantauan Dokumen Sertifikasi
                  </h4>
                  <p className="text-[13px] text-gray-500 font-normal leading-relaxed">
                    Pantau kelengkapan dokumen standar Indonesian Sustainable
                    Palm Oil (ISPO). Role Anda hanya dapat melihat (Read-Only).
                  </p>
                </div>
              </div>

              {/* LIST DOKUMEN DENGAN GROUPING */}
              <div className="space-y-12">
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
                        <div className="mb-6 flex items-center gap-3">
                          <div className="h-8 w-1.5 bg-[#B5302D] rounded-full shrink-0"></div>
                          <h3 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
                            <span className="text-[#B5302D] mr-2 uppercase tracking-wider text-sm md:text-base">
                              {prinsipNumber}
                            </span>
                            <span className="text-gray-800">{prinsipText}</span>
                          </h3>
                        </div>

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

                                <div className="divide-y divide-gray-100">
                                  {docsInKriteria.map((doc) => {
                                    const isUploaded = !!doc.file_url;
                                    const isRedirectItem = doc.isRedirect; // Deteksi item redirect

                                    return (
                                      <div
                                        key={doc.id}
                                        className={`p-5 sm:p-6 flex flex-col md:flex-row md:items-start gap-5 transition-all duration-300 ${
                                          isUploaded && !isRedirectItem
                                            ? "bg-emerald-50/20"
                                            : "hover:bg-gray-50/80"
                                        }`}
                                      >
                                        <div className="flex-1 flex items-start gap-4 sm:gap-5 min-w-0">
                                          <div
                                            className={`mt-1 p-3 rounded-xl flex-shrink-0 transition-all duration-300 ${
                                              isUploaded && !isRedirectItem
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

                                            {/* --- STATUS BADGE --- */}
                                            <div className="pt-1.5">
                                              {isRedirectItem ? (
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

                                        {/* --- AREA TOMBOL KANAN --- */}
                                        <div className="flex flex-col gap-2.5 md:w-40 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 shrink-0">
                                          {isRedirectItem ? (
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
        )}
      </div>
    </div>
  );
};

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
