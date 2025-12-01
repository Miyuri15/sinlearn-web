"use client";
import "@/lib/i18n";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function LanguageToggle() {
  const { i18n } = useTranslation("common");
  const [ready, setReady] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setReady(true);
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setIsDark(theme === 'dark');
  }, []);

  const change = (lng: "en" | "si") => {
    i18n.changeLanguage(lng);
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!ready) return null;

  const current = i18n.language || "en";

  return (
    <div className="flex items-center gap-2">
      {/* Language Toggle */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-full px-4 shadow-xl">
        <button
          onClick={() => change("si")}
          className={`px-3 py-1 rounded-full text-sm transition ${
            current === "si" ? "bg-blue-600 dark:bg-blue-500 text-white" : "text-gray-800 dark:text-gray-200"
          }`}
        >
          සිංහල
        </button>

        <button
          onClick={() => change("en")}
          className={`px-3 py-1 rounded-full text-sm transition ${
            current === "en" ? "bg-blue-600 dark:bg-blue-500 text-white" : "text-gray-800 dark:text-gray-200"
          }`}
        >
          English
        </button>
      </div>

      {/* Theme Toggle - Compact */}
      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full shadow-xl">
        <button
          onClick={toggleTheme}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-700 transition-colors"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className="sr-only">{isDark ? "Switch to light mode" : "Switch to dark mode"}</span>
          <span
            className={`inline-flex items-center justify-center h-4 w-4 transform rounded-full bg-white transition-transform ${
              isDark ? "translate-x-6" : "translate-x-1"
            }`}
          >
            {isDark ? (
              <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}