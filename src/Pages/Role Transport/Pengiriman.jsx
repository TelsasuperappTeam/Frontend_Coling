import React, { useState } from "react";
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
} from "lucide-react";

/* ===================== SAMPLE DATA ===================== */
const initialShipments = [
  {
    id: 1,
    kebun: "Kebun Sinar Makmur",
    petani: "Pak Jaya",
    rencanaPanen: "27 Des 2025",
    estimasiTiba: "27 Des 2025, 14:00 WIB",
    noResi: "REQ-20251214-001",
    tanggalKirim: "27/12/2025",
    biaya: "1.500.000",
    alamatAsal: "Kebun Berseri, Desa Sukojadi, Kec. Lampung Tengah, Unit B-05",
    alamatTujuan: "Pabrik Cahaya, Lampung Utara, Lampung",
    supir: { nama: "Antok", telp: "0812-3456-7890" },
    kendaraan: {
      jenis: "Colt Diesel",
      nama: "Mitsubishi Canter",
      plat: "BE 1234 ABC",
      kapasitas: "5 Ton",
      hargaPerKm: "Rp 5.000",
    },
    statusPengiriman: "Menunggu Proses",
  },
  {
    id: 2,
    kebun: "Kebun Harapan Baru",
    petani: "Ibu Siti",
    rencanaPanen: "25 Des 2025",
    estimasiTiba: "25 Des 2025, 18:00 WIB",
    noResi: "REQ-20251214-005",
    tanggalKirim: "25/12/2025",
    biaya: "2.100.000",
    alamatAsal: "Desa Mulyo, Kec. Lampung Timur, Unit A-01",
    alamatTujuan: "Pabrik Cahaya, Lampung Utara, Lampung",
    supir: { nama: "Budi", telp: "0813-4455-6677" },
    kendaraan: {
      jenis: "Fuso",
      nama: "Hino 500",
      plat: "BE 5678 FG",
      kapasitas: "8 Ton",
      hargaPerKm: "Rp 7.000",
    },
    statusPengiriman: "Selesai",
  },
];

