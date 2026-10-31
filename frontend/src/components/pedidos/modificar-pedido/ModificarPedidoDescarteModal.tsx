import React from 'react';

export interface ModificarPedidoDescarteModalProps {
  isOpen: boolean;
  onContinuarEditando: () => void;
  onDescartar: () => void;
}

export const ModificarPedidoDescarteModal: React.FC<ModificarPedidoDescarteModalProps> = ({
  isOpen,
  onContinuarEditando,
  onDescartar,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-amber-200 text-center animate-in zoom-in-95 duration-150">
        <h4 className="font-bold text-ink text-base mb-2 font-sans">
          Cambios sin guardar
        </h4>
        <p className="text-xs text-neutral-600 mb-5 leading-relaxed">
          Tiene cambios sin guardar en este pedido. ¿Desea descartarlos y salir?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onContinuarEditando}
            className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-50 cursor-pointer min-h-[44px]"
          >
            Continuar editando
          </button>
          <button
            type="button"
            onClick={onDescartar}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer min-h-[44px]"
          >
            Descartar cambios
          </button>
        </div>
      </div>
    </div>
  );
};
