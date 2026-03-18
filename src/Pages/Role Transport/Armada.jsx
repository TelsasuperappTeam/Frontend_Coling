import React, { useState } from "react";
import { Plus, X, Truck, Users, TruckIcon } from "lucide-react";

export default function Armada() {
  const [popupType, setPopupType] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({});
  const [armadaData, setArmadaData] = useState({
    kendaraan: [],
    kru: [],
  });

  const handleOpenPopup = (type) => {
    setPopupType(type);
    setFormData({});
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupType(null);
  };

  // ========================= TABLE CONFIG ==========================
  const tableConfig = {
    kendaraan: {
      title: "Manajemen Kendaraan",
      icon: <Truck className="w-5 h-5" />,
      color: "#B5302D",
      fields: [
        { label: "Jenis Kendaraan", placeholder: "Contoh: Pick-up" },
        { label: "Nama Kendaraan", placeholder: "Contoh: Colt Diesel" },
        { label: "Plat Kendaraan", placeholder: "Contoh: BK 1234 AB" },
        {
          label: "Kapasitas Angkut (kg)",
          placeholder: "Contoh: 2000",
          type: "number",
        },
      ],
      columns: [
        "No",
        "Jenis",
        "Nama Kendaraan",
        "Plat Nomor",
        "Kapasitas",
        "Kondisi",
        "Status",
      ],
    },
    kru: {
      title: "Manajemen Kru",
      icon: <Users className="w-5 h-5" />,
      color: "#B5302D",
      fields: [
        { label: "Nama Kru", placeholder: "Contoh: Budi Santoso" },
        { label: "Jabatan", placeholder: "Contoh: Sopir / Helper" },
        { label: "Nomor Telepon", placeholder: "Contoh: 0812..." },
      ],
      columns: ["No", "Nama Kru", "Jabatan", "Nomor Telepon", "Status"],
    },
  };

  const handleSave = () => {
    if (!popupType) return;

    const config = tableConfig[popupType];
    const newEntry = config.fields.map((f) => formData[f.label] || "-");

    if (popupType === "kendaraan") {
      newEntry.push("Baik");
      newEntry.push("Ready");
    } else {
      newEntry.push("Ready");
    }

    setArmadaData((prev) => ({
      ...prev,
      [popupType]: [...prev[popupType], newEntry],
    }));

    handleClosePopup();
  };

  const handleConditionChange = (index, newCondition) => {
    const updatedKendaraan = [...armadaData.kendaraan];
    updatedKendaraan[index][4] = newCondition;
    setArmadaData({ ...armadaData, kendaraan: updatedKendaraan });
  };

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <TruckIcon className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#B5302D]">
              Manajemen Armada
            </h1>
            <p className="text-gray-500 text-sm">
              Kelola aset kendaraan dan kru logistik operasional Anda
            </p>
          </div>
        </div>
      </div>

      <div className="">
        <div className="space-y-10">
          {/* SEKSI KENDARAAN */}
          <Section
            title={tableConfig.kendaraan.title}
            icon={tableConfig.kendaraan.icon}
            color={tableConfig.kendaraan.color}
            onAdd={() => handleOpenPopup("kendaraan")}
            columns={tableConfig.kendaraan.columns}
            data={armadaData.kendaraan}
            onConditionChange={handleConditionChange}
          />

          {/* SEKSI KRU */}
          <Section
            title={tableConfig.kru.title}
            icon={tableConfig.kru.icon}
            color={tableConfig.kru.color}
            onAdd={() => handleOpenPopup("kru")}
            columns={tableConfig.kru.columns}
            data={armadaData.kru}
          />
        </div>
      </div>

      {/* POPUP MODAL */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={handleClosePopup}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold text-[#B5302D] mb-4 flex items-center gap-2">
              {tableConfig[popupType].icon}
              Tambah {tableConfig[popupType].title}
            </h3>

            <div className="space-y-4">
              {tableConfig[popupType].fields.map((f, i) => (
                <div key={i}>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">
                    {f.label}
                  </label>
                  <input
                    type={f.type || "text"}
                    placeholder={f.placeholder}
                    value={formData[f.label] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [f.label]: e.target.value })
                    }
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleSave}
                className="w-full sm:w-auto px-10 py-2.5 bg-[#B5302D] text-white rounded-xl text-xs font-bold shadow-lg shadow-red-100 hover:bg-[#a72a28] transition-all"
              >
                Simpan Data
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
    {/* Decorative Header Line */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />

    <h3 className="text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

function Section({
  title,
  icon,
  onAdd,
  columns,
  data,
  onConditionChange,
}) {
  return (
    <SectionCard
      title={
        <div className="flex justify-between items-center w-full">
          <span className="flex items-center gap-2">
            {icon}
            {title}
          </span>
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 text-[10px] px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100 hover:bg-green-100 transition-all font-bold uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" /> Tambahkan
          </button>
        </div>
      }
    >
      <div className="overflow-x-auto rounded-t-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#B5302D] text-white">
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
            {data.length === 0 ? (
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
                  key={rowIndex}
                  className="hover:bg-gray-50/80 transition-all"
                >
                  <td className="px-5 py-3.5 text-xs font-bold text-gray-400">
                    {rowIndex + 1}
                  </td>
                  {row.map((val, colIndex) => {
                    // Logika select untuk kolom Kondisi Kendaraan
                    if (title === "Manajemen Kendaraan" && colIndex === 4) {
                      return (
                        <td key={colIndex} className="px-5 py-3.5">
                          <select
                            value={val}
                            onChange={(e) =>
                              onConditionChange(rowIndex, e.target.value)
                            }
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-[11px] font-bold outline-none focus:border-red-200 transition-all"
                          >
                            <option value="Baik">Baik</option>
                            <option value="Rusak">Rusak</option>
                          </select>
                        </td>
                      );
                    }
                    return (
                      <td
                        key={colIndex}
                        className="px-5 py-3.5 text-xs font-semibold text-gray-700"
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}