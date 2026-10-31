import React from 'react';
import { Filter, Search, Calendar, AlertCircle } from 'lucide-react';

export interface VentasFilterBarProps {
  filtroTipoComprobante: 'todos' | 'ticket' | 'boleta' | 'factura';
  setFiltroTipoComprobante: (tipo: 'todos' | 'ticket' | 'boleta' | 'factura') => void;
  busqueda: string;
  setBusqueda: (val: string) => void;
  desde: string;
  setDesde: (val: string) => void;
  hasta: string;
  setHasta: (val: string) => void;
  esAdmin: boolean;
  setFiltroRapido: (periodo: 'hoy' | 'ayer' | 'semana' | 'mes') => void;
  esFiltroRapidoActivo: (periodo: 'hoy' | 'ayer' | 'semana' | 'mes') => boolean;
  tieneFiltrosActivos: boolean;
  limpiarFiltros: () => void;
  errorFechas: string | null;
}

export const VentasFilterBar: React.FC<VentasFilterBarProps> = ({
  filtroTipoComprobante,
  setFiltroTipoComprobante,
  busqueda,
  setBusqueda,
  desde,
  setDesde,
  hasta,
  setHasta,
  esAdmin,
  setFiltroRapido,
  esFiltroRapidoActivo,
  tieneFiltrosActivos,
  limpiarFiltros,
  errorFechas,
}) => {
  return (
    <div className="bg-surface p-4 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
      {/* Filtro por Tipo de Comprobante */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2.5 border-b border-neutral-100">
        <span className="text-xs font-semibold text-neutral-600 flex items-center gap-1 mr-1 select-none">
          <Filter className="w-3.5 h-3.5" />
          Comprobante:
        </span>
        {(['todos', 'ticket', 'boleta', 'factura'] as const).map((tipo) => {
          const activo = filtroTipoComprobante === tipo;
          const labels: Record<string, string> = {
            todos: 'Todos',
            ticket: 'Tickets',
            boleta: 'Boletas',
            factura: 'Facturas',
          };
          return (
            <button
              key={tipo}
              type="button"
              onClick={() => setFiltroTipoComprobante(tipo)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[36px] ${
                activo
                  ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
              }`}
            >
              {labels[tipo]}
            </button>
          );
        })}
      </div>

      {/* Búsqueda y Fechas */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por comprobante, cliente o RUC..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-neutral-50/50 hover:bg-surface focus:bg-surface border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[40px] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="filtro-desde-v" className="text-xs font-semibold text-neutral-600 flex items-center gap-1 select-none">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              Desde:
            </label>
            <input
              id="filtro-desde-v"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="px-3 py-1.5 text-xs bg-surface border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[40px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="filtro-hasta-v" className="text-xs font-semibold text-neutral-600 flex items-center gap-1 select-none">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              Hasta:
            </label>
            <input
              id="filtro-hasta-v"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="px-3 py-1.5 text-xs bg-surface border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[40px]"
            />
          </div>

          {/* Chips rápidos */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFiltroRapido('hoy')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[38px] ${
                esFiltroRapidoActivo('hoy')
                  ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                  : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setFiltroRapido('ayer')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[38px] ${
                esFiltroRapidoActivo('ayer')
                  ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                  : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
              }`}
            >
              Ayer
            </button>
            <button
              type="button"
              onClick={() => setFiltroRapido('semana')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[38px] ${
                esFiltroRapidoActivo('semana')
                  ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                  : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
              }`}
            >
              7 días
            </button>
            {esAdmin && (
              <button
                type="button"
                onClick={() => setFiltroRapido('mes')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[38px] ${
                  esFiltroRapidoActivo('mes')
                    ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                }`}
              >
                30 días
              </button>
            )}
          </div>

          {tieneFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="px-2.5 py-1.5 text-xs font-semibold text-accent hover:text-accent hover:bg-amber-50 rounded-xl transition-colors cursor-pointer ml-auto sm:ml-0"
            >
              Quitar filtros
            </button>
          )}
        </div>
      </div>

      {errorFechas && (
        <p className="text-xs text-danger font-medium flex items-center gap-1.5 pt-1 border-t border-neutral-100">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorFechas}</span>
        </p>
      )}
    </div>
  );
};
