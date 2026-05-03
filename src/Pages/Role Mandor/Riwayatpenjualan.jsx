import React, { useState, useEffect } from "react";
import {
  History,
  User,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Hash,
  Truck,
  Phone,
  MapPin,
  CheckCircle,
} from "lucide-react";
// Pastikan path konstanta Anda benar
import { API_ENDPOINTS } from "../../config/constants"; 

const Riwayatpenjualan = () => {
  // State untuk menyimpan data riwayat dari API
  const [dataPenjualan, setDataPenjualan] = useState([]);
  
  // State untuk indikator loading
  const [isLoading, setIsLoading] = useState(false);

  // --- FUNGSI AMBIL DATA API ---
  const fetchRiwayatLogistik = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Memanggil endpoint TRACEABILITY.LOGISTIK.MANAGEMENT.GET_LIST[cite: 12]
      const response = await fetch(API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.GET_LIST, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      // >>> CONSOLE LOG SESUAI PERMINTAAN <<<[cite: 12]
      console.log("=== DATA RIWAYAT LOGISTIK/PENJUALAN (MANDOR) ===", data);

      if (response.ok) {
        // Simpan data ke state jika berhasil[cite: 12]
        // Jika backend mengirimkan data ganda, kita bisa menambahkan .sort() seperti di file kebun
        setDataPenjualan(data.sort((a, b) => b.id - a.id));
      } else {
        console.error("Gagal mengambil data:", data);
      }
    } catch (error) {
      console.error("Error Fetch API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Jalankan fetch saat komponen pertama kali dimuat[cite: 12]
  useEffect(() => {
    fetchRiwayatLogistik();
  }, []);

  return (
    <div className="p-4 sm:p-10 min-h-screen font-sans">
      {/* HEADER HERO */}
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
              Pantau rincian pengiriman dan status transaksi TBS Anda.
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 mb-8" />

      {/* KONTEN DAFTAR TRANSAKSI */}
      <SectionCard title="Daftar Transaksi & Progres">
        <div className="animate-fadeIn space-y-4">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">
              <p className="font-medium animate-pulse">Memuat data riwayat...</p>
            </div>
          ) : dataPenjualan.length === 0 ? (
            <div className="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
              <History className="mx-auto mb-3 text-gray-400" size={32} />
              <p className="font-medium">Belum ada riwayat transaksi.</p>
              <p className="text-xs text-gray-400 mt-1">
                Riwayat penjualan Anda akan muncul di sini.
              </p>
            </div>
          ) : (
            dataPenjualan.map((item) => (
              <ProgressItem key={item.id} item={item} />
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
};

/* ===================== COMPONENTS HELPERS ===================== */

/**
 * SectionCard
 * Komponen wrapper standar untuk setiap section utama[cite: 12].
 */
const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden hover:shadow-md transition-all">
    {/* Decorative Header Line */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />
    <h3 className="text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

/**
 * MainCard
 * Wrapper Item dengan efek garis merah di kiri saat dihover[cite: 13].
 */
const MainCard = ({ children }) => (
  <div className="relative bg-white rounded-[24px] border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 overflow-hidden group">
    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#B5302D] opacity-0 group-hover:opacity-100 transition-opacity" />
    {children}
  </div>
);

/**
 * StatusStep
 * Komponen pelacakan titik (stepper)[cite: 13].
 */
const StatusStep = ({ label, active }) => (
  <div className="flex flex-col items-center justify-start gap-1.5 sm:gap-2 z-10 flex-1 px-1">
    <div
      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0 ${
        active
          ? "bg-green-600 border-green-600 text-white shadow-md scale-110"
          : "bg-white border-gray-200 text-gray-300"
      }`}
    >
      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    </div>
    <span
      className={`text-[9px] sm:text-xs font-medium sm:font-bold capitalize sm:uppercase text-center leading-tight tracking-tight break-words max-w-[65px] sm:max-w-none ${
        active ? "text-gray-900" : "text-gray-400"
      }`}
    >
      {label}
    </span>
  </div>
);

/**
 * ProgressItem
 * Kartu per item yang berisi summary, tombol rincian, dan detail lengkap[cite: 13].
 */
const ProgressItem = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Normalisasi status dari BE[cite: 13]
  const statusPermintaan = (item.status_permintaan || "menunggu").toLowerCase();
  const rawProgress = item.progress_db || "menunggu_pengiriman";
  const pDB = rawProgress.toLowerCase().replace(/\s+/g, "_");

  // Penentuan Label Status[cite: 13]
  let colorClass = "bg-gray-50 text-gray-600 border-gray-100";
  let label = "Menunggu";

  if (statusPermintaan === "menunggu") {
    colorClass = "bg-yellow-50 text-yellow-700 border-yellow-100";
    label = "Menunggu Konfirmasi Mitra";
  } else if (statusPermintaan === "ditolak") {
    colorClass = "bg-red-50 text-red-700 border-red-100";
    label = "Ditolak Mitra";
  } else if (statusPermintaan === "diterima") {
    if (pDB === "terima") {
      colorClass = "bg-green-50 text-green-700 border-green-100";
      label = "Tiba di Pabrik / Selesai";
    } else {
      colorClass = "bg-blue-50 text-blue-700 border-blue-100";
      label = item.progress_publik || "Dalam Perjalanan";
    }
  }

  // Jika ditolak, jangan tampilkan rute pelacakan, cukup card simpel[cite: 13]
  if (statusPermintaan === "ditolak") {
    return (
      <MainCard>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {item.kode_resi || `REQ-${item.id}`}
            </span>
            <h4 className="text-sm font-bold text-gray-900 mt-1 line-clamp-1">
              Ke: {item.alamat_pengiriman_pabrik}
            </h4>
            <p className="text-xs text-red-500 mt-2 italic">
              Alasan Ditolak: {item.catatan_penolakan || "Tidak ada alasan"}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-xs font-bold border text-center ${colorClass}`}
          >
            {label}
          </span>
        </div>
      </MainCard>
    );
  }

  return (
    <MainCard>
      {/* --- BAGIAN RINGKAS (HEADER) --- */}
      <div
        className="flex flex-col md:flex-row justify-between gap-0 sm:gap-4 cursor-pointer w-full"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 w-full">
          {/* Baris 1: Nama Kebun & Nomor Resi */}
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
                No. Resi
              </p>
              <p className="text-xs sm:text-sm font-mono font-bold text-gray-700 bg-white sm:bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                {item.kode_resi || "Menunggu Resi"}
              </p>
            </div>
          </div>

          {/* Baris 2: Alamat & Tanggal */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mt-4">
            <div className="col-span-2 sm:col-span-1 md:col-span-3 lg:col-span-1">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Lokasi Penjemputan
              </p>
              <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed line-clamp-2">
                {item.alamat_pickup_teks || "-"}
              </p>
            </div>

            <div className="col-span-1">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Est Tiba di Pabrik
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

        {/* KANAN: STATUS & TOMBOL RINCIAN */}
        <div className="flex flex-col items-center justify-center md:items-end gap-3 mt-5 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4 min-w-full md:min-w-[120px]">
          <span
            className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase flex items-center justify-center gap-1.5 w-full md:w-auto ${colorClass}`}
          >
            {statusPermintaan === "diterima" && (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            {label}
          </span>

          <div className="flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm w-full md:w-auto">
            <span>{isExpanded ? "Tutup Rincian" : "Lihat Rincian"}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-[#B5302D]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* --- BAGIAN DETAIL (DROPDOWN/ACCORDION) --- */}
      {isExpanded && statusPermintaan === "diterima" && (
        <div className="mt-5 sm:mt-8 pt-5 sm:pt-8 border-t border-gray-100 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-top-2">
          {/* Stepper Pelacakan */}
          <div className="bg-gray-50 p-5 sm:p-6 rounded-[20px] sm:rounded-[25px] border border-gray-200">
            <p className="text-[10px] sm:text-xs font-bold text-gray-900 uppercase mb-6 sm:mb-8 tracking-widest text-center">
              Proses Pelacakan Armada
            </p>
            <div className="flex justify-between items-center max-w-3xl mx-auto relative px-2 sm:px-4">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full"></div>
              <StatusStep label="Menunggu" active={true} />
              <StatusStep
                label="Menjemput"
                active={["mengirim", "menuju_pabrik", "terima"].includes(pDB)}
              />
              <StatusStep
                label="Perjalanan"
                active={["menuju_pabrik", "terima"].includes(pDB)}
              />
              <StatusStep label="Selesai" active={pDB === "terima"} />
            </div>
          </div>

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
                  <span className="text-gray-500">Tanggal Kirim:</span>
                  <span className="font-bold text-right">
                    {item.tanggal_keberangkatan || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Tanggal Tiba:</span>
                  <span className="font-bold text-right">
                    {item.tanggal_permintaan_sampai || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Muatan (Est):</span>
                  <span className="font-bold text-right">
                    {item.estimasi_total_tbs_grup_kg
                      ? `${(item.estimasi_total_tbs_grup_kg / 1000).toFixed(2)} Ton`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-50">
                  <span className="text-gray-500">Biaya Pengiriman:</span>
                  <span className="font-extrabold text-[#B5302D] text-sm">
                    Rp {(item.biaya_final || 0).toLocaleString("id-ID")}
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

                  <p className="text-gray-500 pt-2 border-t border-gray-50">Tipe</p>
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

          {/* Tombol Tutup Rincian Bawah */}
          <div className="flex justify-end pt-5 sm:pt-6 mt-2 border-t border-gray-100">
            <button
              onClick={() => setIsExpanded(false)}
              className="w-full sm:w-auto px-8 py-3 bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-300 transition-all"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}
    </MainCard>
  );
};

export default Riwayatpenjualan;