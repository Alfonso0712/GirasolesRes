import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { TipoProducto } from '../../../types/producto';
import { normalizeText } from '../../../utils/normalizeText';

export interface ProductNombreFieldProps {
  nombre: string;
  onNombreChange: (nombre: string) => void;
  nombreInputRef: React.RefObject<HTMLInputElement | null>;
  tipo: TipoProducto;
  error?: string;
  guardando: boolean;
}

export const ProductNombreField: React.FC<ProductNombreFieldProps> = ({
  nombre,
  onNombreChange,
  nombreInputRef,
  tipo,
  error,
  guardando,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor="prod-nombre"
          className="form-label-standard !mb-0"
        >
          Nombre {tipo === 'Componente' ? 'del componente' : 'del producto'}{' '}
          <span className="text-accent">*</span>
        </label>
        <span className="text-xs text-ink-muted tabular-nums">
          {nombre.length}/50
        </span>
      </div>
      <input
        id="prod-nombre"
        ref={nombreInputRef}
        type="text"
        value={nombre}
        onChange={(e) => onNombreChange(e.target.value)}
        onBlur={() => onNombreChange(normalizeText(nombre))}
        maxLength={50}
        placeholder={
          tipo === 'Componente'
            ? 'Ej. Sopa a la minuta, Papa a la huancaína (Entrada)'
            : 'Ej. Lomo saltado, Jarra de chicha morada 1L'
        }
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-sans transition-all outline-hidden ${
          error
            ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
            : 'border-neutral-200 bg-surface text-neutral-900 focus:border-accent focus:ring-2 focus:ring-amber-200'
        }`}
        disabled={guardando}
      />
      {error ? (
        <p className="mt-1 text-xs text-danger font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        <p className="mt-1 text-xs text-ink-muted">
          De 3 a 50 caracteres.
        </p>
      )}
    </div>
  );
};
