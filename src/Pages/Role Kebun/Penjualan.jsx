import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import {
  Store,
  ShoppingCart,
  MapPin,
  Calendar,
  CheckCircle2,
  DollarSign,
  History,
  Save,
  X,
  Navigation,
  Map as MapIcon,
  Loader2,
  Clock,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Truck,
  Info as InfoIcon,
  FileText,
} from "lucide-react";
import { API_ENDPOINTS } from "../../config/constants";

// --- Konfigurasi Leaflet Icon ---
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Helper Map Component ---
function ClickToSetMarker({ setPos }) {
  useMapEvents({
    click(e) {
      setPos(e.latlng);
    },
  });
  return null;
}
const Penjualan = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- LOGIKA TAB BERDASARKAN URL ---
  // Jika URL mengandung "progrespengajuan", aktifkan tab riwayat. Jika tidak, default ke lowongan.
  const activeTab = location.pathname.includes("progrespengajuan")
    ? "riwayat"
    : "lowongan";

  const [viewState, setViewState] = useState("list");
  const [selectedPabrik, setSelectedPabrik] = useState(null);

  // --- FORM PENGAJUAN ---
  const [formData, setFormData] = useState({
    nama_grup: "",
    tanggal_panen: "",
    alamat_pickup: "",
    latitude_pickup: "",
    longitude_pickup: "",
    catatan: "",
  });

  const [matchingPanen, setMatchingPanen] = useState([]);

  // --- STATE TAMBAHAN UNTUK SKENARIO PICKUP ---
  // Opsi: "petani" atau "manual"
  const [sumberPickup, setSumberPickup] = useState("petani");
  const [selectedPetaniPickupId, setSelectedPetaniPickupId] = useState("");

  // Fungsi dipanggil ketika dropdown petani dipilih
  const handleSelectPetani = (petaniId) => {
    setSelectedPetaniPickupId(petaniId);

    // Cari data petani yang sesuai dari array matchingPanen
    const selectedPetani = matchingPanen.find((p) => {
      const pid =
        p.id || p.rencana_panen_id || p.rencana_id || p.id_rencana_panen;
      return pid.toString() === petaniId.toString();
    });

    if (selectedPetani) {
      const alamatPetani =
        selectedPetani.alamat_asal_sawit ||
        selectedPetani.alamatKebun ||
        `Lokasi Petani: ${selectedPetani.nama_petani || selectedPetani.petani}`;

      setFormData((prev) => ({
        ...prev,
        latitude_pickup:
          selectedPetani.koordinat_petani?.latitude ||
          selectedPetani.latitude ||
          "",
        longitude_pickup:
          selectedPetani.koordinat_petani?.longitude ||
          selectedPetani.longitude ||
          "",
        alamat_pickup: alamatPetani,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        latitude_pickup: "",
        longitude_pickup: "",
        alamat_pickup: "",
      }));
    }
  };

  // State UI Peta
  const [showMapModal, setShowMapModal] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapPos, setMapPos] = useState(null);

  // --- FUNGSI GPS OTOMATIS ---
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung Geolocation.");
      return;
    }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMapPos({ lat, lng });
        setFormData((prev) => ({
          ...prev,
          latitude_pickup: lat,
          longitude_pickup: lng,
        }));
        setIsLoadingLocation(false);
      },
      (err) => {
        setIsLoadingLocation(false);
        console.error("Error GPS:", err); // <-- error sekarang digunakan
        alert(
          "Gagal mengambil lokasi. Mohon aktifkan GPS atau beri izin browser.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // Efek jika user memilih pickup dari Petani
  useEffect(() => {
    if (sumberPickup === "petani" && selectedPetaniPickupId) {
      const petani = matchingPanen.find((p) => {
        const pid =
          p.id || p.rencana_panen_id || p.rencana_id || p.id_rencana_panen;
        return parseInt(pid) === parseInt(selectedPetaniPickupId);
      });

      if (petani) {
        setFormData((prev) => ({
          ...prev,
          alamat_pickup:
            petani.alamat_asal_sawit ||
            petani.alamatKebun ||
            "Alamat tidak tersedia",
          latitude_pickup:
            parseFloat(petani.koordinat_petani?.latitude) ||
            parseFloat(petani.latitude) ||
            0.0,
          longitude_pickup:
            parseFloat(petani.koordinat_petani?.longitude) ||
            parseFloat(petani.longitude) ||
            0.0,
        }));
      }
    }
  }, [sumberPickup, selectedPetaniPickupId, matchingPanen]);

  // Efek memantau titik peta manual
  useEffect(() => {
    if (sumberPickup === "manual" && mapPos) {
      setFormData((prev) => ({
        ...prev,
        latitude_pickup: mapPos.lat,
        longitude_pickup: mapPos.lng,
      }));
    }
  }, [mapPos, sumberPickup]);

  const [selectedPanenIds, setSelectedPanenIds] = useState([]);
  const [isLoadingMatching, setIsLoadingMatching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE DATA API: KEBUTUHAN PABRIK ---
  const [lowonganPabrik, setLowonganPabrik] = useState([]);
  const [isLoadingLowongan, setIsLoadingLowongan] = useState(false);

  // --- STATE DATA API: RIWAYAT PENGAJUAN ---
  const [riwayatPengajuan, setRiwayatPengajuan] = useState([]);
  const [isLoadingRiwayat, setIsLoadingRiwayat] = useState(false);

  // Fungsi Fetch Data dari Backend
  const fetchKebutuhanPabrik = async () => {
    setIsLoadingLowongan(true);
    try {
      const token = localStorage.getItem("token"); // Ambil token auth
      const response = await fetch(
        API_ENDPOINTS.FARM.MARKETPLACE.GET_KEBUTUHAN_AKTIF,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (response.ok) {
        setLowonganPabrik(data);
      } else {
        console.error("Gagal load kebutuhan pabrik:", data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoadingLowongan(false);
    }
  };

  // Fungsi Fetch Riwayat Pengajuan (Gabungan GET_PENGAJUAN_MASUK & GET_RIWAYAT_PENGAJUAN)
  const fetchRiwayatPengajuan = async () => {
    setIsLoadingRiwayat(true);
    try {
      const token = localStorage.getItem("token");

      // 1. Jalankan 2 request API secara bersamaan (Paralel) agar loading tidak lama
      const [resMasuk, resRiwayat] = await Promise.all([
        fetch(API_ENDPOINTS.FARM.MARKETPLACE.GET_PENGAJUAN_MASUK, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(API_ENDPOINTS.FARM.MARKETPLACE.GET_RIWAYAT_PENGAJUAN, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let dataMasuk = [];
      let dataRiwayat = [];

      // 2. Parse hasil response Pengajuan Masuk (Aktif)
      if (resMasuk.ok) {
        dataMasuk = await resMasuk.json();
        console.log("=== DATA PENGAJUAN MASUK (ATAS) ===", dataMasuk);
      } else {
        console.error("Gagal load pengajuan masuk");
      }

      // 3. Parse hasil response Riwayat Pengajuan (Lama/Selesai)
      if (resRiwayat.ok) {
        dataRiwayat = await resRiwayat.json();
        console.log("=== DATA RIWAYAT PENGAJUAN (BAWAH) ===", dataRiwayat);
      } else {
        console.error("Gagal load riwayat pengajuan");
      }

      // 4. GABUNGKAN DATA: Pengajuan Masuk ditaruh PALING ATAS, Riwayat di BAWAH
      const combinedData = [...dataMasuk, ...dataRiwayat];

      console.log("=== TOTAL DATA GABUNGAN ===", combinedData);

      // Simpan ke state untuk dirender di layar
      setRiwayatPengajuan(combinedData);
    } catch (error) {
      console.error("Fetch error riwayat gabungan:", error);
      setRiwayatPengajuan([]);
    } finally {
      setIsLoadingRiwayat(false);
    }
  };

  // --- FUNGSI MENCARI RENCANA PANEN YANG COCOK (GET_MATCHING_PANEN) ---
  const fetchMatchingPanen = async (tanggal) => {
    if (!selectedPabrik || !tanggal) return;

    setIsLoadingMatching(true);
    try {
      const token = localStorage.getItem("token");
      // Format query params sesuai BE: ?kebutuhan_id=1&tanggal_pilih=2025-09-25
      const url = `${API_ENDPOINTS.FARM.MARKETPLACE.GET_MATCHING_PANEN}?kebutuhan_id=${selectedPabrik.id}&tanggal_pilih=${tanggal}`;

      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setMatchingPanen(data);
        console.log("Data matching dari BE:", JSON.stringify(data[0], null, 2));
      } else {
        console.error("Gagal get matching panen:", data);
        setMatchingPanen([]);
      }
    } catch (error) {
      console.error("Error matching panen:", error);
    } finally {
      setIsLoadingMatching(false);
    }
  };

  // Handler jika input text/date berubah
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Jika yang berubah adalah tanggal, trigger fetch matching panen
    if (name === "tanggal_panen") {
      fetchMatchingPanen(value);
      setSelectedPanenIds([]); // Reset centang jika tanggal berubah
    }
  };

  // Handler untuk centang checkbox rencana panen
  const handleCheckboxChange = (id) => {
    // Guard: jangan masukkan id yang null/undefined/NaN ke array
    const safeId = parseInt(id);
    if (isNaN(safeId)) {
      console.error("handleCheckboxChange: id tidak valid →", id);
      return;
    }
    setSelectedPanenIds((prev) =>
      prev.includes(safeId)
        ? prev.filter((item) => item !== safeId)
        : [...prev, safeId],
    );
  };

  // --- [GANTI DENGAN KODE INI] ---
  const handleSubmitPengajuan = async () => {
    if (!selectedPabrik?.id) {
      alert("Error: Lowongan Pabrik belum terpilih!");
      return;
    }
    if (!formData.nama_grup || !formData.alamat_pickup) {
      alert("Lengkapi Nama Grup dan Alamat Pickup!");
      return;
    }
    if (!formData.latitude_pickup || !formData.longitude_pickup) {
      alert("Koordinat pickup belum diisi! Masukkan latitude dan longitude.");
      return;
    }
    if (selectedPanenIds.length === 0) {
      alert("Pilih minimal 1 rencana panen petani!");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      // FORMAT PAYLOAD SUPER AMAN (Sesuai Permintaan BE)
      const payload = {
        kebutuhan_pabrik_id: parseInt(selectedPabrik.id),
        nama_grup: String(formData.nama_grup),
        rencana_panen_ids: selectedPanenIds.map((id) => parseInt(id)),
        alamat_pickup_teks: String(
          formData.alamat_pickup || "Alamat Tidak Tersedia",
        ),
        latitude_pickup: parseFloat(formData.latitude_pickup) || 0.0,
        longitude_pickup: parseFloat(formData.longitude_pickup) || 0.0,
        catatan_kebun: formData.catatan ? String(formData.catatan) : "", // <-- TIDAK BOLEH NULL
      };

      console.log("Payload yang siap dikirim ke BE:", payload);

      const response = await fetch(
        API_ENDPOINTS.FARM.MARKETPLACE.CREATE_GRUP_PENJUALAN,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Pengajuan Grup Penjualan Berhasil!");
        setFormData({
          nama_grup: "",
          tanggal_panen: "",
          alamat_pickup: "",
          latitude_pickup: "",
          longitude_pickup: "",
          catatan: "",
        });
        setSelectedPanenIds([]);
        setMatchingPanen([]);
        handleBackToList();
      } else {
        // PEMBACA ERROR DARI BE JIKA TERJADI 422
        if (response.status === 422 && Array.isArray(data.detail)) {
          const detailError = data.detail
            .map(
              (err) => `- Kolom "${err.loc[err.loc.length - 1]}": ${err.msg}`,
            )
            .join("\n");
          alert(
            "Gagal Validasi (422):\nAda data yang ditolak Backend:\n\n" +
              detailError,
          );
        } else {
          alert(
            "Gagal Request BE: " +
              (data.message || data.detail || "Cek kembali data Anda."),
          );
        }
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger API Call saat tab berganti di view "list"
  useEffect(() => {
    if (viewState === "list") {
      if (activeTab === "lowongan") {
        fetchKebutuhanPabrik();
      } else if (activeTab === "riwayat") {
        fetchRiwayatPengajuan();
      }
    }
  }, [activeTab, viewState]);

  // --- Navigasi Flow Functions ---

  // Membuka form pengajuan penjualan LANGSUNG dari card list
  const handleAjukanLangsung = (pabrik) => {
    setSelectedPabrik(pabrik);
    setViewState("form");
  };

  // Kembali ke tampilan list utama
  const handleBackToList = () => {
    setViewState("list");
    setSelectedPabrik(null);
  };

  // Helper untuk menentukan judul SectionCard
  const getSectionTitle = () => {
    if (viewState === "form") return "Form Pengajuan Penjualan";
    return activeTab === "lowongan"
      ? "Ajukan Penjualan TBS ke Pabrik"
      : "Status Pengajuan Penjualan";
  };

  // --- TAMBAHKAN FUNGSI INI ---
  const getSectionSubtitle = () => {
    if (viewState === "form") return "";
    return activeTab === "lowongan"
      ? "Berikut daftar permintaan kebutuhan pabrik yang tersedia."
      : "Pantau status pengajuan penjualan TBS Anda di sini.";
  };

  return (
    <div className="space-y-6 p-4 md:p-8 min-h-screen font-sans">
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 sm:mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <ShoppingCart className="w-8 h-8 text-[#B5302D]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#B5302D]">
              Penjualan TBS Ke Pabrik
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Ajukan penjualan TBS ke pabrik dan pantau status pengajuan Anda
              dengan mudah.
            </p>
          </div>
        </div>

        {/* Bagian Kanan: Tab Switcher (Hanya view List) */}
        {viewState === "list" && (
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full sm:w-auto overflow-x-auto hide-scrollbar shrink-0">
            <button
              onClick={() => navigate("/kebun/penjualan/kebutuhanpabrik")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                activeTab === "lowongan"
                  ? "bg-white text-[#B5302D] shadow-sm"
                  : "text-gray-500 hover:bg-gray-200/50"
              }`}
            >
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="whitespace-nowrap">Kebutuhan Pabrik</span>
            </button>
            <button
              onClick={() => navigate("/kebun/penjualan/progrespengajuan")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                activeTab === "riwayat"
                  ? "bg-white text-[#B5302D] shadow-sm"
                  : "text-gray-500 hover:bg-gray-200/50"
              }`}
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="whitespace-nowrap">Progres Pengajuan</span>
            </button>
          </div>
        )}
      </div>

      {/* --- GARIS PEMBATAS --- */}
      <hr className="border-gray-200 mb-8" />

      {/* --- CONTENT AREA (Wrapped in SectionCard) --- */}
      <SectionCard
        title={getSectionTitle()}
        subtitle={getSectionSubtitle()} // <-- Mengirimkan teks menempel ke judul
        rightContent={
          // LOGIKA UX: Hanya muncul di tab "Progres Pengajuan" dan jika ada data yang disetujui
          viewState === "list" &&
          activeTab === "riwayat" &&
          riwayatPengajuan.some((item) =>
            (item.status_pengajuan || item.statusAsliText || item.status || "")
              .toLowerCase()
              .includes("setuju"),
          ) && (
            // w-max membuat kotak tidak terpotong di mobile dan bisa di-scroll ke kanan
            <div className="flex items-center gap-2 sm:gap-3 bg-white border border-[#EF8523]/30 p-1.5 sm:pr-2.5 rounded-full shadow-[0_0_15px_rgba(239,133,35,0.15)] animate-pulse hover:animate-none transition-all w-max md:w-auto">
              <div className="bg-gradient-to-br from-[#EF8523] to-[#d9751d] p-1.5 sm:p-2 rounded-full text-white shrink-0 shadow-sm">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>

              {/* KUNCI PERBAIKAN: "hidden sm:block" DHAPUS, diganti "whitespace-nowrap" agar teks aman di HP */}
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-700 leading-tight whitespace-nowrap">
                Jika Pengajuan
                <br />
                <span className="text-[#EF8523] font-black">
                  Disetujui Kebun!
                </span>
              </p>

              <button
                onClick={() =>
                  navigate("/kebun/distribusi&logistik/mencarilogistik")
                }
                className="bg-[#EF8523] hover:bg-[#d9751d] active:scale-95 text-white px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5 whitespace-nowrap ml-1"
              >
                Cari Logistik &rarr;
              </button>
            </div>
          )
        }
      >
        {/* VIEW: LIST (Lowongan & Riwayat) */}
        {viewState === "list" && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            {activeTab === "lowongan" ? (
              <div className="space-y-6">
                {/* --- TEKS LAMA DIHAPUS DARI SINI --- */}
                <div className="grid grid-cols-1 gap-4">
                  {isLoadingLowongan ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-8 h-8 text-[#B5302D] animate-spin" />
                    </div>
                  ) : lowonganPabrik.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm font-medium bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                      Saat ini belum ada pengumuman kebutuhan pabrik yang aktif.
                    </div>
                  ) : (
                    lowonganPabrik.map((item) => (
                      <PabrikCard
                        key={item.id}
                        item={item}
                        onAjukan={() => handleAjukanLangsung(item)}
                      />
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* --- TEKS LAMA DIHAPUS DARI SINI --- */}
                <div className="space-y-4">
                  {isLoadingRiwayat ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-8 h-8 text-[#B5302D] animate-spin" />
                    </div>
                  ) : riwayatPengajuan.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm font-medium bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                      Anda belum memiliki riwayat pengajuan penjualan.
                    </div>
                  ) : (
                    riwayatPengajuan.map((item, index) => {
                      // Formatting Data dari BE ke format tampilan
                      const tglAjuanFormat = new Date(
                        item.created_at,
                      ).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });
                      const tglPanenFormat = new Date(
                        item.tanggal_rencana_panen,
                      ).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });

                      // Mapping logic status dinamis untuk warna label
                      const statusRaw = (
                        item.status_pengajuan || ""
                      ).toLowerCase();
                      let statusColor = "pending"; // default kuning
                      if (statusRaw.includes("setuju"))
                        statusColor = "accepted"; // hijau
                      if (statusRaw.includes("tolak")) statusColor = "rejected"; // merah

                      // Susun ulang objek dengan data BARU DARI BE
                      const mappedItem = {
                        id: item.id,
                        grup: item.nama_grup,
                        pabrik_id: item.kebutuhan_pabrik_id,
                        tglAjuan: tglAjuanFormat,
                        tglPanen: tglPanenFormat,
                        estimasi: item.estimasi_total_tbs_grup_kg,
                        status: statusColor,
                        statusAsliText: item.status_pengajuan,
                        alamat_pickup: item.alamat_pickup_teks,
                        jarak: item.estimasi_jarak_km,
                        varietas: item.jenis_varietas_gabungan,
                        catatan_kebun: item.catatan_kebun,
                        catatan_pabrik: item.catatan_dari_pabrik,
                      };

                      return (
                        <RiwayatCard
                          key={item.id}
                          item={mappedItem}
                          index={index + 1}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: FORM AJUKAN */}
        {viewState === "form" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6">
              {/* Info singkat pabrik yang dituju di form */}
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-100">
                <Store className="w-4 h-4 text-[#B5302D]" />
                <span className="text-xs font-bold text-[#B5302D]">
                  Tujuan: {selectedPabrik?.nama_pabrik || "Pabrik Terpilih"}
                </span>
              </div>
              <button
                onClick={handleBackToList}
                className="p-2 bg-gray-50 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Field Nama Grup */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase">
                  Nama Grup Penjualan
                </label>
                <input
                  type="text"
                  name="nama_grup"
                  value={formData.nama_grup}
                  onChange={handleFormChange}
                  placeholder="Masukkan nama grup..."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none transition-all"
                />
              </div>
              {/* Field Tanggal Rencana (Memicu Endpoint GET) */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase">
                  Tanggal Rencana Panen
                </label>
                <input
                  type="date"
                  name="tanggal_panen"
                  value={formData.tanggal_panen}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none transition-all"
                />
              </div>
            </div>

            {/* Selector Rencana Panen (Dinamis dari BE) */}
            <div className="space-y-3 mb-8">
              <label className="text-[11px] font-bold text-gray-500 uppercase">
                Pilih Sumber Rencana Panen Anda (Berdasarkan Tanggal)
              </label>
              <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 bg-white space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {!formData.tanggal_panen ? (
                  <p className="text-center text-xs text-gray-400 py-4">
                    Silakan pilih Tanggal Rencana Panen terlebih dahulu.
                  </p>
                ) : isLoadingMatching ? (
                  <p className="text-center text-xs text-gray-400 py-4">
                    Mencari rencana panen yang cocok...
                  </p>
                ) : matchingPanen.length === 0 ? (
                  <p className="text-center text-xs text-red-400 py-4">
                    Tidak ada rencana panen yang cocok pada tanggal ini.
                  </p>
                ) : (
                  matchingPanen.map((plan, index) => {
                    const planId = plan.id_rencana_panen;

                    return (
                      <label
                        key={planId || index}
                        className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-red-50 hover:border-red-100 cursor-pointer transition-all group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPanenIds.includes(parseInt(planId))}
                          onChange={() => {
                            handleCheckboxChange(planId);
                            setSelectedPetaniPickupId(planId);

                            setFormData((prev) => ({
                              ...prev,
                              latitude_pickup:
                                plan.koordinat_petani?.latitude ||
                                plan.latitude ||
                                0,
                              longitude_pickup:
                                plan.koordinat_petani?.longitude ||
                                plan.longitude ||
                                0,
                            }));
                          }}
                          className="mt-1 w-4 h-4 text-[#B5302D] rounded border-gray-300 focus:ring-[#B5302D]"
                        />
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                          <div>
                            {/* Asumsi mapping BE: plan.nama_petani */}
                            <p className="text-sm font-bold text-gray-800">
                              {plan.nama_petani || plan.petani}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{" "}
                              {plan.alamat_asal_sawit ||
                                plan.alamatKebun ||
                                "Alamat Kebun"}
                            </p>
                          </div>
                          <div className="text-left sm:text-right flex flex-col gap-1.5 mt-3 pt-3 border-t border-gray-100 sm:mt-0 sm:pt-0 sm:border-0">
                            <p className="text-xs text-gray-500">
                              Estimasi TBS:{" "}
                              <span className="font-bold text-[#B5302D] text-sm">
                                {plan.estimasi_tbs_kg
                                  ? `${plan.estimasi_tbs_kg} Kg`
                                  : "0 Kg"}
                              </span>
                            </p>
                            <div className="text-[10px] text-gray-500 flex flex-col sm:items-end gap-0.5">
                              <p>
                                Jenis Sawit:{" "}
                                <span className="font-bold text-gray-700">
                                  {plan.jenis_sawit || "-"}
                                </span>
                              </p>
                              <p>
                                Varietas:{" "}
                                <span className="font-bold text-gray-700">
                                  {plan.nama_varietas || "-"}
                                </span>
                              </p>
                              <p>
                                Tgl Tanam:{" "}
                                <span className="font-bold text-gray-700">
                                  {plan.tanggal_tanam_blok || "-"}
                                </span>
                              </p>
                              <p>
                                Usia Pohon:{" "}
                                <span className="font-bold text-gray-700">
                                  {plan.usia_pohon_sawit || "-"}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* PENGATURAN LOKASI PICKUP */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 mb-8 space-y-5">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-3">
                  Skenario Lokasi Penjemputan (Pickup)
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer flex-1 transition-all ${sumberPickup === "petani" ? "bg-red-50 border-[#B5302D]" : "bg-white border-gray-200"}`}
                  >
                    <input
                      type="radio"
                      name="sumberPickup"
                      value="petani"
                      checked={sumberPickup === "petani"}
                      onChange={(e) => setSumberPickup(e.target.value)}
                      className="w-4 h-4 text-[#B5302D] focus:ring-[#B5302D]"
                    />
                    <span className="text-sm font-bold text-gray-700">
                      Pilih dari Lokasi Petani
                    </span>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer flex-1 transition-all ${sumberPickup === "manual" ? "bg-red-50 border-[#B5302D]" : "bg-white border-gray-200"}`}
                  >
                    <input
                      type="radio"
                      name="sumberPickup"
                      value="manual"
                      checked={sumberPickup === "manual"}
                      onChange={(e) => {
                        setSumberPickup(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          alamat_pickup: "",
                          latitude_pickup: "",
                          longitude_pickup: "",
                        }));
                      }}
                      className="w-4 h-4 text-[#B5302D] focus:ring-[#B5302D]"
                    />
                    <span className="text-sm font-bold text-gray-700">
                      Input Manual / Titik Baru
                    </span>
                  </label>
                </div>
              </div>

              {/* RENDER BERDASARKAN SKENARIO */}
              {sumberPickup === "petani" && (
                <div className="space-y-3 animate-fade-in">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    Pilih Petani sebagai Titik Pickup
                  </label>
                  <select
                    value={selectedPetaniPickupId}
                    onChange={(e) => handleSelectPetani(e.target.value)}
                  >
                    <option value="" disabled>
                      -- Pilih Petani dari rencana panen di atas --
                    </option>
                    {matchingPanen
                      .filter((p) => {
                        // Tambahkan p.id_rencana_panen
                        const pid =
                          p.id ||
                          p.rencana_panen_id ||
                          p.rencana_id ||
                          p.id_rencana_panen;
                        return selectedPanenIds.includes(parseInt(pid));
                      })
                      .map((petani, idx) => {
                        // Tambahkan petani.id_rencana_panen
                        const pid =
                          petani.id ||
                          petani.rencana_panen_id ||
                          petani.rencana_id ||
                          petani.id_rencana_panen;
                        return (
                          <option key={pid || idx} value={pid}>
                            {petani.nama_petani || petani.petani} -{" "}
                            {petani.alamat_asal_sawit ||
                              petani.alamatKebun ||
                              "Alamat tidak tersedia"}
                          </option>
                        );
                      })}
                  </select>
                  {selectedPanenIds.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Silakan centang rencana panen di atas terlebih dahulu.
                    </p>
                  )}

                  {/* Readonly preview */}
                  {selectedPetaniPickupId && (
                    <div className="p-3 bg-white rounded-xl border border-gray-100 mt-2 space-y-1">
                      <p className="text-xs text-gray-500">
                        Alamat Jemput:{" "}
                        <span className="font-semibold text-gray-800">
                          {formData.alamat_pickup || "Tidak tersedia"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Koordinat:{" "}
                        <span className="font-mono text-gray-800">
                          {formData.latitude_pickup && formData.longitude_pickup
                            ? `${formData.latitude_pickup}, ${formData.longitude_pickup}`
                            : "Koordinat tidak tersedia"}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {sumberPickup === "manual" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">
                      Alamat Pickup Lengkap
                    </label>
                    <input
                      type="text"
                      name="alamat_pickup"
                      value={formData.alamat_pickup}
                      onChange={handleFormChange}
                      placeholder="Masukkan alamat lengkap penjemputan..."
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#B5302D]"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">
                      Titik Koordinat (Latitude & Longitude)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {isLoadingLocation ? (
                            <Loader2
                              size={16}
                              className="text-[#EF8523] animate-spin"
                            />
                          ) : (
                            <Navigation size={16} className="text-gray-400" />
                          )}
                        </div>
                        <input
                          type="text"
                          value={
                            formData.latitude_pickup &&
                            formData.longitude_pickup
                              ? `${formData.latitude_pickup}, ${formData.longitude_pickup}`
                              : ""
                          }
                          readOnly
                          placeholder="Gunakan GPS atau Buka Peta..."
                          className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm font-mono tracking-wide bg-white border-gray-200 outline-none"
                        />
                      </div>
                      <div className="flex gap-2 sm:w-auto w-full">
                        <button
                          type="button"
                          onClick={handleRequestLocation}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-[#EF8523] flex items-center justify-center gap-2 shadow-sm font-semibold text-xs transition-all"
                        >
                          {isLoadingLocation ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Navigation size={18} />
                          )}
                          GPS
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowMapModal(true)}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-100 text-[#EF8523] hover:bg-orange-100 flex items-center justify-center gap-2 shadow-sm font-semibold text-sm transition-all"
                        >
                          <MapIcon size={18} />
                          Peta
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 mb-8">
              <label className="text-[11px] font-bold text-gray-500 uppercase">
                Catatan Tambahan
              </label>
              <textarea
                name="catatan"
                value={formData.catatan}
                onChange={handleFormChange}
                placeholder="Tulis catatan untuk pabrik..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#B5302D] outline-none transition-all min-h-[100px]"
              ></textarea>
            </div>

            {/* --- TOMBOL AKSI (ACTION BUTTONS) --- */}
            {/* flex-col-reverse di mobile membuat tombol utama ada di atas tombol batal */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={handleBackToList}
                className="w-full sm:w-auto px-6 py-3.5 sm:py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm sm:text-xs font-bold hover:bg-gray-200 transition-all text-center"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitPengajuan}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 sm:py-2.5 bg-[#B5302D] text-white rounded-xl text-sm sm:text-xs font-bold shadow-lg shadow-red-100 hover:bg-[#962624] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}
              </button>
            </div>

            {/* --- MODAL PETA MANUAL --- */}

            {showMapModal && (
              <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                  {/* Tinggi disesuaikan: 60vh di mobile, 400px di layar sm/desktop */}
                  <div className="h-[60vh] sm:h-[400px] w-full relative">
                    <MapContainer
                      center={mapPos || [-2.5489, 118.0149]}
                      zoom={mapPos ? 15 : 5}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <ClickToSetMarker setPos={setMapPos} />
                      {mapPos && <Marker position={mapPos} />}
                    </MapContainer>
                    <div className="absolute top-4 left-4 z-[1000] bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-gray-200">
                      <p className="text-[10px] sm:text-xs font-bold text-gray-700 flex items-center gap-2">
                        <MapPin size={14} className="text-red-500" /> Klik peta
                        untuk menentukan titik
                      </p>
                    </div>
                  </div>
                  {/* Tombol responsif: Menumpuk di mobile, sejajar di desktop */}
                  <div className="p-4 border-t bg-white flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button
                      onClick={() => setShowMapModal(false)}
                      className="w-full sm:w-auto px-5 py-3.5 sm:py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition text-center"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={() => setShowMapModal(false)}
                      className="w-full sm:w-auto px-6 py-3.5 sm:py-2.5 bg-[#B5302D] text-white rounded-xl text-sm font-bold hover:bg-black transition shadow-lg text-center"
                    >
                      Simpan Titik Ini
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* --- AKHIR MODAL PETA --- */}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

/* ===================== COMPONENT HELPERS ===================== */

/**
 * SectionCard
 * Wrapper UI standar untuk setiap bagian utama halaman.
 * Memberikan styling border, shadow, dan header dekoratif dengan gradient.
 */
/**
 * SectionCard
 * Wrapper UI standar untuk setiap bagian utama halaman.
 * Memberikan styling border, shadow, dan header dekoratif dengan gradient.
 */
const SectionCard = ({ title, subtitle, rightContent, children }) => (
  <div className="bg-white rounded-[30px] border border-gray-200 shadow-sm p-5 sm:p-8 relative overflow-hidden group hover:shadow-md transition-all">
    {/* Decorative Header Line */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B5302D] to-orange-500 opacity-80" />

    {/* Header Section: Flex row di desktop, Column di mobile */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-[#B5302D] flex items-center gap-2">
          {title}
        </h3>
        {/* Teks keterangan menempel di sini */}
        {subtitle && <p className="text-xs text-gray-500 mt-1.5">{subtitle}</p>}
      </div>

      {/* Area Tombol Kedip: Bisa di-scroll ke kanan di Mobile */}
      {rightContent && (
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {rightContent}
        </div>
      )}
    </div>

    {children}
  </div>
);

// Kartu Daftar Lowongan Pabrik
const PabrikCard = ({ item, onAjukan }) => {
  // Pre-processing format data dari Backend ke Frontend UI
  const kuotaTon = item.kuota_kapasitas_kg / 1000;

  // Format Tanggal (YYYY-MM-DD ke DD MMMM YYYY)
  const tglObj = new Date(item.tanggal_rencana_kebutuhan);
  const tglFormat = tglObj.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Format Rupiah
  const hargaRupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(item.harga_beli_per_kg);

  return (
    <MainCard>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-gray-900">
                {item.nama_pabrik}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3 h-3 text-gray-400" />{" "}
                {item.alamat_pabrik}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="px-3 py-1.5 bg-red-50 text-[#B5302D] rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-red-100">
              <Calendar className="w-3 h-3" /> {tglFormat}
            </div>
            <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-green-100">
              <DollarSign className="w-3 h-3" /> {hargaRupiah} /kg
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
              Jenis:{" "}
              <span className="text-gray-700 font-bold">
                {item.jenis_sawit_dibutuhkan}
              </span>
              <span className="text-gray-300">|</span>
              Kapasitas:{" "}
              <span className="text-gray-700 font-bold">{kuotaTon} Ton</span>
            </div>
          </div>
        </div>

        {/* --- BAGIAN TOMBOL YANG DIUBAH --- */}
        <div className="flex items-end md:items-center mt-2 md:mt-0">
          <button
            onClick={onAjukan}
            className="w-full md:w-auto px-6 py-2.5 bg-[#B5302D] text-white rounded-xl text-xs font-bold shadow-md shadow-red-100 hover:bg-[#962624] transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Ajukan Penjualan
          </button>
        </div>
      </div>
    </MainCard>
  );
};

// =========================================================================
// KOMPONEN: Kartu Riwayat Pengajuan (Menjiplak Style PabrikCard)
// =========================================================================
const RiwayatCard = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Tentukan warna garis kiri berdasarkan status
  const statusBorderColor =
    item.status === "accepted"
      ? "bg-green-500"
      : item.status === "rejected"
        ? "bg-red-500"
        : "bg-yellow-400";

  return (
    <div
      className={`relative bg-white rounded-[24px] border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 overflow-hidden group cursor-pointer`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Garis Indikator Status di Kiri (Seperti garis hover di MainCard) */}
      <div
        className={`absolute top-0 left-0 w-1.5 h-full ${statusBorderColor}`}
      />
      {/* --- HEADER & INFO SEPERTI PABRIKCARD --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ml-1">
        {/* Kiri: Judul dan Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-black flex items-center gap-2">
                Grup: {item.grup}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-500 flex items-center gap-1.5 mt-1.5 font-bold">
                <MapIcon className="w-3 h-3 text-gray-400" /> Jarak Estimasi
                Kebun-Pabrik : {item.jarak ? `${item.jarak} KM` : "Jarak -"}
              </p>
            </div>
          </div>

          {/* Barisan Badge (Persis susunan PabrikCard) */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Badge Status */}
            <div
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border ${
                item.status === "accepted"
                  ? "bg-green-50 text-green-700 border-green-100"
                  : item.status === "rejected"
                    ? "bg-red-50 text-red-700 border-red-100"
                    : "bg-yellow-50 text-yellow-700 border-yellow-100"
              }`}
            >
              {item.status === "accepted" && (
                <CheckCircle2 className="w-3 h-3" />
              )}
              {item.status === "pending" && <Clock className="w-3 h-3" />}
              {item.status === "rejected" && (
                <AlertCircle className="w-3 h-3" />
              )}
              {item.statusAsliText || "MENUNGGU"}
            </div>

            {/* Badge Tanggal */}
            <div className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-gray-200">
              <Calendar className="w-3 h-3 text-gray-500" /> Ajuan:{" "}
              {item.tglAjuan}
            </div>
            <div className="px-3 py-1.5 bg-red-50 text-[#B5302D] rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-red-100">
              <Calendar className="w-3 h-3" /> Panen: {item.tglPanen}
            </div>
          </div>
        </div>

        {/* Kanan: Tombol Aksi (Persis PabrikCard) */}
        <div className="flex items-end md:items-center mt-2 md:mt-0">
          <button className="w-full md:w-auto px-5 py-2.5 bg-white text-gray-600 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            {isExpanded ? "Tutup Rincian" : "Lihat Rincian"}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* --- AREA EXPANDED (Rincian Bawah) --- */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-2 ml-1">
          {/* --- KARTU DETAIL PENGIRIMAN --- */}
          {/* PERBAIKAN: Menghapus mt-4, pt-4, dan border-t di sini agar tidak dobel */}
          <div className="flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-start md:items-center">
              {/* ================= KOLOM KIRI: ALAMAT PICKUP ================= */}
              <div className="flex items-start gap-3">
                <div className="bg-orange-50 p-2.5 sm:p-3 rounded-xl border border-orange-100 shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#EF8523]" />
                </div>
                <div className="flex flex-col mt-0.5">
                  <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Titik Jemput (Pickup)
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-gray-800 leading-snug">
                    {item.alamat_pickup || "Menunggu lokasi..."}
                  </p>
                </div>
              </div>

              {/* ================= KOLOM KANAN: SPESIFIKASI (Mini Cards) ================= */}
              <div className="grid grid-cols-2 gap-3">
                {/* Kotak 1: Varietas */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col justify-center">
                  <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Varietas
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-700 truncate">
                    {item.varietas || "-"}
                  </span>
                </div>

                {/* Kotak 2: Muatan TBS (Highlight Merah) */}
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex flex-col justify-center">
                  <span className="text-[9px] sm:text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">
                    Est. Muatan
                  </span>
                  <span className="text-xs sm:text-sm font-black text-[#B5302D] truncate">
                    {item.estimasi ? `${item.estimasi} Kg` : "0 Kg"}
                  </span>
                </div>
              </div>
            </div>

            {/* ================= KOLOM BAWAH: CATATAN KEBUN ================= */}
            {item.catatan_kebun && (
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                <div className="flex items-start gap-3 bg-yellow-50/60 p-3 rounded-xl border border-yellow-100/80">
                  <FileText className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <p className="text-[9px] sm:text-[10px] font-bold text-yellow-600/80 uppercase tracking-widest mb-1">
                      Catatan Tambahan
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed italic">
                      "{item.catatan_kebun}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= CATATAN PABRIK ================= */}
          {item.catatan_pabrik && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 shadow-sm ${
                item.status === "rejected"
                  ? "bg-red-50 border-red-100 text-red-800"
                  : "bg-blue-50 border-blue-100 text-blue-800"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg bg-white shrink-0 ${
                  item.status === "rejected" ? "text-red-500" : "text-blue-500"
                }`}
              >
                <Info className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col mt-0.5">
                <p className="text-[9px] font-bold uppercase tracking-widest mb-1 opacity-80">
                  Catatan / Pesan dari Pabrik
                </p>
                <p className="text-[11px] sm:text-xs font-medium leading-relaxed italic">
                  "{item.catatan_pabrik}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Wrapper Card Utama
const MainCard = ({ children }) => (
  <div className="relative bg-white rounded-[24px] border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 overflow-hidden group">
    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#B5302D] opacity-0 group-hover:opacity-100 transition-opacity" />
    {children}
  </div>
);

export default Penjualan;
