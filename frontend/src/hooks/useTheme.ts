import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'girasoles_theme';

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch {
    // localStorage not accessible
  }
  return 'light';
}

let currentTheme: Theme = getInitialTheme();
const listeners = new Set<() => void>();

export function isLandingPath(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  return path === '/' || path === '' || path === '/index.html';
}

export function applyThemeClass(theme: Theme, forceLight: boolean = false) {
  if (typeof document !== 'undefined') {
    // La landing page pública siempre debe mantenerse aislada del modo oscuro del POS
    if (forceLight || isLandingPath()) {
      document.documentElement.classList.remove('dark');
      return;
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}

// Ensure theme class is applied on module load
applyThemeClass(currentTheme);

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function setTheme(theme: Theme) {
  if (currentTheme !== theme) {
    currentTheme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore localStorage quota/access errors
    }
    applyThemeClass(theme);
    emitChange();
  }
}

export function toggleTheme() {
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): Theme {
  return currentTheme;
}

function getServerSnapshot(): Theme {
  return 'light';
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    theme,
    setTheme,
    toggleTheme,
  };
}

export default useTheme;
