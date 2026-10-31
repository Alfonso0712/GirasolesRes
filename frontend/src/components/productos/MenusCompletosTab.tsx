import React from 'react';
import { AlertCircle } from 'lucide-react';
import { MenuCatalogoCard } from './MenuCatalogoCard';
import type { MenuCompletoItem } from '../../types/menuCompleto';

export interface MenusCompletosTabProps {
  errorMenus: string | null;
  cargandoMenus: boolean;
  menusCompletos: MenuCompletoItem[];
  onReintentar: () => void;
  onAbrirModalPrecio: (menu: MenuCompletoItem) => void;
  onAbrirModalEstadoMenu: (menu: MenuCompletoItem) => void;
}

export const MenusCompletosTab: React.FC<MenusCompletosTabProps> = ({
  errorMenus,
  cargandoMenus,
  menusCompletos,
  onReintentar,
  onAbrirModalPrecio,
  onAbrirModalEstadoMenu,
}) => {
  return (
    <div className="space-y-4">
      {errorMenus ? (
        <div className="p-8 text-center bg-surface rounded-2xl border border-neutral-200">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <p className="text-sm text-neutral-700 font-medium">{errorMenus}</p>
          <button
            type="button"
            onClick={onReintentar}
            className="mt-3 px-4 py-2 bg-fill-strong text-white rounded-xl text-xs font-semibold"
          >
            Reintentar
          </button>
        </div>
      ) : cargandoMenus ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={`menus-skeleton-${i}`}
              className="h-64 bg-surface rounded-2xl border border-neutral-200 p-6 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-6">
          {menusCompletos.map((m) => (
            <MenuCatalogoCard
              key={m.id}
              menu={m}
              onModificarPrecio={onAbrirModalPrecio}
              onCambiarEstado={onAbrirModalEstadoMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
};
