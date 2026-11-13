import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Smartphone, ShoppingBag, Lock } from 'lucide-react';
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

export interface AdminReportesViewProps {
  reporteVentas: ReporteVentasResponse | null;
  topPlatos: ItemPlatoVendido[];
  cierres: HistorialCierresItemDto[];
  cargando: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  periodo: 'hoy' | '7dias' | 'mes';
  onCambiarPeriodo: (periodo: 'hoy' | '7dias' | 'mes') => void;
}

export const AdminReportesView: React.FC<AdminReportesViewProps> = ({
  reporteVentas,
  topPlatos,
  cierres,
  cargando,
  error,
  onRefresh,
  periodo,
  onCambiarPeriodo,
}) => {
  const { triggerLight } = useHaptics();

  const sinDatos = !reporteVentas || (reporteVentas.nVentas === 0 && topPlatos.length === 0);

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
              onCambiarPeriodo(p as typeof periodo);
            }}
          />
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
                <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-ink-muted w-4">{idx + 1}.</span>
                    <span className="font-bold text-ink">{plato.producto}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-ink-muted">
                      {pluralizar(plato.cantidad, 'unidad', 'unidades')}
                    </span>
                    <span className="font-black text-accent tabular-nums">
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
                Últimos Cierres de Caja
              </h3>
            </div>

            <div className="divide-y divide-line">
              {cierres.slice(0, 5).map((cierre) => (
                <div key={cierre.cajaId} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-ink block">{cierre.fechaCierre || cierre.fechaApertura}</span>
                    <span className="text-ink-muted">Cajero: {cierre.cajero}</span>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
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
    </div>
  );
};
