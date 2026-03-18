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
  ClipboardList,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import {
  API_ENDPOINTS,
  NOTIF_MESSAGES,
  getFileUrl,
  API_BASE_URLS,
} from "../../../config/constants";

const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

// Fungsi helper untuk validasi tipe file yang diupload
const isValidFileType = (file) => {
  if (!file) return false;
  return ALLOWED_FILE_TYPES.includes(file.type);
};

export default function Inventaris() {
  const [openSection, setOpenSection] = useState(null);
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

  // Ref untuk menyimpan fungsi fetchInventaris agar bisa dipanggil di handleDelete
  // tanpa menyebabkan circular dependency (infinite loop) pada useEffect/useCallback
  const fetchRef = useRef(null);

  const getToken = () => localStorage.getItem("token");

  // --- LOGIC: DELETE PERALATAN ---
  /**
   * Menghapus data peralatan berdasarkan ID.
   * (SESUAI BE MAHAR): Menggunakan method DELETE ke endpoint spesifik ID peralatan.
   */
  const handleDeletePeralatan = useCallback(async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus alat ini?")) return;

    try {
      const token = localStorage.getItem("token"); // Ambil token langsung
      const url = `${API_BASE_URLS.FARM}/farm/me/inventaris/peralatan/${id}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus peralatan.");
      }

      alert("Peralatan berhasil dihapus.");

      // Refresh data tabel setelah delete berhasil
      if (fetchRef.current) {
        fetchRef.current();
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }, []);

  // --- LOGIC: FETCH DATA (GET) ---
  /**
   * Mengambil semua data inventaris (Alat, Bibit, Pupuk, Pestisida) dari server.
   * (SESUAI BE MAHAR): Melakukan 4 request paralel (Promise.all) agar efisien,
   * lalu memetakan data JSON menjadi format Array untuk tabel.
   */
  const fetchInventaris = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      // Request paralel ke semua endpoint inventaris
      const [resAlat, resBibit, resPupuk, resPestisida] = await Promise.all([
        fetch(API_ENDPOINTS.FARM.PETANI.INVENTARIS.GET_PERALATAN, { headers }),
        fetch(API_ENDPOINTS.FARM.PETANI.INVENTARIS.GET_BIBIT, { headers }),
        fetch(API_ENDPOINTS.FARM.PETANI.INVENTARIS.GET_PUPUK, { headers }),
        fetch(API_ENDPOINTS.FARM.PETANI.INVENTARIS.GET_PESTISIDA, { headers }),
      ]);

      if (!resAlat.ok || !resBibit.ok || !resPupuk.ok || !resPestisida.ok) {
        throw new Error("Gagal mengambil data inventaris dari server.");
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

      // Fungsi internal untuk merubah data JSON menjadi baris Tabel (Array)
      const mapToTable = (items, type) => {
        return items.map((item) => {
          if (type === "alat") {
            return [
              item.nama_alat,
              `${item.jumlah_per_buah} unit`,
              item.lokasi_penyimpanan || "-",
              item.status_kepemilikan,
              item.catatan || "-",
              // Tombol Delete menggunakan handleDeletePeralatan
              <button
                key={`del-${item.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePeralatan(item.id);
                }}
                className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                title="Hapus Alat"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>,
            ];
          }
          if (type === "bibit") {
            return [
              item.tanggal_pembelian,
              item.nama_varietas || "-",
              item.jenis_bibit,
              `${item.jumlah_tersisa} batang`,
              renderFileLink(item.sertifikat_bibit_url),
              renderFileLink(item.nota_pembelian_url),
            ];
          }
          if (type === "pupuk") {
            return [
              item.nama_pupuk,
              item.jenis_pupuk,
              item.asal_pupuk,
              `${item.jumlah_tersisa_kg} kg`,
              item.tanggal_pembelian,
              renderFileLink(item.nota_pembelian_url),
            ];
          }
          if (type === "pestisida") {
            return [
              item.nama_pestisida,
              item.jenis_pestisida,
              `${item.jumlah_tersisa} ${item.satuan}`,
              item.bentuk || "-",
              item.tanggal_expired || "-",
              renderFileLink(item.sertifikat_pestisida_url),
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

  // Helper untuk render link download dokumen
  const renderFileLink = (path) => {
    if (!path) return <span className="text-gray-400">-</span>;
    return (
      <a
        href={getFileUrl(path, "FARM")}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 hover:text-blue-800 underline text-[10px] sm:text-xs font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        Lihat Dokumen
      </a>
    );
  };

  // Sinkronisasi fetchRef dengan fungsi fetchInventaris saat ini
  useEffect(() => {
    fetchRef.current = fetchInventaris;
  }, [fetchInventaris]);

  useEffect(() => {
    fetchInventaris();
  }, [fetchInventaris]);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

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
      title: "Inventaris Alat",
      endpoint: API_ENDPOINTS.FARM.PETANI.INVENTARIS.ADD_PERALATAN,
      icon: <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />,
      columns: ["Nama Alat", "Jumlah", "Lokasi", "Status", "Kondisi", "Aksi"],
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
          placeholder: "Contoh: Gudang Belakang",
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
      icon: <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />,
      columns: ["Tgl Beli", "Varietas", "Jenis", "Jumlah", "Sertif", "Nota"],
      fields: [
        {
          name: "jenis_bibit",
          label: "Jenis Bibit",
          placeholder: "Contoh: Dura/Tenera/Pisifera",
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
          placeholder: "dd/mm/yyyy",
          type: "date",
          required: true,
        },
        {
          name: "file_sertifikat",
          label: "Sertifikat Bibit",
          type: "file",
          required: true,
        },
        {
          name: "file_nota",
          label: "Nota Pembelian",
          type: "file",
          required: true,
        },
      ],
    },
    pupuk: {
      title: "Stok Pupuk",
      endpoint: API_ENDPOINTS.FARM.PETANI.INVENTARIS.ADD_PUPUK,
      icon: <Wheat className="w-4 h-4 sm:w-5 sm:h-5" />,
      columns: ["Nama Pupuk", "Jenis", "Asal", "Jumlah", "Tgl Beli", "Nota"],
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
          label: "Sertifikat Bibit",
          type: "file",
          required: true,
        },
        {
          name: "file_nota",
          label: "Nota Pembelian",
          type: "file",
          required: true,
        },
      ],
    },
    pestisida: {
      title: "Stok Pestisida",
      endpoint: API_ENDPOINTS.FARM.PETANI.INVENTARIS.ADD_PESTISIDA,
      icon: <SprayCan className="w-4 h-4 sm:w-5 sm:h-5" />,
      columns: ["Nama", "Jenis", "Jumlah", "Bentuk", "Expired", "Sertif"],
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
          placeholder: "LITER / KG / BOTOL",
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
          label: "file Sertifikat",
          type: "file",
          required: true,
        },
      ],
    },
  };

  // --- LOGIC: SAVE DATA (POST) ---
  /**
   * Menangani pengiriman data form ke server.
   * (SESUAI BE MAHAR): Menggunakan FormData untuk menghandle file upload dan JSON fields sekaligus.
   */
  const handleSave = async () => {
    if (!popupType) return;
    setIsSaving(true);
    setErrorMsg("");

    const config = tableConfig[popupType];
    if (!config) return null;

    const url = config.endpoint;
    const token = getToken();
    const payload = new FormData();

    // Validasi Field Wajib
    for (const field of config.fields) {
      if (field.showIf && !field.showIf(formData)) {
        continue;
      }
      const val = formData[field.name];
      if (field.required) {
        if (val === undefined || val === null || val === "") {
          setIsSaving(false);
          setErrorMsg(`Field "${field.label}" wajib diisi.`);
          return;
        }
      }
    }

    // Append data ke FormData (Format disesuaikan dengan BE Python)
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
      alert(NOTIF_MESSAGES.SAVE_SUCCESS || "Data berhasil disimpan!");
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
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto border border-gray-100 animate-in fade-in zoom-in duration-200">
          <button
            onClick={handleClosePopup}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 bg-red-50 rounded-lg text-[#B5302D]">
              {config.icon ?? <Wrench className="w-5 h-5 opacity-40" />}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
              Tambah {config.title.split(" ")[1]}
            </h3>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-md flex gap-2 items-start">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            {config.fields.map((f, i) => {
              if (f.showIf && !f.showIf(formData)) {
                return null;
              }

              // Label Styling
              const labelEl = (
                <label className="block font-semibold text-gray-800 mb-1 text-xs sm:text-base">
                  {f.label}{" "}
                  {f.required && <span className="text-red-500">*</span>}
                </label>
              );

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
                    <div className="flex justify-between items-center mb-1">
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
                          className="text-[10px] sm:text-xs text-blue-600 hover:underline font-medium"
                        >
                          {isManual ? "Pilih dari Riwayat" : "+ Input Baru"}
                        </button>
                      )}
                    </div>

                    {showAsSelect ? (
                      <div className="relative">
                        <select
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
                          className="w-full bg-gray-50 border border-gray-300 rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm focus:ring-1 focus:ring-red-200 outline-none"
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
                            + Tambahkan Baru
                          </option>
                        </select>
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
                        className="w-full bg-gray-50 border border-gray-300 rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm focus:ring-1 focus:ring-red-200 outline-none"
                      />
                    )}
                  </div>
                );
              }

              return (
                <div key={i}>
                  {labelEl}
                  {f.type === "file" ? (
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (!isValidFileType(file)) {
                          setErrorMsg(
                            "Jenis file tidak didukung. Gunakan PDF atau foto (JPG / PNG).",
                          );
                          e.target.value = "";
                          return;
                        }
                        setErrorMsg("");
                        setFormData({ ...formData, [f.name]: file });
                      }}
                      className="block w-full text-xs text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-md file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-[#EF8523] file:text-white hover:file:bg-[#d06d1e]"
                    />
                  ) : f.type === "select" ? (
                    <div className="relative">
                      <select
                        value={formData[f.name] || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, [f.name]: e.target.value })
                        }
                        className="w-full bg-gray-50 border border-gray-300 rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm focus:ring-1 focus:ring-red-200 outline-none"
                      >
                        <option value="" disabled>
                          Pilih {f.label}
                        </option>
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
                    </div>
                  ) : f.type === "textarea" ? (
                    <textarea
                      rows={3}
                      placeholder={f.placeholder}
                      value={formData[f.name] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.name]: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-300 rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm focus:ring-1 focus:ring-red-200 outline-none"
                    />
                  ) : (
                    <input
                      type={f.type || "text"}
                      placeholder={f.placeholder}
                      value={formData[f.name] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.name]: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-300 rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm focus:ring-1 focus:ring-red-200 outline-none"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full sm:w-auto px-6 py-2 rounded-md text-sm font-medium text-white transition flex items-center justify-center gap-2 ${
                isSaving ? "bg-gray-400" : "bg-[#B5302D] hover:bg-[#a72a28]"
              }`}
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
    // Update container utama: rounded-2xl, shadow-md, p-3 sm:p-8
    <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-3 sm:p-8 text-gray-800">
      <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8 bg-blue-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-100">
        <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
          Gunakan menu ini untuk mencatat aset dan stok gudang Anda (Bibit,
          Pupuk, Pestisida). Stok akan <strong>berkurang otomatis</strong> saat
          Anda melakukan kegiatan Rencana Tanam atau Monitoring.
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#EF8523] animate-spin" />
          <p className="text-sm font-medium text-gray-500">Memuat Halaman...</p>
        </div>
      )}

      {/* Accordion Sections */}
      {!isLoading &&
        [
          { id: "peralatan", config: tableConfig.peralatan },
          {
            id: "barang",
            title: "Inventaris Barang",
            icon: <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />,
            subKeys: ["bibit", "pupuk", "pestisida"],
          },
        ].map((section) => (
          // Update container accordion: rounded-xl (agar sesuai referensi), mb-6
          <div
            key={section.id}
            className="border border-gray-300 rounded-xl mb-6 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Update button accordion: px-4 py-3 sm:px-5 sm:py-5, text-sm sm:text-base */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex justify-between items-center px-4 py-3 sm:px-5 sm:py-5 font-bold text-white text-left bg-[#EF8523] hover:bg-[#e07a1f] transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {section.config?.icon || section.icon || (
                  <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span className="text-sm sm:text-base">
                  {section.config?.title || section.title}
                </span>
              </div>
              {/* REVISI: Logika Dropdown Icon (Arrow Up/Down) */}
              {openSection === section.id ? (
                <ChevronUp className="w-5 h-5 text-white transition-transform duration-300" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white transition-transform duration-300" />
              )}
            </button>

            {openSection === section.id && (
              // Update content padding: p-3 sm:p-6
              <div className="p-3 sm:p-6 bg-white space-y-8 overflow-x-auto">
                {section.subKeys ? (
                  section.subKeys.map((key) => (
                    <Section
                      key={key}
                      title={tableConfig[key].title}
                      icon={tableConfig[key].icon}
                      color="black"
                      onAdd={() => handleOpenPopup(key)}
                      columns={tableConfig[key].columns}
                      data={inventarisData[key]}
                    />
                  ))
                ) : (
                  <Section
                    title={section.config?.title}
                    icon={section.config?.icon}
                    color="black"
                    onAdd={() => handleOpenPopup(section.id)}
                    columns={section.config?.columns || []}
                    data={inventarisData[section.id]}
                  />
                )}
              </div>
            )}
          </div>
        ))}

      {showPopup && renderPopupForm()}
    </div>
  );
}

// Sub-Component untuk Tabel Per Bagian
function Section({ title, icon, color, onAdd, columns, data }) {
  const safeColumns = Array.isArray(columns) ? columns : [];

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden">
      <div className="flex justify-between items-center px-3 py-3 sm:px-5 sm:py-4 bg-gray-50 border-b border-gray-300">
        <div className="flex items-center gap-2 font-bold text-gray-700">
          <div style={{ color }}>{icon}</div>
          <span className="text-sm sm:text-base">{title}</span>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 text-[10px] sm:text-xs px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all font-medium shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah Stok
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm min-w-[600px] sm:min-w-0">
          <thead className="bg-[#B5302D] text-white">
            <tr>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold pl-3 sm:pl-5 w-8 sm:w-10 whitespace-nowrap">
                No
              </th>
              {safeColumns.map((col, i) => (
                <th
                  key={`col-${i}-${col}`}
                  className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {!data || data.length === 0 ? (
              <tr>
                <td
                  colSpan={safeColumns.length + 1}
                  className="text-center py-6 sm:py-8 text-gray-400 italic bg-gray-50/50"
                >
                  Belum ada data {title ? title.toLowerCase() : "item"}. Klik
                  "Tambah Stok".
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-red-50/30 transition-colors">
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 pl-3 sm:pl-5">
                    {i + 1}
                  </td>
                  {row.map((val, j) => (
                    <td
                      key={`r${i}-c${j}`}
                      className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700"
                    >
                      {val}
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
}
