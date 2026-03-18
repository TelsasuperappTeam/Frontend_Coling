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
} from "lucide-react";

/* ===================== MOCK DATA ===================== */
const initialPermintaan = [
  {
    id: 1,
    kebun: "Kebun Sinar Makmur • Blok A-12",
    petani: "Pak Jaya",
    tonase: "5 t",
    tanggal: "27 Sep 2025",
    status: "Menunggu",
    offerStatus: "idle",
    gapoktan: "Gapoktan Maju Jaya",
    estimasiTonase: "5.00",
    alamatAsal: "Kebun Sinar Makmur, Desa Sukamaju, Lampung Tengah",
    alamatTujuan: "Pabrik Cahaya, Lampung Utara",
    jarak: 120,
  },
  {
    id: 2,
    kebun: "Kebun Bina Makmur • Blok C-12",
    petani: "Pak Wahyu",
    tonase: "5 t",
    tanggal: "27 Sep 2025",
    status: "Menunggu",
    offerStatus: "approved",
    gapoktan: "Gapoktan Maju Bersama",
    estimasiTonase: "5.00",
    alamatAsal: "Kebun Berseri, Desa Sukojadi, Kec. Lampung Tengah",
    alamatTujuan: "Pabrik Cahaya, Lampung Utara",
    jarak: 150,
  },
];

const MOCK_AVAILABLE_DRIVERS = [
  { id: 101, name: "Antok" },
  { id: 102, name: "Dimas" },
  { id: 103, name: "Budi" },
];

const MOCK_VEHICLES = ["Truk Colt Diesel", "Fuso", "Dump Truck", "L300"];

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

