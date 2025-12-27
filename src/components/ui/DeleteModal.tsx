"use client";

import { useRef } from "react";
import FocusTrap from "focus-trap-react";
import { Trash2, X } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  iconColor?: "red" | "orange" | "blue";
}

export default function DeleteModal({
  isOpen,
  isLoading = false,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  iconColor = "red",
}: Readonly<DeleteModalProps>) {
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  if (!isOpen) return null;

  const bgColorMap = {
    red: "bg-red-100 dark:bg-red-900/30",
    orange: "bg-orange-100 dark:bg-orange-900/30",
    blue: "bg-blue-100 dark:bg-blue-900/30",
  };

  const iconColorMap = {
    red: "text-red-600 dark:text-red-400",
    orange: "text-orange-600 dark:text-orange-400",
    blue: "text-blue-600 dark:text-blue-400",
  };

  const confirmBtnColorMap = {
    red: "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600",
    orange:
      "bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600",
    blue: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600",
  };

  return (
    <FocusTrap
      active={isOpen}
      focusTrapOptions={{
        initialFocus: () => initialFocusRef.current || undefined,
        escapeDeactivates: true,
        clickOutsideDeactivates: true,
        returnFocusOnDeactivate: true,
      }}
    >
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onCancel}
          aria-hidden="true"
        />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-sm w-full border border-gray-200 dark:border-gray-700"
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bgColorMap[iconColor]}`}>
                  <Trash2 className={`w-5 h-5 ${iconColorMap[iconColor]}`} />
                </div>
                <h2
                  id="delete-modal-title"
                  className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                >
                  {title}
                </h2>
              </div>
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6">
              <p className="text-gray-700 dark:text-gray-300">{message}</p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-gray-200 dark:border-gray-700">
              <button
                onClick={onCancel}
                disabled={isLoading}
                ref={initialFocusRef}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       text-gray-900 dark:text-gray-100
                       hover:bg-gray-100 dark:hover:bg-gray-700
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition font-medium"
              >
                {cancelLabel}
              </button>

              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-2 rounded-lg
                       ${confirmBtnColorMap[iconColor]}
                       text-white
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition font-medium`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 rounded-full animate-spin" />
                    {confirmLabel}
                  </span>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
