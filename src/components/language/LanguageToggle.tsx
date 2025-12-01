"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // This is necessary to avoid SSR/hydration mismatches with i18n.language
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);
  
  if (!ready) return null;

  const current = i18n.language;

  const change = (lng: "en" | "si") => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-full px-4 shadow-xl">
      <button
        onClick={() => change("si")}
        className={`px-3 py-1 rounded-full text-sm transition
          ${current === "si" ? "bg-blue-600 text-white" : "text-gray-800"}`}
      >
        සිංහල
      </button>

      <button
        onClick={() => change("en")}
        className={`px-3 py-1 rounded-full text-sm transition
          ${current === "en" ? "bg-blue-600 text-white" : "text-gray-800"}`}
      >
        English
      </button>
    </div>
  );
}