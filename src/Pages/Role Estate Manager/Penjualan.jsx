import React, { useState } from "react";
import {
  Store,
  MapPin,
  Calendar,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  History,
  FileText,
  X,
} from "lucide-react";

/* ===================== MOCK DATA ===================== */
// Data simulasi kebutuhan pabrik untuk ditampilkan di tab "Lowongan"
const MOCK_PABRIK_NEEDS = [
  {
    id: 1,
    nama: "PT. Pabrik Agro Sejahtera",
    alamat: "Desa Sukojadi, Kec. Lampung Tengah, Unit B-05",
    tanggalKebutuhan: "23 Sep 2025",
    jenisSawit: "Dura",
    varietas: "DxP (Optional)",
    kuota: 50, // Ton
    terisi: 20, // Ton
    harga: 1400, // Rupiah per kg
    status: "Open",
  },
  {
    id: 2,
    nama: "PT. Sawit Makmur Abadi",
    alamat: "Jl. Raya Lintas Sumatera KM 45, Lampung Selatan",
    tanggalKebutuhan: "24 Sep 2025",
    jenisSawit: "Tenera",
    varietas: "Marihat",
    kuota: 100,
    terisi: 85,
    harga: 1450,
    status: "Open",
  },
];

// Data simulasi riwayat pengajuan yang pernah dilakukan user
const MOCK_RIWAYAT = [
  {
    id: 101,
    grup: "Grup Tani Makmur A",
    pabrik: "PT. Sawit Makmur",
    tglAjuan: "23 Sep 2025",
    tglPanen: "25 Sep 2025",
    estimasi: 6000, // kg
    status: "pending", // pending, accepted, rejected
  },
  {
    id: 102,
    grup: "Grup Tani Jaya B",
    pabrik: "PT. Pabrik Agro",
    tglAjuan: "20 Sep 2025",
    tglPanen: "22 Sep 2025",
    estimasi: 4500,
    status: "accepted",
  },
];

// Mock Data Rencana Panen milik User (Untuk dipilih saat form ajukan)
const MOCK_MY_HARVEST_PLAN = [
  {
    id: "h1",
    petani: "Pak Budi",
    alamatKebun: "Blok A, Kebun Sinar",
    jenis: "Tenera",
    tglTanam: "2015",
    tglPanen: "25 Sep 2025",
    usia: "10 Thn",
    estimasi: 3, // Ton
  },
  {
    id: "h2",
    petani: "Pak Joko",
    alamatKebun: "Blok B, Kebun Sinar",
    jenis: "Dura",
    tglTanam: "2018",
    tglPanen: "25 Sep 2025",
    usia: "7 Thn",
    estimasi: 2.5, // Ton
  },
];

