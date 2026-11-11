import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useTextSize,
  setTextSize,
  getInitialTextSize,
  STORAGE_KEY,
  TEXT_SIZE_PERCENTAGES,
} from '../useTextSize';

describe('useTextSize Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.fontSize = '';
    document.documentElement.removeAttribute('data-text-size');
    setTextSize('normal');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.style.fontSize = '';
    document.documentElement.removeAttribute('data-text-size');
    vi.restoreAllMocks();
  });

  it('debe tener valor por defecto normal y 100% de tamaño base', () => {
    const { result } = renderHook(() => useTextSize());
    expect(result.current.textSize).toBe('normal');
    expect(document.documentElement.style.fontSize).toBe('100%');
    expect(document.documentElement.getAttribute('data-text-size')).toBe('normal');
  });

  it('debe cambiar de nivel a grande y aplicar 112.5% al elemento html', () => {
    const { result } = renderHook(() => useTextSize());

    act(() => {
      result.current.setTextSize('grande');
    });

    expect(result.current.textSize).toBe('grande');
    expect(document.documentElement.style.fontSize).toBe(TEXT_SIZE_PERCENTAGES.grande);
    expect(document.documentElement.getAttribute('data-text-size')).toBe('grande');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('grande');
  });

  it('debe cambiar de nivel a muy-grande y aplicar 125% al elemento html', () => {
    const { result } = renderHook(() => useTextSize());

    act(() => {
      result.current.setTextSize('muy-grande');
    });

    expect(result.current.textSize).toBe('muy-grande');
    expect(document.documentElement.style.fontSize).toBe(TEXT_SIZE_PERCENTAGES['muy-grande']);
    expect(document.documentElement.getAttribute('data-text-size')).toBe('muy-grande');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('muy-grande');
  });

  it('debe leer un valor guardado válido desde localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'grande');
    expect(getInitialTextSize()).toBe('grande');

    localStorage.setItem(STORAGE_KEY, 'muy-grande');
    expect(getInitialTextSize()).toBe('muy-grande');
  });

  it('debe retornar normal si el valor en localStorage es inválido o ausente', () => {
    localStorage.setItem(STORAGE_KEY, 'invalido-123');
    expect(getInitialTextSize()).toBe('normal');

    localStorage.removeItem(STORAGE_KEY);
    expect(getInitialTextSize()).toBe('normal');
  });

  it('debe manejar errores al acceder a localStorage sin lanzar excepción', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: localStorage blocked');
    });

    expect(getInitialTextSize()).toBe('normal');
    getItemSpy.mockRestore();

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => setTextSize('grande')).not.toThrow();
    setItemSpy.mockRestore();
  });

  it('debe exponer las tres opciones configuradas', () => {
    const { result } = renderHook(() => useTextSize());
    expect(result.current.options).toHaveLength(3);
    const ids = result.current.options.map((o) => o.id);
    expect(ids).toEqual(['normal', 'grande', 'muy-grande']);
  });
});
