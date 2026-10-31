import React from 'react';
import { X } from 'lucide-react';
import type { PedidoPendienteCobro } from '../../../types/cobro';

interface CobroModalHeaderProps {
  pedido: PedidoPendienteCobro;
  loading: boolean;
  onClose: () => void;
}

export const CobroModalHeader: React.FC<CobroModalHeaderProps> = ({
  pedido,
  loading,
  onClose,
}) => {
  return (
    <div className="shrink-0 p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-accent bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            Cobro en Caja
          </span>
          <span className="text-xs text-neutral-500">·</span>
          <span className="text-xs text-neutral-500 tabular-nums">
            Hora: {pedido.hora}
          </span>
        </div>
        <h2
          id="modal-cobro-title"
          className="text-xl font-sans font-bold text-ink tracking-tight"
        >
          Pedido N.º {pedido.numero}
        </h2>
        <p className="text-xs text-neutral-500">
          {pedido.tipo === 'Mesa' ? `Salón · ${pedido.mesa || 'Mesa'}` : 'Pedido Para Llevar'}
          {pedido.referencia && ` · Ref: ${pedido.referencia}`}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="modal-close-btn"
        aria-label="Cerrar modal de cobro"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
