import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  FileText,
  Trash2,
  Edit,
  Upload,
  Search,
  CheckCircle,
  X,
  Save,
  Loader2,
  ShoppingCart,
} from "lucide-react";
// Sesuaikan import config dengan struktur folder Anda
import { API_ENDPOINTS } from "../../../config/constants.js";
// import { useNavigate } from "react-router-dom"; // UNCOMMENT JIKA MENGGUNAKAN REACT ROUTER

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

  // -- STATE UNTUK PENGURUS --
  const [pengurusList, setPengurusList] = useState([]);
  const [isLoadingPengurus, setIsLoadingPengurus] = useState(false);
  const [showModalPengurus, setShowModalPengurus] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    nama_anggota: "",
    jabatan_pengurus: "",
    tugas_pengurus: "",
    no_hp: "",
  });

  // -- STATE UNTUK HARGA TBS --
  const [showModalTBS, setShowModalTBS] = useState(false);
  const [isSubmittingTBS, setIsSubmittingTBS] = useState(false);
  const [tbsFormData, setTbsFormData] = useState({
    bulan: "",
    tahun: "",
    harga: "",
    file: null,
  });

  // -- STATE DOKUMEN --
  const [dokumenStatus, setDokumenStatus] = useState(
    DOKUMEN_CONFIG.map((doc) => ({
      ...doc,
      file_url: null,
      status: null,
      isUploading: false,
    })),
  );

  const fetchPengurus = async () => {
    setIsLoadingPengurus(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.USER.KEBUN.PENGURUS.MAIN, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPengurusList(data);
      }
    } catch (error) {
      console.error("Error fetching pengurus:", error);
    } finally {
      setIsLoadingPengurus(false);
    }
  };

  const fetchDokumenExisting = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.ISPO.KEBUN.SUBMISSION, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const dataServer = await response.json();
        setDokumenStatus((prevStatus) =>
          prevStatus.map((docConfig) => {
            const foundData = dataServer.find(
              (serverItem) => serverItem.requirement_code === docConfig.code,
            );
            if (foundData)
              return {
                ...docConfig,
                file_url: foundData.file_url,
                status: foundData.status,
              };
            return docConfig;
          }),
        );
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchPengurus();
    fetchDokumenExisting();
  }, []);

  const handleAddPengurus = () => {
    setIsEditMode(false);
    setFormData({
      nama_anggota: "",
      jabatan_pengurus: "",
      tugas_pengurus: "",
      no_hp: "",
    });
    setShowModalPengurus(true);
  };

  const handleEditPengurus = (item) => {
    setIsEditMode(true);
    setSelectedId(item.id);
    setFormData({
      nama_anggota: item.nama_anggota,
      jabatan_pengurus: item.jabatan_pengurus,
      tugas_pengurus: item.tugas_pengurus || "",
      no_hp: item.no_hp || "",
    });
    setShowModalPengurus(true);
  };

  const handleSubmitPengurus = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      let url = API_ENDPOINTS.USER.KEBUN.PENGURUS.MAIN;
      let method = "POST";

      if (isEditMode && selectedId) {
        url = API_ENDPOINTS.USER.KEBUN.PENGURUS.BY_ID(selectedId);
        method = "PATCH";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModalPengurus(false);
        fetchPengurus();
      } else {
        alert("Gagal menyimpan data pengurus.");
      }
    } catch (error) {
      console.error("Error submitting:", error);
    }
  };

  const handleDeletePengurus = async (id) => {
    if (!window.confirm("Apakah anda yakin ingin menghapus pengurus ini?"))
      return;
    try {
      const token = localStorage.getItem("token");
      const url = API_ENDPOINTS.USER.KEBUN.PENGURUS.BY_ID(id);
      const response = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) fetchPengurus();
      else alert("Gagal menghapus data.");
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleTBSChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") setTbsFormData({ ...tbsFormData, file: files[0] });
    else setTbsFormData({ ...tbsFormData, [name]: value });
  };

  const handleSubmitTBS = async (e) => {
    e.preventDefault();
    if (!tbsFormData.file) return alert("Mohon upload file SK Pemerintah.");
    if (
      isNaN(parseInt(tbsFormData.bulan)) ||
      isNaN(parseInt(tbsFormData.tahun))
    )
      return alert("Format Bulan/Tahun salah.");

    setIsSubmittingTBS(true);
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("periode_bulan", parseInt(tbsFormData.bulan));
      formDataToSend.append("periode_tahun", parseInt(tbsFormData.tahun));
      formDataToSend.append("harga_per_kg", parseFloat(tbsFormData.harga));
      formDataToSend.append("file", tbsFormData.file);

      const url = API_ENDPOINTS.FARM.KEBUN.TRANSAKSI.HARGA_TBS;
      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (response.ok) {
        alert("Data Harga TBS berhasil dikirim!");
        setShowModalTBS(false);
        setTbsFormData({ bulan: "", tahun: "", harga: "", file: null });
      } else {
        const errorData = await response.json();
        alert(`Gagal mengirim: ${JSON.stringify(errorData.detail)}`);
      }
    } catch (error) {
      console.error("Error submitting TBS:", error);
    } finally {
      setIsSubmittingTBS(false);
    }
  };

  const handleUploadDokumen = async (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const requirementCode = dokumenStatus[index].code;
    const newDocs = [...dokumenStatus];
    newDocs[index].isUploading = true;
    setDokumenStatus(newDocs);

    try {
      const token = localStorage.getItem("token");
      const formDataUpload = new FormData();
      formDataUpload.append("requirement_code", requirementCode);
      formDataUpload.append("file", file);

      const response = await fetch(API_ENDPOINTS.ISPO.KEBUN.SUBMISSION, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      if (response.ok) {
        const result = await response.json();
        newDocs[index] = {
          ...newDocs[index],
          file_url: result.url,
          status: result.status,
          isUploading: false,
        };
        setDokumenStatus(newDocs);
        alert("Berhasil upload dokumen!");
      } else {
        newDocs[index].isUploading = false;
        setDokumenStatus(newDocs);
        const errorData = await response.json();
        alert(`Gagal upload: ${errorData.detail}`);
      }
    } catch (error) {
      console.error("Error upload:", error);
      newDocs[index].isUploading = false;
      setDokumenStatus(newDocs);
    }
  };

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans relative">
      {/* HEADER & TAB SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <Users className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Manajemen Organisasi
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Kelola struktur organisasi dan dokumen legalitas.
            </p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto">
          <button
            onClick={() => navigate("../manajemenoperasional")} // Berpindah ke route awal
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all text-gray-500 hover:bg-gray-200"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Penjualan/Peminjaman</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all bg-white text-[#B5302D] shadow-sm">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Organisasi</span>
          </button>
        </div>
      </div>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {/* SECTION 1 PENGURUS */}
        <SectionCard title="Daftar Anggota Pengurus">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs text-gray-500">
              Struktur organisasi kelompok tani.
            </p>
            <button
              onClick={handleAddPengurus}
              className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg shadow-green-100 transition-all"
            >
              <Plus className="w-3 h-3" /> Tambah
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EF8523] text-white text-[11px] uppercase tracking-wider">
                  <th className="p-4 font-bold rounded-tl-xl">No</th>
                  <th className="p-4 font-bold">Nama Anggota</th>
                  <th className="p-4 font-bold">Jabatan</th>
                  <th className="p-4 font-bold">No. HP</th>
                  <th className="p-4 font-bold">Tugas & Tanggung Jawab</th>
                  <th className="p-4 font-bold text-center rounded-tr-xl">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-700 bg-white">
                {isLoadingPengurus ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center">
                      Memuat data...
                    </td>
                  </tr>
                ) : pengurusList.length > 0 ? (
                  pengurusList.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                    >
                      <td className="p-4 font-bold text-center">{index + 1}</td>
                      <td className="p-4 font-bold">{item.nama_anggota}</td>
                      <td className="p-4 font-medium text-[#B5302D]">
                        {item.jabatan_pengurus}
                      </td>
                      <td className="p-4 text-gray-500">{item.no_hp || "-"}</td>
                      <td className="p-4 text-gray-500">
                        {item.tugas_pengurus}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditPengurus(item)}
                            className="p-2 bg-gray-100 hover:bg-blue-100 text-blue-600 rounded-lg"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePengurus(item.id)}
                            className="p-2 bg-gray-100 hover:bg-red-100 text-red-600 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center">
                      Belum ada data pengurus.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* SECTION 2 DOKUMEN */}
        <SectionCard title="Kelengkapan Dokumen Organisasi">
          <div className="-mt-4 mb-6">
            <div className="w-full h-[1px] bg-gray-300 mb-4 mt-2" />
            <p className="text-sm text-gray-500 font-light mb-4">
              Upload Dokumen organisasi Untuk Petani Mitra
            </p>
            <button
              onClick={() => setShowModalTBS(true)}
              className="flex items-center gap-2 bg-[#D1F7C4] hover:bg-green-200 text-green-900 border border-green-300 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <FileText className="w-4 h-4" /> Tambah Harga TBS
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dokumenStatus.map((doc, idx) => {
              const isUploaded = !!doc.file_url;
              return (
                <div
                  key={idx}
                  className={`group bg-white border rounded-xl p-4 flex flex-row items-center gap-4 transition-all hover:shadow-md ${isUploaded ? "border-green-400 bg-green-50/30" : "border-gray-400"}`}
                >
                  <div
                    className={`p-3 rounded-full flex-shrink-0 ${isUploaded ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
                  >
                    {isUploaded ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <FileText className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2">
                      {doc.label}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {isUploaded ? (
                        <span className="text-green-600 font-medium">
                          Sudah diupload ({doc.status})
                        </span>
                      ) : (
                        "Belum ada file"
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      className={`cursor-pointer p-2 rounded-lg transition-colors border ${doc.isUploading ? "bg-gray-100 border-gray-200 text-gray-400" : "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100"}`}
                    >
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleUploadDokumen(idx, e)}
                        disabled={doc.isUploading}
                      />
                      {doc.isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </label>
                    {isUploaded && (
                      <button
                        onClick={() => window.open(doc.file_url, "_blank")}
                        className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* MODAL PENGURUS */}
      {showModalPengurus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModalPengurus(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="bg-[#B5302D] p-5 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {isEditMode ? "Edit Pengurus" : "Tambah Pengurus"}
              </h3>
              <button
                onClick={() => setShowModalPengurus(false)}
                className="p-1 hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitPengurus} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nama Anggota
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_anggota}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_anggota: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jabatan_pengurus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jabatan_pengurus: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    No. HP
                  </label>
                  <input
                    type="text"
                    value={formData.no_hp}
                    onChange={(e) =>
                      setFormData({ ...formData, no_hp: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tugas & Tanggung Jawab
                </label>
                <textarea
                  rows="3"
                  value={formData.tugas_pengurus}
                  onChange={(e) =>
                    setFormData({ ...formData, tugas_pengurus: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600"
                >
                  <Save className="w-4 h-4" /> Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowModalPengurus(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-800 bg-gray-200 hover:bg-gray-300"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TBS */}
      {showModalTBS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModalTBS(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="bg-[#D1F7C4] p-5 text-green-900 border-b border-green-300 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" /> Input SK TBS
              </h3>
              <button
                onClick={() => setShowModalTBS(false)}
                className="p-1 hover:bg-green-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitTBS} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Bulan
                  </label>
                  <select
                    name="bulan"
                    required
                    value={tbsFormData.bulan}
                    onChange={handleTBSChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  >
                    <option value="">Pilih...</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tahun
                  </label>
                  <input
                    type="number"
                    name="tahun"
                    required
                    value={tbsFormData.tahun}
                    onChange={handleTBSChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Harga per Kg (Rp)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="harga"
                  required
                  value={tbsFormData.harga}
                  onChange={handleTBSChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Upload SK (.pdf)
                </label>
                <input
                  type="file"
                  name="file"
                  accept="application/pdf"
                  required
                  onChange={handleTBSChange}
                  className="w-full px-4 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingTBS}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
                >
                  {isSubmittingTBS ? "Mengupload..." : "Simpan Harga"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// HELPER COMPONENT (Tetap butuh di sini juga)
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
