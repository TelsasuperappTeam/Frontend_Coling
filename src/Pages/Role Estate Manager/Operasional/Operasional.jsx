import React, { useState, useEffect } from "react";
import { ShoppingCart, Users, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
// Sesuaikan import config dengan struktur folder Anda
import { API_ENDPOINTS, API_BASE_URLS } from "../../../config/constants.js";

const Operasional = () => {
  const navigate = useNavigate();

  // -- STATE UNTUK TRANSAKSI (JUAL & PINJAM) --
  const [riwayatJual, setRiwayatJual] = useState([]);
  const [riwayatPinjam, setRiwayatPinjam] = useState([]);
  const [isLoadingTransaksi, setIsLoadingTransaksi] = useState(false);

  const fetchRiwayatTransaksi = async () => {
    setIsLoadingTransaksi(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const resJual = await fetch(API_ENDPOINTS.FARM.KEBUN.TRANSAKSI.JUAL, {
        method: "GET",
        headers,
      });
      if (resJual.ok) {
        const dataJual = await resJual.json();
        setRiwayatJual(dataJual);
      }

      const resPinjam = await fetch(
        API_ENDPOINTS.FARM.KEBUN.TRANSAKSI.PINJAMKAN,
        { method: "GET", headers },
      );
      if (resPinjam.ok) {
        const dataPinjam = await resPinjam.json();
        setRiwayatPinjam(dataPinjam);
      }
    } catch (error) {
      console.error("Error fetching riwayat transaksi:", error);
    } finally {
      setIsLoadingTransaksi(false);
    }
  };

  useEffect(() => {
    fetchRiwayatTransaksi();
  }, []);

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans relative">
      {/* HEADER & TAB SWITCHER */}
      <div className="flex flex-col lg:flex-row md:items-center justify-between gap-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <ClipboardList className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Manajemen Operasional
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Lihat riwayat penjualan barang dan peminjaman inventaris.
            </p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto">
          <button className="flex-1 flex justify-center items-center gap-1.5 sm:gap-2 px-1 sm:px-6 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all bg-white text-[#B5302D] shadow-sm">
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span className="leading-tight text-center">
              Penjualan/Peminjaman
            </span>
          </button>
          <button
            onClick={() =>
              navigate("/estate_manager/manajemenoperasional/organisasi")
            }
            className="flex-1 flex justify-center items-center gap-1.5 sm:gap-2 px-1 sm:px-6 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all text-gray-500 hover:bg-gray-200"
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="leading-tight text-center">Organisasi</span>
          </button>
        </div>
      </div>

      <hr className="border-gray-200 mb-6 sm:mb-8" />

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {/* SECTION 1 PENJUALAN BARANG */}
        <SectionCard title="Penjualan Barang">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs text-gray-500">
              Tabel riwayat penjualan barang ke petani/anggota.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EF8523] text-white text-[11px] uppercase tracking-wider">
                  <th className="p-4 font-bold rounded-tl-xl">No</th>
                  <th className="p-4 font-bold">Nama Petani</th>
                  <th className="p-4 font-bold">Tgl Pembelian</th>
                  <th className="p-4 font-bold">Jenis</th>
                  <th className="p-4 font-bold">Nama Barang</th>
                  <th className="p-4 font-bold">Jumlah</th>
                  <th className="p-4 font-bold">Total Harga</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-700 bg-white">
                {isLoadingTransaksi ? (
                  <tr>
                    <td colSpan="8" className="p-4 text-center">
                      Memuat data...
                    </td>
                  </tr>
                ) : riwayatJual.length > 0 ? (
                  riwayatJual.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                    >
                      <td className="p-4 font-bold text-center">{index + 1}</td>
                      <td className="p-4 font-medium">
                        {item.nama_petani || "Tidak Diketahui"}
                      </td>
                      <td className="p-4 text-gray-500">
                        {item.tanggal_pembelian}
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold text-gray-600">
                          {item.jenis_barang}
                        </span>
                      </td>
                      <td className="p-4 font-bold">
                        {item.nama_barang_tercatat}
                      </td>
                      <td className="p-4">{item.jumlah}</td>
                      <td className="p-4 font-bold text-[#B5302D]">
                        {item.total_harga
                          ? `Rp ${item.total_harga.toLocaleString("id-ID")}`
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-4 text-center">
                      Belum ada riwayat penjualan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* SECTION 2 PEMINJAMAN */}
        <SectionCard title="Peminjaman Inventaris">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs text-gray-500">
              Tabel riwayat peminjaman aset kebun.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EF8523] text-white text-[11px] uppercase tracking-wider">
                  <th className="p-4 font-bold rounded-tl-xl">No</th>
                  <th className="p-4 font-bold">Nama Peminjam</th>
                  <th className="p-4 font-bold">Tgl Pinjam</th>
                  <th className="p-4 font-bold">Nama Barang</th>
                  <th className="p-4 font-bold text-center">Jumlah Dipinjam</th>
                  <th className="p-4 font-bold text-center">Jumlah Kembali</th>
                  <th className="p-4 font-bold rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-700 bg-white">
                {isLoadingTransaksi ? (
                  <tr>
                    <td colSpan="7" className="p-4 text-center">
                      Memuat data...
                    </td>
                  </tr>
                ) : riwayatJual.length > 0 ? (
                  riwayatPinjam.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                    >
                      <td className="p-4 font-bold text-center">{index + 1}</td>
                      <td className="p-4 font-medium">
                        {item.nama_petani || "Tidak Diketahui"}
                      </td>
                      <td className="p-4 text-gray-500">
                        {item.tanggal_peminjaman}
                      </td>
                      <td className="p-4 font-bold">
                        {item.dinamis_peralatan?.nama_alat ||
                          item.dinamis_peralatan?.nama ||
                          "Alat"}
                      </td>
                      <td className="p-4 text-center font-bold text-orange-600">
                        {item.jumlah_dipinjam}
                      </td>
                      <td className="p-4 text-center font-bold text-green-600">
                        {item.jumlah_dikembalikan}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border ${item.status === "DIPINJAMKAN" || item.status === "DIPINJAM" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-green-50 text-green-700 border-green-200"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center">
                      Belum ada riwayat peminjaman.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

// HELPER COMPONENT (Tetap butuh di sini)
const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden group hover:shadow-md transition-all">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />
    <h3 className="text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

export default Operasional;
