// src/routes/KebunRoutes.jsx
// File ini berfungsi untuk mengatur semua rute (routes) atau jalur navigasi
// yang hanya bisa diakses oleh pengguna dengan role "Kebun".
// Fungsi :
// Mengatur daftar halaman (path) khusus untuk role Kebun,
// menghubungkan setiap path dengan komponen React yang sesuai,
// serta memastikan hanya pengguna role Kebun yang dapat mengaksesnya.

import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import KebunLayout from "../layouts/KebunLayout";
import { ROLES } from "../config/constants";

import DashboardKebun from "../Pages/Role Kebun/DashboardKebun/DashboardKebun";
import Penjualan from "../Pages/Role Kebun/Penjualan"; 
import DistribusiLogistik from "../Pages/Role Kebun/Distribusi&Logistik";
import InventarisKebun from "../Pages/Role Kebun/InventarisKebun";
import KemitraanPetani from "../Pages/Role Kebun/KemitraanPetani";
import Operasional from "../Pages/Role Kebun/Operasional";
import RiwayatTransaksi from "../Pages/Role Kebun/RiwayatTransaksi";

const KebunRoutes = () => {
  return (
    <Routes>
      <Route element={<KebunLayout />}>
        <Route
          index
          element={
            <PrivateRoute allowedRoles={[ROLES.KEBUN]}>
              <DashboardKebun />
            </PrivateRoute>
          }
        />
        
        <Route
          path="dashboard"
          element={
            <PrivateRoute allowedRoles={[ROLES.KEBUN]}>
              <DashboardKebun />
            </PrivateRoute>
          }
        />

        <Route
          path="penjualan"
          element={
            <PrivateRoute allowedRoles={[ROLES.KEBUN]}>
              <Penjualan />
            </PrivateRoute>
          }
        />

        <Route
          path="distribusi&logistik"
          element={
            <PrivateRoute allowedRoles={[ROLES.KEBUN]}>
              <DistribusiLogistik />
            </PrivateRoute>
          }
        />

        <Route
          path="inventaris"
          element={
            <PrivateRoute allowedRoles={[ROLES.KEBUN]}>
              <InventarisKebun />
            </PrivateRoute>
          }
        />

        <Route
          path="kemitraanpetani"
          element={
            <PrivateRoute allowedRoles={[ROLES.KEBUN]}>
              <KemitraanPetani />
            </PrivateRoute>
          }
        />

        <Route
          path="manajemenoperasional" 
          element={
            <PrivateRoute allowedRoles={[ROLES.KEBUN]}>
              <Operasional />
            </PrivateRoute>
          }
        />

        <Route
          path="riwayattransaksi" 
          element={
            <PrivateRoute allowedRoles={[ROLES.KEBUN]}>
              <RiwayatTransaksi />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default KebunRoutes;

// Dengan pemisahan routes per role seperti ini, struktur project menjadi
// lebih modular, mudah dibaca, dan gampang dikembangkan di masa depan.
