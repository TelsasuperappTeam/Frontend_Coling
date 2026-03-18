// src/routes/KebunRoutes.jsx
// File ini berfungsi untuk mengatur semua rute (routes) atau jalur navigasi
// yang hanya bisa diakses oleh pengguna dengan role "Kebun".
// Fungsi :
// Mengatur daftar halaman (path) khusus untuk role Kebun,
// menghubungkan setiap path dengan komponen React yang sesuai,
// serta memastikan hanya pengguna role Kebun yang dapat mengaksesnya.

import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import EstateManagerLayout from "../layouts/EstateManagerLayout";
import { ROLES } from "../config/constants";

import DashboardEM from "../Pages/Role Estate Manager/DashboardEM/DashboardEM";
import Penjualan from "../Pages/Role Estate Manager/Penjualan"; 
import DistribusiLogistik from "../Pages/Role Estate Manager/Distribusi&Logistik";
import InventarisKebun from "../Pages/Role Estate Manager/InventarisKebun";
import KemitraanPetani from "../Pages/Role Estate Manager/KemitraanPetani";
import Operasional from "../Pages/Role Estate Manager/Operasional";

const EstateManagerRoutes = () => {
  return (
    <Routes>
      <Route element={<EstateManagerLayout />}>
        <Route
          index
          element={
            <PrivateRoute allowedRoles={[ROLES.ESTATE_MANAGER]}>
              <DashboardEM />
            </PrivateRoute>
          }
        />
        
        <Route
          path="dashboard"
          element={
            <PrivateRoute allowedRoles={[ROLES.ESTATE_MANAGER]}>
              <DashboardEM />
            </PrivateRoute>
          }
        />

        <Route
          path="penjualan"
          element={
            <PrivateRoute allowedRoles={[ROLES.ESTATE_MANAGER]}>
              <Penjualan />
            </PrivateRoute>
          }
        />

        <Route
          path="distribusi&logistik"
          element={
            <PrivateRoute allowedRoles={[ROLES.ESTATE_MANAGER]}>
              <DistribusiLogistik />
            </PrivateRoute>
          }
        />

        <Route
          path="inventaris"
          element={
            <PrivateRoute allowedRoles={[ROLES.ESTATE_MANAGER]}>
              <InventarisKebun />
            </PrivateRoute>
          }
        />

        <Route
          path="kemitraanpetani"
          element={
            <PrivateRoute allowedRoles={[ROLES.ESTATE_MANAGER]}>
              <KemitraanPetani />
            </PrivateRoute>
          }
        />

        <Route
          path="manajemenoperasional" 
          element={
            <PrivateRoute allowedRoles={[ROLES.ESTATE_MANAGER]}>
              <Operasional />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default EstateManagerRoutes;

// Dengan pemisahan routes per role seperti ini, struktur project menjadi
// lebih modular, mudah dibaca, dan gampang dikembangkan di masa depan.
