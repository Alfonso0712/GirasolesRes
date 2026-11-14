import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionLifecycle } from './useSessionLifecycle';
import { authService } from '../services/authService';
import type { UserSession } from '../types/auth';

vi.mock('../services/authService', () => ({
  authService: {
    renovarToken: vi.fn().mockResolvedValue('new-token-123'),
  },
}));

const mockSession: UserSession = {
  id: '1',
  nombre: 'Carlos',
  apellido: 'Mozo',
  correo: 'carlos@girasoles.com',
  rol: 'Mozo',
  token: 'mock-token',
};

describe('useSessionLifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('inicia con aviso oculto y cuenta regresiva completa', () => {
    const onLogout = vi.fn();
    const { result } = renderHook(() =>
      useSessionLifecycle({
        session: mockSession,
        activeTab: 'salon',
        onLogout,
        inactivityThresholdMs: 5000,
        warningCountdownSeconds: 30,
      })
    );

    expect(result.current.avisoInactividadVisible).toBe(false);
    expect(result.current.segundosRestantes).toBe(30);
  });

  it('activa el aviso de inactividad tras superar el umbral sin interacción', () => {
    const onLogout = vi.fn();
    const { result } = renderHook(() =>
      useSessionLifecycle({
        session: mockSession,
        activeTab: 'salon',
        onLogout,
        inactivityThresholdMs: 5000,
        warningCountdownSeconds: 30,
      })
    );

    act(() => {
      vi.advanceTimersByTime(5500);
    });

    expect(result.current.avisoInactividadVisible).toBe(true);
    expect(result.current.segundosRestantes).toBe(30);
  });

  it('no activa el aviso si el usuario interactúa antes del umbral', () => {
    const onLogout = vi.fn();
    const { result } = renderHook(() =>
      useSessionLifecycle({
        session: mockSession,
        activeTab: 'salon',
        onLogout,
        inactivityThresholdMs: 5000,
        warningCountdownSeconds: 30,
      })
    );

    act(() => {
      vi.advanceTimersByTime(3000);
      window.dispatchEvent(new Event('mousemove'));
      vi.advanceTimersByTime(1100); // Dar margen al throttle
    });

    act(() => {
      vi.advanceTimersByTime(3000); // 3s más (total 6.1s pero con reset en 3s)
    });

    expect(result.current.avisoInactividadVisible).toBe(false);
  });

  it('aplica el límite de inactividad también al rol Cocinero según INACTIVIDAD_POR_ROL', () => {
    const cocineroSession: UserSession = {
      ...mockSession,
      rol: 'Cocinero',
    };
    const onLogout = vi.fn();
    const { result } = renderHook(() =>
      useSessionLifecycle({
        session: cocineroSession,
        activeTab: 'cocina',
        onLogout,
        inactivityThresholdMs: 5000,
        warningCountdownSeconds: 30,
      })
    );

    act(() => {
      vi.advanceTimersByTime(5500);
    });

    expect(result.current.avisoInactividadVisible).toBe(true);
  });

  it('continuarSesion llama a renovarToken y oculta el aviso', async () => {
    const onLogout = vi.fn();
    const { result } = renderHook(() =>
      useSessionLifecycle({
        session: mockSession,
        activeTab: 'salon',
        onLogout,
        inactivityThresholdMs: 5000,
        warningCountdownSeconds: 30,
      })
    );

    act(() => {
      vi.advanceTimersByTime(5500);
    });

    expect(result.current.avisoInactividadVisible).toBe(true);

    await act(async () => {
      await result.current.continuarSesion();
    });

    expect(authService.renovarToken).toHaveBeenCalledTimes(1);
    expect(result.current.avisoInactividadVisible).toBe(false);
  });

  it('ejecuta logout automáticamente si la cuenta regresiva llega a 0', () => {
    const onLogout = vi.fn();
    const { result } = renderHook(() =>
      useSessionLifecycle({
        session: mockSession,
        activeTab: 'salon',
        onLogout,
        inactivityThresholdMs: 5000,
        warningCountdownSeconds: 5,
      })
    );

    act(() => {
      vi.advanceTimersByTime(5500); // Dispara aviso
    });

    expect(result.current.avisoInactividadVisible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(6000); // Expira cuenta regresiva (5s)
    });

    expect(result.current.avisoInactividadVisible).toBe(false);
    expect(onLogout).toHaveBeenCalledWith(
      expect.stringContaining('inactividad')
    );
  });
});
