import React, { useEffect, useRef } from 'react';
import { AlertCircle, X } from 'lucide-react';

export interface DiscardChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

export const DiscardChangesModal: React.FC<DiscardChangesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Tiene cambios sin guardar',
  description = '¿Desea descartarlos? Se restablecerán las selecciones de productos no guardadas.',
  confirmText = 'Descartar cambios',
  cancelText = 'Continuar editando',
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="discard-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-accent border border-amber-200 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar diálogo"
              className="modal-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3
            id="discard-modal-title"
            className="text-xl font-sans font-bold text-ink mb-2"
          >
            {title}
          </h3>

          <p className="text-sm text-neutral-600 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="px-6 py-4 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-700 bg-surface hover:bg-neutral-50 transition-colors cursor-pointer min-h-[44px]"
          >
            {cancelText}
          </button>

          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer min-h-[44px]"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscardChangesModal;
