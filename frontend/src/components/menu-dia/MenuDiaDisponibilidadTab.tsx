import React from 'react';
import { Search, X } from 'lucide-react';
import { AgotadoItemCard } from './AgotadoItemCard';
import type { MenuDiaResponse } from '../../types/menuDia';
import type { ItemDisponibilidad } from '../../hooks/useMenuDiaManagement';

export interface MenuDiaDisponibilidadTabProps {
  menu: MenuDiaResponse | null;
  busquedaDisp: string;
  setBusquedaDisp: (val: string) => void;
  filtroTipoDisp: 'Todos' | 'Componente' | 'Carta' | 'Agotados';
  setFiltroTipoDisp: (val: 'Todos' | 'Componente' | 'Carta' | 'Agotados') => void;
  itemsDispFiltrados: ItemDisponibilidad[];
  platoResaltadoId: string | null;
  handleAbrirDisponibilidadModal: (item: ItemDisponibilidad) => void;
  formatearBadgeClasificacion: (item: ItemDisponibilidad) => string;
}

export const MenuDiaDisponibilidadTab: React.FC<MenuDiaDisponibilidadTabProps> = ({
  menu,
  busquedaDisp,
  setBusquedaDisp,
  filtroTipoDisp,
  setFiltroTipoDisp,
  itemsDispFiltrados,
  platoResaltadoId,
  handleAbrirDisponibilidadModal,
  formatearBadgeClasificacion,
}) => {
  return (
    <div className="space-y-6">
      {/* MENÚS COMPLETOS: ESTADO DE DISPONIBILIDAD */}
      {menu?.menusCompletos && menu.menusCompletos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Estado de Menús Completos en Servicio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {menu.menusCompletos.map((mc) => (
              <div
                key={mc.id}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  mc.disponible
                    ? 'bg-surface border-neutral-200'
                    : 'bg-amber-50/80 border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-sans font-bold text-neutral-900 text-sm">
                    {mc.nombre}
                  </span>
                  {mc.disponible ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      Disponible
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                      No disponible hoy
                    </span>
                  )}
                </div>

                {!mc.disponible && mc.motivoNoDisponible && (
                  <p className="text-xs text-amber-900 mt-2 font-medium">
                    {mc.motivoNoDisponible}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar plato o componente…"
            value={busquedaDisp}
            onChange={(e) => setBusquedaDisp(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-surface border border-neutral-200 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          {busquedaDisp && (
            <button
              type="button"
              onClick={() => setBusquedaDisp('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['Todos', 'Componente', 'Carta', 'Agotados'] as const).map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => setFiltroTipoDisp(tipo)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filtroTipoDisp === tipo
                  ? 'bg-ink-fill text-white font-semibold shadow-2xs'
                  : 'bg-surface text-ink-muted hover:bg-neutral-100 hover:text-ink border border-neutral-200'
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA / TABLA DE ÍTEMS EN SERVICIO */}
      {itemsDispFiltrados.length === 0 ? (
        <div className="py-12 text-center text-neutral-500 text-sm">
          No se encontraron ítems en el menú con ese criterio.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {itemsDispFiltrados.map((item) => (
            <AgotadoItemCard
              key={item.productoId}
              item={item}
              esResaltado={platoResaltadoId === item.productoId}
              onToggleDisponibilidad={handleAbrirDisponibilidadModal}
              formatearBadgeClasificacion={formatearBadgeClasificacion}
            />
          ))}
        </div>
      )}
    </div>
  );
};
