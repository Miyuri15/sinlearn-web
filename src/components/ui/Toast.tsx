"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (title: string, message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    title: string,
    message: string,
    type: ToastType = "success"
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/30";
      case "error":
        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/30";
      case "info":
        return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30";
      default:
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/30";
    }
  };

  const getTextColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "text-green-800 dark:text-green-300";
      case "error":
        return "text-red-800 dark:text-red-300";
      case "info":
        return "text-blue-800 dark:text-blue-300";
      default:
        return "text-green-800 dark:text-green-300";
    }
  };

  const getIconColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "text-green-500 dark:text-green-400";
      case "error":
        return "text-red-500 dark:text-red-400";
      case "info":
        return "text-blue-500 dark:text-blue-400";
      default:
        return "text-green-500 dark:text-green-400";
    }
  };

  // In Toast.tsx - Top Center position
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container - Top Center position */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-2 w-90 md:w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${getBgColor(
              toast.type
            )} border rounded-lg p-4 shadow-lg animate-slideInTop`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 ${getIconColor(toast.type)}`}>
                {getIcon(toast.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium ${getTextColor(toast.type)}`}>
                  {toast.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
