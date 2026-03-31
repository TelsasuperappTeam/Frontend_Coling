import React from "react";
import { Truck, CheckCircle2, Package, Navigation } from "lucide-react";

/* ===================== MOCK DATA ===================== */
// Data simulasi status dan progres pengiriman
const MOCK_PROGRES_PENGIRIMAN = [
  {
    id: "TRX-001",
    kebun: "Kebun Mahar",
    logistik: "Logistik Dimas Jaya",
    armada: "Truk Colt Diesel (BE 1234 XX)",
    tujuan: "PT. Sawit Makmur",
    muatan: "8 Ton",
    berangkat: "24 Sep 2025, 08:00",
    estimasiTiba: "24 Sep 2025, 11:30",
    status: "Perjalanan", // Perjalanan, Selesai
  },
  {
    id: "TRX-002",
    kebun: "Kebun Dhimas",
    logistik: "CV. Angkut Sawit",
    armada: "Fuso (BE 9988 YY)",
    tujuan: "PT. Pabrik Agro",
    muatan: "12 Ton",
    berangkat: "23 Sep 2025, 14:00",
    estimasiTiba: "23 Sep 2025, 18:00",
    status: "Selesai",
  },
];

const DistribusiLogistik = () => {
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
              Pantau status pengiriman dan progres logistik dari kebun relasi Anda.
            </p>
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA (Wrapped in SectionCard) --- */}
      <SectionCard title="Status & Progres Pengiriman">
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-6">
            <div className="mb-2">
              <p className="text-xs text-gray-500">
                Berikut adalah daftar riwayat dan status pengiriman TBS yang sedang berlangsung maupun sudah selesai.
              </p>
            </div>
            
            {/* Daftar List Pengiriman */}
            <div className="space-y-4">
              {MOCK_PROGRES_PENGIRIMAN.map((item, index) => (
                <PengirimanCard key={item.id} item={item} index={index + 1} />
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
 * Wrapper UI standar untuk card utama.
 */
const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden group hover:shadow-md transition-all">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />
    <h3 className="text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

// Kartu Tiap Item Pengiriman
const PengirimanCard = ({ item, index }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
    
    {/* BAGIAN KIRI: Nomor & Asal Kebun (Diubah posisinya ke urutan pertama) */}
    <div className="flex items-center gap-4">
      <div className="hidden md:flex w-8 h-8 bg-gray-100 text-gray-500 rounded-full items-center justify-center text-xs font-bold shrink-0">
        {index}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">
          Asal Kebun
        </p>
        <p className="text-sm font-bold text-gray-800 mt-0.5">{item.kebun}</p>
        
        {/* Tampilan Mobile untuk Status */}
        <div className="flex md:hidden gap-2 mt-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              item.status === "Perjalanan"
                ? "bg-blue-50 text-blue-700 border-blue-100"
                : "bg-green-50 text-green-700 border-green-100"
            }`}
          >
            {item.status}
          </span>
        </div>
      </div>
    </div>

    {/* BAGIAN TENGAH: Grid Informasi (Menjadi 5 Kolom) */}
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1 md:ml-8">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">Nama Logistik</p>
        <p className="text-xs font-medium text-gray-700">{item.logistik}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">Armada</p>
        <p className="text-xs font-medium text-gray-700">{item.armada}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">Tujuan</p>
        <p className="text-xs font-medium text-gray-700">{item.tujuan}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">Waktu Berangkat</p>
        <p className="text-xs font-medium text-gray-700">{item.berangkat}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">Est. Tiba</p>
        <p className="text-xs font-medium text-gray-700">{item.estimasiTiba}</p>
      </div>
    </div>

    {/* BAGIAN KANAN: Status & Muatan (Tampilan Desktop) */}
    <div className="hidden md:flex flex-col items-end min-w-[120px] gap-2">
      {/* Informasi Muatan */}
      <span className="text-xs font-bold text-[#B5302D] bg-red-50 px-3 py-1 rounded-full border border-red-100 flex items-center gap-1 w-full justify-center">
        <Package className="w-3 h-3" /> {item.muatan}
      </span>
      {/* Label Status */}
      <span
        className={`px-3 py-1.5 rounded-full text-[10px] font-bold border flex items-center justify-center gap-1.5 w-full ${
          item.status === "Perjalanan"
            ? "bg-blue-50 text-blue-700 border-blue-100"
            : "bg-green-50 text-green-700 border-green-100"
        }`}
      >
        {item.status === "Perjalanan" && <Navigation className="w-3 h-3" />}
        {item.status === "Selesai" && <CheckCircle2 className="w-3 h-3" />}
        {item.status}
      </span>
    </div>
  </div>
);

export default DistribusiLogistik;