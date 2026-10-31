import React from 'react';
import { Undo2 } from 'lucide-react';

export interface AvisoDeshacerInfo {
  comandaId: string;
  pedidoNumero: number;
  mensaje: string;
  segundosRestantes: number;
}

export interface CocinaAvisoDeshacerProps {
  aviso: AvisoDeshacerInfo | null;
  onDeshacer: () => void;
}

export const CocinaAvisoDeshacer: React.FC<CocinaAvisoDeshacerProps> = ({
  aviso,
  onDeshacer,
}) => {
  if (!aviso) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-fill-strong/95 text-white px-5 sm:px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 sm:gap-6 border border-neutral-700 animate-in slide-in-from-bottom-4 duration-200 max-w-lg w-[90%]"
    >
      <div className="flex-1">
        <p className="text-sm font-semibold">{aviso.mensaje}</p>
        <p className="text-xs text-neutral-500 mt-0.5">
          Puede corregir esta acción en los próximos{' '}
          <strong className="text-amber-400">{aviso.segundosRestantes} s</strong>
        </p>
      </div>

      <button
        type="button"
        onClick={onDeshacer}
        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0 min-h-[44px]"
      >
        <Undo2 className="w-4 h-4 stroke-[2.5]" />
        <span>DESHACER</span>
      </button>
    </div>
  );
};
