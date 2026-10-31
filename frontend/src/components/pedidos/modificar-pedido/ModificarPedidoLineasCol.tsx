import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { LineaBorrador } from '../../../types/pedido';

export interface ModificarPedidoLineasColProps {
  lineas: LineaBorrador[];
  onCambiarCantidad: (index: number, delta: number) => void;
  onCambiarObservacion: (index: number, obs: string) => void;
  onEliminarLinea: (index: number) => void;
  totalCalculado: number;
}

export const ModificarPedidoLineasCol: React.FC<ModificarPedidoLineasColProps> = ({
  lineas,
  onCambiarCantidad,
  onCambiarObservacion,
  onEliminarLinea,
  totalCalculado,
}) => {
  return (
    <div className="flex flex-col border border-neutral-200 rounded-2xl p-4 bg-neutral-50/50 min-h-0 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Líneas del Pedido ({lineas.length})
        </span>
        <span className="text-xs text-neutral-500 tabular-nums">
          Límite 1 a 20 por ítem
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {lineas.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No quedan productos en el pedido. Para quitar todos, debe anular el pedido.
          </div>
        ) : (
          lineas.map((l, index) => (
            <div
              key={`${l.productoId}-${index}`}
              className="p-3 bg-surface rounded-xl border border-neutral-200 shadow-xs flex flex-col gap-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-sm text-neutral-900">{l.nombre}</div>
                  <div className="text-xs text-neutral-500 tabular-nums">
                    S/ {l.precioUnitario.toFixed(2)} c/u
                  </div>
                </div>

                {/* Control Cantidad */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onCambiarCantidad(index, -1)}
                    disabled={l.cantidad <= 1}
                    className="w-7 h-7 rounded-lg border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center font-bold text-sm text-neutral-800">
                    {l.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => onCambiarCantidad(index, 1)}
                    disabled={l.cantidad >= 20}
                    className="w-7 h-7 rounded-lg border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onEliminarLinea(index)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 ml-1 transition-colors cursor-pointer"
                    aria-label={`Eliminar ${l.nombre}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Observación por línea */}
              <div>
                <input
                  type="text"
                  value={l.observacion}
                  onChange={(e) => onCambiarObservacion(index, e.target.value)}
                  maxLength={100}
                  placeholder="Nota (ej. sin sal, presa pierna)…"
                  className="w-full text-xs p-2 rounded-lg border border-neutral-200 focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total al pie de columna */}
      <div className="pt-3 border-t border-neutral-200 flex justify-between items-center mt-2">
        <span className="text-xs font-semibold text-neutral-600">Nuevo Total:</span>
        <span className="text-xl font-bold tabular-nums text-accent">
          S/ {totalCalculado.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
