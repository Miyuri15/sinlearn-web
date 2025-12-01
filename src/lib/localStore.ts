// ─────────────────────────────────────────────────────────────
// LocalStorage Helper (Safe, Centralized)
// Keys: sinlearn_user, sinlearn_lang, sinlearn_theme, sinlearn_settings
// ─────────────────────────────────────────────────────────────

type User = {
  name: string;
  email: string;
  role: "student" | "teacher";
};

type Settings = {
  notifications?: boolean;
  evaluationNotifications?: boolean;
  saveHistory?: boolean;
  dataCollection?: boolean;
};

const isBrowser = () => typeof window !== "undefined";

// ─── USER ────────────────────────────────────────────────────

export const setUser = (user: User) => {
  if (!isBrowser()) return;
  localStorage.setItem("sinlearn_user", JSON.stringify(user));
};

export const getUser = (): User | null => {
  if (!isBrowser()) return null;
  const data = localStorage.getItem("sinlearn_user");
  return data ? JSON.parse(data) : null;
};

export const removeUser = () => {
  if (!isBrowser()) return;
  localStorage.removeItem("sinlearn_user");
};

// ─── LANGUAGE ───────────────────────────────────────────────

export const setLanguage = (lang: "en" | "si") => {
  if (!isBrowser()) return;
  localStorage.setItem("sinlearn_lang", lang);
};

export const getLanguage = (): "en" | "si" => {
  if (!isBrowser()) return "en";
  return (localStorage.getItem("sinlearn_lang") as "en" | "si") || "en";
};

// ─── THEME ──────────────────────────────────────────────────

export const setThemeLS = (theme: "light" | "dark") => {
  if (!isBrowser()) return;
  localStorage.setItem("sinlearn_theme", theme);
};

export const getThemeLS = (): "light" | "dark" => {
  if (!isBrowser()) return "light";
  return (localStorage.getItem("sinlearn_theme") as "light" | "dark") || "light";
};

// ─── SETTINGS (Notifications / Privacy / etc.) ───────────────

export const setSettings = (newSettings: Settings) => {
  if (typeof window === "undefined") return;

  const current = getSettings();

  const merged = {
    ...current,
    ...newSettings,
  };

  localStorage.setItem("sinlearn_settings", JSON.stringify(merged));
};


export const getSettings = (): Settings => {
  if (!isBrowser()) return {};
  const data = localStorage.getItem("sinlearn_settings");
  return data ? JSON.parse(data) : {};
};
