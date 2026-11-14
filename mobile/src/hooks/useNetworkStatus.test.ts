import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNetworkStatus } from './useNetworkStatus';

describe('useNetworkStatus - Resiliencia y monitoreo de conectividad', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('detecta estado inicial en línea basado en navigator.onLine', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.sinConexion).toBe(false);
  });

  it('reacciona al evento offline de la ventana marcando sinConexion', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.sinConexion).toBe(true);
    expect(result.current.isOnline).toBe(false);
  });

  it('reacciona al evento online ejecutando onReconexion y disparando recarga', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const onReconexion = vi.fn();
    const reloadListener = vi.fn();
    window.addEventListener('girasoles:reload-active-view', reloadListener);

    const { result } = renderHook(() => useNetworkStatus(onReconexion));

    // Primero marcar offline
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    // Luego recuperar online
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.sinConexion).toBe(false);
    expect(onReconexion).toHaveBeenCalledTimes(1);
    expect(reloadListener).toHaveBeenCalledTimes(1);

    window.removeEventListener('girasoles:reload-active-view', reloadListener);
  });

  it('reacciona a eventos girasoles:network-error y girasoles:network-success', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const { result } = renderHook(() => useNetworkStatus());

    // Simular error de red de la API
    act(() => {
      window.dispatchEvent(new CustomEvent('girasoles:network-error'));
    });

    expect(result.current.sinConexion).toBe(true);

    // Simular éxito de red de la API
    act(() => {
      window.dispatchEvent(new CustomEvent('girasoles:network-success'));
    });

    expect(result.current.sinConexion).toBe(false);
  });
});
