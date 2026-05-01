// File ini berfungsi sebagai layout utama yang mengatur tampilan dasar
// untuk setiap role (peran pengguna) dalam sistem.

import { Outlet, Navigate } from "react-router-dom";
import NavbarRole from "../components/NavbarRole";

const RoleLayout = ({ role }) => {
  // Ambil role dari localStorage
  const storedRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // Jika belum login
  if (!token || !storedRole) {
    return <Navigate to="/masuk" replace />;
  }

  // Jika role tidak cocok
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