import React, { useEffect, useRef } from 'react';
import {
  DollarSign,
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
} from 'lucide-react';
import { useCobrosManagement } from '../hooks/useCobrosManagement';
import { AbrirCajaModal } from '../components/caja/AbrirCajaModal';
import { CerrarCajaModal } from '../components/caja/CerrarCajaModal';
import { CajaStatusBanner } from '../components/caja/CajaStatusBanner';
import { CobroModal } from '../components/CobroModal';
import { TicketComprobanteModal } from '../components/TicketComprobanteModal';
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
    <div className="flex-1 overflow-y-auto w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pt-2 sm:pt-2.5 pb-8 flex flex-col gap-2.5 sm:gap-3 select-none">
      {/* 1. Encabezado Fijo del Módulo (Single-Row Action Header) */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-4 mb-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-[#2C1A0E]">
            Cobro de Pedidos
          </h1>

          {/* Resumen de estado de caja integrado en pastilla */}
          {cajaEstado?.estaAbierta ? (
            <div className="px-3.5 py-1 bg-amber-50/80 rounded-full border border-amber-200/80 text-xs font-semibold text-[#2C1A0E] flex items-center gap-2 shadow-2xs">
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Caja abierta · {cajaEstado.cajeroNombre || session.nombre}
              </span>
            </div>
          ) : cajaEstado?.estadoOperativo === 'anteriorSinCerrar' ? (
            <div className="px-3.5 py-1 bg-rose-50 rounded-full border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2 shadow-2xs">
              <span className="inline-flex items-center gap-1.5 text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Caja anterior sin cerrar
              </span>
            </div>
          ) : (
            <div className="px-3.5 py-1 bg-amber-50/80 rounded-full border border-amber-200/80 text-xs font-semibold text-[#2C1A0E] flex items-center gap-2 shadow-2xs">
              <span className="inline-flex items-center gap-1.5 text-[#B84600]">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Caja cerrada
              </span>
            </div>
          )}
        </div>

        {/* Sincronización y Botones de Acción */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-[#7C6F66]">
            <span className="hidden sm:inline font-mono">
              Actualizado hace {segundosTranscurridos} s
            </span>
            <button
              type="button"
              onClick={() => cargarDatos(false)}
              disabled={cargando}
              title="Actualizar pedidos ahora"
              aria-label="Actualizar pedidos ahora"
              className="w-8 h-8 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-2xs inline-flex items-center justify-center transition-colors cursor-pointer disabled:opacity-60"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin text-[#D35400]' : ''}`} />
            </button>
          </div>

          {session.rol === 'Cajero' && (
            <>
              {cajaEstado?.estadoOperativo === 'abierta' && (
                <button
                  type="button"
                  onClick={() => setCerrarCajaModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#C0392B] hover:bg-[#962D22] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer min-h-[44px]"
                >
                  <Lock className="w-4 h-4" />
                  <span>Cerrar caja</span>
                </button>
              )}

              {cajaEstado?.estadoOperativo === 'anteriorSinCerrar' && (
                <button
                  type="button"
                  onClick={() => setCerrarCajaModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#C0392B] hover:bg-[#962D22] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer min-h-[44px]"
                >
                  <Lock className="w-4 h-4" />
                  <span>Cerrar caja anterior</span>
                </button>
              )}

              {cajaEstado?.estadoOperativo === 'sinCaja' && (
                <button
                  type="button"
                  onClick={() => setAbrirCajaModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer min-h-[44px]"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Abrir caja</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

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
        <div className="p-3.5 bg-white rounded-xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Por Cobrar
            </span>
            <span className="text-xl font-bold font-sans tabular-nums text-[#2C1A0E]">
              {totalPedidos} {totalPedidos === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-orange-50 text-[#D35400] flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Listos en Cocina
            </span>
            <span className="text-xl font-bold font-sans tabular-nums text-[#2C1A0E]">
              {totalListos} listos
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Monto Pendiente
            </span>
            <span className="text-xl font-bold font-sans tabular-nums text-[#D35400]">
              S/ {totalPorCobrar.toFixed(2)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-[#D35400] flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Barra de Filtros Fija (shrink-0) */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2.5 bg-white px-3.5 py-2 rounded-xl border border-neutral-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-[#7C6F66] flex items-center gap-1 mr-1">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[36px] ${
                  activo
                    ? 'bg-[#2C1A0E] text-white font-semibold shadow-2xs'
                    : 'text-[#7C6F66] hover:bg-neutral-100 hover:text-[#2C1A0E]'
                }`}
              >
                {labels[tipo]}
              </button>
            );
          })}
        </div>

        {/* Input de Búsqueda */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar mesa o n.º de pedido..."
            className="w-full pl-8 pr-7 py-2 rounded-lg border border-neutral-200 text-xs text-[#2C1A0E] placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-[#D35400] focus:border-[#D35400] transition-colors"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs font-bold px-1 cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* 4. Contenedor de Datos: Fluye con el scroll principal */}
      <div className="w-full bg-white border border-neutral-200/80 rounded-2xl shadow-2xs overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center">
            <RotateCcw className="w-8 h-8 text-[#D35400] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-600">
              Cargando pedidos pendientes de cobro...
            </p>
          </div>
        ) : errorCarga ? (
          <div className="p-8 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-800 mb-1">Error al cargar datos</h3>
            <p className="text-xs text-neutral-500 mb-4">{errorCarga}</p>
            <button
              type="button"
              onClick={() => cargarDatos(false)}
              className="px-4 py-2 bg-[#D35400] text-white rounded-xl text-xs font-semibold hover:bg-[#B84600] transition-colors cursor-pointer min-h-[44px]"
            >
              Reintentar
            </button>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="p-12 text-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#D35400] flex items-center justify-center mx-auto mb-3 border border-amber-200/60">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-sans font-bold text-lg text-[#2C1A0E] mb-1">
              No hay pedidos pendientes de cobro
            </h3>
            <p className="text-xs text-neutral-500">
              {cajaCerrada
                ? 'Abra la caja para consultar y registrar cobros.'
                : busqueda
                ? 'No se encontraron pedidos con ese criterio de búsqueda.'
                : 'Todos los pedidos tomados han sido cobrados o no registran consumos activos.'}
            </p>
          </div>
        ) : (
          <>
            {/* Tabla Desktop (>= lg) */}
            <div className="hidden lg:block">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-neutral-50/90 text-[#7C6F66] font-semibold text-xs uppercase tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">N.º Pedido</th>
                    <th className="py-3 px-4">Destino</th>
                    <th className="py-3 px-4">Hora</th>
                    <th className="py-3 px-4">Estado Cocina</th>
                    <th className="py-3 px-4 text-right">Total a Cobrar</th>
                    <th className="py-3 px-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {pedidos.map((p) => {
                    const esMesa = p.tipo.toLowerCase() === 'mesa';

                    return (
                      <tr
                        key={p.pedidoId}
                        className={`transition-colors hover:bg-neutral-50/70 ${
                          p.estaListo ? 'bg-emerald-50/25' : ''
                        }`}
                      >
                        {/* N.º Pedido */}
                        <td className="py-3.5 px-4 font-bold font-sans tabular-nums text-[#2C1A0E]">
                          #{p.numero}
                        </td>

                        {/* Destino */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {esMesa ? (
                              <Utensils className="w-4 h-4 text-[#D35400]" />
                            ) : (
                              <ShoppingBag className="w-4 h-4 text-[#D35400]" />
                            )}
                            <span className="font-semibold text-neutral-900">
                              {esMesa ? p.mesa || 'Mesa' : 'Para Llevar'}
                            </span>
                          </div>
                          {p.referencia && (
                            <span className="text-xs text-neutral-400 italic block mt-0.5">
                              Ref: {p.referencia}
                            </span>
                          )}
                        </td>

                        {/* Hora */}
                        <td className="py-3.5 px-4 text-xs font-sans tabular-nums text-[#7C6F66]">
                          {p.hora}
                        </td>

                        {/* Estado Cocina */}
                        <td className="py-3.5 px-4">
                          {p.estaListo ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                              <CheckCircle2 className="w-3 h-3" />
                              Listo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <ChefHat className="w-3 h-3" />
                              En preparación
                            </span>
                          )}
                        </td>

                        {/* Total a Cobrar */}
                        <td className="py-3.5 px-4 text-right font-sans font-bold tabular-nums text-base text-[#D35400]">
                          S/ {p.total.toFixed(2)}
                        </td>

                        {/* Acción */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleIniciarCobro(p)}
                            title={`Cobrar pedido #${p.numero}`}
                            aria-label={`Cobrar pedido #${p.numero}`}
                            className="px-4 py-2 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer mx-auto min-h-[44px]"
                          >
                            <DollarSign className="w-4 h-4" />
                            <span>Cobrar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tarjetas Móviles (< lg) */}
            <div className="lg:hidden p-3 space-y-3">
              {pedidos.map((p) => {
                const esMesa = p.tipo.toLowerCase() === 'mesa';

                return (
                  <div
                    key={p.pedidoId}
                    className={`p-4 rounded-xl border border-neutral-200/90 shadow-2xs flex flex-col gap-3 ${
                      p.estaListo ? 'bg-emerald-50/20 border-emerald-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {esMesa ? (
                          <Utensils className="w-4 h-4 text-[#D35400]" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-[#D35400]" />
                        )}
                        <span className="font-bold text-neutral-900">
                          {esMesa ? p.mesa || 'Mesa' : 'Para Llevar'}
                        </span>
                        <span className="text-xs font-sans tabular-nums font-bold text-neutral-500">
                          #{p.numero}
                        </span>
                      </div>

                      {p.estaListo ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                          <CheckCircle2 className="w-3 h-3" />
                          Listo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <ChefHat className="w-3 h-3" />
                          En preparación
                        </span>
                      )}
                    </div>

                    {p.referencia && (
                      <p className="text-xs text-neutral-500 italic">
                        Referencia: {p.referencia}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                          Total
                        </span>
                        <span className="text-lg font-bold font-sans tabular-nums text-[#D35400]">
                          S/ {p.total.toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleIniciarCobro(p)}
                        className="px-4 py-2 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer min-h-[44px]"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Cobrar pedido</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

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
      </div>
    </div>
  );
};

export default CobrosPage;
