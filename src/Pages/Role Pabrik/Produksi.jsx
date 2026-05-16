import React, { useState, useEffect, useCallback } from "react";
import {
  Factory,
  PlusCircle,
  CheckCircle,
  History,
  Package,
  Barcode,
  Calendar,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react";

import { API_ENDPOINTS } from "../../config/constants.js";

import { showToast, confirmDialog } from "../../utils/notif";

// --- KOMPONEN SECTION CARD ---
const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden group hover:shadow-md transition-all">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />
    <h3 className="text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

export default function Produksi() {
  // State Data Dinamis dari BE
  const [siklusAktif, setSiklusAktif] = useState([]);
  const [riwayatProduksi, setRiwayatProduksi] = useState([]);

  // State Status Loading
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form Mulai Produksi
  const [jumlahTBS, setJumlahTBS] = useState("");

  // State Modal Selesaikan Produksi
  const [showModal, setShowModal] = useState(false);
  const [selectedSiklusId, setSelectedSiklusId] = useState(null);
  const [hasilForm, setHasilForm] = useState({
    cpo: "",
    pko: "",
    cangkang: "",
    serat: "",
    tandan_kosong: "",
    pome: "",
  });

  // Helper Format Waktu (ISO -> DD/MM/YYYY, HH:mm)
  const formatWaktu = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date
      .toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(/\./g, ":");
  };

  // ====================================================================
  // 1. FUNGSI FETCH DATA SIKLUS (AKTIF & HISTORI)
  // ====================================================================
  const fetchSiklusData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const urlBase = API_ENDPOINTS.TRACEABILITY.PABRIK.PRODUKSI.GET_LIST;

      // Jalankan 2 request secara paralel (Untuk data aktif & data riwayat)
      const [resAktif, resHistori] = await Promise.all([
        fetch(`${urlBase}?is_history=false`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${urlBase}?is_history=true`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (resAktif.ok) {
        const dataAktif = await resAktif.json();
        console.log("=== DATA SIKLUS AKTIF (DARI BE) ===", dataAktif);
        setSiklusAktif(dataAktif);
      }

      if (resHistori.ok) {
        const dataHistori = await resHistori.json();
        console.log("=== DATA RIWAYAT PRODUKSI (DARI BE) ===", dataHistori);
        setRiwayatProduksi(dataHistori);
      }
    } catch (error) {
      console.error("Error fetching siklus produksi:", error);
      // TAMBAHKAN TOAST ERROR INI:
      showToast.error(
        "Gagal memuat data siklus produksi. Periksa koneksi Anda.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSiklusData();
  }, [fetchSiklusData]);

  // ====================================================================
  // 2. FUNGSI MULAI SIKLUS PRODUKSI (POST)
  // ====================================================================
  const handleMulaiSiklus = async () => {
    if (
      !jumlahTBS ||
      isNaN(parseFloat(jumlahTBS)) ||
      parseFloat(jumlahTBS) <= 0
    ) {
      // 1. UBAH ALERT VALIDASI JADI TOAST ERROR
      showToast.error("Masukkan jumlah TBS yang valid (lebih dari 0)!");
      return;
    }

    // 2. TAMBAHKAN CEGATAN KONFIRMASI DI SINI
    const isSetuju = await confirmDialog({
      title: "Mulai Siklus Produksi?",
      text: `Anda akan memproses ${jumlahTBS} Kg TBS. Stok akan otomatis terpotong dari RAM.`,
      confirmText: "Ya, Mulai!",
      isDanger: false, // Bukan aksi destruktif (hapus), jadi tidak perlu merah
    });

    // JIKA USER BATALKAN, STOP FUNGSI DI SINI
    if (!isSetuju) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const url = API_ENDPOINTS.TRACEABILITY.PABRIK.PRODUKSI.MULAI;

      const payload = {
        jumlah_tbs_digunakan: parseFloat(jumlahTBS),
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // 3. UBAH ALERT SUKSES JADI TOAST SUCCESS
        showToast.success("Siklus Produksi berhasil dimulai!");
        setJumlahTBS("");
        fetchSiklusData();
      } else {
        const errMsg = data.detail
          ? typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail)
          : "Gagal memulai produksi.";
        // 4. UBAH ALERT ERROR JADI TOAST ERROR
        showToast.error("Gagal: " + errMsg);
      }
    } catch {
      // 5. UBAH ALERT CATCH JADI TOAST ERROR
      showToast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====================================================================
  // 3. FUNGSI SELESAIKAN SIKLUS PRODUKSI (POST dengan HASIL)
  // ====================================================================
  const openModalSelesai = (siklusId) => {
    setSelectedSiklusId(siklusId);
    setHasilForm({
      cpo: "",
      pko: "",
      cangkang: "",
      serat: "",
      tandan_kosong: "",
      pome: "",
    });
    setShowModal(true);
  };

  const handleSelesaikanSiklus = async () => {
    // (Opsional) Validasi ringan: minimal CPO harus diisi
    if (!hasilForm.cpo || hasilForm.cpo <= 0) {
      showToast.error("Hasil CPO tidak boleh kosong atau 0!");
      return;
    }

    // TAMBAHKAN CEGATAN KONFIRMASI (Final Check)
    const isSetuju = await confirmDialog({
      title: "Generate Kode Resi ?",
      text: "Pastikan angka timbangan sudah benar. Data yang disimpan akan menerbitkan Resi Produksi dan tidak dapat diubah lagi.",
      confirmText: "Ya, Generate Resi!",
      isDanger: false,
    });

    // Jika batal, hentikan proses
    if (!isSetuju) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const url =
        API_ENDPOINTS.TRACEABILITY.PABRIK.PRODUKSI.SELESAI(selectedSiklusId);

      const payload = {
        cpo: parseFloat(hasilForm.cpo) || 0.0,
        pko: parseFloat(hasilForm.pko) || 0.0,
        cangkang: parseFloat(hasilForm.cangkang) || 0.0,
        serat: parseFloat(hasilForm.serat) || 0.0,
        tandan_kosong: parseFloat(hasilForm.tandan_kosong) || 0.0,
        pome: parseFloat(hasilForm.pome) || 0.0,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        showToast.success(data.message || "Produksi berhasil diselesaikan!");
        setShowModal(false);
        fetchSiklusData();
      } else {
        const errMsg = data.detail
          ? typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail)
          : "Gagal menyelesaikan produksi.";
        showToast.error("Gagal: " + errMsg);
      }
    } catch {
      showToast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans relative">
      {/* --- HEADER HALAMAN --- */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-red-50 rounded-2xl shadow-sm">
          <Factory className="w-8 h-8 text-[#B5302D]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#B5302D]">
            Manajemen Produksi
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola siklus pengolahan TBS menjadi CPO beserta turunannya.
          </p>
        </div>
      </div>

      <hr className="border-gray-200 mb-8" />

      <div className="space-y-8">
        {/* --- SECTION 1: INPUT SIKLUS BARU --- */}
        <SectionCard
          title={
            <>
              <PlusCircle className="w-5 h-5" />
              Mulai Siklus Produksi Baru
            </>
          }
        >
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="w-full">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Jumlah TBS Digunakan (Kg)
              </label>
              <input
                type="number"
                min="1"
                placeholder="Masukkan jumlah Kg TBS yang akan diproses..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none transition-all"
                value={jumlahTBS}
                onChange={(e) => {
                  const val = e.target.value;

                  /* Logika validasi: Izinkan kosong (agar bisa dihapus/backspace) ATAU angka harus lebih besar dari 0 */
                  if (val === "" || Number(val) > 0) {
                    setJumlahTBS(val);
                  }
                }}
              />
            </div>
            <button
              onClick={handleMulaiSiklus}
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-3 bg-[#4A90E2] hover:bg-[#357ABD] text-white font-bold rounded-xl transition-colors whitespace-nowrap shadow-md disabled:opacity-50"
            >
              {isSubmitting ? "Memproses..." : "Mulai Produksi"}
            </button>
          </div>
        </SectionCard>

        {/* --- SECTION 2 SIKLUS PRODUKSI BERJALAN --- */}
        <SectionCard
          title={
            <>
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
              Siklus Produksi Berjalan
            </>
          }
        >
          <div className="flex justify-end -mt-4 mb-4">
            <span className="text-xs font-medium text-gray-400">
              Menampilkan {siklusAktif.length} siklus yang sedang diproses
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <p className="text-sm text-gray-400 col-span-2 text-center py-6 font-bold">
                Memuat Data...
              </p>
            ) : siklusAktif.length === 0 ? (
              <p className="text-sm text-gray-400 col-span-2 text-center py-6 border border-dashed rounded-xl bg-gray-50">
                Tidak ada siklus produksi yang sedang berjalan.
              </p>
            ) : (
              siklusAktif.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50/50 border border-gray-200 rounded-xl p-5 hover:border-[#EF8523]/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">
                        Siklus Ke-{item.no_siklus_produksi}
                      </h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-200 uppercase">
                        Sedang Berjalan
                      </span>
                    </div>
                    <button
                      onClick={() => openModalSelesai(item.id)}
                      className="w-full md:w-auto px-4 py-2 text-xs bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors whitespace-nowrap shadow-sm disabled:opacity-50"
                    >
                      Selesaikan Produksi
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Calendar className="w-3.5 h-3.5" /> Waktu Mulai
                      </span>
                      <span className="font-semibold text-xs">
                        {formatWaktu(item.waktu_mulai)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Package className="w-3.5 h-3.5" /> TBS Diproses
                      </span>
                      <span className="font-bold text-[#B5302D]">
                        {item.jumlah_tbs.toLocaleString("id-ID")} Kg
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* --- SECTION 3 RIWAYAT PRODUKSI --- */}
        <SectionCard
          title={
            <>
              <History className="w-5 h-5" />
              Riwayat Produksi Selesai
            </>
          }
        >
          <div className="flex justify-end -mt-4 mb-4">
            <span className="text-xs font-medium text-gray-400">
              Total {riwayatProduksi.length} riwayat produksi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <p className="text-sm text-gray-400 col-span-2 text-center py-6 font-bold">
                Memuat Data...
              </p>
            ) : riwayatProduksi.length === 0 ? (
              <p className="text-sm text-gray-400 col-span-2 text-center py-6 border border-dashed rounded-xl bg-gray-50">
                Belum ada riwayat produksi yang selesai.
              </p>
            ) : (
              riwayatProduksi.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-md font-bold text-gray-800">
                      Siklus Ke-{item.no_siklus_produksi}
                    </h4>
                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase">
                        Selesai
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <div className="grid grid-cols-2 gap-y-2 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                      <span className="text-gray-400 text-xs">Mulai:</span>
                      <span className="font-medium text-right text-[11px]">
                        {formatWaktu(item.waktu_mulai)}
                      </span>

                      <span className="text-gray-400 text-xs">Selesai:</span>
                      <span className="font-medium text-right text-[11px]">
                        {formatWaktu(item.waktu_selesai)}
                      </span>

                      <div className="col-span-2 border-t border-gray-200 my-1 border-dashed"></div>

                      <span className="text-gray-400 text-xs flex items-center gap-1">
                        <Package className="w-3 h-3" /> Bahan Baku:
                      </span>
                      <span className="font-bold text-[#B5302D] text-right">
                        {item.jumlah_tbs.toLocaleString("id-ID")} Kg
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between bg-blue-50/50 p-3 rounded-lg border border-blue-100 border-dashed group">
                        <div className="flex items-center gap-2">
                          <Barcode className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
                          <span className="text-xs font-bold text-gray-500">
                            Kode Resi:
                          </span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-blue-700 bg-white px-2 py-1 border border-blue-100 rounded">
                          {item.kode_resi_produksi || "Memproses..."}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      {/* ================================================================= */}
      {/* MODAL FORM HASIL PRODUKSI (Ditampilkan saat klik Selesaikan) */}
      {/* ================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-[#B5302D]">
                  Selesaikan Produksi
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Masukkan data timbangan akhir output produksi (dalam Kg).
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 bg-gray-200 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Form Modal */}
            <div className="p-6 grid grid-cols-2 gap-5 overflow-y-auto">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">
                  Hasil CPO (Kg)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#B5302D] bg-yellow-50/30"
                  value={hasilForm.cpo}
                  onChange={(e) =>
                    setHasilForm({ ...hasilForm, cpo: e.target.value })
                  }
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">
                  Hasil PKO (Kg)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#B5302D] bg-yellow-50/30"
                  value={hasilForm.pko}
                  onChange={(e) =>
                    setHasilForm({ ...hasilForm, pko: e.target.value })
                  }
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">
                  Cangkang (Kg)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#B5302D]"
                  value={hasilForm.cangkang}
                  onChange={(e) =>
                    setHasilForm({ ...hasilForm, cangkang: e.target.value })
                  }
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">
                  Serat (Kg)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#B5302D]"
                  value={hasilForm.serat}
                  onChange={(e) =>
                    setHasilForm({ ...hasilForm, serat: e.target.value })
                  }
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">
                  Tandan Kosong (Kg)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#B5302D]"
                  value={hasilForm.tandan_kosong}
                  onChange={(e) =>
                    setHasilForm({
                      ...hasilForm,
                      tandan_kosong: e.target.value,
                    })
                  }
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">
                  Limbah POME (Kg)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#B5302D]"
                  value={hasilForm.pome}
                  onChange={(e) =>
                    setHasilForm({ ...hasilForm, pome: e.target.value })
                  }
                  placeholder="0.0"
                />
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSelesaikanSiklus}
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Simpan & Generate Kode Resi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
