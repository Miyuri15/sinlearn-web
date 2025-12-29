import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastProps = {
  message: string;
  isVisible: boolean;
  type: "success" | "error" | "info" | "warning";
  onClose: () => void;
  duration?: number;
};

const UpdatedToast = ({
  message,
  isVisible,
  type,
  onClose,
  duration = 3000,
}: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const baseClasses =
    "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 z-50";

  const typeClasses = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-orange-500",
  }[type];

  const icon = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
  }[type];

  return (
    <div className={`${baseClasses} ${typeClasses} flex items-center gap-3`}>
      {icon}
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white leading-none"
      >
        ✕
      </button>
    </div>
  );
};

export default UpdatedToast;
