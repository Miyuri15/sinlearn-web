"use client";
import "@/lib/i18n";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { applyTheme, getStoredTheme } from "@/lib/theme";

export default function AppearanceToggle() {
  const { t } = useTranslation("common");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = getStoredTheme();
    setIsDark(theme === "dark");
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    const newTheme = newIsDark ? "dark" : "light";
    applyTheme(newTheme);
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          {t("settings.appearance") || "Appearance"}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t("settings.appearance_desc") || "Customize theme and display preferences"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {isDark ? t("settings.dark") || "Dark" : t("settings.light") || "Light"}
        </span>

        <button
          onClick={toggleTheme}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-700"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isDark ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
