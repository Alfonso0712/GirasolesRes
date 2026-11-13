import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FilterChip } from './FilterChip';

export interface FilterChipItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

export interface FilterChipBarProps<T extends string = string> {
  items?: Array<FilterChipItem<T>>;
  chips?: Array<FilterChipItem<T>>;
  selectedId?: T;
  activeId?: T;
  onSelect: (id: T) => void;
  className?: string;
  'aria-label'?: string;
}

export function FilterChipBar<T extends string = string>({
  items,
  chips,
  selectedId,
  activeId,
  onSelect,
  className = '',
  'aria-label': ariaLabel = 'Filtros',
}: FilterChipBarProps<T>): React.ReactElement {
  const chipList = items || chips || [];
  const currentSelected = (selectedId ?? activeId) as T;
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const [mostrarIzquierda, setMostrarIzquierda] = useState(false);
  const [mostrarDerecha, setMostrarDerecha] = useState(false);

  const actualizarDegradados = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setMostrarIzquierda(scrollLeft > 2);
    setMostrarDerecha(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  const handleScroll = useCallback(() => {
    requestAnimationFrame(actualizarDegradados);
  }, [actualizarDegradados]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    actualizarDegradados();

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(actualizarDegradados);
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [actualizarDegradados, chipList.length]);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      requestAnimationFrame(actualizarDegradados);
    }
  }, [currentSelected, actualizarDegradados]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Indicador sutil de scroll degradado izquierdo */}
      {mostrarIzquierda && (
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-surface to-transparent z-10 transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Contenedor con scroll horizontal táctil */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        role="group"
        aria-label={ariaLabel}
        className="flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]"
      >
        {chipList.map((item) => {
          const isSelected = item.id === currentSelected;
          return (
            <div key={item.id} ref={isSelected ? activeRef : undefined} className="shrink-0">
              <FilterChip
                label={item.label}
                count={item.count}
                active={isSelected}
                onClick={() => onSelect(item.id)}
              />
            </div>
          );
        })}
      </div>

      {/* Indicador sutil de scroll degradado derecho */}
      {mostrarDerecha && (
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-surface to-transparent z-10 transition-opacity duration-200"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
