import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  Calendar,
  Phone,
  User,
  Hash,
  History,
  Radar,
  CheckCircle,
  Loader2,
} from "lucide-react";

import { showToast, confirmDialog } from "../../utils/notif";

// PASTIKAN PATH IMPORT INI SESUAI DENGAN STRUKTUR FOLDER ANDA
import { API_ENDPOINTS } from "../../config/constants.js";

const Pengiriman = () => {
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("pantau");

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  // --- FETCH DATA LIST PENGIRIMAN DARI BE ---
  const fetchShipments = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const isHistory = activeTab === "riwayat";
      const url = `${API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.GET_LIST}?is_history=${isHistory}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Gagal mengambil data pengiriman");

      const data = await response.json();

      const filteredData = data.filter(
        (item) => item.status_permintaan?.toLowerCase() === "diterima",
      );

      setShipments(filteredData);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      showToast.error("Gagal memuat data pengiriman.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // --- UPDATE PROGRESS (PATCH) ---
  const handleUpdateStatus = async (id, currentProgressDB) => {
    let nextProgress = "";
    let pesanKonfirmasi = "";

    // LOGIKA MAJU (TIDAK BISA MUNDUR)
    if (currentProgressDB === "menunggu_pengiriman") {
      nextProgress = "mengirim";
      pesanKonfirmasi = "Apakah armada sudah mulai menjemput TBS di Kebun?";
    } else if (currentProgressDB === "mengirim") {
      nextProgress = "menuju_pabrik";
      pesanKonfirmasi = "Apakah armada sudah mulai jalan menuju Pabrik?";
    } else {
      return;
    }

    const isSetuju = await confirmDialog({
      title: "Konfirmasi Update Status",
      text: pesanKonfirmasi,
      confirmText: "Ya, Update!",
      isDanger: false,
    });

    // Jika user klik "Batal/Cancel", hentikan fungsi
    if (!isSetuju) return;

    try {
      const token = localStorage.getItem("token");
      const url =
        API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.UPDATE_PROGRESS(id);

      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ progress_baru: nextProgress }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.detail || data.message || "Gagal mengupdate progress",
        );
      }

      showToast.success("Progress armada berhasil diperbarui!");
      fetchShipments(); // Refresh data otomatis setelah sukses
    } catch (error) {
      showToast.error(error.message || "Terjadi kesalahan pada sistem.");
    }
  };

  const getStatusLabel = (pDB) => {
    if (pDB === "terima") return "Tiba di Pabrik";
    if (pDB === "menuju_pabrik") return "Dalam Perjalanan";
    if (pDB === "mengirim") return "Menjemput";
    return "Menunggu Penjemputan";
  };

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 sm:mb-7">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <MapPin className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Logistik Pengiriman
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Pelacakan armada dan riwayat TBS
            </p>
          </div>
        </div>
      </div>

        {/* --- TABS --- */}
        <div className="flex w-full sm:w-auto bg-gray-100 p-1.5 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab("pantau")}
            className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "pantau"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Radar
              className={`w-4 h-4 ${
                activeTab === "pantau" ? "animate-pulse" : ""
              }`}
            />
            Status <span className="hidden sm:inline">Pengiriman</span>
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "riwayat"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <History className="w-4 h-4" />
            Riwayat <span className="hidden sm:inline">Selesai</span>
          </button>
        </div>
      </div>

      <hr className="border-gray-200 mb-6 sm:mb-8" />

      {/* --- LIST KARTU CONTAINER --- */}
      <SectionCard
        title={
          activeTab === "pantau" ? "Daftar Pengiriman Aktif" : "Riwayat Selesai"
        }
      >
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-[#B5302D] animate-spin" />
          </div>
        ) : shipments.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm font-medium bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
            Tidak ada riwayat pengiriman yang selesai atau masih aktif.
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {shipments.map((item) => {
              // PERBAIKAN BUG DISINI: Normalisasi string agar tahan dari spasi atau karakter tak terduga dari BE
              const rawProgress = item.progress_db || "menunggu_pengiriman";
              const pDB = rawProgress.toLowerCase().replace(/\s+/g, "_");

              const uiStatusLabel = getStatusLabel(pDB);

              return (
                <MainCard key={item.id}>
                  {/* DATA RINGKAS */}
                  <div
                    className="flex flex-col md:flex-row justify-between gap-0 sm:gap-4 cursor-pointer w-full"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="flex-1 w-full">
                      {/* Baris 1: Nama Gapoktan & Nomor Resi */}
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
                              {item.nama_gapoktan}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center sm:block justify-between bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none w-full sm:w-auto mt-1 sm:mt-0">
                          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider sm:mb-1">
                            No. Resi
                          </p>
                          <p className="text-xs sm:text-sm font-mono font-bold text-gray-700 bg-white sm:bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                            {item.kode_resi || "Menunggu"}
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
                            {item.alamat_pickup_teks}
                          </p>
                        </div>

                        <div className="col-span-1">
                          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {activeTab === "riwayat" ? "Tgl Panen" : "Est Tiba"}
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-blue-600 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            {activeTab === "riwayat"
                              ? item.tanggal_rencana_panen
                              : item.tanggal_permintaan_sampai}
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
                      {activeTab === "riwayat" && (
                        <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase flex items-center gap-1.5 w-full justify-center md:w-auto">
                          <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                          {item.progress_publik || "Tiba di Pabrik"}
                        </span>
                      )}

                      <div className="flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 group-hover:bg-gray-50 transition-all shadow-sm w-full md:w-auto">
                        <span>
                          {expandedId === item.id
                            ? "Tutup Rincian"
                            : "Lihat Rincian"}
                        </span>
                        {expandedId === item.id ? (
                          <ChevronUp className="w-4 h-4 text-[#B5302D]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DATA DETAIL (DROPDOWN) */}
                  {expandedId === item.id && (
                    <div className="mt-5 sm:mt-8 pt-5 sm:pt-8 border-t border-gray-100 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-top-2">
                      {/* Stepper Pelacakan */}
                      <div className="bg-gray-50 p-5 sm:p-6 rounded-[20px] sm:rounded-[25px] border border-gray-200">
                        <p className="text-[10px] sm:text-xs font-bold text-gray-900 uppercase mb-6 sm:mb-8 tracking-widest text-center">
                          Proses Pelacakan
                        </p>
                        <div className="flex justify-between items-center max-w-3xl mx-auto relative px-2 sm:px-4">
                          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full"></div>
                          <StatusStep label="Menunggu" active={true} />
                          <StatusStep
                            label="Menjemput"
                            active={[
                              "mengirim",
                              "menuju_pabrik",
                              "terima",
                            ].includes(pDB)}
                          />
                          <StatusStep
                            label="Perjalanan"
                            active={["menuju_pabrik", "terima"].includes(pDB)}
                          />
                          <StatusStep
                            label="Selesai"
                            active={pDB === "terima"}
                          />
                        </div>

                        {/* Tombol Aksi Dinamis (Tampil berdasarkan State yang sudah ternormalisasi) */}
                        {activeTab === "pantau" && (
                          <div className="mt-8 flex flex-col items-center">
                            {/* TAHAP 1: Truk Baru Ditugaskan */}
                            {pDB === "menunggu_pengiriman" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(item.id, pDB);
                                }}
                                className="w-full sm:w-auto bg-[#EF8523] text-white px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-orange-100 hover:scale-105 transition-all flex items-center justify-center gap-2"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Konfirmasi
                                Menjemput
                              </button>
                            )}

                            {/* TAHAP 2: Truk Sedang Menjemput di Kebun -> Mau Jalan ke Pabrik */}
                            {pDB === "mengirim" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(item.id, pDB);
                                }}
                                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-100 hover:scale-105 transition-all flex items-center justify-center gap-2"
                              >
                                <Truck className="w-4 h-4" /> Konfirmasi dalam
                                Perjalanan
                              </button>
                            )}

                            {/* TAHAP 3: Truk Sedang Menuju Pabrik / Sudah Sampai Pabrik tapi belum di-ACC */}
                            {pDB === "menuju_pabrik" && (
                              <div className="w-full sm:w-auto flex justify-center items-center gap-2 text-gray-500 bg-gray-50 px-6 py-3 rounded-xl text-[11px] sm:text-xs font-bold border border-gray-200 text-center cursor-not-allowed">
                                <Clock className="w-4 h-4 animate-spin-slow shrink-0 text-blue-500" />
                                Menunggu Konfirmasi Penerimaan dari Pabrik
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* --- GRID DETAIL INFORMASI YANG SUDAH DIPERBAIKI (TIDAK NABRAK) --- */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Info Transaksi */}
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
                                Tanggal Kirim:
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

                        {/* Armada & Supir */}
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

                        {/* Rute & Estimasi */}
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
                                  {item.alamat_pickup_teks}
                                </p>
                              </div>
                              <div className="relative pl-4 border-l-2 border-dashed border-gray-200">
                                <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-[#B5302D] border-2 border-white" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                                  Ke: Pabrik
                                </p>
                                <p className="font-medium text-gray-700 leading-snug">
                                  {item.alamat_pengiriman_pabrik}
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
                                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase text-center ${
                                  pDB === "terima"
                                    ? "bg-green-50 text-green-600 border border-green-100"
                                    : "bg-orange-50 text-[#EF8523] border border-orange-100"
                                }`}
                              >
                                {item.progress_publik || uiStatusLabel}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-5 sm:pt-6 mt-2 border-t border-gray-100">
                        <button
                          onClick={() => toggleExpand(null)}
                          className="w-full sm:w-auto px-8 py-3 bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-300 transition-all"
                        >
                          Tutup
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
  <div className="bg-white rounded-[24px] sm:rounded-[30px] border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8 relative overflow-hidden group hover:shadow-md transition-all">
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

const StatusStep = ({ label, active }) => (
  <div className="flex flex-col items-center gap-2 z-10 w-[70px] sm:w-[90px]">
    <div
      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
        active
          ? "bg-green-600 border-green-600 text-white shadow-md scale-110"
          : "bg-white border-gray-200 text-gray-300"
      }`}
    >
      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
    </div>
    <span
      className={`text-[10px] sm:text-xs font-bold uppercase tracking-tight text-center ${
        active ? "text-gray-900" : "text-gray-400"
      }`}
    >
      {label}
    </span>
  </div>
);

export default Pengiriman;
