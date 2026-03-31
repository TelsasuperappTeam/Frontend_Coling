import React, { useState, useEffect } from "react";
import {
  Wrench,
  Sprout,
  Wheat,
  SprayCan,
  Loader2,
  Box,
  Warehouse,
  FileText,
} from "lucide-react";

import { API_ENDPOINTS } from "../../config/constants";

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
          {item.sertifikat_bibit_url || item.nota_pembelian_url ? (
            <FileText className="w-4 h-4 text-blue-500" />
          ) : (
            "-"
          )}
        </div>,
      ],
    },
    pupuk: {
      title: "Stok Pupuk",
      icon: <Wheat className="w-5 h-5" />,
      columns: ["Nama Pupuk", "Jenis", "Asal", "Sisa (Kg)", "Tgl Beli"],
      renderRow: (item) => [
        item.nama_pupuk,
        item.jenis_pupuk,
        item.asal_pupuk,
        <span className="font-bold text-gray-700">
          {item.jumlah_tersisa_kg} Kg
        </span>,
        item.tanggal_pembelian,
      ],
    },
    pestisida: {
      title: "Stok Pestisida",
      icon: <SprayCan className="w-5 h-5" />,
      columns: ["Nama Pestisida", "Jenis", "Sisa Stok", "Bentuk", "Expired"],
      renderRow: (item) => [
        item.nama_pestisida,
        item.jenis_pestisida,
        `${item.jumlah_tersisa} ${item.satuan}`,
        item.bentuk,
        <span className="text-red-500 font-medium">
          {item.tanggal_expired}
        </span>,
      ],
    },
  };

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <Warehouse className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Inventaris Kebun
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Lihat stok alat, peralatan, pupuk, pestisida, dan bibit.
            </p>
          </div>
        </div>
      </div>

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
        <thead className="bg-[#B5302D] text-white">
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
                Belum ada data.
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