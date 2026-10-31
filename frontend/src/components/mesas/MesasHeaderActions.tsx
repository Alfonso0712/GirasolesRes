import React from 'react';
import { RotateCcw, ShoppingBag, Plus } from 'lucide-react';

export interface MesasHeaderActionsProps {
  segundosTranscurridos: number;
  refrescando: boolean;
  onActualizar: () => void;
  esCajero: boolean;
  onNavigateToPedidoLlevar?: () => void;
  esAdmin: boolean;
  onAbrirCrear: () => void;
}

export const MesasHeaderActions: React.FC<MesasHeaderActionsProps> = ({
  segundosTranscurridos,
  refrescando,
  onActualizar,
  esCajero,
  onNavigateToPedidoLlevar,
  esAdmin,
  onAbrirCrear,
}) => {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
      <div className="flex items-center gap-3 text-xs text-neutral-500">
        <span className="hidden sm:inline tabular-nums">
          Actualizado hace <span className="font-semibold text-neutral-700">{segundosTranscurridos}</span> s
        </span>
        <button
          type="button"
          onClick={onActualizar}
          disabled={refrescando}
          title="Actualizar mesas ahora"
          aria-label="Actualizar mesas ahora"
          className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-surface hover:bg-neutral-50 text-neutral-700 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer min-h-[40px] disabled:opacity-60"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-accent ${refrescando ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {esCajero && onNavigateToPedidoLlevar && (
        <button
          type="button"
          onClick={onNavigateToPedidoLlevar}
          className="px-3.5 py-2 rounded-xl bg-surface border border-accent text-accent hover:bg-orange-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer min-h-[40px]"
        >
          <ShoppingBag className="w-4 h-4 text-accent" />
          <span>Pedido para llevar</span>
        </button>
      )}

      {esAdmin && (
        <button
          type="button"
          onClick={onAbrirCrear}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 shadow-2xs hover:shadow transition-all cursor-pointer min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva mesa</span>
        </button>
      )}
    </div>
  );
};
