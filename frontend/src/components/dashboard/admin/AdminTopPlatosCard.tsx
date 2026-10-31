import React from 'react';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';
import type { BloquePlatosHoy } from '../../../types/inicio';

export interface AdminTopPlatosCardProps {
  platosHoyRes: any;
  platosHoy: BloquePlatosHoy | null;
  renderBloqueError: (nombre: string) => React.ReactNode;
}

export const AdminTopPlatosCard: React.FC<AdminTopPlatosCardProps> = ({
  platosHoyRes,
  platosHoy,
  renderBloqueError
}) => {
  return (
    <div className="bg-surface border border-neutral-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
          <h3 className="font-sans font-bold text-neutral-800 text-sm flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-accent" />
            <span>Top Platos Vendidos de Hoy</span>
          </h3>
          <span className="text-xs font-semibold text-neutral-500">Ranking</span>
        </div>

        {platosHoyRes?.estado === 'error' ? (
          renderBloqueError('platosHoy')
        ) : !platosHoy?.principales || platosHoy.principales.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500">
            Aún no hay platos despachados el día de hoy.
          </div>
        ) : (
          <div className="space-y-3">
            {platosHoy.principales.slice(0, 5).map((plato, idx) => (
              <div key={plato.producto} className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                    idx === 0 ? 'bg-amber-100 text-amber-900' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-neutral-800 truncate" title={plato.producto}>
                    {plato.producto}
                  </span>
                </div>
                <span className="font-bold font-sans tabular-nums text-neutral-900 bg-neutral-100/80 px-2 py-0.5 rounded-md shrink-0">
                  {plato.cantidad}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
        <span>Visualice el acumulado en Reportes</span>
        <ArrowRight className="w-3.5 h-3.5 text-accent" />
      </div>
    </div>
  );
};
