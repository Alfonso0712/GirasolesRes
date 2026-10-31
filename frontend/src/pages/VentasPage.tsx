import React from 'react';
import { SolesIcon } from '../components/ui/SolesIcon';
import {
  RotateCcw,
  Eye,
  Check,
  ShoppingBag,
  Utensils,
  Smartphone,
  AlertCircle,
} from 'lucide-react';
import { useVentasManagement } from '../hooks/useVentasManagement';
import {
  VentaDetalleModal,
  AnularVentaModal,
  VentasKpiResumen,
  VentasFilterBar,
} from '../components/ventas';
import {
  StatusBadge,
  IconActionButton,
  TablePagination,
  DataTable,
  TableHead,
  TableBody,
} from '../components/ui';
import { PageHeader, PageContainer } from '../components/layout';
import { formatCurrency, formatDateIso } from '../utils/formatters';
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
  const tieneFiltrosActivos = Boolean(busqueda.trim() || errorFechas || errorBusqueda || filtroTipoComprobante !== 'todos' || desde || hasta);

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
        <DataTable
          loading={cargando}
          error={errorCarga}
          onRetry={() => cargarVentas()}
          isEmpty={ventasFiltradas.length === 0}
          emptyTitle="No se encontraron ventas"
          emptyMessage={
            tieneFiltrosActivos
              ? 'No hay registros que coincidan con los filtros aplicados. Pruebe con otra fecha, tipo o número de comprobante.'
              : 'Aún no se han registrado ventas en el sistema.'
          }
          emptyActionLabel={tieneFiltrosActivos ? 'Quitar filtros' : undefined}
          onEmptyAction={tieneFiltrosActivos ? limpiarFiltros : undefined}
          minWidth="min-w-[900px]"
        >
          <TableHead>
            <tr>
              <th scope="col" className="py-3.5 px-4">Comprobante</th>
              <th scope="col" className="py-3.5 px-4">Fecha y hora</th>
              <th scope="col" className="py-3.5 px-4">Pedido</th>
              <th scope="col" className="py-3.5 px-4">Destino</th>
              <th scope="col" className="py-3.5 px-4">Método</th>
              <th scope="col" className="py-3.5 px-4 text-right">Total</th>
              <th scope="col" className="py-3.5 px-4 w-36">Cajero(a)</th>
              <th scope="col" className="py-3.5 px-4 text-center">Estado</th>
              <th scope="col" className="py-3.5 px-4 text-center">Acciones</th>
            </tr>
          </TableHead>
          <TableBody>
                  {ventasFiltradas.map((v) => {
                    const esAnulada = v.estado === 'Anulada';
                    return (
                      <tr
                        key={v.ventaId}
                        className={`transition-colors border-b border-line-soft ${
                          esAnulada
                            ? 'bg-stone-50 hover:bg-stone-100/70 text-stone-700'
                            : 'hover:bg-neutral-50/70 bg-surface text-neutral-800'
                        }`}
                      >
                        {/* Comprobante */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-0.5 items-start">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-1.5 py-0.5 text-xs font-semibold rounded uppercase tracking-wider ${
                                  v.comprobante.startsWith('F')
                                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                    : v.comprobante.startsWith('B')
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                                }`}
                              >
                                {v.comprobante.startsWith('F') ? 'Factura' : v.comprobante.startsWith('B') ? 'Boleta' : 'Ticket'}
                              </span>
                              <span className={`tabular-nums font-semibold text-sm ${esAnulada ? 'text-stone-700' : 'text-ink'}`}>
                                {v.comprobante}
                              </span>
                            </div>
                            {(v.clienteDocumento || v.clienteNombre) && (
                              <span className="text-xs text-stone-500 truncate max-w-[170px]" title={`${v.clienteDocumento ? v.clienteDocumento + ' - ' : ''}${v.clienteNombre || ''}`}>
                                {v.clienteDocumento ? `${v.clienteDocumento} · ` : ''}{v.clienteNombre || ''}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Fecha y Hora */}
                        <td className="py-3 px-4 tabular-nums text-xs text-stone-600 whitespace-nowrap">
                          {v.fechaHoraFormateada}
                        </td>

                        {/* Pedido N.º */}
                        <td className="py-3 px-4 tabular-nums font-semibold text-sm text-ink">
                          #{v.pedidoNumero}
                        </td>

                        {/* Destino (Mesa o Llevar) */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                            {v.tipo === 'Para Llevar' ? (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                <span className="truncate max-w-[120px]" title={v.referencia || 'Para Llevar'}>
                                  {v.referencia ? `Llevar (${v.referencia})` : 'Para Llevar'}
                                </span>
                              </>
                            ) : (
                              <>
                                <Utensils className="w-3.5 h-3.5 text-info shrink-0" />
                                <span>{v.mesa || 'Salón'}</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Método de Pago */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg inline-flex items-center gap-1 border ${
                              v.metodo === 'Efectivo'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-purple-50 text-purple-800 border-purple-200'
                            }`}
                          >
                            {v.metodo === 'Efectivo' ? (
                              <SolesIcon className="w-3 h-3 text-emerald-700" />
                            ) : (
                              <Smartphone className="w-3 h-3 text-purple-700" />
                            )}
                            <span>{v.metodo}</span>
                          </span>
                        </td>

                        {/* Total con alto contraste WCAG AA */}
                        <td className="py-3 px-4 text-right tabular-nums font-semibold text-sm whitespace-nowrap">
                          <span className={esAnulada ? 'text-stone-700 font-semibold' : 'text-ink'}>
                            {formatCurrency(v.total)}
                          </span>
                        </td>

                        {/* Cajero */}
                        <td className="py-3 px-4 text-sm font-medium text-ink truncate max-w-36 w-36" title={v.cajero}>
                          {v.cajero}
                        </td>

                        {/* Estado con StatusBadge */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <StatusBadge
                            status={v.estado}
                            intent={esAnulada ? 'danger' : 'success'}
                          />
                        </td>

                        {/* Acción Ver Detalle con IconActionButton */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <IconActionButton
                            icon={Eye}
                            label="Ver detalle de la venta"
                            variant="view"
                            onClick={() => handleVerDetalle(v.ventaId)}
                          />
                        </td>
                      </tr>
                    );
                  })}
          </TableBody>
        </DataTable>

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
