import React from "react";

export default function RencanaKerja({ 
  fileUrl, // Hapus default value agar bisa dicek kosong atau tidak
  fileName 
}) {
  return (
    <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-5 sm:p-8">
      {/* Bagian judul dan deskripsi dibiarkan sesuai permintaan */}
      <h2 className="text-[#B5302D] font-semibold text-lg mb-3">
        Informasi SOP Rencana Kegiatan Operasional dari Kebun
      </h2>
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
        Berikut ini SOP rencana kegiatan kebun yang telah dibuat pekebun mencangkup kebutuhan sarana,
        estimasi produksi, pemeliharaan, pengendalian OPT, panen, pengangkutan, pemeliharaan sarana,
        dan rencana peremajaan.
      </p>

      {/* Conditional Rendering: Cek apakah fileUrl ada datanya */}
      {fileUrl ? (
        /* TAMPILAN JIKA DATA FILE ADA (Tampilan Sekarang) */
        <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
          <svg
            className="w-10 h-10 text-red-500 mr-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
          
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-gray-800 truncate">
              {fileName || "Dokumen SOP.pdf"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Klik tombol di samping untuk melihat dokumen lengkap
            </p>
          </div>

          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 px-5 py-2 text-sm font-medium text-white bg-[#B5302D] rounded-lg hover:bg-red-800 transition-colors shadow-sm whitespace-nowrap"
          >
            Buka File
          </a>
        </div>
      ) : (
        /* TAMPILAN JIKA DATA FILE KOSONG (Simulasi Kosong) */
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <svg 
            className="w-12 h-12 text-gray-400 mb-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium text-gray-500">
            Belum ada dokumen yang tersedia
          </p>
          <p className="text-xs text-gray-400 mt-1 text-center max-w-xs">
            Dokumen SOP rencana kegiatan operasional akan muncul di sini setelah diunggah oleh kebun.
          </p>
        </div>
      )}
    </div>
  );
}