import React from 'react';
import {
  ShoppingBag,
  AlertCircle,
  MessageSquare,
  Copy,
  Minus,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../ui';
import type { MesaItem } from '../../types/mesa';
import type { LineaBorrador, PedidoResponseDto } from '../../types/pedido';

interface PedidoTicketSidebarProps {
  modo: 'nuevo' | 'ampliacion';
  mesaSeleccionada: MesaItem | null;
  pedidoExistente: PedidoResponseDto | null;
  lineasBorrador: LineaBorrador[];
  erroresLineas: Record<string, string>;
  notas: string;
  onNotasChange: (notas: string) => void;
  cantidadTotalProductos: number;
  totalCalculado: number;
  totalGeneralConExistente: number;
  registrando: boolean;
  onAbrirNota: (linea: LineaBorrador) => void;
  onRepetirLinea: (index: number) => void;
  onDisminuirLinea: (index: number) => void;
  onQuitarLinea: (index: number) => void;
  onRegistrarPedido: () => void;
}

export const PedidoTicketSidebar: React.FC<PedidoTicketSidebarProps> = ({
  modo,
  mesaSeleccionada,
  pedidoExistente,
  lineasBorrador,
  erroresLineas,
  notas,
  onNotasChange,
  cantidadTotalProductos,
  totalCalculado,
  totalGeneralConExistente,
  registrando,
  onAbrirNota,
  onRepetirLinea,
  onDisminuirLinea,
  onQuitarLinea,
  onRegistrarPedido
}) => {
  return (
    <div className="hidden lg:flex w-full lg:w-[340px] xl:w-[380px] 2xl:w-[420px] shrink-0 flex-col min-h-0 bg-surface rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
      {/* Cabecera del Ticket */}
      <div className="p-4 border-b border-neutral-200/80 bg-canvas shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <h3 className="font-sans font-bold text-base text-ink">
              {modo === 'ampliacion' ? 'Ampliación de Pedido' : 'Pedido de Mesa'}
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-ink border border-amber-200/80">
            {mesaSeleccionada?.nombre || 'Sin Mesa'}
          </span>
        </div>

        {/* Aviso de modo ampliación con datos anteriores */}
        {modo === 'ampliacion' && pedidoExistente && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex justify-between items-center">
            <span>Pedido #{pedidoExistente.numero} en curso</span>
            <span className="font-bold tabular-nums">Subtotal: S/ {pedidoExistente.total.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Lista de Líneas con Scroll Confinado */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-3 scroll-thin">
        {lineasBorrador.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
            <ShoppingBag className="w-10 h-10 stroke-[1.5] text-neutral-300 mb-2" />
            <p className="text-xs font-medium text-neutral-500">
              No hay productos en el pedido
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Toque el botón + de cualquier producto del catálogo para agregarlo.
            </p>
          </div>
        ) : (
          lineasBorrador.map((linea, index) => {
            const tieneError = Boolean(erroresLineas[linea.productoId || ''] || linea.agotado);

            return (
              <div
                key={`${linea.productoId || linea.menuCompletoId}-${linea.observacion}-${index}`}
                className={`p-3 rounded-xl border transition-all ${
                  tieneError
                    ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs'
                    : 'bg-canvas border-neutral-200 hover:border-neutral-300 shadow-2xs'
                }`}
              >
                {/* Fila 1: Nombre del plato y Subtotal */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-xs sm:text-sm text-ink block truncate" title={linea.nombre}>
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
                    <span>{erroresLineas[linea.productoId || ''] || 'Plato marcado como agotado.'}</span>
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

                {/* Controles de línea: Botón "+ Nota" a la izquierda y Controles de Cantidad (+/-) a la derecha */}
                <div className="mt-2.5 pt-2 border-t border-neutral-200/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onAbrirNota(linea)}
                      title={linea.observacion ? `Editar observación: "${linea.observacion}"` : 'Agregar nota de preparación (máx 100 caracteres)'}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border shadow-2xs ${
                        linea.observacion
                          ? 'bg-amber-100/80 border-amber-300 text-amber-900 hover:bg-amber-200'
                          : 'bg-surface border-amber-300/80 text-accent hover:bg-amber-50 hover:border-accent'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{linea.observacion ? 'Editar Nota' : '+ Nota'}</span>
                    </button>

                    {/* Botón Repetir (RV-165) para Menús Completos */}
                    {linea.menuCompletoId && (
                      <button
                        type="button"
                        onClick={() => onRepetirLinea(index)}
                        disabled={linea.cantidad >= 20}
                        title="Repetir esta misma combinación de menú completo"
                        className="px-2 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-accent border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs font-sans disabled:opacity-40"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Repetir</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Control de cantidad rápido + / - */}
                    <div className="flex items-center bg-surface border border-neutral-200 rounded-lg shadow-2xs">
                      <button
                        type="button"
                        onClick={() => onDisminuirLinea(index)}
                        className="w-7 h-7 rounded-l-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer active:scale-95"
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
                        className="w-7 h-7 rounded-r-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 transition-colors cursor-pointer active:scale-95"
                        aria-label="Sumar una unidad"
                        title="Sumar una unidad"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Botón Quitar */}
                    <button
                      type="button"
                      onClick={() => onQuitarLinea(index)}
                      className="w-7 h-7 rounded-lg border border-neutral-200 bg-surface text-neutral-500 hover:text-danger hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                      title="Quitar línea del pedido"
                      aria-label="Quitar línea"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pie Fijo con Total y Botón de Envío */}
      <div className="p-4 border-t border-neutral-200/80 bg-canvas shrink-0 space-y-3">
        {/* Notas generales del pedido (opcional, máx 100 caracteres - RN-35 / RV-67) */}
        {modo === 'nuevo' && (
          <div>
            <label htmlFor="notas-pedido-desktop" className="block text-xs font-semibold text-ink-muted mb-1">
              Notas generales del pedido (opcional):
            </label>
            <input
              id="notas-pedido-desktop"
              type="text"
              maxLength={100}
              value={notas}
              onChange={(e) => onNotasChange(e.target.value)}
              placeholder="Ej: Servir todo junto, sin cubiertos..."
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-surface focus:outline-none focus:ring-1 focus:ring-accent text-ink"
            />
          </div>
        )}

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-ink-muted">
            <span>Productos nuevos ({cantidadTotalProductos})</span>
            <span className="tabular-nums font-semibold">S/ {totalCalculado.toFixed(2)}</span>
          </div>
          {modo === 'ampliacion' && pedidoExistente && (
            <div className="flex justify-between text-xs text-ink-muted">
              <span>Consumo anterior</span>
              <span className="tabular-nums">S/ {pedidoExistente.total.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-ink pt-1 border-t border-neutral-200">
            <span>Total a Cobrar</span>
            <span className="text-emerald-700 tabular-nums">
              S/ {totalGeneralConExistente.toFixed(2)}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          disabled={
            registrando ||
            lineasBorrador.length === 0 ||
            !mesaSeleccionada ||
            lineasBorrador.some((l) => l.agotado)
          }
          onClick={onRegistrarPedido}
          className="w-full min-h-[44px] py-3 text-sm font-bold bg-primary hover:bg-primary-hover text-white shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {registrando ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Registrando…</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{modo === 'ampliacion' ? 'AGREGAR AL PEDIDO' : 'REGISTRAR PEDIDO'}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
