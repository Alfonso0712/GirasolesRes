// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKitchenNotifications } from './useKitchenNotifications';
import { avisoService } from '../services/avisoService';

vi.mock('../hooks/useHaptics', () => ({
  useHaptics: () => ({
    triggerLight: vi.fn(),
    triggerMedium: vi.fn(),
    triggerSuccess: vi.fn(),
    triggerError: vi.fn(),
  }),
}));

describe('useKitchenNotifications - Avisos de Pedidos Listos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('no debe consultar avisos si el rol es Cocinero', async () => {
    const spy = vi.spyOn(avisoService, 'obtenerAvisosPendientes');

    const { unmount } = renderHook(() =>
      useKitchenNotifications({ rol: 'Cocinero', enabled: true })
    );

    expect(spy).not.toHaveBeenCalled();
    unmount();
  });

  it('debe cargar avisos para Mozo y permitir marcar como visto', async () => {
    const aviso1 = {
      id: 'aviso-1',
      pedidoId: '101',
      numero: 101,
      tipo: 'Mesa',
      mesa: 'Mesa 3',
      referencia: 'Mesa 3',
      hora: '12:00',
    };

    vi.spyOn(avisoService, 'obtenerAvisosPendientes').mockResolvedValue([aviso1]);
    const marcarSpy = vi.spyOn(avisoService, 'marcarAvisoVisto').mockResolvedValue(undefined);

    const { result, unmount } = renderHook(() =>
      useKitchenNotifications({ rol: 'Mozo', enabled: true })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.avisos).toEqual([aviso1]);

    // Marcar como visto
    await act(async () => {
      await result.current.marcarVisto('aviso-1');
    });

    expect(marcarSpy).toHaveBeenCalledWith('aviso-1');
    expect(result.current.avisos).toEqual([]);

    unmount();
  });
});
