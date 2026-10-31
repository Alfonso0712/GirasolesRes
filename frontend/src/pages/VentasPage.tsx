import React from 'react';
import { RotateCcw, Check, AlertCircle } from 'lucide-react';
import { useVentasManagement } from '../hooks/useVentasManagement';
import {
  VentaDetalleModal,
  AnularVentaModal,
  VentasKpiResumen,
  VentasFilterBar,
  VentasTable,
} from '../components/ventas';
import { TablePagination } from '../components/ui';
import { PageHeader, PageContainer } from '../components/layout';
import { formatDateIso } from '../utils/formatters';
import type { UserSession } from '../types/auth';

interface VentasPageProps {
  session: UserSession;
  onLogout: () => void;
}

export const VentasPage: React.FC<VentasPageProps> = ({ session, onLogout }) => {
  void onLogout;
  const esAdmin = session.rol === 'Administrador';
  const esCajero = session.rol === 'Cajero';

  const {
    ventas,
    total,
    resumen,
    cargando,
    errorCarga,
    busqueda,
    setBusqueda,
    errorBusqueda,
    filtroTipoComprobante,
    setFiltroTipoComprobante,
    desde,
    setDesde,
    hasta,
    setHasta,
    errorFechas,
    pagina,
    setPagina,
    tamano,
    cargarVentas,
    limpiarFiltros,
    setFiltroRapido,
    detalleModalOpen,
    setDetalleModalOpen,
    cargandoDetalle,
    ventaSeleccionada,
    handleVerDetalle,
    anularModalOpen,
    setAnularModalOpen,
    procesandoAnulacion,
    handleConfirmarAnulacion,
    descargandoTicket,
    handleDescargarComprobante,
    avisoExito,
    avisoError,
    setAvisoError,
  } = useVentasManagement({ token: session.token, esAdmin, esCajero });

  const ventasFiltradas = ventas.filter((v) => {
    if (filtroTipoComprobante === 'todos') return true;
    const serie = v.comprobante.substring(0, 1).toUpperCase();
    if (filtroTipoComprobante === 'ticket') return serie === 'T';
    if (filtroTipoComprobante === 'boleta') return serie === 'B';
    if (filtroTipoComprobante === 'factura') return serie === 'F';
    return true;
  });

  const esFiltroRapidoActivo = (tipo: 'hoy' | 'ayer' | 'semana' | 'mes') => {
    const hoy = new Date();
    const hoyStr = formatDateIso(hoy);
    if (tipo === 'hoy') return desde === hoyStr && hasta === hoyStr;
    if (tipo === 'ayer') {
      const ayer = new Date(hoy);
      ayer.setDate(ayer.getDate() - 1);
      const aStr = formatDateIso(ayer);
      return desde === aStr && hasta === aStr;
    }
    if (tipo === 'semana') {
      const hace7 = new Date(hoy);
      hace7.setDate(hace7.getDate() - 7);
      return desde === formatDateIso(hace7) && hasta === hoyStr;
    }
    if (tipo === 'mes') {
      const hace30 = new Date(hoy);
      hace30.setDate(hace30.getDate() - 30);
      return desde === formatDateIso(hace30) && hasta === hoyStr;
    }
    return false;
  };

  const totalPaginas = Math.max(1, Math.ceil(total / tamano));
  const tieneFiltrosActivos = Boolean(
    busqueda.trim() ||
      errorFechas ||
      errorBusqueda ||
      filtroTipoComprobante !== 'todos' ||
      desde ||
      hasta
  );

  return (
    <div className="flex-1 overflow-y-auto w-full [scrollbar-width:thin]">
      <PageContainer>
        {/* 1. Encabezado Fijo del Módulo */}
        <PageHeader
          title="Historial de Ventas"
          subtitle="Auditoría de tickets, boletas, facturas emitidas y anulaciones con recálculo automático."
          count={total}
          countLabel="ventas registradas"
          actions={
            <button
              type="button"
              onClick={() => cargarVentas()}
              disabled={cargando}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-surface hover:bg-neutral-50 text-neutral-700 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer min-h-[40px] disabled:opacity-60"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-accent ${cargando ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          }
        />

        {/* 2. Tarjetas de Resumen KPI */}
        <VentasKpiResumen resumen={resumen} />

        {/* 3. Barra de Filtros y Búsqueda */}
        <VentasFilterBar
          filtroTipoComprobante={filtroTipoComprobante}
          setFiltroTipoComprobante={setFiltroTipoComprobante}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          desde={desde}
          setDesde={setDesde}
          hasta={hasta}
          setHasta={setHasta}
          esAdmin={esAdmin}
          setFiltroRapido={setFiltroRapido}
          esFiltroRapidoActivo={esFiltroRapidoActivo}
          tieneFiltrosActivos={tieneFiltrosActivos}
          limpiarFiltros={limpiarFiltros}
          errorFechas={errorFechas}
        />

        {/* 4. Tabla de Ventas con DataTable */}
        <VentasTable
          ventas={ventasFiltradas}
          cargando={cargando}
          errorCarga={errorCarga}
          onRetry={() => cargarVentas()}
          tieneFiltrosActivos={tieneFiltrosActivos}
          onLimpiarFiltros={limpiarFiltros}
          onVerDetalle={handleVerDetalle}
        />

        {/* 5. Paginación Unificada */}
        <TablePagination
          currentPage={pagina}
          totalPages={totalPaginas}
          totalItems={total}
          itemsPerPage={tamano}
          entityName="ventas"
          onPageChange={setPagina}
        />

        {/* Modal CUS12.1: Detalle de Venta */}
        <VentaDetalleModal
          isOpen={detalleModalOpen}
          onClose={() => setDetalleModalOpen(false)}
          venta={ventaSeleccionada}
          loading={cargandoDetalle}
          esAdmin={esAdmin}
          onAbrirAnular={() => setAnularModalOpen(true)}
          onDescargarTicket={handleDescargarComprobante}
          descargandoTicket={descargandoTicket}
        />

        {/* Modal CUS12.2 / Vista 12.3: Diálogo de Anulación */}
        <AnularVentaModal
          isOpen={anularModalOpen}
          onClose={() => setAnularModalOpen(false)}
          venta={ventaSeleccionada}
          onConfirmar={handleConfirmarAnulacion}
          loading={procesandoAnulacion}
        />

        {/* Aviso Flotante Toast de Éxito */}
        {avisoExito && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-in slide-in-from-bottom-4 fade-in duration-200"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-xs font-semibold tracking-wide">{avisoExito}</span>
          </div>
        )}

        {/* Aviso Flotante Toast de Error */}
        {avisoError && (
          <div
            role="alert"
            aria-live="assertive"
            className="fixed bottom-6 right-6 z-50 bg-rose-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-rose-500/40 animate-in slide-in-from-bottom-4 fade-in duration-200"
          >
            <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-300 shrink-0">
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
  );
};

export default VentasPage;
