import { useState } from 'react';
import { pedidoService } from '../services/pedidoService';
import { useBorradorPedido } from './useBorradorPedido';
import { useBackHandler } from './useBackHandler';
import { generarSolicitudId, mapearLineasPedidoPayload } from '../utils/pedidos';

export interface UsePedidoLlevarOptions {
  onPedidoCreado: (mensaje: string) => void;
  onIrACobros?: () => void;
}

type BorradorPedido = ReturnType<typeof useBorradorPedido>;

function resolverAtrasLlevar(borrador: BorradorPedido, referencia: string): boolean {
  if (borrador.mostrarConfirmEnviar) return (borrador.setMostrarConfirmEnviar(false), true);
  if (borrador.lineaParaNota) return (borrador.setLineaParaNota(null), true);
  if (borrador.menuParaArmar) return (borrador.setMenuParaArmar(null), true);
  if (borrador.mostrarPanelOrden) return (borrador.setMostrarPanelOrden(false), true);
  if (borrador.mostrarConfirmDescartar) return (borrador.setMostrarConfirmDescartar(false), true);
  if (borrador.lineas.length > 0 || referencia.trim().length > 0) {
    return (borrador.setMostrarConfirmDescartar(true), true);
  }
  return false;
}

async function enviarRegistroLlevar(
  borrador: BorradorPedido,
  referencia: string,
  setReferencia: (v: string) => void,
  onPedidoCreado: (m: string) => void,
  onIrACobros?: () => void
) {
  const res = await pedidoService.registrarPedidoLlevar({
    solicitudId: generarSolicitudId('sol-llevar'),
    referencia: referencia.trim(),
    lineas: mapearLineasPedidoPayload(borrador.lineas),
  });
  borrador.triggerSuccess();
  borrador.setLineas([]);
  setReferencia('');
  borrador.setMostrarConfirmEnviar(false);
  borrador.setMostrarPanelOrden(false);
  onPedidoCreado(`Pedido para llevar N.º ${res.numero} registrado. La comanda se envió a cocina.`);
  if (onIrACobros) onIrACobros();
}

function manejarErrorLlevar(err: unknown, borrador: BorradorPedido) {
  borrador.triggerError();
  const msg = err instanceof Error ? err.message : 'Error al registrar el pedido para llevar';
  borrador.setErrorEnvio(msg);
  borrador.setMostrarConfirmEnviar(false);
  if (msg.toLowerCase().includes('agotado') || msg.includes('103')) {
    borrador.mostrarToast({
      tipo: 'error',
      mensaje: 'Hay platos agotados en su pedido. Quite o cambie las líneas marcadas.',
    });
  }
}

function validarReferenciaLlevar(referencia: string, borrador: BorradorPedido): boolean {
  const ref = referencia.trim();
  if (ref.length >= 2 && ref.length <= 30) return true;
  borrador.triggerError();
  const mensaje = 'La referencia del cliente para llevar debe tener entre 2 y 30 caracteres.';
  borrador.setErrorEnvio(mensaje);
  borrador.mostrarToast({ tipo: 'error', mensaje });
  return false;
}

/**
 * Orquesta el flujo de toma rápida de pedido para llevar y validación de referencia de cliente.
 */
export function usePedidoLlevar({ onPedidoCreado, onIrACobros }: UsePedidoLlevarOptions) {
  const [referencia, setReferencia] = useState('');
  const borrador = useBorradorPedido();
  useBackHandler(
    borrador.lineas.length > 0 || borrador.mostrarConfirmDescartar || Boolean(referencia.trim()),
    () => resolverAtrasLlevar(borrador, referencia)
  );

  const solicitarRegistroPedido = () => {
    if (borrador.lineas.length === 0 || !validarReferenciaLlevar(referencia, borrador)) return;
    borrador.setErrorEnvio(null);
    borrador.setMostrarConfirmEnviar(true);
  };

  const ejecutarRegistroPedidoLlevar = async () => {
    borrador.setEnviando(true);
    borrador.setErrorEnvio(null);
    try {
      await enviarRegistroLlevar(borrador, referencia, setReferencia, onPedidoCreado, onIrACobros);
    } catch (err: unknown) {
      manejarErrorLlevar(err, borrador);
    } finally {
      borrador.setEnviando(false);
    }
  };

  const cambiarReferencia = (v: string) => {
    setReferencia(v);
    if (borrador.errorEnvio) borrador.setErrorEnvio(null);
  };

  const descartarPedido = () => {
    borrador.setMostrarConfirmDescartar(false);
    borrador.setLineas([]);
    setReferencia('');
  };

  return { ...borrador, referencia, cambiarReferencia, solicitarRegistroPedido, ejecutarRegistroPedidoLlevar, descartarPedido };
}
