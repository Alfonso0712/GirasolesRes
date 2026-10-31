import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProductsToastsProps {
  avisoExito: string | null;
  onCloseExito: () => void;
  avisoError: string | null;
  onCloseError: () => void;
}

export const ProductsToasts: React.FC<ProductsToastsProps> = ({
  avisoExito,
  onCloseExito,
  avisoError,
  onCloseError,
}) => {
  return (
    <>
      {/* Toast / Alerta de Éxito (H-01 / RV-28) */}
      {avisoExito && (
        <div
          role="status"
          aria-live="polite"
          className="shrink-0 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-emerald-800 text-sm shadow-xs animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            <span className="font-medium">{avisoExito}</span>
          </div>
          <button
            type="button"
            onClick={onCloseExito}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-emerald-100/60 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Toast / Alerta de Error Temporal */}
      {avisoError && (
        <div
          role="alert"
          aria-live="assertive"
          className="shrink-0 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-800 text-sm shadow-xs animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-danger shrink-0" />
            <span className="font-medium">{avisoError}</span>
          </div>
          <button
            type="button"
            onClick={onCloseError}
            className="text-rose-700 hover:text-rose-900 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-rose-100/60 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}
    </>
  );
};
