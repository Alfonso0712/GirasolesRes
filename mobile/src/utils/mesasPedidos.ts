import type { MesaItem, PedidoMesaResumen } from '../types/mesa';
import type { PedidoItemDto } from '../types/pedido';
import type { PedidoPendienteCobro } from '../types/cobro';

const ZONA_LIMA = 'America/Lima';

export function normalizarNombreMesa(nombre?: string | null): string {
  if (!nombre) return '';
  return nombre.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Calcula los minutos transcurridos desde una hora ("HH:mm" en America/Lima o ISO 8601).
 * Devuelve `null` si la hora no es valida y minimo 1 minuto si es valida.
 */
export function calcularMinutosOcupadaDesdeHora(
  hora?: string | null,
  ahoraMs: number = Date.now()
): number | null {
  if (!hora || typeof hora !== 'string') return null;
  const limpia = hora.trim();
  if (!limpia) return null;

  if (limpia.includes('T') || limpia.includes('-')) {
    const fechaMs = new Date(limpia).getTime();
    if (!isNaN(fechaMs)) {
      return Math.max(1, Math.floor((ahoraMs - fechaMs) / 60_000));
    }
  }

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
  const diff = totalActual >= totalPedido ? totalActual - totalPedido : totalActual + 24 * 60 - totalPedido;
  return Math.max(1, diff);
}

function esPedidoAbiertoEnMesa(estado?: string | null): boolean {
  if (!estado) return false;
  const norm = estado.trim().toLowerCase();
  if (norm === 'pagado' || norm === 'anulado') return false;
  if (norm.startsWith('pagado') || norm.endsWith('pagado')) return false;
  return true;
}

function enriquecerMesaOcupada(
  mesa: MesaItem,
  pedidosDia: PedidoItemDto[],
  cobrosPendientes: PedidoPendienteCobro[],
  ahoraMs: number
): MesaItem {
  const nombreNorm = normalizarNombreMesa(mesa.nombre);
  const mapaPedidos = new Map<string, PedidoMesaResumen>();
  let mozoDetectado = mesa.mozo ?? null;

  for (const c of cobrosPendientes) {
    const coincideId = Boolean(c.mesaId && c.mesaId === mesa.id);
    const nombreCobro = normalizarNombreMesa(c.mesa || c.mesaNombre);
    if (coincideId || (nombreNorm && nombreCobro && nombreNorm === nombreCobro)) {
      const id = c.pedidoId;
      mapaPedidos.set(id, {
        id,
        numero: c.numero ?? 0,
        estado: c.estado || (c.estaListo ? 'Listo' : 'Pendiente'),
        total: typeof c.total === 'number' ? c.total : 0,
        hora: c.hora || c.fechaCreacion,
      });
      if (!mozoDetectado && c.mozoNombre) mozoDetectado = c.mozoNombre;
    }
  }

  for (const p of pedidosDia) {
    if (!esPedidoAbiertoEnMesa(p.estado)) continue;
    if (!nombreNorm || normalizarNombreMesa(p.mesa) !== nombreNorm) continue;
    const existente = mapaPedidos.get(p.id);
    mapaPedidos.set(p.id, {
      id: p.id,
      numero: p.numero || existente?.numero || 0,
      estado: p.estado || existente?.estado || 'Pendiente',
      total: typeof p.total === 'number' ? p.total : (existente?.total ?? 0),
      hora: p.hora || existente?.hora,
    });
    if (!mozoDetectado && p.registradoPor) mozoDetectado = p.registradoPor;
  }

  const listaPedidos = Array.from(mapaPedidos.values()).sort((a, b) => a.numero - b.numero);
  let totalPendiente: number | null =
    typeof mesa.totalPendiente === 'number' && mesa.totalPendiente > 0 ? mesa.totalPendiente : null;
  if (listaPedidos.length > 0) {
    totalPendiente = listaPedidos.reduce((acc, item) => acc + item.total, 0);
  }

  let minutosOcupada: number | null =
    typeof mesa.minutosOcupada === 'number' && mesa.minutosOcupada > 0 ? mesa.minutosOcupada : null;
  for (const ped of listaPedidos) {
    const min = calcularMinutosOcupadaDesdeHora(ped.hora, ahoraMs);
    if (min !== null && (minutosOcupada === null || min > minutosOcupada)) {
      minutosOcupada = min;
    }
  }

  return { ...mesa, mozo: mozoDetectado, totalPendiente, minutosOcupada, pedidosMesa: listaPedidos };
}

export function combinarMesasConPedidos(
  mesas: MesaItem[],
  pedidosDia: PedidoItemDto[],
  cobrosPendientes: PedidoPendienteCobro[],
  ahoraMs: number = Date.now()
): MesaItem[] {
  return mesas.map((mesa) =>
    mesa.ocupacion !== 'Ocupada'
      ? { ...mesa, totalPendiente: null, minutosOcupada: null, pedidosMesa: [] }
      : enriquecerMesaOcupada(mesa, pedidosDia, cobrosPendientes, ahoraMs)
  );
}

/**
 * Ante fallo al consultar pedidos, conserva datos previos validos de mesas ocupadas
 * o deja null (sin inventar ceros) si nunca hubo datos para esa mesa.
 */
export function preservarDatosMesasOcupadas(
  mesasBase: MesaItem[],
  mesasPrevias: MesaItem[]
): MesaItem[] {
  const mapaPrevias = new Map(mesasPrevias.map((m) => [m.id, m]));
  return mesasBase.map((mesa) => {
    if (mesa.ocupacion !== 'Ocupada') {
      return { ...mesa, totalPendiente: null, minutosOcupada: null, pedidosMesa: [] };
    }
    const prev = mapaPrevias.get(mesa.id);
    const tieneDatosPrevios = Boolean(
      prev &&
        prev.ocupacion === 'Ocupada' &&
        (prev.totalPendiente !== null ||
          prev.minutosOcupada !== null ||
          (prev.pedidosMesa && prev.pedidosMesa.length > 0))
    );
    if (tieneDatosPrevios && prev) {
      return {
        ...mesa,
        mozo: prev.mozo ?? mesa.mozo ?? null,
        totalPendiente: prev.totalPendiente ?? null,
        minutosOcupada: prev.minutosOcupada ?? null,
        pedidosMesa: prev.pedidosMesa ?? [],
      };
    }
    return {
      ...mesa,
      mozo: mesa.mozo ?? null,
      totalPendiente: typeof mesa.totalPendiente === 'number' && mesa.totalPendiente > 0 ? mesa.totalPendiente : null,
      minutosOcupada: typeof mesa.minutosOcupada === 'number' && mesa.minutosOcupada > 0 ? mesa.minutosOcupada : null,
      pedidosMesa: [],
    };
  });
}
