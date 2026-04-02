import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../../config/constants";
import { toast } from "react-hot-toast";
import { Loader2, ArrowLeft } from "lucide-react";

export default function LuasLahan() {
  const navigate = useNavigate();

  // === STATE UTAMA ===
  const [step, setStep] = useState(1);
  const [processId, setProcessId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // === STATE FORM ===
  const [form, setForm] = useState({
    membukaLahan: null,
    jenisPelakuUsaha: "",
    sertifikatTanah: null,
    jenisSertifikat: "",
    jenisLainnya: "",
    sedangMengurus: null,
    namaLahan: "",
    jenisTanah: "",
    luasLahan: "",
    tahunPembukaan: "",
    sengketa: null,
    files: {
      kepemilikan_tanah_sah: { status: "idle", name: null },
      proses_kepengurusan_tanah: { status: "idle", name: null },
      stdb: { status: "idle", name: null },
      sppl: { status: "idle", name: null },
      iup_hgu: { status: "idle", name: null },
      sengketa_lahan: { status: "idle", name: null },
      pembukaan_lahan_video: { status: "idle", name: null },
      bukti_penyelesaian_sengketa: { status: "idle", name: null },
    },
  });

  // === FETCH API ===
  const fetchAPI = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    const headers = {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        // PERBAIKAN: Parsing detail error array dari FastAPI (Pydantic)
        let errorMessage = "Terjadi kesalahan server";

        if (data.detail) {
          if (Array.isArray(data.detail)) {
            // Jika error 422 dari Pydantic, gabungkan pesan error agar jelas letak salahnya
            errorMessage = data.detail
              .map(
                (err) =>
                  `Error di field '${err.loc[err.loc.length - 1]}': ${err.msg}`,
              )
              .join(", ");
          } else {
            errorMessage = data.detail;
          }
        } else if (data.message) {
          errorMessage = data.message;
        }

        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  // === CHECK DRAFT (FILE UPLOAD) ===
  useEffect(() => {
    const checkDraft = async () => {
      try {
        const data = await fetchAPI(
          API_ENDPOINTS.FARM.PETANI.LAHAN.CHECK_DRAFT,
        );
        if (data && data.process_id) {
          setProcessId(data.process_id);
          setStep(data.current_step || 1);

          setForm((prev) => {
            const updatedForm = {
              ...prev,
              jenisPelakuUsaha:
                data.jenis_pelaku_usaha || prev.jenisPelakuUsaha,
              membukaLahan:
                data.membuka_lahan_baru !== undefined &&
                data.membuka_lahan_baru !== null
                  ? data.membuka_lahan_baru
                  : prev.membukaLahan,
              sertifikatTanah:
                data.punya_dokumen_sah !== undefined &&
                data.punya_dokumen_sah !== null
                  ? data.punya_dokumen_sah
                  : prev.sertifikatTanah,
              jenisSertifikat: data.jenis_sertifikat || prev.jenisSertifikat,
              jenisLainnya: data.jenis_sertifikat_lainnya || prev.jenisLainnya,
              sedangMengurus:
                data.sedang_mengurus !== undefined &&
                data.sedang_mengurus !== null
                  ? data.sedang_mengurus
                  : prev.sedangMengurus,
              jenisTanah: data.jenis_tanah || prev.jenisTanah,
              // Backend sekarang akan mengirim field nama_lahan_mineral juga
              namaLahan:
                data.nama_lahan_mineral ||
                data.nama_lahan_gambut ||
                prev.namaLahan,
              luasLahan: data.luas_tanah || prev.luasLahan,
              tahunPembukaan: data.tahun_buka_lahan || prev.tahunPembukaan,
              sengketa:
                data.ada_sengketa !== undefined && data.ada_sengketa !== null
                  ? data.ada_sengketa
                  : prev.sengketa,
            };

            // Iterasi data.dokumen sebagai List of Objects sesuai response schema dari Backend
            if (data.dokumen && Array.isArray(data.dokumen)) {
              data.dokumen.forEach((docObj) => {
                if (updatedForm.files[docObj.tipe_dokumen]) {
                  updatedForm.files[docObj.tipe_dokumen] = {
                    status: "success",
                    name: "File tersimpan di server",
                  };
                }
              });
            }
            return updatedForm;
          });

          toast.success("Melanjutkan draft pendaftaran sebelumnya.");
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Info Draft Error:", error);
        }
      }
    };
    checkDraft();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrorMsg("");
  };

  // === SUBMIT STEP 1 ===
  const submitStep1 = async () => {
    if (!form.jenisPelakuUsaha)
      return toast.error("Pilih jenis pelaku usaha terlebih dahulu!");
    if (form.membukaLahan === null)
      return toast.error("Pilih jawaban membuka lahan terlebih dahulu!");

    setIsLoading(true);
    try {
      let currentId = processId;
      if (!currentId) {
        const resStart = await fetchAPI(
          API_ENDPOINTS.FARM.PETANI.LAHAN.START_PROCESS,
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );
        currentId = resStart.process_id || resStart.id;
        setProcessId(currentId);
      }

      await fetchAPI(API_ENDPOINTS.FARM.PETANI.LAHAN.STEP_1(currentId), {
        method: "PATCH",
        body: JSON.stringify({
          membuka_lahan_baru: form.membukaLahan,
          jenis_pelaku_usaha: form.jenisPelakuUsaha,
        }),
      });
      setStep(2);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan Step 1");
    } finally {
      setIsLoading(false);
    }
  };

  // === SUBMIT STEP 2 & 3 ===
  const submitStep2And3 = async () => {
    if (form.sertifikatTanah === null)
      return toast.error("Pilih status kepemilikan!");
    if (form.sertifikatTanah === true && !form.jenisSertifikat)
      return toast.error("Pilih jenis sertifikat!");

    // PERBAIKAN FATAL 1: Menggunakan TitleCase "Bukti Lainnya" persis dengan Enum JenisSertifikatTanah di Pydantic BE
    if (
      form.sertifikatTanah === true &&
      form.jenisSertifikat === "Bukti Lainnya" &&
      !form.jenisLainnya.trim()
    )
      return toast.error("Harap sebutkan jenis sertifikat lainnya!");

    if (form.sertifikatTanah === false && form.sedangMengurus === null)
      return toast.error("Jawab status kepengurusan dokumen!");

    setIsLoading(true);
    setErrorMsg("");

    try {
      await fetchAPI(API_ENDPOINTS.FARM.PETANI.LAHAN.STEP_2(processId), {
        method: "PATCH",
        body: JSON.stringify({ punya_dokumen_sah: form.sertifikatTanah }),
      });

      if (form.sertifikatTanah === true) {
        await fetchAPI(
          API_ENDPOINTS.FARM.PETANI.LAHAN.STEP_SERTIFIKAT(processId),
          {
            method: "PATCH",
            body: JSON.stringify({
              jenis_sertifikat: form.jenisSertifikat,
              // Update payload "Bukti Lainnya" di sini
              jenis_sertifikat_lainnya:
                form.jenisSertifikat === "Bukti Lainnya"
                  ? form.jenisLainnya.trim()
                  : null,
            }),
          },
        );
        setStep(3);
      } else {
        await fetchAPI(API_ENDPOINTS.FARM.PETANI.LAHAN.STEP_3(processId), {
          method: "PATCH",
          body: JSON.stringify({ sedang_mengurus: form.sedangMengurus }),
        });
        setStep(3);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.status === 400 &&
        form.sedangMengurus === false
      ) {
        const pesanISPO =
          "Maaf, lahan Anda tidak memenuhi standar ISPO karena tidak memiliki dokumen sah dan tidak dalam proses pengurusan. Proses pendaftaran lahan dihentikan. Anda akan dialihkan ke Dashboard Utama...";
        setErrorMsg(pesanISPO);
        toast.error("Gagal Memenuhi Persyaratan ISPO", { duration: 10000 });
        setTimeout(() => navigate("/petani/dashboard"), 10000);
      } else {
        console.error(error);
        toast.error(error.message || "Terjadi kesalahan pada server");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // === SUBMIT STEP 3 ===
  const submitStep3 = async () => {
    if (
      form.sertifikatTanah === true &&
      form.files.kepemilikan_tanah_sah.status !== "success"
    ) {
      return toast.error("Mohon upload sertifikat tanah terlebih dahulu.");
    }
    if (
      form.sedangMengurus === true &&
      form.files.proses_kepengurusan_tanah.status !== "success"
    ) {
      return toast.error(
        "Mohon upload bukti pengurusan dokumen terlebih dahulu.",
      );
    }
    setStep(4);
  };

  // === SUBMIT STEP 4 ===
  const submitStep4 = async () => {
    const isSengketaValid = form.sengketa !== null;
    if (
      !form.namaLahan ||
      !form.jenisTanah ||
      !form.luasLahan ||
      !form.tahunPembukaan ||
      !isSengketaValid
    ) {
      return toast.error("Harap lengkapi semua field yang wajib diisi!");
    }

    const luasLahanBersih = form.luasLahan.toString().replace(",", ".");
    const luasParse = Number(luasLahanBersih);
    const tahunParse = parseInt(form.tahunPembukaan);

    if (isNaN(luasParse) || luasParse <= 0)
      return toast.error(
        "Penulisan Luas lahan tidak valid! Harus berupa angka murni (misal: 3.5).",
      );
    if (isNaN(tahunParse) || tahunParse < 1900 || tahunParse > 2100)
      return toast.error("Tahun pembukaan tidak valid!");

    if (form.jenisPelakuUsaha === "PEKEBUN" && luasParse > 25) {
      return toast.error(
        "Luas lahan melebihi 25 Ha. Sesuai Permentan NO.98/2013, mohon mendaftar sebagai Perusahaan jika memiliki lahan lebih dari 25 Ha.",
      );
    }

    setIsLoading(true);

    try {
      // Pembentukan Payload
      const payloadStep4 = {
        jenis_tanah: form.jenisTanah, // Gunakan format asli sesuai BE
        luas_tanah: luasParse,
        tahun_buka_lahan: tahunParse,
        nama_lahan_mineral:
          form.jenisTanah === "Mineral" ? form.namaLahan.trim() : null,
        nama_lahan_gambut:
          form.jenisTanah === "Gambut" ? form.namaLahan.trim() : null,
      };

      // 1. Eksekusi Step 4 (Wajib pakai "await")
      // Ini akan membuat sistem menunggu respon dari BE (sampai db.commit selesai)
      await fetchAPI(API_ENDPOINTS.FARM.PETANI.LAHAN.STEP_4(processId), {
        method: "PATCH",
        body: JSON.stringify(payloadStep4),
      });

      // 2. Eksekusi Step 5 (Wajib pakai "await")
      // Baris ini HANYA AKAN berjalan setelah Step 4 di atas sukses (status 200 OK)
      await fetchAPI(API_ENDPOINTS.FARM.PETANI.LAHAN.STEP_5(processId), {
        method: "PATCH",
        body: JSON.stringify({
          ada_sengketa: form.sengketa,
        }),
      });

      // Jika keduanya sukses tanpa terlempar ke catch, pindah ke step upload dokumen
      setStep(5);
    } catch (error) {
      if (error.message && error.message.includes("25")) {
        setErrorMsg(error.message);
      } else {
        console.error(error);
        toast.error(
          error.message ||
            "Data tidak valid secara sistem. Cek kembali input Anda.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // === SUBMIT FINAL ===
  const submitFinal = async () => {
    if (form.sengketa === true) {
      if (form.files.sengketa_lahan.status !== "success") {
        return toast.error("Wajib upload Bukti Sengketa.");
      }
    }

    if (
      form.jenisPelakuUsaha === "PEKEBUN" &&
      form.files.stdb.status !== "success"
    ) {
      return toast.error("Wajib upload STDB (Khusus Petani Swadaya).");
    }
    if (
      form.jenisPelakuUsaha === "PERUSAHAAN" &&
      form.files.iup_hgu.status !== "success"
    ) {
      return toast.error("Wajib upload IUP/HGU (Khusus Perusahaan).");
    }
    if (form.files.sppl.status !== "success")
      return toast.error("Wajib upload SPPL.");

    if (form.membukaLahan === true) {
      if (form.files.pembukaan_lahan_video.status !== "success") {
        return toast.error("Wajib upload bukti/video pembukaan lahan.");
      }
    }

    setIsLoading(true);
    try {
      await fetchAPI(API_ENDPOINTS.FARM.PETANI.LAHAN.FINALISASI(processId), {
        method: "POST",
        body: JSON.stringify({}),
      });

      toast.success("Proses pendaftaran lahan berhasil disimpan!", {
        duration: 5000,
        style: { padding: "16px" },
      });

      setTimeout(() => navigate("/petani/dashboard"), 5000);
    } catch (error) {
      console.error(error);
      toast.error("Gagal finalisasi data. Server mengalami gangguan.");
    } finally {
      setIsLoading(false);
    }
  };

  // === FUNGSI UPLOAD ===
  const handleUpload = async (type, file) => {
    if (!processId) return toast.error("ID Proses tidak ditemukan.");
    if (!file) return;

    // Filter Ekstensi & Ukuran File
    const allowedTypes = [
      "application/pdf",
      "video/mp4",
      "video/avi",
      "image/jpeg",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      return toast.error(
        `Tipe file tidak diizinkan. Hanya PDF, JPG, PNG, atau Video (MP4/AVI).`,
      );
    }

    const isVideo = file.type === "video/mp4" || file.type === "video/avi";
    const maxSizeMB = isVideo ? 50 : 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return toast.error(`Ukuran file maksimal ${maxSizeMB}MB!`);
    }
    setForm((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [type]: { ...prev.files[type], status: "uploading" },
      },
    }));

    const formData = new FormData();
    formData.append("f", file);
    formData.append("kategori_folder", "legalitas_lahan");

    try {
      await fetchAPI(
        API_ENDPOINTS.FARM.PETANI.LAHAN.UPLOAD_DOC(processId, type),
        {
          method: "POST",
          body: formData,
        },
      );
      setForm((prev) => ({
        ...prev,
        files: {
          ...prev.files,
          [type]: { status: "success", name: file.name },
        },
      }));
      toast.success(`Upload berhasil`);
    } catch (error) {
      console.error(error);
      setForm((prev) => ({
        ...prev,
        files: { ...prev.files, [type]: { status: "failed", name: null } },
      }));
      toast.error("Gagal upload file.");
    }
  };

  const UploadInput = ({ label, type, required = false, helperText }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mt-3 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex-1 w-full">
        <p className="text-xs sm:text-sm font-semibold text-gray-800">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
        {helperText && (
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1 italic">
            ℹ️ {helperText}
          </p>
        )}
        <input
          type="file"
          onChange={(e) => handleUpload(type, e.target.files[0])}
          className="mt-2 block w-full text-xs sm:text-sm text-gray-500
            file:mr-3 file:py-1.5 file:px-3 file:rounded-md
            file:border-0 file:text-xs file:font-semibold
            file:bg-red-50 file:text-[#B5302D]
            hover:file:bg-red-100 cursor-pointer transition-colors"
        />
      </div>
      <div className="mt-3 sm:mt-0 sm:ml-4 flex flex-col items-start sm:items-end min-w-[90px] text-xs font-medium">
        {form.files[type]?.status === "uploading" && (
          <span className="text-yellow-600 animate-pulse flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1 rounded-full">
            <Loader2 className="animate-spin" size={12} /> Uploading
          </span>
        )}
        {form.files[type]?.status === "success" && (
          <>
            <span className="text-green-600 font-bold bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              ✔ Sukses
            </span>
            <span
              className="text-[10px] text-gray-500 mt-1.5 truncate max-w-[150px] sm:max-w-[200px]"
              title={form.files[type]?.name}
            >
              📄 {form.files[type]?.name}
            </span>
          </>
        )}
        {form.files[type]?.status === "failed" && (
          <span className="text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            ❌ Gagal
          </span>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="max-w-3xl mx-auto mb-4 mt-6 sm:mt-8 px-2 sm:px-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#EF8523] transition px-2 py-1.5 rounded-md hover:bg-gray-100 w-fit"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Kembali
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white shadow-md sm:shadow-lg rounded-xl border border-gray-100 mb-8">
        {/* --- PROGRESS BAR STEPPER --- */}
        <div className="relative flex justify-between items-center mb-8 px-2 sm:px-6">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 sm:h-1 bg-gray-200 z-0 rounded-full"></div>
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm ${step >= s ? "bg-[#B5302D] text-white ring-2 sm:ring-4 ring-red-50" : "bg-white text-gray-400 border-2 border-gray-200"}`}
              >
                {s}
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-center text-[#B5302D] mb-6 px-2">
          {step === 1 && "Detail Profil dan Pendaftaran Lahan"}
          {step === 2 && "Status Kepemilikan Lahan"}
          {step === 3 && "Upload Dokumen Kepemilikan"}
          {step === 4 && "Detail Data Lahan"}
          {step === 5 && "Upload Dokumen Pendukung"}
        </h2>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded-lg mb-6 text-xs sm:text-sm shadow-sm">
            <strong className="block mb-1">Perhatian:</strong> {errorMsg}
          </div>
        )}

        {/* --- STEP 1 --- */}
        {step === 1 && (
          <div className="space-y-6 sm:space-y-7">
            <div>
              <p className="text-sm font-medium text-gray-800 mb-3 text-center sm:text-left">
                Anda mendaftar sebagai Petani Swadaya atau Perusahaan?{" "}
                <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center sm:justify-start">
                <button
                  onClick={() => handleChange("jenisPelakuUsaha", "PEKEBUN")}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${form.jenisPelakuUsaha === "PEKEBUN" ? "bg-[#B5302D] text-white border-[#B5302D] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                >
                  Petani Swadaya
                </button>
                <button
                  onClick={() => handleChange("jenisPelakuUsaha", "PERUSAHAAN")}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${form.jenisPelakuUsaha === "PERUSAHAAN" ? "bg-[#B5302D] text-white border-[#B5302D] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                >
                  Perusahaan
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800 mb-3 text-center sm:text-left">
                Apakah Anda sedang membuka lahan baru?{" "}
                <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center sm:justify-start">
                <button
                  onClick={() => handleChange("membukaLahan", true)}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${form.membukaLahan === true ? "bg-[#B5302D] text-white border-[#B5302D] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                >
                  YA, Saya Membuka
                </button>
                <button
                  onClick={() => handleChange("membukaLahan", false)}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${form.membukaLahan === false ? "bg-[#B5302D] text-white border-[#B5302D] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                >
                  TIDAK
                </button>
              </div>
            </div>

            <div className="pt-4 sm:pt-5">
              <button
                onClick={submitStep1}
                disabled={isLoading}
                className="bg-[#B5302D] text-white px-5 py-2.5 rounded-lg w-full flex justify-center items-center font-medium text-sm shadow hover:bg-[#9a2826] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />{" "}
                    Memproses...
                  </>
                ) : (
                  "Lanjut"
                )}
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 2 --- */}
        {step === 2 && (
          <div className="space-y-4 sm:space-y-5">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-sm font-medium text-gray-800 mb-3 text-center sm:text-left">
                Apakah tanah memiliki dokumen sah?
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    handleChange("sertifikatTanah", true);
                    handleChange("sedangMengurus", null);
                  }}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${form.sertifikatTanah === true ? "bg-[#B5302D] text-white border-[#B5302D] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                >
                  Ya, Punya
                </button>
                <button
                  onClick={() => {
                    handleChange("sertifikatTanah", false);
                    handleChange("jenisSertifikat", "");
                  }}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${form.sertifikatTanah === false ? "bg-[#B5302D] text-white border-[#B5302D] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                >
                  Tidak Punya
                </button>
              </div>
            </div>

            {form.sertifikatTanah === true && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Pilih Jenis Sertifikat
                </label>
                <select
                  value={form.jenisSertifikat}
                  onChange={(e) =>
                    handleChange("jenisSertifikat", e.target.value)
                  }
                  className="mt-1.5 block w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#B5302D] focus:border-[#B5302D] outline-none transition-all text-sm"
                >
                  <option value="">-- Pilih Sertifikat --</option>
                  <option value="SHM">Sertifikat Hak Milik (SHM)</option>
                  <option value="Girik">Girik</option>
                  <option value="Akta">Akta</option>
                  <option value="Akta Jual Beli Tanah">
                    Akta Jual Beli Tanah
                  </option>{" "}
                  <option value="Bukti Lainnya">Lainnya</option>{" "}
                </select>

                {form.jenisSertifikat === "Lainnya" && (
                  <input
                    type="text"
                    placeholder="Sebutkan jenis sertifikat lainnya..."
                    value={form.jenisLainnya}
                    onChange={(e) =>
                      handleChange("jenisLainnya", e.target.value)
                    }
                    className="mt-2.5 block w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#B5302D] focus:border-[#B5302D] outline-none transition-all text-sm"
                  />
                )}
              </div>
            )}

            {form.sertifikatTanah === false && (
              <div className="mt-3 p-4 bg-yellow-50 border border-yellow-100 rounded-lg animate-in fade-in slide-in-from-top-2">
                <p className="text-sm font-medium text-gray-800 mb-3 text-center sm:text-left">
                  Apakah saat ini sedang dalam proses pengurusan dokumen?
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => handleChange("sedangMengurus", true)}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${form.sedangMengurus === true ? "bg-yellow-600 text-white border-yellow-600 shadow-sm" : "bg-white text-gray-600 border-yellow-200 hover:bg-yellow-100"}`}
                  >
                    Ya, Sedang Diurus
                  </button>
                  <button
                    onClick={() => handleChange("sedangMengurus", false)}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${form.sedangMengurus === false ? "bg-yellow-600 text-white border-yellow-600 shadow-sm" : "bg-white text-gray-600 border-yellow-200 hover:bg-yellow-100"}`}
                  >
                    Belum Diurus
                  </button>
                </div>
              </div>
            )}

            <div className="pt-3">
              <button
                onClick={submitStep2And3}
                disabled={isLoading}
                className="bg-[#B5302D] text-white px-5 py-2.5 rounded-lg w-full flex justify-center items-center font-medium text-sm shadow hover:bg-[#9a2826] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />{" "}
                    Memproses...
                  </>
                ) : (
                  "Lanjut"
                )}
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3 --- */}
        {step === 3 && (
          <div className="space-y-4 sm:space-y-5">
            {form.sertifikatTanah === true ? (
              <UploadInput
                label="Upload Dokumen Kepemilikan (Sertifikat)"
                type="kepemilikan_tanah_sah"
                required={true}
              />
            ) : (
              <UploadInput
                label="Upload Bukti Proses Pengurusan Dokumen"
                type="proses_kepengurusan_tanah"
                required={true}
              />
            )}

            <div className="pt-3">
              <button
                onClick={submitStep3}
                className="bg-[#B5302D] text-white px-5 py-2.5 rounded-lg w-full flex justify-center items-center font-medium text-sm shadow hover:bg-[#9a2826] transition-all duration-200"
              >
                Lanjut
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 4 --- */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Nama Lahan/Kebun/Unit
              </label>
              <input
                type="text"
                value={form.namaLahan}
                onChange={(e) => handleChange("namaLahan", e.target.value)}
                placeholder="Contoh: Unit/blok 32"
                className="mt-1.5 block w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#B5302D] focus:border-[#B5302D] outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Jenis Tanah
              </label>
              {/* PERBAIKAN VALUE DIKEMBALIKAN KE TITLECASE MENYESUAIKAN PYDANTIC BE */}
              <select
                value={form.jenisTanah}
                onChange={(e) => handleChange("jenisTanah", e.target.value)}
                className="mt-1.5 block w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#B5302D] focus:border-[#B5302D] outline-none transition-all text-sm"
              >
                <option value="">Pilih Jenis Tanah</option>
                <option value="Mineral">Tanah Mineral</option>
                <option value="Gambut">Tanah Gambut</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Luas Tanah (Hektar)
                </label>
                <input
                  type="text"
                  value={form.luasLahan}
                  onChange={(e) => handleChange("luasLahan", e.target.value)}
                  placeholder="Contoh: 3.5"
                  className="mt-1.5 block w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#B5302D] focus:border-[#B5302D] outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Tahun Pembukaan Lahan
                </label>
                <input
                  type="number"
                  value={form.tahunPembukaan}
                  onChange={(e) =>
                    handleChange("tahunPembukaan", e.target.value)
                  }
                  placeholder="Contoh: 2015"
                  className="mt-1.5 block w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#B5302D] focus:border-[#B5302D] outline-none transition-all text-sm"
                />
              </div>
            </div>

            {form.jenisTanah !== "" && (
              <div className="mt-5 bg-gray-50 p-4 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-gray-800 text-center sm:text-left">
                  Apakah lahan sedang dalam sengketa?
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5 mt-3">
                  <button
                    onClick={() => handleChange("sengketa", true)}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${
                      form.sengketa === true
                        ? "bg-red-600 text-white border-red-600 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-red-50"
                    }`}
                  >
                    Ya, Ada Sengketa
                  </button>
                  <button
                    onClick={() => handleChange("sengketa", false)}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${
                      form.sengketa === false
                        ? "bg-green-600 text-white border-green-600 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-green-50"
                    }`}
                  >
                    Tidak Ada
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={submitStep4}
                disabled={isLoading}
                className="bg-[#B5302D] text-white px-5 py-2.5 rounded-lg w-full flex justify-center items-center font-medium text-sm shadow hover:bg-[#9a2826] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />{" "}
                    Memproses...
                  </>
                ) : (
                  "Lanjut Upload Dokumen"
                )}
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 5 --- */}
        {step === 5 && (
          <div className="space-y-3 sm:space-y-4">
            {form.sengketa === true && (
              <UploadInput
                label="Bukti Sengketa"
                type="sengketa_lahan"
                required={true}
              />
            )}

            {form.jenisPelakuUsaha === "PEKEBUN" ? (
              <UploadInput
                label="Surat Tanda Daftar Budidaya (STDB)"
                type="stdb"
                required={true}
              />
            ) : (
              <UploadInput
                label="Izin Usaha Perkebunan (IUP/HGU)"
                type="iup_hgu"
                required={true}
              />
            )}

            <UploadInput
              label="Surat Pernyataan Pengelolaan Lingkungan (SPPL)"
              type="sppl"
              required={true}
            />

            {form.membukaLahan === true && (
              <UploadInput
                label="Dokumentasi Buka Lahan (Video)"
                type="pembukaan_lahan_video"
                required={true}
              />
            )}

            <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
              <button
                onClick={() => setStep(4)}
                className="w-full sm:w-auto text-gray-500 font-medium text-sm py-2.5 px-5 hover:bg-gray-50 rounded-lg transition-all"
              >
                Kembali
              </button>
              <button
                onClick={submitFinal}
                disabled={isLoading}
                className="w-full sm:w-auto bg-green-600 text-white px-8 py-2.5 rounded-lg font-medium shadow-md hover:bg-green-700 transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />{" "}
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Data Final"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
