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
          title="Seleccionar pago en Efectivo (F2)"
        >
          <SolesIcon className="w-5 h-5 shrink-0" />
          <span>Efectivo</span>
          <kbd
            className={`hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono rounded border ${
              metodo === 'efectivo'
                ? 'bg-white/20 text-white border-white/30'
                : 'bg-neutral-100 text-neutral-600 border-neutral-300'
            }`}
          >
            F2
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => setMetodo('yape')}
          className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 font-semibold text-sm transition-all cursor-pointer ${
            metodo === 'yape'
              ? 'bg-[#732282] text-white border-[#732282] shadow-sm'
              : 'bg-surface hover:bg-neutral-50 text-neutral-700 border-neutral-200'
          }`}
          title="Seleccionar pago con Yape / QR (F4)"
        >
          <Smartphone className="w-5 h-5 shrink-0" />
          <span>Yape / QR</span>
          <kbd
            className={`hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono rounded border ${
              metodo === 'yape'
                ? 'bg-white/20 text-white border-white/30'
                : 'bg-neutral-100 text-neutral-600 border-neutral-300'
            }`}
          >
            F4
          </kbd>
        </button>
      </div>
    </div>
  );
};
