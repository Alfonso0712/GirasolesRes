import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface CobroEfectivoSectionProps {
  total: number;
  montoRecibidoStr: string;
  setMontoRecibidoStr: (val: string) => void;
  loading: boolean;
  onQuickAmount: (val: number) => void;
  montoRecibido: number;
  vuelto: number;
  faltante: number;
}

export const CobroEfectivoSection: React.FC<CobroEfectivoSectionProps> = ({
  total,
  montoRecibidoStr,
  setMontoRecibidoStr,
  loading,
  onQuickAmount,
  montoRecibido,
  vuelto,
  faltante,
}) => {
  return (
    <div className="space-y-4 pt-1 animate-in fade-in duration-150">
      <div>
        <label
          htmlFor="monto-recibido-input"
          className="block text-xs font-semibold text-ink mb-1.5"
        >
          Monto Recibido del Cliente (S/) <span className="text-accent">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-neutral-500">
            S/
          </span>
          <input
            id="monto-recibido-input"
            type="number"
            step="0.10"
            min="0"
            max="9999.99"
            value={montoRecibidoStr}
            onChange={(e) => setMontoRecibidoStr(e.target.value)}
            autoFocus
            disabled={loading}
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 text-ink text-xl font-bold font-sans tabular-nums"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Botones de sugerencia rápida */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Acceso rápido:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onQuickAmount(total)}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-surface hover:bg-neutral-50 text-xs font-semibold font-sans tabular-nums text-neutral-700 shadow-2xs transition-colors cursor-pointer"
          >
            Exacto (S/ {total.toFixed(2)})
          </button>
          {[20, 50, 100].map((b) => (
            <button
              key={b}
              type="button"
              disabled={b < total}
              onClick={() => onQuickAmount(b)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold font-sans tabular-nums transition-colors cursor-pointer ${
                b < total
                  ? 'border-neutral-100 bg-neutral-100/50 text-neutral-500 cursor-not-allowed'
                  : 'border-neutral-200 bg-surface hover:bg-neutral-50 text-neutral-700 shadow-2xs'
              }`}
            >
              S/ {b}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen de Vuelto */}
      <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Vuelto a entregar
          </span>
          <div
            className={`text-xl font-bold font-sans tabular-nums tracking-tight ${
              montoRecibido < total ? 'text-danger' : 'text-emerald-700'
            }`}
          >
            S/ {vuelto.toFixed(2)}
          </div>
        </div>
        {montoRecibido < total && (
          <span className="text-xs text-danger font-semibold">
            Faltan S/ {faltante.toFixed(2)}
          </span>
        )}
        {montoRecibido >= total && (
          <span className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Pago cubierto
          </span>
        )}
      </div>
    </div>
  );
};
