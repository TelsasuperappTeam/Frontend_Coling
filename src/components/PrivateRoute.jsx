// Fungsi utama:
// Mengecek apakah pengguna sudah login melalui localStorage (cek "role").
// Jika belum login, otomatis diarahkan ke halaman login (/masuk).
// Jika sudah login tapi tidak memiliki hak akses sesuai `allowedRoles`,
// maka diarahkan ke halaman fallback sesuai perannya (diambil dari roleRedirect).
// Jika semua valid, komponen `children` (halaman yang dilindungi) akan ditampilkan.


import { Navigate, Outlet } from "react-router-dom";
import { getRoleRedirectPath } from "../utils/roleRedirect";

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const role = localStorage.getItem("role");

  if (!role) {
    return <Navigate to="/masuk" replace />;
  }

  const normalizedRole = role.toLowerCase(); 

  if (!allowedRoles.includes(normalizedRole)) {
    const fallback = getRoleRedirectPath(normalizedRole); 
    
    return <Navigate to={fallback} replace />;
  }

  // JIKA LOLOS PENGECEKAN:
  // Render children (jika rute tunggal) ATAU <Outlet /> (jika rute bersarang)
  return children ? children : <Outlet />;
}