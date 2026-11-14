import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Smartphone,
  ShoppingBag,
  Lock,
  Receipt,
  FileDown,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import type {
  ReporteVentasResponse,
  ReportePlatosResponse,
  ItemPlatoVendido,
} from '../../types/reporte';
import type { HistorialCierresItemDto } from '../../types/caja';
import { reporteService } from '../../services/reporteService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatCard } from '../ui/StatCard';
import { StatusBadge } from '../ui/StatusBadge';
import { FilterChipBar } from '../ui/FilterChipBar';
import { MesSheet, type SeleccionMes } from '../ui/MesSheet';
import { SkeletonList } from '../ui/Skeleton';
import { PageHeader } from '../layout/PageHeader';
import { useHaptics } from '../../hooks/useHaptics';
import { useToast } from '../../context/ToastContext';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency, pluralizar } from '../../utils/format';
import { formatLimaFechaHora, formatLimaFecha, obtenerHoyLimaYMD } from '../../utils/fechas';
import { compartirPdf } from '../../utils/archivos';

export type PeriodoReporte = 'hoy' | '7dias' | 'mes' | 'otroMes';
export type VistaReporte = 'ventas' | 'platos';

export interface AdminReportesViewProps {
  reporteVentas: ReporteVentasResponse | null;
  reportePlatos?: ReportePlatosResponse | null;
  topPlatos: ItemPlatoVendido[];
  cierres: HistorialCierresItemDto[];
  cargando: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  periodo: PeriodoReporte;
  onCambiarPeriodo: (periodo: PeriodoReporte) => void;
  mesElegido?: SeleccionMes | null;
  onSeleccionarMes?: (seleccion: SeleccionMes) => void;
  rangoActual?: { desde: string; hasta: string };
  onNavigateToCierres?: () => void;
}

