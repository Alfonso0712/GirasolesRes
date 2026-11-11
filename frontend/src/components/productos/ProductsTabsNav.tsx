import React, { useRef } from 'react';
import { BookOpen, Layers } from 'lucide-react';

interface ProductsTabsNavProps {
  pestañaActiva: 'catalogo' | 'menus_completos';
  onTabChange: (tab: 'catalogo' | 'menus_completos') => void;
  totalProductos: number;
}

export const ProductsTabsNav: React.FC<ProductsTabsNavProps> = ({
  pestañaActiva,
  onTabChange,
  totalProductos,
}) => {
  const tabCatalogoRef = useRef<HTMLButtonElement>(null);
  const tabMenusRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (pestañaActiva === 'catalogo') {
        onTabChange('menus_completos');
        tabMenusRef.current?.focus();
      } else {
        onTabChange('catalogo');
        tabCatalogoRef.current?.focus();
      }
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Pestañas de productos"
      onKeyDown={handleKeyDown}
      className="shrink-0 border-b border-neutral-200 flex items-center gap-2 sm:gap-4"
    >
      <button
        ref={tabCatalogoRef}
        id="tab-catalogo"
        role="tab"
        aria-selected={pestañaActiva === 'catalogo'}
        aria-controls="panel-catalogo"
        tabIndex={pestañaActiva === 'catalogo' ? 0 : -1}
        type="button"
        onClick={() => onTabChange('catalogo')}
        className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
          pestañaActiva === 'catalogo'
            ? 'border-accent text-accent'
            : 'border-transparent text-neutral-500 hover:text-neutral-900'
        }`}
      >
        <BookOpen className="w-4 h-4" />
        <span>Productos y Componentes</span>
        <span className="px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-neutral-600 tabular-nums">
          {totalProductos}
        </span>
      </button>

      <button
        ref={tabMenusRef}
        id="tab-menus_completos"
        role="tab"
        aria-selected={pestañaActiva === 'menus_completos'}
        aria-controls="panel-menus_completos"
        tabIndex={pestañaActiva === 'menus_completos' ? 0 : -1}
        type="button"
        onClick={() => onTabChange('menus_completos')}
        className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
          pestañaActiva === 'menus_completos'
            ? 'border-accent text-accent'
            : 'border-transparent text-neutral-500 hover:text-neutral-900'
        }`}
      >
        <Layers className="w-4 h-4" />
        <span>Menús completos</span>
        <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-900 font-semibold">
          3 configurados
        </span>
      </button>
    </div>
  );
};
