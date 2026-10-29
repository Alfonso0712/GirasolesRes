import React from 'react';
import { Utensils, ShoppingBag, CheckCircle2, ChefHat } from 'lucide-react';
import { SolesIcon } from '../ui/SolesIcon';
import type { PedidoPendienteCobro } from '../../types/cobro';

export interface CobroPedidoCardProps {
  pedido: PedidoPendienteCobro;
  onCobrar: (pedido: PedidoPendienteCobro) => void;
}

export const CobroPedidoCard: React.FC<CobroPedidoCardProps> = ({
  pedido: p,
  onCobrar,
}) => {
  const esMesa = p.tipo.toLowerCase() === 'mesa';

  return (
    <div
      key={p.pedidoId}
      className={`p-4 rounded-xl border border-neutral-200/90 shadow-2xs flex flex-col gap-3 ${
        p.estaListo ? 'bg-emerald-50/20 border-emerald-200' : 'bg-surface'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {esMesa ? (
            <Utensils className="w-4 h-4 text-accent" />
          ) : (
            <ShoppingBag className="w-4 h-4 text-accent" />
          )}
          <span className="font-bold text-neutral-900">
            {esMesa ? p.mesa || 'Mesa' : 'Para Llevar'}
          </span>
          <span className="text-xs font-sans tabular-nums font-bold text-neutral-500">
            #{p.numero}
          </span>
        </div>

        {p.estaListo ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
            <CheckCircle2 className="w-3 h-3" />
            Listo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <ChefHat className="w-3 h-3" />
            En preparación
          </span>
        )}
      </div>

      {p.referencia && (
        <p className="text-xs text-neutral-500 italic">
          Referencia: {p.referencia}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
        <div>
          <span className="text-xs text-neutral-500 font-bold uppercase block">
            Total
          </span>
          <span className="text-lg font-bold font-sans tabular-nums text-accent">
            S/ {p.total.toFixed(2)}
          </span>
        </div>

        {p.estaListo ? (
          <button
            type="button"
            onClick={() => onCobrar(p)}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer min-h-[44px]"
          >
            <SolesIcon className="w-4 h-4" />
            <span>Cobrar pedido</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            title="Esperando que cocina termine la preparación"
            className="px-3.5 py-2 rounded-xl bg-neutral-100 text-neutral-500 border border-neutral-200 text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed min-h-[44px]"
          >
            <ChefHat className="w-4 h-4 text-neutral-500" />
            <span>Esperando a cocina</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CobroPedidoCard;
