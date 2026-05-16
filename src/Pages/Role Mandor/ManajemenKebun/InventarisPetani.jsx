import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  X,
  Wrench,
  Sprout,
  Wheat,
  SprayCan,
  Save,
  Info,
  Loader2,
  Trash2,
  ChevronDown,
  Box,
  FileText,
} from "lucide-react";

import {
  API_ENDPOINTS,
  NOTIF_MESSAGES,
  getFileUrl,
  API_BASE_URLS,
} from "../../../config/constants";

import { showToast, confirmDialog } from "../../../utils/notif";

const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

// Fungsi helper untuk validasi tipe file yang diupload
const isValidFileType = (file) => {
  if (!file) return false;
  return ALLOWED_FILE_TYPES.includes(file.type);
};

export default function InventarisPetani() {
  const [popupType, setPopupType] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // State form & data
  const [formData, setFormData] = useState({});
  const [inventarisData, setInventarisData] = useState({
    peralatan: [],
    bibit: [],
    pupuk: [],
    pestisida: [],
  });
  const [rawInventarisData, setRawInventarisData] = useState({
    peralatan: [],
    bibit: [],
    pupuk: [],
    pestisida: [],
  });
  // Flag untuk mode input manual
  const [manualInputMode, setManualInputMode] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchRef = useRef(null);
  const getToken = () => localStorage.getItem("token");

  // --- DELETE PERALATAN ---
  const handleDeletePeralatan = useCallback(async (id) => {
    const isSetuju = await confirmDialog({
      title: "Hapus Peralatan?",
      text: "Apakah Anda yakin ingin menghapus alat ini dari inventaris?",
      confirmText: "Ya, Hapus!",
      cancelText: "Batal",
      isDanger: true, // Tombol warna merah
    });

    if (!isSetuju) return;

    try {
      showToast.loading("Menghapus peralatan...");
      const token = getToken();
      const url = `${API_BASE_URLS.FARM}/farm/me/inventaris/peralatan/${id}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showToast.dismiss();

      if (!response.ok) {
        throw new Error("Gagal menghapus peralatan.");
      }

      showToast.success("Peralatan berhasil dihapus.");

      if (fetchRef.current) {
        fetchRef.current();
      }
    } catch (err) {
      showToast.dismiss();
      console.error(err);
      // GANTI: Alert error menjadi Toast
      showToast.error(err.message || "Terjadi kesalahan saat menghapus.");
    }
  }, []);

  // --- LOGIC: FETCH DATA (GET) ---
  const fetchInventaris = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const [resAlat, resBibit, resPupuk, resPestisida] = await Promise.all([
        fetch(API_ENDPOINTS.FARM.PETANI.INVENTARIS.GET_PERALATAN, { headers }),
        fetch(API_ENDPOINTS.FARM.PETANI.INVENTARIS.GET_BIBIT, { headers }),
        fetch(API_ENDPOINTS.FARM.PETANI.INVENTARIS.GET_PUPUK, { headers }),
        fetch(API_ENDPOINTS.FARM.PETANI.INVENTARIS.GET_PESTISIDA, { headers }),
      ]);

      if (!resAlat.ok || !resBibit.ok || !resPupuk.ok || !resPestisida.ok) {
        throw new Error("Gagal mengambil data inventaris dari sistem.");
      }

      const dataAlat = await resAlat.json();
      const dataBibit = await resBibit.json();
      const dataPupuk = await resPupuk.json();
      const dataPestisida = await resPestisida.json();

      setRawInventarisData({
        peralatan: dataAlat,
        bibit: dataBibit,
        pupuk: dataPupuk,
        pestisida: dataPestisida,
      });

      const mapToTable = (items, type) => {
        return items.map((item) => {
          if (type === "alat") {
            return [
              <span className="font-semibold text-gray-800">
                {item.nama_alat}
              </span>,
              `${item.jumlah_per_buah} unit`,
              item.lokasi_penyimpanan || "-",
              <span
                className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                  item.status_kepemilikan === "Pribadi"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {item.status_kepemilikan}
              </span>,
              item.catatan || "-",
              <ActionButtons
                onClick={() => handleDeletePeralatan(item.id)}
                title="Hapus Alat"
              />,
            ];
          }
          if (type === "bibit") {
            return [
              item.tanggal_pembelian,
              item.nama_varietas || "-",
              <span className="font-bold text-gray-700">
                {item.jenis_bibit}
              </span>,
              <span className="font-mono text-blue-600">
                {item.jumlah_tersisa} batang
              </span>,
              <div className="flex gap-2">
                {renderFileLink(item.sertifikat_bibit_url, "Sertifikat")}
                {renderFileLink(item.nota_pembelian_url, "Nota")}
                {!item.sertifikat_bibit_url && !item.nota_pembelian_url && (
                  <span className="text-gray-400">-</span>
                )}
              </div>,
            ];
          }
          if (type === "pupuk") {
            return [
              item.nama_pupuk,
              item.jenis_pupuk,
              item.asal_pupuk,
              <span className="font-bold text-gray-700">
                {item.jumlah_tersisa_kg} Kg
              </span>,
              item.tanggal_pembelian,
              <div className="flex gap-2">
                {renderFileLink(item.nota_pembelian_url, "Nota")}
                {!item.nota_pembelian_url && (
                  <span className="text-gray-400">-</span>
                )}
              </div>,
            ];
          }
          if (type === "pestisida") {
            return [
              item.nama_pestisida,
              item.jenis_pestisida,
              `${item.jumlah_tersisa} ${item.satuan}`,
              item.bentuk || "-",
              <span className="text-red-500 font-medium">
                {item.tanggal_expired || "-"}
              </span>,
              <div className="flex gap-2">
                {renderFileLink(item.sertifikat_pestisida_url, "Sertifikat")}
                {!item.sertifikat_pestisida_url && (
                  <span className="text-gray-400">-</span>
                )}
              </div>,
            ];
          }
          return [];
        });
      };

      setInventarisData({
        peralatan: mapToTable(dataAlat, "alat"),
        bibit: mapToTable(dataBibit, "bibit"),
        pupuk: mapToTable(dataPupuk, "pupuk"),
        pestisida: mapToTable(dataPestisida, "pestisida"),
      });
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [handleDeletePeralatan]);

  // Helper render link dokumen
  const renderFileLink = (path, title = "Dokumen") => {
    if (!path) return null;
    return (
      <a
        href={getFileUrl(path, "FARM")}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        title={title}
        className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
          title === "Nota"
            ? "bg-green-50 text-green-600 hover:bg-green-100"
            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
        }`}
      >
        {/* SVG dihapus dan diganti dengan FileText */}
        <FileText className="w-4 h-4" />
      </a>
    );
  };

  useEffect(() => {
    fetchRef.current = fetchInventaris;
  }, [fetchInventaris]);

  useEffect(() => {
    fetchInventaris();
  }, [fetchInventaris]);

  const handleOpenPopup = (type) => {
    setPopupType(type);
    setFormData({});
    setManualInputMode({});
    setShowPopup(true);
    setErrorMsg("");
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupType(null);
    setFormData({});
    setErrorMsg("");
  };

  // --- KONFIGURASI TABEL & FORM ---
  const tableConfig = {
    peralatan: {
      title: "Daftar Peralatan",
      endpoint: API_ENDPOINTS.FARM.PETANI.INVENTARIS.ADD_PERALATAN,
      icon: <Wrench className="w-5 h-5" />,
      columns: ["Nama Alat", "Jumlah", "Lokasi", "Status", "Catatan", "Aksi"],
      fields: [
        {
          name: "nama_alat",
          label: "Nama Alat",
          placeholder: "Pilih alat atau ketik baru...",
          type: "history_text",
          historySource: "peralatan",
          historyKey: "nama_alat",
          required: true,
        },
        {
          name: "jumlah_per_buah",
          label: "Jumlah (Unit)",
          placeholder: "0",
          type: "number",
          required: true,
        },
        {
          name: "status_kepemilikan",
          label: "Status Kepemilikan",
          type: "select",
          options: [
            { label: "Milik Pribadi", value: "Pribadi" },
            { label: "Meminjam", value: "Meminjam" },
          ],
          required: true,
        },
        {
          name: "lokasi_penyimpanan",
          label: "Lokasi Penyimpanan",
          placeholder: "Contoh: Gudang Belakang",
          type: "text",
          required: true,
        },
        {
          name: "catatan",
          label: "Catatan (Kondisi)",
          placeholder: "Contoh: Kondisi baru",
          type: "textarea",
          required: true,
        },
      ],
    },

    bibit: {
      title: "Stok Bibit",
      endpoint: API_ENDPOINTS.FARM.PETANI.INVENTARIS.ADD_BIBIT,
      icon: <Sprout className="w-5 h-5" />,
      columns: ["Tgl Beli", "Varietas", "Jenis", "Jumlah", "Dokumen"],
      fields: [
        {
          name: "jenis_bibit",
          label: "Jenis Bibit",
          type: "select",
          options: [
            { label: "Dura", value: "Dura" },
            { label: "Tenera", value: "Tenera" },
            { label: "Pisifera", value: "Pisifera" },
          ],
          required: true,
        },
        {
          name: "varietas_bibit_nama",
          label: "Nama Varietas",
          placeholder: "Pilih varietas atau ketik baru...",
          type: "history_text",
          historySource: "bibit",
          historyKey: "varietas_bibit_nama",
          historyFilter: (item) => item.jenis_bibit === "Tenera",
          showIf: (data) => data.jenis_bibit === "Tenera",
          required: true,
        },
        {
          name: "jumlah_awal",
          label: "Jumlah Bibit (Butir/Polybag)",
          placeholder: "0",
          type: "number",
          required: true,
        },
        {
          name: "asal_bibit",
          label: "Asal Bibit",
          placeholder: "Contoh: Penangkaran Resmi",
          type: "text",
          required: true,
        },
        {
          name: "tanggal_pembelian",
          label: "Tanggal Pembelian",
          type: "date",
          required: true,
        },
        {
          name: "file_sertifikat",
          label: "Sertifikat Bibit (Wajib)",
          type: "file",
          required: true,
        },
        {
          name: "file_nota",
          label: "Nota Pembelian (Wajib)",
          type: "file",
          required: true,
        },
      ],
    },
    pupuk: {
      title: "Stok Pupuk",
      endpoint: API_ENDPOINTS.FARM.PETANI.INVENTARIS.ADD_PUPUK,
      icon: <Wheat className="w-5 h-5" />,
      columns: ["Nama Pupuk", "Jenis", "Asal", "Jumlah", "Tgl Beli", "Dokumen"],
      fields: [
        {
          name: "nama_pupuk",
          label: "Nama Pupuk",
          placeholder: "Pilih pupuk atau ketik baru...",
          type: "history_text",
          historySource: "pupuk",
          historyKey: "nama_pupuk",
          required: true,
        },
        {
          name: "jenis_pupuk",
          label: "Jenis Pupuk",
          type: "select",
          options: [
            { label: "Organik", value: "Organik" },
            { label: "Anorganik", value: "Anorganik" },
            { label: "Hayati", value: "Hayati" },
            { label: "Amelioran/Kapur", value: "Amelioran/Kapur" },
            { label: "Pupuk Mikro", value: "Pupuk Mikro" },
          ],
          required: true,
        },
        {
          name: "jumlah_awal_kg",
          label: "Jumlah Beli (Kg)",
          placeholder: "0",
          type: "number",
          required: true,
        },
        {
          name: "asal_pupuk",
          label: "Asal Pupuk",
          placeholder: "Contoh: KUD / Toko Pertanian",
          type: "text",
          required: true,
        },
        {
          name: "tanggal_pembelian",
          label: "Tanggal Pembelian",
          type: "date",
          required: true,
        },
        {
          name: "file_sertifikat",
          label: "Foto / Sertifikat Pupuk (wajib)",
          type: "file",
          required: true,
        },
        {
          name: "file_nota",
          label: "Nota Pembelian (wajib)",
          type: "file",
          required: true,
        },
      ],
    },
    pestisida: {
      title: "Stok Pestisida",
      endpoint: API_ENDPOINTS.FARM.PETANI.INVENTARIS.ADD_PESTISIDA,
      icon: <SprayCan className="w-5 h-5" />,
      columns: ["Nama", "Jenis", "Jumlah", "Bentuk", "Expired", "Dokumen"],
      fields: [
        {
          name: "nama_pestisida",
          label: "Nama Pestisida",
          placeholder: "Pilih pestisida atau ketik baru...",
          type: "history_text",
          historySource: "pestisida",
          historyKey: "nama_pestisida",
          required: true,
        },
        {
          name: "jenis_pestisida",
          label: "Jenis Pestisida",
          type: "select",
          options: [
            { label: "Insektisida (Serangga)", value: "Insektisida" },
            { label: "Fungisida (Jamur)", value: "Fungisida" },
            { label: "Herbisida (Gulma)", value: "Herbisida" },
            { label: "Nematisida (Cacing)", value: "Nematisida" },
          ],
          required: true,
        },
        {
          name: "satuan",
          label: "Satuan",
          type: "select",
          options: [
            { label: "Liter", value: "liter" },
            { label: "Kilogram", value: "kg" },
          ],
          required: true,
        },
        {
          name: "bentuk",
          label: "Bentuk Fisik",
          type: "select",
          options: [
            { label: "Cair", value: "Cair" },
            { label: "Padat", value: "Padat" },
            { label: "Gas", value: "Gas" },
          ],
          required: true,
        },
        {
          name: "jumlah_awal",
          label: "Jumlah Beli",
          type: "number",
          required: true,
        },
        {
          name: "tanggal_expired",
          label: "Tanggal Kadaluarsa",
          type: "date",
          required: true,
        },
        {
          name: "file_sertifikat",
          label: "Foto / Sertifikat Pestisida (Wajib)",
          type: "file",
          required: true,
        },
      ],
    },
  };

  // --- LOGIC: SAVE DATA (POST) ---
  const handleSave = async () => {
    if (!popupType) return;
    setIsSaving(true);
    setErrorMsg("");

    const config = tableConfig[popupType];
    if (!config) return null;

    const url = config.endpoint;
    const token = getToken();
    const payload = new FormData();

    for (const field of config.fields) {
      if (field.showIf && !field.showIf(formData)) {
        continue;
      }
      const val = formData[field.name];
      if (field.required) {
        if (val === undefined || val === null || val === "") {
          setIsSaving(false);
          setErrorMsg(
            `Kolom "${field.label}" belum diisi. Silakan lengkapi terlebih dahulu.`,
          );
          return;
        }
      }
    }

    config.fields.forEach((field) => {
      if (field.showIf && !field.showIf(formData)) return;
      const val = formData[field.name];
      if (val !== undefined && val !== null && val !== "") {
        if (field.type === "file") {
          if (val instanceof File) {
            payload.append(field.name, val);
          }
        } else {
          payload.append(field.name, val);
        }
      }
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      const resJson = await response.json();

      if (!response.ok) {
        let message = "Gagal menyimpan data.";
        if (resJson.detail) {
          if (typeof resJson.detail === "string") {
            message = resJson.detail;
          } else if (Array.isArray(resJson.detail)) {
            message = resJson.detail
              .map((err) => {
                const field = err.loc ? err.loc[err.loc.length - 1] : "";
                return `${field}: ${err.msg}`;
              })
              .join(" | ");
          }
        }
        throw new Error(message);
      }

      await fetchInventaris();
      handleClosePopup();
      showToast.success(NOTIF_MESSAGES.SAVE_SUCCESS || "Data berhasil disimpan!");
    } catch (error) {
      console.error("Save error:", error);
      setErrorMsg(error.message);
    } finally {
      setIsSaving(false);
    }
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
              Tambah {config.title.replace("Stok ", "").replace("Daftar ", "")}
            </h3>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex gap-2 items-start">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            {config.fields.map((f, i) => {
              if (f.showIf && !f.showIf(formData)) {
                return null;
              }

              const labelEl = (
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {f.label}{" "}
                  {f.required && <span className="text-red-500">*</span>}
                </label>
              );

              // 1. Render Logic untuk History Text (Auto-complete/Input)
              if (f.type === "history_text") {
                let sourceData = rawInventarisData[f.historySource] || [];
                if (f.historyFilter) {
                  sourceData = sourceData.filter(f.historyFilter);
                }
                const historyOptions = [
                  ...new Set(
                    sourceData
                      .map((item) => item[f.historyKey])
                      .filter(Boolean),
                  ),
                ];
                const isManual = manualInputMode[f.name];
                const showAsSelect = historyOptions.length > 0 && !isManual;

                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      {labelEl}
                      {historyOptions.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setManualInputMode((prev) => ({
                              ...prev,
                              [f.name]: !prev[f.name],
                            }));
                            setFormData((prev) => ({ ...prev, [f.name]: "" }));
                          }}
                          className="text-[10px] text-blue-600 hover:underline font-bold"
                        >
                          {isManual ? "Pilih dari Riwayat" : "+ Input Manual"}
                        </button>
                      )}
                    </div>
                    {showAsSelect ? (
                      <div className="relative">
                        <select
                          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-100 outline-none appearance-none bg-white"
                          value={formData[f.name] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "MANUAL_TRIGGER") {
                              setManualInputMode((prev) => ({
                                ...prev,
                                [f.name]: true,
                              }));
                              setFormData((prev) => ({
                                ...prev,
                                [f.name]: "",
                              }));
                            } else {
                              setFormData({ ...formData, [f.name]: val });
                            }
                          }}
                        >
                          <option value="" disabled>
                            Pilih {f.label}
                          </option>
                          {historyOptions.map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt}
                            </option>
                          ))}
                          <option
                            value="MANUAL_TRIGGER"
                            className="font-bold text-blue-600 bg-blue-50"
                          >
                            + Ketik Baru Manual
                          </option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        value={formData[f.name] || ""}
                        autoFocus={isManual}
                        onChange={(e) =>
                          setFormData({ ...formData, [f.name]: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-100 outline-none"
                      />
                    )}
                  </div>
                );
              }

              // 2. Render Logic Default (Input, Select, Textarea, File)
              return (
                <div key={i}>
                  {labelEl}
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
                        {f.options.map((opt, idx) => {
                          const val = typeof opt === "object" ? opt.value : opt;
                          const lbl = typeof opt === "object" ? opt.label : opt;
                          return (
                            <option key={idx} value={val}>
                              {lbl}
                            </option>
                          );
                        })}
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
                          if (!isValidFileType(file)) {
                            showToast.error(
                              "Jenis dokumen tidak didukung. Harap masukkan file PDF, JPG, atau PNG."
                            );
                            e.target.value = "";
                            return;
                          }
                          setFormData({ ...formData, [f.name]: file });
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
                        <span className="text-[#EF8523] font-bold text-xs whitespace-nowrap">
                          CARI FILE
                        </span>
                      </label>
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
                  ) : f.type === "textarea" ? (
                    <textarea
                      rows={3}
                      placeholder={f.placeholder}
                      value={formData[f.name] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.name]: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-100 outline-none resize-none"
                    />
                  ) : (
                    <input
                      type={f.type || "text"}
                      placeholder={f.placeholder}
                      value={formData[f.name] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.name]: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-100 outline-none"
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

  // --- RENDER UTAMA ---
  return (
    // DIBUNGKUS CARD UTAMA DI SINI SESUAI PERMINTAAN
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-5 sm:p-8 text-gray-800 font-sans animate-in fade-in">
      {/* INFO BOX KHUSUS PETANI (Tetap dipertahankan) */}
      <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8 bg-blue-50 p-4 sm:p-5 rounded-2xl border border-blue-100 shadow-sm">
        <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
          Fitur ini harus diisi sebelum input data blok/rencana tanam. Gunakan
          menu ini untuk mencatat aset dan stok gudang Anda (Bibit, Pupuk,
          Pestisida). Stok akan <strong>berkurang otomatis</strong> saat Anda
          melakukan kegiatan Rencana Tanam atau Monitoring.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* CARD INVENTARIS ALAT */}
        <SectionCard title="Inventaris Alat">
          {isLoading ? (
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

        {/* CARD INVENTARIS BARANG */}
        <SectionCard title="Inventaris Barang">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-[#B5302D] animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-6 sm:gap-8">
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

// ===================== COMPONENT HELPERS ===================== //

// SAMA PERSIS DENGAN KEBUN (GARIS GRADIENT)
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

// TABEL DAN HEADER TABEL SAMA PERSIS DENGAN KEBUN
const Section = ({ config, data, onAdd }) => (
  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
    <div className="flex justify-between items-center px-4 sm:px-5 py-3 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center gap-2 font-bold text-gray-700">
        <div className="text-gray-800">{config.icon}</div>
        <span className="text-sm sm:text-base">{config.title}</span>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-md shadow-green-100 transition-all"
      >
        <Plus className="w-3.5 h-3.5" /> Tambah Stok
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-xs sm:text-sm min-w-[600px] sm:min-w-0">
        <thead className="bg-[#EF8523] text-white">
          <tr>
            <th className="px-3 sm:px-4 py-3 text-left font-semibold pl-4 sm:pl-5 w-10">
              No
            </th>
            {config.columns.map((col, i) => (
              <th key={i} className="px-3 sm:px-4 py-3 text-left font-semibold">
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
            data.map((row, i) => (
              <tr key={i} className="hover:bg-red-50/30 transition-colors">
                <td className="px-3 sm:px-4 py-3 font-medium text-gray-400 pl-4 sm:pl-5">
                  {i + 1}
                </td>
                {row.map((cell, j) => (
                  <td key={j} className="px-3 sm:px-4 py-3 text-gray-700">
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

// TOMBOL HAPUS ALAT (SAMA PERSIS DENGAN KEBUN)
const ActionButtons = ({ onClick, title }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
    title={title || "Hapus Item"}
  >
    <Trash2 className="w-4 h-4" />
  </button>
);
