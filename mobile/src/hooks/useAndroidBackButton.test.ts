import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAndroidBackButton } from './useAndroidBackButton';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import * as backHandlerModule from './useBackHandler';

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn(),
    exitApp: vi.fn(),
  },
}));

describe('useAndroidBackButton - Gestión nativa de botón Atrás', () => {
  let backListener: (() => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    backListener = null;

    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true);
    vi.mocked(CapacitorApp.addListener).mockImplementation(async (event: string, cb: any) => {
      if (event === 'backButton') {
        backListener = cb;
      }
      return { remove: vi.fn() } as unknown as any;
    });
    vi.mocked(CapacitorApp.exitApp).mockResolvedValue(undefined);
  });

  it('no debe registrar listener nativo si no es plataforma nativa', () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(false);

    renderHook(() =>
      useAndroidBackButton({
        currentTab: 'pedidos',
        initialTab: 'salon',
        onGoToInitialTab: vi.fn(),
        showToast: vi.fn(),
      })
    );

    expect(CapacitorApp.addListener).not.toHaveBeenCalled();
  });

  it('Prioridad 1 y 2: debe detenerse si la pila executeTopBackHandler maneja el evento', async () => {
    vi.spyOn(backHandlerModule, 'executeTopBackHandler').mockReturnValue(true);
    const onGoToInitialTab = vi.fn();
    const showToast = vi.fn();

    renderHook(() =>
      useAndroidBackButton({
        currentTab: 'pedidos',
        initialTab: 'salon',
        onGoToInitialTab,
        showToast,
      })
    );

    expect(backListener).toBeDefined();
    backListener!();

    expect(onGoToInitialTab).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });

  it('Prioridad 3: debe volver a la pestaña inicial si está en pestaña secundaria', async () => {
    vi.spyOn(backHandlerModule, 'executeTopBackHandler').mockReturnValue(false);
    const onGoToInitialTab = vi.fn();
    const showToast = vi.fn();

    renderHook(() =>
      useAndroidBackButton({
        currentTab: 'pedidos',
        initialTab: 'salon',
        onGoToInitialTab,
        showToast,
      })
    );

    backListener!();

    expect(onGoToInitialTab).toHaveBeenCalledTimes(1);
    expect(showToast).not.toHaveBeenCalled();
  });

  it('Prioridad 4: en pestaña inicial muestra aviso y con segunda pulsación sale de la app', async () => {
    vi.spyOn(backHandlerModule, 'executeTopBackHandler').mockReturnValue(false);
    const onGoToInitialTab = vi.fn();
    const showToast = vi.fn();

    renderHook(() =>
      useAndroidBackButton({
        currentTab: 'salon',
        initialTab: 'salon',
        onGoToInitialTab,
        showToast,
      })
    );

    // Primera pulsación
    backListener!();
    expect(showToast).toHaveBeenCalledWith('Presione de nuevo para salir');
    expect(CapacitorApp.exitApp).not.toHaveBeenCalled();

    // Segunda pulsación en menos de 2s
    backListener!();
    expect(CapacitorApp.exitApp).toHaveBeenCalledTimes(1);
  });
});
