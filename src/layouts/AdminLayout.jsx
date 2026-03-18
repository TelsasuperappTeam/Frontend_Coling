// src/layouts/AdminLayout.jsx
import React from "react";
import RoleLayout from "./RoleLayout";
import { ROLES } from "../config/constants"; // Import konstantanya

const AdminLayout = () => {
  // Gunakan ROLES.ADMIN agar jika nilainya berubah di constants, layout otomatis ikut
  return <RoleLayout role={ROLES.ADMIN} />;
};

export default AdminLayout;