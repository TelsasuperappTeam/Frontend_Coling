import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronDown,
  X,
  Save,
  AlertCircle,
  CalendarPlus,
  Scale,
  RefreshCw,
  Edit,
  History,
  Eye,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { API_ENDPOINTS, API_BASE_URLS } from "../../../../config/constants";
import MonitoringGAP from "./MonitoringGAP";

// KOMPONEN UTAMA
export default function CatatAktivitas() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State dasar UI
  const [unit, setUnit] = useState("");
  const [openSection, setOpenSection] = useState("realisasi");

  // State Logika Bisnis
  const [hasHarvestPlan, setHasHarvestPlan] = useState(false);

  // === STATE REALISASI TANAM ===
  const [loadingRealisasi, setLoadingRealisasi] = useState(false);
  const [isEditingRealisasi, setIsEditingRealisasi] = useState(false);

  const [realisasiData, setRealisasiData] = useState({
    namaUnit: "",
    jenisTanah: "",
    tanggalTanam: "",
    luasUnit: "",
    jenisBibit: "",
    jenisLahan: "",
    jumlahTanamanPerHa: "",
    jumlahTotalTanaman: "",
    jarakTanam: "",
    jarakTanamLainnya: "", // Tambahan baru
  });

  const [catatanPerubahan, setCatatanPerubahan] = useState("");

  // --- STATE DATA MONITORING (Parent tetap memegang State Data) ---
  const [monitoringData, setMonitoringData] = useState({
    sanitasi: [],
    coverCrop: [],
    piringan_aktivitas: [],
    piringan_kondisi: [],
    pupuk: [],
    opt: [],
  });

  // === STATE HISTORY SIKLUS (DINAMIS SESUAI BE MAHAR) ===
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // [DOKUMENTASI] Menyimpan list ringkas siklus (nomor & status) dari endpoint GET_ARSIP_SIKLUS_LIST
  const [historyList, setHistoryList] = useState([]);

  // [DOKUMENTASI] Menyimpan detail lengkap satu siklus saat diklik (read only)
  const [selectedCycleDetail, setSelectedCycleDetail] = useState(null);

  // [DOKUMENTASI] Menyimpan meta info siklus saat ini dari Header Blok (is_siklus_finished, dll)
  const [currentCycleInfo, setCurrentCycleInfo] = useState({
    nomorSiklus: 0,
    isFinished: false,
    sisaLuas: 0,
  });

  // FETCH DATA API UTAMA (DETAIL BLOK)
  const fetchRealisasiDetail = useCallback(async () => {
    setLoadingRealisasi(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // 1. Ambil Detail Blok (Header)
      let blokEndpoint = API_ENDPOINTS.FARM.PETANI.ACTIVITY.GET_BLOK_DETAIL(id);
      const responseBlok = await fetch(blokEndpoint, {
        method: "GET",
        headers,
      });

      if (responseBlok.ok) {
        const dataBlok = await responseBlok.json();
        setUnit(dataBlok.nama_unit);
        setRealisasiData({
          namaUnit: dataBlok.nama_unit,
          jenisTanah: dataBlok.jenis_tanah,
          tanggalTanam: dataBlok.tanggal_tanam_blok,
          luasUnit: `${dataBlok.luas_unit} Ha`,
          jenisBibit: dataBlok.jenis_bibit,
          jenisLahan: dataBlok.jenis_lahan,
          jumlahTanamanPerHa: dataBlok.jumlah_tanaman_per_ha,
          jumlahTotalTanaman: dataBlok.jumlah_total_tanaman,
          jarakTanam: dataBlok.jarak_tanam,
          jarakTanamLainnya: dataBlok.jarak_tanam_lainnya || "",
        });

        if (dataBlok.status_panen === "done") setHasHarvestPlan(true);

        // --- 2. CEK STATUS SIKLUS KE BACKEND ---
        // Panggil endpoint pengecekan khusus buatan BE
        let isSiklusSelesai = false;
        try {
          const statusRes = await fetch(
            API_ENDPOINTS.FARM.PETANI.ACTIVITY.CEK_STATUS_SIKLUS(id),
            { headers },
          );
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            // BE mengembalikan {"bisa_ganti": true/false}
            isSiklusSelesai = statusData.bisa_ganti;
          }
        } catch (err) {
          console.error("Gagal cek status ganti siklus", err);
        }

        setCurrentCycleInfo((prev) => ({
          ...prev,
          isFinished: isSiklusSelesai,
        }));

        // Fetch Data Monitoring Terpisah Sesuai Dokumen BE Poin 5
        // Gunakan Promise.all agar parallel dan cepat
        const baseMonitoringUrl = `${API_BASE_URLS.FARM}/farm/me/monitoring/${id}`;

        const [sanitasiRes, pupukRes, optRes, coverCropRes] = await Promise.all(
          [
            fetch(`${baseMonitoringUrl}/kebersihan`, { headers }), // Endpoint Sanitasi
            fetch(`${baseMonitoringUrl}/pupuk`, { headers }), // Endpoint Pupuk
            fetch(`${baseMonitoringUrl}/pestisida`, { headers }), // Endpoint OPT/Pestisida
            fetch(`${baseMonitoringUrl}/cover-crop`, { headers }), // Endpoint Cover Crop
            // Tambahkan piringan/drainase jika ada endpointnya
          ],
        );

        const sanitasiData = sanitasiRes.ok ? await sanitasiRes.json() : [];
        const pupukData = pupukRes.ok ? await pupukRes.json() : [];
        const optData = optRes.ok ? await optRes.json() : [];
        const coverCropData = coverCropRes.ok ? await coverCropRes.json() : [];

        // Set State Monitoring dengan data dari endpoint spesifik
        setMonitoringData({
          sanitasi: sanitasiData,
          pupuk: pupukData,
          opt: optData,
          coverCrop: coverCropData,
          piringan_aktivitas: [], // Sesuaikan jika ada endpointnya
          piringan_kondisi: [],
        });
      }
    } catch (error) {
      console.error("Error koneksi:", error);
    } finally {
      setLoadingRealisasi(false);
    }
  }, [id]);

  // [DOKUMENTASI / SESUAI BE MAHAR]
  // Fetch List Arsip Siklus (Dropdown/List)
  // Endpoint: GET /farm/me/blok/{blok_id}/list-arsip
  const fetchHistoryList = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        API_ENDPOINTS.FARM.PETANI.ACTIVITY.GET_ARSIP_SIKLUS_LIST(id);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistoryList(data);

        // --- LOGIKA BARU MENCARI SIKLUS AKTIF ---
        let activeCycleNum = 1;
        if (data.length > 0) {
          // 1. Cek jika BE mengirimkan siklus yang belum selesai
          const isAnyActive = data.find(
            (item) =>
              item.status &&
              !item.status.toUpperCase().includes("ARSIP") &&
              !item.status.toUpperCase().includes("SELESAI"),
          );

          if (isAnyActive) {
            activeCycleNum = isAnyActive.nomor_siklus;
          } else {
            // 2. JIKA SEMUA ADALAH ARSIP, MAKA SIKLUS AKTIF = SIKLUS ARSIP TERBESAR + 1
            activeCycleNum = Math.max(...data.map((d) => d.nomor_siklus)) + 1;
          }
        }

        setCurrentCycleInfo((prev) => ({
          ...prev,
          nomorSiklus: activeCycleNum,
        }));
      }
    } catch (error) {
      console.error("Error fetching history list:", error);
    } finally {
      setLoadingHistory(false);
    }
  }, [id]);

  // [DOKUMENTASI / SESUAI BE MAHAR]
  // Fetch Detail Satu Siklus (Saat item history diklik)
  // Endpoint: GET /farm/me/blok/{blok_id}/arsip/{nomor_siklus}
  const fetchCycleDetail = async (nomorSiklus) => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      // Ganti penggunaan API_ENDPOINTS dengan template literal langsung
      const endpoint = `${API_BASE_URLS.FARM}/farm/me/blok/${id}/arsip/${nomorSiklus}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Menyimpan data detail lengkap (info_siklus, monitoring, panen, dll)
        setSelectedCycleDetail(data);
      }
    } catch (error) {
      console.error("Error fetching cycle detail:", error);
      alert("Gagal mengambil detail siklus.");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRealisasiDetail();
      // Kita fetch history list di awal agar data tersedia saat modal dibuka
      fetchHistoryList();
    }
  }, [id, fetchRealisasiDetail, fetchHistoryList]);

  const handleRealisasiChange = (e) => {
    const { name, value } = e.target;
    if (name === "catatan_perubahan") {
      setCatatanPerubahan(value);
    } else {
      setRealisasiData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveRealisasi = async () => {
    if (!catatanPerubahan || catatanPerubahan.trim() === "") {
      alert("Catatan perubahan belum diisi. Mohon tuliskan alasannya.");
      return;
    }
    setLoadingRealisasi(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        realisasi_jumlah_total_tanaman: parseInt(
          realisasiData.jumlahTotalTanaman,
        ),
        realisasi_jumlah_tanaman_per_ha: parseInt(
          realisasiData.jumlahTanamanPerHa,
        ),
        realisasi_jarak_tanam: realisasiData.jarakTanam,
        realisasi_jarak_tanam_lainnya:
          realisasiData.jarakTanam === "Lainnya"
            ? realisasiData.jarakTanamLainnya
            : null,
        catatan_perubahan: catatanPerubahan,
        // Tambahan wajib untuk Backend Pydantic:
        created_at: new Date().toISOString(),
      };

      const baseUrl = API_ENDPOINTS?.FARM?.PETANI?.AMBIL_RENCANA_TANAM
        ? API_ENDPOINTS.FARM.PETANI.AMBIL_RENCANA_TANAM
        : `${API_BASE_URLS.FARM}/farm/me/blok`;
      const endpoint = `${baseUrl}/${id}/realisasi`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Realisasi disimpan & Siklus Aktif diperbarui!");
        await fetchRealisasiDetail();
        setIsEditingRealisasi(false);
        setCatatanPerubahan("");
        fetchRealisasiDetail();
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setLoadingRealisasi(false);
    }
  };

  // --- LOGIKA SIKLUS BARU (DIPERBARUI DENGAN BE) ---
  const handleNewCycle = async () => {
    if (!currentCycleInfo.isFinished) {
      alert(
        `Siklus ke-${currentCycleInfo.nomorSiklus} saat ini belum selesai. Tidak bisa memulai siklus baru.`,
      );
      return;
    }

    const confirmMsg = `Anda akan menutup Siklus Ke-${currentCycleInfo.nomorSiklus} dan memulai siklus baru.\n\nData sebelumnya akan diarsipkan. Lanjutkan?`;

    if (confirm(confirmMsg)) {
      try {
        const token = localStorage.getItem("token");
        const endpoint =
          API_ENDPOINTS.FARM.PETANI.ACTIVITY.BUAT_SIKLUS_BARU(id);

        // 1. Tembak API Backend untuk Reset Siklus
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          alert(result.message || "Siklus baru berhasil dimulai!");

          // 2. Refresh Data Halaman agar UI mendeteksi Siklus 2
          await fetchRealisasiDetail();
          fetchHistoryList();

          // 3. Arahkan pengguna untuk mengisi Realisasi Tanam untuk Siklus Baru
          alert("Silakan catat Realisasi Tanam untuk siklus yang baru ini.");
          setOpenSection("realisasi");
          setIsEditingRealisasi(true);
          setRealisasiData({
            ...realisasiData,
            tanggalTanam: "", // Kosongkan agar diisi ulang
          });
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          const errorData = await response.json();
          alert(
            `Gagal membuat siklus baru: ${errorData.detail || errorData.message}`,
          );
        }
      } catch (error) {
        console.error("Error trigger siklus baru:", error);
        alert("Terjadi kesalahan jaringan saat mencoba membuat siklus baru.");
      }
    }
  };

  const handleHarvestAction = () => {
    navigate(
      `/petani/manajemenkebun/budidayamonitoring/catataktivitas/panen/${id}`,
    );
  };

  // RENDER MODAL RIWAYAT SIKLUS (DENGAN DETAIL DINAMIS SESUAI BE MAHAR)
  const renderHistoryPopup = () => {
    if (!showHistoryModal) return null;

    // Mapping Data dari Backend
    const meta = selectedCycleDetail?.meta;
    const tanam = selectedCycleDetail?.data_tanam;
    const panen = selectedCycleDetail?.data_panen || [];
    const monitoring = selectedCycleDetail?.data_monitoring;

    // Hitung total panen dari array data_panen
    const totalTbsSiklusIni = panen.reduce((total, p) => {
      return total + (p.hasil_panen?.jumlah_total_tbs_terkumpul || 0);
    }, 0);

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-[95%] sm:w-full max-w-3xl flex flex-col max-h-[85vh]">
          {/* Header Modal */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
            <div>
              <h3 className="text-sm sm:text-lg font-bold text-[#B5302D]">
                {selectedCycleDetail
                  ? `Detail Arsip Siklus Ke-${meta?.siklus_yang_ditampilkan || "-"}`
                  : "Daftar Riwayat Siklus"}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500">
                {selectedCycleDetail
                  ? `Unit: ${meta?.blok_nama}`
                  : "Pilih siklus untuk melihat detail arsip"}
              </p>
            </div>
            <div className="flex gap-2">
              {selectedCycleDetail && (
                <button
                  onClick={() => setSelectedCycleDetail(null)}
                  className="px-3 py-1.5 text-xs font-bold bg-gray-200 hover:bg-gray-300 rounded-lg text-black transition"
                >
                  Kembali ke List
                </button>
              )}
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedCycleDetail(null);
                }}
                className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500 hover:text-red-600" />
              </button>
            </div>
          </div>

          {/* Body Modal */}
          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
            {loadingHistory ? (
              <div className="text-center py-10">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#EF8523]" />
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  Membongkar Arsip...
                </p>
              </div>
            ) : selectedCycleDetail ? (
              // --- TAMPILAN DETAIL SIKLUS (BACA DATA BE YANG ASLI) ---
              <div className="space-y-5 animate-fadeIn">
                {/* 1. INFORMASI TANAM & STATUS */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-blue-900 text-sm mb-3 border-b border-blue-200 pb-2">
                    Informasi Penanaman
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-gray-500 mb-0.5">Status Siklus</p>
                      <p className="font-bold text-black bg-white px-2 py-1 rounded inline-block border border-gray-200">
                        {tanam?.status || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">Tanggal Tanam</p>
                      <p className="font-bold text-black">
                        {tanam?.tanggal_tanam || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">Bibit Digunakan</p>
                      <p className="font-bold text-black">
                        {tanam?.jenis_bibit} ({tanam?.varietas})
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">Jumlah Pohon Awal</p>
                      <p className="font-bold text-black">
                        {tanam?.jumlah_pohon_awal || 0} Pokok
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. RANGKUMAN PANEN */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <div className="flex justify-between items-center mb-3 border-b border-green-200 pb-2">
                    <h4 className="font-bold text-green-900 text-sm">
                      Hasil Produksi Panen
                    </h4>
                    <span className="font-extrabold text-green-700 bg-white px-3 py-1 rounded-full text-xs shadow-sm">
                      Total: {totalTbsSiklusIni} Kg
                    </span>
                  </div>

                  {panen.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">
                      Belum ada riwayat panen di siklus ini.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {panen.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-white p-2 rounded-lg text-xs border border-green-100"
                        >
                          <div>
                            <span className="font-bold text-gray-700">
                              {p.tanggal_rencana_panen}
                            </span>
                            <span className="text-gray-500 ml-2">
                              ({p.status})
                            </span>
                          </div>
                          <span className="font-bold text-green-600">
                            + {p.hasil_panen?.jumlah_total_tbs_terkumpul || 0}{" "}
                            Kg
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. REKAP MONITORING (DARI DUMMY JADI DATA ASLI) */}
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <h4 className="font-bold text-orange-900 text-sm mb-3 border-b border-orange-200 pb-2">
                    Rekapitulasi Perawatan
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-orange-100 text-center shadow-sm">
                      <p className="text-2xl font-black text-[#EF8523]">
                        {monitoring?.pupuk?.length || 0}
                      </p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                        Kali Pemupukan
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-orange-100 text-center shadow-sm">
                      <p className="text-2xl font-black text-[#EF8523]">
                        {monitoring?.pestisida?.length || 0}
                      </p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                        Kali Semprot Hama
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-orange-100 text-center shadow-sm">
                      <p className="text-2xl font-black text-[#EF8523]">
                        {monitoring?.sanitasi?.length || 0}
                      </p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                        Kegiatan Sanitasi
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-orange-100 text-center shadow-sm">
                      <p className="text-2xl font-black text-[#EF8523]">
                        {monitoring?.piringan?.length || 0}
                      </p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                        Cek Piringan
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : // --- TAMPILAN LIST SIKLUS (AWAL) ---
            historyList.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <History className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 font-medium text-xs sm:text-sm">
                  Belum ada riwayat siklus yang diarsipkan.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyList.map((item) => (
                  <div
                    key={item.nomor_siklus}
                    onClick={() => fetchCycleDetail(item.nomor_siklus)}
                    className={`border rounded-xl p-4 flex justify-between items-center transition cursor-pointer shadow-sm hover:shadow-md ${
                      item.status === "AKTIF"
                        ? "bg-green-50 border-green-200 hover:bg-green-100"
                        : "bg-white border-gray-200 hover:border-[#EF8523]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-extrabold text-black text-sm sm:text-base">
                          Siklus Ke-{item.nomor_siklus}
                        </p>
                        {item.status === "AKTIF" && (
                          <span className="text-[9px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
                            Berjalan
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                        Mulai: {item.tanggal_mulai} • Produksi:{" "}
                        <span className="font-bold text-black">
                          {item.total_produksi} Kg
                        </span>
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-[#EF8523] bg-gray-50 hover:bg-orange-50 p-2 rounded-full transition">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    // Container utama: Padding lebih nyaman di mobile
    <div className="p-3 sm:p-6 min-h-screen font-sans text-black pb-24">
      {/* HEADER NAVIGASI */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#EF8523] transition px-2 py-1.5 rounded-lg hover:bg-white active:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Kembali
        </button>
        <button
          onClick={() => {
            setShowHistoryModal(true);
            fetchHistoryList(); // Refresh list saat buka modal
          }}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-600 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-[#B5302D] transition shadow-sm active:scale-95 transform"
        >
          <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Riwayat Siklus
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* TITLE PAGE */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-5 sm:mb-8 border-b border-gray-200 pb-3">
          <div className="flex-1">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#B5302D] leading-tight">
              Catat Aktivitas & Monitoring
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Siklus Saat Ini:{" "}
              <span className="font-bold text-black">
                #{currentCycleInfo.nomorSiklus}
              </span>{" "}
              • Status:{" "}
              {currentCycleInfo.isFinished ? (
                <span className="text-green-600 font-bold">
                  Selesai (Panen Final)
                </span>
              ) : (
                <span className="text-blue-600 font-bold">Berjalan</span>
              )}
            </p>
          </div>
          <span className="self-start sm:self-auto bg-white border border-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full text-[10px] sm:text-sm shadow-sm font-medium tracking-wide">
            Unit: {unit || "..."}
          </span>
        </div>

        {/* SECTION 1: REALISASI TANAM*/}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-5">
          <div
            className="bg-[#EF8523] px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center cursor-pointer hover:bg-[#d9751d] transition"
            onClick={() =>
              setOpenSection(openSection === "realisasi" ? null : "realisasi")
            }
          >
            <div className="flex-1 pr-2">
              <h2 className="font-bold text-white text-sm sm:text-lg">
                Catat Data Tanam Sebenarnya
              </h2>
              <p className="text-white text-[10px] sm:text-xs mt-0.5 font-light opacity-90 leading-tight">
                (OPSIONAL) Catat data realisasi tanam di lapangan jika ada
                perubahan dari rencana awal.
              </p>
            </div>
            <ChevronDown
              className={`text-white w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${
                openSection === "realisasi" ? "rotate-180" : ""
              }`}
            />
          </div>

          {openSection === "realisasi" && (
            <div className="p-4 sm:p-6 bg-white">
              {loadingRealisasi ? (
                <div className="text-center py-8">
                  <span className="text-gray-400 text-xs sm:text-sm animate-pulse flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    Mengambil data...
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3">
                    <div className="flex items-start gap-2 bg-blue-50 text-blue-700 p-3 rounded-lg text-xs sm:text-sm border border-blue-100 w-full md:w-auto">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Berikut ini data dari Input Data Blok/Rencana Tanam
                        anda. Mandor wajib mencatat realisasi rencana jika
                        terjadi perubahan tanam berdasarkan data lapangan dengan
                        Klik <span className="font-bold">Catat Realisasi</span>.
                      </p>
                    </div>
                    {!isEditingRealisasi && (
                      <button
                        onClick={() => setIsEditingRealisasi(true)}
                        className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition shadow-sm active:scale-95"
                      >
                        <Edit className="w-4 h-4" /> Catat Realisasi
                      </button>
                    )}
                  </div>

                  {/* FORM GRID - REVISI: TAMPILAN MOBILE 2 KOLOM (grid-cols-2) */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-6 text-sm">
                    <div className="space-y-3">
                      <ReadOnlyField
                        label="1. Nama Unit"
                        value={realisasiData.namaUnit || "-"}
                      />
                      <ReadOnlyField
                        label="2. Jenis Tanah"
                        value={realisasiData.jenisTanah || "-"}
                      />
                      <ReadOnlyField
                        label="3. Tanggal Tanam"
                        value={realisasiData.tanggalTanam || "-"}
                      />
                      <EditableField
                        label="4. Jumlah Tanaman / Ha"
                        name="jumlahTanamanPerHa"
                        value={realisasiData.jumlahTanamanPerHa}
                        onChange={handleRealisasiChange}
                        disabled={!isEditingRealisasi}
                      />
                    </div>
                    <div className="space-y-3">
                      <ReadOnlyField
                        label="5. Luas Unit"
                        value={realisasiData.luasUnit || "-"}
                      />
                      <ReadOnlyField
                        label="6. Jenis Bibit"
                        value={realisasiData.jenisBibit || "-"}
                      />
                      <ReadOnlyField
                        label="7. Jenis Lahan"
                        value={realisasiData.jenisLahan || "-"}
                      />
                      <EditableField
                        label="8. Total Bibit / Tanaman"
                        name="jumlahTotalTanaman"
                        value={realisasiData.jumlahTotalTanaman}
                        onChange={handleRealisasiChange}
                        disabled={!isEditingRealisasi}
                      />
                      <EditableSelectField
                        label="9. Jarak Tanam"
                        name="jarakTanam"
                        value={realisasiData.jarakTanam}
                        onChange={handleRealisasiChange}
                        disabled={!isEditingRealisasi}
                        options={[
                          { value: "8x9", label: "8 x 9 Meter" },
                          { value: "9x9", label: "9 x 9 Meter" },
                          { value: "7x9", label: "7 x 9 Meter" },
                          { value: "Lainnya", label: "Lainnya" },
                        ]}
                      />

                      {/* Munculkan input ini hanya jika Jarak Tanam == "Lainnya" */}
                      {realisasiData.jarakTanam === "Lainnya" && (
                        <div className="mt-3">
                          <EditableField
                            label="Tuliskan Jarak Tanam"
                            name="jarakTanamLainnya"
                            value={realisasiData.jarakTanamLainnya}
                            onChange={handleRealisasiChange}
                            disabled={!isEditingRealisasi}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditingRealisasi && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <label className="block text-sm font-bold text-[#B5302D] mb-2">
                        Catatan Perubahan{" "}
                        <span className="text-[10px] font-normal text-gray-500">
                          (Wajib, min. 10 karakter)
                        </span>
                      </label>
                      <textarea
                        name="catatan_perubahan"
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#EF8523] outline-none transition"
                        placeholder="Contoh: Ada perubahan jumlah bibit karena..."
                        value={catatanPerubahan}
                        onChange={handleRealisasiChange}
                      ></textarea>
                      <div className="flex flex-col-reverse sm:flex-row justify-end mt-4 gap-3">
                        <button
                          onClick={() => {
                            setIsEditingRealisasi(false);
                            setCatatanPerubahan("");
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleSaveRealisasi}
                          className="w-full sm:w-auto bg-[#B5302D] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 hover:bg-[#B5302D]/80 transition shadow-md active:scale-95"
                        >
                          <Save className="w-4 h-4" /> Simpan Realisasi
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: MONITORING GAP */}
        <MonitoringGAP
          monitoringData={monitoringData}
          setMonitoringData={setMonitoringData}
          openSection={openSection}
          setOpenSection={setOpenSection}
          blokId={id}
          isCycleFinished={currentCycleInfo.isFinished}
        />

        {renderHistoryPopup()}

        {/* FOOTER ACTIONS */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <h3 className="text-xs sm:text-sm font-bold text-black mb-3 uppercase tracking-wide">
            Aksi Penyelesaian & Siklus
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleHarvestAction}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-3 rounded-lg shadow-sm transition-all border active:scale-[0.98] ${
                !hasHarvestPlan
                  ? "bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                  : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
              }`}
            >
              {!hasHarvestPlan ? (
                <CalendarPlus className="w-5 h-5" />
              ) : (
                <Scale className="w-5 h-5" />
              )}
              <span className="text-sm font-bold">
                {!hasHarvestPlan
                  ? "Buat Rencana Panen"
                  : "Lihat / Catat Hasil Panen"}
              </span>
            </button>

            <button
              onClick={handleNewCycle}
              disabled={!currentCycleInfo.isFinished}
              className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 sm:py-3 rounded-lg shadow-sm transition-all active:scale-[0.98] ${
                currentCycleInfo.isFinished
                  ? "bg-green-50 border border-green-200 text-green-800 hover:bg-green-100 cursor-pointer"
                  : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <RefreshCw className="w-5 h-5" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-sm font-bold">Mulai Siklus Baru</span>
                <span className="text-[10px] font-normal opacity-70 mt-0.5">
                  {currentCycleInfo.isFinished
                    ? "Siklus lama selesai"
                    : "Tunggu Panen Selesai"}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// === HELPER KOMPONEN KECIL ===
function ReadOnlyField({ label, value }) {
  return (
    <div>
      <p className="text-black font-bold text-[11px] sm:text-xs mb-1.5 truncate">
        {label}
      </p>
      <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-gray-600 cursor-not-allowed">
        {value}
      </div>
    </div>
  );
}

function EditableField({ label, value, onChange, name, disabled }) {
  return (
    <div>
      <p className="text-black font-bold text-[11px] sm:text-xs mb-1.5 flex justify-between items-center">
        <span className="truncate">{label}</span>
        {!disabled && (
          <span className="text-[9px] text-red-600 font-medium bg-red-50 px-1.5 py-0.5 border border-red-100 rounded animate-pulse whitespace-nowrap">
            Wajib
          </span>
        )}
      </p>
      <input
        type="text"
        name={name}
        disabled={disabled}
        className={`w-full border rounded-lg px-3 py-2.5 text-xs sm:text-sm outline-none transition-all duration-200 ${
          disabled
            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-300 focus:ring-2 focus:ring-[#EF8523] text-black shadow-sm"
        }`}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function EditableSelectField({
  label,
  value,
  onChange,
  name,
  disabled,
  options,
}) {
  return (
    <div>
      <p className="text-black font-bold text-[11px] sm:text-xs mb-1.5 flex justify-between items-center">
        <span className="truncate">{label}</span>
        {!disabled && (
          <span className="text-[9px] text-red-600 font-medium bg-red-50 px-1.5 py-0.5 border border-red-100 rounded animate-pulse whitespace-nowrap">
            Wajib
          </span>
        )}
      </p>
      <select
        name={name}
        disabled={disabled}
        className={`w-full border rounded-lg px-3 py-2.5 text-xs sm:text-sm outline-none transition-all duration-200 ${
          disabled
            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed appearance-none"
            : "bg-white border-gray-300 focus:ring-2 focus:ring-[#EF8523] text-black shadow-sm"
        }`}
        value={value || ""}
        onChange={onChange}
      >
        <option value="" disabled>
          -- Pilih {label.split(". ")[1]} --
        </option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
