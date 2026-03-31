import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { API_ENDPOINTS } from "../config/constants";

// ======================= ROLE PENGGUNA =======================
const ROLES = {
  MANDOR: "petani", // BE menerima "petani", tapi di FE dilabeli "Mandor"
  KEBUN: "kebun",
  ESTATE_MANAGER: "estate_manager",
  GENERAL_MANAGER_DISTRIK: "general_manager_distrik",
  TRANSPORT: "logistik",
  PABRIK: "pabrik",
};

const NOTIF_MESSAGES = {
  PASSWORD_NOT_MATCH: "Password dan konfirmasi password tidak cocok.",
  REGISTER_SUCCESS:
    "Pendaftaran berhasil! Mengalihkan ke halaman Verifikasi OTP",
};

export default function Daftar() {
  const [role, setRole] = useState("");
  const [notif, setNotif] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    kebun_id: "",
    distrik_id: "", // Tambahan state untuk distrik_id
    aktaFile: null,
    namaPabrik: "",
    phone: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: files ? files[0] : value,
      }));
    }
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasNumber = (str) => /\d/.test(str);
  const isValidPhone = (phone) => /^\d{9,13}$/.test(phone);
  const hasLetter = (str) => /[A-Za-z]/.test(str);
  const isStrongPassword = (str) =>
    str.length >= 8 && hasLetter(str) && hasNumber(str);

  // ===================== HANDLE SUBMIT =====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setNotif("");

    // --- Validasi Manual Frontend ---
    if (form.password !== form.confirmPassword) {
      setNotif(NOTIF_MESSAGES.PASSWORD_NOT_MATCH);
      setIsSubmitting(false);
      return;
    }
    if (!isStrongPassword(form.password)) {
      setNotif(
        "Kata sandi harus minimal 8 karakter dan berisi huruf serta angka.",
      );
      setIsSubmitting(false);
      return;
    }
    if (!isValidEmail(form.email)) {
      setNotif("Format email tidak valid.");
      setIsSubmitting(false);
      return;
    }
    if (role && !isValidPhone(form.phone)) {
      setNotif("Nomor handphone harus terdiri dari 9–13 digit angka.");
      setIsSubmitting(false);
      return;
    }

    try {
      // BUAT OBJEK FORM DATA
      const formData = new FormData();
      formData.append("role", role.toLowerCase());

      const namaLengkapValue =
        role === ROLES.PABRIK ? form.namaPabrik : form.nama;
      formData.append("nama_lengkap", namaLengkapValue);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("no_hp", form.phone);

      // --- LOGIKA ID BERDASARKAN ROLE ---
      // 1. Mandor dan Estate Manager perlu kebun_id
      if (
        (role === ROLES.MANDOR || role === ROLES.ESTATE_MANAGER) &&
        form.kebun_id
      ) {
        formData.append("kebun_id", form.kebun_id);
      }

      // 2. Kebun perlu distrik_id dan akta_pendiri
      if (role === ROLES.KEBUN) {
        if (form.distrik_id) formData.append("distrik_id", form.distrik_id);
        if (form.aktaFile) formData.append("akta_pendiri", form.aktaFile);
      }
      // Note: GM Distrik tidak mengirimkan ID saat pendaftaran, mereka yang akan mendapatkan/menciptakan distrik_id dari BE

      // KIRIM KE BACKEND REGISTER
      const res = await fetch(API_ENDPOINTS.USER.REGISTER, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (res.status === 422 && errorData.detail) {
          console.error("Validasi Backend Gagal:", errorData.detail);
          const msg = Array.isArray(errorData.detail)
            ? `${errorData.detail[0].loc[1]}: ${errorData.detail[0].msg}`
            : "Data yang dikirim tidak valid.";
          throw new Error(msg);
        }
        throw new Error(
          errorData?.detail || errorData?.message || "Pendaftaran gagal.",
        );
      }

      // Handle Success Register
      let data;
      try {
        data = await res.json();
      } catch {
        data = { message: "Pendaftaran berhasil." };
      }
      console.log("Register Response:", data);

      // REQUEST OTP MANUAL
      try {
        console.log("Mencoba trigger OTP ke:", API_ENDPOINTS.AUTH.OTP_REQUEST);
        await fetch(API_ENDPOINTS.AUTH.OTP_REQUEST, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email }),
        });
        console.log("Request OTP terkirim (Cek email spam/inbox).");
      } catch (otpError) {
        console.warn("Gagal trigger OTP otomatis:", otpError);
      }

      setNotif(data.message || NOTIF_MESSAGES.REGISTER_SUCCESS);

      // Redirect ke OTP
      setTimeout(
        () => navigate("/verifikasiOTP", { state: { email: form.email } }),
        2000,
      );
    } catch (error) {
      console.error(error);
      setNotif(error.message || "Terjadi kesalahan saat pendaftaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = (() => {
    const baseFilled =
      (role === ROLES.PABRIK ? form.namaPabrik : form.nama) &&
      form.email &&
      form.password &&
      form.confirmPassword;

    if (!baseFilled) return false;

    const isPasswordMatch = form.password === form.confirmPassword;
    const isPasswordStrong = isStrongPassword(form.password);
    const isEmailValid = isValidEmail(form.email);

    if (!isPasswordMatch || !isPasswordStrong || !isEmailValid) return false;

    switch (role) {
      case ROLES.GENERAL_MANAGER_DISTRIK:
      case ROLES.TRANSPORT:
      case ROLES.PABRIK:
        // GM Distrik hanya butuh data dasar + nomor HP
        return Boolean(form.phone && isValidPhone(form.phone));
      case ROLES.KEBUN:
        // Kebun butuh akta file, distrik id, dan nomor HP
        return Boolean(
          form.aktaFile &&
          form.distrik_id &&
          form.phone &&
          isValidPhone(form.phone),
        );
      case ROLES.MANDOR:
      case ROLES.ESTATE_MANAGER:
        // Mandor & EM butuh kebun id dan nomor HP
        return Boolean(form.kebun_id && form.phone && isValidPhone(form.phone));
      default:
        return false;
    }
  })();

  return (
    <div className="pt-30 sm:pt-24 min-h-screen flex justify-center items-start bg-white px-4 pb-10 sm:px-6 sm:pb-16 overflow-y-auto antialiased">
      <div className="w-full max-w-3xl bg-linear-to-br from-gray-100 to-[#EF8523]/20 border border-gray-200 shadow-xl rounded-2xl p-5 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <User className="mx-auto text-[#B5302D] w-9 h-9 sm:w-10 sm:h-10 mb-2 sm:mb-3" />
          <h1 className="text-xl sm:text-3xl font-bold text-[#B5302D] leading-tight">
            Buat Akun Baru
          </h1>
          <p className="text-sm sm:text-base font-medium text-[#EF8523]">
            TELSA Super App
          </p>
          <p className="text-black mt-2 text-xs sm:text-sm">
            Daftarkan akun sesuai peran Anda di sistem
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Role / Peran */}
          <div className="relative">
            <label className="block text-sm font-medium text-black mb-1.5">
              Role / Peran
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="appearance-none w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-gray-800 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#EF8523] focus:border-transparent"
            >
              <option value="">Pilih Peran</option>
              <option value={ROLES.GENERAL_MANAGER_DISTRIK}>
                General Manager Distrik
              </option>
              <option value={ROLES.KEBUN}>Kebun</option>
              <option value={ROLES.ESTATE_MANAGER}>Estate Manager</option>
              <option value={ROLES.MANDOR}>Mandor</option>
              <option value={ROLES.TRANSPORT}>Transport</option>
              <option value={ROLES.PABRIK}>Pabrik</option>
            </select>

            <i className="ri-arrow-down-s-line absolute right-4 top-1/2 translate-y-0.5 text-gray-500 text-lg pointer-events-none"></i>
          </div>

          {/* Nama & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">
                {role === ROLES.MANDOR ||
                role === ROLES.ESTATE_MANAGER ||
                role === ROLES.GENERAL_MANAGER_DISTRIK
                  ? "Nama Lengkap (Sesuai KTP)"
                  : role === ROLES.KEBUN
                    ? "Nama Lembaga"
                    : role === ROLES.TRANSPORT
                      ? "Nama Transport"
                      : role === ROLES.PABRIK
                        ? "Nama Pabrik"
                        : "Nama"}
              </label>
              <input
                name={role === ROLES.PABRIK ? "namaPabrik" : "nama"}
                value={role === ROLES.PABRIK ? form.namaPabrik : form.nama}
                onChange={handleChange}
                placeholder="Masukkan nama"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 sm:px-4 sm:py-3 bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#EF8523] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1.5">
                Email
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="Masukkan email"
                className={`w-full rounded-lg border px-3 py-2.5 sm:px-4 sm:py-3 bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-transparent ${
                  form.email && !isValidEmail(form.email)
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#EF8523]"
                }`}
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">
                Kata Sandi
              </label>
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                placeholder="Masukkan kata sandi"
                className={`w-full rounded-lg border px-3 py-2.5 sm:px-4 sm:py-3 bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-transparent ${
                  form.password && !isStrongPassword(form.password)
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#EF8523]"
                }`}
              />
              <ul className="text-xs text-gray-600 mt-1 list-disc list-inside space-y-0.5">
                <li>Minimal 8 karakter</li>
                <li>Gabungan huruf dan angka</li>
                <li>Buat seunik mungkin</li>
              </ul>
              {form.password && !isStrongPassword(form.password) && (
                <p className="text-red-600 text-xs mt-1">
                  Kata sandi harus minimal 8 karakter dan mengandung kombinasi
                  huruf serta angka.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1.5">
                Konfirmasi Kata Sandi
              </label>
              <input
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                type="password"
                placeholder="Ulangi kata sandi"
                className={`w-full rounded-lg border px-3 py-2.5 sm:px-4 sm:py-3 bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-transparent ${
                  form.confirmPassword && form.password !== form.confirmPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#EF8523]"
                }`}
              />
              {form.confirmPassword &&
                form.password !== form.confirmPassword && (
                  <p className="text-red-600 text-xs mt-1">
                    Kata sandi tidak sama.
                  </p>
                )}
            </div>
          </div>

          {/* Kolom ID Dinamis berdasarkan Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {role === ROLES.KEBUN && (
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">
                  Distrik ID
                </label>
                <input
                  name="distrik_id"
                  value={form.distrik_id}
                  onChange={handleChange}
                  placeholder="Masukkan ID Distrik"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 sm:px-4 sm:py-3 bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#EF8523] focus:border-transparent"
                />
              </div>
            )}

            {(role === ROLES.MANDOR || role === ROLES.ESTATE_MANAGER) && (
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">
                  Kebun ID
                </label>
                <input
                  name="kebun_id"
                  type="number"
                  value={form.kebun_id}
                  onChange={handleChange}
                  placeholder="Masukkan ID Kebun"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 sm:px-4 sm:py-3 bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#EF8523] focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Nomor Telepon & Akta Pendirian */}
          {role && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">
                  Nomor Telepon
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  className={`w-full rounded-lg border px-3 py-2.5 sm:px-4 sm:py-3 bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-transparent ${
                    form.phone && !isValidPhone(form.phone)
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-[#EF8523]"
                  }`}
                />
                {form.phone && !isValidPhone(form.phone) && (
                  <p className="text-red-600 text-xs mt-1">
                    Nomor telepon harus terdiri dari 9–13 digit angka.
                  </p>
                )}
              </div>

              {role === ROLES.KEBUN && (
                <div>
                  <label className="block text-sm font-medium text-black mb-1.5">
                    Upload Akta Pendirian
                  </label>
                  <input
                    name="aktaFile"
                    onChange={handleChange}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 sm:px-4 sm:py-3 bg-white text-gray-700 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#EF8523] focus:border-transparent
                      file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold
                      file:bg-[#EF8523]/10 file:text-[#EF8523] hover:file:bg-[#EF8523]/20"
                  />
                </div>
              )}
            </div>
          )}

          {/* Tombol Daftar dengan LOADING SPINNER */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full mt-3 sm:mt-4 rounded-lg px-5 py-2.5 sm:py-3 font-bold text-white text-sm sm:text-base tracking-wide transition-all duration-150 shadow-lg flex items-center justify-center ${
              isFormValid && !isSubmitting
                ? "bg-[#EF8523] hover:bg-[#E07B1F] active:scale-[0.98] shadow-[#EF8523]/30"
                : "bg-gray-300 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            {isSubmitting ? (
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
              "Daftar Sekarang"
            )}
          </button>
        </form>

        {/* Notifikasi */}
        {notif && (
          <p
            className={`text-center mt-5 sm:mt-6 text-xs sm:text-sm rounded-lg py-2 px-3 sm:py-2.5 sm:px-4 border ${
              notif.toLowerCase().includes("berhasil")
                ? "text-green-700 bg-green-50 border-green-300"
                : "text-red-700 bg-red-50 border-red-300"
            }`}
          >
            {notif}
          </p>
        )}

        {/* Footer */}
        <p className="text-center mt-5 sm:mt-6 text-xs sm:text-sm text-gray-800">
          Sudah punya akun?{" "}
          <Link
            to="/masuk"
            className="text-[#EF8523] font-semibold underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EF8523] rounded-sm"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
