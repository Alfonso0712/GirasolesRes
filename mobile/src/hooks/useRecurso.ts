import { useState, useEffect, useRef, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { ApiError } from '../services/apiClient';
import { esSesionAlmacenadaValida } from '../config/sesion';
import { mesaService } from '../services/mesaService';
import { cajaService } from '../services/cajaService';
import { cobroService } from '../services/cobroService';
import { pedidoService } from '../services/pedidoService';
import { comandaService } from '../services/comandaService';
import { menuDiaService, type MenuDiaResponseDto } from '../services/menuDiaService';
import { reporteService } from '../services/reporteService';
import { inicioService } from '../services/inicioService';
import type { MesaItem } from '../types/mesa';
import type { CajaActualResponseDto } from '../types/caja';
import type { PedidoPendienteCobro } from '../types/cobro';
import type { PedidoItemDto } from '../types/pedido';
import type { ListarComandasResponse } from '../types/comanda';
import type { ReporteVentasResponse, ReportePlatosResponse } from '../types/reporte';
import type { InicioDashboardData } from '../types/inicio';

export interface UseRecursoOptions<T> {
  intervaloMs?: number;
  pausarEnSegundoPlano?: boolean;
  inicial?: T | null;
  enabled?: boolean;
}

export interface UseRecursoReturn<T> {
  datos: T | null;
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
  actualizadoEn: Date | null;
  setDatos: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Hook genérico para consumo de recursos con sondeo automático y pausa reactiva
 * cuando la aplicación pasa a segundo plano (visibilidad del documento y estado Capacitor).
 */
export function useRecurso<T>(
  fetcher: () => Promise<T>,
  options: UseRecursoOptions<T> = {}
): UseRecursoReturn<T> {
  const {
    intervaloMs,
    pausarEnSegundoPlano = true,
    inicial = null,
    enabled = true,
  } = options;

  const [datos, setDatos] = useState<T | null>(inicial);
  const [cargando, setCargando] = useState<boolean>(enabled && inicial === null);
  const [error, setError] = useState<string | null>(null);
  const [actualizadoEn, setActualizadoEn] = useState<Date | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const enVueloRef = useRef<boolean>(false);
  const tieneDatosRef = useRef<boolean>(inicial !== null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const estaVisibleRef = useRef<boolean>(true);

  const ejecutarCarga = useCallback(
    async (silencioso = false) => {
      if (!enabled) return;
      if (!esSesionAlmacenadaValida()) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
      if (enVueloRef.current) return;
      enVueloRef.current = true;

      if (!silencioso && !tieneDatosRef.current) {
        setCargando(true);
      }

      try {
        const res = await fetcherRef.current();
        setDatos(res);
        tieneDatosRef.current = true;
        setError(null);
        setActualizadoEn(new Date());
      } catch (err: unknown) {
        const status = err instanceof ApiError ? err.status : (err as { status?: number })?.status;
        if (status === 401) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('girasoles:unauthorized'));
          }
          return;
        }
        const msg = err instanceof Error ? err.message : 'Error al obtener los datos.';
        setError(msg);
      } finally {
        enVueloRef.current = false;
        setCargando(false);
      }
    },
    [enabled]
  );

  const recargar = useCallback(async () => {
    await ejecutarCarga(false);
  }, [ejecutarCarga]);

  useEffect(() => {
    if (!enabled || !esSesionAlmacenadaValida()) return;

    ejecutarCarga(false);

    const detenerTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const handleUnauthorized = () => {
      detenerTimer();
    };
    window.addEventListener('girasoles:unauthorized', handleUnauthorized);

    if (!intervaloMs || intervaloMs <= 0) {
      return () => {
        detenerTimer();
        window.removeEventListener('girasoles:unauthorized', handleUnauthorized);
      };
    }

    const iniciarTimer = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (estaVisibleRef.current && esSesionAlmacenadaValida()) {
          ejecutarCarga(true);
        }
      }, intervaloMs);
    };

    iniciarTimer();

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      estaVisibleRef.current = visible;
      if (pausarEnSegundoPlano) {
        if (visible && esSesionAlmacenadaValida()) {
          ejecutarCarga(true);
          iniciarTimer();
        } else {
          detenerTimer();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleReload = () => {
      if (document.visibilityState === 'visible' && esSesionAlmacenadaValida()) {
        ejecutarCarga(true);
      }
    };
    window.addEventListener('girasoles:reload-active-view', handleReload);
    window.addEventListener('online', handleReload);

    let removeAppListener: (() => void) | null = null;
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        estaVisibleRef.current = isActive;
        if (pausarEnSegundoPlano) {
          if (isActive && esSesionAlmacenadaValida()) {
            ejecutarCarga(true);
            iniciarTimer();
          } else {
            detenerTimer();
          }
        }
      }).then((handle) => {
        removeAppListener = () => handle.remove();
      });
    }

    return () => {
      detenerTimer();
      window.removeEventListener('girasoles:unauthorized', handleUnauthorized);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('girasoles:reload-active-view', handleReload);
      window.removeEventListener('online', handleReload);
      if (removeAppListener) removeAppListener();
    };
  }, [enabled, intervaloMs, pausarEnSegundoPlano, ejecutarCarga]);

  return { datos, cargando, error, recargar, actualizadoEn, setDatos };
}

