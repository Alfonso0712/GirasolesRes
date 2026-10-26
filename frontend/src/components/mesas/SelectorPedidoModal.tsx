import React from 'react';
import { ShoppingBag, X } from 'lucide-react';
import type { PedidoAbiertoMesaDto } from '../../types/pedido';

export interface SelectorPedidoModalProps {
  isOpen: boolean;
  mesaNombre: string;
  pedidos: PedidoAbiertoMesaDto[];
  onSeleccionarPedido: (pedidoId: string) => void;
  onClose: () => void;
}

export const SelectorPedidoModal: React.FC<SelectorPedidoModalProps> = ({
  isOpen,
  mesaNombre,
  pedidos,
  onSeleccionarPedido,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="selector-pedido-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-surface rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200/80 animate-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-neutral-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-accent flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 id="selector-pedido-titulo" className="font-sans font-bold text-base sm:text-lg text-ink">
                Seleccionar Pedido · {mesaNombre}
              </h3>
              <p className="text-xs text-ink-muted">
                La mesa tiene {pedidos.length} pedidos abiertos. Elija a cuál agregar productos:
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Cerrar selector de pedido"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Pedidos Abiertos */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scroll-thin mb-5">
          {pedidos.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSeleccionarPedido(p.id)}
              className="w-full text-left p-3.5 rounded-xl border border-neutral-200/90 bg-canvas hover:bg-amber-50/50 hover:border-amber-400/80 transition-all cursor-pointer flex items-center justify-between group shadow-2xs hover:shadow-xs"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-ink group-hover:text-accent transition-colors tabular-nums">
                    Pedido N.º {p.numero}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                    {p.estado}
                  </span>
                </div>
                <p className="text-xs text-ink-muted">
                  Total acumulado:{' '}
                  <strong className="text-ink font-semibold tabular-nums">
                    S/ {Number(p.total).toFixed(2)}
                  </strong>
                </p>
              </div>
              <span className="text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform shrink-0 ml-3">
                Seleccionar →
              </span>
            </button>
          ))}
        </div>

        {/* Botón Cancelar */}
        <div className="flex justify-end pt-2 border-t border-neutral-200/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-surface hover:bg-neutral-50 text-neutral-700 shadow-2xs transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectorPedidoModal;
