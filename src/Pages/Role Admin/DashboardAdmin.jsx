import { useState, useEffect } from "react";
import { API_ENDPOINTS, ROLES } from "../../config/constants";

const DashboardAdmin = () => {
  const [userData, setUserData] = useState({
    nama: "",
    email: "",
    role: "",
  });

  // State disesuaikan dengan role baru
  const [dataJumlah, setDataJumlah] = useState({
    kebun: 0,
    mandor: 0,
    estateManager: 0,
    gmDistrik: 0,
    logistik: 0,
    pabrik: 0,
    validasiKebun: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchAdminProfile(), fetchDashboardStats()]);
      setLoading(false);
    };
    initData();
  }, []);

  // ====== Ambil Data Profil Admin ======
  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(API_ENDPOINTS.USER.ME, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal memuat profil admin");

      const profile = await res.json();

      setUserData({
        nama: profile.nama_lengkap || profile.nama,
        email: profile.email,
        role: "Admin",
        foto: profile.foto_profil, // Opsional jika ingin dipakai nanti
      });
    } catch (err) {
      console.error("Gagal memuat profil admin:", err);
    }
  };

  // ====== Ambil Semua Pengguna dan Hitung Statistik ======
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(API_ENDPOINTS.USER.ADMIN.GET_ALL_USERS, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal memuat data pengguna");

      const rawData = await res.json();

      // Memastikan userList SELALU Array
      let userList = [];
      if (Array.isArray(rawData)) {
        userList = rawData;
      } else if (rawData && Array.isArray(rawData.data)) {
        userList = rawData.data;
      }

      // Filter menggunakan role terbaru dari constant
      const jumlahKebun = userList.filter(
        (u) => u.role?.toLowerCase() === ROLES.KEBUN?.toLowerCase(),
      ).length;
      const jumlahMandor = userList.filter(
        (u) => u.role?.toLowerCase() === ROLES.MANDOR?.toLowerCase(),
      ).length;
      const jumlahEstateManager = userList.filter(
        (u) => u.role?.toLowerCase() === ROLES.ESTATE_MANAGER?.toLowerCase(),
      ).length;
      const jumlahGMDistrik = userList.filter(
        (u) =>
          u.role?.toLowerCase() ===
          ROLES.GENERAL_MANAGER_DISTRIK?.toLowerCase(),
      ).length;
      const jumlahTransport = userList.filter(
        (u) => u.role?.toLowerCase() === ROLES.TRANSPORT?.toLowerCase(),
      ).length;
      const jumlahPabrik = userList.filter(
        (u) => u.role?.toLowerCase() === ROLES.PABRIK?.toLowerCase(),
      ).length;

      const validasiKebun = userList.filter(
        (u) =>
          u.role?.toLowerCase() === ROLES.KEBUN?.toLowerCase() &&
          u.status?.toLowerCase() === "pending",
      ).length;

      setDataJumlah({
        kebun: jumlahKebun,
        mandor: jumlahMandor,
        estateManager: jumlahEstateManager,
        gmDistrik: jumlahGMDistrik,
        logistik: jumlahTransport,
        pabrik: jumlahPabrik,
        validasiKebun,
      });
    } catch (err) {
      console.error("Gagal memuat data pengguna:", err);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-[#B5302D]"></div>
        <p className="mt-4 text-sm font-medium text-gray-500">
          Memuat dashboard...
        </p>
      </div>
    );

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 md:p-8 min-h-screen font-sans bg-white">
      {/* ====== HEADER ====== */}
      <div>
        {/* UKURAN DIPERKECIL: text-xl sm:text-2xl font-bold */}
        <h2 className="text-xl sm:text-2xl font-bold text-[#B5302D] tracking-tight">
          Dashboard Admin
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          Pantau jumlah data stakeholder dalam sistem.
        </p>
      </div>
      
      {/* --- GARIS PEMBATAS --- */}
      <hr className="border-gray-200 mb-6 sm:mb-8" />

      {/* ====== TOP SECTION (PROFILE + VALIDASI) ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 items-stretch">
        {/* ---- PROFILE CARD ---- */}
        <div className="bg-gradient-to-br from-[#EF8523] to-[#d9751d] text-white rounded-2xl p-5 sm:p-7 flex flex-col shadow-sm relative overflow-hidden h-full border border-orange-400">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>

          {/* UKURAN DIPERKECIL: text-base sm:text-lg */}
          <h3 className="font-bold text-base sm:text-lg mb-4 text-white/90 border-b border-white/20 pb-3 relative z-10">
            Data Diri Admin
          </h3>

          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm relative z-10 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/80 font-medium">Nama Terdaftar</span>
              <span className="font-bold text-right">
                {userData.nama || "Admin Sistem"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/80 font-medium">Hak Akses</span>
              <span className="font-bold text-right bg-white/20 px-2.5 py-1 rounded-lg">
                {userData.role || "Belum ada data"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 pt-1">
              <span className="text-white/80 font-medium">Email</span>
              <span className="font-bold sm:text-right break-all">
                {userData.email || "Belum ada data"}
              </span>
            </div>
          </div>
        </div>

        {/* ---- VALIDASI CARD ---- */}
        <div className="flex flex-col gap-3 h-full">
          {/* Header Validasi */}
          <div className="bg-gradient-to-r from-[#B5302D] to-red-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-300 animate-pulse"></span>
            Total Permintaan Stakeholder
          </div>

          {/* Body Validasi */}
          <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-gray-100 hover:border-red-100 transition-colors flex-1">
            <div className="flex-1">
              {/* UKURAN DIPERKECIL: text-sm sm:text-base */}
              <p className="text-sm sm:text-base font-bold text-gray-800 leading-tight">
                Validasi Akun Kebun Baru
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-2 leading-relaxed">
                Menampilkan jumlah permintaan validasi akun stakeholder kebun
                yang masih dalam status <strong>pending</strong> dan menunggu
                persetujuan.
              </p>
            </div>

            <div className="bg-red-50 border border-red-100 text-[#B5302D] rounded-2xl px-5 py-3 sm:py-4 flex flex-col items-center justify-center min-w-[100px] shrink-0 w-full sm:w-auto">
              {/* UKURAN DIPERKECIL: text-2xl sm:text-3xl */}
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                {dataJumlah.validasiKebun}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest mt-1 text-red-400">
                Menunggu
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====== STAKEHOLDER SECTION ====== */}
      <div className="pt-2 sm:pt-4">
        {/* Header List Stakeholder */}
        <div className="bg-gray-50 border-t border-x border-gray-200 px-5 py-3.5 rounded-t-2xl flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">
            Distribusi Stakeholder Aktif
          </h3>
        </div>

        {/* Grid List Stakeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 bg-white p-4 sm:p-5 rounded-b-2xl shadow-sm border border-gray-200">
          <StakeholderCard title="Kebun" jumlah={dataJumlah.kebun} />
          <StakeholderCard title="Mandor" jumlah={dataJumlah.mandor} />
          <StakeholderCard
            title="Estate Manager"
            jumlah={dataJumlah.estateManager}
          />
          <StakeholderCard title="GM Distrik" jumlah={dataJumlah.gmDistrik} />
          <StakeholderCard title="Transport" jumlah={dataJumlah.logistik} />
          <StakeholderCard title="Pabrik" jumlah={dataJumlah.pabrik} />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// KOMPONEN KARTU KECIL STAKEHOLDER
// ==========================================
const StakeholderCard = ({ title, jumlah }) => (
  <div className="relative bg-white border border-gray-100 rounded-xl p-4 sm:p-5 text-center shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 flex flex-col justify-center items-center group overflow-hidden">
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-1 rounded-b-full bg-gray-200 group-hover:bg-[#EF8523] group-hover:w-full transition-all duration-300"></div>

    <p className="font-semibold text-gray-500 text-[11px] sm:text-xs mb-1.5 mt-2">
      Stakeholder {title}
    </p>

    {/* UKURAN DIPERKECIL: text-2xl sm:text-3xl */}
    <div className="text-2xl sm:text-3xl font-bold text-gray-800 my-1.5 group-hover:text-[#B5302D] transition-colors">
      {jumlah}
    </div>

    <span className="text-[8px] sm:text-[9px] font-bold bg-orange-50 text-[#EF8523] px-2.5 py-1 rounded-md mt-auto uppercase tracking-widest border border-orange-100">
      Akun Terdaftar
    </span>
  </div>
);

export default DashboardAdmin;
