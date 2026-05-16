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
  TRACEABILITY: import.meta.env.VITE_API_TRACEABILITY_URL || DEFAULT_SERVER_URL,
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

    // ROLE GM DISTRIK
    GMDistrik: {
      // Ambil daftar kebun di bawah GM Distrik
      GET_KEBUN_LIST: `${API_BASE_URLS.USER}/users/gm/me/kebun-list`,
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

        // PUT/PATCH Edit Rencana Panen (Resubmit)
        UPDATE_RENCANA_PANEN: (rencanaId) =>
          `${API_BASE_URLS.FARM}/farm/me/rencana-panen/${rencanaId}`,

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

        CEK_STATUS_SIKLUS: (blokId) =>
          `${API_BASE_URLS.FARM}/farm/me/blok/${blokId}/status-ganti-siklus`,

        BUAT_SIKLUS_BARU: (blokId) =>
          `${API_BASE_URLS.FARM}/farm/me/blok/${blokId}/siklus-baru`,
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

        // GET SEMUA RENCANA KERJA
        RENCANA_KERJA_ALL: `${API_BASE_URLS.FARM}/farm/me/rencana-kerja/all`,
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

    MARKETPLACE: {
      // --- TAHAP 1: KEBUTUHAN PABRIK ---
      // SUDAH [POST] Pabrik membuat pengumuman kebutuhan bahan baku
      CREATE_KEBUTUHAN: `${API_BASE_URLS.FARM}/farm/marketplace/kebutuhan`,

      // SUDAH [GET] Kebun & Pabrik melihat daftar kebutuhan yang sedang aktif (H s/d H+3)
      GET_KEBUTUHAN_AKTIF: `${API_BASE_URLS.FARM}/farm/marketplace/kebutuhan/aktif`,

      // SUDAH [PATCH] Pabrik mengedit rencana kebutuhan pada 1 HARI SPESIFIK
      UPDATE_KEBUTUHAN: (kebutuhanId) =>
        `${API_BASE_URLS.FARM}/farm/marketplace/kebutuhan/${kebutuhanId}`,

      // --- TAHAP 2: MATCHING & PENGAJUAN (KEBUN) ---
      // SUDAH [GET] Kebun mencari rencana panen petani yang cocok dengan spesifikasi/tanggal (Filter pintar)
      GET_MATCHING_PANEN: `${API_BASE_URLS.FARM}/farm/marketplace/matching`,

      // SUDAH [POST] Kebun menggabungkan rencana panen & mengirim ke Pabrik
      CREATE_GRUP_PENJUALAN: `${API_BASE_URLS.FARM}/farm/marketplace/grup-penjualan`,

      // --- TAHAP 3: REVIEW PABRIK ---
      // SUDAH [GET] Pabrik dan Kebun melihat daftar pengajuan/tawaran masuk dari Kebun
      GET_PENGAJUAN_MASUK: `${API_BASE_URLS.FARM}/farm/marketplace/pengajuan-masuk`,

      // SUDAH [GET] Pabrik dan Kebun melihat daftar pengajuan/tawaran masuk dari Kebun
      GET_RIWAYAT_PENGAJUAN: `${API_BASE_URLS.FARM}/farm/marketplace/riwayat-pengajuan`,

      // SUDAH [PATCH] Pabrik menyetujui/menolak pengajuan grup penjualan (Dynamic ID)
      ACTION_PENGAJUAN: (grupId) =>
        `${API_BASE_URLS.FARM}/farm/marketplace/pengajuan-masuk/${grupId}/action`,

      // [BARU] [GET] Menampilkan daftar Grup Penjualan yang siap dikirim (Untuk Dropdown Kebun)
      GET_DROPDOWN_SIAP_KIRIM: `${API_BASE_URLS.FARM}/farm/marketplace/grup-penjualan/dropdown/siap-kirim`,
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

      // (POST) Download dokumen rencana operasional ISPO di Halaman Pantau ISPO
      GENERATE_DOKUMEN_SPPL: `${API_BASE_URLS.ISPO}/ispo/generate-dokumen/laporan-sppl`,

      // (POST) Download dokumen rencana operasional ISPO di Halaman Pantau ISPO
      GENERATE_DOKUMEN_PENJUALAN: `${API_BASE_URLS.ISPO}/ispo/generate-dokumen/realisasi-penjualan`,

      // BELUMMMMMM Menarik Riwayat Penjualan utuh untuk ISPO
      GET_DOKUMEN_REALISASI_ISPO: (role, userId) =>
        `${API_BASE_URLS.TRACEABILITY}/logistik/traceability/dokumen-realisasi-ispo/user/${role}/${userId}`,

      // (GET) Progres ISPO Petani di Halaman Dashboard
      GET_PROGRES_ISPO_PETANI: `${API_BASE_URLS.ISPO}/ispo/progress`,

      // Endpoint POST ajukan submission dokumen ISPO dari petani ke kebun
      AJUKAN_DOKUMEN_ISPO: `${API_BASE_URLS.ISPO}/ispo/submission/{id}/submit`,
    },

    KEBUN: {
      // Melihat progress ISPO seluruh petani relasi kebun halaman kemitraan petani
      GET_PROGRES_ISPO_PETANI_NAUNGAN: `${API_BASE_URLS.ISPO}/ispo/kebun/petani/{petani_id}/progress`,

      // Endpoint POST submission dokumen manual
      SUBMISSION: `${API_BASE_URLS.ISPO}/ispo/submission`,

      // Melihat seluruh submission ISPO berstatus PENDING milik petani binaan
      GET_PETANI_PENDING_SUBMISSION_ISPO: `${API_BASE_URLS.ISPO}/ispo/kebun/pending-approvals`,

      // Review Dokumen ISPO TERIMA ATAU TOLAK ISPO PETANI
      REVIEW_DOKUMEN_ISPO: `${API_BASE_URLS.ISPO}/ispo/submission/{id}/review`,
    },
  },

  // --- SERVICE TRACEABILITY  ---
  TRACEABILITY: {
    LOGISTIK: {
      // --- KENDARAAN ---
      KENDARAAN: {
        // SUDAH [POST] Tambah kendaraan baru
        ADD: `${API_BASE_URLS.TRACEABILITY}/logistik/kendaraan`,
        // SUDAH [GET] Lihat daftar kendaraan
        GET_ALL: `${API_BASE_URLS.TRACEABILITY}/logistik/kendaraan`,
        // SUDAH [PATCH] Edit kendaraan by ID
        UPDATE: (kendaraanId) =>
          `${API_BASE_URLS.TRACEABILITY}/logistik/kendaraan/${kendaraanId}`,
        // SUDAH [DELETE] Hapus kendaraan by ID
        DELETE: (kendaraanId) =>
          `${API_BASE_URLS.TRACEABILITY}/logistik/kendaraan/${kendaraanId}`,
      },

      // --- KRU (SUPIR) ---
      KRU: {
        // SUDAH [POST] Tambah supir baru
        ADD: `${API_BASE_URLS.TRACEABILITY}/logistik/kru`,
        // SUDAH [GET] Lihat daftar supir
        GET_ALL: `${API_BASE_URLS.TRACEABILITY}/logistik/kru`,
        // SUDAH [PATCH] Edit profil supir by ID
        UPDATE: (kruId) =>
          `${API_BASE_URLS.TRACEABILITY}/logistik/kru/${kruId}`,
        // SUDAH [DELETE] Hapus supir by ID
        DELETE: (kruId) =>
          `${API_BASE_URLS.TRACEABILITY}/logistik/kru/${kruId}`,
      },

      // --- DROPDOWN TERSEDIA ---
      DROPDOWN: {
        // DONE! [GET] Daftar supir status TERSEDIA
        KRU: `${API_BASE_URLS.TRACEABILITY}/logistik/dropdown/kru`,
        // DONE! [GET] Daftar kendaraan status TERSEDIA
        KENDARAAN: `${API_BASE_URLS.TRACEABILITY}/logistik/dropdown/kendaraan`,
      },

      // --- MANAGEMENT PENGIRIMAN ---
      MANAGEMENT: {
        // DONE ![GET] Daftar pengiriman (ALL ROLES)
        GET_LIST: `${API_BASE_URLS.TRACEABILITY}/logistik/management`,

        // DONE! [POST] Terima pengajuan, tugaskan armada, generate resi otomatis
        TERIMA_TUGASKAN: (pengirimanId) =>
          `${API_BASE_URLS.TRACEABILITY}/logistik/${pengirimanId}/terima-tugaskan`,

        // DONE! [PATCH] Tolak pengajuan pengiriman
        TOLAK: (pengirimanId) =>
          `${API_BASE_URLS.TRACEABILITY}/logistik/${pengirimanId}/tolak`,

        // DONE! [PATCH] Update progress pengiriman (Mengirim -> Menuju Pabrik -> Terima)
        UPDATE_PROGRESS: (pengirimanId) =>
          `${API_BASE_URLS.TRACEABILITY}/logistik/${pengirimanId}/progress`,
      },
    },

    // --- KEBUN POV ---
    KEBUN: {
      // DONE![POST] Submit form pengajuan pengiriman ke Mitra Logistik pilihan
      AJUKAN_PENGIRIMAN: (logistikUserId) =>
        `${API_BASE_URLS.TRACEABILITY}/logistik/pengiriman/ajukan/${logistikUserId}`,

      // DONE! [GET] Melihat daftar Mitra Logistik yang tersedia di platform (beserta resume armada)
      GET_MITRA_LOGISTIK: `${API_BASE_URLS.TRACEABILITY}/logistik/mitra-logistik`,

      // DONE! Dropdown Grup ID yang pernah dipakai sebelumnya untuk mengajukan ke logistik
      GET_USED_GRUP_IDS: `${API_BASE_URLS.TRACEABILITY}/logistik/used-grup-ids`,

      // [GET] Mengambil data awal untuk merender Form Bagi Hasil
      GET_METADATA_BAGI_HASIL: (pengirimanId) =>
        `${API_BASE_URLS.TRACEABILITY}/logistik/pengiriman/${pengirimanId}/bagi-hasil/metadata`,

      // [POST] Menyimpan struk gaji/bagi hasil petani
      SUBMIT_BAGI_HASIL: (pengirimanId) =>
        `${API_BASE_URLS.TRACEABILITY}/logistik/pengiriman/${pengirimanId}/bagi-hasil`,
    },

    // --- PABRIK POV ---
    PABRIK: {
      // SUDAH [PATCH] Mengkonfirmasi truk Logistik telah tiba di Pabrik
      TERIMA_PESANAN: (pengirimanId) =>
        `${API_BASE_URLS.TRACEABILITY}/logistik/${pengirimanId}/pabrik-terima`,

      // SUDAH [GET] Melihat ringkasan daftar truk yang sedang menuju pabrik
      GET_MONITORING: `${API_BASE_URLS.TRACEABILITY}/logistik/pabrik/monitoring`,

      // [BARU] [GET] Klik Detail -> Muntahkan seluruh metadata Traceability Node
      GET_TRACEABILITY_NODE: (pengirimanId) =>
        `${API_BASE_URLS.TRACEABILITY}/logistik/pabrik/traceability/${pengirimanId}`,

      PEMERIKSAAN: {
        // DONE! POST: Digunakan saat pabrik submit form (PENTING: Gunakan FormData karena ada UploadFile nota)
        SUBMIT: (pengirimanId) =>
          `${API_BASE_URLS.TRACEABILITY}/logistik/${pengirimanId}/pemeriksaan-tbs`,
        // DONE! GET: Untuk melihat detail 1 hasil pemeriksaan
        GET_DETAIL: (pengirimanId) =>
          `${API_BASE_URLS.TRACEABILITY}/logistik/${pengirimanId}/pemeriksaan-tbs`,
        // DONE! GET: Untuk Dashboard tabel rekapitulasi semua truk masuk hari itu
        DASHBOARD: `${API_BASE_URLS.TRACEABILITY}/logistik/pabrik/dashboard-pemeriksaan`,
      },

      // MANAJEMEN STOK RAM --- (DONE SEMUA)
      STOK_RAM: `${API_BASE_URLS.TRACEABILITY}/logistik/pabrik/stok-ram`,

      //  SIKLUS PRODUKSI --- (DONE SEMUA)
      PRODUKSI: {
        MULAI: `${API_BASE_URLS.TRACEABILITY}/logistik/pabrik/produksi/mulai`,
        SELESAI: (siklusId) =>
          `${API_BASE_URLS.TRACEABILITY}/logistik/pabrik/produksi/${siklusId}/selesai`,
        GET_LIST: `${API_BASE_URLS.TRACEABILITY}/logistik/pabrik/produksi/list`,
      },
    },

    //  PUBLIK POV ---
    KODE_PRODUKSI_PUBLIK: {
      // DONE! Endpoint pelacakan pohon barcode CPO tanpa Auth
      SCAN_TRACEABILITY: (kodeResi) =>
        `${API_BASE_URLS.TRACEABILITY}/logistik/traceability/scan/${kodeResi}`,
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
  if (service === "TRACEABILITY") baseUrl = API_BASE_URLS.TRACEABILITY;

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
