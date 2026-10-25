import React, { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface MenuDisponibilidadConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  plato: { nombre: string; agotado?: boolean } | null;
  nuevoEstadoAgotado: boolean;
  procesando: boolean;
}

export const MenuDisponibilidadConfirmModal: React.FC<MenuDisponibilidadConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  plato,
  nuevoEstadoAgotado,
  procesando
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // RV-49: Foco inicial en CONFIRMAR (acción reversible y frecuente durante el servicio)
      const timer = setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !procesando) {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, procesando, onClose]);

  if (!isOpen || !plato) return null;

  const esAgotar = nuevoEstadoAgotado;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disponibilidad-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-surface rounded-2xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                esAgotar
                  ? 'bg-amber-50 text-accent border-amber-200'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200'
              }`}
            >
              {esAgotar ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={procesando}
              aria-label="Cerrar diálogo"
              className="modal-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3
            id="disponibilidad-modal-title"
            className="text-xl font-sans font-bold text-ink mb-2"
          >
            {esAgotar
              ? `¿Marcar ${plato.nombre} como agotado?`
              : `¿Marcar ${plato.nombre} como disponible?`}
          </h3>

          <p className="text-sm text-neutral-600 leading-relaxed mb-1">
            {esAgotar
              ? 'Mozos y cajeros ya no podrán pedirlo; los pedidos registrados no cambian.'
              : 'Podrá pedirse nuevamente en la toma de pedidos.'}
          </p>

          <p className="text-xs text-neutral-500">
            Presione <strong>Enter</strong> para confirmar o <strong>Esc</strong> para cancelar.
          </p>
        </div>

        <div className="px-6 py-4 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={procesando}
            className="px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-700 bg-surface hover:bg-neutral-50 transition-colors disabled:opacity-50 cursor-pointer min-h-[44px]"
          >
            Cancelar
          </button>

          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            disabled={procesando}
            className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
              esAgotar
                ? 'bg-primary hover:bg-primary-hover'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {procesando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Actualizando…</span>
              </>
            ) : (
              <span>Confirmar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
