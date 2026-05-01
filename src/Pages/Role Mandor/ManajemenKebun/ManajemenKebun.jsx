import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trees, ClipboardList, Sprout, Warehouse } from "lucide-react";
import RencanaKerja from "./RencanaKerja";
import BudidayaMonitoring from "./BudidayaMonitoring";
import Inventaris from "./InventarisPetani";

export default function ManajemenKebun() {
  const location = useLocation();
  const navigate = useNavigate();

  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState("inventaris");

  // Base path untuk fitur ini
  const basePath = "/petani/manajemenkebun";

  // 1. Sinkronisasi URL ke State & Auto Redirect
  useEffect(() => {
    const path = location.pathname;

    if (path.includes("inventaris")) {
      setActiveTab("inventaris");
    } else if (path.includes("rencanakerja")) {
      setActiveTab("rencana");
    } else if (path.includes("budidayamonitoring")) {
      setActiveTab("budidaya");
    } else {
      // Ubah fallback default ke inventaris
      setActiveTab("inventaris");
      navigate(`${basePath}/inventaris`, { replace: true });
    }
  }, [location.pathname, navigate]);

  // 2. Fungsi menangani klik tab
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    let targetPath = "";
    switch (tabId) {
      case "inventaris":
        targetPath = `${basePath}/inventaris`;
        break;
      case "rencana":
        targetPath = `${basePath}/rencanakerja`;
        break;
      case "budidaya":
        targetPath = `${basePath}/budidayamonitoring`;
        break;
      default:
        targetPath = `${basePath}/inventaris`; // Ubah default fallback
    }
    navigate(targetPath);
  };

  return (
    <div className="p-4 sm:p-10 min-h-screen font-sans">
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
            icon: <Trees size={20} />,
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

      {/* === KONTEN TAB === */}
      <div className="animate-fadeIn w-full overflow-hidden">
        {activeTab === "rencana" && <RencanaKerja />}
        {activeTab === "budidaya" && <BudidayaMonitoring />}
        {activeTab === "inventaris" && <Inventaris />}
      </div>
    </div>
  );
}
