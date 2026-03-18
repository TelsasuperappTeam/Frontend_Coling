// src/layouts/KebunLayout.jsx
import React from "react";
import RoleLayout from "./RoleLayout";
import { ROLES } from "../config/constants"; // Import konstantanya

const KebunLayout = () => {
  // Gunakan ROLES.KEBUN agar jika nilainya berubah di constants, layout otomatis ikut
  return <RoleLayout role={ROLES.KEBUN} />;
};

export default KebunLayout;