// mengatur/ dan memastikan supaya ketika user berhasil login, harus diarahkan ke halaman dashboard sesuai perannya.
// tidak muncul di halaman yang salah atau yang lain.

import { ROLES } from "../config/constants";

export const getRoleRedirectPath = (role) => {
  // PERBAIKAN: Menambahkan role baru dan menyesuaikan path menggunakan tanda hubung (kebab-case)
  const redirects = {
    [ROLES.ADMIN]: "/admin/dashboard",
    [ROLES.MANDOR]: "/petani/dashboard",
    [ROLES.KEBUN]: "/kebun/dashboard",
    [ROLES.ESTATE_MANAGER]: "/estate-manager/dashboard",
    [ROLES.GENERAL_MANAGER_DISTRIK]: "/general-manager-distrik/dashboard",
    [ROLES.TRANSPORT]: "/transport/dashboard",
    [ROLES.PABRIK]: "/pabrik/dashboard",
  };
  
  return redirects[role] || "/";
};