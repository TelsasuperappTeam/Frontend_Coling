// src/layouts/PabrikLayout.jsx
import React from "react";
import RoleLayout from "./RoleLayout";
import { ROLES } from "../config/constants"; // Import konstantanya

const PabrikLayout = () => {
  // Gunakan ROLES.PABRIK agar jika nilainya berubah di constants, layout otomatis ikut
  return <RoleLayout role={ROLES.PABRIK} />;
};

export default PabrikLayout;