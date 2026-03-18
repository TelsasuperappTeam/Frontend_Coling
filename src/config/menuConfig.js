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
    { label: "Dashboard", path: "/mandor/dashboard" },
    { label: "Manajemen Kebun", path: "/mandor/manajemenkebun" },
    { label: "Riwayat Penjualan", path: "/mandor/riwayatpenjualan" },
    { label: "Pantau ISPO", path: "/mandor/pantauISPO" },
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
    { label: "Dashboard", path: "/estate-manager/dashboard" },
    { label: "Penjualan", path: "/estate-manager/penjualan" },
    { label: "Distribusi&Logistik", path: "/estate-manager/distribusi&logistik" },
    { label: "Operasional", path: "/estate-manager/manajemenoperasional" },
    { label: "Kemitraan Petani", path: "/estate-manager/kemitraanpetani" },
    { label: "Inventaris", path: "/estate-manager/inventaris" },
  ],
    [ROLES.GENERAL_MANAGER_DISTRIK]: [
    { label: "Dashboard", path: "/general-manager-distrik/dashboard" },
    { label: "Penjualan", path: "/general-manager-distrik/penjualan" },
    { label: "Distribusi&Logistik", path: "/general-manager-distrik/distribusi&logistik" },
    { label: "Operasional", path: "/general-manager-distrik/manajemenoperasional" },
    { label: "Kemitraan Petani", path: "/general-manager-distrik/kemitraanpetani" },
    { label: "Inventaris", path: "/general-manager-distrik/inventaris" },
  ],
  [ROLES.TRANSPORT]: [
    { label: "Dashboard", path: "/transport/dashboard" },
    { label: "Manajemen Pesanan", path: "/transport/manajemenpesanan" },
    { label: "Pengiriman", path: "/transport/pengiriman" },
    { label: "Armada", path: "/transport/armada" },
  ],
  [ROLES.PABRIK]: [
    { label: "Dashboard", path: "/pabrik/dashboard" },
    { label: "Transaksi TBS", path: "/pabrik/transaksiTBS" },
    { label: "Penerimaan TBS", path: "/pabrik/penerimaanTBS" },
    { label: "Stok RAM", path: "/pabrik/stokram" },
    { label: "Produksi", path: "/pabrik/produksi" },
  ],
};
