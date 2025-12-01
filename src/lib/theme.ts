// src/lib/theme.ts
export type Theme = 'light' | 'dark';

export const applyTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  // Add new theme class
  root.classList.add(theme);
  
  // Update localStorage
  localStorage.setItem('theme', theme);
  
  // Update data-theme attribute (optional)
  root.setAttribute('data-theme', theme);
};

export const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme') as Theme;
  return stored || 'light';
};

export const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const initializeTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  const stored = getStoredTheme();
  const system = getSystemTheme();
  const theme = stored || system;
  
  applyTheme(theme);
  return theme;
};