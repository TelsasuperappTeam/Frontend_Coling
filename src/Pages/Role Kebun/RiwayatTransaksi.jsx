import React, { useState, useEffect } from "react";
import {
  History,
  User,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Truck,
  Phone,
  MapPin,
  CheckCircle,
  Info,
  FileText,
  Upload,
  Wallet,
  AlertCircle,
  Hash,
  X,
  Loader2,
  CheckSquare,
} from "lucide-react";

import { API_ENDPOINTS, getFileUrl } from "../../config/constants";
import { useNavigate, useLocation } from "react-router-dom";

const Riwayatpenjualan = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- LOGIKA TAB BERDASARKAN URL ---
  const activeTab = location.pathname.includes("perlubagihasil")
    ? "bagi_hasil"
    : location.pathname.includes("selesai")
      ? "selesai"
      : "aktif";

  // --- STATE DATA ---
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // --- FUNGSI AMBIL DATA API ---
  const fetchSemuaTransaksi = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const urlBase = API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.GET_LIST;

      const [resAktif, resHistori] = await Promise.all([
        fetch(`${urlBase}?is_history=false`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${urlBase}?is_history=true`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let dataAktif = [];
      let dataHistori = [];

      if (resAktif.ok) dataAktif = await resAktif.json();
      if (resHistori.ok) dataHistori = await resHistori.json();

      const combinedData = [...dataAktif, ...dataHistori];
      console.log("=== SEMUA DATA TRANSAKSI (MANDOR) ===", combinedData);

      setAllData(combinedData);
    } catch (error) {
      console.error("Error Fetch API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // State & Fungsi Fetch Metadata untuk Modal Bagi Hasil
  const [showBagiHasilModal, setShowBagiHasilModal] = useState(false);
  const [metadataBagiHasil, setMetadataBagiHasil] = useState(null);
  const [isLoadingMetadata, setLoadingMetadata] = useState(false);
  const [formBagiHasil, setFormBagiHasil] = useState({
    total_pajak_rupiah: 0,
    detail_petani: [], // Akan berisi { petani_user_id, tbs_disumbangkan_kg, upah_dibayar_rupiah }
  });

  // Fungsi Ambil Metadata dari BE
  const openBagiHasilModal = async (pengirimanId) => {
    setLoadingMetadata(true);
    setShowBagiHasilModal(true);
    try {
      const token = localStorage.getItem("token");
      const url =
        API_ENDPOINTS.TRACEABILITY.KEBUN.GET_METADATA_BAGI_HASIL(pengirimanId);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Metadata Bagi Hasil dari BE:", data);
        setMetadataBagiHasil(data);

        // --- 1. PERBAIKAN NAMA ARRAY DARI BE ---
        const listPetani =
          data.list_petani ||
          data.rincian_tbs_per_petani ||
          data.detail_petani ||
          [];

        // --- 2. PERBAIKAN NAMA KEY DI DALAM ARRAY ---
        const initialDetails = listPetani.map((p) => ({
          petani_user_id: p.petani_id || p.petani_user_id,
          nama_petani: p.nama || p.nama_petani_snapshot || "Petani",
          tbs_disumbangkan_kg: p.estimasi_tbs_kg || p.berat_kg || 0,
          upah_dibayar_rupiah: 0,
        }));

        setFormBagiHasil({
          total_pajak_rupiah: 0,
          detail_petani: initialDetails,
        });
      } else {
        alert("Gagal mengambil data metadata dari sistem.");
      }
    } catch (error) {
      console.error("Gagal load metadata bagi hasil:", error);
    } finally {
      setLoadingMetadata(false);
    }
  };

  // Fungsi Submit ke BE setelah user isi form bagi hasil
  const handleSubmitBagiHasil = async () => {
    try {
      const token = localStorage.getItem("token");
      const pengirimanId = metadataBagiHasil.pengiriman_id;
      const url =
        API_ENDPOINTS.TRACEABILITY.KEBUN.SUBMIT_BAGI_HASIL(pengirimanId);

      if (
        formBagiHasil.detail_petani.some(
          (p) => parseFloat(p.upah_dibayar_rupiah || 0) <= 0,
        )
      ) {
        alert("Upah petani tidak boleh 0 atau kosong!");
        return;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          total_pajak_rupiah: parseFloat(formBagiHasil.total_pajak_rupiah) || 0,
          detail_petani: formBagiHasil.detail_petani.map((petani) => ({
            petani_user_id: petani.petani_user_id,
            upah_dibayar_rupiah: parseFloat(petani.upah_dibayar_rupiah) || 0,
          })),
        }),
      });

      if (res.ok) {
        const resultData = await res.json();
        alert(resultData.message || "Berhasil memproses bagi hasil!");

        setShowBagiHasilModal(false);
        fetchSemuaTransaksi(); // Refresh UI setelah berhasil
      } else {
        const err = await res.json();
        alert(`Gagal: ${err.detail}`);
      }
    } catch (error) {
      console.error("Terjadi error:", error);
      alert("Terjadi kesalahan jaringan");
    }
  };

  // =======================================================
  // State untuk Modal Rincian Selesai
  // =======================================================
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const handleViewDetail = (bagiHasilData, kodeResi) => {
    setDetailData({ ...bagiHasilData, kode_resi: kodeResi });
    setShowDetailModal(true);
  };

  useEffect(() => {
    fetchSemuaTransaksi();
  }, []);

  useEffect(() => {
    fetchSemuaTransaksi();
  }, []);

  // =====================================================================
  // --- LOGIKA PEMISAHAN DATA (Dijalankan secara lokal di FE) ---
  // =====================================================================

  // 1. Filter Transaksi Aktif: Belum diperiksa pabrik & tidak ditolak
  const dataAktif = allData
    .filter(
      (item) =>
        !item.pemeriksaan &&
        item.status_permintaan?.toLowerCase() !== "ditolak",
    )
    .sort((a, b) => b.id - a.id);

  // 2. Filter Perlu Bagi Hasil: Sudah diperiksa, tapi bagi_hasil NULL
  const dataBagiHasil = allData
    .filter(
      (item) =>
        item.pemeriksaan &&
        !item.bagi_hasil &&
        item.status_permintaan?.toLowerCase() !== "ditolak",
    )
    .sort((a, b) => b.id - a.id);

  // 3. Filter Selesai: Sudah diperiksa DAN bagi_hasil ada isinya, ATAU ditolak
  const dataSelesai = allData
    .filter(
      (item) =>
        (item.pemeriksaan && item.bagi_hasil) ||
        item.status_permintaan?.toLowerCase() === "ditolak",
    )
    .sort((a, b) => b.id - a.id);

  // Tentukan data mana yang dirender berdasarkan Tab
  let currentDataToRender = [];
  let cardTitle = "";
  if (activeTab === "aktif") {
    currentDataToRender = dataAktif;
    cardTitle = "Daftar Transaksi Aktif ";
  } else if (activeTab === "bagi_hasil") {
    currentDataToRender = dataBagiHasil;
    cardTitle = "Menunggu Proses Bagi Hasil";
  } else if (activeTab === "selesai") {
    currentDataToRender = dataSelesai;
    cardTitle = "Rekapitulasi Transaksi Selesai";
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 p-4 md:p-8 min-h-screen font-sans">
      {/* HEADER HERO */}
      <div className="flex flex-col lg:flex-row md:items-center justify-between gap-5 mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-red-50 rounded-xl sm:rounded-2xl shrink-0">
            <History className="w-6 h-6 sm:w-8 sm:h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D] leading-tight">
              Transaksi Penjualan TBS Anda
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Pantau armada logistik, pendapatan, dan proses bagi hasil ke
              petani.
            </p>
          </div>
        </div>
      </div>

      {/* 1. GARIS TIPIS (KONSISTEN) */}
      <hr className="border-gray-200 mb-6 sm:mb-8" />

      {/* 2 & 3. TAB SWITCHER (RATA KANAN KIRI / FULL WIDTH) */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 mb-6 sm:mb-8 w-full shadow-sm">
        {/* TAB 1: Tunggu Pemeriksaan */}
        <button
          onClick={() => {
            navigate("/kebun/riwayattransaksi/tunggupemeriksaan");
            setExpandedId(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-2 sm:px-6 py-3 sm:py-3.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "aktif"
              ? "bg-white text-[#B5302D] shadow-sm"
              : "text-gray-500 hover:bg-gray-200/50"
          }`}
          title="Tunggu Pemeriksaan"
        >
          <Truck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="hidden sm:block">Tunggu Pemeriksaan</span>
          {dataAktif.length > 0 && (
            <span className="bg-red-100 text-[#B5302D] px-2 py-0.5 rounded-full text-[9px] font-black ml-0 sm:ml-1">
              {dataAktif.length}
            </span>
          )}
        </button>

        {/* TAB 2: Perlu Bagi Hasil */}
        <button
          onClick={() => {
            navigate("/kebun/riwayattransaksi/perlubagihasil");
            setExpandedId(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-2 sm:px-6 py-3 sm:py-3.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "bagi_hasil"
              ? "bg-white text-[#EF8523] shadow-sm"
              : "text-gray-500 hover:bg-gray-200/50"
          }`}
          title="Perlu Bagi Hasil"
        >
          <Wallet className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="hidden sm:block">Perlu Bagi Hasil</span>
          {dataBagiHasil.length > 0 && (
            <span className="bg-orange-100 text-[#EF8523] px-2 py-0.5 rounded-full text-[9px] font-black ml-0 sm:ml-1">
              {dataBagiHasil.length}
            </span>
          )}
        </button>

        {/* TAB 3: Selesai */}
        <button
          onClick={() => {
            navigate("/kebun/riwayattransaksi/selesai");
            setExpandedId(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-2 sm:px-6 py-3 sm:py-3.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "selesai"
              ? "bg-white text-green-700 shadow-sm"
              : "text-gray-500 hover:bg-gray-200/50"
          }`}
          title="Selesai"
        >
          <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="hidden sm:block">Transaksi Selesai</span>
        </button>
      </div>

      {/* KONTEN DAFTAR TRANSAKSI */}
      <SectionCard title={cardTitle}>
        <div className="animate-fadeIn space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-[#B5302D] animate-spin" />
            </div>
          ) : currentDataToRender.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm font-medium bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
              Tidak ada data yang tersedia di kategori ini.
            </div>
          ) : (
            currentDataToRender.map((item) => (
              <ProgressItem
                key={item.id}
                item={item}
                isExpanded={expandedId === item.id}
                toggleExpand={() => toggleExpand(item.id)}
                openBagiHasilModal={openBagiHasilModal}
                handleViewDetail={handleViewDetail}
              />
            ))
          )}
        </div>
      </SectionCard>

      <BagiHasilModal
        isOpen={showBagiHasilModal}
        onClose={() => setShowBagiHasilModal(false)}
        metadata={metadataBagiHasil}
        loading={isLoadingMetadata}
        formData={formBagiHasil}
        setFormData={setFormBagiHasil}
        onSave={handleSubmitBagiHasil}
      />

      <DetailBagiHasilModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        data={detailData}
      />
    </div>
  );
};

