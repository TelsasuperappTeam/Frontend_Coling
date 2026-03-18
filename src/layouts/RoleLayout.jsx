
// File ini berfungsi sebagai layout utama yang mengatur tampilan dasar
// untuk setiap role (peran pengguna) dalam sistem.
// Fungsi
// -Mengambil data role dari user login, lalu memilih layout atau menu yang sesuai
//  berdasarkan role tersebut (misal Petani, Kebun, Pabrik, Logistik, atau admin).
// -Memastikan setiap pengguna hanya melihat halaman yang memang sesuai
//  dengan hak akses atau fiturnya.


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
      {/* Navbar sesuai role */}
      <NavbarRole role={storedRole} />

      {/* Konten utama */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RoleLayout;

