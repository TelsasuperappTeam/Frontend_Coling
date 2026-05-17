import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Truck,
  Users,
  TruckIcon,
  Edit,
  Trash2,
  ChevronDown,
  Save,
  Loader2,
  Tractor,
} from "lucide-react";
import { API_ENDPOINTS } from "../../config/constants.js";
import { showToast, confirmDialog } from "../../utils/notif";

export default function Armada() {
  const [popupType, setPopupType] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({});
  const [armadaData, setArmadaData] = useState({
    kendaraan: [],
    kru: [],
  });

  // State flag untuk mode input manual dropdown
  const [manualInputMode, setManualInputMode] = useState({});

  // 1. Digunakan untuk indikator loading agar tidak error ESLint
  const [isLoading, setIsLoading] = useState(false);

  // 2. State baru untuk melacak apakah sedang Edit atau Tambah Baru
  const [editId, setEditId] = useState(null);

  // --- FUNGSI MENGAMBIL DATA (GET ALL) ---
  const fetchArmadaData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [resKendaraan, resKru] = await Promise.all([
        fetch(API_ENDPOINTS.TRACEABILITY.LOGISTIK.KENDARAAN.GET_ALL, {
          headers,
        }),
        fetch(API_ENDPOINTS.TRACEABILITY.LOGISTIK.KRU.GET_ALL, { headers }),
      ]);

      const dataKendaraan = await resKendaraan.json();
      const dataKru = await resKru.json();

      setArmadaData({
        kendaraan: Array.isArray(dataKendaraan) ? dataKendaraan : [],
        kru: Array.isArray(dataKru) ? dataKru : [],
      });
    } catch (error) {
      console.error("Gagal mengambil data armada:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArmadaData();
  }, []);

  // --- FUNGSI BUKA TUTUP MODAL ---
  const handleOpenPopup = (type, itemData = null) => {
    setPopupType(type);
    setManualInputMode({}); // Reset input manual saat popup dibuka

    if (itemData) {
      // Jika mode EDIT, masukkan data lama ke form
      setEditId(itemData.id);
      if (type === "kendaraan") {
        setFormData({
          jenis_kendaraan_nama:
            itemData.jenis_kendaraan_relasi?.jenis_kendaraan || "",
          nama_kendaraan: itemData.nama_kendaraan,
          plat_kendaraan: itemData.plat_kendaraan,
          kapasitas_angkut_kg: itemData.kapasitas_angkut_kg,
          biaya_per_km: itemData.biaya_per_km,
          kondisi_kendaraan: itemData.kondisi_kendaraan,
        });
      } else {
        setFormData({
          nama_supir: itemData.nama_supir,
          nomor_telepon: itemData.nomor_telepon,
        });
      }
    } else {
      // Jika mode TAMBAH BARU
      setEditId(null);
      setFormData({});
    }

    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupType(null);
    setEditId(null);
    setManualInputMode({}); // Reset input manual saat popup ditutup
  };

  // ========================= TABLE CONFIG ==========================
  // Ditambahkan kolom "Aksi"
  const tableConfig = {
    kendaraan: {
      title: "Manajemen Kendaraan",
      icon: <Tractor className="w-5 h-5" />,
      color: "#B5302D",
      fields: [
        {
          key: "jenis_kendaraan_nama",
          label: "Jenis Kendaraan",
          placeholder: "Ketik jenis kendaraan baru...",
          type: "history_text",
        },
        {
          key: "nama_kendaraan",
          label: "Nama Kendaraan",
          placeholder: "Contoh: Colt Diesel",
        },
        {
          key: "plat_kendaraan",
          label: "Plat Kendaraan",
          placeholder: "Contoh: BK 1234 AB",
        },
        {
          key: "kapasitas_angkut_kg",
          label: "Kapasitas Angkut (kg)",
          placeholder: "Contoh: 2000",
          type: "number",
        },
        {
          key: "biaya_per_km",
          label: "Biaya per KM (Rp)",
          placeholder: "Contoh: 15000",
          type: "number",
        },
        {
          key: "kondisi_kendaraan",
          label: "Kondisi Kendaraan",
          type: "select",
          options: ["Baik", "Rusak"],
        },
      ],
      columns: [
        "No",
        "Jenis",
        "Nama Kendaraan",
        "Plat Nomor",
        "Kapasitas (kg)",
        "Biaya/KM",
        "Kondisi",
        "Status",
        "Aksi",
      ],
    },
    kru: {
      title: "Manajemen Kru",
      icon: <Users className="w-5 h-5" />,
      color: "#B5302D",
      fields: [
        {
          key: "nama_supir",
          label: "Nama Kru",
          placeholder: "Contoh: Budi Santoso",
        },
        {
          key: "nomor_telepon",
          label: "Nomor Telepon",
          type: "number",
          placeholder: "Contoh: 08123456789",
        },
      ],
      columns: ["No", "Nama Supir", "Nomor Telepon", "Status", "Aksi"],
    },
  };

