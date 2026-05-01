import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Info,
  Package,
  CheckCircle2,
  ClipboardList,
  Send,
  Save,
  PencilLine,
  Loader2,
  XCircle,
  ShoppingCart,
} from "lucide-react";
// Pastikan path API_ENDPOINTS Anda benar
import { API_ENDPOINTS, NOTIF_MESSAGES } from "../../config/constants";

// ==========================================
// DEKLARASI KOMPONEN UTAMA
// ==========================================
const TransaksiTBS = () => {
  // --- STATE UI DASAR ---
  const [activeMainSection, setActiveMainSection] = useState("rencana");
  const [activeSubRencana, setActiveSubRencana] = useState(null);
  const [openDetailId, setOpenDetailId] = useState(null);

  // --- STATE LIST RENCANA AKTIF ---
  const [kebutuhanAktif, setKebutuhanAktif] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // --- STATE FORM RENCANA HARIAN ---
  const [isLoading, setIsLoading] = useState(false);
  const [formRencana, setFormRencana] = useState({
    jenis_sawit: "Tenera",
    harga_beli: "",
    kapasitas_ton: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
  });

  // --- STATE UNTUK EDIT CARD KEBUTUHAN ---
  const [editingKebutuhanId, setEditingKebutuhanId] = useState(null);
  const [editForm, setEditForm] = useState({ harga: "", kapasitas_ton: "" });

  // Fungsi untuk membuka mode edit pada card tertentu
  const handleEditClick = (item) => {
    setEditingKebutuhanId(item.id);
    setEditForm({
      harga: item.harga_beli_per_kg,
      kapasitas_ton: item.kuota_kapasitas_kg / 1000,
    });
  };

  // Fungsi untuk membatalkan mode edit
  const handleCancelEdit = () => {
    setEditingKebutuhanId(null);
    setEditForm({ harga: "", kapasitas_ton: "" });
  };

  // Fungsi POST/PATCH ke API untuk Update Rencana
  const handleSaveEdit = async (kebutuhanId) => {
    try {
      setIsLoadingList(true); // pakai loading list agar ui tidak bisa diklik sementara
      const token = localStorage.getItem("token");

      const payload = {
        harga_beli_per_kg: parseFloat(editForm.harga),
        kuota_kapasitas_kg: parseFloat(editForm.kapasitas_ton) * 1000,
      };

      const response = await fetch(
        API_ENDPOINTS.FARM.MARKETPLACE.UPDATE_KEBUTUHAN(kebutuhanId),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (response.ok) {
        alert("Rencana kebutuhan berhasil diperbarui!");
        setEditingKebutuhanId(null);
        fetchKebutuhanAktif(); // Refresh data terbaru
      } else {
        alert("Gagal memperbarui: " + (data.detail || "Error Server"));
      }
    } catch (error) {
      console.error("Edit Error:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoadingList(false);
    }
  };

  // ==========================================
  // FUNGSI & LOGIKA
  // ==========================================

  // Fungsi untuk mengambil data rencana aktif dari backend
  const fetchKebutuhanAktif = async () => {
    setIsLoadingList(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        API_ENDPOINTS.FARM.MARKETPLACE.GET_KEBUTUHAN_AKTIF,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (response.ok) {
        setKebutuhanAktif(data);
      } else {
        console.error("Gagal memuat rencana aktif:", data);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoadingList(false);
    }
  };


// --- STATE LIST PENAWARAN MASUK ---
  const [penawaranMasuk, setPenawaranMasuk] = useState([]);
  const [isLoadingPenawaran, setIsLoadingPenawaran] = useState(false);

  // Fungsi untuk mengambil data penawaran dari backend
  const fetchPenawaranMasuk = async () => {
    setIsLoadingPenawaran(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        API_ENDPOINTS.FARM.MARKETPLACE.GET_PENGAJUAN_MASUK,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      console.log("Data mentah dari API:", data);

      if (response.ok) {
        console.log("Fetch berhasil! Menyimpan data ke state penawaranMasuk:", data);
        setPenawaranMasuk(data);
      } else {
        console.error("Gagal memuat penawaran:", data);
      }
    } catch (error) {
      console.error("Gagal memuat penawaran:", error);
    } finally {
      setIsLoadingPenawaran(false);
    }
  };

  // --- STATE ACTION PABRIK ---
  const [processingActionId, setProcessingActionId] = useState(null);

  // Fungsi PATCH ke API untuk Terima / Tolak Penawaran
  const handleActionPenawaran = async (grupId, isAccepted) => {
    const confirmMsg = isAccepted
      ? "Apakah Anda yakin ingin MENERIMA penawaran ini? Kuota pabrik akan otomatis terpotong."
      : "Apakah Anda yakin ingin MENOLAK penawaran ini?";

    if (!window.confirm(confirmMsg)) return;

    setProcessingActionId(grupId);
    try {
      const token = localStorage.getItem("token");

      // Payload sesuai skema ActionPabrikRequest di BE
      const payload = {
        status_pengajuan: isAccepted ? "DISETUJUI" : "DITOLAK",
        catatan_dari_pabrik: null, // Opsional, bisa diisi jika fitur catatan diaktifkan nanti
      };

      const response = await fetch(
        API_ENDPOINTS.FARM.MARKETPLACE.ACTION_PENGAJUAN(grupId),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (response.ok) {
        alert(`Penawaran berhasil ${isAccepted ? "diterima" : "ditolak"}!`);
        fetchPenawaranMasuk(); // Refresh list penawaran
        fetchKebutuhanAktif(); // Refresh kuota pabrik (karena kuota berkurang jika diterima)
      } else {
        alert("Gagal memproses penawaran: " + (data.detail || "Error Server"));
      }
    } catch (error) {
      console.error("Action Error:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setProcessingActionId(null);
    }
  };

  // Trigger fetch berdasarkan tab yang aktif
  useEffect(() => {
    if (activeMainSection === "rencana") {
      fetchKebutuhanAktif();
    } else if (activeMainSection === "penawaran") {
      fetchPenawaranMasuk();
    }
  }, [activeMainSection]);

  // Helper untuk mengubah tanggal menjadi label "Hari Ini", "Besok", "Lusa"
  const getLabelHari = (tanggalStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(tanggalStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hari Ini";
    if (diffDays === 1) return "Besok";
    if (diffDays === 2) return "Lusa";
    if (diffDays < 0) return "Lewat";
    return `H+${diffDays}`;
  };

  // Handler untuk mengikat input field form dengan state
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormRencana((prev) => ({ ...prev, [name]: value }));
  };

  // Fungsi POST ke API untuk membuat Rencana Baru
  const handleSubmitRencana = async () => {
    if (
      !formRencana.tanggal_mulai ||
      !formRencana.tanggal_selesai ||
      !formRencana.harga_beli ||
      !formRencana.kapasitas_ton
    ) {
      alert(
        NOTIF_MESSAGES?.ERROR?.INCOMPLETE_FORM ||
          "Harap lengkapi Tanggal Mulai, Tanggal Selesai, Harga, dan Kapasitas!",
      );
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        tanggal_mulai: formRencana.tanggal_mulai,
        tanggal_selesai: formRencana.tanggal_selesai,
        jenis_sawit_dibutuhkan: formRencana.jenis_sawit,
        kuota_kapasitas_kg: parseFloat(formRencana.kapasitas_ton) * 1000,
        harga_beli_per_kg: parseFloat(formRencana.harga_beli),
      };

      const token = localStorage.getItem("token");

      const response = await fetch(
        API_ENDPOINTS.FARM.MARKETPLACE.CREATE_KEBUTUHAN,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (response.ok) {
        alert(
          data.message ||
            NOTIF_MESSAGES?.SUCCESS?.SAVE_DATA ||
            "Rencana Kebutuhan berhasil diterbitkan!",
        );
        // Reset form setelah sukses
        setFormRencana({
          jenis_sawit: "Tenera",
          harga_beli: "",
          kapasitas_ton: "",
          tanggal_mulai: "",
          tanggal_selesai: "", // Pastikan tanggal_selesai juga direset
        });
        setActiveSubRencana(null);
        fetchKebutuhanAktif();
      } else {
        alert(
          (NOTIF_MESSAGES?.ERROR?.SERVER_ERROR || "Gagal: ") +
            (data.detail || "Terjadi kesalahan pada server."),
        );
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert(NOTIF_MESSAGES?.ERROR?.NETWORK || "Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

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

  // ==========================================
  // RENDER UI (HTML/JSX)
  // ==========================================
  return (
    <div className="space-y-6 p-4 md:p-8 min-h-screen font-sans">
      {/* ======================== HEADER ============================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl shadow-sm border border-red-100 shrink-0">
            <ShoppingCart className="text-[#B5302D]" size={28} />
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
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full lg:w-auto overflow-x-auto hide-scrollbar">
          <button
            onClick={() => toggleMainSection("rencana")}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 lg:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-bold transition-all ${
              activeMainSection === "rencana"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="whitespace-nowrap">Kebutuhan TBS</span>
          </button>
          <button
            onClick={() => toggleMainSection("penawaran")}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 lg:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-bold transition-all ${
              activeMainSection === "penawaran"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="whitespace-nowrap">Penawaran TBS</span>
          </button>
        </div>
      </div>

      <hr className="border-gray-200" />
      {/* --- GARIS PEMBATAS --- */}
      <hr className="border-gray-200 mb-8" />

      {/* ======================== KONTEN 1: RENCANA KEBUTUHAN ============================ */}
      {activeMainSection === "rencana" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
            <Info className="text-blue-500 shrink-0" size={20} />
            <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
              Pilih <strong>rencana harian</strong> untuk menginformasikan
              kebutuhan pabrik kepada kebun.
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
                      Rencana Kebutuhan TBS Harian
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
                      <select
                        name="jenis_sawit"
                        value={formRencana.jenis_sawit}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg p-3 text-sm bg-white outline-none focus:border-[#EF8523]"
                      >
                        <option value="Tenera">Tenera</option>
                        <option value="Dura">Dura</option>
                        <option value="Pisifera">Pisifera</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase">
                        Harga Beli/kg
                      </label>
                      <input
                        type="number"
                        name="harga_beli"
                        min="1"
                        value={formRencana.harga_beli}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg p-3 text-sm outline-none focus:border-[#EF8523]"
                        placeholder="Contoh: 3100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase">
                        Kapasitas (Ton)
                      </label>
                      <input
                        type="number"
                        name="kapasitas_ton"
                        min="0.1"
                        step="any"
                        value={formRencana.kapasitas_ton}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg p-3 text-sm outline-none focus:border-[#EF8523]"
                        placeholder="Contoh: 50"
                      />
                    </div>

                    {/* BAGIAN TANGGAL DIBUAT BERSEBELAHAN ATAU DISESUAIKAN GRIDNYA */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase">
                        Tanggal Mulai
                      </label>
                      <input
                        type="date"
                        name="tanggal_mulai"
                        value={formRencana.tanggal_mulai}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg p-3 text-sm outline-none focus:border-[#EF8523]"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      {" "}
                      {/* Bisa disesuaikan gridnya agar rapi */}
                      <label className="text-[11px] font-bold text-gray-600 uppercase">
                        Tanggal Selesai
                      </label>
                      <input
                        type="date"
                        name="tanggal_selesai"
                        value={formRencana.tanggal_selesai}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg p-3 text-sm outline-none focus:border-[#EF8523]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                    <button
                      onClick={handleSubmitRencana}
                      disabled={isLoading}
                      className={`w-full sm:w-auto px-8 py-3 ${
                        isLoading
                          ? "bg-gray-400"
                          : "bg-[#B5302D] hover:bg-[#8e2523]"
                      } text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 order-2 sm:order-1`}
                    >
                      <Save size={16} />{" "}
                      {isLoading ? "Menyimpan..." : "Simpan Rencana"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* DYNAMIC SECTION: 3 HARI KEDEPAN */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#B5302D] flex items-center gap-2">
                  <Info size={16} /> Rencana Aktif (3 Hari Kedepan)
                </h3>
                <button
                  onClick={fetchKebutuhanAktif}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Refresh Data
                </button>
              </div>

              {isLoadingList ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Memuat data...
                </div>
              ) : kebutuhanAktif.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-xl border border-gray-200">
                  Belum ada rencana kebutuhan yang aktif.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kebutuhanAktif.map((item) => {
                    
                    console.log("Data Card Rencana Aktif:", item);

                    // Konversi Harga
                    const formatRupiah = new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(item.harga_beli_per_kg);

                    // Konversi Format Tanggal ke DD-MM-YYYY
                    const tglObj = new Date(item.tanggal_rencana_kebutuhan);
                    const tglFormat = tglObj
                      .toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                      .replace(/\//g, "-");

                    // Konversi Kg ke Ton
                    const kapasitasTon = item.kuota_kapasitas_kg / 1000;

                    // Pengaturan Status Berdasarkan Enum BE
                    let statusLabel = "Tersedia";
                    let statusColor = "bg-green-100 text-green-700";
                    let progressBarColor = "bg-green-500";
                    let progressWidth = "0%";

                    if (item.status === "TERPENUHI") {
                      statusLabel = "Penuh";
                      statusColor = "bg-red-100 text-red-700";
                      progressBarColor = "bg-red-500";
                      progressWidth = "100%";
                    } else if (item.status === "DIBATALKAN") {
                      statusLabel = "Dibatalkan";
                      statusColor = "bg-gray-100 text-gray-700";
                      progressBarColor = "bg-gray-500";
                      progressWidth = "0%";
                    }

                    return (
                      <div
                        key={item.id}
                        className={`border ${editingKebutuhanId === item.id ? "border-[#EF8523] shadow-md" : "border-gray-200 shadow-sm"} bg-white p-4 rounded-xl relative flex flex-col transition-all`}
                      >
                        {/* Label Hari */}
                        <div className="absolute top-0 right-0 px-3 py-1 bg-gray-50 border-l border-b border-gray-100 rounded-bl-xl text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          {getLabelHari(item.tanggal_rencana_kebutuhan)}
                        </div>

                        <p className="text-[#EF8523] font-bold text-lg mt-2">
                          {tglFormat}
                        </p>

                        <div className="flex justify-between items-start mb-4">
                          <p className="text-xs text-gray-400">
                            {item.jenis_sawit_dibutuhkan}
                          </p>
                          {/* Tombol Edit: Hanya muncul jika bukan status terpenuhi/batal dan tidak sedang diedit */}
                          {editingKebutuhanId !== item.id &&
                            item.status !== "TERPENUHI" &&
                            item.status !== "DIBATALKAN" && (
                              <button
                                onClick={() => handleEditClick(item)}
                                className="text-gray-400 hover:text-[#EF8523] transition-colors"
                                title="Edit Rencana"
                              >
                                <PencilLine size={16} />
                              </button>
                            )}
                        </div>

                        {/* TAMPILAN MODE EDIT VS MODE NORMAL */}
                        {editingKebutuhanId === item.id ? (
                          <div className="space-y-3 mb-2 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-600 uppercase">
                                Harga Beli/kg
                              </label>
                              <input
                                type="number"
                                value={editForm.harga}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    harga: e.target.value,
                                  })
                                }
                                className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-[#EF8523]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-600 uppercase">
                                Kapasitas (Ton)
                              </label>
                              <input
                                type="number"
                                value={editForm.kapasitas_ton}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    kapasitas_ton: e.target.value,
                                  })
                                }
                                className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-[#EF8523]"
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={handleCancelEdit}
                                className="flex-1 py-1.5 border border-red-200 text-red-500 rounded text-xs font-bold hover:bg-red-50"
                              >
                                Batal
                              </button>
                              <button
                                onClick={() => handleSaveEdit(item.id)}
                                className="flex-1 py-1.5 bg-[#EF8523] text-white rounded text-xs font-bold hover:bg-orange-600"
                              >
                                Simpan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* MODE NORMAL TAMPILAN INFORMASI */}
                            <div className="flex justify-between items-center text-xs mb-3">
                              <span className="text-gray-500 font-medium">
                                Harga:
                              </span>
                              <span className="font-bold text-gray-800">
                                {formatRupiah}/kg
                              </span>
                            </div>

                            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
                              <div
                                className={`h-full ${progressBarColor}`}
                                style={{ width: progressWidth }}
                              />
                            </div>

                            <div className="flex justify-between items-center">
                              <span
                                className={`${statusColor} px-2 py-0.5 rounded text-[10px] font-bold uppercase`}
                              >
                                {statusLabel}
                              </span>
                              <span className="text-[11px] font-mono font-bold text-gray-600">
                                Kapasitas: {kapasitasTon} Ton
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================== KONTEN 2: PENAWARAN PEMBELIAN ============================ */}
      {activeMainSection === "penawaran" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
            <Info className="text-blue-500 shrink-0" size={20} />
            <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
              Berikut <strong>Daftar penawaran TBS dari kebun.</strong> Periksa
              detail setiap transaksi sebelum mengambil tindakan.
            </p>
          </div>

          <div className="space-y-3">
            {isLoadingPenawaran ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                Memuat Data...
              </div>
            ) : penawaranMasuk.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-xl border border-gray-200">
                Belum ada penawaran masuk dari kebun.
              </div>
            ) : (
              penawaranMasuk.map((item) => {
                // Konversi logika dari BE
                const estimasiTon = item.estimasi_total_tbs_grup_kg / 1000;
                const tglPanenFormat = new Date(
                  item.tanggal_rencana_panen,
                ).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                });

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all"
                  >
                    <div
                      onClick={() => toggleDetail(item.id)}
                      className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      {/* --- KIRI: Info Utama --- */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#EF8523] shrink-0">
                          <Package size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">
                            {item.nama_grup}
                          </h4>
                          <p className="text-xs text-gray-500 font-medium truncate max-w-[180px] md:max-w-none">
                            {item.nama_kebun} • {estimasiTon} Ton
                          </p>
                        </div>
                      </div>

                      {/* --- KANAN: Status & Action --- */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0">
                        <div className="text-left sm:text-right flex flex-col sm:items-end gap-1">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                            Status
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${
                              item.status_pengajuan === "MENUNGGU_PABRIK"
                                ? "bg-yellow-100 text-yellow-700"
                                : item.status_pengajuan === "DISETUJUI" ||
                                    item.status_pengajuan === "DITERIMA"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.status_pengajuan.replace("_", " ")}
                          </span>
                        </div>

                        <button className="py-1.5 px-4 border border-gray-200 rounded-lg sm:rounded-full text-[11px] sm:text-xs font-bold text-gray-600 flex items-center gap-1.5 hover:bg-gray-100 transition-all">
                          <span className="hidden sm:inline">
                            {openDetailId === item.id ? "Tutup" : "Detail"}
                          </span>
                          {openDetailId === item.id ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {openDetailId === item.id && (
                      <div className="border-t border-gray-100 bg-white animate-slideDown">
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-y-3 md:gap-x-12">
                          {/* Mapping Berdasarkan Skema BE GrupPenjualanResponse */}
                          {[
                            {
                              label: "Nama Grup/Pengajuan",
                              value: item.nama_grup,
                            },
                            {
                              label: "Asal Kebun/Gapoktan",
                              value: item.nama_kebun,
                            },
                            { label: "Kontak Kebun", value: item.no_hp_kebun },
                            {
                              label: "Jenis Sawit",
                              value: item.jenis_varietas_gabungan,
                            },
                            {
                              label: "Range Usia Pohon",
                              value: item.usia_pohon_range,
                            },
                            { label: "Rencana Panen", value: tglPanenFormat },
                            {
                              label: "Estimasi Total",
                              value: `${estimasiTon} Ton`,
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
                              Titik Kumpul / Alamat Pickup
                            </label>
                            <p className="text-xs text-gray-700 leading-relaxed font-medium">
                              {item.alamat_pickup_teks}
                            </p>
                          </div>
                        </div>

                        {/* Tombol Aksi hanya tampil jika status masih MENUNGGU_PABRIK */}
                        {item.status_pengajuan === "MENUNGGU_PABRIK" && (
                          <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                            <button
                              onClick={() =>
                                handleActionPenawaran(item.id, true)
                              }
                              disabled={processingActionId === item.id}
                              className="py-3 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingActionId === item.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={16} />
                              )}
                              {processingActionId === item.id
                                ? "Memproses..."
                                : "Terima Penawaran"}
                            </button>

                            <button
                              onClick={() =>
                                handleActionPenawaran(item.id, false)
                              }
                              disabled={processingActionId === item.id}
                              className="py-3 rounded-xl bg-white border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingActionId === item.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <XCircle size={16} />
                              )}
                              {processingActionId === item.id
                                ? "Memproses..."
                                : "Tolak"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransaksiTBS;
