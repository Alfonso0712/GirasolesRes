import React from 'react';
import { Utensils } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { CierreResumenDto } from '../../../types/caja';

export interface CerrarCajaDesgloseSectionProps {
  resumen: CierreResumenDto;
}

export const CerrarCajaDesgloseSection: React.FC<CerrarCajaDesgloseSectionProps> = ({ resumen }) => {
  return (
    <div className="space-y-3">
      {/* Bloque 1: Productos de Carta */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-surface">
        <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-3.5 h-3.5 text-accent" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-ink">
              1. Productos de Carta
            </h4>
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            {(resumen.platosVendidos ?? []).reduce((a, b) => a + b.cantidad, 0)} unidades
          </span>
        </div>
        <div className="max-h-36 overflow-y-auto divide-y divide-stone-100 text-xs">
          {(resumen.platosVendidos?.length ?? 0) === 0 ? (
            <div className="px-4 py-2 text-neutral-400 italic text-center">Sin productos de carta vendidos</div>
          ) : (
            resumen.platosVendidos.map((p, idx) => (
              <div key={p.productoId || `${p.nombre}-${idx}`} className="px-4 py-2 flex items-center justify-between">
                <span className="text-neutral-700 font-medium">
                  {p.cantidad}x {p.nombre}
                </span>
                <span className="font-semibold text-neutral-600 tabular-nums">
                  {formatCurrency(p.total)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bloque 2: Menús Completos */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-surface">
        <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-3.5 h-3.5 text-amber-600" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-ink">
              2. Menús Completos
            </h4>
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            {(resumen.menusCompletos ?? []).reduce((a, b) => a + b.cantidad, 0)} unidades
          </span>
        </div>
        <div className="max-h-36 overflow-y-auto divide-y divide-stone-100 text-xs">
          {(resumen.menusCompletos?.length ?? 0) === 0 ? (
            <div className="px-4 py-2 text-neutral-400 italic text-center">Sin menús completos vendidos</div>
          ) : (
            resumen.menusCompletos!.map((m, idx) => (
              <div key={`${m.menuCompletoId}-${idx}`} className="px-4 py-2 flex items-center justify-between">
                <span className="text-neutral-700 font-medium">
                  {m.cantidad}x {m.nombre}
                </span>
                <span className="font-semibold text-neutral-600 tabular-nums">
                  {formatCurrency(m.monto ?? m.total)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bloque 3: Componentes Elegidos en Menús */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-surface">
        <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-3.5 h-3.5 text-emerald-600" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-ink">
              3. Componentes de Menú
            </h4>
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            {(resumen.componentes ?? []).reduce((a, b) => a + b.cantidad, 0)} elecciones
          </span>
        </div>
        <div className="max-h-36 overflow-y-auto divide-y divide-stone-100 text-xs">
          {(resumen.componentes?.length ?? 0) === 0 ? (
            <div className="px-4 py-2 text-neutral-400 italic text-center">Sin componentes elegidos</div>
          ) : (
            resumen.componentes!.map((c, idx) => (
              <div key={`${c.productoId}-${idx}`} className="px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-700 font-medium">
                    {c.cantidad}x {c.producto}
                  </span>
                  <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-mono">
                    {c.rol}
                  </span>
                </div>
                <span className="text-neutral-400 text-[11px] italic">
                  Incluido
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
