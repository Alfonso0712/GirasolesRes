import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../../ui';
import type { PedidoResponseDto } from '../../../types/pedido';

export interface ResumenPedidoFooterProps {
  modo: 'nuevo' | 'ampliacion';
  pedidoExistente?: PedidoResponseDto | null;
  notas: string;
  onNotasChange?: (notas: string) => void;
  cantidadTotalProductos: number;
  totalCalculado: number;
  totalFinal: number;
  botonDeshabilitado: boolean;
  registrando: boolean;
  labelConfirmarDesktop: string;
  onRegistrarPedido: () => void;
}

export const ResumenPedidoFooter: React.FC<ResumenPedidoFooterProps> = ({
  modo,
  pedidoExistente,
  notas,
  onNotasChange,
  cantidadTotalProductos,
  totalCalculado,
  totalFinal,
  botonDeshabilitado,
  registrando,
  labelConfirmarDesktop,
  onRegistrarPedido,
}) => {
  return (
    <div className="p-4 border-t border-neutral-200 dark:border-neutral-200/80 bg-canvas dark:bg-surface-warm/30 shrink-0 space-y-3">
      {modo === 'nuevo' && onNotasChange && (
        <div>
          <label
            htmlFor="notas-pedido-desktop"
            className="block text-xs font-semibold text-ink-muted mb-1"
          >
            Notas generales del pedido (opcional):
          </label>
          <input
            id="notas-pedido-desktop"
            type="text"
            maxLength={100}
            value={notas}
            onChange={(e) => onNotasChange(e.target.value)}
            placeholder="Ej: Servir todo junto, sin cubiertos..."
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-200/80 bg-surface text-ink focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
          />
        </div>
      )}

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-ink-muted">
          <span>Productos nuevos ({cantidadTotalProductos})</span>
          <span className="tabular-nums font-semibold">S/ {totalCalculado.toFixed(2)}</span>
        </div>
        {modo === 'ampliacion' && pedidoExistente && (
          <div className="flex justify-between text-xs text-ink-muted">
            <span>Consumo anterior</span>
            <span className="tabular-nums">S/ {pedidoExistente.total.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-neutral-200 dark:border-neutral-200/80">
          <span className="text-sm font-bold text-ink uppercase tracking-wide">
            Total a Cobrar
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
            S/ {totalFinal.toFixed(2)}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        disabled={botonDeshabilitado}
        onClick={onRegistrarPedido}
        className="w-full min-h-[44px] py-3 text-sm font-bold bg-primary hover:bg-primary-hover text-white shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {registrando ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Registrando…</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>{labelConfirmarDesktop}</span>
          </>
        )}
      </Button>
    </div>
  );
};
