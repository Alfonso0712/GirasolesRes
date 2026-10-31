import React from 'react';
import { Lock } from 'lucide-react';
import { SolesIcon } from '../ui/SolesIcon';
import type { RolUsuario } from '../../types/auth';

interface CobrosCajaActionButtonProps {
  rol?: RolUsuario;
  estadoOperativo?: string;
  onAbrirCaja: () => void;
  onCerrarCaja: () => void;
}

export const CobrosCajaActionButton: React.FC<CobrosCajaActionButtonProps> = ({
  rol,
  estadoOperativo,
  onAbrirCaja,
  onCerrarCaja,
}) => {
  if (rol !== 'Cajero') return null;

  if (estadoOperativo === 'abierta') {
    return (
      <button
        type="button"
        onClick={onCerrarCaja}
        className="px-3.5 py-2 rounded-xl bg-fill-strong hover:bg-fill-strong-soft text-white text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer min-h-[40px]"
      >
        <Lock className="w-4 h-4" />
        <span>Cerrar caja</span>
      </button>
    );
  }

  if (estadoOperativo === 'anteriorSinCerrar') {
    return (
      <button
        type="button"
        onClick={onCerrarCaja}
        className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer min-h-[40px]"
      >
        <Lock className="w-4 h-4" />
        <span>Cerrar caja anterior</span>
      </button>
    );
  }

  if (estadoOperativo === 'sinCaja') {
    return (
      <button
        type="button"
        onClick={onAbrirCaja}
        className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer min-h-[40px]"
      >
        <SolesIcon className="w-4 h-4" />
        <span>Abrir caja</span>
      </button>
    );
  }

  return null;
};
