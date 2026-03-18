// src/routes/PetaniRoutes.jsx
// -------------------------------------------------------------
// File ini mengatur semua route (halaman) untuk role PETANI.
// -------------------------------------------------------------

import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import MandorLayout from "../layouts/MandorLayout";
import { ROLES } from "../config/constants";

// Import halaman khusus role Petani
import DashboardMandor from "../Pages/Role Mandor/DashboardMandor/DashboardMandor";
import LuasLahan from "../Pages/Role Mandor/DashboardMandor/LuasLahan";
import PantauISPO from "../Pages/Role Mandor/PantauISPO";
import RiwayatPenjualan from "../Pages/Role Mandor/Riwayatpenjualan";
import ManajemenKebun from "../Pages/Role Mandor/ManajemenKebun/ManajemenKebun";
import DetailRencanaTanam from "../Pages/Role Mandor/ManajemenKebun/DetailRencanaTanam";
import BudidayaMonitoring from "../Pages/Role Mandor/ManajemenKebun/BudidayaMonitoring";
import CatatAktivitas from "../Pages/Role Mandor/ManajemenKebun/Detail Aktivitas & Monitoring Penanaman/CatatAktivitas";
import Panen from "../Pages/Role Mandor/ManajemenKebun/Detail Aktivitas & Monitoring Penanaman/Panen";

const MandorRoutes = () => {
  return (
    <Routes>
      {/* Semua halaman Mandor dibungkus dalam layout MandorLayout */}
      <Route element={<MandorLayout />}>
        {/* Default ke dashboard */}
        <Route
          index
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <DashboardMandor />
            </PrivateRoute>
          }
        />

        {/* Dashboard */}
        <Route
          path="dashboard"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <DashboardMandor />
            </PrivateRoute>
          }
        />

        {/* Manajemen Kebun */}
        <Route
          path="manajemenkebun"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <ManajemenKebun />
            </PrivateRoute>
          }
        />

        {/* Detail Rencana Tanam */}
        <Route
          path="manajemenkebun/budidayamonitoring/detailrencanatanam/:id"
          element={<DetailRencanaTanam />}
        />

        {/* Budidaya Monitoring */}
        <Route
          path="budidayamonitoring"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <BudidayaMonitoring />
            </PrivateRoute>
          }
        />

        {/* Riwayat Penjualan */}
        <Route
          path="riwayatpenjualan"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <RiwayatPenjualan />
            </PrivateRoute>
          }
        />

        {/* Luas Lahan */}
        <Route
          path="luaslahan"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <LuasLahan />
            </PrivateRoute>
          }
        />

        {/* kelengkapan ISPO */}
        <Route
          path="PantauISPO"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <PantauISPO />
            </PrivateRoute>
          }
        />

        <Route
          path="/manajemenkebun/budidayamonitoring/catataktivitas/:id"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <CatatAktivitas />
            </PrivateRoute>
          }
        />
        <Route
          path="/manajemenkebun/budidayamonitoring/catataktivitas/panen/:id"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <Panen />
            </PrivateRoute>
          }
        />

        {/* Manajemen Kebun */}
        <Route
          path="manajemenkebun/*"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <ManajemenKebun />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default MandorRoutes;
