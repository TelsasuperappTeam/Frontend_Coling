import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Ubah defineConfig menerima sebuah fungsi dengan parameter 'command'
export default defineConfig(({ command }) => {
  // Jika command bernilai 'build', berarti sedang proses deploy ke Production.
  // Jika command bernilai 'serve', berarti sedang jalanin npm run dev / dev:local.
  const isProduction = command === 'build';

  return {
    plugins: [react(), tailwindcss()],
    
    // Konfigurasi esbuild secara dinamis
    esbuild: isProduction 
      ? { 
          // JIKA PRODUCTION: Buang console.log dan console.info
          // Tapi console.error dan console.warn akan TETAP ADA
          pure: ['console.log', 'console.info'], 
        } 
      : {}, // JIKA LOKAL/DEV: Kosongkan aturan ini (semua console tetap muncul)
  };
});