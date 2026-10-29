import React, { useEffect, useRef } from 'react';
import { SolesIcon } from '../components/ui/SolesIcon';
import {
  Receipt,
  RotateCcw,
  Search,
  Filter,
  Utensils,
  ShoppingBag,
  CheckCircle2,
  ChefHat,
  AlertCircle,
  Check,
  CreditCard,
  Lock,
  X,
} from 'lucide-react';
import { useCobrosManagement } from '../hooks/useCobrosManagement';
import { AbrirCajaModal } from '../components/caja';
import { CerrarCajaModal } from '../components/caja';
import { CajaStatusBanner } from '../components/caja';
import { CobroModal, TicketComprobanteModal } from '../components/cobros';
import { StatusBadge, DataTable, TableHead, TableBody } from '../components/ui';
import { PageHeader, PageContainer } from '../components/layout';
import type { UserSession } from '../types/auth';

interface CobrosPageProps {
  session: UserSession;
  onLogout: () => void;
  mesaSeleccionadaInicial?: { id: string; nombre: string } | null;
  pedidoIdInicial?: string | null;
  onClearMesaInicial?: () => void;
  onCajaEstadoChange?: () => void;
}

export const CobrosPage: React.FC<CobrosPageProps> = ({
  session,
  onLogout,
  mesaSeleccionadaInicial,
  pedidoIdInicial,
  onClearMesaInicial,
  onCajaEstadoChange,
}) => {
  void onLogout;
  const {
    cajaEstado,
    cajaActual,
    pedidos,
    totalPedidos,
    totalPorCobrar,
    totalListos,
    cargando,
    segundosTranscurridos,
    errorCarga,
    filtroTipo,
    setFiltroTipo,
    busqueda,
    setBusqueda,
    abrirCajaModalOpen,
    setAbrirCajaModalOpen,
    cerrarCajaModalOpen,
    setCerrarCajaModalOpen,
    cobroModalOpen,
    setCobroModalOpen,
    pedidoParaCobro,
    ticketModalOpen,
    setTicketModalOpen,
    comprobanteActual,
    procesandoCobro,
    descargandoTxt,
    cargarDatos,
    handleCajaAbierta,
    handleCierreCompletado,
    handleIniciarCobro,
    handleConfirmarCobro,
    handleDescargarTxt,
    avisoExito,
    avisoError,
    setAvisoError,
  } = useCobrosManagement(session.token, onCajaEstadoChange);

  // Auto-apertura del modal de cobro si se navegó desde Mesas o Pedidos (CUS11)
  const mesaProcesadaRef = useRef<string | null>(null);

  useEffect(() => {
    if (cargando) return;

    const claveSeleccion =
      pedidoIdInicial ||
      (mesaSeleccionadaInicial ? `${mesaSeleccionadaInicial.id}-${mesaSeleccionadaInicial.nombre}` : null);
    if (!claveSeleccion) return;
    if (mesaProcesadaRef.current === claveSeleccion) return;

    if (!cajaEstado?.estaAbierta) {
      mesaProcesadaRef.current = claveSeleccion;
      onClearMesaInicial?.();
      if (cajaEstado?.estadoOperativo === 'anteriorSinCerrar') {
        setCerrarCajaModalOpen(true);
      } else {
        setAbrirCajaModalOpen(true);
      }
      return;
    }

    let pedidoEncontrado: (typeof pedidos)[0] | undefined;

    if (pedidoIdInicial) {
      pedidoEncontrado = pedidos.find((p) => p.pedidoId === pedidoIdInicial);
    } else if (mesaSeleccionadaInicial) {
      const idBuscado = mesaSeleccionadaInicial.id?.trim().toLowerCase();
      const nombreBuscado = mesaSeleccionadaInicial.nombre?.trim().toLowerCase();

      pedidoEncontrado = pedidos.find((p) => {
        if (p.mesaId && idBuscado && p.mesaId.trim().toLowerCase() === idBuscado) {
          return true;
        }
        if (p.mesa && nombreBuscado) {
          const mesaPedido = p.mesa.trim().toLowerCase();
          return (
            mesaPedido === nombreBuscado ||
            mesaPedido.includes(nombreBuscado) ||
            nombreBuscado.includes(mesaPedido)
          );
        }
        return false;
      });
    }

    if (pedidoEncontrado) {
      mesaProcesadaRef.current = claveSeleccion;
      handleIniciarCobro(pedidoEncontrado);
      onClearMesaInicial?.();
    } else if (mesaSeleccionadaInicial) {
      mesaProcesadaRef.current = claveSeleccion;
      setAvisoError(`No se encontró un pedido pendiente de cobro para ${mesaSeleccionadaInicial.nombre}.`);
      onClearMesaInicial?.();
    } else if (pedidoIdInicial) {
      mesaProcesadaRef.current = claveSeleccion;
      setAvisoError('No se encontró el pedido pendiente de cobro seleccionado.');
      onClearMesaInicial?.();
    }
  }, [
    cargando,
    cajaEstado?.estaAbierta,
    cajaEstado?.estadoOperativo,
    pedidos,
    mesaSeleccionadaInicial,
    pedidoIdInicial,
    handleIniciarCobro,
    setAbrirCajaModalOpen,
    setCerrarCajaModalOpen,
    setAvisoError,
    onClearMesaInicial,
  ]);

  const cajaCerrada = !cajaEstado?.estaAbierta;

  return (
    <div className="h-full flex flex-col overflow-hidden w-full">
      <div className="flex-1 overflow-y-auto min-h-0 w-full scroll-thin">
        <PageContainer className="select-none">
      {/* 1. Encabezado Unificado */}
      <PageHeader
        title="Cobro de Pedidos"
        subtitle="Registro de cobros, cálculo de cambio y emisión de comprobantes en tiempo real."
        count={totalPedidos}
        countLabel="pedidos por cobrar"
        badge={
          cajaEstado?.estaAbierta ? (
            <StatusBadge status="Abierta" label={`Caja abierta · ${cajaEstado.cajeroNombre || session.nombre}`} intent="success" />
          ) : cajaEstado?.estadoOperativo === 'anteriorSinCerrar' ? (
            <StatusBadge status="Anterior sin cerrar" label="Caja anterior sin cerrar" intent="danger" />
          ) : (
            <StatusBadge status="Cerrada" label="Caja cerrada" intent="neutral" />
          )
        }
        actions={
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <span className="hidden sm:inline tabular-nums">
                Actualizado hace <span className="font-semibold text-neutral-700">{segundosTranscurridos}</span> s
              </span>
              <button
                type="button"
                onClick={() => cargarDatos(false)}
                disabled={cargando}
                title="Actualizar pedidos ahora"
                aria-label="Actualizar pedidos ahora"
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-surface hover:bg-neutral-50 text-neutral-700 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer min-h-[40px] disabled:opacity-60"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-accent ${cargando ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>

            {session.rol === 'Cajero' && (
              <>
                {cajaEstado?.estadoOperativo === 'abierta' && (
                  <button
                    type="button"
                    onClick={() => setCerrarCajaModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-fill-strong hover:bg-fill-strong-soft text-white text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer min-h-[40px]"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Cerrar caja</span>
                  </button>
                )}

                {cajaEstado?.estadoOperativo === 'anteriorSinCerrar' && (
                  <button
                    type="button"
                    onClick={() => setCerrarCajaModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer min-h-[40px]"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Cerrar caja anterior</span>
                  </button>
                )}

                {cajaEstado?.estadoOperativo === 'sinCaja' && (
                  <button
                    type="button"
                    onClick={() => setAbrirCajaModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer min-h-[40px]"
                  >
                    <SolesIcon className="w-4 h-4" />
                    <span>Abrir caja</span>
                  </button>
                )}
              </>
            )}
          </div>
        }
      />

      {/* Banner de Estado de Caja (CUS 13.1 / CUS 13.2 / MSG-166, MSG-168) */}
      <CajaStatusBanner
        cajaActual={cajaActual}
        estado={cajaEstado?.estadoOperativo}
        apertura={cajaActual?.apertura}
        resumenParcial={cajaActual?.resumenParcial}
        rolUsuario={session.rol}
        onAbrirCaja={() => setAbrirCajaModalOpen(true)}
        onCerrarCaja={() => setCerrarCajaModalOpen(true)}
        loading={cargando}
      />

      {/* 2. Tarjetas KPI / Resumen Rápido (shrink-0) */}
      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-surface rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              Por Cobrar
            </span>
            <span className="text-xl font-bold font-sans tabular-nums text-ink">
              {totalPedidos} {totalPedidos === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-orange-50 text-accent flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-surface rounded-xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              Listos en Cocina
            </span>
            <span className="text-xl font-bold font-sans tabular-nums text-ink">
              {totalListos} listos
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-surface rounded-xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              Monto Pendiente
            </span>
            <span className="text-xl font-bold font-sans tabular-nums text-accent">
              S/ {totalPorCobrar.toFixed(2)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-accent flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Barra de Filtros Fija (shrink-0) */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
        {/* Input de Búsqueda */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar mesa o n.º de pedido..."
            className="w-full pl-8 pr-8 py-2 rounded-xl border border-neutral-200 text-xs text-ink placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors min-h-[38px]"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-600 text-xs font-bold px-1 cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Píldoras de Estado */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-ink-muted flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Estado:
          </span>

          {(['todos', 'mesa', 'llevar', 'listos'] as const).map((tipo) => {
            const activo = filtroTipo === tipo;
            const labels: Record<string, string> = {
              todos: 'Todos',
              mesa: 'Salón',
              llevar: 'Para Llevar',
              listos: 'Listos',
            };
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[38px] ${
                  activo
                    ? 'bg-ink-fill text-white font-semibold shadow-2xs'
                    : 'text-ink-muted hover:bg-neutral-100 hover:text-ink'
                }`}
              >
                {labels[tipo]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Contenedor de Datos con DataTable */}
      <DataTable
        loading={cargando}
        error={errorCarga}
        onRetry={() => cargarDatos(false)}
        isEmpty={pedidos.length === 0}
        emptyTitle="No hay pedidos pendientes de cobro"
        emptyMessage={
          cajaCerrada
            ? 'Abra la caja para consultar y registrar cobros.'
            : busqueda
            ? 'No se encontraron pedidos con ese criterio de búsqueda.'
            : 'Todos los pedidos tomados han sido cobrados o no registran consumos activos.'
        }
        minWidth="min-w-[850px]"
      >
        <TableHead>
          <tr>
            <th scope="col" className="py-3 px-4">N.º Pedido</th>
            <th scope="col" className="py-3 px-4">Destino</th>
            <th scope="col" className="py-3 px-4">Hora</th>
            <th scope="col" className="py-3 px-4">Estado Cocina</th>
            <th scope="col" className="py-3 px-4 text-right">Total a Cobrar</th>
            <th scope="col" className="py-3 px-4 text-center">Acción</th>
          </tr>
        </TableHead>
        <TableBody>
                  {pedidos.map((p) => {
                    const esMesa = p.tipo.toLowerCase() === 'mesa';

                    return (
                      <tr
                        key={p.pedidoId}
                        className={`transition-colors border-b border-line-soft hover:bg-neutral-50/70 ${
                          p.estaListo ? 'bg-emerald-50/25' : ''
                        }`}
                      >
                        {/* N.º Pedido */}
                        <td className="py-3 px-4 font-semibold font-sans tabular-nums text-sm text-ink">
                          #{p.numero}
                        </td>

                        {/* Destino */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {esMesa ? (
                              <Utensils className="w-4 h-4 text-accent" />
                            ) : (
                              <ShoppingBag className="w-4 h-4 text-accent" />
                            )}
                            <span className="font-semibold text-sm text-ink">
                              {esMesa ? p.mesa || 'Mesa' : 'Para Llevar'}
                            </span>
                          </div>
                          {p.referencia && (
                            <span className="text-xs text-stone-500 italic block mt-0.5">
                              Ref: {p.referencia}
                            </span>
                          )}
                        </td>

                        {/* Hora */}
                        <td className="py-3 px-4 text-xs font-sans tabular-nums text-stone-600">
                          {p.hora}
                        </td>

                        {/* Estado Cocina */}
                        <td className="py-3 px-4">
                          {p.estaListo ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Listo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                              <ChefHat className="w-3.5 h-3.5" />
                              En preparación
                            </span>
                          )}
                        </td>

                        {/* Total a Cobrar */}
                        <td className="py-3 px-4 text-right font-sans font-semibold tabular-nums text-sm text-accent">
                          S/ {p.total.toFixed(2)}
                        </td>

                        {/* Acción */}
                        <td className="py-3.5 px-4 text-center">
                          {p.estaListo ? (
                            <button
                              type="button"
                              onClick={() => handleIniciarCobro(p)}
                              title={`Cobrar pedido #${p.numero}`}
                              aria-label={`Cobrar pedido #${p.numero}`}
                              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer mx-auto min-h-[44px]"
                            >
                              <SolesIcon className="w-4 h-4" />
                              <span>Cobrar</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              title="Esperando que cocina termine la preparación"
                              aria-label={`Pedido #${p.numero} en cocina - esperando a cocina`}
                              className="px-3.5 py-2 rounded-xl bg-neutral-100 text-neutral-500 border border-neutral-200 text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed mx-auto min-h-[44px]"
                            >
                              <ChefHat className="w-4 h-4 text-neutral-500" />
                              <span>Esperando a cocina</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
        </TableBody>
      </DataTable>

      {/* Modales */}
      <AbrirCajaModal
        isOpen={abrirCajaModalOpen}
        onClose={() => {
          setAbrirCajaModalOpen(false);
          onClearMesaInicial?.();
        }}
        onCajaAbierta={handleCajaAbierta}
        token={session.token}
        sugerenciaInicial={cajaActual?.sugerenciaMontoInicial ?? null}
      />

      <CerrarCajaModal
        isOpen={cerrarCajaModalOpen}
        onClose={() => {
          setCerrarCajaModalOpen(false);
          onClearMesaInicial?.();
        }}
        onCierreCompletado={handleCierreCompletado}
        token={session.token}
        onCobrarPedido={(pedidoId) => {
          const p = pedidos.find((item) => item.pedidoId === pedidoId);
          if (p) handleIniciarCobro(p);
        }}
      />

      <CobroModal
        isOpen={cobroModalOpen}
        onClose={() => setCobroModalOpen(false)}
        pedido={pedidoParaCobro}
        onConfirmarCobro={handleConfirmarCobro}
        loading={procesandoCobro}
        token={session.token}
      />

      <TicketComprobanteModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        comprobante={comprobanteActual}
        onDescargarTxt={handleDescargarTxt}
        descargando={descargandoTxt}
      />

      {/* Toasts Flotantes */}
      {avisoExito && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-in slide-in-from-bottom-4 fade-in duration-200"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-xs font-semibold tracking-wide">{avisoExito}</span>
        </div>
      )}

      {avisoError && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-6 right-6 z-50 bg-rose-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-rose-500/40 animate-in slide-in-from-bottom-4 fade-in duration-200"
        >
          <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-300">
            <AlertCircle className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold tracking-wide">{avisoError}</span>
          <button
            type="button"
            onClick={() => setAvisoError(null)}
            className="ml-2 text-rose-300 hover:text-white text-base leading-none p-1 cursor-pointer"
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      )}
        </PageContainer>
      </div>
    </div>
  );
};

export default CobrosPage;



