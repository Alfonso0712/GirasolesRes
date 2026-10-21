import React from 'react';
import { CheckCircle2, LayoutGrid, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface PedidoConfirmacionModalProps {
  isOpen: boolean;
  modo: 'nuevo' | 'ampliacion';
  numeroPedido: number;
  mesaNombre: string;
  total: number;
  onNuevoPedido: () => void;
  onVerMesas: () => void;
}

export const PedidoConfirmacionModal: React.FC<PedidoConfirmacionModalProps> = ({
  isOpen,
  modo,
  numeroPedido,
  mesaNombre,
  total,
  onNuevoPedido,
  onVerMesas,
}) => {
  if (!isOpen) return null;

  const esNuevo = modo === 'nuevo';
  const mensajeTitulo = esNuevo
    ? `Pedido N.º ${numeroPedido} registrado para ${mesaNombre}`
    : `Productos agregados al Pedido N.º ${numeroPedido}`;

  const mensajeDetalle = esNuevo
    ? 'La comanda se envió a cocina y la mesa quedó marcada como ocupada.'
    : 'Se envió una comanda adicional a cocina con los nuevos productos.';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-exito-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-200/80 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-in zoom-in-75 duration-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 id="modal-exito-title" className="text-xl font-sans font-bold text-[#2C1A0E] mb-1">
          {mensajeTitulo}
        </h2>
        <p className="text-sm text-[#7C6F66] mb-5">
          {mensajeDetalle}
        </p>

        {/* Resumen del Pedido */}
        <div className="bg-[#FAF7F4] border border-neutral-200/80 rounded-xl p-4 mb-6 flex justify-around items-center">
          <div>
            <span className="block text-xs uppercase tracking-wider text-[#7C6F66] font-semibold">
              Mesa
            </span>
            <span className="text-base font-bold text-[#2C1A0E]">
              {mesaNombre}
            </span>
          </div>
          <div className="h-8 w-px bg-neutral-200" />
          <div>
            <span className="block text-xs uppercase tracking-wider text-[#7C6F66] font-semibold">
              Pedido
            </span>
            <span className="text-base font-bold text-[#B84500] tabular-nums">
              #{numeroPedido}
            </span>
          </div>
          <div className="h-8 w-px bg-neutral-200" />
          <div>
            <span className="block text-xs uppercase tracking-wider text-[#7C6F66] font-semibold">
              Total
            </span>
            <span className="text-base font-bold text-emerald-700 tabular-nums">
              S/ {total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onVerMesas}
            className="w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px]"
          >
            <LayoutGrid className="w-4 h-4" />
            Ver Mesas
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={onNuevoPedido}
            className="w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px] bg-[#C74E00] hover:bg-[#B84600] text-white"
          >
            <Plus className="w-4 h-4" />
            Nuevo Pedido
          </Button>
        </div>
      </div>
    </div>
  );
};

