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

  // ================= STATE MANAGEMENT PANEN LAMA =================
  const [blokData, setBlokData] = useState(null);
  const [loadingBlok, setLoadingBlok] = useState(true);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [harvestLogs, setHarvestLogs] = useState([]);

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
  const [selectedCycleDetail, setSelectedCycleDetail] = useState(null);
  const [currentCycleInfo, setCurrentCycleInfo] = useState({
    nomorSiklus: 0,
    isFinished: false,
    sisaLuas: 0,
  });

  // ================= FETCH DATA (API INTEGRATION) =================

  // 1. Fetch Detail Blok & Cek Status Siklus
  const fetchBlokDetail = useCallback(async () => {
    setLoadingBlok(true);
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
      try {
        const statusRes = await fetch(
          API_ENDPOINTS.FARM.PETANI.ACTIVITY.CEK_STATUS_SIKLUS(ACTIVE_BLOK_ID),
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

      setBlokData({
        ...data,
        isCycleFinished: data.is_siklus_finished,
      });

      setCurrentCycleInfo((prev) => ({
        ...prev,
        isFinished: isSiklusSelesai,
      }));
    } catch (error) {
      console.error("Error fetching blok detail:", error);
    } finally {
      setLoadingBlok(false);
    }
  }, [ACTIVE_BLOK_ID]);

  // 2. Fetch List Arsip Siklus (PINDAHAN)
  const fetchHistoryList = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        API_ENDPOINTS.FARM.PETANI.ACTIVITY.GET_ARSIP_SIKLUS_LIST(
          ACTIVE_BLOK_ID,
        );

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

        // Cari siklus aktif
        let activeCycleNum = 1;
        if (data.length > 0) {
          const isAnyActive = data.find(
            (item) =>
              item.status &&
              !item.status.toUpperCase().includes("ARSIP") &&
              !item.status.toUpperCase().includes("SELESAI"),
          );

          if (isAnyActive) {
            activeCycleNum = isAnyActive.nomor_siklus;
          } else {
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
  }, [ACTIVE_BLOK_ID]);

  // 3. Fetch Detail Satu Siklus (PINDAHAN)
  const fetchCycleDetail = async (nomorSiklus) => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = `${API_BASE_URLS.FARM}/farm/me/blok/${ACTIVE_BLOK_ID}/arsip/${nomorSiklus}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedCycleDetail(data);
      }
    } catch (error) {
      console.error("Error fetching cycle detail:", error);
      alert("Gagal mengambil detail siklus.");
    } finally {
      setLoadingHistory(false);
    }
  };

  // 4. Fetch Rencana Panen
  const fetchRencanaPanen = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Cari siklus aktif untuk filter
      let activeCycleNum = 1;
      try {
        const arsipUrl =
          API_ENDPOINTS.FARM.PETANI.ACTIVITY.GET_ARSIP_SIKLUS_LIST(
            ACTIVE_BLOK_ID,
          );
        const arsipRes = await fetch(arsipUrl, { method: "GET", headers });
        if (arsipRes.ok) {
          const arsipData = await arsipRes.json();
          if (arsipData.length > 0) {
            const isAnyActive = arsipData.find(
              (item) =>
                item.status &&
                !item.status.toUpperCase().includes("ARSIP") &&
                !item.status.toUpperCase().includes("SELESAI"),
            );
            if (isAnyActive) activeCycleNum = isAnyActive.nomor_siklus;
            else
              activeCycleNum =
                Math.max(...arsipData.map((d) => d.nomor_siklus)) + 1;
          }
        }
      } catch (e) {
        console.error("Gagal get arsip", e);
      }

      const url =
        API_ENDPOINTS.FARM.PETANI.ACTIVITY.GET_RENCANA_PANEN_LIST(
          ACTIVE_BLOK_ID,
        );

      const response = await fetch(url, { method: "GET", headers });
      if (!response.ok) throw new Error("Gagal mengambil data rencana panen");

      const data = await response.json();

      // DEBUG 2: Cek respon mentah dari Backend
      console.log("[DEBUG] Data Rencana Panen Mentah (Dari BE):", data);

      const activeCycleData = data.filter(
        (item) => item.nomor_siklus === activeCycleNum,
      );

      // DEBUG 3: Cek data setelah difilter berdasarkan siklus aktif
      console.log(
        `[DEBUG] Data Rencana Panen Siklus Aktif (Siklus Ke-${activeCycleNum}):`,
        activeCycleData,
      );

      // --- MAPPING ASYNCHRONOUS DENGAN FETCH GATEKEEPER ---
      const mappedPlans = await Promise.all(
        activeCycleData.map(async (item) => {
          let gatekeeperData = null;

          // Cek gatekeeper HANYA untuk rencana yang sudah disetujui & belum di-finalisasi
          if (item.status === "DISETUJUI" && !item.hasil_panen) {
            try {
              // Endpoint menembak ke Gatekeeper BE
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
            status_pabrik: item.status_pabrik || null, // "DITERIMA" / "PENDING"
            status_logistik: item.status_logistik || null, // "DITERIMA" / "PENDING"

            // SIMPAN DATA GATEKEEPER DARI BE KE DALAM STATE LOKAL
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
      !formLog.jumlahTandan
    ) {
      showToast.error(
        "Masih ada kolom yang belum diisi. Silakan pilih Rencana, Nama Pemanen, dan Jumlah Tandan terlebih dahulu.",
      );
      return;
    }

    // Tutup popup duluan
    setActiveModal(null);
    setIsSubmitting(true);
    showToast.loading("Menyimpan catatan panen...");

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
          kondisiKebun: "",
        });
        fetchRencanaPanen();
      } else {
        const err = await res.json();
        showToast.error(`Gagal: ${err.detail || "Cek isian kembali"}`);
      }
    } catch {
      showToast.dismiss();
      showToast.error("Gagal koneksi ke server.");
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

  // ================= MODAL RIWAYAT SIKLUS (PINDAHAN) =================
  const renderHistoryPopup = () => {
    if (!showHistoryModal) return null;

    const meta = selectedCycleDetail?.meta;
    const tanam = selectedCycleDetail?.data_tanam;
    const panen = selectedCycleDetail?.data_panen || [];
    const monitoring = selectedCycleDetail?.data_monitoring;

    const totalTbsSiklusIni = panen.reduce((total, p) => {
      return total + (p.hasil_panen?.jumlah_total_tbs_terkumpul || 0);
    }, 0);

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-[95%] sm:w-full max-w-3xl flex flex-col max-h-[85vh]">
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
                  Kembali
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

          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
            {loadingHistory ? (
              <div className="text-center py-10">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#EF8523]" />
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  Membongkar Arsip...
                </p>
              </div>
            ) : selectedCycleDetail ? (
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

                {/* 3. REKAP MONITORING */}
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

  // ================= MAIN RENDER =================

  if (loadingBlok) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#EF8523] animate-spin" />
          <p className="text-xs sm:text-sm font-medium text-gray-500">
            Memuat Data Panen & Siklus...
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

        {/* === HEADER HERO (TITLE PAGE) === */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-2xl shadow-sm border border-green-100 shrink-0">
              <Leaf className="text-green-700" size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-green-700">
                Pemanenan & Siklus
              </h1>
              {/* SUBTITLE SIKLUS (PINDAHAN) */}
              <p className="text-xs md:text-sm text-gray-500 mt-1">
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
          </div>

          <span className="self-start lg:self-auto bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-[10px] sm:text-sm shadow-sm font-medium tracking-wide">
            Unit: {blokData?.nama_unit || "..."}
          </span>
        </div>

        <hr className="border-gray-200 mb-6 sm:mb-8" />

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
              disabled={blokData?.isCycleFinished}
              onClick={(e) => {
                if (blokData?.isCycleFinished) {
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
                  blokData?.isCycleFinished
                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#B5302D] border-[#B5302D] text-white hover:bg-[#962624] hover:border-[#962624]"
                }`}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Buat Rencana Baru</span>
            </button>
          </div>

          {/* Rencana Panen Map */}
          {openSection.rencana && (
            <div className="p-4 sm:p-6 bg-gray-50/30 animate-fadeIn">
              {loadingPlans ? (
                <div className="flex justify-center py-8 sm:py-12">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#B5302D] animate-spin" />
                </div>
              ) : plans.length === 0 ? (
                <EmptyState text="Belum ada rencana panen yang dibuat pada siklus ini." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`
                        border rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 bg-white relative overflow-hidden group flex flex-col justify-between
                        ${plan.status === "DITOLAK" ? "border-red-200 bg-red-50/20" : "border-gray-200"}
                        ${plan.status === "SELESAI" ? "opacity-80" : ""}
                      `}
                    >
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                        <span
                          className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border shadow-sm ${getStatusColor(plan.status)}`}
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

                        {/* --- UI SKENARIO 1: TOMBOL EDIT BILA DITOLAK ATAU PENDING --- */}
                        {plan.status === "DITOLAK" && (
                          <div className="mt-2 bg-red-50 border border-red-200 p-2.5 sm:p-3 rounded-lg animate-fadeIn">
                            <p className="text-[9px] sm:text-[10px] font-bold text-red-800 uppercase mb-0.5 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Catatan
                              Penolakan:
                            </p>
                            <p className="text-[10px] sm:text-xs text-red-700 leading-relaxed italic mb-2">
                              "{plan.alasan}"
                            </p>
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
                              className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-2 py-1.5 rounded-md text-[10px] font-bold transition-colors"
                            >
                              Edit & Ajukan Ulang
                            </button>
                          </div>
                        )}

                        {plan.status === "PENDING" && (
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
                            className="w-full mt-2 bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100 px-2 py-1.5 rounded-md text-[10px] font-bold transition-colors"
                          >
                            Edit Pengajuan
                          </button>
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

              {/* --- FINALISASI / HASIL PANEN --- */}
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
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500"></span>{" "}
                      MENUNGGU FINALISASI
                    </h4>

                    {plans.filter(
                      (p) => p.status === "DISETUJUI" && !p.hasil_panen,
                    ).length === 0 ? (
                      <div className="text-center py-4 sm:py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-[10px] sm:text-xs text-gray-400">
                          Tidak ada rencana aktif yang perlu diselesaikan.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 sm:gap-4">
                        {plans
                          .filter(
                            (p) => p.status === "DISETUJUI" && !p.hasil_panen,
                          )
                          .map((plan) => {
                            // --- LOGIKA SKENARIO 2: MENGGUNAKAN GATEKEEPER DARI API ---
                            const gk = plan.gatekeeper || {};

                            // 1. Membaca 4 indikator dari JSON Backend sesuai respon asli
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
                            // ====== SEMENTARA DIKOMENTARI KARENA BE OTOMATIS TRUE ======
                            // const logistikAcc =
                            //   gk.is_logistik_siap !== undefined
                            //     ? gk.is_logistik_siap
                            //     : plan.status_logistik === "DITERIMA" ||
                            //       plan.status_logistik === "APPROVED";

                            // const logistikAcc = true; // DIKOMENTARI JUGA AGAR ESLINT TIDAK ERROR
                            // ==========================================================

                            // 2. KUNCI UTAMA: is_bisa_selesai dari Backend
                            // Jika `is_bisa_selesai` true, maka tombol Selesai akan menyala (Bisa di-klik)
                            const canFinalize = gk.is_bisa_selesai === true;

                            return (
                              <div
                                key={plan.id}
                                className={`flex flex-col p-3 sm:p-4 bg-white border rounded-lg shadow-sm transition-all gap-3
                                  ${canFinalize ? "border-blue-400 shadow-md" : "border-gray-200"}`}
                              >
                                <div className="flex justify-between items-start">
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
                                      Target: {plan.estimasi} Kg
                                    </p>
                                  </div>
                                </div>

                                {/* --- CHECKLIST GATEKEEPER UI --- */}
                                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-100">
                                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                                    Syarat Bisa Klik Selesai:
                                  </p>
                                  <ul className="text-[10px] sm:text-xs space-y-1">
                                    <li
                                      className={`flex items-center gap-1.5 ${inGroup ? "text-green-600 font-bold" : "text-gray-400"}`}
                                    >
                                      {inGroup ? (
                                        <CheckCircle className="w-3 h-3" />
                                      ) : (
                                        <Clock className="w-3 h-3" />
                                      )}
                                      TBS Berhasil Kebun Jual ke Pabrik
                                    </li>
                                    <li
                                      className={`flex items-center gap-1.5 ${pabrikAcc ? "text-green-600 font-bold" : "text-gray-400"}`}
                                    >
                                      {pabrikAcc ? (
                                        <CheckCircle className="w-3 h-3" />
                                      ) : (
                                        <Clock className="w-3 h-3" />
                                      )}
                                      TBS Diterima oleh Pabrik
                                    </li>

                                    {/* ====== SEMENTARA DIKOMENTARI ====== */}
                                    {/* <li
                                      className={`flex items-center gap-1.5 ${logistikAcc ? "text-green-600 font-bold" : "text-gray-400"}`}
                                    >
                                      {logistikAcc ? (
                                        <CheckCircle className="w-3 h-3" />
                                      ) : (
                                        <Clock className="w-3 h-3" />
                                      )}
                                      Berhasil Mendapatkan Mitra Logistik
                                    </li> */}
                                    {/* =================================== */}

                                    <li
                                      className={`flex items-center gap-1.5 ${hasCatatan ? "text-green-600 font-bold" : "text-red-500"}`}
                                    >
                                      {hasCatatan ? (
                                        <CheckCircle className="w-3 h-3" />
                                      ) : (
                                        <AlertCircle className="w-3 h-3" />
                                      )}
                                      Catatan Aktivitas Pekerja Terisi
                                    </li>
                                  </ul>
                                </div>

                                <button
                                  onClick={() => openResultModal(plan.id)}
                                  disabled={!canFinalize}
                                  className={`w-full text-xs sm:text-sm py-2 rounded-lg font-bold transition shadow-sm
                                    ${
                                      !canFinalize
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                    }`}
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

                  {/* RIWAYAT SELESAI */}
                  <div>
                    <h4 className="text-[10px] sm:text-xs font-bold text-gray-500 mb-2 sm:mb-3 flex items-center gap-2 pt-4 border-t border-gray-100">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>{" "}
                      RIWAYAT SELESAI
                    </h4>

                    {plans.filter((p) => p.hasil_panen).length === 0 ? (
                      <p className="text-[10px] sm:text-xs text-gray-400 italic ml-2 sm:ml-4">
                        Belum ada riwayat panen selesai.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-3 sm:gap-4">
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
                                <div className="col-span-2 mt-2 pt-2 border-t border-dashed border-gray-100">
                                  <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold">
                                    Kualitas TBS
                                  </p>
                                  <p className="text-xs sm:text-sm font-bold text-gray-800 italic">
                                    {plan.hasil_panen.kualitas_tbs
                                      ? `"${plan.hasil_panen.kualitas_tbs}"`
                                      : "-"}
                                  </p>
                                </div>
                              </div>
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

        {/* ================= SECTION 3 AKSI SIKLUS (PINDAHAN) ================= */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <h3 className="text-xs sm:text-sm font-bold text-black mb-3 uppercase tracking-wide">
            Aksi Manajemen Siklus
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
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
                    ? "Siklus saat ini selesai"
                    : "Tunggu Panen Selesai"}
                </span>
              </div>
            </button>
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
