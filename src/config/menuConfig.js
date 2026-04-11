// Dikarenakan setiap role beda-beda fiturnya,
// digunakan menuConfig untuk menyesuaikan setiap menu fitur sesuai role masing-masing tanpa harus mengcoding panjang.

import { ROLES } from "./constants";

export const menuConfig = {
  [ROLES.ADMIN]: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Data Stakeholder", path: "/admin/datastakeholder" },
    { label: "Validasi Kebun", path: "/admin/validasikebun" },
  ],
  [ROLES.MANDOR]: [
    { label: "Dashboard", path: "/petani/dashboard" },
    { label: "Manajemen Kebun", path: "/petani/manajemenkebun" },
    { label: "Riwayat Penjualan", path: "/petani/riwayatpenjualan" },
    { label: "Pantau ISPO", path: "/petani/pantauISPO" },
  ],
  [ROLES.KEBUN]: [
    { label: "Dashboard", path: "/kebun/dashboard" },
    { label: "Penjualan", path: "/kebun/penjualan" },
    { label: "Distribusi&Logistik", path: "/kebun/distribusi&logistik" },
    { label: "Operasional", path: "/kebun/manajemenoperasional" },
    { label: "Kemitraan Petani", path: "/kebun/kemitraanpetani" },
    { label: "Inventaris", path: "/kebun/inventaris" },
  ],
    [ROLES.ESTATE_MANAGER]: [
    { label: "Dashboard", path: "/estate_manager/dashboard" },
    { label: "Penjualan", path: "/estate_manager/penjualan" },
    { label: "Distribusi&Logistik", path: "/estate_manager/distribusi&logistik" },
    { label: "Operasional", path: "/estate_manager/manajemenoperasional" },
    { label: "Kemitraan Petani", path: "/estate_manager/kemitraanpetani" },
    { label: "Inventaris", path: "/estate_manager/inventaris" },
  ],
    [ROLES.GENERAL_MANAGER_DISTRIK]: [
    { label: "Dashboard", path: "/general_manager_distrik/dashboard" },
    { label: "Penjualan", path: "/general_manager_distrik/penjualan" },
    { label: "Distribusi&Logistik", path: "/general_manager_distrik/distribusi&logistik" },
    { label: "Operasional", path: "/general_manager_distrik/manajemenoperasional" },
    { label: "Kemitraan Petani", path: "/general_manager_distrik/kemitraanpetani" },
    { label: "Inventaris", path: "/general_manager_distrik/inventaris" },
  ],
  [ROLES.TRANSPORT]: [
    { label: "Dashboard", path: "/logistik/dashboard" },
    { label: "Manajemen Pesanan", path: "/logistik/manajemenpesanan" },
    { label: "Pengiriman", path: "/logistik/pengiriman" },
    { label: "Armada", path: "/logistik/armada" },
  ],
  [ROLES.PABRIK]: [
    { label: "Dashboard", path: "/pabrik/dashboard" },
    { label: "Transaksi TBS", path: "/pabrik/transaksiTBS" },
    { label: "Penerimaan TBS", path: "/pabrik/penerimaanTBS" },
    { label: "Stok RAM", path: "/pabrik/stokram" },
    { label: "Produksi", path: "/pabrik/produksi" },
  ],
};
