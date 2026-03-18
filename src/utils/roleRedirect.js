// mengatur/ dan memastikan supaya ketika user berhasil login, harus diarahkan ke halaman dashboard sesuai perannya.
// tidak mundul di halaman yang salah atau yang lain.

import { ROLES } from "../config/constants";


export const getRoleRedirectPath = (role) => {
  const redirects = {
    [ROLES.ADMIN]: "/admin/dashboard",
    [ROLES.LOGISTIK]: "/logistik/dashboard",
    [ROLES.PABRIK]: "/pabrik/dashboard",
    [ROLES.PETANI]: "/petani/dashboard",
    [ROLES.KEBUN]: "/kebun/dashboard",
  };
  
  return redirects[role] || "/";
};