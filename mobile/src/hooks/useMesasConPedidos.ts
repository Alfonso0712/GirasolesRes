import { useState, useEffect, useCallback, useRef } from 'react';
import { mesaService } from '../services/mesaService';
import { pedidoService } from '../services/pedidoService';
import { cobroService } from '../services/cobroService';
const INTERVALO_POLLING_MESAS_MS = 15_000;
import { authService } from '../services/authService';
import { evaluarVigenciaSesion } from '../config/sesion';
import type { MesaItem, PedidoMesaResumen } from '../types/mesa';
import type { RolUsuario } from '../types/auth';
import type { PedidoItemDto } from '../types/pedido';
import type { PedidoPendienteCobro } from '../types/cobro';

const ZONA_LIMA = 'America/Lima';

/**
 * Normaliza el nombre de una mesa para comparaciones insensibles a mayúsculas y espacios.
 */
export function normalizarNombreMesa(nombre?: string | null): string {
  if (!nombre) return '';
  return nombre.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Calcula los minutos transcurridos desde una hora ("HH:mm" en America/Lima o ISO 8601)
 * hasta el instante `ahoraMs`. Devuelve `null` si la hora no es válida.
 * Nunca devuelve 0 para una mesa ocupada con hora válida (mínimo 1 minuto).
 */
export function calcularMinutosOcupadaDesdeHora(
  hora?: string | null,
  ahoraMs: number = Date.now()
): number | null {
  if (!hora || typeof hora !== 'string') return null;
  const limpia = hora.trim();
  if (!limpia) return null;

  // Caso 1: Cadena ISO o fecha completa
  if (limpia.includes('T') || limpia.includes('-')) {
    const fechaMs = new Date(limpia).getTime();
    if (!isNaN(fechaMs)) {
      const diffMin = Math.floor((ahoraMs - fechaMs) / 60_000);
      return Math.max(1, diffMin);
    }
  }

  // Caso 2: Formato "HH:mm" en hora de Lima
  const match = /^(\d{1,2}):(\d{2})/.exec(limpia);
  if (!match) return null;

  const hPedido = Number(match[1]);
  const mPedido = Number(match[2]);
  if (isNaN(hPedido) || isNaN(mPedido) || hPedido < 0 || hPedido > 23 || mPedido < 0 || mPedido > 59) {
    return null;
  }

  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONA_LIMA,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(ahoraMs));

  const hActual = Number(partes.find((p) => p.type === 'hour')?.value ?? NaN);
  const mActual = Number(partes.find((p) => p.type === 'minute')?.value ?? NaN);
  if (isNaN(hActual) || isNaN(mActual)) return null;

  const totalActual = hActual * 60 + mActual;
  const totalPedido = hPedido * 60 + mPedido;

  const diff =
    totalActual >= totalPedido
      ? totalActual - totalPedido
      : totalActual + 24 * 60 - totalPedido;

  return Math.max(1, diff);
}

/**
 * Determina si un estado de pedido corresponde a un pedido abierto en salón.
 */
function esPedidoAbiertoEnMesa(estado?: string | null): boolean {
  if (!estado) return false;
  const norm = estado.trim().toLowerCase();
  if (norm === 'pagado' || norm === 'anulado') return false;
  if (norm.startsWith('pagado') || norm.endsWith('pagado')) return false;
  return true;
}

/**
 * Combina la lista de mesas con los pedidos abiertos (del listado de pedidos o de cobros pendientes)
 * para poblar `totalPendiente`, `minutosOcupada` y `pedidosMesa` con datos reales.
 */
export function combinarMesasConPedidos(
  mesas: MesaItem[],
  pedidosDia: PedidoItemDto[],
  cobrosPendientes: PedidoPendienteCobro[],
  ahoraMs: number = Date.now()
): MesaItem[] {
  return mesas.map((mesa) => {
    if (mesa.ocupacion !== 'Ocupada') {
      return {
        ...mesa,
        totalPendiente: null,
        minutosOcupada: null,
        pedidosMesa: [],
      };
    }

    const nombreNorm = normalizarNombreMesa(mesa.nombre);
    const mapaPedidos = new Map<string, PedidoMesaResumen>();
    let mozoDetectado = mesa.mozo ?? null;

    // 1. Incorporar desde cobrosPendientes (Cajero)
    for (const c of cobrosPendientes) {
      const coincideId = Boolean(c.mesaId && c.mesaId === mesa.id);
      const nombreCobro = normalizarNombreMesa(c.mesa || c.mesaNombre);
      const coincideNombre = Boolean(nombreNorm && nombreCobro && nombreNorm === nombreCobro);

      if (coincideId || coincideNombre) {
        const id = c.pedidoId;
        mapaPedidos.set(id, {
          id,
          numero: c.numero ?? 0,
          estado: c.estado || (c.estaListo ? 'Listo' : 'Pendiente'),
          total: typeof c.total === 'number' ? c.total : 0,
          hora: c.hora || c.fechaCreacion,
        });
        if (!mozoDetectado && c.mozoNombre) {
          mozoDetectado = c.mozoNombre;
        }
      }
    }

    // 2. Incorporar desde pedidosDia (Administrador / Mozo / respaldo Cajero)
    for (const p of pedidosDia) {
      if (!esPedidoAbiertoEnMesa(p.estado)) continue;
      const coincideNombre =
        Boolean(nombreNorm) && normalizarNombreMesa(p.mesa) === nombreNorm;
      if (!coincideNombre) continue;

      const existente = mapaPedidos.get(p.id);
      mapaPedidos.set(p.id, {
        id: p.id,
        numero: p.numero || existente?.numero || 0,
        estado: p.estado || existente?.estado || 'Pendiente',
        total: typeof p.total === 'number' ? p.total : (existente?.total ?? 0),
        hora: p.hora || existente?.hora,
      });
      if (!mozoDetectado && p.registradoPor) {
        mozoDetectado = p.registradoPor;
      }
    }

    const listaPedidos = Array.from(mapaPedidos.values()).sort((a, b) => a.numero - b.numero);

    // Calcular total acumulado real
    let totalPendiente: number | null =
      typeof mesa.totalPendiente === 'number' && mesa.totalPendiente > 0
        ? mesa.totalPendiente
        : null;

    if (listaPedidos.length > 0) {
      totalPendiente = listaPedidos.reduce((acc, item) => acc + item.total, 0);
    }

    // Calcular minutos ocupada reales (el mayor tiempo entre los pedidos abiertos de la mesa)
    let minutosOcupada: number | null =
      typeof mesa.minutosOcupada === 'number' && mesa.minutosOcupada > 0
        ? mesa.minutosOcupada
        : null;

    for (const ped of listaPedidos) {
      const min = calcularMinutosOcupadaDesdeHora(ped.hora, ahoraMs);
      if (min !== null && (minutosOcupada === null || min > minutosOcupada)) {
        minutosOcupada = min;
      }
    }

    return {
      ...mesa,
      mozo: mozoDetectado,
      totalPendiente,
      minutosOcupada,
      pedidosMesa: listaPedidos,
    };
  });
}

