import React from 'react';
import { Clock, Flame, RotateCw, Check, ChefHat } from 'lucide-react';
import type { ComandaKdsItem } from '../../types/comanda';

export interface ComandaCardProps {
  comanda: ComandaKdsItem;
  esNueva?: boolean;
  estaProcesando?: boolean;
  tipoZona: 'pendiente' | 'en_preparacion';
  onAccionPrincipal: (comanda: ComandaKdsItem) => void;
}

export const ComandaCard: React.FC<ComandaCardProps> = ({
  comanda: c,
  esNueva = false,
  estaProcesando = false,
  tipoZona,
  onAccionPrincipal,
}) => {
  const destino =
    c.tipo === 'Mesa'
      ? c.mesa || 'Mesa'
      : `Para llevar${c.referencia ? ` (${c.referencia})` : ''}`;

  if (tipoZona === 'pendiente') {
    return (
      <article
        key={c.id}
        className={`bg-surface rounded-3xl p-5 sm:p-6 border shadow-sm transition-all flex flex-col justify-between gap-4 ${
          esNueva
            ? 'border-emerald-500 ring-4 ring-emerald-300/40 animate-pulse'
            : c.esDemora
            ? 'border-rose-400 bg-rose-50/20'
            : 'border-neutral-200/90'
        }`}
      >
        {/* Cabecera de la tarjeta */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold text-neutral-900 font-sans tabular-nums">
                N.º {c.pedidoNumero}
              </span>

              {/* Etiquetas especiales */}
              {esNueva && (
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-600 text-white uppercase tracking-wider animate-bounce">
                  NUEVA
                </span>
              )}
              {c.etiqueta && (
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500 text-white uppercase">
                  {c.etiqueta}
                </span>
              )}
              {c.esDemora && (
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-600 text-white uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Demora
                </span>
              )}
            </div>

            {/* Tiempo de espera */}
            <div className="text-right shrink-0">
              <div
                className={`text-sm font-bold flex items-center justify-end gap-1 ${
                  c.esDemora ? 'text-rose-700' : 'text-neutral-600'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{c.minutosEspera} min</span>
              </div>
              <span className="text-xs text-neutral-500">Llegó: {c.horaLlegada}</span>
            </div>
          </div>

          {/* Subtítulo: Destino y Mozo */}
          <div className="text-sm text-neutral-600 mb-3 pb-3 border-b border-neutral-100 flex items-center justify-between">
            <span className="font-bold text-accent text-base">{destino}</span>
            <span className="text-xs text-neutral-500">Por: {c.registradoPor}</span>
          </div>

          {/* Líneas de Comanda con textos grandes y observaciones resaltadas */}
          <ul className="space-y-2.5 mb-2">
            {c.lineas.map((l, idx) => (
              <li key={idx} className="flex items-start gap-3 text-neutral-900">
                <span className="w-7 h-7 rounded-lg bg-fill-strong text-white font-bold text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {l.cantidad}
                </span>
                <div className="flex-1">
                  <span className="font-bold text-base sm:text-lg leading-tight">
                    {l.producto}
                  </span>
                  {l.observacion && (
                    <div className="mt-1">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-bold text-xs sm:text-sm border border-amber-300/80 inline-block">
                        Obs: {l.observacion}
                      </span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Botón Grande: INICIAR PREPARACIÓN (RV-93: >= 56px de alto) */}
        <button
          type="button"
          onClick={() => onAccionPrincipal(c)}
          disabled={estaProcesando}
          className="w-full min-h-[56px] h-14 rounded-2xl bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          title={`Iniciar preparación del pedido N.º ${c.pedidoNumero}`}
        >
          {estaProcesando ? (
            <>
              <RotateCw className="w-5 h-5 animate-spin" />
              <span>Actualizando…</span>
            </>
          ) : (
            <>
              <Flame className="w-5 h-5" />
              <span>INICIAR PREPARACIÓN</span>
            </>
          )}
        </button>
      </article>
    );
  }

  // tipoZona === 'en_preparacion'
  return (
    <article
      key={c.id}
      className={`bg-blue-50/40 rounded-3xl p-5 sm:p-6 border border-blue-200 shadow-sm transition-all flex flex-col justify-between gap-4 ${
        c.esDemora ? 'border-rose-400 ring-2 ring-rose-200' : ''
      }`}
    >
      {/* Cabecera de la tarjeta */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold text-blue-950 font-sans tabular-nums">
              N.º {c.pedidoNumero}
            </span>

            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-600 text-white uppercase flex items-center gap-1">
              <ChefHat className="w-3.5 h-3.5" />
              En cocina
            </span>

            {c.etiqueta && (
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500 text-white uppercase">
                {c.etiqueta}
              </span>
            )}
            {c.esDemora && (
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-600 text-white uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Demora
              </span>
            )}
          </div>

          {/* Tiempo de espera */}
          <div className="text-right shrink-0">
            <div
              className={`text-sm font-bold flex items-center justify-end gap-1 ${
                c.esDemora ? 'text-rose-700' : 'text-blue-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{c.minutosEspera} min</span>
            </div>
            <span className="text-xs text-neutral-500">Llegó: {c.horaLlegada}</span>
          </div>
        </div>

        {/* Subtítulo: Destino y Mozo */}
        <div className="text-sm text-neutral-600 mb-3 pb-3 border-b border-blue-100 flex items-center justify-between">
          <span className="font-bold text-blue-900 text-base">{destino}</span>
          <span className="text-xs text-neutral-500">Por: {c.registradoPor}</span>
        </div>

        {/* Líneas de Comanda con textos grandes y observaciones resaltadas */}
        <ul className="space-y-2.5 mb-2">
          {c.lineas.map((l, idx) => (
            <li key={idx} className="flex items-start gap-3 text-neutral-900">
              <span className="w-7 h-7 rounded-lg bg-blue-900 text-white font-bold text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                {l.cantidad}
              </span>
              <div className="flex-1">
                <span className="font-bold text-base sm:text-lg leading-tight">
                  {l.producto}
                </span>
                {l.observacion && (
                  <div className="mt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-bold text-xs sm:text-sm border border-amber-300/80 inline-block">
                      Obs: {l.observacion}
                    </span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Botón Grande: MARCAR COMO LISTA (RV-93: >= 56px de alto) */}
      <button
        type="button"
        onClick={() => onAccionPrincipal(c)}
        disabled={estaProcesando}
        className="w-full min-h-[56px] h-14 rounded-2xl bg-[#1B4332] hover:bg-[#143326] active:scale-[0.99] text-white font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
        title={`Marcar pedido N.º ${c.pedidoNumero} como listo`}
      >
        {estaProcesando ? (
          <>
            <RotateCw className="w-5 h-5 animate-spin" />
            <span>Actualizando…</span>
          </>
        ) : (
          <>
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>MARCAR COMO LISTA</span>
          </>
        )}
      </button>
    </article>
  );
};

export default ComandaCard;
