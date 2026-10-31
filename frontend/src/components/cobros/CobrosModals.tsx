import React from 'react';
import { AbrirCajaModal } from '../caja/AbrirCajaModal';
import { CerrarCajaModal } from '../caja/CerrarCajaModal';
import { CobroModal } from './CobroModal';
import { TicketComprobanteModal } from './TicketComprobanteModal';
import type { PedidoPendienteCobro, CobroRequest, ComprobanteDetalle } from '../../types/cobro';

interface CobrosModalsProps {
  abrirCajaModalOpen: boolean;
  onCloseAbrirCaja: () => void;
  onCajaAbierta: (monto: number, mensaje: string) => void | Promise<void>;
  token: string;
  sugerenciaInicial?: number | null;

  cerrarCajaModalOpen: boolean;
  onCloseCerrarCaja: () => void;
  onCierreCompletado: () => void;
  pedidos: PedidoPendienteCobro[];
  onIniciarCobro: (pedido: PedidoPendienteCobro) => void;

  cobroModalOpen: boolean;
  onCloseCobro: () => void;
  pedidoParaCobro: PedidoPendienteCobro | null;
  onConfirmarCobro: (request: CobroRequest) => Promise<void>;
  procesandoCobro: boolean;

  ticketModalOpen: boolean;
  onCloseTicket: () => void;
  comprobanteActual: ComprobanteDetalle | null;
  onDescargarTxt: () => Promise<void>;
  descargandoTxt: boolean;
}

export const CobrosModals: React.FC<CobrosModalsProps> = ({
  abrirCajaModalOpen,
  onCloseAbrirCaja,
  onCajaAbierta,
  token,
  sugerenciaInicial,

  cerrarCajaModalOpen,
  onCloseCerrarCaja,
  onCierreCompletado,
  pedidos,
  onIniciarCobro,

  cobroModalOpen,
  onCloseCobro,
  pedidoParaCobro,
  onConfirmarCobro,
  procesandoCobro,

  ticketModalOpen,
  onCloseTicket,
  comprobanteActual,
  onDescargarTxt,
  descargandoTxt,
}) => {
  return (
    <>
      <AbrirCajaModal
        isOpen={abrirCajaModalOpen}
        onClose={onCloseAbrirCaja}
        onCajaAbierta={onCajaAbierta}
        token={token}
        sugerenciaInicial={sugerenciaInicial ?? null}
      />

      <CerrarCajaModal
        isOpen={cerrarCajaModalOpen}
        onClose={onCloseCerrarCaja}
        onCierreCompletado={onCierreCompletado}
        token={token}
        onCobrarPedido={(pedidoId) => {
          const p = pedidos.find((item) => item.pedidoId === pedidoId);
          if (p) onIniciarCobro(p);
        }}
      />

      <CobroModal
        isOpen={cobroModalOpen}
        onClose={onCloseCobro}
        pedido={pedidoParaCobro}
        onConfirmarCobro={onConfirmarCobro}
        loading={procesandoCobro}
        token={token}
      />

      <TicketComprobanteModal
        isOpen={ticketModalOpen}
        onClose={onCloseTicket}
        comprobante={comprobanteActual}
        onDescargarTxt={onDescargarTxt}
        descargando={descargandoTxt}
      />
    </>
  );
};
