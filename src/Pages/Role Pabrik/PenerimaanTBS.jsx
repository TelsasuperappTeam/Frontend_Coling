import React, { useState } from "react";
import {
  Truck,
  FileText,
  CheckCircle2,
  X,
  PackageCheck,
} from "lucide-react";

// === MOCK DATA: PENGIRIMAN ===
const dataPengiriman = [
  {
    id: "RE-03748397322",
    petani: "Pak Jaya",
    alamat: "Desa Sukadamai, Kecamatan Lampung Selatan, Lampung",
    jumlah: "12",
    tanggalKirim: "23-03-2025",
    estimasiTiba: "25-03-2025",
    status: "Dalam Perjalanan",
    gapoktan: "Gapoktan Maju Bersama",
    jenisSawit: "Tenera",
    usiaPohon: "30",
    tanggalTanam: "20-03-2015",
    tanggalPanen: "13-03-2025",
    jenisTanah: "Mineral",
    alamatAsal: "Kebun Berseri, Desa Sukojadi, Kec. Lampung Tengah, Unit B-05",
    hargaStandar: "1.430/kg",
    supir: {
      nama: "Ujang",
      telepon: "08123458800",
      kendaraan: "Truck",
      model: "Isuzu Elf NLR 55",
      plat: "BE 1234 EF",
      totalKendaraan: "2",
      kapasitas: "4500",
      biayaPerKm: "50.0000",
      biayaFinal: "1.100.000",
      alamatJemput: "Gapoktan Surabaya, No 18",
      alamatTujuan: "Pabrik Rajawali, Makasar",
      tanggalBerangkat: "20-03-2025",
      tanggalTiba: "23-03-2025",
    },
  },
  {
    id: "RE-03748397323",
    petani: "Pak Wahyu",
    alamat: "Desa Jatimulyo, Kecamatan Lampung Selatan, Lampung",
    jumlah: "30",
    tanggalKirim: "20-03-2025",
    estimasiTiba: "22-03-2025",
    status: "Dalam Perjalanan",
    gapoktan: "Koperasi Tani Sejahtera",
    jenisSawit: "Dura",
    usiaPohon: "15",
    tanggalTanam: "10-05-2010",
    tanggalPanen: "18-03-2025",
    jenisTanah: "Gambut",
    alamatAsal: "Desa Wates, Lampung Selatan",
    hargaStandar: "1.410/kg",
    supir: {
      nama: "Budi",
      telepon: "08129998877",
      kendaraan: "Truck",
      model: "Mitsubishi Canter",
      plat: "BE 5678 XY",
      totalKendaraan: "1",
      kapasitas: "8000",
      biayaPerKm: "55.0000",
      biayaFinal: "1.500.000",
      alamatJemput: "Desa Wates, Lampung",
      alamatTujuan: "Pabrik Rajawali, Makasar",
      tanggalBerangkat: "20-03-2025",
      tanggalTiba: "22-03-2025",
    },
  },
];

