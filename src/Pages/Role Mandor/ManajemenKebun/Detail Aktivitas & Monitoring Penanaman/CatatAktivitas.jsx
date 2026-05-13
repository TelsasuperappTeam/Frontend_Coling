import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  AlertCircle,
  RefreshCw,
  Edit,
  ArrowLeft,
  ClipboardCheck,
  Clock,
  History,
} from "lucide-react";
import { API_ENDPOINTS, API_BASE_URLS } from "../../../../config/constants";

// KOMPONEN UTAMA
export default function CatatAktivitas() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State dasar UI
  const [unit, setUnit] = useState("");

  // === STATE REALISASI TANAM ===
  const [loadingRealisasi, setLoadingRealisasi] = useState(false);
  const [isEditingRealisasi, setIsEditingRealisasi] = useState(false);

  const [realisasiData, setRealisasiData] = useState({
    namaUnit: "",
    jenisTanah: "",
    tanggalTanam: "",
    luasUnit: "",
    jenisBibit: "",
    jenisLahan: "",
    jumlahTanamanPerHa: "",
    jumlahTotalTanaman: "",
    jarakTanam: "",
    jarakTanamLainnya: "",
    catatanPerubahanTerakhir: "",
    waktuPencatatan: "",
  });

  const [catatanPerubahan, setCatatanPerubahan] = useState("");

  // FETCH DATA API UTAMA (DETAIL BLOK)
  const fetchRealisasiDetail = useCallback(async () => {
    setLoadingRealisasi(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // 1. Ambil Detail Blok (Header)
      let blokEndpoint = API_ENDPOINTS.FARM.PETANI.ACTIVITY.GET_BLOK_DETAIL(id);
      const responseBlok = await fetch(blokEndpoint, {
        method: "GET",
        headers,
      });

      if (responseBlok.ok) {
        const dataBlok = await responseBlok.json();

        // --- [DEBUG 1] Lihat data mentah dari Backend ---
        console.log("[DEBUG - FETCH] Data Blok Keseluruhan:", dataBlok);
        console.log(
          "[DEBUG - FETCH] Array Realisasi Tanam:",
          dataBlok.realisasi_rencana_tanam,
        );

        setUnit(dataBlok.nama_unit);

        const adaRealisasi =
          dataBlok.realisasi_rencana_tanam &&
          dataBlok.realisasi_rencana_tanam.length > 0;

        // Ambil riwayat realisasi yang paling terakhir (paling baru)
        const realisasiTerbaru = adaRealisasi
          ? dataBlok.realisasi_rencana_tanam[
              dataBlok.realisasi_rencana_tanam.length - 1
            ]
          : null;

        // --- [DEBUG 2] Lihat hasil pemilihan data terbaru ---
        console.log("[DEBUG - LOGIC] Apakah ada realisasi?", adaRealisasi);
        console.log(
          "[DEBUG - LOGIC] Data Realisasi Terbaru yang dipilih:",
          realisasiTerbaru,
        );

        // Buat objek data sebelum di-set ke state agar bisa di-log
        const stateDataToSet = {
          namaUnit: dataBlok.nama_unit,
          jenisTanah: dataBlok.jenis_tanah,
          tanggalTanam: dataBlok.tanggal_tanam_blok,
          luasUnit: `${dataBlok.luas_unit} Ha`,
          jenisBibit: dataBlok.jenis_bibit,
          jenisLahan: dataBlok.jenis_lahan,

          // --- LOGIKA PRIORITAS: Pakai Realisasi (Jika Ada), Jika Tidak Pakai Rencana Awal ---
          jumlahTanamanPerHa: realisasiTerbaru
            ? realisasiTerbaru.realisasi_jumlah_tanaman_per_ha
            : dataBlok.jumlah_tanaman_per_ha,

          jumlahTotalTanaman: realisasiTerbaru
            ? realisasiTerbaru.realisasi_jumlah_total_tanaman
            : dataBlok.jumlah_total_tanaman,

          jarakTanam: realisasiTerbaru
            ? realisasiTerbaru.realisasi_jarak_tanam
            : dataBlok.jarak_tanam,

          jarakTanamLainnya: realisasiTerbaru
            ? realisasiTerbaru.realisasi_jarak_tanam_lainnya || ""
            : dataBlok.jarak_tanam_lainnya || "",

          catatanPerubahanTerakhir: realisasiTerbaru
            ? realisasiTerbaru.catatan_perubahan
            : "",
          waktuPencatatan: realisasiTerbaru ? realisasiTerbaru.created_at : "",
        };

        // --- [DEBUG 3] Lihat hasil final yang akan tampil di UI ---
        console.log(
          "[DEBUG - FINAL] Data yang di-set ke State:",
          stateDataToSet,
        );

        // SET DATA STATE
        setRealisasiData(stateDataToSet);
      }
    } catch (error) {
      console.error("Error koneksi:", error);
    } finally {
      setLoadingRealisasi(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRealisasiDetail();
    }
  }, [id, fetchRealisasiDetail]);

  const handleRealisasiChange = (e) => {
    const { name, value } = e.target;
    if (name === "catatan_perubahan") {
      setCatatanPerubahan(value);
    } else {
      setRealisasiData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveRealisasi = async () => {
    if (!catatanPerubahan || catatanPerubahan.trim() === "") {
      alert("Catatan perubahan belum diisi. Mohon tuliskan alasannya.");
      return;
    }
    setLoadingRealisasi(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        realisasi_jumlah_total_tanaman:
          parseInt(realisasiData.jumlahTotalTanaman) || 0,
        realisasi_jumlah_tanaman_per_ha:
          parseInt(realisasiData.jumlahTanamanPerHa) || 0,
        realisasi_jarak_tanam: realisasiData.jarakTanam,
        realisasi_jarak_tanam_lainnya:
          realisasiData.jarakTanam === "Lainnya"
            ? realisasiData.jarakTanamLainnya
            : null,
        catatan_perubahan: catatanPerubahan,

        created_at: new Date().toISOString(),
      };

      const baseUrl = API_ENDPOINTS?.FARM?.PETANI?.AMBIL_RENCANA_TANAM
        ? API_ENDPOINTS.FARM.PETANI.AMBIL_RENCANA_TANAM
        : `${API_BASE_URLS.FARM}/farm/me/blok`;
      const endpoint = `${baseUrl}/${id}/realisasi`;

      const response = await fetch(endpoint, {
        method: "POST", // Pastikan Backend memang pakai POST (bukan PUT/PATCH)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Realisasi disimpan & Diperbarui!");
        await fetchRealisasiDetail();
        setIsEditingRealisasi(false);
        setCatatanPerubahan("");
      } else {
        // --- 3. PERBAIKAN: LOGIKA CERDAS PENANGKAP ERROR PYDANTIC BACKEND ---
        const errData = await response.json();
        console.error("Detail Error dari Backend:", errData);

        // Jika error berasal dari validasi Pydantic FastAPI (biasanya bentuknya Array)
        if (errData.detail && Array.isArray(errData.detail)) {
          const pesanError = errData.detail
            .map(
              (err) => `- Field "${err.loc[err.loc.length - 1]}": ${err.msg}`,
            )
            .join("\n");
          alert(
            `Gagal menyimpan! Format data ditolak Backend:\n\n${pesanError}`,
          );
        } else {
          // Error string biasa
          alert(
            `Gagal: ${errData.detail || errData.message || "Terjadi kesalahan."}`,
          );
        }
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setLoadingRealisasi(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 min-h-screen font-sans text-black pb-24">
      {/* HEADER NAVIGASI */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#EF8523] transition px-2 py-1.5 rounded-lg hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5" /> Kembali
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* TITLE PAGE */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-5 sm:mb-8 border-b border-gray-200 pb-3">
          <div className="flex-1 flex items-center gap-3">
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg text-green-700">
              <ClipboardCheck className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-green-700 leading-tight">
                Catat Realisasi Tanam
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Catat realisasi tanam dari blok anda. Pastikan data yang dicatat
                sesuai dengan kondisi lapangan.
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto mt-2 sm:mt-0 bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-[10px] sm:text-sm shadow-sm font-medium tracking-wide">
            {/* <-- PERBAIKAN 2: Ubah unitData menjadi unit karena nama state-nya adalah unit --> */}
            Unit: {unit || "..."}
          </span>
        </div>

        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          {loadingRealisasi ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start mb-5 gap-3">
                <div className="flex items-start gap-2 bg-blue-50 text-blue-700 p-3 rounded-lg text-xs sm:text-sm border border-blue-100 w-full md:w-auto">
                  <AlertCircle className="w-4 h-4 sm:w-5 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Berikut ini data dari Input Data Blok. Mandor wajib mencatat
                    realisasi jika terjadi perubahan data lapangan dengan Klik{" "}
                    <span className="font-bold">Catat Realisasi</span>.
                  </p>
                </div>
                {!isEditingRealisasi && (
                  <button
                    onClick={() => setIsEditingRealisasi(true)}
                    className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition shadow-sm active:scale-95"
                  >
                    <Edit className="w-4 h-4" /> Catat Realisasi
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-6 text-sm">
                <div className="space-y-3">
                  <ReadOnlyField
                    label="1. Nama Unit"
                    value={realisasiData.namaUnit || "-"}
                  />
                  <ReadOnlyField
                    label="2. Jenis Tanah"
                    value={realisasiData.jenisTanah || "-"}
                  />
                  <ReadOnlyField
                    label="3. Tanggal Tanam"
                    value={realisasiData.tanggalTanam || "-"}
                  />
                  <EditableField
                    label="4. Jumlah Tanaman / Ha"
                    name="jumlahTanamanPerHa"
                    value={realisasiData.jumlahTanamanPerHa}
                    onChange={handleRealisasiChange}
                    disabled={!isEditingRealisasi}
                  />
                </div>
                <div className="space-y-3">
                  <ReadOnlyField
                    label="5. Luas Unit"
                    value={realisasiData.luasUnit || "-"}
                  />
                  <ReadOnlyField
                    label="6. Jenis Bibit"
                    value={realisasiData.jenisBibit || "-"}
                  />
                  <ReadOnlyField
                    label="7. Jenis Lahan"
                    value={realisasiData.jenisLahan || "-"}
                  />
                  <EditableField
                    label="8. Total Bibit / Tanaman"
                    name="jumlahTotalTanaman"
                    value={realisasiData.jumlahTotalTanaman}
                    onChange={handleRealisasiChange}
                    disabled={!isEditingRealisasi}
                  />
                  <EditableSelectField
                    label="9. Jarak Tanam"
                    name="jarakTanam"
                    value={realisasiData.jarakTanam}
                    onChange={handleRealisasiChange}
                    disabled={!isEditingRealisasi}
                    options={[
                      { value: "8x9", label: "8 x 9 Meter" },
                      { value: "9x9", label: "9 x 9 Meter" },
                      { value: "7x9", label: "7 x 9 Meter" },
                      { value: "Lainnya", label: "Lainnya" },
                    ]}
                  />
                  {realisasiData.jarakTanam === "Lainnya" && (
                    <div className="mt-3">
                      <EditableField
                        label="Tuliskan Jarak Tanam"
                        name="jarakTanamLainnya"
                        value={realisasiData.jarakTanamLainnya}
                        onChange={handleRealisasiChange}
                        disabled={!isEditingRealisasi}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* --- UI INFORMASI RIWAYAT REALISASI --- */}
              {realisasiData.catatanPerubahanTerakhir && (
                <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-xl animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                      <History className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] sm:text-xs font-bold text-orange-800 uppercase tracking-wider mb-1">
                        Riwayat Perubahan Terakhir
                      </p>
                      <p className="text-xs sm:text-sm text-orange-900 font-medium italic">
                        "{realisasiData.catatanPerubahanTerakhir}"
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-orange-400 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Disimpan pada:{" "}
                        {new Date(realisasiData.waktuPencatatan).toLocaleString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isEditingRealisasi && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-[#B5302D] mb-2">
                    Catatan Perubahan{" "}
                    <span className="text-[10px] font-normal text-gray-500">
                      (Wajib, min. 10 karakter)
                    </span>
                  </label>
                  <textarea
                    name="catatan_perubahan"
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#EF8523] outline-none transition"
                    placeholder="Alasan perubahan..."
                    value={catatanPerubahan}
                    onChange={handleRealisasiChange}
                  ></textarea>
                  <div className="flex flex-col-reverse sm:flex-row justify-end mt-4 gap-3">
                    <button
                      onClick={() => {
                        setIsEditingRealisasi(false);
                        setCatatanPerubahan("");
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 rounded-lg border border-gray-200 transition"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveRealisasi}
                      className="w-full sm:w-auto bg-[#B5302D] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 hover:bg-[#B5302D]/80 transition shadow-md active:scale-95"
                    >
                      <Save className="w-4 h-4" /> Simpan Realisasi
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// === HELPER KOMPONEN KECIL ===
function ReadOnlyField({ label, value }) {
  return (
    <div>
      <p className="text-black font-bold text-[11px] sm:text-xs mb-1.5 truncate">
        {label}
      </p>
      <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-gray-600 cursor-not-allowed">
        {value}
      </div>
    </div>
  );
}

function EditableField({ label, value, onChange, name, disabled }) {
  return (
    <div>
      <p className="text-black font-bold text-[11px] sm:text-xs mb-1.5 flex justify-between items-center">
        <span className="truncate">{label}</span>
        {!disabled && (
          <span className="text-[9px] text-red-600 font-medium bg-red-50 px-1.5 py-0.5 border border-red-100 rounded animate-pulse">
            Wajib
          </span>
        )}
      </p>
      <input
        type="text"
        name={name}
        disabled={disabled}
        className={`w-full border rounded-lg px-3 py-2.5 text-xs sm:text-sm outline-none transition-all duration-200 ${
          disabled
            ? "bg-gray-50 border-gray-200 text-gray-400"
            : "bg-white border-gray-300 focus:ring-2 focus:ring-[#EF8523] text-black shadow-sm"
        }`}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function EditableSelectField({
  label,
  value,
  onChange,
  name,
  disabled,
  options,
}) {
  return (
    <div>
      <p className="text-black font-bold text-[11px] sm:text-xs mb-1.5 flex justify-between items-center">
        <span className="truncate">{label}</span>
        {!disabled && (
          <span className="text-[9px] text-red-600 font-medium bg-red-50 px-1.5 py-0.5 border border-red-100 rounded animate-pulse">
            Wajib
          </span>
        )}
      </p>
      <select
        name={name}
        disabled={disabled}
        className={`w-full border rounded-lg px-3 py-2.5 text-xs sm:text-sm outline-none transition-all duration-200 ${
          disabled
            ? "bg-gray-50 border-gray-200 text-gray-400 appearance-none"
            : "bg-white border-gray-300 focus:ring-2 focus:ring-[#EF8523] text-black shadow-sm"
        }`}
        value={value || ""}
        onChange={onChange}
      >
        <option value="" disabled>
          -- Pilih {label.split(". ")[1]} --
        </option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
