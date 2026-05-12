import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  FileText,
  UploadCloud,
  CheckCircle2,
  MapPin,
  Clock,
  Loader2,
  X,
  Scale
} from "lucide-react";
import { API_BASE_URLS, getFileUrl } from "../../../config/constants";

export default function ManajemenSengketa() {
  // --- STATE NAVIGASI ---
  const [viewMode, setViewMode] = useState("list"); // "list" | "detail"
  const [selectedLahan, setSelectedLahan] = useState(null);

  // --- STATE DATA ---
  const [listSengketa, setListSengketa] = useState([]);
  const [dokumenTerkumpul, setDokumenTerkumpul] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE MODAL UPLOAD PROGRES ---
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formProgres, setFormProgres] = useState({
    judul_dokumen: "",
    keterangan: "",
    file_dokumen: null,
  });

  // =========================================================================
  // 1. FETCH LAHAN SENGKETA (DARI /farm/me/lahan)
  // =========================================================================
  const fetchLahanSengketa = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URLS.FARM}/farm/me/lahan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        
        // Gabungkan Mineral dan Gambut, lalu filter hanya yang ADA SENGKETA
        const mineralSengketa = (data.lahan_mineral?.detail_batch || [])
          .filter((l) => l.ada_sengketa)
          .map((l) => ({ ...l, tipe: "Mineral", nama: l.nama_lahan_mineral, luas: l.luas_batch }));
          
        const gambutSengketa = (data.lahan_gambut || [])
          .filter((l) => l.ada_sengketa)
          .map((l) => ({ ...l, tipe: "Gambut", nama: l.nama_lahan_gambut, luas: l.luas_total_diajukan }));

        setListSengketa([...mineralSengketa, ...gambutSengketa]);
      }
    } catch (error) {
      console.error("Gagal ambil lahan sengketa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLahanSengketa();
  }, []);

  // =========================================================================
  // 2. FETCH DOKUMEN SENGKETA (Klik Lihat Detail)
  // =========================================================================
  const handleLihatDetail = async (lahan) => {
    setSelectedLahan(lahan);
    setViewMode("detail");
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      // Endpoint BE: GET /farm/me/lahan/{lahan_id}/sengketa/dokumen
      const res = await fetch(`${API_BASE_URLS.FARM}/farm/me/lahan/${lahan.id}/sengketa/dokumen`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setDokumenTerkumpul(data.dokumen_terkumpul || data || []);
      } else {
        setDokumenTerkumpul([]);
      }
    } catch (error) {
      console.error("Gagal load dokumen:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // 3. SUBMIT PROGRES / DOKUMEN BARU (POST)
  // =========================================================================
  const handleSubmitProgres = async (e) => {
    e.preventDefault();
    if (!formProgres.file_dokumen) return alert("Mohon lampirkan file bukti!");
    
    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("judul_dokumen", formProgres.judul_dokumen);
      formData.append("keterangan", formProgres.keterangan);
      formData.append("file", formProgres.file_dokumen);

      // Endpoint BE: POST /farm/me/lahan/{id}/progres-sengketa
      const res = await fetch(`${API_BASE_URLS.FARM}/farm/me/lahan/${selectedLahan.id}/progres-sengketa`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData, // Pake FormData karena ada UploadFile
      });

      if (res.ok) {
        alert("Progres berhasil ditambahkan!");
        setShowUploadModal(false);
        setFormProgres({ judul_dokumen: "", keterangan: "", file_dokumen: null });
        handleLihatDetail(selectedLahan); // Refresh list dokumen
      } else {
        alert("Gagal mengupload dokumen progres.");
      }
    } catch (error) {
      console.error("Error upload:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // =========================================================================
  // 4. SELESAIKAN SENGKETA (PUT)
  // =========================================================================
  const handleSelesaikanSengketa = async () => {
    if (!window.confirm("Apakah Anda yakin sengketa ini sudah benar-benar selesai secara damai dan sah? Lahan akan otomatis dikembalikan ke status aktif.")) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Endpoint BE: PUT /farm/me/lahan/{id}/selesaikan-sengketa
      const res = await fetch(`${API_BASE_URLS.FARM}/farm/me/lahan/${selectedLahan.id}/selesaikan-sengketa`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (res.ok) {
        alert("Selamat! Sengketa berhasil diselesaikan. Status lahan kembali aktif.");
        setViewMode("list");
        fetchLahanSengketa(); // Refresh daftar lahan
      } else {
        alert("Gagal menyelesaikan sengketa.");
      }
    } catch (error) {
      console.error("Error resolve sengketa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 min-h-screen">
      {/* HEADER UTAMA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-red-50 p-3 rounded-2xl">
            <Scale className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Manajemen Sengketa Lahan</h1>
            <p className="text-sm text-gray-500 mt-1">Selesaikan konflik lahan Anda untuk melanjutkan sertifikasi ISPO.</p>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 mb-6 sm:mb-8" />

      {/* ================================================================= */}
      {/* TAMPILAN 1: DAFTAR LAHAN BERMASALAH */}
      {/* ================================================================= */}
      {viewMode === "list" && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 animate-fadeIn">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-gray-800">Daftar Lahan Bermasalah</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
          ) : listSengketa.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-50" />
              <p className="text-gray-500 font-bold">Luar Biasa! Tidak ada lahan Anda yang berstatus sengketa.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listSengketa.map((lahan, idx) => (
                <div key={idx} className="bg-white border border-red-200 p-5 rounded-2xl hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{lahan.tipe}</p>
                      <h3 className="text-lg font-black text-gray-800">{lahan.nama}</h3>
                    </div>
                    <span className="bg-red-50 text-red-700 text-[10px] font-bold px-3 py-1 rounded-full border border-red-100">
                      Sengketa Aktif
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-5">
                    <MapPin className="w-3.5 h-3.5" /> Luas Lahan: <span className="font-bold text-gray-800">{lahan.luas} Ha</span>
                  </div>
                  <button
                    onClick={() => handleLihatDetail(lahan)}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2.5 rounded-xl text-xs transition-colors border border-red-200"
                  >
                    Lihat Detail & Perbarui Progres
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* TAMPILAN 2: DETAIL SENGKETA & TIMELINE PROGRES */}
      {/* ================================================================= */}
      {viewMode === "detail" && selectedLahan && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <button 
            onClick={() => { setViewMode("list"); setSelectedLahan(null); }}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Lahan
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PANEL KIRI: INFO & AKSI UTAMA */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600"></div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Objek Sengketa</h3>
                <h2 className="text-xl font-black text-gray-900 mb-4">{selectedLahan.nama}</h2>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Tipe Lahan</span>
                    <span className="text-xs font-bold text-gray-800">{selectedLahan.tipe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Luas Terdampak</span>
                    <span className="text-xs font-bold text-gray-800">{selectedLahan.luas} Hektar</span>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-[#EF8523] hover:bg-[#d9751d] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-transform active:scale-95"
                  >
                    <UploadCloud className="w-4 h-4" /> Tambah Bukti Mediasi
                  </button>
                  <button 
                    onClick={handleSelesaikanSengketa}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-transform active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Selesaikan Sengketa
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2 leading-relaxed">
                    *Tekan selesaikan jika telah ada surat keputusan damai / inkrah dari Pengadilan atau Desa.
                  </p>
                </div>
              </div>
            </div>

            {/* PANEL KANAN: TIMELINE DOKUMEN (DARI GET /sengketa/dokumen) */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" /> Riwayat Progres & Dokumen Terkumpul
              </h3>

              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
              ) : dokumenTerkumpul.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50">
                  <p className="text-sm text-gray-500">Belum ada dokumen progres yang diunggah.</p>
                </div>
              ) : (
                <div className="space-y-4 border-l-2 border-gray-100 ml-3 pl-5 relative">
                  {dokumenTerkumpul.map((doc, idx) => (
                    <div key={idx} className="relative">
                      {/* Titik Timeline */}
                      <div className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500"></div>
                      
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900">{doc.judul_dokumen}</h4>
                          <span className="text-[10px] text-gray-500 font-bold bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {doc.tanggal_upload || "Hari ini"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-4">{doc.keterangan || "Tidak ada keterangan tambahan."}</p>
                        
                        {doc.file_url && (
                          <a 
                            href={getFileUrl(doc.file_url, "FARM")} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> Lihat Lampiran
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL UPLOAD PROGRES (POST) */}
      {/* ================================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-black text-gray-800">Tambah Dokumen Progres</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-1 text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmitProgres} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Judul Dokumen <span className="text-red-500">*</span></label>
                <input 
                  required
                  type="text" 
                  placeholder="Cth: Berita Acara Mediasi Desa ke-1"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-[#EF8523] outline-none"
                  value={formProgres.judul_dokumen}
                  onChange={e => setFormProgres({...formProgres, judul_dokumen: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Keterangan / Hasil <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  rows="3"
                  placeholder="Jelaskan ringkasan hasil rapat atau progres saat ini..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-[#EF8523] outline-none resize-none"
                  value={formProgres.keterangan}
                  onChange={e => setFormProgres({...formProgres, keterangan: e.target.value})}
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">File Lampiran <span className="text-red-500">*</span></label>
                <input 
                  required
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={e => setFormProgres({...formProgres, file_dokumen: e.target.files[0]})}
                />
                <p className="text-[10px] text-gray-400 mt-1">*Format: PDF/JPG/PNG. Lampirkan foto surat atau dokumentasi fisik.</p>
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl">Batal</button>
                <button type="submit" disabled={isUploading} className="flex-1 py-3 text-sm font-bold text-white bg-[#EF8523] hover:bg-[#d9751d] rounded-xl flex items-center justify-center gap-2">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />} Simpan Progres
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}