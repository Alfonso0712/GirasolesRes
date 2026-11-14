import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHaptics, CLAVE_HAPTICS } from './useHaptics';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

vi.mock('@capacitor/haptics', () => {
  return {
    Haptics: {
      impact: vi.fn(),
      notification: vi.fn(),
      vibrate: vi.fn(),
    },
    ImpactStyle: {
      Light: 'LIGHT',
      Medium: 'MEDIUM',
      Heavy: 'HEAVY',
    },
    NotificationType: {
      Success: 'SUCCESS',
      Warning: 'WARNING',
      Error: 'ERROR',
    },
  };
});

describe('useHaptics - Respuesta Háptica con Interruptor y Respaldo (R-B)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('inicia habilitada por defecto e invoca Haptics.impact con estilo Light en triggerLight', async () => {
    const { result } = renderHook(() => useHaptics());
    expect(result.current.hapticsHabilitado).toBe(true);
    const ok = await result.current.triggerLight();
    expect(ok).toBe(true);
    expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Light });
  });

  it('debe invocar Haptics.impact con estilo Medium en triggerMedium', async () => {
    const { result } = renderHook(() => useHaptics());
    await result.current.triggerMedium();
    expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Medium });
  });

  it('debe invocar Haptics.notification con Success en triggerSuccess', async () => {
    const { result } = renderHook(() => useHaptics());
    await result.current.triggerSuccess();
    expect(Haptics.notification).toHaveBeenCalledWith({ type: NotificationType.Success });
  });

  it('debe invocar Haptics.notification con Error en triggerError', async () => {
    const { result } = renderHook(() => useHaptics());
    await result.current.triggerError();
    expect(Haptics.notification).toHaveBeenCalledWith({ type: NotificationType.Error });
  });

  it('no vibra si la preferencia girasoles_haptics está desactivada', async () => {
    const { result } = renderHook(() => useHaptics());

    act(() => {
      result.current.setHapticsHabilitado(false);
    });

    expect(result.current.hapticsHabilitado).toBe(false);
    expect(localStorage.getItem(CLAVE_HAPTICS)).toBe('false');

    const okLight = await result.current.triggerLight();
    const okProbar = await result.current.probarHaptics();

    expect(okLight).toBe(false);
    expect(okProbar).toBe(false);
    expect(Haptics.impact).not.toHaveBeenCalled();
  });

  it('usa navigator.vibrate(20) como respaldo cuando Haptics.impact falla', async () => {
    vi.mocked(Haptics.impact).mockRejectedValueOnce(new Error('Plugin no disponible'));
    const vibrateMock = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      writable: true,
      value: vibrateMock,
    });

    const { result } = renderHook(() => useHaptics());
    const ok = await result.current.probarHaptics();

    expect(Haptics.impact).toHaveBeenCalledTimes(1);
    expect(vibrateMock).toHaveBeenCalledWith(20);
    expect(ok).toBe(true);
  });

  it('retorna false en probarHaptics si ni el plugin ni navigator.vibrate están disponibles', async () => {
    vi.mocked(Haptics.impact).mockRejectedValueOnce(new Error('Sin motor háptico'));
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useHaptics());
    const ok = await result.current.probarHaptics();

    expect(ok).toBe(false);
  });
});
