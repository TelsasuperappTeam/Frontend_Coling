import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, ROLES, getFileUrl } from "../../../config/constants"; // Tambahkan getFileUrl
import DataDiriPabrik from "./DataDiriPabrik";
import {
  Loader2,
  ClipboardCheck,
  Truck,
  Droplets,
  Factory,
  User,
} from "lucide-react";

// --- Komponen Card Reusable ---
const Card = ({ title, icon: Icon, children, rightContent }) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col h-full overflow-hidden">
    <div className="bg-[#EF8523] px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center flex-shrink-0">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm shadow-sm flex items-center justify-center">
            <Icon className="text-white w-5 h-5" />
          </div>
        )}
        <h3 className="text-[14px] sm:text-[16px] font-bold text-white tracking-wide">
          {title}
        </h3>
      </div>

      {rightContent && (
        <div className="scale-90 sm:scale-100 origin-right">{rightContent}</div>
      )}
    </div>

    <div className="p-4 sm:p-5 text-gray-800 bg-white h-64 sm:h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
      {children}
    </div>
  </div>
);

const isProfileIncomplete = (p) => {
  return (
    !p.nama_pabrik ||
    !p.nomor_telepon ||
    !p.email ||
    !p.foto ||
    !p.alamat_pabrik ||
    !p.koordinat
  );
};

