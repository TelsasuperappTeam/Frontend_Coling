import { useEffect, useState } from "react";
import { API_ENDPOINTS, ROLES } from "../../config/constants";
import {
  User,
  Mail,
  Shield,
  Phone,
  MapPin,
  Tag,
  TreeDeciduous,
  Crosshair,
  Info,
  Calendar,
  Edit3,
  ChevronDown,
  ChevronUp,
  Database,
  X,
  Save,
  Trash2,
  Truck,
  Factory,
  Settings,
  FileClock,
  ArrowRight,
} from "lucide-react";

export default function DataStakeholderAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ====== STATE AUDIT LOGS ======
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // ====== STATE EDIT ======
  const [showEdit, setShowEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({
    nama_lengkap: "",
    no_hp: "",
    alamat: "",
    status: "pending",
    koordinat: "",
  });

  const [originalForm, setOriginalForm] = useState(null);

  const [open, setOpen] = useState({
    kebun: true,
    petani: false,
    logistik: false,
    pabrik: false,
    admin: false,
    audit: false, //State untuk accordion Audit Log
  });

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  // ====== FETCH DATA USERS ======
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_ENDPOINTS.USER.ADMIN.GET_ALL_USERS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil data");

      const rawData = await res.json();

      let cleanData = [];
      if (Array.isArray(rawData)) {
        cleanData = rawData;
      } else if (rawData && Array.isArray(rawData.data)) {
        cleanData = rawData.data;
      }
      // TAMBAHAN: Cek jika backend membungkus dengan nama lain, misal "users"
      else if (rawData && Array.isArray(rawData.users)) {
        cleanData = rawData.users;
      }

      setUsers(cleanData);
    } catch (e) {
      console.error(e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ====== FETCH AUDIT LOGS ======
  const fetchAuditLogs = async () => {
    try {
      setLoadingLogs(true);
      const token = localStorage.getItem("token");

      // Menggunakan key GET_AUDIT_LOG sesuai constants.js
      const url = API_ENDPOINTS.USER.ADMIN.GET_AUDIT_LOG;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.warn("Gagal mengambil audit logs");
        return;
      }

      setAuditLogs(await res.json());
    } catch (e) {
      console.error("Error fetching logs:", e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, []);

  // ====== HAPUS USER ======
  const handleDelete = async (userId) => {
    // Konfirmasi sebelum hapus
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus pengguna ini? Data yang dihapus tidak dapat dikembalikan.",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      // Menggunakan function URL dari constants
      const url = API_ENDPOINTS.USER.ADMIN.DELETE_USER(userId);

      // Panggil API DELETE
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        // Handle jika backend mengirim error detail
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Gagal menghapus pengguna");
      }

      // Jika sukses, refresh data
      alert("Pengguna berhasil dihapus.");
      fetchUsers();
      fetchAuditLogs(); // Refresh logs setelah hapus
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  // Tambahkan pengaman (users || []) sebelum .filter
  const byRole = (role) => {
    const safeUsers = Array.isArray(users) ? users : [];
    return safeUsers.filter(
      (u) =>
        // Ubah keduanya jadi huruf kecil saat membandingkan
        u.role?.toLowerCase() === role?.toLowerCase(),
    );
  };

  const openEdit = (user) => {
    setSelectedUser(user);

    const coordString =
      user.latitude && user.longitude
        ? `${user.latitude}, ${user.longitude}`
        : "";

    const initialValues = {
      nama_lengkap: user.nama_lengkap ?? "",
      no_hp: user.no_hp ?? "",
      alamat: user.alamat ?? "",
      status: user.status ?? "pending",
      koordinat: coordString,
    };

    setForm(initialValues);
    setOriginalForm({ ...initialValues });
    setShowEdit(true);
  };

  // logika simpan edit data stakeholder dan mengkosongkan koordinat
  const handleSave = async (e) => {
    e.preventDefault();

    if (!originalForm) {
      alert("Data awal belum siap");
      return;
    }

    if (!form.nama_lengkap || !form.no_hp) {
      alert("Nama Lengkap dan No HP wajib diisi!");
      return;
    }

    setLoading(true);

    try {
      // Siapkan Payload Awal
      const payload = {};

      // BANDINGKAN KOLOM TEXT BIASA
      // Hanya masukkan ke payload jika nilainya berbeda dari originalForm
      if (form.nama_lengkap !== originalForm.nama_lengkap) {
        payload.nama_lengkap = form.nama_lengkap;
      }

      if (form.no_hp !== originalForm.no_hp) {
        payload.no_hp = form.no_hp;
      }

      if (form.alamat !== originalForm.alamat) {
        payload.alamat = form.alamat;
      }

      if (form.status !== originalForm.status) {
        payload.status = form.status;
      }

      // BANDINGKAN KOLOM KOORDINAT
      // Cek apakah string koordinat berubah?
      if (form.koordinat !== originalForm.koordinat) {
        if (!form.koordinat || form.koordinat.trim() === "") {
          payload.hapus_koordinat = true;
          payload.latitude = null;
          payload.longitude = null;
        } else {
          const parts = form.koordinat.split(",");

          if (parts.length !== 2) {
            throw new Error("Format koordinat salah! Gunakan: lat, lng");
          }

          const lat = parseFloat(parts[0].trim());
          const lng = parseFloat(parts[1].trim());

          if (isNaN(lat) || isNaN(lng)) {
            throw new Error("Koordinat harus angka valid!");
          }

          payload.latitude = lat;
          payload.longitude = lng;
          payload.hapus_koordinat = false;
        }
      }

      // CEK APAKAH ADA PERUBAHAN?
      // Jika payload kosong, berarti user klik simpan tanpa merubah apapun
      if (Object.keys(payload).length === 0) {
        alert("Tidak ada perubahan data yang disimpan.");
        setShowEdit(false);
        setLoading(false);
        return;
      }

      console.log("Mengirim Payload Perubahan:", payload);

      // 4. KIRIM DATA KE BACKEND
      const url = API_ENDPOINTS.USER.ADMIN.UPDATE_USER(selectedUser.id);

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let dataResponse = {};
      try {
        if (responseText) dataResponse = JSON.parse(responseText);
      } catch (jsonErr) {
        console.error("Gagal parse JSON:", jsonErr);
        throw new Error("Terjadi kesalahan server.");
      }

      if (!response.ok) {
        let errorMessage = `Gagal menyimpan (Status: ${response.status})`;
        if (dataResponse.detail) {
          if (Array.isArray(dataResponse.detail)) {
            errorMessage = dataResponse.detail
              .map((err) => `${err.loc[1]}: ${err.msg}`)
              .join("\n");
          } else {
            errorMessage = dataResponse.detail;
          }
        }
        throw new Error(errorMessage);
      }

      alert("Data berhasil diperbarui!");
      setShowEdit(false);
      fetchUsers();
      fetchAuditLogs(); // Refresh logs setelah update
    } catch (err) {
      console.error("Error saat menyimpan:", err);
      alert(`Gagal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !showEdit)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5302D]"></div>
        <p className="mt-4 font-bold text-[#B5302D] animate-pulse">
          Mengambil data stakeholder...
        </p>
      </div>
    );

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-row items-center gap-3 md:gap-4 mb-6 md:mb-10">
          <div className="bg-[#B5302D] p-2 md:p-3 rounded-lg shadow-lg shrink-0">
            <Database className="text-white w-6 h-6 md:w-8 md:h-8" />
          </div>

          <div>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-[#B5302D]">
              Data Stakeholder
            </h1>

            <p className="text-gray-500 text-xs md:text-sm mt-0.5">
              Kelola informasi dan status semua entitas sistem
            </p>
          </div>
        </header>

        <div className="space-y-6">
          {[
            {
              title: "Stakeholder Kebun",
              role: ROLES.KEBUN,
              key: "kebun",
              icon: <TreeDeciduous size={20} />,
            },
            {
              title: "Stakeholder Petani",
              role: ROLES.PETANI,
              key: "petani",
              icon: <User size={20} />,
            },
            {
              title: "Stakeholder Logistik",
              role: ROLES.LOGISTIK,
              key: "logistik",
              icon: <Truck size={20} />,
            },
            {
              title: "Stakeholder Pabrik",
              role: ROLES.PABRIK,
              key: "pabrik",
              icon: <Factory size={20} />,
            },
            {
              title: "Administrator",
              role: ROLES.ADMIN,
              key: "admin",
              icon: <Settings size={20} />,
            },
          ].map((s) => (
            <Section
              key={s.key}
              title={s.title}
              icon={s.icon}
              data={byRole(s.role)}
              role={s.role}
              open={open[s.key]}
              toggle={() => toggle(s.key)}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}

          {/* ====== TABEL RIWAYAT PERUBAHAN ====== */}
          <AuditLogSection
            data={auditLogs}
            open={open.audit}
            toggle={() => toggle("audit")}
            loading={loadingLogs}
          />
        </div>
      </div>

      {/* ===== MODAL EDIT ===== */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
            <div className="bg-[#B5302D] p-6 flex justify-between items-center text-white shrink-0 z-10">
              <h2 className="font-bold text-xl flex items-center gap-2">
                <Edit3 size={24} /> Edit Data Stakeholder
              </h2>
              <button
                onClick={() => setShowEdit(false)}
                className="hover:bg-white/20 p-1 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSave} className="space-y-4">
                <p className="text-[10px] text-gray-400 italic">
                  * Kosongkan input jika ingin menghapus data agar user mengisi
                  ulang.
                </p>

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Nama Lengkap"
                    icon={<User size={18} />}
                    placeholder="Nama Lengkap User"
                    value={form.nama_lengkap}
                    onChange={(e) =>
                      setForm({ ...form, nama_lengkap: e.target.value })
                    }
                  />

                  <Input
                    label="No HP"
                    icon={<Phone size={18} />}
                    placeholder="Contoh: 0812..."
                    value={form.no_hp}
                    onChange={(e) =>
                      setForm({ ...form, no_hp: e.target.value })
                    }
                  />

                  {/* INPUT KOORDINAT */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                      <MapPin size={14} /> Koordinat Lahan
                    </label>

                    <div className="flex gap-2">
                      <input
                        value={form.koordinat}
                        onChange={(e) =>
                          setForm({ ...form, koordinat: e.target.value })
                        }
                        placeholder="Contoh: -6.123, 106.123"
                        className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-[#B5302D] outline-none transition text-sm"
                      />

                      {/* Tombol Hapus */}
                      {form.koordinat && (
                        <button
                          onClick={() => setForm({ ...form, koordinat: "" })}
                          className="bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-100 border border-red-100 transition-colors"
                          title="Hapus Koordinat"
                          type="button"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 italic">
                      *Klik ikon sampah untuk menghapus lokasi, lalu Simpan.
                    </p>
                  </div>

                  {/* INPUT ALAMAT */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                      <MapPin size={14} /> Alamat
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Kosongkan jika ingin petani mengisi ulang alamat"
                      className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-[#B5302D] outline-none transition text-sm resize-none"
                      value={form.alamat}
                      onChange={(e) =>
                        setForm({ ...form, alamat: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    <Info size={14} /> Status Akun
                  </label>
                  <select
                    className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-[#B5302D] outline-none transition text-sm appearance-none bg-white"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>

                {/* Footer Tombol */}
                <div className="flex gap-4 pt-4 mt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
                    className="flex-1 border-2 border-gray-100 rounded-xl py-3 font-bold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading} // Tambahkan disabled saat loading
                    className="flex-1 bg-[#B5302D] text-white rounded-xl py-3 font-bold shadow-lg shadow-red-200 hover:bg-[#962825] transition flex items-center justify-center gap-2"
                  >
                    <Save size={20} /> Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================== TABLE & MOBILE CARD COMPONENTS ================== */

// Pastikan props menerima 'role'
function Section({ title, icon, data, open, toggle, onEdit, onDelete, role }) {
  // LOGIKA TAMPILAN KOLOM
  const showKebunId = role === ROLES.KEBUN; // Cuma tampil di Kebun
  const showKebunInduk = role === ROLES.PETANI; // Cuma tampil di Petani
  const showKoordinat = role !== ROLES.LOGISTIK; // Tampil KECUALI di Logistik

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* HEADER SECTION */}
      <div
        onClick={toggle}
        className={`cursor-pointer px-4 md:px-6 py-5 flex justify-between items-center transition-all ${
          open
            ? "bg-[#EF8523] text-white"
            : "bg-white text-gray-700 hover:bg-orange-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`${
              open ? "bg-white/20" : "bg-orange-100"
            } p-2 rounded-lg transition-colors text-inherit`}
          >
            {icon}
          </div>
          <span className="font-bold text-base md:text-lg tracking-wide">
            {title}{" "}
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                open ? "bg-white text-[#EF8523]" : "bg-gray-100 text-gray-500"
              }`}
            >
              {data.length}
            </span>
          </span>
        </div>
        {open ? (
          <ChevronUp size={20} className="md:w-6 md:h-6" />
        ) : (
          <ChevronDown size={20} className="text-gray-400 md:w-6 md:h-6" />
        )}
      </div>

      {open && (
        <>
          {/* ================= TAMPILAN MOBILE ================= */}
          <div className="block md:hidden bg-gray-50 p-4 space-y-4">
            {data.length > 0 ? (
              data.map((u) => (
                <div
                  key={u.id}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start border-b border-gray-50 pb-2 mb-1">
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">
                        {u.nama_lengkap}
                      </h3>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {u.role}
                      </span>
                    </div>
                    <StatusBadge status={u.status} />
                  </div>

                  {/* Info Detail */}
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400 shrink-0" />
                      <span>{u.no_hp}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin
                        size={14}
                        className="text-gray-400 mt-0.5 shrink-0"
                      />
                      <span className="line-clamp-2">{u.alamat || "-"}</span>
                    </div>

                    {/* LOGIKA TAMPILAN KHUSUS (MOBILE) */}
                    <div className="grid grid-cols-1 gap-2 mt-1">
                      {/* Hanya Tampil jika Kebun */}
                      {showKebunId && (
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-gray-400 shrink-0" />
                          <span className="font-mono text-blue-600 font-bold bg-blue-50 px-1.5 rounded">
                            ID: {u.kebun_id || "-"}
                          </span>
                        </div>
                      )}

                      {/* Hanya Tampil jika Petani */}
                      {showKebunInduk && (
                        <div className="flex items-center gap-2">
                          <TreeDeciduous
                            size={14}
                            className="text-gray-400 shrink-0"
                          />
                          <span className="italic text-gray-500 truncate">
                            Induk: {u.kebun?.nama_lengkap || "-"}
                          </span>
                        </div>
                      )}

                      {showKoordinat && (
                        <div className="flex items-center gap-2">
                          <Crosshair
                            size={14}
                            className="text-gray-400 shrink-0"
                          />
                          <span className="font-mono text-gray-500">
                            {u.latitude && u.longitude
                              ? `${u.latitude}, ${u.longitude}`
                              : "-"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={14} className="shrink-0" />
                      <span>Dibuat: {formatDate(u.created_at)}</span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex gap-2 pt-2 mt-1 border-t border-gray-50">
                    <button
                      onClick={() => onEdit(u)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all active:scale-95 border border-blue-100"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(u.id)}
                      className="flex items-center justify-center px-4 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all active:scale-95 border border-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm italic">
                Tidak ada data.
              </div>
            )}
          </div>

          {/* ================= TAMPILAN DESKTOP (TABEL) ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {/* Kolom Umum */}
                  <Th icon={<User size={14} />}>Nama</Th>
                  <Th icon={<Mail size={14} />}>Email</Th>
                  <Th icon={<Shield size={14} />}>Role</Th>
                  <Th icon={<Phone size={14} />}>No HP</Th>
                  <Th icon={<MapPin size={14} />}>Alamat</Th>

                  {/* LOGIKA HEADER KOLOM KHUSUS */}
                  {showKebunId && <Th icon={<Tag size={14} />}>Kebun ID</Th>}
                  {showKebunInduk && (
                    <Th icon={<TreeDeciduous size={14} />}>Relasi Kebun</Th>
                  )}
                  {showKoordinat && (
                    <Th icon={<Crosshair size={14} />}>Koordinat</Th>
                  )}

                  <Th icon={<Info size={14} />}>Status</Th>
                  <Th icon={<Calendar size={14} />}>Dibuat</Th>
                  <Th icon={<Edit3 size={14} />}>Aksi</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.length > 0 ? (
                  data.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      {/* Kolom Umum */}
                      <Td className="font-semibold text-gray-900">
                        {u.nama_lengkap}
                      </Td>
                      <Td className="text-gray-500">{u.email}</Td>
                      <Td>
                        <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-black uppercase text-gray-600">
                          {u.role}
                        </span>
                      </Td>
                      <Td className="font-mono text-xs">{u.no_hp}</Td>
                      <Td className="max-w-[150px] truncate">
                        {u.alamat || "-"}
                      </Td>

                      {/* LOGIKA ISI DATA KHUSUS */}

                      {/* Kebun ID (Hanya Kebun) */}
                      {showKebunId && (
                        <Td className="font-mono text-xs text-blue-600 font-bold">
                          {u.kebun_id || "-"}
                        </Td>
                      )}

                      {/* Relasi Kebun (Hanya Petani) */}
                      {showKebunInduk && (
                        <Td className="italic text-gray-500">
                          {u.kebun?.nama_lengkap || "-"}
                        </Td>
                      )}
                      {showKoordinat && (
                        <Td className="text-[11px] text-gray-400 font-mono">
                          {u.latitude && u.longitude
                            ? `${u.latitude}, ${u.longitude}`
                            : "-"}
                        </Td>
                      )}

                      <Td>
                        <StatusBadge status={u.status} />
                      </Td>
                      <Td className="text-gray-400">
                        {formatDate(u.created_at)}
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEdit(u)}
                            className="group flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all active:scale-95 border border-blue-200"
                          >
                            <Edit3
                              size={14}
                              className="group-hover:rotate-12 transition-transform"
                            />{" "}
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(u.id)}
                            className="group flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all active:scale-95 border border-red-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={
                        7 +
                        (showKebunId ? 1 : 0) +
                        (showKebunInduk ? 1 : 0) +
                        (showKoordinat ? 1 : 0)
                      }
                      className="p-10 text-center text-gray-400 italic"
                    >
                      Data tidak ditemukan dalam kategori ini
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ================== COMPONENT AUDIT LOG SECTION ================== */
function AuditLogSection({ data, open, toggle, loading }) {
  // Helper untuk parsing JSON perubahan dari Backend
  const renderChanges = (changesString) => {
    try {
      if (!changesString) return "-";

      // Karena di DB tersimpan sebagai string (Text) atau sudah Dict
      const changes =
        typeof changesString === "string"
          ? JSON.parse(changesString)
          : changesString;

      // Validasi apakah hasil parse adalah object valid
      if (!changes || typeof changes !== "object") return "-";
      if (Object.keys(changes).length === 0) return "-";

      return (
        <div className="flex flex-col gap-2">
          {Object.entries(changes).map(([field, diff]) => {
            // --- DATA DIHAPUS ---
            if (field === "deleted_user_data") {
              return (
                <div
                  key={field}
                  className="text-[10px] bg-red-50 p-2 rounded border border-red-100"
                >
                  <span className="font-bold text-red-700 block border-b border-red-200 pb-1 mb-1 uppercase text-[9px]">
                    DATA USER DIHAPUS:
                  </span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-gray-600">
                    <span>ID User:</span>{" "}
                    <span className="font-mono font-bold">{diff.id}</span>
                    <span>Email:</span>{" "}
                    <span className="font-medium">{diff.email}</span>
                    <span>Role:</span> <span>{diff.role}</span>
                  </div>
                </div>
              );
            }

            // --- DATA DIEDIT ---
            const valOld = diff?.lama ?? diff?.old ?? "-";
            const valNew = diff?.baru ?? diff?.new ?? diff;

            return (
              <div
                key={field}
                className="text-[10px] bg-gray-50 p-1.5 rounded border border-gray-100 flex items-center flex-wrap gap-1"
              >
                <span className="font-bold text-gray-700 uppercase bg-gray-200 px-1.5 py-0.5 rounded text-[9px]">
                  {field.replace(/_/g, " ")}
                </span>

                <span className="text-red-400 line-through decoration-red-400/50 ml-1">
                  {String(valOld)}
                </span>

                <ArrowRight size={10} className="text-gray-400" />

                <span className="text-green-600 font-bold bg-green-50 px-1 rounded border border-green-100">
                  {String(valNew)}
                </span>
              </div>
            );
          })}
        </div>
      );
    } catch (error) {
      console.error("Gagal parsing log:", error);
      return (
        <span className="text-xs text-gray-400 italic">
          Raw Data: {String(changesString).substring(0, 50)}...
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div
        onClick={toggle}
        className={`cursor-pointer px-4 md:px-6 py-5 flex justify-between items-center transition-all ${
          open
            ? "bg-[#EF8523] text-white"
            : "bg-white text-gray-700 hover:bg-orange-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`${
              open ? "bg-white/20" : "bg-orange-100"
            } p-2 rounded-lg transition-colors text-inherit`}
          >
            <FileClock size={20} />
          </div>
          <span className="font-bold text-base md:text-lg tracking-wide">
            Riwayat Perubahan
          </span>
        </div>
        {open ? (
          <ChevronUp size={20} className="md:w-6 md:h-6" />
        ) : (
          <ChevronDown size={20} className="text-gray-400 md:w-6 md:h-6" />
        )}
      </div>

      {open && (
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-400 flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              <span>Memuat riwayat...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="bg-gray-50 border-b border-gray-100">
                  <Th icon={<Calendar size={14} />}>Waktu</Th>
                  <Th icon={<Shield size={14} />}>Admin</Th>
                  <Th icon={<User size={14} />}>Target User</Th>
                  <Th icon={<Edit3 size={14} />}>Aksi</Th>
                  <Th icon={<Info size={14} />}>Detail Perubahan</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data && data.length > 0 ? (
                  data.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-orange-50/10 transition-colors"
                    >
                      {/* Waktu */}
                      <Td className="text-xs text-gray-600 w-[150px]">
                        <div className="flex flex-col">
                          <span className="font-bold">
                            {log.timestamp
                              ? new Date(log.timestamp).toLocaleDateString(
                                  "id-ID",
                                )
                              : "-"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {log.timestamp
                              ? new Date(log.timestamp).toLocaleTimeString(
                                  "id-ID",
                                )
                              : ""}
                          </span>
                        </div>
                      </Td>

                      {/* Admin Info */}
                      <Td className="w-[180px] bg-gray-50/50">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700 text-xs truncate">
                            {log.admin?.nama_lengkap || "-"}
                          </span>
                          <span className="text-[10px] text-gray-400 truncate">
                            {log.admin?.email}
                          </span>
                        </div>
                      </Td>

                      {/* Target Info */}
                      <Td className="w-[180px]">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700 text-xs truncate">
                            {log.target?.nama_lengkap || "-"}
                          </span>
                          <span className="text-[10px] text-gray-400 truncate">
                            {log.target?.email}
                          </span>
                        </div>
                      </Td>

                      {/* Aksi */}
                      <Td className="w-[120px]">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                            log.action?.includes("HAPUS")
                              ? "bg-red-50 text-red-700 border-red-100"
                              : "bg-blue-50 text-blue-700 border-blue-100"
                          }`}
                        >
                          {log.action?.replace(/_/g, " ")}
                        </span>
                      </Td>

                      {/* Detail Perubahan */}
                      <Td className="min-w-[300px] py-3">
                        {renderChanges(log.changes)}
                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-8 text-center text-gray-400 italic text-sm"
                    >
                      Belum ada riwayat perubahan tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

/* ================== UTILS & ATOMS ================== */

const Th = ({ children, icon }) => (
  <th className="px-4 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-100 last:border-none">
    <div className="flex items-center gap-2">
      {icon} {children}
    </div>
  </th>
);

const Td = ({ children, className = "" }) => (
  <td
    className={`px-4 py-4 text-sm border-r border-gray-50 last:border-none ${className}`}
  >
    {children}
  </td>
);

function Input({ label, icon, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
        {icon} {label}
      </label>
      <input
        {...props}
        className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-[#B5302D] outline-none transition text-sm"
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    approved: {
      bg: "bg-green-50",
      text: "text-green-600",
      dot: "bg-green-600",
    },
    pending: {
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      dot: "bg-yellow-600",
    },
    banned: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-600" },
  };
  const theme = map[status] || {
    bg: "bg-gray-50",
    text: "text-gray-600",
    dot: "bg-gray-600",
  };

  return (
    <span
      className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase ${theme.bg} ${theme.text} border border-current/10`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`}></span>
      {status}
    </span>
  );
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
