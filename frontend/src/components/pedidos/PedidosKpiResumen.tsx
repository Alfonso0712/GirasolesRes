import React from 'react';
import { Clock, ChefHat, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ResumenEstadosDto } from '../../types/pedido';

export interface PedidosKpiResumenProps {
  resumen: ResumenEstadosDto;
  filtroEstado: string;
  onSelectEstado: (estado: string) => void;
}

export const PedidosKpiResumen: React.FC<PedidosKpiResumenProps> = ({
  resumen,
  filtroEstado,
  onSelectEstado,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 mb-3">
      <button
        type="button"
        onClick={() => onSelectEstado(filtroEstado === 'Pendiente' ? '' : 'Pendiente')}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          filtroEstado === 'Pendiente'
            ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-300'
            : 'bg-surface border-neutral-200/80 hover:border-amber-300 hover:shadow-xs'
        }`}
      >
        <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Pendientes</span>
        </div>
        <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mt-1">
          {resumen.pendiente}
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelectEstado(filtroEstado === 'EnPreparacion' ? '' : 'EnPreparacion')}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          filtroEstado === 'EnPreparacion'
            ? 'bg-blue-100/80 border-blue-400 ring-2 ring-blue-300'
            : 'bg-surface border-neutral-200/80 hover:border-blue-300 hover:shadow-xs'
        }`}
      >
        <div className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
          <ChefHat className="w-3.5 h-3.5" />
          <span>En preparación</span>
        </div>
        <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mt-1">
          {resumen.enPreparacion}
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelectEstado(filtroEstado === 'Listo' ? '' : 'Listo')}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          filtroEstado === 'Listo'
            ? 'bg-emerald-100/80 border-emerald-400 ring-2 ring-emerald-300'
            : 'bg-surface border-neutral-200/80 hover:border-emerald-300 hover:shadow-xs'
        }`}
      >
        <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Listos</span>
        </div>
        <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mt-1">
          {resumen.listo}
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelectEstado(filtroEstado === 'Pagado' ? '' : 'Pagado')}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          filtroEstado === 'Pagado'
            ? 'bg-neutral-200 border-neutral-400 ring-2 ring-neutral-300'
            : 'bg-surface border-neutral-200/80 hover:border-neutral-300 hover:shadow-xs'
        }`}
      >
        <div className="text-xs font-bold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
          <span>Pagados</span>
        </div>
        <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mt-1">
          {resumen.pagado}
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelectEstado(filtroEstado === 'Anulado' ? '' : 'Anulado')}
        className={`col-span-2 sm:col-span-1 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          filtroEstado === 'Anulado'
            ? 'bg-rose-100/80 border-rose-400 ring-2 ring-rose-300'
            : 'bg-surface border-neutral-200/80 hover:border-rose-300 hover:shadow-xs'
        }`}
      >
        <div className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Anulados</span>
        </div>
        <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mt-1">
          {resumen.anulado}
        </div>
      </button>
    </div>
  );
};
