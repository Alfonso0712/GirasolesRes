import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Tooltip } from '../ui';
import { formatCategoriaLabel } from '../../utils/formatCategory';

export interface ProductoCardProps {
  id: string;
  nombre: string;
  categoria?: string;
  mostrarCategoria?: boolean;
  precio: number;
  cantEnBorrador: number;
  esAgotado?: boolean;
  onAgregar: () => void;
  onDisminuir?: () => void;
}

export const ProductoCard: React.FC<ProductoCardProps> = ({
  nombre,
  categoria,
  mostrarCategoria = false,
  precio,
  cantEnBorrador,
  esAgotado = false,
  onAgregar,
  onDisminuir,
}) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [esTruncado, setEsTruncado] = useState(false);

  const verificarTruncado = useCallback(() => {
    const el = titleRef.current;
    if (!el) return;
    setEsTruncado(el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1);
  }, []);

  useEffect(() => {
    verificarTruncado();
    const el = titleRef.current;
    if (!el) return;
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => verificarTruncado())
        : null;
    observer?.observe(el);
    window.addEventListener('resize', verificarTruncado, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', verificarTruncado);
    };
  }, [nombre, verificarTruncado]);

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between relative ${
        esAgotado
          ? 'bg-neutral-100/70 border-neutral-300/80 text-neutral-500 select-none opacity-65'
          : cantEnBorrador > 0
          ? 'bg-amber-50/40 border-accent shadow-xs ring-1 ring-accent/20'
          : 'bg-surface border-neutral-200 hover:border-neutral-300 shadow-2xs hover:shadow-xs'
      }`}
    >
      {cantEnBorrador > 0 && !esAgotado && (
        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-xs z-10 tabular-nums">
          {cantEnBorrador}
        </span>
      )}

      <div>
        <div className="flex items-start justify-between gap-2">
          <Tooltip content={esTruncado ? nombre : null}>
            <h4
              ref={titleRef}
              tabIndex={esTruncado ? 0 : undefined}
              className="font-sans text-base font-semibold text-ink leading-snug line-clamp-2 break-words min-w-0 flex-1"
            >
              {nombre}
            </h4>
          </Tooltip>
          {esAgotado && (
            <span className="shrink-0 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
              Agotado
            </span>
          )}
        </div>

        {mostrarCategoria && categoria && (
          <span className="block text-xs text-ink-muted mt-0.5">
            {formatCategoriaLabel(categoria)}
          </span>
        )}
      </div>

      <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
        <span className="font-sans text-base font-bold text-accent tabular-nums whitespace-nowrap shrink-0">
          S/ {precio.toFixed(2)}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {cantEnBorrador > 0 && onDisminuir && (
            <button
              type="button"
              onClick={onDisminuir}
              className="w-9 h-9 rounded-lg border border-neutral-300 bg-surface hover:bg-neutral-50 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              aria-label={`Disminuir ${nombre}`}
              title="Disminuir cantidad"
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          <button
            type="button"
            onClick={onAgregar}
            disabled={esAgotado}
            aria-disabled={esAgotado}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              esAgotado
                ? 'bg-neutral-200 text-neutral-500 border border-neutral-300 cursor-not-allowed opacity-60'
                : 'bg-primary hover:bg-primary-hover text-white shadow-xs cursor-pointer active:scale-95'
            }`}
            aria-label={`Agregar ${nombre}`}
            title={esAgotado ? 'Plato agotado - No disponible' : 'Agregar plato al pedido'}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoCard;