export default function DashboardPabrik() {
  const navigate = useNavigate();
  const [showPopupDataDiri, setShowPopupDataDiri] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // State Loading

  // --- STATE PROFILE  ---
  const [profile, setProfile] = useState({
    nama_pabrik: "",
    role: ROLES.PABRIK,
    email: "",
    nomor_telepon: "",
    alamat_pabrik: "",
    foto: "",
    koordinat: "",
    //Jenis_hasil_roduksi: "",
  });

  // --- FETCH DATA USER (API) ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");
        if (!token) {
          console.error("Token tidak ditemukan");
          // navigate("/login");
          return;
        }

        const response = await fetch(API_ENDPOINTS.USER.ME, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data profil");
        }

        const userData = await response.json();
        console.log("Data Profil Pabrik:", userData);

        // --- MAPPING DATA BACKEND MAHAR KE FRONTEND ---
        setProfile({
          nama_pabrik: userData.nama_lengkap || "-",
          role: userData.role || ROLES.PABRIK,
          email: userData.email || "-",
          nomor_telepon: userData.no_hp || "-",
          alamat_pabrik: userData.alamat || "",
          foto: getFileUrl(userData.foto_profil_url) || "",
          koordinat: userData.koordinat
            ? JSON.stringify(userData.koordinat)
            : "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  // --- DATA DUMMY FITUR LAIN ---
  const [riwayatTransaksi] = useState([
    {
      id: 1,
      petani: "Budi Santoso",
      kebun: "Kebun Sinar Makmur",
      tanggal: "2023-10-25",
      berat: 2500,
      status: "Selesai",
    },
    {
      id: 2,
      petani: "Ahmad Riadi",
      kebun: "Kebun Harapan Jaya",
      tanggal: "2023-10-24",
      berat: 1800,
      status: "Proses",
    },
  ]);

  const [antrianLogistik] = useState([
    {
      id: "LOG-001",
      driver: "Ujang Suparman",
      nopol: "BE 1234 CD",
      estimasi: "23-10-2025",
      status: "Unloading",
    },
    {
      id: "LOG-002",
      driver: "Dedi Kusnadi",
      nopol: "B 5678 FG",
      estimasi: "24-10-2025",
      status: "Menunggu",
    },
  ]);

  const [stokCPO] = useState({
    totalKapasitas: 5000,
    terisi: 3200,
    sisa: 1800,
  });

  const [produksiHariIni] = useState([
    { nama: "CPO", vol: "120 Ton" },
    { nama: "Kernel", vol: "25 Ton" },
    { nama: "Cangkang", vol: "15 Ton" },
  ]);

  const handleProfileSaved = (dataSaved) => {
    if (dataSaved) {
      // Refresh halaman simple agar data terupdate dari server
      window.location.reload();
    }
    setShowPopupDataDiri(false);
  };

  // --- LOGIKA PENGUNCIAN FIELD ---
  // Field dikunci (true) JIKA datanya ada, tidak kosong, dan bukan "-"
  const lockedFieldsConfig = {
    // Kunci FOTO jika URL foto ada
    foto: !!profile.foto && profile.foto !== "",

    // Kunci ALAMAT jika alamat_pabrik terisi valid
    // PENTING: Key harus 'alamat' agar dibaca oleh DataDiriPabrik
    alamat:
      !!profile.alamat_pabrik &&
      profile.alamat_pabrik !== "" &&
      profile.alamat_pabrik !== "-",

    // Kunci KOORDINAT jika data koordinat ada
    koordinat:
      !!profile.koordinat &&
      profile.koordinat !== "" &&
      profile.koordinat !== "-",
  };

  const DataRow = ({ label, value }) => (
    <div className="mb-3 sm:mb-4 last:mb-0">
      <p className="text-black/70 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
        {label}
      </p>
      <p className="text-white text-[14px] sm:text-[16px] font-medium leading-snug tracking-wide break-words">
        {value && value !== "" ? value : "—"}
      </p>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-10 min-h-screen font-sans bg-white">
      {/* SECTION 1: DATA DIRI */}
      <div className="bg-gradient-to-r from-[#EF8523] to-[#f19d4e] rounded-2xl p-5 sm:p-8 shadow-lg relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex flex-row items-center justify-between mb-6 sm:mb-8 border-b border-black/10 pb-4 gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
              Data Diri Anda
            </h3>
            <button
              onClick={() => setShowPopupDataDiri(true)}
              className="bg-white/20 backdrop-blur-md text-black/80 border border-white/50 rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold hover:bg-white hover:text-[#EF8523] transition-all duration-300 whitespace-nowrap"
            >
              {isProfileIncomplete(profile)
                ? "Lengkapi Data Diri"
                : "Lihat Profil"}
            </button>
          </div>

          {isLoadingProfile ? (
            <div className="flex flex-col justify-center items-center h-32 text-white space-y-2">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-semibold">
                Memuat Data Profil...
              </span>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              {/* --- BAGIAN FOTO PROFIL (YANG DIUBAH) --- */}
              <div className="flex-shrink-0 mx-auto md:mx-0 group">
                <div className="p-1 bg-white/20 rounded-2xl backdrop-blur-sm">
                  {profile.foto ? (
                    /* Jika ada foto, tampilkan IMG */
                    <img
                      src={profile.foto}
                      alt="Foto Profil"
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl object-cover shadow-inner bg-white"
                    />
                  ) : (
                    /* Jika tidak ada foto, tampilkan ICON */
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl shadow-inner bg-white flex items-center justify-center text-gray-400">
                      <User
                        className="w-12 h-12 sm:w-16 sm:h-16"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* --- AKHIR BAGIAN FOTO --- */}

              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 sm:gap-y-2 w-full">
                <div className="space-y-1 sm:space-y-2">
                  <DataRow label="Nama Pabrik" value={profile.nama_pabrik} />
                  <DataRow label="Role" value={profile.role} />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <DataRow label="Email" value={profile.email} />
                  <DataRow
                    label="Nomor Telepon"
                    value={profile.nomor_telepon}
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <DataRow
                    label="Alamat Pabrik"
                    value={profile.alamat_pabrik}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-[#B5302D] mt-6 sm:mt-8 mb-6 sm:mb-10 px-1 border-l-4 border-[#B5302D] pl-3">
        Dashboard Fitur Utama Pabrik
      </h2>

      {/* SECTION 2: WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* FITUR 1: Validasi Penerimaan TBS */}
        <Card
          title="Validasi Penerimaan TBS"
          icon={ClipboardCheck}
          rightContent={
            <button
              onClick={() => navigate("/pabrik/validasipenerimaan")}
              className="bg-white hover:bg-[#B5302D] text-black hover:text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all shadow-sm"
            >
              Lihat Detail
            </button>
          }
        >
          <div className="space-y-3">
            {riwayatTransaksi.length > 0 ? (
              riwayatTransaksi.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-sm text-gray-800">
                      {item.petani}
                    </p>
                    <p className="text-[10px] text-gray-500">{item.kebun}</p>
                    <p className="text-[10px] font-medium text-[#B5302D]">
                      {item.berat} Kg
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      item.status === "Selesai"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 text-xs italic py-4">
                Belum ada transaksi hari ini.
              </p>
            )}
          </div>
        </Card>

        {/* FITUR 2: pantau pengiriman transaksi */}
        <Card title="Pantau Pengiriman TBS" icon={Truck}>
          <div className="space-y-3">
            {antrianLogistik.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
              >
                <div>
                  <p className="font-bold text-sm text-gray-800">{log.nopol}</p>
                  <p className="text-[10px] text-gray-500">{log.driver}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">Estimasi</p>
                  <p className="font-bold text-xs text-[#EF8523]">
                    {log.estimasi}
                  </p>
                </div>
              </div>
            ))}
            <div className="pt-2 text-center">
              <button className="text-[#B5302D] text-[10px] font-bold hover:underline">
                Lihat Seluruh Antrian &rarr;
              </button>
            </div>
          </div>
        </Card>

        {/* FITUR 3: Monitoring Stok CPO */}
        <Card title="Monitoring Stok Tangki CPO" icon={Droplets}>
          <div className="flex flex-col h-full justify-center space-y-4">
            <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#B5302D] to-[#fd8128] transition-all duration-1000"
                style={{
                  width: `${(stokCPO.terisi / stokCPO.totalKapasitas) * 100}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 font-medium">
              <span>Terisi: {stokCPO.terisi} Ton</span>
              <span>Kapasitas: {stokCPO.totalKapasitas} Ton</span>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-center">
              <p className="text-[10px] text-gray-500 uppercase">
                Sisa Ruang Tangki
              </p>
              <p className="text-xl font-bold text-[#EF8523]">
                {stokCPO.sisa} Ton
              </p>
            </div>
          </div>
        </Card>

        {/* FITUR 4: Total Produksi */}
        <Card title="Total Produksi Hari Ini" icon={Factory}>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {produksiHariIni.length > 0 ? (
              produksiHariIni.map((prod, idx) => (
                <div
                  key={idx}
                  className="group bg-gray-50 border border-[#EF8523] rounded-xl p-3 sm:p-5 flex flex-col justify-center items-center"
                >
                  <p className="text-[9px] sm:text-[11px] font-bold text-[#B5302D] uppercase tracking-widest mb-1 sm:mb-2 text-center">
                    {prod.nama}
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-800 tracking-tight">
                    {prod.vol}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center h-40 text-gray-400">
                <p className="text-sm font-light">Belum ada data produksi.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* --- POPUP DATA DIRI --- */}
      {showPopupDataDiri && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="w-full max-w-3xl h-[85vh] rounded-3xl animate-fade-in-up flex relative">
            <DataDiriPabrik
              onClose={() => setShowPopupDataDiri(false)}
              onSave={handleProfileSaved}
              initialData={profile}
              lockedFields={lockedFieldsConfig}
            />
          </div>
        </div>
      )}
    </div>
  );
}
