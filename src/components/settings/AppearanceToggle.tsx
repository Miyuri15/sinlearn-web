"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function AppearanceToggle() {
  const { t } = useTranslation("common");
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-sm font-medium text-[#0A0A0A]">
          {t("settings.appearance") || "Appearance"}
        </h3>
        <p className="text-sm text-[#64748B] mt-1">
          {t("settings.appearance_desc") || "Customize theme and display preferences"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#64748B]">
          {darkMode ? t("settings.dark") || "Dark" : t("settings.light") || "Light"}
        </span>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            darkMode ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              darkMode ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}