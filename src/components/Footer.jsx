// Import React agar bisa membuat komponen fungsional
import React from "react";

// Komponen Footer — bagian bawah halaman web
const Footer = () => {
  return (
    // Tag <footer> ini jadi pembungkus utama area footer
    <footer
      id="kontak" // supaya bisa di-scroll ke bagian ini (pakai anchor)
      className="bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700 border-t border-gray-200 mt-10"
      // styling-nya: warna gradasi abu muda, teks abu, dan garis atas halus
    >
      <div className="max-w-6xl mx-auto px-7 py-5 flex flex-col gap-6 md:grid md:grid-cols-3 md:gap-6">
        {/* ================= Kolom 1: Deskripsi ================= */}
        <div className="flex flex-col justify-between text-left">
          <div>
            {/* Nama aplikasi di footer */}
            <h3 className="text-base md:text-lg font-bold text-[#1E1E1E] mb-1 tracking-tight">
              Platform ISPO PalmaOne-08
            </h3>

            {/* Deskripsi singkat aplikasi */}
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed max-w-xs">
              Digitalisasi manajemen sawit untuk perusahaan.
            </p>
          </div>

          {/* Copyright otomatis menyesuaikan tahun sekarang */}
          <p className="mt-4 text-[10px] md:text-[11px] text-gray-500">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold">Platform ISPO PalmaOne-08</span>. Semua hak
            cipta dilindungi.
          </p>
        </div>

        {/* ================= Spacer (hiasan pembatas antar kolom) ================= */}
        <div className="hidden md:flex items-center justify-center">
          {/* Garis vertikal tipis di tengah sebagai pemisah antar kolom */}
          <div className="h-12 w-[1px] bg-gray-300 rounded-full opacity-50"></div>
        </div>

        {/* ================= Kolom 2: Kontak Sosial ================= */}
        <div className="flex flex-col items-start md:items-center text-left md:text-center">
          {/* Judul bagian kontak */}
          <h4 className="text-sm md:text-base font-semibold mb-2 text-[#1E1E1E]">
            Hubungi Kami
          </h4>

          {/* Link email untuk menghubungi tim */}
          <a
            href="mailto:@gmail.com" // klik langsung buka email
            className="flex items-center gap-2 text-gray-600 hover:text-[#EF8523] transition-colors duration-200"
          >
            {/* Ikon amplop dari Remix Icon */}
            <i className="ri-mail-line text-sm md:text-base"></i>
            {/* Alamat email ditampilkan di samping ikon */}
            <span className="text-xs md:text-sm">
              @gmail.com
            </span>
          </a>

          {/* Garis kecil dekoratif berwarna gradasi oranye ke merah */}
          <div className="mt-3 w-8 md:w-10 h-[2px] bg-gradient-to-r from-[#EF8523] to-[#B5302D] rounded-full"></div>
        </div>
      </div>
    </footer>
  );
};

// Export komponen agar bisa dipakai di file lain (misal di App.jsx)
export default Footer;
