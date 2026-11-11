import { useSyncExternalStore } from 'react';

export type TextSize = 'normal' | 'grande' | 'muy-grande';

export const STORAGE_KEY = 'girasoles_text_size';

export const TEXT_SIZE_PERCENTAGES: Record<TextSize, string> = {
  normal: '100%',
  grande: '112.5%',
  'muy-grande': '125%',
};

export interface TextSizeOption {
  id: TextSize;
  label: string;
  previewLabel: string;
  porcentaje: string;
}

export const TEXT_SIZE_OPTIONS: TextSizeOption[] = [
  { id: 'normal', label: 'Normal', previewLabel: 'A', porcentaje: '100%' },
  { id: 'grande', label: 'Grande', previewLabel: 'A', porcentaje: '112.5%' },
  { id: 'muy-grande', label: 'Muy grande', previewLabel: 'A', porcentaje: '125%' },
];

export function getTextSizePercentage(size: TextSize): string {
  return TEXT_SIZE_PERCENTAGES[size] ?? '100%';
}

export function applyTextSize(size: TextSize): void {
  if (typeof document !== 'undefined') {
    document.documentElement.style.fontSize = getTextSizePercentage(size);
    document.documentElement.setAttribute('data-text-size', size);
  }
}

export function getInitialTextSize(): TextSize {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'normal' || saved === 'grande' || saved === 'muy-grande') {
      return saved;
    }
  } catch {
    // localStorage no accesible
  }
  return 'normal';
}

let currentTextSize: TextSize = getInitialTextSize();
const listeners = new Set<() => void>();

// Aplicación inmediata al cargar el módulo
applyTextSize(currentTextSize);

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function setTextSize(size: TextSize): void {
  const validSize: TextSize =
    size === 'grande' || size === 'muy-grande' ? size : 'normal';

  try {
    localStorage.setItem(STORAGE_KEY, validSize);
  } catch {
    // Ignorar errores de cuota o permisos en localStorage
  }

  const changed = currentTextSize !== validSize;
  currentTextSize = validSize;
  applyTextSize(validSize);
  if (changed) {
    emitChange();
  }
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): TextSize {
  return currentTextSize;
}

function getServerSnapshot(): TextSize {
  return 'normal';
}

export function useTextSize(): {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  options: TextSizeOption[];
} {
  const textSize = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    textSize,
    setTextSize,
    options: TEXT_SIZE_OPTIONS,
  };
}

export default useTextSize;
