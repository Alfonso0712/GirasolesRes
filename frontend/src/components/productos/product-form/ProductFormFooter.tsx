import React from 'react';
import { Loader2 } from 'lucide-react';
import type { TipoProducto } from '../../../types/producto';

export interface ProductFormFooterProps {
  onClose: () => void;
  guardando: boolean;
  isEditing: boolean;
  tipo: TipoProducto;
}

export const ProductFormFooter: React.FC<ProductFormFooterProps> = ({
  onClose,
  guardando,
  isEditing,
  tipo,
}) => {
  return (
    <div className="shrink-0 p-4 sm:p-5 border-t border-neutral-100 flex items-center justify-end gap-3 bg-neutral-50/50">
      <button
        type="button"
        onClick={onClose}
        disabled={guardando}
        className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 bg-surface hover:bg-neutral-50 font-medium text-sm transition-colors cursor-pointer min-h-[44px]"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={guardando}
        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
      >
        {guardando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Guardando…</span>
          </>
        ) : isEditing ? (
          'Guardar cambios'
        ) : tipo === 'Componente' ? (
          'Guardar componente'
        ) : (
          'Guardar producto'
        )}
      </button>
    </div>
  );
};
