import React from 'react';
import { Utensils } from 'lucide-react';
import type { MesaItem } from '../../types/mesa';

interface MesaAccionRolModalProps {
  isOpen: boolean;
  mesa: MesaItem | null;
  accion: string;
  onClose: () => void;
}

export const MesaAccionRolModal: React.FC<MesaAccionRolModalProps> = ({
  isOpen,
  mesa,
  accion,
  onClose
}) => {
  if (!isOpen || !mesa) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-surface rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-neutral-200/80 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-accent flex items-center justify-center mx-auto mb-3 border border-amber-200">
          <Utensils className="w-6 h-6" />
        </div>
        <h3 className="font-sans font-bold text-lg text-ink mb-1">
          {accion}
        </h3>
        <p className="text-xs text-ink-muted mb-4">
          Acción seleccionada para <strong>{mesa.nombre}</strong> ({mesa.ocupacion}).
          Este enlace conectará con la interfaz de {accion === 'COBRAR' ? 'Cobro en Caja' : 'Toma de Pedido'}.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors cursor-pointer"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