export const AdminReportesView: React.FC<AdminReportesViewProps> = ({
  reporteVentas,
  reportePlatos,
  topPlatos,
  cierres,
  cargando,
  error,
  onRefresh,
  periodo,
  onCambiarPeriodo,
  mesElegido,
  onSeleccionarMes,
  rangoActual,
  onNavigateToCierres,
}) => {
  const [vista, setVista] = useState<VistaReporte>('ventas');
  const [mesSheetAbierto, setMesSheetAbierto] = useState(false);
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [errorPdf, setErrorPdf] = useState<string | null>(null);

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();
  const { mostrar } = useToast();

  const platosLista = useMemo(() => {
    const base = reportePlatos?.items ?? topPlatos ?? [];
    return [...base].sort((a, b) => b.cantidad - a.cantidad || b.monto - a.monto);
  }, [reportePlatos, topPlatos]);

  const maxCantidadPlato = useMemo(() => {
    if (platosLista.length === 0) return 1;
    return Math.max(1, ...platosLista.map((p) => p.cantidad));
  }, [platosLista]);

  const ticketPromedio = useMemo(() => {
    if (!reporteVentas || reporteVentas.nVentas <= 0) return 0;
    return reporteVentas.total / reporteVentas.nVentas;
  }, [reporteVentas]);

  const sinDatosVentas = !reporteVentas || reporteVentas.nVentas === 0;
  const sinDatosPlatos = platosLista.length === 0;
  const sinDatosActual = vista === 'ventas' ? sinDatosVentas : sinDatosPlatos;

  const etiquetaOtroMes =
    periodo === 'otroMes' && mesElegido?.etiqueta ? mesElegido.etiqueta : 'Otro mes';

  const handleDescargarPdf = async () => {
    triggerLight();
    setDescargandoPdf(true);
    setErrorPdf(null);

    const hoy = obtenerHoyLimaYMD();
    const desde = rangoActual?.desde || reporteVentas?.desde || hoy;
    const hasta = rangoActual?.hasta || reporteVentas?.hasta || hoy;
    const anioMes = desde.slice(0, 7);

    try {
      const blob =
        vista === 'ventas'
          ? await reporteService.descargarReporteVentasPdf(desde, hasta)
          : await reporteService.descargarReportePlatosPdf(desde, hasta);

      const nombreArchivo =
        vista === 'ventas'
          ? `reporte-ventas_${anioMes}.pdf`
          : `reporte-platos_${anioMes}.pdf`;

      await compartirPdf(blob, nombreArchivo);
      triggerSuccess();
      mostrar({ tipo: 'exito', mensaje: 'Reporte PDF generado correctamente.' });
    } catch (err: unknown) {
      triggerError();
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'No se pudo generar el reporte en PDF.';
      setErrorPdf(msg);
      mostrar({ tipo: 'error', mensaje: msg });
    } finally {
      setDescargandoPdf(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {/* 1. Encabezado */}
      <PageHeader
        title="Métricas y Reportes"
        subtitle="Visión gerencial de ventas y rendimiento"
        icon={<BarChart3 className="w-5 h-5 text-white" aria-hidden="true" />}
        onRefresh={onRefresh}
        isRefreshing={cargando}
      />

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {/* 2. Control segmentado: Ventas | Platos vendidos */}
        <div
          role="tablist"
          aria-label="Tipo de reporte"
          className="grid grid-cols-2 gap-2 bg-surface border border-line p-1.5 rounded-2xl shadow-xs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={vista === 'ventas'}
            onClick={() => {
              triggerLight();
              setVista('ventas');
              setErrorPdf(null);
            }}
            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              vista === 'ventas'
                ? 'bg-primary text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Ventas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={vista === 'platos'}
            onClick={() => {
              triggerLight();
              setVista('platos');
              setErrorPdf(null);
            }}
            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              vista === 'platos'
                ? 'bg-primary text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Platos vendidos
          </button>
        </div>

        {/* 3. Filtros de Período y Botón Descargar PDF */}
        <div className="bg-surface border border-line p-3 rounded-2xl shadow-xs space-y-3">
          <FilterChipBar
            chips={[
              { id: 'hoy', label: 'Hoy' },
              { id: '7dias', label: '7 días' },
              { id: 'mes', label: 'Este mes' },
              { id: 'otroMes', label: etiquetaOtroMes },
            ]}
            activeId={periodo}
            onSelect={(p) => {
              triggerLight();
              if (p === 'otroMes') {
                setMesSheetAbierto(true);
              } else {
                onCambiarPeriodo(p as PeriodoReporte);
              }
            }}
          />

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-line/60">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted min-w-0">
              <Calendar className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
              <span className="font-medium break-words">
                {rangoActual
                  ? `${formatLimaFecha(rangoActual.desde)} — ${formatLimaFecha(rangoActual.hasta)}`
                  : 'Período actual'}
              </span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              disabled={descargandoPdf || cargando || sinDatosActual}
              onClick={() => void handleDescargarPdf()}
              className="min-h-[44px] px-3 flex items-center gap-1.5 shrink-0 font-bold"
            >
              <FileDown className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>{descargandoPdf ? 'Generando PDF…' : 'Descargar PDF'}</span>
            </Button>
          </div>

          {errorPdf && (
            <p role="alert" className="text-xs font-semibold text-danger">
              {errorPdf}
            </p>
          )}
        </div>

        {error && (
          <ErrorState
            mensaje={error}
            onRetry={onRefresh}
            className="my-4"
          />
        )}

        {cargando && !reporteVentas && (
          <SkeletonList count={3} />
        )}

        {!error && !cargando && sinDatosActual && (
          <EmptyState
            icon={BarChart3}
            titulo="Sin ventas registradas"
            subtitulo="No hay ventas registradas en el período seleccionado."
          />
        )}

        {/* 4A. Vista "Ventas": KPIs de la web y detalle por día */}
        {!error && vista === 'ventas' && reporteVentas && !sinDatosVentas && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <StatCard
                titulo="Total Ventas"
                valor={formatCurrency(reporteVentas.total)}
                subtitulo={pluralizar(reporteVentas.nVentas, 'venta registrada', 'ventas registradas')}
                icon={<TrendingUp className="w-5 h-5 text-success" aria-hidden="true" />}
              />

              <StatCard
                titulo="Número de Ventas"
                valor={reporteVentas.nVentas}
                subtitulo={
                  reporteVentas.anuladas && reporteVentas.anuladas.cantidad > 0
                    ? `${pluralizar(reporteVentas.anuladas.cantidad, 'anulada', 'anuladas')} (${formatCurrency(reporteVentas.anuladas.monto)})`
                    : 'Sin ventas anuladas'
                }
                icon={<Receipt className="w-4 h-4 text-accent" aria-hidden="true" />}
              />

              <StatCard
                titulo="Ticket Promedio"
                valor={formatCurrency(ticketPromedio)}
                subtitulo="Promedio por comprobante"
                icon={<BarChart3 className="w-4 h-4 text-info" aria-hidden="true" />}
              />

              <StatCard
                titulo="En Efectivo"
                valor={formatCurrency(reporteVentas.efectivo)}
                icon={<DollarSign className="w-4 h-4 text-accent" aria-hidden="true" />}
              />

              <StatCard
                titulo="En Yape / Plin"
                valor={formatCurrency(reporteVentas.yape)}
                icon={<Smartphone className="w-4 h-4 text-info" aria-hidden="true" />}
              />
            </div>

            {reporteVentas.porDia && reporteVentas.porDia.length > 0 && (
              <Card className="p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" aria-hidden="true" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                    Detalle de Ventas por Día
                  </h3>
                </div>

                <div className="divide-y divide-line">
                  {reporteVentas.porDia.map((dia) => (
                    <div
                      key={dia.fecha}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-ink block">
                          {formatLimaFecha(dia.fecha)}
                        </span>
                        <span className="text-ink-muted">
                          {pluralizar(dia.nVentas, 'venta', 'ventas')} · Efectivo:{' '}
                          {formatCurrency(dia.efectivo)} · Yape: {formatCurrency(dia.yape)}
                        </span>
                      </div>
                      <span className="font-black text-accent tabular-nums text-sm">
                        {formatCurrency(dia.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {/* 4B. Vista "Platos vendidos": Ranking con nombre completo, cantidad, importe y barra de proporción */}
        {!error && vista === 'platos' && !sinDatosPlatos && (
          <Card className="p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-accent" aria-hidden="true" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Ranking de Platos Vendidos ({platosLista.length})
                </h3>
              </div>
              {reportePlatos && (
                <span className="text-xs font-bold text-ink-muted">
                  {pluralizar(reportePlatos.totalPlatos, 'unidad', 'unidades')}
                </span>
              )}
            </div>

            <div className="divide-y divide-line">
              {platosLista.map((plato, idx) => {
                const porcentaje = Math.max(
                  4,
                  Math.min(100, Math.round((plato.cantidad / maxCantidadPlato) * 100))
                );
                return (
                  <div key={plato.productoId || idx} className="py-3 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-ink leading-snug break-words block">
                          {idx + 1}. {plato.producto}
                        </span>
                        {plato.categoria && (
                          <span className="text-ink-muted">{plato.categoria}</span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-accent tabular-nums block">
                          {formatCurrency(plato.monto)}
                        </span>
                        <span className="font-semibold text-ink-muted">
                          {pluralizar(plato.cantidad, 'unidad', 'unidades')}
                        </span>
                      </div>
                    </div>

                    <div
                      className="w-full h-2 bg-line rounded-full overflow-hidden"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* 5. Últimos Cierres de Caja */}
        {cierres.length > 0 && (
          <Card className="p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-accent" aria-hidden="true" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Últimos Cierres de Caja
                </h3>
              </div>

              {onNavigateToCierres && (
                <button
                  type="button"
                  onClick={() => {
                    triggerLight();
                    onNavigateToCierres();
                  }}
                  className="min-h-[44px] px-2.5 py-1.5 rounded-xl text-xs font-bold text-accent hover:bg-chip-accent-bg inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver todos</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="divide-y divide-line">
              {cierres.slice(0, 5).map((cierre) => (
                <div
                  key={cierre.cajaId}
                  className="py-2.5 flex justify-between items-center gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-ink block">
                      {formatLimaFechaHora(cierre.fechaCierre || cierre.fechaApertura)}
                    </span>
                    <span className="text-ink-muted">Cajero: {cierre.cajero}</span>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1 shrink-0">
                    <span className="font-black text-accent tabular-nums">
                      {formatCurrency(cierre.totalVentas)}
                    </span>
                    <StatusBadge estado={cierre.estadoCuadre || 'Cuadra'} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Selector de Mes ("Otro mes") */}
      <MesSheet
        isOpen={mesSheetAbierto}
        onClose={() => setMesSheetAbierto(false)}
        selectedId={mesElegido?.id}
        incluirTodos={false}
        titulo="Seleccionar mes del reporte"
        onSelect={(sel) => {
          onSeleccionarMes?.(sel);
        }}
      />
    </div>
  );
};
