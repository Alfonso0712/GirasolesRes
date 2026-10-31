import React from 'react';
import { Search } from 'lucide-react';

export interface UsersFilterBarProps {
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  filtroRol: string;
  onFiltroRolChange: (val: string) => void;
  filtroEstado: string;
  onFiltroEstadoChange: (val: string) => void;
  tieneFiltros: boolean;
  onQuitarFiltros: () => void;
}

export const UsersFilterBar: React.FC<UsersFilterBarProps> = ({
  busqueda,
  onBusquedaChange,
  filtroRol,
  onFiltroRolChange,
  filtroEstado,
  onFiltroEstadoChange,
  tieneFiltros,
  onQuitarFiltros,
}) => {
  return (
    <div className="bg-surface rounded-2xl border border-neutral-200/90 p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center">
      {/* Búsqueda por Nombre o Usuario */}
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={busqueda}
          maxLength={50}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar por nombre o usuario..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 bg-neutral-50/50 hover:bg-surface focus:bg-surface focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[40px] transition-all"
        />
      </div>

      {/* Filtro Rol */}
      <div className="w-full sm:w-52">
        <select
          value={filtroRol}
          onChange={(e) => onFiltroRolChange(e.target.value)}
          aria-label="Filtrar por rol"
          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-700 bg-surface hover:border-neutral-300 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[40px] transition-colors cursor-pointer"
        >
          <option value="Todos">Todos los roles</option>
          <option value="Administrador">Administrador</option>
          <option value="Cajero">Cajero</option>
          <option value="Mozo">Mozo</option>
          <option value="Cocinero">Cocinero</option>
        </select>
      </div>

      {/* Filtro Estado */}
      <div className="w-full sm:w-52">
        <select
          value={filtroEstado}
          onChange={(e) => onFiltroEstadoChange(e.target.value)}
          aria-label="Filtrar por estado"
          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-700 bg-surface hover:border-neutral-300 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[40px] transition-colors cursor-pointer"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      {tieneFiltros && (
        <button
          type="button"
          onClick={onQuitarFiltros}
          className="text-xs font-semibold text-accent hover:text-accent p-2 rounded-xl hover:bg-amber-50 cursor-pointer whitespace-nowrap transition-colors"
        >
          Quitar filtros
        </button>
      )}
    </div>
  );
};
