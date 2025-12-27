"use client";

import { useRef } from "react";
import FocusTrap from "focus-trap-react";
import { LogOut, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutConfirmModal({
  isOpen,
  isLoading,
  onConfirm,
  onCancel,
}: Readonly<LogoutConfirmModalProps>) {
  const { t } = useTranslation("common");
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  if (!isOpen) return null;

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
            aria-labelledby="logout-modal-title"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-sm w-full border border-gray-200 dark:border-gray-700"
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2
                  id="logout-modal-title"
                  className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                >
                  {t("logout")}
                </h2>
              </div>
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
                aria-label="Close"
                ref={initialFocusRef}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300">
                {t("logout_confirm_message") || "Do you want to Log out?"}
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       text-gray-900 dark:text-gray-100
                       hover:bg-gray-100 dark:hover:bg-gray-700
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition font-medium"
              >
                {t("cancel")}
              </button>

              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg
                       bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600
                       text-white
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition font-medium"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("logging_out")}
                  </span>
                ) : (
                  t("logout")
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
