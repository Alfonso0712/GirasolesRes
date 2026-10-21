import React from 'react';
import { Flame } from 'lucide-react';
import type { ResumenProducto } from '../../types/comanda';

export interface CocinaResumenBarProps {
  resumen: ResumenProducto[];
}

export const CocinaResumenBar: React.FC<CocinaResumenBarProps> = ({ resumen }) => {
  return (
    <section className="bg-white border-b border-amber-900/15 py-2 px-3.5 sm:px-6 shadow-2xs shrink-0 flex items-center gap-3 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-amber-300">
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wide shrink-0">
        <Flame className="w-4 h-4 text-[#B84500]" />
        <span>Por preparar:</span>
      </div>

      {resumen.length === 0 ? (
        <span className="text-xs text-neutral-500 italic">
          Sin platos pendientes de preparación en cocina.
        </span>
      ) : (
        <div className="flex items-center gap-2">
          {resumen.map((r) => (
            <div
              key={r.producto}
              className="px-3 py-1 rounded-xl bg-amber-100/90 text-amber-900 text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 border border-amber-300/60 shadow-2xs"
            >
              <span className="text-[#B84500] text-sm">{r.cantidad} ×</span>
              <span className="max-w-[280px] break-words text-wrap">{r.producto}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CocinaResumenBar;
