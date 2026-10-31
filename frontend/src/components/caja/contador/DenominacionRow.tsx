import React from 'react';
import type { DenominacionDef } from './denominacionesData';

export interface DenominacionRowProps {
  denom: DenominacionDef;
  cantidad: number | '';
  error?: string;
  onChange: (id: string, val: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const DenominacionRow: React.FC<DenominacionRowProps> = ({
  denom,
  cantidad,
  error,
  onChange,
  inputRef,
}) => {
  const cantNum = typeof cantidad === 'number' ? cantidad : 0;
  const subtotal = cantNum > 0 ? (cantNum * Math.round(denom.valor * 100)) / 100 : 0;

  return (
    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between gap-3 focus-within:border-accent transition-colors">
      <div className="w-20">
        <span className="font-bold text-sm text-ink">{denom.etiqueta}</span>
      </div>
      <div className="flex-1 flex flex-col items-end">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Cant:</span>
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min="0"
            max="999"
            step="1"
            value={cantidad}
            onChange={(e) => onChange(denom.id, e.target.value)}
            placeholder="0"
            className={`w-20 text-right px-2 py-1 bg-surface border rounded-lg text-sm font-semibold tabular-nums focus:outline-hidden focus:ring-1 ${
              error
                ? 'border-red-500 focus:ring-red-500 bg-red-50'
                : 'border-neutral-200 focus:ring-accent'
            }`}
          />
        </div>
        <span className="text-xs font-semibold text-neutral-500 tabular-nums mt-0.5">
          = S/ {subtotal.toFixed(2)}
        </span>
        {error && <span className="text-xs text-red-600 mt-0.5">{error}</span>}
      </div>
    </div>
  );
};
