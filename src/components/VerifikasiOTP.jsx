import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_ENDPOINTS } from "../config/constants";

export default function VerifikasiOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  
  // --- LOGIKA BARU: Timer Resend ---
  const [timer, setTimer] = useState(60); // Jeda 60 detik untuk kirim ulang
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      setError("Email tidak ditemukan. Silakan kembali ke halaman pendaftaran.");
    }
  }, [location.state]);

  // --- LOGIKA BARU: Efek Countdown Timer ---
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // --- LOGIKA BARU: Fungsi Kirim Ulang OTP ---
  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.OTP_REQUEST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      if (!response.ok) throw new Error("Gagal mengirim ulang OTP.");

      // Reset state setelah berhasil kirim ulang
      setOtp(["", "", "", "", "", ""]);
      setTimer(60);
      setCanResend(false);
      alert("Kode OTP baru telah dikirim ke email Anda.");
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value, index) => {
    if (error) setError("");
    if (/^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Harap masukkan 6 digit kode OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.OTP_VERIFY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, kode_otp: otpCode }),
      });

      const textResponse = await response.text();
      let data;
      try { data = JSON.parse(textResponse); } catch { data = null; }

      if (!response.ok) {
        throw new Error(data?.detail || "Kode OTP salah atau sudah kadaluarsa.");
      }

      if (data?.is_verified) {
        setShowInfo(true);
        setTimeout(() => navigate("/masuk"), 2500);
      } else {
        throw new Error("Gagal verifikasi. Silakan coba lagi.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-gradient-to-br from-gray-100 to-[#EF8523]/20 border border-gray-200 shadow-xl rounded-2xl p-5 sm:p-8 text-center">
        <h2 className="text-xl sm:text-3xl font-bold text-[#B5302D] leading-tight mt-4 mb-5">
          Verifikasi Alamat Email Anda
        </h2>

        <div className="inline-block bg-white font-medium px-5 py-2 rounded-full mb-4 shadow-sm text-sm sm:text-base border border-gray-100">
          {email || "Memuat email..."}
        </div>

        <p className="text-black mt-2 mb-5 text-xs sm:text-sm">
          Kami telah mengirimkan <span className="font-semibold text-[#B5302D]">kode OTP 6 digit</span> ke alamat email Anda. Silahkan Cek email pada bagian inbox atau spam, lalu masukkan kode OTP di bawah ini untuk memverifikasi email Anda.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="flex justify-center gap-2 sm:gap-4 mb-6">
            {otp.map((val, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                maxLength="1"
                disabled={loading}
                value={val}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className={`w-10 h-10 sm:w-14 sm:h-14 text-center text-xl sm:text-3xl font-semibold rounded-lg bg-white outline-none transition-all duration-200 border-2 
                  ${error ? "border-red-500 focus:ring-red-200" : "border-[#F1B89E] focus:border-[#EF8523] focus:ring-[#EF8523]/40"}`}
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-6 text-sm font-medium border border-red-200 animate-bounce">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`bg-[#B5302D] text-white font-semibold text-sm sm:text-base rounded-lg px-12 py-3 hover:bg-[#972A28] transition-all duration-200 shadow-md ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Memproses..." : "Verifikasi Email"}
          </button>

          {/* --- UI BARU: Tombol Kirim Ulang --- */}
          <div className="mt-6">
            <p className="text-sm text-gray-600">
              Tidak menerima kode?{" "}
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-[#B5302D] font-bold hover:underline focus:outline-none"
                >
                  Kirim Ulang
                </button>
              ) : (
                <span className="text-gray-400 font-medium">
                  Kirim ulang dalam {timer} detik
                </span>
              )}
            </p>
          </div>

          {showInfo && (
            <div className="mt-5 p-3 bg-green-100 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium flex items-center gap-2">
                <span>✅</span> Kode OTP berhasil diverifikasi! Mengalihkan...
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}