// tampilan navigasi yang disesuaikan dengan masing-masing role untuk setiap pengguna mengakses fitur mereka

import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Perbaikan: double import Link dihapus
import { LayoutGrid, LogOut } from "lucide-react";
import { menuConfig } from "../config/menuConfig";
import { API_ENDPOINTS } from "../config/constants";

export default function NavbarRole({ role }) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const menus = menuConfig[role] || [];

  // --- LOGIKA MENUTUP DROPDOWN KETIKA KLIK DI LUAR KOTAK ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    }
    
    // Tambahkan touchstart agar super responsif saat disentuh jari di HP
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [dropdownRef]);

  // --- LOGIKA LOGOUT ---
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Gagal menghubungi server saat logout:", error);
    } finally {
      localStorage.removeItem("role");
      localStorage.removeItem("token");
      navigate("/masuk", { replace: true });
    }
  };

  return (
    <>
      <nav className="bg-white fixed top-0 left-0 w-full z-50 shadow-sm border-b border-[#EF8523]/30">
        <div className="max-w-[85rem] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
            {/* BAGIAN KIRI: LOGO */}
            <div className="flex items-center shrink-0 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                <img
                  src="/LogoTSA.png"
                  alt="LogoTSA"
                  className="h-6 w-auto sm:h-7 md:h-9 object-contain shrink-0"
                />
                <span className="text-[15px] sm:text-lg md:text-2xl font-black text-[#B5302D] tracking-tight truncate">
                  Selamat Datang!
                </span>
              </div>
            </div>

            {/* BAGIAN KANAN: MENU */}
            <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpenDropdown(!openDropdown)}
                  className={`flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold transition-all duration-300 ${
                    openDropdown
                      ? "bg-red-50 text-[#B5302D] ring-1 sm:ring-2 ring-red-100"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow"
                  }`}
                >
                  <LayoutGrid
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${openDropdown ? "text-[#B5302D]" : "text-black"}`}
                  />
                  <span className="text-[11px] sm:text-sm">Fitur Utama</span>
                </button>

                {openDropdown && (
                  <div className="absolute right-0 top-full mt-2 sm:mt-3 w-[280px] sm:w-[400px] md:w-[450px] bg-white border border-gray-100 rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-5 animate-slideDown z-50">
                    <p className="text-[9px] sm:text-[10px] font-black text-[#B5302D] uppercase tracking-[0.2em] mb-2 sm:mb-4 border-b border-gray-100 pb-1.5 sm:pb-2">
                      Menu Operasional
                    </p>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {menus.map((menu, i) => {
                        const Icon = menu.icon;

                        // --- KUNCI PERBAIKAN: LOGIKA ACTIVECHECK ---
                        // Jika di config ada 'activeCheck', kita pakai .includes()
                        // Jika tidak ada, kita pakai kecocokan persis (===)
                        const isActive = menu.activeCheck
                          ? location.pathname.includes(menu.activeCheck)
                          : location.pathname === menu.path;

                        return (
                          <Link
                            key={i}
                            to={menu.path}
                            onClick={() => setOpenDropdown(false)}
                            className={`flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-3 p-2 sm:p-3.5 rounded-lg sm:rounded-xl transition-all duration-200 group border ${
                              isActive
                                ? "bg-red-50 border-red-200 shadow-sm"
                                : "bg-gray-50/50 border-transparent hover:bg-white hover:border-gray-200 hover:shadow-md"
                            }`}
                          >
                            <div
                              className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${isActive ? "bg-[#B5302D] text-white" : "bg-gray-100 text-black group-hover:bg-red-50 group-hover:text-[#B5302D]"}`}
                            >
                              {Icon && (
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                              )}
                            </div>
                            <span
                              className={`text-[10px] sm:text-sm font-bold line-clamp-2 leading-tight sm:leading-snug mt-0 sm:mt-0.5 ${isActive ? "text-[#B5302D]" : "text-gray-800"}`}
                            >
                              {menu.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-5 sm:h-8 w-px bg-gray-200 mx-0.5 sm:mx-1"></div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-1.5 sm:py-2.5 text-red-600 hover:bg-red-50 hover:text-red-600 rounded-lg sm:rounded-xl transition-colors duration-300 font-bold"
                title="Keluar"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                <span className="hidden sm:block text-sm">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-5px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slideDown { animation: slideDown 0.2s ease-out forwards; transform-origin: top right; }
      `}</style>
    </>
  );
}
