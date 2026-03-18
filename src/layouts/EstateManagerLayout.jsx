// src/layouts/EstateManagerLayout.jsx
import React from "react";
import RoleLayout from "./RoleLayout";
import { ROLES } from "../config/constants"; // Import konstantanya

const EstateManagerLayout = () => {
  // Gunakan ROLES.ESTATE_MANAGER agar jika nilainya berubah di constants, layout otomatis ikut
  return <RoleLayout role={ROLES.ESTATE_MANAGER} />;
};

export default EstateManagerLayout;