// src/routes/LogistikRoutes.jsx

import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import TransportLayout from "../layouts/TransportLayout";
import { ROLES } from "../config/constants";

// Import halaman Logistik (SESUIKAN DENGAN FILE ANDA)
import DashboardTransport from "../Pages/Role Transport/DashboardTransport/DashboardTransport";
import Pengiriman from "../Pages/Role Transport/Pengiriman";
import ManajemenPesanan from "../Pages/Role Transport/ManajemenPesanan";
import Armada from "../Pages/Role Transport/Armada";

const TransportRoutes = () => {
  return (
    <Routes>
      <Route element={<TransportLayout />}>

        {/* === DASHBOARD === */}
        <Route
          index
          element={
            <PrivateRoute allowedRoles={[ROLES.TRANSPORT]}>
              <DashboardTransport />
            </PrivateRoute>
          }
        />

        <Route
          path="dashboard"
          element={
            <PrivateRoute allowedRoles={[ROLES.TRANSPORT]}>
              <DashboardTransport />
            </PrivateRoute>
          }
        />

        {/* === MANAJEMEN LOGISTIK & PANEN === */}
        <Route
          path="manajemenpesanan"
          element={
            <PrivateRoute allowedRoles={[ROLES.TRANSPORT]}>
              <ManajemenPesanan />
            </PrivateRoute>
          }
        />

        {/* === PENGIRIMAN === */}
        <Route
          path="pengiriman/*"
          element={
            <PrivateRoute allowedRoles={[ROLES.TRANSPORT]}>
              <Pengiriman />
            </PrivateRoute>
          }
        />

        {/* === ARMADA === */}
        <Route
          path="armada"
          element={
            <PrivateRoute allowedRoles={[ROLES.TRANSPORT]}>
              <Armada />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default TransportRoutes;
