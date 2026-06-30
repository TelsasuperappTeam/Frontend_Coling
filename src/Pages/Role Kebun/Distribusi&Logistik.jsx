import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Truck,
  MapPin,
  Search,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  Phone,
  ChevronDown,
  Save,
  Calendar,
  Hash,
  CheckCircle,
  ChevronUp,
  Wallet,
  Loader2,
  Info,
  XCircle,
} from "lucide-react";
import { API_ENDPOINTS } from "../../config/constants.js";

import { showToast, confirmDialog } from "../../utils/notif";

const DistribusiLogistik = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- LOGIKA TAB BERDASARKAN URL ---
  // Jika URL mengandung "statuspengiriman", aktifkan tab "progres". Jika tidak, default ke "pencarian".
  const activeTab = location.pathname.includes("statuspengiriman")
    ? "progres"
    : "pencarian";

  const [viewMode, setViewMode] = useState("main");
  const [selectedLogistik, setSelectedLogistik] = useState(null);

  // State BE tetap dipertahankan
  const [mitraLogistik, setMitraLogistik] = useState([]);
  const [isLoadingMitra, setIsLoadingMitra] = useState(false);

  // --- STATE BARU UNTUK OPEN MARKET (PENAWARAN MASUK) ---
  const [penawaranMasuk, setPenawaranMasuk] = useState([]);

  // --- STATE UNTUK TAB PROGRES PENGAJUAN ---
  const [progresPengiriman, setProgresPengiriman] = useState([]);
  const [isLoadingProgres, setIsLoadingProgres] = useState(false);

  // Fetch data progres saat tab berpindah ke "progres"
  React.useEffect(() => {
    if (activeTab === "progres") {
      fetchProgresPengiriman();
    }
  }, [activeTab]);

  const fetchProgresPengiriman = async () => {
    setIsLoadingProgres(true);
    try {
      const token = localStorage.getItem("token");
      const urlBase = API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.GET_LIST;

      // Memanggil dua data sekaligus (Yang sedang berjalan & Histori Selesai/Ditolak)[cite: 14]
      const [resAktif, resHistori] = await Promise.all([
        fetch(`${urlBase}?is_history=false`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${urlBase}?is_history=true`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let dataAktif = [];
      let dataHistori = [];

      if (resAktif.ok) dataAktif = await resAktif.json();
      if (resHistori.ok) dataHistori = await resHistori.json();

      // 1. Gabungkan semua data mentah[cite: 14]
      let combinedData = [...dataAktif, ...dataHistori];

      // 2. LOGIKA FILTERING
      // - HANYA tampilkan yang pemeriksaannya kosong (belum selesai di pabrik)
      // - DAN HANYA tampilkan yang status_permintaannya BUKAN "ditolak"
      combinedData = combinedData.filter(
        (item) =>
          (item.pemeriksaan === null || item.pemeriksaan === undefined) &&
          item.status_permintaan?.toLowerCase() !== "ditolak",
      );

      // 3. Urutkan berdasarkan ID terbaru (menurun)[cite: 14]
      combinedData.sort((a, b) => b.id - a.id);

      console.log(
        "=== CEK DATA PROGRESS PENGIRIMAN (TERFILTER) ===",
        combinedData,
      );
      setProgresPengiriman(combinedData);
    } catch (error) {
      console.error("Gagal fetch progres pengiriman:", error);
    } finally {
      setIsLoadingProgres(false);
    }
  };

  const fetchDataPencarian = async () => {
    setIsLoadingMitra(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Ambil Mitra Logistik (Close Market) - Tetap sama
      const resMitra = await fetch(
        API_ENDPOINTS.TRACEABILITY.KEBUN.GET_MITRA_LOGISTIK,
        { headers },
      );
      if (resMitra.ok) {
        const dataMitra = await resMitra.json();

        console.log(
          "=== DEBUG: Respon GET Mitra Logistik (CLOSE MARKET) ===",
          dataMitra,
        );

        setMitraLogistik(dataMitra);
      }

      // 2. AMBIL PENAWARAN (OPEN MARKET)
      const resGrup = await fetch(
        API_ENDPOINTS.FARM.MARKETPLACE.GET_DROPDOWN_SIAP_KIRIM,
        { headers },
      );

      if (resGrup.ok) {
        const daftarGrup = await resGrup.json();

        // Panggil endpoint pelamar untuk SETIAP grup
        const promises = daftarGrup.map((grup) =>
          fetch(
            API_ENDPOINTS.TRACEABILITY.KEBUN.GET_PELAMAR_OPEN_MARKET(grup.id),
            { headers },
          ).then((res) => res.json()),
        );

        const hasilPenawaran = await Promise.all(promises);

        // Gabungkan semua hasil pelamar dari semua grup
        const semuaPelamar = hasilPenawaran.flat();

        console.log("=== DATA PENAWARAN OPEN MARKET ===", semuaPelamar);
        setPenawaranMasuk(semuaPelamar);
      }
    } catch (error) {
      console.error("Gagal fetch data:", error);
    } finally {
      setIsLoadingMitra(false);
    }
  };

  React.useEffect(() => {
    fetchDataPencarian();
  }, []);

  // Memilih logistik spesifik dan lanjut ke formulir
  const handleSelectLogistik = (logistik) => {
    setSelectedLogistik(logistik);
    setViewMode("form"); // Langsung ke form
  };

  // Helper dinamis untuk menentukan Judul SectionCard berdasarkan viewMode & activeTab
  const getSectionTitle = () => {
    if (viewMode === "form") return "Pengajuan Jasa Logistik";
    return activeTab === "pencarian"
      ? "Cari Jasa Logistik Pengiriman TBS Anda"
      : "Status Pengiriman & Progres";
  };

  // --- TAMBAHKAN FUNGSI INI ---
  const getSectionSubtitle = () => {
    if (viewMode === "form") return "";
    return activeTab === "pencarian"
      ? "Halaman ini aktif setelah pabrik menyetujui pengajuan Anda. Silahkan pilih mitra logistik untuk mengirimkan TBS."
      : "Pantau pergerakan armada Anda. Jika truk telah diperiksa pabrik, segera proses Bagi Hasil.";
  };

  return (
    <div className="space-y-6 p-4 md:p-8 min-h-screen font-sans">
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 sm:mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <Truck className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Distribusi & Logistik
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Kelola pencarian armada dan pantau progres pengiriman TBS.
            </p>
          </div>
        </div>

        {/* Tab Switcher (Hanya muncul di Main View) */}
        {viewMode === "main" && (
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto">
            <button
              // UBAH ONCLICK DI SINI
              onClick={() =>
                navigate("/kebun/distribusi&logistik/mencarilogistik")
              }
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                activeTab === "pencarian"
                  ? "bg-white text-[#B5302D] shadow-sm"
                  : "text-gray-500 hover:bg-gray-200/50"
              }`}
            >
              <Search className="w-3.5 h-3.5" /> Mencari Logistik
            </button>
            <button
              // UBAH ONCLICK DI SINI
              onClick={() =>
                navigate("/kebun/distribusi&logistik/statuspengiriman")
              }
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                activeTab === "progres"
                  ? "bg-white text-[#B5302D] shadow-sm"
                  : "text-gray-500 hover:bg-gray-200/50"
              }`}
            >
              <Truck className="w-3.5 h-3.5" /> Status Pengiriman
            </button>
          </div>
        )}
      </div>

      {/* --- GARIS PEMBATAS --- */}
      <hr className="border-gray-200 mb-8" />

      {/* --- CONTENT AREA (Wrapped in SectionCard) --- */}
      <SectionCard
        title={getSectionTitle()}
        subtitle={getSectionSubtitle()}
        rightContent={
          // LOGIKA UX: Hanya muncul di tab "Progres", selalu tampil sebagai pengingat
          viewMode === "main" &&
          activeTab === "progres" && (
            <div className="flex items-center gap-2 sm:gap-3 bg-white border border-[#EF8523]/30 p-1.5 sm:pr-2.5 rounded-full shadow-[0_0_15px_rgba(239,133,35,0.15)] animate-pulse hover:animate-none transition-all w-max md:w-auto">
              <div className="bg-gradient-to-br from-[#EF8523] to-[#d9751d] p-1.5 sm:p-2 rounded-full text-white shrink-0 shadow-sm">
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>

              <p className="text-[10px] sm:text-[11px] font-bold text-gray-700 leading-tight whitespace-nowrap">
                Jika sudah diperiksa Pabrik!
                <br />
                <span className="text-[#EF8523] font-black">
                  Silahkan Bagi Hasil
                </span>
              </p>

              <button
                onClick={() =>
                  navigate("/kebun/riwayattransaksi/perlubagihasil")
                }
                className="bg-[#EF8523] hover:bg-[#d9751d] active:scale-95 text-white px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5 whitespace-nowrap ml-1"
              >
                Klik &rarr;
              </button>
            </div>
          )
        }
      >
        {/* VIEW: MAIN TAB CONTENT */}
        {viewMode === "main" ? (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            {/* TAB 1 MENCARI PENGIRIMAN */}
            {activeTab === "pencarian" && (
              <div className="space-y-8">
                {/* --- BANNER INFORMASI --- */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-5 flex gap-3 sm:gap-4 items-start shadow-sm">
                  <div className="bg-white p-1.5 rounded-full shadow-sm shrink-0">
                    <Info className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 mb-1">
                      2 Pilihan Cari Jasa Logistik
                    </h4>
                    <ul className="text-xs sm:text-sm text-blue-800/80 leading-relaxed list-disc pl-4 space-y-2">
                      <li>
                        <strong>Ajukan Langsung (Close Market):</strong> Anda
                        memilih sendiri mitra logistik dari daftar di bawah
                        untuk langsung mengajukan pesanan.
                      </li>
                      <li>
                        <strong>Terima Tawaran Masuk (Open Market):</strong>{" "}
                        Anda menyiarkan info panen, lalu tinggal memeriksa dan
                        memilih penawaran harga terbaik dari berbagai logistik.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* --- BAGIAN 1: CLOSE MARKET --- */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 text-base sm:text-lg">
                      Ajukan Langsung Penawaran (Close Market)
                    </h3>
                    <span className="bg-red-100 text-[#B5302D] px-3 py-1.5 rounded-full text-[10px] font-black shadow-sm">
                      {mitraLogistik.length} Mitra Tersedia
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {isLoadingMitra ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-[24px] p-8 flex flex-col items-center justify-center min-h-[200px] animate-pulse">
                        <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                          <Loader2 className="w-6 h-6 text-[#B5302D] animate-spin" />
                        </div>
                        <p className="text-sm text-gray-600">
                          Memuat Daftar Mitra Logistik...
                        </p>
                      </div>
                    ) : mitraLogistik.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-sm font-medium bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                        Belum ada mitra logistik yang tersedia saat ini.
                      </div>
                    ) : (
                      mitraLogistik.map((mitra) => (
                        <div
                          key={mitra.logistik_user_id}
                          className="relative bg-white rounded-[24px] border border-gray-200 shadow-sm hover:shadow-md hover:border-[#B5302D] transition-all p-4 overflow-hidden group"
                        >
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#B5302D] opacity-0 group-hover:opacity-100 transition-opacity" />

                          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            {/* --- BAGIAN KIRI: INFO MITRA --- */}
                            <div className="flex items-start gap-3 w-full md:w-1/2">
                              {/* Avatar Initial */}
                              <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#B5302D] group-hover:text-white text-gray-500 flex items-center justify-center font-bold shrink-0 mt-1 transition-colors">
                                {mitra.nama_logistik
                                  ? mitra.nama_logistik
                                      .substring(0, 2)
                                      .toUpperCase()
                                  : "LG"}
                              </div>

                              <div className="space-y-1 w-full">
                                <div className="flex items-center justify-between md:justify-start gap-2">
                                  <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded">
                                    {mitra.total_armada_ready || 0} Armada Ready
                                  </span>
                                </div>

                                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                                  {mitra.nama_logistik}
                                </h4>

                                <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                                  {mitra.no_hp_logistik || "Belum ada nomor HP"}
                                </p>

                                <p className="text-[10px] text-gray-500 flex items-center gap-1.5 line-clamp-1">
                                  <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                  {mitra.alamat_logistik ||
                                    "Tidak ada detail alamat"}
                                </p>
                              </div>
                            </div>

                            {/* --- BAGIAN KANAN: ESTIMASI HARGA & TOMBOL --- */}
                            <div className="w-full md:w-1/2 flex flex-col gap-2.5 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4">
                              {/* List Akomodasi Compact */}
                              <div className="space-y-1.5 w-full">
                                {mitra.list_akomodasi &&
                                mitra.list_akomodasi.length > 0 ? (
                                  mitra.list_akomodasi
                                    .slice(0, 2)
                                    .map((akomodasi, idx) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between items-center bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 text-[10px]"
                                      >
                                        <span className="font-medium text-gray-700 flex items-center gap-1.5">
                                          <Truck className="w-3 h-3 text-gray-400" />
                                          <span>
                                            {akomodasi.jenis_kendaraan}{" "}
                                            <span className="text-gray-400 font-normal">
                                              (Kapasitas:{" "}
                                              {akomodasi.kapasitas_range} Kg)
                                            </span>
                                          </span>
                                        </span>
                                        <span className="font-bold text-[#B5302D]">
                                          {akomodasi.harga_range}
                                        </span>
                                      </div>
                                    ))
                                ) : (
                                  <p className="text-[10px] text-gray-400 italic bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
                                    Data harga belum diatur mitra.
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={() => handleSelectLogistik(mitra)}
                                className="mt-1 w-full px-4 py-1.5 rounded-lg bg-gray-100 text-gray-700 group-hover:bg-[#B5302D] group-hover:text-white text-[10px] font-bold transition-all flex justify-center items-center gap-1.5"
                              >
                                Pilih Mitra Ini{" "}
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* --- BAGIAN 2: OPEN MARKET (VALIDASI PENAWARAN) --- */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-[#EF8523] text-base sm:text-lg flex items-center gap-2">
                      <Truck className="w-5 h-5" /> Terima Tawaran Masuk (Open
                      Market)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {isLoadingMitra ? (
                      <div className="bg-orange-50/50 border border-orange-100 rounded-[24px] p-8 flex flex-col items-center justify-center min-h-[200px] animate-pulse">
                        <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                          <Loader2 className="w-6 h-6 text-[#EF8523] animate-spin" />
                        </div>
                        <p className="text-sm text-gray-600">
                          Mengecek Penawaran Masuk...
                        </p>
                      </div>
                    ) : penawaranMasuk.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-sm font-medium bg-orange-50 border-2 border-dashed border-orange-200 rounded-xl">
                        Belum ada jasa logistik yang melamar/mengirim penawaran
                        kepada Anda.
                      </div>
                    ) : (
                      penawaranMasuk.map((item) => (
                        <IncomingOfferCard
                          key={item.logistik_user_id}
                          item={item}
                          onRefresh={fetchDataPencarian} // dipisah bagian bawah bagian data yang di tampilkan
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2 PROGRES PENGAJUAN */}
            {activeTab === "progres" && (
              <div className="space-y-4 pt-2">
                {/* --- TEKS KETERANGAN LAMA DIHAPUS DARI SINI --- */}
                {isLoadingProgres ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 text-[#B5302D] animate-spin" />
                  </div>
                ) : progresPengiriman.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm font-medium bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                    Belum ada riwayat atau progres pengajuan armada.
                  </div>
                ) : (
                  progresPengiriman.map((item) => (
                    <ProgressItem key={item.id} item={item} />
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          /* --- VIEW: FORM PENGAJUAN --- */
          <div className="animate-in fade-in slide-in-from-right-4">
            <button
              onClick={() => setViewMode("main")}
              className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[#B5302D] text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Mitra
            </button>

            {viewMode === "form" && selectedLogistik && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-red-50 text-[#B5302D] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-gray-500">
                    Anda sedang mengajukan permintaan armada kepada mitra{" "}
                    <span className="font-bold text-gray-800 text-sm block mt-1">
                      {selectedLogistik.nama_logistik}
                    </span>
                  </p>
                </div>

                {/* FormPengajuan akan melakukan Fetch & Filter secara mandiri */}
                <FormPengajuan
                  onSubmit={() => setViewMode("main")}
                  targetName={selectedLogistik?.nama_logistik}
                  targetId={selectedLogistik?.logistik_user_id}
                />
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

/* ===================== COMPONENTS HELPERS ===================== */

/**
 * SectionCard
 * Komponen wrapper standar untuk setiap section utama.
 * Dilengkapi dengan dekorasi gradient di bagian atas dan judul dinamis.
 */
const SectionCard = ({ title, subtitle, rightContent, children }) => (
  <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden hover:shadow-md transition-all">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />

    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-[#B5302D] flex items-center gap-2">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed pr-4">
            {subtitle}
          </p>
        )}
      </div>

      {/* Area Tombol Kedip: Bisa di-scroll ke kanan di Mobile */}
      {rightContent && (
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {rightContent}
        </div>
      )}
    </div>

    {children}
  </div>
);

// Kartu Tawaran Masuk (Incoming Offer / Open Market)
const IncomingOfferCard = ({ item, onRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);

  // State untuk mengontrol Pop-up Modal Penolakan
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [catatanTolak, setCatatanTolak] = useState("");

  // State BARU untuk mengontrol Pop-up Modal Penerimaan (Date Picker)
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [tanggalSampai, setTanggalSampai] = useState("");

  const handleRespon = async (isDiterima) => {
    let urlParams = `?is_diterima=${isDiterima}`;

    // 1. Logika Penolakan via Pop-up
    if (!isDiterima) {
      if (catatanTolak.trim() === "") {
        return showToast.error("Alasan penolakan wajib diisi!");
      }

      // ---> TAMBAHAN: Konfirmasi sebelum benar-benar menolak
      const isSetuju = await confirmDialog({
        title: "Tolak Penawaran?",
        text: "Anda yakin ingin menolak penawaran dari logistik ini?",
        confirmText: "Ya, Tolak!",
        isDanger: true, 
      });
      if (!isSetuju) return;
      // <---

      urlParams += `&catatan=${encodeURIComponent(catatanTolak)}`;
    }
    // 2. Logika Penerimaan via Pop-up Tanggal (Sesuai instruksi BE)
    else {
      if (!tanggalSampai) {
        return showToast.error("Tanggal armada tiba di pabrik wajib diisi!");
      }

      // ---> TAMBAHAN: Konfirmasi sebelum benar-benar menerima
      const isSetuju = await confirmDialog({
        title: "Terima Penawaran?",
        text: "Anda akan menyetujui armada dan tarif dari logistik ini. Lanjutkan?",
        confirmText: "Ya, Terima!",
      });
      if (!isSetuju) return;
      // <---

      urlParams += `&tanggal_permintaan_sampai=${tanggalSampai}`;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Gabungkan URL dasar dengan parameter yang sudah disiapkan
      let url = `${API_ENDPOINTS.TRACEABILITY.KEBUN.RESPON_PENAWARAN_OPEN_MARKET(item.pengiriman_id)}${urlParams}`;

      console.log("=== DEBUG: URL Request ===", url);

      const res = await fetch(url, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      console.log("=== DEBUG: Respon Backend ===", {
        status: res.status,
        data,
      });

      if (!res.ok)
        throw new Error(
          data.detail || data.message || "Gagal merespon penawaran.",
        );

      // Menggunakan showToast custom milik Anda
      showToast.success(
        isDiterima ? "Penawaran berhasil DITERIMA!" : "Penawaran DITOLAK.",
      );

      // Tutup semua modal dan bersihkan input setelah berhasil
      setIsRejectModalOpen(false);
      setIsAcceptModalOpen(false);
      setCatatanTolak("");
      setTanggalSampai("");
      onRefresh();
    } catch (error) {
      // Menggunakan showToast custom milik Anda
      showToast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* KARTU UTAMA */}
      <MainCard>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-1">
          {/* --- BAGIAN 1 (KIRI): INFO LOGISTIK --- */}
          <div className="flex items-start gap-3 w-full md:w-1/2">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-[#EF8523] flex items-center justify-center font-bold shrink-0 mt-1">
              {item.nama_logistik
                ? item.nama_logistik.substring(0, 2).toUpperCase()
                : "LG"}
            </div>

            <div className="space-y-1 w-full">
              <div className="flex items-center justify-between md:justify-start gap-2">
                <span className="text-[9px] bg-orange-100 text-[#EF8523] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Penawaran
                </span>
                <span className="text-[10px] text-gray-500 font-bold">
                  {item.total_armada_ready || 0} Armada Ready
                </span>
              </div>

              <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                {item.nama_logistik || "Nama Logistik Tidak Diketahui"}
              </h4>

              <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                {item.no_hp_logistik || "-"}
              </p>

              <p className="text-[10px] text-gray-500 flex items-center gap-1.5 line-clamp-1">
                <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                {item.alamat_logistik || "Tidak ada detail alamat"}
              </p>
            </div>
          </div>

          {/* --- BAGIAN 2 (KANAN): DETAIL AKOMODASI & AKSI --- */}
          <div className="w-full md:w-1/2 flex flex-col gap-2.5 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4">
            {/* List Akomodasi Compact */}
            <div className="space-y-1.5 w-full">
              {item.list_akomodasi && item.list_akomodasi.length > 0 ? (
                item.list_akomodasi.map((akomodasi, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 text-[10px]"
                  >
                    <span className="font-medium text-gray-700 flex items-center gap-1.5">
                      <Truck className="w-3 h-3 text-gray-400" />
                      <span>
                        {akomodasi.jenis_kendaraan}{" "}
                        <span className="text-gray-400 font-normal">
                          (Kapasitas: {akomodasi.kapasitas_range} Kg)
                        </span>
                      </span>
                    </span>
                    <span className="font-bold text-[#B5302D]">
                      {akomodasi.harga_range}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-gray-400 italic bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
                  Detail armada & harga belum tersedia.
                </p>
              )}
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-2 justify-end w-full mt-1">
              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={isLoading}
                className="px-4 py-1.5 rounded-lg bg-red-50 text-[#B5302D] hover:bg-red-100 border border-red-100 text-[10px] font-bold transition-all disabled:opacity-50"
              >
                Tolak
              </button>
              <button
                onClick={() => setIsAcceptModalOpen(true)}
                disabled={isLoading}
                className="px-5 py-1.5 rounded-lg bg-[#EF8523] text-white hover:bg-[#d9751d] shadow-sm shadow-orange-100 text-[10px] font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Terima
              </button>
            </div>
          </div>
        </div>
      </MainCard>

      {/* ================================================================= */}
      {/* 1. MODAL POP-UP TERIMA PENAWARAN (BARU)                           */}
      {/* ================================================================= */}
      {isAcceptModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-orange-50">
              <h3 className="font-bold text-[#EF8523] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Terima Penawaran
              </h3>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
                <p className="text-xs text-blue-800 leading-relaxed">
                  Tentukan kapan armada ini harus tiba di Pabrik. <br />
                  <span className="text-[10px] text-blue-600 mt-1 block">
                    *Sesuai panduan agronomi, atur pada hari yang sama dengan
                    panen atau H+1 panen.
                  </span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Tanggal Armada Tiba
                </label>
                <input
                  type="date"
                  value={tanggalSampai}
                  onChange={(e) => setTanggalSampai(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-[#EF8523]"
                />
              </div>
            </div>

            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsAcceptModalOpen(false);
                  setTanggalSampai("");
                }}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200 text-xs font-bold transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleRespon(true)}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-[#EF8523] text-white hover:bg-[#d9751d] text-xs font-bold shadow-md transition-colors disabled:opacity-50"
              >
                {isLoading ? "Memproses..." : "Konfirmasi & Terima"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. MODAL POP-UP TOLAK PENAWARAN                                   */}
      {/* ================================================================= */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-red-50">
              <h3 className="font-bold text-[#B5302D] flex items-center gap-2">
                <XCircle className="w-5 h-5" /> Tolak Penawaran
              </h3>
            </div>

            {/* Body Modal */}
            <div className="p-5 space-y-3">
              <p className="text-xs text-gray-600">
                Silakan tulis alasan mengapa Anda menolak penawaran dari{" "}
                <span className="font-bold text-gray-900">
                  {item.nama_logistik}
                </span>
                .
              </p>
              <textarea
                value={catatanTolak}
                onChange={(e) => setCatatanTolak(e.target.value)}
                placeholder="Misal: Harga terlalu mahal, kapasitas kurang..."
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#B5302D] min-h-[100px] resize-none"
                autoFocus
              />
            </div>

            {/* Footer Modal */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setCatatanTolak("");
                }}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200 text-xs font-bold transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleRespon(false)}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-[#B5302D] text-white hover:bg-[#962624] text-xs font-bold shadow-md transition-colors disabled:opacity-50"
              >
                {isLoading ? "Mengirim..." : "Kirim Penolakan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Item Progres Pengiriman
const ProgressItem = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false); // State untuk buka/tutup rincian khusus di kartu ini

  // Normalisasi status dari BE
  const statusPermintaan = (item.status_permintaan || "menunggu").toLowerCase();
  const rawProgress = item.progress_db || "menunggu_pengiriman";
  const pDB = rawProgress.toLowerCase().replace(/\s+/g, "_");

  // Penentuan Label Status
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
      label = "Menunggu Pemeriksaan Pabrik";
    } else {
      colorClass = "bg-blue-50 text-blue-700 border-blue-100";
      label = item.progress_publik || "Dalam Perjalanan";
    }
  }

  // Jika ditolak, jangan tampilkan rute pelacakan, cukup card simpel
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
                  Asal Kebun
                </p>
                <p className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                  {item.nama_gapoktan || "Data Kebun Anda"}
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
                  <span className="text-gray-500">Tanggal Keberangkatan:</span>
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

// Form Component (Shared & Terhubung API)
const FormPengajuan = ({ onSubmit, targetName, targetId }) => {
  const [formData, setFormData] = useState({
    grup_penjualan_id: "",
    tanggal_permintaan_sampai: "",
    catatan_logistik: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STATE UNTUK DROPDOWN & DETAIL GRUP
  const [dropdownGrup, setDropdownGrup] = useState([]);
  const [isLoadingGrup, setIsLoadingGrup] = useState(false);
  const [showDetailGrup, setShowDetailGrup] = useState(false); // Toggle untuk buka/tutup detail

  // FETCH DATA GRUP SAAT FORM DIBUKA (DENGAN FILTER DOUBLE BOOKING DARI BE)
  React.useEffect(() => {
    const fetchGrupSiapKirim = async () => {
      setIsLoadingGrup(true);
      try {
        const token = localStorage.getItem("token");

        // Panggil 2 API sekaligus secara paralel
        const [resGrup, resUsedIds] = await Promise.all([
          // 1. Tarik semua grup siap kirim dari Farm Service
          fetch(API_ENDPOINTS.FARM.MARKETPLACE.GET_DROPDOWN_SIAP_KIRIM, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // 2. Tarik daftar ID Grup yang sudah dipakai dari Traceability Service
          fetch(API_ENDPOINTS.TRACEABILITY.KEBUN.GET_USED_GRUP_IDS, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        let dataGrup = [];
        let dataUsedIds = [];

        if (resGrup.ok) {
          dataGrup = await resGrup.json();
          console.log("=== SEMUA GRUP SIAP KIRIM (FARM) ===", dataGrup);
        } else {
          console.log("=== BE ERROR GET GRUP ===", resGrup.status);
        }

        if (resUsedIds.ok) {
          dataUsedIds = await resUsedIds.json();
          console.log("=== ID GRUP TERPAKAI (TRACEABILITY) ===", dataUsedIds);
        }

        // LOGIKA FILTER: Singkirkan grup yang ID-nya ada di dalam dataUsedIds
        const grupTersedia = dataGrup.filter(
          (grup) => !dataUsedIds.includes(grup.id),
        );

        // Masukkan grup yang sudah bersih dari double-booking ke dalam dropdown
        setDropdownGrup(grupTersedia);
      } catch (error) {
        console.error("Gagal load dropdown grup:", error);
      } finally {
        setIsLoadingGrup(false);
      }
    };

    fetchGrupSiapKirim();
  }, []);

  const handleSubmitData = async () => {
    // Validasi data sesuai BE
    if (!formData.grup_penjualan_id || !formData.tanggal_permintaan_sampai) {
      return alert("Pilih Grup Penjualan dan Tanggal Permintaan Sampai!");
    }

    if (!targetId) {
      return alert("Mitra logistik belum dipilih!");
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        API_ENDPOINTS.TRACEABILITY.KEBUN.AJUKAN_PENGIRIMAN(targetId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            grup_penjualan_id: parseInt(formData.grup_penjualan_id),
            tanggal_permintaan_sampai: formData.tanggal_permintaan_sampai,
            catatan_logistik: formData.catatan_logistik || null,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.detail || data.message || "Gagal mengirim pengajuan",
        );

      alert(data.message || "Pengajuan pengiriman berhasil dikirim!");
      onSubmit(); // Kembali ke halaman list pencarian utama
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mencari data lengkap dari grup yang sedang dipilih
  const selectedGrupData = dropdownGrup.find(
    (grup) => grup.id === parseInt(formData.grup_penjualan_id),
  );

  return (
    <div className="space-y-6">
      {targetName && (
        <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-purple-600" />
          <p className="text-xs text-purple-800">
            Anda mengajukan kepada:{" "}
            <span className="font-bold">{targetName}</span>
          </p>
        </div>
      )}

      {/* Input Form Sesuai BE (Hanya 2 Input Wajib, sisanya otomatis ditarik BE) */}
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase">
            Pilih Grup Panen
          </label>
          <div className="relative">
            <select
              value={formData.grup_penjualan_id}
              onChange={(e) => {
                setFormData({ ...formData, grup_penjualan_id: e.target.value });
                setShowDetailGrup(true); // Otomatis buka detail saat grup dipilih
              }}
              disabled={isLoadingGrup || dropdownGrup.length === 0}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
            >
              <option value="" disabled>
                {isLoadingGrup
                  ? "Memuat data grup panen..."
                  : dropdownGrup.length === 0
                    ? "Semua grup sudah diajukan pengiriman"
                    : "Pilih Grup Panen..."}
              </option>
              {dropdownGrup.map((grup) => (
                <option key={grup.id} value={grup.id}>
                  {grup.nama_grup} ({grup.estimasi_total_tbs_grup_kg || 0} Kg)
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* --- TOMBOL DAN PANEL DETAIL GRUP --- */}
          {selectedGrupData && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-2">
              <button
                type="button"
                onClick={() => setShowDetailGrup(!showDetailGrup)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                {showDetailGrup ? "Tutup Detail Grup" : "Lihat Detail Grup"}
              </button>

              {showDetailGrup && (
                <div className="mt-3 bg-blue-50/50 border border-blue-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                  {/* Kolom 1: Identitas & Spesifikasi */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-gray-800 font-bold uppercase mb-0.5">
                        Informasi Kebun :
                      </p>
                      <p className="text-gray-800 font-semibold">
                        {selectedGrupData.nama_kebun}
                      </p>
                      <p className="text-gray-600 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />{" "}
                        {selectedGrupData.no_hp_kebun || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-800 font-bold uppercase mb-0.5">
                        Spesifikasi Panen :
                      </p>
                      <p className="text-gray-800">
                        <span className="font-medium text-gray-600">
                          Jenis dan Varietas:
                        </span>{" "}
                        {selectedGrupData.jenis_varietas_gabungan}
                      </p>
                      <p className="text-gray-800">
                        <span className="font-medium text-gray-600">
                          Usia Pohon:
                        </span>{" "}
                        {selectedGrupData.usia_pohon_range}
                      </p>
                      <p className="text-gray-800">
                        <span className="font-medium text-gray-600">
                          Tgl Panen:
                        </span>{" "}
                        {selectedGrupData.tanggal_rencana_panen}
                      </p>
                      <p className="text-gray-800">
                        <span className="font-medium text-gray-600">
                          Total GrupTBS :
                        </span>{" "}
                        <span className="font-bold text-[#B5302D]">
                          {selectedGrupData.estimasi_total_tbs_grup_kg} Kg
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Kolom 2: Muatan, Logistik & Catatan */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-gray-800 font-bold uppercase mb-0.5">
                        Informasi Pengiriman :
                      </p>
                      <p className="text-gray-800">
                        <span className="font-medium text-gray-600">
                          Estimasi Jarak:
                        </span>{" "}
                        {selectedGrupData.estimasi_jarak_km} Km
                      </p>
                      <p className="text-gray-800">
                        <span className="font-medium text-gray-600">
                          Alamat Penjemputan:
                        </span>
                        <br />
                        {selectedGrupData.alamat_pickup_teks}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-800 font-bold uppercase mb-0.5">
                        Catatan :
                      </p>
                      <p
                        className="text-gray-800 line-clamp-2"
                        title={selectedGrupData.catatan_kebun}
                      >
                        <span className="font-medium text-gray-600">
                          Catatan Kebun:
                        </span>{" "}
                        {selectedGrupData.catatan_kebun || "-"}
                      </p>
                      <p
                        className="text-gray-800 line-clamp-2"
                        title={selectedGrupData.catatan_dari_pabrik}
                      >
                        <span className="font-medium text-gray-600">
                          Catatan dari Pabrik:
                        </span>{" "}
                        {selectedGrupData.catatan_dari_pabrik || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase">
            Tgl. Harus Sampai di Pabrik
          </label>
          <input
            type="date"
            value={formData.tanggal_permintaan_sampai}
            onChange={(e) =>
              setFormData({
                ...formData,
                tanggal_permintaan_sampai: e.target.value,
              })
            }
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none"
          />
        </div>
      </div>

      {/* Catatan Tambahan */}
      <div className="space-y-2 pt-2">
        <label className="text-[11px] font-bold text-gray-500 uppercase">
          Catatan Tambahan untuk Logistik
        </label>
        <textarea
          value={formData.catatan_logistik}
          onChange={(e) =>
            setFormData({ ...formData, catatan_logistik: e.target.value })
          }
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none min-h-[100px]"
          placeholder="Contoh: Tolong bawa terpal tambahan karena musim hujan..."
        ></textarea>
      </div>

      {/* Tombol Aksi */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={onSubmit}
          className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
        >
          Batal
        </button>
        <button
          onClick={handleSubmitData}
          disabled={isSubmitting}
          className="px-8 py-2.5 bg-[#B5302D] text-white rounded-xl text-xs font-bold shadow-lg shadow-red-100 hover:bg-[#962624] transition-all flex items-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? (
            "Mengirim..."
          ) : (
            <>
              <Save className="w-4 h-4" /> Kirim Pengajuan
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Wrapper Card Utama
const MainCard = ({ children }) => (
  <div className="relative bg-white rounded-[24px] border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 overflow-hidden group">
    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#B5302D] opacity-0 group-hover:opacity-100 transition-opacity" />
    {children}
  </div>
);

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

export default DistribusiLogistik;
