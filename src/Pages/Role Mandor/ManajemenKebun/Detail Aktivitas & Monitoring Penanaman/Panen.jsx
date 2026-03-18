import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Save,
  Plus,
  Clock,
  X,
  CheckCircle,
  Truck,
  FileText,
  Leaf,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

// Mengimpor konfigurasi API BE MAHAR
import { API_ENDPOINTS } from "../../../../config/constants";

/**
 * KOMPONEN PANEN
 * Fitur: Manajemen Rencana Panen & Pencatatan Realisasi Panen (Log Harian)
 * Integrasi: BE Mahar (Python FastApi)
 */

export default function Panen() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ID Blok aktif (default 1 jika tidak ada params)
  const ACTIVE_BLOK_ID = id ? parseInt(id) : 1;

  // ================= STATE MANAGEMENT =================

  // DATA BLOK (Header Info)
  const [blokData, setBlokData] = useState(null);
  const [loadingBlok, setLoadingBlok] = useState(true);

  // DATA RENCANA PANEN & REALISASI
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // DATA RIWAYAT PEMANENAN
  const [harvestLogs, setHarvestLogs] = useState([]);

  // STATE MODALS & UI
  const [activeModal, setActiveModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STATE TAMPILAN (ACCORDION / TOGGLE SECTION)
  // REVISI LOGIKA: Deteksi layar. Jika Mobile (<768px) default FALSE (Tutup), Desktop default TRUE (Buka).
  const [openSection, setOpenSection] = useState({
    rencana: window.innerWidth >= 768,
    realisasi: window.innerWidth >= 768,
  });

  // FORM STATES
  // Buat Rencana Panen Baru SESUAI PERMINTAAN BE MAHAR
  const [formPlan, setFormPlan] = useState({
    tanggal: "",
    estimasi: "",
    luas: "",
  });

  // Log Realisasi (Catatan Harian / Per Pemanen) SESUAI PERMINTAAN BE MAHAR
  const [formLog, setFormLog] = useState({
    selectedPlanId: "",
    tanggal: "",
    namaPetani: "",
    jamMulai: "",
    jamSelesai: "",
    jumlahTandan: "",
    kondisiKebun: "",
  });

  // Finalisasi Hasil (Tutup Buku) SESUAI PERMINTAAN BE MAHAR
  const [formResult, setFormResult] = useState({
    planId: null,
    brondolan: "",
    kualitas: "",
  });

  // ================= FETCH DATA =================

  const fetchBlokDetail = useCallback(async () => {
    setLoadingBlok(true);
    try {
      const token = localStorage.getItem("token");
      const url =
        API_ENDPOINTS.FARM.PETANI.ACTIVITY.GET_BLOK_DETAIL(ACTIVE_BLOK_ID);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Gagal mengambil detail blok");

      const data = await response.json();
      setBlokData({
        ...data,
        isCycleFinished: data.is_siklus_finished,
      });
    } catch (error) {
      console.error("Error fetching blok detail:", error);
      setBlokData({
        id: ACTIVE_BLOK_ID,
        nama_blok: "Blok (Data Tidak Tersedia)",
        nama_unit: "-",
      });
    } finally {
      setLoadingBlok(false);
    }
  }, [ACTIVE_BLOK_ID]);

  const fetchRencanaPanen = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const token = localStorage.getItem("token");
      const url =
        API_ENDPOINTS.FARM.PETANI.ACTIVITY.GET_RENCANA_PANEN_LIST(
          ACTIVE_BLOK_ID
        );

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Gagal mengambil data rencana panen");

      const data = await response.json();

      const mappedPlans = data.map((item) => ({
        id: item.id,
        unit: item.nama_unit,
        tanggal: item.tanggal_rencana_panen,
        estimasi: item.estimasi_total_tbs_kg,
        status: item.status,
        luas: item.luas_lahan_dipanen,
        alasan:
          item.catatan_penolakan ||
          item.alasan_penolakan ||
          "Tidak ada catatan.",
        catatan_pemanenan: item.catatan_pemanenan || [],
        hasil_panen: item.hasil_panen || null,
      }));

      setPlans(mappedPlans);

      const allLogs = mappedPlans.flatMap((plan) =>
        plan.catatan_pemanenan.map((log) => ({
          id: log.id,
          planId: plan.id,
          namaUnit: plan.unit,
          tanggal: log.tanggal_pemanenan,
          namaPetani: log.nama_pemanen,
          jamMulai: log.jam_mulai,
          jamSelesai: log.jam_selesai,
          jumlahTandan: log.jumlah_tandan_dipanen,
          kondisiKebun: log.kondisi_kebun,
        }))
      );

      allLogs.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
      setHarvestLogs(allLogs);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoadingPlans(false);
    }
  }, [ACTIVE_BLOK_ID]);

  useEffect(() => {
    if (ACTIVE_BLOK_ID) {
      fetchBlokDetail();
      fetchRencanaPanen();
    }
  }, [ACTIVE_BLOK_ID, fetchBlokDetail, fetchRencanaPanen]);

  // ================= HANDLERS =================

  const handleSavePlan = async () => {
    if (!formPlan.tanggal || !formPlan.luas || !formPlan.estimasi) {
      return alert("Mohon lengkapi Tanggal, Luas Lahan, dan Estimasi!");
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const url =
        API_ENDPOINTS.FARM.PETANI.ACTIVITY.ADD_RENCANA_PANEN(ACTIVE_BLOK_ID);

      const payload = {
        tanggal_rencana_panen: formPlan.tanggal,
        luas_lahan_dipanen: parseFloat(formPlan.luas),
        estimasi_total_tbs_kg: parseFloat(formPlan.estimasi),
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Gagal membuat rencana panen");
      }

      alert("Rencana Panen Berhasil Dibuat!");
      fetchRencanaPanen();
      setFormPlan({ tanggal: "", estimasi: "", luas: "" });
      setActiveModal(null);
    } catch (error) {
      console.error("Gagal submit rencana:", error);
      alert(`Gagal: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveLog = async () => {
    if (!formLog.selectedPlanId || !formLog.namaPetani || !formLog.jumlahTandan)
      return alert("Mohon lengkapi Rencana, Nama Pemanen, dan Jumlah Tandan!");

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const url = API_ENDPOINTS.FARM.PETANI.ACTIVITY.ADD_REALISASI_PANEN;

      const payload = {
        rencana_panen_id: parseInt(formLog.selectedPlanId),
        nama_pemanen: formLog.namaPetani,
        tanggal_pemanenan: formLog.tanggal,
        jam_mulai: formLog.jamMulai,
        jam_selesai: formLog.jamSelesai,
        jumlah_tandan_dipanen: parseFloat(formLog.jumlahTandan),
        kondisi_kebun: formLog.kondisiKebun || "",
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Gagal menyimpan catatan.");
      }

      alert("Catatan pemanenan berhasil disimpan!");
      fetchRencanaPanen();
      setFormLog({
        selectedPlanId: "",
        tanggal: "",
        namaPetani: "",
        jamMulai: "",
        jamSelesai: "",
        jumlahTandan: "",
        kondisiKebun: "",
      });
      setActiveModal(null);
    } catch (error) {
      console.error("Gagal save log:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openResultModal = (planId) => {
    setFormResult({
      planId: planId,
      brondolan: "",
      kualitas: "",
    });
    setActiveModal("result");
  };

  const handleSaveResult = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const planId = formResult.planId;
      const url = API_ENDPOINTS.FARM.PETANI.ACTIVITY.FINALISASI_PANEN(planId);

      const payload = {
        kualitas_tbs: formResult.kualitas,
        banyak_berondolan_dikumpulkan: parseInt(formResult.brondolan) || 0,
        catatan_list: [],
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Gagal finalisasi panen.");
      }

      alert("Panen berhasil diselesaikan & ditutup!");
      fetchRencanaPanen();
      setActiveModal(null);
    } catch (error) {
      console.error("Gagal finalisasi:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper Toggle Section
  const toggleSection = (section) => {
    setOpenSection((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusColor = (status) => {
    const s = status ? status.toUpperCase() : "";
    if (s === "DISETUJUI")
      return "bg-green-100 text-green-700 border-green-200";
    if (s === "PENDING" || s === "MENUNGGU")
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (s === "SELESAI") return "bg-blue-100 text-blue-700 border-blue-200";
    if (s === "DITOLAK") return "bg-red-100 text-red-700 border-red-200";
    return "bg-gray-100 text-gray-600";
  };

  if (loadingBlok) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#EF8523] animate-spin" />
          <p className="text-xs sm:text-sm font-medium text-gray-500">
            Memuat Data Panen...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen font-sans text-gray-800 pb-24">
      {/* Header Navigasi */}
      <div className="max-w-7xl mx-auto mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#EF8523] transition px-2 py-1.5 rounded-md hover:bg-gray-100 w-fit"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Kembali
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* ================= SECTION 1 RENCANA PANEN ================= */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header Section (Clickable) */}
          <div
            className="p-4 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 bg-gradient-to-r from-white to-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection("rencana")}
          >
            <div className="flex items-center justify-between w-full md:w-auto">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#B5302D] flex items-center gap-2">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6" /> Rencana Panen
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                  Daftar rencana untuk unit{" "}
                  <span className="font-bold text-gray-800">
                    {blokData?.nama_unit || `Blok #${ACTIVE_BLOK_ID}`}
                  </span>
                </p>
              </div>

              {/* Ikon Chevron (Hanya visual mobile agar tau bisa diklik) */}
              <div
                className={`transform transition-transform duration-300 ml-3 md:hidden ${
                  openSection.rencana ? "rotate-180" : ""
                }`}
              >
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <button
              type="button"
              disabled={blokData?.isCycleFinished}
              onClick={(e) => {
                if (blokData?.isCycleFinished) {
                  alert(
                    "Siklus saat ini sudah selesai. Silakan mulai siklus baru di menu Aktivitas/Realisasi."
                  );
                  return;
                }
                e.stopPropagation();
                setActiveModal("plan");
              }}
              className={`flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2.5 rounded-lg border text-sm font-semibold shadow-sm
                ${
                  blokData?.isCycleFinished
                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#B5302D] border-[#B5302D] text-white hover:bg-[#962624] hover:border-[#962624]"
                }`}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Buat Rencana Baru</span>
            </button>
          </div>

          {/* Bagian Section (Hidden/Shown based on state) */}
          {openSection.rencana && (
            <div className="p-4 sm:p-6 bg-gray-50/30 animate-fadeIn">
              {loadingPlans ? (
                <div className="flex justify-center py-8 sm:py-12">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#B5302D] animate-spin" />
                </div>
              ) : plans.length === 0 ? (
                <EmptyState text="Belum ada rencana panen yang dibuat pada blok ini." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`
                        border rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 bg-white relative overflow-hidden group flex flex-col justify-between
                        ${
                          plan.status === "DITOLAK"
                            ? "border-red-200 bg-red-50/20"
                            : "border-gray-200"
                        }
                        ${plan.status === "SELESAI" ? "opacity-80" : ""}
                      `}
                    >
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                        <span
                          className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border shadow-sm ${getStatusColor(
                            plan.status
                          )}`}
                        >
                          {plan.status || "PENDING"}
                        </span>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 text-gray-700 font-bold text-base sm:text-lg">
                          <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          {plan.unit}
                        </div>

                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {new Date(plan.tanggal).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 sm:pt-3 border-t border-gray-100 mt-2">
                          <div>
                            <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold">
                              Estimasi
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-800">
                              {plan.estimasi} Kg
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold">
                              Luas
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-800">
                              {plan.luas} Ha
                            </p>
                          </div>
                        </div>

                        {plan.status === "DITOLAK" && (
                          <div className="mt-2 bg-red-50 border border-red-200 p-2.5 sm:p-3 rounded-lg animate-fadeIn">
                            <p className="text-[9px] sm:text-[10px] font-bold text-red-800 uppercase mb-0.5 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Catatan
                              Penolakan:
                            </p>
                            <p className="text-[10px] sm:text-xs text-red-700 leading-relaxed italic">
                              "{plan.alasan}"
                            </p>
                          </div>
                        )}
                      </div>

                      {plan.status === "SELESAI" && (
                        <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100 flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="text-[10px] sm:text-xs font-bold">
                            Panen Selesai
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= SECTION 2 REALISASI PANEN ================= */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div
            className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleSection("realisasi")}
          >
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#B5302D] flex items-center gap-2">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6" /> Realisasi Panen
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                Pencatatan aktivitas pemanenan dan hasil panen aktual.
              </p>
            </div>
            <div
              className={`transform transition-transform duration-300 ${
                openSection.realisasi ? "rotate-180" : ""
              }`}
            >
              <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </div>
          </div>

          {/* Content Section (Hidden/Shown) */}
          {openSection.realisasi && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 min-h-[400px] sm:min-h-[500px] animate-fadeIn">
              {/* --- CATATAN PEMANENAN --- */}
              <div className="flex flex-col h-full">
                <div className="p-4 sm:p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                  <div>
                    <h3 className="font-bold text-gray-800 text-xs sm:text-sm uppercase tracking-wide">
                      Catatan Aktivitas
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Log harian per pemanen
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModal("log")}
                    className="flex items-center gap-1.5 sm:gap-2 bg-white border border-[#EF8523] text-[#EF8523] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold hover:bg-orange-50 transition shadow-sm"
                  >
                    <Plus className="w-3 h-3" /> Tambah Catatan
                  </button>
                </div>

                <div className="p-4 sm:p-6 bg-gray-50/30 flex-1 overflow-y-auto max-h-[500px] sm:max-h-[600px]">
                  {harvestLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 sm:h-48 text-center opacity-60">
                      <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mb-2" />
                      <p className="text-xs sm:text-sm text-gray-500">
                        Belum ada catatan aktivitas panen.
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        Klik "Tambah Catatan" untuk mulai.
                      </p>
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-gray-200 ml-2 sm:ml-3 space-y-4 sm:space-y-6 pb-4">
                      {harvestLogs.map((log, idx) => (
                        <div
                          key={`${log.id}-${idx}`}
                          className="relative pl-5 sm:pl-6 animate-fadeIn"
                        >
                          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-[#EF8523]"></div>

                          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-[#EF8523] transition-all group">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] sm:text-xs font-bold text-[#EF8523] bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                {log.tanggal}
                              </span>
                              <span className="text-[9px] sm:text-[10px] text-gray-400 font-mono">
                                PLAN ID: {log.planId}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] sm:text-xs font-bold text-gray-600">
                                {log.namaPetani.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800 text-xs sm:text-sm leading-tight">
                                  {log.namaPetani}
                                </h4>
                                <p className="text-[10px] text-gray-500">
                                  Pemanen
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs text-gray-600 bg-gray-50 p-2 rounded-md">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span>
                                  {log.jamMulai} - {log.jamSelesai}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 font-bold text-gray-800">
                                <Leaf className="w-3 h-3 text-green-500" />
                                <span>{log.jumlahTandan} Tandan</span>
                              </div>
                            </div>

                            {log.kondisiKebun && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold">
                                  Kondisi Kebun
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-700 italic">
                                  "{log.kondisiKebun}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ---FINALISASI / HASIL PANEN --- */}
              <div className="flex flex-col h-full bg-white">
                <div className="p-4 sm:p-5 border-b border-gray-100 sticky top-0 z-10 bg-white">
                  <h3 className="font-bold text-gray-800 text-xs sm:text-sm uppercase tracking-wide">
                    Finalisasi Hasil Panen
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    Selesaikan rencana panen yang sudah dieksekusi
                  </p>
                </div>

                <div className="p-4 sm:p-6 flex-1 overflow-y-auto max-h-[500px] sm:max-h-[600px] space-y-4 sm:space-y-6">
                  {/* PENDING FINALISASI */}
                  <div>
                    <h4 className="text-[10px] sm:text-xs font-bold text-gray-500 mb-2 sm:mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500"></span>
                      MENUNGGU FINALISASI (DISETUJUI)
                    </h4>

                    {plans.filter(
                      (p) => p.status === "DISETUJUI" && !p.hasil_panen
                    ).length === 0 ? (
                      <div className="text-center py-4 sm:py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-[10px] sm:text-xs text-gray-400">
                          Tidak ada rencana aktif yang perlu diselesaikan.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {plans
                          .filter(
                            (p) => p.status === "DISETUJUI" && !p.hasil_panen
                          )
                          .map((plan) => (
                            <div
                              key={plan.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white border border-blue-100 rounded-lg shadow-sm hover:shadow-md transition-all gap-3 sm:gap-4"
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs sm:text-sm font-bold text-gray-800">
                                    {plan.tanggal}
                                  </span>
                                  <span className="text-[9px] sm:text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">
                                    Aktif
                                  </span>
                                </div>
                                <p className="text-[10px] sm:text-xs text-gray-500">
                                  Target: {plan.estimasi} Kg &bull;{" "}
                                  <span className="font-bold text-gray-700">
                                    {plan.catatan_pemanenan.length} Catatan
                                    Masuk
                                  </span>
                                </p>
                              </div>
                              <button
                                onClick={() => openResultModal(plan.id)}
                                className="text-[10px] sm:text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold transition shadow-sm whitespace-nowrap"
                              >
                                Selesaikan Panen
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* RIWAYAT SELESAI */}
                  <div>
                    <h4 className="text-[10px] sm:text-xs font-bold text-gray-500 mb-2 sm:mb-3 flex items-center gap-2 pt-4 border-t border-gray-100">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>
                      RIWAYAT SELESAI (CLOSED)
                    </h4>

                    {plans.filter((p) => p.hasil_panen).length === 0 ? (
                      <p className="text-[10px] sm:text-xs text-gray-400 italic ml-2 sm:ml-4">
                        Belum ada riwayat panen selesai.
                      </p>
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {plans
                          .filter((p) => p.hasil_panen)
                          .map((plan) => (
                            <div
                              key={plan.id}
                              className="p-3 sm:p-4 bg-green-50/50 border border-green-100 rounded-lg hover:border-green-300 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-2 sm:mb-3">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                  <div>
                                    <p className="text-xs sm:text-sm font-bold text-green-800">
                                      Panen Selesai
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                      {plan.tanggal}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-white p-2.5 sm:p-3 rounded border border-green-100">
                                <div>
                                  <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold">
                                    Total TBS
                                  </p>
                                  <p className="text-xs sm:text-sm font-bold text-gray-800">
                                    {
                                      plan.hasil_panen
                                        .jumlah_total_tbs_terkumpul
                                    }{" "}
                                    Kg
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold">
                                    Brondolan
                                  </p>
                                  <p className="text-xs sm:text-sm font-bold text-gray-800">
                                    {
                                      plan.hasil_panen
                                        .banyak_berondolan_dikumpulkan
                                    }{" "}
                                    Kg
                                  </p>
                                </div>
                              </div>

                              {plan.hasil_panen.kualitas_tbs && (
                                <div className="mt-2 text-[10px] sm:text-xs text-gray-600 px-1">
                                  <span className="font-bold text-gray-500">
                                    Kualitas:{" "}
                                  </span>
                                  {plan.hasil_panen.kualitas_tbs}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* BUAT TAMBAH RENCANA */}
      {activeModal === "plan" && (
        <ModalLayout
          title="Buat Rencana Panen"
          onClose={() => setActiveModal(null)}
          onSave={handleSavePlan}
          loading={isSubmitting}
        >
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <InputField
              label="ID Blok (otomatis)"
              value={blokData?.id || ""}
              readOnly={true}
            />
            <InputField
              label="Nama Unit/Blok (otomatis)"
              value={blokData?.nama_unit || ""}
              readOnly={true}
            />
          </div>

          <InputField
            label="Tanggal Rencana"
            type="date"
            value={formPlan.tanggal}
            onChange={(e) =>
              setFormPlan({ ...formPlan, tanggal: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <InputField
              label="Luas Lahan (Ha)"
              type="number"
              placeholder="Contoh: 1.5"
              value={formPlan.luas}
              onChange={(e) =>
                setFormPlan({ ...formPlan, luas: e.target.value })
              }
            />
            <InputField
              label="Estimasi TBS (Kg)"
              type="number"
              placeholder="Contoh: 5000"
              value={formPlan.estimasi}
              onChange={(e) =>
                setFormPlan({ ...formPlan, estimasi: e.target.value })
              }
            />
          </div>
        </ModalLayout>
      )}

      {/* BUAT TAMBAH CATATAN */}
      {activeModal === "log" && (
        <ModalLayout
          title="Catat Aktivitas Pemanenan"
          onClose={() => setActiveModal(null)}
          onSave={handleSaveLog}
          loading={isSubmitting}
        >
          <div className="mb-3 sm:mb-4">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Pilih Rencana Panen (Hanya Yang Disetujui)
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#EF8523] bg-white transition-all"
              value={formLog.selectedPlanId}
              onChange={(e) => {
                const plan = plans.find(
                  (p) => p.id === parseInt(e.target.value)
                );
                setFormLog({
                  ...formLog,
                  selectedPlanId: e.target.value,
                  tanggal: plan ? plan.tanggal : "",
                });
              }}
            >
              <option value="">-- Pilih Rencana --</option>
              {plans
                .filter((p) => p.status === "DISETUJUI" && !p.hasil_panen)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.unit} - {p.tanggal} (Est: {p.estimasi} Kg)
                  </option>
                ))}
            </select>
            <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1">
              *Hanya rencana berstatus "DISETUJUI" yang dapat ditambahkan
              catatan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <InputField
              label="Tanggal Panen"
              type="date"
              value={formLog.tanggal}
              onChange={(e) =>
                setFormLog({ ...formLog, tanggal: e.target.value })
              }
            />
            <InputField
              label="Nama Pemanen"
              placeholder="Masukkan nama..."
              value={formLog.namaPetani}
              onChange={(e) =>
                setFormLog({ ...formLog, namaPetani: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <InputField
              label="Jam Mulai"
              type="time"
              value={formLog.jamMulai}
              onChange={(e) =>
                setFormLog({ ...formLog, jamMulai: e.target.value })
              }
            />
            <InputField
              label="Jam Selesai"
              type="time"
              value={formLog.jamSelesai}
              onChange={(e) =>
                setFormLog({ ...formLog, jamSelesai: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <InputField
              label="Jumlah Tandan (Buah)"
              type="number"
              placeholder="0"
              value={formLog.jumlahTandan}
              onChange={(e) =>
                setFormLog({ ...formLog, jumlahTandan: e.target.value })
              }
            />
            <div className="w-full">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Kondisi Kebun
              </label>
              <input
                type="text"
                placeholder="Bersih / Semak / Banjir"
                value={formLog.kondisiKebun}
                onChange={(e) =>
                  setFormLog({ ...formLog, kondisiKebun: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#EF8523]"
              />
            </div>
          </div>
        </ModalLayout>
      )}

      {/* 3. MODAL INPUT HASIL (FINALISASI) */}
      {activeModal === "result" && (
        <ModalLayout
          title="Finalisasi Panen (Tutup Buku)"
          onClose={() => setActiveModal(null)}
          onSave={handleSaveResult}
          loading={isSubmitting}
        >
          <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-100 mb-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 shrink-0 mt-0.5" />
            <div className="text-[10px] sm:text-xs text-orange-800">
              <p className="font-bold mb-1">Konfirmasi Penyelesaian</p>
              <p>
                Anda akan menyelesaikan Rencana ID:{" "}
                <strong>{formResult.planId}</strong>. Total Berat (Kg) akan
                dihitung otomatis oleh sistem berdasarkan akumulasi jumlah
                tandan dan rata-rata berat janjang (BJR).
              </p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <InputField
              label="Total Brondolan Dikumpulkan (Kg)"
              type="number"
              placeholder="0"
              value={formResult.brondolan}
              onChange={(e) =>
                setFormResult({ ...formResult, brondolan: e.target.value })
              }
            />
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Kualitas / Catatan Sortasi
              </label>
              <textarea
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#EF8523] outline-none transition-all"
                placeholder="Contoh: Buah mentah 2%, Tangkai panjang, Kematangan pas..."
                value={formResult.kualitas}
                onChange={(e) =>
                  setFormResult({ ...formResult, kualitas: e.target.value })
                }
              />
            </div>
          </div>
        </ModalLayout>
      )}
    </div>
  );
}

// ================= KOMPONEN REUSABLE =================

function ModalLayout({ title, onClose, onSave, children, loading }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-[95%] sm:w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto flex flex-col transform transition-all scale-100">
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-bold text-gray-800">
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex-1 overflow-y-auto">
          {children}
        </div>
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-200 transition"
          >
            Batal
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-[#B5302D] hover:bg-[#962624] text-white flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />{" "}
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Simpan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  readOnly = false,
}) {
  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-gray-700 mb-1 sm:mb-1.5">
        {label}
      </label>
      <input
        type={type}
        disabled={readOnly}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#EF8523] transition-all
          ${
            readOnly
              ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
              : "bg-white hover:border-gray-400"
          }
        `}
      />
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
      <div className="bg-white p-2.5 sm:p-3 rounded-full mb-2 sm:mb-3 shadow-sm">
        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
      </div>
      <p className="text-xs sm:text-sm text-gray-400 font-medium max-w-xs">
        {text}
      </p>
    </div>
  );
}
