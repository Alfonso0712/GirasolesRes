import React from 'react';
import { AlertCircle, Info } from 'lucide-react';
import {
  type CategoriaProducto,
  CATEGORIAS_PRODUCTO,
} from '../../../types/producto';

export interface ProductCartaFieldsProps {
  categoria: CategoriaProducto;
  onCategoriaChange: (categoria: CategoriaProducto) => void;
  categoriaSelectRef: React.RefObject<HTMLSelectElement | null>;
  precioStr: string;
  onPrecioChange: (precio: string) => void;
  precioInputRef: React.RefObject<HTMLInputElement | null>;
  errores: Record<string, string>;
  guardando: boolean;
  precioCambioEnEdicion: boolean;
}

export const ProductCartaFields: React.FC<ProductCartaFieldsProps> = ({
  categoria,
  onCategoriaChange,
  categoriaSelectRef,
  precioStr,
  onPrecioChange,
  precioInputRef,
  errores,
  guardando,
  precioCambioEnEdicion,
}) => {
  return (
    <>
      {/* Campo 2: Categoría de Carta (RV-35) */}
      <div>
        <label
          htmlFor="prod-categoria"
          className="form-label-standard"
        >
          Categoría de carta <span className="text-accent">*</span>
        </label>
        <select
          id="prod-categoria"
          ref={categoriaSelectRef}
          value={categoria}
          onChange={(e) => onCategoriaChange(e.target.value as CategoriaProducto)}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-sans transition-all outline-hidden bg-surface ${
            errores.categoria
              ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
              : 'border-neutral-200 text-neutral-900 focus:border-accent focus:ring-2 focus:ring-amber-200'
          }`}
          disabled={guardando}
        >
          {CATEGORIAS_PRODUCTO.map((cat) => (
            <option key={cat.valor} value={cat.valor}>
              {cat.etiqueta}
            </option>
          ))}
        </select>
        {CATEGORIAS_PRODUCTO.find((c) => c.valor === categoria)?.descripcion && !errores.categoria && (
          <p className="mt-1 text-xs text-ink-muted">
            {CATEGORIAS_PRODUCTO.find((c) => c.valor === categoria)?.descripcion}
          </p>
        )}
        {errores.categoria && (
          <p className="mt-1 text-xs text-danger font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errores.categoria}
          </p>
        )}
      </div>

      {/* Campo 3: Precio de Venta (RV-36 / RNF-13) */}
      <div>
        <label
          htmlFor="prod-precio"
          className="form-label-standard"
        >
          Precio de venta (S/) <span className="text-accent">*</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 font-semibold text-sm">
            S/
          </span>
          <input
            id="prod-precio"
            ref={precioInputRef}
            type="text"
            inputMode="decimal"
            value={precioStr}
            onChange={(e) => onPrecioChange(e.target.value)}
            placeholder="0.00"
            className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm font-sans font-medium transition-all outline-hidden ${
              errores.precio
                ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                : 'border-neutral-200 bg-surface text-neutral-900 focus:border-accent focus:ring-2 focus:ring-amber-200'
            }`}
            disabled={guardando}
          />
        </div>

        {errores.precio && (
          <p className="mt-1 text-xs text-danger font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errores.precio}
          </p>
        )}

        {/* Mensaje informativo cuando se edita el precio */}
        {precioCambioEnEdicion && !errores.precio && (
          <div className="mt-2 p-2.5 bg-amber-50/80 border border-amber-200/90 rounded-xl flex items-start gap-2 text-xs text-amber-900 animate-in fade-in duration-200">
            <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span>
              El nuevo precio se aplicará solo a los pedidos nuevos. Los pedidos y ventas ya registrados no cambian.
            </span>
          </div>
        )}
      </div>
    </>
  );
};
