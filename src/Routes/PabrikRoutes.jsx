// src/routes/PabrikRoutes.jsx

// File ini berfungsi untuk mengatur semua rute (routes) atau jalur navigasi
// yang hanya bisa diakses oleh pengguna dengan role "pabrik".
// Fungsi :
// Mengatur daftar halaman (path) khusus untuk role pabrik,
// menghubungkan setiap path dengan komponen React yang sesuai,
// serta memastikan hanya pengguna role pabrik yang dapat mengaksesnya.

// src/routes/PabrikRoutes.jsx

import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import PabrikLayout from "../layouts/PabrikLayout";
import { ROLES } from "../config/constants";

// Import komponen sesuai dengan struktur folder di gambar (Role Pabrik -> DashboardPabrik)
import DashboardPabrik from "../Pages/Role Pabrik/DashboardPabrik/DashboardPabrik";
import PenerimaanTBS from "../Pages/Role Pabrik/PenerimaanTBS";
import TransaksiTBS from "../Pages/Role Pabrik/TransaksiTBS";
import StokRam from "../Pages/Role Pabrik/StokRam";
import Produksi from "../Pages/Role Pabrik/Produksi";

const PabrikRoutes = () => {
  return (
    <Routes>
      <Route element={<PabrikLayout />}>
        <Route
          index
          element={
            <PrivateRoute allowedRoles={[ROLES.PABRIK]}>
              <DashboardPabrik />
            </PrivateRoute>
          }
        />

        <Route
          path="dashboard"
          element={
            <PrivateRoute allowedRoles={[ROLES.PABRIK]}>
              <DashboardPabrik />
            </PrivateRoute>
          }
        />

        <Route
          path="penerimaanTBS/*"
          element={
            <PrivateRoute allowedRoles={[ROLES.PABRIK]}>
              <PenerimaanTBS />
            </PrivateRoute>
          }
        />

        <Route
          path="transaksiTBS/*"
          element={
            <PrivateRoute allowedRoles={[ROLES.PABRIK]}>
              <TransaksiTBS />
            </PrivateRoute>
          }
        />

        <Route
          path="stokram"
          element={
            <PrivateRoute allowedRoles={[ROLES.PABRIK]}>
              <StokRam />
            </PrivateRoute>
          }
        />

        <Route
          path="produksi"
          element={
            <PrivateRoute allowedRoles={[ROLES.PABRIK]}>
              <Produksi />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default PabrikRoutes;

// Dengan pemisahan routes per role seperti ini, struktur project menjadi
// lebih modular, mudah dibaca, dan gampang dikembangkan di masa depan.
