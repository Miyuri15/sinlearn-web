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
  return (
    (localStorage.getItem("sinlearn_theme") as "light" | "dark") || "light"
  );
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

// ─── RUBRIC ──────────────────────────────────────────────────

export type StoredRubric = {
  id: string;
  title: string;
  title_si: string;
  type: "standard" | "custom";
  categories: Array<{
    name: string;
    name_si: string;
    percentage: number;
  }>;
  total: number;
  selectedAt: string; // ISO timestamp
};

// Store a single selected rubric
export const setSelectedRubric = (rubric: StoredRubric) => {
  if (!isBrowser()) return;
  localStorage.setItem("sinlearn_selected_rubric", JSON.stringify(rubric));
};

// Get the currently selected rubric
export const getSelectedRubric = (): StoredRubric | null => {
  if (!isBrowser()) return null;
  const data = localStorage.getItem("sinlearn_selected_rubric");
  return data ? JSON.parse(data) : null;
};

// Clear selected rubric
export const removeSelectedRubric = () => {
  if (!isBrowser()) return;
  localStorage.removeItem("sinlearn_selected_rubric");
};

// Store multiple custom rubrics (for saved rubrics section)
export const setCustomRubrics = (rubrics: StoredRubric[]) => {
  if (!isBrowser()) return;
  localStorage.setItem("sinlearn_custom_rubrics", JSON.stringify(rubrics));
};

// Get all custom rubrics
export const getCustomRubrics = (): StoredRubric[] => {
  if (!isBrowser()) return [];
  const data = localStorage.getItem("sinlearn_custom_rubrics");
  return data ? JSON.parse(data) : [];
};

// Add a custom rubric
export const addCustomRubric = (rubric: Omit<StoredRubric, "selectedAt">) => {
  const rubrics = getCustomRubrics();
  const newRubric: StoredRubric = {
    ...rubric,
    selectedAt: new Date().toISOString(),
  };
  rubrics.push(newRubric);
  setCustomRubrics(rubrics);
  return newRubric;
};

// Remove a custom rubric by ID
export const removeCustomRubric = (id: string) => {
  const rubrics = getCustomRubrics();
  const filtered = rubrics.filter((r) => r.id !== id);
  setCustomRubrics(filtered);
  return filtered;
};
