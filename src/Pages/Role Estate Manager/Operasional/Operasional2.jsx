import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  Search,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
// Sesuaikan import config dengan struktur folder Anda
import { API_ENDPOINTS } from "../../../config/constants.js";

const DOKUMEN_CONFIG = [
  {
    id: 1,
    label: "Berita acara pembentukan kelompok tani",
    code: "P2_2_1_BERITA_ACARA",
  },
  {
    id: 2,
    label: "Surat Bukti Keanggotaan Kelompok Tani/Koperasi",
    code: "P2_2_1_ANGGOTA",
  },
  { id: 3, label: "Akta Pendirian dan AD/ART", code: "P2_2_1_ADART" },
];

const Operasional2 = () => {
  const navigate = useNavigate();

  // -- STATE UNTUK PENGURUS --
  const [pengurusList, setPengurusList] = useState([]);
  const [isLoadingPengurus, setIsLoadingPengurus] = useState(false);

  // -- STATE DOKUMEN --
  const [dokumenStatus, setDokumenStatus] = useState(
    DOKUMEN_CONFIG.map((doc) => ({
      ...doc,
      file_url: null,
      status: null,
    })),
  );

  const fetchPengurus = async () => {
    setIsLoadingPengurus(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.USER.KEBUN.PENGURUS.MAIN, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPengurusList(data);
      }
    } catch (error) {
      console.error("Error fetching pengurus:", error);
    } finally {
      setIsLoadingPengurus(false);
    }
  };

  const fetchDokumenExisting = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.ISPO.KEBUN.SUBMISSION, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const dataServer = await response.json();
        setDokumenStatus((prevStatus) =>
          prevStatus.map((docConfig) => {
            const foundData = dataServer.find(
              (serverItem) => serverItem.requirement_code === docConfig.code,
            );
            if (foundData)
              return {
                ...docConfig,
                file_url: foundData.file_url,
                status: foundData.status,
              };
            return docConfig;
          }),
        );
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchPengurus();
    fetchDokumenExisting();
  }, []);

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans relative">
      {/* HEADER & TAB SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <Users className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Manajemen Organisasi
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Lihat struktur organisasi dan dokumen legalitas.
            </p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto">
          <button
            onClick={() => navigate("../manajemenoperasional")} // Berpindah ke route awal
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all text-gray-500 hover:bg-gray-200"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Penjualan/Peminjaman</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all bg-white text-[#B5302D] shadow-sm">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Organisasi</span>
          </button>
        </div>
      </div>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {/* SECTION 1 PENGURUS */}
        <SectionCard title="Daftar Anggota Pengurus">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs text-gray-500">
              Struktur organisasi kelompok tani.
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EF8523] text-white text-[11px] uppercase tracking-wider">
                  <th className="p-4 font-bold rounded-tl-xl">No</th>
                  <th className="p-4 font-bold">Nama Anggota</th>
                  <th className="p-4 font-bold">Jabatan</th>
                  <th className="p-4 font-bold">No. HP</th>
                  <th className="p-4 font-bold rounded-tr-xl">
                    Tugas & Tanggung Jawab
                  </th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-700 bg-white">
                {isLoadingPengurus ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center">
                      Memuat data...
                    </td>
                  </tr>
                ) : pengurusList.length > 0 ? (
                  pengurusList.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                    >
                      <td className="p-4 font-bold text-center">{index + 1}</td>
                      <td className="p-4 font-bold">{item.nama_anggota}</td>
                      <td className="p-4 font-medium text-[#B5302D]">
                        {item.jabatan_pengurus}
                      </td>
                      <td className="p-4 text-gray-500">{item.no_hp || "-"}</td>
                      <td className="p-4 text-gray-500">
                        {item.tugas_pengurus}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center">
                      Belum ada data pengurus.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* SECTION 2 DOKUMEN */}
        <SectionCard title="Kelengkapan Dokumen Organisasi">
          <div className="-mt-4 mb-6">
            <div className="w-full h-[1px] bg-gray-300 mb-4 mt-2" />
            <p className="text-sm text-gray-500 font-light mb-4">
              Status Dokumen organisasi Untuk Petani Mitra
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dokumenStatus.map((doc, idx) => {
              const isUploaded = !!doc.file_url;
              return (
                <div
                  key={idx}
                  className={`group bg-white border rounded-xl p-4 flex flex-row items-center gap-4 transition-all hover:shadow-md ${isUploaded ? "border-green-400 bg-green-50/30" : "border-gray-400"}`}
                >
                  <div
                    className={`p-3 rounded-full flex-shrink-0 ${isUploaded ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
                  >
                    {isUploaded ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <FileText className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2">
                      {doc.label}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {isUploaded ? (
                        <span className="text-green-600 font-medium">
                          Sudah diupload ({doc.status})
                        </span>
                      ) : (
                        "Belum ada file"
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {isUploaded && (
                      <button
                        onClick={() => window.open(doc.file_url, "_blank")}
                        className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100"
                        title="Lihat Dokumen"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

// HELPER COMPONENT (Tetap butuh di sini juga)
const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden group hover:shadow-md transition-all">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />
    <h3 className="text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

export default Operasional2;