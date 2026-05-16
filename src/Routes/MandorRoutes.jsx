import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import MandorLayout from "../layouts/MandorLayout";
import { ROLES } from "../config/constants";

import DashboardMandor from "../Pages/Role Mandor/DashboardMandor/DashboardMandor";
import LuasLahan from "../Pages/Role Mandor/DashboardMandor/LuasLahan";
import PantauISPO from "../Pages/Role Mandor/PantauISPO";
import Riwayatpenjualan from "../Pages/Role Mandor/Riwayatpenjualan";
import ManajemenKebun from "../Pages/Role Mandor/ManajemenKebun/ManajemenKebun";
import ManajemenSengketa from "../Pages/Role Mandor/DashboardMandor/ManajemenSengketa";

// === IMPORT HALAMAN BUDIDAYA DAN MONITORING ===
import CatatAktivitas from "../Pages/Role Mandor/ManajemenKebun/Detail Aktivitas & Monitoring Penanaman/CatatAktivitas";
import MonitoringGAP from "../Pages/Role Mandor/ManajemenKebun/Detail Aktivitas & Monitoring Penanaman/MonitoringGAP";
import Panen from "../Pages/Role Mandor/ManajemenKebun/Detail Aktivitas & Monitoring Penanaman/Panen";
import DetailRencanaTanam from "../Pages/Role Mandor/ManajemenKebun/DetailRencanaTanam";

const MandorRoutes = () => {
  return (
    <Routes>
      <Route element={<MandorLayout />}>
        <Route
          index
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <DashboardMandor />
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <DashboardMandor />
            </PrivateRoute>
          }
        />
        <Route
          path="riwayatpenjualan/*"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <Riwayatpenjualan />
            </PrivateRoute>
          }
        />
        <Route
          path="luaslahan"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <LuasLahan />
            </PrivateRoute>
          }
        />
        <Route
          path="PantauISPO/*"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <PantauISPO />
            </PrivateRoute>
          }
        />

        <Route
          path="manajemensengketa"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <ManajemenSengketa />
            </PrivateRoute>
          }
        />

        {/* Manajemen Kebun (Halaman Utama yang ada Tab-nya) */}
        <Route
          path="manajemenkebun/*"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <ManajemenKebun />
            </PrivateRoute>
          }
        />

        <Route
          path="manajemenkebun/budidayamonitoring/detailrencanatanam/:id"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <DetailRencanaTanam />
            </PrivateRoute>
          }
        />

        <Route
          path="manajemenkebun/budidayamonitoring/realisasitanam/:id"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <CatatAktivitas />
            </PrivateRoute>
          }
        />
        <Route
          path="manajemenkebun/budidayamonitoring/monitoring/:id"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <MonitoringGAP />
            </PrivateRoute>
          }
        />
        <Route
          path="manajemenkebun/budidayamonitoring/panen/:id"
          element={
            <PrivateRoute allowedRoles={[ROLES.MANDOR]}>
              <Panen />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default MandorRoutes;
