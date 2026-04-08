import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Info,
  Package,
  History,
} from "lucide-react";

/**
 * Komponen SectionCard
 * Wrapper UI dengan style dekoratif (garis gradient di atas) dan shadow.
 * Digunakan untuk membungkus bagian konten utama agar konsisten.
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

const RiwayatPenjualan = () => {
  // State untuk mengontrol dropdown detail pada setiap item transaksi
  const [openDetail, setOpenDetail] = useState(null);

  // Data statis dihapus dan diubah menjadi array kosong agar mensimulasikan tampilan kosong.
  // Nantinya setDataPenjualan bisa digunakan untuk memasukkan data dari API/Backend.
  const [dataPenjualan] = useState([]);

  return (
    <div className="p-4 sm:p-10 min-h-screen font-sans">
      
      {/* ======================== HEADER HERO ============================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl shadow-sm border border-red-100 shrink-0">
            <History className="text-[#B5302D]" size={28} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#B5302D]">
              Riwayat Transaksi Penjualan
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Pantau rincian pengiriman dan status pembayaran transaksi TBS Anda.
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 mb-8" />

      {/* ======================== KONTEN DAFTAR TRANSAKSI ============================ */}
      <SectionCard title="Daftar Transaksi">
        <div className="animate-fadeIn">
          {/* Karena dataPenjualan.length sekarang 0, ini akan mengeksekusi tampilan kosong di bawah ini */}
          {dataPenjualan.length === 0 ? (
            // Tampilan jika data kosong
            <div className="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
              <History className="mx-auto mb-3 text-gray-400" size={32} />
              <p className="font-medium">Belum ada data transaksi.</p>
              <p className="text-xs text-gray-400 mt-1">Riwayat penjualan Anda akan muncul di sini.</p>
            </div>
          ) : (
            // Mapping data transaksi ke UI (Bagian ini dibiarkan persis seperti codingan Anda 
            // agar siap menerima dan menampilkan data dinamis dari backend)
            <div className="space-y-4">
              {dataPenjualan.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#B5302D]/30 transition-colors shadow-sm"
                >
                  {/* Header Item: Bagian yang diklik untuk membuka detail */}
                  <div
                    className={`relative p-4 sm:p-6 cursor-pointer transition-colors ${
                      openDetail === item.id ? "bg-red-50/30" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setOpenDetail(openDetail === item.id ? null : item.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            item.status === "Selesai" ? "bg-green-100 text-green-600" : "bg-orange-100 text-[#EF8523]"
                        }`}>
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{item.kebun} – {item.blok}</p>
                          <p className="text-xs font-medium text-gray-600">{item.petani} – {item.jumlah}t</p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                            <Calendar size={12} /> Panen: {item.tanggal}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${
                            item.status === "Selesai" ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"
                        }`}>
                          {item.status}
                        </span>
                        {openDetail === item.id ? <ChevronUp size={18} className="text-[#EF8523]" /> : <ChevronDown size={18} className="text-gray-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Detail Dropdown: Muncul ketika state openDetail sesuai dengan ID item */}
                  {openDetail === item.id && (
                    <div className="bg-gray-50/30 border-t border-gray-100 animate-slideDown">
                      <div className="p-4 border-b border-gray-50 flex items-center gap-2 bg-white/50 px-6">
                        <Info size={14} className="text-[#B5302D]" />
                        <h4 className="text-[#B5302D] font-bold text-[10px] uppercase tracking-widest">Informasi Lengkap</h4>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-12 text-sm">
                        {[
                          { label: "Asal Unit TBS", value: item.asal_unit },
                          { label: "Jenis Sawit", value: item.jenis_sawit },
                          { label: "Tanggal Tanam", value: item.tanggal_tanam },
                          { label: "Tanggal Panen", value: item.tanggal_panen },
                          { label: "Pabrik Pembeli", value: item.pabrik_pembeli },
                          { label: "Jumlah Pembelian", value: item.jumlah_pembelian },
                          { label: "Biaya Kirim", value: item.harga_pengiriman, color: "text-[#B5302D]" },
                          { label: "Tgl Pembayaran", value: item.tanggal_pembayaran },
                        ].map((detail, idx) => (
                          <div key={idx}>
                            <label className="text-[9px] text-gray-400 uppercase tracking-widest font-extrabold block mb-1">
                              {detail.label}
                            </label>
                            <p className={`font-bold ${detail.color || "text-gray-800"}`}>{detail.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
};

export default RiwayatPenjualan;