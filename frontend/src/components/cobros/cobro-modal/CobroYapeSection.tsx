import React from 'react';

export interface CobroYapeSectionProps {
  total: number;
  yapeConfirmado: boolean;
  setYapeConfirmado: (val: boolean) => void;
  yapeReferencia: string;
  setYapeReferencia: (val: string) => void;
  loading: boolean;
}

export const CobroYapeSection: React.FC<CobroYapeSectionProps> = ({
  total,
  yapeConfirmado,
  setYapeConfirmado,
  yapeReferencia,
  setYapeReferencia,
  loading,
}) => {
  return (
    <div className="space-y-4 pt-1 animate-in fade-in duration-150">
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200/80 space-y-3">
        <div className="flex items-start gap-3">
          <input
            id="yape-confirm-check"
            type="checkbox"
            checked={yapeConfirmado}
            onChange={(e) => setYapeConfirmado(e.target.checked)}
            className="mt-1 w-4 h-4 text-[#732282] border-neutral-300 rounded-sm focus:ring-[#732282] cursor-pointer"
          />
          <label
            htmlFor="yape-confirm-check"
            className="text-xs font-medium text-purple-950 leading-relaxed cursor-pointer"
          >
            <span className="font-bold text-[#732282]">
              Confirmación de recepción en Yape:
            </span>{' '}
            Verifiqué que el monto de{' '}
            <span className="font-bold">S/ {total.toFixed(2)}</span> fue acreditado
            correctamente en la cuenta del restaurante.
          </label>
        </div>
      </div>

      <div>
        <label
          htmlFor="yape-ref-input"
          className="block text-xs font-bold text-ink uppercase tracking-wider mb-1"
        >
          Número de operación / Referencia (Opcional)
        </label>
        <input
          id="yape-ref-input"
          type="text"
          maxLength={20}
          value={yapeReferencia}
          onChange={(e) => setYapeReferencia(e.target.value)}
          disabled={loading}
          placeholder="Ej. 128492"
          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-accent text-neutral-900 text-sm tabular-nums"
        />
      </div>
    </div>
  );
};
