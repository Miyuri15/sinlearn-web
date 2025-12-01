"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem("theme") || "light";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.className = newTheme;
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      suppressHydrationWarning
      onClick={toggleTheme}
      className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-sm font-medium transition-colors"
    >
      {mounted ? (theme === "light" ? "🌙 Dark" : "☀️ Light") : "☀️ Light"}
    </button>
  );
}
