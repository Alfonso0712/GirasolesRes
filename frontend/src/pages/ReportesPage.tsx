import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  RotateCcw,
  AlertCircle,
  Utensils,
  ReceiptText,
  Check
} from 'lucide-react';
import { useReportesManagement } from '../hooks/useReportesManagement';
import type { UserSession } from '../types/auth';
import type { TipoAtajoFecha } from '../types/reporte';
import { PageHeader, PageContainer } from '../components/layout';
import {
  ReportesFilterBar,
  ReportePlatosTab,
  ReporteVentasTab,
} from '../components/reportes';

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
    <div className="flex-1 overflow-y-auto w-full scroll-thin">
      <PageContainer className="select-none">
      {/* 1. Encabezado Unificado */}
      <PageHeader
        title="Reportes"
        subtitle="Consulte el volumen de platos vendidos y el balance general de ventas en el período."
        actions={
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => descargar('pdf')}
              disabled={cargando || descargando !== null || Boolean(errorRango)}
              className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-surface hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shadow-2xs inline-flex items-center gap-2 min-h-[40px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Descargar reporte en formato PDF (A4)"
            >
              <FileText className="w-4 h-4 text-accent" />
              <span>{descargando === 'pdf' ? 'Preparando archivo…' : 'Descargar PDF'}</span>
            </button>

            <button
              type="button"
              onClick={() => descargar('csv')}
              disabled={cargando || descargando !== null || Boolean(errorRango)}
              className="px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold shadow-2xs inline-flex items-center gap-2 min-h-[40px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Descargar reporte en formato Excel (CSV UTF-8)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>{descargando === 'csv' ? 'Preparando archivo…' : 'Descargar Excel'}</span>
            </button>
          </div>
        }
      />

      {/* 2. Pestañas de Navegación del CUS14 (Platos vendidos primero por ser Must, Ventas segundo) */}
      <div className="shrink-0 flex items-center gap-2 border-b border-neutral-200/80 pb-1">
        <button
          type="button"
          onClick={() => cambiarTab('platos')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer ${
            tabActiva === 'platos'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
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
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <ReceiptText className="w-4 h-4" />
          <span>Reporte de Ventas</span>
        </button>
      </div>

      {/* 3. Barra de Filtros, Rango y Atajos Rápidos */}
      <ReportesFilterBar
        atajos={atajos}
        atajoActivo={atajoActivo}
        aplicarAtajo={aplicarAtajo}
        desde={desde}
        setDesde={setDesde}
        hasta={hasta}
        setHasta={setHasta}
        tabActiva={tabActiva}
        productoFiltroId={productoFiltroId}
        setProductoFiltroId={setProductoFiltroId}
        productosDisponibles={productosDisponibles}
        cargando={cargando}
        consultar={consultar}
        filtrosCambiados={filtrosCambiados}
        errorRango={errorRango}
      />

      {/* 4. Banner de Error de Carga con Botón Reintentar (MSG-194 / MSG-195) */}
      {errorCarga && (
        <div className="shrink-0 p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-danger shrink-0" />
            <p className="text-xs font-medium">{errorCarga}</p>
          </div>
          <button
            type="button"
            onClick={() => consultar()}
            className="px-3.5 py-1.5 rounded-xl bg-danger hover:bg-danger-hover text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* 5. Contenedor de Contenido Principal sin confinamiento */}
      <div className="w-full space-y-4">
        {tabActiva === 'platos' && (
          <ReportePlatosTab
            reportePlatos={reportePlatos}
            platosOrdenados={platosOrdenados}
            ordenPlatos={ordenPlatos}
            setOrdenPlatos={setOrdenPlatos}
            onClearProductoFiltro={() => {
              setProductoFiltroId('');
              consultar(desde, hasta, '');
            }}
          />
        )}

        {tabActiva === 'ventas' && (
          <ReporteVentasTab
            reporteVentas={reporteVentas}
            onNavigateToCierres={onNavigateToCierres}
          />
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
            className="ml-3 text-neutral-500 hover:text-white text-base leading-none p-1 cursor-pointer"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      )}
      </PageContainer>
    </div>
  );
};

export default ReportesPage;