/* ===================== COMPONENTS HELPERS ===================== */

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden transition-all">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />
    <h3 className="text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

const MainCard = ({ children }) => (
  <div className="relative bg-white rounded-[24px] border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 overflow-hidden group">
    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#B5302D] opacity-0 group-hover:opacity-100 transition-opacity" />
    {children}
  </div>
);

const StatusStep = ({ label, active }) => (
  <div className="flex flex-col items-center justify-start gap-1.5 sm:gap-2 z-10 flex-1 px-1">
    <div
      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0 ${
        active
          ? "bg-green-600 border-green-600 text-white shadow-md scale-110"
          : "bg-white border-gray-200 text-gray-300"
      }`}
    >
      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    </div>
    <span
      className={`text-[9px] sm:text-xs font-medium sm:font-bold capitalize sm:uppercase text-center leading-tight tracking-tight break-words max-w-[65px] sm:max-w-none ${
        active ? "text-gray-900" : "text-gray-400"
      }`}
    >
      {label}
    </span>
  </div>
);

const ProgressItem = ({
  item,
  isExpanded,
  toggleExpand,
  openBagiHasilModal,
  handleViewDetail,
}) => {
  const statusPermintaan = (item.status_permintaan || "menunggu").toLowerCase();
  const rawProgress = item.progress_db || "menunggu_pengiriman";
  const pDB = rawProgress.toLowerCase().replace(/\s+/g, "_");
  // Tambahkan openBagiHasilModal di dalam kurung kurawal

  // Penentuan Label Status
  let colorClass = "bg-gray-50 text-gray-600 border-gray-100";
  let label = "Menunggu";

  if (statusPermintaan === "menunggu") {
    colorClass = "bg-yellow-50 text-yellow-700 border-yellow-100";
    label = "Menunggu Konfirmasi";
  } else if (statusPermintaan === "ditolak") {
    colorClass = "bg-red-50 text-red-700 border-red-100";
    label = "Ditolak Mitra";
  } else if (statusPermintaan === "diterima") {
    if (item.pemeriksaan) {
      if (!item.bagi_hasil) {
        colorClass = "bg-orange-50 text-[#EF8523] border-orange-200";
        label = "Lakukan Bagi Hasil";
      } else {
        colorClass = "bg-green-50 text-green-700 border-green-100";
        label = "Selesai (Tutup Buku)";
      }
    } else {
      // --- PERUBAHAN DI SINI: Deteksi jika truk sudah tiba tapi belum diperiksa ---
      if (pDB === "terima") {
        colorClass = "bg-blue-50 text-blue-700 border-blue-100";
        label = "Sedang Pabrik Proses";
      } else {
        colorClass = "bg-blue-50 text-blue-700 border-blue-100";
        label = item.progress_publik || "Dalam Perjalanan";
      }
    }
  }

  // --- RENDER JIKA DITOLAK ---
  if (statusPermintaan === "ditolak") {
    return (
      <MainCard>
        <div
          className="flex flex-col md:flex-row justify-between gap-0 sm:gap-4 cursor-pointer w-full"
          onClick={toggleExpand}
        >
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 sm:p-2.5 bg-red-50 rounded-xl border border-red-100 shrink-0 mt-1 sm:mt-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#B5302D]" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Asal Kebun / Mandor
                  </p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                    {item.nama_gapoktan || "Data Transaksi Anda"}
                  </p>
                </div>
              </div>

              <div className="flex items-center sm:block justify-between bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none w-full sm:w-auto mt-1 sm:mt-0">
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider sm:mb-1">
                  Rencana Panen
                </p>
                <p className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1.5 bg-white sm:bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  {item.tanggal_rencana_panen
                    ? new Date(item.tanggal_rencana_panen).toLocaleDateString(
                        "id-ID",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center md:items-end gap-3 mt-5 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4 min-w-full md:min-w-[120px]">
            <span
              className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase flex items-center justify-center gap-1.5 w-full md:w-auto ${colorClass}`}
            >
              {label}
            </span>
            <div className="flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm w-full md:w-auto">
              <span>{isExpanded ? "Tutup Rincian" : "Lihat Rincian"}</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-[#B5302D]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-5 sm:mt-8 pt-5 sm:pt-8 border-t border-gray-100 space-y-6 animate-in fade-in slide-in-from-top-2">
            <div className="bg-red-50 p-4 sm:p-5 rounded-2xl border border-red-100 flex items-start gap-3 shadow-sm">
              <div className="p-2 bg-red-100 rounded-xl shrink-0">
                <Info className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                  Alasan Penolakan Mitra:
                </p>
                <p className="text-xs sm:text-sm text-red-800 font-medium italic leading-relaxed">
                  "{item.catatan_penolakan || "Tidak ada alasan spesifik."}"
                </p>
              </div>
            </div>
          </div>
        )}
      </MainCard>
    );
  }

  // --- RENDER KARTU STANDAR (AKTIF / BAGI HASIL / SELESAI) ---
  return (
    <MainCard>
      <div
        className="flex flex-col md:flex-row justify-between gap-0 sm:gap-4 cursor-pointer w-full"
        onClick={toggleExpand}
      >
        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-red-50 rounded-xl border border-red-100 shrink-0 mt-1 sm:mt-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#B5302D]" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Asal Kebun / Mandor
                </p>
                <p className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                  {item.nama_gapoktan || "Data Transaksi Anda"}
                </p>
              </div>
            </div>
            <div className="flex items-center sm:block justify-between bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none w-full sm:w-auto mt-1 sm:mt-0">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider sm:mb-1">
                No. Resi
              </p>
              <p className="text-xs sm:text-sm font-mono font-bold text-gray-700 bg-white sm:bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                {item.kode_resi || "Menunggu Resi"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mt-4">
            <div className="col-span-2 sm:col-span-1 md:col-span-3 lg:col-span-1">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Pabrik Tujuan
              </p>
              <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed line-clamp-2">
                {item.alamat_pengiriman_pabrik || "-"}
              </p>
            </div>
            <div className="col-span-1">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Est Tiba di Pabrik
              </p>
              <p className="text-xs sm:text-sm font-bold text-blue-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                {item.tanggal_permintaan_sampai || "-"}
              </p>
            </div>
            <div className="col-span-1">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Biaya Kirim
              </p>
              <p className="text-xs sm:text-sm font-bold text-green-500">
                Rp {(item.biaya_final || 0).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center md:items-end gap-3 mt-5 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4 min-w-full md:min-w-[120px]">
          <span
            className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase flex items-center justify-center gap-1.5 w-full md:w-auto ${colorClass}`}
          >
            {item.pemeriksaan && item.bagi_hasil && (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            {label}
          </span>

          <div className="flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm w-full md:w-auto">
            <span>{isExpanded ? "Tutup Rincian" : "Lihat Rincian"}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-[#B5302D]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-5 sm:mt-8 pt-5 sm:pt-8 border-t border-gray-100 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-top-2">
          {/* 1. PELACAKAN HANYA MUNCUL JIKA BELUM ADA PEMERIKSAAN */}
          {!item.pemeriksaan && (
            <div className="bg-gray-50 p-5 sm:p-6 rounded-[20px] sm:rounded-[25px] border border-gray-200">
              <p className="text-[10px] sm:text-xs font-bold text-gray-900 uppercase mb-6 sm:mb-8 tracking-widest text-center">
                Proses Pelacakan Armada
              </p>
              <div className="flex justify-between items-center max-w-3xl mx-auto relative px-2 sm:px-4">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full"></div>
                <StatusStep label="Menunggu" active={true} />
                <StatusStep
                  label="Menjemput"
                  active={["mengirim", "menuju_pabrik", "terima"].includes(pDB)}
                />
                <StatusStep
                  label="Perjalanan"
                  active={["menuju_pabrik", "terima"].includes(pDB)}
                />
                <StatusStep
                  label="Tiba di Pabrik (Pemeriksaan)"
                  active={pDB === "terima"}
                />
              </div>
            </div>
          )}

          {/* 2. BOX HIJAU: INFO HASIL TIMBANGAN PABRIK */}
          {item.pemeriksaan && (
            <div className="bg-green-50/40 border border-green-200 rounded-xl p-3 sm:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-green-200/50 pb-3 mb-4 gap-3">
                <div className="flex flex-col gap-1">
                  <h4 className="text-[11px] sm:text-xs font-extrabold text-green-800 uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Hasil Pemeriksaan & Nota Akhir</span>
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-green-700/80 font-medium flex items-center gap-1 ml-5">
                    <Calendar className="w-3 h-3" />
                    {item.pemeriksaan.created_at
                      ? new Date(
                          item.pemeriksaan.created_at,
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </p>
                </div>
                {item.pemeriksaan.harga_beli_per_kg_snapshot > 0 && (
                  <span className="bg-green-100 text-green-800 text-[9px] sm:text-[10px] font-bold px-2.5 py-1.5 rounded-md border border-green-200 w-fit shrink-0">
                    Harga Dasar: Rp{" "}
                    {item.pemeriksaan.harga_beli_per_kg_snapshot.toLocaleString(
                      "id-ID",
                    )}{" "}
                    / Kg
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center bg-white px-3 py-2.5 rounded-lg border border-gray-100">
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Berat Bruto
                  </p>
                  <p className="text-xs sm:text-sm font-black text-gray-900">
                    {item.pemeriksaan.bruto?.toLocaleString("id-ID") || 0}{" "}
                    <span className="text-[9px] font-bold text-gray-400">
                      Kg
                    </span>
                  </p>
                </div>
                <div className="flex justify-between items-center bg-white px-3 py-2.5 rounded-lg border border-gray-100">
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Total Persentase Potongan Sortasi
                  </p>
                  <p className="text-xs sm:text-sm font-black text-red-600">
                    {item.pemeriksaan.total_potongan?.toLocaleString("id-ID") ||
                      0}{" "}
                    <span className="text-[9px] font-bold text-red-400">%</span>
                  </p>
                </div>
                <div className="flex justify-between items-center bg-white px-3 py-2.5 rounded-lg border border-green-200 ring-1 ring-green-50 shadow-sm">
                  <p className="text-[9px] sm:text-[10px] text-green-700 font-bold uppercase tracking-wider">
                    Netto Bersih
                  </p>
                  <p className="text-sm sm:text-base font-black text-green-700">
                    {item.pemeriksaan.final_weigh?.toLocaleString("id-ID") ||
                      item.pemeriksaan.netto?.toLocaleString("id-ID") ||
                      0}{" "}
                    <span className="text-[9px] font-bold text-green-600/70">
                      Kg
                    </span>
                  </p>
                </div>
                <div className="flex justify-between items-center bg-gradient-to-r from-green-600 to-emerald-700 px-4 py-3 rounded-xl shadow-sm text-white mt-1.5">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-green-100">
                    Total Harga Diterima
                  </p>
                  <p className="text-base sm:text-lg font-black tracking-tight">
                    <span className="text-[10px] font-medium mr-1">Rp</span>
                    {item.pemeriksaan.harga_final?.toLocaleString("id-ID") || 0}
                  </p>
                </div>

                {/* INI YANG MEMPERBAIKI ERROR ESLINT GETFILEURL */}
                {item.pemeriksaan.dokumen_nota_url && (
                  <div className="mt-4 pt-4 border-t flex justify-between items-center bg-white/60 p-3 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <p className="text-[10px] sm:text-xs text-gray-600 font-bold uppercase">
                        Nota Timbangan
                      </p>
                    </div>
                    <a
                      href={getFileUrl(
                        item.pemeriksaan.dokumen_nota_url,
                        "TRACEABILITY",
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-100 text-green-700 px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-bold hover:bg-green-200 transition-colors"
                    >
                      Lihat Dokumen
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. BOX AKSI BAGI HASIL */}
          {item.pemeriksaan && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              {!item.bagi_hasil ? (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#EF8523]"></div>
                  <div>
                    <h4 className="font-bold text-[#EF8523] text-sm sm:text-base flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> Silahkan Proses Bagi
                      Hasil
                    </h4>
                    <p className="text-[11px] sm:text-xs text-orange-800 mt-1 max-w-md leading-relaxed">
                      Pabrik telah mengeluarkan harga final dan nota timbangan.
                      Anda wajib memproses uang masuk ini untuk membagi hasil
                      penjualan ke Petani terkait.
                    </p>
                  </div>
                  {/* Panggil fungsi asli, hapus alert */}
                  <button
                    onClick={() => openBagiHasilModal(item.id)}
                    className="w-full sm:w-auto bg-[#EF8523] hover:bg-[#d9751d] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95 whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-4 h-4" /> Proses Bagi Hasil
                  </button>
                </div>
              ) : (
                <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                  <div>
                    <h4 className="font-bold text-blue-800 text-sm sm:text-base flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Distribusi Selesai
                    </h4>
                    <p className="text-[11px] sm:text-xs text-blue-700 mt-1 leading-relaxed">
                      Total Pajak Penjualan:{" "}
                      <strong className="text-gray-900">
                        Rp{" "}
                        {item.bagi_hasil.total_pajak_rupiah?.toLocaleString(
                          "id-ID",
                        )}
                      </strong>{" "}
                      <br />
                      Dana telah terdistribusi ke{" "}
                      <strong className="text-gray-900">
                        {item.bagi_hasil.detail_petani?.length || 0} Petani
                      </strong>
                      .
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleViewDetail(item.bagi_hasil, item.kode_resi)
                    }
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95 whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> Lihat Rincian Pembayaran
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. INI GRID DETAIL INFORMASI YANG SEBELUMNYA HILANG KITA KEMBALIKAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
            {/* Info Transaksi */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <h4 className="text-[11px] sm:text-xs font-bold text-[#B5302D] uppercase flex items-center gap-2">
                <Hash className="w-4 h-4" /> Informasi Transaksi
              </h4>
              <div className="flex-1 flex flex-col justify-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 text-xs sm:text-sm shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">No Resi:</span>
                  <span className="font-bold font-mono text-gray-700">
                    {item.kode_resi || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Tanggal Keberangkatan:</span>
                  <span className="font-bold text-right">
                    {item.tanggal_keberangkatan || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Tanggal Tiba:</span>
                  <span className="font-bold text-right">
                    {item.tanggal_permintaan_sampai || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Muatan (Est):</span>
                  <span className="font-bold text-right">
                    {item.estimasi_total_tbs_grup_kg
                      ? `${(item.estimasi_total_tbs_grup_kg / 1000).toFixed(2)} Ton`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-50">
                  <span className="text-gray-500">Biaya Pengiriman:</span>
                  <span className="font-extrabold text-[#B5302D] text-sm">
                    Rp {(item.biaya_final || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Armada & Supir */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <h4 className="text-[11px] sm:text-xs font-bold text-[#B5302D] uppercase flex items-center gap-2">
                <Truck className="w-4 h-4" /> Armada & Supir
              </h4>
              <div className="flex-1 flex flex-col gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 text-xs sm:text-sm shadow-sm">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 shrink-0">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {item.kru?.nama_supir || "-"}
                    </p>
                    <p className="text-[10px] sm:text-xs text-blue-600 font-bold flex items-center gap-1.5 mt-0.5 truncate">
                      <Phone className="w-3 h-3 shrink-0" />{" "}
                      {item.kru?.nomor_telepon || "-"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2.5 pt-1">
                  <p className="text-gray-500">Kendaraan</p>
                  <p className="font-semibold text-right">
                    {item.kendaraan?.jenis_kendaraan_nama || "-"}
                  </p>

                  <p className="text-gray-500">Kapasitas</p>
                  <p className="font-semibold text-right">
                    {item.kendaraan?.kapasitas_angkut_kg
                      ? `${item.kendaraan.kapasitas_angkut_kg.toLocaleString("id-ID")} Kg`
                      : "-"}
                  </p>

                  <p className="text-gray-500">Biaya / KM</p>
                  <p className="font-semibold text-right">
                    {item.kendaraan?.biaya_per_km
                      ? `Rp ${item.kendaraan.biaya_per_km.toLocaleString("id-ID")}`
                      : "-"}
                  </p>

                  <p className="text-gray-500 pt-2 border-t border-gray-50">
                    Tipe
                  </p>
                  <p className="font-semibold text-right pt-2 border-t border-gray-50">
                    {item.kendaraan?.nama_kendaraan || "-"}
                  </p>

                  <p className="text-gray-500">Plat</p>
                  <p className="font-bold text-blue-600 text-right uppercase tracking-wider">
                    {item.kendaraan?.plat_kendaraan || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Rute & Estimasi */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <h4 className="text-[11px] sm:text-xs font-bold text-[#B5302D] uppercase flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Rute & Estimasi
              </h4>
              <div className="flex-1 flex flex-col justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 text-xs sm:text-sm shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="relative pl-4 border-l-2 border-dashed border-gray-200">
                    <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-orange-400 border-2 border-white" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Dari: Kebun
                    </p>
                    <p className="font-medium text-gray-700 leading-snug">
                      {item.alamat_pickup_teks || "-"}
                    </p>
                  </div>
                  <div className="relative pl-4 border-l-2 border-dashed border-gray-200">
                    <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-[#B5302D] border-2 border-white" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Ke: Pabrik
                    </p>
                    <p className="font-medium text-gray-700 leading-snug">
                      {item.alamat_pengiriman_pabrik || "-"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
                      Est. Jarak
                    </p>
                    <p className="font-bold text-gray-900">
                      {item.estimasi_jarak_km
                        ? `${item.estimasi_jarak_km} KM`
                        : "-"}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase text-center shadow-sm ${colorClass}`}
                  >
                    {label}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-5 sm:pt-6 mt-2 border-t border-gray-100">
            <button
              onClick={() => toggleExpand(null)}
              className="w-full sm:w-auto px-8 py-3 bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-300 transition-all"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}
    </MainCard>
  );
};

