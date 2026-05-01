import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRoleRedirectPath } from "../utils/roleRedirect";
import { API_ENDPOINTS, ROLES, NOTIF_MESSAGES } from "../config/constants";
import { jwtDecode } from "jwt-decode";
import { showToast } from "../utils/notif";

// ===================== KOMPONEN LOGIN =====================
export default function Masuk() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ===================== HANDLE LOGIN =====================
  const handleLogin = async (e) => {
    e.preventDefault();

    // GANTI: Gunakan showToast.error bukan setErrorMessage
    if (!email || !password) {
      showToast.error("Email dan kata sandi wajib diisi!");
      return;
    }

    setLoading(true);
    // GANTI: Munculkan loading toast di tengah layar
    const loadingId = showToast.loading("Sedang memverifikasi akun Anda...");

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

      const token = data.access_token || data.token || data.data?.access_token;
      if (!token) throw new Error("Token tidak ditemukan dalam server!");

      let userRole = null;
      try {
        const decoded = jwtDecode(token);
        userRole = decoded.role || decoded.roles || decoded.user_role;
      } catch {
        //console.error("Gagal membaca token:", decodeError);
        throw new Error("Token rusak atau tidak valid.");
      }

      if (!userRole) throw new Error("Role pengguna tidak ditemukan!");

      const normalizedRole = userRole.toLowerCase();

      localStorage.setItem("token", token);
      localStorage.setItem("role", normalizedRole);
      localStorage.setItem("userRole", normalizedRole);

      const targetPath = getRoleRedirectPath(normalizedRole);

      if (targetPath && targetPath !== "/") {
        // GANTI: Hentikan loading, dan beri notif sukses!
        showToast.dismiss(loadingId);
        showToast.success("Login berhasil! Mengalihkan halaman...");

        // Sedikit delay agar user sempat melihat pesan sukses sebelum dilempar
        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 1000);
      } else {
        throw new Error(
          `Role '${normalizedRole}' tidak terdaftar! Silakan hubungi admin.`,
        );
      }
    } catch (err) {
      // GANTI: Hentikan loading, munculkan error
      showToast.dismiss(loadingId);
      showToast.error(err.message || "Terjadi kesalahan sistem.");
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
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight text-center tracking-tight">
          <span className="block text-[#B5302D]">Selamat Datang di</span>
          <span className="block">Platform ISPO PalmaOne-08!</span>
        </h1>

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
              className="text-[#B5302D] text-xs sm:text-sm font-semibold hover:underline"
            >
              Lupa kata sandi?
            </Link>
          </div>

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
            Masuk
          </button>
        </form>

        {/* ====== LINK PENDAFTARAN ====== */}
        <p className="text-center mt-5 sm:mt-8 text-[11px] sm:text-sm md:text-base text-gray-800">
          Belum punya akun?{" "}
          <Link
            to="/daftar"
            className="text-[#B5302D] font-semibold underline-offset-4 hover:underline focus:outline-none focus:ring-1 focus:ring-[#EF8523]/50"
          >
            Daftarkan akun sekarang!
          </Link>
        </p>
      </div>
    </div>
  );
}
