import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Power, PowerOff, Loader2 } from 'lucide-react';
import type { ProductoItem } from '../../types/producto';

interface ProductConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  producto: ProductoItem | null;
  tipo: 'activar' | 'desactivar';
  procesando?: boolean;
  formaParteDelMenuHoy?: boolean;
}

export const ProductConfirmModal: React.FC<ProductConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  producto,
  tipo,
  procesando = false,
  formaParteDelMenuHoy = false
}) => {
  const cancelarBtnRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // RV-41: El botón por defecto es CANCELAR (foco automático en CANCELAR)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        cancelarBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Cierre con tecla Escape y Focus Trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!procesando) onClose();
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, procesando]);

  if (!isOpen || !producto) return null;

  const esDesactivar = tipo === 'desactivar';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200 p-6"
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              esDesactivar
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {esDesactivar ? (
              <PowerOff className="w-6 h-6 text-[#D35400]" />
            ) : (
              <Power className="w-6 h-6 text-emerald-600" />
            )}
          </div>

          <div className="flex-1">
            <h3
              id="confirm-modal-title"
              className="text-xl font-sans font-bold text-[#2C1A0E] leading-snug"
            >
              {esDesactivar
                ? `¿Desactivar "${producto.nombre}"?`
                : `¿Activar "${producto.nombre}"?`}
            </h3>

            <p className="mt-2 text-sm text-[#7C6F66] leading-relaxed">
              {esDesactivar
                ? `¿Desactivar ${producto.nombre}? Dejará de aparecer al tomar pedidos y en el menú del día, pero se conservará su historial.`
                : `¿Activar ${producto.nombre}? Volverá a estar disponible para pedidos y para el menú del día.`}
            </p>

            {/* Advertencia si forma parte del menú vigente de hoy */}
            {esDesactivar && formaParteDelMenuHoy && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-[#D35400] shrink-0 mt-0.5" />
                <span>
                  {producto.nombre} forma parte del menú de hoy. Al desactivarlo se retirará del menú.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Acciones: botón por defecto es CANCELAR (RV-41) */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
          <button
            ref={cancelarBtnRef}
            type="button"
            onClick={onClose}
            disabled={procesando}
            className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-800 bg-white hover:bg-neutral-50 font-semibold text-sm transition-all shadow-2xs focus:ring-2 focus:ring-[#D35400] cursor-pointer min-h-[44px]"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={procesando}
            className={`px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px] ${
              esDesactivar
                ? 'bg-[#D35400] hover:bg-[#B84600]'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {procesando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Actualizando…</span>
              </>
            ) : esDesactivar ? (
              'Sí, desactivar'
            ) : (
              'Sí, activar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

