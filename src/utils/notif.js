import toast from "react-hot-toast";
import Swal from "sweetalert2";

// ============================================================================
// FUNGSI PENDETEKSI LAYAR (HP vs Laptop)
// ============================================================================
const checkIsMobile = () => typeof window !== "undefined" && window.innerWidth < 768;

// ============================================================================
// 1. TOAST NOTIFICATIONS (Responsive Absolute)
// ============================================================================
// Kita kembali menggunakan 'style' bawaan React, tapi dengan logika JS
const getToastStyle = () => {
  const isMobile = checkIsMobile();
  return {
    background: "#ffffff",
    color: "#374151",
    border: "1px solid #F3F4F6",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
    fontWeight: "600",
    borderRadius: "12px",
    
    // KUNCI RESPONSIVE MUTLAK:
    fontSize: isMobile ? "11px" : "14px",       // Sangat mungil di HP
    padding: isMobile ? "8px 12px" : "12px 20px", // Sangat tipis di HP
    maxWidth: isMobile ? "90%" : "400px",
  };
};

export const showToast = {
  success: (message) => {
    toast.success(message, {
      duration: 4000,
      position: "top-center",
      style: getToastStyle(),
      iconTheme: { primary: "#10B981", secondary: "#ffffff" },
    });
  },

  error: (message) => {
    toast.error(message, {
      duration: 5000,
      position: "top-center",
      style: getToastStyle(),
      iconTheme: { primary: "#B5302D", secondary: "#ffffff" },
    });
  },

  loading: (message) => {
    toast.loading(message, {
      position: "top-center",
      style: getToastStyle(),
    });
  },

  dismiss: (toastId) => toast.dismiss(toastId),
};

// ============================================================================
// 2. CONFIRMATION DIALOG (SweetAlert2 - Hardcoded Responsiveness)
// ============================================================================
export const confirmDialog = async ({
  title = "Apakah Anda Yakin?",
  text = "Tindakan ini tidak dapat dibatalkan!",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  isDanger = false, 
}) => {
  const isMobile = checkIsMobile();

  const result = await Swal.fire({
    // TRIK PRO: Kita suntikkan gaya font mutlak langsung ke dalam HTML SweetAlert
    title: `<div style="font-size: ${isMobile ? '15px' : '18px'}; font-weight: 800; color: #1F2937; margin-top: -10px;">${title}</div>`,
    html: `<div style="font-size: ${isMobile ? '12px' : '14px'}; color: #6B7280; line-height: 1.5; margin-top: 5px;">${text}</div>`,
    icon: isDanger ? "warning" : "question",
    
    // KUNCI KOTAK KECIL: Lebar dan padding dipaksa via JS
    width: isMobile ? "80%" : "360px", // Di HP hanya 80% layar, Laptop max 360px
    padding: isMobile ? "1rem" : "1.5rem", // Jarak dalam lebih sempit di HP
    
    showCancelButton: true,
    confirmButtonColor: isDanger ? "#B5302D" : "#EF8523", 
    cancelButtonColor: "#F3F4F6", 
    
    // Teks Tombol juga di-hardcode ukurannya
    confirmButtonText: `<span style="font-size: ${isMobile ? '12px' : '14px'}; padding: ${isMobile ? '0px 8px' : '2px 12px'};">${confirmText}</span>`,
    cancelButtonText: `<span style="font-size: ${isMobile ? '12px' : '14px'}; padding: ${isMobile ? '0px 8px' : '2px 12px'}; color: #374151;">${cancelText}</span>`,
    reverseButtons: true, 
    
    customClass: {
      popup: "rounded-[24px] shadow-2xl border border-gray-100",
      actions: isMobile ? "gap-2 mt-4" : "gap-3 mt-6",
      confirmButton: "rounded-xl shadow-md",
      cancelButton: "rounded-xl border border-gray-200 bg-white"
    },
  });

  return result.isConfirmed; 
};