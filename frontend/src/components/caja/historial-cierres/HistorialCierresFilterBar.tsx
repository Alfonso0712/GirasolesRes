import React from 'react';
import { User, Calendar, X, Filter, AlertCircle } from 'lucide-react';

export interface HistorialCierresFilterBarProps {
  busquedaCajero: string;
  onBusquedaCajeroChange: (value: string) => void;
  desde: string;
  onDesdeChange: (value: string) => void;
  hasta: string;
  onHastaChange: (value: string) => void;
  hoyLimaStr: string;
  tieneFiltrosActivos: boolean;
  onLimpiarFiltros: () => void;
  esRangoActivo: (diasAtras: number) => boolean;
  onAplicarFiltroRapido: (diasAtras: number) => void;
  errorFechas: string | null;
}

export const HistorialCierresFilterBar: React.FC<HistorialCierresFilterBarProps> = ({
  busquedaCajero,
  onBusquedaCajeroChange,
  desde,
  onDesdeChange,
  hasta,
  onHastaChange,
  hoyLimaStr,
  tieneFiltrosActivos,
  onLimpiarFiltros,
  esRangoActivo,
  onAplicarFiltroRapido,
  errorFechas,
}) => {
  return (
    <div className="bg-surface border border-neutral-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Búsqueda por Cajero */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar cajero(a)..."
              value={busquedaCajero}
              onChange={(e) => onBusquedaCajeroChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-neutral-50/50 hover:bg-surface focus:bg-surface border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[40px] transition-all"
            />
          </div>

          {/* Fecha Desde */}
          <div className="flex items-center gap-2">
            <label htmlFor="filtro-desde" className="text-xs font-semibold text-neutral-600 flex items-center gap-1 select-none">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              Desde:
            </label>
            <input
              id="filtro-desde"
              type="date"
              max={hoyLimaStr}
              value={desde}
              onChange={(e) => onDesdeChange(e.target.value)}
              className="px-3 py-1.5 text-xs bg-surface border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[40px]"
            />
          </div>

          {/* Fecha Hasta */}
          <div className="flex items-center gap-2">
            <label htmlFor="filtro-hasta" className="text-xs font-semibold text-neutral-600 flex items-center gap-1 select-none">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              Hasta:
            </label>
            <input
              id="filtro-hasta"
              type="date"
              max={hoyLimaStr}
              value={hasta}
              onChange={(e) => onHastaChange(e.target.value)}
              className="px-3 py-1.5 text-xs bg-surface border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[40px]"
            />
          </div>

          {tieneFiltrosActivos && (
            <button
              type="button"
              onClick={onLimpiarFiltros}
              className="text-xs font-semibold text-accent hover:text-accent p-2 rounded-xl hover:bg-amber-50 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Chips de Selección Rápida */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1 mr-1 select-none">
            <Filter className="w-3.5 h-3.5" />
            Rango rápido:
          </span>
          <button
            type="button"
            onClick={() => onAplicarFiltroRapido(0)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[38px] ${
              esRangoActivo(0)
                ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
            }`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => onAplicarFiltroRapido(1)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[38px] ${
              esRangoActivo(1)
                ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
            }`}
          >
            Ayer
          </button>
          <button
            type="button"
            onClick={() => onAplicarFiltroRapido(7)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[38px] ${
              esRangoActivo(7)
                ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
            }`}
          >
            7 días
          </button>
          <button
            type="button"
            onClick={() => onAplicarFiltroRapido(30)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[38px] ${
              esRangoActivo(30)
                ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
            }`}
          >
            30 días
          </button>
        </div>
      </div>

      {/* Alerta de Error en Rango de Fechas */}
      {errorFechas && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
          <span>{errorFechas}</span>
        </div>
      )}
    </div>
  );
};