const PenerimaanTBS = () => {
  const [viewMode, setViewMode] = useState("list");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleOpenDetail = (item) => {
    setSelectedShipment(item);
    setViewMode("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseDetail = () => {
    setViewMode("list");
    setSelectedShipment(null);
  };

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="space-y-6 p-4 sm:p-10 min-h-screen font-sans relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl shadow-sm border border-red-100 shrink-0">
            <PackageCheck className="text-[#B5302D]" size={28} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#B5302D]">
              Penerimaan TBS
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Validasi dan monitoring penerimaan buah dari kebun menuju pabrik.
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 mb-8" />

      {/* ======================== CONTAINER UTAMA ============================ */}
      <div className="relative bg-white rounded-[30px] sm:rounded-[40px] border border-gray-200 shadow-sm transition-all duration-300 min-h-[500px] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-[#B5302D] to-[#EF8523] z-10" />

        {/* HEADER SECTION (Hanya tampil di mode Detail) */}
        {viewMode === "detail" && (
          <div className="p-6 sm:p-8 pt-10 sm:pt-12 border-b border-gray-100 bg-white animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#B5302D]">
                  Detail Pengiriman
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed max-w-2xl">
                  Informasi lengkap pengiriman dari {selectedShipment?.petani}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT AREA */}
        <div
          className={`sm:p-8 animate-fadeIn ${
            viewMode === "list" ? "p-4 pt-12 sm:pt-14" : "p-4 pt-6"
          }`}
        >
          {/* === MODE: LIST === */}
          {viewMode === "list" && (
            <div className="space-y-4">
              {dataPengiriman.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-100 rounded-2xl p-5 hover:border-[#B5302D]/30 hover:shadow-md transition-all bg-white group relative shadow-sm"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-5">
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#B5302D] shrink-0">
                            <Truck size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-base sm:text-lg text-gray-800 leading-tight">
                              {item.petani}
                            </h3>
                            <p className="text-[10px] sm:text-xs text-gray-400 font-mono mt-0.5">
                              {item.id}
                            </p>
                          </div>
                        </div>
                        <span className="md:hidden bg-[#E8F5E9] text-green-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-200">
                          {item.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600 pl-[52px]">
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase font-bold block">
                            Alamat Kebun
                          </span>
                          <span className="font-medium text-gray-800 line-clamp-1">
                            {item.alamat}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase font-bold block">
                            Jumlah Muatan
                          </span>
                          <span className="font-medium text-gray-800">
                            {item.jumlah} Ton
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase font-bold block">
                            Estimasi Tiba
                          </span>
                          <span className="font-medium text-gray-800">
                            {item.estimasiTiba}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between gap-4 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                      <div className="hidden md:block bg-[#E8F5E9] text-green-800 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200">
                        {item.status}
                      </div>
                      <div className="w-full md:w-auto">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="w-full md:w-auto px-6 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-600 hover:bg-white hover:border-[#B5302D] hover:text-[#B5302D] hover:shadow-sm transition-all active:scale-[0.98]"
                        >
                          Rincian
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* === MODE: DETAIL === */}
          {viewMode === "detail" && selectedShipment && (
            <div className="animate-fadeIn">
              <div className="bg-white rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mb-8">
                  <DetailItem
                    label="Nama Petani"
                    value={selectedShipment.petani}
                    isMain
                  />
                  <DetailItem
                    label="Gapoktan"
                    value={selectedShipment.gapoktan}
                  />
                  <DetailItem
                    label="Jenis Sawit"
                    value={selectedShipment.jenisSawit}
                  />
                  <DetailItem
                    label="Usia Pohon"
                    value={`${selectedShipment.usiaPohon} Tahun`}
                  />
                  <DetailItem
                    label="Alamat Asal"
                    value={selectedShipment.alamatAsal}
                  />
                  <DetailItem
                    label="Total TBS"
                    value={`${selectedShipment.jumlah} Ton`}
                    isMain
                  />
                  <DetailItem
                    label="Harga Standar"
                    value={`Rp ${selectedShipment.hargaStandar}`}
                    isMain
                  />
                </div>

                <hr className="border-gray-100 my-8" />

                <h3 className="text-[#B5302D] font-bold text-sm sm:text-base mb-6 flex items-center gap-2">
                  <Truck size={18} /> Status Pengiriman
                </h3>

                <div className="mb-8">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">
                    <span className="text-[#B5302D]">Ditugaskan</span>
                    <span>Tiba di Pabrik</span>
                  </div>
                  <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#B5302D] to-[#EF8523] w-[60%] rounded-full"></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <DetailItem
                    label="Nama Supir"
                    value={selectedShipment.supir.nama}
                  />
                  <DetailItem
                    label="Telepon"
                    value={selectedShipment.supir.telepon}
                  />
                  <DetailItem
                    label="Kendaraan"
                    value={selectedShipment.supir.model}
                  />
                  <DetailItem
                    label="Plat Nomor"
                    value={selectedShipment.supir.plat}
                    isMain
                  />
                  <DetailItem
                    label="Biaya Final"
                    value={`Rp ${selectedShipment.supir.biayaFinal}`}
                    isMain
                  />
                </div>

                <div className="mt-10 flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    onClick={handleCloseDetail}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleOpenModal}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#B6F5D5] text-green-900 text-xs font-bold hover:bg-[#9AEBC0] shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Konfirmasi Sampai
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================= POPUP PEMERIKSAAN TBS ====================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn backdrop-blur-sm">
          <div className="bg-white rounded-[30px] shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#B5302D]">
                  Pemeriksaan TBS
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Validasi penerimaan barang di pabrik.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Total TBS Diterima (Ton)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-[#EF8523] transition-all"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Catatan Pemeriksaan
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Kualitas buah grade A..."
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-[#EF8523] resize-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
              <button
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  alert("Data berhasil disimpan!");
                  handleCloseModal();
                  handleCloseDetail();
                }}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#B6F5D5] text-green-900 text-xs font-bold hover:bg-[#9AEBC0] shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} /> Simpan Hasil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER COMPONENT ---
const DetailItem = ({
  label,
  value,
  isMain = false,
  color = "text-gray-800",
}) => (
  <div>
    <label className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider font-bold block mb-1">
      {label}
    </label>
    <p
      className={`${
        isMain
          ? "text-base sm:text-lg font-bold"
          : "text-sm sm:text-base font-semibold"
      } ${color} leading-snug`}
    >
      {value}
    </p>
  </div>
);

export default PenerimaanTBS;
