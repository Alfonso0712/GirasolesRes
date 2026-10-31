import React from 'react';
import { Calendar, RotateCcw, Search, AlertCircle } from 'lucide-react';
import type { TipoAtajoFecha } from '../../types/reporte';

export interface ReportesFilterBarProps {
  atajos: { id: TipoAtajoFecha; label: string }[];
  atajoActivo: TipoAtajoFecha | null;
  aplicarAtajo: (id: TipoAtajoFecha) => void;
  desde: string;
  setDesde: (v: string) => void;
  hasta: string;
  setHasta: (v: string) => void;
  tabActiva: 'ventas' | 'platos';
  productoFiltroId: string;
  setProductoFiltroId: (v: string) => void;
  productosDisponibles: { id: string; nombre: string; activo?: boolean }[];
  cargando: boolean;
  consultar: () => void;
  filtrosCambiados: boolean;
  errorRango: string | null;
}

export const ReportesFilterBar: React.FC<ReportesFilterBarProps> = ({
  atajos,
  atajoActivo,
  aplicarAtajo,
  desde,
  setDesde,
  hasta,
  setHasta,
  tabActiva,
  productoFiltroId,
  setProductoFiltroId,
  productosDisponibles,
  cargando,
  consultar,
  filtrosCambiados,
  errorRango,
}) => {
  return (
    <div className="shrink-0 bg-surface p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col gap-3">
      {/* Atajos Rápidos de Rango */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-ink-muted flex items-center gap-1 mr-1">
          <Calendar className="w-3.5 h-3.5 text-neutral-500" /> Atajos:
        </span>
        {atajos.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => aplicarAtajo(a.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              atajoActivo === a.id
                ? 'bg-ink-fill text-white font-semibold shadow-2xs'
                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200/60'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Formulario de Filtros de Fecha y Producto */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="fecha-desde" className="text-xs font-semibold text-neutral-600">
            Desde:
          </label>
          <input
            id="fecha-desde"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-surface text-xs font-medium text-neutral-800 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent min-h-[38px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="fecha-hasta" className="text-xs font-semibold text-neutral-600">
            Hasta:
          </label>
          <input
            id="fecha-hasta"
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-surface text-xs font-medium text-neutral-800 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent min-h-[38px]"
          />
        </div>

        {/* Filtro Opcional de Producto (Solo en pestaña Platos Vendidos) */}
        {tabActiva === 'platos' && (
          <div className="flex items-center gap-2">
            <label htmlFor="filtro-producto" className="text-xs font-semibold text-neutral-600">
              Plato / Producto:
            </label>
            <select
              id="filtro-producto"
              value={productoFiltroId}
              onChange={(e) => setProductoFiltroId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-surface text-xs font-medium text-neutral-800 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent min-h-[38px] max-w-[200px]"
            >
              <option value="">Todos los productos</option>
              {productosDisponibles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {!p.activo ? '(inactivo)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Botón Principal CONSULTAR */}
        <button
          type="button"
          onClick={() => consultar()}
          disabled={cargando || Boolean(errorRango)}
          className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-xs inline-flex items-center gap-2 min-h-[38px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {cargando ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Consultando…</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>CONSULTAR</span>
            </>
          )}
        </button>

        {/* Aviso de Filtros Cambiados (RV-141 / MSG-196) */}
        {filtrosCambiados && !cargando && !errorRango && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-warning shrink-0" />
            <span>Los filtros cambiaron. Pulse CONSULTAR para actualizar el reporte.</span>
          </div>
        )}
      </div>

      {errorRango && (
        <p className="text-xs text-danger font-semibold flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorRango}</span>
        </p>
      )}
    </div>
  );
};