// ==========================================
// Hooks Especializados por Dominio
// ==========================================

/**
 * Consulta de mesas del salón con intervalo de 15 s (alineado con la versión web).
 */
export function useMesas(options?: { incluirInactivas?: boolean; estado?: string; enabled?: boolean }) {
  const fetcher = useCallback(
    () => mesaService.getMesas({ incluirInactivas: options?.incluirInactivas, estado: options?.estado }),
    [options?.incluirInactivas, options?.estado]
  );
  return useRecurso<MesaItem[]>(fetcher, {
    intervaloMs: 15000,
    pausarEnSegundoPlano: true,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Consulta del estado y turno actual de caja con intervalo de 30 s.
 */
export function useCaja(options?: { enabled?: boolean }) {
  return useRecurso<CajaActualResponseDto>(() => cajaService.obtenerActual(), {
    intervaloMs: 30000,
    pausarEnSegundoPlano: true,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Consulta de pedidos pendientes de cobro con intervalo de 15 s.
 */
export function useCobrosPendientes(options?: { enabled?: boolean }) {
  return useRecurso<PedidoPendienteCobro[]>(() => cobroService.obtenerPedidosPendientes(), {
    intervaloMs: 15000,
    pausarEnSegundoPlano: true,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Consulta de pedidos activos con intervalo de 15 s.
 */
export function usePedidos(params?: { soloMios?: boolean; estado?: string; enabled?: boolean }) {
  const fetcher = useCallback(
    () => pedidoService.listarPedidos({ soloMios: params?.soloMios, estado: params?.estado }),
    [params?.soloMios, params?.estado]
  );
  return useRecurso<PedidoItemDto[]>(fetcher, {
    intervaloMs: 15000,
    pausarEnSegundoPlano: true,
    enabled: params?.enabled ?? true,
  });
}

/**
 * Consulta de comandas en preparación y listas para cocina con intervalo de 5 s.
 */
export function useComandas(options?: { estado?: string; enabled?: boolean }) {
  const fetcher = useCallback(
    () => comandaService.listarComandas(options?.estado),
    [options?.estado]
  );
  return useRecurso<ListarComandasResponse>(fetcher, {
    intervaloMs: 5000,
    pausarEnSegundoPlano: true,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Consulta del menú del día y disponibilidad de platos con intervalo de 30 s.
 */
export function useMenuDia(options?: { enabled?: boolean }) {
  return useRecurso<MenuDiaResponseDto>(() => menuDiaService.obtenerMenuHoy(), {
    intervaloMs: 30000,
    pausarEnSegundoPlano: true,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Consulta de reportes gerenciales bajo demanda (al cambiar de rango).
 */
export function useReportes(rango: { desde?: string; hasta?: string }, options?: { enabled?: boolean }) {
  const fetcher = useCallback(async () => {
    const [ventas, platos] = await Promise.all([
      reporteService.obtenerReporteVentas(rango.desde, rango.hasta),
      reporteService.obtenerReportePlatos(rango.desde, rango.hasta),
    ]);
    return { ventas, platos };
  }, [rango.desde, rango.hasta]);

  return useRecurso<{ ventas: ReporteVentasResponse; platos: ReportePlatosResponse }>(fetcher, {
    pausarEnSegundoPlano: true,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Consulta del resumen del panel de inicio para Administrador con intervalo de 30 s.
 */
export function useInicioDashboard(options?: { enabled?: boolean }) {
  return useRecurso<InicioDashboardData>(() => inicioService.obtenerInicio(), {
    intervaloMs: 30000,
    pausarEnSegundoPlano: true,
    enabled: options?.enabled ?? true,
  });
}
