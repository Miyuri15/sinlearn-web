import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

type ToastProps = {
  message: string;
  isVisible: boolean;
  type: "success" | "error";
  onClose: () => void;
};

const UpdatedToast = ({ message, isVisible, type, onClose }: ToastProps) => {
  if (!isVisible) return null;

  const baseClasses =
    "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 z-50";
  const typeClasses = type === "success" ? "bg-green-500" : "bg-red-500";

  const icon =
    type === "success" ? (
      <CheckCircle2 className="w-5 h-5" />
    ) : (
      <AlertCircle className="w-5 h-5" />
    );

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
