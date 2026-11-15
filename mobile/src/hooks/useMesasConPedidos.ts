import { useState, useEffect, useCallback, useRef } from 'react';
import { mesaService } from '../services/mesaService';
import { pedidoService } from '../services/pedidoService';
import { cobroService } from '../services/cobroService';
import { authService } from '../services/authService';
import { evaluarVigenciaSesion } from '../config/sesion';
import { puede } from '../config/permisos';
import { mensajeDeError } from '../utils/errores';
import { useAvisoPorTransicion } from './useAvisoPorTransicion';
import {
  normalizarNombreMesa,
  calcularMinutosOcupadaDesdeHora,
  combinarMesasConPedidos,
  preservarDatosMesasOcupadas,
} from '../utils/mesasPedidos';
import type { MesaItem } from '../types/mesa';
import type { RolUsuario } from '../types/auth';
import type { PedidoItemDto } from '../types/pedido';
import type { PedidoPendienteCobro } from '../types/cobro';

export { normalizarNombreMesa, calcularMinutosOcupadaDesdeHora, combinarMesasConPedidos };

const INTERVALO_POLLING_MESAS_MS = 15_000;
const MSG_ERROR_PEDIDOS_MESAS =
  'No se pudieron cargar los pedidos de las mesas. Los totales no están disponibles.';

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

interface ResultadoPedidosMesas {
  ok: boolean;
  error?: unknown;
  pedidosDia: PedidoItemDto[];
  cobrosPendientes: PedidoPendienteCobro[];
}

async function consultarPedidosPorRol(rol?: RolUsuario): Promise<ResultadoPedidosMesas> {
  if (puede(rol, 'cobros.procesar')) {
    const [resCobros, resPedidos] = await Promise.allSettled([
      cobroService.obtenerPedidosPendientes(),
      pedidoService.listarPedidos({ tamano: 200 }),
    ]);
    const cobrosOk = resCobros.status === 'fulfilled';
    const pedidosOk = resPedidos.status === 'fulfilled';
    if (cobrosOk && pedidosOk) {
      return {
        ok: true,
        cobrosPendientes: Array.isArray(resCobros.value) ? resCobros.value : [],
        pedidosDia: Array.isArray(resPedidos.value) ? resPedidos.value : [],
      };
    }
    const err =
      resCobros.status === 'rejected'
        ? resCobros.reason
        : resPedidos.status === 'rejected'
          ? resPedidos.reason
          : undefined;
    return { ok: false, error: err, pedidosDia: [], cobrosPendientes: [] };
  }

  try {
    const lista = await pedidoService.listarPedidos({ tamano: 200 });
    return {
      ok: true,
      pedidosDia: Array.isArray(lista) ? lista : [],
      cobrosPendientes: [],
    };
  } catch (err: unknown) {
    return { ok: false, error: err, pedidosDia: [], cobrosPendientes: [] };
  }
}

/**
 * Hook con sondeo cada 15 segundos que obtiene las mesas del salón y las enriquece
 * con los pedidos abiertos reales según el rol.
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
  const mesasRef = useRef<MesaItem[]>([]);
  const { registrarExito, registrarFallo } = useAvisoPorTransicion();

  const actualizarMesas = useCallback((lista: MesaItem[]) => {
    mesasRef.current = lista;
    setMesas(lista);
  }, []);

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

        if (!mesasBase.some((m) => m.ocupacion === 'Ocupada')) {
          actualizarMesas(combinarMesasConPedidos(mesasBase, [], []));
          registrarExito();
          return;
        }

        const resPedidos = await consultarPedidosPorRol(rol);
        if (!montadoRef.current) return;

        if (resPedidos.ok) {
          actualizarMesas(
            combinarMesasConPedidos(mesasBase, resPedidos.pedidosDia, resPedidos.cobrosPendientes)
          );
          registrarExito();
        } else {
          actualizarMesas(preservarDatosMesasOcupadas(mesasBase, mesasRef.current));
          registrarFallo(resPedidos.error, {
            mensajePorDefecto: MSG_ERROR_PEDIDOS_MESAS,
            reintentar: () => cargarTodo(false),
          });
        }
      } catch (err: unknown) {
        if (!montadoRef.current) return;
        if (esFondo && mesasRef.current.length > 0) {
          registrarFallo(err, {
            mensajePorDefecto: 'No se pudieron actualizar las mesas del salón.',
            reintentar: () => cargarTodo(false),
          });
        } else {
          setError(mensajeDeError(err, 'Error al cargar las mesas del salón.'));
        }
      } finally {
        if (montadoRef.current) {
          setCargando(false);
          setCargandoPedidos(false);
        }
      }
    },
    [enabled, incluirInactivas, rol, actualizarMesas, registrarExito, registrarFallo]
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
