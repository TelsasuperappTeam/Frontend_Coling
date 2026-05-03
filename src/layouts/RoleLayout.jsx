// File ini berfungsi sebagai layout utama yang mengatur tampilan dasar
// untuk setiap role (peran pengguna) dalam sistem.

import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import NavbarRole from "../components/NavbarRole";
import { showToast } from "../utils/notif";

const RoleLayout = ({ role }) => {
  const location = useLocation();
  // Ambil role dari localStorage
  const storedRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    // 1. Cek apakah ada state 'fromLogin'
    if (location.state?.fromLogin) {
      // 2. Munculkan toast
      showToast.success("Selamat datang di ISPO PalmaOne-08!");

      // 3. SEGERA hapus state dari history agar tidak terbaca lagi
      // Gunakan replaceState untuk menghapus object state-nya secara total
      window.history.replaceState(null, "");

      // 4. Untuk keamanan tambahan, kita bisa menghapus dari location object secara manual
      location.state.fromLogin = false;
    }
  }, [location]);

  if (!token || !storedRole) {
    return <Navigate to="/masuk" replace />;
  }

  if (storedRole !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#B5302D]">
      {/* Navbar murni hanya untuk menu navigasi atas */}
      <NavbarRole role={storedRole} />

      {/* Konten utama diatur SATU KALI di sini */}
      <main className="flex-1 pt-20 md:pt-24 pb-10">
        {/* INI YANG DIUBAH: Mengecilkan ukuran maksimal lebarnya */}
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RoleLayout;
