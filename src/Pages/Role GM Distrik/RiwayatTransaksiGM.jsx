import React, { useState, useEffect, useCallback } from "react";
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
  Wallet,
  AlertCircle,
  Hash,
  X,
  Loader2,
  Search,
} from "lucide-react";
// Import getFileUrl untuk Nota Timbangan
import { API_ENDPOINTS, API_BASE_URLS, getFileUrl } from "../../config/constants";

const RiwayatTransaksiGM = () => {
  // --- STATE TAB ---
  const [activeTab, setActiveTab] = useState("aktif");

  // --- STATE DATA ---
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // --- STATE KHUSUS GM DISTRIK (Dropdown Kebun) ---
  const [kebunList, setKebunList] = useState([]);
  const [selectedKebunId, setSelectedKebunId] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- STATE MODAL DETAIL BAGI HASIL ---
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);

  /**
   * 1. FETCH DAFTAR KEBUN (Role GM)
   */
  const fetchKebunList = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URLS.USER}/users/gm/me/kebun-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setKebunList(data);
        if (data.length > 0) {
          setSelectedKebunId(data[0].auth_id || data[0].id);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil daftar kebun:", error);
    }
  };

  /**
   * 2. FETCH TRANSAKSI (Dengan Target Kebun)
   */
  const fetchSemuaTransaksi = useCallback(async () => {
    if (!selectedKebunId) return;

    setIsLoading(true);
    setExpandedId(null);
    try {
      const token = localStorage.getItem("token");
      const urlBase = API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.GET_LIST;
      const queryParam = `&target_kebun_auth_id=${selectedKebunId}`;

      const [resAktif, resHistori] = await Promise.all([
        fetch(`${urlBase}?is_history=false${queryParam}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${urlBase}?is_history=true${queryParam}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let dataAktif = resAktif.ok ? await resAktif.json() : [];
      let dataHistori = resHistori.ok ? await resHistori.json() : [];

      setAllData([...dataAktif, ...dataHistori]);
    } catch (error) {
      console.error("Error fetch transaksi GM:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedKebunId]);

  useEffect(() => {
    fetchKebunList();
  }, []);

  useEffect(() => {
    if (selectedKebunId) {
      fetchSemuaTransaksi();
    }
  }, [selectedKebunId, fetchSemuaTransaksi]);

  // --- LOGIKA PEMISAHAN TAB ---
  const dataAktif = allData
    .filter((item) => !item.pemeriksaan && item.status_permintaan?.toLowerCase() !== "ditolak")
    .sort((a, b) => b.id - a.id);

  const dataBagiHasil = allData
    .filter((item) => item.pemeriksaan && !item.bagi_hasil && item.status_permintaan?.toLowerCase() !== "ditolak")
    .sort((a, b) => b.id - a.id);

  const dataSelesai = allData
    .filter((item) => (item.pemeriksaan && item.bagi_hasil) || item.status_permintaan?.toLowerCase() === "ditolak")
    .sort((a, b) => b.id - a.id);

  let currentDataToRender = [];
  let cardTitle = "";
  if (activeTab === "aktif") {
    currentDataToRender = dataAktif;
    cardTitle = "Daftar Transaksi Aktif";
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

  const handleViewDetail = (bagiHasilData, kodeResi) => {
    setDetailData({ ...bagiHasilData, kode_resi: kodeResi });
    setShowDetailModal(true);
  };

  return (
    <div className="p-4 sm:p-8 md:p-10 min-h-screen font-sans text-gray-800">
      {/* 1. HEADER & DROPDOWN PILIH KEBUN */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
        
        {/* Judul Kiri */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-red-50 rounded-xl sm:rounded-2xl shrink-0">
            <History className="w-6 h-6 sm:w-8 sm:h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D] leading-tight">
              Riwayat Transaksi TBS
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Pantau armada logistik, pendapatan, dan proses bagi hasil (GM Distrik).
            </p>
          </div>
        </div>

        {/* Dropdown Kanan (Sejajar dengan Judul di Desktop) */}
        <div className="relative z-30 w-full lg:w-72 shrink-0">
          {/* Overlay tersembunyi untuk menutup dropdown saat klik luar */}
          {isDropdownOpen && (
            <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)} />
          )}

          {/* Tombol Utama */}
          <div
            onClick={() => kebunList.length > 0 && setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl border cursor-pointer transition-all relative z-30 shadow-sm ${
              isDropdownOpen 
                ? "bg-[#B5302D] border-[#B5302D] text-white" 
                : "bg-red-50 border-red-100 text-[#B5302D] hover:bg-red-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin className={`w-4 h-4 sm:w-5 sm:h-5 ${isDropdownOpen ? "text-white" : "text-[#B5302D]"}`} />
              <div className="flex flex-col text-left">
                <span className={`text-[9px] font-bold uppercase tracking-wider ${isDropdownOpen ? "text-red-200" : "text-[#B5302D]"}`}>
                  Pilih Kebun:
                </span>
                <span className={`font-bold text-xs sm:text-sm ${isDropdownOpen ? "text-white" : "text-gray-800"} line-clamp-1`}>
                  {kebunList.length === 0
                    ? "Memuat data..."
                    : kebunList.find((k) => (k.auth_id || k.id) === selectedKebunId)?.nama_lengkap || "-- Silakan Pilih --"}
                </span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-white" : "text-[#B5302D]"}`} />
          </div>

          {/* Menu Pilihan (Dropdown Menjuntai) */}
          <div className={`absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden transition-all duration-200 origin-top z-30 ${
            isDropdownOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"
          }`}>
            <div className="max-h-60 overflow-y-auto py-1">
              {kebunList.map((kb) => (
                <div
                  key={kb.id}
                  onClick={() => { 
                    setSelectedKebunId(kb.auth_id || kb.id); 
                    setIsDropdownOpen(false); 
                  }}
                  className={`px-4 py-3 text-xs sm:text-sm cursor-pointer flex items-center justify-between transition-colors ${
                    selectedKebunId === (kb.auth_id || kb.id) 
                      ? "bg-red-50 text-[#B5302D] font-bold" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {kb.nama_lengkap || kb.nama_kebun}
                  {selectedKebunId === (kb.auth_id || kb.id) && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#B5302D]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GARIS PEMBATAS */}
      <hr className="border-gray-200 mb-6 sm:mb-8" />

      {/* TAB SWITCHER (TIDAK DIUBAH LOGIKANYA, HANYA DIPINDAH BAWAH GARIS) */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 w-full mb-6 sm:mb-8 overflow-hidden shadow-sm">
        <button
          onClick={() => { setActiveTab("aktif"); setExpandedId(null); }}
          className={`flex-1 flex items-center justify-center gap-2 px-2 sm:px-6 py-3 sm:py-3.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "aktif" ? "bg-white text-[#B5302D] shadow-sm" : "text-gray-500 hover:bg-gray-200/50"
          }`}
        >
          <Truck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="hidden sm:block">Tunggu Pemeriksaan</span>
          {dataAktif.length > 0 && <span className="bg-red-100 text-[#B5302D] px-2 py-0.5 rounded-full text-[9px] font-black">{dataAktif.length}</span>}
        </button>

        <button
          onClick={() => { setActiveTab("bagi_hasil"); setExpandedId(null); }}
          className={`flex-1 flex items-center justify-center gap-2 px-2 sm:px-6 py-3 sm:py-3.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "bagi_hasil" ? "bg-white text-[#EF8523] shadow-sm" : "text-gray-500 hover:bg-gray-200/50"
          }`}
        >
          <Wallet className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="hidden sm:block">Perlu Bagi Hasil</span>
          {dataBagiHasil.length > 0 && <span className="bg-orange-100 text-[#EF8523] px-2 py-0.5 rounded-full text-[9px] font-black">{dataBagiHasil.length}</span>}
        </button>

        <button
          onClick={() => { setActiveTab("selesai"); setExpandedId(null); }}
          className={`flex-1 flex items-center justify-center gap-2 px-2 sm:px-6 py-3 sm:py-3.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "selesai" ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:bg-gray-200/50"
          }`}
        >
          <History className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="hidden sm:block">Selesai</span>
        </button>
      </div>

      {/* KONTEN DAFTAR TRANSAKSI */}
      <SectionCard title={cardTitle}>
        <div className="animate-fadeIn space-y-4">
          {isLoading ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#B5302D]" />
              Memuat Data Transaksi...
            </div>
          ) : currentDataToRender.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
              <Search className="mx-auto mb-3 text-gray-300" size={32} />
              Tidak ada data yang tersedia di kategori ini.
            </div>
          ) : (
            currentDataToRender.map((item) => (
              <ProgressItem
                key={item.id}
                item={item}
                isExpanded={expandedId === item.id}
                toggleExpand={() => toggleExpand(item.id)}
                handleViewDetail={handleViewDetail}
              />
            ))
          )}
        </div>
      </SectionCard>

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
    <h3 className="text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">{title}</h3>
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
        active ? "bg-green-600 border-green-600 text-white shadow-md scale-110" : "bg-white border-gray-200 text-gray-300"
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

// --- COMPONENT PROGRESS ITEM (UI SAMA PERSIS DENGAN KEBUN) ---
const ProgressItem = ({ item, isExpanded, toggleExpand, handleViewDetail }) => {
  const statusPermintaan = (item.status_permintaan || "menunggu").toLowerCase();
  const rawProgress = item.progress_db || "menunggu_pengiriman";
  const pDB = rawProgress.toLowerCase().replace(/\s+/g, "_");

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
        label = "Menunggu Kebun Bagi Hasil"; // GM Read-Only
      } else {
        colorClass = "bg-green-50 text-green-700 border-green-100";
        label = "Selesai (Tutup Buku)";
      }
    } else {
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
        <div className="flex flex-col md:flex-row justify-between gap-0 sm:gap-4 cursor-pointer w-full" onClick={toggleExpand}>
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 sm:p-2.5 bg-red-50 rounded-xl border border-red-100 shrink-0 mt-1 sm:mt-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#B5302D]" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Asal Kebun / Mandor</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 leading-snug">{item.nama_gapoktan || "Data Transaksi Anda"}</p>
                </div>
              </div>

              <div className="flex items-center sm:block justify-between bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none w-full sm:w-auto mt-1 sm:mt-0">
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider sm:mb-1">Rencana Panen</p>
                <p className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1.5 bg-white sm:bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  {item.tanggal_rencana_panen
                    ? new Date(item.tanggal_rencana_panen).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center md:items-end gap-3 mt-5 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4 min-w-full md:min-w-[120px]">
            <span className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase flex items-center justify-center gap-1.5 w-full md:w-auto ${colorClass}`}>
              {label}
            </span>
            <div className="flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm w-full md:w-auto">
              <span>{isExpanded ? "Tutup Rincian" : "Lihat Rincian"}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-[#B5302D]" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
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
                <p className="text-[11px] sm:text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Alasan Penolakan Mitra:</p>
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

  // --- RENDER KARTU STANDAR (UI KEBUN) ---
  return (
    <MainCard>
      <div className="flex flex-col md:flex-row justify-between gap-0 sm:gap-4 cursor-pointer w-full" onClick={toggleExpand}>
        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-red-50 rounded-xl border border-red-100 shrink-0 mt-1 sm:mt-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#B5302D]" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Asal Kebun / Mandor</p>
                <p className="text-sm sm:text-base font-bold text-gray-900 leading-snug">{item.nama_gapoktan || "Data Transaksi Anda"}</p>
              </div>
            </div>
            <div className="flex items-center sm:block justify-between bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none w-full sm:w-auto mt-1 sm:mt-0">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider sm:mb-1">No. Resi</p>
              <p className="text-xs sm:text-sm font-mono font-bold text-gray-700 bg-white sm:bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                {item.kode_resi || "Menunggu Resi"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mt-4">
            <div className="col-span-2 sm:col-span-1 md:col-span-3 lg:col-span-1">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pabrik Tujuan</p>
              <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed line-clamp-2">{item.alamat_pengiriman_pabrik || "-"}</p>
            </div>
            <div className="col-span-1">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Est Tiba di Pabrik</p>
              <p className="text-xs sm:text-sm font-bold text-blue-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                {item.tanggal_permintaan_sampai || "-"}
              </p>
            </div>
            <div className="col-span-1">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Biaya Kirim</p>
              <p className="text-xs sm:text-sm font-bold text-green-500">Rp {(item.biaya_final || 0).toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center md:items-end gap-3 mt-5 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4 min-w-full md:min-w-[120px]">
          <span className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase flex items-center justify-center gap-1.5 w-full md:w-auto ${colorClass}`}>
            {item.pemeriksaan && item.bagi_hasil && <CheckCircle2 className="w-3.5 h-3.5" />}
            {label}
          </span>

          <div className="flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm w-full md:w-auto">
            <span>{isExpanded ? "Tutup Rincian" : "Lihat Rincian"}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-[#B5302D]" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>
      </div>

      {/* --- KONTEN EXPAND (UI KEBUN) --- */}
      {isExpanded && (
        <div className="mt-5 sm:mt-8 pt-5 sm:pt-8 border-t border-gray-100 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-top-2">
          
          {/* 1. PELACAKAN STATUS */}
          {!item.pemeriksaan && (
            <div className="bg-gray-50 p-5 sm:p-6 rounded-[20px] sm:rounded-[25px] border border-gray-200">
              <p className="text-[10px] sm:text-xs font-bold text-gray-900 uppercase mb-6 sm:mb-8 tracking-widest text-center">
                Proses Pelacakan Armada
              </p>
              <div className="flex justify-between items-center max-w-3xl mx-auto relative px-2 sm:px-4">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full"></div>
                <StatusStep label="Menunggu" active={true} />
                <StatusStep label="Menjemput" active={["mengirim", "menuju_pabrik", "terima"].includes(pDB)} />
                <StatusStep label="Perjalanan" active={["menuju_pabrik", "terima"].includes(pDB)} />
                <StatusStep label="Tiba di Pabrik (Pemeriksaan)" active={pDB === "terima"} />
              </div>
            </div>
          )}

          {/* 2. BOX HIJAU: NOTA TIMBANGAN PABRIK (Dengan getFileUrl) */}
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
                      ? new Date(item.pemeriksaan.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })
                      : "-"}
                  </p>
                </div>
                {item.pemeriksaan.harga_beli_per_kg_snapshot > 0 && (
                  <span className="bg-green-100 text-green-800 text-[9px] sm:text-[10px] font-bold px-2.5 py-1.5 rounded-md border border-green-200 w-fit shrink-0">
                    Harga Dasar: Rp {item.pemeriksaan.harga_beli_per_kg_snapshot.toLocaleString("id-ID")} / Kg
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center bg-white px-3 py-2.5 rounded-lg border border-gray-100">
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">Berat Bruto</p>
                  <p className="text-xs sm:text-sm font-black text-gray-900">{item.pemeriksaan.bruto?.toLocaleString("id-ID") || 0} <span className="text-[9px] font-bold text-gray-400">Kg</span></p>
                </div>
                <div className="flex justify-between items-center bg-white px-3 py-2.5 rounded-lg border border-gray-100">
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Persentase Potongan Sortasi</p>
                  <p className="text-xs sm:text-sm font-black text-red-600">{item.pemeriksaan.total_potongan?.toLocaleString("id-ID") || 0} <span className="text-[9px] font-bold text-red-400">%</span></p>
                </div>
                <div className="flex justify-between items-center bg-white px-3 py-2.5 rounded-lg border border-green-200 ring-1 ring-green-50 shadow-sm">
                  <p className="text-[9px] sm:text-[10px] text-green-700 font-bold uppercase tracking-wider">Netto Bersih</p>
                  <p className="text-sm sm:text-base font-black text-green-700">{item.pemeriksaan.final_weigh?.toLocaleString("id-ID") || item.pemeriksaan.netto?.toLocaleString("id-ID") || 0} <span className="text-[9px] font-bold text-green-600/70">Kg</span></p>
                </div>
                <div className="flex justify-between items-center bg-gradient-to-r from-green-600 to-emerald-700 px-4 py-3 rounded-xl shadow-sm text-white mt-1.5">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-green-100">Total Harga Diterima</p>
                  <p className="text-base sm:text-lg font-black tracking-tight"><span className="text-[10px] font-medium mr-1">Rp</span>{item.pemeriksaan.harga_final?.toLocaleString("id-ID") || 0}</p>
                </div>

                {/* NOTA TIMBANGAN */}
                {item.pemeriksaan.dokumen_nota_url && (
                  <div className="mt-4 pt-4 border-t flex justify-between items-center bg-white/60 p-3 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <p className="text-[10px] sm:text-xs text-gray-600 font-bold uppercase">Nota Timbangan</p>
                    </div>
                    <a
                      href={getFileUrl(item.pemeriksaan.dokumen_nota_url, "TRACEABILITY")}
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

          {/* 3. BOX AKSI BAGI HASIL (READ-ONLY GM) */}
          {item.pemeriksaan && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              {!item.bagi_hasil ? (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#EF8523]"></div>
                  <div>
                    <h4 className="font-bold text-[#EF8523] text-sm sm:text-base flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> Menunggu Kebun
                    </h4>
                    <p className="text-[11px] sm:text-xs text-orange-800 mt-1 max-w-md leading-relaxed">
                      Pabrik telah mengeluarkan harga final. Menunggu pihak Kebun untuk melakukan distribusi bagi hasil ke petani.
                    </p>
                  </div>
                  <button disabled className="w-full sm:w-auto bg-gray-300 text-gray-500 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md cursor-not-allowed flex items-center justify-center gap-2">
                    <Wallet className="w-4 h-4" /> Belum Diproses
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
                      Total Pajak Kebun: <strong className="text-gray-900">Rp {item.bagi_hasil.total_pajak_rupiah?.toLocaleString("id-ID")}</strong> <br />
                      Telah terdistribusi ke <strong className="text-gray-900">{item.bagi_hasil.detail_petani?.length || 0} Petani</strong>.
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewDetail(item.bagi_hasil, item.kode_resi)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95 whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> Lihat Rincian Pembayaran
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. GRID DETAIL INFORMASI TRANSAKSI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              <h4 className="text-[11px] sm:text-xs font-bold text-[#B5302D] uppercase flex items-center gap-2">
                <Hash className="w-4 h-4" /> Informasi Transaksi
              </h4>
              <div className="flex-1 flex flex-col justify-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 text-xs sm:text-sm shadow-sm">
                <div className="flex justify-between items-center"><span className="text-gray-500">No Resi:</span><span className="font-bold font-mono text-gray-700">{item.kode_resi || "-"}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Tanggal Keberangkatan:</span><span className="font-bold text-right">{item.tanggal_keberangkatan || "-"}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Tanggal Tiba:</span><span className="font-bold text-right">{item.tanggal_permintaan_sampai || "-"}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Muatan (Est):</span><span className="font-bold text-right">{item.estimasi_total_tbs_grup_kg ? `${(item.estimasi_total_tbs_grup_kg / 1000).toFixed(2)} Ton` : "-"}</span></div>
                <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-50"><span className="text-gray-500">Biaya Pengiriman:</span><span className="font-extrabold text-[#B5302D] text-sm">Rp {(item.biaya_final || 0).toLocaleString("id-ID")}</span></div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              <h4 className="text-[11px] sm:text-xs font-bold text-[#B5302D] uppercase flex items-center gap-2">
                <Truck className="w-4 h-4" /> Armada & Supir
              </h4>
              <div className="flex-1 flex flex-col gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 text-xs sm:text-sm shadow-sm">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 shrink-0"><User className="w-4 h-4 text-gray-400" /></div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{item.kru?.nama_supir || "-"}</p>
                    <p className="text-[10px] sm:text-xs text-blue-600 font-bold flex items-center gap-1.5 mt-0.5 truncate"><Phone className="w-3 h-3 shrink-0" /> {item.kru?.nomor_telepon || "-"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-2.5 pt-1">
                  <p className="text-gray-500">Kendaraan</p><p className="font-semibold text-right">{item.kendaraan?.jenis_kendaraan_nama || "-"}</p>
                  <p className="text-gray-500">Kapasitas</p><p className="font-semibold text-right">{item.kendaraan?.kapasitas_angkut_kg ? `${item.kendaraan.kapasitas_angkut_kg.toLocaleString("id-ID")} Kg` : "-"}</p>
                  <p className="text-gray-500">Biaya / KM</p><p className="font-semibold text-right">{item.kendaraan?.biaya_per_km ? `Rp ${item.kendaraan.biaya_per_km.toLocaleString("id-ID")}` : "-"}</p>
                  <p className="text-gray-500 pt-2 border-t border-gray-50">Tipe</p><p className="font-semibold text-right pt-2 border-t border-gray-50">{item.kendaraan?.nama_kendaraan || "-"}</p>
                  <p className="text-gray-500">Plat</p><p className="font-bold text-blue-600 text-right uppercase tracking-wider">{item.kendaraan?.plat_kendaraan || "-"}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              <h4 className="text-[11px] sm:text-xs font-bold text-[#B5302D] uppercase flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Rute & Estimasi
              </h4>
              <div className="flex-1 flex flex-col justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 text-xs sm:text-sm shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="relative pl-4 border-l-2 border-dashed border-gray-200">
                    <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-orange-400 border-2 border-white" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Dari: Kebun</p>
                    <p className="font-medium text-gray-700 leading-snug">{item.alamat_pickup_teks || "-"}</p>
                  </div>
                  <div className="relative pl-4 border-l-2 border-dashed border-gray-200">
                    <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-[#B5302D] border-2 border-white" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Ke: Pabrik</p>
                    <p className="font-medium text-gray-700 leading-snug">{item.alamat_pengiriman_pabrik || "-"}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Est. Jarak</p>
                    <p className="font-bold text-gray-900">{item.estimasi_jarak_km ? `${item.estimasi_jarak_km} KM` : "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-5 sm:pt-6 mt-2 border-t border-gray-100">
            <button onClick={() => toggleExpand(null)} className="w-full sm:w-auto px-8 py-3 bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-300 transition-all">
              Tutup Rincian
            </button>
          </div>
        </div>
      )}
    </MainCard>
  );
};

// --- MODAL DETAIL RINCIAN PEMBAYARAN PETANI ---
const DetailBagiHasilModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-800 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              Rincian Distribusi Pembayaran
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" /> Resi: <span className="font-bold text-gray-700">{data.kode_resi || "-"}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 rounded-full text-gray-400 hover:text-red-500 transition-all shadow-sm">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 bg-white custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/40 p-4 sm:p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1.5">Tanggal Diproses</p>
              <p className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                {new Date(data.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="sm:border-l border-blue-200 sm:pl-5 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1.5">Total Potongan Pabrik / Kebun</p>
              <p className="font-black text-red-600 text-base sm:text-lg">Rp {data.total_pajak_rupiah?.toLocaleString("id-ID")}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <p className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">Rincian Penerima</p>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-md">{data.detail_petani?.length || 0} Petani</span>
            </div>
            <div className="space-y-3">
              {data.detail_petani?.map((petani, idx) => (
                <div key={petani.id || idx} className="flex items-center justify-between bg-white border border-gray-200 p-3.5 sm:p-4 rounded-2xl shadow-sm hover:border-blue-400 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 flex items-center justify-center font-black shadow-inner border border-blue-200/50 group-hover:scale-110 transition-transform shrink-0">
                      {petani.nama_petani_snapshot?.charAt(0).toUpperCase() || "P"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm sm:text-base leading-tight mb-1">{petani.nama_petani_snapshot}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Sumbangan: <span className="text-gray-800 font-bold">{petani.tbs_disumbangkan_kg} Kg</span> TBS</p>
                    </div>
                  </div>
                  <div className="text-right bg-green-50/60 px-3 sm:px-4 py-2 rounded-xl border border-green-200/60">
                    <p className="text-[9px] sm:text-[10px] text-green-700 font-bold uppercase mb-0.5">Upah Dibayar</p>
                    <p className="text-sm sm:text-base font-black text-green-700">Rp {petani.upah_dibayar_rupiah?.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button onClick={onClose} className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all">
            Tutup Rincian
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiwayatTransaksiGM;