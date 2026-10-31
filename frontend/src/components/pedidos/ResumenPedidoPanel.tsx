import React, { useState } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui';
import type { LineaBorrador, PedidoResponseDto } from '../../types/pedido';
import {
  PedidoLineaCard,
  ResumenPedidoFooter,
  ResumenPedidoMobileDrawer,
} from './resumen-pedido';

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
    lineasBorrador.map((linea, index) => (
      <PedidoLineaCard
        key={`${linea.productoId || linea.menuCompletoId}-${linea.observacion}-${index}`}
        linea={linea}
        index={index}
        esMovil={esMovil}
        errorLinea={erroresLineas[linea.productoId || '']}
        onAbrirNota={onAbrirNota}
        onRepetirLinea={onRepetirLinea}
        onDisminuirLinea={onDisminuirLinea}
        onQuitarLinea={onQuitarLinea}
      />
    ));

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
        <ResumenPedidoFooter
          modo={modo}
          pedidoExistente={pedidoExistente}
          notas={notas}
          onNotasChange={onNotasChange}
          cantidadTotalProductos={cantidadTotalProductos}
          totalCalculado={totalCalculado}
          totalFinal={totalFinal}
          botonDeshabilitado={botonDeshabilitado}
          registrando={registrando}
          labelConfirmarDesktop={labelConfirmarDesktop}
          onRegistrarPedido={onRegistrarPedido}
        />
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
      <ResumenPedidoMobileDrawer
        isOpen={drawerMovilAbierto}
        onClose={() => setDrawerMovilAbierto(false)}
        titulo={titulo}
        lineasBorrador={lineasBorrador}
        cantidadTotalProductos={cantidadTotalProductos}
        totalFinal={totalFinal}
        modo={modo}
        notas={notas}
        onNotasChange={onNotasChange}
      >
        {lineasBorrador.length === 0 ? renderEstadoVacio() : renderLineas(true)}
      </ResumenPedidoMobileDrawer>
    </>
  );
};

export default ResumenPedidoPanel;
