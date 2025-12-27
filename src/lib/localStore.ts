// ─────────────────────────────────────────────────────────────
// LocalStorage Helper (Safe, Centralized)
// Keys:
//   sinlearn_user
//   sinlearn_auth
//   sinlearn_lang
//   sinlearn_theme
//   sinlearn_settings
//   sinlearn_selected_rubric
//   sinlearn_custom_rubrics
// ─────────────────────────────────────────────────────────────

/* ───────────────── TYPES ───────────────── */

export type User = {
  name?: string;
  email: string;
  role?: "student" | "teacher";
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
  token_type: "bearer";
  stored_at: number; // epoch ms
};

export type Settings = {
  notifications?: boolean;
  evaluationNotifications?: boolean;
  saveHistory?: boolean;
  dataCollection?: boolean;
};

/* ───────────────── UTILS ───────────────── */

const isBrowser = () => typeof window !== "undefined";

/* ───────────────── USER ───────────────── */

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

/* ───────────────── AUTH TOKENS ───────────────── */

export const setAuthTokens = (tokens: Omit<AuthTokens, "stored_at">) => {
  if (!isBrowser()) return;

  const payload: AuthTokens = {
    ...tokens,
    stored_at: Date.now(),
  };

  localStorage.setItem("sinlearn_auth", JSON.stringify(payload));
};

export const getAuthTokens = (): AuthTokens | null => {
  if (!isBrowser()) return null;
  const data = localStorage.getItem("sinlearn_auth");
  return data ? JSON.parse(data) : null;
};

export const getAccessToken = (): string | null => {
  return getAuthTokens()?.access_token || null;
};

export const isAccessTokenExpired = (): boolean => {
  const auth = getAuthTokens();
  if (!auth) return true;

  const expiryTime = auth.stored_at + auth.expires_in * 1000;
  return Date.now() > expiryTime;
};

export const removeAuthTokens = () => {
  if (!isBrowser()) return;
  localStorage.removeItem("sinlearn_auth");
};

/* ───────────────── LANGUAGE ───────────────── */

export const setLanguage = (lang: "en" | "si") => {
  if (!isBrowser()) return;
  localStorage.setItem("sinlearn_lang", lang);
};

export const getLanguage = (): "en" | "si" => {
  if (!isBrowser()) return "en";
  return (localStorage.getItem("sinlearn_lang") as "en" | "si") || "en";
};

/* ───────────────── THEME ───────────────── */

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

/* ───────────────── CHAT TYPE ───────────────── */

export const setSelectedChatType = (chatType: "learning" | "evaluation") => {
  if (!isBrowser()) return;
  console.log("Setting chat type in localStorage:", chatType);
  localStorage.setItem("sinlearn_selected_chat_type", chatType);
  console.log(
    "Chat type set in localStorage:",
    localStorage.getItem("sinlearn_selected_chat_type")
  );
};

export const getSelectedChatType = (): "learning" | "evaluation" => {
  if (!isBrowser()) return "learning";
  console.log(
    "Retrieving chat type from localStorage:",
    localStorage.getItem("sinlearn_selected_chat_type")
  );
  return (
    (localStorage.getItem("sinlearn_selected_chat_type") as
      | "learning"
      | "evaluation") || "learning"
  );
};

/* ───────────────── SETTINGS ───────────────── */

export const setSettings = (newSettings: Settings) => {
  if (!isBrowser()) return;

  const current = getSettings();
  const merged = { ...current, ...newSettings };

  localStorage.setItem("sinlearn_settings", JSON.stringify(merged));
};

export const getSettings = (): Settings => {
  if (!isBrowser()) return {};
  const data = localStorage.getItem("sinlearn_settings");
  return data ? JSON.parse(data) : {};
};

/* ───────────────── LOGOUT (SAFE) ───────────────── */

export const logout = () => {
  if (!isBrowser()) return;
  removeUser();
  removeAuthTokens();
};

/* ───────────────── RUBRICS ───────────────── */

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
  selectedAt: string;
};

export const setSelectedRubric = (rubric: StoredRubric) => {
  if (!isBrowser()) return;
  localStorage.setItem("sinlearn_selected_rubric", JSON.stringify(rubric));
};

export const getSelectedRubric = (): StoredRubric | null => {
  if (!isBrowser()) return null;
  const data = localStorage.getItem("sinlearn_selected_rubric");
  return data ? JSON.parse(data) : null;
};

export const removeSelectedRubric = () => {
  if (!isBrowser()) return;
  localStorage.removeItem("sinlearn_selected_rubric");
};

export const setCustomRubrics = (rubrics: StoredRubric[]) => {
  if (!isBrowser()) return;
  localStorage.setItem("sinlearn_custom_rubrics", JSON.stringify(rubrics));
};

export const getCustomRubrics = (): StoredRubric[] => {
  if (!isBrowser()) return [];
  const data = localStorage.getItem("sinlearn_custom_rubrics");
  return data ? JSON.parse(data) : [];
};

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

export const removeCustomRubric = (id: string) => {
  const rubrics = getCustomRubrics();
  const filtered = rubrics.filter((r) => r.id !== id);
  setCustomRubrics(filtered);
  return filtered;
};
