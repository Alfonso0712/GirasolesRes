import React, { useRef, useState, useEffect, useCallback } from 'react';
import { formatCategoriaLabel } from '../../utils/formatCategory';

export interface CategoriaChipsProps {
  categorias: string[];
  categoriaActiva: string;
  onSelectCategoria: (categoria: string) => void;
}

export const CategoriaChips: React.FC<CategoriaChipsProps> = ({
  categorias,
  categoriaActiva,
  onSelectCategoria,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hayMasDerecha, setHayMasDerecha] = useState(false);

  const actualizarEstadoScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const puedeDesplazarDerecha = el.scrollWidth - el.scrollLeft - el.clientWidth > 2;
    setHayMasDerecha(puedeDesplazarDerecha);
  }, []);

  useEffect(() => {
    actualizarEstadoScroll();
    const el = scrollRef.current;
    if (!el) return;

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => actualizarEstadoScroll())
        : null;
    observer?.observe(el);
    window.addEventListener('resize', actualizarEstadoScroll, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', actualizarEstadoScroll);
    };
  }, [categorias, actualizarEstadoScroll]);

  return (
    <div className="relative shrink-0 mb-3">
      <div
        ref={scrollRef}
        onScroll={actualizarEstadoScroll}
        className="flex items-center gap-1.5 overflow-x-auto pb-2 scroll-thin"
      >
        {categorias.map((cat) => {
          const activa = categoriaActiva === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategoria(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                activa
                  ? 'bg-sidebar text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-ink-muted hover:text-ink'
              }`}
            >
              {formatCategoriaLabel(cat)}
            </button>
          );
        })}
      </div>

      {hayMasDerecha && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 bottom-2 right-0 w-10 bg-gradient-to-l from-surface via-surface/80 to-transparent"
        />
      )}
    </div>
  );
};

export default CategoriaChips;
