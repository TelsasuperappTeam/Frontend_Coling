import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Plus,
  X,
  Wrench,
  Sprout,
  Wheat,
  SprayCan,
  Save,
  Loader2,
  Trash2,
  Box,
  Warehouse,
  FileText,
} from "lucide-react";

import { API_ENDPOINTS, getFileUrl } from "../../config/constants";

const getAuthHeaders = (isJson = false) => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

const INITIAL_DATA = {
  peralatan: [],
  bibit: [],
  pupuk: [],
  pestisida: [],
};

const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const isValidFileType = (file) => {
  if (!file) return false;
  return ALLOWED_FILE_TYPES.includes(file.type);
};

export default function Inventaris() {
  const [popupType, setPopupType] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [inventarisData, setInventarisData] = useState(INITIAL_DATA);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const fetchInventaris = async () => {
    setIsLoadingData(true);
    const headers = getAuthHeaders(false);

    const fetchSafe = async (url) => {
      try {
        const res = await fetch(url, { headers });
        if (!res.ok) {
          const errorDetail = await res.json();
          console.warn(`Gagal fetch ${url}:`, errorDetail);
          return [];
        }
        return await res.json();
      } catch (err) {
        console.error(`Network error pada ${url}:`, err);
        return [];
      }
    };

    try {
      const [dataAlat, dataBibit, dataPupuk, dataPestisida] = await Promise.all(
        [
          fetchSafe(API_ENDPOINTS.FARM.KEBUN.INVENTARIS.GET_PERALATAN),
          fetchSafe(API_ENDPOINTS.FARM.KEBUN.INVENTARIS.GET_BIBIT),
          fetchSafe(API_ENDPOINTS.FARM.KEBUN.INVENTARIS.GET_PUPUK),
          fetchSafe(API_ENDPOINTS.FARM.KEBUN.INVENTARIS.GET_PESTISIDA),
        ],
      );

      setInventarisData({
        peralatan: dataAlat || [],
        bibit: dataBibit || [],
        pupuk: dataPupuk || [],
        pestisida: dataPestisida || [],
      });
    } catch (error) {
      console.error("Critical Error pada fetchInventaris:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchInventaris();
  }, []);

  const handleDelete = async (category, id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus item ini?")) return;

    try {
      let url = "";
      switch (category) {
        case "bibit":
          url = API_ENDPOINTS.FARM.KEBUN.INVENTARIS.DELETE_BIBIT(id);
          break;
        case "pupuk":
          url = API_ENDPOINTS.FARM.KEBUN.INVENTARIS.DELETE_PUPUK(id);
          break;
        case "pestisida":
          url = API_ENDPOINTS.FARM.KEBUN.INVENTARIS.DELETE_PESTISIDA(id);
          break;
        default:
          throw new Error("Kategori tidak valid");
      }

      if (url) {
        const res = await fetch(url, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Gagal menghapus data di sistem");
        }
      }

      setInventarisData((prev) => ({
        ...prev,
        [category]: prev[category].filter((item) => item.id !== id),
      }));

      alert("Data berhasil dihapus!");
    } catch (err) {
      alert(`Terjadi kesalahan: ${err.message}`);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let endpoint = "";
      let payload;
      let headers = getAuthHeaders(false);
      switch (popupType) {
        case "peralatan":
          endpoint = API_ENDPOINTS.FARM.KEBUN.INVENTARIS.ADD_PERALATAN;
          headers = getAuthHeaders(true);
          payload = JSON.stringify({
            nama_alat: formData.nama_alat || "",
            jumlah_per_buah: parseInt(formData.jumlah_per_buah) || 0,
            lokasi_penyimpanan: formData.lokasi_penyimpanan || "",
            status_kepemilikan: formData.status_kepemilikan || "",
            catatan: formData.catatan || "",
          });
          break;

        case "bibit":
          endpoint = API_ENDPOINTS.FARM.KEBUN.INVENTARIS.ADD_BIBIT;
          payload = new FormData();

          // 1. Validasi Manual: Pastikan 4 data yang diminta BE benar-benar terisi di UI
          if (
            !formData.tanggal_pembelian ||
            !formData.asal_bibit ||
            !formData.file_sertifikat ||
            !formData.file_nota
          ) {
            alert(
              "Gagal: Tanggal Pembelian, Asal Bibit, File Sertifikat, dan File Nota WAJIB diisi!",
            );
            setIsSaving(false);
            return;
          }

          // 2. Kirim Text Data (Perbaikan bug penamaan state)
          payload.append("tanggal_pembelian", formData.tanggal_pembelian);
          payload.append("asal_bibit", formData.asal_bibit);
          payload.append("jenis_bibit", formData.jenis_bibit || "");
          payload.append("varietas_bibit_nama", formData.nama_varietas || "");

          // Perbaikan bug: state di input namanya jumlah_tersisa, bukan jumlah
          payload.append(
            "jumlah_awal",
            parseFloat(formData.jumlah_tersisa) || 0,
          );

          // 3. Kirim File Data (Perbaikan nama key agar 100% cocok dengan BE)
          payload.append("file_sertifikat", formData.file_sertifikat);
          payload.append("file_nota", formData.file_nota);
          break;

        case "pupuk":
          endpoint = API_ENDPOINTS.FARM.KEBUN.INVENTARIS.ADD_PUPUK;
          payload = new FormData();

          if (formData.nama_pupuk)
            payload.append("nama_pupuk", formData.nama_pupuk);
          if (formData.tanggal_pembelian)
            payload.append("tanggal_pembelian", formData.tanggal_pembelian);
          if (formData.asal_pupuk)
            payload.append("asal_pupuk", formData.asal_pupuk);
          if (formData.jenis_pupuk)
            payload.append("jenis_pupuk", formData.jenis_pupuk);
          payload.append(
            "jumlah_awal_kg",
            parseFloat(formData.jumlah_tersisa_kg) || 0,
          );

          if (formData.file_sertifikat)
            payload.append("file_sertifikat", formData.file_sertifikat);
          if (formData.file_nota)
            payload.append("file_nota", formData.file_nota);
          break;

        case "pestisida":
          endpoint = API_ENDPOINTS.FARM.KEBUN.INVENTARIS.ADD_PESTISIDA;
          payload = new FormData();

          if (formData.nama_pestisida)
            payload.append("nama_pestisida", formData.nama_pestisida);
          if (formData.tanggal_expired)
            payload.append("tanggal_expired", formData.tanggal_expired);
          if (formData.jenis_pestisida)
            payload.append("jenis_pestisida", formData.jenis_pestisida);
          payload.append(
            "jumlah_awal",
            parseFloat(formData.jumlah_tersisa) || 0,
          );
          if (formData.satuan) payload.append("satuan", formData.satuan);
          if (formData.bentuk) payload.append("bentuk", formData.bentuk);

          if (formData.file_sertifikat)
            payload.append("file_sertifikat", formData.file_sertifikat);
          break;

        default:
          throw new Error("Kategori tidak valid");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: payload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error Detail dari Backend (422):", errorData);

        // PERBAIKAN: Ekstrak isi Array(4) agar ketahuan field apa yang ditolak BE
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const errorMessages = errorData.detail
            .map(
              (err) => `- Field [${err.loc[err.loc.length - 1]}]: ${err.msg}`,
            )
            .join("\n");
          throw new Error(`Validasi Backend Gagal:\n${errorMessages}`);
        }

        throw new Error(errorData.detail || "Gagal menyimpan data");
      }

      alert("Data berhasil disimpan!");
      handleClosePopup();
      fetchInventaris();
    } catch (error) {
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenPopup = (type) => {
    setPopupType(type);
    setFormData({});
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupType(null);
    setFormData({});
  };

  const tableConfig = {
    peralatan: {
      title: "Daftar Peralatan",
      icon: <Wrench className="w-5 h-5" />,
      columns: ["Nama Alat", "Jumlah", "Lokasi", "Kepemilikan", "Catatan"],
      fields: [
        {
          name: "nama_alat",
          label: "Nama Alat",
          type: "text",
          placeholder: "Contoh: Traktor / Egrek",
        },
        {
          name: "jumlah_per_buah",
          label: "Jumlah (Unit)",
          type: "number",
          placeholder: "0",
        },
        {
          name: "lokasi_penyimpanan",
          label: "Lokasi Penyimpanan",
          type: "text",
          placeholder: "Gudang A / Workshop",
        },
        {
          name: "status_kepemilikan",
          label: "Status Kepemilikan",
          type: "select",
          // PERBAIKAN: Enum disesuaikan dengan BE
          options: ["Pribadi", "Meminjam"],
        },
        {
          name: "catatan",
          label: "Catatan Tambahan",
          type: "text",
          placeholder: "Kondisi atau keterangan lain",
        },
      ],
      renderRow: (item) => [
        <div className="flex flex-col">
          <span className="font-semibold">{item.nama_alat}</span>
          {item.dinamis_peralatan && (
            <span className="text-[10px] text-gray-500">
              {item.dinamis_peralatan.nama_alat}
            </span>
          )}
        </div>,
        `${item.jumlah_per_buah} Unit`,
        item.lokasi_penyimpanan || "-",
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-bold ${
            // PERBAIKAN: Ubah pengecekan sesuai Enum baru
            item.status_kepemilikan === "Pribadi"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {item.status_kepemilikan}
        </span>,
        item.catatan || "-",
      ],
    },

    bibit: {
      title: "Stok Bibit",
      icon: <Sprout className="w-5 h-5" />,
      columns: [
        "Jenis",
        "Varietas",
        "Asal Bibit",
        "Sisa Stok",
        "Tgl Beli",
        "Dokumen",
        "Aksi",
      ],
      fields: [
        { name: "tanggal_pembelian", label: "Tanggal Pembelian", type: "date" },
        {
          name: "jenis_bibit",
          label: "Jenis Bibit",
          type: "select",
          options: ["Dura", "Tenera", "Pisifera"],
        },
        {
          name: "nama_varietas",
          label: "Nama Varietas",
          type: "text",
          placeholder: "Contoh: DxP Simalungun",
          showIf: (data) => data.jenis_bibit === "Tenera",
        },
        {
          name: "asal_bibit",
          label: "Asal Bibit (Supplier)",
          type: "text",
          placeholder: "Contoh: PPKS Medan",
        },
        {
          // PERBAIKAN: Ubah nama field agar sinkron dengan state formData & BE
          name: "jumlah_tersisa",
          label: "Jumlah Awal (Pokok)",
          type: "number",
          placeholder: "Jumlah pembelian",
        },
        {
          name: "file_sertifikat",
          label: "Sertifikat Bibit (Wajib)",
          type: "file",
          note: "File: JPG, PNG, PDF (Maks. 2MB)",
        },
        {
          name: "file_nota",
          label: "Nota Pembelian (Wajib)",
          type: "file",
          note: "File: JPG, PNG (Maks. 2MB)",
        },
      ],
      renderRow: (item) => [
        <span className="font-bold text-gray-700">{item.jenis_bibit}</span>,
        item.nama_varietas || "-",
        item.asal_bibit,
        <span className="font-mono text-blue-600">
          {item.jumlah_tersisa} Pokok
        </span>,
        item.tanggal_pembelian,
        <div className="flex gap-2">
          {item.sertifikat_bibit_url && (
            <a
              href={getFileUrl(item.sertifikat_bibit_url, "FARM")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Sertifikat Bibit"
              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
            </a>
          )}
          {item.nota_pembelian_url && (
            <a
              href={getFileUrl(item.nota_pembelian_url, "FARM")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Nota Pembelian"
              className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
            </a>
          )}
          {!item.sertifikat_bibit_url && !item.nota_pembelian_url && (
            <span className="text-gray-400">-</span>
          )}
        </div>,
        <ActionButtons onClick={() => handleDelete("bibit", item.id)} />,
      ],
    },

    pupuk: {
      title: "Stok Pupuk",
      icon: <Wheat className="w-5 h-5" />,
      columns: [
        "Nama Pupuk",
        "Jenis",
        "Asal",
        "Sisa (Kg)",
        "Tgl Beli",
        "Dokumen",
        "Aksi",
      ],
      fields: [
        {
          name: "nama_pupuk",
          label: "Nama Pupuk",
          type: "text",
          placeholder: "Contoh: NPK 16-16-16",
        },
        { name: "tanggal_pembelian", label: "Tanggal Pembelian", type: "date" },
        { name: "asal_pupuk", label: "Asal Pupuk", type: "text" },
        {
          name: "jenis_pupuk",
          label: "Jenis Pupuk",
          type: "select",
          // PERBAIKAN: Enum disesuaikan total dengan request BE
          options: [
            "Organik",
            "Anorganik",
            "Hayati",
            "Amelioran/Kapur",
            "Pupuk Mikro",
          ],
        },
        {
          // PERBAIKAN: Ubah nama field agar sinkron dengan state formData & BE
          name: "jumlah_tersisa_kg",
          label: "Jumlah Awal (Kg)",
          type: "number",
        },
        {
          name: "file_sertifikat",
          label: "Dokumen Sertifikat Pupuk (Wajib)",
          type: "file",
          note: "File: JPG, PNG, PDF (Maks. 2MB)",
        },
        {
          name: "file_nota",
          label: "Nota Pembelian (Wajib)",
          type: "file",
          note: "File: JPG, PNG, PDF (Maks. 2MB)",
        },
      ],
      renderRow: (item) => [
        item.nama_pupuk,
        item.jenis_pupuk,
        item.asal_pupuk,
        <span className="font-bold text-gray-700">
          {item.jumlah_tersisa_kg} Kg
        </span>,
        item.tanggal_pembelian,

        // TAMBAHKAN KOLOM DOKUMEN DI SINI (Memanggil "FARM")
        <div className="flex gap-2">
          {(item.sertifikat_pupuk_url || item.sertifikat_url) && (
            <a
              href={getFileUrl(
                item.sertifikat_pupuk_url || item.sertifikat_url,
                "FARM",
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Sertifikat"
              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
            </a>
          )}
          {item.nota_pembelian_url && (
            <a
              href={getFileUrl(item.nota_pembelian_url, "FARM")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Nota Pembelian"
              className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
            </a>
          )}
          {!(item.sertifikat_pupuk_url || item.sertifikat_url) &&
            !item.nota_pembelian_url && (
              <span className="text-gray-400">-</span>
            )}
        </div>,

        <ActionButtons onClick={() => handleDelete("pupuk", item.id)} />,
      ],
    },

    pestisida: {
      title: "Stok Pestisida",
      icon: <SprayCan className="w-5 h-5" />,
      columns: [
        "Nama Pestisida",
        "Jenis",
        "Sisa Stok",
        "Bentuk",
        "Expired",
        "Dokumen",
        "Aksi",
      ],
      fields: [
        {
          name: "nama_pestisida",
          label: "Nama Dagang/Merek",
          type: "text",
          placeholder: "Contoh: CULTAR 250 SC/ENTIBLU 450/100 SC",
        },
        { name: "tanggal_expired", label: "Tanggal Expired", type: "date" },
        {
          name: "jenis_pestisida",
          label: "Jenis Pestisida",
          type: "select",
          // PERBAIKAN: Enum disesuaikan dengan BE
          options: ["Insektisida", "Fungisida", "Herbisida", "Nematisida"],
        },
        {
          // PERBAIKAN: Ubah nama field agar sinkron dengan state formData & BE
          name: "jumlah_tersisa",
          label: "Jumlah Awal",
          type: "number",
        },
        {
          name: "satuan",
          label: "Satuan",
          type: "select",
          // PERBAIKAN: Enum disesuaikan dengan BE (huruf kecil)
          options: ["kg", "liter"],
        },
        {
          name: "bentuk",
          label: "Bentuk Fisik",
          type: "select",
          // PERBAIKAN: Enum disesuaikan dengan BE
          options: ["Padat", "Cair", "Gas"],
        },
        {
          name: "file_sertifikat",
          label: "Sertifikat (opsional)",
          type: "file",
          note: "File: JPG, PNG, PDF (Maks. 2MB)",
        },
      ],
      renderRow: (item) => [
        item.nama_pestisida,
        item.jenis_pestisida,
        `${item.jumlah_tersisa} ${item.satuan}`,
        item.bentuk,
        <span className="text-red-500 font-medium">
          {item.tanggal_expired}
        </span>,

        // TAMBAHKAN KOLOM DOKUMEN DI SINI (Memanggil "FARM")
        <div className="flex gap-2">
          {(item.sertifikat_pestisida_url || item.sertifikat_url) && (
            <a
              href={getFileUrl(
                item.sertifikat_pestisida_url || item.sertifikat_url,
                "FARM",
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Sertifikat"
              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
            </a>
          )}
          {!(item.sertifikat_pestisida_url || item.sertifikat_url) && (
            <span className="text-gray-400">-</span>
          )}
        </div>,

        <ActionButtons onClick={() => handleDelete("pestisida", item.id)} />,
      ],
    },
  };

  const renderPopupForm = () => {
    if (!popupType) return null;
    const config = tableConfig[popupType];

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={handleClosePopup}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 rounded-lg text-[#B5302D]">
              {config.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              Tambah {config.title.replace("Daftar ", "")}
            </h3>
          </div>

          <div className="space-y-4">
            {/* PERBAIKAN: Gunakan kurung kurawal "{" di sini */}
            {config.fields.map((f, i) => {
              if (f.showIf && !f.showIf(formData)) {
                return null;
              }

              return (
                <div key={i}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {f.label}
                  </label>
                  {f.type === "select" ? (
                    <div className="relative">
                      <select
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-100 outline-none appearance-none bg-white"
                        value={formData[f.name] || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, [f.name]: e.target.value })
                        }
                      >
                        <option value="">Pilih {f.label}</option>
                        {f.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  ) : f.type === "file" ? (
                    <div className="relative">
                      <input
                        type="file"
                        id={`file-${f.name}`}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          // MENGGUNAKAN FUNGSI VALIDASI
                          if (!isValidFileType(file)) {
                            alert(
                              "Jenis file tidak didukung. Gunakan PDF atau Foto (JPG/PNG).",
                            );
                            e.target.value = ""; // Reset input
                            return;
                          }

                          setFormData({
                            ...formData,
                            [f.name]: file,
                          });
                        }}
                      />
                      <label
                        htmlFor={`file-${f.name}`}
                        className="flex items-center justify-between w-full border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white cursor-pointer hover:border-gray-400 transition-all"
                      >
                        <span className="text-gray-400 truncate pr-4">
                          {formData[f.name]
                            ? formData[f.name].name
                            : `Pilih file ${f.label.toLowerCase()}...`}
                        </span>
                        {/* WARNA DIUBAH JADI OREN #EF8523 */}
                        <span className="text-[#EF8523] font-bold text-xs whitespace-nowrap">
                          CARI FILE
                        </span>
                      </label>

                      {/* TAMBAHAN: Keterangan format agar persis lampiran */}
                      <div className="flex items-center gap-1.5 mt-1 px-1 text-gray-500">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <p className="text-[10px] italic">
                          Format yang didukung:{" "}
                          <span className="font-semibold uppercase">
                            JPG, PNG, PDF
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-100 outline-none"
                      value={formData[f.name] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.name]: e.target.value })
                      }
                    />
                  )}
                  {f.note && (
                    <p className="text-[10px] text-gray-400 mt-1 italic">
                      {f.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#B5302D] text-white rounded-xl text-sm font-bold hover:bg-[#a72a28] shadow-lg shadow-red-200 transition-all"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-8 min-h-screen font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <Warehouse className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Inventaris Kebun
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Kelola stok alat, peralatan, pupuk, pestisida, dan bibit.
            </p>
          </div>
        </div>
      </div>
      
      {/* --- GARIS PEMBATAS --- */}
      <hr className="border-gray-200 mb-8" />

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <SectionCard title="Inventaris Alat">
          {isLoadingData ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-[#B5302D] animate-spin" />
            </div>
          ) : (
            <Section
              config={tableConfig.peralatan}
              data={inventarisData.peralatan}
              onAdd={() => handleOpenPopup("peralatan")}
            />
          )}
        </SectionCard>

        <SectionCard title="Inventaris Barang">
          {isLoadingData ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-[#B5302D] animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <Section
                config={tableConfig.bibit}
                data={inventarisData.bibit}
                onAdd={() => handleOpenPopup("bibit")}
              />
              <Section
                config={tableConfig.pupuk}
                data={inventarisData.pupuk}
                onAdd={() => handleOpenPopup("pupuk")}
              />
              <Section
                config={tableConfig.pestisida}
                data={inventarisData.pestisida}
                onAdd={() => handleOpenPopup("pestisida")}
              />
            </div>
          )}
        </SectionCard>
      </div>
      {showPopup && renderPopupForm()}
    </div>
  );
}

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden group hover:shadow-md transition-all">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />
    <h3 className="text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">
      <Box className="w-5 h-5 opacity-80" />
      {title}
    </h3>
    {children}
  </div>
);

const Section = ({ config, data, onAdd }) => (
  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
    <div className="flex justify-between items-center px-5 py-3 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center gap-2 font-bold text-gray-700">
        <div className="text-gray-800">{config.icon}</div>
        <span className="text-sm sm:text-base">{config.title}</span>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg shadow-green-100 transition-all"
      >
        <Plus className="w-3.5 h-3.5" /> Tambah Stok
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-xs sm:text-sm min-w-[600px] sm:min-w-0">
        <thead className="bg-[#EF8523] text-white">
          <tr>
            <th className="px-2 sm:px-4 py-3 text-left font-semibold pl-3 sm:pl-5 w-10">
              No
            </th>
            {config.columns.map((col, i) => (
              <th key={i} className="px-2 sm:px-4 py-3 text-left font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {!data || data.length === 0 ? (
            <tr>
              <td
                colSpan={config.columns.length + 1}
                className="text-center py-8 text-gray-400 italic bg-gray-50/50"
              >
                Belum ada data. Klik "Tambah Stok".
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr
                key={item.id || i}
                className="hover:bg-red-50/30 transition-colors"
              >
                <td className="px-2 sm:px-4 py-3 font-medium text-gray-400 pl-3 sm:pl-5">
                  {i + 1}
                </td>
                {config.renderRow(item).map((cell, j) => (
                  <td key={j} className="px-2 sm:px-4 py-3 text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const ActionButtons = ({ onClick }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
    title="Hapus Item"
  >
    <Trash2 className="w-4 h-4" />
  </button>
);
