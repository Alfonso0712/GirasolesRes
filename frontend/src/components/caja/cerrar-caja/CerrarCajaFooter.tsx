import React from 'react';
import { Lock } from 'lucide-react';
import type { CerrarCajaResponseDto } from '../../../types/caja';

interface CerrarCajaFooterProps {
  resultadoCierre: CerrarCajaResponseDto | null;
  onClose: () => void;
  cargandoResumen: boolean;
  tienePedidosPendientes: boolean;
  contadoNumerico: number | null;
  observacionLength: number;
  onAvanzarConfirmacion: () => void;
}

export const CerrarCajaFooter: React.FC<CerrarCajaFooterProps> = ({
  resultadoCierre,
  onClose,
  cargandoResumen,
  tienePedidosPendientes,
  contadoNumerico,
  observacionLength,
  onAvanzarConfirmacion,
}) => {
  return (
    <div className="bg-neutral-50/80 border-t border-neutral-200 p-4 flex items-center justify-end gap-3">
      {resultadoCierre ? (
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow transition-colors cursor-pointer min-h-[44px]"
        >
          Volver a Caja
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-neutral-700 bg-surface border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={
              cargandoResumen ||
              tienePedidosPendientes ||
              contadoNumerico === null ||
              observacionLength > 200
            }
            onClick={onAvanzarConfirmacion}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#C0392B] hover:bg-[#A93226] disabled:bg-neutral-300 disabled:cursor-not-allowed rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
          >
            <Lock className="w-4 h-4" />
            <span>CERRAR CAJA</span>
          </button>
        </>
      )}
    </div>
  );
};
