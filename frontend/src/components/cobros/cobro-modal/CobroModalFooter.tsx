import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { TipoComprobante } from '../../../types/cobro';

interface CobroModalFooterProps {
  onClose: () => void;
  loading: boolean;
  canSubmit: boolean;
  tipoComprobante: TipoComprobante;
}

export const CobroModalFooter: React.FC<CobroModalFooterProps> = ({
  onClose,
  loading,
  canSubmit,
  tipoComprobante,
}) => {
  return (
    <div className="pt-2 flex items-center justify-end gap-2.5">
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer min-h-[44px]"
      >
        Cancelar
      </button>

      <button
        type="submit"
        disabled={!canSubmit}
        className={`px-5 py-2.5 rounded-xl text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-2 min-h-[44px] ${
          canSubmit
            ? tipoComprobante === 'Factura'
              ? 'bg-[#1E3A8A] hover:bg-[#1E40AF] cursor-pointer'
              : 'bg-primary hover:bg-primary-hover cursor-pointer'
            : 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-70'
        }`}
      >
        {loading ? (
          <span>Emitiendo comprobante...</span>
        ) : (
          <>
            <span>
              Emitir {tipoComprobante === 'Ticket' ? 'Ticket' : tipoComprobante === 'Boleta' ? 'Boleta' : 'Factura'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};
