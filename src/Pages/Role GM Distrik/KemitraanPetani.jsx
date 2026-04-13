import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ChevronDown,
  FileText,
  ExternalLink,
  MapPin,
} from "lucide-react";
// Pastikan getFileUrl di-export dari constants.js
import { API_ENDPOINTS, getFileUrl } from "../../config/constants.js";

/* ===================== MOCK DATA (STATIC) ===================== */
const MOCK_DOKUMEN_SERTIFIKASI = [
  {
    id: 1,
    nama: "Pak Budi Santoso",
    kebun: "Kebun Dhimas",
    jenisDok: "Surat Hak Milik (SHM)",
    prinsip: "Prinsip 1 (Legalitas)",
    file: "shm_budi.pdf",
    catatan: "-",
    status: "pending",
  },
  {
    id: 2,
    nama: "Pak Joko Widodo",
    kebun: "Kebun Makmur Sejahtera",
    jenisDok: "Bukti Pembelian Bibit",
    prinsip: "Prinsip 4 (Good Agriculture)",
    file: "nota_bibit.pdf",
    catatan: "Foto kurang jelas",
    status: "pending",
  },
];

const KemitraanPetani = () => {
  // State data dinamis untuk Validasi
  const [pendingPanen, setPendingPanen] = useState([]);
  const [pendingTanam, setPendingTanam] = useState([]);
  const [loading, setLoading] = useState(false);

  // State Role & Target Kebun
  const [userRole] = useState(localStorage.getItem("role") || "");
  const [selectedKebunId, setSelectedKebunId] = useState("");
  const [kebunList, setKebunList] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

      // Buat variabel sementara untuk menampung array
      let listData = [];

      // Simpan data ke state
      if (Array.isArray(data)) {
        listData = data;
        setKebunList(listData);
      } else if (data && Array.isArray(data.data)) {
        listData = data.data;
        setKebunList(listData);
      }

      // OTOMATIS PILIH UNIT PERTAMA
      if (listData.length > 0) {
        // Ambil ID dari index ke-0
        const firstId = listData[0].auth_id || listData[0].id;
        setSelectedKebunId(firstId);
      }
    } catch (error) {
      console.error("Gagal mengambil daftar kebun:", error);
    }
  };

  /**
   * Mengambil data validasi (Rencana Panen & Rencana Tanam) dari API.
   * (Read-Only)
   */
  const fetchValidasiData = async () => {
    // Jika belum pilih kebun, kosongkan data dan berhenti
    if (userRole === "general_manager_distrik" && !selectedKebunId) {
      setPendingPanen([]);
      setPendingTanam([]);
      console.log("Menunggu GM memilih kebun...");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Buat query parameter jika user adalah GM
      const queryParam = selectedKebunId
        ? `?target_kebun_auth_id=${selectedKebunId}`
        : "";

      const urlPanen = `${API_ENDPOINTS.FARM.KEBUN.APPROVAL.GET_RENCANA_PANEN_PENDING}${queryParam}`;
      const urlTanam = `${API_ENDPOINTS.FARM.KEBUN.APPROVAL.GET_PENDING_BLOK}${queryParam}`;

      const [resPanen, resTanam] = await Promise.all([
        fetch(urlPanen, { headers }),
        fetch(urlTanam, { headers }),
      ]);

      const dataPanen = resPanen.ok ? await resPanen.json() : [];
      const dataTanam = resTanam.ok ? await resTanam.json() : [];

      setPendingPanen(Array.isArray(dataPanen) ? dataPanen : []);
      setPendingTanam(Array.isArray(dataTanam) ? dataTanam : []);
    } catch (error) {
      console.error("Error fetching validasi data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ambil daftar kebun jika role-nya GM
    if (userRole === "general_manager_distrik") {
      fetchKebunList();
    }
  }, [userRole]);

  useEffect(() => {
    fetchValidasiData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKebunId, userRole]);

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans relative">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-[#B5302D]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
                Pengajuan Kemitraan
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm">
                Daftar rencana kerja dan dokumen sertifikasi mandor.
              </p>
            </div>
          </div>

          {/* --- UI DROPDOWN DINAMIS SESUAI DASHBOARD --- */}
          {userRole === "general_manager_distrik" && (
            // PERUBAHAN 1: z-[999] hanya aktif saat dropdown terbuka agar tidak menimpa navbar saat scroll
            <div
              className={`relative w-full sm:w-auto ${isDropdownOpen ? "z-[999]" : ""}`}
            >
              {/* Overlay tersembunyi untuk menutup dropdown saat klik di luar */}
              {isDropdownOpen && (
                <div
                  className="fixed inset-0"
                  onClick={() => setIsDropdownOpen(false)}
                />
              )}

              {/* Tombol Utama */}
              <div
                // PERUBAHAN 2: Memperbaiki typo setKebunList menjadi kebunList
                onClick={() =>
                  kebunList.length > 0 && setIsDropdownOpen(!isDropdownOpen)
                }
                className={`flex items-center justify-between gap-4 px-4 py-2 rounded-xl border shadow-sm cursor-pointer transition-all relative min-w-[220px] ${
                  isDropdownOpen
                    ? "bg-[#B5302D] border-[#B5302D] text-white"
                    : "bg-red-50 border-red-100 text-[#B5302D] hover:bg-red-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin
                    className={`w-5 h-5 ${isDropdownOpen ? "text-white" : "text-[#B5302D]"}`}
                  />
                  <div className="flex flex-col text-left">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${isDropdownOpen ? "text-red-200" : "text-[#B5302D]"}`}
                    >
                      Pilih Kebun:
                    </span>
                    <span
                      className={`font-bold text-sm ${isDropdownOpen ? "text-white" : "text-gray-800"}`}
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
                  className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-white" : "text-[#B5302D]"}`}
                />
              </div>

              {/* Menu Pilihan (Dropdown Menjuntai) */}
              <div
                className={`absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden transition-all duration-200 origin-top ${
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
                        className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                          isSelected
                            ? "bg-red-50 text-[#B5302D] font-bold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {namaKebun}
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-[#B5302D]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
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
                  title={item.nama_blok || `Unit ${item.id}`}
                  kebunName={item.nama_kebun || "Kebun Relasi"}
                >
                  <div className="space-y-2 text-[11px] sm:text-xs text-gray-700">
                    <DetailRow label="Nama Mandor" value={item.nama_petani} />

                    <DetailRow
                      label="Siklus Panen Ke"
                      value={item.nomor_siklus || "-"}
                    />

                    <DetailRow
                      label="Tanggal Rencana"
                      value={item.tanggal_rencana_panen}
                    />
                    <DetailRow label="Usia Tanaman" value={item.usia_tanaman} />
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

        {/* RENCANA TANAM */}
        <SectionCard title="Daftar Rencana Tanam Mandor">
          <p className="text-xs text-gray-500 mb-6 -mt-4">
            Daftar pengajuan rencana replanting atau tanam baru (Blok Lahan).
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
                  title={item.nama_unit || `Blok #${item.id}`}
                  kebunName={item.nama_kebun || "Kebun Relasi"}
                >
                  <div className="space-y-2 text-[11px] sm:text-xs text-gray-700">
                    <DetailRow
                      label="Tanggal Tanam"
                      value={item.tanggal_tanam_blok}
                    />
                    <DetailRow label="Luas Unit (Ha)" value={item.luas_unit} />

                    <DetailRow label="Jenis Bibit" value={item.jenis_bibit} />
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
                      <DetailRow label="Jenis Tanah" value={item.jenis_tanah} />
                      <DetailRow label="Jenis Lahan" value={item.jenis_lahan} />
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
                          value={item.gambut_lapisan_mineral?.join(", ") || "-"}
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

        {/* DOKUMEN SERTIFIKASI */}
        <SectionCard title="Daftar Dokumen Sertifikasi Mandor">
          <p className="text-xs text-gray-500 mb-6 -mt-4">
            Tabel dokumen sertifikasi dari mandor.
          </p>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EF8523] text-white text-[11px] uppercase tracking-wider">
                  <th className="p-4 font-bold rounded-tl-xl">No</th>
                  <th className="p-4 font-bold">Nama Mandor</th>
                  <th className="p-4 font-bold border-l border-orange-400">
                    Kebun Relasi
                  </th>
                  <th className="p-4 font-bold">Jenis Dokumen</th>
                  <th className="p-4 font-bold">Prinsip ISPO</th>
                  <th className="p-4 font-bold">File Dokumen</th>
                  <th className="p-4 font-bold rounded-tr-xl">Catatan</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-700 bg-white">
                {MOCK_DOKUMEN_SERTIFIKASI.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                  >
                    <td className="p-4 font-bold text-center">{index + 1}</td>
                    <td className="p-4 font-bold">{item.nama}</td>
                    <td className="p-4 font-medium text-gray-800">
                      {item.kebun}
                    </td>
                    <td className="p-4 font-medium">{item.jenisDok}</td>
                    <td className="p-4 text-gray-500">{item.prinsip}</td>
                    <td className="p-4">
                      <button className="flex items-center gap-1 text-blue-600 hover:underline">
                        <FileText className="w-3 h-3" /> Lihat
                      </button>
                    </td>
                    <td className="p-4 italic text-gray-400">{item.catatan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
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

export default KemitraanPetani;
