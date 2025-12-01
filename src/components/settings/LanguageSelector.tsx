"use client";

import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

export default function LanguageSelector() {
  const { i18n, t } = useTranslation("common");
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const languages = [
    { code: "en", name: "English", native: "English" },
    { code: "si", name: "Sinhala", native: "සිංහල" },
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setCurrentLang(langCode);
  };

  return (
    <div className="border-b border-[#E2E8F0] pb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-[#0A0A0A]">
            {t("settings.language") || "Language"}
          </h3>
          <p className="text-sm text-[#64748B] mt-1">
            {t("settings.language_desc") || "Select interface language"}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                currentLang === lang.code
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              {lang.native}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          ⚠️ {t("settings.language_note") || 
            "All AI responses and evaluations are always in Sinhala. Language setting only changes the UI."}
        </p>
      </div>
    </div>
  );
}