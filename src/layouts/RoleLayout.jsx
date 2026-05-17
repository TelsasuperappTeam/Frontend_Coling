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
    // Gunakan h-screen dan overflow-hidden agar body terkunci (tidak bisa geser kiri/kanan)
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white text-[#B5302D]">
      
      {/* Navbar melayang di atas */}
      <NavbarRole role={storedRole} />

      {/* Pindahkan scrollbar HANYA ke dalam area <main> */}
      {/* margin-top (mt) digunakan agar area scroll BENAR-BENAR dimulai dari BAWAH navbar */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden mt-14 sm:mt-16 md:mt-20 pb-10">
        
        {/* Tambahkan sedikit padding top (pt-6) agar konten tidak terlalu menempel ke garis bawah navbar */}
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Outlet />
        </div>
        
      </main>
      
    </div>
  );
};

export default RoleLayout;