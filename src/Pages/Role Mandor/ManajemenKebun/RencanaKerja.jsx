import React from "react";

export default function RencanaKerja() {
  const data = [
    { label: "Kebutuhan Sarana Produksi", value: "Contoh : Urea 500 kg, KCl 300 Kg, Pestisida 10 Liter" },
    { label: "Perkiraan Produksi", value: "Contoh : 12 Ton/Bulan" },
    { label: "Kegiatan Pemeliharaan Tanaman", value: "Contoh : Penunasan 2x setahun, pemupukan Maret/Juli/Nov" },
    { label: "Pengendalian OPT", value: "Contoh: Tikus (burung hantu), Gulma (herbisida)" },
    { label: "Panen dan Pengangkutan TBS", value: "Contoh : Panen mingguan, angkut ke PKS Mitra 2x seminggu" },
    { label: "Pemeliharaan Sarana Kebun", value: "Contoh : Drainase dibersihkan 6 bulanan, jalan produksi Juni" },
    { label: "Rencana Peremajaan", value: "Contoh : Tahun 2028, blok A 5 Ha, Benih DxP PPKS" },
  ];

  return (
    <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-5 sm:p-8">
      <h2 className="text-[#B5302D] font-semibold text-lg mb-3">
        Informasi SOP Rencana Kegiatan Operasional dari Kebun
      </h2>
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
        Berikut ini SOP rencana kegiatan kebun yang telah dibuat pekebun mencangkup kebutuhan sarana,
        estimasi produksi, pemeliharaan, pengendalian OPT, panen, pengangkutan, pemeliharaan sarana,
        dan rencana peremajaan.
      </p>

      <div className="space-y-5">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col">
            <label className="block font-semibold text-gray-800 mb-1 text-sm sm:text-base">
              {item.label}
            </label>
            <textarea
              value={item.value}
              readOnly
              rows={2}
              className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-700 text-sm sm:text-base resize-none overflow-hidden leading-relaxed focus:outline-none sm:whitespace-normal whitespace-pre-wrap"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
