import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";

// =========================================================================
// GLOBAL FETCH INTERCEPTOR UNTUK MENDETEKSI TOKEN EXPIRED (401 UNAUTHORIZED)
// =========================================================================
const originalFetch = window.fetch;

window.fetch = async (...args) => {
  // Langsung panggil fetch asli (tanpa try/catch)
  const response = await originalFetch(...args);

  // Ambil URL dari request fetch
  const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";

  // JIKA BACKEND MEMBALAS 401 (Token Expired / Tidak Valid)
  if (response.status === 401) {
    // SYARAT 1: Pastikan ini adalah API internal Telsa (mencegah error dari API luar)
    const isInternalApi =
      url.includes("api.telsa.cloud") ||
      url.includes("api.company.telsa.cloud");

    // SYARAT 2: Pastikan BUKAN endpoint API login atau register
    const isLoginOrRegisterAPI =
      url.includes("/auth/login") || url.includes("/users/register");

    // Eksekusi hanya jika memenuhi syarat di atas
    if (isInternalApi && !isLoginOrRegisterAPI) {
      console.warn(
        "Sesi berakhir, Mengeluarkan user secara otomatis...",
      );

      // 1. Hapus token dari penyimpanan lokal
      localStorage.removeItem("token");

      // 2. Cek posisi halaman user saat ini
      const currentPath = window.location.pathname;

      // 3. Pental ke halaman masuk HANYA JIKA user TIDAK berada di /masuk atau /daftar
      if (currentPath !== "/masuk" && currentPath !== "/daftar") {
        window.location.href = "/masuk";
      }

      // Hentikan proses fetch agar tidak memicu error lanjutan di komponen UI
      return Promise.reject(
        new Error("Sesi Anda telah berakhir. Silakan login kembali."),
      );
    }
  }

  // Kembalikan response normal jika bukan 401
  return response;
};
// =========================================================================

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
