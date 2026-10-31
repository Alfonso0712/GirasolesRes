import React from 'react';
import { ReceiptText, CheckCircle2, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export interface CobrosKpiCardsProps {
  totalPedidos: number;
  totalListos: number;
  totalPorCobrar: number;
}

export const CobrosKpiCards: React.FC<CobrosKpiCardsProps> = ({
  totalPedidos,
  totalListos,
  totalPorCobrar,
}) => {
  return (
    <div className="shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="p-3.5 bg-surface rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
            Por Cobrar
          </span>
          <span className="text-xl font-bold font-sans tabular-nums text-ink">
            {totalPedidos} {totalPedidos === 1 ? 'pedido' : 'pedidos'}
          </span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-orange-50 text-accent flex items-center justify-center">
          <ReceiptText className="w-4 h-4" />
        </div>
      </div>

      <div className="p-3.5 bg-surface rounded-xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
            Listos en Cocina
          </span>
          <span className="text-xl font-bold font-sans tabular-nums text-ink">
            {totalListos} listos
          </span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>

      <div className="p-3.5 bg-surface rounded-xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
            Monto Pendiente
          </span>
          <span className="text-xl font-bold font-sans tabular-nums text-accent">
            {formatCurrency(totalPorCobrar)}
          </span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-amber-50 text-accent flex items-center justify-center">
          <CreditCard className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
