import React from 'react';
import { Utensils } from 'lucide-react';
import type { MesaItem } from '../../types/mesa';

interface MesaOcupadaModalProps {
  isOpen: boolean;
  mesa: MesaItem | null;
  cantidadPedidos: number;
  onPedidoNuevo: (mesaId: string) => void;
  onAgregarProductos: (mesa: MesaItem) => void;
  onClose: () => void;
}

export const MesaOcupadaModal: React.FC<MesaOcupadaModalProps> = ({
  isOpen,
  mesa,
  cantidadPedidos,
  onPedidoNuevo,
  onAgregarProductos,
  onClose
}) => {
  if (!isOpen || !mesa) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-surface rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-neutral-200/80 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-accent flex items-center justify-center mx-auto mb-3 border border-amber-200">
          <Utensils className="w-6 h-6" />
        </div>
        <h3 className="font-sans font-bold text-lg text-ink mb-2">
          Mesa Ocupada
        </h3>
        <p className="text-xs sm:text-sm text-ink-muted mb-6 leading-relaxed">
          La <strong>{mesa.nombre}</strong> ya tiene <strong>{cantidadPedidos}</strong> pedido(s) abierto(s). ¿Registrar un pedido nuevo o agregar productos a uno existente?
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => onPedidoNuevo(mesa.id)}
            className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            PEDIDO NUEVO
          </button>
          <button
            type="button"
            onClick={() => onAgregarProductos(mesa)}
            className="flex-1 py-2.5 px-4 bg-surface border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            AGREGAR PRODUCTOS
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 text-xs text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
