import React from 'react';
import { Utensils, X } from 'lucide-react';

export interface ProductFormHeaderProps {
  isEditing: boolean;
  onClose: () => void;
  guardando: boolean;
}

export const ProductFormHeader: React.FC<ProductFormHeaderProps> = ({
  isEditing,
  onClose,
  guardando,
}) => {
  return (
    <div className="shrink-0 p-5 border-b border-neutral-100 flex justify-between items-center bg-gradient-to-r from-amber-50/50 to-transparent">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-canvas border border-amber-900/10 flex items-center justify-center text-accent">
          <Utensils className="w-5 h-5" />
        </div>
        <div>
          <h2
            id="modal-title"
            className="text-lg sm:text-xl font-sans font-bold text-ink leading-tight"
          >
            {isEditing ? 'Editar Producto' : 'Nuevo Producto o Componente'}
          </h2>
          <p className="text-xs text-ink-muted">
            {isEditing
              ? 'Modifique el nombre, categoría, rol o precio del ítem.'
              : 'Defina un producto independiente de carta o un componente de menú.'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        disabled={guardando}
        aria-label="Cerrar ventana"
        className="modal-close-btn"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