const ManajemenPesanan = () => {
  const [activeTab, setActiveTab] = useState("permintaan");
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans">
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 sm:mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <ClipboardList className="w-8 h-8 text-[#B5302D]" />
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

        {/* Tab Switcher - Mobile Optimized */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto">
          <button
            onClick={() => {
              setActiveTab("permintaan");
              setExpandedId(null);
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
              activeTab === "permintaan"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500"
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" /> Permintaan
          </button>
          <button
            onClick={() => {
              setActiveTab("penawaran");
              setExpandedId(null);
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
              activeTab === "penawaran"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500"
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Penawaran
          </button>
        </div>
      </div>

      <div className="mb-6 px-1">
        <p className="text-xs sm:text-sm text-gray-600 italic">
          {activeTab === "permintaan"
            ? "Daftar permintaan jasa pengiriman TBS dari pekebun yang menunggu konfirmasi Anda."
            : "Daftar rencana panen pekebun. Anda dapat menawarkan jasa pengiriman ke mereka."}
        </p>
      </div>

      {/* --- LIST KARTU CONTAINER --- */}
      <SectionCard
        title={
          activeTab === "permintaan" ? (
            <>
              <ClipboardList className="w-5 h-5" /> Daftar Permintaan Masuk
            </>
          ) : (
            <>
              <Send className="w-5 h-5" /> Daftar Penawaran Jasa
            </>
          )
        }
      >
        <div className="space-y-4 sm:space-y-6">
          {initialPermintaan.map((item) => (
            <LogistikItem
              key={item.id}
              item={item}
              type={activeTab === "permintaan" ? "request" : "offer"}
              isExpanded={expandedId === item.id}
              onToggle={() => toggleExpand(item.id)}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

/* ===================== COMPONENT ITEM LOGISTIK ===================== */
const LogistikItem = ({ item, type, isExpanded, onToggle }) => {
  const [viewState, setViewState] = useState("detail");
  const [offerStatus, setOfferStatus] = useState(item.offerStatus || "idle");
  const [assignedDrivers, setAssignedDrivers] = useState([]);
  const [selectedDriverName, setSelectedDriverName] = useState("");

  React.useEffect(() => {
    if (!isExpanded) {
      setTimeout(() => setViewState("detail"), 300);
    }
  }, [isExpanded]);

  const handleAddDriver = () => {
    if (
      selectedDriverName &&
      !assignedDrivers.find((d) => d.name === selectedDriverName)
    ) {
      setAssignedDrivers([
        ...assignedDrivers,
        { name: selectedDriverName, vehicle: "" },
      ]);
      setSelectedDriverName("");
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
              Lokasi Kebun
            </p>
            <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
              {item.kebun}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Petani (PJ)
            </p>
            <p className="text-[11px] sm:text-sm text-gray-700 font-semibold flex items-center gap-1.5">
              <User className="w-3 h-3 text-gray-400" /> {item.petani}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Rencana Panen
            </p>
            <p className="text-[11px] sm:text-sm font-bold text-blue-600 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" /> {item.tanggal}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {type === "request" ? "Status" : "Wilayah"}
            </p>
            {type === "request" ? (
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase w-fit block">
                Menunggu
              </span>
            ) : (
              <p className="text-[11px] sm:text-sm font-bold text-gray-600">
                Lampung
              </p>
            )}
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
              <div
                className={`grid grid-cols-1 md:grid-cols-2 ${
                  type === "offer" ? "lg:grid-cols-3" : ""
                } gap-6 sm:gap-8`}
              >
                {/* Info Umum */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-[10px] sm:text-[11px] font-bold text-[#B5302D] uppercase flex items-center gap-2">
                    <Hash className="w-4 h-4" /> Detail Permintaan
                  </h4>
                  <div className="space-y-3 bg-gray-50/50 p-4 sm:p-5 rounded-2xl border border-gray-100 text-[11px] sm:text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pemilik:</span>
                      <span className="font-bold">{item.petani}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mitra:</span>
                      <span className="font-bold">{item.gapoktan}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-100">
                      <span className="text-gray-500 font-medium">
                        Estimasi TBS:
                      </span>
                      <span className="font-extrabold text-[#B5302D] sm:text-sm">
                        {item.estimasiTonase} Ton
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Rute */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-[10px] sm:text-[11px] font-bold text-[#B5302D] uppercase flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Lokasi & Rute
                  </h4>
                  <div className="space-y-4 bg-gray-50/50 p-4 sm:p-5 rounded-2xl border border-gray-100 text-[11px] sm:text-xs">
                    <div className="space-y-3">
                      <div className="relative pl-4 border-l-2 border-dashed border-gray-200">
                        <div className="absolute -left-1.5 top-0 w-2.5 h-2.5 rounded-full bg-orange-400 border-2 border-white" />
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">
                          Penjemputan:
                        </p>
                        <p className="font-medium text-gray-700 leading-tight">
                          {item.alamatAsal}
                        </p>
                      </div>
                      <div className="relative pl-4 border-l-2 border-dashed border-gray-200">
                        <div className="absolute -left-1.5 top-0 w-2.5 h-2.5 rounded-full bg-[#B5302D] border-2 border-white" />
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">
                          Tujuan:
                        </p>
                        <p className="font-medium text-gray-700 leading-tight">
                          {item.alamatTujuan}
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                      <p className="text-[9px] text-gray-400 uppercase font-bold">
                        Jarak
                      </p>
                      <p className="font-bold text-gray-900">{item.jarak} KM</p>
                    </div>
                  </div>
                </div>

                {/* Status Penawaran - JASA */}
                {type === "offer" && (
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-[10px] sm:text-[11px] font-bold text-[#B5302D] uppercase flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Status
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 min-h-[100px] sm:min-h-[120px] flex flex-col justify-center items-center text-center">
                      {offerStatus === "idle" && (
                        <p className="text-[10px] sm:text-[11px] text-gray-500 italic">
                          Ajukan penawaran jasa di bawah.
                        </p>
                      )}
                      {offerStatus === "pending" && (
                        <div className="text-yellow-600 font-bold text-[10px] sm:text-xs flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-100">
                          <Clock className="w-4 h-4" /> Menunggu...
                        </div>
                      )}
                      {offerStatus === "approved" && (
                        <div className="text-green-600 font-bold text-[10px] sm:text-xs flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                          <CheckCircle className="w-4 h-4" /> Disetujui
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS - Mobile Responsive (Stacking) */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                {type === "request" ? (
                  <>
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
                      Terima & Tugaskan
                    </button>
                  </>
                ) : (
                  <>
                    {offerStatus === "idle" && (
                      <button
                        onClick={() => setOfferStatus("pending")}
                        className="bg-[#EF8523] text-white px-6 sm:px-8 py-2.5 rounded-xl text-xs font-bold hover:bg-[#d06d1e] shadow-lg shadow-orange-100 w-full sm:w-auto"
                      >
                        Ajukan Penawaran
                      </button>
                    )}
                    {offerStatus === "approved" && (
                      <button
                        onClick={() => setViewState("form_assign")}
                        className="bg-green-600 text-white px-6 sm:px-8 py-2.5 rounded-xl text-xs font-bold hover:bg-green-700 shadow-lg shadow-green-100 w-full sm:w-auto transition-all"
                      >
                        Tugaskan Armada
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={onToggle}
                  className="order-3 px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold w-full sm:w-auto"
                >
                  Tutup
                </button>
              </div>
            </>
          )}

          {/* VIEW: FORM TUGASKAN ARMADA*/}
          {viewState === "form_assign" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 bg-white p-5 sm:p-8 rounded-[25px] sm:rounded-[32px] border border-gray-200 shadow-sm">
              <h4 className="text-lg sm:text-xl font-bold text-[#B5302D] mb-6 sm:mb-8 flex items-center gap-2">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6" /> Tugaskan Armada
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-12 gap-y-5 sm:gap-y-6 mb-8 sm:mb-10">
                <div className="space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase ml-1">
                    Logistik
                  </label>
                  <input
                    type="text"
                    value="Andi Logistik"
                    readOnly
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-500 font-medium cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase ml-1">
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    value="0812-3456-7890"
                    readOnly
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-500 font-medium cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase ml-1">
                      Data Supir
                    </label>
                    <button
                      onClick={handleAddDriver}
                      className="bg-green-50 text-green-700 text-[9px] sm:text-[10px] font-bold px-3 sm:px-4 py-1.5 rounded-xl border border-green-100 hover:bg-green-100 flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Tambah
                    </button>
                  </div>
                  <div className="relative mb-3">
                    <select
                      value={selectedDriverName}
                      onChange={(e) => setSelectedDriverName(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs sm:text-sm appearance-none outline-none focus:ring-2 focus:ring-red-50 focus:border-red-200 transition-all"
                    >
                      <option value="">Pilih Supir</option>
                      {MOCK_AVAILABLE_DRIVERS.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-3 sm:p-4 min-h-[100px] sm:min-h-[120px] space-y-3 shadow-inner">
                    {assignedDrivers.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 py-6">
                        <User className="w-6 h-6 sm:w-8 sm:h-8 opacity-20 mb-2" />
                        <p className="text-[10px] sm:text-[11px] italic">
                          Belum ada supir terpilih
                        </p>
                      </div>
                    ) : (
                      assignedDrivers.map((d, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm transition-all animate-in zoom-in-95"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500" />
                            <span className="text-xs sm:text-sm font-bold text-gray-700">
                              {d.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <select className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] text-gray-600 font-bold outline-none">
                              <option>Kendaraan</option>
                              {MOCK_VEHICLES.map((v) => (
                                <option key={v}>{v}</option>
                              ))}
                            </select>
                            <button
                              onClick={() =>
                                setAssignedDrivers(
                                  assignedDrivers.filter((_, i) => i !== idx)
                                )
                              }
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase ml-1">
                    Biaya Final (Rp)
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan Biaya"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-red-50 focus:border-red-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:col-span-2 lg:col-span-1">
                  <div className="space-y-1.5">
                    <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase ml-1">
                      Tgl Berangkat
                    </label>
                    <input
                      type="date"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-xs sm:text-sm outline-none focus:border-red-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase ml-1">
                      Tgl Tiba
                    </label>
                    <input
                      type="date"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-xs sm:text-sm outline-none focus:border-red-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-6 border-t border-gray-50">
                <button
                  onClick={() => setViewState("detail")}
                  className="px-6 sm:px-8 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all w-full sm:w-auto"
                >
                  Kembali
                </button>
                <button className="bg-green-600 text-white px-6 sm:px-10 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-green-100 hover:bg-green-700 flex items-center justify-center gap-2 transition-all w-full sm:w-auto">
                  <CheckCircle2 className="w-4 h-4" /> Simpan & Tugaskan
                </button>
              </div>
            </div>
          )}

          {/* VIEW FORM REJECT */}
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
                <button className="bg-[#B5302D] text-white px-8 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-red-100 w-full sm:w-auto transition-all">
                  Kirim Penolakan
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