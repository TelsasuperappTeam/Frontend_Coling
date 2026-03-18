import React, { useState } from "react";

// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import HomeImage from "../assets/Beranda.png";
import FiturImage from "../assets/Homepagespetani.jpeg";

// Import Gambar Fitur Baru
import Fitur1 from "../assets/Fitur2.jpg";
import Fitur2 from "../assets/Fitur1.jpeg";
import Fitur3 from "../assets/Fitur3.jpg";
import Fitur4 from "../assets/Fitur4.jpeg";

// Import Ikon Lucide React
import {
  ChevronDown,
  ClipboardCheck,
  Clock,
  Users,
  NotebookPen,
  Sprout,
  ScanEye,
  Truck,
} from "lucide-react";

// =========================== KOMPONEN REUSABLE ===========================
const AnimatedSection = ({ id, className, children }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });
  return (
    <motion.section
      id={id}
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
};

// =========================== JUDUL SECTION ===========================
const SectionTitle = ({ children }) => (
  <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center mb-12 md:mb-16">
    {children}
  </h2>
);

// =========================== IKON PANAH UNTUK FAQ ===========================
const ChevronIcon = ({ isOpen }) => (
  <motion.div
    animate={{ rotate: isOpen ? 180 : 0 }}
    transition={{ duration: 0.3 }}
    className="flex items-center justify-center"
  >
    <ChevronDown className="w-6 h-6 text-gray-700" />
  </motion.div>
);

