import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface PedidoDescartarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmarDescarte: () => void;
}

export const PedidoDescartarModal: React.FC<PedidoDescartarModalProps> = ({
  isOpen,
  onClose,
  onConfirmarDescarte,
}) => {
  const botonCancelarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => botonCancelarRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="modal-descartar-title"
      aria-describedby="modal-descartar-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden shadow-2xl border border-neutral-200/80">
        <div className="shrink-0 p-5 border-b border-neutral-100 flex justify-between items-center bg-[#FAF7F4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#B84600] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 id="modal-descartar-title" className="text-xl font-sans font-bold text-[#2C1A0E]">
                Descartar Pedido en Armado
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Cerrar modal de descarte"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p id="modal-descartar-desc" className="text-sm text-[#2C1A0E]">
            Tiene un pedido sin registrar. ¿Desea descartarlo?
          </p>
          <p className="text-xs text-[#7C6F66] mt-2">
            Los productos seleccionados y sus cantidades se eliminarán del borrador. La mesa continuará libre.
          </p>
        </div>

        <div className="shrink-0 p-4 border-t border-neutral-100 flex justify-end gap-3 bg-neutral-50/50">
          <Button
            ref={botonCancelarRef}
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            No, Continuar Pedido
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirmarDescarte}
            className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
          >
            Sí, Descartar
          </Button>
        </div>
      </div>
    </div>
  );
};

