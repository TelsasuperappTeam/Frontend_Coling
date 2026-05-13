import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import {
  X,
  Save,
  Camera,
  MapPin,
  Loader2,
  Lock,
  Info,
  CheckCircle2,
  Navigation,
  Map as MapIcon,
  Package,
  Warehouse,
  Factory,
  Database,
} from "lucide-react";
import { API_ENDPOINTS } from "../../../config/constants";

// --- Konfigurasi Leaflet Icon (TIDAK BERUBAH) ---
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
function ClickToSetMarker({ setPos, disabled }) {
  useMapEvents({
    click(e) {
      if (!disabled) {
        setPos(e.latlng);
      }
    },
  });
  return null;
}

export default function DataDiriPabrik({
  onClose,
  onSave,
  initialData,
  lockedFields,
}) {
  // --- STATE DATA ---
  const [formProfile, setFormProfile] = useState({
    alamat: "",
    jenis_produksi: "",
    kapasitas_ram_pabrik_ton: "",
  });

  // --- STATE KHUSUS CHECKBOX JENIS PABRIK ---
  const [jenisPabrikChecked, setJenisPabrikChecked] = useState([]);
  const [isLainnyaChecked, setIsLainnyaChecked] = useState(false);
  const [jenisPabrikLainnya, setJenisPabrikLainnya] = useState("");

  const [mapPos, setMapPos] = useState(null);
  const [fileFoto, setFileFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState("");

  // --- STATE UI ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // State Notifikasi & Warning Lock
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [warning, setWarning] = useState({
    foto: false,
    alamat: false,
    koordinat: false,
    jenis_produksi: false,
    jenis_pabrik: false,
    kapasitas_ram_pabrik_ton: false,
  });

  // --- EFFECT: Load Data Awal (BAGIAN YANG DIPERBAIKI) ---
  useEffect(() => {
    if (initialData) {
      console.log("Initial Data diterima di Popup:", initialData);

      // Load data text & number
      setFormProfile({
        alamat: initialData.alamat_pabrik || initialData.alamat || "",
        jenis_produksi: initialData.jenis_produksi || "",
        kapasitas_ram_pabrik_ton: initialData.kapasitas_ram_pabrik_ton || "",
      });

      // LOGIKA PECAH STRING JENIS PABRIK (CHECKBOX) ---
      if (initialData.jenis_pabrik && initialData.jenis_pabrik !== "-") {
        const parts = initialData.jenis_pabrik.split(",").map((s) => s.trim());
        const standard = [
          "Plantation/Estate",
          "Palm Oil Mill/PKS",
          "KCP (Kernel Crushing Plant)",
          "Refinery",
        ];
        const selectedStd = [];
        const selectedLain = [];

        parts.forEach((p) => {
          if (standard.includes(p)) {
            selectedStd.push(p);
          } else if (p) {
            selectedLain.push(p);
          }
        });

        setJenisPabrikChecked(selectedStd);
        if (selectedLain.length > 0) {
          setIsLainnyaChecked(true);
          setJenisPabrikLainnya(selectedLain.join(", "));
        }
      }

      // Mengambil foto profil
      setPreviewFoto(initialData.foto || "");

      // Parsing Koordinat
      if (initialData.koordinat) {
        try {
          const coords = initialData.koordinat;
          if (typeof coords === "string" && coords.includes(",")) {
            const [lat, lng] = coords
              .split(",")
              .map((s) => parseFloat(s.trim()));
            if (!isNaN(lat) && !isNaN(lng)) {
              setMapPos({ lat, lng });
            }
          }
        } catch (e) {
          console.error("Gagal parsing koordinat", e);
        }
      }
    }
  }, [initialData]);

  // --- HANDLERS (TIDAK BANYAK BERUBAH) ---

  const handleLockedClick = (fieldKey, label) => {
    setWarning((prev) => ({ ...prev, [fieldKey]: true }));
    setNotification({
      type: "info",
      message: `Data ${label} sudah tersimpan dan terkunci otomatis.`,
    });
    setTimeout(() => {
      setNotification({ type: "", message: "" });
      setWarning((prev) => ({ ...prev, [fieldKey]: false }));
    }, 3000);
  };

  const handleFileChange = (e) => {
    if (lockedFields.foto) {
      handleLockedClick("foto", "Foto Profil");
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_SIZE) {
        e.target.value = null;
        setNotification({
          type: "error",
          message:
            "Ukuran foto terlalu besar! Harap upload foto di bawah 2 MB.",
        });
        return;
      }
      setFileFoto(file);
      setPreviewFoto(URL.createObjectURL(file));
      setNotification({ type: "", message: "" });
    }
  };

  const handleRequestLocation = () => {
    if (lockedFields.koordinat) {
      handleLockedClick("koordinat", "Koordinat Lahan");
      return;
    }
    if (!navigator.geolocation) {
      setNotification({
        type: "error",
        message: "Browser tidak mendukung Geolocation.",
      });
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapPos({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoadingLocation(false);
        setNotification({
          type: "success",
          message: "Lokasi berhasil ditemukan!",
        });
        setTimeout(() => setNotification({ type: "", message: "" }), 2000);
      },
      (error) => {
        setIsLoadingLocation(false);
        let msg = "Gagal mengambil lokasi.";
        if (error.code === 1) msg = "Izin lokasi ditolak. Mohon aktifkan GPS.";
        else if (error.code === 2) msg = "Lokasi tidak tersedia.";
        else if (error.code === 3) msg = "Waktu permintaan habis.";
        setNotification({ type: "error", message: msg });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // --- SAVE DATA (PUT) ---
  const handleSubmit = async () => {
    setNotification({ type: "", message: "" });
    setIsSubmitting(true);

    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) throw new Error("Sesi habis, silakan login ulang.");

      const formData = new FormData();

      // 1. ALAMAT: Hanya kirim jika kolom tidak kosong (termasuk yg sudah terkunci)
      if (formProfile.alamat && formProfile.alamat.trim() !== "") {
        formData.append("alamat", formProfile.alamat);
      }

      // 2. KOORDINAT: Hanya kirim jika titik mapPos sudah ada
      if (mapPos && mapPos.lat && mapPos.lng) {
        formData.append("latitude", String(mapPos.lat));
        formData.append("longitude", String(mapPos.lng));
      }

      // 3. FOTO PROFIL: Hanya kirim jika user BENAR-BENAR memilih file foto baru
      if (fileFoto) {
        formData.append("foto_profil", fileFoto);
      }

      // 4. JENIS PABRIK: Hanya kirim jika ada checkbox yang dicentang
      let finalJenisPabrikArr = [...jenisPabrikChecked];
      if (isLainnyaChecked && jenisPabrikLainnya.trim()) {
        finalJenisPabrikArr.push(jenisPabrikLainnya.trim());
      }
      const finalJenisPabrikStr = finalJenisPabrikArr.join(", ");

      // Mencegah pengiriman string kosong "" ke Backend
      if (finalJenisPabrikStr && finalJenisPabrikStr.trim() !== "") {
        formData.append("jenis_pabrik", finalJenisPabrikStr);
      }

      // 5. KAPASITAS RAM: Hanya kirim jika kolom diisi angka
      if (
        formProfile.kapasitas_ram_pabrik_ton &&
        String(formProfile.kapasitas_ram_pabrik_ton).trim() !== ""
      ) {
        formData.append(
          "kapasitas_ram_pabrik_ton",
          String(formProfile.kapasitas_ram_pabrik_ton),
        );
      }

      // Eksekusi API
      const response = await fetch(API_ENDPOINTS.USER.UPDATE_ME, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.warn("JSON Parse Error:", parseError);
        responseData = { detail: responseText || "Error Server" };
      }

      if (!response.ok)
        throw new Error(responseData.detail || "Gagal update data.");

      onSave(true);
    } catch (err) {
      setNotification({ type: "error", message: err.message });
      setIsSubmitting(false);
    }
  };

  const coordinateDisplay = mapPos
    ? `${mapPos.lat.toFixed(6)}, ${mapPos.lng.toFixed(6)}`
    : "";

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] w-full">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#EF8523] to-[#ff9f43] px-6 py-4 flex justify-between items-center z-10 shrink-0 shadow-md">
        <div>
          <h3 className="text-white font-bold text-lg leading-tight">
            Lengkapi Data Diri
          </h3>
          <p className="text-white/80 text-xs">
            Data valid diperlukan. Data yang sudah disimpan akan otomatis
            terkunci.
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all backdrop-blur-sm"
        >
          <X size={20} />
        </button>
      </div>

      {/* BODY SCROLLABLE */}
      <div className="p-6 overflow-y-auto space-y-8 bg-gray-50/50">
        {notification.message && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl text-sm font-medium animate-fade-in mb-4 border ${
              notification.type === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : notification.type === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            <Info size={18} className="shrink-0 mt-0.5" />
            <span>{notification.message}</span>
          </div>
        )}

        {/* 1. BAGIAN FOTO PROFIL */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="shrink-0 relative group">
            <div
              onClick={() =>
                lockedFields.foto && handleLockedClick("foto", "Foto Profil")
              }
              className={`w-32 h-32 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center transition-all bg-white ${
                previewFoto
                  ? "border-2 border-[#EF8523]"
                  : "bg-slate-50 border-2 border-dashed border-gray-300"
              }`}
            >
              {previewFoto ? (
                <img
                  src={previewFoto}
                  alt="Preview"
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    lockedFields.foto
                      ? "grayscale-[0.5]"
                      : "group-hover:scale-105"
                  }`}
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <Camera size={32} strokeWidth={1.5} />
                  <span className="text-[10px] mt-1 font-medium">Upload</span>
                </div>
              )}
            </div>

            {lockedFields.foto && (
              <div className="absolute -top-2 -right-2 bg-gray-800 text-white p-1.5 rounded-full shadow-lg border-2 border-white z-10">
                <Lock size={14} />
              </div>
            )}
          </div>

          <div className="flex-grow space-y-3 py-1">
            <label className="block text-sm font-bold text-gray-800">
              Foto Profil
              {lockedFields.foto && (
                <span className="ml-2 text-[10px] font-normal text-gray-400 italic">
                  (Terkunci)
                </span>
              )}
            </label>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                disabled={lockedFields.foto}
                onChange={handleFileChange}
                className={`block w-full text-sm text-gray-500
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-xl file:border-0
                    file:text-sm file:font-semibold
                    file:transition-colors
                    ${
                      lockedFields.foto
                        ? "file:bg-gray-100 file:text-gray-400 cursor-not-allowed opacity-70"
                        : "file:bg-orange-50 file:text-[#EF8523] hover:file:bg-[#EF8523] hover:file:text-white cursor-pointer"
                    }`}
              />
            </div>

            {warning.foto && (
              <p className="text-[10px] text-[#B5302D] font-bold animate-pulse">
                Data Foto sudah dikunci! Hubungi admin untuk perubahan.
              </p>
            )}

            <p className="text-[10px] text-gray-400 leading-relaxed max-w-xs">
              Disarankan foto wajah jelas atau logo kebun.
              <br />
              Format: JPG, PNG. Maksimal 2MB.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 mx-4"></div>

        {/* 2. BAGIAN ALAMAT KEBUN */}
        <div className="space-y-3">
          <label className="flex items-center justify-between text-sm font-bold text-gray-800">
            <span className="flex items-center gap-2">
              <MapPin size={18} className="text-[#B5302D]" /> Alamat/Lokasi
              Pabrik
            </span>
            {lockedFields.alamat && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                <Lock size={10} /> Terkunci
              </span>
            )}
          </label>

          <div
            onClick={() =>
              lockedFields.alamat && handleLockedClick("alamat", "Alamat")
            }
          >
            <textarea
              rows="2"
              placeholder="Contoh: Jl. Sawit Raya No. 12, RT 01/RW 02, Lampung Selatan, Lampung"
              value={formProfile.alamat}
              onChange={(e) =>
                !lockedFields.alamat &&
                setFormProfile((prev) => ({ ...prev, alamat: e.target.value }))
              }
              readOnly={lockedFields.alamat}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all resize-none outline-none ${
                lockedFields.alamat
                  ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white border-gray-300 focus:border-[#EF8523] focus:ring-4 focus:ring-orange-50 text-gray-800"
              }`}
            />
          </div>
          {warning.alamat && (
            <p className="text-xs text-[#B5302D] font-medium flex items-center gap-1.5 ml-1 animate-fade-in">
              <Lock size={12} /> Data alamat sudah dikunci oleh sistem.
            </p>
          )}
        </div>

        {/* 3. BAGIAN KOORDINAT */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <Navigation size={18} className="text-[#B5302D]" />
            Titik Koordinat
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isLoadingLocation ? (
                  <Loader2 size={16} className="text-[#EF8523] animate-spin" />
                ) : (
                  <Navigation
                    size={16}
                    className={
                      lockedFields.koordinat ? "text-gray-300" : "text-gray-400"
                    }
                  />
                )}
              </div>
              <input
                type="text"
                value={coordinateDisplay}
                readOnly
                disabled={lockedFields.koordinat}
                onClick={() =>
                  !lockedFields.koordinat
                    ? handleRequestLocation()
                    : handleLockedClick("koordinat", "Koordinat")
                }
                placeholder="Klik di sini untuk aktifkan GPS otomatis"
                className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm font-mono tracking-wide transition-all outline-none
                  ${
                    lockedFields.koordinat
                      ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-white border-gray-200 focus:border-[#B5302D] focus:ring-4 focus:ring-red-50 text-gray-700 cursor-pointer hover:bg-slate-50"
                  }`}
              />
            </div>

            <div className="flex gap-2 sm:w-auto w-full">
              <button
                onClick={handleRequestLocation}
                disabled={lockedFields.koordinat}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center gap-2 transition-all
                  ${
                    lockedFields.koordinat
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 hover:text-[#EF8523] active:scale-95"
                  }`}
                title="Ambil Lokasi Saat Ini (GPS)"
              >
                {isLoadingLocation ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Navigation size={18} />
                )}
                <span className="text-xs font-semibold">GPS (Otomatis)</span>
              </button>

              <button
                onClick={() => {
                  if (lockedFields.koordinat) {
                    handleLockedClick("koordinat", "Koordinat");
                    return;
                  }
                  setShowMapModal(true);
                }}
                disabled={lockedFields.koordinat}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold text-sm shadow-sm
                  ${
                    lockedFields.koordinat
                      ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-orange-50 border border-orange-100 text-[#EF8523] hover:bg-orange-100 active:scale-95"
                  }`}
                title="Buka Peta Secara Manual"
              >
                <MapIcon size={18} />
                <span>Buka Peta</span>
              </button>
            </div>
          </div>

          {(lockedFields.koordinat || warning.koordinat) && (
            <p className="text-xs text-[#B5302D] font-medium flex items-center gap-1.5 ml-1 animate-fade-in">
              <Lock size={12} /> Koordinat dikunci. Hubungi admin jika terjadi
              kesalahan fatal.
            </p>
          )}
        </div>

        <div className="border-t border-gray-200 mx-4"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Input 1: Jenis Pengolahan Pabrik (Checkbox Multiple) */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <Factory size={18} className="text-[#EF8523]" />
              Jenis Pengolahan Pabrik
            </label>

            <div className="flex flex-col gap-3 p-3.5 border rounded-xl shadow-sm bg-white border-gray-200">
              {/* Checkbox Standard */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Plantation/Estate",
                  "Palm Oil Mill/PKS",
                  "KCP (Kernel Crushing Plant)",
                  "Refinery",
                ].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={jenisPabrikChecked.includes(opt)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setJenisPabrikChecked((prev) => [...prev, opt]);
                        } else {
                          setJenisPabrikChecked((prev) =>
                            prev.filter((item) => item !== opt),
                          );
                        }
                      }}
                      className="w-4 h-4 rounded text-[#EF8523] focus:ring-[#EF8523] border-gray-300"
                    />
                    {opt}
                  </label>
                ))}
              </div>

              {/* Checkbox Lainnya & Input Teks */}
              <div className="border-t border-gray-100 pt-2 mt-1 space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLainnyaChecked}
                    onChange={(e) => {
                      setIsLainnyaChecked(e.target.checked);
                      if (!e.target.checked) setJenisPabrikLainnya(""); // Bersihkan teks jika batal dicentang
                    }}
                    className="w-4 h-4 rounded text-[#EF8523] focus:ring-[#EF8523] border-gray-300"
                  />
                  Lainnya (Ketik Manual)
                </label>

                {isLainnyaChecked && (
                  <input
                    type="text"
                    value={jenisPabrikLainnya}
                    onChange={(e) => setJenisPabrikLainnya(e.target.value)}
                    placeholder="Sebutkan jenis pabrik..."
                    className="w-full border rounded-lg px-3 py-2 text-sm transition-all outline-none bg-white border-gray-300 focus:border-[#EF8523] focus:ring-2 focus:ring-orange-50 text-gray-700 shadow-sm"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Input 2: Kapasitas RAM Pabrik (Angka) */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <Database size={18} className="text-[#EF8523]" />
              Kapasitas RAM Pabrik (Ton)
            </label>

            <div className="relative group">
              <input
                type="number"
                value={formProfile.kapasitas_ram_pabrik_ton}
                onChange={(e) => {
                  setFormProfile((s) => ({
                    ...s,
                    kapasitas_ram_pabrik_ton: e.target.value,
                  }));
                }}
                placeholder="Contoh: 150"
                className="w-full border rounded-xl px-4 py-3 text-sm transition-all outline-none bg-white border-gray-200 focus:border-[#EF8523] focus:ring-4 focus:ring-orange-50 text-gray-700 placeholder-gray-300 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-4 sm:p-6 border-t border-gray-100 bg-white/80 backdrop-blur-sm flex flex-col-reverse sm:flex-row gap-4 sm:gap-0 items-center justify-between shrink-0 z-20">
        <p className="text-[10px] text-gray-400 font-medium italic text-center sm:text-left leading-relaxed max-w-md w-full sm:w-auto">
          <span className="text-[#B5302D] font-bold">*</span> Data permanen
          setelah disimpan.
          <br className="hidden sm:block" />
          Kendala? Hubungi:{" "}
          <span className="text-gray-600 underline">
            hi.telsasuperapp@gmail.com
          </span>
        </p>

        <div className="flex gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg sm:rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 active:scale-95"
          >
            Batal
          </button>

          {/* Karena Jenis Pabrik & RAM selalu bisa diubah, tombol Simpan selalu aktif */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 sm:flex-none px-6 sm:px-8 py-2.5 rounded-lg sm:rounded-xl text-sm font-bold text-white transition-all duration-300 shadow-sm shadow-red-200
              flex items-center justify-center gap-2 transform active:scale-95
              ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed opacity-70"
                  : "bg-gradient-to-r from-[#B5302D] to-[#d64541] hover:shadow-md hover:shadow-red-300 hover:-translate-y-0.5"
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Proses...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- MODAL PETA MANUAL --- */}
      {showMapModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            <div className="h-[400px] w-full relative">
              <MapContainer
                center={mapPos || [-2.5489, 118.0149]}
                zoom={mapPos ? 15 : 5}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickToSetMarker setPos={setMapPos} disabled={false} />
                {mapPos && <Marker position={mapPos} />}
              </MapContainer>

              <div className="absolute top-4 left-4 z-[1000] bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-gray-200">
                <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
                  <MapPin size={14} className="text-red-500" /> Klik peta untuk
                  menandai lahan
                </p>
              </div>
            </div>

            <div className="p-4 border-t bg-white flex justify-end gap-3">
              <button
                onClick={() => setShowMapModal(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition"
              >
                Kembali
              </button>
              <button
                onClick={() => setShowMapModal(false)}
                className="px-6 py-2.5 bg-[#B5302D] text-white rounded-xl text-sm font-bold hover:bg-black transition shadow-lg"
              >
                Pilih Lokasi Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
