import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useNotificationPrefs,
  updateNotificationPrefs,
  getInitialNotificationPrefs,
  NOTIF_SONIDO_STORAGE_KEY,
  NOTIF_VOLUMEN_STORAGE_KEY,
  NOTIF_MODO_STORAGE_KEY,
} from '../useNotificationPrefs';

describe('useNotificationPrefs Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    updateNotificationPrefs({ sonidoActivado: true, volumen: 80, modoAviso: 'completo' });
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('debe tener valores por defecto esperados (sonido true, volumen 80, modo completo)', () => {
    const { result } = renderHook(() => useNotificationPrefs());
    expect(result.current.prefs.sonidoActivado).toBe(true);
    expect(result.current.prefs.volumen).toBe(80);
    expect(result.current.prefs.modoAviso).toBe('completo');
  });

  it('debe permitir cambiar estado de sonido y persistir en localStorage', () => {
    const { result } = renderHook(() => useNotificationPrefs());

    act(() => {
      result.current.setSonidoActivado(false);
    });

    expect(result.current.prefs.sonidoActivado).toBe(false);
    expect(localStorage.getItem(NOTIF_SONIDO_STORAGE_KEY)).toBe('false');
  });

  it('debe permitir cambiar volumen y persistir en localStorage', () => {
    const { result } = renderHook(() => useNotificationPrefs());

    act(() => {
      result.current.setVolumen(50);
    });

    expect(result.current.prefs.volumen).toBe(50);
    expect(localStorage.getItem(NOTIF_VOLUMEN_STORAGE_KEY)).toBe('50');
  });

  it('debe permitir cambiar modo de aviso a solo-visual o solo-sonoro', () => {
    const { result } = renderHook(() => useNotificationPrefs());

    act(() => {
      result.current.setModoAviso('solo-visual');
    });
    expect(result.current.prefs.modoAviso).toBe('solo-visual');
    expect(localStorage.getItem(NOTIF_MODO_STORAGE_KEY)).toBe('solo-visual');

    act(() => {
      result.current.setModoAviso('solo-sonoro');
    });
    expect(result.current.prefs.modoAviso).toBe('solo-sonoro');
    expect(localStorage.getItem(NOTIF_MODO_STORAGE_KEY)).toBe('solo-sonoro');
  });

  it('debe leer valores guardados desde localStorage en getInitialNotificationPrefs', () => {
    localStorage.setItem(NOTIF_SONIDO_STORAGE_KEY, 'false');
    localStorage.setItem(NOTIF_VOLUMEN_STORAGE_KEY, '30');
    localStorage.setItem(NOTIF_MODO_STORAGE_KEY, 'solo-sonoro');

    const initial = getInitialNotificationPrefs();
    expect(initial.sonidoActivado).toBe(false);
    expect(initial.volumen).toBe(30);
    expect(initial.modoAviso).toBe('solo-sonoro');
  });
});
