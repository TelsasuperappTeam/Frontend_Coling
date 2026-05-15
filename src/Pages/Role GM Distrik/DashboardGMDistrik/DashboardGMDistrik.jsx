import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, ROLES, getFileUrl } from "../../../config/constants.js";
import DataDiriGMDistrik from "./DataDiriGMDistrik";
import {
  Loader2,
  User,
  MapPin,
  FileText,
  Truck,
  Calendar,
  Coins,
  ChevronDown,
  CheckCircle2,
  History
} from "lucide-react";

const Card = ({ title, children, rightContent, footer, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col h-[320px] overflow-hidden">
    <div className="bg-[#EF8523] px-4 py-3 sm:px-4 flex justify-between items-center flex-shrink-0">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm shadow-sm flex items-center justify-center">
            <Icon className="text-white w-4 h-4" />
          </div>
        )}
        <h3 className="font-bold text-white text-sm sm:text-base tracking-wide">
          {title}
        </h3>
      </div>
      {rightContent && <div>{rightContent}</div>}
    </div>

    <div className="p-3 sm:p-4 flex-grow flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
      {children}
    </div>

    {footer && (
      <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-100 text-sm text-gray-500 flex-shrink-0">
        {footer}
      </div>
    )}
  </div>
);

// Helper untuk mengecek kelengkapan profil
const isProfileIncomplete = (p) => {
  return (
    !p.nama_kebun ||
    !p.nomor_telepon ||
    !p.email ||
    !p.foto ||
    !p.alamat_kebun ||
    !p.koordinat
  );
};

