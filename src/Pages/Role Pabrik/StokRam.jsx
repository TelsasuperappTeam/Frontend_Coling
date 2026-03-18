import React, { useState } from "react";
import { Database, History, AlertCircle } from "lucide-react";

export default function StokRam() {
  const [kapasitas] = useState({
    total: 500,
    terpakai: 320,
  });

  const [activeStock] = useState([
    {
      id: 1,
      waktu: "24 Okt 2025, 08:30",
      resi: "TBS-2025-001",
      kebun: "Kebun Sawit A",
      sisa: 1500,
      status: "Masih Digunakan",
    },
    {
      id: 2,
      waktu: "24 Okt 2025, 09:15",
      resi: "TBS-2025-002",
      kebun: "Kebun Mitra B",
      sisa: 2000,
      status: "Masih Digunakan",
    },
  ]);

  const [historyStock] = useState([
    {
      id: 1,
      waktu: "23 Okt 2025, 14:00",
      resi: "TBS-2025-089",
      kebun: "Kebun Sawit A",
      sisa: 0,
      status: "Selesai",
    },
    {
      id: 2,
      waktu: "23 Okt 2025, 10:20",
      resi: "TBS-2025-088",
      kebun: "Kebun Plasma C",
      sisa: 0,
      status: "Selesai",
    },
  ]);

  // Kolom Tabel
  const columns = [
    "No",
    "Waktu Masuk",
    "No Resi",
    "Nama Kebun",
    "Sisa Stock (Kg)",
    "Status",
  ];

  return (
    <div className="p-4 sm:p-10 bg-[#FFFDFB] min-h-screen text-gray-800 font-sans">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl shadow-sm">
            <Database className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#B5302D]">Stok Ram</h1>
          </div>
        </div>
      </div>

      <div>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed">
          Menampilkan stok TBS di RAM yang tercatat otomatis oleh sistem dan
          pabrik hanya dapat melihat saja, dikelola dengan metode FIFO (First
          In, First Out) , dan tersimpan sebagai riwayat untuk audit.
        </p>
      </div>

      {/* --- STATS CARD SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <StatsCard title="Total Kapasitas Ram (Ton)" value={kapasitas.total} />
        <StatsCard
          title="Kapasitas Ram Terpakai (Ton)"
          value={kapasitas.terpakai}
          isHighlighted={true}
        />
      </div>

      <div className="space-y-8 sm:space-y-10">
        {/* --- SECTION 1: MANAJEMEN STOK RAM (ACTIVE) --- */}
        <div className="space-y-3">
          <div className="px-1">
            <h2 className="text-lg font-bold text-[#B5302D] flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Manajemen Stok Ram
            </h2>
            <p className="text-xs text-gray-400">
              Daftar stok ram yang saat ini masih aktif.
            </p>
          </div>

          <TableSection columns={columns} data={activeStock} type="active" />
        </div>

        {/* --- SECTION 2: RIWAYAT STOCK RAM (HISTORY) --- */}
        <div className="space-y-3">
          <div className="px-1">
            <h2 className="text-lg font-bold text-[#B5302D] flex items-center gap-2">
              <History className="w-5 h-5" />
              Riwayat Stock Ram
            </h2>
            <p className="text-xs text-gray-400">
              Log audit stok ram yang telah selesai diproses.
            </p>
          </div>

          <TableSection columns={columns} data={historyStock} type="history" />
        </div>
      </div>
    </div>
  );
}

// ================= COMPONENT REUSABLE =================

function StatsCard({ title, value, isHighlighted }) {
  return (
    <div
      className={`border ${
        isHighlighted
          ? "border-green-300 bg-green-50"
          : "border-orange-300 bg-orange-50"
      } rounded-2xl p-5 sm:p-6 shadow-sm flex items-center justify-between`}
    >
      <div>
        <h4 className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          {title}
        </h4>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {value}
          </span>
          <span className="text-xs font-semibold text-gray-600">Ton</span>
        </div>
      </div>
    </div>
  );
}

function TableSection({ columns, data, type }) {
  const isDataEmpty = data.length === 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Container scroll horizontal */}
      <div className="overflow-x-auto w-full scrollbar-hide">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#EF8523] text-white">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap first:rounded-tl-lg last:rounded-tr-lg"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isDataEmpty ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-400 italic"
                >
                  Belum ada data tersedia.
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row.id}
                  // Menambahkan warna selang-seling (Zebra Striping) agar baris mudah dibaca saat discroll
                  className="even:bg-gray-50/60 hover:bg-orange-50/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-400 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-700 whitespace-nowrap">
                    {row.waktu}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded text-xs">
                      {row.resi}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600 whitespace-nowrap">
                    {row.kebun}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800 whitespace-nowrap">
                    {row.sisa.toLocaleString()}{" "}
                    <span className="text-gray-500 font-normal text-xs">
                      Kg
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={row.status} type={type} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer jumlah data */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 font-medium text-right">
        Menampilkan{" "}
        <span className="font-bold text-gray-800">{data.length}</span> data{" "}
        {type === "active" ? "aktif" : "riwayat"}
      </div>
    </div>
  );
}

// Helper untuk badge status
function StatusBadge({ status, type }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap ${
        type === "active"
          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
          : "bg-green-50 text-green-700 border-green-200"
      }`}
    >
      {status}
    </span>
  );
}
