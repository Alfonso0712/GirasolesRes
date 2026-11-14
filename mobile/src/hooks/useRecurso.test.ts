import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecurso } from './useRecurso';

describe('useRecurso - Sondeo y Gestión de Estado', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('debe cargar los datos iniciales correctamente', async () => {
    const mockFetcher = vi.fn().mockResolvedValue(['Mesa 1', 'Mesa 2']);

    const { result } = renderHook(() =>
      useRecurso(mockFetcher, { intervaloMs: 5000 })
    );

    expect(result.current.cargando).toBe(true);

    await act(async () => {
      await Promise.resolve(); // Resuelve la promesa inicial
    });

    expect(result.current.cargando).toBe(false);
    expect(result.current.datos).toEqual(['Mesa 1', 'Mesa 2']);
    expect(result.current.error).toBeNull();
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });

  it('debe ejecutar el sondeo automático cada intervaloMs', async () => {
    let contador = 1;
    const mockFetcher = vi.fn().mockImplementation(async () => `Dato ${contador++}`);

    const { result } = renderHook(() =>
      useRecurso(mockFetcher, { intervaloMs: 3000 })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.datos).toBe('Dato 1');
    expect(mockFetcher).toHaveBeenCalledTimes(1);

    // Avanzamos 3000ms
    await act(async () => {
      vi.advanceTimersByTime(3000);
      await Promise.resolve();
    });

    expect(result.current.datos).toBe('Dato 2');
    expect(mockFetcher).toHaveBeenCalledTimes(2);
  });

  it('debe capturar errores de carga sin romper el estado', async () => {
    const mockFetcher = vi.fn().mockRejectedValue(new Error('Fallo de red'));

    const { result } = renderHook(() =>
      useRecurso(mockFetcher, { intervaloMs: 0 })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.cargando).toBe(false);
    expect(result.current.datos).toBeNull();
    expect(result.current.error).toBe('Fallo de red');
  });

  it('debe permitir recargar manualmente bajo demanda', async () => {
    const mockFetcher = vi.fn().mockResolvedValue('OK');

    const { result } = renderHook(() =>
      useRecurso(mockFetcher, { intervaloMs: 0 })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.recargar();
    });

    expect(mockFetcher).toHaveBeenCalledTimes(2);
  });
});
