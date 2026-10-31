import React from 'react';
import { Sparkles, UtensilsCrossed, Coffee, Power } from 'lucide-react';

export type TabMenuPrincipal = 'opciones' | 'menus' | 'carta' | 'disponibilidad';

export interface MenuDiaTabsNavProps {
  esAdmin: boolean;
  tabActiva: TabMenuPrincipal;
  onTabChange: (tab: TabMenuPrincipal) => void;
  opcionesCount: number;
  menusCount: number;
  cartaCount: number;
  disponibilidadCount: number;
  menuDefinido: boolean;
}

export const MenuDiaTabsNav: React.FC<MenuDiaTabsNavProps> = ({
  esAdmin,
  tabActiva,
  onTabChange,
  opcionesCount,
  menusCount,
  cartaCount,
  disponibilidadCount,
  menuDefinido,
}) => {
  return (
    <div className="border-b border-neutral-200 flex flex-wrap gap-2 sm:gap-3 no-scrollbar">
      {esAdmin && (
        <>
          <button
            type="button"
            onClick={() => onTabChange('opciones')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              tabActiva === 'opciones'
                ? 'border-accent text-accent'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Opciones del día</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 text-accent font-bold">
              {opcionesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('menus')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              tabActiva === 'menus'
                ? 'border-accent text-accent'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Menús completos</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-neutral-700 font-bold">
              {menusCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('carta')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              tabActiva === 'carta'
                ? 'border-accent text-accent'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Productos de carta</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-neutral-700 font-bold">
              {cartaCount}
            </span>
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => onTabChange('disponibilidad')}
        className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
          tabActiva === 'disponibilidad'
            ? 'border-emerald-600 text-emerald-700'
            : 'border-transparent text-neutral-600 hover:text-neutral-900'
        }`}
      >
        <Power className="w-4 h-4" />
        <span>Disponibilidad / Agotados</span>
        {menuDefinido && (
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-bold">
            {disponibilidadCount}
          </span>
        )}
      </button>
    </div>
  );
};
