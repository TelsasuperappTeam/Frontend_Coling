// src/config/constants.js
// -----------------------------------------------------------------------------
// Pusat konfigurasi frontend: role, base URLs untuk setiap microservice,
// dan daftar endpoint publik/protected yang dipakai oleh frontend.
// Jika backend berpindah domain/path, ubah API_BASE_URLS saja.
// -----------------------------------------------------------------------------

// ======================= ROLE PENGGUNA =======================
export const ROLES = {
  ADMIN: "admin",
  MANDOR: "petani", // ubah "mandor" menjadi "petani" jika BE tetap menamakan role ini untuk petani
  KEBUN: "kebun",
  ESTATE_MANAGER: "estate_manager",
  GENERAL_MANAGER_DISTRIK: "general_manager_distrik",
  TRANSPORT: "logistik",
  PABRIK: "pabrik",
};

// ======================= BASE URL =======================
// Karena backend MAHAR sudah disatukan (merged), gunakan satu alamat pusat.
// URL Default (Fallback jika .env tidak terbaca)
const DEFAULT_SERVER_URL = "https://api.company.telsa.cloud";

export const API_BASE_URLS = {
  // Mengambil dari .env (atau .env.local jika ada).
  // Jika string kosong, fallback ke DEFAULT_SERVER_URL.
  AUTH: import.meta.env.VITE_API_AUTH_URL || DEFAULT_SERVER_URL,
  USER: import.meta.env.VITE_API_USER_URL || DEFAULT_SERVER_URL,
  FARM: import.meta.env.VITE_API_FARM_URL || DEFAULT_SERVER_URL,
  ISPO: import.meta.env.VITE_API_ISPO_URL || DEFAULT_SERVER_URL,
};

