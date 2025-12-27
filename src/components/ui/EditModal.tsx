"use client";

import { useRef, ReactNode } from "react";
import FocusTrap from "focus-trap-react";
import { X } from "lucide-react";

interface EditModalProps {
  isOpen: boolean;
  title: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  children?: ReactNode;
}

export default function EditModal({
  isOpen,
  title,
  placeholder = "Enter text",
  value,
  onChange,
  onConfirm,
  onCancel,
  confirmLabel = "Save",
  cancelLabel = "Cancel",
  isLoading = false,
  children,
}: Readonly<EditModalProps>) {
  const initialFocusRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      onConfirm();
    }
    if (e.key === "Escape") {
      onCancel();
    }
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onCancel}
          aria-hidden="true"
        />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
            className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-lg max-w-md w-full"
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6">
              <h2
                id="edit-modal-title"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                {title}
              </h2>
              <button
                onClick={onCancel}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6">
              {children ? (
                children
              ) : (
                <input
                  ref={initialFocusRef}
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#111111] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 justify-end p-6">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
