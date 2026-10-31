import React, { useEffect, useRef } from 'react';
import { Trash2, Power, PowerOff, CheckCircle, AlertTriangle, X } from 'lucide-react';

export type TipoConfirmacion = 'desactivar' | 'activar' | 'eliminar';

export interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
  loading?: boolean;
  // Props para modo usuario (compatibilidad hacia atrás)
  tipo?: TipoConfirmacion;
  nombreUsuario?: string;
  usuarioActivo?: boolean;
  errorMovimientos?: boolean;
  onDesactivarDirecto?: () => Promise<void>;
  // Props para modo genérico (AGENTS.md)
  title?: string;
  subtitle?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary' | 'success';
  icon?: React.ReactNode;
  iconBg?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  tipo,
  nombreUsuario = '',
  usuarioActivo,
  onConfirm,
  onClose,
  loading = false,
  errorMovimientos = false,
  onDesactivarDirecto,
  title,
  subtitle,
  confirmText,
  cancelText = 'Cancelar',
  confirmVariant = 'danger',
  icon,
  iconBg,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // RV-20: El botón por defecto es Cancelar y auto-focus en Cancelar
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, errorMovimientos]);

  // Tecla Escape para cancelar (RV-20) y Trampa de Foco (RNF-07)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Atrapado de foco cíclico dentro del modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusableElements = Array.from(focusables).filter(
          (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Flujo alterno E-33: Usuario con movimientos (RN-11 / MSG-34)
  if (errorMovimientos) {
    const yaEstaInactivo = usuarioActivo === false;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 text-center relative max-h-[calc(100vh-2rem)] overflow-y-auto"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="modal-close-btn absolute right-3 top-3"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-warning flex items-center justify-center mx-auto mb-4 shadow-xs">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h3 id="confirm-title" className="text-xl font-sans font-bold text-ink mb-2">
            No se puede eliminar
          </h3>

          <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
            {yaEstaInactivo
              ? `El usuario ${nombreUsuario} tiene movimientos registrados en el sistema (pedidos o ventas). Por integridad histórica y auditoría, no puede ser eliminado.`
              : `El usuario ${nombreUsuario} tiene movimientos registrados en el sistema. ¿Desea desactivarlo en su lugar?`}
          </p>

          <div className="flex gap-3 justify-center">
            {yaEstaInactivo ? (
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full py-2.5 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-colors cursor-pointer shadow-md"
              >
                Entendido
              </button>
            ) : (
              <>
                <button
                  ref={cancelBtnRef}
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 font-semibold text-neutral-700 hover:bg-neutral-50 text-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                {onDesactivarDirecto && (
                  <button
                    type="button"
                    onClick={onDesactivarDirecto}
                    disabled={loading}
                    className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white cursor-pointer"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <PowerOff className="w-4 h-4" />
                        <span>Desactivar</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Configuración de modal según modo (específico o genérico)
  const config = tipo
    ? {
        desactivar: {
          titulo: `¿Desactivar a ${nombreUsuario}?`,
          subtitulo: 'No podrá iniciar sesión, pero se conservará su historial.',
          botonTexto: 'Desactivar',
          botonClase: 'bg-amber-600 hover:bg-amber-700 text-white',
          icono: <Power className="w-6 h-6 text-warning" />,
          iconoBg: 'bg-amber-50',
        },
        activar: {
          titulo: `¿Activar a ${nombreUsuario}?`,
          subtitulo: 'Podrá iniciar sesión nuevamente.',
          botonTexto: 'Activar',
          botonClase: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          icono: <CheckCircle className="w-6 h-6 text-success" />,
          iconoBg: 'bg-emerald-50',
        },
        eliminar: {
          titulo: `¿Eliminar a ${nombreUsuario}?`,
          subtitulo: 'Esta acción no se puede deshacer.',
          botonTexto: 'Eliminar usuario',
          botonClase: 'bg-rose-600 hover:bg-rose-700 text-white',
          icono: <Trash2 className="w-6 h-6 text-danger" />,
          iconoBg: 'bg-rose-50',
        },
      }[tipo]
    : {
        titulo: title || '¿Confirmar acción?',
        subtitulo: subtitle || '',
        botonTexto: confirmText || 'Confirmar',
        botonClase: {
          danger: 'bg-rose-600 hover:bg-rose-700 text-white',
          warning: 'bg-amber-600 hover:bg-amber-700 text-white',
          primary: 'bg-primary hover:bg-primary-hover text-white',
          success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        }[confirmVariant],
        icono: icon || <AlertTriangle className="w-6 h-6 text-warning" />,
        iconoBg: iconBg || 'bg-amber-50',
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 text-center relative max-h-[calc(100vh-2rem)] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="modal-close-btn absolute right-3 top-3"
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`w-14 h-14 rounded-2xl ${config.iconoBg} flex items-center justify-center mx-auto mb-4 shadow-xs`}>
          {config.icono}
        </div>

        <h3 id="confirm-title" className="text-xl font-sans font-bold text-ink mb-2">
          {config.titulo}
        </h3>

        {config.subtitulo && (
          <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
            {config.subtitulo}
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 font-semibold text-neutral-700 hover:bg-neutral-50 text-sm transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${config.botonClase} ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              config.botonTexto
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
