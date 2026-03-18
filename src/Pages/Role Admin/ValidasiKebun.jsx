import React, { useEffect, useState } from "react";
import { API_ENDPOINTS, ROLES, getFileUrl } from "../../config/constants";
import {
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  FileText,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function ValidasiStakeholderKebun() {
  const [dataKebun, setDataKebun] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPendingKebun = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.USER.ADMIN.GET_ALL_USERS, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Gagal mengambil data dari server");

        const rawData = await res.json();

        // --- PERBAIKAN ---
        let users = [];
        if (Array.isArray(rawData)) {
          users = rawData;
        } else if (rawData && Array.isArray(rawData.data)) {
          users = rawData.data;
        }
        // -----------------

        // Sekarang aman menggunakan .filter
        const pendingKebun = users.filter(
          (u) => u.role === ROLES.KEBUN && u.status === "pending",
        );

        setDataKebun(pendingKebun);
      } catch (err) {
        console.error("Gagal mengambil data kebun:", err);
        setDataKebun([]); // Set kosong jika gagal
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPendingKebun();
  }, [token]);

  const handleValidation = async (userId, isApproved) => {
    const confirmMsg = isApproved
      ? "Setujui pendaftaran stakeholder kebun ini?"
      : "Tolak dan hapus permintaan pendaftaran ini?";

    if (!window.confirm(confirmMsg)) return;

    try {
      const url = API_ENDPOINTS.USER.ADMIN.MANAGE_KEBUN(userId);

      // FIX: Gunakan kunci "action" (sesuai Body embed=True di Backend)
      const payload = {
        action: isApproved ? "approve" : "reject",
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Debugging: Lihat pesan error dari FastAPI jika masih gagal
        const errorDetail = await res.json();
        console.error("Detail Error 422:", errorDetail);
        throw new Error("Gagal memproses validasi");
      }

      setDataKebun((prev) => prev.filter((item) => item.id !== userId));
      alert(
        isApproved
          ? "Stakeholder berhasil disetujui!"
          : "Permintaan telah ditolak.",
      );
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER SECTION (Responsif) --- */}
        <header className="flex flex-row items-center gap-3 md:gap-4 mb-6 md:mb-10">
          <div className="bg-[#B5302D] p-2 md:p-3 rounded-lg shadow-lg shrink-0">
            <ShieldCheck className="text-white w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-[#B5302D]">
              Validasi Stakeholder Kebun
            </h1>
            <p className="text-gray-500 text-xs md:text-sm mt-0.5">
              Verifikasi pendaftaran akun kebun baru dalam sistem
            </p>
          </div>
        </header>

        {/* --- WRAPPER UTAMA --- */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          {/* Top Bar (Jumlah Antrian) */}
          <div className="bg-[#EF8523] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2 text-white">
              <FileText size={20} />
              <span className="font-bold tracking-wider text-sm md:text-base">
                Antrian Validasi ({dataKebun.length})
              </span>
            </div>
          </div>

          {/* --- LOGIKA UTAMA: LOADING & EMPTY STATE --- */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-[#B5302D]" />
                <span className="text-gray-500 font-medium">
                  Menyelaraskan data backend...
                </span>
              </div>
            </div>
          ) : dataKebun.length === 0 ? (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="bg-gray-100 p-4 rounded-full">
                  <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">
                  Tidak ada permintaan validasi saat ini.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Tampilan Mobile (Card View) */}
              <div className="grid grid-cols-1 md:hidden gap-4 p-4">
                {dataKebun.map((row) => (
                  <div
                    key={row.id}
                    className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {row.nama_lengkap}
                        </h3>
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">
                          {row.role}
                        </span>
                      </div>
                    </div>

                    {/* --- DATA TAMBAHAN UNTUK MOBILE --- */}
                    <div className="space-y-2 border-t border-gray-50 pt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail size={14} className="text-gray-400" />
                        {row.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone size={14} className="text-gray-400" />
                        {row.no_hp}
                      </div>

                      {/* LINK AKTA UNTUK MOBILE */}
                      <div className="flex items-center gap-2 text-xs">
                        <FileText size={14} className="text-gray-400" />
                        {row.akta_pendiri_url ? (
                          <a
                            href={getFileUrl(row.akta_pendiri_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 font-medium underline"
                          >
                            Lihat Dokumen Akta
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">
                            Akta tidak tersedia
                          </span>
                        )}
                      </div>
                    </div>
                    {/* ---------------------------------- */}

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleValidation(row.id, true)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white py-2 rounded-lg font-bold text-xs"
                      >
                        <CheckCircle size={14} /> Setuju
                      </button>
                      <button
                        onClick={() => handleValidation(row.id, false)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-white text-gray-600 border border-gray-300 py-2 rounded-lg font-bold text-xs"
                      >
                        <XCircle size={14} /> Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. TAMPILAN DESKTOP       */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <Th>ID Kebun</Th>
                      <Th>Nama Lembaga</Th>
                      <Th>Kontak</Th>
                      <Th icon={<FileText size={14} />}>Dokumen Akta</Th>
                      <Th className="text-center">Aksi</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dataKebun.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-orange-50/30 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono text-xs font-bold border border-gray-200">
                            {row.kebun_id || "N/A"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-[#B5302D]">
                              <User size={16} />
                            </div>
                            <span className="font-semibold text-gray-800">
                              {row.nama_lengkap}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Mail size={14} className="text-gray-400" />{" "}
                              {row.email}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Phone size={14} className="text-gray-400" />{" "}
                              {row.no_hp}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {row.akta_pendiri_url ? (
                            <a
                              href={getFileUrl(row.akta_pendiri_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                              <FileText size={16} /> Lihat Dokumen
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">
                              Tidak ada file
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => handleValidation(row.id, true)}
                              className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-green-700 transition-all shadow-md active:scale-95"
                              title="Setujui"
                            >
                              <CheckCircle size={14} /> Setuju
                            </button>
                            <button
                              onClick={() => handleValidation(row.id, false)}
                              className="flex items-center gap-1.5 bg-white text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-gray-50 hover:text-red-600 transition-all active:scale-95"
                              title="Tolak"
                            >
                              <XCircle size={14} /> Tolak
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
const Th = ({ children, className = "" }) => (
  <th
    className={`px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);
