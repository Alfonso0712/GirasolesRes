import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useThemeMode,
  setThemeMode,
  getInitialThemeMode,
  resolveEffectiveTheme,
  THEME_MODE_STORAGE_KEY,
  type ThemeMode,
} from '../useThemeMode';

describe('useThemeMode Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    setThemeMode('light');
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('debe tener valor inicial light por defecto', () => {
    const { result } = renderHook(() => useThemeMode());
    expect(result.current.mode).toBe('light');
    expect(result.current.effectiveTheme).toBe('light');
  });

  it('debe permitir cambiar a modo dark y persistir en localStorage', () => {
    const { result } = renderHook(() => useThemeMode());

    act(() => {
      result.current.setMode('dark');
    });

    expect(result.current.mode).toBe('dark');
    expect(result.current.effectiveTheme).toBe('dark');
    expect(localStorage.getItem(THEME_MODE_STORAGE_KEY)).toBe('dark');
  });

  it('debe permitir cambiar a modo auto y resolver tema del sistema', () => {
    const { result } = renderHook(() => useThemeMode());

    act(() => {
      result.current.setMode('auto');
    });

    expect(result.current.mode).toBe('auto');
    expect(localStorage.getItem(THEME_MODE_STORAGE_KEY)).toBe('auto');
    expect(['light', 'dark']).toContain(result.current.effectiveTheme);
  });

  it('debe resolver tema efectivo correctamente para light, dark y auto', () => {
    expect(resolveEffectiveTheme('light')).toBe('light');
    expect(resolveEffectiveTheme('dark')).toBe('dark');
    expect(['light', 'dark']).toContain(resolveEffectiveTheme('auto'));
  });

  it('debe leer modo guardado en localStorage al inicializar', () => {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, 'dark');
    expect(getInitialThemeMode()).toBe('dark');

    localStorage.setItem(THEME_MODE_STORAGE_KEY, 'auto');
    expect(getInitialThemeMode()).toBe('auto');
  });

  it('debe fallback a light si el valor guardado es inválido', () => {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, 'invalid-mode' as ThemeMode);
    expect(getInitialThemeMode()).toBe('light');
  });
});
