import React from 'react';
import { Filter, Eye, EyeOff } from 'lucide-react';
import type { FiltroEstadoMesa } from '../../types/mesa';

interface MesaFilterBarProps {
  filtroEstado: FiltroEstadoMesa;
  onFiltroEstadoChange: (estado: FiltroEstadoMesa) => void;
  esAdmin: boolean;
  mostrarInactivas: boolean;
  onMostrarInactivasChange: (mostrar: boolean) => void;
}

export const MesaFilterBar: React.FC<MesaFilterBarProps> = ({
  filtroEstado,
  onFiltroEstadoChange,
  esAdmin,
  mostrarInactivas,
  onMostrarInactivasChange
}) => {
  const estados: FiltroEstadoMesa[] = ['todas', 'libre', 'ocupada'];
  const labels: Record<FiltroEstadoMesa, string> = {
    todas: 'Todas',
    libre: 'Libres',
    ocupada: 'Ocupadas'
  };

  return (
    <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-ink-muted flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" />
          Estado:
        </span>

        {estados.map((estado) => {
          const activo = filtroEstado === estado;
          return (
            <button
              key={estado}
              type="button"
              onClick={() => onFiltroEstadoChange(estado)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[38px] ${
                activo
                  ? 'bg-ink-fill text-white font-semibold shadow-2xs'
                  : 'text-ink-muted hover:bg-neutral-100 hover:text-ink'
              }`}
            >
              {labels[estado]}
            </button>
          );
        })}
      </div>

      {/* Interruptor "Mostrar inactivas" (Solo Administrador, RF-18) */}
      {esAdmin && (
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-ink font-medium">
          <input
            type="checkbox"
            checked={mostrarInactivas}
            onChange={(e) => onMostrarInactivasChange(e.target.checked)}
            className="sr-only"
          />
          <span
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              mostrarInactivas ? 'bg-primary' : 'bg-neutral-200'
            }`}
          >
            <span
              className={`bg-surface w-4 h-4 rounded-full shadow-md transform transition-transform ${
                mostrarInactivas ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </span>
          <span className="flex items-center gap-1 text-ink-muted">
            {mostrarInactivas ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-500" />}
            Mostrar inactivas
          </span>
        </label>
      )}
    </div>
  );
};
