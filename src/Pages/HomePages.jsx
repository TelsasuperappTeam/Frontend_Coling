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
  CheckCircle2,
  Loader2,
  X,
  User,
  MapPin,
  Calendar,
  Info,
  Star,
  Search,
  HelpCircle,
  ScanEye,
  Truck,
} from "lucide-react";

import { showToast } from "../utils/notif";
import { API_ENDPOINTS } from "../config/constants";

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

// =========================== EYEBROW / LABEL KECIL BERTEMA SAWIT ===========================
const SectionEyebrow = ({ children }) => (
  <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
    <span className="h-px w-6 md:w-8 bg-gradient-to-r from-transparent to-orange-400" />
    <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
      {children}
    </span>
    <span className="h-px w-6 md:w-8 bg-gradient-to-l from-transparent to-orange-400" />
  </div>
);

// =========================== IKON PANAH UNTUK FAQ ===========================
const ChevronIcon = ({ isOpen }) => (
  <motion.div
    animate={{ rotate: isOpen ? 180 : 0 }}
    transition={{ duration: 0.3 }}
    className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors duration-300 ${
      isOpen ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
    }`}
  >
    <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
  </motion.div>
);

// =========================== LABEL KATEGORI BERNOMOR (MODAL TRACEABILITY) ===========================
const CategoryLabel = ({ number, children }) => (
  <div className="flex items-center gap-2 sm:gap-2.5 border-b border-gray-200 pb-2 mb-3 sm:mb-4">
    <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-100 text-orange-700 text-[9px] sm:text-[10px] font-black shrink-0">
      {number}
    </span>
    <h5 className="text-[9px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">
      {children}
    </h5>
  </div>
);

// =========================== KOMPONEN UTAMA ===========================
const HomePages = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [productionCode, setProductionCode] = useState("");

  // --- STATE BARU UNTUK PELACAKAN API ---
  const [traceResult, setTraceResult] = useState(null);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);

  // --- FUNGSI SUBMIT DINAMIS KE BACKEND ---
  const handleCheckCodeSubmit = async (e) => {
    e.preventDefault();
    if (!productionCode.trim()) return;

    setIsLoadingTrack(true);
    setTraceResult(null);

    try {
      // Panggil endpoint publik dari konstanta API
      const url =
        API_ENDPOINTS.TRACEABILITY.KODE_PRODUKSI_PUBLIK.SCAN_TRACEABILITY(
          productionCode,
        );
      const response = await fetch(url);
      const data = await response.json();

      // ---> TAMBAHKAN CONSOLE LOG DI SINI <---
      //console.log("=== DATA MENTAH TRACEABILITY (DARI BE) ===", data);

      if (response.ok) {
        setTraceResult(data);
      } else {
        showToast.error(
          data.detail || "Kode Produksi tidak ditemukan dalam sistem.",
        );
      }
    } catch {
      // Menangkap parameter error
      // ---> CONSOLE LOG ERROR JARINGAN <---
      //console.error("=== ERROR FETCH TRACEABILITY ===", error);
      showToast.error("Terjadi kesalahan jaringan. Gagal mengambil data.");
    } finally {
      setIsLoadingTrack(false);
    }
  };

  return (
    <div className="bg-white">
      {/* ================= HERO SECTION ================= */}
      <section
        id="beranda"
        className="relative overflow-hidden bg-linear-to-br from-[#EF8523] to-[#B5302D] text-white"
      >
        {/* Dekorasi latar bertema sawit (blob + pola titik) — murni visual, tidak menutupi konten */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 md:w-[420px] md:h-[420px] bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-16 w-64 h-64 md:w-96 md:h-96 bg-yellow-300/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
        </div>

        <div className="relative container mx-auto px-6 md:px-25 pt-20 pb-8 md:pt-28 md:pb-24 flex flex-col md:grid md:grid-cols-2 items-center gap-6 md:gap-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-1 md:order-2 flex justify-center md:justify-end md:pl-10 lg:pl-16"
          >
            <div className="relative">
              <div className="absolute inset-0 scale-90 bg-white/15 rounded-3xl blur-2xl" />
              <img
                src={HomeImage}
                alt="Tampilan Aplikasi PalmaOne-08"
                fetchPriority="high"
                width="500"
                height="500"
                className="relative rounded-2xl shadow-2xl ring-1 ring-white/20 w-80 max-w-[180px] sm:max-w-[220px] md:max-w-md lg:max-w-lg object-contain"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="order-2 md:order-1 text-center md:text-left space-y-4"
          >
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white/95 text-[11px] md:text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
              <Sprout className="w-3.5 h-3.5" />
              Platform Digital Perkebunan Sawit
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-4xl font-extrabold leading-[1.15] tracking-tight drop-shadow-lg">
              Selamat Datang di Platform ISPO PalmaOne-08
            </h1>

            <p className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed max-w-md mx-auto md:mx-0">
              Platform ERP Untuk Pemenuhan Sertifikasi ISPO untuk Perusahaan
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-1">
              <Link
                to="/daftar"
                className="bg-white text-[#B5302D] font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Daftar Sekarang
              </Link>
              <a
                href="#tentang-kami"
                className="border border-white/40 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition-all duration-300"
              >
                Pelajari Lebih Lanjut
              </a>
            </div>
          </motion.div>
        </div>

        {/* Garis pemisah halus ke section berikutnya */}
        <div className="relative h-6 md:h-10 bg-gradient-to-b from-transparent to-white/0" />
      </section>

      {/* ================= TENTANG KAMI ================= */}
      <AnimatedSection
        id="tentang-kami"
        className="py-16 md:py-24 bg-slate-50/50 scroll-mt-24"
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-28">
          <div className="max-w-4xl mx-auto text-center mb-10 md:mb-16">
            <SectionEyebrow>Tentang Platform</SectionEyebrow>

            <h2 className="text-xl md:text-3xl font-extrabold text-gray-900 mt-4 mb-5 md:mb-8 leading-tight">
              Manajemen dan Dokumentasi Perkebunan Sawit Digital
            </h2>

            <p className="text-gray-600 text-sm md:text-lg leading-relaxed px-2 md:px-0 max-w-3xl mx-auto">
              <strong>Platform ISPO PalmOne-08</strong> adalah sistem ERP
              untuk mengelola pencatatan perkebunan, transability sawit,
              koordinasi antar pelaku sawit, dan pemenuhan sertifikasi ISPO
              dengan lebih mudah, cepat, dan efisien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
            {[
              "<strong>Membantu pemenuhan persyaratan ISPO</strong> sesuai dengan Permentan No. 33 Tahun 2025.",
              "<strong>Otomatisasi dokumen</strong> berdasarkan aktivitas perkebunan harian Anda.",
              "Didesain khusus untuk <strong>Perusahaan</strong> dan pendamping stakeholder.",
            ].map((text, i) => {
              const IconComponent = [ClipboardCheck, Clock, Users][i];

              return (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-orange-200 transition-all duration-300 flex flex-row md:flex-col items-center text-left md:text-center group"
                >
                  <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 rounded-xl md:rounded-2xl mr-4 md:mr-0 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-6 h-6 md:w-8 md:h-8" />
                  </div>

                  <p
                    className="text-gray-700 text-sm md:text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: text }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      
      {/* ================= FITUR ================= */}
      <AnimatedSection
        id="fitur-kami"
        className="py-14 md:py-20 bg-gradient-to-b from-white via-orange-50/30 to-white scroll-mt-24"
      >
        <div className="container mx-auto px-4 md:px-6">
          <SectionEyebrow>Apa yang Kami Tawarkan</SectionEyebrow>
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
                className="group rounded-2xl md:rounded-3xl shadow-sm hover:shadow-2xl border border-gray-100 hover:border-orange-200 bg-white overflow-hidden flex flex-col h-full transition-all duration-300"
              >
                <div className="h-32 md:h-48 w-full relative overflow-hidden">
                  <img
                    src={f.image}
                    alt={f.title}
                    loading="lazy"
                    width="300"
                    height="200"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent" />
                  <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3">
                    <span className="bg-white/95 backdrop-blur-sm text-orange-600 text-[10px] md:text-xs font-bold px-2 py-1 rounded-lg flex items-center w-fit gap-1 shadow-sm">
                      <f.icon className="w-3 h-3 md:w-4 md:h-4" /> Fitur
                    </span>
                  </div>
                </div>

                <div className="p-3 md:p-5 flex flex-col grow text-left">
                  <h3 className="text-sm md:text-lg font-bold mb-1 md:mb-2 text-gray-900 leading-tight">
                    {f.title}
                  </h3>

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
      <AnimatedSection
        id="cek-produksi"
        className="relative scroll-mt-24 md:scroll-mt-28 py-14 md:py-20 bg-gray-50 flex justify-center overflow-hidden"
      >
        {/* Dekorasi titik bertema rantai pasok */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative w-full max-w-4xl mx-auto px-4 md:px-6 text-center flex flex-col items-center">
          <SectionEyebrow>Traceability Sawit</SectionEyebrow>
          <h2 className="text-xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-6">
            Lacak & Verifikasi Kode Produksi
          </h2>

          <p className="text-sm md:text-lg text-gray-600 mb-6 md:mb-10 leading-relaxed max-w-2xl mx-auto">
            Masukkan kode produksi untuk memverifikasi keaslian dan melihat
            detail rantai pasok.
          </p>

          {/* FORM INPUT DINAMIS */}
          <form
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 w-full max-w-2xl mx-auto bg-white p-2.5 md:p-3 rounded-[28px] shadow-lg border border-gray-100"
            onSubmit={handleCheckCodeSubmit}
          >
            <div className="relative w-full sm:flex-1">
              <input
                type="text"
                value={productionCode}
                onChange={(e) => setProductionCode(e.target.value)}
                placeholder="Masukkan Kode Produksi CPO..."
                className="w-full sm:pl-11 px-5 py-3 md:px-6 md:py-4 rounded-full border border-gray-200 sm:border-transparent focus:border-transparent focus:ring-2 focus:ring-orange-500 text-sm md:text-lg outline-none transition-shadow"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoadingTrack || !productionCode.trim()}
              // Tambahkan shrink-0 dan sm:w-auto agar tombol tidak penyok dan diam di tempat
              className="w-full sm:w-auto shrink-0 bg-gradient-to-br from-orange-500 to-red-600 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full hover:shadow-xl transition-all transform hover:-translate-y-1 text-sm md:text-base flex justify-center items-center gap-2 disabled:opacity-70 disabled:transform-none"
            >
              {isLoadingTrack ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Cek Sekarang"
              )}
            </button>
          </form>

          {/* ================================================================= */}
          {/* --- MODAL POP-UP HASIL PELACAKAN (VERSI MOBILE FRIENDLY & RATA KIRI) --- */}
          {/* ================================================================= */}
          {traceResult && (
            <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
              {/* CONTAINER UTAMA MODAL (Tinggi di-set max 75vh di mobile agar tidak penuhi layar) */}
              <div className="relative w-full max-w-3xl bg-white shadow-2xl ring-1 ring-black/5 rounded-[22px] sm:rounded-[32px] flex flex-col max-h-[75vh] sm:max-h-[85vh] overflow-hidden animate-in zoom-in-95 text-left">
                {/* 1. STICKY HEADER */}
                <div className="sticky top-0 z-[70] bg-gradient-to-r from-white via-green-50/40 to-white backdrop-blur-md border-b border-gray-100 px-4 py-3.5 sm:px-8 sm:py-5 flex justify-between items-center shrink-0 shadow-sm text-left">
                  <div className="flex items-center gap-2.5 sm:gap-4">
                    <div className="p-1.5 sm:p-3 bg-green-100 rounded-full border border-green-200 shrink-0">
                      <CheckCircle2 className="w-5 h-5 sm:w-7 sm:h-7 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-xl font-bold text-gray-900 tracking-tight leading-none">
                        Produk Terverifikasi Valid
                      </h4>
                      <p className="text-[9px] sm:text-xs text-green-700 font-semibold mt-1 flex items-center gap-1">
                        <Sprout className="w-3 h-3" />
                        Traceability Blockchain • ISPO PalmaOne-08
                      </p>
                    </div>
                  </div>

                  {/* Tombol Tutup */}
                  <button
                    onClick={() => setTraceResult(null)}
                    className="p-1.5 sm:p-2.5 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-full transition-all duration-200 border border-gray-200 hover:border-red-200 shrink-0"
                    title="Tutup Halaman"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* 2. AREA KONTEN DENGAN SCROLLBAR */}
                <div className="overflow-y-auto p-4 sm:p-8 custom-elegant-scrollbar bg-gray-50/30 text-left">
                  <div className="space-y-6 sm:space-y-10">
                    {/* KATEGORI 1: INFORMASI PRODUKSI */}
                    <section>
                      <CategoryLabel number="01">
                        Ringkasan Produksi Pabrik
                      </CategoryLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm col-span-2 sm:col-span-1">
                          <p className="text-gray-400 text-[8px] sm:text-[10px] uppercase font-bold mb-1.5 sm:mb-2 tracking-wider">
                            Kode Resi Produksi
                          </p>
                          <p className="font-mono font-bold text-[#B5302D] text-[11px] sm:text-sm bg-red-50 px-2 py-0.5 sm:py-1 rounded inline-block border border-red-100">
                            {traceResult.kode_resi_produksi ||
                              traceResult.kode_resi_production ||
                              productionCode}
                          </p>
                        </div>
                        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
                          <p className="text-gray-400 text-[8px] sm:text-[10px] uppercase font-bold mb-1.5 sm:mb-2 tracking-wider">
                            Total Diolah
                          </p>
                          <p className="font-black text-gray-900 text-sm sm:text-xl">
                            {(
                              traceResult.total_tbs_diolah_kg || 0
                            ).toLocaleString("id-ID")}{" "}
                            <span className="text-[9px] sm:text-xs font-semibold text-gray-500">
                              Kg
                            </span>
                          </p>
                        </div>
                        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
                          <p className="text-gray-400 text-[8px] sm:text-[10px] uppercase font-bold mb-1.5 sm:mb-2 tracking-wider">
                            Waktu Selesai
                          </p>
                          <p className="font-bold text-gray-800 text-[11px] sm:text-sm">
                            {traceResult.waktu_produksi_selesai
                              ? new Date(
                                  traceResult.waktu_produksi_selesai,
                                ).toLocaleString("id-ID", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* KATEGORI 2: HASIL OLAHAN PRODUKSI */}
                    <section>
                      <CategoryLabel number="02">
                        Komposisi Hasil Olahan (Output)
                      </CategoryLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {[
                          {
                            label: "CPO",
                            value: traceResult.hasil_cpo_kg,
                            active: true,
                          },
                          {
                            label: "PKO",
                            value: traceResult.hasil_pko_kg,
                            active: true,
                          },
                          {
                            label: "Cangkang",
                            value: traceResult.hasil_cangkang_kg,
                          },
                          { label: "Serat", value: traceResult.hasil_serat_kg },
                          {
                            label: "T. Kosong",
                            value: traceResult.hasil_tandan_kosong_kg,
                          },
                          { label: "POME", value: traceResult.hasil_pome_kg },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-gray-100 p-2.5 sm:p-4 rounded-xl text-left shadow-sm"
                          >
                            <p className="text-gray-400 text-[8px] sm:text-[10px] uppercase font-bold mb-0.5 sm:mb-1 tracking-widest">
                              {item.label}
                            </p>
                            <p
                              className={`font-black text-xs sm:text-base ${item.active ? "text-[#EF8523]" : "text-gray-700"}`}
                            >
                              {(item.value || 0).toLocaleString("id-ID")}{" "}
                              <span className="text-[8px] sm:text-[10px] font-semibold text-gray-400">
                                Kg
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* KATEGORI 3: ASAL USUL RANTAI PASOK (HULU) */}
                    <section>
                      <CategoryLabel number="03">
                        Asal Usul Rantai Pasok (Hulu)
                      </CategoryLabel>

                      <div className="space-y-4 sm:space-y-5">
                        {traceResult.rantai_pasok_hulu &&
                        traceResult.rantai_pasok_hulu.length > 0 ? (
                          traceResult.rantai_pasok_hulu.map((hulu, idx) => {
                            const meta = hulu.metadata_kebun_dan_petani || {};
                            return (
                              <div
                                key={idx}
                                className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm text-left"
                              >
                                {/* Info Grup Utama */}
                                <div className="flex flex-col gap-3 mb-4 sm:mb-5 border-b border-green-100 pb-3 sm:pb-4">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                                      <span className="text-[8px] sm:text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                        Pemasok {idx + 1}
                                      </span>
                                      {meta.nama_grup && (
                                        <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                          • {meta.nama_grup}
                                        </span>
                                      )}
                                    </div>
                                    <h6 className="text-sm sm:text-xl font-black text-gray-900 leading-tight">
                                      {meta.nama_kebun ||
                                        meta.nama_gapoktan ||
                                        "Data Kebun Tidak Terdata"}
                                    </h6>
                                  </div>
                                  <div className="bg-white border border-green-100 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl shadow-sm text-left inline-block w-fit">
                                    <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                                      Total Pengajuan TBS
                                    </p>
                                    <p className="text-sm sm:text-lg font-black text-green-700">
                                      {(
                                        meta.estimasi_total_tbs_grup_kg || 0
                                      ).toLocaleString("id-ID")}{" "}
                                      <span className="text-[9px] sm:text-xs font-bold text-green-600/70">
                                        Kg
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                {/* Detail Lokasi & Varietas */}
                                <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-100 shadow-sm text-left">
                                  {/* Item 1: Lokasi */}
                                  <div>
                                    <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1">
                                      Lokasi Kebun / Titik Jemput
                                    </p>
                                    <p className="text-[10px] sm:text-xs font-semibold text-gray-700 line-clamp-2">
                                      {meta.alamat_pickup_teks || "-"}
                                    </p>
                                  </div>

                                  {/* Item 2: Varietas */}
                                  <div>
                                    <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1">
                                      Varietas
                                    </p>
                                    <p className="text-[10px] sm:text-xs font-bold text-gray-800 line-clamp-1">
                                      {meta.jenis_varietas_gabungan || "-"}
                                    </p>
                                  </div>

                                  {/* Item 3: Usia Pohon */}
                                  <div>
                                    <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1">
                                      Usia Pohon
                                    </p>
                                    <p className="text-[10px] sm:text-xs font-bold text-gray-800">
                                      {meta.usia_pohon_range || "-"}
                                    </p>
                                  </div>
                                </div>

                                {/* Daftar Petani */}
                                {meta.item_petani &&
                                  meta.item_petani.length > 0 && (
                                    <div>
                                      <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 sm:mb-3 flex items-center gap-1.5">
                                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                        Daftar Anggota Petani{" "}
                                        <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px]">
                                          {meta.item_petani.length}
                                        </span>
                                      </p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        {meta.item_petani.map(
                                          (petani, pIdx) => (
                                            <div
                                              key={pIdx}
                                              className="bg-white border border-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-4 shadow-sm text-left"
                                            >
                                              <div className="flex justify-between items-start mb-1.5 sm:mb-2 border-b border-gray-50 pb-1.5 sm:pb-2">
                                                <p className="font-bold text-gray-800 text-[11px] sm:text-sm truncate pr-2 flex items-center gap-1.5 sm:gap-2">
                                                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 bg-green-50 rounded-full p-0.5" />
                                                  {petani.nama_petani ||
                                                    "Petani NN"}
                                                </p>
                                                <p className="text-[11px] sm:text-xs font-black text-green-700 shrink-0">
                                                  {(
                                                    petani.estimasi_tbs_kg || 0
                                                  ).toLocaleString(
                                                    "id-ID",
                                                  )}{" "}
                                                  <span className="font-semibold text-[8px] sm:text-[9px] text-gray-500">
                                                    Kg
                                                  </span>
                                                </p>
                                              </div>
                                              <div className="space-y-1.5 sm:space-y-2">
                                                <p
                                                  className="text-[9px] sm:text-[11px] text-gray-600 flex items-start gap-1 sm:gap-1.5"
                                                  title={
                                                    petani.alamat_asal_sawit
                                                  }
                                                >
                                                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 shrink-0 mt-0.5" />
                                                  <span className="line-clamp-1">
                                                    {petani.alamat_asal_sawit ||
                                                      "-"}
                                                  </span>
                                                </p>
                                                <div className="flex flex-col items-start gap-1.5 sm:gap-2 mt-1.5">
                                                  {/* Badge Jenis & Varietas (Atas) */}
                                                  <span className="bg-gray-50 text-gray-600 text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium border border-gray-200 flex items-center gap-1 w-max">
                                                    <Sprout className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600 shrink-0" />{" "}
                                                    {petani.jenis_sawit || "-"}{" "}
                                                    /{" "}
                                                    {petani.nama_varietas ||
                                                      "-"}
                                                  </span>

                                                  {/* Badge Usia (Bawah) */}
                                                  <span className="bg-green-50 text-green-700 text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium border border-green-100 flex items-center gap-1 w-max">
                                                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />{" "}
                                                    Usia:{" "}
                                                    {petani.usia_tanaman || "-"}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-left py-6 sm:py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 px-4">
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">
                              Data asal usul kebun belum terekam dalam database.
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              {/* 3. CSS GLOBAL UNTUK SCROLLBAR YANG ELEGAN DAN MENYATU (MAC STYLE) */}
              <style
                dangerouslySetInnerHTML={{
                  __html: `
      .custom-elegant-scrollbar::-webkit-scrollbar {
        width: 4px; /* Dibuat lebih tipis di mobile */
      }
      @media (min-width: 640px) {
        .custom-elegant-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
      }
      .custom-elegant-scrollbar::-webkit-scrollbar-track {
        background: transparent;
        margin-top: 4px;
        margin-bottom: 4px;
      }
      .custom-elegant-scrollbar::-webkit-scrollbar-thumb {
        background-color: #cbd5e1;
        border-radius: 10px;
      }
      .custom-elegant-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: #94a3b8;
      }
    `,
                }}
              />
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* ================= FAQ ================= */}
      <AnimatedSection
        id="faq"
        className="scroll-mt-24 md:scroll-mt-28 py-14 md:py-20 bg-gradient-to-b from-white to-orange-50/40"
      >
        <div className="container mx-auto px-4 md:px-28 grid md:grid-cols-2 gap-10 md:gap-12 items-start">
          {/* Kolom kiri */}
          <div className="md:sticky md:top-28 text-center md:text-left">
            <div className="md:flex md:justify-start flex justify-center">
              <SectionEyebrow>Bantuan</SectionEyebrow>
            </div>
            <h2 className="text-xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Punya Pertanyaan?
            </h2>
            <p className="text-sm md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
              Kami telah merangkum beberapa pertanyaan yang paling sering
              diajukan untuk membantu Anda memahami Platform ISPO PalmaOne-08
              lebih baik.
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
                href="https://drive.google.com/file/d/1QD0mpuoxNsBN1OSFwZFBgo2VdCB_W0lD/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full sm:w-auto text-center bg-white border-2 border-orange-500 text-orange-600 font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full hover:bg-orange-50 hover:shadow-xl transition-all transform hover:-translate-y-1 text-sm md:text-base"
              >
                Buku Panduan
              </a>
            </div>
          </div>

          {/* Kolom kanan (FAQ list) */}
          <div className="space-y-3 md:space-y-4">
            {[
              {
                q: "Apa itu Platform ISPO PalmaOne-08?",
                a: "Platform ISPO PalmaOne-08 adalah sistem ERP untuk mengelola pencatatan perkebunan, transparansi, dan proses sertifikasi ISPO secara mudah dan terintegrasi dengan sistem.",
              },
              {
                q: "Apakah aplikasi ini gratis?",
                a: "Ya, seluruh fitur Platform ISPO PalmaOne-08 dapat digunakan secara gratis oleh petani rakyat, pendamping, logistik, pabrik, stakeholder lainnya.",
              },
              {
                q: "Bagaimana cara memulai menggunakan Platform ISPO PalmaOne-08?",
                a: "Untuk mulai menggunakan Platform ISPO PalmaOne-08, kunjungi website, daftarkan akun Anda, lalu tunggu sistem memproses pengajuan. Setelah disetujui, akun dapat digunakan untuk mengelola data kebun Anda.",
              },
            ].map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className={`border rounded-2xl overflow-hidden bg-white transition-all duration-300 ${
                    isOpen
                      ? "border-orange-200 shadow-md"
                      : "border-gray-200 shadow-sm hover:border-orange-100 hover:shadow-md"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full text-left px-4 md:px-5 py-3.5 md:py-4 flex justify-between items-center gap-3 md:gap-4"
                  >
                    <span
                      className={`flex-1 text-sm md:text-lg font-medium transition-colors ${
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
                        <div className="px-4 md:px-5 pb-4 md:pb-5 pt-0 text-gray-600 text-sm md:text-base leading-relaxed bg-orange-50/40 border-t border-orange-100/70">
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
                href="https://drive.google.com/file/d/1QD0mpuoxNsBN1OSFwZFBgo2VdCB_W0lD/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full sm:w-auto text-center bg-white border-2 border-orange-500 text-orange-600 font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full hover:bg-orange-50 hover:shadow-xl transition-all transform hover:-translate-y-1 text-sm md:text-base"
              >
                Buku Panduan
              </a>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default HomePages;
