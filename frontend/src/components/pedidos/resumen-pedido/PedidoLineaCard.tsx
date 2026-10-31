import React from 'react';
import {
  AlertCircle,
  MessageSquare,
  Copy,
  Minus,
  Plus,
  Trash2,
} from 'lucide-react';
import type { LineaBorrador } from '../../../types/pedido';

export interface PedidoLineaCardProps {
  linea: LineaBorrador;
  index: number;
  esMovil: boolean;
  errorLinea?: string;
  onAbrirNota: (linea: LineaBorrador) => void;
  onRepetirLinea: (index: number) => void;
  onDisminuirLinea: (index: number) => void;
  onQuitarLinea: (index: number) => void;
}

export const PedidoLineaCard: React.FC<PedidoLineaCardProps> = ({
  linea,
  index,
  esMovil,
  errorLinea,
  onAbrirNota,
  onRepetirLinea,
  onDisminuirLinea,
  onQuitarLinea,
}) => {
  const tieneError = Boolean(errorLinea || linea.agotado);
  const btnSizeClass = esMovil ? 'min-h-[36px] min-w-[36px]' : 'w-7 h-7';

  return (
    <div
      key={`${linea.productoId || linea.menuCompletoId}-${linea.observacion}-${index}`}
      className={`p-3 rounded-xl border transition-all ${
        tieneError
          ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 shadow-2xs'
          : 'bg-canvas dark:bg-surface-raised border-neutral-200 dark:border-neutral-200/80 hover:border-neutral-300 dark:hover:border-neutral-300/60 shadow-2xs'
      }`}
    >
      {/* Fila 1: Nombre del plato y Subtotal */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span
            className="font-bold text-xs sm:text-sm text-ink block truncate"
            title={linea.nombre}
          >
            {linea.nombre}
          </span>
          {linea.elecciones && linea.elecciones.length > 0 && (
            <span className="text-xs text-ink-muted italic block mt-0.5 font-sans line-clamp-2">
              {linea.elecciones.map((e) => e.productoNombre).join(' + ')}
              {linea.incluye ? ` (incluye ${linea.incluye})` : ''}
            </span>
          )}
          <span className="text-xs text-ink-muted tabular-nums whitespace-nowrap">
            {linea.cantidad} × S/ {linea.precioUnitario.toFixed(2)}
          </span>
        </div>
        <span className="font-bold text-xs sm:text-sm text-ink tabular-nums whitespace-nowrap">
          S/ {linea.subtotal.toFixed(2)}
        </span>
      </div>

      {/* Alerta de plato agotado en vivo */}
      {tieneError && (
        <div className="mt-1.5 p-1.5 rounded-lg bg-rose-100/80 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-danger" />
          <span>
            {errorLinea || 'Plato marcado como agotado.'}
          </span>
        </div>
      )}

      {/* Observación / Nota del plato */}
      {linea.observacion && (
        <div className="mt-2 text-xs text-amber-950 bg-amber-50/90 px-2.5 py-1 rounded-lg border border-amber-200/80 flex items-center justify-between gap-2">
          <span className="truncate italic font-medium">Nota: "{linea.observacion}"</span>
          <button
            type="button"
            onClick={() => onAbrirNota(linea)}
            className="text-accent font-bold text-xs hover:underline shrink-0 cursor-pointer"
            title="Editar nota del plato"
          >
            Editar
          </button>
        </div>
      )}

      {/* Controles de línea */}
      <div className="mt-2.5 pt-2 border-t border-neutral-200/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onAbrirNota(linea)}
            title={
              linea.observacion
                ? `Editar observación: "${linea.observacion}"`
                : 'Agregar nota de preparación (máx 100 caracteres)'
            }
            className={`${
              esMovil ? 'min-h-[36px]' : ''
            } px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border shadow-2xs ${
              linea.observacion
                ? 'bg-amber-100/80 border-amber-300 text-amber-900 hover:bg-amber-200'
                : 'bg-surface border-amber-300/80 text-accent hover:bg-amber-50 hover:border-accent'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{linea.observacion ? 'Editar Nota' : '+ Nota'}</span>
          </button>

          {linea.menuCompletoId && (
            <button
              type="button"
              onClick={() => onRepetirLinea(index)}
              disabled={linea.cantidad >= 20}
              title="Repetir esta misma combinación de menú completo"
              className={`${
                esMovil ? 'min-h-[36px]' : ''
              } px-2 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-accent border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs font-sans disabled:opacity-40`}
            >
              <Copy className="w-3 h-3" />
              <span>Repetir</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface border border-neutral-200 rounded-lg shadow-2xs">
            <button
              type="button"
              onClick={() => onDisminuirLinea(index)}
              className={`${btnSizeClass} rounded-l-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer active:scale-95`}
              aria-label="Restar una unidad"
              title="Restar una unidad"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <span className="w-7 text-center text-xs font-bold text-ink tabular-nums select-none">
              {linea.cantidad}
            </span>
            <button
              type="button"
              onClick={() => onRepetirLinea(index)}
              disabled={linea.cantidad >= 20}
              className={`${btnSizeClass} rounded-r-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 transition-colors cursor-pointer active:scale-95`}
              aria-label="Sumar una unidad"
              title="Sumar una unidad"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onQuitarLinea(index)}
            className={`${btnSizeClass} rounded-lg border border-neutral-200 bg-surface text-neutral-500 hover:text-danger hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs`}
            title="Quitar línea del pedido"
            aria-label="Quitar línea"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
