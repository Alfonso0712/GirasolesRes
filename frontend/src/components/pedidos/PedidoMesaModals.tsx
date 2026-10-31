import React from 'react';
import { NotaObservacionModal } from './NotaObservacionModal';
import { PedidoDescartarModal } from './PedidoDescartarModal';
import { PedidoConfirmacionModal } from './PedidoConfirmacionModal';
import { ArmarMenuCompletoModal } from '../menu-dia/ArmarMenuCompletoModal';
import type { MenuCompletoDia } from '../../types/menuDia';

interface PedidoMesaModalsProps {
  modalNotaOpen: boolean;
  onCloseNota: () => void;
  productoNombre?: string;
  observacionActual?: string;
  onGuardarNota: (obs: string) => void;

  modalDescartarOpen: boolean;
  onCloseDescartar: () => void;
  onConfirmarDescarte: () => void;

  modalArmarOpen: boolean;
  menuParaArmar: MenuCompletoDia | null;
  onCloseArmar: () => void;
  onConfirmarArmar: (
    elecciones: { parte: string; productoId: string; productoNombre: string }[],
    observacion: string
  ) => void;

  modalExitoOpen: boolean;
  exitoData: {
    numeroPedido: number;
    mesaNombre: string;
    total: number;
  } | null;
  modo: 'nuevo' | 'ampliacion';
  onNuevoPedido: () => void;
  onVerMesas: () => void;
}

export const PedidoMesaModals: React.FC<PedidoMesaModalsProps> = ({
  modalNotaOpen,
  onCloseNota,
  productoNombre,
  observacionActual,
  onGuardarNota,

  modalDescartarOpen,
  onCloseDescartar,
  onConfirmarDescarte,

  modalArmarOpen,
  menuParaArmar,
  onCloseArmar,
  onConfirmarArmar,

  modalExitoOpen,
  exitoData,
  modo,
  onNuevoPedido,
  onVerMesas,
}) => {
  return (
    <>
      <NotaObservacionModal
        isOpen={modalNotaOpen}
        onClose={onCloseNota}
        productoNombre={productoNombre || 'Plato'}
        observacionActual={observacionActual || ''}
        onGuardar={onGuardarNota}
      />

      <PedidoDescartarModal
        isOpen={modalDescartarOpen}
        onClose={onCloseDescartar}
        onConfirmarDescarte={onConfirmarDescarte}
      />

      <ArmarMenuCompletoModal
        isOpen={modalArmarOpen}
        onClose={onCloseArmar}
        menu={menuParaArmar}
        onConfirm={onConfirmarArmar}
      />

      {exitoData && (
        <PedidoConfirmacionModal
          isOpen={modalExitoOpen}
          modo={modo}
          numeroPedido={exitoData.numeroPedido}
          mesaNombre={exitoData.mesaNombre}
          total={exitoData.total}
          onNuevoPedido={onNuevoPedido}
          onVerMesas={onVerMesas}
        />
      )}
    </>
  );
};
