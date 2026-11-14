import React from 'react';
import { ConfirmSheet } from '../ui/ConfirmSheet';

export interface InactivitySheetProps {
  isOpen: boolean;
  segundosRestantes: number;
  renovando: boolean;
  onContinuar: () => void | Promise<void>;
  onCerrar: () => void | Promise<void>;
}

export const InactivitySheet: React.FC<InactivitySheetProps> = ({
  isOpen,
  segundosRestantes,
  renovando,
  onContinuar,
  onCerrar,
}) => {
  return (
    <ConfirmSheet
      isOpen={isOpen}
      titulo="Su sesión está por expirar. ¿Desea continuar?"
      mensaje={`Su sesión se cerrará automáticamente en ${segundosRestantes} s por inactividad.`}
      etiquetaConfirmar="Continuar"
      etiquetaCancelar="Cerrar sesión"
      tono="normal"
      cargando={renovando}
      onConfirmar={() => void onContinuar()}
      onCancelar={() => void onCerrar()}
    />
  );
};
