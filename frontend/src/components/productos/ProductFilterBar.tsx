import React from 'react';
import { Search } from 'lucide-react';
import { CATEGORIAS_PRODUCTO } from '../../types/producto';

export interface ProductFilterBarProps {
  busqueda: string;
  onBusquedaChange: (value: string) => void;
  filtroTipo: string;
  onFiltroTipoChange: (value: string) => void;
  filtroCategoria: string;
  onFiltroCategoriaChange: (value: string) => void;
  filtroEstado: string;
  onFiltroEstadoChange: (value: string) => void;
}

export const ProductFilterBar: React.FC<ProductFilterBarProps> = ({
  busqueda,
  onBusquedaChange,
  filtroTipo,
  onFiltroTipoChange,
  filtroCategoria,
  onFiltroCategoriaChange,
  filtroEstado,
  onFiltroEstadoChange,
}) => {
  return (
    <div className="shrink-0 bg-surface rounded-2xl border border-neutral-200/80 px-3.5 py-2 shadow-xs flex flex-col sm:flex-row gap-2.5 items-center">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={busqueda}
          maxLength={50}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar por nombre de producto o componente..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-amber-200 transition-colors"
        />
      </div>

      {/* Filter Tipo (Carta vs Componente) */}
      <div className="w-full sm:w-auto min-w-[170px]">
        <select
          value={filtroTipo}
          onChange={(e) => onFiltroTipoChange(e.target.value)}
          aria-label="Filtrar por tipo"
          className="w-full sm:w-auto min-w-[170px] pr-9 px-3 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-700 bg-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-amber-200 transition-colors cursor-pointer"
        >
          <option value="Todos">Todos los tipos</option>
          <option value="Carta">Productos de carta</option>
          <option value="Componente">Componentes de menú</option>
        </select>
      </div>

      {/* Filter Category */}
      <div className="w-full sm:w-auto min-w-[170px]">
        <select
          value={filtroCategoria}
          onChange={(e) => onFiltroCategoriaChange(e.target.value)}
          disabled={filtroTipo === 'Componente'}
          aria-label="Filtrar por categoría"
          className={`w-full sm:w-auto min-w-[170px] pr-9 px-3 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-700 bg-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-amber-200 transition-colors cursor-pointer ${
            filtroTipo === 'Componente' ? 'opacity-50 cursor-not-allowed bg-neutral-50' : ''
          }`}
        >
          <option value="Todas">Todas las categorías</option>
          {CATEGORIAS_PRODUCTO.map((cat) => (
            <option key={cat.valor} value={cat.valor}>
              {cat.etiqueta}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Status */}
      <div className="w-full sm:w-auto min-w-[170px]">
        <select
          value={filtroEstado}
          onChange={(e) => onFiltroEstadoChange(e.target.value)}
          aria-label="Filtrar por estado"
          className="w-full sm:w-auto min-w-[170px] pr-9 px-3 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-700 bg-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-amber-200 transition-colors cursor-pointer"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>
    </div>
  );
};
