import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/constants"; // Pastikan path import benar
import {
  Mail,
  Lock,
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

export default function LupaKataSandi() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // --- AMBIL TOKEN DARI URL (LOGIKA STEP 3) ---
  // Jika user klik link dari email: website.com/lupa-sandi?token=XYZ&email=abc@mail.com
  const tokenFromUrl = searchParams.get("token");
  const emailFromUrl = searchParams.get("email");

  // --- STATE ---
  // Step 1: Input Email
  // Step 2: Notifikasi Cek Email
  // Step 3: Form Ganti Password (jika ada token)
  // Step 4: Sukses Ganti Password
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- EFFECT: DETEKSI LINK DARI EMAIL ---
  useEffect(() => {
    if (tokenFromUrl && emailFromUrl) {
      setEmail(emailFromUrl);
      setStep(3); // Langsung lompat ke form ganti password
    }
  }, [tokenFromUrl, emailFromUrl]);

  // --- VALIDATOR PASSWORD ---
  const isStrongPassword = (pass) => {
    // Regex: Minimal 8 char, ada huruf, ada angka
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pass);
  };

  // --- HANDLER: KIRIM LINK RESET (STEP 1) ---
  const handleRequestLink = async (e) => {
    e.preventDefault();
    if (!email) return setError("Email wajib diisi.");

    setLoading(true);
    setError("");

    try {
      // PERHATIAN: Pastikan endpoint ini ada di backend Anda
      // Biasanya: /auth/forgot-password
      const response = await fetch(
        `${
          API_ENDPOINTS.AUTH.BASE || "http://10.102.174.243:8001"
        }/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Gagal mengirim link verifikasi.");
      }

      setStep(2); // Pindah ke notifikasi sukses
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: SIMPAN PASSWORD BARU (STEP 3) ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Validasi Kekuatan Password
    if (!isStrongPassword(form.password)) {
      setError("Password terlalu lemah. Ikuti panduan di bawah.");
      return;
    }

    // 2. Validasi Match
    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      // PERHATIAN: Pastikan endpoint ini ada di backend Anda
      // Biasanya: /auth/reset-password
      const response = await fetch(
        `${
          API_ENDPOINTS.AUTH.BASE || "http://10.102.174.243:8001"
        }/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: tokenFromUrl,
            email: email,
            new_password: form.password,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.detail || "Gagal mengubah kata sandi. Token mungkin kadaluarsa."
        );
      }

      setStep(4); // Pindah ke sukses ganti password
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* HEADER MERAH BATA */}
        <div className="bg-linear-to-br from-[#EF8523] to-[#B5302D] p-6 text-center relative">
          {step === 1 && (
            <button
              onClick={() => navigate("/masuk")}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {step === 1
              ? "Lupa Kata Sandi"
              : step === 2
              ? "Cek Email Anda"
              : step === 3
              ? "Buat Kata Sandi Baru"
              : "Berhasil!"}
          </h2>
          <p className="text-white/80 text-xs mt-1">
            {step === 1
              ? "Masukkan email untuk mereset akun Anda."
              : step === 2
              ? "Tautan verifikasi telah dikirim."
              : step === 3
              ? "Pastikan kata sandi aman dan unik."
              : "Kata sandi Anda telah diperbarui."}
          </p>
        </div>

        {/* BODY CONTENT */}
        <div className="p-8">
          {/* ERROR ALERT */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* === STEP 1: INPUT EMAIL === */}
          {step === 1 && (
            <form onSubmit={handleRequestLink} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Email Terdaftar
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#B5302D] focus:ring-4 focus:ring-red-50 outline-none transition text-sm text-gray-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#B5302D] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-200 hover:bg-[#962825] hover:shadow-red-300 transition-all transform active:scale-95 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Kirim Link Verifikasi"
                )}
              </button>
            </form>
          )}

          {/* === STEP 2: NOTIFIKASI TERKIRIM === */}
          {step === 2 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
                <Mail size={40} className="text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800 text-lg">
                  Tautan Terkirim!
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Kami telah mengirimkan tautan verifikasi ke{" "}
                  <strong>{email}</strong>.
                  <br />
                  Silakan cek kotak masuk atau folder spam Anda.
                </p>
              </div>
            </div>
          )}

          {/* === STEP 3: INPUT PASSWORD BARU === */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Password Baru */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <KeyRound size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 8 karakter"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#B5302D] focus:ring-4 focus:ring-red-50 outline-none transition text-sm"
                  />
                </div>

                {/* LOGIKA VALIDASI PASSWORD KUAT */}
                {form.password && !isStrongPassword(form.password) && (
                  <p className="text-red-600 text-xs mt-1 animate-fade-in">
                    Kata sandi harus minimal 8 karakter dan berisi huruf serta
                    angka.
                  </p>
                )}

                {/* PANDUAN PASSWORD */}
                <ul className="text-xs text-gray-500 mt-1 list-disc list-inside space-y-0.5 bg-gray-50 p-2 rounded-lg">
                  <li>Minimal 8 karakter</li>
                  <li>Gabungan huruf dan angka</li>
                  <li>Buat seunik mungkin</li>
                </ul>
              </div>

              {/* Konfirmasi Password */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Ulangi kata sandi baru"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 outline-none transition text-sm ${
                      form.confirmPassword &&
                      form.password !== form.confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                        : "border-gray-100 focus:border-[#B5302D] focus:ring-red-50"
                    }`}
                  />
                </div>

                {/* LOGIKA PASSWORD TIDAK SAMA */}
                {form.confirmPassword &&
                  form.password !== form.confirmPassword && (
                    <p className="text-red-600 text-xs mt-1 animate-fade-in">
                      Kata sandi tidak sama.
                    </p>
                  )}
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  !isStrongPassword(form.password) ||
                  form.password !== form.confirmPassword
                }
                className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all transform active:scale-95 flex justify-center items-center gap-2 mt-4
                  ${
                    loading ||
                    !isStrongPassword(form.password) ||
                    form.password !== form.confirmPassword
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                      : "bg-[#B5302D] text-white hover:bg-[#962825] shadow-red-200"
                  }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Simpan Kata Sandi Baru"
                )}
              </button>
            </form>
          )}

          {/* === STEP 4: SUKSES === */}
          {step === 4 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800 text-lg">
                  Berhasil Diperbarui!
                </h3>
                <p className="text-sm text-gray-500">
                  Kata sandi Anda telah berhasil diganti. Silakan masuk
                  menggunakan kata sandi baru Anda.
                </p>
              </div>
              <button
                onClick={() => navigate("/masuk")}
                className="w-full bg-[#B5302D] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-200 hover:bg-[#962825] transition transform active:scale-95"
              >
                Masuk Sekarang
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
