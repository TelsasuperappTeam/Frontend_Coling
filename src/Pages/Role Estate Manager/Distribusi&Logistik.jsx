import React, { useState } from "react";
import {
  Truck,
  MapPin,
  ChevronRight,
  Search,
  Users,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Package,
  ArrowLeft,
  Filter,
  User,
  MoreHorizontal,
} from "lucide-react";

/* ===================== MOCK DATA ===================== */

// Tawaran Masuk (Logistik menawarkan jasa ke Kebun)
const MOCK_INCOMING_OFFERS = [
  {
    id: 1,
    logistikName: "Logistik Dimas Jaya",
    rating: 4.8,
    armada: "Truk Colt Diesel",
    kapasitas: "6-8 Ton",
    harga: 22000, // per ton/km (contoh)
    estimasiJemput: "Besok, 08:00 WIB",
    tujuan: "PT. Sawit Makmur",
  },
  {
    id: 2,
    logistikName: "CV. Angkut Sawit",
    rating: 4.5,
    armada: "Fuso",
    kapasitas: "10-12 Ton",
    harga: 20000,
    estimasiJemput: "Besok, 10:00 WIB",
    tujuan: "PT. Pabrik Agro",
  },
];

// Data Logistik untuk Close Market (Direktori)
const MOCK_LOGISTICS_DIRECTORY = [
  {
    id: 101,
    name: "PT. Logistik Cepat",
    rating: 4.9,
    armada: 12,
    status: "Tersedia",
  },
  {
    id: 102,
    name: "CV. Maju Jalan",
    rating: 4.7,
    armada: 5,
    status: "Tersedia",
  },
  {
    id: 103,
    name: "Trans Sawit Express",
    rating: 4.5,
    armada: 8,
    status: "Sibuk",
  },
];

// Progres Pengajuan (History)
const MOCK_PROGRESS = [
  {
    id: "TRX-001",
    tujuan: "PT. Sawit Makmur",
    metode: "Open Market",
    tglAjuan: "24 Sep 2025",
    muatan: "6 Ton",
    status: "pending_logistik", // pending_logistik, on_process, done, rejected
    logistik: "-",
  },
  {
    id: "TRX-002",
    tujuan: "PT. Pabrik Agro",
    metode: "Close Market",
    tglAjuan: "22 Sep 2025",
    muatan: "8 Ton",
    status: "on_process",
    logistik: "Logistik Dimas Jaya",
  },
  {
    id: "TRX-003",
    tujuan: "PT. Sawit Makmur",
    metode: "Close Market",
    tglAjuan: "20 Sep 2025",
    muatan: "5 Ton",
    status: "done",
    logistik: "CV. Angkut Sawit",
  },
];

