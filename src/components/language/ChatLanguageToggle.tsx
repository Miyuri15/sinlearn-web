"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  const current = i18n.language;

  const change = (lng: "en" | "si") => {
    i18n.changeLanguage(lng);
  };

  return (
    <div
      className="
        flex items-center gap-1 px-2 py-1 rounded-full border
        bg-gray-100 border-gray-300
        dark:bg-[#111111] dark:border-[#2a2a2a]
        transition-colors
      "
    >
      {/* Sinhala Button */}
      <button
        onClick={() => change("si")}
        className={`
          px-3 py-1 text-sm rounded-full transition
          ${
            current === "si"
              ? "bg-blue-600 text-white dark:bg-blue-500"
              : "text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          }
        `}
      >
        සිංහල
      </button>

      {/* English Button */}
      <button
        onClick={() => change("en")}
        className={`
          px-3 py-1 text-sm rounded-full transition
          ${
            current === "en"
              ? "bg-blue-600 text-white dark:bg-blue-500"
              : "text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          }
        `}
      >
        English
      </button>
    </div>
  );
}
