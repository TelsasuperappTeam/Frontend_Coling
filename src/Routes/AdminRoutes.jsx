// File ini berfungsi untuk mengatur semua rute (routes) atau jalur navigasi
// yang hanya bisa diakses oleh pengguna dengan role "admin".
// Fungsi :
// Mengatur daftar halaman (path) khusus untuk role admin,
// menghubungkan setiap path dengan komponen React yang sesuai,
// serta memastikan hanya pengguna role admin yang dapat mengaksesnya.

import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import AdminLayout from "../layouts/AdminLayout";
import { ROLES } from "../config/constants";

import DashboardAdmin from "../Pages/Role Admin/DashboardAdmin";
import DataStakeholderAdmin from "../Pages/Role Admin/DataStakeholderAdmin";
import ValidasiKebun from "../Pages/Role Admin/ValidasiKebun";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route
          index
          element={
            <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
              <DashboardAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
              <DashboardAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="datastakeholder"
          element={
            <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
              <DataStakeholderAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="validasikebun"
          element={
            <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
              <ValidasiKebun />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;

// Dengan pemisahan routes per role seperti ini, struktur project menjadi
// lebih modular, mudah dibaca, dan gampang dikembangkan di masa depan.
