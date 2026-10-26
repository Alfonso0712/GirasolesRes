import React, { useEffect, useRef } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { MesaItem } from '../../types/mesa';

interface MesaConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  mesa: MesaItem | null;
  accion: 'activar' | 'desactivar';
  loading?: boolean;
}

export const MesaConfirmModal: React.FC<MesaConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  mesa,
  accion,
  loading = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const esDesactivar = accion === 'desactivar';
  const mesaOcupada = mesa?.ocupacion === 'Ocupada';

  // RV-56: Una mesa ocupada no se puede desactivar (MSG-88)
  const estaBloqueadaPorOcupada = esDesactivar && mesaOcupada;

  // RV-57: El foco inicial queda en CANCELAR
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Cierre con Escape y trampa de foco
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mesa) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-mesa-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="bg-surface rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-200/80 animate-in zoom-in-95 duration-200"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Icono semántico */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                estaBloqueadaPorOcupada
                  ? 'bg-rose-50 text-danger border border-rose-200'
                  : esDesactivar
                  ? 'bg-amber-50 text-accent border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {estaBloqueadaPorOcupada ? (
                <AlertCircle className="w-6 h-6" />
              ) : esDesactivar ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 id="confirm-mesa-title" className="font-sans font-bold text-xl text-ink">
                {estaBloqueadaPorOcupada
                  ? 'Acción no permitida'
                  : esDesactivar
                  ? `¿Desactivar ${mesa.nombre}?`
                  : `¿Activar ${mesa.nombre}?`}
              </h2>

              {/* Mensajes según catálogo */}
              <div className="mt-2 text-sm text-ink-muted">
                {estaBloqueadaPorOcupada ? (
                  // RV-56 / MSG-88
                  <p className="text-rose-700 font-medium">
                    No se puede desactivar {mesa.nombre}: tiene un pedido pendiente de cobro.
                  </p>
                ) : esDesactivar ? (
                  // MSG-86
                  <p>
                    ¿Desactivar {mesa.nombre}? Dejará de aparecer al tomar pedidos, pero se conservará su historial.
                  </p>
                ) : (
                  // MSG-87
                  <p>
                    ¿Activar {mesa.nombre}? Volverá a estar disponible para pedidos.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción (RV-57: foco inicial en CANCELAR; si ocupada, sin botón de confirmar) */}
        <div className="px-6 py-4 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-100 transition-colors cursor-pointer min-h-[40px]"
          >
            {estaBloqueadaPorOcupada ? 'Entendido' : 'Cancelar'}
          </button>

          {!estaBloqueadaPorOcupada && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer min-h-[40px] flex items-center gap-2 ${
                esDesactivar
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Procesando…</span>
                </>
              ) : (
                <span>{esDesactivar ? 'Desactivar mesa' : 'Activar mesa'}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

