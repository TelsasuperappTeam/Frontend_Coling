// src/routes/KebunRoutes.jsx
// File ini berfungsi untuk mengatur semua rute (routes) atau jalur navigasi
// yang hanya bisa diakses oleh pengguna dengan role "Kebun".
// Fungsi :
// Mengatur daftar halaman (path) khusus untuk role Kebun,
// menghubungkan setiap path dengan komponen React yang sesuai,
// serta memastikan hanya pengguna role Kebun yang dapat mengaksesnya.

import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import GMDistrikLayout from "../layouts/GMDistrikLayout"; // Layout khusus untuk role Kebun
import { ROLES } from "../config/constants";

import DashboardGMDistrik from "../Pages/Role GM Distrik/DashboardGMDistrik/DashboardGMDistrik";
import Penjualan from "../Pages/Role GM Distrik/Penjualan";
import DistribusiLogistik from "../Pages/Role GM Distrik/Distribusi&Logistik";
import InventarisKebun from "../Pages/Role GM Distrik/InventarisKebun";
import KemitraanPetani from "../Pages/Role GM Distrik/KemitraanPetani";
import Operasional from "../Pages/Role GM Distrik/Operasional/Operasional"
import Operasional2 from "../Pages/Role GM Distrik/Operasional/Operasional2"

const GMDistrikRoutes = () => {
  return (
    <Routes>
      <Route element={<GMDistrikLayout />}>
        <Route
          index
          element={
            <PrivateRoute allowedRoles={[ROLES.GENERAL_MANAGER_DISTRIK]}>
              <DashboardGMDistrik />
            </PrivateRoute>
          }
        />

        <Route
          path="dashboard"
          element={
            <PrivateRoute allowedRoles={[ROLES.GENERAL_MANAGER_DISTRIK]}>
              <DashboardGMDistrik />
            </PrivateRoute>
          }
        />

        <Route
          path="penjualan"
          element={
            <PrivateRoute allowedRoles={[ROLES.GENERAL_MANAGER_DISTRIK]}>
              <Penjualan />
            </PrivateRoute>
          }
        />

        <Route
          path="distribusi&logistik"
          element={
            <PrivateRoute allowedRoles={[ROLES.GENERAL_MANAGER_DISTRIK]}>
              <DistribusiLogistik />
            </PrivateRoute>
          }
        />

        <Route
          path="inventaris"
          element={
            <PrivateRoute allowedRoles={[ROLES.GENERAL_MANAGER_DISTRIK]}>
              <InventarisKebun />
            </PrivateRoute>
          }
        />

        <Route
          path="kemitraanpetani"
          element={
            <PrivateRoute allowedRoles={[ROLES.GENERAL_MANAGER_DISTRIK]}>
              <KemitraanPetani />
            </PrivateRoute>
          }
        />

        <Route
          path="manajemenoperasional"
          element={
            <PrivateRoute allowedRoles={[ROLES.GENERAL_MANAGER_DISTRIK]}>
              <Operasional />
            </PrivateRoute>
          }
        />

        {/* Path-nya diubah jadi masuk ke dalam "manajemenoperasional/organisasi" */}
        <Route
          path="manajemenoperasional/organisasi"
          element={
            <PrivateRoute allowedRoles={[ROLES.GENERAL_MANAGER_DISTRIK]}>
              <Operasional2 />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default GMDistrikRoutes;

// Dengan pemisahan routes per role seperti ini, struktur project menjadi
// lebih modular, mudah dibaca, dan gampang dikembangkan di masa depan.
