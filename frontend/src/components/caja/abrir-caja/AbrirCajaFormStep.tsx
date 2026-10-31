import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

export interface AbrirCajaFormStepProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  montoInput: string;
  onMontoInputChange: (val: string) => void;
  errorValidacion: string | null;
  onErrorValidacionClear: () => void;
  sugerenciaInicial?: number | null;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const AbrirCajaFormStep: React.FC<AbrirCajaFormStepProps> = ({
  inputRef,
  montoInput,
  onMontoInputChange,
  errorValidacion,
  onErrorValidacionClear,
  sugerenciaInicial,
  onSubmit,
  onClose,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-neutral-600">
        Ingrese el sencillo o fondo inicial en efectivo con el que iniciará el turno para habilitar el cobro de pedidos.
      </p>

      {sugerenciaInicial !== null && sugerenciaInicial !== undefined && sugerenciaInicial >= 0 && (
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-600">
            <HelpCircle className="w-4 h-4 text-accent shrink-0" />
            <span>Sugerido del último cierre:</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onMontoInputChange(sugerenciaInicial.toFixed(2));
              onErrorValidacionClear();
            }}
            className="font-bold text-accent hover:underline cursor-pointer tabular-nums"
          >
            <span className="tabular-nums">{formatCurrency(sugerenciaInicial)}</span> (Usar)
          </button>
        </div>
      )}

      <div>
        <label htmlFor="monto-inicial" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
          Monto Inicial (S/) <span className="text-red-600">*</span>
        </label>
        <div className="relative rounded-xl shadow-2xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 font-bold">
            S/
          </div>
          <input
            ref={inputRef}
            id="monto-inicial"
            type="number"
            step="0.01"
            min="0"
            max="99999.99"
            value={montoInput}
            onChange={(e) => {
              onMontoInputChange(e.target.value);
              if (errorValidacion) onErrorValidacionClear();
            }}
            placeholder="0.00"
            className={`block w-full pl-10 pr-4 py-3 bg-surface border rounded-xl text-lg font-bold tabular-nums text-ink focus:outline-hidden focus:ring-2 ${
              errorValidacion
                ? 'border-red-500 focus:ring-red-500 bg-red-50/50'
                : 'border-neutral-200 focus:border-accent focus:ring-accent/20'
            }`}
          />
        </div>
        {errorValidacion && (
          <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errorValidacion}
          </p>
        )}
        <p className="text-xs text-neutral-500 mt-1">
          Permitido: S/ 0.00 a S/ 99,999.99 con hasta 2 decimales.
        </p>
      </div>

      {/* Botones de montos sugeridos rápidos */}
      <div className="flex gap-2 pt-1">
        {[0, 50, 100, 200].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => {
              onMontoInputChange(val.toFixed(2));
              onErrorValidacionClear();
            }}
            className="flex-1 py-1.5 text-xs font-semibold font-sans tabular-nums rounded-lg border border-neutral-200 bg-surface hover:bg-neutral-50 text-neutral-700 shadow-2xs transition-colors cursor-pointer min-h-[44px]"
          >
            S/ {val}
          </button>
        ))}
      </div>

      {/* Botones Footer */}
      <div className="pt-2 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 text-sm font-semibold text-neutral-700 bg-surface border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer min-h-[44px]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
        >
          Continuar
        </button>
      </div>
    </form>
  );
};