// =========================== KOMPONEN UTAMA ===========================
const HomePages = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [productionCode, setProductionCode] = useState("");

  const handleCheckCodeSubmit = (e) => {
    e.preventDefault();
    alert(`Mengecek kode: ${productionCode}`);
  };

  return (
    <div className="bg-white">
      {/* ================= HERO SECTION ================= */}
      <section
        id="beranda"
        className="bg-linear-to-br from-[#EF8523] to-[#B5302D] text-white"
      >
        <div className="container mx-auto px-6 md:px-25 pt-20 pb-8 md:pt-28 md:pb-20 flex flex-col md:grid md:grid-cols-2 items-center gap-6 md:gap-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-1 md:order-2 flex justify-center md:justify-end md:pl-10 lg:pl-16"
          >
            <img
              src={HomeImage}
              alt="Tampilan Aplikasi Telsa Super App"
              fetchPriority="high"
              width="500"
              height="500"
              className="rounded-xl shadow-xl w-80 max-w-[180px] sm:max-w-[220px] md:max-w-md lg:max-w-lg object-contain"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="order-2 md:order-1 text-center md:text-left space-y-3"
          >
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-extrabold leading-snug drop-shadow-lg mb-3">
              Selamat Datang di TELSA Super App
            </h1>

            <p className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed max-w-md mx-auto md:mx-0">
              Satu Langkah Digital Membantu Petani Sawit Rakyat Untuk Menuju
              Sertifikasi ISPO
            </p>

            <div className="flex justify-center md:justify-start">
              <Link
                to="/daftar"
                className="bg-white text-[#B5302D] font-semibold px-6 py-2.5 rounded-full hover:bg-gray-200 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                Daftar Sekarang
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= TENTANG KAMI ================= */}
      <AnimatedSection id="tentang-kami" className="py-14 md:py-28 bg-white">
        <div className="container mx-auto px-4 md:px-28">
          <h2 className="text-xl md:text-3xl font-extrabold text-center text-gray-900 mb-5 md:mb-15">
            Manajemen dan Dokumentasi Perkebunan Sawit Digital
          </h2>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="flex flex-col justify-center text-left">
              <div className="md:hidden flex items-center justify-center relative my-4">
                <div className="absolute w-full h-full bg-linear-to-br from-orange-400 to-red-500 rounded-full -bottom-8 -right-8 blur-3xl opacity-20" />
                <img
                  src={FiturImage}
                  alt="Fitur Unggulan Telsa App"
                  loading="lazy"
                  className="relative w-full max-w-[260px] sm:max-w-sm rounded-2xl shadow-2xl object-cover"
                />
              </div>

              <p className="text-gray-600 mb-5 md:mb-8 text-sm md:text-lg leading-relaxed pl-3 md:pl-0">
                <strong>TELSA Super App</strong> adalah platform membantu petani
                sawit rakyat mengelola pencatatan perkebunan, transability
                sawit, koordinasi antar pelaku sawit, dan pemenuhan sertifikasi
                ISPO dengan lebih mudah, cepat, dan efisien.
              </p>

              <ul className="space-y-3 md:space-y-4 pl-4 md:pl-0">
                {[
                  "<strong>100% pemenuhan persyaratan ISPO</strong> dalam sistem TELSA.",
                  "<strong>Otomatisasi dokumen</strong> berdasarkan aktivitas perkebunan.",
                  "Didesain khusus untuk <strong>petani rakyat</strong> dan pendamping stakeholder lainnya.",
                ].map((text, i) => {
                  // Mapping Icon Lucide sesuai konteks
                  const IconComponent = [
                    ClipboardCheck, // Untuk indikator/checklist
                    Clock, // Untuk waktu/kecepatan
                    Users, // Untuk petani/orang
                  ][i];

                  return (
                    <li key={i} className="flex items-start justify-start">
                      <div className="shrink-0 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full mt-1">
                        <IconComponent className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <p
                        className="ml-3 md:ml-4 text-gray-700 text-sm md:text-lg leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: text }}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="hidden md:flex justify-center md:justify-end">
              <img
                src={FiturImage}
                alt="Fitur Unggulan Telsa App"
                className="w-full max-w-md rounded-2xl shadow-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ================= FITUR (REVISED) ================= */}
      <AnimatedSection id="fitur-kami" className="py-14 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-xl md:text-3xl font-extrabold text-center mb-10 text-gray-900">
            Fitur Utama Platform Kami
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-7xl mx-auto">
            {[
              {
                image: Fitur1,
                icon: NotebookPen,
                title: "Pencatatan Kegiatan Sawit Terintegrasi",
                desc: "Mendukung pencatatan kegiatan operasional pertanian, pengiriman TBS, serta proses produksi hasil olahan TBS dalam satu sistem terpusat.",
              },
              {
                image: Fitur2,
                icon: Sprout,
                title: "Koordinasi Antar Pelaku Sawit",
                desc: "Menghubungkan petani, kebun, logistik, dan pabrik dalam satu platform sehingga tercipta koordinasi dan rantai pasok sawit yang transparan.",
              },
              {
                image: Fitur3,
                icon: ScanEye,
                title: "Mendukung Sertifikasi ISPO",
                desc: "Membantu mengumpulkan, mencatat, dan memantau progres kelengkapan dokumen yang dibutuhkan untuk pengajuan sertifikasi ISPO",
              },
              {
                image: Fitur4,
                icon: Truck,
                title: "Traceability Sawit dari Hulu ke Hilir",
                desc: "Memungkinkan penelusuran asal TBS mulai dari kebun sawit, proses pengiriman, hingga menjadi produk di pabrik.",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl shadow-md hover:shadow-xl border border-gray-100 bg-white overflow-hidden flex flex-col h-full"
              >
                <div className="h-32 md:h-48 w-full relative overflow-hidden">
                  <img
                    src={f.image}
                    alt={f.title}
                    loading="lazy"
                    width="300"
                    height="200"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>

                <div className="p-3 md:p-5 flex flex-col grow text-left">
                  {/* Badge Ikon */}
                  <div className="mb-2 md:mb-3 inline-block">
                    <span className="bg-orange-100 text-orange-600 text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded flex items-center w-fit gap-1">
                      <f.icon className="w-3 h-3 md:w-4 md:h-4" /> Fitur
                    </span>
                  </div>

                  {/* Ukuran font judul disesuaikan untuk mobile */}
                  <h3 className="text-sm md:text-lg font-bold mb-1 md:mb-2 text-gray-900 leading-tight">
                    {f.title}
                  </h3>

                  {/* Ukuran font deskripsi disesuaikan untuk mobile */}
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-2 md:mb-6 grow">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ================= CEK KODE PRODUKSI ================= */}
      <AnimatedSection id="cek-produksi" className="py-14 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <h2 className="text-xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-6">
            Lacak & Verifikasi Kode Produksi
          </h2>

          <p className="text-sm md:text-lg text-gray-600 mb-6 md:mb-10 leading-relaxed max-w-2xl mx-auto">
            Masukkan kode produksi untuk memverifikasi keaslian dan melihat
            detail rantai pasok.
          </p>

          <form
            className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-xl mx-auto"
            onSubmit={handleCheckCodeSubmit}
          >
            <input
              type="text"
              value={productionCode}
              onChange={(e) => setProductionCode(e.target.value)}
              placeholder="Masukkan Kode Produksi..."
              className="flex-1 px-4 py-3 md:px-6 md:py-4 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500 shadow-sm text-sm md:text-lg"
              required
            />
            <button
              type="submit"
              className="bg-linear-to-br from-orange-500 to-red-600 text-white font-semibold px-5 py-3 md:px-8 md:py-4 rounded-full hover:shadow-xl transition-all transform hover:-translate-y-1 text-sm md:text-base"
            >
              Cek Sekarang
            </button>
          </form>
        </div>
      </AnimatedSection>

      {/* ================= FAQ ================= */}
      <AnimatedSection id="faq" className="py-14 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-28 grid md:grid-cols-2 gap-10 md:gap-12 items-start">
          {/* Kolom kiri */}
          <div className="md:sticky md:top-28 text-center md:text-left">
            <h2 className="text-xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Punya Pertanyaan?
            </h2>
            <p className="text-sm md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
              Kami telah merangkum beberapa pertanyaan yang paling sering
              diajukan untuk membantu Anda memahami TELSA Super App lebih baik.
            </p>

            {/* Tombol hanya tampil di desktop */}
            <div className="hidden md:flex md:flex-col gap-4 items-start">
              <Link
                to="/faq"
                className="inline-block w-full sm:w-auto text-center bg-linear-to-br from-orange-500 to-red-600 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full hover:shadow-xl transition-all transform hover:-translate-y-1 text-sm md:text-base"
              >
                Lebih lanjut?
              </Link>
              <a
                href="https://drive.google.com/file/d/10kAMyV8x56pMO-mRFKr34Co4WtIvPHNn/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full sm:w-auto text-center bg-white border-2 border-orange-500 text-orange-600 font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full hover:bg-orange-50 hover:shadow-xl transition-all transform hover:-translate-y-1 text-sm md:text-base"
              >
                Buku Panduan TELSA
              </a>
            </div>
          </div>

          {/* Kolom kanan (FAQ list) */}
          <div className="space-y-3 md:space-y-4">
            {[
              {
                q: "Apa itu TELSA Super App?",
                a: "TELSA Super App adalah platform digital untuk membantu petani sawit rakyat dalam mengelola perkebunan, dokumen, dan proses sertifikasi ISPO secara mudah dan terintegrasi dengan sistem.",
              },
              {
                q: "Apakah aplikasi ini gratis?",
                a: "Ya, seluruh fitur TELSA Super App dapat digunakan secara gratis oleh petani rakyat, pendamping, logistik, pabrik, stakeholder lainnya.",
              },
              {
                q: "Bagaimana cara memulai menggunakan TELSA?",
                a: "Untuk mulai menggunakan TELSA Super App, kunjungi website, daftarkan akun Anda, lalu tunggu sistem memproses pengajuan. Setelah disetujui, akun dapat digunakan untuk mengelola data kebun Anda.",
              },
            ].map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full text-left px-4 md:px-5 py-3 md:py-4 flex justify-between items-center gap-3 md:gap-4"
                  >
                    <span
                      className={`flex-1 text-sm md:text-lg font-medium ${
                        isOpen ? "text-orange-600" : "text-gray-800"
                      }`}
                    >
                      {faq.q}
                    </span>
                    <ChevronIcon isOpen={isOpen} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 md:px-5 pb-3 md:pb-4 pt-0 text-gray-600 text-sm md:text-base leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Tombol hanya tampil di mobile */}
            <div className="flex flex-col gap-3 md:hidden pt-6 text-center">
              <Link
                to="/faq"
                className="inline-block w-full sm:w-auto text-center bg-linear-to-br from-orange-500 to-red-600 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full hover:shadow-xl transition-all transform hover:-translate-y-1 text-sm md:text-base"
              >
                Lebih lanjut?
              </Link>
              <a
                href="https://drive.google.com/file/d/10kAMyV8x56pMO-mRFKr34Co4WtIvPHNn/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full sm:w-auto text-center bg-white border-2 border-orange-500 text-orange-600 font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full hover:bg-orange-50 hover:shadow-xl transition-all transform hover:-translate-y-1 text-sm md:text-base"
              >
                Buku Panduan TELSA
              </a>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default HomePages;