import React, { useEffect, useRef } from 'react';
import { LogOut, X } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // RV-31: Foco inicial en CERRAR SESIÓN, Enter para confirmar y Esc para cancelar
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Tecla Escape para cancelar (RV-31)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 text-center relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 modal-close-btn" aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#D35400] flex items-center justify-center mx-auto mb-4 border border-amber-200/50 shadow-xs">
          <LogOut className="w-6 h-6" />
        </div>

        {/* MSG-40 */}
        <h3 id="logout-title" className="text-xl font-sans font-bold text-[#2C1A0E] mb-2">
          ¿Cerrar sesión?
        </h3>

        <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
          Tendrá que ingresar nuevamente para usar el sistema.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 font-semibold text-neutral-700 hover:bg-neutral-50 text-sm transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 px-4 rounded-xl bg-[#C74E00] hover:bg-[#B84600] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Cerrando sesión…</span>
              </>
            ) : (
              'Cerrar sesión'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
