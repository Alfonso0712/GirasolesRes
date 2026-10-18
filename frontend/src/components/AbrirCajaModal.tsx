import React from 'react';
import {
  AbrirCajaModal as OfficialAbrirCajaModal,
  type AbrirCajaModalProps as OfficialAbrirCajaModalProps,
} from './caja/AbrirCajaModal';

export interface LegacyAbrirCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (montoApertura: number) => Promise<void>;
  loading?: boolean;
  onCajaAbierta?: (monto: number, mensaje: string) => void;
  token?: string;
  sugerenciaInicial?: number | null;
}

/**
 * Adaptador de compatibilidad hacia atrás para AbrirCajaModal.
 * Permite compatibilidad tanto con la firma clásica (onConfirm)
 * como con la firma oficial de CUS 13.1 (onCajaAbierta, token).
 */
export const AbrirCajaModal: React.FC<LegacyAbrirCajaModalProps> = (props) => {
  const {
    isOpen,
    onClose,
    onConfirm,
    onCajaAbierta,
    token = '',
    sugerenciaInicial = null,
  } = props;

  const handleCajaAbierta = async (monto: number, mensaje: string) => {
    if (onCajaAbierta) {
      onCajaAbierta(monto, mensaje);
    } else if (onConfirm) {
      await onConfirm(monto);
    }
  };

  const officialProps: OfficialAbrirCajaModalProps = {
    isOpen,
    onClose,
    onCajaAbierta: handleCajaAbierta,
    token,
    sugerenciaInicial,
  };

  return <OfficialAbrirCajaModal {...officialProps} />;
};

export default AbrirCajaModal;
