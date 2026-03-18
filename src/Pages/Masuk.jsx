import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRoleRedirectPath } from "../utils/roleRedirect";
import { API_ENDPOINTS, ROLES } from "../config/constants";
import { jwtDecode } from "jwt-decode";

// ===================== KOMPONEN LOGIN =====================
export default function Masuk() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ====== START: HAPUS BLOK INI NANTI KALAU BE SUDAH AMAN ======
  const handleBypass = (roleDev) => {
    localStorage.setItem("token", "dummy-bypass-token");
    localStorage.setItem("role", roleDev);
    localStorage.setItem("userRole", roleDev);
    const targetPath = getRoleRedirectPath(roleDev);
    if (targetPath) navigate(targetPath, { replace: true });
  };
  // ====== END: HAPUS BLOK INI NANTI KALAU BE SUDAH AMAN ========

  // ===================== HANDLE LOGIN =====================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Email dan kata sandi wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Email atau password salah!");
      }

      // 1. AMBIL TOKEN
      // Catatan: Log token dihapus untuk keamanan
      const token = data.access_token || data.token || data.data?.access_token;

      if (!token) {
        throw new Error("Token tidak ditemukan dalam server!");
      }

      // 2. DECODE TOKEN UNTUK DAPAT ROLE
      let userRole = null;
      try {
        const decoded = jwtDecode(token);
        userRole = decoded.role || decoded.roles || decoded.user_role;
      } catch (decodeError) {
        console.error("Gagal decode token:", decodeError);
        throw new Error("Token rusak atau tidak valid.");
      }

      // 3. VALIDASI ROLE
      if (!userRole) {
        throw new Error("Role pengguna tidak ditemukan di dalam sistem!");
      }

      const normalizedRole = userRole.toLowerCase();

      // 4. SIMPAN KE LOCALSTORAGE
      localStorage.setItem("token", token);
      localStorage.setItem("role", normalizedRole);
      localStorage.setItem("userRole", normalizedRole);

      // 5. REDIRECT BERDASARKAN ROLE
      const targetPath = getRoleRedirectPath(normalizedRole);

      if (targetPath && targetPath !== "/") {
        navigate(targetPath, { replace: true });
      } else {
        console.error(
          `❌ Role '${normalizedRole}' tidak dikenali di roleRedirect!`,
        );
        alert(`Role '${normalizedRole}' tidak valid silahkan hubungi admin.`);
      }
    } catch (err) {
      console.error("Login error:", err); // Log error tetap aman
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===================== RENDER TAMPILAN LOGIN =====================
  return (
    <div className="mt-5 min-h-screen w-full flex justify-center items-center bg-white px-4 py-8 sm:px-6 sm:py-12 overflow-hidden antialiased">
      {/* ========== KOTAK LOGIN CARD ========== */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-gradient-to-br from-gray-100 to-[#EF8523]/20 shadow-xl border border-gray-200 rounded-2xl p-6 sm:p-8">
        {/* ====== JUDUL ====== */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight text-center tracking-tight">
          <span className="block text-[#B5302D]">Selamat Datang di</span>
          <span className="block">TELSA Super App!</span>
        </h1>

        {/* ====== SUBTEKS ====== */}
        <p className="text-center text-gray-600 mt-2 sm:mt-3 text-xs sm:text-sm md:text-base">
          Silahkan masuk dengan akun anda
        </p>

        {/* ====== FORM LOGIN ====== */}
        <form
          onSubmit={handleLogin}
          className="mt-6 sm:mt-8 space-y-4 sm:space-y-5 text-xs sm:text-sm md:text-base"
        >
          {/* Input Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-black mb-2 text-xs sm:text-sm"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              aria-required="true"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 bg-white placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#EF8523] focus:ring-offset-2 focus:ring-offset-white transition-shadow duration-150"
            />
          </div>

          {/* Input Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-black mb-2 text-xs sm:text-sm"
            >
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              aria-required="true"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 bg-white placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#EF8523] focus:ring-offset-2 focus:ring-offset-white transition-shadow duration-150"
            />
          </div>

          {/* Tambahan: Link ke Lupa Kata Sandi */}
          <div className="text-right">
            <Link
              to="/lupakatasandi"
              className="text-[#EF8523] text-xs sm:text-sm font-semibold hover:underline"
            >
              Lupa kata sandi?
            </Link>
          </div>

          {/* Tombol Masuk dengan LOADING SPINNER */}
          <button
            type="submit"
            disabled={loading}
            aria-label="Masuk ke akun"
            className={`mx-auto block w-full sm:w-auto rounded-xl px-6 py-2.5 sm:px-6 sm:py-3 text-white font-semibold 
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#B5302D] hover:bg-[#992824]"
              } 
              active:scale-95 transform transition-all duration-150 shadow-[0_6px_18px_rgba(181,46,45,0.18)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B5302D] flex items-center justify-center`}
          >
            {loading ? (
              // Tampilan Loading Memutar
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                <span>Memproses...</span>
              </div>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        {/* ====== LINK PENDAFTARAN ====== */}
        <p className="text-center mt-5 sm:mt-8 text-[11px] sm:text-sm md:text-base text-gray-800">
          Belum punya akun?{" "}
          <Link
            to="/daftar"
            className="text-[#EF8523] font-semibold underline-offset-4 hover:underline focus:outline-none focus:ring-1 focus:ring-[#EF8523]/50"
          >
            Daftarkan akun sekarang!
          </Link>
        </p>

        {/* ================================================================= */}
        {/* [DEV MODE START] - AREA TOMBOL BYPASS (HAPUS BAGIAN INI NANTI) */}
        {/* ================================================================= */}
        <div className="mt-8 pt-4 border-t-2 border-dashed border-red-300 bg-red-50 p-3 rounded-lg">
          <p className="text-center text-[10px] uppercase font-bold text-red-600 mb-2">
            🛠️ Dev Mode: Bypass Backend Down
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <button
              onClick={() => handleBypass(ROLES.ADMIN)}
              className="px-2 py-1.5 bg-gray-800 text-white text-[10px] sm:text-xs rounded hover:bg-gray-900 font-medium transition"
            >
              Login Admin
            </button>
            <button
              onClick={() => handleBypass(ROLES.MANDOR)}
              className="px-2 py-1.5 bg-green-600 text-white text-[10px] sm:text-xs rounded hover:bg-green-700 font-medium transition"
            >
              Login Mandor
            </button>
            <button
              onClick={() => handleBypass(ROLES.KEBUN)}
              className="px-2 py-1.5 bg-blue-600 text-white text-[10px] sm:text-xs rounded hover:bg-blue-700 font-medium transition"
            >
              Login Kebun
            </button>
            <button
              onClick={() => handleBypass(ROLES.ESTATE_MANAGER)}
              className="px-2 py-1.5 bg-teal-600 text-white text-[10px] sm:text-xs rounded hover:bg-teal-700 font-medium transition"
            >
              Login Estate Manager
            </button>
            <button
              onClick={() => handleBypass(ROLES.GENERAL_MANAGER_DISTRIK)}
              className="px-2 py-1.5 bg-orange-600 text-white text-[10px] sm:text-xs rounded hover:bg-orange-700 font-medium transition"
            >
              Login GM Distrik
            </button>
            <button
              onClick={() => handleBypass(ROLES.TRANSPORT)}
              className="px-2 py-1.5 bg-purple-600 text-white text-[10px] sm:text-xs rounded hover:bg-purple-700 font-medium transition"
            >
              Login Transport
            </button>
            <button
              onClick={() => handleBypass(ROLES.PABRIK)}
              className="px-2 py-1.5 bg-yellow-600 text-white text-[10px] sm:text-xs rounded hover:bg-yellow-700 font-medium transition"
            >
              Login Pabrik
            </button>
          </div>
          <p className="text-center text-[9px] text-gray-500 mt-3">
            Klik salah satu tombol di atas untuk masuk tanpa API.
          </p>
        </div>
        {/* [DEV MODE END] ================================================== */}
      </div>
    </div>
  );
}
