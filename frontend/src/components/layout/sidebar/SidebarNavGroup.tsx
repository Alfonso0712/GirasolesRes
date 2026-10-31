import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { NavigationGroup } from '../../../config/navigationConfig';
import { isNavigationItemActive } from '../../../config/navigationConfig';

interface SidebarNavGroupProps {
  grupo: NavigationGroup;
  isOpen: boolean;
  tieneItemActivo: boolean;
  cajaEstado?: string;
  paginaActiva: string;
  pedidosListosCount?: number;
  onToggle: () => void;
  onNavigate: (pagina: string) => void;
}

const renderItemBadge = (itemId: string, pedidosListosCount?: number, cajaEstado?: string) => {
  if (itemId === 'pedidos' && pedidosListosCount !== undefined && pedidosListosCount > 0) {
    return (
      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-white animate-pulse">
        {pedidosListosCount}
      </span>
    );
  }
  if (itemId === 'caja' && cajaEstado) {
    return (
      <span
        className={`px-1.5 py-0.5 text-xs font-bold rounded-full shrink-0 ${
          cajaEstado === 'abierta'
            ? 'bg-emerald-500 text-white'
            : cajaEstado === 'anteriorSinCerrar'
            ? 'bg-rose-500 text-white animate-pulse'
            : 'bg-[#57534E] text-[#FDE68A]'
        }`}
      >
        {cajaEstado === 'abierta'
          ? 'Abierta'
          : cajaEstado === 'anteriorSinCerrar'
          ? 'Cierre pend.'
          : 'Cerrada'}
      </span>
    );
  }
  return null;
};

export const SidebarNavGroup: React.FC<SidebarNavGroupProps> = ({
  grupo,
  isOpen,
  tieneItemActivo,
  cajaEstado,
  paginaActiva,
  pedidosListosCount,
  onToggle,
  onNavigate,
}) => {
  return (
    <div className="pt-1.5 first:pt-0">
      {/* Cabecera del Grupo Desplegable */}
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="w-full text-xs xl:text-nav-sm font-bold uppercase tracking-wider text-[#D9C5B2]/80 hover:text-white px-3 py-2 flex items-center justify-between cursor-pointer rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500/50"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate">{grupo.title}</span>

          {/* Indicador de módulo activo cuando el grupo está colapsado (Nielsen 1) */}
          {!isOpen && tieneItemActivo && (
            <span
              className="w-2 h-2 rounded-full bg-primary shrink-0 shadow-2xs"
              title="Módulo activo dentro de esta sección"
            />
          )}

          {/* Indicador de estado de caja en la cabecera colapsada de Caja y Ventas */}
          {!isOpen && grupo.id === 'caja-ventas' && cajaEstado && (
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                cajaEstado === 'abierta'
                  ? 'bg-emerald-400'
                  : cajaEstado === 'anteriorSinCerrar'
                  ? 'bg-rose-400 animate-pulse'
                  : 'bg-[#A8A29E]'
              }`}
              title={`Caja: ${cajaEstado}`}
            />
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : 'text-[#D9C5B2]/60'
          }`}
        />
      </button>

      {/* Sub-elementos con indentación y línea guía vertical sutil */}
      {isOpen && (
        <div className="pl-3 border-l border-white/10 ml-3.5 space-y-1 mt-1 mb-2 animate-in fade-in duration-150">
          {grupo.items.map((item) => {
            const Icon = item.icon;
            const esActivo = isNavigationItemActive(item, paginaActiva);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full text-left pl-3 pr-2 py-2 rounded-xl text-xs xl:text-sm font-medium flex items-center justify-between transition-all cursor-pointer ${
                  esActivo
                    ? 'bg-primary text-white shadow-md font-semibold'
                    : 'text-[#FEF3C7]/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 xl:w-4.5 xl:h-4.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {renderItemBadge(item.id, pedidosListosCount, cajaEstado)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
