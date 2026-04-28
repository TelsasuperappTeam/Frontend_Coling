import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  Upload,
  CheckCircle,
  X,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";
// Sesuaikan import config dengan konstanta Anda
import {
  API_ENDPOINTS,
  API_BASE_URLS,
  getFileUrl,
} from "../../../config/constants.js";

const DOKUMEN_CONFIG = [
  {
    id: 1,
    label: "Berita acara pembentukan kelompok tani",
    code: "P2_2_1_BERITA_ACARA",
  },
  {
    id: 2,
    label: "Surat Bukti Keanggotaan Kelompok Tani/Koperasi",
    code: "P2_2_1_ANGGOTA",
  },
  { id: 3, label: "Akta Pendirian dan AD/ART", code: "P2_2_1_ADART" },
];

const Operasional2 = () => {
  const navigate = useNavigate();

  // -- STATE IDENTITAS & ROLE --
  const [userRole, setUserRole] = useState(null);
  const [daftarKebun, setDaftarKebun] = useState([]);
  const [selectedKebunId, setSelectedKebunId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // -- STATE DATA PER KEBUN (Object Key: kebun_id) --
  const [dataOrganisasi, setDataOrganisasi] = useState({});
  const [loadingKebun, setLoadingKebun] = useState({});
  const [dataPengurus, setDataPengurus] = useState({});
  const [loadingPengurus, setLoadingPengurus] = useState({});

  // 1. Ambil Role dari Token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.role);
      } catch {
        console.error("Invalid token");
      }
    }
  }, []);

  const isGM = userRole === "general_manager_distrik";

  // 1. Bungkus fetchDataOrganisasi dengan useCallback agar referensinya stabil
  // Letakkan fungsi ini DI ATAS fetchDaftarKebun
  const fetchDataOrganisasi = useCallback(
    async (kebunAuthId) => {
      if (!kebunAuthId) return;
      setLoadingKebun((prev) => ({ ...prev, [kebunAuthId]: true }));
      try {
        const token = localStorage.getItem("token");
        // Logika BE: Jika GM, kirim target_kebun_auth_id untuk melihat data kebun tertentu
        const queryParam = isGM ? `?target_kebun_auth_id=${kebunAuthId}` : "";

        // Fetch dokumen satu per satu ke endpoint ISPO menggunakan DOKUMEN_CONFIG
        const fetchPromises = DOKUMEN_CONFIG.map(async (docConfig) => {
          try {
            // Gunakan endpoint ISPO submission + query param untuk GM
            const url = `${API_ENDPOINTS.ISPO.KEBUN.SUBMISSION}/${docConfig.code}${queryParam}`;

            const response = await fetch(url, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const dataServer = await response.json();
              return {
                tipe_dokumen: docConfig.code, // Agar cocok dengan UI (d.tipe_dokumen === conf.code)
                file_url: dataServer.file_url,
                status: dataServer.status,
              };
            }
            // Jika 404 (belum diupload) atau error lainnya, anggap null
            return null;
          } catch (err) {
            console.error(`Gagal fetch dokumen ${docConfig.code}:`, err);
            return null;
          }
        });

        const results = await Promise.all(fetchPromises);

        // Buang yang null (yang belum di-upload / error)
        const validDocs = results.filter((doc) => doc !== null);

        // Simpan data dokumen yang valid ke state sesuai kebunAuthId
        setDataOrganisasi((prev) => ({ ...prev, [kebunAuthId]: validDocs }));
      } catch (error) {
        console.error("Fetch organisasi error:", error);
      } finally {
        setLoadingKebun((prev) => ({ ...prev, [kebunAuthId]: false }));
      }
    },
    [isGM],
  );

  // 2. Fungsi Fetch Data Pengurus
  const fetchDataPengurus = useCallback(
    async (kebunAuthId) => {
      if (!kebunAuthId) return;
      setLoadingPengurus((prev) => ({ ...prev, [kebunAuthId]: true }));
      try {
        const token = localStorage.getItem("token");
        const queryParam = isGM ? `?target_kebun_auth_id=${kebunAuthId}` : "";
        const url = `${API_ENDPOINTS.USER.KEBUN.PENGURUS.MAIN}${queryParam}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Pastikan data berupa array sebelum disimpan
          setDataPengurus((prev) => ({
            ...prev,
            [kebunAuthId]: Array.isArray(data) ? data : [],
          }));
        } else {
          setDataPengurus((prev) => ({ ...prev, [kebunAuthId]: [] }));
        }
      } catch (error) {
        console.error("Fetch pengurus error:", error);
        setDataPengurus((prev) => ({ ...prev, [kebunAuthId]: [] }));
      } finally {
        setLoadingPengurus((prev) => ({ ...prev, [kebunAuthId]: false }));
      }
    },
    [isGM],
  );

  // fetchDataOrganisasi ke dalam dependency array fetchDaftarKebun
  const fetchDaftarKebun = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (isGM) {
        const res = await fetch(
          `${API_BASE_URLS.USER}/users/gm/me/kebun-list`,
          { headers },
        );
        if (res.ok) {
          const data = await res.json();
          setDaftarKebun(data);

          if (data.length > 0) {
            const firstId = data[0].auth_id || data[0].id || "kebun-0";
            setSelectedKebunId(firstId);
            fetchDataOrganisasi(firstId);
          }
        }
      } else {
        const res = await fetch(`${API_BASE_URLS.USER}/users/me`, { headers });
        if (res.ok) {
          const data = await res.json();
          const validId = data.auth_id || data.id || "kebun-0";

          const single = [
            { auth_id: validId, nama_lengkap: data.nama_lengkap },
          ];
          setDaftarKebun(single);
          setSelectedKebunId(validId);
          fetchDataOrganisasi(validId);
        }
      }
    } catch (error) {
      console.error("Fetch kebun error:", error);
    }
  }, [isGM, fetchDataOrganisasi]);

  useEffect(() => {
    if (userRole) fetchDaftarKebun();
  }, [userRole, fetchDaftarKebun]);

  useEffect(() => {
    if (selectedKebunId) {
      if (!dataOrganisasi[selectedKebunId])
        fetchDataOrganisasi(selectedKebunId);
      if (!dataPengurus[selectedKebunId]) fetchDataPengurus(selectedKebunId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKebunId]);

  return (
    // Tambahkan class 'relative' pada div terluar ini
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <ShoppingCart className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Manajemen Operasional
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Kelola penjualan barang dan peminjaman inventaris.
            </p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto overflow-hidden">
          <button
            onClick={() => navigate("../manajemenoperasional")}
            className="flex-1 flex justify-center items-center gap-1 sm:gap-2 px-1 sm:px-6 py-2.5 rounded-lg text-[8px] sm:text-xs font-bold transition-all text-gray-500 hover:bg-gray-200"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="whitespace-nowrap">Penjualan/Peminjaman</span>
          </button>
          <button className="flex-1 flex justify-center items-center gap-1 sm:gap-2 px-1 sm:px-6 py-2.5 rounded-lg text-[8px] sm:text-xs font-bold transition-all bg-white text-[#B5302D] shadow-sm">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="whitespace-nowrap">Organisasi</span>
          </button>
        </div>
      </div>

      {/* --- UI DROPDOWN PILIH KEBUN (Memanjang Penuh) --- */}
      {isGM && (
        <div className="mb-8 relative z-30">
          {/* Overlay tersembunyi untuk menutup dropdown saat klik luar */}
          {isDropdownOpen && (
            <div
              className="fixed inset-0 z-20"
              onClick={() => setIsDropdownOpen(false)}
            />
          )}

          {/* Tombol Utama (Bentuk Bar Memanjang) */}
          <div
            onClick={() =>
              daftarKebun.length > 0 && setIsDropdownOpen(!isDropdownOpen)
            }
            className={`flex items-center justify-between w-full px-5 py-3 rounded-xl border cursor-pointer transition-all relative z-30 ${
              isDropdownOpen
                ? "bg-[#B5302D] border-[#B5302D] text-white shadow-md"
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
                  {daftarKebun.length === 0
                    ? "Memuat data..."
                    : daftarKebun.find(
                        (k) => (k.auth_id || k.id) === selectedKebunId,
                      )?.nama_lengkap ||
                      daftarKebun.find(
                        (k) => (k.auth_id || k.id) === selectedKebunId,
                      )?.nama_kebun ||
                      "-- Silakan Pilih --"}
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-white" : "text-[#B5302D]"}`}
            />
          </div>

          {/* Menu Pilihan (Dropdown Menjuntai Lebar Penuh) */}
          <div
            className={`absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden transition-all duration-200 origin-top z-30 ${
              isDropdownOpen
                ? "opacity-100 scale-y-100"
                : "opacity-0 scale-y-0 pointer-events-none"
            }`}
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {daftarKebun.map((kb) => {
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
                    className={`px-5 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${
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

      {/* --- KONTEN ORGANISASI (Hanya muncul jika kebun sudah dipilih) --- */}
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 z-10 relative">
        {(() => {
          if (!selectedKebunId) return null;

          const safeId = selectedKebunId;

          // Data Dokumen
          const docs = dataOrganisasi[safeId] || [];
          const loading = loadingKebun[safeId];

          // Data Pengurus
          const pengurusList = dataPengurus[safeId] || [];
          const isLoadingPeng = loadingPengurus[safeId];

          return (
            <div className="grid grid-cols-1 gap-8 bg-transparent">
              {/* --- CARD DAFTAR ANGGOTA PENGURUS (BARU) --- */}
              <SectionCard title="Daftar Anggota Pengurus">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-xs text-gray-500">
                    Struktur organisasi kelompok tani.
                  </p>
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#EF8523] text-white text-[11px] uppercase tracking-wider">
                        <th className="p-4 font-bold rounded-tl-xl">No</th>
                        <th className="p-4 font-bold">Nama Anggota</th>
                        <th className="p-4 font-bold">Jabatan</th>
                        <th className="p-4 font-bold">No. HP</th>
                        <th className="p-4 font-bold rounded-tr-xl">
                          Tugas & Tanggung Jawab
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-gray-700 bg-white">
                      {isLoadingPeng ? (
                        <tr>
                          <td colSpan="5" className="p-4 text-center">
                            Memuat data...
                          </td>
                        </tr>
                      ) : pengurusList.length > 0 ? (
                        pengurusList.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                          >
                            <td className="p-4 font-bold text-center">
                              {index + 1}
                            </td>
                            <td className="p-4 font-bold">
                              {item.nama_anggota}
                            </td>
                            <td className="p-4 font-medium text-[#B5302D]">
                              {item.jabatan_pengurus}
                            </td>
                            <td className="p-4 text-gray-500">
                              {item.no_hp || "-"}
                            </td>
                            <td className="p-4 text-gray-500">
                              {item.tugas_pengurus || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-4 text-center">
                            Belum ada data pengurus.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              {/* SEKSI 2: DOKUMEN */}
              <SectionCard title="Kelengkapan Dokumen Organisasi Kebun">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs text-gray-400">
                    Daftar kelengkapan dokumen ISPO organisasi.
                  </p>
                  {!isGM && (
                    <button className="text-[10px] bg-[#B5302D] text-white px-3 py-1 rounded-full font-bold shadow-md shadow-red-100 hover:bg-[#a02927] transition-all">
                      + Upload Baru
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-center py-4 text-xs">
                      Memuat dokumen...
                    </p>
                  ) : (
                    DOKUMEN_CONFIG.map((conf) => {
                      const fileExist = docs.find(
                        (d) => d.tipe_dokumen === conf.code,
                      );
                      return (
                        <div
                          key={conf.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <FileText
                              className={`w-5 h-5 ${fileExist ? "text-green-500" : "text-gray-300"}`}
                            />
                            <span className="text-xs font-medium text-gray-600">
                              {conf.label}
                            </span>
                          </div>
                          {fileExist ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <button
                                onClick={() =>
                                  window.open(
                                    getFileUrl(fileExist.file_url, "ISPO"),
                                    "_blank",
                                  )
                                }
                                className="text-[#B5302D] hover:underline text-[10px] font-bold"
                              >
                                Lihat
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">
                              Belum diunggah
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </SectionCard>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// HELPER COMPONENT (Tetap butuh di sini)
const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden group hover:shadow-md transition-all">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />
    <h3 className="text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

export default Operasional2;
