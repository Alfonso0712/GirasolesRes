import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export interface CobrosFilterBarProps {
  busqueda: string;
  onBusquedaChange: (value: string) => void;
  filtroTipo: 'todos' | 'mesa' | 'llevar' | 'listos';
  onFiltroTipoChange: (tipo: 'todos' | 'mesa' | 'llevar' | 'listos') => void;
}

export const CobrosFilterBar: React.FC<CobrosFilterBarProps> = ({
  busqueda,
  onBusquedaChange,
  filtroTipo,
  onFiltroTipoChange,
}) => {
  return (
    <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
      {/* Input de Búsqueda */}
      <div className="relative w-full sm:w-64">
        <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar mesa o n.º de pedido..."
          className="w-full pl-8 pr-8 py-2 rounded-xl border border-neutral-200 text-xs text-ink placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors min-h-[38px]"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => onBusquedaChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-600 text-xs font-bold px-1 cursor-pointer"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Píldoras de Estado */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-semibold text-ink-muted flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" />
          Estado:
        </span>

        {(['todos', 'mesa', 'llevar', 'listos'] as const).map((tipo) => {
          const activo = filtroTipo === tipo;
          const labels: Record<string, string> = {
            todos: 'Todos',
            mesa: 'Salón',
            llevar: 'Para Llevar',
            listos: 'Listos',
          };
          return (
            <button
              key={tipo}
              type="button"
              onClick={() => onFiltroTipoChange(tipo)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[38px] ${
                activo
                  ? 'bg-ink-fill text-white font-semibold shadow-2xs'
                  : 'text-ink-muted hover:bg-neutral-100 hover:text-ink'
              }`}
            >
              {labels[tipo]}
            </button>
          );
        })}
      </div>
    </div>
  );
};
