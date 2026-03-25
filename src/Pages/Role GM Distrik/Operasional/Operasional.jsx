import React, { useState, useEffect } from "react";
import { ShoppingCart, Users, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
// Sesuaikan import config dengan struktur folder Anda
import { API_ENDPOINTS, API_BASE_URLS } from "../../../config/constants.js";
// import { useNavigate } from "react-router-dom"; // UNCOMMENT JIKA MENGGUNAKAN REACT ROUTER

const Operasional = () => {
  const navigate = useNavigate();

  // -- STATE UNTUK TRANSAKSI (JUAL & PINJAM) --
  const [riwayatJual, setRiwayatJual] = useState([]);
  const [riwayatPinjam, setRiwayatPinjam] = useState([]);
  const [isLoadingTransaksi, setIsLoadingTransaksi] = useState(false);

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

  const fetchOpsiPetani = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URLS.USER}/users/kebun/me/petani-members`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        setOpsiPetani(data);
      }
    } catch (e) {
      console.error("Gagal fetch petani", e);
    }
  };

  const fetchOpsiPeralatan = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URLS.FARM}/farm/kebun/inventaris/peralatan`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        const arrayData = Array.isArray(data)
          ? data
          : data.data || data.items || [];
        setOpsiPeralatan(arrayData);
      }
    } catch (e) {
      console.error("Gagal fetch peralatan", e);
    }
  };

  const fetchOpsiBarang = async (jenis) => {
    if (!jenis) {
      setOpsiBarang([]);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const path = jenis.toLowerCase();
      const res = await fetch(
        `${API_BASE_URLS.FARM}/farm/kebun/inventaris/${path}`,
        { headers: { Authorization: `Bearer ${token}` } },
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

  const fetchRiwayatTransaksi = async () => {
    setIsLoadingTransaksi(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const resJual = await fetch(API_ENDPOINTS.FARM.KEBUN.TRANSAKSI.JUAL, {
        method: "GET",
        headers,
      });
      if (resJual.ok) {
        const dataJual = await resJual.json();
        setRiwayatJual(dataJual);
      }

      const resPinjam = await fetch(
        API_ENDPOINTS.FARM.KEBUN.TRANSAKSI.PINJAMKAN,
        { method: "GET", headers },
      );
      if (resPinjam.ok) {
        const dataPinjam = await resPinjam.json();
        setRiwayatPinjam(dataPinjam);
      }
    } catch (error) {
      console.error("Error fetching riwayat transaksi:", error);
    } finally {
      setIsLoadingTransaksi(false);
    }
  };

  useEffect(() => {
    fetchOpsiPetani();
    fetchOpsiPeralatan();
    fetchRiwayatTransaksi();
  }, []);

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
        fetchRiwayatTransaksi();
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
        fetchRiwayatTransaksi();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10">
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

        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all bg-white text-[#B5302D] shadow-sm">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Penjualan/Peminjaman</span>
          </button>
          <button
            onClick={() => navigate("../organisasi")} // Berpindah ke route organisasi
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all text-gray-500 hover:bg-gray-200"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Organisasi</span>
          </button>
        </div>
      </div>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {/* SECTION 1 PENJUALAN BARANG */}
        <SectionCard title="Penjualan Barang">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs text-gray-500">
              Tabel riwayat penjualan barang ke petani/anggota.
            </p>
            <button
              onClick={() => setShowModalJual(true)}
              className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg shadow-green-100 transition-all"
            >
              <Plus className="w-3 h-3" /> Jual Barang
            </button>
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
                  <th className="p-4 font-bold rounded-tr-xl">ID/Nota</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-700 bg-white">
                {isLoadingTransaksi ? (
                  <tr>
                    <td colSpan="8" className="p-4 text-center">
                      Memuat data...
                    </td>
                  </tr>
                ) : riwayatJual.length > 0 ? (
                  riwayatJual.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                    >
                      <td className="p-4 font-bold text-center">{index + 1}</td>
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
                      <td className="p-4 text-gray-400 italic">#{item.id}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-4 text-center">
                      Belum ada riwayat penjualan.
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
            <button
              onClick={() => setShowModalPinjam(true)}
              className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg shadow-green-100 transition-all"
            >
              <Plus className="w-3 h-3" /> Peminjaman
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EF8523] text-white text-[11px] uppercase tracking-wider">
                  <th className="p-4 font-bold rounded-tl-xl">No</th>
                  <th className="p-4 font-bold">Nama Peminjam</th>
                  <th className="p-4 font-bold">Tgl Pinjam</th>
                  <th className="p-4 font-bold">Nama Barang</th>
                  <th className="p-4 font-bold text-center">Jumlah Dipinjam</th>
                  <th className="p-4 font-bold text-center">Jumlah Kembali</th>
                  <th className="p-4 font-bold rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-700 bg-white">
                {isLoadingTransaksi ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center">
                      Memuat data...
                    </td>
                  </tr>
                ) : riwayatPinjam.length > 0 ? (
                  riwayatPinjam.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                    >
                      <td className="p-4 font-bold text-center">{index + 1}</td>
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
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border ${item.status === "DIPINJAMKAN" || item.status === "DIPINJAM" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-green-50 text-green-700 border-green-200"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center">
                      Belum ada riwayat peminjaman.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* MODAL JUAL BARANG */}
      {showModalJual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModalJual(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="bg-[#EF8523] p-5 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Catat Penjualan Barang</h3>
              <button
                onClick={() => setShowModalJual(false)}
                className="p-1 hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitJual} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pilih Petani <span className="text-red-500">*</span>
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
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                >
                  <option value="">-- Pilih Petani --</option>
                  {opsiPetani.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_lengkap}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Jenis Barang <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={jualFormData.jenis_barang}
                  onChange={(e) => {
                    const jenis = e.target.value;
                    setJualFormData({
                      ...jualFormData,
                      jenis_barang: jenis,
                      dinamis_item_id: "",
                    });
                    fetchOpsiBarang(jenis);
                  }}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                >
                  <option value="">-- Pilih Jenis --</option>
                  <option value="Bibit">Bibit</option>
                  <option value="Pupuk">Pupuk</option>
                  <option value="Pestisida">Pestisida</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pilih Barang <span className="text-red-500">*</span>
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
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none disabled:bg-gray-200"
                >
                  <option value="">
                    {jualFormData.jenis_barang
                      ? "-- Pilih Barang --"
                      : "Pilih Jenis Barang Dulu"}
                  </option>
                  {opsiBarang.map((b, index) => {
                    const itemId = b.id;
                    const itemName =
                      b.nama_item ||
                      b.nama_varietas ||
                      b.nama_pupuk ||
                      b.nama_pestisida ||
                      b.nama ||
                      "Item Tidak Bernama";
                    const sisa =
                      b.jumlah_per_buah ??
                      b.jumlah_tersisa ??
                      b.jumlah ??
                      b.stok ??
                      b.total_stok ??
                      b.sisa_stok ??
                      b.stok_tersisa ??
                      0;
                    return (
                      <option key={itemId || `brg-${index}`} value={itemId}>
                        {itemName} (Sisa Stok: {sisa})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Jumlah Barang <span className="text-red-500">*</span>
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
                    Total Harga
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
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingJual}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600"
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

      {/* MODAL PINJAM ALAT */}
      {showModalPinjam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModalPinjam(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="bg-[#EF8523] p-5 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Catat Peminjaman Alat</h3>
              <button
                onClick={() => setShowModalPinjam(false)}
                className="p-1 hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitPinjam} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pilih Petani <span className="text-red-500">*</span>
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
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                >
                  <option value="">-- Pilih Petani --</option>
                  {opsiPetani.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_lengkap}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pilih Peralatan <span className="text-red-500">*</span>
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
                  {opsiPeralatan.map((alat, index) => {
                    const alatId =
                      alat.dinamis_item_id ||
                      alat.id ||
                      alat.dinamis_peralatan_id;
                    const alatName =
                      alat.nama_item ||
                      alat.nama_peralatan ||
                      alat.nama_alat ||
                      alat.nama ||
                      "Alat Tidak Bernama";
                    const sisaAlat =
                      alat.jumlah_per_buah ??
                      alat.jumlah_tersisa ??
                      alat.jumlah ??
                      alat.stok ??
                      alat.total_stok ??
                      alat.sisa_stok ??
                      alat.stok_tersisa ??
                      0;
                    return (
                      <option key={alatId || `alat-${index}`} value={alatId}>
                        {alatName} (Sisa: {sisaAlat})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Jumlah Dipinjam <span className="text-red-500">*</span>
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
                    Tanggal Pinjam <span className="text-red-500">*</span>
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
