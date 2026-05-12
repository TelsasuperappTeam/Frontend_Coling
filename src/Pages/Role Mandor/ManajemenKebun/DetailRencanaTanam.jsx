import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_ENDPOINTS, API_BASE_URLS } from "../../../config/constants";
import { ArrowLeft, Eye, AlertTriangle, Loader2 } from "lucide-react";

const ENUM_DRAINASE = [
  "Field Drain",
  "Collection Drain",
  "Main Drain",
  "Outlet Drain",
  "Parit Jalan",
  "Lainnya",
];

const ENUM_TERASERING = [
  "Teras bangku",
  "Teras Tapak Kuda",
  "Teras kontur",
  "Lainnya",
];

// (BE MAHARANI) Mapping Value UI -> BE Pydantic Enum
const MAPPING_LAPISAN_MINERAL = {
  "Pasir kuarsa": "pasir_kuarsa",
  Liat: "tanah_mineral_lainnya",
  "Tanah Mineral": "tanah_mineral_lainnya",
  Lainnya: "tanah_mineral_lainnya",
};

const MAPPING_KEMATANGAN_GAMBUT = {
  Sapirik: "sapirik",
  Hemik: "hemik",
  Fibrik: "fibrik",
};

export default function DetailRencanaTanam() {
  const navigate = useNavigate();
  const { id } = useParams();

  // === STATE DATA ===
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // === STATE DATA TAMBAHAN ===
  const [listLahanGambut, setListLahanGambut] = useState([]);
  const [listLahanMineral, setListLahanMineral] = useState([]);
  const [listInventarisBibit, setListInventarisBibit] = useState([]);

  // === STATE FORM PENGAJUAN KEMBALI ===
  const [showPengajuan, setShowPengajuan] = useState(false);
  const [formData, setFormData] = useState({
    nama_unit: "",
    jenis_tanah: "",
    tanggal_tanam_blok: "",
    luas_unit: "",
    jenis_bibit: "",
    varietas_bibit_nama: "",
    jumlah_total_tanaman: "",
    jumlah_tanaman_per_ha: "",
    jenis_lahan: "",
    jarak_tanam: "",
    jarak_tanam_lainnya: "",
    jenis_terasering: "",
    jenis_drainase: "",
    dok_bukti_terasering_url: null,
    dok_bukti_drainase_url: null,

    // STATE UNTUK KERANJANG DAN GAMBUT
    gambut_lapisan_mineral: [],
    gambut_kematangan: [],
    keranjang_lahan_gambut: [],
    keranjang_lahan_mineral: [],
  });

  const [fileTerasering, setFileTerasering] = useState(null);
  const [fileDrainase, setFileDrainase] = useState(null);

  // === HELPER URL GAMBAR ===
  const getFileUrl = (path) => {
    if (!path) return "#";
    if (path.startsWith("http") || path.startsWith("https")) {
      return path;
    }
    const baseUrl = API_BASE_URLS.FARM?.replace(/\/+$/, "") || "";
    const cleanPath = path.replace(/^\/+/, "");
    return `${baseUrl}/${cleanPath}`;
  };

  // --- FETCH LAHAN USER ---
  const fetchLahanUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URLS.FARM}/farm/me/lahan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        if (data && Array.isArray(data.lahan_gambut)) {
          setListLahanGambut(data.lahan_gambut);
        } else if (Array.isArray(data)) {
          setListLahanGambut(data);
        }
        if (data && data.lahan_mineral) {
          const mineralData =
            data.lahan_mineral.detail_batch || data.lahan_mineral;
          setListLahanMineral(Array.isArray(mineralData) ? mineralData : []);
        }
      }
    } catch (error) {
      console.error("Error fetching lahan:", error);
    }
  };

  // --- FETCH INVENTARIS BIBIT & FETCH DATA DETAIL ---
  useEffect(() => {
    const fetchInventarisBibit = async () => {
      try {
        const response = await fetch(
          API_ENDPOINTS.FARM.PETANI.INVENTARIS.GET_BIBIT,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setListInventarisBibit(data);
        }
      } catch (error) {
        console.error("Error fetching bibit:", error);
      }
    };
    fetchInventarisBibit();
    fetchLahanUser(); // Load lahan dimuka
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");

        const baseUrl = API_ENDPOINTS.FARM.PETANI.AMBIL_RENCANA_TANAM;
        const cleanUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
        const finalUrl = `${cleanUrl}/${id}`;

        const response = await fetch(finalUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Pastikan response sukses (status 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse data JSON dari Backend
        const data = await response.json();

        // --- TAMBAHKAN CONSOLE.LOG DI SINI ---
        console.log("Data Detail Rencana Tanam dari BE:", data);

        if (response.ok) {
          setDetailData(data);

          setFormData((prev) => ({
            ...prev,
            nama_unit: data.nama_unit || "",
            jenis_tanah: data.jenis_tanah || "",
            tanggal_tanam_blok: data.tanggal_tanam_blok || "",
            luas_unit: data.luas_unit || "",
            jenis_bibit: data.jenis_bibit || "",
            jumlah_total_tanaman: data.jumlah_total_tanaman || "",
            jumlah_tanaman_per_ha: data.jumlah_tanaman_per_ha || "",
            jenis_lahan: data.jenis_lahan || "",
            jarak_tanam: data.jarak_tanam || "",
            jenis_terasering: data.jenis_terasering_mineral || "",
            jenis_drainase: data.jenis_drainase_mineral || "",
            dok_bukti_terasering_url: data.dok_bukti_terasering_url || null,
            dok_bukti_drainase_url: data.dok_bukti_drainase_url || null,
          }));
        }
      } catch (error) {
        console.error("Error koneksi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // === HANDLERS ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let newData = { ...prev, [name]: value };

      if (name === "jenis_tanah") {
        fetchLahanUser(); // Refresh data lahan jika jenis tanah berubah
        if (value === "Gambut") {
          newData.jenis_lahan = "Datar";
          newData.jenis_terasering = "";
          newData.jenis_drainase = "";
          newData.keranjang_lahan_mineral = [];
        } else if (value === "Mineral") {
          newData.gambut_lapisan_mineral = [];
          newData.gambut_kematangan = [];
          newData.keranjang_lahan_gambut = [];
          newData.jenis_lahan = "";
        }
      }
      return newData;
    });
  };

  const handleCheckboxGambut = (e, field) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const currentList = prev[field] || [];
      if (checked) return { ...prev, [field]: [...currentList, value] };
      return { ...prev, [field]: currentList.filter((item) => item !== value) };
    });
  };

  const handleJenisLahanChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      jenis_lahan: value,
      jenis_terasering: "",
      jenis_drainase: "",
    }));
    setFileTerasering(null);
    setFileDrainase(null);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "terasering") setFileTerasering(file);
    if (type === "drainase") setFileDrainase(file);
  };

  // === FUNGSI UPDATE ===
  const handleUpdate = async () => {
    if (!formData.nama_unit || !formData.tanggal_tanam_blok) {
      alert("Mohon lengkapi data wajib!");
      return;
    }

    const isGambut = formData.jenis_tanah === "Gambut";
    const isMineral = formData.jenis_tanah === "Mineral";
    const isMiring = formData.jenis_lahan === "Miring";
    const isKonservasi = formData.jenis_lahan === "Konservasi";

    if (isMineral && (isMiring || isKonservasi) && !formData.jenis_terasering) {
      alert(`Wajib memilih Jenis Terasering!`);
      return;
    }
    if (isMineral && isKonservasi && !formData.jenis_drainase) {
      alert("Wajib memilih Jenis Drainase!");
      return;
    }
    if (formData.jenis_bibit === "Tenera" && !formData.varietas_bibit_nama) {
      alert("Untuk bibit Tenera, Nama Varietas wajib diisi!");
      return;
    }

    // VALIDASI KERANJANG
    const targetLuas = parseFloat(formData.luas_unit || 0);
    let totalDiambil = 0;

    if (isMineral) {
      if (formData.keranjang_lahan_mineral.length === 0) {
        alert("Wajib memilih minimal satu Lahan Mineral!");
        return;
      }
      totalDiambil = formData.keranjang_lahan_mineral.reduce(
        (sum, item) => sum + parseFloat(item.luas_diambil || 0),
        0,
      );
    } else if (isGambut) {
      if (formData.keranjang_lahan_gambut.length === 0) {
        alert("Wajib memilih minimal satu Lahan Gambut!");
        return;
      }
      totalDiambil = formData.keranjang_lahan_gambut.reduce(
        (sum, item) => sum + parseFloat(item.luas_diambil || 0),
        0,
      );
      if (formData.gambut_lapisan_mineral.length === 0) {
        alert("Untuk lahan Gambut, wajib memilih Lapisan Mineral!");
        return;
      }
      if (formData.gambut_kematangan.length === 0) {
        alert("Untuk lahan Gambut, wajib memilih Kematangan Gambut!");
        return;
      }
    }

    if (Math.abs(totalDiambil - targetLuas) > 0.01) {
      alert(
        `Total luas lahan yang diambil (${totalDiambil} Ha) tidak sama dengan Luas Unit Blok (${targetLuas} Ha)!`,
      );
      return;
    }

    setLoadingSubmit(true);
    try {
      const token = localStorage.getItem("token");

      const dataPayload = {
        id: parseInt(id),
        lahan_id: detailData?.lahan_id || 1,
        kebun_profile_id: detailData?.kebun_profile_id || 1,

        nama_unit: formData.nama_unit,
        tanggal_tanam_blok: formData.tanggal_tanam_blok,
        luas_unit: parseFloat(formData.luas_unit || 0),
        jumlah_tanaman_per_ha: parseInt(formData.jumlah_tanaman_per_ha || 0),
        jumlah_total_tanaman: parseInt(formData.jumlah_total_tanaman || 0),

        jenis_tanah: formData.jenis_tanah,
        jenis_lahan: isGambut ? "Datar" : formData.jenis_lahan,

        jenis_bibit: formData.jenis_bibit,
        varietas_bibit_nama:
          formData.jenis_bibit === "Tenera"
            ? formData.varietas_bibit_nama
            : null,

        jarak_tanam: formData.jarak_tanam,
        jarak_tanam_lainnya:
          formData.jarak_tanam === "Lainnya"
            ? formData.jarak_tanam_lainnya
            : null,

        // PAYLOAD KERANJANG LAHAN
        sumber_lahan: isMineral
          ? formData.keranjang_lahan_mineral.map((lahan) => ({
              lahan_mineral_id: parseInt(lahan.id),
              lahan_gambut_id: null,
              luas_diambil: parseFloat(lahan.luas_diambil || 0),
            }))
          : formData.keranjang_lahan_gambut.map((lahan) => ({
              lahan_mineral_id: null,
              lahan_gambut_id: parseInt(lahan.id),
              luas_diambil: parseFloat(lahan.luas_diambil || 0),
            })),

        jenis_terasering_mineral:
          isMineral && (isMiring || isKonservasi)
            ? formData.jenis_terasering
            : null,
        jenis_drainase_mineral:
          isMineral && isKonservasi ? formData.jenis_drainase : null,

        // PAYLOAD GAMBUT
        gambut_lapisan_mineral: isGambut
          ? formData.gambut_lapisan_mineral?.map(
              (item) => MAPPING_LAPISAN_MINERAL[item],
            )
          : [],
        gambut_kematangan: isGambut
          ? formData.gambut_kematangan?.map(
              (item) => MAPPING_KEMATANGAN_GAMBUT[item],
            )
          : [],

        dok_bukti_terasering_url: formData.dok_bukti_terasering_url,
        dok_bukti_drainase_url: formData.dok_bukti_drainase_url,
        varietas_bibit_non_tenera: null,
      };

      const formDataUpload = new FormData();
      formDataUpload.append("data_json", JSON.stringify(dataPayload));

      if (isMineral && (isMiring || isKonservasi) && fileTerasering) {
        formDataUpload.append("file_bukti_terasering", fileTerasering);
      }
      if (isMineral && isKonservasi && fileDrainase) {
        formDataUpload.append("file_bukti_drainase", fileDrainase);
      }

      const url = API_ENDPOINTS.FARM.PETANI.RESUBMIT_RENCANA_TANAM(id);

      const response = await fetch(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Gagal mengajukan revisi");
      }

      alert("Revisi berhasil diajukan!");
      window.location.reload();
    } catch (error) {
      console.error("Error update:", error);
      alert(`Gagal: ${error.message}`);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === "disetujui")
      return (
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs sm:text-sm font-medium">
          Disetujui
        </span>
      );
    if (s === "ditolak")
      return (
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs sm:text-sm font-medium">
          Ditolak
        </span>
      );
    return (
      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-xs sm:text-sm font-medium">
        Menunggu Persetujuan
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="w-10 h-10 text-[#EF8523] animate-spin" />
        <p className="text-sm font-medium text-gray-500">
          Memuat data detail rencana tanam...
        </p>
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="p-8 text-center text-gray-500">Data tidak ditemukan.</div>
    );
  }

  const isEditable = detailData.status_approval?.toLowerCase() === "ditolak";

  return (
    <div className=" p-4 sm:p-10 w-full">
      {/* === TOMBOL KEMBALI === */}
      <button
        onClick={() => navigate("/petani/manajemenkebun/budidayamonitoring")}
        className="flex items-center gap-2 text-sm font-semibold text-black hover:text-[#EF8523] transition mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Kembali
      </button>

      {/* === MAIN CARD CONTAINER === */}
      <div className="border border-gray-300 rounded-2xl p-4 sm:p-8 bg-white shadow-md text-gray-800">
        {/* HEADER */}
        <h2 className="text-[#B5302D] font-semibold text-lg sm:text-xl mb-4 sm:mb-6">
          Detail Rencana Tanam
        </h2>

        {/* READ ONLY INFO - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 text-sm sm:text-base">
          <p>
            <span className="font-semibold block sm:inline">Nama Unit:</span>{" "}
            {detailData.nama_unit}
          </p>
          <p>
            <span className="font-semibold block sm:inline">Jenis Tanah:</span>{" "}
            {detailData.jenis_tanah}
          </p>
          <p>
            <span className="font-semibold block sm:inline">
              Tanggal Tanam:
            </span>{" "}
            {detailData.tanggal_tanam_blok}
          </p>
          <p>
            <span className="font-semibold block sm:inline">Luas (ha):</span>{" "}
            {detailData.luas_unit}
          </p>
          <p>
            <span className="font-semibold block sm:inline">Jenis Bibit:</span>{" "}
            {detailData.jenis_bibit}
          </p>
          <p>
            <span className="font-semibold block sm:inline">Total Bibit:</span>{" "}
            {detailData.jumlah_total_tanaman}
          </p>
          <p>
            <span className="font-semibold block sm:inline">Tanaman/ha:</span>{" "}
            {detailData.jumlah_tanaman_per_ha}
          </p>
          <p>
            <span className="font-semibold block sm:inline">Jenis Lahan:</span>{" "}
            {detailData.jenis_lahan}
          </p>
          <p>
            <span className="font-semibold block sm:inline">Jarak Tanam:</span>{" "}
            {detailData.jarak_tanam}
          </p>

          {detailData.jenis_terasering_mineral && (
            <p>
              <span className="font-semibold block sm:inline">Terasering:</span>{" "}
              {detailData.jenis_terasering_mineral}
            </p>
          )}
          {detailData.jenis_drainase_mineral && (
            <p>
              <span className="font-semibold block sm:inline">Drainase:</span>{" "}
              {detailData.jenis_drainase_mineral}
            </p>
          )}

          {/* LOGIKA LINK READ-ONLY */}
          {detailData.dok_bukti_terasering_url && (
            <div className="col-span-1">
              <span className="font-semibold block mb-1">
                Bukti Terasering:
              </span>
              <a
                href={getFileUrl(detailData.dok_bukti_terasering_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Lihat Foto/Video
              </a>
            </div>
          )}
          {detailData.dok_bukti_drainase_url && (
            <div className="col-span-1">
              <span className="font-semibold block mb-1">Bukti Drainase:</span>
              <a
                href={getFileUrl(detailData.dok_bukti_drainase_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Lihat Foto/Video
              </a>
            </div>
          )}
        </div>

        {/* === SECTION STATUS & ALASAN PENOLAKAN === */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-semibold text-sm sm:text-base text-gray-700">
              Status Pengajuan:
            </span>
            {getStatusBadge(detailData.status_approval)}
          </div>

          {detailData.status_approval?.toLowerCase() === "ditolak" &&
            detailData.catatan_penolakan && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm animate-fade-in-up">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-red-100 rounded-full flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-red-800 font-bold text-sm mb-1 uppercase tracking-wide">
                      Catatan Dari Kebun
                    </h3>
                    <div className="text-gray-800 text-sm leading-relaxed bg-white/50 p-2 rounded border border-red-100">
                      <span className="font-semibold text-red-700">
                        Catatan:{" "}
                      </span>
                      {detailData.catatan_penolakan}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* ACTION BUTTONS */}
        {!showPengajuan && (
          <div className="flex flex-col sm:flex-row justify-end gap-3 mb-6 border-t pt-4">
            <button
              onClick={() => isEditable && setShowPengajuan(true)}
              disabled={!isEditable}
              className={`w-full sm:w-auto px-6 py-2.5 text-sm font-semibold rounded-lg border transition shadow-sm ${
                isEditable
                  ? "bg-[#EF8523] text-white border-[#EF8523] hover:bg-[#d6741b] hover:shadow-md cursor-pointer"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              }`}
            >
              Ajukan Kembali Rencana Tanam
            </button>
          </div>
        )}

        {/* FORM EDIT - Responsive Layout */}
        {showPengajuan && isEditable && (
          <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-6 text-base sm:text-lg flex items-center gap-2">
              <span className="w-1 h-6 bg-[#EF8523] rounded-full inline-block"></span>
              Form Pengajuan Kembali
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormInput
                label="Nama Unit"
                name="nama_unit"
                value={formData.nama_unit}
                onChange={handleInputChange}
              />
              <FormInput
                label="Tanggal Tanam"
                type="date"
                name="tanggal_tanam_blok"
                value={formData.tanggal_tanam_blok}
                onChange={handleInputChange}
              />
              <FormInput
                label="Luas Unit (Ha)"
                type="number"
                name="luas_unit"
                value={formData.luas_unit}
                onChange={handleInputChange}
              />
              <FormInput
                label="Jumlah Bibit"
                type="number"
                name="jumlah_total_tanaman"
                value={formData.jumlah_total_tanaman}
                onChange={handleInputChange}
              />
              <FormInput
                label="Tanaman/ha"
                type="number"
                name="jumlah_tanaman_per_ha"
                value={formData.jumlah_tanaman_per_ha}
                onChange={handleInputChange}
              />

              <FormSelect
                label="Jenis Tanah"
                name="jenis_tanah"
                value={formData.jenis_tanah}
                onChange={handleInputChange}
                options={["Mineral", "Gambut"]}
              />

              {formData.jenis_tanah !== "Gambut" && (
                <FormSelect
                  label="Jenis Lahan"
                  name="jenis_lahan"
                  value={formData.jenis_lahan}
                  onChange={handleJenisLahanChange}
                  options={["Datar", "Miring", "Konservasi"]}
                />
              )}

              {/* Jarak Tanam Dinamis */}
              <div className="w-full">
                <label className="block font-semibold text-gray-700 text-sm sm:text-base mb-1.5">
                  Jarak Tanam
                </label>
                <select
                  name="jarak_tanam"
                  value={formData.jarak_tanam}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#EF8523] focus:border-[#EF8523]"
                >
                  <option value="">Pilih</option>
                  <option value="8x9">8 x 9 Meter</option>
                  <option value="9x9">9 x 9 Meter</option>
                  <option value="7x9">7 x 9 Meter</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
                {formData.jarak_tanam === "Lainnya" && (
                  <input
                    name="jarak_tanam_lainnya"
                    value={formData.jarak_tanam_lainnya}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="Tuliskan Jarak Tanam"
                    className="w-full mt-3 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#EF8523] focus:border-[#EF8523]"
                  />
                )}
              </div>

              {/* Jenis Bibit & Varietas Dinamis */}
              <FormSelect
                label="Jenis Bibit *"
                name="jenis_bibit"
                value={formData.jenis_bibit}
                onChange={handleInputChange}
                options={["Dura", "Tenera", "Pisifera"]}
              />

              {formData.jenis_bibit === "Tenera" && (
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700 text-sm sm:text-base mb-1.5">
                    Varietas Bibit *
                  </label>
                  <select
                    name="varietas_bibit_nama"
                    value={formData.varietas_bibit_nama}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#EF8523] focus:border-[#EF8523]"
                    required
                  >
                    <option value="" disabled>
                      -- Pilih Varietas --
                    </option>
                    {Array.isArray(listInventarisBibit) &&
                    listInventarisBibit.length > 0 ? (
                      listInventarisBibit
                        .filter((bibit) => bibit.jenis_bibit === "Tenera")
                        .map((bibit, index) => (
                          <option
                            key={bibit.id || index}
                            value={bibit.nama_varietas}
                          >
                            {bibit.nama_varietas}
                          </option>
                        ))
                    ) : (
                      <option value="" disabled>
                        Stok kosong...
                      </option>
                    )}
                  </select>
                </div>
              )}

              {/* SECTION GAMBUT (KERANJANG & MULTI-SELECT) */}
              {formData.jenis_tanah === "Gambut" && (
                <div className="col-span-1 sm:col-span-2 bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-4 mt-2">
                  <p className="text-sm font-bold text-emerald-800 mb-2">
                    Data Lahan Gambut (Wajib)
                  </p>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1.5 text-sm">
                      Pilih Lahan Gambut & Luas (Ha) *
                    </label>
                    <div className="space-y-3 bg-white p-3 rounded-lg border border-emerald-200 max-h-60 overflow-y-auto">
                      {listLahanGambut.map((lahan) => {
                        const selectedItem =
                          formData.keranjang_lahan_gambut.find(
                            (item) => item.id === lahan.id,
                          );
                        const isChecked = !!selectedItem;
                        const sisaGambut =
                          lahan.lahan_tidak_digunakan_gambut ??
                          lahan.luas_total_boleh_ditanam ??
                          0;
                        return (
                          <div
                            key={lahan.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 border-b border-gray-100 last:border-0"
                          >
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    keranjang_lahan_gambut: e.target.checked
                                      ? [
                                          ...prev.keranjang_lahan_gambut,
                                          { id: lahan.id, luas_diambil: "" },
                                        ]
                                      : prev.keranjang_lahan_gambut.filter(
                                          (item) => item.id !== lahan.id,
                                        ),
                                  }));
                                }}
                                className="w-4 h-4 text-emerald-600 rounded border-gray-300"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {lahan.nama_lahan_gambut} (Sisa: {sisaGambut}{" "}
                                Ha)
                              </span>
                            </label>
                            {isChecked && (
                              <input
                                type="number"
                                placeholder="Luas (Ha)"
                                value={selectedItem.luas_diambil}
                                onChange={(e) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    keranjang_lahan_gambut:
                                      prev.keranjang_lahan_gambut.map((item) =>
                                        item.id === lahan.id
                                          ? {
                                              ...item,
                                              luas_diambil: e.target.value,
                                            }
                                          : item,
                                      ),
                                  }));
                                }}
                                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-emerald-500"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Lapisan Mineral */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2 text-sm">
                      Lapisan Mineral
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(MAPPING_LAPISAN_MINERAL).map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 text-sm bg-white px-2 py-1 rounded border"
                        >
                          <input
                            type="checkbox"
                            value={opt}
                            checked={formData.gambut_lapisan_mineral.includes(
                              opt,
                            )}
                            onChange={(e) =>
                              handleCheckboxGambut(e, "gambut_lapisan_mineral")
                            }
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Kematangan Gambut */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2 text-sm">
                      Kematangan Gambut
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(MAPPING_KEMATANGAN_GAMBUT).map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 text-sm bg-white px-2 py-1 rounded border"
                        >
                          <input
                            type="checkbox"
                            value={opt}
                            checked={formData.gambut_kematangan.includes(opt)}
                            onChange={(e) =>
                              handleCheckboxGambut(e, "gambut_kematangan")
                            }
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION MINERAL (KERANJANG MULTI-SELECT) */}
              {formData.jenis_tanah === "Mineral" && (
                <div className="col-span-1 sm:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2 mb-4">
                  <label className="block font-semibold text-gray-700 mb-1.5 text-sm">
                    Pilih Lahan Mineral & Luas (Ha) *
                  </label>
                  <div className="space-y-3 bg-white p-3 rounded-lg border border-gray-300 max-h-60 overflow-y-auto">
                    {listLahanMineral.map((lahan) => {
                      const selectedItem =
                        formData.keranjang_lahan_mineral.find(
                          (item) => item.id === lahan.id,
                        );
                      const isChecked = !!selectedItem;
                      const labelLuas = lahan.luas_sisa ?? 0;
                      return (
                        <div
                          key={lahan.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 border-b border-gray-100 last:border-0"
                        >
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  keranjang_lahan_mineral: e.target.checked
                                    ? [
                                        ...prev.keranjang_lahan_mineral,
                                        { id: lahan.id, luas_diambil: "" },
                                      ]
                                    : prev.keranjang_lahan_mineral.filter(
                                        (item) => item.id !== lahan.id,
                                      ),
                                }));
                              }}
                              className="w-4 h-4 text-[#EF8523] rounded border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {lahan.nama_lahan_mineral ||
                                `Lahan ID: ${lahan.id}`}{" "}
                              (Sisa: {labelLuas} Ha)
                            </span>
                          </label>
                          {isChecked && (
                            <input
                              type="number"
                              placeholder="Luas (Ha)"
                              value={selectedItem.luas_diambil}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  keranjang_lahan_mineral:
                                    prev.keranjang_lahan_mineral.map((item) =>
                                      item.id === lahan.id
                                        ? {
                                            ...item,
                                            luas_diambil: e.target.value,
                                          }
                                        : item,
                                    ),
                                }));
                              }}
                              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-[#EF8523]"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BAGIAN FILE - Responsive */}
              {(formData.jenis_lahan === "Miring" ||
                formData.jenis_lahan === "Konservasi") && (
                <div className="col-span-1 sm:col-span-2 space-y-4 mt-2">
                  <div className="bg-white p-4 rounded border border-yellow-300 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormSelect
                        label="Jenis Terasering *"
                        name="jenis_terasering"
                        value={formData.jenis_terasering}
                        onChange={handleInputChange}
                        options={ENUM_TERASERING}
                      />

                      <div>
                        <label className="block font-semibold text-gray-800 text-sm mb-1">
                          Bukti Terasering
                        </label>
                        {formData.dok_bukti_terasering_url &&
                          !fileTerasering && (
                            <div className="mb-2 text-xs flex items-center justify-between bg-gray-50 p-2 rounded border">
                              <span className="text-gray-500">
                                File tersedia
                              </span>
                              <a
                                href={getFileUrl(
                                  formData.dok_bukti_terasering_url,
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 font-bold hover:underline"
                              >
                                Lihat
                              </a>
                            </div>
                          )}
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, "terasering")}
                          className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:bg-[#EF8523] file:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {formData.jenis_lahan === "Konservasi" && (
                    <div className="bg-white p-4 rounded border border-blue-300 shadow-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormSelect
                          label="Jenis Drainase *"
                          name="jenis_drainase"
                          value={formData.jenis_drainase}
                          onChange={handleInputChange}
                          options={ENUM_DRAINASE}
                        />

                        <div>
                          <label className="block font-semibold text-gray-800 text-sm mb-1">
                            Bukti Drainase
                          </label>
                          {formData.dok_bukti_drainase_url && !fileDrainase && (
                            <div className="mb-2 text-xs flex items-center justify-between bg-gray-50 p-2 rounded border">
                              <span className="text-gray-500">
                                File tersedia
                              </span>
                              <a
                                href={getFileUrl(
                                  formData.dok_bukti_drainase_url,
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 font-bold hover:underline"
                              >
                                Lihat
                              </a>
                            </div>
                          )}
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(e, "drainase")}
                            className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:bg-[#EF8523] file:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowPengajuan(false)}
                className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md text-sm hover:bg-gray-50 text-center transition font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleUpdate}
                disabled={loadingSubmit}
                className={`w-full sm:w-auto text-white px-8 py-2 rounded-md text-sm font-semibold transition text-center shadow-sm ${
                  loadingSubmit
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                }`}
              >
                {loadingSubmit ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// === KOMPONEN HELPER ===

function FormInput({ label, type = "text", name, value, onChange }) {
  return (
    <div>
      <label className="block font-semibold text-gray-700 text-sm sm:text-base mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-[#EF8523] focus:border-[#EF8523] focus:outline-none transition-all"
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options = [], name }) {
  return (
    <div>
      <label className="block font-semibold text-gray-700 text-sm sm:text-base mb-1.5">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-[#EF8523] focus:border-[#EF8523] focus:outline-none transition-all"
      >
        <option value="">Pilih {label.toLowerCase()}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
