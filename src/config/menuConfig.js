// Dikarenakan setiap role beda-beda fiturnya,
// digunakan menuConfig untuk menyesuaikan setiap menu fitur sesuai role masing-masing tanpa harus mengcoding panjang.

import { ROLES } from "./constants";
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Sprout, 
  History,
  Truck,
  Factory,
  Database,
  Package,
  ClipboardList,
  ShoppingCart,
  MapPin,
  Warehouse,
  FileCheck,
} from "lucide-react";

export const menuConfig = {
  [ROLES.ADMIN]: [
    { label: "Tampilan Utama", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Data Stakeholder", path: "/admin/datastakeholder", icon: Users },
    { label: "Validasi Kebun", path: "/admin/validasikebun", icon: CheckSquare },
  ],
  [ROLES.MANDOR]: [
    { label: "Tampilan Utama", path: "/petani/dashboard", icon: LayoutDashboard },
    { label: "Manajemen Kebun", path: "/petani/manajemenkebun", icon: Sprout },
    { label: "Riwayat Penjualan", path: "/petani/riwayatpenjualan", icon: History },
    { label: "Pantau ISPO", path: "/petani/pantauISPO", icon: FileCheck },
  ],
  [ROLES.KEBUN]: [
    { label: "Tampilan Utama", path: "/kebun/dashboard", icon: LayoutDashboard },
    { label: "Inventaris", path: "/kebun/inventaris", icon: Warehouse },
    { label: "Operasional", path: "/kebun/manajemenoperasional", icon: ClipboardList },
    { label: "Kemitraan Petani", path: "/kebun/kemitraanpetani", icon: Users },
    { label: "Penjualan Ke Pabrik", path: "/kebun/penjualan", icon: ShoppingCart },
    { label: "Distribusi & Logistik", path: "/kebun/distribusi&logistik", icon: Truck },
    { label: "Riwayat Transaksi", path: "/kebun/riwayattransaksi", icon: History },
  ],
  [ROLES.ESTATE_MANAGER]: [
    { label: "Tampilan Utama", path: "/estate_manager/dashboard", icon: LayoutDashboard },
    { label: "Inventaris", path: "/estate_manager/inventaris", icon: Warehouse },
    { label: "Operasional", path: "/estate_manager/manajemenoperasional", icon: ClipboardList },
    { label: "Kemitraan Petani", path: "/estate_manager/kemitraanpetani", icon: Users },
    { label: "Riwayat Penjulan", path: "/estate_manager/riwayattransaksi", icon: History },
  ],
  [ROLES.GENERAL_MANAGER_DISTRIK]: [
    { label: "Tampilan Utama", path: "/general_manager_distrik/dashboard", icon: LayoutDashboard },
    { label: "Inventaris", path: "/general_manager_distrik/inventaris", icon: Warehouse },
    { label: "Operasional", path: "/general_manager_distrik/manajemenoperasional", icon: ClipboardList },
    { label: "Kemitraan Petani", path: "/general_manager_distrik/kemitraanpetani", icon: Users },
    { label: "Riwayat Penjualan", path: "/general_manager_distrik/riwayattransaksi", icon: History },
  ],
  [ROLES.TRANSPORT]: [
    { label: "Tampilan Utama", path: "/logistik/dashboard", icon: LayoutDashboard },
    { label: "Armada", path: "/logistik/armada", icon: Truck },
    { label: "Manajemen Pesanan", path: "/logistik/manajemenpesanan", icon: CheckSquare },
    { label: "Pengiriman", path: "/logistik/pengiriman", icon: MapPin },
  ],
  [ROLES.PABRIK]: [
    { label: "Tampilan Utama", path: "/pabrik/dashboard", icon: LayoutDashboard },
    { label: "Transaksi TBS", path: "/pabrik/transaksiTBS", icon: ShoppingCart },
    { label: "Pemeriksaan TBS", path: "/pabrik/penerimaanTBS", icon: CheckSquare },
    { label: "Stok RAM", path: "/pabrik/stokram", icon: Database },
    { label: "Produksi", path: "/pabrik/produksi", icon: Factory },
  ],
};