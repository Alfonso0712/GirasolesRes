import React from 'react';
import {
  Receipt,
  RotateCcw,
  Search,
  Calendar,
  Eye,
  Ban,
  CheckCircle2,
  DollarSign,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  X,
  ShoppingBag,
  Utensils
} from 'lucide-react';
import { useVentasManagement } from '../hooks/useVentasManagement';
import { VentaDetalleModal } from '../components/VentaDetalleModal';
import { AnularVentaModal } from '../components/AnularVentaModal';
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
    segundosTranscurridos,
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
    setAvisoError
  } = useVentasManagement({ token: session.token, esAdmin, esCajero });

  const ventasFiltradas = ventas.filter((v) => {
    if (filtroTipoComprobante === 'todos') return true;
    const serie = v.comprobante.substring(0, 1).toUpperCase();
    if (filtroTipoComprobante === 'ticket') return serie === 'T';
    if (filtroTipoComprobante === 'boleta') return serie === 'B';
    if (filtroTipoComprobante === 'factura') return serie === 'F';
    return true;
  });

  const totalPaginas = Math.max(1, Math.ceil(total / tamano));
  const tieneFiltrosActivos = Boolean(busqueda.trim() || errorFechas || errorBusqueda || filtroTipoComprobante !== 'todos');

  return (
    <div className="flex-1 overflow-y-auto w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pt-3 pb-8 flex flex-col gap-4 select-none">
      {/* 1. Encabezado Fijo del Módulo libre sobre fondo (shrink-0) */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#D35400] mb-1">
            GESTIÓN DE VENTAS
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-brand-serif font-bold text-[#482813] tracking-tight">
              Historial de Ventas
            </h1>

            {/* Pastilla de estado de rol idéntica a Mesas y Cobros */}
            <div className="px-3.5 py-1 bg-amber-50/80 rounded-full border border-amber-200/80 text-xs font-semibold text-[#2C1A0E] flex items-center gap-2 shadow-2xs">
              <span className="inline-flex items-center gap-1.5 text-neutral-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Consultas y comprobantes · {session.rol}
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Registro histórico de ventas, consulta de comprobantes, reimpresión de copias y anulación autorizada.
          </p>
        </div>

        {/* Contador RNF y Botón Actualizar */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs text-neutral-500 tabular-nums">
            Actualizado hace <span className="font-semibold text-neutral-700">{segundosTranscurridos}</span> s
          </span>
          <button
            type="button"
            onClick={() => cargarVentas()}
            title="Actualizar lista de ventas"
            aria-label="Actualizar lista de ventas"
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#D35400] ${cargando ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* 2. Tarjetas de Resumen KPI (RV-110, RN-100) */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Ventas Vigentes */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-3.5 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D35400] flex items-center justify-center shrink-0 border border-amber-200">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              VENTAS VIGENTES
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-sans font-bold text-2xl text-[#2C1A0E] tabular-nums">
                {resumen.vigentes}
              </span>
              <span className="text-xs text-neutral-500 font-medium">ventas</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Vigente (Recaudado) */}
        <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200/80 p-3.5 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              TOTAL VIGENTE
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xs font-semibold text-emerald-800">S/</span>
              <span className="font-sans font-bold text-2xl text-emerald-900 tabular-nums">
                {resumen.totalVigente.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Desglose Efectivo vs Yape */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-3.5 shadow-2xs flex items-center justify-between gap-2">
          <div className="flex-1 border-r border-neutral-100 pr-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-700" />
              <span>EFECTIVO</span>
            </span>
            <span className="font-sans font-bold text-base sm:text-lg text-[#2C1A0E] tabular-nums block mt-0.5">
              S/ {resumen.efectivo.toFixed(2)}
            </span>
          </div>
          <div className="flex-1 pl-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-purple-600" />
              <span>YAPE</span>
            </span>
            <span className="font-sans font-bold text-base sm:text-lg text-purple-900 tabular-nums block mt-0.5">
              S/ {resumen.yape.toFixed(2)}
            </span>
          </div>
        </div>

        {/* KPI 4: Ventas Anuladas */}
        <div className="bg-neutral-50/80 rounded-2xl border border-neutral-200/80 p-3.5 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-200/70 text-neutral-500 flex items-center justify-center shrink-0 border border-neutral-300">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              ANULADAS (NO SUMAN)
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-sans font-bold text-2xl text-neutral-600 tabular-nums">
                {resumen.anuladas}
              </span>
              <span className="text-xs text-neutral-400 font-medium">anuladas</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Barra de Filtros y Búsqueda (RV-108, RV-109, RV-118) */}
      <div className="shrink-0 bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-3">
        {/* Filtro por Tipo de Comprobante */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-neutral-100">
          <span className="text-xs font-semibold text-[#7C6F66] mr-1">Comprobante:</span>
          {(['todos', 'ticket', 'boleta', 'factura'] as const).map((tipo) => {
            const activo = filtroTipoComprobante === tipo;
            const labels: Record<string, string> = {
              todos: 'Todos',
              ticket: 'Tickets (T001)',
              boleta: 'Boletas (B001)',
              factura: 'Facturas (F001)',
            };
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => setFiltroTipoComprobante(tipo)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[30px] ${
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

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Campo Buscar Comprobante, DNI, RUC o Cliente */}
          <div className="flex-1 min-w-[260px]">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busqueda}
                maxLength={50}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por comprobante (T001, B001, F001), DNI, RUC o cliente..."
                className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                  errorBusqueda
                    ? 'border-rose-400 focus:ring-rose-200 text-rose-900'
                    : 'border-neutral-200 focus:border-[#D35400] focus:ring-amber-200'
                }`}
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {errorBusqueda && (
              <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorBusqueda}</span>
              </p>
            )}
          </div>

          {/* Filtros de Fecha (Desde - Hasta) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-semibold text-[11px]">Desde:</span>
              <input
                type="date"
                value={desde}
                onChange={(e) => {
                  setDesde(e.target.value);
                  setPagina(1);
                }}
                className="px-2 py-1.5 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-none focus:border-[#D35400]"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <span className="font-semibold text-[11px]">Hasta:</span>
              <input
                type="date"
                value={hasta}
                onChange={(e) => {
                  setHasta(e.target.value);
                  setPagina(1);
                }}
                className="px-2 py-1.5 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-none focus:border-[#D35400]"
              />
            </div>

            {/* Accesos rápidos de fecha */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFiltroRapido('hoy')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => setFiltroRapido('ayer')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
              >
                Ayer
              </button>
              <button
                type="button"
                onClick={() => setFiltroRapido('semana')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
              >
                7 días
              </button>
              {esAdmin && (
                <button
                  type="button"
                  onClick={() => setFiltroRapido('mes')}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer hidden sm:inline-block"
                >
                  30 días
                </button>
              )}
            </div>

            {/* Quitar filtros */}
            {tieneFiltrosActivos && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="px-2.5 py-1.5 text-xs font-semibold text-[#D35400] hover:text-[#B84600] hover:bg-amber-50 rounded-lg transition-colors cursor-pointer ml-auto sm:ml-0"
              >
                Quitar filtros
              </button>
            )}
          </div>
        </div>

        {/* Mensaje de error de rango de fechas (MSG-157, MSG-158, MSG-159) */}
        {errorFechas && (
          <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1.5 pt-1 border-t border-neutral-100">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorFechas}</span>
          </p>
        )}
      </div>

      {/* 4. Lista / Tabla de Ventas: Fluye con el scroll principal */}
      <div className="w-full bg-white rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col overflow-hidden">
        {cargando ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2.5 text-neutral-500 py-16">
            <span className="w-8 h-8 border-3 border-[#D35400]/20 border-t-[#D35400] rounded-full animate-spin" />
            <p className="text-xs font-medium tracking-wide">Cargando ventas…</p>
          </div>
        ) : errorCarga ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-rose-900 mb-1">{errorCarga}</p>
            <p className="text-xs text-neutral-500 mb-4">Verifique su conexión o intente nuevamente.</p>
            <button
              type="button"
              onClick={() => cargarVentas()}
              className="px-4 py-2 text-xs font-bold text-white bg-[#D35400] hover:bg-[#B84600] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        ) : ventasFiltradas.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D35400] flex items-center justify-center mb-3 border border-amber-200">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#2C1A0E] mb-1">
              {tieneFiltrosActivos
                ? 'No se encontraron ventas con ese criterio.'
                : 'Todavía no hay ventas registradas hoy.'}
            </p>
            <p className="text-xs text-neutral-400 max-w-sm mb-4">
              {tieneFiltrosActivos
                ? 'Pruebe con otra fecha, tipo o número de comprobante.'
                : 'Las ventas cobradas en caja se listarán automáticamente aquí.'}
            </p>
            {tieneFiltrosActivos && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
              >
                Quitar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-neutral-100/80 backdrop-blur-xs text-neutral-600 uppercase font-semibold text-[11px] border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Comprobante</th>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Pedido</th>
                  <th className="py-3 px-4">Destino</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4">Cajero(a)</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {ventasFiltradas.map((v) => {
                  const esAnulada = v.estado === 'Anulada';
                  return (
                    <tr
                      key={v.ventaId}
                      className={`transition-colors hover:bg-neutral-50/70 ${
                        esAnulada ? 'bg-neutral-50/60 opacity-65 text-neutral-500' : 'bg-white text-neutral-800'
                      }`}
                    >
                      {/* Comprobante */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5 items-start">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                                v.comprobante.startsWith('F')
                                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                  : v.comprobante.startsWith('B')
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                              }`}
                            >
                              {v.comprobante.startsWith('F') ? 'Factura' : v.comprobante.startsWith('B') ? 'Boleta' : 'Ticket'}
                            </span>
                            <span className={`font-mono font-bold text-xs ${esAnulada ? 'text-neutral-500 line-through' : 'text-[#2C1A0E]'}`}>
                              {v.comprobante}
                            </span>
                          </div>
                          {(v.clienteDocumento || v.clienteNombre) && (
                            <span className="text-[10px] text-neutral-500 truncate max-w-[170px]" title={`${v.clienteDocumento ? v.clienteDocumento + ' - ' : ''}${v.clienteNombre || ''}`}>
                              {v.clienteDocumento ? `${v.clienteDocumento} · ` : ''}{v.clienteNombre || ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Fecha y Hora */}
                      <td className="py-3 px-4 tabular-nums text-neutral-600 whitespace-nowrap">
                        {v.fechaHoraFormateada}
                      </td>

                      {/* Pedido N.º */}
                      <td className="py-3 px-4 tabular-nums font-semibold text-neutral-700">
                        #{v.pedidoNumero}
                      </td>

                      {/* Destino (Mesa o Llevar) */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          {v.tipo === 'Para Llevar' ? (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                              <span className="truncate max-w-[120px]" title={v.referencia || 'Para Llevar'}>
                                {v.referencia ? `Llevar (${v.referencia})` : 'Para Llevar'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Utensils className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{v.mesa || 'Salón'}</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Método de Pago */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 text-[11px] font-semibold rounded-md inline-flex items-center gap-1 border ${
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

                      {/* Total */}
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-sm whitespace-nowrap">
                        <span className={esAnulada ? 'line-through text-neutral-400' : 'text-[#2C1A0E]'}>
                          S/ {v.total.toFixed(2)}
                        </span>
                      </td>

                      {/* Cajero */}
                      <td className="py-3 px-4 text-neutral-600 truncate max-w-[110px]" title={v.cajero}>
                        {v.cajero}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg border inline-flex items-center gap-1 shadow-2xs ${
                            esAnulada
                              ? 'bg-neutral-200/70 text-neutral-600 border-neutral-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          {esAnulada ? <Ban className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                          <span>{v.estado}</span>
                        </span>
                      </td>

                      {/* Acción Ver Detalle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleVerDetalle(v.ventaId)}
                          title={`Ver detalle de venta ${v.comprobante}`}
                          aria-label={`Ver detalle de venta ${v.comprobante}`}
                          className="h-8 px-2.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#D35400]" />
                          <span>Detalle</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Barra de Paginación inferior (20 en 20) */}
        {!cargando && ventasFiltradas.length > 0 && (
          <div className="shrink-0 px-4 py-2.5 border-t border-neutral-200/80 bg-neutral-50/70 flex items-center justify-between gap-3 text-xs text-neutral-600">
            <span className="tabular-nums">
              Mostrando <span className="font-semibold text-neutral-800">{ventasFiltradas.length}</span> de{' '}
              <span className="font-semibold text-neutral-800">{total}</span> ventas registradas
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pagina <= 1}
                onClick={() => setPagina(pagina - 1)}
                className={`p-1.5 rounded-lg border shadow-2xs transition-colors ${
                  pagina <= 1
                    ? 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-60'
                    : 'border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 cursor-pointer'
                }`}
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 text-xs font-semibold text-neutral-700 tabular-nums">
                Página {pagina} de {totalPaginas}
              </span>

              <button
                type="button"
                disabled={pagina >= totalPaginas}
                onClick={() => setPagina(pagina + 1)}
                className={`p-1.5 rounded-lg border shadow-2xs transition-colors ${
                  pagina >= totalPaginas
                    ? 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-60'
                    : 'border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 cursor-pointer'
                }`}
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

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

      {/* Aviso Flotante Toast de Éxito (4 segundos, MSG-162) */}
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
      </div>
    </div>
  );
};
