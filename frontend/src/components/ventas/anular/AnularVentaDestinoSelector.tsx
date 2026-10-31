import React from 'react';
import { RotateCcw, Ban } from 'lucide-react';

export interface AnularVentaDestinoSelectorProps {
  pedidoNumero: number;
  destinoPedido: 'porCobrar' | 'anular';
  onDestinoPedidoChange: (destino: 'porCobrar' | 'anular') => void;
  loading: boolean;
}

export const AnularVentaDestinoSelector: React.FC<AnularVentaDestinoSelectorProps> = ({
  pedidoNumero,
  destinoPedido,
  onDestinoPedidoChange,
  loading,
}) => {
  return (
    <div className="pt-2 border-t border-neutral-100">
      <label className="block text-sm font-medium text-ink mb-2">
        ¿Qué desea hacer con el pedido N.º {pedidoNumero}? <span className="text-danger">*</span>
      </label>
      <div className="space-y-2">
        <label
          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
            destinoPedido === 'porCobrar'
              ? 'border-accent bg-amber-50/40 ring-1 ring-accent'
              : 'border-neutral-200 bg-surface hover:bg-neutral-50'
          }`}
        >
          <input
            type="radio"
            name="destinoPedido"
            value="porCobrar"
            checked={destinoPedido === 'porCobrar'}
            disabled={loading}
            onChange={() => onDestinoPedidoChange('porCobrar')}
            className="mt-0.5 text-accent focus:ring-accent"
          />
          <div className="text-xs">
            <span className="font-bold text-ink flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-accent" />
              Dejar el pedido por cobrar (Recomendado)
            </span>
            <p className="text-neutral-500 mt-0.5 leading-normal">
              El pedido reaparece en <strong>Gestión de Caja</strong> para ser cobrado de nuevo con el método o importe correcto y un nuevo número de comprobante. La mesa permanece ocupada.
            </p>
          </div>
        </label>

        <label
          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
            destinoPedido === 'anular'
              ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500'
              : 'border-neutral-200 bg-surface hover:bg-neutral-50'
          }`}
        >
          <input
            type="radio"
            name="destinoPedido"
            value="anular"
            checked={destinoPedido === 'anular'}
            disabled={loading}
            onChange={() => onDestinoPedidoChange('anular')}
            className="mt-0.5 text-danger focus:ring-rose-500"
          />
          <div className="text-xs">
            <span className="font-bold text-rose-900 flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-danger" />
              Anular también el pedido
            </span>
            <p className="text-neutral-500 mt-0.5 leading-normal">
              El pedido queda cancelado permanentemente en el sistema. Si era el único pedido activo de su mesa, la mesa se libera automáticamente.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};
