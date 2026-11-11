import { useSyncExternalStore } from 'react';

export const REDUCED_MOTION_STORAGE_KEY = 'girasoles_reduce_motion';

function getSystemPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getInitialReducedMotion(): boolean {
  try {
    const saved = localStorage.getItem(REDUCED_MOTION_STORAGE_KEY);
    if (saved === 'true') return true;
    if (saved === 'false') return false;
  } catch {
    // localStorage no accesible
  }
  return getSystemPrefersReducedMotion();
}

let currentReducedMotion: boolean = getInitialReducedMotion();
const listeners = new Set<() => void>();

export function applyReducedMotion(reduce: boolean): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-reduce-motion', String(reduce));
  }
}

// Aplicación inmediata en carga inicial
applyReducedMotion(currentReducedMotion);

// Sincronización con cambios del sistema operativo cuando el usuario no ha forzado una preferencia
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  try {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem(REDUCED_MOTION_STORAGE_KEY);
      if (saved === null) {
        setReducedMotion(e.matches, false);
      }
    };
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if (typeof (mediaQuery as any).addListener === 'function') {
      (mediaQuery as any).addListener(handleMediaChange);
    }
  } catch {
    // Ignorar si matchMedia no está disponible
  }
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function setReducedMotion(reduce: boolean, persist = true): void {
  if (persist) {
    try {
      localStorage.setItem(REDUCED_MOTION_STORAGE_KEY, String(reduce));
    } catch {
      // Ignorar errores de almacenamiento
    }
  }

  const changed = currentReducedMotion !== reduce;
  currentReducedMotion = reduce;
  applyReducedMotion(reduce);
  if (changed) {
    emitChange();
  }
}

export function toggleReducedMotion(): void {
  setReducedMotion(!currentReducedMotion);
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): boolean {
  return currentReducedMotion;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useReducedMotion(): {
  reducedMotion: boolean;
  setReducedMotion: (reduce: boolean) => void;
  toggleReducedMotion: () => void;
} {
  const reducedMotion = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    reducedMotion,
    setReducedMotion,
    toggleReducedMotion,
  };
}

export default useReducedMotion;
