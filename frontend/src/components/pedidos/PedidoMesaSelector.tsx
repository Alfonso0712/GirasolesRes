import React from 'react';
import { Select } from '../ui/Select';
import type { MesaItem } from '../../types/mesa';

interface PedidoMesaSelectorProps {
  modo: 'nuevo' | 'ampliacion';
  mesaSeleccionada: MesaItem | null;
  opcionesMesas: MesaItem[];
  onSelectMesa: (mesa: MesaItem | null) => void;
}

export const PedidoMesaSelector: React.FC<PedidoMesaSelectorProps> = ({
  modo,
  mesaSeleccionada,
  opcionesMesas,
  onSelectMesa,
}) => {
  if (modo === 'nuevo') {
    return (
      <Select
        value={mesaSeleccionada?.id || ''}
        onChange={(e) => {
          const m = opcionesMesas.find(
            (item) => String(item.id).toLowerCase() === e.target.value.toLowerCase()
          );
          onSelectMesa(m || null);
        }}
        options={opcionesMesas.map((m) => ({
          value: String(m.id),
          label: `${m.nombre} (Libre)`,
        }))}
        placeholder="-- Seleccione Mesa Libre --"
        aria-label="Seleccionar mesa libre"
        selectClassName="!min-h-[42px] !py-2 !text-xs sm:!text-sm !rounded-xl !border-neutral-200 !font-medium"
      />
    );
  }

  return (
    <div className="w-full min-h-[42px] flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 shadow-2xs">
      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
      <span className="truncate">Mesa: {mesaSeleccionada?.nombre || 'Mesa'}</span>
    </div>
  );
};
