import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Hash,
  ClipboardList,
  Send,
  Plus,
  X,
  XCircle,
  CheckCircle,
  CheckSquare,
} from "lucide-react";

import { API_ENDPOINTS } from "../../config/constants.js";

// --- KOMPONEN SECTION CARD ---
const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden hover:shadow-md transition-all">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />
    <h3 className="text-base sm:text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">
      {title}
    </h3>

    {children}
  </div>
);

const ManajemenPesanan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // State untuk menampung data dari Backend
  const [pesananMasuk, setPesananMasuk] = useState([]);
  const [kruList, setKruList] = useState([]);
  const [kendaraanList, setKendaraanList] = useState([]);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const fetchSemuaData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Daftar Permintaan Masuk (Sesuai Endpoint Management Baru)
      const resPesanan = await fetch(
        API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.GET_LIST,
        { headers },
      );
      if (resPesanan.ok) {
        const dataPesanan = await resPesanan.json();

        console.log("=== DATA PESANAN MASUK DARI BE ===", dataPesanan);

        // UBAH BAGIAN INI: Filter khusus pesanan baru yang butuh aksi Logistik
        const pending = dataPesanan.filter(
          (item) =>
            item.status_permintaan?.toLowerCase() === "menunggu konfirmasi",
        );

        setPesananMasuk(pending);
      } else {
        console.log("=== BE PESANAN ERROR STATUS ===", resPesanan.status);
      }

      // 2. Fetch Dropdown Supir (Tersedia)
      const resKru = await fetch(
        API_ENDPOINTS.TRACEABILITY.LOGISTIK.DROPDOWN.KRU,
        { headers },
      );
      if (resKru.ok) setKruList(await resKru.json());

      // 3. Fetch Dropdown Kendaraan (Tersedia)
      const resKendaraan = await fetch(
        API_ENDPOINTS.TRACEABILITY.LOGISTIK.DROPDOWN.KENDARAAN,
        { headers },
      );
      if (resKendaraan.ok) setKendaraanList(await resKendaraan.json());
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSemuaData();
  }, []);

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans">
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 sm:mb-7">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <CheckSquare className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Manajemen Pesanan
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Kelola permintaan masuk dan penawaran jasa logistik
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 mb-5" />

      <div className="mb-6 px-1">
        <p className="text-xs sm:text-sm text-gray-600 italic">
          Berikut ini adalah daftar permintaan pengiriman yang masuk dari
          kebun-kebun. Klik pada setiap item untuk melihat detail dan mengambil
          tindakan
        </p>
      </div>

      <SectionCard title="Permintaan Jasa Logistik Dari Kebun">
        <div className="space-y-4 sm:space-y-6">
          {isLoading ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              Memuat data...
            </div>
          ) : pesananMasuk.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              Tidak ada permintaan pengiriman baru yang menunggu konfirmasi.
            </div>
          ) : (
            pesananMasuk.map((item) => (
              <LogistikItem
                key={item.id}
                item={item}
                type="request"
                dropdownKru={kruList}
                dropdownKendaraan={kendaraanList}
                isExpanded={expandedId === item.id}
                onToggle={() => toggleExpand(item.id)}
                onRefresh={fetchSemuaData}
              />
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
};

/* ===================== COMPONENT ITEM LOGISTIK ===================== */
const LogistikItem = ({
  item,
  isExpanded,
  onToggle,
  dropdownKru,
  dropdownKendaraan,
  onRefresh,
}) => {
  const [viewState, setViewState] = useState("detail");
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  // State untuk API Tolak
  const [catatanPenolakan, setCatatanPenolakan] = useState("");

  // State untuk API Terima & Tugaskan
  const [kruId, setKruId] = useState("");
  const [kendaraanId, setKendaraanId] = useState("");
  const [tglKeberangkatan, setTglKeberangkatan] = useState("");

  React.useEffect(() => {
    if (!isExpanded) {
      setTimeout(() => setViewState("detail"), 300);
    }
  }, [isExpanded]);

  // FUNGSI API TOLAK
  const handleTolak = async () => {
    if (!catatanPenolakan.trim())
      return alert("Catatan penolakan wajib diisi!");

    setIsLoadingSubmit(true);
    try {
      const token = localStorage.getItem("token");
      // Menggunakan Endpoint MANAGEMENT TOLAK
      const url = API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.TOLAK(item.id);

      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ catatan_penolakan: catatanPenolakan }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.detail || data.message || "Gagal menolak pesanan");

      alert("Pesanan berhasil ditolak.");
      onRefresh();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  // FUNGSI API TERIMA & TUGASKAN
  const handleTerima = async () => {
    if (!kruId || !kendaraanId || !tglKeberangkatan)
      return alert("Supir, Kendaraan, dan Tanggal Berangkat wajib diisi!");

    setIsLoadingSubmit(true);
    try {
      const token = localStorage.getItem("token");
      // Menggunakan Endpoint MANAGEMENT TERIMA_TUGASKAN
      const url =
        API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.TERIMA_TUGASKAN(item.id);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kru_id: parseInt(kruId),
          kendaraan_id: parseInt(kendaraanId),
          tanggal_keberangkatan: tglKeberangkatan,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.detail || data.message || "Gagal menerima pesanan",
        );

      alert(data.message || "Armada berhasil ditugaskan! Resi telah dibuat.");
      onRefresh();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <MainCard>
      {/* DATA RINGKAS */}
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 flex-1 gap-x-2 gap-y-4 sm:gap-4 items-center">
          <div className="space-y-1">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Asal Kebun
            </p>
            {/* Menggunakan nama_gapoktan dari BE */}
            <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight line-clamp-1">
              {item.nama_gapoktan || "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Tgl Panen
            </p>
            <p className="text-[11px] sm:text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" /> {item.tanggal_rencana_panen}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#B5302D] uppercase tracking-wider">
              Target Tiba Pabrik
            </p>
            <p className="text-[11px] sm:text-sm font-bold text-[#B5302D] flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> {item.tanggal_permintaan_sampai}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Status
            </p>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase w-fit block">
              {item.status_permintaan
                ? item.status_permintaan.replace(/_/g, " ")
                : "-"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2 bg-gray-50 px-3 sm:px-4 py-2 rounded-xl border border-gray-200 text-[10px] sm:text-xs font-bold text-gray-600 group-hover:bg-gray-100 transition-colors">
            <span>Rincian</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* DATA DETAIL */}
      {isExpanded && (
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-100 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-top-2">
          {viewState === "detail" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Info Umum */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-[10px] sm:text-[11px] font-bold text-[#B5302D] uppercase flex items-center gap-2">
                    <Hash className="w-4 h-4" /> Detail Muatan & Info
                  </h4>
                  <div className="space-y-3 bg-gray-50/50 p-4 sm:p-5 rounded-2xl border border-gray-100 text-[11px] sm:text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID Permintaan:</span>
                      <span className="font-bold">REQ-{item.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nama Gapoktan:</span>
                      <span className="font-bold">{item.nama_gapoktan}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-100">
                      <span className="text-gray-500 font-medium">
                        Estimasi Muatan TBS:
                      </span>
                      <span className="font-extrabold text-[#B5302D] sm:text-sm">
                        {(item.estimasi_total_tbs_grup_kg / 1000).toFixed(2)}{" "}
                        Ton
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Rute (Sesuai Schema) */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-[10px] sm:text-[11px] font-bold text-[#B5302D] uppercase flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Lokasi & Rute
                  </h4>
                  <div className="space-y-4 bg-gray-50/50 p-4 sm:p-5 rounded-2xl border border-gray-100 text-[11px] sm:text-xs">
                    <div className="space-y-3">
                      <div className="relative pl-4 border-l-2 border-dashed border-gray-200">
                        <div className="absolute -left-1.5 top-0 w-2.5 h-2.5 rounded-full bg-orange-400 border-2 border-white" />
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">
                          Titik Penjemputan (Kebun):
                        </p>
                        <p className="font-medium text-gray-700 leading-tight">
                          {item.alamat_pickup_teks}
                        </p>
                      </div>
                      <div className="relative pl-4 border-l-2 border-dashed border-gray-200">
                        <div className="absolute -left-1.5 top-0 w-2.5 h-2.5 rounded-full bg-[#B5302D] border-2 border-white" />
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">
                          Tujuan Pengiriman (Pabrik):
                        </p>
                        <p className="font-medium text-gray-700 leading-tight">
                          {item.alamat_pengiriman_pabrik}
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                      <p className="text-[9px] text-gray-400 uppercase font-bold">
                        Estimasi Jarak Tempuh
                      </p>
                      <p className="font-bold text-gray-900">
                        {item.estimasi_jarak_km} KM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                <button
                  onClick={() => setViewState("form_reject")}
                  className="order-2 sm:order-1 bg-red-50 text-[#B5302D] px-6 sm:px-8 py-2.5 rounded-xl text-xs font-bold border border-red-100 hover:bg-red-100 transition-all w-full sm:w-auto"
                >
                  Tolak
                </button>
                <button
                  onClick={() => setViewState("form_assign")}
                  className="order-1 sm:order-2 bg-green-600 text-white px-6 sm:px-8 py-2.5 rounded-xl text-xs font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all w-full sm:w-auto"
                >
                  Terima & Tugaskan Armada
                </button>
                <button
                  onClick={onToggle}
                  className="order-3 px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold w-full sm:w-auto"
                >
                  Tutup
                </button>
              </div>
            </>
          )}

          {/* VIEW: FORM TUGASKAN ARMADA */}
          {viewState === "form_assign" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 bg-white p-5 sm:p-8 rounded-[25px] sm:rounded-[32px] border border-gray-200 shadow-sm">
              <h4 className="text-lg sm:text-xl font-bold text-[#B5302D] mb-6 sm:mb-8 flex items-center gap-2">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6" /> Tugaskan Armada
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* DROPDOWN SUPIR */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                    Pilih Supir (Tersedia)
                  </label>
                  <select
                    value={kruId}
                    onChange={(e) => setKruId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-200"
                  >
                    <option value="">-- Pilih Supir --</option>
                    {dropdownKru.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_supir} ({k.nomor_telepon})
                      </option>
                    ))}
                  </select>
                </div>

                {/* DROPDOWN KENDARAAN */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                    Pilih Kendaraan (Tersedia)
                  </label>
                  <select
                    value={kendaraanId}
                    onChange={(e) => setKendaraanId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-200"
                  >
                    <option value="">-- Pilih Kendaraan --</option>
                    {dropdownKendaraan.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nama_kendaraan} - {v.plat_kendaraan} (Kapasitas:{" "}
                        {v.kapasitas_angkut_kg} kg)
                      </option>
                    ))}
                  </select>
                </div>

                {/* TANGGAL KEBERANGKATAN */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                    Tgl Berangkat
                  </label>
                  <input
                    type="date"
                    value={tglKeberangkatan}
                    onChange={(e) => setTglKeberangkatan(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-200"
                  />
                </div>
              </div>

              {/* TOMBOL SIMPAN */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-50">
                <button
                  onClick={() => setViewState("detail")}
                  className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold w-full sm:w-auto"
                >
                  Kembali
                </button>
                <button
                  onClick={handleTerima}
                  disabled={isLoadingSubmit}
                  className="bg-green-600 text-white px-8 py-2.5 rounded-xl text-xs font-bold hover:bg-green-700 shadow-lg shadow-green-100 flex items-center justify-center gap-2 w-full sm:w-auto transition-all"
                >
                  {isLoadingSubmit ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Simpan & Tugaskan
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* VIEW: FORM REJECT */}
          {viewState === "form_reject" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 bg-white p-5 sm:p-8 rounded-[25px] sm:rounded-[32px] border border-gray-200 shadow-sm">
              <h4 className="text-lg sm:text-xl font-bold text-[#B5302D] mb-6 flex items-center gap-2">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" /> Alasan Penolakan
              </h4>
              <div className="space-y-1.5 mb-6">
                <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase ml-1">
                  Catatan Penolakan
                </label>
                <textarea
                  value={catatanPenolakan}
                  onChange={(e) => setCatatanPenolakan(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs sm:text-sm outline-none min-h-[120px] focus:bg-white focus:ring-2 focus:ring-red-50 focus:border-red-200 transition-all"
                  placeholder="Berikan alasan mengapa permintaan ini ditolak..."
                ></textarea>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => setViewState("detail")}
                  className="px-8 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold w-full sm:w-auto transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleTolak}
                  disabled={isLoadingSubmit}
                  className="bg-[#B5302D] text-white px-8 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-red-100 w-full sm:w-auto transition-all"
                >
                  {isLoadingSubmit ? "Mengirim..." : "Kirim Penolakan"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </MainCard>
  );
};

/* --- KOMPONEN HELPER --- */
const MainCard = ({ children }) => (
  <div className="relative bg-white rounded-[24px] sm:rounded-[32px] border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 sm:p-8 overflow-hidden group">
    <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-[#B5302D] opacity-0 group-hover:opacity-100 transition-opacity" />
    {children}
  </div>
);

export default ManajemenPesanan;
