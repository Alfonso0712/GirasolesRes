import React from 'react';
import { BookOpen, Layers } from 'lucide-react';
import type { TipoProducto } from '../../../types/producto';

export interface ProductTipoSelectorProps {
  tipo: TipoProducto;
  onTipoChange: (tipo: TipoProducto) => void;
  isEditing: boolean;
  guardando: boolean;
}

export const ProductTipoSelector: React.FC<ProductTipoSelectorProps> = ({
  tipo,
  onTipoChange,
  isEditing,
  guardando,
}) => {
  return (
    <div>
      <label className="form-label-standard">
        Tipo de producto <span className="text-accent">*</span>
      </label>
      <div className="grid grid-cols-2 gap-2.5 p-1 bg-neutral-100/80 rounded-xl border border-neutral-200/80">
        <button
          type="button"
          onClick={() => {
            if (!isEditing) onTipoChange('Carta');
          }}
          disabled={isEditing || guardando}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            tipo === 'Carta'
              ? 'bg-surface text-accent shadow-sm border border-neutral-200/60'
              : 'text-neutral-600 hover:text-neutral-900'
          } ${isEditing ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Producto de carta</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isEditing) onTipoChange('Componente');
          }}
          disabled={isEditing || guardando}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            tipo === 'Componente'
              ? 'bg-surface text-emerald-700 shadow-sm border border-neutral-200/60'
              : 'text-neutral-600 hover:text-neutral-900'
          } ${isEditing ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Componente de menú</span>
        </button>
      </div>
      {isEditing && (
        <p className="mt-1 text-xs text-neutral-500 italic">
          El tipo no se puede modificar en productos existentes para preservar el historial.
        </p>
      )}
    </div>
  );
};
