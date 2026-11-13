import React, { useRef, useEffect } from 'react';
import { FilterChip } from './FilterChip';

export interface FilterChipItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

export interface FilterChipBarProps<T extends string = string> {
  items: Array<FilterChipItem<T>>;
  selectedId: T;
  onSelect: (id: T) => void;
  className?: string;
  'aria-label'?: string;
}

export function FilterChipBar<T extends string = string>({
  items,
  selectedId,
  onSelect,
  className = '',
  'aria-label': ariaLabel = 'Filtros',
}: FilterChipBarProps<T>): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedId]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Indicador sutil de scroll degradado izquierdo */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-surface to-transparent z-10 opacity-70"
        aria-hidden="true"
      />

      {/* Contenedor con scroll horizontal táctil */}
      <div
        ref={containerRef}
        role="group"
        aria-label={ariaLabel}
        className="flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]"
      >
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <div key={item.id} ref={isSelected ? (activeRef as unknown as React.RefObject<HTMLDivElement>) : undefined}>
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
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-surface to-transparent z-10 opacity-70"
        aria-hidden="true"
      />
    </div>
  );
}
