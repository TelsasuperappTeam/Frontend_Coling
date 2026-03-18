import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
const FAQItem = ({ item, index, openIndex, toggleFAQ }) => {
  const isOpen = openIndex === index;

  return (
    <div
      className={`border-b ${
        isOpen ? "border-[#EF8523]" : "border-gray-200"
      } last:border-b-0`}
    >
      <button
        onClick={() => toggleFAQ(index)}
        className="w-full text-left px-4 sm:px-6 py-3 flex justify-between items-center gap-4 focus:outline-none"
      >
        {/* Pertanyaan */}
        <span
          className={`flex-1 text-sm font-medium transition-colors duration-300 ${
            isOpen ? "text-[#B5302D]" : "text-gray-800 hover:text-[#EF8523]"
          }`}
        >
          {item.q}
        </span>

        <i
          className={`ri-arrow-down-s-line text-lg transition-transform duration-300 ${
            isOpen ? "rotate-180 text-[#B5302D]" : "text-gray-500"
          }`}
        ></i>
      </button>

      {/* Jawaban (animasi buka/tutup) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              transition: { duration: 0.3, ease: "easeInOut" },
            }}
            exit={{
              opacity: 0,
              height: 0,
              transition: { duration: 0.2, ease: "easeInOut" },
            }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-4 text-sm text-gray-700 leading-relaxed bg-white border-l-4 border-[#EF8523] rounded-sm">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 🔹 Komponen utama FAQ
const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

// Data FAQ
const faqs = [
  {
    category: "Pertanyaan Umum",
    items: [
      {
        q: "Apa itu TELSA Super App?",
        a: "TELSA Super App adalah platform digital terintegrasi untuk mendukung pengelolaan perkebunan sawit rakyat, mulai dari pencatatan kegiatan kebun, perencanaan panen dan tanam, alur logistik, hingga pengelolaan dokumen dan proses sertifikasi ISPO secara sistematis dan transparan.",
      },
      {
        q: "Siapa saja yang bisa menggunakan TELSA?",
        a: "TELSA dirancang untuk petani sawit rakyat, kelompok tani atau koperasi, kebun atau kantor pengelola, pihak logistik, pabrik kelapa sawit, serta admin sebagai pengelola dan pengawas sistem.",
      },
      {
        q: "Apakah TELSA hanya untuk individu atau bisa digunakan secara kolektif?",
        a: "TELSA dapat digunakan oleh petani secara perorangan maupun secara kolektif melalui kelompok tani atau koperasi, terutama untuk mendukung pengelolaan kebun bersama dan sertifikasi ISPO secara kolektif.",
      },
      {
        q: "Apa saja tipe pengguna yang ada di TELSA dan apa tugas masing-masing?",
        a: "TELSA memiliki beberapa tipe pengguna yang saling terhubung dalam satu ekosistem.\n\nPetani berperan sebagai pengelola utama kebun. Petani dapat merencanakan panen dan tanam, mencatat kegiatan perawatan kebun, memantau OPT, mencatat hasil panen dan produktivitas, melihat harga sawit terkini, memantau penjualan, serta memantau status pengiriman hasil panen.\n\nKebun atau kantor pengelola berfungsi sebagai validator dan koordinator. Kebun memvalidasi rencana panen dan tanam petani, menentukan dan mengelola logistik, memantau kapasitas pabrik, melihat permintaan dan harga sawit, serta mengelola dan memantau kelengkapan dokumen sertifikasi ISPO.\n\nPabrik berperan pada proses hilir. Pabrik mencatat penerimaan sawit, mengelola kapasitas pengolahan dan penyimpanan, memantau transaksi, serta mencatat hasil dan limbah pengolahan sawit.\n\nLogistik bertugas menangani distribusi. Logistik menerima atau menolak permintaan pengiriman, melihat rincian muatan, memantau pengiriman yang disetujui, dan menyesuaikan jadwal dengan rencana panen.\n\nAdmin bertugas mengelola sistem secara keseluruhan, memantau seluruh data stakeholder, mengelola akun pengguna, serta memastikan alur sistem berjalan sesuai aturan.",
      },
      {
        q: "Apakah TELSA mendukung sertifikasi ISPO secara individu dan kolektif?",
        a: "Ya. TELSA mendukung sertifikasi ISPO baik untuk petani individu maupun secara kolektif melalui kelompok tani atau koperasi, dengan sistem pencatatan dan validasi yang terintegrasi.",
      },
    ],
  },
  {
    category: "Pendaftaran & Akun",
    items: [
      {
        q: "Bagaimana cara mendaftar di TELSA?",
        a: "Pendaftaran dilakukan melalui menu pendaftaran di aplikasi atau website TELSA dengan mengisi data diri sesuai peran pengguna dan melengkapi dokumen awal yang dibutuhkan.",
      },
      {
        q: "Apakah setiap pengguna harus diverifikasi?",
        a: "Ya. Setiap akun akan melalui proses verifikasi. Untuk logistik serta pabrik diverifikasi langsung oleh admin. Untuk kebun menunggu verifikasi dari admin, petani akan diverifikasi oleh kebun.",
      },
      {
        q: "Apakah penggunaan TELSA berbayar?",
        a: "Saat ini TELSA dapat digunakan secara gratis oleh petani sawit rakyat dan koperasi sebagai bagian dari dukungan terhadap proses sertifikasi ISPO.",
      },
      {
        q: "Bagaimana jika saya lupa password akun?",
        a: "Anda dapat menggunakan fitur Lupa Password di halaman login. Instruksi pemulihan akun akan dikirimkan ke email yang terdaftar.",
      },
    ],
  },
  {
    category: "Fitur & Layanan",
    items: [
      {
        q: "Apa saja fitur utama TELSA?",
        a: "Fitur utama TTELSA meliputi manajemen kebun digital, perencanaan panen dan tanam, pencatatan perawatan kebun, pemantauan produksi, pengelolaan logistik dan distribusi, pencatatan transaksi, serta pengelolaan dan pemantauan progres sertifikasi ISPO.",
      },
      {
        q: "Bisakah saya memantau progres sertifikasi ISPO melalui TELSA?",
        a: "Bisa. Petani dan kebun dapat memantau progres persentase sertifikasi ISPO melalui dashboard, termasuk status kelengkapan dokumen dan tahapan yang sudah maupun belum terpenuhi.",
      },
      {
        q: "Apakah data kebun digunakan sebagai bukti pendukung ISPO?",
        a: "Ya. Data aktivitas kebun yang dicatat di TELSA dapat digunakan sebagai rekam jejak dan bukti pendukung dalam proses pemenuhan persyaratan sertifikasi ISPO.",
      },
    ],
  },
  {
    category: "Keamanan & Dukungan Teknis",
    items: [
      {
        q: "Bagaimana TELSA melindungi data pribadi dan data kebun?",
        a: "TELSA menerapkan pengamanan data berbasis hak akses pengguna dan sistem penyimpanan yang dirancang untuk menjaga kerahasiaan serta integritas data.",
      },
      {
        q: "Siapa yang bisa saya hubungi jika mengalami kendala teknis?",
        a: "Jika mengalami kendala teknis, Anda dapat menghubungi tim dukungan TELSAmelalui email hi.telsasuperapp@gmail.com untuk mendapatkan bantuan.",
      },
    ],
  },
];


  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="text-xs sm:text-sm font-semibold text-[#EF8523] uppercase tracking-wider">
            Ada Pertanyaan?
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-gray-600">
            Temukan jawaban dari pertanyaan seputar TELSA Super App di sini.
          </p>
        </div>

        {/* Daftar FAQ */}
        <div className="space-y-8">
          {faqs.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h2 className="text-lg sm:text-xl font-bold text-[#B5302D] mb-3">
                {section.category}
              </h2>
              <div className="bg-[#fff7f0] rounded-lg shadow-sm overflow-hidden">
                {section.items.map((item, itemIndex) => {
                  const uniqueIndex = `${sectionIndex}-${itemIndex}`;
                  return (
                    <FAQItem
                      key={uniqueIndex}
                      item={item}
                      index={uniqueIndex}
                      openIndex={openIndex}
                      toggleFAQ={toggleFAQ}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
