import React, { useState, useEffect } from "react";
import {
  useLocation,
  useNavigate,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Trees, Activity, Palmtree, ClipboardList, Warehouse, Sprout } from "lucide-react"; // <-- PERBAIKAN: Sprout ditambahkan di sini

// Komponen Konten Tab
import RencanaKerja from "./RencanaKerja";
import BudidayaMonitoring from "./BudidayaMonitoring";
import Inventaris from "./InventarisPetani";

// Komponen Detail (Akan muncul di bawah Tab)
import CatatAktivitas from "./Detail Aktivitas & Monitoring Penanaman/CatatAktivitas";
import MonitoringGAP from "./Detail Aktivitas & Monitoring Penanaman/MonitoringGAP";
import Panen from "./Detail Aktivitas & Monitoring Penanaman/Panen";

export default function ManajemenKebun() {
  const location = useLocation();
  const navigate = useNavigate();

  // Sesuaikan prefix path sesuai role (Mandor/Petani)
  // Jika di MandorRoutes panggilannya /manajemenkebun, maka basePath cukup kosong atau menyesuaikan
  const basePath = "/petani/manajemenkebun";

  const [activeTab, setActiveTab] = useState("inventaris");

  // Sinkronisasi Tab berdasarkan URL agar warna Tab tetap akurat saat halaman di-refresh
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("inventaris")) setActiveTab("inventaris");
    else if (path.includes("rencanakerja")) setActiveTab("rencana");
    else if (path.includes("budidayamonitoring")) setActiveTab("budidaya");
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "inventaris") navigate(`${basePath}/inventaris`);
    else if (tabId === "rencana") navigate(`${basePath}/rencanakerja`);
    else if (tabId === "budidaya") navigate(`${basePath}/budidayamonitoring`);
  };

  return (
    <div className="space-y-6 p-4 md:p-8 min-h-screen font-sans">
      {/* <-- PERBAIKAN: Menambahkan div pembungkus agar seimbang dan rapi di tengah --> */}
      <div className="max-w-7xl mx-auto">
        {/* === HEADER HERO === */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-2xl shadow-sm border border-red-100 shrink-0">
              <Sprout className="text-[#B5302D]" size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#B5302D]">
                Manajemen Kebun
              </h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Kelola rencana kerja, monitoring, dan inventaris.
              </p>
            </div>
          </div>
        </div>

        <hr className="border-gray-200 mb-6 sm:mb-8" />

        {/* === TAB NAVIGATION  === */}
        <div className="flex flex-row mb-8 border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white p-1 gap-1 sm:gap-0">
          {[
            {
              id: "inventaris",
              label: "Inventaris",
              icon: <Warehouse size={20} />,
            },
            {
              id: "rencana",
              label: "Rencana Kerja",
              icon: <ClipboardList size={20} />,
            },
            {
              id: "budidaya",
              label: "Budidaya & Monitoring",
              icon: <Palmtree size={20} />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
              flex-1 flex items-center justify-center gap-2 
              py-3 sm:py-4 rounded-xl transition-all duration-300
              font-bold text-xs sm:text-sm
              ${
                activeTab === tab.id
                  ? "bg-[#EF8523] text-white shadow-md"
                  : "bg-transparent hover:bg-gray-50 text-black"
              }
            `}
              title={tab.label}
            >
              {tab.icon}
              <span className="hidden sm:block whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* === AREA KONTEN DINAMIS (HANYA AREA INI YANG BERGANTI) === */}
        <div className="animate-fadeIn w-full">
          <Routes>
            {/* Default redirect jika hanya mengakses /manajemenkebun */}
            <Route path="/" element={<Navigate to="inventaris" replace />} />

            {/* Halaman Utama Tiap Tab */}
            <Route path="inventaris" element={<Inventaris />} />
            <Route path="rencanakerja" element={<RencanaKerja />} />
            <Route path="budidayamonitoring" element={<BudidayaMonitoring />} />

            {/* Halaman Detail (Akan muncul DI BAWAH Header & Tab yang sama) */}
            <Route
              path="budidayamonitoring/realisasitanam/:id"
              element={<CatatAktivitas />}
            />
            <Route
              path="budidayamonitoring/monitoring/:id"
              element={<MonitoringGAP />}
            />
            <Route path="budidayamonitoring/panen/:id" element={<Panen />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
