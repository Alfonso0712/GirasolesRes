import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHaptics } from './useHaptics';
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

describe('useHaptics - Respuesta Háptica y Vibración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe invocar Haptics.impact con estilo Light en triggerLight', async () => {
    const { result } = renderHook(() => useHaptics());
    await result.current.triggerLight();
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
});
