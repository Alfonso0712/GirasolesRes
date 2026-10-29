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

export function applyThemeClass(theme: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}

// En carga inicial, solo aplicamos la clase si no es un visitante de la landing sin sesión activa
function initThemeClass() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const isPublicLanding =
    (window.location.pathname === '/' || window.location.pathname === '' || window.location.pathname === '/index.html') &&
    !localStorage.getItem('girasoles_session_v1');

  if (isPublicLanding) {
    document.documentElement.classList.remove('dark');
  } else {
    applyThemeClass(currentTheme);
  }
}

initThemeClass();

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
