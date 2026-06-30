import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  Calendar,
  Hash,
  XCircle,
  CheckSquare,
  Loader2,
  ShoppingCart,
  PackageSearch,
  Inbox,
  Info,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { API_ENDPOINTS } from "../../config/constants.js";
import { showToast, confirmDialog } from "../../utils/notif";

const ManajemenPesanan = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // State untuk menampung data dari Backend
  const [pesananMasuk, setPesananMasuk] = useState([]);
  const [kruList, setKruList] = useState([]);
  const [kendaraanList, setKendaraanList] = useState([]);

  // --- TAMBAHAN UNTUK OPEN MARKET ---
  const [activeTab, setActiveTab] = useState("permintaan_masuk"); // Default tab
  const [etalaseList, setEtalaseList] = useState([]);
  const [acceptedList, setAcceptedList] = useState([]);

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
        console.log("=== DATA PESANAN MASUK DARI ROLE KEBUN ===", dataPesanan);

        // --- Ambil tanggal hari ini dan reset jamnya ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter status "menunggu konfirmasi" (Close Market)
        // ATAU status "diterima" (Langkah 5 Open Market: Menunggu Logistik Assign Armada)
        const pending = dataPesanan.filter((item) => {
          const status = item.status_permintaan?.toLowerCase();
          const isValidStatus =
            status === "menunggu konfirmasi" || status === "diterima";

          if (!item.tanggal_permintaan_sampai) return isValidStatus;

          const targetDate = new Date(item.tanggal_permintaan_sampai);
          targetDate.setHours(0, 0, 0, 0);

          return isValidStatus && targetDate >= today;
        });

        setPesananMasuk(pending);
      } else {
        console.log("=== BE PESANAN ERROR STATUS ===", resPesanan.status);
      }

      // 2. Fetch Data Open Market (Etalase)
      const resEtalase = await fetch(
        API_ENDPOINTS.FARM.MARKETPLACE.GET_LIST_SIAP_KIRIM,
        { headers },
      );
      if (resEtalase.ok) {
        const dataEtalase = await resEtalase.json();
        console.log(
          "=== ROLE LOGISTIK MELIHAT LIST YANG BISA DIAJUKAN KE KEBUN (OPEN MARKET) ===",
          dataEtalase,
        );
        setEtalaseList(dataEtalase);
      } else {
        console.log("=== BE ETALASE ERROR STATUS ===", resEtalase.status);
      }

      // 3. Fetch Dropdown Supir (Tersedia)
      const resKru = await fetch(
        API_ENDPOINTS.TRACEABILITY.LOGISTIK.DROPDOWN.KRU,
        { headers },
      );
      if (resKru.ok) setKruList(await resKru.json());

      // 4. Fetch Dropdown Kendaraan (Tersedia)
      const resKendaraan = await fetch(
        API_ENDPOINTS.TRACEABILITY.LOGISTIK.DROPDOWN.KENDARAAN,
        { headers },
      );
      if (resKendaraan.ok) setKendaraanList(await resKendaraan.json());

      // 5. [BARU] Fetch List yang sudah di-ACC Kebun (Menunggu Penugasan Armada)
      const resAccepted = await fetch(
        API_ENDPOINTS.FARM.MARKETPLACE.GET_DAFTAR_TUGASKAN_ARMADA,
        { headers },
      );
      if (resAccepted.ok) {
        const dataAccepted = await resAccepted.json();
        console.log("=== DATA MENUNGGU PENUGASAN ARMADA ===", dataAccepted);
        setAcceptedList(dataAccepted);
      } else {
        console.log("=== BE ACCEPTED ERROR STATUS ===", resAccepted.status);
      }
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
    <div className="space-y-6 p-4 md:p-8 min-h-screen font-sans">
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">
        {/* BAGIAN KIRI: Icon & Judul */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-red-50 rounded-xl sm:rounded-2xl shrink-0">
            <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D] leading-tight">
              Manajemen Pesanan
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Kelola permintaan masuk (close market) dan ajukan jasa ke kebun
              (open market).
            </p>
          </div>
        </div>

        {/* BAGIAN KANAN: TABS */}
        <div className="flex w-full lg:w-auto bg-gray-100 p-1 rounded-2xl border border-gray-200 shrink-0">
          <button
            onClick={() => setActiveTab("permintaan_masuk")}
            className={`flex-1 lg:flex-none flex justify-center items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
              activeTab === "permintaan_masuk"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Inbox
              className={`w-4 h-4 ${
                activeTab === "permintaan_masuk" ? "animate-pulse" : ""
              }`}
            />
            Close Market
          </button>

          <button
            onClick={() => setActiveTab("etalase")}
            className={`flex-1 lg:flex-none flex justify-center items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
              activeTab === "etalase"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <PackageSearch className="w-4 h-4" />
            Open Market
          </button>
        </div>
      </div>

      <hr className="border-gray-200 mb-5" />

      {/* --- DESKRIPSI & INFO SKENARIO --- */}
      <div className="mb-6 px-1">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-5 flex gap-3 sm:gap-4 items-start shadow-sm">
          <div className="bg-white p-1.5 rounded-full shadow-sm shrink-0">
            <Info className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-900 mb-1">
              {activeTab === "permintaan_masuk"
                ? "Skenario Close Market (Kebun->Logistik)"
                : "Skenario Open Market (Logistik->Kebun)"}
            </h4>
            <p className="text-xs sm:text-sm text-blue-800/80 leading-relaxed">
              {activeTab === "permintaan_masuk"
                ? "Pihak Kebun mengajukan permintaan jasa langsung ke logistik anda. Silahkan tinjau detail permintaan, lalu Anda bisa memilih terima/tolak"
                : "Pihak Kebun mempublikasikan muatan mereka yang siap kirim ke etalase publik. Logistik dapat menawarkan jasa armada kepada kebun tersebut."}
            </p>
          </div>
        </div>
      </div>

      {/* ================= TAB 1: PERMINTAAN MASUK (CLOSED MARKET) ================= */}
      {activeTab === "permintaan_masuk" && (
        <SectionCard
          title="Permintaan Jasa Logistik Dari Kebun"
          rightContent={
            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 bg-white border border-[#EF8523]/30 p-1.5 sm:pr-2.5 rounded-full shadow-[0_0_15px_rgba(239,133,35,0.15)] animate-pulse hover:animate-none transition-all w-full sm:w-max">
              <div className="flex items-center gap-2 sm:gap-3 pl-0.5 sm:pl-0">
                <div className="bg-gradient-to-br from-[#EF8523] to-[#d9751d] p-1.5 sm:p-2 rounded-full text-white shrink-0 shadow-sm">
                  <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-gray-700 leading-tight whitespace-nowrap">
                  Pastikan Armada <br className="hidden sm:block" />
                  <span className="text-[#EF8523] font-black sm:ml-0 ml-1">
                    Anda Ready!
                  </span>
                </p>
              </div>

              <button
                onClick={() => navigate("/logistik/armada")}
                className="bg-[#EF8523] hover:bg-[#d9751d] active:scale-95 text-white px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5 whitespace-nowrap ml-1"
              >
                Klik &rarr;
              </button>
            </div>
          }
        >
          {/* === KONTEN === */}
          <div className="space-y-4 mt-2">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 text-[#B5302D] animate-spin" />
              </div>
            ) : pesananMasuk.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm font-medium bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                Tidak ada permintaan pengiriman baru yang menunggu konfirmasi.
              </div>
            ) : (
              pesananMasuk.map((item, index) => (
                <LogistikItem
                  key={item.id ? `pesanan-${item.id}` : `pesanan-idx-${index}`}
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
      )}

      {/* ================= TAB 2: CARI MUATAN (OPEN MARKET) ================= */}
      {activeTab === "etalase" && (
        <div className="space-y-6">
          {/* --- SECTION 1: MENUNGGU PENUGASAN ARMADA --- */}
          <SectionCard
            title="Menunggu Penugasan Armada"
            rightContent={
              <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 bg-white border border-[#EF8523]/30 p-1.5 sm:pr-2.5 rounded-full shadow-[0_0_15px_rgba(239,133,35,0.15)] animate-pulse hover:animate-none transition-all w-full sm:w-max">
                <div className="flex items-center gap-2 sm:gap-3 pl-0.5 sm:pl-0">
                  <div className="bg-gradient-to-br from-[#EF8523] to-[#d9751d] p-1.5 sm:p-2 rounded-full text-white shrink-0 shadow-sm">
                    <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-700 leading-tight whitespace-nowrap">
                    Pastikan Armada <br className="hidden sm:block" />
                    <span className="text-[#EF8523] font-black sm:ml-0 ml-1">
                      Anda Ready!
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => navigate("/logistik/armada")}
                  className="bg-[#EF8523] hover:bg-[#d9751d] active:scale-95 text-white px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5 whitespace-nowrap ml-1"
                >
                  Klik &rarr;
                </button>
              </div>
            }
          >
            <div className="space-y-4 mt-2">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 text-[#B5302D] animate-spin" />
                </div>
              ) : acceptedList.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm font-medium bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                  Tidak ada grup penjualan yang menunggu penugasan saat ini.
                </div>
              ) : (
                acceptedList.map((item, index) => (
                  <AcceptedEtalaseItem
                    key={
                      item.id ? `accepted-${item.id}` : `accepted-idx-${index}`
                    }
                    item={item}
                    dropdownKru={kruList}
                    dropdownKendaraan={kendaraanList}
                    onRefresh={fetchSemuaData}
                  />
                ))
              )}
            </div>
          </SectionCard>

          {/* --- SECTION 2: ETALASE PUBLIK --- */}
          <SectionCard title="Etalase Publik (Siap Diajukan)">
            <div className="space-y-4 mt-2">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 text-[#B5302D] animate-spin" />
                </div>
              ) : etalaseList.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm font-medium bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                  Belum ada grup penjualan kebun yang siap dikirim saat ini.
                </div>
              ) : (
                etalaseList.map((item, index) => (
                  <EtalaseItem
                    key={
                      item.id ? `etalase-${item.id}` : `etalase-idx-${index}`
                    }
                    item={item}
                    onRefresh={fetchSemuaData}
                  />
                ))
              )}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
};

/* ===================== OPEN MARKET ===================== */
const EtalaseItem = ({ item, onRefresh }) => {
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const handleTawarkanJasa = async () => {
    console.log("Log Item Etalase:", item);

    const targetId = item.id_grup;

    if (!targetId) {
      console.error("ID tidak ditemukan dalam objek:", item);
      showToast.error("Error: ID Grup tidak ditemukan. Periksa konsol!");
      return;
    }

    // 1. Konfirmasi sederhana
    const isSetuju = await confirmDialog({
      title: "Ajukan Penawaran?",
      text: "Anda akan mengajukan penawaran jasa logistik ke grup ini. Lanjutkan?",
      confirmText: "Ya, Ajukan Sekarang!",
    });

    if (!isSetuju) return;

    setIsLoadingSubmit(true);
    try {
      const token = localStorage.getItem("token");

      // Pastikan targetId yang sudah dipastikan ada dikirim ke sini
      const url =
        API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.AJUKAN_PENAWARAN_OPEN_MARKET(
          targetId,
        );

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.detail || data.message || "Gagal mengajukan penawaran.",
        );

      showToast.success("Penawaran berhasil diajukan!");
      if (onRefresh) onRefresh();
    } catch (error) {
      showToast.error(error.message);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <MainCard>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
        {/* BAGIAN 1: IDENTITAS */}
        <div className="w-full lg:w-1/4 xl:w-1/5 shrink-0">
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest mb-1.5 inline-block">
            Open Market
          </span>
          <h4
            className="text-base font-black text-gray-900 leading-tight line-clamp-1"
            title={item.nama_grup}
          >
            Grup: {item.nama_grup || "-"}
          </h4>
          <p
            className="text-[11px] text-gray-500 font-medium mt-1 line-clamp-1"
            title={item.nama_kebun}
          >
            Pemilik:{" "}
            <span className="font-bold text-gray-700">
              {item.nama_kebun || "-"}
            </span>
          </p>
        </div>

        {/* BAGIAN 2: SPESIFIKASI */}
        <div className="flex-1 w-full bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100 flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="flex-1 space-y-2.5">
            <div>
              <p className="text-gray-400 font-bold text-[9px] uppercase mb-0.5">
                Tujuan (Pabrik)
              </p>
              <p
                className="font-black text-[#B5302D] text-sm line-clamp-1"
                title={item.nama_pabrik_tujuan}
              >
                {item.nama_pabrik_tujuan || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 font-bold text-[9px] uppercase mb-0.5">
                Titik Jemput
              </p>
              <p className="text-[11px] font-medium text-gray-700 line-clamp-2 leading-snug">
                <MapPin className="inline w-3 h-3 text-orange-500 mr-1" />{" "}
                {item.alamat_pickup_teks || "-"}
              </p>
            </div>
          </div>

          <div className="hidden sm:block w-px bg-gray-200"></div>

          <div className="flex-1 flex flex-col justify-center space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase">
                Est. Muatan
              </span>
              <span className="font-black text-[#B5302D] text-sm bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                {item.estimasi_total_tbs_grup_kg || 0} Kg
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase">
                Tgl Panen
              </span>
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-gray-400" />{" "}
                {item.tanggal_rencana_panen || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase">
                Jarak Est.
              </span>
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Truck className="w-3 h-3 text-gray-400" />{" "}
                {item.estimasi_jarak_km || 0} KM
              </span>
            </div>
          </div>
        </div>

        {/* BAGIAN 3: TOMBOL */}
        <div className="shrink-0 w-full lg:w-auto flex justify-end">
          <button
            onClick={handleTawarkanJasa}
            disabled={isLoadingSubmit}
            className="w-full lg:w-auto bg-[#EF8523] text-white px-6 py-3 lg:py-4 rounded-xl text-xs font-bold hover:bg-[#d9751d] shadow-md shadow-orange-100 transition-all flex items-center justify-center gap-2"
          >
            {isLoadingSubmit ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Ajukan Penawaran"
            )}
          </button>
        </div>
      </div>
    </MainCard>
  );
};

/* ===================== COMPONENT ITEM ACCEPTED OPEN MARKET ===================== */
const AcceptedEtalaseItem = ({
  item,
  dropdownKru,
  dropdownKendaraan,
  onRefresh,
}) => {
  // State untuk mengontrol Pop-up Penugasan
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  // State Form
  const [kruId, setKruId] = useState("");
  const [kendaraanId, setKendaraanId] = useState("");
  const [tglKeberangkatan, setTglKeberangkatan] = useState("");

  const handleTugaskan = async () => {
    if (!kruId || !kendaraanId || !tglKeberangkatan) {
      return showToast.error(
        "Supir, Kendaraan, dan Tanggal Keberangkatan wajib diisi!",
      );
    }

    // Konfirmasi ganda
    const isSetuju = await confirmDialog({
      title: "Konfirmasi Penugasan",
      text: "Anda akan menugaskan armada untuk pesanan ini. Lanjutkan?",
      confirmText: "Ya, Tugaskan!",
    });

    if (!isSetuju) return;

    setIsLoadingSubmit(true);
    try {
      const token = localStorage.getItem("token");
      const url =
        API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.TERIMA_TUGASKAN(
          item.pengiriman_id || item.id,
        );

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
          data.detail || data.message || "Gagal menugaskan armada.",
        );

      showToast.success("Armada berhasil ditugaskan dan Resi telah dibuat!");
      setIsAssignModalOpen(false); // Tutup pop-up
      onRefresh(); // Segarkan data
    } catch (error) {
      showToast.error(error.message);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <>
      {/* --- KARTU LIST UTAMA --- */}
      <MainCard>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1 w-full flex flex-col lg:flex-row gap-4">
            {/* Identitas Kebun & Status */}
            <div className="w-full lg:w-1/4 shrink-0">
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest mb-1.5 inline-block">
                {item.status_permintaan
                  ? item.status_permintaan.replace(/_/g, " ")
                  : "Menunggu Penugasan"}
              </span>
              <h4 className="text-sm font-black text-gray-900 leading-tight line-clamp-2">
                {item.nama_gapoktan || "Data Kebun Tidak Diketahui"}
              </h4>
            </div>

            {/* Grid Info Rute, Muatan & Waktu */}
            <div className="w-full lg:w-3/4 bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100 flex flex-col sm:flex-row gap-4">
              {/* Rute (Kiri) */}
              <div className="flex-1 space-y-3 border-b sm:border-b-0 sm:border-r border-gray-200 pb-3 sm:pb-0 pr-0 sm:pr-3">
                <div>
                  <p className="text-gray-400 font-bold text-[9px] uppercase mb-0.5">
                    Titik Jemput
                  </p>
                  <p
                    className="text-[11px] font-medium text-gray-700 line-clamp-2 leading-snug"
                    title={item.alamat_pickup_teks}
                  >
                    <MapPin className="inline w-3 h-3 text-orange-500 mr-1" />
                    {item.alamat_pickup_teks || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold text-[9px] uppercase mb-0.5">
                    Tujuan Pabrik
                  </p>
                  <p
                    className="text-[11px] font-bold text-[#B5302D] line-clamp-2 leading-snug"
                    title={item.alamat_pengiriman_pabrik}
                  >
                    <MapPin className="inline w-3 h-3 text-[#B5302D] mr-1" />
                    {item.alamat_pengiriman_pabrik || "-"}
                  </p>
                </div>
              </div>

              {/* Spesifikasi (Kanan) */}
              <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-4">
                <div>
                  <p className="text-gray-400 font-bold text-[9px] uppercase">
                    Est. Muatan
                  </p>
                  <p className="font-bold text-[#B5302D] text-xs bg-red-50 border border-red-100 px-1.5 py-0.5 rounded w-max mt-0.5">
                    {item.estimasi_total_tbs_grup_kg || 0} Kg
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold text-[9px] uppercase">
                    Jarak Est.
                  </p>
                  <p className="font-bold text-gray-700 text-[11px] mt-0.5 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-gray-400" />
                    {item.estimasi_jarak_km || 0} KM
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold text-[9px] uppercase">
                    Tgl Panen
                  </p>
                  <p className="font-bold text-gray-700 text-[11px] mt-0.5">
                    {item.tanggal_rencana_panen || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold text-[9px] uppercase">
                    Target Tiba
                  </p>
                  <p className="font-bold text-gray-700 text-[11px] mt-0.5">
                    {item.tanggal_permintaan_sampai || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TOMBOL BUKA POP-UP */}
          <div className="shrink-0 w-full lg:w-auto flex justify-end mt-2 lg:mt-0">
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="w-full lg:w-auto px-5 py-3 rounded-xl bg-gray-100 text-[#B5302D] border border-gray-200 hover:bg-[#B5302D] hover:text-white hover:border-[#B5302D] text-xs font-bold transition-all flex items-center justify-center gap-2 group"
            >
              <Truck className="w-4 h-4 transition-colors" /> Tugaskan Armada
            </button>
          </div>
        </div>
      </MainCard>

      {/* --- MODAL POP-UP PENUGASAN ARMADA --- */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-black flex items-center gap-2">
                <Truck className="w-5 h-5" /> Form Penugasan Armada
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-5 space-y-4 bg-white">
              <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl mb-2">
                <p className="text-[11px] text-black leading-relaxed">
                  Tugaskan armada untuk Kebun <b className="text-[#B5302D]">{item.nama_gapoktan}</b>.
                  Muatan estimasi adalah{" "}
                  <b className="text-[#B5302D]">
                    {item.estimasi_total_tbs_grup_kg} Kg
                  </b>
                  . Pastikan truk yang dipilih sesuai kapasitas.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">
                  Pilih Supir
                </label>
                <select
                  value={kruId}
                  onChange={(e) => setKruId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium outline-none focus:bg-white focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all"
                >
                  <option value="">-- Silakan Pilih Supir --</option>
                  {dropdownKru.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama_supir}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">
                  Pilih Truk
                </label>
                <select
                  value={kendaraanId}
                  onChange={(e) => setKendaraanId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium outline-none focus:bg-white focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all"
                >
                  <option value="">-- Silakan Pilih Kendaraan --</option>
                  {dropdownKendaraan.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nama_kendaraan} ({v.plat_kendaraan}) - Kapasitas:{" "}
                      {v.kapasitas_angkut_kg} Kg
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">
                  Tgl Keberangkatan
                </label>
                <input
                  type="date"
                  value={tglKeberangkatan}
                  onChange={(e) => setTglKeberangkatan(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium outline-none focus:bg-white focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                disabled={isLoadingSubmit}
                className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-200 text-xs font-bold transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleTugaskan}
                disabled={isLoadingSubmit}
                className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-green-700 shadow-md shadow-green-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
        </div>
      )}
    </>
  );
};

/* ===================== COMPONENT ITEM LOGISTIK (CLOSED MARKET) ===================== */
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
    if (!catatanPenolakan.trim()) {
      return showToast.error("Catatan penolakan wajib diisi!");
    }

    const isSetuju = await confirmDialog({
      title: "Yakin Ingin Menolak?",
      text: "Permintaan pengiriman ini akan dibatalkan secara permanen.",
      confirmText: "Ya, Tolak!",
      isDanger: true,
    });

    if (!isSetuju) return;

    setIsLoadingSubmit(true);
    try {
      const token = localStorage.getItem("token");
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

      showToast.success("Pesanan berhasil ditolak.");
      onRefresh();
    } catch (error) {
      showToast.error(error.message);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  // FUNGSI API TERIMA & TUGASKAN (ACC)
  const handleTerima = async () => {
    if (!kruId || !kendaraanId || !tglKeberangkatan) {
      return showToast.error(
        "Supir, Kendaraan, dan Tanggal Berangkat wajib diisi!",
      );
    }

    const isSetuju = await confirmDialog({
      title: "Konfirmasi Penugasan Armada",
      text: "Pastikan Supir dan Kendaraan yang Anda pilih sudah benar. Lanjutkan?",
      confirmText: "Ya, Tugaskan!",
      isDanger: false,
    });

    if (!isSetuju) return;

    setIsLoadingSubmit(true);
    try {
      const token = localStorage.getItem("token");
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

      showToast.success(
        data.message || "Armada berhasil ditugaskan! Resi telah dibuat.",
      );
      onRefresh();
    } catch (error) {
      showToast.error(error.message);
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
            <div className="animate-in fade-in slide-in-from-bottom-4 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[32px] border border-gray-200 shadow-sm">
              <h4 className="text-base sm:text-xl font-bold text-[#B5302D] mb-4 sm:mb-8 flex items-center gap-2">
                <Truck className="w-4 h-4 sm:w-6 sm:h-6" /> Tugaskan Armada
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* DROPDOWN SUPIR */}
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase ml-1">
                    Pilih Supir (Tersedia)
                  </label>
                  <select
                    value={kruId}
                    onChange={(e) => setKruId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm outline-none focus:border-red-200"
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
                  <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase ml-1">
                    Pilih Kendaraan (Tersedia)
                  </label>
                  <select
                    value={kendaraanId}
                    onChange={(e) => setKendaraanId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm outline-none focus:border-red-200"
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
                  <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase ml-1">
                    Tgl Berangkat
                  </label>
                  <input
                    type="date"
                    value={tglKeberangkatan}
                    onChange={(e) => setTglKeberangkatan(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm outline-none focus:border-red-200"
                  />
                </div>
              </div>

              {/* TOMBOL SIMPAN */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-5 sm:pt-6 border-t border-gray-50">
                <button
                  onClick={() => setViewState("detail")}
                  className="px-6 py-2 sm:py-2.5 bg-gray-100 text-gray-600 rounded-lg sm:rounded-xl text-xs font-bold w-full sm:w-auto"
                >
                  Kembali
                </button>
                <button
                  onClick={handleTerima}
                  disabled={isLoadingSubmit}
                  className="bg-green-600 text-white px-8 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-bold hover:bg-green-700 shadow-md shadow-green-100 flex items-center justify-center gap-2 w-full sm:w-auto transition-all"
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

// --- KOMPONEN SECTION CARD ---
const SectionCard = ({ title, rightContent, children }) => (
  <div className="bg-white rounded-[30px] sm:rounded-[36px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden hover:shadow-md transition-all">
    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-90" />

    {/* Flex wrapper agar judul di kiri, tombol di kanan */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4 border-b border-gray-50 pb-4">
      <h3 className="text-base sm:text-lg font-bold text-[#B5302D] flex items-center gap-2">
        {title}
      </h3>
      {rightContent && (
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar shrink-0">
          {rightContent}
        </div>
      )}
    </div>

    {children}
  </div>
);

/* --- KOMPONEN HELPER --- */
const MainCard = ({ children }) => (
  <div className="relative bg-white rounded-[24px] sm:rounded-[32px] border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 sm:p-8 overflow-hidden group">
    <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-[#B5302D] opacity-0 group-hover:opacity-100 transition-opacity" />
    {children}
  </div>
);

export default ManajemenPesanan;
