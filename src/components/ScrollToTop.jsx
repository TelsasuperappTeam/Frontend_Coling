// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Beri sedikit jeda (50ms) agar React selesai me-render halaman baru
    const timer = setTimeout(() => {
      // 1. Paksa scroll window & body
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.body.scrollTo({ top: 0, left: 0, behavior: "instant" });

      // 2. Paksa scroll elemen #root (Biang kerok utama di React + Tailwind)
      const rootEl = document.getElementById("root");
      if (rootEl) {
        rootEl.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }

      // 3. Paksa scroll semua div yang punya class overflow
      const scrollableElements = document.querySelectorAll(
        ".overflow-auto, .overflow-y-auto, .h-screen, .min-h-screen"
      );
      scrollableElements.forEach((el) => {
        el.scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}