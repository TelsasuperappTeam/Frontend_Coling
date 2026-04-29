import React, { useState, useEffect, useCallback } from "react";
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
  PackageCheck,
  CheckCircle,
  X,
  Upload,
  FileText,
  History,
  Save,
} from "lucide-react";

import { API_ENDPOINTS } from "../../config/constants.js";

const PenerimaanTBS = () => {
  // --- STATE TAB (Aktif vs Histori) ---
  const [activeTab, setActiveTab] = useState("aktif");

  // --- STATE DATA AKTIF ---
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE DATA HISTORI ---
  const [historyData, setHistoryData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // --- STATE UI & MODAL ---
  const [expandedId, setExpandedId] = useState(null);
  const [loadingTerimaId, setLoadingTerimaId] = useState(null);
  const [showModalForm, setShowModalForm] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [fileNota, setFileNota] = useState(null);
  const [formDataPem, setFormDataPem] = useState({
    bruto: "",
    tarra: "",
    brondolan: "",
    buah_terlalu_masak: "",
    buah_mentah: "",
    buah_busuk: "",
    buah_hampir_masak: "",
    tangkai_panjang: "",
    potongan_lain_lain: "",
    buah_kurang_dari_5_kg: "",
    buah_sakit: "",
    buah_basah: "",
    catatan: "",
  });

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  // ====================================================================
  // 1. FETCH DATA AKTIF (MONITORING)
  // ====================================================================
  const fetchShipments = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `${API_ENDPOINTS.TRACEABILITY.PABRIK.GET_MONITORING}?is_history=false`;

      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok)
        throw new Error("Gagal mengambil data monitoring pabrik");

      const data = await response.json();

      // --- CONSOLE LOG RESPON BE DITAMBAHKAN DI SINI ---
      console.log("=== DATA TRUK MASUK (AKTIF) DARI BE ===", data);

      const filteredData = data.filter(
        (item) => item.status_permintaan?.toLowerCase() === "diterima",
      );
      setShipments(filteredData);
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ====================================================================
  // 2. FETCH DATA HISTORI (DASHBOARD PEMERIKSAAN)
  // ====================================================================
  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      const url = `${API_ENDPOINTS.TRACEABILITY.PABRIK.GET_MONITORING}?is_history=true`;

      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Gagal mengambil data histori");
      const data = await response.json();

      console.log("=== DATA HISTORI PEMERIKSAAN ===", data);
      setHistoryData(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Effect untuk trigger fetch sesuai Tab yang aktif
  useEffect(() => {
    setExpandedId(null); // Tutup semua rincian jika ganti tab
    if (activeTab === "aktif") {
      fetchShipments();
    } else {
      fetchHistory();
    }
  }, [activeTab, fetchShipments, fetchHistory]);

  // ====================================================================
  // 3. ACTION KONFIRMASI TRUK TIBA
  // ====================================================================
  const handleTerimaPesanan = async (id) => {
    setLoadingTerimaId(id);
    try {
      const token = localStorage.getItem("token");
      const url = API_ENDPOINTS.TRACEABILITY.PABRIK.TERIMA_PESANAN(id);

      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Gagal mengkonfirmasi penerimaan");
      alert(
        "Truk dikonfirmasi tiba! Silakan lanjutkan mengisi hasil Timbangan & Sortasi TBS.",
      );

      // PENYESUAIAN SESUAI INSTRUKSI BE: Lakukan re-fetch data di tab aktif
      // Karena BE sekarang menahan data truknya, truk tidak akan hilang dari layar.
      fetchShipments();

      // Tetap buka popup otomatis agar memanjakan user (UX Plus)
      openModalPemeriksaan(id);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingTerimaId(null);
    }
  };

  // ====================================================================
  // 4. ACTION SUBMIT FORM PEMERIKSAAN
  // ====================================================================
  const openModalPemeriksaan = (pengirimanId) => {
    setSelectedFormId(pengirimanId);
    setFormDataPem({
      bruto: "",
      tarra: "",
      brondolan: "",
      buah_terlalu_masak: "",
      buah_mentah: "",
      buah_busuk: "",
      catatan: "",
    });
    setFileNota(null);
    setShowModalForm(true);
  };

  const handleSubmitPemeriksaan = async (e) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    try {
      const token = localStorage.getItem("token");
      const url =
        API_ENDPOINTS.TRACEABILITY.PABRIK.PEMERIKSAAN.SUBMIT(selectedFormId);

      const form = new FormData();
      form.append("bruto", parseFloat(formDataPem.bruto) || 0);
      form.append("tarra", parseFloat(formDataPem.tarra) || 0);
      form.append("brondolan", parseFloat(formDataPem.brondolan) || 0);
      form.append(
        "buah_terlalu_masak",
        parseFloat(formDataPem.buah_terlalu_masak) || 0,
      );
      form.append("buah_mentah", parseFloat(formDataPem.buah_mentah) || 0);
      form.append("buah_busuk", parseFloat(formDataPem.buah_busuk) || 0);

      form.append(
        "buah_hampir_masak",
        parseFloat(formDataPem.buah_hampir_masak) || 0,
      );
      form.append(
        "tangkai_panjang",
        parseFloat(formDataPem.tangkai_panjang) || 0,
      );
      form.append(
        "potongan_lain_lain",
        parseFloat(formDataPem.potongan_lain_lain) || 0,
      );
      form.append(
        "buah_kurang_dari_5_kg",
        parseFloat(formDataPem.buah_kurang_dari_5_kg) || 0,
      );
      form.append("buah_sakit", parseFloat(formDataPem.buah_sakit) || 0);
      form.append("buah_basah", parseFloat(formDataPem.buah_basah) || 0);
      // -----------------------------------------

      if (formDataPem.catatan) form.append("catatan", formDataPem.catatan);
      if (fileNota) form.append("dokumen_nota", fileNota);

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal submit pemeriksaan");

      alert("Data Pemeriksaan & Timbangan Berhasil Disimpan!");
      setShowModalForm(false);

      // UX PLUS: Langsung pindahkan user ke Tab Riwayat agar mereka bisa melihat hasilnya
      setActiveTab("riwayat");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const getStatusLabel = (pDB) => {
    if (pDB === "terima") return "Tiba di Pabrik";
    if (pDB === "menuju_pabrik") return "Dalam Perjalanan";
    if (pDB === "mengirim") return "Menjemput";
    return "Menunggu Penjemputan";
  };

  // Variabel Penentu Tab Aktif
  const isAktif = activeTab === "aktif";
  const currentData = isAktif ? shipments : historyData;
  const currentLoading = isAktif ? isLoading : isLoadingHistory;

  return (
    <div className="p-4 sm:p-8 md:p-10 min-h-screen text-gray-800 font-sans">
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row md:items-center justify-between gap-5 mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-red-50 rounded-xl sm:rounded-2xl shrink-0">
            <PackageCheck className="w-6 h-6 sm:w-8 sm:h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D] leading-tight">
              Penerimaan TBS
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Pantau kedatangan armada dan rekapitulasi timbangan TBS.
            </p>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full lg:w-auto">
          <button
            onClick={() => setActiveTab("aktif")}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
              activeTab === "aktif"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500"
            }`}
          >
            <Truck className="w-4 h-4" /> Truk Masuk (Aktif)
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
              activeTab === "riwayat"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500"
            }`}
          >
            <History className="w-4 h-4" /> Riwayat Selesai
          </button>
        </div>
      </div>

      <hr className="border-gray-200 mb-6 sm:mb-8" />

      {/* --- LIST KARTU CONTAINER --- */}
      <SectionCard
        title={
          isAktif
            ? "Daftar Truk Menuju Pabrik"
            : "Rekapitulasi Riwayat Pemeriksaan"
        }
      >
        {currentLoading ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            Memuat Data...
          </div>
        ) : currentData.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            Tidak ada data yang tersedia di tab ini.
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {currentData.map((item) => {
              const rawProgress = item.progress_db || "menunggu_pengiriman";
              const pDB = rawProgress.toLowerCase().replace(/\s+/g, "_");
              const uiStatusLabel = getStatusLabel(pDB);

              return (
                <MainCard key={item.id}>
                  {/* DATA RINGKAS (SELALU MUNCUL) */}
                  <div
                    className="flex flex-col md:flex-row justify-between gap-0 sm:gap-4 cursor-pointer w-full"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="flex-1 w-full">
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
                              {item.nama_gapoktan}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center sm:block justify-between bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none w-full sm:w-auto mt-1 sm:mt-0">
                          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider sm:mb-1">
                            No. Resi
                          </p>
                          <p className="text-xs sm:text-sm font-mono font-bold text-gray-700 bg-white sm:bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                            {item.kode_resi || "Menunggu"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mt-4">
                        <div className="col-span-2 sm:col-span-1 md:col-span-3 lg:col-span-1">
                          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Lokasi Penjemputan
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed line-clamp-2">
                            {item.alamat_pickup_teks}
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

                    <div className="flex flex-col items-center justify-center md:items-end gap-3 mt-5 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4 min-w-full md:min-w-[120px]">
                      <div className="flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 group-hover:bg-gray-50 transition-all shadow-sm w-full md:w-auto">
                        <span>
                          {expandedId === item.id
                            ? "Tutup Rincian"
                            : "Lihat Rincian"}
                        </span>
                        {expandedId === item.id ? (
                          <ChevronUp className="w-4 h-4 text-[#B5302D]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DATA DETAIL & ACTION (MUNCUL SAAT DI KLIK) */}
                  {expandedId === item.id && (
                    <div className="mt-5 sm:mt-8 pt-5 sm:pt-8 border-t border-gray-100 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-top-2">
                      {/* Pelacakan Armada */}
                      <div className="bg-gray-50 p-5 sm:p-6 rounded-[20px] sm:rounded-[25px] border border-gray-200">
                        <p className="text-[10px] sm:text-xs font-bold text-gray-900 uppercase mb-6 sm:mb-8 tracking-widest text-center">
                          Proses Pelacakan Armada
                        </p>
                        <div className="flex justify-between items-center max-w-3xl mx-auto relative px-2 sm:px-4">
                          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full"></div>
                          <StatusStep label="Menunggu" active={true} />
                          <StatusStep
                            label="Menjemput"
                            active={[
                              "mengirim",
                              "menuju_pabrik",
                              "terima",
                            ].includes(pDB)}
                          />
                          <StatusStep
                            label="Perjalanan"
                            active={["menuju_pabrik", "terima"].includes(pDB)}
                          />
                          <StatusStep
                            label="Selesai"
                            active={pDB === "terima"}
                          />
                        </div>

                        {/* --- TOMBOL AKSI HANYA MUNCUL DI TAB AKTIF --- */}
                        {isAktif && (
                          <div className="mt-8 flex flex-col items-center">
                            {(pDB === "menunggu_pengiriman" ||
                              pDB === "mengirim") && (
                              <div className="w-full sm:w-auto flex justify-center items-center gap-2 text-gray-500 bg-white px-6 py-3 rounded-xl text-[11px] sm:text-xs font-bold border border-gray-200 text-center cursor-not-allowed shadow-sm">
                                <Clock className="w-4 h-4 animate-spin-slow shrink-0 text-blue-500" />
                                Menunggu Kedatangan Truk Logistik
                              </div>
                            )}

                            {pDB === "menuju_pabrik" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTerimaPesanan(item.id);
                                }}
                                disabled={loadingTerimaId === item.id}
                                className="w-full sm:w-auto bg-orange-500 text-white px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                              >
                                {loadingTerimaId === item.id ? (
                                  <>
                                    <Clock className="w-4 h-4 animate-spin-slow" />{" "}
                                    Memproses...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" />{" "}
                                    Konfirmasi Truk Telah Tiba
                                  </>
                                )}
                              </button>
                            )}

                            {pDB === "terima" && !item.pemeriksaan && (
                              <div className="w-full sm:w-auto flex flex-col gap-3 animate-in fade-in">
                                <div className="text-center p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs font-semibold">
                                  Truk telah tiba! Silakan timbang dan lakukan
                                  sortasi TBS.
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModalPemeriksaan(item.id);
                                  }}
                                  className="w-full bg-[#B5302D] text-white px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg hover:bg-[#962624] transition-all flex items-center justify-center gap-2"
                                >
                                  <FileText className="w-4 h-4" /> Isi Form
                                  Pemeriksaan TBS
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* --- INFO HASIL TIMBANGAN MUNCUL JIKA DI TAB RIWAYAT --- */}
                        {!isAktif && item.pemeriksaan && (
                          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-4 sm:p-5 animate-in fade-in">
                            <h4 className="text-xs font-bold text-green-800 uppercase border-b border-green-200/50 pb-2 mb-3">
                              Hasil Timbangan & Pemeriksaan
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-[10px] text-green-700/70 font-bold uppercase">
                                  Berat Bruto
                                </p>
                                <p className="text-sm font-bold text-green-900">
                                  {item.pemeriksaan.bruto.toLocaleString(
                                    "id-ID",
                                  )}{" "}
                                  Kg
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-green-700/70 font-bold uppercase">
                                  Potongan
                                </p>
                                <p className="text-sm font-bold text-green-900">
                                  {item.pemeriksaan.total_potongan.toLocaleString(
                                    "id-ID",
                                  )}{" "}
                                  Kg
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-green-700/70 font-bold uppercase">
                                  Netto Akhir
                                </p>
                                <p className="text-sm font-extrabold text-green-900">
                                  {item.pemeriksaan.netto.toLocaleString(
                                    "id-ID",
                                  )}{" "}
                                  Kg
                                </p>
                              </div>
                              <div className="md:text-right">
                                <p className="text-[10px] text-green-700/70 font-bold uppercase">
                                  Total Harga
                                </p>
                                <p className="text-sm font-extrabold text-green-900 bg-white inline-block px-2 py-1 rounded border border-green-200">
                                  Rp{" "}
                                  {item.pemeriksaan.harga_final?.toLocaleString(
                                    "id-ID",
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* --- GRID DETAIL INFORMASI --- */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                              <span className="text-gray-500">
                                Tanggal Kirim:
                              </span>
                              <span className="font-bold text-right">
                                {item.tanggal_keberangkatan || "-"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-50">
                              <span className="text-gray-500">
                                Biaya Kirim:
                              </span>
                              <span className="font-extrabold text-[#B5302D] text-sm">
                                Rp{" "}
                                {(item.biaya_final || 0).toLocaleString(
                                  "id-ID",
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:gap-4">
                          <h4 className="text-[11px] sm:text-xs font-bold text-[#B5302D] uppercase flex items-center gap-2">
                            <Truck className="w-4 h-4" /> Armada & Supir
                          </h4>
                          <div className="flex-1 flex flex-col gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 text-xs sm:text-sm shadow-sm">
                            <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
                              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 shrink-0">
                                <User className="w-4 h-4 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">
                                  {item.kru?.nama_supir || "-"}
                                </p>
                                <p className="text-[10px] sm:text-xs text-blue-600 font-bold flex items-center gap-1.5 mt-0.5">
                                  <Phone className="w-3 h-3" />{" "}
                                  {item.kru?.nomor_telepon || "-"}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-y-2.5 pt-1">
                              <p className="text-gray-500">Kendaraan</p>
                              <p className="font-semibold text-right">
                                {item.kendaraan?.jenis_kendaraan_nama || "-"}
                              </p>
                              <p className="text-gray-500">Plat</p>
                              <p className="font-bold text-blue-600 text-right uppercase tracking-wider">
                                {item.kendaraan?.plat_kendaraan || "-"}
                              </p>
                            </div>
                          </div>
                        </div>

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
                                <p className="font-medium text-gray-700">
                                  {item.alamat_pickup_teks}
                                </p>
                              </div>
                              <div className="relative pl-4 border-l-2 border-dashed border-gray-200">
                                <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                                  Tujuan: Pabrik
                                </p>
                                <p className="font-medium text-gray-700">
                                  {item.alamat_pengiriman_pabrik}
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
                              <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-orange-50 text-orange-600 border border-orange-100">
                                {uiStatusLabel}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-5 sm:pt-6 mt-2 border-t border-gray-100">
                        <button
                          onClick={() => toggleExpand(null)}
                          className="w-full sm:w-auto px-8 py-3 bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-300 transition-all"
                        >
                          Tutup Rincian
                        </button>
                      </div>
                    </div>
                  )}
                </MainCard>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ================================================================= */}
      {/* MODAL FORM PEMERIKSAAN & TIMBANGAN */}
      {/* ================================================================= */}
      {showModalForm && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50/50 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-[#B5302D] flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Form Pemeriksaan TBS
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Masukkan hasil timbangan dan potongan sortasi kualitas.
                </p>
              </div>
              <button
                onClick={() => setShowModalForm(false)}
                className="p-1.5 bg-white text-gray-400 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitPemeriksaan}
              className="flex flex-col overflow-hidden"
            >
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-800 uppercase border-b border-gray-100 pb-2">
                    Data Timbangan Jembatan
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Berat Bruto (Kg) *
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-[#B5302D] outline-none"
                        value={formDataPem.bruto}
                        onChange={(e) =>
                          setFormDataPem({
                            ...formDataPem,
                            bruto: e.target.value,
                          })
                        }
                        placeholder="Contoh: 12000"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Berat Tanpa Muatan (Kg) *
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-[#B5302D] outline-none"
                        value={formDataPem.tarra}
                        onChange={(e) =>
                          setFormDataPem({
                            ...formDataPem,
                            tarra: e.target.value,
                          })
                        }
                        placeholder="Contoh: 4000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-800 uppercase border-b border-gray-100 pb-2">
                    Potongan Sortasi / Kualitas (Kg) Dan Persentase (%){" "}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Brondolan %
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        value={formDataPem.brondolan}
                        onChange={(e) =>
                          setFormDataPem({
                            ...formDataPem,
                            brondolan: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Buah Mentah %
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        value={formDataPem.buah_mentah}
                        onChange={(e) =>
                          setFormDataPem({
                            ...formDataPem,
                            buah_mentah: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Buah Busuk %
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        value={formDataPem.buah_busuk}
                        onChange={(e) =>
                          setFormDataPem({
                            ...formDataPem,
                            buah_busuk: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Terlalu Masak %
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        value={formDataPem.buah_terlalu_masak}
                        onChange={(e) =>
                          setFormDataPem({
                            ...formDataPem,
                            buah_terlalu_masak: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Hampir Masak %
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        value={formDataPem.buah_hampir_masak}
                        onChange={(e) =>
                          setFormDataPem({
                            ...formDataPem,
                            buah_hampir_masak: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Tangkai Panjang %
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        value={formDataPem.tangkai_panjang}
                        onChange={(e) =>
                          setFormDataPem({
                            ...formDataPem,
                            tangkai_panjang: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Tandan {"<"} 5 Kg %
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        value={formDataPem.buah_kurang_dari_5_kg}
                        onChange={(e) =>
                          setFormDataPem({
                            ...formDataPem,
                            buah_kurang_dari_5_kg: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Buah Sakit %
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        value={formDataPem.buah_sakit}
                        onChange={(e) =>
                          setFormDataPem({
                            ...formDataPem,
                            buah_sakit: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Buah Basah %
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        value={formDataPem.buah_basah}
                        onChange={(e) =>
                          setFormDataPem({
                            ...formDataPem,
                            buah_basah: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Potongan Lain %
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        value={formDataPem.potongan_lain_lain}
                        onChange={(e) =>
                          setFormDataPem({
                            ...formDataPem,
                            potongan_lain_lain: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-800 uppercase border-b border-gray-100 pb-2">
                    Dokumen & Catatan
                  </h4>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                      Upload Nota Timbangan (Opsional)
                    </label>

                    {fileNota ? (
                      /* --- TAMPILAN KETIKA FILE SUDAH DIUNGGAH (KECIL & RAPI) --- */
                      <label className="flex items-center justify-between w-full px-4 py-3 border border-green-300 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                          <p className="text-xs text-green-800 font-bold truncate">
                            {fileNota.name}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-green-700 bg-white border border-green-200 px-2 py-1 rounded-md shrink-0">
                          Ubah File
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => setFileNota(e.target.files[0])}
                        />
                      </label>
                    ) : (
                      /* --- TAMPILAN AWAL SEBELUM UPLOAD (BESAR) --- */
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-red-50 hover:border-[#B5302D] transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-6 h-6 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-500 font-semibold">
                            Klik untuk unggah foto nota
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => setFileNota(e.target.files[0])}
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                      Catatan Pemeriksaan
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm min-h-[80px]"
                      value={formDataPem.catatan}
                      onChange={(e) =>
                        setFormDataPem({
                          ...formDataPem,
                          catatan: e.target.value,
                        })
                      }
                      placeholder="Catatan tambahan bila ada..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setShowModalForm(false)}
                  className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingForm}
                  className="px-8 py-2.5 bg-[#B5302D] text-white rounded-xl text-xs font-bold shadow-lg shadow-red-100 hover:bg-[#962624] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingForm ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Simpan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- KOMPONEN HELPER --- */
const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[24px] sm:rounded-[30px] border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8 relative overflow-hidden group hover:shadow-md transition-all">
    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-90" />
    <h3 className="text-base sm:text-lg font-bold text-[#B5302D] mb-5 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

const MainCard = ({ children }) => (
  <div className="relative bg-white rounded-[20px] sm:rounded-[24px] border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 sm:p-6 overflow-hidden group">
    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#B5302D] opacity-0 group-hover:opacity-100 transition-opacity" />
    {children}
  </div>
);

const StatusStep = ({ label, active }) => (
  <div className="flex flex-col items-center justify-start gap-1.5 sm:gap-2 z-10 flex-1 px-1">
    <div
      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0 ${active ? "bg-green-600 border-green-600 text-white shadow-md scale-110" : "bg-white border-gray-200 text-gray-300"}`}
    >
      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    </div>
    <span
      className={`text-[9px] sm:text-xs font-medium sm:font-bold capitalize sm:uppercase text-center leading-tight tracking-tight break-words max-w-[65px] sm:max-w-none ${active ? "text-gray-900" : "text-gray-400"}`}
    >
      {label}
    </span>
  </div>
);

export default PenerimaanTBS;
