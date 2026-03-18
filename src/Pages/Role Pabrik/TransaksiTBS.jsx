import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Info,
  Package,
  CheckCircle2,
  ClipboardList,
  Send,
  Save,
  PencilLine,
  XCircle,
} from "lucide-react";

// === MOCK DATA ===
const dataTigaHari = [
  {
    id: 1,
    tanggal: "20-03-2025",
    jenis: "Tenera",
    harga: "Rp 1.450/kg",
    kuota: "20/50 ton",
    status_kuota: "Hampir Penuh",
    color_status: "bg-orange-100 text-orange-700",
  },
  {
    id: 2,
    tanggal: "21-03-2025",
    jenis: "Tenera",
    harga: "Rp 1.450/kg",
    kuota: "10/50 ton",
    status_kuota: "Tersedia",
    color_status: "bg-green-100 text-green-700",
  },
  {
    id: 3,
    tanggal: "23-03-2025",
    jenis: "Tenera",
    harga: "Rp 1.450/kg",
    kuota: "50/50 ton",
    status_kuota: "Penuh",
    color_status: "bg-red-100 text-red-700",
  },
];

const dataPenawaran = [
  {
    id: 101,
    petani: "Pak Jaya",
    gapoktan: "Gapoktan Maju Bersama",
    jenisSawit: "Tenera",
    usiaPohon: "30",
    tanggalTanam: "20-03-2015",
    tanggalPanen: "13-03-2025",
    jenisTanah: "Mineral",
    alamatAsal:
      "Kebun Berseri, Desa Sukojadi, Kecamatan Lampung Tengah, Lampung, Unit B-05",
    estimasi: "100",
    hargaStandar: "1.430/kg",
  },
  {
    id: 102,
    petani: "Pak Dika",
    gapoktan: "Koperasi Tani Jaya",
    jenisSawit: "Dura",
    usiaPohon: "15",
    tanggalTanam: "10-05-2010",
    tanggalPanen: "14-03-2025",
    jenisTanah: "Gambut",
    alamatAsal: "Desa Wates, Lampung Selatan",
    estimasi: "50",
    hargaStandar: "1.410/kg",
  },
];

