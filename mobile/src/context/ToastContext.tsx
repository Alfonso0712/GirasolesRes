import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

export type ToastTipo = 'exito' | 'error' | 'info' | 'aviso';

export interface ToastAction {
  etiqueta: string;
  onClick: () => void;
}

export interface ToastOptions {
  tipo: ToastTipo;
  mensaje: string;
  accion?: ToastAction;
  duracionMs?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  mostrar: (options: ToastOptions) => void;
  ocultar: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { triggerLight, triggerError } = useHaptics();

  const ocultar = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const mostrar = useCallback(
    ({ tipo, mensaje, accion, duracionMs }: ToastOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (tipo === 'error') {
        triggerError();
      } else {
        triggerLight();
      }

      const id = `${Date.now()}-${Math.random()}`;
      setToast({ id, tipo, mensaje, accion, duracionMs });

      const tiempo = duracionMs || (accion ? 6000 : 4000);
      timerRef.current = setTimeout(() => {
        setToast(null);
        timerRef.current = null;
      }, tiempo);
    },
    [triggerError, triggerLight]
  );

  const getToastStyles = (tipo: ToastTipo) => {
    switch (tipo) {
      case 'exito':
        return 'bg-success text-white shadow-xl';
      case 'error':
        return 'bg-danger text-white shadow-xl';
      case 'aviso':
        return 'bg-warning text-ink shadow-xl';
      case 'info':
      default:
        return 'bg-brand-dark text-white shadow-xl';
    }
  };

  const getToastIcon = (tipo: ToastTipo) => {
    switch (tipo) {
      case 'exito':
        return <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />;
      case 'aviso':
        return <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <ToastContext.Provider value={{ mostrar, ocultar }}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live={toast.tipo === 'error' ? 'assertive' : 'polite'}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto pointer-events-none safe-bottom animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div
            className={`pointer-events-auto px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold border border-white/10 ${getToastStyles(
              toast.tipo
            )}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {getToastIcon(toast.tipo)}
              <span className="leading-snug break-words">{toast.mensaje}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {toast.accion && (
                <button
                  type="button"
                  onClick={() => {
                    toast.accion?.onClick();
                    ocultar();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-black underline uppercase cursor-pointer"
                >
                  {toast.accion.etiqueta}
                </button>
              )}
              <button
                type="button"
                onClick={ocultar}
                aria-label="Cerrar notificación"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full hover:bg-white/20 flex items-center justify-center cursor-pointer opacity-80 hover:opacity-100 active:scale-95 transition-transform"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe ser utilizado dentro de un ToastProvider');
  }
  return ctx;
}
