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
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  User,
  MapPin,
  Calendar,
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
      showToast.error("Terjadi kesalahan jaringan. Gagal menghubungi server.");
    } finally {
      setIsLoadingTrack(false);
    }
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
              alt="Tampilan Aplikasi PalmaOne-08"
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
            <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-4xl font-extrabold leading-snug drop-shadow-lg mb-3">
              Selamat Datang di Platform ISPO PalmaOne-08
            </h1>

            <p className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed max-w-md mx-auto md:mx-0">
              Platform ERP Untuk Pemenuhan Sertifikasi ISPO untuk Perusahaan
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
                <img
                  src={FiturImage}
                  alt="Fitur Unggulan PalmaOne-08"
                  loading="lazy"
                  className="relative w-full max-w-[260px] sm:max-w-sm rounded-2xl shadow-2xl object-cover"
                />
              </div>

              <p className="text-gray-600 mb-5 md:mb-8 text-sm md:text-lg leading-relaxed pl-3 md:pl-0">
                <strong>Platform ISPO PalmaOne-08</strong> adalah sistem ERP
                untuk mengelola pencatatan perkebunan, transability sawit,
                koordinasi antar pelaku sawit, dan pemenuhan sertifikasi ISPO
                dengan lebih mudah, cepat, dan efisien.
              </p>

              <ul className="space-y-3 md:space-y-4 pl-4 md:pl-0">
                {[
                  "<strong>100% pemenuhan persyaratan ISPO</strong> dalam sistem PalmaOne-08.",
                  "<strong>Otomatisasi dokumen</strong> berdasarkan aktivitas perkebunan.",
                  "Didesain khusus untuk <strong>perusahaan</strong> dan pendamping stakeholder lainnya.",
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
                alt="Fitur Unggulan Platform ISPO PalmaOne-08"
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
      <AnimatedSection
        id="cek-produksi"
        className="scroll-mt-24 md:scroll-mt-28 py-14 md:py-20 bg-gray-50 flex justify-center"
      >
        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 text-center flex flex-col items-center">
          <h2 className="text-xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-6">
            Lacak & Verifikasi Kode Produksi
          </h2>

          <p className="text-sm md:text-lg text-gray-600 mb-6 md:mb-10 leading-relaxed max-w-2xl mx-auto">
            Masukkan kode produksi untuk memverifikasi keaslian dan melihat
            detail rantai pasok.
          </p>

          {/* FORM INPUT DINAMIS */}
          <form
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 w-full max-w-2xl mx-auto"
            onSubmit={handleCheckCodeSubmit}
          >
            <input
              type="text"
              value={productionCode}
              onChange={(e) => setProductionCode(e.target.value)}
              placeholder="Masukkan Kode Produksi CPO..."
              className="w-full sm:flex-1 px-5 py-3 md:px-6 md:py-4 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500 shadow-sm text-sm md:text-lg outline-none"
              required
            />
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
            <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
              {/* CONTAINER UTAMA MODAL (Tinggi di-set max 75vh di mobile agar tidak penuhi layar) */}
              <div className="relative w-full max-w-3xl bg-white shadow-2xl rounded-[20px] sm:rounded-[30px] flex flex-col max-h-[75vh] sm:max-h-[85vh] overflow-hidden animate-in zoom-in-95 text-left">
                {/* 1. STICKY HEADER */}
                <div className="sticky top-0 z-[70] bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3.5 sm:px-8 sm:py-5 flex justify-between items-center shrink-0 shadow-sm text-left">
                  <div className="flex items-center gap-2.5 sm:gap-4">
                    <div className="p-1.5 sm:p-3 bg-green-50 rounded-full border border-green-100 shrink-0">
                      <CheckCircle2 className="w-5 h-5 sm:w-7 sm:h-7 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-xl font-bold text-gray-900 tracking-tight leading-none">
                        Produk Terverifikasi Valid
                      </h4>
                      <p className="text-[9px] sm:text-xs text-green-700 font-medium mt-1">
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
                      <h5 className="text-[9px] sm:text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 mb-3 sm:mb-4">
                        01. Ringkasan Produksi Pabrik
                      </h5>
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
                      <h5 className="text-[9px] sm:text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 mb-3 sm:mb-4">
                        02. Komposisi Hasil Olahan (Output)
                      </h5>
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
                      <h5 className="text-[9px] sm:text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 mb-3 sm:mb-4">
                        03. Asal Usul Rantai Pasok (Hulu)
                      </h5>

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
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-100 shadow-sm text-left">
                                  <div className="col-span-2">
                                    <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1">
                                      Lokasi Kebun / Titik Jemput
                                    </p>
                                    <p className="text-[10px] sm:text-xs font-semibold text-gray-700 line-clamp-2">
                                      {meta.alamat_pickup_teks || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1">
                                      Varietas
                                    </p>
                                    <p className="text-[10px] sm:text-xs font-bold text-gray-800 line-clamp-1">
                                      {meta.jenis_varietas_gabungan || "-"}
                                    </p>
                                  </div>
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
                                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                                                  <span className="bg-gray-50 text-gray-600 text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium border border-gray-200 flex items-center gap-1">
                                                    <Sprout className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />{" "}
                                                    {petani.jenis_sawit || "-"}{" "}
                                                    /{" "}
                                                    {petani.nama_varietas ||
                                                      "-"}
                                                  </span>
                                                  <span className="bg-green-50 text-green-700 text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium border border-green-100 flex items-center gap-1">
                                                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{" "}
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
        className="scroll-mt-24 md:scroll-mt-28 py-14 md:py-20 bg-white"
      >
        <div className="container mx-auto px-4 md:px-28 grid md:grid-cols-2 gap-10 md:gap-12 items-start">
          {/* Kolom kiri */}
          <div className="md:sticky md:top-28 text-center md:text-left">
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
