import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { PedidoPendienteCobro, TipoComprobante } from '../../../types/cobro';

export interface CobroBannerTotalProps {
  pedido: PedidoPendienteCobro;
  total: number;
  tipoComprobante: TipoComprobante;
  errorLocal: string | null;
}

export const CobroBannerTotal: React.FC<CobroBannerTotalProps> = ({
  pedido,
  total,
  tipoComprobante,
  errorLocal,
}) => {
  return (
    <>
      {/* Total Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-200/70 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Total a Cobrar
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-accent tracking-tight">
            S/ {total.toFixed(2)}
          </div>
          {tipoComprobante !== 'Ticket' && (
            <div className="text-xs text-neutral-600 mt-0.5 font-medium">
              Op. Gravada: S/ {(total / 1.18).toFixed(2)} · IGV (18%): S/ {(total - total / 1.18).toFixed(2)}
            </div>
          )}
        </div>
        <div className="text-right">
          <span
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1 ${
              pedido.estaListo
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            {pedido.estaListo ? 'Listo para entrega' : 'En cocina / Salón'}
          </span>
        </div>
      </div>

      {!pedido.estaListo && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
          <span>
            <strong>Esperando a cocina:</strong> Este pedido aún no ha sido marcado como <strong>Listo</strong>. No se puede emitir el cobro hasta que cocina termine la preparación.
          </span>
        </div>
      )}

      {errorLocal && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorLocal}</span>
        </div>
      )}
    </>
  );
};
