// tampilan navigasi yang disesuaikan dengan masing-masing role untuk setiap pengguna mengakses fitur mereka

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { menuConfig } from "../config/menuConfig";
import { API_ENDPOINTS } from "../config/constants";

export default function NavbarRole({ role, children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menus = menuConfig[role] || [];

  // --- LOGIKA LOGOUT ---
  const handleLogout = async () => {
    try {
      // Ambil token jika Anda menyimpannya di localStorage (misal dengan nama 'token')
      const token = localStorage.getItem("token");

      // Panggil endpoint logout di backend
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Gagal menghubungi server saat logout:", error);
      // Tetap lanjutkan proses hapus local storage agar user tidak terjebak
    } finally {
      // Hapus data autentikasi dari browser
      localStorage.removeItem("role");
      localStorage.removeItem("token");

      // Arahkan ke halaman login
      navigate("/masuk", { replace: true });
    }
  };

  return (
    <>
      <nav className="bg-white fixed top-0 left-0 w-full z-50 shadow-sm border-b border-[#EF8523]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden text-[#B5302D] focus:outline-none flex items-center justify-center"
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
                <span className="text-lg sm:text-xl font-bold text-[#B5302D] tracking-tight">
                  Platform ISPO PalmaOne-08
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              {menus.map((menu, i) => {
                const currentPath = location.pathname.replace(/\/$/, "");
                const targetPath = menu.path.replace(/\/$/, "");
                const isActive =
                  currentPath === targetPath ||
                  location.pathname.startsWith(menu.path + "/");

                return (
                  <Link
                    key={i}
                    to={menu.path}
                    className={`transition-colors duration-200 text-sm sm:text-base ${
                      isActive
                        ? "text-[#B5302D] font-bold border-b-2 border-[#B5302D] pb-1"
                        : "text-gray-700 hover:text-[#B5302D]"
                    }`}
                  >
                    {menu.label}
                  </Link>
                );
              })}

              <div className="pl-6 ml-2 border-l border-gray-300">
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-500 transition-colors duration-200 font-medium"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden bg-white border-t border-[#EF8523]/20 shadow-lg animate-slideDown">
            <div className="px-4 py-3 flex flex-col gap-1">
              {menus.map((menu, i) => (
                <Link
                  key={i}
                  to={menu.path}
                  onClick={() => setOpen(false)} // Otomatis menutup navbar saat diklik
                  className={`block w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    location.pathname.startsWith(menu.path)
                      ? "bg-[#B5302D] text-white shadow-md font-semibold"
                      : "text-gray-600 hover:bg-[#EF8523]/10 hover:text-[#B5302D]"
                  }`}
                >
                  {menu.label}
                </Link>
              ))}

              <div className="border-t border-gray-100 pt-2 mt-1 flex flex-col gap-1">
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false); // Otomatis tutup juga kalau klik logout
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 font-medium"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-20 px-4 sm:px-6 lg:px-8">{children}</main>

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
