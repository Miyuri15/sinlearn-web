"use client";
import "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

// LocalStorage helpers
import { setLanguage, getLanguage } from "@/lib/localStore";

export default function LanguageSelector() {
  const { i18n, t } = useTranslation("common");
  const [currentLang, setCurrentLang] = useState(i18n.language || "en");

  useEffect(() => {
    const stored = getLanguage();
    i18n.changeLanguage(stored);
    setCurrentLang(stored);
  }, []);

  const languages = [
    { code: "en", name: "English", native: "English" },
    { code: "si", name: "Sinhala", native: "සිංහල" },
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setLanguage(langCode as "en" | "si");
    setCurrentLang(langCode);
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {t("settings.language") || "Language"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t("settings.language_desc") || "Select interface language"}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-full">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                currentLang === lang.code
                  ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {lang.native}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          ⚠️{" "}
          {t("settings.language_note") ||
            "All AI responses are Sinhala. Language setting only changes the UI."}
        </p>
      </div>
    </div>
  );
}
