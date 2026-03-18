import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import {
  X,
  Save,
  Camera,
  Move,
  Minus,
  MapPin,
  Loader2,
  Lock,
  Info,
  CheckCircle2,
  Navigation,
  Map as MapIcon,
} from "lucide-react";
import { API_ENDPOINTS } from "../../../config/constants";

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

export default function DataDiriLogistik({
  onClose,
  onSave,
  initialData,
  lockedFields,
}) {
  // --- STATE DATA ---
  const [alamat, setAlamat] = useState("");
  const [mapPos, setMapPos] = useState(null);
  const [fileFoto, setFileFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState("");

  // --- STATE UI ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  // State Notifikasi & Warning Lock
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [warning, setWarning] = useState({
    foto: false,
    alamat: false,
  });

  // --- EFFECT: Load Data Awal ---
  useEffect(() => {
    if (initialData) {
      setAlamat(initialData.alamat_kebun || "");
      setPreviewFoto(initialData.foto || "");
    }
  }, [initialData]);

  // --- HANDLERS ---

  // Handler Notifikasi Lock (Text Merah + Toast)
  const handleLockedClick = (fieldKey, label) => {
    // 1. Munculkan text merah di bawah input
    setWarning((prev) => ({ ...prev, [fieldKey]: true }));

    // 2. Munculkan toast notifikasi di atas
    setNotification({
      type: "info",
      message: `Data ${label} sudah tersimpan dan terkunci otomatis.`,
    });

    // Reset notifikasi setelah 3 detik
    setTimeout(() => {
      setNotification({ type: "", message: "" });
      setWarning((prev) => ({ ...prev, [fieldKey]: false }));
    }, 3000);
  };

  const handleFileChange = (e) => {
    // Cek apakah field terkunci
    if (lockedFields.foto) {
      handleLockedClick("foto", "Foto Profil");
      return;
    }

    const file = e.target.files?.[0];

    if (file) {
      // VALIDASI UKURAN FILE (Maksimal 2 MB)
      // 2 MB = 2 * 1024 * 1024 bytes = 2,097,152 bytes
      const MAX_SIZE = 2 * 1024 * 1024;

      if (file.size > MAX_SIZE) {
        // Reset input file agar user tahu file tidak terpilih
        e.target.value = null;

        // Tampilkan notifikasi error
        setNotification({
          type: "error",
          message:
            "Ukuran foto terlalu besar! Harap upload foto di bawah 2 MB.",
        });
        return; // Hentikan proses, jangan setPreviewFoto
      }

      // Jika Lolos Validasi
      setFileFoto(file);
      setPreviewFoto(URL.createObjectURL(file));

      // Bersihkan notifikasi error jika sebelumnya ada
      setNotification({ type: "", message: "" });
    }
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

      if (!lockedFields.alamat && alamat) formData.append("alamat", alamat);
      if (!lockedFields.foto && fileFoto)
        formData.append("foto_profil", fileFoto);

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
        // Kita gunakan variable 'parseError' agar tidak dianggap unused oleh linter
        console.warn(
          "JSON Parse Error (Response mungkin bukan JSON):",
          parseError
        );
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
        {/* NOTIFIKASI GLOBAL */}
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

        {/* 1. BAGIAN FOTO PROFIL (LAYOUT PERSEGI DASHBOARD) */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* KIRI: Visual Box Foto */}
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

            {/* Badge Terkunci */}
            {lockedFields.foto && (
              <div className="absolute -top-2 -right-2 bg-gray-800 text-white p-1.5 rounded-full shadow-lg border-2 border-white z-10">
                <Lock size={14} />
              </div>
            )}
          </div>

          {/* KANAN: Input & Label */}
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

            {/* Warning Text */}
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
              <MapPin size={18} className="text-[#B5302D]" /> Alamat/Lokasi Lahan
              Kebun
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
              value={alamat}
              onChange={(e) =>
                !lockedFields.alamat && setAlamat(e.target.value)
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
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-4 sm:p-6 border-t border-gray-100 bg-white/80 backdrop-blur-sm flex flex-col-reverse sm:flex-row gap-4 sm:gap-0 items-center justify-between shrink-0 z-20">
        {/* Teks Disclaimer - Mobile: Center & Kecil, Desktop: Left & Normal */}
        <p className="text-[10px] text-gray-400 font-medium italic text-center sm:text-left leading-relaxed max-w-md w-full sm:w-auto">
          <span className="text-[#B5302D] font-bold">*</span> Data permanen
          setelah disimpan.
          <br className="hidden sm:block" />
          Kendala? Hubungi:{" "}
          <span className="text-gray-600 underline">
            hi.telsasuperapp@gmail.com
          </span>
        </p>

        {/* Group Tombol - Mobile: Full Width, Desktop: Auto */}
        <div className="flex gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Tombol Batal */}
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg sm:rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 active:scale-95"
          >
            Batal
          </button>

          {/* Logika Tombol Simpan / Status Lengkap */}
          {!lockedFields.foto ||
          !lockedFields.alamat ? (
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
                  <span>Simpan</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 rounded-lg sm:rounded-xl bg-green-50 text-green-700 text-sm font-bold border border-green-200 flex items-center justify-center gap-2 cursor-default">
              <CheckCircle2 size={16} className="text-green-600" />
              <span>Data Lengkap</span>
            </div>
          )}
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
