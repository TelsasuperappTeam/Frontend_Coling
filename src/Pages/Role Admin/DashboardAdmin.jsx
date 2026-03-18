import { useState, useEffect } from "react";
import { API_ENDPOINTS, ROLES } from "../../config/constants";

const DashboardAdmin = () => {
  const [userData, setUserData] = useState({
    nama: "",
    email: "",
    role: "",
  });

  const [dataJumlah, setDataJumlah] = useState({
    kebun: 0,
    petani: 0,
    logistik: 0,
    pabrik: 0,
    validasiKebun: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      // Mengambil Profile & Statistik Validasi
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
        nama: profile.nama_lengkap || profile.nama || "-",
        email: profile.email || "-",
        role: profile.role || "-",
        foto: profile.foto_profil || "",
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

      // --- PERBAIKAN DISINI ---
      // Kita pastikan userList SELALU Array, apapun respon backendnya
      let userList = [];
      if (Array.isArray(rawData)) {
        userList = rawData;
      } else if (rawData && Array.isArray(rawData.data)) {
        userList = rawData.data;
      }
      // ------------------------

      // Filter menggunakan userList yang sudah pasti Array
      const jumlahKebun = userList.filter(
        (u) => u.role?.toLowerCase() === ROLES.KEBUN?.toLowerCase(),
      ).length;
      const jumlahPetani = userList.filter(
        (u) => u.role?.toLowerCase() === ROLES.PETANI?.toLowerCase(),
      ).length;
      const jumlahLogistik = userList.filter(
        (u) => u.role?.toLowerCase() === ROLES.LOGISTIK?.toLowerCase(),
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
        petani: jumlahPetani,
        logistik: jumlahLogistik,
        pabrik: jumlahPabrik,
        validasiKebun,
      });
    } catch (err) {
      console.error("Gagal memuat data pengguna:", err);
      // Jangan biarkan error menghentikan render komponen lain
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5302D]"></div>
      </div>
    );

  return (
    <div className="p-6 sm:p-10 bg-white min-h-screen font-sans text-[#B5302D]">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">Data Diri Admin TELSA Super App</h2>

      {/* ====== TOP SECTION (PROFILE + VALIDASI) ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---- PROFILE CARD ---- */}
        <div className="bg-[#EF8523] text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-md hover:shadow-lg transition">
          <div className="text-sm sm:text-base leading-relaxed space-y-2">
            <p>
              <strong>Nama Admin :</strong> {userData.nama || "Belum ada data"}
            </p>
            <p>
              <strong>Role :</strong> {userData.role || "Belum ada data"}
            </p>
            <p>
              <strong>Email :</strong> {userData.email || "Belum ada data"}
            </p>
          </div>
        </div>

        {/* ---- VALIDASI CARD ---- */}
        <div className="flex flex-col gap-3">
          <div className="bg-[#EF8523] text-white font-semibold text-base px-6 py-3 rounded-2xl shadow-md">
            Total Permintaan Stakeholder
          </div>

          <div className="bg-gray-50 rounded-2xl shadow-md p-6 flex flex-col sm:flex-row items-center justify-between gap-3 border border-gray-300">
            <div>
              <p className="text-base sm:text-lg font-medium text-[#B5302D]">
                Jumlah Permintaan Validasi Akun Kebun
              </p>
              <p className="text-sm text-gray-500">
                Data ini menampilkan permintaan validasi akun stakeholder kebun
                yang belum disetujui.
              </p>
            </div>

            <div className="bg-[#EF8523]/7 border-2 border-[#B5302D] text-black rounded-xl px-5 py-3 text-center font-bold min-w-[130px]">
              {dataJumlah.validasiKebun}
              <span className="text-sm font-normal ml-1">Stakeholder</span>
            </div>
          </div>
        </div>
      </div>

      {/* ====== STAKEHOLDER SECTION ====== */}
      <div className="mt-10">
        <div className="bg-[#EF8523] text-white font-bold text-base px-6 py-3 rounded-t-2xl shadow-md">
          Daftar Jumlah Stakeholder
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-b-2xl shadow-md border border-gray-300">
          <StakeholderCard title="Kebun" jumlah={dataJumlah.kebun} />
          <StakeholderCard title="Petani" jumlah={dataJumlah.petani} />
          <StakeholderCard title="Logistik" jumlah={dataJumlah.logistik} />
          <StakeholderCard title="Pabrik" jumlah={dataJumlah.pabrik} />
        </div>
      </div>
    </div>
  );
};

// Komponen kartu kecil biar rapi
const StakeholderCard = ({ title, jumlah }) => (
  <div className="relative bg-[#EF8523]/7 rounded-xl p-5 text-center border border-gray-200 hover:shadow-lg transition">
    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 h-1.5 rounded-full bg-[#EF8523]"></div>
    <p className="font-semibold mb-2 text-black">Jumlah Stakeholder {title}</p>
    <div className="text-3xl font-bold my-2 text-black">{jumlah}</div>
    <span className="text-sm border border-[#B5302D] px-3 py-1 rounded-lg text-black">
      Stakeholder
    </span>
  </div>
);

export default DashboardAdmin;
