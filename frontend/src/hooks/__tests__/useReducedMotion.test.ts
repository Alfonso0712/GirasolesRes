import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useReducedMotion,
  setReducedMotion,
  getInitialReducedMotion,
  applyReducedMotion,
  REDUCED_MOTION_STORAGE_KEY,
} from '../useReducedMotion';

describe('useReducedMotion Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-reduce-motion');
    setReducedMotion(false, false);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-reduce-motion');
    vi.restoreAllMocks();
  });

  it('debe tener valor por defecto false y aplicar data-reduce-motion="false"', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current.reducedMotion).toBe(false);
    expect(document.documentElement.getAttribute('data-reduce-motion')).toBe('false');
  });

  it('debe permitir activar reducir animaciones y persistir en localStorage', () => {
    const { result } = renderHook(() => useReducedMotion());

    act(() => {
      result.current.setReducedMotion(true);
    });

    expect(result.current.reducedMotion).toBe(true);
    expect(document.documentElement.getAttribute('data-reduce-motion')).toBe('true');
    expect(localStorage.getItem(REDUCED_MOTION_STORAGE_KEY)).toBe('true');
  });

  it('debe permitir alternar con toggleReducedMotion', () => {
    const { result } = renderHook(() => useReducedMotion());

    act(() => {
      result.current.toggleReducedMotion();
    });
    expect(result.current.reducedMotion).toBe(true);

    act(() => {
      result.current.toggleReducedMotion();
    });
    expect(result.current.reducedMotion).toBe(false);
  });

  it('debe leer valor guardado en localStorage', () => {
    localStorage.setItem(REDUCED_MOTION_STORAGE_KEY, 'true');
    expect(getInitialReducedMotion()).toBe(true);

    localStorage.setItem(REDUCED_MOTION_STORAGE_KEY, 'false');
    expect(getInitialReducedMotion()).toBe(false);
  });

  it('debe aplicar el atributo data-reduce-motion con applyReducedMotion', () => {
    applyReducedMotion(true);
    expect(document.documentElement.getAttribute('data-reduce-motion')).toBe('true');

    applyReducedMotion(false);
    expect(document.documentElement.getAttribute('data-reduce-motion')).toBe('false');
  });
});
