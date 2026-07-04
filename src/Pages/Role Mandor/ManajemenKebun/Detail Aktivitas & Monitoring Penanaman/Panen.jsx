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
  FileText,
  Loader2,
  AlertCircle,
  ChevronDown,
  Leaf,
  ClipboardList,
  History,
  Eye,
  RefreshCw,
  MapPin,
} from "lucide-react";

import { API_ENDPOINTS, API_BASE_URLS } from "../../../../config/constants";
import { showToast, confirmDialog } from "../../../../utils/notif";

export default function Panen() {
  const navigate = useNavigate();
  const { id } = useParams();

  const ACTIVE_BLOK_ID = id ? parseInt(id) : 1;

  // ================= STATE MANAGEMENT PANEN =================
  const [blokData, setBlokData] = useState(null);
  const [loadingBlok, setLoadingBlok] = useState(true);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [harvestLogs, setHarvestLogs] = useState([]);

  // ================= STATE UNTUK ANALITIK =================
  const [analitikData, setAnalitikData] = useState(null);
  const [loadingAnalitik, setLoadingAnalitik] = useState(true);

  const [activeModal, setActiveModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);

  const [openSection, setOpenSection] = useState({
    rencana: window.innerWidth >= 768,
    realisasi: window.innerWidth >= 768,
  });

  const [formPlan, setFormPlan] = useState({
    tanggal: "",
    estimasi: "",
    luas: "",
  });
  const [formLog, setFormLog] = useState({
    selectedPlanId: "",
    tanggal: "",
    namaPetani: "",
    jamMulai: "",
    jamSelesai: "",
    jumlahTandan: "",
    jumlah_pokok_dipanen: "",
    kondisiKebun: "",
  });
  const [formResult, setFormResult] = useState({
    planId: null,
    brondolan: "",
    kualitas: "",
  });

  // ================= STATE MANAGEMENT SIKLUS =================
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [currentCycleInfo, setCurrentCycleInfo] = useState({
    nomorSiklus: 0,
    isFinished: false,
    sisaLuas: 0,
    pesanSiklus: "",
  });
  // ================= FETCH DATA (API INTEGRATION) =================

  // 1. Fetch Detail Blok, Cek Status Siklus, dan Analitik
  const fetchBlokDetail = useCallback(async () => {
    setLoadingBlok(true);
    setLoadingAnalitik(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const url =
        API_ENDPOINTS.FARM.PETANI.ACTIVITY.GET_BLOK_DETAIL(ACTIVE_BLOK_ID);
      const response = await fetch(url, { method: "GET", headers });

      if (!response.ok) throw new Error("Gagal mengambil detail blok");
      const data = await response.json();

      // --- LOGIKA CEK STATUS SIKLUS ---
      let isSiklusSelesai = false;
      let pesanDariBackend = "";
      try {
        const statusRes = await fetch(
          API_ENDPOINTS.FARM.PETANI.ACTIVITY.CEK_STATUS_SIKLUS(ACTIVE_BLOK_ID),
          { headers },
        );
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          isSiklusSelesai = statusData.bisa_ganti;
          pesanDariBackend = statusData.pesan;
        }
      } catch (err) {
        console.error("Gagal cek status ganti siklus", err);
      }

      // --- FETCH DATA ANALITIK ---
      try {
        const urlAnalitik =
          API_ENDPOINTS.FARM.PETANI.ACTIVITY.GET_ANALITIK_PENEN(ACTIVE_BLOK_ID);
        const analitikRes = await fetch(urlAnalitik, { headers });
        if (analitikRes.ok) {
          const analitikDataResp = await analitikRes.json();
          // Console log untuk melihat isi data yang dikirim dari Backend
          console.log("[DEBUG DATA ANALITIK DARI BE]:", analitikDataResp);

          setAnalitikData(analitikDataResp);
        }
      } catch (err) {
        console.error("Gagal fetch analitik", err);
      }

      setBlokData(data);

      setCurrentCycleInfo((prev) => ({
        ...prev,
        nomorSiklus: data.nomor_siklus_saat_ini,
        isFinished: isSiklusSelesai,
        pesanSiklus: pesanDariBackend,
      }));
    } catch (error) {
      console.error("Error fetching blok detail:", error);
    } finally {
      setLoadingBlok(false);
      setLoadingAnalitik(false); // <--- Akhiri loading analitik
    }
  }, [ACTIVE_BLOK_ID]);

  // 2. Fetch List Arsip Siklus (PINDAHAN)
  const fetchHistoryList = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        API_ENDPOINTS.FARM.PETANI.ACTIVITY.GET_LIST_ARSIP_SIKLUS(
          ACTIVE_BLOK_ID,
        );

      console.log("[DEBUG GET] URL List Arsip Siklus:", endpoint);

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
      }
    } catch (error) {
      console.error("Error fetching history list:", error);
    } finally {
      setLoadingHistory(false);
    }
  }, [ACTIVE_BLOK_ID]);

  // 3. Fetch Rencana Panen
  const fetchRencanaPanen = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const url =
        API_ENDPOINTS.FARM.PETANI.ACTIVITY.GET_RENCANA_PANEN_LIST(
          ACTIVE_BLOK_ID,
        );

      // BE sudah otomatis memberikan data Siklus Aktif saja
      const response = await fetch(url, { method: "GET", headers });
      if (!response.ok) throw new Error("Gagal mengambil data rencana panen");

      const data = await response.json();
      console.log("=== DATA RESPONS BE RENCANA PANEN ===", data);

      // --- MAPPING ASYNCHRONOUS DENGAN FETCH GATEKEEPER ---
      const mappedPlans = await Promise.all(
        data.map(async (item) => {
          let gatekeeperData = null;

          if (item.status === "DISETUJUI" && !item.hasil_panen) {
            try {
              const gkUrl = `${API_BASE_URLS.FARM}/farm/me/rencana-panen/${item.id}/gatekeeper`;
              const gkRes = await fetch(gkUrl, { method: "GET", headers });
              if (gkRes.ok) {
                gatekeeperData = await gkRes.json();
              }
            } catch (e) {
              console.error(`Gagal fetch gatekeeper untuk plan ${item.id}`, e);
            }
          }

          return {
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
            grup_id: item.grup_penjualan_id || null,
            status_pabrik: item.status_pabrik || null,
            status_logistik: item.status_logistik || null,
            gatekeeper: gatekeeperData,
          };
        }),
      );

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
          jumlahPokok: log.jumlah_pokok_dipanen,
          kondisiKebun: log.kondisi_kebun,
        })),
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
      fetchHistoryList();
      fetchRencanaPanen();
    }
  }, [ACTIVE_BLOK_ID, fetchBlokDetail, fetchHistoryList, fetchRencanaPanen]);

  // ================= HANDLERS =================

  const handleSavePlan = async () => {
    if (!formPlan.tanggal || !formPlan.luas || !formPlan.estimasi) {
      showToast.error(
        "Masih ada kolom yang belum diisi. Silakan lengkapi Tanggal, Luas Lahan, dan Estimasi terlebih dahulu.",
      );
      return;
    }

    // KONFIRMASI (YANG HARUS NO. 1)
    const isSetuju = await confirmDialog({
      title: editingPlanId ? "Simpan Perubahan?" : "Kirim Rencana Panen?",
      text: editingPlanId
        ? "Pastikan perubahan rencana panen sudah sesuai."
        : "Permintaan rencana panen akan diteruskan ke Role Kebun. Kebun nantinya akan menjual ke pabrik dan mencarikan logistik. Anda bisa memantau prosesnya di menu Riwayat Penjualan.",
      confirmText: editingPlanId ? "Ya, Simpan" : "Ya, Kirim Rencana",
      cancelText: "Batal",
      isDanger: false,
    });

    if (!isSetuju) return;

    // Tutup popup duluan agar loading terlihat jelas dan tidak tertumpuk
    setActiveModal(null);
    setIsSubmitting(true);
    showToast.loading("Menyimpan rencana panen...");

    try {
      const token = localStorage.getItem("token");

      const url = editingPlanId
        ? API_ENDPOINTS.FARM.PETANI.ACTIVITY.UPDATE_RENCANA_PANEN(editingPlanId)
        : API_ENDPOINTS.FARM.PETANI.ACTIVITY.ADD_RENCANA_PANEN(ACTIVE_BLOK_ID);

      const method = editingPlanId ? "PUT" : "POST";

      const payload = {
        tanggal_rencana_panen: formPlan.tanggal,
        luas_lahan_dipanen: parseFloat(formPlan.luas),
        estimasi_total_tbs_kg: parseFloat(formPlan.estimasi),
      };

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      showToast.dismiss();

      if (res.ok) {
        showToast.success(
          editingPlanId
            ? "Rencana panen berhasil diperbarui!"
            : "Rencana panen berhasil diajukan!",
        );
        setEditingPlanId(null);
        setFormPlan({ tanggal: "", estimasi: "", luas: "" });
        fetchRencanaPanen();
      } else {
        const err = await res.json();
        showToast.error(`Gagal: ${err.detail || "Terjadi kesalahan"}`);
      }
    } catch {
      showToast.dismiss();
      showToast.error("Error jaringan saat menyimpan rencana panen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveLog = async () => {
    if (
      !formLog.selectedPlanId ||
      !formLog.namaPetani ||
      !formLog.tanggal ||
      !formLog.jamMulai ||
      !formLog.jamSelesai ||
      !formLog.jumlahTandan ||
      formLog.jumlah_pokok_dipanen === "" ||
      formLog.jumlah_pokok_dipanen === undefined
    ) {
      showToast.error("Mohon lengkapi semua data, termasuk Jumlah Pokok!");
      return;
    }

    setActiveModal(null);
    setIsSubmitting(true);
    showToast.loading("Menyimpan catatan panen...");

    try {
      const token = localStorage.getItem("token");
      const url = API_ENDPOINTS.FARM.PETANI.ACTIVITY.ADD_REALISASI_PANEN;

      // Payload wajib sesuai skema BE MAHAR
      const payload = {
        rencana_panen_id: parseInt(formLog.selectedPlanId),
        nama_pemanen: formLog.namaPetani,
        tanggal_pemanenan: formLog.tanggal,
        jam_mulai: formLog.jamMulai,
        jam_selesai: formLog.jamSelesai,
        jumlah_tandan_dipanen: parseFloat(formLog.jumlahTandan),
        jumlah_pokok_dipanen: parseInt(formLog.jumlah_pokok_dipanen), // Wajib Integer
        kondisi_kebun: formLog.kondisiKebun || null,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      showToast.dismiss();

      if (res.ok) {
        showToast.success("Catatan aktivitas berhasil disimpan!");
        setFormLog({
          selectedPlanId: "",
          tanggal: "",
          namaPetani: "",
          jamMulai: "",
          jamSelesai: "",
          jumlahTandan: "",
          jumlah_pokok_dipanen: "",
          kondisiKebun: "",
        });
        fetchRencanaPanen();
      } else {
        // Ambil pesan error dari Backend
        const err = await res.json();
        console.error("Backend Error:", err);
        showToast.error(`Gagal: ${err.detail || "Periksa kembali inputan Anda"}`);
      }
    } catch {
      showToast.dismiss();
      showToast.error("Error jaringan. Tidak dapat terhubung ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openResultModal = (planId) => {
    setFormResult({ planId: planId, brondolan: "", kualitas: "" });
    setActiveModal("result");
  };

  const handleSaveResult = async () => {
    // KONFIRMASI (YANG HARUS NO. 2)
    const isSetuju = await confirmDialog({
      title: "Selesaikan Panen?",
      text: "Apakah Anda yakin ingin menyelesaikan panen ini? Data akan ditutup dan masuk ke riwayat selesai secara permanen.",
      confirmText: "Ya, Selesaikan!",
      cancelText: "Batal",
      isDanger: false,
    });

    if (!isSetuju) return;

    // Tutup popup duluan
    setActiveModal(null);
    setIsSubmitting(true);
    showToast.loading("Memproses finalisasi panen...");

    try {
      const token = localStorage.getItem("token");
      const url = API_ENDPOINTS.FARM.PETANI.ACTIVITY.FINALISASI_PANEN(
        formResult.planId,
      );
      const payload = {
        kualitas_tbs: formResult.kualitas,
        banyak_berondolan_dikumpulkan: parseInt(formResult.brondolan) || 0,
        catatan_list: [],
      };
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      showToast.dismiss();

      if (res.ok) {
        showToast.success(
          "Panen Berhasil Diselesaikan! Data masuk ke riwayat selesai.",
        );
        fetchBlokDetail();
        fetchRencanaPanen();
      } else {
        const err = await res.json();
        showToast.error(`Gagal finalisasi: ${err.detail || err.message}`);
      }
    } catch {
      showToast.dismiss();
      showToast.error("Error jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Fungsi Buat Siklus Baru (PINDAHAN DARI CatatAktivitas)
  const handleNewCycle = async () => {
    if (!currentCycleInfo.isFinished) {
      showToast.error(
        `Siklus ke-${currentCycleInfo.nomorSiklus} saat ini belum selesai. Tidak bisa memulai siklus baru.`,
      );
      return;
    }

    const isSetuju = await confirmDialog({
      title: "Mulai Siklus Baru?",
      text: `Anda akan menutup Siklus Ke-${currentCycleInfo.nomorSiklus} dan memulai siklus baru. Data sebelumnya akan diarsipkan. Lanjutkan?`,
      confirmText: "Ya, Mulai Siklus",
      cancelText: "Batal",
      isDanger: false,
    });

    if (!isSetuju) return;

    showToast.loading("Membuat siklus baru...");

    try {
      const token = localStorage.getItem("token");
      const endpoint =
        API_ENDPOINTS.FARM.PETANI.ACTIVITY.BUAT_SIKLUS_BARU(ACTIVE_BLOK_ID);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      showToast.dismiss();

      if (response.ok) {
        const result = await response.json();
        showToast.success(result.message || "Siklus baru berhasil dimulai!");

        // Refresh semua data
        await fetchBlokDetail();
        fetchHistoryList();
        fetchRencanaPanen();

        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const errorData = await response.json();
        showToast.error(
          `Gagal membuat siklus baru: ${errorData.detail || errorData.message}`,
        );
      }
    } catch (error) {
      showToast.dismiss();
      console.error("Error trigger siklus baru:", error);
      showToast.error(
        "Terjadi kesalahan jaringan saat mencoba membuat siklus baru.",
      );
    }
  };

  const toggleSection = (section) => {
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
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

  // ================= MODAL RIWAYAT SIKLUS (VERSI RINGKAS) =================
  const renderHistoryPopup = () => {
    if (!showHistoryModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-[95%] sm:w-full max-w-lg flex flex-col max-h-[85vh]">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
            <div>
              <h3 className="text-sm sm:text-lg font-bold text-[#B5302D]">
                Daftar Riwayat Siklus
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500">
                Pilih siklus untuk melihat detail arsip
              </p>
            </div>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-red-600" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
            {loadingHistory ? (
              <div className="text-center py-10">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#EF8523]" />
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  Memuat daftar...
                </p>
              </div>
            ) : historyList.length === 0 ? (
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
                    // Cukup tambahkan arsip/nomor_siklus untuk menyambung URL saat ini
                    onClick={() => navigate(`arsip/${item.nomor_siklus}`)}
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

  // ================= MAIN RENDER =================

  if (loadingBlok) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#EF8523] animate-spin" />
          <p className="text-xs sm:text-sm font-medium text-gray-500">
            Memuat Halaman...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-10 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* === HEADER NAVIGASI === */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#EF8523] transition px-2 py-1.5 rounded-lg hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Kembali
          </button>

          {/* TOMBOL RIWAYAT SIKLUS (PINDAHAN) */}
          <button
            onClick={() => {
              setShowHistoryModal(true);
              fetchHistoryList();
            }}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-600 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-[#B5302D] transition shadow-sm active:scale-95 transform"
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Riwayat Siklus
          </button>
        </div>

        {/* === HEADER HERO === */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-2xl shadow-sm border border-green-100 shrink-0">
              <Leaf className="text-green-700" size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-green-700">
                Pemanenan & Siklus
              </h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Menu panenan untuk mencatat aktivitas panen, melihat analitik,
                dan mengelola siklus panen di blok Anda.
              </p>
            </div>
          </div>

          {/* BAGIAN BADGE INFORMASI (UNIT & STATUS SENGKETA) */}
          <div className="flex flex-wrap gap-2 self-start lg:self-auto">
            {/* Badge Unit */}
            <span className="bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-[10px] sm:text-sm shadow-sm font-medium tracking-wide">
              Unit: {blokData?.nama_unit || "..."}
            </span>

            {/* Badge Status Sengketa */}
            {blokData?.ada_sengketa ? (
              <span className="bg-red-50 border border-red-200 text-red-700 px-3 py-1 rounded-full text-[10px] sm:text-sm shadow-sm font-semibold tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                Sengketa Aktif
              </span>
            ) : (
              <span className="bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-[10px] sm:text-sm shadow-sm font-semibold tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Bebas Sengketa
              </span>
            )}
          </div>
        </div>

        <hr className="border-gray-200 mb-6 sm:mb-8" />

        {/* DASHBOARD RINGKASAN ANALITIK */}
        {!loadingAnalitik && analitikData && (
          <div className="bg-gradient-to-br from-[#EF8523]/10 to-orange-50 rounded-xl p-3 sm:p-4 border border-orange-200 shadow-sm mb-6 sm:mb-8 animate-fadeIn">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-[#EF8523]" />
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                Ringkasan Analitik Operasional Panen
              </h3>
            </div>

            {/* Grid dirapatkan: 2 kolom (HP), 3 kolom (Tablet), 6 kolom sejajar (Desktop) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
              {/* Card 1: Luas Total */}
              <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-orange-100 shadow-sm flex flex-col justify-between">
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-1.5 leading-tight">
                  Total Luas Area
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-lg sm:text-2xl font-black text-gray-800 leading-none">
                    {analitikData.luas_total_ha}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-[#EF8523] mb-0.5">
                    Hektar
                  </span>
                </div>
              </div>

              {/* Card 2: ATP */}
              <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-orange-100 shadow-sm flex flex-col justify-between">
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-1.5 leading-tight">
                  Sisa Area Siap Panen (ATP)
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-lg sm:text-2xl font-black text-gray-800 leading-none">
                    {analitikData.atp_sisa_area_ha}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-[#EF8523] mb-0.5">
                    Hektar
                  </span>
                </div>
              </div>

              {/* Card 3: TPH */}
              <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-orange-100 shadow-sm flex flex-col justify-between">
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-1.5 leading-tight">
                  Produktivitas TBS Ton Per Hektar (TPH)
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-lg sm:text-2xl font-black text-gray-800 leading-none">
                    {analitikData.tph_ton_per_ha}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-[#EF8523] mb-0.5">
                    Ton / Ha
                  </span>
                </div>
              </div>

              {/* Card 4: Harga CPO */}
              <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-orange-100 shadow-sm flex flex-col justify-between overflow-hidden">
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-1.5 leading-tight">
                  Harga Acuan CPO
                </p>
                <div className="flex items-end gap-1 truncate">
                  <span className="text-lg sm:text-2xl font-black text-gray-800 leading-none truncate">
                    Rp{" "}
                    {analitikData.harga_cpo_acuan_rp?.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Card 5: OER */}
              <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-orange-100 shadow-sm flex flex-col justify-between">
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-1.5 leading-tight">
                  Nilai Rendemen (OER)
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-lg sm:text-2xl font-black text-gray-800 leading-none">
                    {analitikData.oer_persentase}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-[#EF8523] mb-0.5">
                    %
                  </span>
                </div>
              </div>

              {/* Card 6: AKP */}
              <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-orange-100 shadow-sm flex flex-col justify-between overflow-hidden">
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-1.5 leading-tight">
                  Estimasi Nilai Produksi (AKP)
                </p>
                <div className="flex items-end gap-1 truncate">
                  <span className="text-lg sm:text-2xl font-black text-green-600 leading-none truncate">
                    Rp{" "}
                    {analitikData.akp_estimasi_nilai_rp?.toLocaleString(
                      "id-ID",
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 1 RENCANA PANEN ================= */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6 sm:mb-8">
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
              disabled={currentCycleInfo?.isFinished}
              onClick={(e) => {
                if (currentCycleInfo?.isFinished) {
                  alert(
                    "Siklus saat ini sudah selesai. Silakan mulai siklus baru di bawah halaman.",
                  );
                  return;
                }
                e.stopPropagation();
                setActiveModal("plan");
              }}
              className={`flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2.5 rounded-lg border text-sm font-semibold shadow-sm
                ${
                  currentCycleInfo?.isFinished
                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#B5302D] border-[#B5302D] text-white hover:bg-[#962624] hover:border-[#962624]"
                }`}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Buat Rencana Baru</span>
            </button>
          </div>

          {/* Rencana Panen Map - TAMPILAN TABEL */}
          {openSection.rencana && (
            <div className="p-4 sm:p-6 bg-gray-50/30 animate-fadeIn">
              {loadingPlans ? (
                <div className="flex justify-center py-8 sm:py-12">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#B5302D] animate-spin" />
                </div>
              ) : plans.length === 0 ? (
                <EmptyState text="Belum ada rencana panen yang dibuat pada siklus ini." />
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
                  <table className="min-w-full text-left border-collapse">
                    <thead className="bg-[#B5302D] text-white text-[10px] sm:text-xs uppercase font-bold">
                      <tr>
                        <th className="px-4 py-3 border-r border-red-800/30 whitespace-nowrap">
                          Tanggal Panen
                        </th>
                        <th className="px-4 py-3 border-r border-red-800/30 text-center">
                          Estimasi (Kg)
                        </th>
                        <th className="px-4 py-3 border-r border-red-800/30 text-center">
                          Luas (Ha)
                        </th>
                        <th className="px-4 py-3 border-r border-red-800/30 text-center">
                          Status
                        </th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-800">
                      {plans.map((plan) => (
                        <React.Fragment key={plan.id}>
                          <tr
                            className={`hover:bg-red-50/20 transition-colors ${plan.status === "SELESAI" ? "opacity-80 bg-gray-50" : ""} ${plan.status === "DITOLAK" ? "bg-red-50/30" : ""}`}
                          >
                            <td className="px-4 py-3 border-r border-gray-100 align-middle whitespace-nowrap">
                              <div className="flex items-center gap-1.5 font-medium">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {plan.tanggal}
                              </div>
                            </td>
                            <td className="px-4 py-3 border-r border-gray-100 text-center font-bold text-gray-700 align-middle">
                              {plan.estimasi}
                            </td>
                            <td className="px-4 py-3 border-r border-gray-100 text-center font-bold text-gray-700 align-middle">
                              {plan.luas}
                            </td>
                            <td className="px-4 py-3 border-r border-gray-100 text-center align-middle">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${getStatusColor(plan.status)}`}
                              >
                                {plan.status || "PENDING"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center align-middle">
                              {plan.status === "SELESAI" ? (
                                <div className="flex items-center justify-center gap-1 text-green-600">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-bold">
                                    Selesai
                                  </span>
                                </div>
                              ) : plan.status === "PENDING" ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingPlanId(plan.id);
                                    setFormPlan({
                                      tanggal: plan.tanggal,
                                      estimasi: plan.estimasi,
                                      luas: plan.luas,
                                    });
                                    setActiveModal("plan");
                                  }}
                                  className="bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100 px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors whitespace-nowrap"
                                >
                                  Edit Pengajuan
                                </button>
                              ) : plan.status === "DITOLAK" ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingPlanId(plan.id);
                                    setFormPlan({
                                      tanggal: plan.tanggal,
                                      estimasi: plan.estimasi,
                                      luas: plan.luas,
                                    });
                                    setActiveModal("plan");
                                  }}
                                  className="bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors whitespace-nowrap"
                                >
                                  Edit & Ajukan
                                </button>
                              ) : (
                                <span className="text-[10px] text-gray-400 italic">
                                  -
                                </span>
                              )}
                            </td>
                          </tr>

                          {/* BARIS KHUSUS UNTUK PESAN DITOLAK (Muncul menempel di bawah baris data jika status DITOLAK) */}
                          {plan.status === "DITOLAK" && (
                            <tr className="bg-red-50/50 border-b border-gray-200">
                              <td colSpan="6" className="px-4 py-2">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-[10px] font-bold text-red-800 uppercase">
                                      Catatan Penolakan:
                                    </p>
                                    <p className="text-xs text-red-700 italic">
                                      "{plan.alasan}"
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= SECTION 2 REALISASI PANEN ================= */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6 sm:mb-8">
          <div
            className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleSection("realisasi")}
          >
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#B5302D] flex items-center gap-2">
                <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" /> Realisasi
                Panen
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

          {openSection.realisasi && (
            <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 animate-fadeIn">
              {/* ================= BAGIAN ATAS: CATATAN PEMANENAN ================= */}
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center mb-4 sm:mb-5">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base uppercase tracking-wide">
                      Catatan Aktivitas
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Log harian per pemanen (dikelompokkan per tanggal panen)
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModal("log")}
                    className="flex items-center gap-1.5 sm:gap-2 bg-white border border-[#EF8523] text-[#EF8523] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-orange-50 transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Tambah Catatan
                  </button>
                </div>

                <div className="w-full">
                  {harvestLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-60 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <FileText className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">
                        Belum ada catatan aktivitas panen.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* LOGIKA GROUPING BERDASARKAN TANGGAL */}
                      {Object.entries(
                        harvestLogs.reduce((acc, log) => {
                          if (!acc[log.tanggal]) acc[log.tanggal] = [];
                          acc[log.tanggal].push(log);
                          return acc;
                        }, {}),
                      ).map(([tanggal, logs]) => (
                        <div
                          key={tanggal}
                          className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
                        >
                          {/* Header Tabel (Tanggal) */}
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                              Tanggal Panen:{" "}
                              <span className="font-black text-[#B5302D]">
                                {tanggal}
                              </span>
                            </p>
                            <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 border border-gray-200 rounded">
                              {logs.length} Log Pekerja
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="min-w-full text-left border-collapse">
                              <thead className="bg-[#EF8523] text-white text-[10px] sm:text-xs uppercase font-bold">
                                <tr>
                                  <th className="px-4 py-3 border-r border-orange-400/50">
                                    Nama Pemanen
                                  </th>
                                  <th className="px-4 py-3 text-center border-r border-orange-400/50 whitespace-nowrap">
                                    Jam Kerja
                                    <span className="block text-[9px] font-normal opacity-80 mt-0.5">
                                      (Mulai - Selesai)
                                    </span>
                                  </th>
                                  <th className="px-4 py-3 text-center border-r border-orange-400/50">
                                    Jumlah Pokok
                                    <br className="hidden sm:block" /> Dipanen
                                  </th>
                                  <th className="px-4 py-3 text-center border-r border-orange-400/50">
                                    Jumlah Tandan
                                  </th>
                                  <th className="px-4 py-3 text-center">
                                    Kondisi Kebun
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-800">
                                {logs.map((log, idx) => (
                                  <tr
                                    key={idx}
                                    className="hover:bg-orange-50/30 transition-colors"
                                  >
                                    <td className="px-4 py-3 border-r border-gray-100 font-medium text-gray-700">
                                      {log.namaPetani}
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-center whitespace-nowrap">
                                      {log.jamMulai} - {log.jamSelesai}
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-center font-bold text-blue-700">
                                      {log.jumlahPokok || 0}
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-center font-bold text-green-700">
                                      {log.jumlahTandan}
                                    </td>
                                    <td className="px-4 py-3 text-center italic text-gray-500">
                                      {log.kondisiKebun || "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* ================= BAGIAN BAWAH: FINALISASI / HASIL PANEN ================= */}
              <div className="flex flex-col w-full">
                <div className="mb-4 sm:mb-6">
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base uppercase tracking-wide">
                    Finalisasi Hasil Panen
                  </h3>
                  <p className="text-xs text-gray-500">
                    Selesaikan rencana panen yang sudah dieksekusi (Target &
                    Realisasi)
                  </p>
                </div>

                {/* --- UBAH LAYOUT JADI ATAS-BAWAH (FLEX-COL) AGAR TABEL LEGA --- */}
                <div className="flex flex-col gap-8 sm:gap-10">
                  {/* 1. PENDING FINALISASI (ATAS) */}
                  <div className="w-full">
                    <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>{" "}
                      MENUNGGU FINALISASI
                    </h4>

                    {plans.filter(
                      (p) => p.status === "DISETUJUI" && !p.hasil_panen,
                    ).length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-xs text-gray-400">
                          Tidak ada rencana aktif yang perlu diselesaikan.
                        </p>
                      </div>
                    ) : (
                      // Jadikan grid 2 atau 3 kolom agar rapi menyamping
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {plans
                          .filter(
                            (p) => p.status === "DISETUJUI" && !p.hasil_panen,
                          )
                          .map((plan) => {
                            const gk = plan.gatekeeper || {};
                            const hasCatatan =
                              gk.is_catatan_pekerja_terisi !== undefined
                                ? gk.is_catatan_pekerja_terisi
                                : plan.catatan_pemanenan &&
                                  plan.catatan_pemanenan.length > 0;
                            const inGroup =
                              gk.is_masuk_grup !== undefined
                                ? gk.is_masuk_grup
                                : !!plan.grup_id;
                            const pabrikAcc =
                              gk.is_diterima_pabrik !== undefined
                                ? gk.is_diterima_pabrik
                                : plan.status_pabrik === "DITERIMA" ||
                                  plan.status_pabrik === "APPROVED";
                            const canFinalize = gk.is_bisa_selesai === true;

                            return (
                              <div
                                key={plan.id}
                                className={`flex flex-col p-4 bg-white border rounded-lg shadow-sm transition-all gap-3
                                  ${canFinalize ? "border-blue-400 shadow-md" : "border-gray-200"}`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-bold text-gray-800">
                                        {plan.tanggal}
                                      </span>
                                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                        Aktif
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      Target: {plan.estimasi} Kg
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex-1">
                                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                                    Syarat Bisa Klik Selesai:
                                  </p>
                                  <ul className="text-xs space-y-1.5">
                                    <li
                                      className={`flex items-center gap-2 ${inGroup ? "text-green-600 font-bold" : "text-gray-400"}`}
                                    >
                                      {inGroup ? (
                                        <CheckCircle className="w-3.5 h-3.5" />
                                      ) : (
                                        <Clock className="w-3.5 h-3.5" />
                                      )}
                                      TBS Berhasil Kebun Jual ke Pabrik
                                    </li>
                                    <li
                                      className={`flex items-center gap-2 ${pabrikAcc ? "text-green-600 font-bold" : "text-gray-400"}`}
                                    >
                                      {pabrikAcc ? (
                                        <CheckCircle className="w-3.5 h-3.5" />
                                      ) : (
                                        <Clock className="w-3.5 h-3.5" />
                                      )}
                                      TBS Diterima oleh Pabrik
                                    </li>
                                    <li
                                      className={`flex items-center gap-2 ${hasCatatan ? "text-green-600 font-bold" : "text-red-500"}`}
                                    >
                                      {hasCatatan ? (
                                        <CheckCircle className="w-3.5 h-3.5" />
                                      ) : (
                                        <AlertCircle className="w-3.5 h-3.5" />
                                      )}
                                      Catatan Aktivitas Pekerja Terisi
                                    </li>
                                  </ul>
                                </div>

                                <button
                                  onClick={() => openResultModal(plan.id)}
                                  disabled={!canFinalize}
                                  className={`w-full text-sm py-2.5 rounded-lg font-bold transition shadow-sm mt-auto
                                    ${!canFinalize ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                                >
                                  {canFinalize
                                    ? "✓ Selesaikan Panen"
                                    : "Penuhi Syarat Di Atas"}
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* 2. RIWAYAT SELESAI (BAWAH) -> UBAH JADI TABEL */}
                  <div className="w-full">
                    <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>{" "}
                      RIWAYAT SELESAI
                    </h4>

                    {plans.filter((p) => p.hasil_panen).length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-xs text-gray-400 italic">
                          Belum ada riwayat panen selesai.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm bg-white">
                        <table className="min-w-full text-left border-collapse">
                          <thead className="bg-green-600 text-white text-[10px] sm:text-xs uppercase font-bold">
                            <tr>
                              <th className="px-4 py-3 text-center border-r border-green-500/50 w-[50px]">
                                No
                              </th>
                              <th className="px-4 py-3 border-r border-green-500/50 whitespace-nowrap">
                                Tanggal Panen
                              </th>
                              <th className="px-4 py-3 border-r border-green-500/50 text-center">
                                Total TBS
                              </th>
                              <th className="px-4 py-3 border-r border-green-500/50 text-center">
                                Brondolan
                              </th>
                              <th className="px-4 py-3 border-r border-green-500/50 text-center">
                                Kualitas TBS
                              </th>
                              <th className="px-4 py-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-800">
                            {plans
                              .filter((p) => p.hasil_panen)
                              .map((plan, idx) => (
                                <tr
                                  key={plan.id}
                                  className="hover:bg-green-50/30 transition-colors"
                                >
                                  <td className="px-4 py-3.5 text-center border-r border-gray-100 font-medium text-gray-500">
                                    {idx + 1}
                                  </td>
                                  <td className="px-4 py-3.5 border-r border-gray-100 font-bold text-gray-800">
                                    {plan.tanggal}
                                  </td>
                                  <td className="px-4 py-3.5 border-r border-gray-100 text-center font-bold text-green-700">
                                    {
                                      plan.hasil_panen
                                        .jumlah_total_tbs_terkumpul
                                    }{" "}
                                    Kg
                                  </td>
                                  <td className="px-4 py-3.5 border-r border-gray-100 text-center font-bold text-orange-600">
                                    {
                                      plan.hasil_panen
                                        .banyak_berondolan_dikumpulkan
                                    }{" "}
                                    Kg
                                  </td>
                                  <td className="px-4 py-3.5 border-r border-gray-100 text-center italic text-gray-600">
                                    {plan.hasil_panen.kualitas_tbs
                                      ? `"${plan.hasil_panen.kualitas_tbs}"`
                                      : "-"}
                                  </td>
                                  <td className="px-4 py-3.5 text-center">
                                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded text-[10px] sm:text-xs font-bold border border-green-200 flex items-center justify-center gap-1.5 w-fit mx-auto">
                                      <CheckCircle className="w-3.5 h-3.5" />{" "}
                                      Selesai
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= SECTION 3 AKSI SIKLUS (PINDAHAN) ================= */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col gap-2">
            
            {/* TOMBOL UTAMA */}
            <button
              onClick={handleNewCycle}
              disabled={!currentCycleInfo.isFinished}
              className={`w-full flex items-center justify-center gap-2.5 px-4 py-3 sm:py-3.5 rounded-xl border transition-all active:scale-[0.98] ${
                currentCycleInfo.isFinished
                  ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:shadow-sm cursor-pointer"
                  : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {/* Icon seukuran dengan teks (w-4 / w-5) */}
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-sm sm:text-base font-bold">
                Mulai Siklus Baru
              </span>
            </button>
            
            {/* KETERANGAN PESAN (DI BAWAH TOMBOL SENDIRI) */}
            <div className="px-1 text-center sm:text-left">
              {currentCycleInfo.isFinished ? (
                <p className="text-[10px] sm:text-xs font-medium text-green-600">
                  Siklus saat ini telah selesai. Anda dapat memulai siklus baru.
                </p>
              ) : (
                <p className="text-[10px] sm:text-xs font-medium text-red-500 whitespace-normal break-words flex items-start sm:items-center justify-center sm:justify-start gap-1">
                  <span className="font-extrabold text-red-600 text-sm leading-none mt-0.5 sm:mt-0">*</span> 
                  {currentCycleInfo.pesanSiklus || "Selesaikan semua rencana panen terlebih dahulu."}
                </p>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {renderHistoryPopup()}

      {/* BUAT TAMBAH RENCANA */}
      {activeModal === "plan" && (
        <ModalLayout
          title={editingPlanId ? "Revisi Rencana Panen" : "Buat Rencana Panen"}
          onClose={() => {
            setActiveModal(null);
            setEditingPlanId(null);
            setFormPlan({ tanggal: "", estimasi: "", luas: "" });
          }}
          onSave={handleSavePlan}
          loading={isSubmitting}
        >
          <div className="space-y-5 animate-fadeIn">
            {/* 1. KOTAK INFORMASI LOKASI (Menggantikan Input Nama Unit) */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="bg-white p-2.5 rounded-lg shadow-sm shrink-0 border border-orange-100">
                <MapPin className="w-5 h-5 text-[#EF8523]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-orange-600 uppercase tracking-widest mb-0.5">
                  Lokasi Target Panen
                </p>
                <p className="text-sm sm:text-base font-black text-gray-900 truncate">
                  {blokData?.nama_unit || "Memuat informasi unit..."}
                </p>
              </div>
            </div>

            {/* 2. AREA FORM INPUT */}
            <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4 sm:p-5 space-y-4">
              <InputField
                label="Tanggal Rencana Panen"
                type="date"
                value={formPlan.tanggal}
                onChange={(e) =>
                  setFormPlan({ ...formPlan, tanggal: e.target.value })
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Estimasi Luas Lahan (Ha)"
                  type="number"
                  placeholder="Contoh: 1.5"
                  value={formPlan.luas}
                  onChange={(e) =>
                    setFormPlan({ ...formPlan, luas: e.target.value })
                  }
                />
                <InputField
                  label="Estimasi Hasil TBS (Kg)"
                  type="number"
                  placeholder="Contoh: 5000"
                  value={formPlan.estimasi}
                  onChange={(e) =>
                    setFormPlan({ ...formPlan, estimasi: e.target.value })
                  }
                />
              </div>
            </div>
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
                  (p) => p.id === parseInt(e.target.value),
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
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
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

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
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

          {/* BARIS BARU: JUMLAH TANDAN & JUMLAH POKOK */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <InputField
              label="Jumlah Pokok Dipanen"
              type="number"
              placeholder="0 Pokok"
              value={formLog.jumlah_pokok_dipanen || ""}
              onChange={(e) =>
                setFormLog({ ...formLog, jumlah_pokok_dipanen: e.target.value })
              }
            />
            <InputField
              label="Jumlah Tandan (Buah)"
              type="number"
              placeholder="0 Tandan"
              value={formLog.jumlahTandan}
              onChange={(e) =>
                setFormLog({ ...formLog, jumlahTandan: e.target.value })
              }
            />
          </div>

          {/* KONDISI KEBUN FULL WIDTH */}
          <div className="w-full">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Kondisi Kebun
            </label>
            <input
              type="text"
              placeholder="Contoh: Bersih / Semak / Banjir"
              value={formLog.kondisiKebun}
              onChange={(e) =>
                setFormLog({ ...formLog, kondisiKebun: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#EF8523]"
            />
          </div>
        </ModalLayout>
      )}

      {/* MODAL INPUT HASIL (FINALISASI) */}
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
                dihitung otomatis oleh sistem.
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
                placeholder="Contoh: Buah mentah 2%..."
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-3 sm:p-4 animate-fadeIn">
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
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#EF8523] transition-all ${readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white hover:border-gray-400"}`}
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
