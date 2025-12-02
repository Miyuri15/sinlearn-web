// src/lib/theme.ts

export type Theme = "light" | "dark";

const isBrowser = () => typeof window !== "undefined";

// Get from LS
export const getStoredTheme = (): Theme => {
  if (!isBrowser()) return "light";
  return (localStorage.getItem("sinlearn_theme") as Theme) || "light";
};

// Get system preference
export const getSystemTheme = (): Theme => {
  if (!isBrowser()) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// Apply theme to DOM
export const applyTheme = (theme: Theme) => {
  if (!isBrowser()) return;

  const root = document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(theme);

  localStorage.setItem("sinlearn_theme", theme);
};

// Initialize early (used in RootLayout)
export const initializeTheme = (): Theme => {
  if (!isBrowser()) return "light";

  const stored = getStoredTheme();
  const system = getSystemTheme();

  const theme = stored || system;

  applyTheme(theme);
  return theme;
};
