// src/layouts/TransportLayout.jsx
import React from "react";
import RoleLayout from "./RoleLayout";
import { ROLES } from "../config/constants"; // Import konstantanya

const TransportLayout = () => {
  // Gunakan ROLES.TRANSPORT agar jika nilainya berubah di constants, layout otomatis ikut
  return <RoleLayout role={ROLES.TRANSPORT} />;
};

export default TransportLayout;