const TransaksiTBS = () => {
  const [activeMainSection, setActiveMainSection] = useState("rencana");
  const [activeSubRencana, setActiveSubRencana] = useState(null);
  const [openDetailId, setOpenDetailId] = useState(null);

  const toggleMainSection = (section) => {
    setActiveMainSection(section);
    setActiveSubRencana(null);
    setOpenDetailId(null);
  };

  const toggleSubRencana = (sub) => {
    setActiveSubRencana(activeSubRencana === sub ? null : sub);
  };

  const toggleDetail = (id) => {
    setOpenDetailId(openDetailId === id ? null : id);
  };

  return (
    <div className="space-y-6 p-4 md:p-8 min-h-screen font-sans">
      {/* ======================== HEADER ============================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl shadow-sm border border-red-100 shrink-0">
            <ClipboardList className="text-[#B5302D]" size={28} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#B5302D]">
              Transaksi TBS
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Kelola rencana harian dan penawaran masuk.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex w-full lg:w-auto p-1 bg-gray-200/50 rounded-xl md:rounded-2xl border border-gray-200">
          <button
            onClick={() => toggleMainSection("rencana")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeMainSection === "rencana"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ClipboardList size={16} />{" "}
            <span className="whitespace-nowrap">Rencana Kebutuhan</span>
          </button>
          <button
            onClick={() => toggleMainSection("penawaran")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeMainSection === "penawaran"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Send size={16} />{" "}
            <span className="whitespace-nowrap">Penawaran TBS</span>
          </button>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* ======================== KONTEN 1: RENCANA KEBUTUHAN ============================ */}
      {activeMainSection === "rencana" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
            <Info className="text-blue-500 shrink-0" size={20} />
            <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
              Pilih <strong>rencana harian atau terjadwal</strong> untuk
              menginformasikan kebutuhan pabrik kepada kebun.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6 space-y-6">
            {/* SUB-MENU: RENCANA HARIAN */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div
                onClick={() => toggleSubRencana("harian")}
                className={`p-4 flex justify-between items-start cursor-pointer transition-colors ${
                  activeSubRencana === "harian"
                    ? "bg-orange-50"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg text-[#EF8523] shrink-0 h-fit">
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 text-sm md:text-base block">
                      Rencana Kebutuhan Harian
                    </span>
                    <p className="text-[11px] md:text-xs text-gray-500 mt-1 leading-normal">
                      Kebutuhan rutin yang berlaku setiap hari hingga
                      dibatalkan.
                    </p>
                  </div>
                </div>
                {activeSubRencana === "harian" ? (
                  <ChevronUp size={18} className="text-[#EF8523]" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </div>

              {activeSubRencana === "harian" && (
                <div className="p-4 bg-white border-t text-black border-gray-100 animate-fadeIn space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase">
                        Jenis Sawit
                      </label>
                      <select className="w-full border rounded-lg p-3 text-sm bg-white outline-none focus:border-[#EF8523]">
                        <option>Tenera</option>
                        <option>Dura</option>
                        <option>Pesifera</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase">
                        Harga Beli/kg
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-3 text-sm outline-none focus:border-[#EF8523]"
                        placeholder="Rp 1.430"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase">
                        Kapasitas (Ton)
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-3 text-sm outline-none focus:border-[#EF8523]"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase">
                        Alamat Pabrik
                      </label>
                      <input
                        type="text"
                        value="Jl. Sawit Raya, Lampung (Otomatis)"
                        disabled
                        className="w-full border bg-gray-50 rounded-lg p-3 text-sm text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold text-gray-600 uppercase">
                        Tanggal Mulai
                      </label>
                      <input
                        type="date"
                        className="w-full border rounded-lg p-3 text-sm outline-none focus:border-[#EF8523]"
                      />
                    </div>
                  </div>

                  {/* === REVISI BAGIAN TOMBOL === */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button className="w-full sm:flex-1 py-3 bg-[#B5302D] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#8e2523] transition-all flex items-center justify-center gap-2 order-2 sm:order-1">
                      <Save size={16} /> Simpan Rencana
                    </button>
                    <button className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 order-1 sm:order-2">
                      <PencilLine size={16} /> Edit
                    </button>
                    <button className="w-full sm:w-auto px-6 py-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2 order-3">
                      <XCircle size={16} /> Hentikan
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SUB-MENU: RENCANA TERJADWAL */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div
                onClick={() => toggleSubRencana("terjadwal")}
                className={`p-4 flex justify-between items-start cursor-pointer transition-colors ${
                  activeSubRencana === "terjadwal"
                    ? "bg-blue-50/50"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0 h-fit">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 text-sm md:text-base block">
                      Rencana Kebutuhan Terjadwal
                    </span>
                    <p className="text-[11px] md:text-xs text-gray-500 mt-1 leading-normal">
                      Aktif hanya pada tanggal tertentu saja.
                    </p>
                  </div>
                </div>
                {activeSubRencana === "terjadwal" ? (
                  <ChevronUp size={18} className="text-blue-600" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </div>

              {activeSubRencana === "terjadwal" && (
                <div className="p-4 bg-white border-t text-black border-gray-100 animate-fadeIn space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase">
                        Jenis Sawit
                      </label>
                      <select className="w-full border rounded-lg p-3 text-sm bg-white outline-none focus:border-[#EF8523]">
                        <option>Tenera</option>
                        <option>Dura</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase">
                        Harga Beli/kg
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-3 text-sm"
                        placeholder="Rp 1.430"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold text-gray-600 uppercase">
                        Tanggal
                      </label>
                      <input
                        type="date"
                        className="w-full border rounded-lg p-3 text-sm"
                      />
                    </div>
                  </div>
                  {/* Revisi Tombol Terjadwal */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      onClick={() => toggleSubRencana("terjadwal")}
                      className="w-full sm:w-auto px-8 py-3 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl"
                    >
                      Batal
                    </button>
                    <button className="w-full sm:w-auto px-8 py-3 bg-[#B5302D] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#8e2523] transition-all flex items-center justify-center gap-2">
                      <Save size={16} /> Simpan Jadwal
                    </button>
                  </div>
                </div>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* STATIC SECTION: 3 HARI KEDEPAN */}
            <div>
              <h3 className="text-sm font-bold text-[#B5302D] mb-4 flex items-center gap-2">
                <Info size={16} /> Rencana Aktif (3 Hari Kedepan)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataTigaHari.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 bg-white p-4 rounded-xl relative flex flex-col shadow-sm"
                  >
                    <div className="absolute top-0 right-0 px-3 py-1 bg-gray-50 border-l border-b border-gray-100 rounded-bl-xl text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      {item.id === 1
                        ? "Besok"
                        : item.id === 2
                        ? "Lusa"
                        : "Nanti"}
                    </div>
                    <p className="text-[#EF8523] font-bold text-lg">
                      {item.tanggal}
                    </p>
                    <p className="text-xs text-gray-400 mb-4">{item.jenis}</p>
                    <div className="flex justify-between items-center text-xs mb-3">
                      <span className="text-gray-500 font-medium">Harga:</span>
                      <span className="font-bold text-gray-800">
                        {item.harga}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
                      <div
                        className={`h-full ${
                          item.id === 3 ? "bg-red-500" : "bg-green-500"
                        }`}
                        style={{
                          width:
                            item.id === 1
                              ? "40%"
                              : item.id === 2
                              ? "20%"
                              : "100%",
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span
                        className={`${item.color_status} px-2 py-0.5 rounded text-[10px] font-bold uppercase`}
                      >
                        {item.status_kuota}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-gray-600">
                        {item.kuota}
                      </span>
                    </div>
                    <button className="w-full py-2.5 bg-gray-50 border border-gray-200 text-[#EF8523] text-xs font-bold rounded-lg hover:bg-[#EF8523] hover:text-white transition-all">
                      Lihat Penawaran
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================== KONTEN 2: PENAWARAN PEMBELIAN ============================ */}
      {activeMainSection === "penawaran" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3">
            <Info className="text-[#B5302D] shrink-0" size={20} />
            <p className="text-xs md:text-sm text-red-900 leading-relaxed">
              Daftar penawaran pembelian TBS dari kebun. Periksa detail setiap
              transaksi sebelum mengambil tindakan.
            </p>
          </div>

          <div className="space-y-3">
            {dataPenawaran.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div
                  onClick={() => toggleDetail(item.id)}
                  className={`p-4 md:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer transition-colors ${
                    openDetailId === item.id
                      ? "bg-red-50/30"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-[#EF8523] shrink-0">
                      <Package size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm md:text-base">
                        {item.petani}
                      </h4>
                      <p className="text-[11px] md:text-xs text-gray-500 font-medium truncate max-w-[180px] md:max-w-none">
                        {item.gapoktan} • {item.estimasi} Ton
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                        Harga Tawaran
                      </p>
                      <p className="font-bold text-[#B5302D] text-sm md:text-base">
                        Rp {item.hargaStandar}
                      </p>
                    </div>
                    <button className="p-2 sm:px-5 sm:py-2 border border-gray-200 rounded-lg sm:rounded-full text-xs font-bold text-gray-600 flex items-center gap-2 hover:bg-[#B5302D] hover:text-white transition-all">
                      <span className="hidden sm:inline">
                        {openDetailId === item.id ? "Tutup" : "Detail"}
                      </span>
                      {openDetailId === item.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {openDetailId === item.id && (
                  <div className="border-t border-gray-100 bg-white animate-slideDown">
                    <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-x-12">
                      {[
                        { label: "Nama Petani", value: item.petani },
                        { label: "Nama Gapoktan", value: item.gapoktan },
                        { label: "Jenis Sawit", value: item.jenisSawit },
                        {
                          label: "Usia Pohon",
                          value: `${item.usiaPohon} Tahun`,
                        },
                        { label: "Tanggal Tanam", value: item.tanggalTanam },
                        { label: "Tanggal Panen", value: item.tanggalPanen },
                        { label: "Jenis Tanah", value: item.jenisTanah },
                        {
                          label: "Estimasi Total",
                          value: `${item.estimasi} Ton`,
                        },
                      ].map((info, idx) => (
                        <div
                          key={idx}
                          className="border-b border-gray-50 md:border-none pb-2 md:pb-0"
                        >
                          <label className="text-[10px] text-gray-400 font-bold block mb-0.5 uppercase tracking-tight">
                            {info.label}
                          </label>
                          <p className="font-bold text-gray-900 text-sm">
                            {info.value}
                          </p>
                        </div>
                      ))}
                      <div className="md:col-span-2">
                        <label className="text-[10px] text-gray-400 font-bold block mb-0.5 uppercase tracking-tight">
                          Alamat Asal Sawit
                        </label>
                        <p className="text-xs text-gray-700 leading-relaxed font-medium">
                          {item.alamatAsal}
                        </p>
                      </div>
                      <div className="md:col-span-2 bg-green-50 p-3 rounded-lg flex justify-between items-center">
                        <span className="text-[10px] text-green-700 font-bold uppercase">
                          Harga Standar Pemerintah
                        </span>
                        <span className="font-bold text-green-700 text-sm">
                          Rp {item.hargaStandar}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => toggleDetail(item.id)}
                        className="py-3 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 shadow-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Terima Penawaran
                      </button>
                      <button
                        onClick={() => toggleDetail(item.id)}
                        className="py-3 rounded-xl bg-white border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransaksiTBS;
