import React from 'react';
import type { TipoComprobante } from '../../../types/cobro';

export interface CobroTipoComprobanteSelectorProps {
  tipoComprobante: TipoComprobante;
  setTipoComprobante: (tipo: TipoComprobante) => void;
}

export const CobroTipoComprobanteSelector: React.FC<CobroTipoComprobanteSelectorProps> = ({
  tipoComprobante,
  setTipoComprobante,
}) => {
  return (
    <div>
      <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
        Tipo de Comprobante
      </label>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setTipoComprobante('Ticket')}
          className={`p-2.5 rounded-xl border text-center font-semibold text-xs transition-all cursor-pointer ${
            tipoComprobante === 'Ticket'
              ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
              : 'bg-surface hover:bg-neutral-50 text-neutral-700 border-neutral-200'
          }`}
        >
          <div className="font-bold">Ticket</div>
          <div className="text-xs opacity-75 font-normal">Sin validez fiscal</div>
        </button>

        <button
          type="button"
          onClick={() => setTipoComprobante('Boleta')}
          className={`p-2.5 rounded-xl border text-center font-semibold text-xs transition-all cursor-pointer ${
            tipoComprobante === 'Boleta'
              ? 'bg-primary text-white border-accent shadow-2xs'
              : 'bg-surface hover:bg-neutral-50 text-neutral-700 border-neutral-200'
          }`}
        >
          <div className="font-bold">Boleta</div>
          <div className="text-xs opacity-75 font-normal">Persona Natural</div>
        </button>

        <button
          type="button"
          onClick={() => setTipoComprobante('Factura')}
          className={`p-2.5 rounded-xl border text-center font-semibold text-xs transition-all cursor-pointer ${
            tipoComprobante === 'Factura'
              ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-2xs'
              : 'bg-surface hover:bg-neutral-50 text-neutral-700 border-neutral-200'
          }`}
        >
          <div className="font-bold">Factura</div>
          <div className="text-xs opacity-75 font-normal">Con RUC (Empresa)</div>
        </button>
      </div>
    </div>
  );
};
