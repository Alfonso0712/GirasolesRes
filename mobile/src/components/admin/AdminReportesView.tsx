import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Smartphone, ShoppingBag, Lock } from 'lucide-react';
import { reporteService } from '../../services/reporteService';
import { cajaService } from '../../services/cajaService';
import type { ReporteVentasResponse, ItemPlatoVendido } from '../../types/reporte';
import type { HistorialCierresItemDto } from '../../types/caja';
import { Card } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { StatusBadge } from '../ui/StatusBadge';
import { FilterChipBar } from '../ui/FilterChipBar';
import { SkeletonList } from '../ui/Skeleton';
import { PageHeader } from '../layout/PageHeader';
import { useHaptics } from '../../hooks/useHaptics';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency, pluralizar } from '../../utils/format';

export const AdminReportesView: React.FC = () => {
  const [periodo, setPeriodo] = useState<'hoy' | '7dias' | 'mes'>('hoy');
  const [reporteVentas, setReporteVentas] = useState<ReporteVentasResponse | null>(null);
  const [topPlatos, setTopPlatos] = useState<ItemPlatoVendido[]>([]);
  const [cierres, setCierres] = useState<HistorialCierresItemDto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { triggerLight } = useHaptics();

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const ventas = await reporteService.obtenerReporteVentas();
      setReporteVentas(ventas);
      const platos = await reporteService.obtenerReportePlatos();
      setTopPlatos(platos.items || []);
      const cierresRes = await cajaService.obtenerHistorialCierres();
      setCierres(cierresRes.items || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar los reportes administrativos';
      setError(msg);
      setReporteVentas(null);
      setTopPlatos([]);
      setCierres([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [periodo]);

  const sinDatos = !reporteVentas || (reporteVentas.nVentas === 0 && topPlatos.length === 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {/* 1. Encabezado */}
      <PageHeader
        title="Métricas y Reportes"
        subtitle="Visión gerencial de ventas y rendimiento"
        icon={<BarChart3 className="w-5 h-5 text-white" aria-hidden="true" />}
        onRefresh={cargarDatos}
        isRefreshing={cargando}
      />

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {/* 2. Filtros de Período */}
        <div className="bg-surface border border-line p-1.5 rounded-2xl shadow-xs">
          <FilterChipBar
            chips={[
              { id: 'hoy', label: 'Hoy' },
              { id: '7dias', label: '7 Días' },
              { id: 'mes', label: 'Este Mes' },
            ]}
            activeId={periodo}
            onSelect={(p) => {
              triggerLight();
              setPeriodo(p as typeof periodo);
            }}
          />
        </div>

        {error && (
          <ErrorState
            mensaje={error}
            onRetry={cargarDatos}
            className="my-4"
          />
        )}

        {cargando && !reporteVentas && (
          <SkeletonList count={3} />
        )}

        {!error && !cargando && sinDatos && (
          <EmptyState
            icon={BarChart3}
            titulo="Sin ventas registradas"
            subtitulo="No hay ventas registradas en el período seleccionado."
          />
        )}

        {/* 3. KPIs Destacados */}
        {reporteVentas && !sinDatos && (
          <div className="space-y-3">
            <StatCard
              titulo="Ventas Totales"
              valor={formatCurrency(reporteVentas.total)}
              subtitulo={`${pluralizar(reporteVentas.nVentas, 'pedido registrado', 'pedidos registrados')} en este período`}
              icon={<TrendingUp className="w-5 h-5 text-success" aria-hidden="true" />}
            />

            {/* Desglose por método de pago */}
            <div className="grid grid-cols-2 gap-3">
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
          </div>
        )}

        {/* 4. Platos Más Vendidos */}
        {topPlatos.length > 0 && (
          <Card className="p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-accent" aria-hidden="true" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Platos Más Vendidos
              </h3>
            </div>

            <div className="divide-y divide-line">
              {topPlatos.slice(0, 5).map((plato, idx) => (
                <div key={plato.productoId} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-canvas text-ink-muted font-extrabold text-xs flex items-center justify-center border border-line">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-ink">{plato.producto}</h4>
                      <span className="text-xs text-ink-muted">{plato.categoria}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-accent block">
                      {pluralizar(plato.cantidad, 'und.', 'unds.')}
                    </span>
                    <span className="text-xs text-ink-muted tabular-nums">
                      {formatCurrency(plato.monto)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 5. Historial de Cierres de Caja */}
        {cierres.length > 0 && (
          <Card className="p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent" aria-hidden="true" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Cierres de Caja Recientes
              </h3>
            </div>

            <div className="space-y-2">
              {cierres.slice(0, 3).map((cierre) => (
                <div
                  key={cierre.cajaId}
                  className="bg-canvas border border-line rounded-2xl p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-ink block">{cierre.cajero}</span>
                    <span className="text-xs text-ink-muted">
                      {new Date(cierre.fechaApertura).toLocaleDateString('es-PE')}
                    </span>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="font-black text-ink block tabular-nums">
                      {formatCurrency(cierre.totalVentas)}
                    </span>
                    {(() => {
                      const rawEstado = cierre.conAjustes
                        ? 'Con ajustes'
                        : (cierre.resultado || cierre.estadoCuadre || null);
                      if (!rawEstado) return null;
                      return <StatusBadge category="caja" estado={rawEstado} />;
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