const Penjualan = () => {
  // State manajemen: Mengatur tab aktif (Lowongan/Riwayat) dan tampilan (List/Detail/Form)
  const [activeTab, setActiveTab] = useState("lowongan"); 
  const [viewState, setViewState] = useState("list"); 
  const [selectedPabrik, setSelectedPabrik] = useState(null);

  // --- Navigasi Flow Functions ---
  
  // Membuka detail pabrik tertentu
  const handleOpenDetail = (pabrik) => {
    setSelectedPabrik(pabrik);
    setViewState("detail");
  };

  // Membuka form pengajuan penjualan
  const handleOpenForm = () => {
    setViewState("form");
  };

  // Kembali ke tampilan list utama
  const handleBackToList = () => {
    setViewState("list");
    setSelectedPabrik(null);
  };

  // Kembali dari form ke detail (bukan ke list)
  const handleBackToDetail = () => {
    setViewState("detail");
  };

  // Helper untuk menentukan judul SectionCard secara dinamis berdasarkan viewState
  const getSectionTitle = () => {
    if (viewState === "detail") return "Detail Kebutuhan Pabrik";
    if (viewState === "form") return "Form Pengajuan Penjualan";
    return activeTab === "lowongan" 
      ? "Ajukan Penjualan TBS ke Pabrik" 
      : "Status Pengajuan Penjualan";
  };

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans">
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 sm:mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <Store className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Penjualan TBS
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Ajukan penjualan TBS ke pabrik dan pantau status pengajuan.
            </p>
          </div>
        </div>

        {/* Tab Switcher (Hanya muncul jika di view List) */}
        {viewState === "list" && (
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("lowongan")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                activeTab === "lowongan"
                  ? "bg-white text-[#B5302D] shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <Store className="w-3.5 h-3.5" /> Kebutuhan Pabrik
            </button>
            <button
              onClick={() => setActiveTab("riwayat")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                activeTab === "riwayat"
                  ? "bg-white text-[#B5302D] shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <History className="w-3.5 h-3.5" /> Riwayat Pengajuan
            </button>
          </div>
        )}
      </div>

      {/* --- CONTENT AREA (Wrapped in SectionCard) --- */}
      <SectionCard title={getSectionTitle()}>
        {/* VIEW: LIST (Lowongan & Riwayat) */}
        {viewState === "list" && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            {activeTab === "lowongan" ? (
              <div className="space-y-6">
                <div className="mb-2">
                  {/* Judul sudah dihandle oleh SectionCard, hanya deskripsi yang tersisa */}
                  <p className="text-xs text-gray-500">
                    Berikut daftar permintaan kebutuhan pabrik yang tersedia.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {MOCK_PABRIK_NEEDS.map((item) => (
                    <PabrikCard
                      key={item.id}
                      item={item}
                      onRincian={() => handleOpenDetail(item)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="mb-2">
                  <p className="text-xs text-gray-500">
                    Pantau status pengajuan penjualan TBS Anda di sini.
                  </p>
                </div>
                {/* Mobile: Card List, Desktop: Table Style but inside Cards */}
                <div className="space-y-4">
                  {MOCK_RIWAYAT.map((item, index) => (
                    <RiwayatCard key={item.id} item={item} index={index + 1} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: DETAIL PABRIK */}
        {viewState === "detail" && selectedPabrik && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <button
              onClick={handleBackToList}
              className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[#B5302D] text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
            </button>

            {/* Title Detail sudah dihandle SectionCard */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Kolom Kiri: Info Dasar */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Nama Pabrik
                  </label>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedPabrik.nama}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Alamat Pabrik
                  </label>
                  <p className="text-sm font-medium text-gray-700 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />{" "}
                    {selectedPabrik.alamat}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Tanggal Rencana Kebutuhan
                  </label>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />{" "}
                    {selectedPabrik.tanggalKebutuhan}
                  </p>
                </div>
              </div>

              {/* Kolom Kanan: Detail Teknis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Jenis Sawit
                  </label>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedPabrik.jenisSawit}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Varietas (Opsional)
                  </label>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedPabrik.varietas}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Kuota / Kapasitas
                  </label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">
                      {selectedPabrik.terisi}/{selectedPabrik.kuota}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      Ton
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-[#B5302D] h-full rounded-full"
                      style={{
                        width: `${
                          (selectedPabrik.terisi / selectedPabrik.kuota) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Harga Beli
                  </label>
                  <p className="text-xl font-extrabold text-green-600">
                    Rp {selectedPabrik.harga}
                  </p>
                  <p className="text-[10px] text-gray-400">per Kg</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={handleBackToList}
                className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleOpenForm}
                className="flex-1 sm:flex-none px-8 py-3 bg-green-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                Ajukan Penjualan
              </button>
            </div>
          </div>
        )}

        {/* VIEW: FORM AJUKAN */}
        {viewState === "form" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-end mb-2">
              <button
                onClick={handleBackToDetail}
                className="p-2 bg-gray-50 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Field Nama Grup */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase">
                  Nama Grup Penjualan
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama grup..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none transition-all"
                />
              </div>
              {/* Field Tanggal Rencana */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase">
                  Tanggal Rencana Panen
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none transition-all"
                />
              </div>
            </div>

            {/* Selector Rencana Panen */}
            <div className="space-y-3 mb-8">
              <label className="text-[11px] font-bold text-gray-500 uppercase">
                Pilih Sumber Rencana Panen Anda
              </label>
              <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 bg-white space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {MOCK_MY_HARVEST_PLAN.map((plan) => (
                  <label
                    key={plan.id}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-red-50 hover:border-red-100 cursor-pointer transition-all group"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-[#B5302D] rounded border-gray-300 focus:ring-[#B5302D]"
                    />
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {plan.petani}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {plan.alamatKebun}
                        </p>
                      </div>
                      <div className="text-right sm:text-left">
                        <p className="text-xs text-gray-500">
                          Estimasi:{" "}
                          <span className="font-bold text-[#B5302D]">
                            {plan.estimasi} Ton
                          </span>
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Usia: {plan.usia} • {plan.jenis}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Alamat Pickup */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase">
                  Alamat Pickup
                </label>
                <input
                  type="text"
                  placeholder="Masukkan alamat penjemputan..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none transition-all"
                />
              </div>
              {/* Koordinat (Auto) */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase">
                  Koordinat Pickup
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value="-5.324, 105.232"
                    readOnly
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-3.5 text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                    AUTO
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <label className="text-[11px] font-bold text-gray-500 uppercase">
                Catatan Tambahan
              </label>
              <textarea
                placeholder="Tulis catatan untuk pabrik..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none transition-all min-h-[100px]"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={handleBackToDetail}
                className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
              >
                Tutup
              </button>
              <button className="px-8 py-2.5 bg-[#B5302D] text-white rounded-xl text-xs font-bold shadow-lg shadow-red-100 hover:bg-[#962624] transition-all flex items-center gap-2">
                <FileText className="w-4 h-4" /> Kirim Pengajuan
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

/* ===================== COMPONENT HELPERS ===================== */

/**
 * SectionCard
 * Wrapper UI standar untuk setiap bagian utama halaman.
 * Memberikan styling border, shadow, dan header dekoratif dengan gradient.
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

// Kartu Daftar Lowongan Pabrik
const PabrikCard = ({ item, onRincian }) => (
  <MainCard>
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-gray-900">
              {item.nama}
            </h4>
            <p className="text-[11px] sm:text-xs text-gray-500 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3 h-3 text-gray-400" /> {item.alamat}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <div className="px-3 py-1.5 bg-red-50 text-[#B5302D] rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-red-100">
            <Calendar className="w-3 h-3" /> {item.tanggalKebutuhan}
          </div>
          <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-green-100">
            <DollarSign className="w-3 h-3" /> Rp {item.harga} /kg
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase">
            Kuota:{" "}
            <span className="text-gray-700">
              {item.terisi}/{item.kuota} Ton
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-end md:items-center">
        <button
          onClick={onRincian}
          className="w-full md:w-auto px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 hover:border-[#B5302D] hover:text-[#B5302D] transition-all flex items-center justify-center gap-2 group"
        >
          Rincian{" "}
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#B5302D]" />
        </button>
      </div>
    </div>
  </MainCard>
);

// Kartu Riwayat Pengajuan (Style Table tapi Card)
const RiwayatCard = ({ item, index }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4">
      <div className="hidden md:flex w-8 h-8 bg-gray-100 text-gray-500 rounded-full items-center justify-center text-xs font-bold">
        {index}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">
          Nama Grup
        </p>
        <p className="text-sm font-bold text-gray-800">{item.grup}</p>
        <div className="flex md:hidden gap-2 mt-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              item.status === "pending"
                ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                : item.status === "accepted"
                ? "bg-green-50 text-green-700 border-green-100"
                : "bg-red-50 text-red-700 border-red-100"
            }`}
          >
            {item.status === "pending"
              ? "Menunggu"
              : item.status === "accepted"
              ? "Diterima"
              : "Ditolak"}
          </span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 md:ml-8">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">Tujuan</p>
        <p className="text-xs font-medium text-gray-700">{item.pabrik}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">
          Tgl Diajukan
        </p>
        <p className="text-xs font-medium text-gray-700">{item.tglAjuan}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">
          Tgl Panen
        </p>
        <p className="text-xs font-medium text-gray-700">{item.tglPanen}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">
          Est. TBS (kg)
        </p>
        <p className="text-xs font-bold text-[#B5302D]">{item.estimasi}</p>
      </div>
    </div>

    <div className="hidden md:block min-w-[100px] text-right">
      <span
        className={`px-3 py-1.5 rounded-full text-[10px] font-bold border flex items-center justify-center gap-1.5 w-full ${
          item.status === "pending"
            ? "bg-yellow-50 text-yellow-700 border-yellow-100"
            : item.status === "accepted"
            ? "bg-green-50 text-green-700 border-green-100"
            : "bg-red-50 text-red-700 border-red-100"
        }`}
      >
        {item.status === "pending" && <History className="w-3 h-3" />}
        {item.status === "accepted" && <CheckCircle2 className="w-3 h-3" />}
        {item.status === "pending"
          ? "Pending"
          : item.status === "accepted"
          ? "Diterima"
          : "Ditolak"}
      </span>
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

export default Penjualan;