// ======================= ENDPOINT API =======================
export const API_ENDPOINTS = {
  // --- SERVICE AUTENTIKASI ---
  AUTH: {
    LOGIN: `${API_BASE_URLS.AUTH}/auth/login`,
    LOGOUT: `${API_BASE_URLS.AUTH}/auth/logout`,
    ME: `${API_BASE_URLS.AUTH}/auth/me`,
    OTP_REQUEST: `${API_BASE_URLS.AUTH}/auth/otp/request`,
    OTP_VERIFY: `${API_BASE_URLS.AUTH}/auth/otp/verify`,
    GANTI_PASSWORD: `${API_BASE_URLS.AUTH}/auth/ganti-password`,
    LUPA_PASSWORD: `${API_BASE_URLS.AUTH}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URLS.AUTH}/auth/reset-password`,
  },

  // --- SERVICE USER (PROFIL & STAKEHOLDER) ---
  USER: {
    REGISTER: `${API_BASE_URLS.USER}/users/register`,
    ME: `${API_BASE_URLS.USER}/users/me`,
    UPDATE_ME: `${API_BASE_URLS.USER}/users/me/profile`,

    // --- SERVICE ADMIN (pengolahan seluruh stakeholder) ---
    ADMIN: {
      GET_ALL_USERS: `${API_BASE_URLS.USER}/admin/users`,
      GET_USER_BY_ID: (userId) => `${API_BASE_URLS.USER}/admin/users/${userId}`,
      GET_AUDIT_LOG: `${API_BASE_URLS.USER}/admin/audit-logs`,

      // Patch Update: Digunakan untuk edit data, pengosongan data (null), dan apus data pengguna
      UPDATE_USER: (userId) => `${API_BASE_URLS.USER}/admin/users/${userId}`,
      DELETE_USER: (userId) => `${API_BASE_URLS.USER}/admin/users/${userId}`,
      // Admin-specific (Pengelolaan Kebun)
      MANAGE_KEBUN: (profileId) =>
        `${API_BASE_URLS.USER}/users/admin/kebun/${profileId}/manage`,
    },

    // ROLE KEBUN
    KEBUN: {
      // Kebun ACC Relasi Petani
      PENDING_PETANI: `${API_BASE_URLS.USER}/users/kebun/me/pending-petani`,
      MANAGE_PETANI: (petaniId) =>
        `${API_BASE_URLS.USER}/users/kebun/petani/${petaniId}/manage`,

      // Melihat data diri petani relasi kebun
      PETANI_MEMBERS: `${API_BASE_URLS.USER}/users/kebun/me/petani-members`,

      PENGURUS: {
        // GET & POST (Tambah & Lihat Semua)
        MAIN: `${API_BASE_URLS.USER}/users/kebun/pengurus`,
        // PATCH & DELETE (Edit & Hapus by ID)
        BY_ID: (id) => `${API_BASE_URLS.USER}/users/kebun/pengurus/${id}`,
      },
    },
  },

  // --- SERVICE FARM  ---
  FARM: {
    // === FITUR PETANI ===
    PETANI: {
      // MANAJEMEN LAHAN & WIZARD
      LAHAN: {
        // [GET] Cek draft
        CHECK_DRAFT: `${API_BASE_URLS.FARM}/farm/me/lahan/check-draft`,
        // [POST] Mulai Proses (Step 0)
        START_PROCESS: `${API_BASE_URLS.FARM}/farm/me/lahan/proses`,
        // [PATCH] Wizard Steps
        STEP_1: (id) =>
          `${API_BASE_URLS.FARM}/farm/me/lahan/proses/${id}/step1`,
        STEP_2: (id) =>
          `${API_BASE_URLS.FARM}/farm/me/lahan/proses/${id}/step2`,
        STEP_3: (id) =>
          `${API_BASE_URLS.FARM}/farm/me/lahan/proses/${id}/step3`,
        // Ini sebelumnya salah nama di FE, harusnya STEP_SERTIFIKAT (bukan JENIS_SERTIFIKAT)
        STEP_SERTIFIKAT: (id) =>
          `${API_BASE_URLS.FARM}/farm/me/lahan/proses/${id}/sertifikat`,
        STEP_4: (id) =>
          `${API_BASE_URLS.FARM}/farm/me/lahan/proses/${id}/step4`,
        STEP_5: (id) =>
          `${API_BASE_URLS.FARM}/farm/me/lahan/proses/${id}/step5`,
        // [POST] Upload & Finalisasi
        UPLOAD_DOC: (id, type) =>
          `${API_BASE_URLS.FARM}/farm/me/lahan/proses/${id}/dokumen/${type}`,
        FINALISASI: (id) =>
          `${API_BASE_URLS.FARM}/farm/me/lahan/proses/${id}/finalisasi`,
      },

      // INVENTARIS
      INVENTARIS: {
        // Peralatan
        GET_PERALATAN: `${API_BASE_URLS.FARM}/farm/me/inventaris/peralatan`,
        ADD_PERALATAN: `${API_BASE_URLS.FARM}/farm/me/inventaris/peralatan`,
        DELETE_PERALATAN: (id) =>
          `${API_BASE_URLS.FARM}/farm/me/inventaris/peralatan/${id}`,
        KEMBALIKAN_ALAT: `${API_BASE_URLS.FARM}/farm/me/inventaris/peralatan/kembalikan`,

        // Bibit
        GET_BIBIT: `${API_BASE_URLS.FARM}/farm/me/inventaris/bibit`,
        ADD_BIBIT: `${API_BASE_URLS.FARM}/farm/me/inventaris/bibit`,

        // Pupuk
        GET_PUPUK: `${API_BASE_URLS.FARM}/farm/me/inventaris/pupuk`,
        ADD_PUPUK: `${API_BASE_URLS.FARM}/farm/me/inventaris/pupuk`,

        // Pestisida
        GET_PESTISIDA: `${API_BASE_URLS.FARM}/farm/me/inventaris/pestisida`,
        ADD_PESTISIDA: `${API_BASE_URLS.FARM}/farm/me/inventaris/pestisida`,

        // Histori & Transaksi
        GET_HISTORI_STOK: `${API_BASE_URLS.FARM}/farm/me/inventaris/histori`,
        GET_RIWAYAT_BELANJA: `${API_BASE_URLS.FARM}/farm/me/transaksi/pembelian`,
      },

      // RENCANA TANAM
      ADD_RENCANA_TANAM: `${API_BASE_URLS.FARM}/farm/me/blok`,
      RESUBMIT_RENCANA_TANAM: (id) =>
        `${API_BASE_URLS.FARM}/farm/me/blok/${id}/resubmit`,
      AMBIL_RENCANA_TANAM: `${API_BASE_URLS.FARM}/farm/me/blok`,

      // MONITORING & PANEN
      ACTIVITY: {
        // READ (GET)
        GET_BLOK_DETAIL: (blokId) =>
          `${API_BASE_URLS.FARM}/farm/me/blok/${blokId}`,

        // CREATE (POST)
        // 1. Sanitasi / Kebersihan
        ADD_MONITORING_SANITASI: (blokId) =>
          `${API_BASE_URLS.FARM}/farm/me/monitoring/${blokId}/kebersihan`,

        // 2. Cover Crop
        ADD_MONITORING_COVER_CROP: (blokId) =>
          `${API_BASE_URLS.FARM}/farm/me/monitoring/${blokId}/cover-crop`,

        // 3. Piringan
        ADD_PIRINGAN_KONDISI: (blokId) =>
          `${API_BASE_URLS.FARM}/farm/me/monitoring/${blokId}/piringan-kondisi`,

        ADD_PIRINGAN_AKTIVITAS: () =>
          `${API_BASE_URLS.FARM}/farm/me/monitoring/piringan-aktivitas`,

        // 4. Pemupukan
        ADD_MONITORING_PUPUK: (blokId) =>
          `${API_BASE_URLS.FARM}/farm/me/monitoring/${blokId}/pupuk`,

        // 5. Pestisida
        ADD_MONITORING_PESTISIDA: (blokId) =>
          `${API_BASE_URLS.FARM}/farm/me/monitoring/${blokId}/pestisida`,

        // 6. Panen
        // GET List Rencana Panen (Kartu Jadwal)
        // Opsional query: ?siklus_id={id}
        GET_RENCANA_PANEN_LIST: (blokId, siklusId = null) => {
          let url = `${API_BASE_URLS.FARM}/farm/me/blok/${blokId}/rencana-panen`;
          if (siklusId) url += `?siklus_id=${siklusId}`;
          return url;
        },

        // POST Buat Rencana Panen Baru
        ADD_RENCANA_PANEN: (blokId) =>
          `${API_BASE_URLS.FARM}/farm/me/rencana/${blokId}`,

        // POST Tambah Catatan Realisasi (Harian/Per Pemanen)
        ADD_REALISASI_PANEN: `${API_BASE_URLS.FARM}/farm/me/rencana-panen/realisasi`,

        // POST Finalisasi / Tutup Panen
        // Menggunakan query param ?rencana_id={id}
        FINALISASI_PANEN: (rencanaId) =>
          `${API_BASE_URLS.FARM}/farm/me/rencana-panen/hasil?rencana_id=${rencanaId}`,

        // 7. Arsip & Siklus (History)
        // GET List Arsip (Dropdown Siklus)
        GET_ARSIP_SIKLUS_LIST: (blokId) =>
          `${API_BASE_URLS.FARM}/farm/me/blok/${blokId}/list-arsip`,

        // GET Detail Arsip per Siklus
        GET_ARSIP_SIKLUS_DETAIL: (blokId) =>
          `${API_BASE_URLS.FARM}/farm/me/blok/${blokId}/arsip/{nomor_siklus}`,
      },

      // RENCANA KERJA (TO DO LIST HARIAN PETANI)
      RENCANA_KERJA: {
        GET_LIST: `${API_BASE_URLS.FARM}/farm/me/dashboard/daily-tasks`,

        // Menambah kegiatan baru (POST)
        ADD: `${API_BASE_URLS.FARM}/farm/me/rencana-kerja`,

        // Update status (PATCH) -> ID disisipkan di URL, status via Query Param
        UPDATE_STATUS: (id) =>
          `${API_BASE_URLS.FARM}/farm/me/rencana-kerja/${id}/status`,

        // Hapus kegiatan (DELETE)
        DELETE: (id) => `${API_BASE_URLS.FARM}/farm/me/rencana-kerja/${id}`,
      },
    },


    // === FITUR KEBUN ===
    KEBUN: {
      // APPROVAL
      APPROVAL: {
        // Blok Tanam
        GET_PENDING_BLOK: `${API_BASE_URLS.FARM}/farm/kebun/blok/pending`,

        APPROVE_BLOK: (blokId) =>
          `${API_BASE_URLS.FARM}/farm/kebun/blok/${blokId}/approval`,

        // Rencana Panen
        GET_RENCANA_PANEN_PENDING: `${API_BASE_URLS.FARM}/farm/kebun/kebun/approval-list`,

        ACTION_RENCANA_PANEN: (rencanaId) =>
          `${API_BASE_URLS.FARM}/farm/kebun/approval/${rencanaId}`,
      },


      // INVENTARIS
      INVENTARIS: {
        // Stok agregat
        GET_STOK: (kategori) =>
          `${API_BASE_URLS.FARM}/farm/kebun/inventaris?kategori=${kategori}`,

        // Peralatan
        GET_PERALATAN: `${API_BASE_URLS.FARM}/farm/kebun/inventaris/peralatan`,

        // [BARU] Tambahkan ini agar sesuai dengan BE (POST /inventaris/peralatan)
        ADD_PERALATAN: `${API_BASE_URLS.FARM}/farm/kebun/inventaris/peralatan`,

        // Note: Pastikan di BE ada endpoint update/PATCH jika ingin memakai ini
        UPDATE_PERALATAN: (id) =>
          `${API_BASE_URLS.FARM}/farm/kebun/inventaris/peralatan/${id}`,

        // Bibit
        GET_BIBIT: `${API_BASE_URLS.FARM}/farm/kebun/inventaris/bibit`,
        ADD_BIBIT: `${API_BASE_URLS.FARM}/farm/kebun/inventaris/bibit`,
        DELETE_BIBIT: (id) =>
          `${API_BASE_URLS.FARM}/farm/kebun/inventaris/bibit/${id}`,

        // Pupuk
        GET_PUPUK: `${API_BASE_URLS.FARM}/farm/kebun/inventaris/pupuk`,
        ADD_PUPUK: `${API_BASE_URLS.FARM}/farm/kebun/inventaris/pupuk`,
        DELETE_PUPUK: (id) =>
          `${API_BASE_URLS.FARM}/farm/kebun/inventaris/pupuk/${id}`,

        // Pestisida
        GET_PESTISIDA: `${API_BASE_URLS.FARM}/farm/kebun/inventaris/pestisida`,
        ADD_PESTISIDA: `${API_BASE_URLS.FARM}/farm/kebun/inventaris/pestisida`,
        DELETE_PESTISIDA: (id) =>
          `${API_BASE_URLS.FARM}/farm/kebun/inventaris/pestisida/${id}`,
      },

      
      // TRANSAKSI
      TRANSAKSI: {
        // input harga TBS berdasarkan SK pemerintah
        HARGA_TBS: `${API_BASE_URLS.FARM}/farm/kebun/harga-tbs/input`,

        // Mengambil data grafik harga TBS
        // belum dipakai
        GET_HARGA_TBS_GRAPH: `${API_BASE_URLS.FARM}/farm/kebun/harga-tbs/grafik/{kebun_id}`,

        // Kebun jual atau pinjamkan inventaris ke petani relasi
        JUAL: `${API_BASE_URLS.FARM}/farm/kebun/transaksi/jual`,
        PINJAMKAN: `${API_BASE_URLS.FARM}/farm/kebun/transaksi/pinjamkan`,
      },
    },
  },

  // --- SERVICE ISPO  ---
  ISPO: {
    // (GET) Audit Kekurangan Dokumen (Role petani dan kebun) jadi mengembalikan daftar dokumen ISPO yang belum terpenuhi
    // belum dipakai
    AUDIT_KEKURANGAN_DOKUMEN: `${API_BASE_URLS.ISPO}/ispo/documents/missing`,

    PETANI: {
      // (POST) Download dokumen rencana operasional ISPO di Halaman Pantau ISPO
      GENERATE_DOKUMEN_ISPO_OPERASIONAL: `${API_BASE_URLS.ISPO}/ispo/generate-dokumen/rencana-operasional`,
      // (GET) Progres ISPO Petani di Halaman Dashboard
      GET_PROGRES_ISPO_PETANI: `${API_BASE_URLS.ISPO}/ispo/progress`,

      //belum dipakai
      // Endpoint POST ajukan submission dokumen ISPO dari petani ke kebun
      AJUKAN_DOKUMEN_ISPO: `${API_BASE_URLS.ISPO}/ispo/submission/{id}/submit`,
    },
    KEBUN: {
      // Endpoint POST submission dokumen manual
      SUBMISSION: `${API_BASE_URLS.ISPO}/ispo/submission`,

      // belum dipakai
      // Melihat seluruh submission ISPO berstatus PENDING milik petani binaan
      GET_PETANI_PENDING_SUBMISSION_ISPO: `${API_BASE_URLS.ISPO}/ispo/kebun/pending-approvals`,

      // belum dipakai
      // Review Dokumen ISPO
      REVIEW_DOKUMEN_ISPO: `${API_BASE_URLS.ISPO}/ispo/submission/{id}/review`,
    },
  },
};

