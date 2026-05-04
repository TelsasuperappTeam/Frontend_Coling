import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  History,
  CheckCircle2,
  MapPin,
  Calendar,
  Info,
  User,
  Hash,
  Truck,
  Upload,
  FileText,
  Phone,
} from "lucide-react";
import { API_ENDPOINTS, getFileUrl } from "../../config/constants";

const RiwayatTransaksi = () => {
  const [riwayatSelesai, setRiwayatSelesai] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Fungsi toggle rincian card
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // --- FUNGSI AMBIL DATA RIWAYAT SELESAI & DITOLAK ---
  const fetchRiwayatSelesai = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const urlBase = API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.GET_LIST;

      // Panggil dua endpoint sekaligus untuk memastikan tidak ada data yang terlewat[cite: 16]
      const [resAktif, resHistori] = await Promise.all([
        fetch(`${urlBase}?is_history=false`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${urlBase}?is_history=true`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let dataAktif = [];
      let dataHistori = [];

      if (resAktif.ok) dataAktif = await resAktif.json();
      if (resHistori.ok) dataHistori = await resHistori.json();

      // Gabungkan semua data
      const combinedData = [...dataAktif, ...dataHistori];

      console.log(
        "=== SEMUA DATA TRACEABILITY SEBELUM FILTER (KEBUN) ===",
        combinedData,
      );

      // --- LOGIKA FILTER UTAMA ---
      // Tampilkan HANYA jika:
      // 1. Pemeriksaan SUDAH ADA nilainya (artinya sudah selesai ditimbang pabrik)
      // 2. ATAU Status permintaannya adalah "ditolak" (batal oleh mitra)
      const dataSelesai = combinedData.filter((item) => {
        const isSelesaiPabrik =
          item.pemeriksaan !== null && item.pemeriksaan !== undefined;
        const isDitolakMitra =
          item.status_permintaan?.toLowerCase() === "ditolak";

        return isSelesaiPabrik || isDitolakMitra;
      });

      // Urutkan dari yang terbaru
      setRiwayatSelesai(dataSelesai.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Gagal memuat riwayat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayatSelesai();
  }, []);

  return (
    <div className="p-4 sm:p-8 md:p-10 min-h-screen font-sans text-gray-800">
      {/* HEADER HERO */}
      <div className="flex flex-col lg:flex-row md:items-center justify-between gap-5 mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-red-50 rounded-xl sm:rounded-2xl shrink-0">
            <History className="w-6 h-6 sm:w-8 sm:h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D] leading-tight">
              Riwayat Transaksi
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Rekapitulasi riwayat pemeriksaan dan transaksi yang telah selesai
              atau ditolak.
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 mb-6 sm:mb-8" />

      {/* LIST KONTEN RIWAYAT */}
      <SectionCard title="Daftar Riwayat Transaksi">
        {isLoading ? (
          <div className="text-center py-10 text-gray-400 text-sm animate-pulse">
            Memuat riwayat transaksi...
          </div>
        ) : riwayatSelesai.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
            <History className="mx-auto mb-3 text-gray-400" size={32} />
            <p className="font-medium">
              Belum ada riwayat transaksi yang selesai atau ditolak.
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {riwayatSelesai.map((item) => {
              const statusPermintaan = (
                item.status_permintaan || ""
              ).toLowerCase();
              const isExpanded = expandedId === item.id;

              // === TAMBAHKAN KODE INI UNTUK MENGATASI ERROR ESLINT ===
              const rawProgress = item.progress_db || "menunggu_pengiriman";
              const pDB = rawProgress.toLowerCase().replace(/\s+/g, "_");

              let label = "Selesai";
              if (statusPermintaan === "ditolak") {
                label = "Ditolak Mitra";
              } else if (item.pemeriksaan) {
                label = "Selesai (Ditimbang)";
              } else {
                label = item.progress_publik || "Dalam Perjalanan";
              }

              // ==========================================================
              // RENDER KARTU KHUSUS JIKA STATUS DITOLAK
              // ==========================================================
              if (statusPermintaan === "ditolak") {
                return (
                  <MainCard key={item.id}>
                    {/* --- HEADER DITOLAK (RINGKAS) --- */}
                    <div
                      className="flex flex-col md:flex-row justify-between gap-0 sm:gap-4 cursor-pointer w-full"
                      onClick={() => toggleExpand(item.id)}
                    >
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-100 pb-4">
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="p-2 sm:p-2.5 bg-red-50 rounded-xl border border-red-100 shrink-0 mt-1 sm:mt-0">
                              <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#B5302D]" />
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                                Asal Kebun / Mandor
                              </p>
                              <p className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                                {item.nama_gapoktan || "Data Transaksi Anda"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center sm:block justify-between bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none w-full sm:w-auto mt-1 sm:mt-0">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider sm:mb-1">
                              Rencana Panen
                            </p>
                            <p className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1.5 bg-white sm:bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                              <Calendar className="w-3.5 h-3.5 shrink-0" />
                              {item.tanggal_rencana_panen
                                ? new Date(
                                    item.tanggal_rencana_panen,
                                  ).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center md:items-end gap-3 mt-5 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4 min-w-full md:min-w-[120px]">
                        <span className="px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase flex items-center justify-center gap-1.5 w-full md:w-auto bg-red-50 text-red-700 border-red-100 border">
                          Ditolak Mitra
                        </span>

                        <div className="flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 group-hover:bg-gray-50 transition-all shadow-sm w-full md:w-auto">
                          <span>
                            {isExpanded ? "Tutup Rincian" : "Lihat Rincian"}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#B5302D]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* --- DETAIL DITOLAK (DROPDOWN) --- */}
                    {isExpanded && (
                      <div className="mt-5 sm:mt-8 pt-5 sm:pt-8 border-t border-gray-100 space-y-6 animate-in fade-in slide-in-from-top-2">
                        {/* Box Alasan Penolakan */}
                        <div className="bg-red-50 p-4 sm:p-5 rounded-2xl border border-red-100 flex items-start gap-3 shadow-sm">
                          <div className="p-2 bg-red-100 rounded-xl shrink-0">
                            <Info className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-[11px] sm:text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                              Alasan Penolakan Mitra:
                            </p>
                            <p className="text-xs sm:text-sm text-red-800 font-medium italic leading-relaxed">
                              "
                              {item.catatan_penolakan ||
                                "Tidak ada alasan spesifik yang diberikan oleh mitra logistik."}
                              "
                            </p>
                          </div>
                        </div>

                        {/* Info Rute & Muatan */}
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
                          <h4 className="text-[10px] sm:text-[11px] font-bold text-[#B5302D] uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">
                            Detail Pengajuan Awal
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">
                                Est. Muatan
                              </p>
                              <p className="text-sm font-extrabold text-[#B5302D]">
                                {item.estimasi_total_tbs_grup_kg
                                  ? `${(item.estimasi_total_tbs_grup_kg / 1000).toFixed(2)} Ton`
                                  : "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-orange-500" />{" "}
                                Titik Jemput
                              </p>
                              <p className="text-xs sm:text-sm font-medium text-gray-700 leading-snug">
                                {item.alamat_pickup_teks ||
                                  "Alamat penjemputan tidak tersedia."}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-[#B5302D]" />{" "}
                                Pabrik Tujuan
                              </p>
                              <p className="text-xs sm:text-sm font-medium text-gray-700 leading-snug">
                                {item.alamat_pengiriman_pabrik ||
                                  "Pabrik tujuan tidak tersedia."}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-gray-100">
                          <button
                            onClick={() => toggleExpand(null)}
                            className="w-full sm:w-auto px-8 py-3 bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-300 transition-all"
                          >
                            Tutup Rincian
                          </button>
                        </div>
                      </div>
                    )}
                  </MainCard>
                );
              }

              // ==========================================================
              // RENDER KARTU STANDAR JIKA STATUS DITERIMA / SELESAI
              // ==========================================================
              return (
                <MainCard key={item.id}>
                  {/* --- DATA RINGKAS (SELALU MUNCUL DI AWAL) --- */}
                  <div
                    className="flex flex-col md:flex-row justify-between gap-0 sm:gap-4 cursor-pointer w-full"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="flex-1 w-full">
                      {/* Baris 1: Nama Kebun & Resi */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-100 pb-4">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="p-2 sm:p-2.5 bg-red-50 rounded-xl border border-red-100 shrink-0 mt-1 sm:mt-0">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#B5302D]" />
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                              Asal Kebun
                            </p>
                            <p className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                              {item.nama_gapoktan || "Data Transaksi Anda"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center sm:block justify-between bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none w-full sm:w-auto mt-1 sm:mt-0">
                          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider sm:mb-1">
                            No. Resi
                          </p>
                          <p className="text-xs sm:text-sm font-mono font-bold text-gray-700 bg-white sm:bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                            {item.kode_resi || "-"}
                          </p>
                        </div>
                      </div>

                      {/* Baris 2: Detail Utama Ringkas */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mt-4">
                        <div className="col-span-2 sm:col-span-1 md:col-span-3 lg:col-span-1">
                          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Pabrik Tujuan
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed line-clamp-2">
                            {item.alamat_pengiriman_pabrik || "-"}
                          </p>
                        </div>
                        <div className="col-span-1">
                          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Tiba di Pabrik
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-blue-600 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            {item.tanggal_permintaan_sampai || "-"}
                          </p>
                        </div>
                        <div className="col-span-1">
                          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Biaya Kirim
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-green-500">
                            Rp {(item.biaya_final || 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Lihat Rincian di Kanan */}
                    <div className="flex flex-col items-center justify-center md:items-end gap-3 mt-5 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4 min-w-full md:min-w-[120px]">
                      {/* Badge Selesai */}
                      <span className="px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase flex items-center justify-center gap-1.5 w-full md:w-auto bg-green-50 text-green-700 border-green-100 border">
                        Selesai
                      </span>

                      <div className="flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 group-hover:bg-gray-50 transition-all shadow-sm w-full md:w-auto">
                        <span>
                          {isExpanded ? "Tutup Rincian" : "Lihat Rincian"}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#B5302D]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* --- DATA DETAIL & HASIL PEMERIKSAAN (MUNCUL SAAT DI KLIK) --- */}
                  {isExpanded && (
                    <div className="mt-5 sm:mt-8 pt-5 sm:pt-8 border-t border-gray-100 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-top-2">
                      {/* BOX HIJAU: INFO HASIL TIMBANGAN & PEMERIKSAAN */}
                      {item.pemeriksaan ? (
                        <div className="bg-green-50/40 border border-green-200 rounded-xl p-3 sm:p-5 shadow-sm">
                          {/* Header Box Hijau */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-green-200/50 pb-3 mb-4 gap-2">
                            <h4 className="text-[11px] sm:text-xs font-extrabold text-green-800 uppercase flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span>Hasil Pemeriksaan & Nota Akhir</span>
                            </h4>
                            {/* Harga Snapshot */}
                            {item.pemeriksaan.harga_beli_per_kg_snapshot >
                              0 && (
                              <span className="bg-green-100 text-green-800 text-[9px] sm:text-[10px] font-bold px-2.5 py-1.5 rounded-md border border-green-200 w-fit">
                                Harga Dasar: Rp{" "}
                                {item.pemeriksaan.harga_beli_per_kg_snapshot.toLocaleString(
                                  "id-ID",
                                )}{" "}
                                / Kg
                              </span>
                            )}
                          </div>

                          {/* Detail Berat & Potongan (Ramping) */}
                          <div className="flex flex-col gap-2">
                            {/* --- INFO TANGGAL TIMBANG --- */}
                            <div className="flex justify-between items-center bg-white px-3 py-2.5 rounded-lg border border-gray-100">
                              <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                Tanggal Timbang
                              </p>
                              <p className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                {item.pemeriksaan.created_at
                                  ? new Date(
                                      item.pemeriksaan.created_at,
                                    ).toLocaleDateString("id-ID", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "-"}
                              </p>
                            </div>

                            <div className="flex justify-between items-center bg-white px-3 py-2.5 rounded-lg border border-gray-100">
                              <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                Berat Bruto
                              </p>
                              <p className="text-xs sm:text-sm font-black text-gray-900">
                                {item.pemeriksaan.bruto?.toLocaleString(
                                  "id-ID",
                                ) || 0}{" "}
                                <span className="text-[9px] font-bold text-gray-400">
                                  Kg
                                </span>
                              </p>
                            </div>

                            <div className="flex justify-between items-center bg-white px-3 py-2.5 rounded-lg border border-gray-100">
                              <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                Total Potongan Sortasi
                              </p>
                              <p className="text-xs sm:text-sm font-black text-red-600">
                                {item.pemeriksaan.total_potongan?.toLocaleString(
                                  "id-ID",
                                ) || 0}{" "}
                                <span className="text-[9px] font-bold text-red-400">
                                  Kg
                                </span>
                              </p>
                            </div>

                            <div className="flex justify-between items-center bg-white px-3 py-2.5 rounded-lg border border-green-200 ring-1 ring-green-50 shadow-sm">
                              <p className="text-[9px] sm:text-[10px] text-green-700 font-bold uppercase tracking-wider">
                                Netto Bersih
                              </p>
                              <p className="text-sm sm:text-base font-black text-green-700">
                                {item.pemeriksaan.final_weigh?.toLocaleString(
                                  "id-ID",
                                ) ||
                                  item.pemeriksaan.netto?.toLocaleString(
                                    "id-ID",
                                  ) ||
                                  0}{" "}
                                <span className="text-[9px] font-bold text-green-600/70">
                                  Kg
                                </span>
                              </p>
                            </div>

                            <div className="flex justify-between items-center bg-gradient-to-r from-green-600 to-emerald-700 px-4 py-3 rounded-xl shadow-sm text-white mt-1.5">
                              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-green-100">
                                Total Harga Diterima
                              </p>
                              <p className="text-base sm:text-lg font-black tracking-tight">
                                <span className="text-[10px] font-medium mr-1">
                                  Rp
                                </span>
                                {item.pemeriksaan.harga_final?.toLocaleString(
                                  "id-ID",
                                ) || 0}
                              </p>
                            </div>
                          </div>

                          {/* Catatan & Dokumen */}
                          {(item.pemeriksaan.catatan ||
                            item.pemeriksaan.dokumen_nota_url) && (
                            <div className="mt-4 flex flex-col gap-3 border-t border-green-200/50 pt-4">
                              {item.pemeriksaan.catatan && (
                                <div className="bg-white/60 p-3 rounded-lg border border-green-100">
                                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 shrink-0" />{" "}
                                    Catatan Pabrik
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-gray-700 font-medium italic leading-relaxed">
                                    "{item.pemeriksaan.catatan}"
                                  </p>
                                </div>
                              )}

                              {item.pemeriksaan.dokumen_nota_url && (
                                <div className="bg-white/60 p-3 rounded-lg border border-green-100 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Upload className="w-4 h-4 text-gray-500 shrink-0" />
                                    <p className="text-[10px] sm:text-xs text-gray-600 font-bold uppercase tracking-wider truncate">
                                      Unduh Nota Timbangan Resmi
                                    </p>
                                  </div>
                                  <a
                                    href={getFileUrl(
                                      item.pemeriksaan.dokumen_nota_url,
                                      "TRACEABILITY",
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center bg-blue-50 text-blue-600 px-3 py-1.5 rounded border border-blue-100 hover:bg-blue-100 transition-colors shrink-0"
                                  >
                                    <span className="text-[10px] font-bold whitespace-nowrap">
                                      Lihat Nota &rarr;
                                    </span>
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl text-xs font-semibold text-center border border-yellow-200">
                          Data pemeriksaan belum tersedia atau sedang diproses.
                        </div>
                      )}

                      {/* GRID DETAIL INFORMASI LENGKAP */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* 1. Info Transaksi */}
                        <div className="flex flex-col gap-3 sm:gap-4">
                          <h4 className="text-[11px] sm:text-xs font-bold text-[#B5302D] uppercase flex items-center gap-2">
                            <Hash className="w-4 h-4" /> Informasi Transaksi
                          </h4>
                          <div className="flex-1 flex flex-col justify-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 text-xs sm:text-sm shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">No Resi:</span>
                              <span className="font-bold font-mono text-gray-700">
                                {item.kode_resi || "-"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">
                                Tanggal Keberangkatan:
                              </span>
                              <span className="font-bold text-right">
                                {item.tanggal_keberangkatan || "-"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">
                                Tanggal Tiba:
                              </span>
                              <span className="font-bold text-right">
                                {item.tanggal_permintaan_sampai || "-"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">
                                Muatan (Est):
                              </span>
                              <span className="font-bold text-right">
                                {item.estimasi_total_tbs_grup_kg
                                  ? `${(item.estimasi_total_tbs_grup_kg / 1000).toFixed(2)} Ton`
                                  : "-"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-50">
                              <span className="text-gray-500">
                                Biaya Pengiriman:
                              </span>
                              <span className="font-extrabold text-[#B5302D] text-sm">
                                Rp{" "}
                                {(item.biaya_final || 0).toLocaleString(
                                  "id-ID",
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 2. Armada & Supir */}
                        <div className="flex flex-col gap-3 sm:gap-4">
                          <h4 className="text-[11px] sm:text-xs font-bold text-[#B5302D] uppercase flex items-center gap-2">
                            <Truck className="w-4 h-4" /> Armada & Supir
                          </h4>
                          <div className="flex-1 flex flex-col gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 text-xs sm:text-sm shadow-sm">
                            <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
                              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 shrink-0">
                                <User className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 truncate">
                                  {item.kru?.nama_supir || "-"}
                                </p>
                                <p className="text-[10px] sm:text-xs text-blue-600 font-bold flex items-center gap-1.5 mt-0.5 truncate">
                                  <Phone className="w-3 h-3 shrink-0" />{" "}
                                  {item.kru?.nomor_telepon || "-"}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2.5 pt-1">
                              <p className="text-gray-500">Kendaraan</p>
                              <p className="font-semibold text-right">
                                {item.kendaraan?.jenis_kendaraan_nama || "-"}
                              </p>

                              <p className="text-gray-500">Kapasitas</p>
                              <p className="font-semibold text-right">
                                {item.kendaraan?.kapasitas_angkut_kg
                                  ? `${item.kendaraan.kapasitas_angkut_kg.toLocaleString("id-ID")} Kg`
                                  : "-"}
                              </p>

                              <p className="text-gray-500">Biaya / KM</p>
                              <p className="font-semibold text-right">
                                {item.kendaraan?.biaya_per_km
                                  ? `Rp ${item.kendaraan.biaya_per_km.toLocaleString("id-ID")}`
                                  : "-"}
                              </p>

                              <p className="text-gray-500 pt-2 border-t border-gray-50">
                                Tipe
                              </p>
                              <p className="font-semibold text-right pt-2 border-t border-gray-50">
                                {item.kendaraan?.nama_kendaraan || "-"}
                              </p>

                              <p className="text-gray-500">Plat</p>
                              <p className="font-bold text-blue-600 text-right uppercase tracking-wider">
                                {item.kendaraan?.plat_kendaraan || "-"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 3. Rute & Estimasi */}
                        <div className="flex flex-col gap-3 sm:gap-4">
                          <h4 className="text-[11px] sm:text-xs font-bold text-[#B5302D] uppercase flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Rute & Estimasi
                          </h4>
                          <div className="flex-1 flex flex-col justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 text-xs sm:text-sm shadow-sm">
                            <div className="flex flex-col gap-4">
                              <div className="relative pl-4 border-l-2 border-dashed border-gray-200">
                                <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-orange-400 border-2 border-white" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                                  Dari: Kebun
                                </p>
                                <p className="font-medium text-gray-700 leading-snug">
                                  {item.alamat_pickup_teks || "-"}
                                </p>
                              </div>
                              <div className="relative pl-4 border-l-2 border-dashed border-gray-200">
                                <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-[#B5302D] border-2 border-white" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                                  Ke: Pabrik
                                </p>
                                <p className="font-medium text-gray-700 leading-snug">
                                  {item.alamat_pengiriman_pabrik || "-"}
                                </p>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
                                  Est. Jarak
                                </p>
                                <p className="font-bold text-gray-900">
                                  {item.estimasi_jarak_km
                                    ? `${item.estimasi_jarak_km} KM`
                                    : "-"}
                                </p>
                              </div>
                              <div
                                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase text-center ${pDB === "terima" ? "bg-green-50 text-green-600 border border-green-100" : "bg-orange-50 text-[#EF8523] border border-orange-100"}`}
                              >
                                {item.progress_publik || label}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tombol Tutup Bawah */}
                      <div className="flex justify-end pt-5 sm:pt-6 mt-2 border-t border-gray-100">
                        <button
                          onClick={() => toggleExpand(null)}
                          className="w-full sm:w-auto px-8 py-3 bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-300 transition-all"
                        >
                          Tutup Rincian
                        </button>
                      </div>
                    </div>
                  )}
                </MainCard>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

/* --- KOMPONEN HELPER --- */
const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[24px] sm:rounded-[30px] border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8 relative overflow-hidden transition-all">
    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-90" />
    <h3 className="text-base sm:text-lg font-bold text-[#B5302D] mb-5 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

const MainCard = ({ children }) => (
  <div className="relative bg-white rounded-[20px] sm:rounded-[24px] border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 sm:p-6 overflow-hidden group">
    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#B5302D] opacity-0 group-hover:opacity-100 transition-opacity" />
    {children}
  </div>
);

export default RiwayatTransaksi;
