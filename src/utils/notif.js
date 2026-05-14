import toast from "react-hot-toast";
import Swal from "sweetalert2";

// ============================================================================
// FUNGSI PENDETEKSI LAYAR (HP vs Laptop)
// ============================================================================
const checkIsMobile = () => typeof window !== "undefined" && window.innerWidth < 768;

// ============================================================================
// 1. TOAST NOTIFICATIONS (Responsive Absolute)
// ============================================================================
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
    fontSize: isMobile ? "11px" : "13px",       
    padding: isMobile ? "10px 14px" : "12px 20px", 
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
// 2. CONFIRMATION DIALOG (100% Tailwind CSS & Atas-Bawah)
// ============================================================================
export const confirmDialog = async ({
  title = "Apakah Anda Yakin?",
  text = "Tindakan ini tidak dapat dibatalkan!",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  isDanger = false, 
}) => {
  const isMobile = checkIsMobile();

  // Tentukan warna tombol konfirmasi berdasarkan status isDanger
  const confirmBtnClass = isDanger
    ? "bg-[#B5302D] hover:bg-red-800 text-white shadow-md shadow-red-200"
    : "bg-[#EF8523] hover:bg-[#d6741b] text-white shadow-md shadow-orange-200";

  const result = await Swal.fire({
    title: `<div style="font-size: ${isMobile ? '16px' : '18px'}; font-weight: 800; color: #1F2937; margin-top: -5px;">${title}</div>`,
    html: `<div style="font-size: ${isMobile ? '11px' : '13px'}; color: #6B7280; line-height: 1.5; margin-top: 5px;">${text}</div>`,
    icon: isDanger ? "warning" : "question",
    
    width: isMobile ? "85%" : "360px",
    padding: isMobile ? "1.25rem" : "1.5rem",
    
    showCancelButton: true,
    
    // KUNCI UTAMA: Matikan style bawaan SweetAlert agar Tailwind bisa bekerja 100%
    buttonsStyling: false, 
    
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,

    // MATIKAN reverseButtons agar "Ya" (Konfirmasi) dirender di urutan pertama (di atas)
    reverseButtons: false, 
    
    customClass: {
      popup: "rounded-[24px] shadow-2xl border border-gray-100",
      
      // Flex Col agar tombol tersusun dari atas ke bawah
      actions: "flex flex-col w-full gap-2 sm:gap-2.5 mt-5 sm:mt-6 px-1 sm:px-2",
      
      // Tombol Konfirmasi (Di Atas): Gunakan w-full agar penuh satu baris
      confirmButton: `w-full px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-300 !m-0 ${confirmBtnClass}`,
      
      // Tombol Batal (Di Bawah): Gunakan w-full juga
      cancelButton: "w-full px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-[11px] sm:text-xs font-bold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all shadow-sm !m-0"
    },
  });

  return result.isConfirmed; 
};