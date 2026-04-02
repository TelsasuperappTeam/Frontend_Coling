// Import beberapa hook dan komponen penting dari React dan React Router
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link"; // untuk navigasi ke bagian tertentu di halaman
import { X } from "lucide-react"; // ikon tanda silang (buat tombol close menu)

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
    ? "shadow-[0_2px_5px_rgba(0,0,0,0.1)]"
    : "";

  // fungsi untuk menentukan gaya link (warna teks) di mode desktop
  const getLinkClass = (name) =>
    `transition-colors duration-200 ${
      activeSection === name
        ? "text-[#B5302D] font-semibold" // warna merah untuk menu aktif
        : "text-white hover:text-[#B5302D]" // warna putih dan berubah merah saat dihover
    }`;

  // fungsi untuk menentukan gaya link di mode mobile
  const getMobileLinkClass = (name) =>
    `block py-1 transition-colors duration-200 ${
      activeSection === name
        ? "text-[#B5302D] font-semibold"
        : "text-white hover:text-[#B5302D]"
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
              className="text-2xl lg:hidden block cursor-pointer bg-transparent border-0 text-white"
              aria-label="Toggle menu"
            >
              {/* kalau show = true tampil ikon X, kalau false tampil ikon hamburger */}
              {show ? <X size={24} /> : <i className="ri-align-justify text-2xl" />}
            </button>

            {/* Logo aplikasi TSA */}
            <div className="flex items-center gap-2">
              <img src="/LogoTSA.png" alt="Logo" className="h-6 w-auto sm:h-7" />
              <h1 className="text-m sm:text-sm lg:text-base font-bold text-white whitespace-nowrap">
                PalmaOne-08
              </h1>
            </div>
          </div>

          {/* Menu tengah (tampil hanya di desktop) */}
          <ul className="hidden lg:flex flex-1 justify-center items-center space-x-8 font-medium">
            <li>
              {/* HashLink dipakai biar bisa scroll halus ke bagian tertentu */}
              <HashLink
                smooth
                to="/#beranda"
                onClick={() => setActiveSection("beranda")}
                className={getLinkClass("beranda")}
              >
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
                Fitur Kami
              </HashLink>
            </li>
          </ul>

          {/* Bagian kanan: tombol masuk */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              to="/masuk" // arahkan ke halaman login
              className="bg-[#B5302D] hover:bg-[#992824] text-white text-sm sm:text-base font-medium rounded-md px-4 py-1.5 shadow-md transition-all duration-200"
            >
              Masuk
            </Link>
          </div>
        </div>
      </div>

      {/* Menu versi mobile (muncul kalau tombol hamburger diklik) */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          show ? "max-h-[420px] py-1.5" : "max-h-0"
        } bg-gradient-to-r from-[#EF8523] to-[#f19d5c]`}
      >
        <ul className="flex flex-col items-start space-y-[2px] font-medium px-4 text-sm">
          {/* Setiap link di mobile menu juga nutup menunya setelah diklik */}
          <li>
            <HashLink
              smooth
              to="/#beranda"
              onClick={() => {
                setActiveSection("beranda");
                setShow(false);
              }}
              className={getMobileLinkClass("beranda")}
            >
              Beranda
            </HashLink>
          </li>
          <li>
            <HashLink
              smooth
              to="/#tentang-kami"
              onClick={() => {
                setActiveSection("tentang");
                setShow(false);
              }}
              className={getMobileLinkClass("tentang")}
            >
              Tentang Kami
            </HashLink>
          </li>
          <li>
            <HashLink
              smooth
              to="/#fitur-kami"
              onClick={() => {
                setActiveSection("fitur");
                setShow(false);
              }}
              className={getMobileLinkClass("fitur")}
            >
              Fitur Kami
            </HashLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

// Jangan lupa export biar bisa dipakai di komponen lain
export default Navbar;
