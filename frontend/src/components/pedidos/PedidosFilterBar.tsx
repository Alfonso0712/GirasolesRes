import React from 'react';
import { Filter, Calendar, X } from 'lucide-react';
import type { MesaItem } from '../../types/mesa';

export interface PedidosFilterBarProps {
  filtroEstado: string;
  setFiltroEstado: (estado: string) => void;
  filtroTipo: string;
  setFiltroTipo: (tipo: string) => void;
  filtroMesaId: string;
  setFiltroMesaId: (mesaId: string) => void;
  filtroSoloMios: boolean;
  setFiltroSoloMios: (val: boolean) => void;
  filtroFecha: string;
  setFiltroFecha: (fecha: string) => void;
  mesas: MesaItem[];
  rolUsuario: string;
  hayFiltrosActivos: boolean;
  onLimpiarFiltros: () => void;
}

export const PedidosFilterBar: React.FC<PedidosFilterBarProps> = ({
  filtroEstado,
  setFiltroEstado,
  filtroTipo,
  setFiltroTipo,
  filtroMesaId,
  setFiltroMesaId,
  filtroSoloMios,
  setFiltroSoloMios,
  filtroFecha,
  setFiltroFecha,
  mesas,
  rolUsuario,
  hayFiltrosActivos,
  onLimpiarFiltros,
}) => {
  return (
    <div className="px-3.5 py-3 sm:p-4 bg-surface rounded-2xl border border-neutral-200/80 shadow-2xs mb-3 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
        <Filter className="w-3.5 h-3.5" />
        <span>Filtros:</span>
      </div>

      {/* Filtro Estado */}
      <select
        value={filtroEstado}
        onChange={(e) => setFiltroEstado(e.target.value)}
        className="text-xs p-2 rounded-xl border border-neutral-200 bg-surface focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none cursor-pointer min-h-[38px]"
      >
        <option value="">Todos los estados</option>
        <option value="Pendiente">Pendiente</option>
        <option value="EnPreparacion">En preparación</option>
        <option value="Listo">Listo</option>
        <option value="Pagado">Pagado</option>
        <option value="Anulado">Anulado</option>
      </select>

      {/* Filtro Tipo */}
      <select
        value={filtroTipo}
        onChange={(e) => setFiltroTipo(e.target.value)}
        className="text-xs p-2 rounded-xl border border-neutral-200 bg-surface focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none cursor-pointer min-h-[38px]"
      >
        <option value="">Todos los tipos</option>
        <option value="Mesa">Mesa</option>
        <option value="ParaLlevar">Para llevar</option>
      </select>

      {/* Filtro Mesa */}
      <select
        value={filtroMesaId}
        onChange={(e) => setFiltroMesaId(e.target.value)}
        className="text-xs p-2 rounded-xl border border-neutral-200 bg-surface focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none cursor-pointer min-h-[38px]"
      >
        <option value="">Todas las mesas</option>
        {mesas.map((m) => (
          <option key={m.id} value={m.id}>{m.nombre}</option>
        ))}
      </select>

      {/* Filtro Solo mis pedidos (Mozo y Cajero) */}
      <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer select-none px-2 py-1.5 rounded-lg hover:bg-neutral-50">
        <input
          type="checkbox"
          checked={filtroSoloMios}
          onChange={(e) => setFiltroSoloMios(e.target.checked)}
          className="w-4 h-4 rounded text-accent focus:ring-accent border-neutral-300 cursor-pointer"
        />
        <span>Solo mis pedidos</span>
      </label>

      {/* Filtro Fecha: Solo Administrador (RN-63) */}
      {rolUsuario === 'Administrador' && (
        <div className="flex items-center gap-1.5 ml-auto">
          <Calendar className="w-4 h-4 text-neutral-500" />
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="text-xs p-2 rounded-xl border border-neutral-200 bg-surface focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none cursor-pointer min-h-[38px]"
          />
        </div>
      )}

      {/* Botón Quitar Filtros */}
      {hayFiltrosActivos && (
        <button
          type="button"
          onClick={onLimpiarFiltros}
          className="text-xs font-bold text-accent hover:text-accent p-1.5 rounded-lg hover:bg-amber-50 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Quitar filtros</span>
        </button>
      )}
    </div>
  );
};
