import React from 'react';
import { RotateCcw, Check } from 'lucide-react';

export interface ContadorFooterBarProps {
  totalCalculado: number;
  hayErrores: boolean;
  onLimpiar: () => void;
  onClose: () => void;
  onConfirmar: () => void;
}

export const ContadorFooterBar: React.FC<ContadorFooterBarProps> = ({
  totalCalculado,
  hayErrores,
  onLimpiar,
  onClose,
  onConfirmar,
}) => {
  return (
    <div className="bg-neutral-50/80 border-t border-neutral-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
        <button
          type="button"
          onClick={onLimpiar}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-surface border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer min-h-[44px]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Limpiar
        </button>
        <div className="text-right sm:text-left">
          <span className="text-xs uppercase font-bold tracking-wider text-neutral-500 block">
            Total Contado
          </span>
          <span className="font-sans text-2xl font-bold text-ink tabular-nums whitespace-nowrap">
            S/ {totalCalculado.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 sm:flex-initial px-4 py-2.5 text-sm font-semibold text-neutral-700 bg-surface border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer min-h-[44px]"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={hayErrores}
          onClick={onConfirmar}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover disabled:bg-neutral-300 disabled:cursor-not-allowed rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
        >
          <Check className="w-4 h-4" />
          USAR ESTE TOTAL
        </button>
      </div>
    </div>
  );
};
