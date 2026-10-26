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
import type { LineaBorrador } from '../../types/pedido';

interface PedidoMobileDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  modo: 'nuevo' | 'ampliacion';
  mesaSeleccionada: MesaItem | null;
  cantidadTotalProductos: number;
  totalCalculado: number;
  totalGeneralConExistente: number;
  registrando: boolean;
  lineasBorrador: LineaBorrador[];
  erroresLineas: Record<string, string>;
  notas: string;
  onNotasChange: (notas: string) => void;
  onAbrirNota: (linea: LineaBorrador) => void;
  onRepetirLinea: (index: number) => void;
  onDisminuirLinea: (index: number) => void;
  onQuitarLinea: (index: number) => void;
  onRegistrarPedido: () => void;
}

export const PedidoMobileDrawer: React.FC<PedidoMobileDrawerProps> = ({
  isOpen,
  onOpenChange,
  modo,
  mesaSeleccionada,
  cantidadTotalProductos,
  totalCalculado,
  totalGeneralConExistente,
  registrando,
  lineasBorrador,
  erroresLineas,
  notas,
  onNotasChange,
  onAbrirNota,
  onRepetirLinea,
  onDisminuirLinea,
  onQuitarLinea,
  onRegistrarPedido
}) => {
  return (
    <>
      {/* BARRA INFERIOR FIJA PARA MÓVILES (BOTTOM SHEET / FOOTER) */}
      <div className="lg:hidden shrink-0 bg-surface border-t border-neutral-200/80 p-3 shadow-lg flex items-center justify-between gap-3">
        <div
          onClick={() => onOpenChange(!isOpen)}
          className="flex-1 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-accent">
              {cantidadTotalProductos} productos
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-xs text-neutral-500">
              {mesaSeleccionada?.nombre || 'Sin mesa'}
            </span>
          </div>
          <div className="text-base font-bold text-ink tabular-nums">
            Total S/ {totalGeneralConExistente.toFixed(2)}
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
          className="min-h-[44px] px-5 py-2.5 text-xs font-bold bg-primary hover:bg-primary-hover text-white shadow-md shrink-0 flex items-center gap-1.5"
        >
          {registrando ? (
            <span>Enviando…</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{modo === 'ampliacion' ? 'AGREGAR' : 'REGISTRAR'}</span>
            </>
          )}
        </Button>
      </div>

      {/* MODAL / DRAWER MÓVIL PARA VER Y EDITAR LÍNEAS DEL PEDIDO */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-fill-strong/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-surface rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-neutral-100 flex justify-between items-center bg-canvas">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-accent" />
                <h3 className="font-sans font-bold text-base text-ink">
                  Detalle del Pedido ({lineasBorrador.length})
                </h3>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-700"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {lineasBorrador.map((linea, idx) => {
                const tieneError = Boolean(erroresLineas[linea.productoId || ''] || linea.agotado);
                return (
                  <div
                    key={`${linea.productoId}-${linea.observacion}-${idx}`}
                    className={`p-3 rounded-xl border transition-all ${
                      tieneError
                        ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs'
                        : 'bg-canvas border-neutral-200 shadow-2xs'
                    }`}
                  >
                    {/* Fila 1: Nombre del plato y Subtotal */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs sm:text-sm text-ink block truncate">
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

                    {/* Alerta de plato agotado */}
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
                          className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border shadow-2xs ${
                            linea.observacion
                              ? 'bg-amber-100/80 border-amber-300 text-amber-900'
                              : 'bg-surface border-amber-300/80 text-accent'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{linea.observacion ? 'Editar Nota' : '+ Nota'}</span>
                        </button>

                        {/* Botón Repetir (RV-165) */}
                        {linea.menuCompletoId && (
                          <button
                            type="button"
                            onClick={() => onRepetirLinea(idx)}
                            disabled={linea.cantidad >= 20}
                            title="Repetir esta misma combinación de menú completo"
                            className="min-h-[36px] px-2 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-accent border border-amber-200 flex items-center gap-1 shadow-2xs font-sans disabled:opacity-40"
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
                            onClick={() => onDisminuirLinea(idx)}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-neutral-600 hover:bg-neutral-100 active:scale-95"
                            aria-label="Restar una unidad"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-ink tabular-nums select-none">
                            {linea.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRepetirLinea(idx)}
                            disabled={linea.cantidad >= 20}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 active:scale-95"
                            aria-label="Sumar una unidad"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onQuitarLinea(idx)}
                          className="min-h-[36px] min-w-[36px] rounded-lg border border-neutral-200 bg-surface text-danger hover:bg-rose-50 flex items-center justify-center active:scale-95"
                          title="Quitar línea del pedido"
                          aria-label="Quitar línea"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-neutral-200/80 bg-canvas shrink-0 space-y-3">
              {modo === 'nuevo' && (
                <div>
                  <label htmlFor="notas-pedido-movil" className="block text-xs font-semibold text-ink-muted mb-1">
                    Notas generales del pedido (opcional):
                  </label>
                  <input
                    id="notas-pedido-movil"
                    type="text"
                    maxLength={100}
                    value={notas}
                    onChange={(e) => onNotasChange(e.target.value)}
                    placeholder="Ej: Servir todo junto, sin cubiertos..."
                    className="w-full px-3 py-1.5 text-xs bg-surface border border-neutral-200 rounded-lg text-ink placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                  />
                  <div className="flex justify-between items-center text-xs text-neutral-500 mt-0.5">
                    <span>Anotaciones para cocina/salón</span>
                    <span className="tabular-nums">{notas.length}/100</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-1">
                <div>
                  <span className="text-xs text-ink-muted block">Total Pedido:</span>
                  <span className="font-bold text-base text-ink tabular-nums">
                    S/ {totalCalculado.toFixed(2)}
                  </span>
                </div>
                <Button
                  variant="primary"
                  onClick={() => onOpenChange(false)}
                  className="bg-sidebar hover:bg-[#341b0b] text-white text-xs px-5 py-2.5 min-h-[44px]"
                >
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