const Pengiriman = () => {
  const [shipments, setShipments] = useState(initialShipments);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("pantau");

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  // LOGIKA UPDATE STATUS (Menunggu -> Menjemput -> Dalam Perjalanan)
  const handleUpdateStatus = (id, currentStatus) => {
    let nextStatus = currentStatus;
    if (currentStatus === "Menunggu Proses") nextStatus = "Menjemput";
    else if (currentStatus === "Menjemput") nextStatus = "Dalam Perjalanan";

    setShipments((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, statusPengiriman: nextStatus } : s
      )
    );
  };

  const filteredData = shipments.filter((item) =>
    activeTab === "pantau"
      ? item.statusPengiriman !== "Selesai"
      : item.statusPengiriman === "Selesai"
  );

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <Truck className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#B5302D]">
              Logistik Pengiriman
            </h1>
            <p className="text-gray-500 text-sm">
              Pelacakan armada dan riwayat pengiriman TBS
            </p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 self-start sm:self-center">
          <button
            onClick={() => setActiveTab("pantau")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
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
            Pantau Pengiriman
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "riwayat"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <History className="w-4 h-4" />
            Riwayat Selesai
          </button>
        </div>
      </div>

      {/* --- LIST KARTU CONTAINER --- */}
      <SectionCard
        title={
          activeTab === "pantau" ? "Daftar Pantauan Aktif" : "Riwayat Selesai"
        }
      >
        <div className="space-y-6">
          {filteredData.map((item) => (
            <MainCard key={item.id}>
              {/* DATA RINGKAS */}
              <div
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 flex-1 gap-4 items-center">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Lokasi Kebun
                    </p>
                    <p className="font-bold text-gray-900">{item.kebun}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Petani (PJ)
                    </p>
                    <p className="text-sm text-gray-700 font-semibold flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-400" />{" "}
                      {item.petani}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {activeTab === "riwayat"
                        ? "Rencana Panen"
                        : "Estimasi Tiba"}
                    </p>
                    <p className="text-sm font-bold text-blue-600 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {activeTab === "riwayat"
                        ? item.rencanaPanen
                        : item.estimasiTiba}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      No. Resi
                    </p>
                    <p className="text-xs font-mono font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded w-fit border border-gray-100">
                      {item.noResi}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {activeTab === "riwayat" && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Sudah Sampai
                    </span>
                  )}
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 group-hover:bg-gray-100 transition-colors">
                    <span>Rincian</span>
                    {expandedId === item.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* DATA DETAIL (DROPDOWN) */}
              {expandedId === item.id && (
                <div className="mt-8 pt-8 border-t border-gray-100 space-y-8 animate-in fade-in slide-in-from-top-2">
                  {/* Stepper Pelacakan */}
                  <div className="bg-gray-50 p-6 rounded-[25px] border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-8 tracking-widest text-center">
                      Proses Pelacakan Pengiriman
                    </p>
                    <div className="flex justify-between items-center max-w-3xl mx-auto relative px-4">
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
                      <StatusStep label="Menunggu" active={true} />
                      <StatusStep
                        label="Menjemput"
                        active={[
                          "Menjemput",
                          "Dalam Perjalanan",
                          "Selesai",
                        ].includes(item.statusPengiriman)}
                      />
                      <StatusStep
                        label="Perjalanan"
                        active={["Dalam Perjalanan", "Selesai"].includes(
                          item.statusPengiriman
                        )}
                      />
                      <StatusStep
                        label="Selesai"
                        active={item.statusPengiriman === "Selesai"}
                      />
                    </div>

                    {/* Tombol Aksi Dinamis */}
                    {activeTab === "pantau" && (
                      <div className="mt-10 flex flex-col items-center">
                        {item.statusPengiriman === "Menunggu Proses" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(
                                item.id,
                                item.statusPengiriman
                              );
                            }}
                            className="bg-[#EF8523] text-white px-10 py-3.5 rounded-2xl text-xs font-bold shadow-lg shadow-orange-100 hover:scale-105 transition-all flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Konfirmasi
                            Menjemput
                          </button>
                        )}
                        {item.statusPengiriman === "Menjemput" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(
                                item.id,
                                item.statusPengiriman
                              );
                            }}
                            className="bg-[#B5302D] text-white px-10 py-3.5 rounded-2xl text-xs font-bold shadow-lg shadow-red-100 hover:scale-105 transition-all flex items-center gap-2"
                          >
                            <Truck className="w-4 h-4" /> Konfirmasi
                            Keberangkatan
                          </button>
                        )}
                        {item.statusPengiriman === "Dalam Perjalanan" && (
                          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-6 py-3 rounded-2xl text-[11px] font-bold border border-blue-100">
                            <Clock className="w-4 h-4 animate-spin-slow" />{" "}
                            Menunggu Konfirmasi Kedatangan Pabrik
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Grid Detail Informasi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Info Transaksi */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-bold text-[#B5302D] uppercase flex items-center gap-2">
                        <Hash className="w-4 h-4" /> Informasi Transaksi
                      </h4>
                      <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100 text-xs shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">No Resi:</span>
                          <span className="font-bold font-mono text-gray-700">
                            {item.noResi}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Tanggal Kirim:</span>
                          <span className="font-bold">{item.tanggalKirim}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                          <span className="text-gray-500">
                            Biaya Pengiriman:
                          </span>
                          <span className="font-extrabold text-[#B5302D] text-sm">
                            Rp {item.biaya}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Armada & Supir */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-bold text-[#B5302D] uppercase flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Armada & Supir
                      </h4>
                      <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100 text-xs shadow-sm">
                        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
                          <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {item.supir.nama}
                            </p>
                            <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" /> {item.supir.telp}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-y-2.5 pt-1">
                          <p className="text-gray-500">Jenis Kendaraan</p>{" "}
                          <p className="font-semibold text-right">
                            {item.kendaraan.jenis}
                          </p>
                          <p className="text-gray-500">Nama Kendaraan</p>{" "}
                          <p className="font-semibold text-right">
                            {item.kendaraan.nama}
                          </p>
                          <p className="text-gray-500">Plat Kendaraan</p>{" "}
                          <p className="font-bold text-blue-600 text-right uppercase tracking-wider">
                            {item.kendaraan.plat}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rute & Alamat */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-bold text-[#B5302D] uppercase flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Rute & Estimasi
                      </h4>
                      <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-100 text-xs shadow-sm">
                        <div className="space-y-3">
                          <div className="relative pl-4 border-l-2 border-dashed border-gray-200">
                            <div className="absolute -left-1.5 top-0 w-2.5 h-2.5 rounded-full bg-orange-400 border-2 border-white" />
                            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                              Dari: Kebun
                            </p>
                            <p className="font-medium text-gray-700 leading-snug">
                              {item.alamatAsal}
                            </p>
                          </div>
                          <div className="relative pl-4 border-l-2 border-dashed border-gray-200">
                            <div className="absolute -left-1.5 top-0 w-2.5 h-2.5 rounded-full bg-[#B5302D] border-2 border-white" />
                            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                              Ke: Pabrik
                            </p>
                            <p className="font-medium text-gray-700 leading-snug">
                              {item.alamatTujuan}
                            </p>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                          <div>
                            <p className="text-[9px] text-gray-400 uppercase font-bold">
                              Estimasi Tiba
                            </p>
                            <p className="font-bold text-gray-900">
                              {item.estimasiTiba}
                            </p>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${
                              item.statusPengiriman === "Selesai"
                                ? "bg-green-50 text-green-600"
                                : "bg-orange-50 text-orange-600"
                            }`}
                          >
                            {item.statusPengiriman}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => toggleExpand(null)}
                      className="px-8 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all"
                    >
                      Tutup Rincian
                    </button>
                  </div>
                </div>
              )}
            </MainCard>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

/* --- KOMPONEN HELPER --- */

// 1. New SectionCard Component (Added as requested)
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

const MainCard = ({ children }) => (
  <div className="relative bg-white rounded-[32px] border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 sm:p-8 overflow-hidden group">
    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#B5302D] opacity-0 group-hover:opacity-100 transition-opacity" />
    {children}
  </div>
);

const StatusStep = ({ label, active }) => (
  <div className="flex flex-col items-center gap-2 z-10">
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
        active
          ? "bg-green-600 border-green-600 text-white shadow-md scale-110"
          : "bg-white border-gray-200 text-gray-300"
      }`}
    >
      <CheckCircle className="w-4 h-4" />
    </div>
    <span
      className={`text-[9px] font-bold uppercase tracking-tight text-center max-w-[65px] ${
        active ? "text-gray-900" : "text-gray-300"
      }`}
    >
      {label}
    </span>
  </div>
);

export default Pengiriman;