import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  Calendar,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Smartphone,
  Utensils,
  Receipt,
  Check,
  UtensilsCrossed
} from 'lucide-react';
import { useReportesManagement } from '../hooks/useReportesManagement';
import type { UserSession } from '../types/auth';
import type { TipoAtajoFecha, CriterioOrdenPlatos } from '../types/reporte';
import { CATEGORIA_LABELS, CATEGORIA_BADGE_LABELS } from '../types/producto';

interface ReportesPageProps {
  session: UserSession;
  onLogout: () => void;
  onNavigateToCierres?: () => void;
}

export const ReportesPage: React.FC<ReportesPageProps> = ({
  session,
  onLogout,
  onNavigateToCierres
}) => {
  const {
    tabActiva,
    cambiarTab,
    desde,
    setDesde,
    hasta,
    setHasta,
    atajoActivo,
    aplicarAtajo,
    productoFiltroId,
    setProductoFiltroId,
    ordenPlatos,
    setOrdenPlatos,
    errorRango,
    filtrosCambiados,
    cargando,
    errorCarga,
    descargando,
    avisoExito,
    setAvisoExito,
    reporteVentas,
    reportePlatos,
    platosOrdenados,
    productosDisponibles,
    consultar,
    descargar
  } = useReportesManagement(session.token, onLogout);

  const atajos: { id: TipoAtajoFecha; label: string }[] = [
    { id: 'hoy', label: 'Hoy' },
    { id: 'ayer', label: 'Ayer' },
    { id: 'ultimos7', label: 'Últimos 7 días' },
    { id: 'esteMes', label: 'Este mes' },
    { id: 'mesAnterior', label: 'Mes anterior' }
  ];

  return (
    <div className="flex-1 overflow-y-auto w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pt-2 sm:pt-2.5 pb-8 flex flex-col gap-2.5 sm:gap-3 select-none">
      {/* 1. Encabezado Fijo del Módulo */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#2C1A0E]">
              Reportes del Restaurante
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
              Exportación y métricas
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Consulte el volumen de platos vendidos y el balance general de ventas en el período.
          </p>
        </div>

        {/* Acciones de Exportación (Desktop / Tablet) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => descargar('pdf')}
            disabled={cargando || descargando !== null || Boolean(errorRango)}
            className="w-auto px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shadow-2xs inline-flex items-center gap-2 min-h-[38px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Descargar reporte en formato PDF (A4)"
            aria-label="Descargar PDF"
          >
            <FileText className="w-4 h-4 text-[#D35400]" />
            <span>{descargando === 'pdf' ? 'Preparando archivo…' : 'Descargar PDF'}</span>
          </button>

          <button
            type="button"
            onClick={() => descargar('csv')}
            disabled={cargando || descargando !== null || Boolean(errorRango)}
            className="w-auto px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold shadow-2xs inline-flex items-center gap-2 min-h-[38px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Descargar reporte en formato Excel (CSV UTF-8)"
            aria-label="Descargar Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>{descargando === 'csv' ? 'Preparando archivo…' : 'Descargar Excel'}</span>
          </button>
        </div>
      </div>

      {/* 2. Pestañas de Navegación del CUS14 (Platos vendidos primero por ser Must, Ventas segundo) */}
      <div className="shrink-0 flex items-center gap-2 border-b border-neutral-200/80 pb-1">
        <button
          type="button"
          onClick={() => cambiarTab('platos')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer ${
            tabActiva === 'platos'
              ? 'bg-[#D35400] text-white shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Platos Vendidos</span>
        </button>

        <button
          type="button"
          onClick={() => cambiarTab('ventas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer ${
            tabActiva === 'ventas'
              ? 'bg-[#D35400] text-white shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Reporte de Ventas</span>
        </button>
      </div>

      {/* 3. Barra de Filtros, Rango y Atajos Rápidos */}
      <div className="shrink-0 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col gap-3">
        {/* Atajos Rápidos de Rango */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-[#7C6F66] flex items-center gap-1 mr-1">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" /> Atajos:
          </span>
          {atajos.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => aplicarAtajo(a.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                atajoActivo === a.id
                  ? 'bg-[#2C1A0E] text-white font-semibold shadow-2xs'
                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200/60'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Formulario de Filtros de Fecha y Producto */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="fecha-desde" className="text-xs font-semibold text-neutral-600">
              Desde:
            </label>
            <input
              id="fecha-desde"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-medium text-neutral-800 focus:outline-none focus:border-[#D35400] focus:ring-1 focus:ring-[#D35400] min-h-[38px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="fecha-hasta" className="text-xs font-semibold text-neutral-600">
              Hasta:
            </label>
            <input
              id="fecha-hasta"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-medium text-neutral-800 focus:outline-none focus:border-[#D35400] focus:ring-1 focus:ring-[#D35400] min-h-[38px]"
            />
          </div>

          {/* Filtro Opcional de Producto (Solo en pestaña Platos Vendidos) */}
          {tabActiva === 'platos' && (
            <div className="flex items-center gap-2">
              <label htmlFor="filtro-producto" className="text-xs font-semibold text-neutral-600">
                Plato / Producto:
              </label>
              <select
                id="filtro-producto"
                value={productoFiltroId}
                onChange={(e) => setProductoFiltroId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-medium text-neutral-800 focus:outline-none focus:border-[#D35400] focus:ring-1 focus:ring-[#D35400] min-h-[38px] max-w-[200px]"
              >
                <option value="">Todos los productos</option>
                {productosDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {!p.activo ? '(inactivo)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botón Principal CONSULTAR */}
          <button
            type="button"
            onClick={() => consultar()}
            disabled={cargando || Boolean(errorRango)}
            className="px-5 py-2 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white font-semibold text-xs shadow-xs inline-flex items-center gap-2 min-h-[38px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cargando ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Consultando…</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>CONSULTAR</span>
              </>
            )}
          </button>

          {/* Aviso de Filtros Cambiados (RV-141 / MSG-196) */}
          {filtrosCambiados && !cargando && !errorRango && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Los filtros cambiaron. Pulse CONSULTAR para actualizar el reporte.</span>
            </div>
          )}
        </div>

        {/* Error de validación de fechas (MSG-190, MSG-191) */}
        {errorRango && (
          <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorRango}</span>
          </p>
        )}
      </div>

      {/* 4. Banner de Error de Carga con Botón Reintentar (MSG-194 / MSG-195) */}
      {errorCarga && (
        <div className="shrink-0 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorCarga}</span>
          </div>
          <button
            type="button"
            onClick={() => consultar()}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* 5. Contenedor de Contenido Principal sin confinamiento */}
      <div className="w-full space-y-4">
        {/* ========================================================================= */}
        {/* PESTAÑA: PLATOS VENDIDOS (CUS14.2 / HU38 / RF-38 / Vistas 14.2 y 14.3)    */}
        {/* ========================================================================= */}
        {tabActiva === 'platos' && (
          <>
            {/* Indicador de Cuadre con Ventas (RV-140 / RN-120 / MSG-197 / MSG-198) */}
            {reportePlatos && (
              <div
                className={`p-4 rounded-2xl border shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors ${
                  reportePlatos.coincide
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/90 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  {reportePlatos.coincide ? (
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide opacity-80">
                      Estado de Cuadre de Platos con Ventas
                    </p>
                    <p className="text-sm font-semibold mt-0.5">
                      {reportePlatos.coincide
                        ? `Cuadra con ventas: el monto de los platos coincide con el total vendido (S/ ${reportePlatos.totalVentas.toFixed(2)}).`
                        : `El monto de los platos (S/ ${reportePlatos.totalMonto.toFixed(2)}) no coincide con el total vendido (S/ ${reportePlatos.totalVentas.toFixed(2)}). Diferencia: S/ ${Math.abs(reportePlatos.totalMonto - reportePlatos.totalVentas).toFixed(2)}. Informe al equipo técnico.`}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:self-auto shrink-0 pl-12 sm:pl-0">
                  <span className="text-xs text-neutral-500 font-sans block">Total Platos / Ventas</span>
                  <span className="font-sans font-bold tabular-nums text-sm text-[#2C1A0E]">
                    S/ {reportePlatos.totalMonto.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Tarjetas Resumen Principales de Platos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Total Platos Vendidos
                </span>
                <span className="font-sans font-bold text-2xl sm:text-3xl text-[#2C1A0E] tabular-nums mt-1">
                  {reportePlatos ? reportePlatos.totalPlatos : '0'}
                </span>
                <span className="text-xs text-neutral-400 mt-1">Suma de raciones servidas</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Monto Total de Platos
                </span>
                <span className="font-sans font-bold text-2xl sm:text-3xl text-[#D35400] tabular-nums mt-1">
                  S/ {reportePlatos ? reportePlatos.totalMonto.toFixed(2) : '0.00'}
                </span>
                <span className="text-xs text-neutral-400 mt-1">Calculado por precio en comanda</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Total en Ventas Registradas
                </span>
                <span className="font-sans font-bold text-2xl sm:text-3xl text-neutral-800 tabular-nums mt-1">
                  S/ {reportePlatos ? reportePlatos.totalVentas.toFixed(2) : '0.00'}
                </span>
                <span className="text-xs text-neutral-400 mt-1">Ventas vigentes del período</span>
              </div>
            </div>

            {/* Subtotales por Categoría (RV-138 / Desayuno, Almuerzo, Otro) */}
            {reportePlatos?.subtotales && reportePlatos.subtotales.length > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                  Subtotales por Categoría
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {reportePlatos.subtotales.map((sub) => (
                    <div
                      key={sub.categoria}
                      className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-200/70 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-[#482813] block">
                          {CATEGORIA_LABELS[sub.categoria] || sub.categoria}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {sub.cantidad} {sub.cantidad === 1 ? 'plato' : 'platos'}
                        </span>
                      </div>
                      <span className="font-sans font-bold text-sm text-[#D35400] tabular-nums">
                        S/ {sub.monto.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vista 14.3: Detalle por Día del Producto Seleccionado */}
            {reportePlatos?.porDia && reportePlatos.porDia.length > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#D35400]">
                      Desglose Diario del Plato
                    </p>
                    <p className="text-sm font-semibold text-[#2C1A0E] mt-0.5">
                      Ventas diarias del producto en el rango consultado
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProductoFiltroId('');
                      consultar(desde, hasta, '');
                    }}
                    className="text-xs text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
                  >
                    Ver todos los platos
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {reportePlatos.porDia.map((d) => (
                    <div
                      key={d.fecha}
                      className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-center"
                    >
                      <span className="text-xs font-medium text-neutral-500 block">{d.fecha}</span>
                      <span className="text-base font-bold text-[#2C1A0E] font-sans tabular-nums block mt-0.5">
                        {d.cantidad} un.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Barra de Ordenamiento de Platos (RV-138) */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                Listado de Platos ({platosOrdenados.length})
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-medium">Ordenar por:</span>
                <select
                  value={ordenPlatos}
                  onChange={(e) => setOrdenPlatos(e.target.value as CriterioOrdenPlatos)}
                  className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 cursor-pointer focus:outline-none"
                >
                  <option value="cantidad">Mayor cantidad</option>
                  <option value="monto">Mayor monto (S/)</option>
                  <option value="nombre">Nombre (A - Z)</option>
                </select>
              </div>
            </div>

            {/* Tabla de Platos Vendidos (Desktop) & Tarjetas (Móvil) */}
            {platosOrdenados.length > 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs">
                {/* Desktop Data Grid */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAF7F4] border-b border-[#E5E0DB] text-xs font-semibold text-[#7C6F66] uppercase tracking-wider sticky top-0 z-10">
                        <th className="py-3 px-4">Producto</th>
                        <th className="py-3 px-4">Categoría</th>
                        <th className="py-3 px-4 text-center">Estado</th>
                        <th className="py-3 px-4 text-right">Cantidad Vendida</th>
                        <th className="py-3 px-4 text-right">Monto Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE6] text-sm text-neutral-700">
                      {platosOrdenados.map((item) => (
                        <tr key={item.productoId} className="hover:bg-neutral-50/60 transition-colors border-b border-[#F0EBE6]">
                          <td className="py-3 px-4 font-semibold text-sm text-[#2C1A0E]">
                            <span>{item.producto}</span>
                            {!item.activo && (
                              <span className="ml-2 text-xs font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 rounded px-1.5 py-0.5">
                                inactivo
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="inline-flex items-center justify-center rounded-lg text-xs font-medium py-1 px-2.5 border shadow-2xs bg-neutral-50 text-neutral-700 border-neutral-200"
                              title={CATEGORIA_LABELS[item.categoria] || item.categoria}
                            >
                              {CATEGORIA_BADGE_LABELS[item.categoria] || item.categoria}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center rounded-lg text-xs font-medium py-1 px-2.5 border shadow-2xs ${
                                item.activo
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                              }`}
                            >
                              {item.activo ? 'Activo' : 'Desactivado'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-sans font-semibold tabular-nums text-sm text-[#2C1A0E]">
                            {item.cantidad}
                          </td>
                          <td className="py-3 px-4 text-right font-sans font-semibold tabular-nums text-sm text-[#D35400]">
                            S/ {item.monto.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile / Tablet Cards */}
                <div className="lg:hidden divide-y divide-neutral-100">
                  {platosOrdenados.map((item) => (
                    <div key={item.productoId} className="p-4 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-sans font-bold text-base text-[#2C1A0E]">
                            {item.producto}
                          </h4>
                          {!item.activo && (
                            <span className="text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200 inline-block mt-0.5">
                              (inactivo)
                            </span>
                          )}
                        </div>
                        <span
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200"
                          title={CATEGORIA_LABELS[item.categoria] || item.categoria}
                        >
                          {CATEGORIA_BADGE_LABELS[item.categoria] || item.categoria}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                        <div>
                          <span className="text-neutral-500 block">Cantidad vendida:</span>
                          <span className="font-sans font-bold text-sm text-[#2C1A0E] tabular-nums">
                            {item.cantidad} un.
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-neutral-500 block">Total generado:</span>
                          <span className="font-sans font-bold text-sm text-[#D35400] tabular-nums">
                            S/ {item.monto.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Estado Vacío de Platos Vendidos (MSG-193) */
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 text-center shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D35400] flex items-center justify-center mx-auto mb-3 border border-amber-200">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <h3 className="font-sans font-bold text-base text-[#2C1A0E] mb-1">
                  No hay platos vendidos en el período
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mb-4">
                  No se encontraron ventas para las fechas seleccionadas o el producto indicado.
                  Pruebe con otras fechas o con otro producto.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => aplicarAtajo('ayer')}
                    className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                  >
                    Ver ventas de ayer
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarAtajo('ultimos7')}
                    className="px-3 py-1.5 rounded-xl bg-[#D35400] text-white text-xs font-semibold hover:bg-[#B84600] cursor-pointer"
                  >
                    Ver últimos 7 días
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA: REPORTE DE VENTAS (CUS14.1 / HU37 / RF-37 / Vista 14.1)          */}
        {/* ========================================================================= */}
        {tabActiva === 'ventas' && (
          <>
            {/* 4 Tarjetas de Resumen Financiero (RV-136) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Total General
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#D35400] flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <span className="font-sans font-bold text-2xl sm:text-3xl text-[#D35400] tabular-nums mt-2">
                  S/ {reporteVentas ? reporteVentas.total.toFixed(2) : '0.00'}
                </span>
                <span className="text-xs text-neutral-400 mt-1">Ingresos brutos vigentes</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Total en Efectivo
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <span className="font-sans font-bold text-2xl sm:text-3xl text-emerald-700 tabular-nums mt-2">
                  S/ {reporteVentas ? reporteVentas.efectivo.toFixed(2) : '0.00'}
                </span>
                <span className="text-xs text-neutral-400 mt-1">Cobros en caja física</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Total por Yape
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                </div>
                <span className="font-sans font-bold text-2xl sm:text-3xl text-purple-700 tabular-nums mt-2">
                  S/ {reporteVentas ? reporteVentas.yape.toFixed(2) : '0.00'}
                </span>
                <span className="text-xs text-neutral-400 mt-1">Billeteras electrónicas</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Cantidad de Ventas
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                </div>
                <span className="font-sans font-bold text-2xl sm:text-3xl text-[#2C1A0E] tabular-nums mt-2">
                  {reporteVentas ? reporteVentas.nVentas : '0'}
                </span>
                <span className="text-xs text-neutral-400 mt-1">Comprobantes vigentes</span>
              </div>
            </div>

            {/* Aviso Informativo de Ventas Anuladas (RV-135 / RN-117 / MSG-199) */}
            {reporteVentas && reporteVentas.anuladas.cantidad > 0 && (
              <div className="p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Ventas Anuladas:</strong> Incluye {reporteVentas.anuladas.cantidad} venta(s)
                  anulada(s) por S/ {reporteVentas.anuladas.monto.toFixed(2)} que no se suman a los
                  totales.
                </span>
              </div>
            )}

            {/* Tabla Detalle de Ventas por Día (RV-136, RV-137, RN-121) */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                Detalle por Día ({reporteVentas?.porDia.length || 0} fechas)
              </span>
            </div>

            {reporteVentas && reporteVentas.porDia.length > 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs">
                {/* Desktop Grid */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAF7F4] border-b border-[#E5E0DB] text-xs font-semibold text-[#7C6F66] uppercase tracking-wider sticky top-0 z-10">
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4 text-center">N.° Ventas</th>
                        <th className="py-3 px-4 text-right">Efectivo</th>
                        <th className="py-3 px-4 text-right">Yape</th>
                        <th className="py-3 px-4 text-right">Total Día</th>
                        <th className="py-3 px-4 text-center">Estado / Cierre</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE6] text-sm text-neutral-700">
                      {reporteVentas.porDia.map((d) => (
                        <tr key={d.fecha} className="hover:bg-neutral-50/60 transition-colors border-b border-[#F0EBE6]">
                          <td className="py-3 px-4 font-semibold text-sm text-[#2C1A0E]">{d.fecha}</td>
                          <td className="py-3 px-4 text-center font-sans font-medium text-sm tabular-nums">
                            {d.nVentas}
                          </td>
                          <td className="py-3 px-4 text-right font-sans font-medium text-sm tabular-nums text-emerald-700">
                            S/ {d.efectivo.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-sans font-medium text-sm tabular-nums text-purple-700">
                            S/ {d.yape.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-sans font-semibold text-sm tabular-nums text-[#D35400]">
                            S/ {d.total.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {d.conAjustes ? (
                              <button
                                type="button"
                                onClick={onNavigateToCierres}
                                title="Este día incluye anulaciones posteriores al cierre de caja. Vea el historial de cierres."
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold px-2.5 py-1 bg-amber-50 text-[#B84600] border border-amber-300 shadow-2xs hover:bg-amber-100 cursor-pointer transition-colors"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Con ajustes</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center justify-center rounded-lg text-xs font-medium px-2.5 py-1 bg-neutral-50 text-neutral-600 border border-neutral-200">
                                Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile / Tablet Cards */}
                <div className="lg:hidden divide-y divide-neutral-100">
                  {reporteVentas.porDia.map((d) => (
                    <div key={d.fecha} className="p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-sans font-bold text-sm text-[#2C1A0E]">{d.fecha}</span>
                        {d.conAjustes ? (
                          <span
                            onClick={onNavigateToCierres}
                            className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-amber-50 text-[#B84600] border border-amber-200 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <AlertTriangle className="w-3 h-3" /> Con ajustes
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs text-neutral-500 bg-neutral-50 rounded border border-neutral-200">
                            Normal
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-neutral-500 block">Ventas:</span>
                          <span className="font-bold text-neutral-800 font-sans tabular-nums">
                            {d.nVentas} comprobantes
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-neutral-500 block">Total del Día:</span>
                          <span className="font-bold text-sm text-[#D35400] font-sans tabular-nums">
                            S/ {d.total.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Efectivo:</span>
                          <span className="font-bold text-emerald-700 font-sans tabular-nums">
                            S/ {d.efectivo.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-neutral-500 block">Yape:</span>
                          <span className="font-bold text-purple-700 font-sans tabular-nums">
                            S/ {d.yape.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Estado Vacío de Ventas (MSG-192) */
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 text-center shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D35400] flex items-center justify-center mx-auto mb-3 border border-amber-200">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="font-sans font-bold text-base text-[#2C1A0E] mb-1">
                  No hay ventas en el rango seleccionado
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mb-4">
                  No se encontraron comprobantes vigentes emitidos en las fechas indicadas.
                  Pruebe con otras fechas.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => aplicarAtajo('ayer')}
                    className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                  >
                    Ver ventas de ayer
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarAtajo('ultimos7')}
                    className="px-3 py-1.5 rounded-xl bg-[#D35400] text-white text-xs font-semibold hover:bg-[#B84600] cursor-pointer"
                  >
                    Ver últimos 7 días
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 6. Toast Flotante de Éxito */}
      {avisoExito && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-in slide-in-from-bottom-4 fade-in duration-200"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-xs font-semibold tracking-wide">{avisoExito}</span>
          <button
            type="button"
            onClick={() => setAvisoExito(null)}
            className="ml-3 text-neutral-400 hover:text-white text-base leading-none p-1 cursor-pointer"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default ReportesPage;
