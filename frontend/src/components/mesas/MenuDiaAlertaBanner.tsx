import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface MenuDiaAlertaBannerProps {
  menuDefinido: boolean;
  esAdmin: boolean;
  onNavigateToMenuDia?: () => void;
}

export const MenuDiaAlertaBanner: React.FC<MenuDiaAlertaBannerProps> = ({
  menuDefinido,
  esAdmin,
  onNavigateToMenuDia,
}) => {
  if (menuDefinido) return null;

  return (
    <div className="shrink-0 p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-100 text-accent flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-bold text-amber-950">
            El menú de hoy aún no está definido
          </p>
          <p className="text-xs text-amber-800 mt-0.5">
            {esAdmin
              ? 'Defina el menú diario para que el personal pueda registrar comandas de salón y para llevar.'
              : 'Solicite a la administración que publique el menú de hoy para comenzar a tomar pedidos.'}
          </p>
        </div>
      </div>
      {esAdmin && onNavigateToMenuDia && (
        <button
          type="button"
          onClick={onNavigateToMenuDia}
          className="shrink-0 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          Definir Menú
        </button>
      )}
    </div>
  );
};