export interface UseMesasConPedidosOpciones {
  rol?: RolUsuario;
  incluirInactivas?: boolean;
  enabled?: boolean;
}

export interface UseMesasConPedidosResultado {
  mesas: MesaItem[];
  cargando: boolean;
  cargandoPedidos: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

/**
 * Hook con sondeo cada 15 segundos que obtiene las mesas del salón y las enriquece
 * con los pedidos abiertos reales según el rol (Cajero: cobros pendientes + pedidos;
 * Administrador y Mozo: listado de pedidos).
 */
export function useMesasConPedidos(
  opciones: UseMesasConPedidosOpciones = {}
): UseMesasConPedidosResultado {
  const { rol, incluirInactivas = false, enabled = true } = opciones;

  const [mesas, setMesas] = useState<MesaItem[]>([]);
  const [cargando, setCargando] = useState<boolean>(enabled);
  const [cargandoPedidos, setCargandoPedidos] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const montadoRef = useRef<boolean>(true);

  const cargarTodo = useCallback(
    async (esFondo: boolean = false) => {
      if (!enabled) return;

      const sesion = authService.getStoredSession();
      if (!sesion || !evaluarVigenciaSesion(sesion).valida) {
        return;
      }

      if (!esFondo) {
        setCargando(true);
        setCargandoPedidos(true);
      }
      setError(null);

      try {
        const mesasBase = await mesaService.getMesas({ incluirInactivas });
        if (!montadoRef.current) return;

        const hayOcupadas = mesasBase.some((m) => m.ocupacion === 'Ocupada');
        if (!hayOcupadas) {
          setMesas(combinarMesasConPedidos(mesasBase, [], []));
          setCargando(false);
          setCargandoPedidos(false);
          return;
        }

        let pedidosDia: PedidoItemDto[] = [];
        let cobrosPendientes: PedidoPendienteCobro[] = [];

        if (rol === 'Cajero') {
          const [resCobros, resPedidos] = await Promise.allSettled([
            cobroService.obtenerPedidosPendientes(),
            pedidoService.listarPedidos({ tamano: 200 }),
          ]);
          if (resCobros.status === 'fulfilled' && Array.isArray(resCobros.value)) {
            cobrosPendientes = resCobros.value;
          }
          if (resPedidos.status === 'fulfilled' && Array.isArray(resPedidos.value)) {
            pedidosDia = resPedidos.value;
          }
        } else {
          try {
            pedidosDia = await pedidoService.listarPedidos({ tamano: 200 });
          } catch {
            pedidosDia = [];
          }
        }

        if (!montadoRef.current) return;

        const enriquecidas = combinarMesasConPedidos(mesasBase, pedidosDia, cobrosPendientes);
        setMesas(enriquecidas);
      } catch (err: unknown) {
        if (!montadoRef.current) return;
        const msg = err instanceof Error ? err.message : 'Error al cargar las mesas del salón.';
        setError(msg);
      } finally {
        if (montadoRef.current) {
          setCargando(false);
          setCargandoPedidos(false);
        }
      }
    },
    [enabled, incluirInactivas, rol]
  );

  useEffect(() => {
    montadoRef.current = true;
    if (!enabled) {
      setCargando(false);
      setCargandoPedidos(false);
      return;
    }

    void cargarTodo(false);

    const id = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      void cargarTodo(true);
    }, INTERVALO_POLLING_MESAS_MS);

    return () => {
      montadoRef.current = false;
      window.clearInterval(id);
    };
  }, [enabled, cargarTodo]);

  const recargar = useCallback(async () => {
    await cargarTodo(false);
  }, [cargarTodo]);

  return {
    mesas,
    cargando,
    cargandoPedidos,
    error,
    recargar,
  };
}
