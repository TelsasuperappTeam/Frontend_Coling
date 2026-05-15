import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  ChevronDown,
  FileText,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Loader2,
} from "lucide-react";
// Pastikan getFileUrl di-export dari constants.js
import { API_ENDPOINTS, getFileUrl } from "../../config/constants.js";

const KemitraanPetani = () => {
  // State manajemen tab
  const [activeTab, setActiveTab] = useState("validasi");

  // State data dinamis untuk Validasi
  const [pendingPanen, setPendingPanen] = useState([]);
  const [pendingTanam, setPendingTanam] = useState([]);
  const [pendingDokumen, setPendingDokumen] = useState([]);
  const [loading, setLoading] = useState(false);

  // State data untuk Manajemen Petani
  const [petaniMembers, setPetaniMembers] = useState([]);
  const [loadingManajemen, setLoadingManajemen] = useState(false);

  // State Role & Target Kebun
  const [userRole] = useState(localStorage.getItem("role") || "");
  const [selectedKebunId, setSelectedKebunId] = useState("");
  const [kebunList, setKebunList] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 1. FETCH DAFTAR KEBUN (Khusus GM)
  const fetchKebunList = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpointURL = API_ENDPOINTS.USER.GMDistrik.GET_KEBUN_LIST;

      const res = await fetch(endpointURL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get("content-type");
      if (
        !res.ok ||
        !contentType ||
        !contentType.includes("application/json")
      ) {
        console.error(
          "Bukan JSON! URL yang ditembak salah. Status:",
          res.status,
        );
        return;
      }

      const data = await res.json();
      let listData = [];

      if (Array.isArray(data)) {
        listData = data;
        setKebunList(listData);
      } else if (data && Array.isArray(data.data)) {
        listData = data.data;
        setKebunList(listData);
      }

      // OTOMATIS PILIH UNIT PERTAMA
      if (listData.length > 0) {
        const firstId = listData[0].auth_id || listData[0].id;
        setSelectedKebunId(firstId);
      }
    } catch (error) {
      console.error("Gagal mengambil daftar kebun:", error);
    }
  };

  // 2. FETCH VALIDASI DATA (Panen, Tanam, Dokumen ISPO)
  const fetchValidasiData = async () => {
    if (userRole === "general_manager_distrik" && !selectedKebunId) {
      setPendingPanen([]);
      setPendingTanam([]);
      setPendingDokumen([]);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const queryParam = selectedKebunId
        ? `?target_kebun_auth_id=${selectedKebunId}`
        : "";

      const urlPanen = `${API_ENDPOINTS.FARM.KEBUN.APPROVAL.GET_RENCANA_PANEN_PENDING}${queryParam}`;
      const urlTanam = `${API_ENDPOINTS.FARM.KEBUN.APPROVAL.GET_PENDING_BLOK}${queryParam}`;
      const urlDokumen = `${API_ENDPOINTS.ISPO.KEBUN.GET_PETANI_PENDING_SUBMISSION_ISPO}${queryParam}`;

      const [resPanen, resTanam, resDokumen] = await Promise.all([
        fetch(urlPanen, { headers }),
        fetch(urlTanam, { headers }),
        fetch(urlDokumen, { headers }),
      ]);

      const dataPanen = resPanen.ok ? await resPanen.json() : [];
      const dataTanam = resTanam.ok ? await resTanam.json() : [];
      const dataDokumen = resDokumen.ok ? await resDokumen.json() : [];

      setPendingPanen(Array.isArray(dataPanen) ? dataPanen : []);
      setPendingTanam(Array.isArray(dataTanam) ? dataTanam : []);
      setPendingDokumen(Array.isArray(dataDokumen) ? dataDokumen : []);
    } catch (error) {
      console.error("Error fetching validasi data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. FETCH MANAJEMEN PETANI
  const fetchPetaniMembers = async () => {
    if (userRole === "general_manager_distrik" && !selectedKebunId) {
      setPetaniMembers([]);
      return;
    }

    setLoadingManajemen(true);
    // KOSONGKAN DATA LAMA SEBELUM FETCH BARU AGAR ADA EFEK LOADING
    setPetaniMembers([]);

    try {
      const token = localStorage.getItem("token");

      // Pastikan penggabungan URL aman dari error tanda tanya ganda
      let url = API_ENDPOINTS.USER.KEBUN.PETANI_MEMBERS;
      if (selectedKebunId) {
        url += url.includes("?")
          ? `&target_kebun_auth_id=${selectedKebunId}`
          : `?target_kebun_auth_id=${selectedKebunId}`;
      }

      // --- BUKTI UNTUK BACKEND ---
      console.log(`[BUKTI FE] Menembak API Petani Members -> ${url}`);

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.warn(`[BUKTI FE] Gagal dari BE. Status: ${res.status}`);
        throw new Error("Gagal mengambil data anggota petani");
      }

      const data = await res.json();

      // --- BUKTI UNTUK BACKEND ---
      console.log(
        `[BUKTI FE] Data Mandor dari BE untuk Kebun ID ${selectedKebunId}:`,
        data,
      );

      setPetaniMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching petani members:", error);
      setPetaniMembers([]);
    } finally {
      setLoadingManajemen(false);
    }
  };

  // Efek inisialisasi Role GM
  useEffect(() => {
    if (userRole === "general_manager_distrik") {
      fetchKebunList();
    }
  }, [userRole]);

  // Efek pemuatan data saat tab atau kebun terpilih berubah
  useEffect(() => {
    if (activeTab === "validasi") {
      fetchValidasiData();
    } else if (activeTab === "manajemen") {
      fetchPetaniMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedKebunId, userRole]);

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans relative">
      {/* 1. HEADER & DROPDOWN PILIH KEBUN */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
        {/* Judul Kiri */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl shrink-0">
            <ShieldCheck className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Pengajuan Kemitraan
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Pantau rencana kerja dan dokumen sertifikasi mandor.
            </p>
          </div>
        </div>

        {/* Dropdown Kanan (Sejajar dengan Judul di Desktop khusus GM) */}
        {userRole === "general_manager_distrik" && (
          <div className="relative z-30 w-full lg:w-72 shrink-0">
            {/* Overlay tersembunyi untuk menutup dropdown saat klik luar */}
            {isDropdownOpen && (
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsDropdownOpen(false)}
              />
            )}

            {/* Tombol Utama */}
            <div
              onClick={() =>
                kebunList.length > 0 && setIsDropdownOpen(!isDropdownOpen)
              }
              className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl border cursor-pointer transition-all relative z-30 ${
                isDropdownOpen
                  ? "bg-[#B5302D] border-[#B5302D] text-white shadow-md"
                  : "bg-red-50 border-red-100 text-[#B5302D] hover:bg-red-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${isDropdownOpen ? "text-white" : "text-[#B5302D]"}`}
                />
                <div className="flex flex-col text-left">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${isDropdownOpen ? "text-red-200" : "text-[#B5302D]"}`}
                  >
                    Pilih Kebun:
                  </span>
                  <span
                    className={`font-bold text-xs sm:text-sm ${isDropdownOpen ? "text-white" : "text-gray-800"} line-clamp-1`}
                  >
                    {kebunList.length === 0
                      ? "Memuat data..."
                      : kebunList.find(
                          (k) => (k.auth_id || k.id) === selectedKebunId,
                        )?.nama_lengkap ||
                        kebunList.find(
                          (k) => (k.auth_id || k.id) === selectedKebunId,
                        )?.nama_kebun ||
                        "-- Silakan Pilih --"}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-white" : "text-[#B5302D]"}`}
              />
            </div>

            {/* Menu Pilihan (Dropdown Menjuntai) */}
            <div
              className={`absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden transition-all duration-200 origin-top z-30 ${
                isDropdownOpen
                  ? "opacity-100 scale-y-100"
                  : "opacity-0 scale-y-0 pointer-events-none"
              }`}
            >
              <div className="max-h-60 overflow-y-auto py-1">
                {kebunList.map((kb) => {
                  const idKebun = kb.auth_id || kb.id;
                  const namaKebun =
                    kb.nama_lengkap || kb.nama_kebun || "Kebun Tanpa Nama";
                  const isSelected = idKebun === selectedKebunId;

                  return (
                    <div
                      key={idKebun}
                      onClick={() => {
                        setSelectedKebunId(idKebun);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-4 py-3 text-xs sm:text-sm cursor-pointer transition-colors flex items-center justify-between ${
                        isSelected
                          ? "bg-red-50 text-[#B5302D] font-bold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {namaKebun}
                      {isSelected && (
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#B5302D]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GARIS PEMBATAS */}
      <hr className="border-gray-200 mb-6 sm:mb-8" />

      {/* TAB SWITCHER DI BAWAH GARIS MEMANJANG */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 w-full mb-6 sm:mb-8 overflow-hidden shadow-sm">
        <button
          onClick={() => setActiveTab("validasi")}
          className={`flex-1 flex justify-center items-center gap-2 px-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "validasi"
              ? "bg-white text-[#B5302D] shadow-sm"
              : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          }`}
        >
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="whitespace-nowrap">Validasi</span>
        </button>
        <button
          onClick={() => setActiveTab("manajemen")}
          className={`flex-1 flex justify-center items-center gap-2 px-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "manajemen"
              ? "bg-white text-[#B5302D] shadow-sm"
              : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          }`}
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="whitespace-nowrap">Manajemen Mandor</span>
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {activeTab === "validasi" && (
          <>
            {/* 1. VALIDASI RENCANA PANEN */}
            <SectionCard title="Pemantauan Rencana Panen">
              <p className="text-xs text-gray-500 mb-6 -mt-4">
                Daftar pengajuan rencana panen mandor yang menunggu validasi
                dari pihak Kebun.
              </p>

              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#B5302D]" />
                  Memuat Data...
                </div>
              ) : pendingPanen.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs">
                  Tidak ada rencana panen dari mandor.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {pendingPanen.map((item) => (
                    <ValidationCard
                      key={item.id}
                      title={item.nama_unit || `Unit ${item.id}`}
                    >
                      <div className="space-y-2 text-[11px] sm:text-xs text-gray-700">
                        <DetailRow
                          label="Nama Mandor"
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

                        <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between font-bold text-[#B5302D]">
                          <span>Estimasi TBS:</span>
                          <span>{item.estimasi_total_tbs_kg} Kg</span>
                        </div>
                      </div>
                    </ValidationCard>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* 2. VALIDASI RENCANA TANAM */}
            <SectionCard title="Pemantauan Rencana Tanam">
              <p className="text-xs text-gray-500 mb-6 -mt-4">
                Daftar pengajuan rencana replanting atau tanam baru (Blok Lahan)
                yang menunggu validasi kebun.
              </p>

              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#B5302D]" />
                  Memuat Data...
                </div>
              ) : pendingTanam.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs">
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
                        <DetailRow
                          label="Tanggal Tanam"
                          value={item.tanggal_tanam_blok}
                        />
                        <DetailRow
                          label="Luas Unit (Ha)"
                          value={item.luas_unit}
                        />
                        <DetailRow
                          label="Jenis Bibit"
                          value={item.jenis_bibit}
                        />
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

                        {item.jenis_tanah === "Mineral" && (
                          <>
                            {(item.jenis_lahan === "Miring" ||
                              item.jenis_lahan === "Konservasi") && (
                              <div className="bg-yellow-50 p-2 rounded border border-yellow-100 mt-1">
                                <DetailRow
                                  label="Terasering"
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
                    </ValidationCard>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* 3. VALIDASI DOKUMEN ISPO */}
            <SectionCard title="Pemantauan Dokumen Sertifikasi ISPO">
              <p className="text-xs text-gray-500 mb-6 -mt-4">
                Tabel pengajuan dokumen sertifikasi oleh mandor yang menunggu
                validasi dari Kebun.
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
                      <th className="p-4 font-bold rounded-tr-xl">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-700 bg-white">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-8 text-center text-gray-400"
                        >
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#B5302D]" />
                  Memuat Data...
                </div>
                        </td>
                      </tr>
                    ) : pendingDokumen.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-6 text-center text-gray-400"
                        >
                          Tidak ada dokumen sertifikasi yang menunggu validasi.
                        </td>
                      </tr>
                    ) : (
                      pendingDokumen.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                        >
                          <td className="p-4 font-bold text-center">
                            {index + 1}
                          </td>
                          <td className="p-4 font-bold text-[#B5302D]">
                            {item.nama_petani || "Tidak Diketahui"}
                          </td>
                          <td className="p-4 font-medium">
                            {item.jenis_dokumen || item.requirement_code}
                          </td>
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
                          <td className="p-4 italic text-gray-400">
                            <span className="bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-1 rounded-md text-[10px] font-bold not-italic">
                              {item.status || "PENDING"}
                            </span>
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

        {/* TAB MANAJEMEN PETANI */}
        {activeTab === "manajemen" && (
          <SectionCard title="Manajemen Mandor">
            <p className="text-xs text-gray-500 mb-6 -mt-4">
              Daftar mandor naungan beserta profil detail dan progres ISPO
              mereka.
            </p>

            {loadingManajemen ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#B5302D]" />
                  Memuat Data...
                </div>
            ) : petaniMembers.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                Belum ada mandor yang bergabung di kebun ini.
              </div>
            ) : (
              <div className="space-y-6">
                {petaniMembers.map((petani) => (
                  <PetaniProfileCard
                    key={petani.id}
                    data={petani}
                    selectedKebunId={selectedKebunId}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        )}
      </div>
    </div>
  );
};

/* ===================== COMPONENT HELPERS ===================== */

const SectionCard = ({ title, children }) => {
  return (
    <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden group hover:shadow-md transition-all">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />
      <h3 className="text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">
        {title}
      </h3>
      {children}
    </div>
  );
};

const ValidationCard = ({ title, kebunName, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`rounded-xl border border-gray-200 overflow-hidden relative shadow-sm hover:shadow-md transition-all bg-gray-50/50`}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#EF8523] text-white px-4 py-3 flex justify-between items-center cursor-pointer select-none hover:bg-[#d6731b] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-xs sm:text-sm">{title}</span>
          {kebunName && (
            <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">
              {kebunName}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="p-5 bg-white animate-in slide-in-from-top-2">
          {children}
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

// Komponen PetaniProfileCard (Adaptasi GM Distrik)
const PetaniProfileCard = ({ data, selectedKebunId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ispoProgress, setIspoProgress] = useState(null);
  const [loadingIspo, setLoadingIspo] = useState(false);

  const fotoProfilUrl = data.foto_profil_url
    ? getFileUrl(data.foto_profil_url, "USER")
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nama_lengkap)}&background=random`;

  useEffect(() => {
    if (isOpen && !ispoProgress) {
      const fetchProgressIspo = async () => {
        setLoadingIspo(true);
        try {
          const token = localStorage.getItem("token");
          const queryParam = selectedKebunId
            ? `?target_kebun_auth_id=${selectedKebunId}`
            : "";
          const url = `${API_ENDPOINTS.ISPO.KEBUN.GET_PROGRES_ISPO_PETANI_NAUNGAN.replace("{petani_id}", data.id)}${queryParam}`;

          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const result = await res.json();
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
  }, [isOpen, data.id, ispoProgress, selectedKebunId]);

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
                  const score = ispoProgress ? ispoProgress[prinsip] || 0 : 0;
                  const displayScore = Math.round(score);

                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1.5 group relative"
                    >
                      <span className="absolute -top-6 bg-gray-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                        Prinsip {idx + 1}: {displayScore}%
                      </span>

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
                              <stop offset="0%" stopColor="#FF7875" />
                              <stop offset="100%" stopColor="#B5302D" />
                            </linearGradient>
                          </defs>

                          <path
                            className="text-gray-100"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />

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

                        <div className="relative z-10 flex flex-col items-center">
                          <span className="text-[10px] font-bold text-[#B5302D] leading-none">
                            {displayScore}%
                          </span>
                        </div>
                      </div>

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

export default KemitraanPetani;
