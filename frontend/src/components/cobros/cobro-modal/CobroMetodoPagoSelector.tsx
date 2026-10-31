import React from 'react';
import { Smartphone } from 'lucide-react';
import { SolesIcon } from '../../ui/SolesIcon';

export interface CobroMetodoPagoSelectorProps {
  metodo: 'efectivo' | 'yape';
  setMetodo: (metodo: 'efectivo' | 'yape') => void;
}

export const CobroMetodoPagoSelector: React.FC<CobroMetodoPagoSelectorProps> = ({
  metodo,
  setMetodo,
}) => {
  return (
    <div>
      <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
        Seleccione Medio de Pago
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMetodo('efectivo')}
          className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 font-semibold text-sm transition-all cursor-pointer ${
            metodo === 'efectivo'
              ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
              : 'bg-surface hover:bg-neutral-50 text-neutral-700 border-neutral-200'
          }`}
        >
          <SolesIcon className="w-5 h-5 shrink-0" />
          <span>Efectivo</span>
        </button>

        <button
          type="button"
          onClick={() => setMetodo('yape')}
          className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 font-semibold text-sm transition-all cursor-pointer ${
            metodo === 'yape'
              ? 'bg-[#732282] text-white border-[#732282] shadow-sm'
              : 'bg-surface hover:bg-neutral-50 text-neutral-700 border-neutral-200'
          }`}
        >
          <Smartphone className="w-5 h-5 shrink-0" />
          <span>Yape / QR</span>
        </button>
      </div>
    </div>
  );
};
