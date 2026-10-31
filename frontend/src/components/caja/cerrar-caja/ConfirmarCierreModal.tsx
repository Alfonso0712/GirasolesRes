import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Lock } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { CierreResumenDto } from '../../../types/caja';

export interface ConfirmarCierreModalProps {
  isOpen: boolean;
  resumen: CierreResumenDto | null;
  contadoNumerico: number | null;
  diferenciaCalculada: number | null;
  procesandoCierre: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmDialogRef?: React.RefObject<HTMLDivElement | null>;
  cancelBtnRef?: React.RefObject<HTMLButtonElement | null>;
}

export const ConfirmarCierreModal: React.FC<ConfirmarCierreModalProps> = ({
  isOpen,
  resumen,
  contadoNumerico,
  diferenciaCalculada,
  procesandoCierre,
  onCancel,
  onConfirm,
  confirmDialogRef,
  cancelBtnRef,
}) => {
  const localCancelBtnRef = useRef<HTMLButtonElement>(null);
  const activeCancelBtnRef = cancelBtnRef || localCancelBtnRef;

  useEffect(() => {
    if (isOpen) {
      activeCancelBtnRef.current?.focus();
    }
  }, [isOpen, activeCancelBtnRef]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        ref={confirmDialogRef}
        className="bg-surface border border-neutral-200 rounded-2xl shadow-2xl max-w-md w-full p-6 text-ink space-y-4 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans text-base font-bold text-red-950">
              ¿Confirmar Cierre de Caja?
            </h3>
            <p className="text-xs text-neutral-600 mt-1">
              ¿Cerrar la caja? No podrá cobrar hasta abrir una nueva y el cierre no se puede deshacer.
            </p>
          </div>
        </div>

        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs space-y-1.5 tabular-nums">
          <div className="flex justify-between">
            <span className="text-neutral-500">Efectivo esperado:</span>
            <span className="font-bold tabular-nums">{formatCurrency(resumen?.efectivoEsperado)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Efectivo contado:</span>
            <span className="font-bold tabular-nums">{formatCurrency(contadoNumerico)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-neutral-200">
            <span className="font-bold">Diferencia:</span>
            <span
              className={`font-bold tabular-nums ${
                diferenciaCalculada === 0
                  ? 'text-green-700'
                  : diferenciaCalculada! > 0
                  ? 'text-amber-700'
                  : 'text-red-700'
              }`}
            >
              {diferenciaCalculada === 0
                ? 'Cuadra'
                : <span className="tabular-nums">{`${diferenciaCalculada! > 0 ? '+' : ''}S/ ${diferenciaCalculada?.toFixed(2)}`}</span>}
            </span>
          </div>
        </div>

        {/* Botones con Foco inicial en CANCELAR (RV-127 / E-306) */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            ref={activeCancelBtnRef}
            type="button"
            disabled={procesandoCierre}
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold text-neutral-700 bg-surface border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={procesandoCierre}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#C0392B] hover:bg-[#962D22] disabled:bg-neutral-400 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
          >
            {procesandoCierre ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Cerrando...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>CONFIRMAR CIERRE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
