import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Database, History, Loader2 } from "lucide-react";

import { API_ENDPOINTS } from "../../config/constants.js";
import { showToast } from "../../utils/notif";

export default function StokRam() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // State untuk Data Kapasitas Atas
  const [kapasitas, setKapasitas] = useState({
    total: 0,
    terpakai: 0,
  });

  // State untuk Tabel Bawah
  const [activeStock, setActiveStock] = useState([]);

  // --- FETCH DATA DARI BACKEND ---
  const fetchStokRam = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = API_ENDPOINTS.TRACEABILITY.PABRIK.STOK_RAM;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data Stok RAM dari Sistem");
      }

      const data = await response.json();

      // CONSOLE LOG UNTUK MELIHAT RESPON BE
      console.log("=== DATA STOK RAM DARI BE ===", data);

      // 1. Set Kapasitas (Konversi dari Kg ke Ton dengan dibagi 1000)
      setKapasitas({
        total: (data.kuota_kapasitas_kg || 0) / 1000,
        terpakai: (data.total_sisa_stok_tbs || 0) / 1000,
      });

      // 2. Pemilahan Data Tabel (Aktif vs Histori)
      const listData = data.list_stok || [];

      const formatWaktu = (isoString) => {
        const date = new Date(isoString);
        return date
          .toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
          .replace(/\./g, ":"); // mengubah 08.30 menjadi 08:30
      };

      // MAPPING DATA AKTIF (Sisa stok > 0) -> SORTING ASC (Terlama di Atas untuk FIFO)
      const aktif = listData
        .filter((item) => item.sisa_stok_tbs > 0)
        .sort((a, b) => new Date(a.tanggal_masuk) - new Date(b.tanggal_masuk)) // Tambahan proteksi sorting
        .map((item) => ({
          id: item.id,
          waktu: formatWaktu(item.tanggal_masuk),
          resi: item.no_resi_pengiriman,
          kebun: item.nama_kebun,
          sisa: item.sisa_stok_tbs,
          status: item.status_stok || "TERSEDIA",
        }));

      setActiveStock(aktif);
    } catch (error) {
      console.error("Error fetching Stok RAM:", error);
      showToast.error("Gagal memuat data Stok RAM. Periksa koneksi Anda.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Panggil API saat komponen pertama kali dimuat
  useEffect(() => {
    fetchStokRam();
  }, [fetchStokRam]);

  // Kolom Tabel
  const columns = [
    "No",
    "Waktu Masuk",
    "No Resi",
    "Nama Kebun",
    "Sisa Stock (Kg)",
    "Status",
  ];

  // Kalkulasi Persentase Kapasitas Terpakai
  const persentaseTerpakai =
    kapasitas.total > 0 ? (kapasitas.terpakai / kapasitas.total) * 100 : 0;

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans">
{/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">
        
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl shadow-sm border border-red-100 shrink-0">
            <Database className="text-[#B5302D]" size={28} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#B5302D]">
              Stok Ram
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Pantau kapasitas dan daftar stok TBS yang tersedia untuk
              diproduksi.
            </p>
          </div>
        </div>

        {/* KOTAK PENGINGAT (Dioptimalkan untuk Mobile) */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4 bg-white border border-[#EF8523]/30 p-1.5 sm:pr-2.5 rounded-full shadow-[0_0_15px_rgba(239,133,35,0.15)] animate-pulse hover:animate-none transition-all w-full lg:w-auto lg:ml-auto">
          
          {/* Grup Ikon & Teks di Kiri */}
          <div className="flex items-center gap-2 sm:gap-3 pl-0.5 sm:pl-0">
            <div className="bg-gradient-to-br from-[#EF8523] to-[#d9751d] p-1.5 sm:p-2 rounded-full text-white shrink-0 shadow-sm">
              <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-700 leading-tight whitespace-nowrap">
              Silahkan <br className="hidden sm:block" />
              <span className="text-[#EF8523] font-black sm:ml-0 ml-1">Proses Produksi</span>
            </p>
          </div>

          {/* Tombol Aksi di Kanan */}
          <button
            onClick={() => navigate("/pabrik/produksi")}
            className="bg-[#EF8523] hover:bg-[#d9751d] active:scale-95 text-white px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5 whitespace-nowrap"
          >
            Klik &rarr;
          </button>
        </div>
      </div>

      {/* --- GARIS PEMBATAS --- */}
      <hr className="border-gray-200 mb-7" />

      <div>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed">
          Menampilkan stok TBS di RAM yang tercatat otomatis oleh sistem dan
          pabrik hanya dapat melihat saja, dikelola dengan metode FIFO (First
          In, First Out), dan tersimpan sebagai riwayat untuk audit.
        </p>
      </div>

      {/* --- SECTION CARD KAPASITAS (SEKARANG SELALU TAMPIL) --- */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 mb-8 sm:mb-10 flex flex-col xl:flex-row items-center gap-4 sm:gap-6">
        {/* Bagian Kiri: Teks & Angka (Semuanya 1 Baris) */}
        <div className="flex flex-row items-center justify-between xl:justify-start w-full xl:w-auto shrink-0 xl:pr-4 xl:border-r border-gray-100 gap-3">
          <h4 className="text-[10px] sm:text-xs font-bold text-black uppercase tracking-widest shrink-0">
            Kapasitas RAM:
          </h4>
          <div className="flex items-baseline gap-1 shrink-0">
            <span className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {kapasitas.terpakai.toLocaleString("id-ID")}
            </span>
            <span className="text-xs sm:text-sm font-medium text-gray-400">
              / {kapasitas.total.toLocaleString("id-ID")}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-gray-400 ml-0.5">
              Ton
            </span>
          </div>
        </div>

        {/* Bagian Kanan: Progress Bar & Badge */}
        <div className="flex-1 w-full flex items-center gap-3 sm:gap-4">
          {/* Progress Bar Indikator */}
          <div className="flex-1 bg-gray-100 rounded-full h-2 sm:h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#EF8523] to-[#B5302D] h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(persentaseTerpakai, 100)}%` }}
            ></div>
          </div>

          {/* Badge Persentase */}
          <span className="shrink-0 inline-flex items-center bg-red-50 text-[#B5302D] border border-red-100 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-sm">
            {persentaseTerpakai.toFixed(1)}% Terisi
          </span>
        </div>
      </div>

      <div className="space-y-8 sm:space-y-10">
        {/* --- SECTION 1: MANAJEMEN STOK RAM (ACTIVE) --- */}
        <div className="space-y-3">
          <div className="px-1">
            <h2 className="text-lg font-bold text-[#B5302D]">
              Manajemen Stok Ram
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Daftar stok ram yang saat ini masih aktif dan tersedia untuk
              diproduksi.
            </p>
          </div>

          <TableSection
            columns={columns}
            data={activeStock}
            type="active"
            isLoading={isLoading}
          />
        </div>

      </div>
    </div>
  );
}

// ================= COMPONENT REUSABLE =================

function TableSection({ columns, data, type, isLoading }) {
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
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-400 font-bold"
                >
                  Memuat data ...
                </td>
              </tr>
            ) : isDataEmpty ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-400 font-bold "
                >
                  Belum ada data.
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
                    {row.sisa.toLocaleString("id-ID")}{" "}
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
  // Membersihkan underscore pada status agar lebih mudah dibaca (misal: MASIH_DIGUNAKAN jadi MASIH DIGUNAKAN)
  const cleanStatus = status.replace(/_/g, " ");

  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap ${
        type === "active"
          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
          : "bg-green-50 text-green-700 border-green-200"
      }`}
    >
      {cleanStatus}
    </span>
  );
}
