import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Users,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// Sesuaikan import config dengan struktur folder Anda
import { API_ENDPOINTS, API_BASE_URLS } from "../../../config/constants.js";

const Operasional = () => {
  const navigate = useNavigate();

  // -- STATE UNTUK GM DISTRIK / KEBUN --
  const [daftarKebun, setDaftarKebun] = useState([]);
  const [selectedKebunId, setSelectedKebunId] = useState(null); // <--- GANTI expandedKebun
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // <--- TAMBAH INI

  // -- STATE UNTUK TRANSAKSI (JUAL & PINJAM) --
  // Menyimpan data per kebun_id: { [kebun_id]: arrayData }
  const [riwayatJual, setRiwayatJual] = useState({});
  const [riwayatPinjam, setRiwayatPinjam] = useState({});
  const [isLoadingTransaksi, setIsLoadingTransaksi] = useState({});

  // -- STATE MODAL INSERT TRANSAKSI (KHUSUS ROLE KEBUN) --
  const [showModalJual, setShowModalJual] = useState(false);
  const [isSubmittingJual, setIsSubmittingJual] = useState(false);
  const [jualFormData, setJualFormData] = useState({
    petani_user_id: "",
    jenis_barang: "",
    dinamis_item_id: "",
    jumlah: "",
    total_harga: "",
  });

  const [showModalPinjam, setShowModalPinjam] = useState(false);
  const [isSubmittingPinjam, setIsSubmittingPinjam] = useState(false);
  const [pinjamFormData, setPinjamFormData] = useState({
    petani_user_id: "",
    dinamis_peralatan_id: "",
    jumlah_dipinjam: "",
    tanggal_peminjaman: "",
  });

  // -- STATE UNTUK OPSI DROPDOWN --
  const [opsiPetani, setOpsiPetani] = useState([]);
  const [opsiPeralatan, setOpsiPeralatan] = useState([]);
  const [opsiBarang, setOpsiBarang] = useState([]);

  // 1. Ambil Role User dari Token untuk Deteksi GM Distrik
  const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role; // e.g., "general_manager_distrik" atau "kebun"
    } catch {
      return null;
    }
  };
  const role = getUserRole();
  const isGM = role === "general_manager_distrik";

  // 2. Fetch Daftar Kebun
  const fetchDaftarKebun = async () => {
    try {
      const token = localStorage.getItem("token");

      if (isGM) {
        // Jika GM Distrik: Ambil seluruh daftar kebun miliknya
        // Endpoint: /users/gm/me/kebun-list
        const url =
          API_ENDPOINTS.USER.GMDistrik?.GET_KEBUN_LIST ||
          `${API_BASE_URLS.USER}/users/gm/me/kebun-list`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const formattedData = data.map((item) => ({
            id: item.auth_id || item.id,
            nama_kebun:
              item.nama_lengkap || item.nama_kebun || "Kebun Tidak Bernama",
          }));
          setDaftarKebun(formattedData);
          if (formattedData.length > 0) {
            setSelectedKebunId(formattedData[0].id); // <--- GANTI INI
            fetchDataPerKebun(formattedData[0].id);
          }
        }
      } else {
        // Jika Role Kebun: Set dirinya sendiri sebagai single entitas
        const res = await fetch(`${API_BASE_URLS.USER}/users/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const singleKebun = [
            {
              id: data.auth_id || data.id,
              nama_kebun: data.nama_lengkap || data.nama_kebun || "Kebun Saya",
            },
          ];
          setDaftarKebun(singleKebun);
          setSelectedKebunId(singleKebun[0].id);
          fetchDataPerKebun(singleKebun[0].id);
        }
      }
    } catch (e) {
      console.error("Gagal mendapatkan daftar kebun", e);
    }
  };

  // 3. Fetch Transaksi Sesuai 'target_kebun_auth_id' ke Backend
  const fetchDataPerKebun = async (kebunId) => {
    if (!kebunId) return;
    setIsLoadingTransaksi((prev) => ({ ...prev, [kebunId]: true }));
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Tambahkan logic filter params
      const params = isGM ? `?target_kebun_auth_id=${kebunId}` : "";

      const urlJual =
        API_ENDPOINTS.FARM.KEBUN.TRANSAKSI?.JUAL ||
        `${API_BASE_URLS.FARM}/farm/kebun/transaksi/jual`;
      const urlPinjam =
        API_ENDPOINTS.FARM.KEBUN.TRANSAKSI?.PINJAMKAN ||
        `${API_BASE_URLS.FARM}/farm/kebun/transaksi/pinjamkan`;

      const [resJual, resPinjam] = await Promise.all([
        fetch(`${urlJual}${params}`, { headers }),
        fetch(`${urlPinjam}${params}`, { headers }),
      ]);

      if (resJual.ok) {
        const dataJual = await resJual.json();
        setRiwayatJual((prev) => ({ ...prev, [kebunId]: dataJual }));
      }
      if (resPinjam.ok) {
        const dataPinjam = await resPinjam.json();
        setRiwayatPinjam((prev) => ({ ...prev, [kebunId]: dataPinjam }));
      }
    } catch (error) {
      console.error(`Error fetching transaksi kebun ${kebunId}:`, error);
    } finally {
      setIsLoadingTransaksi((prev) => ({ ...prev, [kebunId]: false }));
    }
  };

  // 4. Fetch Opsi Form Insert (KHUSUS ROLE KEBUN, GM TIDAK BUTUH INSERT)
  const fetchOpsiForKebun = async () => {
    if (isGM) return; // Skip fetch dropdown untuk insert jika role adalah GM
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const resPetani = await fetch(
        `${API_BASE_URLS.USER}/users/kebun/me/petani-members`,
        { headers },
      );
      if (resPetani.ok) setOpsiPetani(await resPetani.json());

      const resAlat = await fetch(
        `${API_BASE_URLS.FARM}/farm/kebun/inventaris/peralatan`,
        { headers },
      );
      if (resAlat.ok) {
        const data = await resAlat.json();
        setOpsiPeralatan(
          Array.isArray(data) ? data : data.data || data.items || [],
        );
      }
    } catch (e) {
      console.error("Gagal fetch opsi insert:", e);
    }
  };

  const fetchOpsiBarang = async (jenis) => {
    if (!jenis || isGM) {
      setOpsiBarang([]);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const path = jenis.toLowerCase();
      const res = await fetch(
        `${API_BASE_URLS.FARM}/farm/kebun/inventaris/${path}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        const arrayData = Array.isArray(data)
          ? data
          : data.data || data.items || [];
        setOpsiBarang(arrayData);
      }
    } catch (e) {
      console.error("Gagal fetch barang", e);
    }
  };

  useEffect(() => {
    fetchDaftarKebun();
    fetchOpsiForKebun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 5. Handle Toggle Bungkusan / Accordion
  useEffect(() => {
    if (
      selectedKebunId &&
      !riwayatJual[selectedKebunId] &&
      !riwayatPinjam[selectedKebunId]
    ) {
      fetchDataPerKebun(selectedKebunId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKebunId]);

  // 6. Handle POST Form
  const handleSubmitJual = async (e) => {
    e.preventDefault();
    setIsSubmittingJual(true);

    const parsedPetaniId = parseInt(jualFormData.petani_user_id);
    const parsedItemId = parseInt(jualFormData.dinamis_item_id);
    const parsedJumlah = parseFloat(jualFormData.jumlah);

    if (isNaN(parsedPetaniId) || isNaN(parsedItemId) || isNaN(parsedJumlah)) {
      alert("Harap pilih Petani, Barang, dan isi Jumlah dengan benar!");
      setIsSubmittingJual(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        petani_user_id: parsedPetaniId,
        jenis_barang: jualFormData.jenis_barang,
        dinamis_item_id: parsedItemId,
        jumlah: parsedJumlah,
        total_harga: jualFormData.total_harga
          ? parseFloat(jualFormData.total_harga)
          : null,
      };

      const response = await fetch(
        `${API_BASE_URLS.FARM}/farm/kebun/transaksi/jual`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        alert("Berhasil mencatat penjualan barang ke petani!");
        setShowModalJual(false);
        setJualFormData({
          petani_user_id: "",
          jenis_barang: "",
          dinamis_item_id: "",
          jumlah: "",
          total_harga: "",
        });
        // Refresh tabel hanya untuk kebun dia sendiri (karena POST cuma kebun yang bisa)
        fetchDataPerKebun(selectedKebunId);
      } else {
        const errorData = await response.json();
        alert(
          `Gagal Jual: ${JSON.stringify(errorData.detail) || "Cek input Anda"}`,
        );
      }
    } catch (error) {
      console.error("Error submit jual:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmittingJual(false);
    }
  };

  const handleSubmitPinjam = async (e) => {
    e.preventDefault();
    setIsSubmittingPinjam(true);

    const parsedPetaniId = parseInt(pinjamFormData.petani_user_id);
    const parsedAlatId = parseInt(pinjamFormData.dinamis_peralatan_id);
    const parsedJumlah = parseInt(pinjamFormData.jumlah_dipinjam);

    if (isNaN(parsedPetaniId) || isNaN(parsedAlatId) || isNaN(parsedJumlah)) {
      alert("Harap pilih Petani, Peralatan, dan isi Jumlah dengan benar!");
      setIsSubmittingPinjam(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        petani_user_id: parsedPetaniId,
        dinamis_peralatan_id: parsedAlatId,
        jumlah_dipinjam: parsedJumlah,
        tanggal_peminjaman: pinjamFormData.tanggal_peminjaman,
      };

      const response = await fetch(
        `${API_BASE_URLS.FARM}/farm/kebun/transaksi/pinjamkan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        alert("Berhasil mencatat peminjaman alat ke petani!");
        setShowModalPinjam(false);
        setPinjamFormData({
          petani_user_id: "",
          dinamis_peralatan_id: "",
          jumlah_dipinjam: "",
          tanggal_peminjaman: "",
        });
        fetchDataPerKebun(selectedKebunId);
      } else {
        const errorData = await response.json();
        alert(
          `Gagal Pinjam: ${JSON.stringify(errorData.detail) || "Cek input Anda"}`,
        );
      }
    } catch (error) {
      console.error("Error submit pinjam:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmittingPinjam(false);
    }
  };

  return (
    <div className="p-4 sm:p-10 min-h-screen text-gray-800 font-sans relative">
      {/* HEADER & TAB SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <ShoppingCart className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Manajemen Operasional
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Kelola penjualan barang dan peminjaman inventaris.
            </p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto overflow-hidden">
          <button className="flex-1 flex justify-center items-center gap-1 sm:gap-2 px-1 sm:px-6 py-2.5 rounded-lg text-[8px] sm:text-xs font-bold transition-all bg-white text-[#B5302D] shadow-sm">
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="whitespace-nowrap">Penjualan/Peminjaman</span>
          </button>
          <button
            onClick={() => navigate("../manajemenoperasional/organisasi")}
            className="flex-1 flex justify-center items-center gap-1 sm:gap-2 px-1 sm:px-6 py-2.5 rounded-lg text-[8px] sm:text-xs font-bold transition-all text-gray-500 hover:bg-gray-200"
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="whitespace-nowrap">Organisasi</span>
          </button>
        </div>
      </div>

      {/* 2. UI DROPDOWN PILIH KEBUN (Memanjang Penuh di Bawah Header) */}
      {isGM && (
        <div className="mb-8 relative z-30">
          {/* Overlay tersembunyi untuk menutup dropdown saat klik luar */}
          {isDropdownOpen && (
            <div
              className="fixed inset-0 z-20"
              onClick={() => setIsDropdownOpen(false)}
            />
          )}

          {/* Tombol Utama (Bentuk Bar Memanjang) */}
          <div
            onClick={() =>
              daftarKebun.length > 0 && setIsDropdownOpen(!isDropdownOpen)
            }
            className={`flex items-center justify-between w-full px-5 py-3 rounded-xl border cursor-pointer transition-all relative z-30 ${
              isDropdownOpen
                ? "bg-[#B5302D] border-[#B5302D] text-white shadow-md"
                : "bg-red-50 border-red-100 text-[#B5302D] hover:bg-red-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin
                className={`w-5 h-5 ${isDropdownOpen ? "text-white" : "text-[#B5302D]"}`}
              />
              <div className="flex flex-col text-left">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${isDropdownOpen ? "text-red-200" : "text-[#B5302D]"}`}
                >
                  Pilih Kebun:
                </span>
                <span
                  className={`font-bold text-sm ${isDropdownOpen ? "text-white" : "text-gray-800"}`}
                >
                  {daftarKebun.length === 0
                    ? "Memuat data..."
                    : daftarKebun.find(
                        (k) => (k.auth_id || k.id) === selectedKebunId,
                      )?.nama_lengkap ||
                      daftarKebun.find(
                        (k) => (k.auth_id || k.id) === selectedKebunId,
                      )?.nama_kebun ||
                      "-- Silakan Pilih --"}
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-white" : "text-[#B5302D]"}`}
            />
          </div>

          {/* Menu Pilihan (Dropdown Menjuntai Lebar Penuh) */}
          <div
            className={`absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden transition-all duration-200 origin-top z-30 ${
              isDropdownOpen
                ? "opacity-100 scale-y-100"
                : "opacity-0 scale-y-0 pointer-events-none"
            }`}
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {daftarKebun.map((kb) => {
                const idKebun = kb.auth_id || kb.id;
                const namaKebun =
                  kb.nama_lengkap || kb.nama_kebun || "Kebun Tanpa Nama";
                const isSelected = idKebun === selectedKebunId;

                return (
                  <div
                    key={idKebun}
                    onClick={() => {
                      setSelectedKebunId(idKebun);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-5 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-red-50 text-[#B5302D] font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {namaKebun}
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#B5302D]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        {/* HAPUS .MAP() - LANGSUNG AMBIL BERDASARKAN ID TERPILIH */}
        {(() => {
          if (!selectedKebunId) return null;

          const filteredJual = riwayatJual[selectedKebunId] || [];
          const filteredPinjam = riwayatPinjam[selectedKebunId] || [];
          const isLoading = isLoadingTransaksi[selectedKebunId];

          return (
            <div className="space-y-8 bg-transparent">
              {/* SECTION 1 PENJUALAN BARANG */}
              <SectionCard title="Penjualan Barang">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-xs text-gray-500">
                    Tabel riwayat penjualan barang ke petani/anggota.
                  </p>
                  {/* Tombol Insert Jual HANYA MUNCUL kalau bukan GM */}
                  {!isGM && (
                    <button
                      onClick={() => setShowModalJual(true)}
                      className="flex items-center gap-1 bg-[#EF8523] hover:bg-[#d8721c] text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg shadow-orange-100 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Penjualan
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#EF8523] text-white text-[11px] uppercase tracking-wider">
                        <th className="p-4 font-bold rounded-tl-xl">No</th>
                        <th className="p-4 font-bold">Nama Petani</th>
                        <th className="p-4 font-bold">Tgl Pembelian</th>
                        <th className="p-4 font-bold">Jenis</th>
                        <th className="p-4 font-bold">Nama Barang</th>
                        <th className="p-4 font-bold">Jumlah</th>
                        <th className="p-4 font-bold">Total Harga</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-gray-700 bg-white">
                      {isLoading ? (
                        <tr>
                          <td colSpan="8" className="p-4 text-center">
                            Memuat data...
                          </td>
                        </tr>
                      ) : filteredJual.length > 0 ? (
                        filteredJual.map((item, index) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                          >
                            <td className="p-4 font-bold text-center">
                              {index + 1}
                            </td>
                            <td className="p-4 font-medium">
                              {item.nama_petani || "Tidak Diketahui"}
                            </td>
                            <td className="p-4 text-gray-500">
                              {item.tanggal_pembelian}
                            </td>
                            <td className="p-4">
                              <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold text-gray-600">
                                {item.jenis_barang}
                              </span>
                            </td>
                            <td className="p-4 font-bold">
                              {item.nama_barang_tercatat}
                            </td>
                            <td className="p-4">{item.jumlah}</td>
                            <td className="p-4 font-bold text-[#B5302D]">
                              {item.total_harga
                                ? `Rp ${item.total_harga.toLocaleString("id-ID")}`
                                : "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="p-4 text-center">
                            Belum ada riwayat penjualan untuk kebun ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              {/* SECTION 2 PEMINJAMAN */}
              <SectionCard title="Peminjaman Inventaris">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-xs text-gray-500">
                    Tabel riwayat peminjaman aset kebun.
                  </p>
                  {/* Tombol Insert Pinjam HANYA MUNCUL kalau bukan GM */}
                  {!isGM && (
                    <button
                      onClick={() => setShowModalPinjam(true)}
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg shadow-green-100 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Peminjaman
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#EF8523] text-white text-[11px] uppercase tracking-wider">
                        <th className="p-4 font-bold rounded-tl-xl">No</th>
                        <th className="p-4 font-bold">Nama Peminjam</th>
                        <th className="p-4 font-bold">Tgl Pinjam</th>
                        <th className="p-4 font-bold">Nama Barang</th>
                        <th className="p-4 font-bold text-center">
                          Jumlah Dipinjam
                        </th>
                        <th className="p-4 font-bold text-center">
                          Jumlah Kembali
                        </th>
                        <th className="p-4 font-bold rounded-tr-xl">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-gray-700 bg-white">
                      {isLoading ? (
                        <tr>
                          <td colSpan="7" className="p-4 text-center">
                            Memuat data...
                          </td>
                        </tr>
                      ) : filteredPinjam.length > 0 ? (
                        filteredPinjam.map((item, index) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                          >
                            <td className="p-4 font-bold text-center">
                              {index + 1}
                            </td>
                            <td className="p-4 font-medium">
                              {item.nama_petani || "Tidak Diketahui"}
                            </td>
                            <td className="p-4 text-gray-500">
                              {item.tanggal_peminjaman}
                            </td>
                            <td className="p-4 font-bold">
                              {item.dinamis_peralatan?.nama_alat ||
                                item.dinamis_peralatan?.nama ||
                                "Alat"}
                            </td>
                            <td className="p-4 text-center font-bold text-orange-600">
                              {item.jumlah_dipinjam}
                            </td>
                            <td className="p-4 text-center font-bold text-green-600">
                              {item.jumlah_dikembalikan}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                                  item.status === "DIPINJAMKAN" ||
                                  item.status === "DIPINJAM"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : "bg-green-50 text-green-700 border-green-200"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="p-4 text-center">
                            Belum ada riwayat peminjaman.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>
          );
        })()}
      </div>

      {/* --- MODAL PENJUALAN --- */}
      {showModalJual && !isGM && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-in-center">
            <div className="bg-gradient-to-r from-[#B5302D] to-[#d43f3b] p-4 flex justify-between items-center">
              <h2 className="text-white font-bold text-sm">
                Catat Penjualan ke Petani
              </h2>
              <button
                onClick={() => setShowModalJual(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitJual} className="p-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Pilih Petani
                  </label>
                  <select
                    required
                    value={jualFormData.petani_user_id}
                    onChange={(e) =>
                      setJualFormData({
                        ...jualFormData,
                        petani_user_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#EF8523] focus:ring-2 focus:ring-[#EF8523]/20 transition-all"
                  >
                    <option value="">-- Pilih Petani --</option>
                    {opsiPetani.map((p) => (
                      <option key={p.auth_id} value={p.auth_id}>
                        {p.nama_lengkap} (No. {p.no_hp})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Jenis Barang
                    </label>
                    <select
                      required
                      value={jualFormData.jenis_barang}
                      onChange={(e) => {
                        setJualFormData({
                          ...jualFormData,
                          jenis_barang: e.target.value,
                          dinamis_item_id: "",
                        });
                        fetchOpsiBarang(e.target.value);
                      }}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                    >
                      <option value="">Pilih</option>
                      <option value="BIBIT">Bibit</option>
                      <option value="PUPUK">Pupuk</option>
                      <option value="PESTISIDA">Pestisida</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nama Barang
                    </label>
                    <select
                      required
                      disabled={!jualFormData.jenis_barang}
                      value={jualFormData.dinamis_item_id}
                      onChange={(e) =>
                        setJualFormData({
                          ...jualFormData,
                          dinamis_item_id: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none disabled:opacity-50"
                    >
                      <option value="">Pilih Barang</option>
                      {opsiBarang.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.varietas_bibit_nama ||
                            b.nama_pupuk ||
                            b.nama_pestisida ||
                            `Item #${b.id}`}{" "}
                          (Stok:{" "}
                          {b.jumlah_tersedia ||
                            b.stok_tersedia ||
                            b.sisa_stok_bibit ||
                            0}
                          )
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Jumlah
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={jualFormData.jumlah}
                      onChange={(e) =>
                        setJualFormData({
                          ...jualFormData,
                          jumlah: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Total Harga (Rp)
                    </label>
                    <input
                      type="number"
                      value={jualFormData.total_harga}
                      onChange={(e) =>
                        setJualFormData({
                          ...jualFormData,
                          total_harga: e.target.value,
                        })
                      }
                      placeholder="Opsional"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingJual}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#EF8523] hover:bg-[#d8721c]"
                >
                  {isSubmittingJual ? "Memproses..." : "Catat Penjualan"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModalJual(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-800 bg-gray-200"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL PEMINJAMAN --- */}
      {showModalPinjam && !isGM && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-in-center">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 flex justify-between items-center">
              <h2 className="text-white font-bold text-sm">
                Catat Peminjaman Alat
              </h2>
              <button
                onClick={() => setShowModalPinjam(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitPinjam} className="p-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Pilih Petani
                  </label>
                  <select
                    required
                    value={pinjamFormData.petani_user_id}
                    onChange={(e) =>
                      setPinjamFormData({
                        ...pinjamFormData,
                        petani_user_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  >
                    <option value="">-- Pilih Petani --</option>
                    {opsiPetani.map((p) => (
                      <option key={p.auth_id} value={p.auth_id}>
                        {p.nama_lengkap}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Pilih Peralatan
                  </label>
                  <select
                    required
                    value={pinjamFormData.dinamis_peralatan_id}
                    onChange={(e) =>
                      setPinjamFormData({
                        ...pinjamFormData,
                        dinamis_peralatan_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  >
                    <option value="">-- Pilih Alat --</option>
                    {opsiPeralatan.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nama_peralatan} (Tersedia: {a.jumlah_tersedia})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Jumlah Pinjam
                    </label>
                    <input
                      type="number"
                      required
                      value={pinjamFormData.jumlah_dipinjam}
                      onChange={(e) =>
                        setPinjamFormData({
                          ...pinjamFormData,
                          jumlah_dipinjam: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Tgl Pinjam
                    </label>
                    <input
                      type="date"
                      required
                      value={pinjamFormData.tanggal_peminjaman}
                      onChange={(e) =>
                        setPinjamFormData({
                          ...pinjamFormData,
                          tanggal_peminjaman: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingPinjam}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600"
                >
                  {isSubmittingPinjam ? "Memproses..." : "Catat Peminjaman"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModalPinjam(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-800 bg-gray-200"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// HELPER COMPONENT (Tetap butuh di sini)
const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden group hover:shadow-md transition-all">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />
    <h3 className="text-lg font-bold text-[#B5302D] mb-6 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

export default Operasional;
