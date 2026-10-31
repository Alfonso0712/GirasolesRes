import React from 'react';
import { Banknote, CreditCard } from 'lucide-react';
import { SolesIcon } from '../../ui/SolesIcon';
import { formatCurrency } from '../../../utils/formatters';
import type { CierreResumenDto } from '../../../types/caja';

export interface ResumenContableCardsProps {
  resumen: CierreResumenDto;
}

export const ResumenContableCards: React.FC<ResumenContableCardsProps> = ({ resumen }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-600">
          Resumen de Ventas Vigentes del Turno
        </h3>
        <span className="text-xs text-neutral-500">
          Total ventas registradas: <strong>{resumen.cantidadVentas}</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
            Monto Inicial
          </span>
          <span className="text-base font-bold text-ink tabular-nums mt-0.5 block">
            {formatCurrency(resumen.montoInicial)}
          </span>
          <span className="text-xs text-stone-500 block">Fondo turno</span>
        </div>

        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block flex items-center gap-1">
            <Banknote className="w-3 h-3 text-accent" /> Ventas Efectivo
          </span>
          <span className="text-base font-bold text-ink tabular-nums mt-0.5 block">
            {formatCurrency(resumen.ventasEfectivo)}
          </span>
          <span className="text-xs text-stone-500 block">Gaveta física</span>
        </div>

        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-purple-600" /> Ventas Yape / QR
          </span>
          <span className="text-base font-bold text-purple-900 tabular-nums mt-0.5 block">
            {formatCurrency(resumen.ventasYape)}
          </span>
          <span className="text-xs text-stone-500 block">Cuenta digital</span>
        </div>

        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block flex items-center gap-1">
            <SolesIcon className="w-3 h-3 text-success" /> Total Ventas
          </span>
          <span className="text-base font-bold text-emerald-900 tabular-nums mt-0.5 block">
            {formatCurrency(resumen.totalVentas)}
          </span>
          <span className="text-xs text-stone-500 block">Efectivo + Yape</span>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-xl col-span-2 sm:col-span-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
            Efectivo Esperado
          </span>
          <span className="text-lg font-bold text-accent tabular-nums mt-0.5 block">
            {formatCurrency(resumen.efectivoEsperado)}
          </span>
          <span className="text-xs text-neutral-500 block">
            (Inicial + Efectivo)
          </span>
        </div>
      </div>
    </div>
  );
};