const DistribusiLogistik = () => {
  // State Management: Mengatur navigasi Tab (Pencarian/Progres) dan View Mode (Main/Form)
  const [activeTab, setActiveTab] = useState("pencarian"); 
  const [viewMode, setViewMode] = useState("main"); 
  const [selectedLogistik, setSelectedLogistik] = useState(null);

  /* --- HANDLERS (Fungsi Logika Navigasi) --- */
  
  // Mengaktifkan mode formulir Open Market
  const handleOpenMarket = () => setViewMode("open_market_form");
  
  // Mengaktifkan mode list untuk memilih mitra (Close Market)
  const handleCloseMarket = () => setViewMode("close_market_list");

  // Memilih logistik spesifik dan lanjut ke formulir
  const handleSelectLogistik = (logistik) => {
    setSelectedLogistik(logistik);
    setViewMode("close_market_form");
  };

  // Kembali ke tampilan utama & reset seleksi
  const handleBackToMain = () => {
    setViewMode("main");
    setSelectedLogistik(null);
  };

  // Helper dinamis untuk menentukan Judul SectionCard berdasarkan viewMode & activeTab
  const getSectionTitle = () => {
    if (viewMode === "open_market_form") return "Pengajuan Open Market";
    if (viewMode === "close_market_list") return "Pilih Mitra Logistik";
    if (viewMode === "close_market_form") return "Pengajuan Close Market";
    
    // Jika di View Main, judul tergantung Tab yang aktif
    return activeTab === "pencarian"
      ? "Manajemen Pencarian Logistik"
      : "Status Pengiriman & Progres";
  };

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans">
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 sm:mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <Truck className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Distribusi & Logistik
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Kelola pencarian armada dan pantau progres pengiriman TBS.
            </p>
          </div>
        </div>

        {/* Tab Switcher (Hanya muncul di Main View) */}
        {viewMode === "main" && (
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("pencarian")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                activeTab === "pencarian"
                  ? "bg-white text-[#B5302D] shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <Search className="w-3.5 h-3.5" /> Mencari Pengiriman
            </button>
            <button
              onClick={() => setActiveTab("progres")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                activeTab === "progres"
                  ? "bg-white text-[#B5302D] shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Progres Pengajuan
            </button>
          </div>
        )}
      </div>

      {/* --- CONTENT AREA (Wrapped in SectionCard) --- */}
      <SectionCard title={getSectionTitle()}>
        {/* VIEW: MAIN TAB CONTENT */}
        {viewMode === "main" ? (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            {/* TAB 1 MENCARI PENGIRIMAN */}
            {activeTab === "pencarian" && (
              <div className="space-y-10">
                {/* SECTION A Validasi Permintaan (Tawaran Masuk) */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-orange-500" />{" "}
                        Validasi Permintaan Masuk
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Pihak logistik menawarkan jasa pengiriman untuk panen
                        Anda.
                      </p>
                    </div>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold">
                      {MOCK_INCOMING_OFFERS.length} Tawaran
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {MOCK_INCOMING_OFFERS.map((offer) => (
                      <IncomingOfferCard key={offer.id} offer={offer} />
                    ))}
                  </div>
                </section>

                <div className="border-t border-gray-100"></div>

                {/* SECTION B Cari Jasa (Actions) */}
                <section>
                  <div className="mb-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Search className="w-5 h-5 text-[#B5302D]" /> Cari Jasa
                      Pengiriman Baru
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Buat pengajuan baru jika tidak ada tawaran yang cocok.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card Open Market */}
                    <div
                      onClick={handleOpenMarket}
                      className="group cursor-pointer bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:border-blue-300 rounded-[24px] p-6 transition-all hover:shadow-lg hover:shadow-blue-50 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm text-blue-600">
                          <Globe className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                          Open Market
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4">
                          Kirim permintaan ke <b>seluruh jaringan logistik</b>{" "}
                          yang tersedia. Dapatkan penawaran kompetitif dari
                          berbagai mitra.
                        </p>
                        <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                          Buat Permintaan <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Card Close Market */}
                    <div
                      onClick={handleCloseMarket}
                      className="group cursor-pointer bg-gradient-to-br from-purple-50 to-white border border-purple-100 hover:border-purple-300 rounded-[24px] p-6 transition-all hover:shadow-lg hover:shadow-purple-50 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm text-purple-600">
                          <Users className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                          Close Market
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4">
                          Pilih <b>mitra logistik spesifik</b> yang sudah Anda
                          kenal atau percayai untuk menangani pengiriman ini.
                        </p>
                        <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
                          Pilih Mitra <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* TAB 2 PROGRES PENGAJUAN */}
            {activeTab === "progres" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                  <div className="text-xs text-gray-500">
                    Pantau pergerakan dan status pengajuan armada Anda.
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100">
                    <Filter className="w-3.5 h-3.5" /> Filter Status
                  </button>
                </div>

                <div className="space-y-4">
                  {MOCK_PROGRESS.map((item) => (
                    <ProgressItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* --- VIEW: SUB-PAGES / FORMS --- */
          <div className="animate-in fade-in slide-in-from-right-4">
            <button
              onClick={handleBackToMain}
              className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[#B5302D] text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>

            {/* FORM OPEN MARKET */}
            {viewMode === "open_market_form" && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-6 h-6" />
                  </div>
                  {/* Judul utama sudah ada di SectionCard, deskripsi tetap ditampilkan */}
                  <p className="text-xs text-gray-500">
                    Permintaan akan disiarkan ke semua mitra logistik.
                  </p>
                </div>
                <FormPengajuan onSubmit={handleBackToMain} />
              </div>
            )}

            {/* LIST CLOSE MARKET (Pilih Vendor) */}
            {viewMode === "close_market_list" && (
              <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                  {/* Judul utama dihandle SectionCard */}
                  <p className="text-xs text-gray-500">
                    Pilih salah satu mitra untuk diajukan permintaan pengiriman.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {MOCK_LOGISTICS_DIRECTORY.map((mitra) => (
                    <div
                      key={mitra.id}
                      onClick={() => handleSelectLogistik(mitra)}
                      className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-[#B5302D] hover:bg-red-50 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 group-hover:bg-white group-hover:text-[#B5302D]">
                          {mitra.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">
                            {mitra.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded flex items-center gap-1">
                              ★ {mitra.rating}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {mitra.armada} Armada Ready
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#B5302D]" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FORM CLOSE MARKET */}
            {viewMode === "close_market_form" && selectedLogistik && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  {/* Judul utama dihandle SectionCard */}
                  <p className="text-xs text-gray-500">
                    Mengajukan permintaan khusus kepada{" "}
                    <span className="font-bold text-gray-800">
                      {selectedLogistik.name}
                    </span>
                    .
                  </p>
                </div>
                <FormPengajuan
                  onSubmit={handleBackToMain}
                  targetName={selectedLogistik.name}
                />
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

/* ===================== COMPONENTS HELPERS ===================== */

/**
 * SectionCard
 * Komponen wrapper standar untuk setiap section utama.
 * Dilengkapi dengan dekorasi gradient di bagian atas dan judul dinamis.
 */
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

// Kartu Tawaran Masuk (Incoming Offer)
const IncomingOfferCard = ({ offer }) => (
  <MainCard>
    <div className="flex flex-col sm:flex-row gap-4 justify-between">
      <div className="space-y-3 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">
            TAWARAN MASUK
          </span>
          <span className="text-[10px] text-gray-400">
            • {offer.estimasiJemput}
          </span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900">
            {offer.logistikName}
          </h4>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Truck className="w-3 h-3" /> {offer.armada} ({offer.kapasitas})
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
            Tujuan Pengiriman
          </p>
          <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#B5302D]" /> {offer.tujuan}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between items-end border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-4 min-w-[140px]">
        <div className="text-right mb-4 sm:mb-0">
          <p className="text-[10px] text-gray-400 font-bold uppercase">
            Harga Tawaran
          </p>
          <p className="text-lg font-extrabold text-[#B5302D]">
            Rp {offer.harga.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">per ton/km</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-red-500 hover:bg-red-50 text-[10px] font-bold transition-all">
            <XCircle className="w-4 h-4 mx-auto" />
          </button>
          <button className="flex-[2] px-4 py-2 rounded-xl bg-green-600 text-white shadow-lg shadow-green-100 hover:bg-green-700 text-[10px] font-bold transition-all">
            Terima
          </button>
        </div>
      </div>
    </div>
  </MainCard>
);

// Item Progres Pengiriman
const ProgressItem = ({ item }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "pending_logistik":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "on_process":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "done":
        return "bg-green-50 text-green-700 border-green-100";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending_logistik":
        return "Menunggu Konfirmasi";
      case "on_process":
        return "Dalam Perjalanan";
      case "done":
        return "Selesai";
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left Info */}
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-2xl ${
            item.metode === "Open Market"
              ? "bg-blue-50 text-blue-600"
              : "bg-purple-50 text-purple-600"
          }`}
        >
          {item.metode === "Open Market" ? (
            <Globe className="w-5 h-5" />
          ) : (
            <Users className="w-5 h-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              {item.id}
            </span>
            <span className="text-[10px] text-gray-300">•</span>
            <span className="text-[10px] font-bold text-gray-500">
              {item.tglAjuan}
            </span>
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-0.5">
            {item.tujuan}
          </h4>
          <p className="text-xs text-gray-500">
            Muatan:{" "}
            <span className="font-bold text-gray-800">{item.muatan}</span>
          </p>
        </div>
      </div>

      {/* Middle Info (Driver/Logistics) */}
      <div className="flex-1 md:px-8">
        {item.logistik !== "-" ? (
          <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-bold text-gray-700">
                {item.logistik}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-100 border-dashed text-center">
            <span className="text-[10px] font-bold text-yellow-700 italic">
              Sedang mencari armada...
            </span>
          </div>
        )}
      </div>

      {/* Right Info (Status) */}
      <div className="flex items-center justify-between md:justify-end gap-3 min-w-[160px]">
        <span
          className={`px-3 py-1.5 rounded-full text-[10px] font-bold border ${getStatusColor(
            item.status
          )}`}
        >
          {getStatusLabel(item.status)}
        </span>
        <button className="text-gray-400 hover:text-[#B5302D]">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Form Component (Shared)
const FormPengajuan = ({ onSubmit, targetName }) => (
  <div className="space-y-6">
    {targetName && (
      <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-purple-600" />
        <p className="text-xs text-purple-800">
          Anda mengajukan kepada:{" "}
          <span className="font-bold">{targetName}</span>
        </p>
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-gray-500 uppercase">
          Nama Grup Penjualan
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none"
          defaultValue="Grup Tani Makmur A"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-gray-500 uppercase">
          Pabrik Tujuan
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none"
          defaultValue="PT. Sawit Makmur"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-gray-500 uppercase">
          Tanggal Panen
        </label>
        <input
          type="date"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-gray-500 uppercase">
          Tanggal Dijemput
        </label>
        <input
          type="date"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-gray-500 uppercase">
          Est. Total (Kg)
        </label>
        <input
          type="number"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none"
          placeholder="0"
        />
      </div>
    </div>

    <div className="space-y-2">
      <label className="text-[11px] font-bold text-gray-500 uppercase">
        Catatan Tambahan
      </label>
      <textarea
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none min-h-[100px]"
        placeholder="Instruksi penjemputan..."
      ></textarea>
    </div>

    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
      <button
        onClick={onSubmit}
        className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
      >
        Batal
      </button>
      <button className="px-8 py-2.5 bg-[#B5302D] text-white rounded-xl text-xs font-bold shadow-lg shadow-red-100 hover:bg-[#962624] transition-all flex items-center gap-2">
        <Package className="w-4 h-4" /> Kirim Pengajuan
      </button>
    </div>
  </div>
);

// Wrapper Card Utama
const MainCard = ({ children }) => (
  <div className="relative bg-white rounded-[24px] border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 overflow-hidden group">
    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#B5302D] opacity-0 group-hover:opacity-100 transition-opacity" />
    {children}
  </div>
);

export default DistribusiLogistik;