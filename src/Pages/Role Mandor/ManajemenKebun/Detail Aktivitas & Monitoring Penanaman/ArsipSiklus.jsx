import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Leaf,
  ClipboardList,
  Activity,
  Loader2,
  CheckCircle,
  History,
  ChevronDown,
  Clock,
  Sprout,
  FileText,
} from "lucide-react";
import { API_ENDPOINTS, getFileUrl } from "../../../../config/constants";

export default function ArsipSiklus() {
  const { id, siklusId } = useParams();
  const navigate = useNavigate();

  const [arsipData, setArsipData] = useState(null);
  const [loading, setLoading] = useState(true);

  // State Accordion disesuaikan untuk struktur bersarang (Nested)
  const [openSection, setOpenSection] = useState({
    tanam: true,
    panen_rencana: false,
    panen_catatan: true, // Dibuka otomatis sebagai default
    panen_finalisasi: false,
    mon_sanitasi: false,
    mon_covercrop: false,
    mon_piringan: false,
    mon_pupuk: false,
    mon_opt: false,
    mon_drainase: false,
  });

  const toggleSection = (section) => {
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const fetchArsipDetail = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const url = API_ENDPOINTS.FARM.PETANI.ACTIVITY.GET_ARSIP_SIKLUS_DETAIL(
          id,
          siklusId,
        );

        const response = await fetch(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setArsipData(data);
        } else {
          alert("Gagal memuat detail arsip dari server.");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArsipDetail();
  }, [id, siklusId]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#EF8523] animate-spin" />
          <p className="text-xs sm:text-sm font-medium text-gray-500">
            Memuat Data Arsip...
          </p>
        </div>
      </div>
    );
  }

  if (!arsipData) return null;

  const { meta, data_tanam, data_panen, data_monitoring } = arsipData;

  // --- PERSIAPAN DATA PANEN ---
  const totalTbs = data_panen.reduce(
    (total, p) => total + (p.hasil_panen?.jumlah_total_tbs_terkumpul || 0),
    0,
  );

  const allHarvestLogs = data_panen.flatMap((plan) =>
    (plan.catatan_pemanenan || []).map((log) => ({
      ...log,
      planTanggal: plan.tanggal_rencana_panen,
      planId: plan.id,
    })),
  );
  allHarvestLogs.sort(
    (a, b) => new Date(b.tanggal_pemanenan) - new Date(a.tanggal_pemanenan),
  );

  const renderBadge = (value) => {
    if (!value) return <span className="text-gray-400">-</span>;
    let colorClass = "bg-gray-100 text-gray-600 border-gray-200";
    const valLower = String(value).toLowerCase();

    if (
      [
        "bersih",
        "baik",
        "lancar",
        "lembab",
        "cerah",
        "disetujui",
        "selesai",
      ].some((k) => valLower.includes(k))
    )
      colorClass = "bg-green-50 text-green-700 border-green-200";
    else if (
      ["ringan", "sedikit", "kering", "mendung", "pending"].some((k) =>
        valLower.includes(k),
      )
    )
      colorClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
    else if (
      [
        "berat",
        "rusak",
        "mati",
        "banyak",
        "menggenang",
        "hujan",
        "ditolak",
      ].some((k) => valLower.includes(k))
    )
      colorClass = "bg-red-50 text-red-700 border-red-200";

    return (
      <span
        className={`px-2 py-1 rounded text-[10px] sm:text-[11px] font-bold border ${colorClass} inline-block whitespace-nowrap`}
      >
        {value}
      </span>
    );
  };

  const MonitoringTable = ({ data, columns }) => {
    if (!data || data.length === 0) {
      return (
        <div className="py-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-lg">
          <p className="text-xs font-medium text-gray-500">
            Belum ada data tercatat.
          </p>
        </div>
      );
    }
    return (
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-[#EF8523] text-white text-[10px] sm:text-xs uppercase font-bold">
            <tr>
              <th className="px-3 py-3 text-center w-[50px] border-r border-orange-400/50">
                No
              </th>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-3 py-3 border-r border-orange-400/50 text-center whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-800">
            {data.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="hover:bg-orange-50/30 transition-colors"
              >
                <td className="px-3 py-2.5 text-center border-r border-gray-100 font-medium text-gray-500">
                  {rIdx + 1}
                </td>
                {columns.map((col, cIdx) => (
                  <td
                    key={cIdx}
                    className={`px-3 py-2.5 border-r border-gray-100 ${col.align === "center" ? "text-center" : ""}`}
                  >
                    {col.isBadge ? (
                      renderBadge(row[col.key])
                    ) : col.isDate ? (
                      <span className="font-medium">
                        {String(row[col.key]).split("T")[0]}
                      </span>
                    ) : col.isLink && row[col.key] ? (
                      <a
                        href={getFileUrl(row[col.key], "FARM")}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#EF8523] hover:underline flex items-center justify-center gap-1 font-bold text-xs"
                      >
                        <FileText size={14} /> Lihat
                      </a>
                    ) : (
                      row[col.key] || "-"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-10 min-h-screen font-sans pb-24">
      <div className="max-w-7xl mx-auto">
        {/* === HEADER NAVIGASI === */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#EF8523] transition px-2 py-1.5 rounded-lg hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Kembali
          </button>
        </div>

        {/* === HEADER HERO (TITLE PAGE) === */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl shadow-sm border border-blue-100 shrink-0">
              <History className="text-blue-700" size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-blue-700">
                Arsip Siklus Ke-{meta.siklus_yang_ditampilkan}
              </h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Melihat keseluruhan rekam jejak operasional di masa lalu.
              </p>
            </div>
          </div>
          <span className="self-start lg:self-auto bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-[10px] sm:text-sm shadow-sm font-medium tracking-wide">
            Unit: {meta.nama_unit || "..."}
          </span>
        </div>

        <hr className="border-gray-200 mb-6 sm:mb-8" />

        {/* ======================================================= */}
        {/* 1. SECTION DATA TANAM */}
        {/* ======================================================= */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6 sm:mb-8">
          <div
            className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleSection("tanam")}
          >
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#B5302D] flex items-center gap-2">
                <Leaf className="w-5 h-5 sm:w-6 sm:h-6" /> Data Realisasi Tanam
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                Informasi penanaman awal dan detail bibit pada siklus ini.
              </p>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transform transition-transform ${openSection.tanam ? "rotate-180" : ""}`}
            />
          </div>

          {openSection.tanam && (
            <div className="p-4 sm:p-6 animate-fadeIn">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold mb-1">
                    Status Penanaman
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {data_tanam?.status || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold mb-1">
                    Tanggal Tanam
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {data_tanam?.tanggal_tanam || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold mb-1">
                    Jenis & Varietas Bibit
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {data_tanam?.jenis_bibit} ({data_tanam?.varietas})
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold mb-1">
                    Jarak Tanam
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {data_tanam?.jarak_tanam}
                  </p>
                </div>
                <div className="col-span-2 lg:col-span-4 mt-2 pt-3 border-t border-blue-100">
                  <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold mb-1">
                    Catatan Audit Tanam
                  </p>
                  <p className="text-xs sm:text-sm text-gray-700 italic">
                    {data_tanam?.catatan_audit_tanam || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================= */}
        {/* 2. MASTER SECTION PEMANENAN
        {/* ======================================================= */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6 sm:mb-8">
          {/* Header Master Card Panen */}
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#B5302D] flex items-center gap-2">
                <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" /> Rekapitulasi
                Pemanenan
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                Seluruh riwayat pengajuan rencana, catatan pekerja, dan hasil
                panen aktual.
              </p>
            </div>
            <span className="self-start sm:self-auto bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold border border-green-200 shadow-sm">
              Total Produksi Siklus: {totalTbs} Kg
            </span>
          </div>

          {/* Wrapper Konten Master Panen dengan Background Sedikit Berbeda */}
          <div className="p-4 sm:p-6 bg-gray-50/50 space-y-4 sm:space-y-6">
            {/* SUB-MENU A: RENCANA PANEN */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div
                className="px-4 py-3 sm:px-5 sm:py-4 flex justify-between items-center cursor-pointer hover:bg-red-50/30 transition-colors border-b border-gray-100"
                onClick={() => toggleSection("panen_rencana")}
              >
                <h3 className="font-bold text-sm sm:text-base text-gray-800 tracking-wide">
                  A. Histori Rencana Panen
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${openSection.panen_rencana ? "rotate-180 text-[#B5302D]" : ""}`}
                />
              </div>

              {openSection.panen_rencana && (
                <div className="p-4 sm:p-5 animate-fadeIn bg-gray-50/30">
                  {data_panen.length === 0 ? (
                    <div className="text-center py-6 opacity-60">
                      <p className="text-sm text-gray-500">
                        Tidak ada riwayat rencana panen.
                      </p>
                    </div>
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
                            <th className="px-4 py-3 text-center">
                              Status Akhir
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-800">
                          {data_panen.map((plan) => (
                            <React.Fragment key={plan.id}>
                              <tr
                                className={`hover:bg-red-50/20 transition-colors ${plan.status === "SELESAI" ? "opacity-80 bg-gray-50" : ""} ${plan.status === "DITOLAK" ? "bg-red-50/30" : ""}`}
                              >
                                <td className="px-4 py-3 border-r border-gray-100 align-middle whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 font-medium">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    {plan.tanggal_rencana_panen}
                                  </div>
                                </td>
                                <td className="px-4 py-3 border-r border-gray-100 text-center font-bold text-gray-700 align-middle">
                                  {plan.estimasi_total_tbs_kg}
                                </td>
                                <td className="px-4 py-3 border-r border-gray-100 text-center font-bold text-gray-700 align-middle">
                                  {plan.luas_lahan_dipanen}
                                </td>
                                <td className="px-4 py-3 text-center align-middle">
                                  <span
                                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${
                                      plan.status === "DISETUJUI"
                                        ? "bg-green-100 text-green-700 border-green-200"
                                        : plan.status === "SELESAI"
                                          ? "bg-blue-100 text-blue-700 border-blue-200"
                                          : plan.status === "DITOLAK"
                                            ? "bg-red-100 text-red-700 border-red-200"
                                            : "bg-gray-100 text-gray-600 border-gray-200"
                                    }`}
                                  >
                                    {plan.status || "PENDING"}
                                  </span>
                                </td>
                              </tr>

                              {/* BARIS KHUSUS UNTUK PESAN DITOLAK */}
                              {plan.status === "DITOLAK" && (
                                <tr className="bg-red-50/50 border-b border-gray-200">
                                  <td colSpan="5" className="px-4 py-2">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                      <div>
                                        <p className="text-[10px] font-bold text-red-800 uppercase">
                                          Catatan Penolakan (Arsip):
                                        </p>
                                        <p className="text-xs text-red-700 italic">
                                          "
                                          {plan.catatan_penolakan ||
                                            "Ditolak oleh kebun."}
                                          "
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

            {/* SUB-MENU B: CATATAN AKTIVITAS PEKERJA */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div
                className="px-4 py-3 sm:px-5 sm:py-4 flex justify-between items-center cursor-pointer hover:bg-red-50/30 transition-colors border-b border-gray-100"
                onClick={() => toggleSection("panen_catatan")}
              >
                <h3 className="font-bold text-sm sm:text-base text-gray-800 tracking-wide">
                  B. Catatan Aktivitas Pemanenan
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${openSection.panen_catatan ? "rotate-180 text-[#B5302D]" : ""}`}
                />
              </div>

              {openSection.panen_catatan && (
                <div className="p-4 sm:p-5 animate-fadeIn bg-gray-50/30">
                  {allHarvestLogs.length === 0 ? (
                    <div className="text-center py-6 bg-white rounded-xl border border-dashed border-gray-300">
                      <p className="text-xs text-gray-500">
                        Belum ada catatan aktivitas pemanenan tercatat.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(
                        allHarvestLogs.reduce((acc, log) => {
                          if (!acc[log.tanggal_pemanenan])
                            acc[log.tanggal_pemanenan] = [];
                          acc[log.tanggal_pemanenan].push(log);
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
                                      {log.nama_pemanen}
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-center whitespace-nowrap">
                                      {log.jam_mulai} - {log.jam_selesai}
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-center font-bold text-blue-700">
                                      {log.jumlah_pokok_dipanen || 0}
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-center font-bold text-green-700">
                                      {log.jumlah_tandan_dipanen}
                                    </td>
                                    <td className="px-4 py-3 text-center italic text-gray-500">
                                      {log.kondisi_kebun || "-"}
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
              )}
            </div>

            {/* SUB-MENU C: FINALISASI SELESAI */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div
                className="px-4 py-3 sm:px-5 sm:py-4 flex justify-between items-center cursor-pointer hover:bg-red-50/30 transition-colors border-b border-gray-100"
                onClick={() => toggleSection("panen_finalisasi")}
              >
                <h3 className="font-bold text-sm sm:text-base text-gray-800 tracking-wide flex items-center gap-2">
                  C. Riwayat Finalisasi Selesai{" "}
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 hidden sm:block"></span>
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${openSection.panen_finalisasi ? "rotate-180 text-[#B5302D]" : ""}`}
                />
              </div>

              {openSection.panen_finalisasi && (
                <div className="p-4 sm:p-5 animate-fadeIn bg-gray-50/30">
                  {data_panen.filter((p) => p.hasil_panen).length === 0 ? (
                    <div className="col-span-full text-center py-6 opacity-60">
                      <p className="text-sm text-gray-500">
                        Belum ada riwayat panen selesai (Final).
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
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
                          {data_panen
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
                                  {plan.tanggal_rencana_panen}
                                </td>
                                <td className="px-4 py-3.5 border-r border-gray-100 text-center font-bold text-green-700">
                                  {plan.hasil_panen.jumlah_total_tbs_terkumpul}{" "}
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
              )}
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* 3. MASTER SECTION MONITORING GAP (GABUNGAN) */}
        {/* ======================================================= */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6 sm:mb-8">
          {/* Header Master Card Monitoring */}
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#B5302D] flex items-center gap-2">
                <Sprout className="w-5 h-5 sm:w-6 sm:h-6" /> Monitoring Budidaya
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                Rekam jejak terpusat untuk seluruh aktivitas perawatan,
                pemupukan, dan pengecekan lahan (GAP).
              </p>
            </div>
          </div>

          {/* Wrapper Konten Master Monitoring */}
          <div className="p-4 sm:p-6 bg-gray-50/50 space-y-4 sm:space-y-6">
            {/* SUB-MENU 1: SANITASI */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div
                onClick={() => toggleSection("mon_sanitasi")}
                className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between cursor-pointer hover:bg-orange-50/50 transition-colors border-b border-gray-100"
              >
                <h3 className="font-bold text-sm sm:text-base text-gray-800 tracking-wide">
                  1. Kegiatan Kebersihan & Rawat Kebun (Sanitasi)
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${openSection.mon_sanitasi ? "rotate-180 text-[#EF8523]" : ""}`}
                />
              </div>
              {openSection.mon_sanitasi && (
                <div className="p-4 sm:p-5 animate-fadeIn">
                  <MonitoringTable
                    data={data_monitoring.sanitasi}
                    columns={[
                      {
                        header: "Tanggal",
                        key: "tanggal_monitoring",
                        isDate: true,
                      },
                      { header: "Aktivitas", key: "aktivitas_perawatan" },
                      { header: "Deskripsi", key: "deskripsi_kegiatan" },
                      {
                        header: "Jml Petugas",
                        key: "jumlah_petugas",
                        align: "center",
                      },
                      {
                        header: "Pokok Ditindak",
                        key: "jumlah_pokok_ditindak",
                        align: "center",
                      },
                      {
                        header: "Kondisi Gulma",
                        key: "kondisi_gulma",
                        isBadge: true,
                      },
                      {
                        header: "Kondisi Parit",
                        key: "kondisi_parit",
                        isBadge: true,
                      },
                      {
                        header: "Lingkungan",
                        key: "kondisi_lingkungan",
                        isBadge: true,
                      },
                      {
                        header: "Dokumentasi kegiatan",
                        key: "dokumentasi_kebersihan_url",
                        isLink: true,
                        align: "center",
                      },
                    ]}
                  />
                </div>
              )}
            </div>

            {/* SUB-MENU 2: COVER CROP */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div
                onClick={() => toggleSection("mon_covercrop")}
                className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between cursor-pointer hover:bg-orange-50/50 transition-colors border-b border-gray-100"
              >
                <h3 className="font-bold text-sm sm:text-base text-gray-800 tracking-wide">
                  2. Kegiatan Tanaman Penutup Tanah (Kacangan)
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${openSection.mon_covercrop ? "rotate-180 text-[#EF8523]" : ""}`}
                />
              </div>
              {openSection.mon_covercrop && (
                <div className="p-4 sm:p-5 animate-fadeIn">
                  <MonitoringTable
                    data={data_monitoring.cover_crop}
                    columns={[
                      {
                        header: "Tanggal",
                        key: "tanggal_monitoring",
                        isDate: true,
                      },
                      { header: "Jenis LCC", key: "jenis_tanaman_penutup" },
                      { header: "Aktivitas", key: "aktivitas_perawatan" },
                      {
                        header: "Kondisi LCC",
                        key: "kondisi_tanaman",
                        isBadge: true,
                      },
                      {
                        header: "Tanah",
                        key: "kelembaban_tanah",
                        isBadge: true,
                      },
                      {
                        header: "Jml Petugas",
                        key: "jumlah_petugas",
                        align: "center",
                      },
                      {
                        header: "Pokok Ditindak",
                        key: "jumlah_pokok_ditindak",
                        align: "center",
                      },
                      {
                        header: "Dokumentasi kegiatan",
                        key: "dokumentasi_covercrop_url",
                        isLink: true,
                        align: "center",
                      },
                    ]}
                  />
                </div>
              )}
            </div>

            {/* SUB-MENU 3: PIRINGAN */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div
                onClick={() => toggleSection("mon_piringan")}
                className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between cursor-pointer hover:bg-orange-50/50 transition-colors border-b border-gray-100"
              >
                <h3 className="font-bold text-sm sm:text-base text-gray-800 tracking-wide">
                  3. Kegiatan Piringan (Pengecekan Pokok)
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${openSection.mon_piringan ? "rotate-180 text-[#EF8523]" : ""}`}
                />
              </div>
              {openSection.mon_piringan && (
                <div className="p-4 sm:p-5 animate-fadeIn">
                  {!data_monitoring.piringan ||
                  data_monitoring.piringan.length === 0 ? (
                    <div className="py-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">
                        Belum ada data piringan tercatat.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
                      <table className="min-w-full text-left">
                        <thead className="bg-[#EF8523] text-white text-[10px] sm:text-xs uppercase font-bold">
                          <tr>
                            <th className="px-3 py-3 text-center border-r border-orange-400/50 w-[50px]">
                              No
                            </th>
                            <th className="px-3 py-3 border-r border-orange-400/50">
                              Tanggal Cek
                            </th>
                            <th className="px-3 py-3 border-r border-orange-400/50 min-w-[180px]">
                              Hasil Kondisi
                            </th>
                            <th className="px-3 py-3 min-w-[200px]">
                              Tindakan Perawatan
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-[10px] sm:text-sm">
                          {data_monitoring.piringan.map((kondisi, idx) => (
                            <tr key={idx} className="hover:bg-orange-50/30">
                              <td className="px-3 py-3 text-center border-r border-gray-100 font-medium text-gray-500 align-top">
                                {idx + 1}
                              </td>
                              <td className="px-3 py-3 border-r border-gray-100 font-bold text-gray-700 align-top">
                                {
                                  String(kondisi.tanggal_monitoring).split(
                                    "T",
                                  )[0]
                                }
                              </td>
                              <td className="px-3 py-3 border-r border-gray-100 align-top">
                                <div className="text-[10px] sm:text-xs text-gray-600 space-y-1.5">
                                  <div>
                                    <p>
                                      <span className="font-semibold text-green-600">
                                        Bersih:
                                      </span>{" "}
                                      {kondisi.kondpi_bersih} Pkk
                                    </p>
                                    <p>
                                      <span className="font-semibold text-yellow-600">
                                        Gulma Ringan:
                                      </span>{" "}
                                      {kondisi.kondpi_bergulma_ringan} Pkk
                                    </p>
                                    <p>
                                      <span className="font-semibold text-red-600">
                                        Gulma Berat:
                                      </span>{" "}
                                      {kondisi.kondpi_bergulma_lebat} Pkk
                                    </p>
                                  </div>
                                  <div className="pt-1.5 border-t border-gray-100/80">
                                    <p>
                                      <span className="font-medium text-gray-500">
                                        T. Kering:
                                      </span>{" "}
                                      {kondisi.kondper_kering} Pkk
                                    </p>
                                    <p>
                                      <span className="font-medium text-gray-500">
                                        T. Lembab:
                                      </span>{" "}
                                      {kondisi.kondper_lembab} Pkk
                                    </p>
                                    <p>
                                      <span className="font-medium text-gray-500">
                                        T. Genang:
                                      </span>{" "}
                                      {kondisi.kondper_menggenang} Pkk
                                    </p>
                                  </div>
                                  {kondisi.catatan_tindakan && (
                                    <p className="italic text-gray-500 bg-gray-50 p-1 rounded mt-1">
                                      "{kondisi.catatan_tindakan}"
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-3 bg-gray-50/50 align-top">
                                {kondisi.aktivitas &&
                                kondisi.aktivitas.length > 0 ? (
                                  <div className="space-y-2">
                                    {kondisi.aktivitas.map((akt, i) => (
                                      <div
                                        key={i}
                                        className="bg-white border border-green-200 p-2.5 rounded-md shadow-sm"
                                      >
                                        <p className="font-bold text-green-700 text-xs">
                                          {akt.aktivitas_kegiatan}
                                        </p>

                                        {akt.deskripsi_kegiatan && (
                                          <p className="text-[10px] text-gray-600 mt-1 mb-1.5">
                                            {akt.deskripsi_kegiatan}
                                          </p>
                                        )}

                                        <div className="flex justify-between items-end mt-1.5 pt-1.5 border-t border-green-50">
                                          <div className="text-[10px] text-gray-500 leading-tight">
                                            <p>
                                              Tgl Tindakan:{" "}
                                              <span className="font-medium text-gray-700">
                                                {akt.tanggal_monitoring?.split(
                                                  "T",
                                                )[0] || "-"}
                                              </span>
                                            </p>
                                            <p>
                                              Petugas:{" "}
                                              <span className="font-medium text-gray-700">
                                                {akt.jumlah_petugas
                                                  ? `${akt.jumlah_petugas} Orang`
                                                  : "-"}
                                              </span>
                                            </p>

                                            <p>
                                              Pokok Ditindak:{" "}
                                              <span className="font-medium text-gray-700">
                                                {akt.jumlah_pokok_ditindak || 0}{" "}
                                                Pkk
                                              </span>
                                            </p>
                                          </div>

                                          {akt.dokumentasi_aktivitas_url && (
                                            <a
                                              href={getFileUrl(
                                                akt.dokumentasi_aktivitas_url,
                                                "FARM",
                                              )}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-[#EF8523] hover:underline flex items-center gap-1 text-[10px] font-bold bg-orange-50 px-1.5 py-0.5 rounded"
                                            >
                                              <FileText size={12} /> Dokumen
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 italic text-center py-4">
                                    Tidak ada tindakan tercatat.
                                  </p>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SUB-MENU 4: PUPUK */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div
                onClick={() => toggleSection("mon_pupuk")}
                className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between cursor-pointer hover:bg-orange-50/50 transition-colors border-b border-gray-100"
              >
                <h3 className="font-bold text-sm sm:text-base text-gray-800 tracking-wide">
                  4. Kegiatan Penggunaan Pupuk
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${openSection.mon_pupuk ? "rotate-180 text-[#EF8523]" : ""}`}
                />
              </div>
              {openSection.mon_pupuk && (
                <div className="p-4 sm:p-5 animate-fadeIn">
                  <MonitoringTable
                    data={data_monitoring.pupuk}
                    columns={[
                      {
                        header: "Tanggal",
                        key: "tanggal_pemupukan",
                        isDate: true,
                      },
                      { header: "Nama Pupuk", key: "nama_pupuk" },
                      {
                        header: "Total (Kg)",
                        key: "jumlah_total_pupuk_digunakan_kg",
                        align: "center",
                      },
                      {
                        header: "Cuaca",
                        key: "cuaca_saat_pemupukan",
                        isBadge: true,
                      },
                      {
                        header: "Jml Petugas",
                        key: "jumlah_petugas",
                        align: "center",
                      },
                      {
                        header: "Dokumentasi kegiatan",
                        key: "dokumentasi_pemupukan_url",
                        isLink: true,
                        align: "center",
                      },
                    ]}
                  />
                </div>
              )}
            </div>

            {/* SUB-MENU 5: PESTISIDA */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div
                onClick={() => toggleSection("mon_opt")}
                className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between cursor-pointer hover:bg-orange-50/50 transition-colors border-b border-gray-100"
              >
                <h3 className="font-bold text-sm sm:text-base text-gray-800 tracking-wide">
                  5. Kegiatan Penggunaan Racun/Obat Hama (OPT)
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${openSection.mon_opt ? "rotate-180 text-[#EF8523]" : ""}`}
                />
              </div>
              {openSection.mon_opt && (
                <div className="p-4 sm:p-5 animate-fadeIn">
                  <MonitoringTable
                    data={data_monitoring.pestisida}
                    columns={[
                      {
                        header: "Tanggal",
                        key: "tanggal_pemakaian",
                        isDate: true,
                      },
                      { header: "Nama Pestisida", key: "nama_pestisida" },
                      {
                        header: "Total Pakai",
                        key: "jumlah_total_digunakan",
                        align: "center",
                      },
                      {
                        header: "Satuan",
                        key: "satuan_dosis",
                        align: "center",
                      },
                      { header: "Sasaran (OPT)", key: "opt_sasaran" },
                      {
                        header: "Jml Petugas",
                        key: "jumlah_petugas",
                        align: "center",
                      },
                      {
                        header: "Pokok Ditindak",
                        key: "jumlah_pokok_ditindak",
                        align: "center",
                      },
                      {
                        header: "Dokumentasi Kegiatan",
                        key: "dokumentasi_pestisida_url",
                        isLink: true,
                        align: "center",
                      },
                    ]}
                  />
                </div>
              )}
            </div>

            {/* SUB-MENU 6: DRAINASE */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div
                onClick={() => toggleSection("mon_drainase")}
                className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between cursor-pointer hover:bg-orange-50/50 transition-colors border-b border-gray-100"
              >
                <h3 className="font-bold text-sm sm:text-base text-gray-800 tracking-wide">
                  6. Pemantauan Drainase (Muka Air Tanah)
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${openSection.mon_drainase ? "rotate-180 text-[#EF8523]" : ""}`}
                />
              </div>
              {openSection.mon_drainase && (
                <div className="p-4 sm:p-5 animate-fadeIn">
                  <MonitoringTable
                    data={data_monitoring.muka_air}
                    columns={[
                      {
                        header: "Tanggal Ukur",
                        key: "tanggal_pengukuran",
                        isDate: true,
                      },
                      {
                        header: "Kedalaman (cm)",
                        key: "kedalaman_muka_air_cm",
                        align: "center",
                      },
                      {
                        header: "Jml Petugas",
                        key: "jumlah_petugas",
                        align: "center",
                      },
                      {
                        header: "Dokumentasi Kegiatan",
                        key: "foto_pengukuran_url",
                        isLink: true,
                        align: "center",
                      },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
