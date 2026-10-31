import React from 'react';
import { Coins, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface ArqueoEfectivoSectionProps {
  tienePedidosPendientes: boolean;
  onAbrirContador: () => void;
  inputContadoRef: React.RefObject<HTMLInputElement | null>;
  efectivoContadoInput: string;
  onEfectivoChange: (val: string) => void;
  diferenciaCalculada: number | null;
  contadoNumerico: number | null;
  efectivoEsperado?: number;
  observacion: string;
  onObservacionChange: (val: string) => void;
}

export const ArqueoEfectivoSection: React.FC<ArqueoEfectivoSectionProps> = ({
  tienePedidosPendientes,
  onAbrirContador,
  inputContadoRef,
  efectivoContadoInput,
  onEfectivoChange,
  diferenciaCalculada,
  contadoNumerico,
  efectivoEsperado,
  observacion,
  onObservacionChange,
}) => {
  return (
    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <label
            htmlFor="efectivo-contado"
            className="block text-xs font-bold uppercase tracking-wider text-neutral-700"
          >
            Efectivo Contado en Gaveta (S/) <span className="text-red-600">*</span>
          </label>
          <p className="text-xs text-neutral-500">
            Cuente el dinero físico o use el contador de billetes y monedas.
          </p>
        </div>
        <button
          type="button"
          disabled={tienePedidosPendientes}
          onClick={onAbrirContador}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#5C341A] hover:bg-sidebar disabled:bg-neutral-300 rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
        >
          <Coins className="w-4 h-4 text-[#F39C12]" />
          CONTAR BILLETES Y MONEDAS
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 font-bold">
          S/
        </div>
        <input
          ref={inputContadoRef}
          id="efectivo-contado"
          type="number"
          step="0.01"
          min="0"
          max="99999.99"
          disabled={tienePedidosPendientes}
          value={efectivoContadoInput}
          onChange={(e) => onEfectivoChange(e.target.value)}
          placeholder="0.00"
          className="block w-full pl-10 pr-4 py-3 bg-surface border border-neutral-200 rounded-xl text-xl font-bold tabular-nums text-ink focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent disabled:bg-stone-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Indicador de Diferencia (RV-125, MSG-176, MSG-177, MSG-178) */}
      {diferenciaCalculada !== null && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            diferenciaCalculada === 0
              ? 'bg-green-50 border-green-300 text-green-900'
              : diferenciaCalculada > 0
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {diferenciaCalculada === 0 ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            ) : (
              <AlertTriangle
                className={`w-5 h-5 shrink-0 ${
                  diferenciaCalculada > 0 ? 'text-warning' : 'text-red-600'
                }`}
              />
            )}
            <div>
              <p className="font-bold text-sm">
                {diferenciaCalculada === 0 ? (
                  'Cuadra: el efectivo contado coincide con el esperado.' // MSG-176
                ) : diferenciaCalculada > 0 ? (
                  <span className="tabular-nums">{`Sobrante de S/ ${diferenciaCalculada.toFixed(2)}. Se recomienda indicar una observación.`}</span> // MSG-177
                ) : (
                  <span className="tabular-nums">{`Faltante de S/ ${Math.abs(diferenciaCalculada).toFixed(2)}. Se recomienda indicar una observación.`}</span> // MSG-178
                )}
              </p>
              <p className="text-xs opacity-80 tabular-nums">
                Esperado: <span className="tabular-nums">S/ {efectivoEsperado?.toFixed(2)}</span> | Contado: <span className="tabular-nums">S/ {contadoNumerico?.toFixed(2)}</span>
              </p>
            </div>
          </div>
          <span className="font-bold text-lg tabular-nums shrink-0">
            {diferenciaCalculada === 0
              ? 'Cuadra'
              : `${diferenciaCalculada > 0 ? '+' : '-'}S/ ${Math.abs(
                  diferenciaCalculada
                ).toFixed(2)}`}
          </span>
        </div>
      )}

      {/* Observación Opcional (RV-126) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="observacion-cierre"
            className="block text-xs font-bold uppercase tracking-wider text-neutral-700"
          >
            Observación {diferenciaCalculada !== null && diferenciaCalculada !== 0 && '(Recomendada)'}
          </label>
          <span
            className={`text-xs tabular-nums font-semibold ${
              observacion.length > 200 ? 'text-red-600 font-bold' : 'text-stone-500'
            }`}
          >
            {observacion.length}/200
          </span>
        </div>
        <textarea
          id="observacion-cierre"
          rows={2}
          maxLength={250}
          disabled={tienePedidosPendientes}
          value={observacion}
          onChange={(e) => onObservacionChange(e.target.value)}
          placeholder="Detalles de sobrante, faltante o incidencias del turno..."
          className="block w-full px-3 py-2 bg-surface border border-neutral-200 rounded-xl text-xs text-ink focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent disabled:bg-stone-100"
        />
        {observacion.length > 200 && (
          <p className="text-xs text-red-600 font-bold mt-1">
            La observación no puede superar los 200 caracteres.
          </p>
        )}
      </div>
    </div>
  );
};
