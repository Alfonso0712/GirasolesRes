import React from 'react';
import { CheckCircle2, ShoppingBag, Plus, DollarSign, ListOrdered } from 'lucide-react';
import { Button } from '../ui/Button';

interface PedidoLlevarConfirmacionModalProps {
  isOpen: boolean;
  numeroPedido: number;
  referencia?: string;
  total: number;
  onCobrarAhora: () => void;
  onNuevoPedido: () => void;
  onVerPedidos: () => void;
}

export const PedidoLlevarConfirmacionModal: React.FC<PedidoLlevarConfirmacionModalProps> = ({
  isOpen,
  numeroPedido,
  referencia,
  total,
  onCobrarAhora,
  onNuevoPedido,
  onVerPedidos,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-llevar-exito-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-surface rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-200/80 p-6 text-center">
        {/* Ícono de éxito con animación */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-success flex items-center justify-center mx-auto mb-4 animate-in zoom-in-75 duration-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Título y Mensaje de Éxito (MSG-110 / RV-74) */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-accent text-xs font-bold uppercase tracking-wider mb-2">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Para Llevar</span>
        </div>

        <h2 id="modal-llevar-exito-title" className="text-xl font-sans font-bold text-ink mb-1">
          Pedido para llevar N.º {numeroPedido} registrado
        </h2>
        <p className="text-sm text-ink-muted mb-5">
          La comanda se envió a cocina.
        </p>

        {/* Resumen del Pedido */}
        <div className="bg-canvas border border-neutral-200/80 rounded-xl p-4 mb-6">
          <div className="flex justify-around items-center">
            <div>
              <span className="block text-xs uppercase tracking-wider text-ink-muted font-semibold">
                Pedido
              </span>
              <span className="text-lg font-bold text-accent tabular-nums">
                #{numeroPedido}
              </span>
            </div>

            <div className="h-8 w-px bg-neutral-200" />

            <div>
              <span className="block text-xs uppercase tracking-wider text-ink-muted font-semibold">
                Total
              </span>
              <span className="text-lg font-bold text-emerald-700 tabular-nums">
                S/ {total.toFixed(2)}
              </span>
            </div>
          </div>

          {referencia && (
            <div className="mt-3 pt-3 border-t border-neutral-200/60 text-xs text-neutral-600 flex items-center justify-center gap-1">
              <span className="font-semibold text-neutral-500">Cliente / Ref:</span>
              <span className="font-bold text-ink bg-surface px-2 py-0.5 rounded-md border border-neutral-200">
                {referencia}
              </span>
            </div>
          )}
        </div>

        {/* Acciones Posteriores (RV-74: COBRAR AHORA, NUEVO PEDIDO, VER PEDIDOS) */}
        <div className="space-y-2.5">
          <Button
            type="button"
            variant="primary"
            onClick={onCobrarAhora}
            className="w-full flex items-center justify-center gap-2 py-3 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
          >
            <DollarSign className="w-4 h-4 stroke-[2.5]" />
            COBRAR AHORA
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant="primary"
              onClick={onNuevoPedido}
              className="w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px] bg-primary hover:bg-primary-hover text-white font-semibold"
            >
              <Plus className="w-4 h-4" />
              NUEVO PEDIDO
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={onVerPedidos}
              className="w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px] font-semibold"
            >
              <ListOrdered className="w-4 h-4" />
              VER PEDIDOS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

