import React from 'react';
import { DetallePedidoModal } from './DetallePedidoModal';
import { AnularPedidoModal } from './AnularPedidoModal';
import type { PedidoItemDto, DetallePedidoCompletoDto } from '../../types/pedido';

interface PedidosModalsProps {
  pedidoSeleccionadoDetalle: DetallePedidoCompletoDto | null;
  abrirModalDetalle: boolean;
  onCloseDetalle: () => void;
  pedidos: PedidoItemDto[];
  onAbrirAnular: (item: PedidoItemDto) => void;
  pedidoParaAnular: PedidoItemDto | null;
  abrirModalAnular: boolean;
  onCloseAnular: () => void;
  onConfirmarAnular: (pedidoId: string, motivo: string) => Promise<void>;
  guardandoAnulacion: boolean;
}

export const PedidosModals: React.FC<PedidosModalsProps> = ({
  pedidoSeleccionadoDetalle,
  abrirModalDetalle,
  onCloseDetalle,
  pedidos,
  onAbrirAnular,
  pedidoParaAnular,
  abrirModalAnular,
  onCloseAnular,
  onConfirmarAnular,
  guardandoAnulacion,
}) => {
  const itemEncontrado = pedidoSeleccionadoDetalle
    ? pedidos.find((p) => p.id === pedidoSeleccionadoDetalle.id)
    : undefined;

  return (
    <>
      {/* Modal de Detalle (Vista 9.2) */}
      <DetallePedidoModal
        pedido={pedidoSeleccionadoDetalle}
        isOpen={abrirModalDetalle}
        onClose={onCloseDetalle}
        onAbrirAnular={(id) => {
          const item = pedidos.find((p) => p.id === id);
          if (item) onAbrirAnular(item);
        }}
        puedeAnular={itemEncontrado ? itemEncontrado.puedeAnular : false}
        motivoDeshabilitado={itemEncontrado ? itemEncontrado.motivoDeshabilitado : null}
      />

      {/* Modal de Anulación (Vista 9.4) */}
      <AnularPedidoModal
        pedido={pedidoParaAnular}
        isOpen={abrirModalAnular}
        onClose={onCloseAnular}
        onConfirmAnular={onConfirmarAnular}
        loading={guardandoAnulacion}
      />
    </>
  );
};
