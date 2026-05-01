import "./index.css";
import Navbar from "./components/Navbar";
import HomePages from "./Pages/HomePages";
import Daftar from "./Pages/Daftar";
import Masuk from "./Pages/Masuk";
import Footer from "./components/Footer";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import FAQ from "./components/FAQ";
import { ROLES } from "./config/constants";
import VerifikasiOTP from "./components/VerifikasiOTP";
import LupaKataSandi from "./Pages/LupaKataSandi";

// --- IMPORT TOASTER GLOBAL ---
import { Toaster } from "react-hot-toast";

// Import routes per role
import AdminRoutes from "./Routes/AdminRoutes";
import KebunRoutes from "./Routes/KebunRoutes";
import MandorRoutes from "./Routes/MandorRoutes";
import PabrikRoutes from "./Routes/PabrikRoutes";
import TransportRoutes from "./Routes/TransportRoutes";
import EstateManagerRoutes from "./Routes/EstateManagerRoutes";
import GMDistrikRoutes from "./Routes/GMDistrikRoutes";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();

  // Menyesuaikan rolePaths agar Navbar dan Footer tidak muncul di rute-rute ini
  const rolePaths = [
    `/${ROLES.ADMIN}`,
    `/${ROLES.MANDOR}`,
    `/${ROLES.KEBUN}`,
    `/${ROLES.ESTATE_MANAGER}`,
    `/${ROLES.GENERAL_MANAGER_DISTRIK}`,
    `/${ROLES.TRANSPORT}`,
    `/${ROLES.PABRIK}`,
  ];

  // navbar tidak tampil di halaman role
  const showNavbar = !rolePaths.some((rolePath) =>
    location.pathname.startsWith(rolePath)
  );

  // footer tidak tampil di halaman daftar, masuk, verifikasiOTP, lupa kata sandi, juga tidak tampil pada semua halaman role
  const isOnRolePath = rolePaths.some((rolePath) =>
    location.pathname.startsWith(rolePath)
  );
  const showFooter =
    !isOnRolePath &&
    !["/daftar", "/masuk", "/verifikasiOTP", "/lupakatasandi"].includes(
      location.pathname
    );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* --- KOMPONEN TOASTER AKTIF DI SELURUH APLIKASI --- */}
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          // Jarak toast dari atas layar
          style: { marginTop: '10px' }
        }} 
      />

      {showNavbar && <Navbar />}

      {/* konten utama biar fleksibel dan tidak tumpang tindih footer */}
      <main className="flex-grow pb-24 md:pb-6">
        <Routes>
          <Route path="/" element={<HomePages />} />
          <Route path="/masuk" element={<Masuk />} />
          <Route path="/daftar" element={<Daftar />} />
          <Route path="/verifikasiOTP" element={<VerifikasiOTP />} />
          <Route path="/lupaKataSandi" element={<LupaKataSandi />} />
          <Route path="/faq" element={<FAQ />} />

          {/* Role routes - Dinamis berdasarkan ROLES dari constants.js */}
          <Route path={`/${ROLES.ADMIN}/*`} element={<AdminRoutes />} />
          <Route path={`/${ROLES.MANDOR}/*`} element={<MandorRoutes />} />
          <Route path={`/${ROLES.KEBUN}/*`} element={<KebunRoutes />} />
          <Route path={`/${ROLES.ESTATE_MANAGER}/*`} element={<EstateManagerRoutes />} />
          <Route path={`/${ROLES.GENERAL_MANAGER_DISTRIK}/*`} element={<GMDistrikRoutes />} />
          <Route path={`/${ROLES.TRANSPORT}/*`} element={<TransportRoutes />} />
          <Route path={`/${ROLES.PABRIK}/*`} element={<PabrikRoutes />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {showFooter && <Footer />}
    </div>
  );
}

export default App;