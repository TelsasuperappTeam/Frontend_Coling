// src/layouts/MandorLayout.jsx
import React from "react";
import RoleLayout from "./RoleLayout";
import { ROLES } from "../config/constants"; // Import konstantanya

const MandorLayout = () => {
  // Gunakan ROLES.MANDOR agar jika nilainya berubah di constants, layout otomatis ikut
  // Catatan: ROLES.MANDOR bernilai "petani" menyesuaikan logika Backend
  return <RoleLayout role={ROLES.MANDOR} />; 
};

export default MandorLayout;