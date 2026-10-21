import React from 'react';
import type { ItemDisponibilidad } from '../../hooks/useMenuDiaManagement';

export interface AgotadoItemCardProps {
  item: ItemDisponibilidad;
  esResaltado?: boolean;
  onToggleDisponibilidad: (item: ItemDisponibilidad) => void;
  formatearBadgeClasificacion: (item: ItemDisponibilidad) => string;
}

export const AgotadoItemCard: React.FC<AgotadoItemCardProps> = ({
  item,
  esResaltado = false,
  onToggleDisponibilidad,
  formatearBadgeClasificacion,
}) => {
  return (
    <div
      className={`p-4 rounded-2xl border bg-white flex flex-col justify-between min-h-[140px] transition-all ${
        item.agotado
          ? 'border-neutral-300 bg-neutral-50/70 opacity-80'
          : 'border-neutral-200 hover:border-neutral-300 shadow-2xs'
      } ${esResaltado ? 'ring-2 ring-[#D35400]' : ''}`}
    >
      <div className="flex flex-col items-start gap-1.5 mb-2">
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            item.tipo === 'Componente'
              ? 'bg-purple-100 text-purple-800 border border-purple-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}
        >
          {formatearBadgeClasificacion(item)}
        </span>
        <h4 className="font-semibold text-sm sm:text-base text-neutral-900 leading-snug break-words w-full">
          {item.nombre}
        </h4>
      </div>

      <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold ${
            item.agotado ? 'text-rose-700' : 'text-emerald-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              item.agotado ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          />
          {item.agotado ? 'Agotado' : 'Disponible'}
        </span>

        <button
          type="button"
          onClick={() => onToggleDisponibilidad(item)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer min-h-[38px] ${
            item.agotado
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
              : 'bg-neutral-100 hover:bg-rose-50 text-neutral-800 hover:text-rose-700 border border-neutral-200'
          }`}
        >
          {item.agotado ? 'Habilitar' : 'Marcar agotado'}
        </button>
      </div>
    </div>
  );
};

export default AgotadoItemCard;
