import React, { useState } from 'react';
import {
  ShoppingBag,
  AlertCircle,
  MessageSquare,
  Copy,
  Minus,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui';
import type { LineaBorrador, PedidoResponseDto } from '../../types/pedido';

export interface ResumenPedidoPanelProps {
  titulo: string;
  etiquetaContexto: string;
  modo?: 'nuevo' | 'ampliacion';
  pedidoExistente?: PedidoResponseDto | null;
  lineasBorrador: LineaBorrador[];
  erroresLineas: Record<string, string>;
  notas?: string;
  onNotasChange?: (notas: string) => void;
  cantidadTotalProductos: number;
  totalCalculado: number;
  totalGeneralConExistente?: number;
  registrando: boolean;
  deshabilitarConfirmar?: boolean;
  textoBotonConfirmar?: string;
  textoBotonConfirmarMovil?: string;
  onAbrirNota: (linea: LineaBorrador) => void;
  onRepetirLinea: (index: number) => void;
  onDisminuirLinea: (index: number) => void;
  onQuitarLinea: (index: number) => void;
  onRegistrarPedido: () => void;
}

export const ResumenPedidoPanel: React.FC<ResumenPedidoPanelProps> = ({
  titulo,
  etiquetaContexto,
  modo = 'nuevo',
  pedidoExistente = null,
  lineasBorrador,
  erroresLineas,
  notas = '',
  onNotasChange,
  cantidadTotalProductos,
  totalCalculado,
  totalGeneralConExistente,
  registrando,
  deshabilitarConfirmar = false,
  textoBotonConfirmar,
  textoBotonConfirmarMovil,
  onAbrirNota,
  onRepetirLinea,
  onDisminuirLinea,
  onQuitarLinea,
  onRegistrarPedido,
}) => {
  const [drawerMovilAbierto, setDrawerMovilAbierto] = useState(false);

  const totalFinal =
    modo === 'ampliacion' && typeof totalGeneralConExistente === 'number'
      ? totalGeneralConExistente
      : totalCalculado;

  const botonDeshabilitado =
    registrando ||
    lineasBorrador.length === 0 ||
    deshabilitarConfirmar ||
    lineasBorrador.some((l) => l.agotado);

  const labelConfirmarDesktop =
    textoBotonConfirmar || (modo === 'ampliacion' ? 'AGREGAR AL PEDIDO' : 'REGISTRAR PEDIDO');

  const labelConfirmarMovil =
    textoBotonConfirmarMovil || (modo === 'ampliacion' ? 'AGREGAR' : 'REGISTRAR PEDIDO');

  const renderEstadoVacio = () => (
    <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-neutral-500">
      <div className="w-12 h-12 rounded-2xl bg-canvas dark:bg-surface-raised border border-neutral-200 dark:border-neutral-200/80 flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-3 shadow-2xs">
        <ShoppingBag className="w-6 h-6 stroke-[1.75]" />
      </div>
      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
        Aún no hay productos en el pedido
      </p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-[220px]">
        Toque + en cualquier producto para agregarlo
      </p>
    </div>
  );

  const renderLineas = (esMovil: boolean) =>
    lineasBorrador.map((linea, index) => {
      const tieneError = Boolean(erroresLineas[linea.productoId || ''] || linea.agotado);
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
                {erroresLineas[linea.productoId || ''] || 'Plato marcado como agotado.'}
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
    });

  return (
    <>
      {/* PANEL DERECHO: Resumen del Pedido (Desktop) */}
      <div className="hidden lg:flex w-full lg:w-[300px] xl:w-[360px] 2xl:w-[400px] shrink-0 flex-col min-h-0 bg-surface rounded-2xl border border-neutral-300 dark:border-neutral-200/80 shadow-md overflow-hidden">
        {/* Cabecera del Ticket */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-200/80 bg-brand-tint border-t-4 border-t-primary shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <ShoppingBag className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h3 className="font-sans font-bold text-base text-ink leading-tight">
                  {titulo}
                </h3>
                <p className="text-xs text-ink-muted mt-0.5 tabular-nums">
                  {lineasBorrador.length} items · {cantidadTotalProductos} platos
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface dark:bg-surface-raised text-ink border border-neutral-200 dark:border-neutral-200/80 shrink-0 max-w-[140px] truncate shadow-2xs">
              {etiquetaContexto}
            </span>
          </div>

          {modo === 'ampliacion' && pedidoExistente && (
            <div className="mt-2.5 p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex justify-between items-center">
              <span>Pedido #{pedidoExistente.numero} en curso</span>
              <span className="font-bold tabular-nums">
                Subtotal: S/ {pedidoExistente.total.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Lista de Líneas con Scroll Confinado */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-3 scroll-thin bg-surface">
          {lineasBorrador.length === 0 ? renderEstadoVacio() : renderLineas(false)}
        </div>

        {/* Pie Fijo con Notas, Totales y Botón de Envío */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-200/80 bg-canvas dark:bg-surface-warm/30 shrink-0 space-y-3">
          {modo === 'nuevo' && onNotasChange && (
            <div>
              <label
                htmlFor="notas-pedido-desktop"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Notas generales del pedido (opcional):
              </label>
              <input
                id="notas-pedido-desktop"
                type="text"
                maxLength={100}
                value={notas}
                onChange={(e) => onNotasChange(e.target.value)}
                placeholder="Ej: Servir todo junto, sin cubiertos..."
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-200/80 bg-surface text-ink focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
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
            <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-neutral-200 dark:border-neutral-200/80">
              <span className="text-sm font-bold text-ink uppercase tracking-wide">
                Total a Cobrar
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                S/ {totalFinal.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            disabled={botonDeshabilitado}
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
                <span>{labelConfirmarDesktop}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* BARRA INFERIOR FIJA PARA MÓVILES */}
      <div className="lg:hidden shrink-0 bg-surface border-t border-neutral-200/80 p-3 shadow-lg flex items-center justify-between gap-3">
        <div
          onClick={() => setDrawerMovilAbierto((prev) => !prev)}
          className="flex-1 min-w-0 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-xs font-bold text-accent">
              {cantidadTotalProductos} productos
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-xs text-neutral-500 truncate">{etiquetaContexto}</span>
          </div>
          <div className="text-base font-bold text-ink tabular-nums">
            Total S/ {totalFinal.toFixed(2)}
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          disabled={botonDeshabilitado}
          onClick={onRegistrarPedido}
          className="min-h-[44px] px-5 py-2.5 text-xs font-bold bg-primary hover:bg-primary-hover text-white shadow-md shrink-0 flex items-center gap-1.5"
        >
          {registrando ? (
            <span>Enviando…</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{labelConfirmarMovil}</span>
            </>
          )}
        </Button>
      </div>

      {/* DRAWER MÓVIL PARA VER Y EDITAR LÍNEAS DEL PEDIDO */}
      {drawerMovilAbierto && (
        <div className="lg:hidden fixed inset-0 z-50 bg-fill-strong/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-surface rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-t border-neutral-200 dark:border-neutral-200/80">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-200/80 flex justify-between items-center bg-brand-tint border-t-4 border-t-primary">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-accent" />
                <div>
                  <h3 className="font-sans font-bold text-base text-ink">{titulo}</h3>
                  <p className="text-xs text-ink-muted tabular-nums">
                    {lineasBorrador.length} items · {cantidadTotalProductos} platos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerMovilAbierto(false)}
                aria-label="Cerrar resumen"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 scroll-thin bg-surface">
              {lineasBorrador.length === 0 ? renderEstadoVacio() : renderLineas(true)}
            </div>

            <div className="p-4 border-t border-neutral-200 dark:border-neutral-200/80 bg-canvas dark:bg-surface-warm/30 shrink-0 space-y-3">
              {modo === 'nuevo' && onNotasChange && (
                <div>
                  <label
                    htmlFor="notas-pedido-movil"
                    className="block text-xs font-semibold text-ink-muted mb-1"
                  >
                    Notas generales del pedido (opcional):
                  </label>
                  <input
                    id="notas-pedido-movil"
                    type="text"
                    maxLength={100}
                    value={notas}
                    onChange={(e) => onNotasChange(e.target.value)}
                    placeholder="Ej: Servir todo junto, sin cubiertos..."
                    className="w-full px-3 py-1.5 text-xs bg-surface border border-neutral-200 dark:border-neutral-200/80 rounded-lg text-ink placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                  />
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-neutral-200/80">
                <div>
                  <span className="text-xs font-bold text-ink uppercase tracking-wide block">
                    Total a Cobrar:
                  </span>
                  <span className="font-extrabold text-lg text-emerald-700 dark:text-emerald-400 tabular-nums">
                    S/ {totalFinal.toFixed(2)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setDrawerMovilAbierto(false)}
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

export default ResumenPedidoPanel;
