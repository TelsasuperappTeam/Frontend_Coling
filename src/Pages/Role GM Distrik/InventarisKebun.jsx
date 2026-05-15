import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Wrench,
  Sprout,
  Wheat,
  SprayCan,
  Loader2,
  Box,
  Warehouse,
  FileText,
  MapPin,
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

export default function Inventaris() {
  const [inventarisData, setInventarisData] = useState(INITIAL_DATA);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [kebunList, setKebunList] = useState([]);

  const [selectedKebunId, setSelectedKebunId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchDaftarKebun = async () => {
      try {
        const url = API_ENDPOINTS.USER.GMDistrik.GET_KEBUN_LIST;
        const res = await fetch(url, { headers: getAuthHeaders() });

        if (res.ok) {
          const data = await res.json();
          setKebunList(data);

          // --- OTOMATIS PILIH KEBUN PERTAMA ---
          if (data && data.length > 0) {
            const firstKebunId = data[0].auth_id || data[0].id;
            setSelectedKebunId(firstKebunId);
          }
          // --------------------------------------------------
        } else {
          console.error("Gagal mendapatkan daftar kebun, status:", res.status);
          setKebunList([]);
        }
      } catch (error) {
        console.error("Network error saat fetch daftar kebun:", error);
        setKebunList([]);
      }
    };

    fetchDaftarKebun();
  }, []);

  // TAMBAHKAN EFEK INI SEBAGAI PENGGANTI TOGGLE
  useEffect(() => {
    if (selectedKebunId) {
      setInventarisData(INITIAL_DATA);
      fetchInventaris(selectedKebunId);
    }
  }, [selectedKebunId]);

  const fetchInventaris = async (kebunId) => {
    if (!kebunId) return;

    setIsLoadingData(true);
    const headers = getAuthHeaders(false);

    const fetchSafe = async (url) => {
      try {
        // Menggunakan target_kebun_auth_id sesuai requirement Backend GM Distrik
        const urlWithParams = url.includes("?")
          ? `${url}&target_kebun_auth_id=${kebunId}`
          : `${url}?target_kebun_auth_id=${kebunId}`;

        const res = await fetch(urlWithParams, { headers });
        if (!res.ok) {
          const errorDetail = await res.json();
          console.warn(`Gagal fetch ${urlWithParams}:`, errorDetail);
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

  // Konfigurasi tabel khusus Read-Only (Tanpa kolom Aksi)
  const tableConfig = {
    peralatan: {
      title: "Daftar Peralatan",
      icon: <Wrench className="w-5 h-5" />,
      columns: ["Nama Alat", "Jumlah", "Lokasi", "Kepemilikan", "Catatan"],
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
      ],
      renderRow: (item) => [
        item.nama_pupuk,
        item.jenis_pupuk,
        item.asal_pupuk,
        <span className="font-bold text-gray-700">
          {item.jumlah_tersisa_kg} Kg
        </span>,
        item.tanggal_pembelian,
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
      ],
      renderRow: (item) => [
        item.nama_pestisida,
        item.jenis_pestisida,
        `${item.jumlah_tersisa} ${item.satuan}`,
        item.bentuk,
        <span className="text-red-500 font-medium">
          {item.tanggal_expired}
        </span>,
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
      ],
    },
  };

  return (
    // Tambahkan class 'relative' pada div paling luar
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans relative">
      {/* 1. HEADER & DROPDOWN PILIH KEBUN */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
        {/* Judul Kiri */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl shrink-0">
            <Warehouse className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Inventaris Kebun
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Pantau stok alat, peralatan, pupuk, pestisida, dan bibit pada tiap
              distrik.
            </p>
          </div>
        </div>

        {/* Dropdown Kanan (Sejajar dengan Judul di Desktop) */}
        <div className="relative z-30 w-full lg:w-72 shrink-0">
          {/* Overlay tersembunyi untuk menutup dropdown saat klik luar */}
          {isDropdownOpen && (
            <div
              className="fixed inset-0 z-20"
              onClick={() => setIsDropdownOpen(false)}
            />
          )}

          {/* Tombol Utama */}
          <div
            onClick={() =>
              kebunList.length > 0 && setIsDropdownOpen(!isDropdownOpen)
            }
            className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl border cursor-pointer transition-all relative z-30 ${
              isDropdownOpen
                ? "bg-[#B5302D] border-[#B5302D] text-white shadow-md"
                : "bg-red-50 border-red-100 text-[#B5302D] hover:bg-red-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin
                className={`w-4 h-4 sm:w-5 sm:h-5 ${isDropdownOpen ? "text-white" : "text-[#B5302D]"}`}
              />
              <div className="flex flex-col text-left">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider ${isDropdownOpen ? "text-red-200" : "text-[#B5302D]"}`}
                >
                  Pilih Kebun:
                </span>
                <span
                  className={`font-bold text-xs sm:text-sm ${isDropdownOpen ? "text-white" : "text-gray-800"} line-clamp-1`}
                >
                  {kebunList.length === 0
                    ? "Memuat data..."
                    : kebunList.find(
                        (k) => (k.auth_id || k.id) === selectedKebunId,
                      )?.nama_lengkap ||
                      kebunList.find(
                        (k) => (k.auth_id || k.id) === selectedKebunId,
                      )?.nama_kebun ||
                      "-- Silakan Pilih --"}
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-white" : "text-[#B5302D]"}`}
            />
          </div>

          {/* Menu Pilihan (Dropdown Menjuntai) */}
          <div
            className={`absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden transition-all duration-200 origin-top z-30 ${
              isDropdownOpen
                ? "opacity-100 scale-y-100"
                : "opacity-0 scale-y-0 pointer-events-none"
            }`}
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {kebunList.map((kb) => {
                const idKebun = kb.auth_id || kb.id;
                const namaKebun =
                  kb.nama_lengkap || kb.nama_kebun || "Kebun Tanpa Nama";
                const isSelected = idKebun === selectedKebunId;

                return (
                  <div
                    key={idKebun}
                    onClick={() => {
                      setSelectedKebunId(idKebun);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-4 py-3 text-xs sm:text-sm cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-red-50 text-[#B5302D] font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {namaKebun}
                    {isSelected && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#B5302D]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* GARIS PEMBATAS */}
      <hr className="border-gray-200 mb-6 sm:mb-8" />

      {/* 3. KONTEN TABEL INVENTARIS */}
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 z-10 relative">
        {kebunList.length === 0 && !isLoadingData ? (
          <div className="text-center py-10 text-gray-500 italic bg-white rounded-xl border border-gray-200">
            Belum ada data kebun yang terdaftar di distrik ini.
          </div>
        ) : !selectedKebunId ? (
          <div className="text-center py-10 text-gray-500 italic bg-white/50 rounded-xl border border-gray-200 border-dashed">
            Silakan pilih kebun terlebih dahulu untuk melihat inventaris.
          </div>
        ) : (
          <div className="space-y-8 bg-transparent">
            <SectionCard title="Inventaris Alat">
              {isLoadingData ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#B5302D]" />
                  Memuat Data ...
                </div>
              ) : (
                <Section
                  config={tableConfig.peralatan}
                  data={inventarisData.peralatan}
                />
              )}
            </SectionCard>

            <SectionCard title="Inventaris Barang">
              {isLoadingData ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#B5302D]" />
                  Memuat Data ...
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  <Section
                    config={tableConfig.bibit}
                    data={inventarisData.bibit}
                  />
                  <Section
                    config={tableConfig.pupuk}
                    data={inventarisData.pupuk}
                  />
                  <Section
                    config={tableConfig.pestisida}
                    data={inventarisData.pestisida}
                  />
                </div>
              )}
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------
// BAGIAN KOMPONEN UI
// ------------------------------------------------------------------------------------------

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

const Section = ({ config, data }) => (
  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
    <div className="flex justify-between items-center px-5 py-3 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center gap-2 font-bold text-gray-700">
        <div className="text-gray-800">{config.icon}</div>
        <span className="text-sm sm:text-base">{config.title}</span>
      </div>
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
                Data tidak tersedia.
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
