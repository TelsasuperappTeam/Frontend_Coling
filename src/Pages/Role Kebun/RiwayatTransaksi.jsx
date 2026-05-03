import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  History,
  CheckCircle2,
  MapPin,
  Calendar,
  Info,
  ClipboardList,
} from "lucide-react";
import { API_ENDPOINTS } from "../../config/constants";

const RiwayatTransaksi = () => {
  const [riwayatSelesai, setRiwayatSelesai] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDetailId, setOpenDetailId] = useState(null);

  // --- FUNGSI AMBIL DATA RIWAYAT SELESAI ---
  const fetchRiwayatSelesai = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      // MENGGUNAKAN ENDPOINT TRACEABILITY DENGAN QUERY history=true
      // Asumsi: API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.GET_LIST
      // juga berlaku untuk melihat history pengiriman milik Kebun.
      // Sesuaikan URL ini jika Kebun memiliki endpoint list-nya sendiri di backend (misal: TRACEABILITY.KEBUN.GET_PENGIRIMAN)
      const response = await fetch(
        `${API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.GET_LIST}?is_history=true`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();

      // Tambahkan console log untuk melihat struktur data dari endpoint history
      console.log("=== DATA HISTORY TRACEABILITY (KEBUN) ===", data);

      if (response.ok) {
        // Karena endpoint sudah mengembalikan history (selesai/ditolak),
        // kita hanya perlu memfilter yang statusnya benar-benar "terima" (Selesai Sukses)
        const dataSelesai = data.filter(
          (item) =>
            item.progress_db === "terima" ||
            item.status_permintaan === "diterima",
        );
        setRiwayatSelesai(dataSelesai);
      } else {
        console.error("Backend mengembalikan error:", data);
      }
    } catch (error) {
      console.error("Gagal memuat riwayat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayatSelesai();
  }, []);

  const toggleDetail = (id) => {
    setOpenDetailId(openDetailId === id ? null : id);
  };

  return (
    <div className="space-y-6 p-4 md:p-8 min-h-screen font-sans bg-gray-50/30">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <History className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Riwayat Transaksi
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Rekapitulasi riwayat pemeriksaan dan transaksi yang telah selesai.
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* BANNER INFO */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
        <Info className="text-blue-500 shrink-0" size={20} />
        <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
          Halaman ini menampilkan seluruh data transaksi yang telah{" "}
          <strong>selesai diproses oleh pabrik</strong>, termasuk hasil
          pemeriksaan akhir dan potongan.
        </p>
      </div>

      {/* LIST KONTEN RIWAYAT */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            Memuat riwayat...
          </div>
        ) : riwayatSelesai.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm bg-white rounded-xl border border-dashed border-gray-300">
            Belum ada riwayat transaksi yang selesai.
          </div>
        ) : (
          riwayatSelesai.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all"
            >
              <div
                onClick={() => toggleDetail(item.id)}
                className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">
                      {item.nama_pabrik_tujuan || "Transaksi Pabrik"}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium">
                      {item.nama_grup} •{" "}
                      {item.estimasi_total_tbs_grup_kg / 1000} Ton
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right flex flex-col sm:items-end gap-1">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                      Status Akhir
                    </p>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700">
                      Selesai
                    </span>
                  </div>
                  <button className="py-1.5 px-4 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                    {openDetailId === item.id ? "Tutup" : "Lihat Nota"}
                    {openDetailId === item.id ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>
                </div>
              </div>

              {/* DETAIL HASIL PEMERIKSAAN (REKAPITULASI) */}
              {openDetailId === item.id && (
                <div className="border-t border-gray-100 bg-white animate-fadeIn">
                  <div className="p-5 bg-gray-50/50">
                    <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <ClipboardList size={14} /> Rekapitulasi Riwayat
                      Pemeriksaan
                    </h5>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* INFORMASI DASAR */}
                      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <label className="text-[10px] text-gray-400 font-bold block uppercase">
                          Tanggal Kirim
                        </label>
                        <p className="font-bold text-gray-800 text-sm">
                          {new Date(
                            item.tanggal_rencana_panen,
                          ).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <label className="text-[10px] text-gray-400 font-bold block uppercase">
                          Jenis Sawit
                        </label>
                        <p className="font-bold text-gray-800 text-sm">
                          {item.jenis_varietas_gabungan}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                        <label className="text-[10px] text-green-600 font-bold block uppercase">
                          Netto Akhir (Kg)
                        </label>
                        <p className="font-black text-green-700 text-sm">
                          {item.estimasi_total_tbs_grup_kg.toLocaleString(
                            "id-ID",
                          )}{" "}
                          Kg
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                        <label className="text-[10px] text-red-500 font-bold block uppercase">
                          Total Potongan
                        </label>
                        <p className="font-black text-red-600 text-sm">0 %</p>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                      <label className="text-[10px] text-gray-400 font-bold block uppercase mb-2 tracking-widest">
                        Informasi Penjemputan & Lokasi
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-start gap-2 flex-1">
                          <MapPin
                            className="text-orange-500 shrink-0"
                            size={16}
                          />
                          <p className="text-xs text-gray-600 leading-relaxed italic">
                            {item.alamat_pickup_teks}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-gray-100 px-3 py-2 rounded-lg">
                          <Calendar size={14} />
                          Usia Pohon: {item.usia_pohon_range}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RiwayatTransaksi;
