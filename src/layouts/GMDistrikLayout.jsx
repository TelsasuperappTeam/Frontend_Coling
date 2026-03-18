// src/layouts/GMDistrikLayout.jsx
import React from "react";
import RoleLayout from "./RoleLayout";
import { ROLES } from "../config/constants"; // Import konstantanya

const GMDistrikLayout = () => {
  // Gunakan ROLES.GENERAL_MANAGER_DISTRIK agar jika nilainya berubah di constants, layout otomatis ikut
  return <RoleLayout role={ROLES.GENERAL_MANAGER_DISTRIK} />;
};

export default GMDistrikLayout;