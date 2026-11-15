import { useState, useCallback } from 'react';
import type { MesaItem } from '../types/mesa';
import type { RolUsuario } from '../types/auth';
import type { MenuDiaResponseDto } from '../types/menuDia';
import type { PedidoAbiertoMesaDto } from '../types/pedido';
import { pedidoService } from '../services/pedidoService';
import { useBorradorPedido } from './useBorradorPedido';
import { useBackHandler } from './useBackHandler';
import { puedeVerMontos } from '../config/permisos';
import { formatCurrency, pluralizar } from '../utils/format';
import { generarSolicitudId, mapearLineasPedidoPayload } from '../utils/pedidos';
import { mensajeDeError } from '../utils/errores';

export interface UsePedidoMesaOptions {
  mesa: MesaItem;
  rol: RolUsuario;
  menuDiaInicial?: MenuDiaResponseDto | null;
  onVolver: () => void;
  onPedidoExitoso: (mensaje: string) => void;
}

type BorradorMesa = ReturnType<typeof useBorradorPedido>;

function resolverVolverMesa(borrador: BorradorMesa, onVolver: () => void) {
  if (borrador.mostrarConfirmEnviar) return borrador.setMostrarConfirmEnviar(false);
  if (borrador.lineaParaNota) return borrador.setLineaParaNota(null);
  if (borrador.menuParaArmar) return borrador.setMenuParaArmar(null);
  if (borrador.mostrarPanelOrden) return borrador.setMostrarPanelOrden(false);
  if (borrador.mostrarConfirmDescartar) return borrador.setMostrarConfirmDescartar(false);
  if (borrador.lineas.length > 0) return borrador.setMostrarConfirmDescartar(true);
  onVolver();
}

function manejarErrorEnvioMesa(err: unknown, esAmpliacion: boolean, borrador: BorradorMesa) {
  borrador.triggerError();
  const fallback = esAmpliacion ? 'Error al agregar platos al pedido' : 'Error al registrar el pedido para la mesa';
  const msg = mensajeDeError(err, fallback);
  borrador.setErrorEnvio(msg);
  borrador.setMostrarConfirmEnviar(false);
  if (esAmpliacion && (msg.includes('115') || msg.toLowerCase().includes('en preparación'))) {
    borrador.mostrarToast({ tipo: 'error', mensaje: 'El pedido ya está en preparación y no puede modificarse. Avise a cocina.' });
  } else if (!esAmpliacion && (msg.toLowerCase().includes('agotado') || msg.includes('103'))) {
    borrador.mostrarToast({ tipo: 'error', mensaje: 'Hay platos agotados en su pedido. Quite o cambie las líneas marcadas.' });
  }
}

async function enviarComandaMesa(
  mesa: MesaItem,
  pedidoActivo: PedidoAbiertoMesaDto | null,
  esMozo: boolean,
  draftKey: string,
  borrador: BorradorMesa,
  onPedidoExitoso: (mensaje: string) => void
) {
  const solicitudId = generarSolicitudId('sol-mesa');
  const lineasPayload = mapearLineasPedidoPayload(borrador.lineas);
  const res = pedidoActivo
    ? await pedidoService.agregarLineas(pedidoActivo.id, { solicitudId, lineas: lineasPayload })
    : await pedidoService.registrarPedidoMesa({ solicitudId, mesaId: mesa.id, lineas: lineasPayload });
  borrador.triggerSuccess();
  sessionStorage.removeItem(draftKey);
  borrador.setMostrarConfirmEnviar(false);
  borrador.setMostrarPanelOrden(false);
  const msg = 'numeroPedido' in res
    ? esMozo
      ? `Se agregaron ${pluralizar(borrador.totalItems, 'plato', 'platos')} al pedido N.º ${res.numeroPedido} de ${mesa.nombre}. La comanda adicional se envió a cocina.`
      : `Se agregaron platos al pedido N.º ${res.numeroPedido} de ${mesa.nombre} (Total: ${formatCurrency(res.total)}). La comanda adicional se envió a cocina.`
    : esMozo
      ? `Pedido N.º ${res.numero} registrado para ${mesa.nombre}. La comanda se envió a cocina.`
      : `Pedido N.º ${res.numero} registrado para ${mesa.nombre} (${formatCurrency(borrador.total)}). La comanda se envió a cocina.`;
  onPedidoExitoso(msg);
}

/**
 * Orquesta la toma o ampliación de pedido para una mesa, su borrador y el envío a cocina.
 */
export function usePedidoMesa({ mesa, rol, menuDiaInicial = null, onVolver, onPedidoExitoso }: UsePedidoMesaOptions) {
  const [pedidoActivo, setPedidoActivo] = useState<PedidoAbiertoMesaDto | null>(null);
  const draftKey = `girasoles_borrador_mesa_${mesa.id}`;
  const cargarAdicional = useCallback(async () => {
    const pedidos = mesa.ocupacion === 'Ocupada' ? await pedidoService.obtenerPedidosActivosPorMesa(mesa.id).catch(() => []) : [];
    setPedidoActivo(pedidos.length > 0 ? pedidos[0] : null);
  }, [mesa.id, mesa.ocupacion]);
  const borrador = useBorradorPedido({ draftKey, menuDiaInicial, onCargarAdicional: cargarAdicional });
  const esMozo = !puedeVerMontos(rol);
  const solicitarVolver = useCallback(() => resolverVolverMesa(borrador, onVolver), [borrador, onVolver]);
  const solicitarEnvioComanda = () => {
    if (borrador.lineas.length > 0) {
      borrador.setErrorEnvio(null);
      borrador.setMostrarConfirmEnviar(true);
    }
  };
  const ejecutarEnvioComanda = async () => {
    borrador.setEnviando(true);
    borrador.setErrorEnvio(null);
    try {
      await enviarComandaMesa(mesa, pedidoActivo, esMozo, draftKey, borrador, onPedidoExitoso);
    } catch (err: unknown) {
      manejarErrorEnvioMesa(err, Boolean(pedidoActivo), borrador);
    } finally {
      borrador.setEnviando(false);
    }
  };
  const descartarYVolver = () => {
    sessionStorage.removeItem(draftKey);
    borrador.setMostrarConfirmDescartar(false);
    borrador.setLineas([]);
    onVolver();
  };
  useBackHandler(true, () => { solicitarVolver(); return true; });
  return { ...borrador, pedidoActivo, esMozo, esAmpliacion: Boolean(pedidoActivo), solicitarVolver, solicitarEnvioComanda, ejecutarEnvioComanda, descartarYVolver };
}
