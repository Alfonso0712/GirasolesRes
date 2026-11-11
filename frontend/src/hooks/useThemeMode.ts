import { useSyncExternalStore } from 'react';
import { setTheme, applyThemeClass, type Theme } from './useTheme';
import { actualizarTema } from '../services/perfilService';

export type ThemeMode = 'light' | 'dark' | 'auto';

export const THEME_MODE_STORAGE_KEY = 'girasoles_theme_mode';

export interface ThemeModeOption {
  id: ThemeMode;
  label: string;
  description: string;
}

export const THEME_MODE_OPTIONS: ThemeModeOption[] = [
  { id: 'light', label: 'Claro', description: 'Fondo luminoso con contraste optimizado' },
  { id: 'dark', label: 'Oscuro', description: 'Fondo oscuro para descansar la vista' },
  { id: 'auto', label: 'Automático', description: 'Sigue la preferencia del sistema operativo' },
];

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveEffectiveTheme(mode: ThemeMode): Theme {
  if (mode === 'auto') {
    return getSystemTheme();
  }
  return mode;
}

export function getInitialThemeMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      return saved;
    }
    // Si no hay modo explícito pero hay girasoles_theme, respetamos ese tema
    const savedTheme = localStorage.getItem('girasoles_theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
  } catch {
    // localStorage no accesible
  }
  return 'light';
}

let currentThemeMode: ThemeMode = getInitialThemeMode();
const listeners = new Set<() => void>();

function applyCurrentMode(): void {
  const effective = resolveEffectiveTheme(currentThemeMode);
  setTheme(effective);
  applyThemeClass(effective);
}

// Escuchar cambios de sistema operativo cuando el modo es 'auto'
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (currentThemeMode === 'auto') {
        applyCurrentMode();
        emitChange();
      }
    };
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else if (typeof (mediaQuery as any).addListener === 'function') {
      (mediaQuery as any).addListener(handleSystemChange);
    }
  } catch {
    // Ignorar si matchMedia falla
  }
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function setThemeMode(mode: ThemeMode, token?: string): void {
  const validMode: ThemeMode = mode === 'dark' || mode === 'auto' ? mode : 'light';

  try {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, validMode);
  } catch {
    // Ignorar errores de almacenamiento
  }

  currentThemeMode = validMode;
  const effective = resolveEffectiveTheme(validMode);
  setTheme(effective);

  // Sincronizar con backend si token está disponible
  if (token) {
    actualizarTema(effective).catch(() => {});
  }

  emitChange();
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): ThemeMode {
  return currentThemeMode;
}

function getServerSnapshot(): ThemeMode {
  return 'light';
}

export function useThemeMode(token?: string): {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  effectiveTheme: Theme;
} {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const effectiveTheme = resolveEffectiveTheme(mode);

  const handleSetMode = (newMode: ThemeMode) => {
    setThemeMode(newMode, token);
  };

  return {
    mode,
    setMode: handleSetMode,
    effectiveTheme,
  };
}

export default useThemeMode;
