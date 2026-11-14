import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSesionInactividad } from './useSesionInactividad';
import { authService } from '../services/authService';
import {
  AVISO_SESION_EXPIRADA,
  AVISO_SESION_INACTIVIDAD,
  CLAVE_ULTIMA_ACTIVIDAD,
  INACTIVIDAD_POR_ROL,
  AVISO_SEG,
  evaluarVigenciaSesion,
} from '../config/sesion';
import type { UserSession } from '../types/auth';

vi.mock('../services/authService', () => ({
  authService: {
    renovarToken: vi.fn().mockResolvedValue('nuevo-jwt-token'),
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

function crearJwtMock(expSegundos: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: '1', exp: expSegundos }));
  return `${header}.${payload}.firma`;
}

const baseSession: UserSession = {
  id: '1',
  nombre: 'Carlos',
  apellido: 'Mozo',
  correo: 'carlos@girasoles.com',
  rol: 'Mozo',
  token: 'token-prueba',
};

describe('useSesionInactividad y vigencia de sesión (R-A)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('define 10 minutos de inactividad para los 4 roles y 60 segundos de aviso', () => {
    expect(INACTIVIDAD_POR_ROL).toEqual({
      Administrador: 10,
      Cajero: 10,
      Mozo: 10,
      Cocinero: 10,
    });
    expect(AVISO_SEG).toBe(60);
  });

  it('cierra la sesión al arrancar si el token JWT ya expiró (exp)', () => {
    const expPasado = Math.floor(Date.now() / 1000) - 120;
    const sesionVencida: UserSession = {
      ...baseSession,
      token: crearJwtMock(expPasado),
    };
    localStorage.setItem('GIRASOLES_TOKEN', sesionVencida.token);
    localStorage.setItem('GIRASOLES_SESSION', JSON.stringify(sesionVencida));

    const evalRes = evaluarVigenciaSesion(sesionVencida);
    expect(evalRes.valida).toBe(false);
    expect(evalRes.motivo).toBe('expirada');
    expect(evalRes.mensaje).toBe(AVISO_SESION_EXPIRADA);

    const onLogout = vi.fn();
    renderHook(() =>
      useSesionInactividad({
        session: sesionVencida,
        onLogout,
      })
    );

    expect(onLogout).toHaveBeenCalledWith(AVISO_SESION_EXPIRADA);
    expect(localStorage.getItem('GIRASOLES_TOKEN')).toBeNull();
    expect(localStorage.getItem('GIRASOLES_SESSION')).toBeNull();
  });

  it('cierra la sesión al arrancar si transcurrió más de 10 minutos desde la última actividad', () => {
    const haceOnceMinutos = Date.now() - 11 * 60 * 1000;
    localStorage.setItem(CLAVE_ULTIMA_ACTIVIDAD, String(haceOnceMinutos));
    localStorage.setItem('GIRASOLES_SESSION', JSON.stringify(baseSession));

    const evalRes = evaluarVigenciaSesion(baseSession);
    expect(evalRes.valida).toBe(false);
    expect(evalRes.motivo).toBe('inactividad');
    expect(evalRes.mensaje).toBe(AVISO_SESION_INACTIVIDAD);

    const onLogout = vi.fn();
    renderHook(() =>
      useSesionInactividad({
        session: baseSession,
        onLogout,
      })
    );

    expect(onLogout).toHaveBeenCalledWith(AVISO_SESION_INACTIVIDAD);
    expect(localStorage.getItem(CLAVE_ULTIMA_ACTIVIDAD)).toBeNull();
  });

  it('muestra el aviso a los 9 minutos (límite - 1 min) y cierra a los 10 minutos', () => {
    const onLogout = vi.fn();
    const { result } = renderHook(() =>
      useSesionInactividad({
        session: baseSession,
        onLogout,
      })
    );

    expect(result.current.avisoInactividadVisible).toBe(false);

    // Avanzar 8 min 59 s -> aún no muestra aviso
    act(() => {
      vi.advanceTimersByTime((9 * 60 - 1) * 1000);
    });
    expect(result.current.avisoInactividadVisible).toBe(false);

    // Avanzar 2 s más (9 min 1 s) -> muestra aviso con cuenta regresiva de 60 s
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.avisoInactividadVisible).toBe(true);
    expect(result.current.segundosRestantes).toBe(60);

    // Avanzar los 60 s de cuenta regresiva -> cierra sesión automáticamente
    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });
    expect(result.current.avisoInactividadVisible).toBe(false);
    expect(onLogout).toHaveBeenCalledWith(AVISO_SESION_INACTIVIDAD);
  });

  it('cierra inmediatamente al volver del segundo plano si superó el límite de inactividad', () => {
    const onLogout = vi.fn();
    renderHook(() =>
      useSesionInactividad({
        session: baseSession,
        onLogout,
      })
    );

    // Simular que la app estuvo en segundo plano 12 minutos actualizando el reloj y localStorage
    const haceDoceMin = Date.now() - 12 * 60 * 1000;
    localStorage.setItem(CLAVE_ULTIMA_ACTIVIDAD, String(haceDoceMin));

    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'visible',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(onLogout).toHaveBeenCalledWith(AVISO_SESION_INACTIVIDAD);
  });

  it('cierra la sesión ante cualquier respuesta 401 global pero NO ante un error de red', () => {
    const onLogout = vi.fn();
    renderHook(() =>
      useSesionInactividad({
        session: baseSession,
        onLogout,
      })
    );

    // Un error de red o timeout NO debe cerrar la sesión
    act(() => {
      window.dispatchEvent(
        new CustomEvent('girasoles:network-error', {
          detail: { status: 0, tipo: 'timeout' },
        })
      );
    });
    expect(onLogout).not.toHaveBeenCalled();

    // Una respuesta 401 dispara el cierre con aviso de expiración
    act(() => {
      window.dispatchEvent(new CustomEvent('girasoles:unauthorized'));
    });
    expect(onLogout).toHaveBeenCalledWith(AVISO_SESION_EXPIRADA);
  });

  it('limita la escritura en localStorage a como máximo una vez cada 15 segundos', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const onLogout = vi.fn();
    renderHook(() =>
      useSesionInactividad({
        session: baseSession,
        onLogout,
      })
    );

    // 1 escritura inicial al montar la sesión
    const escriturasIniciales = setItemSpy.mock.calls.filter(
      ([k]) => k === CLAVE_ULTIMA_ACTIVIDAD
    ).length;
    expect(escriturasIniciales).toBe(1);

    // Eventos a los 3 s y 8 s -> no deben escribir en localStorage
    act(() => {
      vi.advanceTimersByTime(3000);
      window.dispatchEvent(new Event('touchstart'));
      vi.advanceTimersByTime(5000);
      window.dispatchEvent(new Event('keydown'));
    });

    const escriturasAntesDe15s = setItemSpy.mock.calls.filter(
      ([k]) => k === CLAVE_ULTIMA_ACTIVIDAD
    ).length;
    expect(escriturasAntesDe15s).toBe(1);

    // Evento a los 16 s -> debe escribir en localStorage
    act(() => {
      vi.advanceTimersByTime(8000);
      window.dispatchEvent(new Event('touchstart'));
    });

    const escriturasDespuesDe15s = setItemSpy.mock.calls.filter(
      ([k]) => k === CLAVE_ULTIMA_ACTIVIDAD
    ).length;
    expect(escriturasDespuesDe15s).toBe(2);
  });

  it('continuarSesion renueva la marca de actividad y oculta el aviso', async () => {
    const onLogout = vi.fn();
    const { result } = renderHook(() =>
      useSesionInactividad({
        session: baseSession,
        onLogout,
      })
    );

    act(() => {
      vi.advanceTimersByTime(9 * 60 * 1000 + 1000);
    });
    expect(result.current.avisoInactividadVisible).toBe(true);

    await act(async () => {
      await result.current.continuarSesion();
    });

    expect(authService.renovarToken).toHaveBeenCalledTimes(1);
    expect(result.current.avisoInactividadVisible).toBe(false);
    expect(onLogout).not.toHaveBeenCalled();
  });
});
