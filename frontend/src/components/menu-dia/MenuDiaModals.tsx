import React from 'react';
import { MenuDisponibilidadConfirmModal } from './MenuDisponibilidadConfirmModal';
import { DiscardChangesModal } from '../ui/DiscardChangesModal';
import type { ItemDisponibilidad } from '../../hooks/useMenuDiaManagement';

interface MenuDiaModalsProps {
  dispModalOpen: boolean;
  onCloseDisp: () => void;
  onConfirmDisp: () => void;
  itemAConfirmar: ItemDisponibilidad | null;
  nuevoEstadoAgotado: boolean;
  procesandoDisp: boolean;

  discardModalOpen: boolean;
  onCloseDiscard: () => void;
  onConfirmDiscard: () => void;
}

export const MenuDiaModals: React.FC<MenuDiaModalsProps> = ({
  dispModalOpen,
  onCloseDisp,
  onConfirmDisp,
  itemAConfirmar,
  nuevoEstadoAgotado,
  procesandoDisp,
  discardModalOpen,
  onCloseDiscard,
  onConfirmDiscard,
}) => {
  return (
    <>
      {/* MODAL DE CONFIRMACIÓN DE DISPONIBILIDAD (CUS05.2 / RV-49) */}
      <MenuDisponibilidadConfirmModal
        isOpen={dispModalOpen}
        onClose={onCloseDisp}
        onConfirm={onConfirmDisp}
        plato={itemAConfirmar}
        nuevoEstadoAgotado={nuevoEstadoAgotado}
        procesando={procesandoDisp}
      />

      {/* MODAL DE DESCARTE DE CAMBIOS (RV-48 / MSG-72) */}
      <DiscardChangesModal
        isOpen={discardModalOpen}
        onClose={onCloseDiscard}
        onConfirm={onConfirmDiscard}
      />
    </>
  );
};
