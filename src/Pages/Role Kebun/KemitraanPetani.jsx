import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  ChevronDown,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  ExternalLink,
  Loader2,
} from "lucide-react";
// Pastikan getFileUrl di-export dari constants.js
import { API_ENDPOINTS, getFileUrl } from "../../config/constants.js";
import { useNavigate, useLocation } from "react-router-dom";

const KemitraanPetani = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Membaca URL saat ini untuk menentukan tab mana yang aktif.
  // Jika URL mengandung kata "manajemen", maka tab manajemen aktif. Defaultnya validasi.
  const isManajemen = location.pathname.includes("manajemen");
  const activeTab = isManajemen ? "manajemen" : "validasi";

  // State data  untuk Validasi
  const [pendingPanen, setPendingPanen] = useState([]);
  const [pendingTanam, setPendingTanam] = useState([]);
  const [pendingDokumen, setPendingDokumen] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- TAMBAHKAN STATE INI ---
  const [petaniMembers, setPetaniMembers] = useState([]);
  const [loadingManajemen, setLoadingManajemen] = useState(false);

  // --- STATE MODAL REJECT ---
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRejectItem, setSelectedRejectItem] = useState({
    id: null,
    type: null, // 'panen' atau 'tanam'
  });

  /**
   * Mengambil data validasi (Rencana Panen & Rencana Tanam) dari API.
   * (SESUAI BE MAHAR):
   * - Endpoint GET Rencana Panen Pending
   * - Endpoint GET Rencana Tanam (Blok) Pending
   * Token diambil dari localStorage untuk otentikasi Bearer.
   */
  const fetchValidasiData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // (SESUAI BE MAHAR): FETCH RENCANA PANEN PENDING
      const resPanen = await fetch(
        API_ENDPOINTS.FARM.KEBUN.APPROVAL.GET_RENCANA_PANEN_PENDING,
        { headers },
      );
      const dataPanen = await resPanen.json();
      console.log("Data BE - Rencana Panen Pending:", dataPanen); // <-- CONSOLE LOG DITAMBAHKAN

      // (SESUAI BE MAHAR): FETCH RENCANA TANAM (BLOK) PENDING
      const resTanam = await fetch(
        API_ENDPOINTS.FARM.KEBUN.APPROVAL.GET_PENDING_BLOK,
        { headers },
      );
      const dataTanam = await resTanam.json();
      console.log("Data BE - Rencana Tanam (Blok) Pending:", dataTanam); // <-- CONSOLE LOG DITAMBAHKAN

      // (SESUAI BE MAHAR): FETCH PENDING DOKUMEN ISPO
      const resDokumen = await fetch(
        API_ENDPOINTS.ISPO.KEBUN.GET_PETANI_PENDING_SUBMISSION_ISPO,
        { headers },
      );
      const dataDokumen = await resDokumen.json();
      console.log("Data BE - Dokumen ISPO Pending:", dataDokumen); // <-- CONSOLE LOG DITAMBAHKAN

      if (Array.isArray(dataPanen)) setPendingPanen(dataPanen);
      if (Array.isArray(dataTanam)) setPendingTanam(dataTanam);
      if (Array.isArray(dataDokumen)) setPendingDokumen(dataDokumen); // <-- SIMPAN DATA DOKUMEN
    } catch (error) {
      console.error("Gagal mengambil data validasi:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mengambil data daftar petani yang sudah disetujui
   */
  const fetchPetaniMembers = async () => {
    setLoadingManajemen(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_ENDPOINTS.USER.KEBUN.PETANI_MEMBERS, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil data anggota petani");
      }

      const data = await res.json();
      setPetaniMembers(data);
    } catch (error) {
      console.error("Error fetching petani members:", error);
    } finally {
      setLoadingManajemen(false);
    }
  };

  useEffect(() => {
    if (activeTab === "validasi") {
      fetchValidasiData();
    } else if (activeTab === "manajemen") {
      fetchPetaniMembers(); // <-- Panggil di sini
    }
  }, [activeTab]);

  // --- MODAL HANDLERS ---
  const openRejectModal = (id, type) => {
    setSelectedRejectItem({ id, type });
    setRejectReason("");
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedRejectItem({ id: null, type: null });
  };

  /**
   * Fungsi helper generic untuk mengirim request approval/rejection ke Backend.
   * (SESUAI BE MAHAR):
   * - Body request berisi `status_approval` ('disetujui' | 'ditolak').
   * - Jika ditolak, `catatan_penolakan` wajib dikirim.
   */
  const sendApprovalRequest = async (url, isApprove, reason, contextName) => {
    const payload = {
      status_approval: isApprove ? "disetujui" : "ditolak",
    };

    // Hanya kirim catatan jika ditolak & ada isinya
    if (!isApprove && reason) {
      payload.catatan_penolakan = reason;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const textResponse = await res.text();
        let errorMessage = `Gagal memproses ${contextName} (Status: ${res.status})`;
        try {
          const jsonResponse = JSON.parse(textResponse);
          if (jsonResponse.detail) {
            errorMessage += `: ${JSON.stringify(jsonResponse.detail)}`;
          } else if (jsonResponse.message) {
            errorMessage += `: ${jsonResponse.message}`;
          }
        } catch {
          errorMessage += `: ${textResponse.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      }

      alert(`${contextName} berhasil ${isApprove ? "disetujui" : "ditolak"}`);
      fetchValidasiData(); // Refresh data tabel/grid setelah sukses
    } catch (error) {
      console.error(`Error ${contextName}:`, error);
      alert(error.message);
    }
  };

  // (SESUAI BE MAHAR): Handler Approve/Reject Rencana Panen
  const processActionPanen = async (id, isApprove, reason = null) => {
    const url = API_ENDPOINTS.FARM.KEBUN.APPROVAL.ACTION_RENCANA_PANEN(id);
    await sendApprovalRequest(url, isApprove, reason, "Rencana Panen");
  };

  // (SESUAI BE MAHAR): Handler Approve/Reject Rencana Tanam (Blok)
  const processActionTanam = async (id, isApprove, reason = null) => {
    const url = API_ENDPOINTS.FARM.KEBUN.APPROVAL.APPROVE_BLOK(id);
    await sendApprovalRequest(url, isApprove, reason, "Rencana Tanam");
  };

  // (SESUAI BE MAHAR): Handler Approve/Reject Dokumen ISPO
  const processActionDokumen = async (id, isApprove, reason = null) => {
    // Karena URL pakai {id}, kita replace string-nya
    const url = API_ENDPOINTS.ISPO.KEBUN.REVIEW_DOKUMEN_ISPO.replace(
      "{id}",
      id,
    );

    // Payload spesifik ISPO (bukan status_approval, tapi status)
    const payload = {
      status: isApprove ? "APPROVED" : "REJECTED",
    };
    if (!isApprove && reason) {
      payload.catatan_revisi = reason;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal mereview dokumen ISPO");
      alert(`Dokumen berhasil ${isApprove ? "disetujui" : "ditolak"}`);
      fetchValidasiData(); // Refresh tabel
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleSubmitRejection = async () => {
    if (!rejectReason.trim()) {
      alert("Harap isi alasan penolakan.");
      return;
    }

    if (selectedRejectItem.type === "panen") {
      await processActionPanen(selectedRejectItem.id, false, rejectReason);
    } else if (selectedRejectItem.type === "tanam") {
      await processActionTanam(selectedRejectItem.id, false, rejectReason);
    } else if (selectedRejectItem.type === "dokumen") {
      // <-- TAMBAHAN UNTUK DOKUMEN ISPO
      await processActionDokumen(selectedRejectItem.id, false, rejectReason);
    }

    closeRejectModal();
  };

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans relative">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            {activeTab === "validasi" ? (
              <Users className="w-8 h-8 text-[#B5302D]" />
            ) : (
              <Users className="w-8 h-8 text-[#B5302D]" />
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Kemitraan Petani
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              {activeTab === "validasi"
                ? "Validasi rencana kerja dan dokumen sertifikasi petani."
                : "Kelola data profil dan progres ISPO anggota petani."}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto">
          <button
            onClick={() => navigate("/kebun/kemitraanpetani/validasi")}
            className={`w-1/2 sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-6 py-2.5 rounded-lg text-[9px] sm:text-xs font-bold transition-all ${
              activeTab === "validasi"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500"
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="leading-tight text-center">Validasi</span>
          </button>
          <button
            onClick={() => navigate("/kebun/kemitraanpetani/manajemen")}
            className={`w-1/2 sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-6 py-2.5 rounded-lg text-[9px] sm:text-xs font-bold transition-all ${
              activeTab === "manajemen"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="leading-tight text-center">Manajemen Mandor</span>
          </button>
        </div>
      </div>

      {/* --- GARIS PEMBATAS --- */}
      <hr className="border-gray-200 mb-8" />

      {/* --- CONTENT AREA --- */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {activeTab === "validasi" && (
          <>
            {/* VALIDASI RENCANA PANEN (SESUAI BE MAHAR: RencanaPanenResponse) */}
            <SectionCard title="Validasi Rencana Panen">
              <p className="text-xs text-gray-500 mb-6 -mt-4">
                Daftar pengajuan rencana panen petani yang harus divalidasi.
              </p>

              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 text-[#B5302D] animate-spin" />
                </div>
              ) : pendingPanen.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm font-medium bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                  Tidak ada rencana panen yang harus divalidasi.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {pendingPanen.map((item) => (
                    <ValidationCard
                      key={item.id}
                      title={item.nama_unit || `Unit ${item.id}`}
                    >
                      <div className="space-y-2 text-[11px] sm:text-xs text-gray-700">
                        {/* --- DATA UTAMA: Mapping response BE Rencana Panen --- */}
                        <DetailRow
                          label="Nama Petani"
                          value={item.nama_petani}
                        />

                        <DetailRow
                          label="Siklus Panen Ke"
                          value={item.nomor_siklus || "-"}
                        />

                        <DetailRow
                          label="Tanggal Rencana"
                          value={item.tanggal_rencana_panen}
                        />
                        <DetailRow
                          label="Usia Tanaman"
                          value={item.usia_tanaman}
                        />
                        <DetailRow
                          label="Luas Panen (Ha)"
                          value={item.luas_lahan_dipanen}
                        />
                        <DetailRow
                          label="Jenis Sawit"
                          value={item.jenis_sawit || "-"}
                        />

                        {/* Tampilkan baris Varietas HANYA jika jenis_sawit adalah Tenera */}
                        {item.jenis_sawit?.toLowerCase() === "tenera" && (
                          <DetailRow
                            label="Varietas"
                            value={item.nama_varietas || "-"}
                          />
                        )}

                        {item.catatan_penolakan && (
                          <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                            <p className="font-bold text-red-500 mb-1">
                              Catatan Penolakan Sebelumnya:
                            </p>
                            <p className="text-gray-600 pl-1 italic">
                              "{item.catatan_penolakan}"
                            </p>
                          </div>
                        )}

                        {/* Estimasi TBS (Perhitungan BE) */}
                        <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between font-bold text-[#B5302D]">
                          <span>Estimasi TBS:</span>
                          <span>{item.estimasi_total_tbs_kg} Kg</span>
                        </div>
                      </div>

                      {/* Action Buttons: Trigger API Action */}
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <button
                          onClick={() => openRejectModal(item.id, "panen")}
                          className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          title="Tolak"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => processActionPanen(item.id, true)}
                          className="p-1.5 rounded-lg border border-green-200 text-green-500 hover:bg-green-50 transition-colors"
                          title="Setujui"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </ValidationCard>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* VALIDASI RENCANA TANAM (SESUAI BE MAHAR: BlokResponse) */}
            <SectionCard title="Validasi Rencana Tanam">
              <p className="text-xs text-gray-500 mb-6 -mt-4">
                Daftar pengajuan rencana replanting atau tanam baru (Blok
                Lahan).
              </p>

              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 text-[#B5302D] animate-spin" />
                </div>
              ) : pendingTanam.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm font-medium bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                  Tidak ada rencana tanam pending.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {pendingTanam.map((item) => (
                    <ValidationCard
                      key={item.id}
                      title={item.nama_unit || `Blok #${item.id}`}
                    >
                      <div className="space-y-2 text-[11px] sm:text-xs text-gray-700">
                        {/* --- DATA UMUM --- */}
                        <DetailRow
                          label="Tanggal Tanam"
                          value={item.tanggal_tanam_blok}
                        />
                        <DetailRow
                          label="Luas Unit (Ha)"
                          value={item.luas_unit}
                        />

                        {/* Info Bibit */}
                        <DetailRow
                          label="Jenis Bibit"
                          value={item.jenis_bibit}
                        />

                        {/* Tampilkan baris Varietas HANYA jika jenis_bibit adalah Tenera */}
                        {item.jenis_bibit?.toLowerCase() === "tenera" && (
                          <DetailRow
                            label="Varietas"
                            value={
                              item.dinamis_varietas_bibit?.nama_varietas ||
                              item.varietas_bibit_nama ||
                              "-"
                            }
                          />
                        )}

                        <DetailRow
                          label="Jml. Bibit Total"
                          value={item.jumlah_total_tanaman}
                        />
                        <DetailRow
                          label="Tanaman/Ha"
                          value={item.jumlah_tanaman_per_ha}
                        />

                        <DetailRow
                          label="Jarak Tanam"
                          value={
                            item.jarak_tanam === "Lainnya"
                              ? item.jarak_tanam_lainnya
                              : item.jarak_tanam
                          }
                        />

                        {/* --- LOGIKA KONDISI LAHAN --- */}
                        <div className="pt-2 mt-2 border-t border-gray-100 font-semibold text-gray-900 mb-1">
                          Kondisi Lahan
                        </div>

                        <div className="grid grid-cols-1 gap-2 mb-2">
                          <DetailRow
                            label="Jenis Tanah"
                            value={item.jenis_tanah}
                          />
                          <DetailRow
                            label="Jenis Lahan"
                            value={item.jenis_lahan}
                          />
                        </div>

                        {/* A. LOGIKA MINERAL */}
                        {item.jenis_tanah === "Mineral" && (
                          <>
                            {/* Terasering (Miring/Konservasi) */}
                            {(item.jenis_lahan === "Miring" ||
                              item.jenis_lahan === "Konservasi") && (
                              <div className="bg-yellow-50 p-2 rounded border border-yellow-100 mt-1">
                                <DetailRow
                                  label="Terasering"
                                  // Cek jika nilainya 'Lainnya', ambil dari field _lainnya
                                  value={
                                    item.jenis_terasering_mineral === "Lainnya"
                                      ? item.jenis_terasering_mineral_lainnya
                                      : item.jenis_terasering_mineral || "-"
                                  }
                                />
                                {item.dok_bukti_terasering_url && (
                                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-dashed border-gray-300">
                                    <span className="text-gray-500 font-medium italic text-[10px]">
                                      Bukti:
                                    </span>
                                    {/* (SESUAI BE MAHAR): getFileUrl helper */}
                                    <a
                                      href={getFileUrl(
                                        item.dok_bukti_terasering_url,
                                        "FARM",
                                      )}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-600 flex items-center gap-1 hover:underline font-bold text-[10px]"
                                    >
                                      Lihat File{" "}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Drainase (Khusus Konservasi) */}
                            {item.jenis_lahan === "Konservasi" && (
                              <div className="bg-blue-50 p-2 rounded border border-blue-100 mt-1">
                                <DetailRow
                                  label="Drainase"
                                  value={
                                    item.jenis_drainase_mineral === "Lainnya"
                                      ? item.jenis_drainase_mineral_lainnya
                                      : item.jenis_drainase_mineral || "-"
                                  }
                                />
                                {item.dok_bukti_drainase_url && (
                                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-dashed border-gray-300">
                                    <span className="text-gray-500 font-medium italic text-[10px]">
                                      Bukti:
                                    </span>
                                    <a
                                      href={getFileUrl(
                                        item.dok_bukti_drainase_url,
                                        "FARM",
                                      )}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-600 flex items-center gap-1 hover:underline font-bold text-[10px]"
                                    >
                                      Lihat File{" "}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* LOGIKA GAMBUT */}
                        {item.jenis_tanah === "Gambut" && (
                          <div className="bg-emerald-50 p-2 rounded border border-emerald-100 mt-2 space-y-1">
                            <div className="flex items-center gap-1 text-emerald-800 border-b border-emerald-200 pb-1 mb-1 font-bold">
                              Detail Gambut
                            </div>
                            <DetailRow
                              label="Lapisan Mineral"
                              value={
                                item.gambut_lapisan_mineral?.join(", ") || "-"
                              }
                            />
                            <DetailRow
                              label="Kematangan"
                              value={item.gambut_kematangan?.join(", ") || "-"}
                            />
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <button
                          onClick={() => openRejectModal(item.id, "tanam")}
                          className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          title="Tolak"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => processActionTanam(item.id, true)}
                          className="p-1.5 rounded-lg border border-green-200 text-green-500 hover:bg-green-50 transition-colors"
                          title="Setujui"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </ValidationCard>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* 3. VALIDASI DOKUMEN */}
            <SectionCard title="Validasi Dokumen Sertifikasi">
              <p className="text-xs text-gray-500 mb-6 -mt-4">
                Tabel pengajuan dokumen sertifikasi oleh petani yang harus dicek
                kebun.
              </p>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EF8523] text-white text-[11px] uppercase tracking-wider">
                      <th className="p-4 font-bold rounded-tl-xl">No</th>
                      <th className="p-4 font-bold">Nama Petani</th>
                      <th className="p-4 font-bold">Nama Dokumen</th>
                      <th className="p-4 font-bold">Prinsip ISPO</th>
                      <th className="p-4 font-bold">File Dokumen</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold text-center rounded-tr-xl">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-700 bg-white">
                    {/* 1. CEK KONDISI LOADING DULU */}
                    {loading ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="p-8 text-center text-gray-400"
                        >
                          <div className="text-center py-10 text-gray-400 text-xs font-bold">
                            Memuat data validasi ISPO petani...
                          </div>
                        </td>
                      </tr>
                    ) : pendingDokumen.length === 0 ? (
                      /* 2. JIKA TIDAK LOADING & DATA KOSONG */
                      <tr>
                        <td
                          colSpan="7"
                          className="p-6 text-center text-gray-400 font-bold"
                        >
                          Tidak ada dokumen sertifikasi yang menunggu validasi.
                        </td>
                      </tr>
                    ) : (
                      /* 3. JIKA TIDAK LOADING & DATA ADA */
                      pendingDokumen.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                        >
                          <td className="p-4 font-bold text-center">
                            {index + 1}
                          </td>

                          {/* MENGGUNAKAN NAMA PETANI DARI BE */}
                          <td className="p-4 font-bold text-[#B5302D]">
                            {item.nama_petani || "Tidak Diketahui"}
                          </td>

                          {/* MENGGUNAKAN JENIS DOKUMEN DARI BE */}
                          <td className="p-4 font-medium">
                            {item.jenis_dokumen || item.requirement_code}
                          </td>

                          {/* MENGGUNAKAN PRINSIP ISPO DARI BE */}
                          <td className="p-4 text-gray-500 font-semibold">
                            {item.prinsip_ispo || "-"}
                          </td>

                          <td className="p-4">
                            <a
                              href={getFileUrl(item.file_url, "ISPO")}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline font-bold"
                            >
                              <FileText className="w-3 h-3" /> Buka File
                            </a>
                          </td>

                          {/* MENGGUNAKAN STATUS DARI BE DENGAN GAYA BADGE */}
                          <td className="p-4 italic text-gray-400">
                            <span className="bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-1 rounded-md text-[10px] font-bold not-italic">
                              {item.status || "PENDING"}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() =>
                                  openRejectModal(item.id, "dokumen")
                                }
                                className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                                title="Tolak"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() =>
                                  processActionDokumen(item.id, true)
                                }
                                className="text-green-500 hover:bg-green-50 p-1.5 rounded transition-colors"
                                title="Validasi (Setujui)"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </>
        )}

        {/* TAB MANAJEMEN */}
        {activeTab === "manajemen" && (
          <SectionCard title="Manajemen Petani">
            <p className="text-xs text-gray-500 mb-6 -mt-4">
              Daftar lokasi kebun yang dimiliki dan profil detail petani mitra.
            </p>

            {/* --- TAMBAHKAN LOGIKA LOADING & KOSONG --- */}
            {loadingManajemen ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 text-[#B5302D] animate-spin" />
              </div>
            ) : petaniMembers.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm font-medium bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                Belum ada petani yang bergabung.
              </div>
            ) : (
              <div className="space-y-6">
                {petaniMembers.map((petani) => (
                  <PetaniProfileCard key={petani.id} data={petani} />
                ))}
              </div>
            )}
          </SectionCard>
        )}
      </div>

      {/* ================= MODAL POPUP REJECT ================= */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            {/* Header Modal */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Tolak Pengajuan
                </h3>
                <p className="text-xs text-gray-500">
                  Berikan alasan mengapa pengajuan ini ditolak.
                </p>
              </div>
            </div>

            {/* Input Reason */}
            <textarea
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#B5302D] focus:border-transparent min-h-[100px]"
              placeholder="Contoh: Dokumen kurang jelas, data tidak sesuai..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              autoFocus
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 text-sm font-bold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitRejection}
                className="px-4 py-2 text-sm font-bold text-white bg-[#B5302D] rounded-lg shadow-lg shadow-red-200 hover:bg-[#962523] transition-all"
              >
                Kirim Penolakan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===================== COMPONENT HELPERS ===================== */

const SectionCard = ({ title, children }) => {
  return (
    <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden group hover:shadow-md transition-all">
      {/* Decorative Header Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />

      <h3 className="text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">
        {title}
      </h3>
      {children}
    </div>
  );
};

//Komponen ValidationCard (Isi Item Validasi)
const ValidationCard = ({ title, children }) => {
  // State untuk dropdown: Default False (Tertutup)
  // Karena useState ada di sini, setiap card INDEPENDEN.
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`rounded-xl border border-gray-200 overflow-hidden relative shadow-sm hover:shadow-md transition-all bg-gray-50/50 ${
        isOpen ? "pb-14" : ""
      }`}
    >
      {/* Header Dropdown  */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#EF8523] text-white px-4 py-3 flex justify-between items-center cursor-pointer select-none hover:bg-[#d6731b] transition-colors"
      >
        <span className="font-bold text-xs sm:text-sm">{title}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Content Body (Only rendered when isOpen) */}
      {isOpen && (
        <div className="p-5 bg-white animate-in slide-in-from-top-2">
          {children}
        </div>
      )}
    </div>
  );
};

// Komponen PetaniProfileCard (Manajemen Petani)
const PetaniProfileCard = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  // --- STATE BARU UNTUK PROGRESS ISPO ---
  const [ispoProgress, setIspoProgress] = useState(null);
  const [loadingIspo, setLoadingIspo] = useState(false);

  // Buat URL Foto Profil. Gunakan UI-Avatars jika foto_profil_url kosong/null
  const fotoProfilUrl = data.foto_profil_url
    ? getFileUrl(data.foto_profil_url, "USER")
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nama_lengkap)}&background=random`;

  // --- EFEK FETCH PROGRESS ISPO SAAT CARD DIBUKA ---
  useEffect(() => {
    // Hanya fetch jika card dibuka dan data ISPO belum ada
    if (isOpen && !ispoProgress) {
      const fetchProgressIspo = async () => {
        setLoadingIspo(true);
        try {
          const token = localStorage.getItem("token");
          // Pastikan API_ENDPOINTS.ISPO.KEBUN.GET_PROGRES_ISPO_PETANI_NAUNGAN sudah Anda definisikan di constants.js
          const url =
            API_ENDPOINTS.ISPO.KEBUN.GET_PROGRES_ISPO_PETANI_NAUNGAN.replace(
              "{petani_id}",
              data.id,
            );

          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const result = await res.json();
            // Simpan bagian progress_summary ke state
            setIspoProgress(result.progress_summary);
          } else {
            console.error("Gagal mengambil progres ISPO:", await res.text());
          }
        } catch (error) {
          console.error("Error fetching ISPO progress:", error);
        } finally {
          setLoadingIspo(false);
        }
      };

      fetchProgressIspo();
    }
  }, [isOpen, data.id, ispoProgress]);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#EF8523] px-6 py-3 flex justify-between items-center text-white cursor-pointer hover:bg-[#d6731b] transition-colors"
      >
        <span className="font-bold text-sm">{data.nama_lengkap}</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="p-6 flex flex-col lg:flex-row gap-8 items-center lg:items-start animate-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start flex-1 w-full">
            <img
              src={fotoProfilUrl}
              alt={data.nama_lengkap}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-md"
            />
            <div className="space-y-2 text-xs w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="font-bold text-gray-500">Email:</p>
                  <p className="text-gray-800">{data.email}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-500">No Telepon:</p>
                  <p className="text-gray-800">{data.no_hp}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-500">Status:</p>
                  <p className="text-gray-800 font-bold capitalize">
                    {data.status || "Approved"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="font-bold text-gray-500">Alamat:</p>
                  <p className="text-gray-800">{data.alamat || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* --- BAGIAN PROGRESS ISPO DINAMIS --- */}
          <div className="flex flex-col items-center lg:items-end gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 w-full lg:w-auto">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
              Progres ISPO (P1 - P5)
            </p>

            {loadingIspo ? (
              <div className="flex gap-3 justify-center items-center h-12">
                <span className="text-xs text-gray-400 animate-pulse">
                  Menghitung progres...
                </span>
              </div>
            ) : (
              <div className="flex gap-2 justify-center">
                {[
                  "prinsip_1",
                  "prinsip_2",
                  "prinsip_3",
                  "prinsip_4",
                  "prinsip_5",
                ].map((prinsip, idx) => {
                  // Ambil skor dari state, jika null/undefined jadikan 0
                  const score = ispoProgress ? ispoProgress[prinsip] || 0 : 0;
                  const displayScore = Math.round(score); // Bulatkan koma

                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1.5 group relative"
                    >
                      {/* Tooltip sederhana saat di-hover */}
                      <span className="absolute -top-6 bg-gray-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                        Prinsip {idx + 1}: {displayScore}%
                      </span>

                      {/* Lingkaran Progres SVG Ultra-Tipis & Elegan */}
                      <div className="relative w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm ring-1 ring-black/5 p-1">
                        <svg
                          viewBox="0 0 36 36"
                          className="absolute top-0 left-0 w-full h-full transform -rotate-90"
                        >
                          <defs>
                            <linearGradient
                              id={`kemitraanGradient-${idx}`}
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="0%"
                            >
                              <stop offset="0%" stopColor="#FF7875" />{" "}
                              {/* Merah Terang */}
                              <stop offset="100%" stopColor="#B5302D" />{" "}
                              {/* Merah Tua */}
                            </linearGradient>
                          </defs>

                          {/* Lingkaran Track (Abu-abu Pudar) */}
                          <path
                            className="text-gray-100"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />

                          {/* Lingkaran Progres Dinamis */}
                          <path
                            stroke={`url(#kemitraanGradient-${idx})`}
                            strokeWidth="2"
                            strokeDasharray={`${displayScore}, 100`}
                            strokeLinecap="round"
                            fill="none"
                            className="transition-all duration-1000 ease-in-out"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>

                        {/* Teks Persentase di Tengah */}
                        <div className="relative z-10 flex flex-col items-center">
                          <span className="text-[10px] font-bold text-[#B5302D] leading-none">
                            {displayScore}%
                          </span>
                        </div>
                      </div>

                      {/* Label P1, P2, dst */}
                      <span className="text-[9px] font-bold text-gray-500">
                        P{idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between border-b border-gray-50 pb-1 last:border-0">
    <span className="font-medium text-gray-500">{label} :</span>
    <span className="font-bold text-gray-800 text-right">{value}</span>
  </div>
);

export default KemitraanPetani;
