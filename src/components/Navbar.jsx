import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { X, Menu, Home, Info, Star, Search, HelpCircle } from "lucide-react";

// Komponen utama Navbar
const Navbar = () => {
  // state untuk menandai apakah menu mobile sedang dibuka
  const [show, setShow] = useState(false);

  // state untuk tahu apakah halaman sudah di-scroll (biar bisa kasih efek bayangan di navbar)
  const [scrolled, setScrolled] = useState(false);

  // state untuk menyimpan bagian mana dari halaman yang sedang aktif (misal "beranda" atau "fitur")
  const [activeSection, setActiveSection] = useState("beranda");

  // hook dari React Router untuk tahu posisi halaman (path) saat ini
  const location = useLocation();

  // fungsi untuk toggle menu (buka/tutup)
  const handleClick = () => setShow(!show);

  // efek untuk mendeteksi saat pengguna menggulir halaman (scroll)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 5); // kalau scroll lebih dari 5px, aktifkan bayangan
    window.addEventListener("scroll", handleScroll);

    // bersihkan event listener saat komponen dihapus agar tidak bentrok
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // efek ini buat deteksi kalau pengguna lagi di halaman "/faq"
  // jadi bagian FAQ akan otomatis dianggap aktif
  useEffect(() => {
    if (location.pathname === "/faq") setActiveSection("faq");
  }, [location]);

  // kalau navbar discroll, tambahkan efek shadow
  const scrollActive = scrolled
    ? "shadow-md bg-opacity-95 backdrop-blur-sm"
    : "";

  // =========================================================================
  // FUNGSI GAYA (STYLE) NAVBAR - DIPERBARUI UNTUK KONTRAS YANG JELAS
  // =========================================================================

  // fungsi untuk menentukan gaya link (warna teks & layout) di mode desktop
  const getLinkClass = (name) =>
    `flex items-center gap-1.5 transition-all duration-300 text-sm lg:text-base px-3 py-1.5 rounded-full ${
      activeSection === name
        ? "bg-white/25 text-white font-extrabold shadow-sm border border-white/40" // AKTIF: Glassmorphism Putih (Sangat Jelas)
        : "text-white/80 hover:bg-white/15 hover:text-white font-medium" // TIDAK AKTIF: Putih pudar, hover transparan
    }`;

  // fungsi untuk menentukan gaya link di mode mobile
  const getMobileLinkClass = (name) =>
    `flex items-center gap-2.5 w-full px-4 py-3 transition-all duration-200 rounded-xl ${
      activeSection === name
        ? "bg-white/25 text-white font-extrabold shadow-sm border border-white/40" // AKTIF: Glassmorphism Putih
        : "text-white/80 hover:bg-white/10 hover:text-white font-medium" // TIDAK AKTIF
    }`;

  return (
    <nav
      // kelas utama navbar, fixed di atas dan bisa berubah gaya saat discroll
      className={`fixed inset-x-0 top-0 w-full z-50 transition-all duration-300 ${scrollActive}`}
    >
      {/* Bagian background gradasi orange ke merah */}
      <div className="bg-gradient-to-r from-[#EF8523] to-[#d47227]">
        <div className="mx-auto flex items-center justify-between px-4 lg:px-32 py-3 min-h-[72px]">
          {/* Bagian kiri: tombol menu (mobile) dan logo */}
          <div className="flex items-center gap-3">
            {/* Tombol menu untuk tampilan mobile */}
            <button
              onClick={handleClick} // klik buat toggle menu
              className="text-2xl lg:hidden flex items-center justify-center cursor-pointer bg-transparent border-0 text-white hover:text-gray-200 transition-colors"
              aria-label="Toggle menu"
            >
              {/* Menggunakan Lucide Icon (Menu & X) agar lebih tajam dan seragam */}
              {show ? (
                <X size={26} strokeWidth={2.5} />
              ) : (
                <Menu size={26} strokeWidth={2.5} />
              )}
            </button>

            {/* Logo aplikasi TSA */}
            <div className="flex items-center gap-2">
              <img
                src="/LogoTSA.png"
                alt="Logo"
                className="h-6 w-auto sm:h-7"
              />
              <h1 className="text-lg sm:text-xl lg:text-xl font-bold text-white whitespace-nowrap tracking-tight">
                PalmaOne-08
              </h1>
            </div>
          </div>

          {/* Menu tengah (tampil hanya di desktop) */}
          <ul className="hidden lg:flex flex-1 justify-center items-center space-x-4 font-medium">
            <li>
              <HashLink
                smooth
                to="/#beranda"
                onClick={() => setActiveSection("beranda")}
                className={getLinkClass("beranda")}
              >
                <Home className="w-4 h-4 mb-0.5" />
                Beranda
              </HashLink>
            </li>
            <li>
              <HashLink
                smooth
                to="/#tentang-kami"
                onClick={() => setActiveSection("tentang")}
                className={getLinkClass("tentang")}
              >
                <Info className="w-4 h-4 mb-0.5" />
                Tentang Kami
              </HashLink>
            </li>
            <li>
              <HashLink
                smooth
                to="/#fitur-kami"
                onClick={() => setActiveSection("fitur")}
                className={getLinkClass("fitur")}
              >
                <Star className="w-4 h-4 mb-0.5" />
                Fitur Kami
              </HashLink>
            </li>
            <li>
              <HashLink
                smooth
                to="/#cek-produksi"
                onClick={() => setActiveSection("cek-produksi")}
                className={getLinkClass("cek-produksi")}
              >
                <Search className="w-4 h-4 mb-0.5" />
                Lacak Produksi
              </HashLink>
            </li>

            <li>
              <HashLink
                smooth
                to="/#faq"
                onClick={() => setActiveSection("faq")}
                className={getLinkClass("faq")}
              >
                <HelpCircle className="w-4 h-4 mb-0.5" />
                FAQ
              </HashLink>
            </li>
          </ul>

          {/* Bagian kanan: tombol masuk */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              to="/masuk" // arahkan ke halaman login
              className="bg-white text-[#B5302D] hover:bg-gray-100 text-sm sm:text-base font-extrabold rounded-full px-6 py-2 shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Masuk
            </Link>
          </div>
        </div>
      </div>

      {/* Menu versi mobile (muncul kalau tombol hamburger diklik) */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 shadow-xl ${
          show ? "max-h-[420px] py-4 opacity-100" : "max-h-0 opacity-0"
        } bg-gradient-to-r from-[#EF8523] to-[#f19d5c]`}
      >
        <ul className="flex flex-col items-start space-y-2 font-medium px-4 text-sm">
          {/* Setiap link di mobile menu juga nutup menunya setelah diklik */}
          <li className="w-full">
            <HashLink
              smooth
              to="/#beranda"
              onClick={() => {
                setActiveSection("beranda");
                setShow(false);
              }}
              className={getMobileLinkClass("beranda")}
            >
              <Home className="w-5 h-5" />
              Beranda
            </HashLink>
          </li>
          <li className="w-full">
            <HashLink
              smooth
              to="/#tentang-kami"
              onClick={() => {
                setActiveSection("tentang");
                setShow(false);
              }}
              className={getMobileLinkClass("tentang")}
            >
              <Info className="w-5 h-5" />
              Tentang Kami
            </HashLink>
          </li>
          <li className="w-full">
            <HashLink
              smooth
              to="/#fitur-kami"
              onClick={() => {
                setActiveSection("fitur");
                setShow(false);
              }}
              className={getMobileLinkClass("fitur")}
            >
              <Star className="w-5 h-5" />
              Fitur Kami
            </HashLink>
          </li>
          <li className="w-full">
            <HashLink
              smooth
              to="/#cek-produksi"
              onClick={() => {
                setActiveSection("cek-produksi");
                setShow(false);
              }}
              className={getMobileLinkClass("cek-produksi")}
            >
              <Search className="w-5 h-5" />
              Lacak Produksi
            </HashLink>
          </li>

          {/* MENU FAQ (TAMBAHAN UNTUK HP) */}
          <li className="w-full">
            <HashLink
              smooth
              to="/#faq"
              onClick={() => {
                setActiveSection("faq");
                setShow(false);
              }}
              className={getMobileLinkClass("faq")}
            >
              <HelpCircle className="w-5 h-5" />
              FAQ
            </HashLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