// ======================= HELPER UTILS  =======================
export const getFileUrl = (path = null, service = "USER") => {
  // Default ke USER
  if (!path) return null;
  if (path.startsWith("http")) return path;

  // Pilih base URL berdasarkan parameter service
  let baseUrl = API_BASE_URLS.USER;
  if (service === "FARM") baseUrl = API_BASE_URLS.FARM;
  if (service === "ISPO") baseUrl = API_BASE_URLS.ISPO;

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// ======================= PESAN NOTIFIKASI =======================
export const NOTIF_MESSAGES = {
  PASSWORD_NOT_MATCH: "Kata sandi dan verifikasi kata sandi tidak sama!",
  REGISTER_SUCCESS:
    "Pengajuan anda sedang kami proses dan akan dikirimkan ke email.",
  OTP_SENT: "Kode OTP telah dikirim ke email yang telah didaftarkan.",
  OTP_INVALID: "Kode OTP tidak valid atau sudah kadaluarsa.",
  PASSWORD_CHANGED: "Kata sandi anda berhasil diubah.",
  UPDATE_SUCCESS: "Data berhasil diperbarui.",
  UPDATE_FAILED: "Terjadi kesalahan saat memperbarui data.",
  UPLOAD_SUCCESS: "Dokumen berhasil diunggah.",
  SAVE_SUCCESS: "Data berhasil disimpan.",
  SUBMIT_SUCCESS: "Data berhasil diajukan.",
};