export default function DashboardGMDistrik() {
  const navigate = useNavigate();

  // --- STATE UI & LOADING ---
  const [showPopupDataDiri, setShowPopupDataDiri] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isValidasiLoading, setIsValidasiLoading] = useState(false);
  const [daftarKebun, setDaftarKebun] = useState([]);
  const [selectedKebunId, setSelectedKebunId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- STATE DATA PROFILE ---
  const [profile, setProfile] = useState({
    nama_kebun: "",
    role: ROLES.GENERAL_MANAGER_DISTRIK,
    email: "",
    nomor_telepon: "",
    alamat_kebun: "",
    foto: "",
    koordinat: "",
    distrik_id: "",
  });

  // --- STATE CARD 1: VALIDASI DATA ---
  const [validasiData, setValidasiData] = useState({
    rencanaTanam: [],
    rencanaPanen: [],
    dokumenISPO: [], 
  });

  // --- STATE CARD 2: PENGIRIMAN TBS MINI ---
  const [pengirimanMini, setPengirimanMini] = useState([]);
  const [isLoadingPengirimanMini, setIsLoadingPengirimanMini] = useState(false);

  // --- STATE CARD 3: GRAFIK HARGA TBS ---
  const [hargaTbsData, setHargaTbsData] = useState([]);
  const [isLoadingHargaTbs, setIsLoadingHargaTbs] = useState(false);
  const [tahunTbs, setTahunTbs] = useState(new Date().getFullYear());

  // --- HELPER AUTH ---
  const getToken = () =>
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  /**
   * --- FETCH USER PROFILE GM DISTRIK ---
   */
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(API_ENDPOINTS.USER.ME, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Gagal mengambil data profil");

        const userData = await response.json();

        setProfile({
          nama_kebun: userData.nama_lengkap || "-",
          role: "General Manager Distrik",
          email: userData.email || "-",
          nomor_telepon: userData.no_hp || "-",
          alamat_kebun: userData.alamat || "",
          foto: getFileUrl(userData.foto_profil_url) || "",
          distrik_id: userData.distrik_id || "-",
          koordinat: userData.koordinat
            ? JSON.stringify(userData.koordinat)
            : "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  /**
   * --- FETCH DAFTAR KEBUN UNTUK GM DISTRIK ---
   */
  useEffect(() => {
    const fetchDaftarKebun = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(
          API_ENDPOINTS.USER.GMDistrik.GET_KEBUN_LIST,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Gagal mengambil daftar kebun");

        const data = await response.json();

        const mappedKebun = data.map((k) => ({
          id: k.auth_id || k.id,
          nama: k.nama_kebun || k.nama_lengkap || k.nama,
          kebun_ref_id: k.id || k.profile_id,
        }));

        setDaftarKebun(mappedKebun);

        // Pilih kebun pertama otomatis jika ada
        if (mappedKebun.length > 0) {
          setSelectedKebunId(mappedKebun[0].id);
        }
      } catch (error) {
        console.error("Error fetching daftar kebun:", error);
      }
    };

    fetchDaftarKebun();
  }, []);

  /**
   * --- 1. FETCH PERMINTAAN VALIDASI (TERMASUK ISPO DINAMIS) ---
   */
  const fetchValidasiRequests = useCallback(async () => {
    if (!selectedKebunId) {
      setValidasiData({
        rencanaTanam: [],
        rencanaPanen: [],
        dokumenISPO: [],
      });
      return;
    }

    setIsValidasiLoading(true);
    try {
      const token = getToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const queryParam = `?target_kebun_auth_id=${selectedKebunId}`;

      const resPanen = await fetch(
        `${API_ENDPOINTS.FARM.KEBUN.APPROVAL.GET_RENCANA_PANEN_PENDING}${queryParam}`,
        { headers },
      );
      const dataPanen = resPanen.ok ? await resPanen.json() : [];

      const resTanam = await fetch(
        `${API_ENDPOINTS.FARM.KEBUN.APPROVAL.GET_PENDING_BLOK}${queryParam}`,
        { headers },
      );
      const dataTanam = resTanam.ok ? await resTanam.json() : [];

      const resDokumen = await fetch(
        `${API_ENDPOINTS.ISPO.KEBUN.GET_PETANI_PENDING_SUBMISSION_ISPO}${queryParam}`,
        { headers },
      );
      const dataDokumen = resDokumen.ok ? await resDokumen.json() : [];

      setValidasiData({
        rencanaPanen: Array.isArray(dataPanen) ? dataPanen : [],
        rencanaTanam: Array.isArray(dataTanam) ? dataTanam : [],
        dokumenISPO: Array.isArray(dataDokumen) ? dataDokumen : [],
      });
    } catch (error) {
      console.error("Error fetching validasi data:", error);
    } finally {
      setIsValidasiLoading(false);
    }
  }, [selectedKebunId]);

  useEffect(() => {
    fetchValidasiRequests();
  }, [fetchValidasiRequests]);

  /**
   * --- 2. FETCH STATUS PENGIRIMAN TBS MINI ---
   */
  useEffect(() => {
    const fetchPengirimanMini = async () => {
      if (!selectedKebunId) return;
      setIsLoadingPengirimanMini(true);
      try {
        const token = getToken();
        const urlBase = API_ENDPOINTS.TRACEABILITY.LOGISTIK.MANAGEMENT.GET_LIST;

        const [resAktif, resHistori] = await Promise.all([
          fetch(
            `${urlBase}?is_history=false&target_kebun_auth_id=${selectedKebunId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
          fetch(
            `${urlBase}?is_history=true&target_kebun_auth_id=${selectedKebunId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
        ]);

        let dataAktif = resAktif.ok ? await resAktif.json() : [];
        let dataHistori = resHistori.ok ? await resHistori.json() : [];

        let combinedData = [...dataAktif, ...dataHistori];

        combinedData = combinedData.filter(
          (item) =>
            (item.pemeriksaan === null || item.pemeriksaan === undefined) &&
            item.status_permintaan?.toLowerCase() !== "ditolak",
        );

        combinedData.sort((a, b) => b.id - a.id);
        setPengirimanMini(combinedData.slice(0, 3));
      } catch (error) {
        console.error("Error fetching pengiriman mini:", error);
      } finally {
        setIsLoadingPengirimanMini(false);
      }
    };

    fetchPengirimanMini();
  }, [selectedKebunId]);

  /**
   * --- 3. FETCH GRAFIK HARGA TBS ---
   */
  useEffect(() => {
    const fetchGrafikHarga = async () => {
      if (!selectedKebunId) {
        setHargaTbsData([]);
        return;
      }

      const selectedKebunObj = daftarKebun.find(
        (k) => String(k.id) === String(selectedKebunId),
      );

      const targetProfileId =
        selectedKebunObj?.kebun_ref_id ||
        selectedKebunObj?.profile_id ||
        selectedKebunId;

      setIsLoadingHargaTbs(true);
      try {
        const token = getToken();
        const baseUrl =
          API_ENDPOINTS.FARM?.KEBUN?.TRANSAKSI?.GET_HARGA_TBS_GRAPH.replace(
            "{kebun_id}",
            targetProfileId,
          );

        const url = `${baseUrl}?tahun=${tahunTbs}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Gagal mengambil data grafik");

        const resData = await response.json();

        let chartData = [];
        if (resData && resData.labels && resData.data_harga) {
          chartData = resData.labels.map((namaBulan, index) => ({
            bulan: namaBulan,
            harga: Number(resData.data_harga[index]) || 0,
            dokumen: resData.meta_dokumen ? resData.meta_dokumen[index] : null,
          }));
        } else {
          chartData = Array.isArray(resData)
            ? resData
            : resData.data || resData.grafik || [];
        }
        setHargaTbsData(chartData);
      } catch (error) {
        console.error("Error fetching grafik:", error);
      } finally {
        setIsLoadingHargaTbs(false);
      }
    };

    fetchGrafikHarga();
  }, [selectedKebunId, tahunTbs, daftarKebun]);

  const handleProfileSaved = (dataSaved) => {
    if (dataSaved) {
      window.location.reload();
    }
    setShowPopupDataDiri(false);
  };

  const lockedFieldsConfig = {
    foto: !!profile.foto && profile.foto !== "",
    alamat:
      !!profile.alamat_kebun &&
      profile.alamat_kebun !== "" &&
      profile.alamat_kebun !== "-",
    koordinat:
      !!profile.koordinat &&
      profile.koordinat !== "" &&
      profile.koordinat !== "-",
  };

  const DataRow = ({ label, value }) => (
    <div className="mb-3 sm:mb-4 last:mb-0">
      <p className="text-black/70 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
        {label}
      </p>
      <p className="text-white text-[14px] sm:text-[16px] font-medium leading-snug tracking-wide break-words">
        {value && value !== "" && value !== "-" ? value : "—"}
      </p>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-10 min-h-screen font-sans bg-white">
      {/* SECTION 1: DATA DIRI */}
      <div className="bg-gradient-to-r from-[#EF8523] to-[#f19d4e] rounded-2xl p-5 sm:p-8 shadow-lg relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 sm:h-72 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex flex-row items-center justify-between mb-6 sm:mb-8 border-b border-black/10 pb-4 gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
              Data Diri Anda
            </h3>
            <button
              onClick={() => setShowPopupDataDiri(true)}
              className="bg-white/20 backdrop-blur-md text-black/80 border border-white/50 rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold hover:bg-white hover:text-[#EF8523] transition-all duration-300 whitespace-nowrap"
            >
              {isProfileIncomplete(profile)
                ? "Lengkapi Data Diri"
                : "Lihat Profil"}
            </button>
          </div>

          {isLoadingProfile ? (
            <div className="flex flex-col justify-center items-center h-32 text-white space-y-2">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-semibold">
                Memuat Data Profil...
              </span>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              <div className="flex-shrink-0 mx-auto md:mx-0 group">
                <div className="p-1 bg-white/20 rounded-2xl backdrop-blur-sm">
                  {profile.foto ? (
                    <img
                      src={profile.foto}
                      alt="Foto Profil"
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl object-cover shadow-inner bg-white"
                    />
                  ) : (
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl shadow-inner bg-white flex items-center justify-center text-gray-400">
                      <User
                        className="w-12 h-12 sm:w-16 sm:h-16"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-4 gap-y-1 sm:gap-y-2 w-full">
                <div className="space-y-1 sm:space-y-2">
                  <DataRow label="Nama Lengkap" value={profile.nama_kebun} />
                  <DataRow label="Role" value={profile.role} />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <DataRow label="Email" value={profile.email} />
                  <DataRow
                    label="Nomor Telepon"
                    value={profile.nomor_telepon}
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <DataRow label="Distrik Id" value={profile.distrik_id} />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <DataRow label="Alamat Kebun" value={profile.alamat_kebun} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 sm:mt-8 mb-6 sm:mb-10 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#B5302D] px-1 border-l-4 border-[#B5302D] pl-3">
          Tampilan Utama Fitur General Manager Distrik
        </h2>

        {/* UI DROPDOWN PILIH KEBUN */}
        <div className="relative z-30 w-full sm:w-auto min-w-[250px]">
          {isDropdownOpen && (
            <div
              className="fixed inset-0 z-20"
              onClick={() => setIsDropdownOpen(false)}
            />
          )}

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
                  Pilih Kebun Relasi:
                </span>
                <span
                  className={`font-bold text-sm ${isDropdownOpen ? "text-white" : "text-gray-800"}`}
                >
                  {daftarKebun.length === 0
                    ? "Memuat data..."
                    : daftarKebun.find((k) => k.id === selectedKebunId)?.nama ||
                      "-- Silakan Pilih --"}
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-white" : "text-[#B5302D]"}`}
            />
          </div>

          <div
            className={`absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden transition-all duration-200 origin-top z-30 ${
              isDropdownOpen
                ? "opacity-100 scale-y-100"
                : "opacity-0 scale-y-0 pointer-events-none"
            }`}
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {daftarKebun.map((kb) => {
                const isSelected = kb.id === selectedKebunId;
                return (
                  <div
                    key={kb.id}
                    onClick={() => {
                      setSelectedKebunId(kb.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-5 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-red-50 text-[#B5302D] font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {kb.nama}
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#B5302D]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          SECTION 2: WIDGETS
         ========================================= */}
      {!selectedKebunId ? (
        <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-10 flex flex-col items-center justify-center text-center">
          <MapPin className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-600 mb-1">
            Silakan Pilih Kebun Terlebih Dahulu
          </h3>
          <p className="text-sm text-gray-400">
            Gunakan dropdown di atas untuk memilih kebun dan melihat data
            dashboard terkait.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* CARD 1: PERMINTAAN VALIDASI */}
          <Card
            title="Permintaan Validasi Operasional Perkebunan"
            icon={FileText}
            footer={
              <button
                onClick={() =>
                  navigate("/general_manager_distrik/kemitraanpetani")
                }
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#EF8523] border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm"
              >
                Lihat Detail Validasi &rarr;
              </button>
            }
          >
            {isValidasiLoading ? (
                <div className="h-32 flex items-center justify-center text-gray-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Memuat data...
                </div>
            ) : (
              <div className="space-y-4">
                {Object.entries({
                  "Rencana Tanam": validasiData.rencanaTanam,
                  "Rencana Panen": validasiData.rencanaPanen,
                  "Dokumen ISPO": validasiData.dokumenISPO,
                }).map(([title, items], idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50/80 rounded-xl p-4 border border-gray-100"
                  >
                    <h4 className="text-[#B5302D] text-[11px] uppercase font-bold tracking-wider mb-3 border-b border-gray-200 pb-1">
                      Validasi {title}
                    </h4>
                    {items.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">
                        Tidak ada data pending.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {items.map((item, i) => (
                          <li
                            key={item.id || i}
                            className="flex items-center justify-between text-xs group cursor-pointer"
                          >
                            <span className="font-medium text-gray-700 group-hover:text-black transition-colors flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full group-hover:bg-[#EF8523]"></span>
                              {title === "Dokumen ISPO" ? (
                                <span>
                                  {item.nama_petani || item.nama || "Petani"}
                                  <span className="text-[10px] text-gray-400 ml-1 font-normal truncate max-w-[120px] inline-block align-bottom">
                                    -{" "}
                                    {item.jenis_dokumen ||
                                      item.requirement_code ||
                                      "Dokumen Sertifikasi"}
                                  </span>
                                </span>
                              ) : (
                                <span>
                                  {item.nama_petani}
                                  <span className="text-[10px] text-gray-400 ml-1 font-normal">
                                    -{" "}
                                    {title === "Rencana Tanam"
                                      ? item.nama_unit || `Blok #${item.id}`
                                      : item.nama_blok || `Unit ${item.id}`}
                                  </span>
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                              Pending
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* CARD 2: PENGIRIMAN TBS RELASI */}
          <Card
            title="Status Pengiriman TBS"
            icon={Truck}
            footer={
              <button
                onClick={() =>
                  navigate("/general_manager_distrik/distribusilogistik")
                }
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#EF8523] border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm"
              >
                Lihat Semua &rarr;
              </button>
            }
          >
            <div className="space-y-4">
              {isLoadingPengirimanMini ? (
                <div className="h-32 flex items-center justify-center text-gray-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Memuat data...
                </div>
              ) : pengirimanMini.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-xs">
                    Belum ada armada yang sedang berjalan.
                  </p>
                </div>
              ) : (
                pengirimanMini.map((item) => {
                  const statusPermintaan = (
                    item.status_permintaan || "menunggu"
                  ).toLowerCase();
                  const rawProgress = item.progress_db || "menunggu_pengiriman";
                  const pDB = rawProgress.toLowerCase().replace(/\s+/g, "_");

                  let badgeClass =
                    "bg-yellow-50 text-yellow-700 border-yellow-100";
                  let label = "Menunggu Konfirmasi";
                  let IconStatus = History;

                  if (statusPermintaan === "diterima") {
                    if (pDB === "terima") {
                      badgeClass =
                        "bg-green-50 text-green-700 border-green-100";
                      label = "Tiba di Pabrik";
                      IconStatus = CheckCircle2;
                    } else {
                      badgeClass = "bg-blue-50 text-blue-700 border-blue-100";
                      label = item.progress_publik || "Dalam Perjalanan";
                      IconStatus = Truck;
                    }
                  }

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-[16px] border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EF8523] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                            Tujuan Pabrik
                          </p>
                          <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-1 pr-2">
                            {item.alamat_pengiriman_pabrik || "Pabrik Tujuan"}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[9px] font-bold border flex items-center gap-1 shrink-0 ${badgeClass}`}
                        >
                          <IconStatus className="w-3 h-3" />
                          {label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">
                            No. Resi
                          </p>
                          <p className="text-[11px] font-mono font-bold text-gray-700 mt-0.5">
                            {item.kode_resi || `REQ-${item.id}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">
                            Est. Tiba
                          </p>
                          <p className="text-[11px] font-bold text-[#EF8523] flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-orange-400" />
                            {item.tanggal_permintaan_sampai || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* CARD 3: Harga TBS */}
          <Card
            title="Harga TBS Sesuai Aturan Pemerintah"
            icon={Coins}
            footer={
              <button
                onClick={() =>
                  navigate("/general_manager_distrik/manajemenoperasional")
                }
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#EF8523] border border-gray-200 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm"
              >
                Lihat Informasi Harga Terbaru &rarr;
              </button>
            }
          >
            <div className="relative h-full flex flex-col pt-2 w-full">
              {/* Badge Tahun & Indikator Scroll */}
              <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-gray-400 bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1 animate-pulse">
                    <span className="text-xs">↔</span> Geser grafik
                  </span>
                </div>

                {/* Dropdown Filter Tahun Dinamis */}
                <select
                  value={tahunTbs}
                  onChange={(e) => setTahunTbs(parseInt(e.target.value))}
                  className="bg-orange-50 border border-orange-200 text-[#EF8523] px-2 py-1 rounded-lg text-[10px] font-black shadow-sm outline-none cursor-pointer focus:ring-1 focus:ring-[#EF8523]"
                >
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year} className="font-bold">
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* State Handling: Loading, Empty, atau Tampilkan SVG */}
              {isLoadingHargaTbs ? (
                <div className="flex-1 min-h-[180px] flex items-center justify-center text-gray-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Memuat data...
                </div>
              ) : hargaTbsData.length === 0 ? (
                <div className="flex-1 min-h-[180px] flex items-center justify-center text-gray-400 text-xs font-medium">
                  Belum ada riwayat harga TBS untuk tahun ini.
                </div>
              ) : (
                (() => {
                  const dataBE = hargaTbsData;
                  const hargaTertinggi = Math.max(
                    ...dataBE.map((d) => Number(d.harga) || 0),
                  );
                  const maxHarga = Math.max(4000, hargaTertinggi + 500);
                  const svgHeight = 140;

                  const yLabels = [
                    `${(maxHarga / 1000).toFixed(1)}k`,
                    `${((maxHarga * 0.75) / 1000).toFixed(1)}k`,
                    `${((maxHarga * 0.5) / 1000).toFixed(1)}k`,
                    `${((maxHarga * 0.25) / 1000).toFixed(1)}k`,
                    "0",
                  ];

                  const minWidthPerPoint = 70;
                  const calculatedWidth = Math.max(
                    dataBE.length * minWidthPerPoint,
                    500,
                  );
                  const svgWidth = calculatedWidth;
                  const paddingX = 40;
                  const effectiveWidth = svgWidth - paddingX * 2;

                  const points = dataBE.map((d, i) => {
                    const divider = dataBE.length > 1 ? dataBE.length - 1 : 1;
                    const x = paddingX + (i / divider) * effectiveWidth;
                    const hargaNum = Number(d.harga) || 0;
                    const y = svgHeight - (hargaNum / maxHarga) * svgHeight;
                    return { x, y, harga: hargaNum, bulan: d.bulan || "-" };
                  });

                  const linePath = points.map((p) => `${p.x},${p.y}`).join(" ");
                  const areaPath = `M ${points[0].x},${svgHeight} ${linePath} ${points[points.length - 1].x},${svgHeight} Z`;

                  return (
                    <div className="flex flex-1 w-full min-h-[180px] relative overflow-hidden">
                      {/* SUMBU Y FIXED */}
                      <div className="absolute left-0 top-0 bottom-8 w-10 z-10 bg-white/95 backdrop-blur-[1px] flex flex-col justify-between text-[9px] text-gray-400 font-bold border-r border-gray-100 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                        {yLabels.map((l, idx) => (
                          <span key={idx} className="text-right pr-2">
                            {l.replace(".0k", "k")}
                          </span>
                        ))}
                      </div>

                      {/* AREA GRAFIK SCROLLABLE */}
                      <div className="flex-1 overflow-x-auto pl-10 pb-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        <div
                          style={{ width: `${svgWidth}px`, height: "100%" }}
                          className="relative"
                        >
                          <svg
                            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                            preserveAspectRatio="none"
                            className="block w-full h-full overflow-visible"
                          >
                            <defs>
                              <linearGradient
                                id="scrollGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#EF8523"
                                  stopOpacity="0.2"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#EF8523"
                                  stopOpacity="0"
                                />
                              </linearGradient>
                            </defs>
                            {/* Garis Grid Horizontal */}
                            {[0, 35, 70, 105, 140].map((y) => (
                              <line
                                key={y}
                                x1="0"
                                y1={y}
                                x2={svgWidth}
                                y2={y}
                                stroke="#f8f9fa"
                                strokeWidth="1"
                              />
                            ))}

                            <path d={areaPath} fill="url(#scrollGradient)" />
                            <polyline
                              fill="none"
                              stroke="#EF8523"
                              strokeWidth="3"
                              strokeLinejoin="round"
                              points={linePath}
                            />

                            {points.map((pt, i) => (
                              <g key={i}>
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="4"
                                  fill="white"
                                  stroke="#EF8523"
                                  strokeWidth="2.5"
                                />
                                <g
                                  transform={`translate(${pt.x - 22}, ${pt.y - 28})`}
                                >
                                  <rect
                                    width="44"
                                    height="16"
                                    rx="4"
                                    fill="black"
                                  />
                                  <text
                                    x="22"
                                    y="11"
                                    textAnchor="middle"
                                    className="text-[9px] font-black fill-white"
                                  >
                                    {pt.harga.toLocaleString()}
                                  </text>
                                </g>
                              </g>
                            ))}
                          </svg>

                          {/* Label Bulan */}
                          <div className="absolute bottom-0 left-0 w-full h-6">
                            {points.map((pt, i) => (
                              <div
                                key={i}
                                className="absolute flex flex-col items-center top-0"
                                style={{
                                  left: `${pt.x}px`,
                                  transform: "translateX(-50%)",
                                }}
                              >
                                <div className="w-1 h-1 bg-gray-300 rounded-full mb-1"></div>
                                <span className="text-[9px] font-bold text-gray-500 uppercase whitespace-nowrap">
                                  {pt.bulan.substring(0, 3)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Footer Info */}
              <div className="mt-2 border-t border-gray-50 pt-2 flex justify-between items-center">
                <p className="text-[8px] text-gray-400 italic font-medium">
                  * Geser untuk melihat riwayat harga
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* --- POPUP DATA DIRI --- */}
      {showPopupDataDiri && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="w-full max-w-3xl h-[85vh] rounded-2xl animate-fade-in-up flex relative shadow-2xl">
            <DataDiriGMDistrik
              onClose={() => setShowPopupDataDiri(false)}
              onSave={handleProfileSaved}
              initialData={profile}
              lockedFields={lockedFieldsConfig}
            />
          </div>
        </div>
      )}
    </div>
  );
}