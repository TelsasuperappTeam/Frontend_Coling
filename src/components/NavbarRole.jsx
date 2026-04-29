// tampilan navigasi yang disesuaikan dengan masing-masing role untuk setiap pengguna mengakses fitur mereka

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut } from "lucide-react"; // <-- Tambahkan ChevronDown & LogOut
import { menuConfig } from "../config/menuConfig";
import { API_ENDPOINTS } from "../config/constants";

export default function NavbarRole({ role, children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menus = menuConfig[role] || [];

  // --- LOGIKA MENU LAINNYA (DROPDOWN) ---
  const MAX_VISIBLE_ITEMS = 4; // Maksimal menu yang tampil bersisian
  const visibleMenus = menus.slice(0, MAX_VISIBLE_ITEMS);
  const dropdownMenus = menus.slice(MAX_VISIBLE_ITEMS);

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
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-18">
            {/* LOGO & HAMBURGER */}
            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden text-[#B5302D] focus:outline-none flex items-center justify-center p-1 rounded-md hover:bg-red-50 transition-colors"
                aria-label="Toggle menu role"
              >
                {open ? (
                  <X size={26} strokeWidth={2.5} />
                ) : (
                  <Menu size={26} strokeWidth={2.5} />
                )}
              </button>

              <div className="flex items-center gap-2">
                <img
                  src="/LogoTSA.png"
                  alt="LogoTSA"
                  className="h-7 w-auto sm:h-8 object-contain"
                />
                <span className="text-lg sm:text-xl font-black text-[#B5302D] tracking-tight">
                  PalmaOne-08
                </span>
              </div>
            </div>

            {/* DI BAGIAN DESKTOP MENU (Hanya muncul di layar lg / Laptop ke atas) */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-6">
              
              {/* Menu Utama (Maksimal 4) */}
              <div className="flex items-center gap-2 xl:gap-5">
                {visibleMenus.map((menu, i) => {
                  const currentPath = location.pathname.replace(/\/$/, "");
                  const targetPath = menu.path.replace(/\/$/, "");
                  const isActive =
                    currentPath === targetPath ||
                    location.pathname.startsWith(menu.path + "/");
                  const Icon = menu.icon;

                  return (
                    <Link
                      key={i}
                      to={menu.path}
                      className={`transition-all duration-300 text-[13px] xl:text-sm flex items-center gap-1.5 px-2 py-2 rounded-lg ${
                        isActive
                          ? "bg-red-50 text-[#B5302D] font-bold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[#B5302D] font-medium"
                      }`}
                    >
                      {Icon && <Icon className="w-4 h-4 xl:w-[18px] xl:h-[18px]" />}
                      <span className="whitespace-nowrap">{menu.label}</span>
                    </Link>
                  );
                })}

                {/* Dropdown "Lainnya" (Hanya muncul jika menu lebih dari 4) */}
                {dropdownMenus.length > 0 && (
                  <div className="relative group h-full flex items-center">
                    <button className="transition-all duration-300 text-[13px] xl:text-sm flex items-center gap-1.5 text-gray-600 font-medium hover:bg-gray-50 hover:text-[#B5302D] px-3 py-2 rounded-lg">
                      <span className="whitespace-nowrap">Lainnya</span>
                      <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                    </button>

                    {/* Kotak Isi Dropdown */}
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex flex-col py-2 z-50">
                      {dropdownMenus.map((menu, i) => {
                        const currentPath = location.pathname.replace(/\/$/, "");
                        const targetPath = menu.path.replace(/\/$/, "");
                        const isActive =
                          currentPath === targetPath ||
                          location.pathname.startsWith(menu.path + "/");
                        const Icon = menu.icon;

                        return (
                          <Link
                            key={i}
                            to={menu.path}
                            className={`flex items-center gap-3 px-4 py-2.5 text-[13px] transition-all duration-200 mx-2 rounded-lg ${
                              isActive
                                ? "bg-red-50 text-[#B5302D] font-bold"
                                : "text-gray-600 hover:bg-gray-50 hover:text-[#B5302D] font-medium"
                            }`}
                          >
                            {Icon && <Icon className="w-4 h-4" />}
                            <span>{menu.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Tombol Logout Desktop */}
              <div className="pl-4 xl:pl-6 ml-2 border-l border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-300 font-bold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="whitespace-nowrap">Keluar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* MOBILE MENU (Tetap menampilkan semua) */}
        {/* ========================================= */}
        {open && (
          <div className="lg:hidden bg-white border-t border-[#EF8523]/20 shadow-xl animate-slideDown overflow-y-auto max-h-[85vh]">
            <div className="px-4 py-4 flex flex-col gap-1.5">
              {menus.map((menu, i) => {
                const Icon = menu.icon;
                const currentPath = location.pathname.replace(/\/$/, "");
                const targetPath = menu.path.replace(/\/$/, "");
                const isActive =
                  currentPath === targetPath ||
                  location.pathname.startsWith(menu.path + "/");

                return (
                  <Link
                    key={i}
                    to={menu.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-red-50 to-orange-50 text-[#B5302D] border border-red-100 font-bold shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-[#B5302D] font-medium"
                    }`}
                  >
                    {Icon && <Icon className={`w-5 h-5 ${isActive ? "text-[#B5302D]" : "text-gray-400"}`} />}
                    <span>{menu.label}</span>
                  </Link>
                );
              })}

              <div className="border-t border-gray-100 pt-3 mt-2">
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-colors duration-300 font-bold"
                >
                  <LogOut className="w-5 h-5" />
                  Keluar Akun
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 max-w-[90rem] mx-auto">{children}</main>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease forwards; }
      `}</style>
    </>
  );
}