import React from 'react';
import {
  Receipt,
  Filter,
  RotateCcw,
  Search,
  Calendar,
  Eye,
  DollarSign,
  Smartphone,
  AlertCircle,
  Check,
  ShoppingBag,
  Utensils,
  Ban,
} from 'lucide-react';
import { useVentasManagement } from '../hooks/useVentasManagement';
import { VentaDetalleModal } from '../components/ventas';
import { AnularVentaModal } from '../components/ventas';
import {
  StatusBadge,
  IconActionButton,
  TablePagination,
  DataTable,
  TableHead,
  TableBody,
} from '../components/ui';
import { PageHeader, PageContainer } from '../components/layout';
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
    const format = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const hoy = new Date();
    const hoyStr = format(hoy);
    if (tipo === 'hoy') return desde === hoyStr && hasta === hoyStr;
    if (tipo === 'ayer') {
      const ayer = new Date(hoy);
      ayer.setDate(ayer.getDate() - 1);
      const aStr = format(ayer);
      return desde === aStr && hasta === aStr;
    }
    if (tipo === 'semana') {
      const hace7 = new Date(hoy);
      hace7.setDate(hace7.getDate() - 7);
      return desde === format(hace7) && hasta === hoyStr;
    }
    if (tipo === 'mes') {
      const hace30 = new Date(hoy);
      hace30.setDate(hace30.getDate() - 30);
      return desde === format(hace30) && hasta === hoyStr;
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* KPI 1: Ventas Vigentes */}
          <div className="bg-surface rounded-2xl border border-neutral-200/90 p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-accent flex items-center justify-center shrink-0 border border-amber-200">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                Ventas vigentes
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-sans font-bold text-2xl text-ink tabular-nums">
                  {resumen.vigentes}
                </span>
                <span className="text-xs text-neutral-500 font-medium">ventas</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Total Vigente (Recaudado) */}
          <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200/80 p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                Total vigente
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xs font-semibold text-emerald-800">S/</span>
                <span className="font-sans font-bold text-2xl text-emerald-950 tabular-nums">
                  {resumen.totalVigente.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* KPI 3: Desglose Efectivo vs Yape */}
          <div className="bg-surface rounded-2xl border border-neutral-200/90 p-4 shadow-2xs flex items-center justify-between gap-2">
            <div className="flex-1 border-r border-neutral-100 pr-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                <span>Efectivo</span>
              </span>
              <span className="font-sans font-bold text-base sm:text-lg text-ink tabular-nums block mt-0.5">
                S/ {resumen.efectivo.toFixed(2)}
              </span>
            </div>
            <div className="flex-1 pl-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                <span>Yape</span>
              </span>
              <span className="font-sans font-bold text-base sm:text-lg text-purple-900 tabular-nums block mt-0.5">
                S/ {resumen.yape.toFixed(2)}
              </span>
            </div>
          </div>

          {/* KPI 4: Ventas Anuladas */}
          <div className="bg-neutral-50/80 rounded-2xl border border-neutral-200/90 p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-200/70 text-neutral-600 flex items-center justify-center shrink-0 border border-neutral-300">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                Anuladas (no suman)
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-sans font-bold text-2xl text-neutral-700 tabular-nums">
                  {resumen.anuladas}
                </span>
                <span className="text-xs text-neutral-500 font-medium">anuladas</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Barra de Filtros y Búsqueda */}
        <div className="bg-surface p-4 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
          {/* Filtro por Tipo de Comprobante */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2.5 border-b border-neutral-100">
            <span className="text-xs font-semibold text-neutral-600 flex items-center gap-1 mr-1 select-none">
              <Filter className="w-3.5 h-3.5" />
              Comprobante:
            </span>
            {(['todos', 'ticket', 'boleta', 'factura'] as const).map((tipo) => {
              const activo = filtroTipoComprobante === tipo;
              const labels: Record<string, string> = {
                todos: 'Todos',
                ticket: 'Tickets',
                boleta: 'Boletas',
                factura: 'Facturas',
              };
              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setFiltroTipoComprobante(tipo)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[36px] ${
                    activo
                      ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                  }`}
                >
                  {labels[tipo]}
                </button>
              );
            })}
          </div>

          {/* Búsqueda y Fechas */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por comprobante, cliente o RUC..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-neutral-50/50 hover:bg-surface focus:bg-surface border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[40px] transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="filtro-desde-v" className="text-xs font-semibold text-neutral-600 flex items-center gap-1 select-none">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  Desde:
                </label>
                <input
                  id="filtro-desde-v"
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-surface border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[40px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="filtro-hasta-v" className="text-xs font-semibold text-neutral-600 flex items-center gap-1 select-none">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  Hasta:
                </label>
                <input
                  id="filtro-hasta-v"
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-surface border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[40px]"
                />
              </div>

              {/* Chips rápidos */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFiltroRapido('hoy')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[38px] ${
                    esFiltroRapidoActivo('hoy')
                      ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                  }`}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroRapido('ayer')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[38px] ${
                    esFiltroRapidoActivo('ayer')
                      ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                  }`}
                >
                  Ayer
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroRapido('semana')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[38px] ${
                    esFiltroRapidoActivo('semana')
                      ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                  }`}
                >
                  7 días
                </button>
                {esAdmin && (
                  <button
                    type="button"
                    onClick={() => setFiltroRapido('mes')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer min-h-[38px] ${
                      esFiltroRapidoActivo('mes')
                        ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                        : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    }`}
                  >
                    30 días
                  </button>
                )}
              </div>

              {tieneFiltrosActivos && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="px-2.5 py-1.5 text-xs font-semibold text-accent hover:text-accent hover:bg-amber-50 rounded-xl transition-colors cursor-pointer ml-auto sm:ml-0"
                >
                  Quitar filtros
                </button>
              )}
            </div>
          </div>

          {errorFechas && (
            <p className="text-xs text-danger font-medium flex items-center gap-1.5 pt-1 border-t border-neutral-100">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorFechas}</span>
            </p>
          )}
        </div>

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
                              <DollarSign className="w-3 h-3 text-emerald-700" />
                            ) : (
                              <Smartphone className="w-3 h-3 text-purple-700" />
                            )}
                            <span>{v.metodo}</span>
                          </span>
                        </td>

                        {/* Total con alto contraste WCAG AA */}
                        <td className="py-3 px-4 text-right tabular-nums font-semibold text-sm whitespace-nowrap">
                          <span className={esAnulada ? 'text-stone-700 font-semibold' : 'text-ink'}>
                            S/ {v.total.toFixed(2)}
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
