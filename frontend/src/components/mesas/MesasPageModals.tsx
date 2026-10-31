import React from 'react';
import type { MesaItem } from '../../types/mesa';
import type { PedidoAbiertoMesaDto } from '../../types/pedido';
import { MesaFormModal } from './MesaFormModal';
import { MesaOcupadaModal } from './MesaOcupadaModal';
import { SelectorPedidoModal } from './SelectorPedidoModal';
import { MesaConfirmModal } from './MesaConfirmModal';
import { MesaAccionRolModal } from './MesaAccionRolModal';

export interface MesasPageModalsProps {
  formModalOpen: boolean;
  onCerrarForm: () => void;
  mesaAEditar: MesaItem | null;
  todasLasMesas: MesaItem[];
  onGuardarMesa: (nombre: string) => Promise<void>;
  modalMesaOcupada: { mesa: MesaItem; cantidadPedidos: number } | null;
  onPedidoNuevo: (mesaId: string) => void;
  onAgregarProductos: (mesa: MesaItem) => Promise<void>;
  onCerrarMesaOcupada: () => void;
  pedidosSelector: { mesa: MesaItem; pedidos: PedidoAbiertoMesaDto[] } | null;
  onSeleccionarPedido: (pedidoId: string) => void;
  onCerrarSelectorPedido: () => void;
  confirmModalOpen: boolean;
  onCerrarConfirm: () => void;
  onConfirmarCambioEstado: () => Promise<void>;
  mesaAConfirmar: MesaItem | null;
  confirmAccion: 'activar' | 'desactivar' | null;
  procesandoConfirm: boolean;
  modalAccionRol: { abierto: boolean; mesa: MesaItem | null; accion: string };
  onCerrarModalAccionRol: () => void;
}

export const MesasPageModals: React.FC<MesasPageModalsProps> = ({
  formModalOpen,
  onCerrarForm,
  mesaAEditar,
  todasLasMesas,
  onGuardarMesa,
  modalMesaOcupada,
  onPedidoNuevo,
  onAgregarProductos,
  onCerrarMesaOcupada,
  pedidosSelector,
  onSeleccionarPedido,
  onCerrarSelectorPedido,
  confirmModalOpen,
  onCerrarConfirm,
  onConfirmarCambioEstado,
  mesaAConfirmar,
  confirmAccion,
  procesandoConfirm,
  modalAccionRol,
  onCerrarModalAccionRol,
}) => {
  return (
    <>
      {/* Modal CUS06.1 / CUS06.3: Registrar / Editar Mesa */}
      <MesaFormModal
        isOpen={formModalOpen}
        onClose={onCerrarForm}
        mesaAEditar={mesaAEditar}
        todasLasMesas={todasLasMesas}
        onSave={onGuardarMesa}
      />

      {/* Modal MSG-95: Diálogo al elegir una mesa ocupada */}
      <MesaOcupadaModal
        isOpen={!!modalMesaOcupada}
        mesa={modalMesaOcupada?.mesa || null}
        cantidadPedidos={modalMesaOcupada?.cantidadPedidos || 1}
        onPedidoNuevo={onPedidoNuevo}
        onAgregarProductos={onAgregarProductos}
        onClose={onCerrarMesaOcupada}
      />

      {/* Modal Selector de Pedido para Mesa con Múltiples Pedidos Abiertos */}
      {pedidosSelector && (
        <SelectorPedidoModal
          isOpen={!!pedidosSelector}
          mesaNombre={pedidosSelector.mesa.nombre}
          pedidos={pedidosSelector.pedidos}
          onSeleccionarPedido={onSeleccionarPedido}
          onClose={onCerrarSelectorPedido}
        />
      )}

      {/* Modal CUS06.3 / Vista 6.4: Activar o Desactivar Mesa */}
      <MesaConfirmModal
        isOpen={confirmModalOpen}
        onClose={onCerrarConfirm}
        onConfirm={onConfirmarCambioEstado}
        mesa={mesaAConfirmar}
        accion={confirmAccion || 'activar'}
        loading={procesandoConfirm}
      />

      {/* Modal Informativo de Flujo Alterno para Acciones de Mozo / Cajero (CUS07 y CUS11) */}
      <MesaAccionRolModal
        isOpen={modalAccionRol.abierto}
        mesa={modalAccionRol.mesa}
        accion={modalAccionRol.accion}
        onClose={onCerrarModalAccionRol}
      />
    </>
  );
};
