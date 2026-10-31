import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export interface MesasToastAvisosProps {
  avisoExito: string | null;
  avisoError: string | null;
  onCerrarError: () => void;
}

export const MesasToastAvisos: React.FC<MesasToastAvisosProps> = ({
  avisoExito,
  avisoError,
  onCerrarError,
}) => {
  return (
    <>
      {/* Aviso Flotante Toast de Éxito (4 segundos) */}
      {avisoExito && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-in slide-in-from-bottom-4 fade-in duration-200"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-xs font-semibold tracking-wide">{avisoExito}</span>
        </div>
      )}

      {/* Aviso Flotante Toast de Error */}
      {avisoError && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-6 right-6 z-50 bg-rose-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-rose-500/40 animate-in slide-in-from-bottom-4 fade-in duration-200"
        >
          <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-300">
            <AlertCircle className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold tracking-wide">{avisoError}</span>
          <button
            type="button"
            onClick={onCerrarError}
            className="ml-2 text-rose-300 hover:text-white text-base leading-none p-1 cursor-pointer"
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};
