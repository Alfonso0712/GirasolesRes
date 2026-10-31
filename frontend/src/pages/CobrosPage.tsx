import React, { useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { useCobrosManagement } from '../hooks/useCobrosManagement';
import { CajaStatusBanner } from '../components/caja';
import {
  CobrosKpiCards,
  CobrosFilterBar,
  CobrosTable,
  CobrosModals,
  CobrosToasts,
  CobrosCajaActionButton,
} from '../components/cobros';
import { StatusBadge } from '../components/ui';
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

                <CobrosCajaActionButton
                  rol={session.rol}
                  estadoOperativo={cajaEstado?.estadoOperativo}
                  onAbrirCaja={() => setAbrirCajaModalOpen(true)}
                  onCerrarCaja={() => setCerrarCajaModalOpen(true)}
                />
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
          <CobrosKpiCards
            totalPedidos={totalPedidos}
            totalListos={totalListos}
            totalPorCobrar={totalPorCobrar}
          />

          {/* 3. Barra de Filtros Fija (shrink-0) */}
          <CobrosFilterBar
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            filtroTipo={filtroTipo}
            onFiltroTipoChange={setFiltroTipo}
          />

          {/* 4. Contenedor de Datos con DataTable */}
          <CobrosTable
            pedidos={pedidos}
            cargando={cargando}
            errorCarga={errorCarga}
            onRetry={() => cargarDatos(false)}
            cajaCerrada={cajaCerrada}
            busqueda={busqueda}
            onIniciarCobro={handleIniciarCobro}
          />

          {/* Modales */}
          <CobrosModals
            abrirCajaModalOpen={abrirCajaModalOpen}
            onCloseAbrirCaja={() => {
              setAbrirCajaModalOpen(false);
              onClearMesaInicial?.();
            }}
            onCajaAbierta={handleCajaAbierta}
            token={session.token}
            sugerenciaInicial={cajaActual?.sugerenciaMontoInicial ?? null}
            cerrarCajaModalOpen={cerrarCajaModalOpen}
            onCloseCerrarCaja={() => {
              setCerrarCajaModalOpen(false);
              onClearMesaInicial?.();
            }}
            onCierreCompletado={handleCierreCompletado}
            pedidos={pedidos}
            onIniciarCobro={handleIniciarCobro}
            cobroModalOpen={cobroModalOpen}
            onCloseCobro={() => setCobroModalOpen(false)}
            pedidoParaCobro={pedidoParaCobro}
            onConfirmarCobro={handleConfirmarCobro}
            procesandoCobro={procesandoCobro}
            ticketModalOpen={ticketModalOpen}
            onCloseTicket={() => setTicketModalOpen(false)}
            comprobanteActual={comprobanteActual}
            onDescargarTxt={handleDescargarTxt}
            descargandoTxt={descargandoTxt}
          />

          {/* Toasts Flotantes */}
          <CobrosToasts
            avisoExito={avisoExito}
            avisoError={avisoError}
            onClearAvisoError={() => setAvisoError(null)}
          />
        </PageContainer>
      </div>
    </div>
  );
};

export default CobrosPage;