// --- FUNGSI SIMPAN (POST / PATCH) ---
  const handleSave = async () => {
    if (!popupType) return;
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Tentukan URL & Method berdasarkan mode (Edit vs Add)
      const isEdit = editId !== null;
      let url = "";
      let payload = {};

      if (popupType === "kendaraan") {
        url = isEdit
          ? API_ENDPOINTS.TRACEABILITY.LOGISTIK.KENDARAAN.UPDATE(editId)
          : API_ENDPOINTS.TRACEABILITY.LOGISTIK.KENDARAAN.ADD;

        payload = {
          jenis_kendaraan_nama: formData.jenis_kendaraan_nama,
          nama_kendaraan: formData.nama_kendaraan,
          plat_kendaraan: formData.plat_kendaraan,
          kapasitas_angkut_kg: Number(formData.kapasitas_angkut_kg),
          biaya_per_km: Number(formData.biaya_per_km),
          kondisi_kendaraan:
            formData.kondisi_kendaraan?.toLowerCase() || "baik",
        };
      } else if (popupType === "kru") {
        url = isEdit
          ? API_ENDPOINTS.TRACEABILITY.LOGISTIK.KRU.UPDATE(editId)
          : API_ENDPOINTS.TRACEABILITY.LOGISTIK.KRU.ADD;

        payload = {
          nama_supir: formData.nama_supir,
          nomor_telepon: formData.nomor_telepon,
        };
      }

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data ke database.");

      // GANTI ALERT JADI SHOWTOAST SUCCESS (Tanpa konfirmasi ganda)
      showToast.success(
        isEdit ? "Data berhasil diperbarui!" : "Data berhasil ditambahkan!"
      );
      
      handleClosePopup();
      fetchArmadaData();
    } catch (error) {
      showToast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNGSI HAPUS (DELETE) ---
  const handleDelete = async (type, id) => {
    const isSetuju = await confirmDialog({
      title: "Yakin Hapus Data?",
      text: `Apakah Anda yakin ingin menghapus data ${type} ini?`,
      confirmText: "Ya, Hapus!",
      isDanger: true 
    });

    // Jika user klik Batal, hentikan fungsi
    if (!isSetuju) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url =
        type === "kendaraan"
          ? API_ENDPOINTS.TRACEABILITY.LOGISTIK.KENDARAAN.DELETE(id)
          : API_ENDPOINTS.TRACEABILITY.LOGISTIK.KRU.DELETE(id);

      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok)
        throw new Error("Gagal menghapus data. Mungkin data sedang digunakan.");

      showToast.success("Data berhasil dihapus.");
      fetchArmadaData();
    } catch (error) {
      showToast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNGSI GANTI KONDISI CEPAT DARI TABEL (PATCH KENDARAAN) ---
  const handleConditionChange = async (rowIndex, newCondition) => {
    const kendaraanId = armadaData.kendaraan[rowIndex].id;
    const kondisi_baru = newCondition.toLowerCase();

    try {
      const token = localStorage.getItem("token");
      const url =
        API_ENDPOINTS.TRACEABILITY.LOGISTIK.KENDARAAN.UPDATE(kendaraanId);

      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ kondisi_kendaraan: kondisi_baru }),
      });

      if (!res.ok) throw new Error("Gagal mengubah kondisi kendaraan.");
      
      fetchArmadaData();
      showToast.success("Kondisi kendaraan berhasil diubah.");
    } catch (error) {
      showToast.error(error.message);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8 min-h-screen font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 sm:mb-7">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <Truck className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Manajemen Armada
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Kelola aset kendaraan dan kru logistik operasional Anda
            </p>
          </div>
        </div>
      </div>

      {/* --- GARIS PEMBATAS --- */}
      <hr className="border-gray-200 mb-8" />

      <div className="space-y-10">
        {/* SEKSI KENDARAAN */}
        <Section
          type="kendaraan"
          title={tableConfig.kendaraan.title}
          icon={tableConfig.kendaraan.icon}
          onAdd={() => handleOpenPopup("kendaraan")}
          onEdit={(item) => handleOpenPopup("kendaraan", item)}
          onDelete={(id) => handleDelete("kendaraan", id)}
          columns={tableConfig.kendaraan.columns}
          data={armadaData.kendaraan}
          isLoading={isLoading}
          onConditionChange={handleConditionChange}
        />

        {/* SEKSI KRU */}
        <Section
          type="kru"
          title={tableConfig.kru.title}
          icon={tableConfig.kru.icon}
          onAdd={() => handleOpenPopup("kru")}
          onEdit={(item) => handleOpenPopup("kru", item)}
          onDelete={(id) => handleDelete("kru", id)}
          columns={tableConfig.kru.columns}
          data={armadaData.kru}
          isLoading={isLoading}
        />
      </div>

      {/* POPUP MODAL */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header Modal yang Baru */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-50 rounded-lg text-[#B5302D]">
                {tableConfig[popupType].icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {editId
                  ? `Edit ${tableConfig[popupType].title.replace("Manajemen ", "")}`
                  : `Tambah ${tableConfig[popupType].title.replace("Manajemen ", "")}`}
              </h3>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4">
              {tableConfig[popupType].fields.map((f, i) => {
                const isHistoryText = f.type === "history_text";

                // Ambil opsi riwayat unik (khusus kendaraan)
                const historyOptions = isHistoryText
                  ? [
                      ...new Set(
                        armadaData.kendaraan
                          .map((k) => k.jenis_kendaraan_relasi?.jenis_kendaraan)
                          .filter(Boolean),
                      ),
                    ]
                  : [];

                const isManual = manualInputMode[f.key];
                const showAsSelect =
                  isHistoryText && historyOptions.length > 0 && !isManual;

                return (
                  <div key={i}>
                    {/* LABEL & TOMBOL TOGGLE (Jika history_text) */}
                    {isHistoryText ? (
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-sm font-semibold text-gray-700">
                          {f.label}
                        </label>
                        {historyOptions.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setManualInputMode((prev) => ({
                                ...prev,
                                [f.key]: !prev[f.key],
                              }));
                              setFormData((prev) => ({ ...prev, [f.key]: "" }));
                            }}
                            className="text-[10px] text-blue-600 hover:underline font-bold"
                          >
                            {isManual ? "Pilih dari Riwayat" : "+ Input Manual"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        {f.label}
                      </label>
                    )}

                    {/* INPUT FIELD */}
                    {isHistoryText ? (
                      showAsSelect ? (
                        <div className="relative">
                          <select
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-100 outline-none appearance-none bg-white"
                            value={formData[f.key] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "MANUAL_TRIGGER") {
                                setManualInputMode((prev) => ({
                                  ...prev,
                                  [f.key]: true,
                                }));
                                setFormData((prev) => ({
                                  ...prev,
                                  [f.key]: "",
                                }));
                              } else {
                                setFormData({ ...formData, [f.key]: val });
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
                          value={formData[f.key] || ""}
                          autoFocus={isManual}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [f.key]: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-100 outline-none"
                        />
                      )
                    ) : f.type === "select" ? (
                      <div className="relative">
                        <select
                          value={formData[f.key]?.toLowerCase() || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [f.key]: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-100 outline-none appearance-none bg-white"
                        >
                          <option value="" disabled>
                            Pilih {f.label}
                          </option>
                          {f.options.map((opt, idx) => (
                            <option key={idx} value={opt.toLowerCase()}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    ) : (
                      <input
                        type={f.type || "text"}
                        placeholder={f.placeholder}
                        value={formData[f.key] || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, [f.key]: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-100 outline-none"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tombol Simpan yang Baru */}
            <div className="flex justify-end mt-8">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#B5302D] text-white rounded-xl text-sm font-bold hover:bg-[#a72a28] shadow-lg shadow-red-200 transition-all disabled:opacity-50 w-full sm:w-auto justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isLoading ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= COMPONENT HELPER & SECTIONS =================
const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden group hover:shadow-md transition-all">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />
    <h3 className="text-base sm:text-lg font-bold text-[#B5302D] flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

function Section({
  type,
  title,
  icon,
  onAdd,
  onEdit,
  onDelete,
  columns,
  data,
  isLoading,
  onConditionChange,
}) {
  return (
    <SectionCard
      title={
        <div className="flex justify-between items-center w-full">
          <span className="flex items-center gap-2">
            {icon} {title}
          </span>
          <button
            onClick={onAdd}
            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg shadow-green-100 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Data
          </button>
        </div>
      }
    >
      <div className="overflow-x-auto rounded-t-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#EF8523] text-white">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider first:rounded-tl-2xl last:rounded-tr-2xl"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-gray-400 italic text-xs"
                >
                  Memuat data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-gray-400 italic text-xs"
                >
                  Belum ada data tersedia.
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="hover:bg-gray-50/80 transition-all"
                >
                  <td className="px-5 py-3.5 text-xs font-bold text-gray-400">
                    {rowIndex + 1}
                  </td>

                  {type === "kendaraan" ? (
                    <>
                      <td className="px-5 py-3.5 text-xs font-semibold text-gray-700">
                        {row.jenis_kendaraan_relasi?.jenis_kendaraan}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-gray-700">
                        {row.nama_kendaraan}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-gray-700">
                        {row.plat_kendaraan}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-gray-700">
                        {row.kapasitas_angkut_kg}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-gray-700">
                        Rp {row.biaya_per_km}
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={row.kondisi_kendaraan?.toLowerCase()}
                          onChange={(e) =>
                            onConditionChange(rowIndex, e.target.value)
                          }
                          className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-[11px] font-bold outline-none focus:border-red-200 transition-all"
                        >
                          <option value="baik">Baik</option>
                          <option value="rusak">Rusak</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-bold">
                        <span
                          className={`px-2 py-1 rounded-full ${row.status_kendaraan?.toUpperCase() === "TERSEDIA" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {row.status_kendaraan}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3.5 text-xs font-semibold text-gray-700">
                        {row.nama_supir}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-gray-700">
                        {row.nomor_telepon}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-bold">
                        <span
                          className={`px-2 py-1 rounded-full ${row.status?.toUpperCase() === "TERSEDIA" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </>
                  )}

                  {/* KOLOM AKSI (EDIT & DELETE) */}
                  <td className="px-5 py-3.5 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(row)}
                        className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Edit Data"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(row.id)}
                        className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        title="Hapus Data"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
