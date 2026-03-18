import React, { useState } from "react";
import {
  Factory,
  PlusCircle,
  CheckCircle,
  History,
  Package,
  Barcode,
  Calendar,
  RefreshCw,
} from "lucide-react";

// --- KOMPONEN SECTION CARD (BARU) ---
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

export default function Produksi() {
  // State untuk Input
  const [jumlahTBS, setJumlahTBS] = useState("");

  // Data dummy Siklus Produksi
  const [siklusAktif] = useState([
    {
      id: 1,
      siklus: "Ke-3",
      mulai: "22/12/2025, 18:14",
      tbs: 300,
    },
    {
      id: 2,
      siklus: "Ke-4",
      mulai: "22/12/2025, 19:00",
      tbs: 300,
    },
  ]);

  const [riwayatProduksi] = useState([
    {
      id: 1,
      siklus: "Ke-1",
      mulai: "22/12/2025, 10:00",
      selesai: "23/12/2025, 14:00",
      tbs: 300,
      barcode: "PRD-1766401309216",
    },
    {
      id: 2,
      siklus: "Ke-2",
      mulai: "22/12/2025, 15:00",
      selesai: "23/12/2025, 17:00",
      tbs: 300,
      barcode: "PRD-1766401309217",
    },
  ]);

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans">
      {/* --- HEADER HALAMAN --- */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-red-50 rounded-2xl shadow-sm">
          <Factory className="w-8 h-8 text-[#B5302D]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#B5302D]">Produksi</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola siklus pengolahan TBS menjadi CPO.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* --- SECTION 1: INPUT SIKLUS BARU --- */}
        <SectionCard
          title={
            <>
              <PlusCircle className="w-5 h-5" />
              Siklus Produksi Baru
            </>
          }
        >
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Jumlah TBS Digunakan (ton)
              </label>
              <input
                type="number"
                placeholder="Masukkan jumlah ton..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5302D]/20 focus:border-[#B5302D] transition-all"
                value={jumlahTBS}
                onChange={(e) => setJumlahTBS(e.target.value)}
              />
            </div>
            <button className="w-full md:w-auto px-6 py-2.5 bg-[#4A90E2] hover:bg-[#357ABD] text-white font-semibold rounded-lg transition-colors whitespace-nowrap">
              Buat Siklus Produksi
            </button>
          </div>
        </SectionCard>

        {/* --- SECTION 2 SIKLUS PRODUKSI BERJALAN --- */}
        <SectionCard
          title={
            <>
              <RefreshCw className="w-5 h-5" />
              Siklus Produksi Berjalan
            </>
          }
        >
          {/* Info tambahan dipindahkan ke dalam body card agar layout rapi */}
          <div className="flex justify-end -mt-4 mb-4">
            <span className="text-xs font-medium text-gray-400">
              Menampilkan {siklusAktif.length} siklus aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {siklusAktif.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50/50 border border-gray-200 rounded-xl p-5 hover:border-[#EF8523]/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">
                      Siklus Produksi {item.siklus}
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-200 uppercase">
                      Sedang Berjalan
                    </span>
                  </div>
                  <button className="px-4 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-full hover:bg-[#EF8523] hover:text-white hover:border-[#EF8523] transition-colors shadow-sm">
                    Selesaikan
                  </button>
                </div>

                <div className="flex flex-col gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <Calendar className="w-3.5 h-3.5" /> Mulai
                    </span>
                    <span className="font-semibold">{item.mulai}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <Package className="w-3.5 h-3.5" /> TBS Digunakan
                    </span>
                    <span className="font-bold text-[#B5302D]">
                      {item.tbs} ton
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* --- SECTION 3 RIWAYAT PRODUKSI --- */}
        <SectionCard
          title={
            <>
              <History className="w-5 h-5" />
              Riwayat Produksi
            </>
          }
        >
          {/* Info tambahan dipindahkan ke dalam body card */}
          <div className="flex justify-end -mt-4 mb-4">
            <span className="text-xs font-medium text-gray-400">
              Semua riwayat produksi yang selesai
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riwayatProduksi.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-bold text-gray-800">
                    Siklus Produksi {item.siklus}
                  </h4>
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase">
                      Selesai
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-y-2 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                    <span className="text-gray-400 text-xs">Mulai:</span>
                    <span className="font-medium text-right text-xs">
                      {item.mulai}
                    </span>

                    <span className="text-gray-400 text-xs">Selesai:</span>
                    <span className="font-medium text-right text-xs">
                      {item.selesai}
                    </span>

                    <div className="col-span-2 border-t border-gray-200 my-1 border-dashed"></div>

                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Package className="w-3 h-3" /> TBS Total:
                    </span>
                    <span className="font-bold text-[#B5302D] text-right">
                      {item.tbs} Ton
                    </span>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center gap-2 bg-[#FFFDFB] p-2 rounded border border-gray-200 border-dashed group cursor-pointer hover:border-[#B5302D]/30 transition-colors">
                      <Barcode className="w-4 h-4 text-gray-400 group-hover:text-[#B5302D]" />
                      <span className="font-mono text-xs font-semibold text-gray-500 truncate group-hover:text-gray-700">
                        {item.barcode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}