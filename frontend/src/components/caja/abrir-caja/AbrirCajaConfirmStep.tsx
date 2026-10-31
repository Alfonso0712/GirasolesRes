import React from 'react';
import { ShieldAlert, Check } from 'lucide-react';

export interface AbrirCajaConfirmStepProps {
  cancelBtnRef: React.RefObject<HTMLButtonElement | null>;
  montoNumerico: number;
  procesando: boolean;
  onVolver: () => void;
  onConfirmar: () => void;
}

export const AbrirCajaConfirmStep: React.FC<AbrirCajaConfirmStepProps> = ({
  cancelBtnRef,
  montoNumerico,
  procesando,
  onVolver,
  onConfirmar,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold text-amber-900">Confirmación de Apertura</p>
          <p className="text-amber-800 mt-1">
            ¿Abrir la caja con <strong className="font-bold text-ink tabular-nums">S/ {montoNumerico.toFixed(2)}</strong>? Podrá empezar a registrar cobros.
          </p>
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        Al confirmar, se habilitará inmediatamente el cobro de pedidos en el salón y pedidos para llevar.
      </p>

      <div className="pt-2 flex items-center justify-end gap-3">
        <button
          ref={cancelBtnRef}
          type="button"
          disabled={procesando}
          onClick={onVolver}
          className="px-4 py-2.5 text-sm font-semibold text-neutral-700 bg-surface border border-neutral-200 rounded-xl hover:bg-neutral-50 disabled:opacity-50 transition-colors cursor-pointer min-h-[44px]"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={procesando}
          onClick={onConfirmar}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#2E7D32] hover:bg-[#256628] disabled:bg-neutral-400 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
        >
          {procesando ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Abriendo...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>CONFIRMAR APERTURA</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
