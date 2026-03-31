import React from "react";
import { Store, CheckCircle2, History } from "lucide-react";

/* ===================== MOCK DATA ===================== */
// Data simulasi riwayat pengajuan yang pernah dilakukan user
const MOCK_RIWAYAT = [
  {
    id: 101,
    kebun: "Kebun Mahar", // <-- Data Kebun
    grup: "Grup Tani Makmur A",
    pabrik: "PT. Sawit Makmur",
    tglAjuan: "23 Sep 2025",
    tglPanen: "25 Sep 2025",
    estimasi: 6000, // kg
    status: "pending", // pending, accepted, rejected
  },
  {
    id: 102,
    kebun: "Kebun Dhimas", // <-- Data Kebun
    grup: "Grup Tani Jaya B",
    pabrik: "PT. Pabrik Agro",
    tglAjuan: "20 Sep 2025",
    tglPanen: "22 Sep 2025",
    estimasi: 4500,
    status: "accepted",
  },
];

const Penjualan = () => {
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
              Pantau status pengajuan penjualan TBS dari kebun relasi anda.
            </p>
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA (Wrapped in SectionCard) --- */}
      <SectionCard title="Status Pengajuan Penjualan">
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-6">
            <div className="mb-2">
              <p className="text-xs text-gray-500">
                Berikut adalah daftar riwayat status pengajuan penjualan TBS
                Anda.
              </p>
            </div>
            {/* Mobile: Card List, Desktop: Table Style but inside Cards */}
            <div className="space-y-4">
              {MOCK_RIWAYAT.map((item, index) => (
                <RiwayatCard key={item.id} item={item} index={index + 1} />
              ))}
            </div>
          </div>
        </div>
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

// Kartu Riwayat Pengajuan (Style Table tapi Card)
const RiwayatCard = ({ item, index }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
    
    {/* BAGIAN KIRI: Nomor & Asal Kebun (Sekarang jadi urutan pertama) */}
    <div className="flex items-center gap-4">
      <div className="hidden md:flex w-8 h-8 bg-gray-100 text-gray-500 rounded-full items-center justify-center text-xs font-bold shrink-0">
        {index}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">
          Asal Kebun
        </p>
        <p className="text-sm font-bold text-gray-800">{item.kebun}</p>
        
        {/* Mobile View untuk Status */}
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

    {/* BAGIAN TENGAH: Grid Informasi (Berisi 5 kolom) */}
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1 md:ml-8">
      {/* Nama Grup dipindah ke sini */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">
          Nama Grup
        </p>
        <p className="text-xs font-medium text-gray-700">{item.grup}</p>
      </div>
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

    {/* BAGIAN KANAN: Status (Desktop) */}
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

export default Penjualan;