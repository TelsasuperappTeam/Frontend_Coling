import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Users,
  ChevronDown,
  FileText,
  ExternalLink,
} from "lucide-react";
import { API_ENDPOINTS, getFileUrl } from "../../config/constants.js";

const KemitraanPetani = () => {
  // ================= STATE =================
  const [activeTab, setActiveTab] = useState("validasi");

  const [pendingPanen, setPendingPanen] = useState([]);
  const [pendingTanam, setPendingTanam] = useState([]);
  const [pendingIspo, setPendingIspo] = useState([]);
  const [loading, setLoading] = useState(false);

  const [petaniMembers, setPetaniMembers] = useState([]);
  const [loadingManajemen, setLoadingManajemen] = useState(false);

  // WAJIB UNTUK GM
  const [selectedKebunId, setSelectedKebunId] = useState(null);

  // ================= GET ROLE =================
  const getUserRole = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role;
    } catch {
      return null;
    }
  };

  const role = getUserRole();

  // ================= FETCH KEBUN GM =================
  const fetchKebunList = useCallback(async () => {
    if (role !== "general_manager_distrik") return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(API_ENDPOINTS.USER.GMDistrik.GET_KEBUN_LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Gagal ambil kebun GM");
      }

      const data = await res.json();

      if (data.length > 0) {
        setSelectedKebunId(data[0].auth_id);
      }
    } catch (error) {
      console.error("Error fetch kebun GM:", error);
    }
  }, [role]);

  // ================= FETCH VALIDASI (KHUSUS EM) =================
  const fetchValidasiData = useCallback(async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Tembak 3 API sekaligus secara paralel (Tanpa query param karena EM sudah terikat 1 kebun di BE)
      const [resPanen, resTanam, resIspo] = await Promise.all([
        fetch(API_ENDPOINTS.FARM.KEBUN.APPROVAL.GET_RENCANA_PANEN_PENDING, {
          headers,
        }),
        fetch(API_ENDPOINTS.FARM.KEBUN.APPROVAL.GET_PENDING_BLOK, { headers }),
        fetch(API_ENDPOINTS.ISPO.KEBUN.GET_PETANI_PENDING_SUBMISSION_ISPO, {
          headers,
        }),
      ]);

      const dataPanen = resPanen.ok ? await resPanen.json() : [];
      const dataTanam = resTanam.ok ? await resTanam.json() : [];
      const dataIspo = resIspo.ok ? await resIspo.json() : [];

      setPendingPanen(Array.isArray(dataPanen) ? dataPanen : []);
      setPendingTanam(Array.isArray(dataTanam) ? dataTanam : []);

      // Simpan data ISPO
      setPendingIspo(Array.isArray(dataIspo) ? dataIspo : []);
    } catch (error) {
      console.error("Gagal mengambil data validasi:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ================= FETCH PETANI =================
  const fetchPetaniMembers = async () => {
    setLoadingManajemen(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(API_ENDPOINTS.USER.KEBUN.PETANI_MEMBERS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil data anggota mandor");
      }

      const data = await res.json();
      setPetaniMembers(data);
    } catch (error) {
      console.error("Error fetching mandor members:", error);
    } finally {
      setLoadingManajemen(false);
    }
  };

  // ================= USE EFFECT =================

  // ambil kebun kalau GM
  useEffect(() => {
    fetchKebunList();
  }, [fetchKebunList]);

  // trigger data
  useEffect(() => {
    if (activeTab === "validasi") {
      fetchValidasiData();
    } else if (activeTab === "manajemen") {
      fetchPetaniMembers();
    }
  }, [activeTab, selectedKebunId, fetchValidasiData]);

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans relative">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            {activeTab === "validasi" ? (
              <ShieldCheck className="w-8 h-8 text-[#B5302D]" />
            ) : (
              <Users className="w-8 h-8 text-[#B5302D]" />
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Kemitraan Relasi
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              {activeTab === "validasi"
                ? "Daftar rencana kerja dan dokumen sertifikasi mandor."
                : "Kelola data profil dan progres ISPO anggota mandor."}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto overflow-hidden">
          <button
            onClick={() => setActiveTab("validasi")}
            className={`flex-1 flex justify-center items-center gap-1 sm:gap-2 px-1 sm:px-6 py-2.5 rounded-lg text-[9px] sm:text-xs font-bold transition-all ${
              activeTab === "validasi"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500 hover:bg-gray-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Pengajuan (Read Only)</span>
          </button>
          <button
            onClick={() => setActiveTab("manajemen")}
            className={`flex-1 flex justify-center items-center gap-1 sm:gap-2 px-1 sm:px-6 py-2.5 rounded-lg text-[9px] sm:text-xs font-bold transition-all ${
              activeTab === "manajemen"
                ? "bg-white text-[#B5302D] shadow-sm"
                : "text-gray-500 hover:bg-gray-200"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Manajemen Mandor</span>
          </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {activeTab === "validasi" && (
          <>
            {/* RENCANA TANAM */}
            <SectionCard title="Daftar Rencana Tanam Mandor">
              <p className="text-xs text-gray-500 mb-6 -mt-4">
                Daftar pengajuan rencana replanting atau tanam baru (Blok
                Lahan).
              </p>

              {loading ? (
                <div className="text-center py-10 text-gray-400 text-xs">
                  Memuat data...
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
                      title={item.nama_blok || `Unit ${item.id}`}
                      kebunName={item.nama_petani || "Mandor Relasi"}
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
                        <DetailRow
                          label="Varietas"
                          value={item.varietas_bibit_nama || "-"}
                        />

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
                              label="Nama Lahan"
                              value={item.nama_lahan_gambut || "-"}
                            />
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

            {/* RENCANA PANEN */}
            <SectionCard title="Daftar Rencana Panen Mandor">
              <p className="text-xs text-gray-500 mb-6 -mt-4">
                Daftar pengajuan rencana panen mandor kebun.
              </p>

              {loading ? (
                <div className="text-center py-10 text-gray-400 text-xs">
                  Memuat data...
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
                      kebunName={item.nama_petani || "Mandor Relasi"}
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
                        <DetailRow
                          label="Varietas (jika tenera)"
                          value={item.nama_varietas || "-"}
                        />
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

{/* VALIDASI DOKUMEN ISPO (STYLE TABEL KEBUN) */}
            <SectionCard title="Daftar Validasi Dokumen ISPO Mandor">
              <p className="text-xs text-gray-500 mb-6 -mt-4">
                Tabel pengajuan dokumen sertifikasi oleh petani yang harus dicek kebun (Role Anda: Read Only).
              </p>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EF8523] text-white text-[11px] uppercase tracking-wider">
                      <th className="p-4 font-bold rounded-tl-xl text-center">No</th>
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
                          <div className="text-center py-10 text-gray-400 text-xs">
                            Memuat data validasi ISPO petani...
                          </div>
                        </td>
                      </tr>
                    ) : pendingIspo.length === 0 ? (
                      /* 2. JIKA TIDAK LOADING & DATA KOSONG */
                      <tr>
                        <td
                          colSpan="7"
                          className="p-6 text-center text-gray-400"
                        >
                          Tidak ada dokumen sertifikasi yang menunggu validasi.
                        </td>
                      </tr>
                    ) : (
                      /* 3. JIKA TIDAK LOADING & DATA ADA */
                      pendingIspo.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                        >
                          <td className="p-4 font-bold text-center">
                            {index + 1}
                          </td>

                          {/* MENGGUNAKAN NAMA PETANI */}
                          <td className="p-4 font-bold text-[#B5302D]">
                            {item.nama_petani || item.nama || "Tidak Diketahui"}
                          </td>

                          {/* MENGGUNAKAN JENIS DOKUMEN */}
                          <td className="p-4 font-medium">
                            {item.jenis_dokumen || item.requirement_code || "-"}
                          </td>

                          {/* MENGGUNAKAN PRINSIP ISPO */}
                          <td className="p-4 text-gray-500 font-semibold">
                            {item.prinsip_ispo || "-"}
                          </td>

                          {/* LINK FILE */}
                          <td className="p-4">
                            {item.file_url ? (
                              <a
                                href={getFileUrl(item.file_url, "ISPO")}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:underline font-bold"
                              >
                                <FileText className="w-3 h-3" /> Buka File
                              </a>
                            ) : (
                              <span className="text-gray-400 italic">Tidak ada file</span>
                            )}
                          </td>

                          {/* STATUS */}
                          <td className="p-4 italic text-gray-400">
                            <span className="bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-1 rounded-md text-[10px] font-bold not-italic">
                              {item.status || "PENDING"}
                            </span>
                          </td>

                          {/* AKSI READ ONLY (EM/GM) */}
                          <td className="p-4 text-center">
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 uppercase tracking-wider">
                              Read Only
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

        {/* TAB MANAJEMEN */}
        {activeTab === "manajemen" && (
          <SectionCard title="Manajemen Mandor">
            <p className="text-xs text-gray-500 mb-6 -mt-4">
              Daftar profil detail mandor mitra.
            </p>

            {loadingManajemen ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                Memuat data mandor...
              </div>
            ) : petaniMembers.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                Belum ada mandor yang bergabung.
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

// ===================== KOMPONEN PETANI PROFILE CARD (BARU) =====================
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
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm">{data.nama_lengkap}</span>
          <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">
            {data.nama_kebun_naungan || "Kebun Relasi"}
          </span>
        </div>

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
