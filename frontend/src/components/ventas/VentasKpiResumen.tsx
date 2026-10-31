import React from 'react';
import { ReceiptText, Smartphone, Ban } from 'lucide-react';
import { SolesIcon } from '../ui/SolesIcon';
import { formatCurrency, formatDecimal } from '../../utils/formatters';

export interface VentasResumenData {
  vigentes: number;
  totalVigente: number;
  efectivo: number;
  yape: number;
  anuladas: number;
}

export interface VentasKpiResumenProps {
  resumen: VentasResumenData;
}

export const VentasKpiResumen: React.FC<VentasKpiResumenProps> = ({ resumen }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* KPI 1: Ventas Vigentes */}
      <div className="bg-surface rounded-2xl border border-neutral-200/90 p-4 shadow-2xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-accent flex items-center justify-center shrink-0 border border-amber-200">
          <ReceiptText className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
            Ventas vigentes
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-sans font-bold text-2xl text-ink tabular-nums">
              {resumen.vigentes}
            </span>
            <span className="text-xs text-neutral-500 font-medium">ventas</span>
          </div>
        </div>
      </div>

      {/* KPI 2: Total Vigente (Recaudado) */}
      <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200/80 p-4 shadow-2xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
          <SolesIcon className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
            Total vigente
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-semibold text-emerald-800">S/</span>
            <span className="font-sans font-bold text-2xl text-emerald-950 tabular-nums">
              {formatDecimal(resumen.totalVigente)}
            </span>
          </div>
        </div>
      </div>

      {/* KPI 3: Desglose Efectivo vs Yape */}
      <div className="bg-surface rounded-2xl border border-neutral-200/90 p-4 shadow-2xs flex items-center justify-between gap-2">
        <div className="flex-1 border-r border-neutral-100 pr-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block flex items-center gap-1">
            <SolesIcon className="w-3.5 h-3.5 text-emerald-700" />
            <span>Efectivo</span>
          </span>
          <span className="font-sans font-bold text-base sm:text-lg text-ink tabular-nums block mt-0.5">
            {formatCurrency(resumen.efectivo)}
          </span>
        </div>
        <div className="flex-1 pl-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-purple-600" />
            <span>Yape</span>
          </span>
          <span className="font-sans font-bold text-base sm:text-lg text-purple-900 tabular-nums block mt-0.5">
            {formatCurrency(resumen.yape)}
          </span>
        </div>
      </div>

      {/* KPI 4: Ventas Anuladas */}
      <div className="bg-neutral-50/80 rounded-2xl border border-neutral-200/90 p-4 shadow-2xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-neutral-200/70 text-neutral-600 flex items-center justify-center shrink-0 border border-neutral-300">
          <Ban className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
            Anuladas (no suman)
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-sans font-bold text-2xl text-neutral-700 tabular-nums">
              {resumen.anuladas}
            </span>
            <span className="text-xs text-neutral-500 font-medium">anuladas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