const BagiHasilModal = ({
  isOpen,
  onClose,
  metadata,
  loading,
  formData,
  setFormData,
  onSave,
}) => {
  if (!isOpen) return null;

  // 1. Logika Perhitungan Transparansi
  const totalHargaPabrik =
    metadata?.harga_final_diterima_kebun ||
    metadata?.pemeriksaan?.harga_final ||
    0;

  // --- Sesuaikan dengan key respon BE Anda ---
  const biayaKirim = metadata?.biaya_pengiriman || metadata?.biaya_final || 0;

  // Dana awal sebelum dipotong kebun
  const danaTersedia = totalHargaPabrik - biayaKirim;

  const pajak = parseFloat(formData.total_pajak_rupiah) || 0; //
  const pendapatanBersih = danaTersedia - pajak;

  // 2. Logika Distribusi Petani
  const totalAlokasiPetani = formData.detail_petani.reduce(
    (sum, p) => sum + (parseFloat(p.upah_dibayar_rupiah) || 0),
    0,
  ); //
  const sisaDana = pendapatanBersih - totalAlokasiPetani;
  const isAlokasiPas = sisaDana === 0 && pendapatanBersih > 0;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
        {/* === HEADER === */}
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#B5302D] flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#B5302D]" />
              Form Transparansi Bagi Hasil
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" /> Resi:{" "}
              <span className="font-bold text-gray-700">
                {metadata?.kode_resi || "-"}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white border border-gray-200 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-all shadow-sm"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* === KONTEN === */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 bg-white custom-scrollbar">
          {loading ? (
            <div className="text-center py-10 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#EF8523] animate-spin" />
              <p className="text-sm font-bold text-gray-500">
                Mempersiapkan Form...
              </p>
            </div>
          ) : (
            <>
              {/* RINCIAN BIAYA AWAL (Transparansi Pabrik & Logistik) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Harga Dari Pabrik
                  </p>
                  <p className="font-bold text-gray-900 text-sm">
                    Rp {totalHargaPabrik.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Biaya Logistik (Pengiriman)
                  </p>
                  <p className="font-bold text-red-600 text-sm">
                    - Rp {biayaKirim.toLocaleString("id-ID")}
                  </p>
                </div>

                {/* Dana Tersedia Setelah Logistik */}
                <div className="sm:col-span-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <p className="text-[11px] font-bold text-blue-700 uppercase">
                      Dana Dari Pabrik - Biaya Logistik
                    </p>
                  </div>
                  <p className="font-black text-blue-700 text-base">
                    Rp {danaTersedia.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* INPUT POTONGAN KEBUN */}
              <div className="space-y-3 pt-2 border-t border-dashed border-gray-200">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Potongan Kebun / Pajak Administrasi (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      Rp
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 text-sm sm:text-base font-black text-gray-800 focus:ring-2 focus:ring-[#EF8523] outline-none transition-all bg-gray-50"
                      value={formData.total_pajak_rupiah}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          total_pajak_rupiah: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* PENDAPATAN BERSIH AKHIR (Hanya muncul jika pajak diisi) */}
                {formData.total_pajak_rupiah &&
                parseFloat(formData.total_pajak_rupiah) > 0 ? (
                  <div className="flex justify-between items-center bg-green-600 px-5 py-4 rounded-2xl shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest">
                        Pendapatan Bersih Akhir
                      </p>
                      <p className="text-[9px] text-white italic">
                        *Dana yang siap dibagikan ke petani
                      </p>
                    </div>
                    <p className="font-black text-white text-lg">
                      Rp {pendapatanBersih.toLocaleString("id-ID")}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* LIST DISTRIBUSI PETANI & VALIDASI PAS */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <p className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Alokasi ke Petani
                  </p>
                  <span className="bg-orange-100 text-[#EF8523] text-[10px] font-bold px-2.5 py-1 rounded-md">
                    {formData.detail_petani.length} Petani
                  </span>
                </div>

                {/* Indikator Sisa Saldo */}
                {pendapatanBersih > 0 && (
                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-500 ${
                      sisaDana === 0
                        ? "bg-emerald-50 border-green-200"
                        : "bg-orange-50 border-orange-200"
                    }`}
                  >
                    <p
                      className={`text-[11px] font-bold uppercase ${sisaDana === 0 ? "text-green-700" : "text-orange-700"}`}
                    >
                      {sisaDana === 0
                        ? "✓ Pembagian Sudah Pas"
                        : `Sisa Dana: Rp ${sisaDana.toLocaleString("id-ID")}`}
                    </p>
                    <div className="bg-white px-3 py-1 rounded-lg shadow-inner text-[10px] font-bold text-gray-500">
                      Total Input: Rp{" "}
                      {totalAlokasiPetani.toLocaleString("id-ID")}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {formData.detail_petani.map((petani, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-gray-200 p-3.5 sm:p-4 rounded-2xl hover:border-[#EF8523] transition-all gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 text-[#EF8523] flex items-center justify-center font-black border border-orange-200/50">
                          {petani.nama_petani?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">
                            {petani.nama_petani}
                          </p>
                          <p className="text-[10px] text-gray-500 font-medium">
                            Sumbangan:{" "}
                            <span className="font-bold">
                              {petani.tbs_disumbangkan_kg} Kg
                            </span>{" "}
                            TBS
                          </p>
                        </div>
                      </div>
                      <div className="w-full sm:w-2/5 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                          Rp
                        </span>
                        <input
                          type="number"
                          placeholder="Upah"
                          className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-sm font-black text-green-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500"
                          value={petani.upah_dibayar_rupiah}
                          onChange={(e) => {
                            const newDetails = [...formData.detail_petani];
                            newDetails[idx].upah_dibayar_rupiah =
                              e.target.value;
                            setFormData({
                              ...formData,
                              detail_petani: newDetails,
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* === FOOTER === */}
        <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-500"
          >
            Batal
          </button>
          <button
            onClick={onSave}
            disabled={loading || !isAlokasiPas}
            className={`px-8 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 ${
              loading || !isAlokasiPas
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#B5302D] hover:bg-[#962624] text-white"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {loading ? "Menyimpan..." : "Simpan & Bagikan"}
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailBagiHasilModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
        {/* === HEADER === */}
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-800 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              Rincian Distribusi Pembayaran
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" /> Resi:{" "}
              <span className="font-bold text-gray-700">
                {data.kode_resi || "-"}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 rounded-full text-gray-400 hover:text-red-500 transition-all shadow-sm"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* === KONTEN === */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 bg-white custom-scrollbar">
          {/* Ringkasan Box (Seragam dengan desain Card Main / Modal Input) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/40 p-4 sm:p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1.5">
                Tanggal Diproses
              </p>
              <p className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                {new Date(data.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="sm:border-l border-blue-200 sm:pl-5 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1.5">
                Total Potongan Pabrik / Kebun
              </p>
              <p className="font-black text-red-600 text-base sm:text-lg">
                Rp {data.total_pajak_rupiah?.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {/* List Petani */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <p className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">
                Rincian Penerima
              </p>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-md">
                {data.detail_petani?.length || 0} Petani
              </span>
            </div>

            <div className="space-y-3">
              {data.detail_petani?.map((petani, idx) => (
                <div
                  key={petani.id || idx}
                  className="flex items-center justify-between bg-white border border-gray-200 p-3.5 sm:p-4 rounded-2xl shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 flex items-center justify-center font-black shadow-inner border border-blue-200/50 group-hover:scale-110 transition-transform shrink-0">
                      {petani.nama_petani_snapshot?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm sm:text-base leading-tight mb-1">
                        {petani.nama_petani_snapshot}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                        Sumbangan:{" "}
                        <span className="text-gray-800 font-bold">
                          {petani.tbs_disumbangkan_kg} Kg
                        </span>{" "}
                        TBS
                      </p>
                    </div>
                  </div>
                  <div className="text-right bg-green-50/60 px-3 sm:px-4 py-2 rounded-xl border border-green-200/60">
                    <p className="text-[9px] sm:text-[10px] text-green-700 font-bold uppercase mb-0.5">
                      Upah Dibayar
                    </p>
                    <p className="text-sm sm:text-base font-black text-green-700">
                      Rp {petani.upah_dibayar_rupiah?.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === FOOTER === */}
        <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            Tutup Rincian
          </button>
        </div>
      </div>
    </div>
  );
};

export default Riwayatpenjualan;
