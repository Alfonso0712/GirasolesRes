import React from 'react';
import { Lock, X } from 'lucide-react';

interface CerrarCajaHeaderProps {
  procesandoCierre: boolean;
  onClose: () => void;
}

export const CerrarCajaHeader: React.FC<CerrarCajaHeaderProps> = ({
  procesandoCierre,
  onClose,
}) => {
  return (
    <div className="shrink-0 p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#C0392B] border border-rose-200 flex items-center justify-center shadow-xs">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-accent">
            Gestión de Caja
          </p>
          <h2 id="cerrar-caja-title" className="font-sans text-xl font-bold text-ink tracking-tight">
            Cierre de Caja y Cuadre de Turno
          </h2>
        </div>
      </div>
      {!procesandoCierre && (
        <button
          type="button"
          onClick={onClose}
          className="modal-close-btn"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
