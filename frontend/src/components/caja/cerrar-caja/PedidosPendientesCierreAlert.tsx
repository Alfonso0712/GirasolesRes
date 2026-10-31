import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { CierreResumenDto } from '../../../types/caja';

export interface PedidosPendientesCierreAlertProps {
  pedidosPendientes: CierreResumenDto['pedidosPendientes'];
  onClose: () => void;
  onCobrarPedido?: (pedidoId: string) => void;
}

export const PedidosPendientesCierreAlert: React.FC<PedidosPendientesCierreAlertProps> = ({
  pedidosPendientes,
  onClose,
  onCobrarPedido,
}) => {
  return (
    <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-red-900">
            No se puede cerrar la caja: hay pedidos pendientes de cobro.
          </h3>
          <p className="text-xs text-red-700 mt-0.5">
            Debe cobrarlos o anularlos previamente para no dejar cuentas abiertas antes del arqueo.
          </p>
        </div>
      </div>

      <div className="divide-y divide-red-200 bg-surface rounded-xl border border-red-200 overflow-hidden max-h-48 overflow-y-auto">
        {pedidosPendientes.map((p) => (
          <div key={p.pedidoId} className="p-3 flex items-center justify-between text-xs gap-3">
            <div>
              <span className="font-bold text-ink">Pedido #{p.numero}</span>
              <span className="text-neutral-500 ml-2">
                ({p.tipo} · {p.mesa || 'Sin mesa'})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-red-600 tabular-nums">
                {formatCurrency(p.total)}
              </span>
              {onCobrarPedido && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onCobrarPedido(p.pedidoId);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-[#B94600] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer min-h-[44px]"
                >
                  Cobrar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
