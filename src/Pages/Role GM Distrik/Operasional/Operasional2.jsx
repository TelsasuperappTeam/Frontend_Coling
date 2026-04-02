import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  FileText,
  Trash2,
  Upload,
  Search,
  CheckCircle,
  X,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
// Sesuaikan import config dengan konstanta Anda
import { API_ENDPOINTS, API_BASE_URLS } from "../../../config/constants.js";

const DOKUMEN_CONFIG = [
  { id: 1, label: "Berita acara pembentukan kelompok tani", code: "P2_2_1_BERITA_ACARA" },
  { id: 2, label: "Surat Bukti Keanggotaan Kelompok Tani/Koperasi", code: "P2_2_1_ANGGOTA" },
  { id: 3, label: "Akta Pendirian dan AD/ART", code: "P2_2_1_ADART" },
];

const Operasional2 = () => {
  const navigate = useNavigate();

  // -- STATE IDENTITAS & ROLE --
  const [userRole, setUserRole] = useState(null);
  const [daftarKebun, setDaftarKebun] = useState([]);
  const [expandedKebun, setExpandedKebun] = useState(null);

  // -- STATE DATA PER KEBUN (Object Key: kebun_id) --
  const [dataOrganisasi, setDataOrganisasi] = useState({});
  const [loadingKebun, setLoadingKebun] = useState({});

  // -- STATE MODAL TBS (Hanya untuk Role Kebun) --
  const [showModalTBS, setShowModalTBS] = useState(false);
  const [isSubmittingTBS, setIsSubmittingTBS] = useState(false);
  const [tbsFormData, setTbsFormData] = useState({
    periode_bulan: new Date().getMonth() + 1,
    periode_tahun: new Date().getFullYear(),
    harga_per_kg: "",
    file: null,
  });

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
  const fetchDataOrganisasi = useCallback(async (kebunAuthId) => {
    if (!kebunAuthId) return;
    setLoadingKebun((prev) => ({ ...prev, [kebunAuthId]: true }));
    try {
      const token = localStorage.getItem("token");
      // Logika BE: Jika GM, kirim target_kebun_auth_id
      const queryParam = isGM ? `?target_kebun_auth_id=${kebunAuthId}` : "";
      
      const res = await fetch(`${API_BASE_URLS.FARM}/farm/kebun/organisasi/dokumen${queryParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setDataOrganisasi((prev) => ({ ...prev, [kebunAuthId]: data }));
      }
    } catch (error) {
      console.error("Fetch organisasi error:", error);
    } finally {
      setLoadingKebun((prev) => ({ ...prev, [kebunAuthId]: false }));
    }
  }, [isGM]); // Bergantung pada isGM karena digunakan di dalam logic queryParam

  // 2. Tambahkan fetchDataOrganisasi ke dalam dependency array fetchDaftarKebun
  const fetchDaftarKebun = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (isGM) {
        const res = await fetch(`${API_BASE_URLS.USER}/users/gm/me/kebun-list`, { headers });
        if (res.ok) {
          const data = await res.json();
          setDaftarKebun(data);
          if (data.length > 0) {
            setExpandedKebun(data[0].auth_id);
            fetchDataOrganisasi(data[0].auth_id); // Fungsi ini sekarang stabil
          }
        }
      } else {
        const res = await fetch(`${API_BASE_URLS.USER}/users/me`, { headers });
        if (res.ok) {
          const data = await res.json();
          const single = [{ auth_id: data.auth_id, nama_lengkap: data.nama_lengkap }];
          setDaftarKebun(single);
          setExpandedKebun(data.auth_id);
          fetchDataOrganisasi(data.auth_id);
        }
      }
    } catch (error) {
      console.error("Fetch kebun error:", error);
    }
  }, [isGM, fetchDataOrganisasi]);

  useEffect(() => {
    if (userRole) fetchDaftarKebun();
  }, [userRole, fetchDaftarKebun]);

  // 4. Handler Toggle Accordion
  const toggleKebun = (id) => {
    if (expandedKebun === id) {
      setExpandedKebun(null);
    } else {
      setExpandedKebun(id);
      if (!dataOrganisasi[id]) fetchDataOrganisasi(id);
    }
  };

  // 5. Handler POST TBS (Hanya Kebun)
  const handleTBSChange = (e) => {
    const { name, value, files } = e.target;
    setTbsFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const submitTBS = async (e) => {
    e.preventDefault();
    if (isGM) return alert("Hanya role Kebun yang dapat menginput harga!");
    
    setIsSubmittingTBS(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("periode_bulan", tbsFormData.periode_bulan);
      formData.append("periode_tahun", tbsFormData.periode_tahun);
      formData.append("harga_per_kg", tbsFormData.harga_per_kg);
      formData.append("file", tbsFormData.file);

      const res = await fetch(`${API_BASE_URLS.FARM}/farm/kebun/harga-tbs/input`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        alert("Harga TBS Berhasil disimpan!");
        setShowModalTBS(false);
      } else {
        alert("Gagal menyimpan harga TBS.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingTBS(false);
    }
  };

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <Users className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#B5302D]">Manajemen Operasional</h1>
            <p className="text-gray-500 text-sm">Kelola struktur organisasi dan dokumen legalitas.</p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
          <button
            onClick={() => navigate("../manajemenoperasional")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all text-gray-500 hover:bg-gray-200"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Penjualan/Peminjaman</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all bg-white text-[#B5302D] shadow-sm">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Organisasi & Dokumen</span>
          </button>
        </div>
      </div>

      {/* LIST KEBUN (ACCORDION) */}
      <div className="space-y-4">
        {daftarKebun.map((kebun) => {
          const isExpanded = expandedKebun === kebun.auth_id;
          const docs = dataOrganisasi[kebun.auth_id] || [];
          const loading = loadingKebun[kebun.auth_id];

          return (
            <div key={kebun.auth_id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div
                onClick={() => toggleKebun(kebun.auth_id)}
                className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${
                  isExpanded ? "bg-red-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#B5302D] text-white rounded-full flex items-center justify-center font-bold">
                    {kebun.nama_lengkap?.charAt(0)}
                  </div>
                  <span className="font-bold text-gray-700">{kebun.nama_lengkap}</span>
                </div>
                {isExpanded ? <ChevronUp /> : <ChevronDown />}
              </div>

              {isExpanded && (
                <div className="p-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* SEKSI DOKUMEN */}
                    <SectionCard title="Arsip Dokumen Legalitas">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-xs text-gray-400">Daftar kelengkapan dokumen ISPO/RSPO.</p>
                        {!isGM && (
                           <button className="text-[10px] bg-[#B5302D] text-white px-3 py-1 rounded-full font-bold">
                             + Upload Baru
                           </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {loading ? (
                          <p className="text-center py-4 text-xs">Memuat dokumen...</p>
                        ) : DOKUMEN_CONFIG.map((conf) => {
                          const fileExist = docs.find((d) => d.tipe_dokumen === conf.code);
                          return (
                            <div key={conf.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                              <div className="flex items-center gap-3">
                                <FileText className={`w-5 h-5 ${fileExist ? "text-green-500" : "text-gray-300"}`} />
                                <span className="text-xs font-medium text-gray-600">{conf.label}</span>
                              </div>
                              {fileExist ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <button className="text-[#B5302D] hover:underline text-[10px] font-bold">Lihat</button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-400 italic">Belum diunggah</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </SectionCard>

                    {/* SEKSI TBS (HANYA INFO UNTUK GM, TOMBOL INPUT UNTUK KEBUN) */}
                    <SectionCard title="Harga TBS Pemerintah">
                       <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-4">
                          <p className="text-[10px] text-green-700 font-bold uppercase mb-1">Status Update</p>
                          <h4 className="text-lg font-bold text-green-800">Rp 2.850 <span className="text-xs font-normal">/ Kg</span></h4>
                          <p className="text-[10px] text-green-600">Periode: Oktober 2023</p>
                       </div>
                       {!isGM && (
                         <button 
                           onClick={() => setShowModalTBS(true)}
                           className="w-full py-3 bg-white border-2 border-dashed border-green-300 rounded-xl text-green-600 text-xs font-bold hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                         >
                           <Upload className="w-4 h-4" /> Perbarui Harga & Upload SK
                         </button>
                       )}
                    </SectionCard>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL INPUT TBS (Hanya muncul jika dipicu role kebun) */}
      {showModalTBS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 bg-green-600 flex justify-between items-center text-white">
              <h3 className="font-bold text-sm">Input Harga TBS</h3>
              <X className="cursor-pointer" onClick={() => setShowModalTBS(false)} />
            </div>
            <form onSubmit={submitTBS} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Bulan</label>
                  <select 
                    name="periode_bulan"
                    value={tbsFormData.periode_bulan}
                    onChange={handleTBSChange}
                    className="w-full p-2 border rounded-lg text-sm"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1}</option>
                    ))}
                  </select>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-gray-500 mb-1">Tahun</label>
                   <input 
                     type="number"
                     name="periode_tahun"
                     value={tbsFormData.periode_tahun}
                     onChange={handleTBSChange}
                     className="w-full p-2 border rounded-lg text-sm"
                   />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">Harga (Rp/Kg)</label>
                <input 
                  type="number"
                  name="harga_per_kg"
                  required
                  onChange={handleTBSChange}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Contoh: 2800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">File SK (.pdf)</label>
                <input 
                  type="file"
                  name="file"
                  accept="application/pdf"
                  required
                  onChange={handleTBSChange}
                  className="w-full text-xs"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmittingTBS}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-sm"
              >
                {isSubmittingTBS ? "Proses..." : "Simpan Data"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// HELPER COMPONENT
const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 relative overflow-hidden shadow-sm">
    <div className="absolute top-0 left-0 w-1 h-full bg-[#B5302D]"></div>
    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-4">{title}</h3>
    {children}
  </div>
);

export default Operasional2;