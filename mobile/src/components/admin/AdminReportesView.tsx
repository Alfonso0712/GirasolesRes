import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Smartphone, RefreshCw, ShoppingBag, Lock } from 'lucide-react';
import { reporteService } from '../../services/reporteService';
import { cajaService } from '../../services/cajaService';
import type { ReporteVentasResponse, ItemPlatoVendido } from '../../types/reporte';
import type { HistorialCierresItemDto } from '../../types/caja';
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
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden">
      {/* Header */}
      <div className="bg-surface border-b border-line px-5 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-ink leading-tight">Métricas y Reportes</h2>
            <p className="text-xs text-ink-muted">Visión gerencial de ventas y rendimiento</p>
          </div>
        </div>

        <button
          type="button"
          onClick={cargarDatos}
          disabled={cargando}
          aria-label="Actualizar datos"
          className="w-10 h-10 rounded-xl bg-canvas border border-line flex items-center justify-center text-ink active:scale-95 transition-transform"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-accent' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Filtros de Período */}
        <div className="grid grid-cols-3 gap-2 bg-surface border border-line p-1.5 rounded-2xl shadow-xs">
          {[
            { id: 'hoy' as const, label: 'Hoy' },
            { id: '7dias' as const, label: '7 Días' },
            { id: 'mes' as const, label: 'Este Mes' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                triggerLight();
                setPeriodo(p.id);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-accent ${
                periodo === p.id ? 'bg-primary text-white shadow-xs' : 'text-ink-muted'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {error && (
          <ErrorState
            mensaje={error}
            onRetry={cargarDatos}
            className="my-4"
          />
        )}

        {!error && !cargando && sinDatos && (
          <EmptyState
            icon={BarChart3}
            titulo="Sin ventas registradas"
            subtitulo="No hay ventas registradas en el período seleccionado."
          />
        )}

        {/* 1. KPIs Destacados */}
        {reporteVentas && !sinDatos && (
          <div className="space-y-3">
            {/* KPI Principal */}
            <div className="bg-surface border border-line rounded-3xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Ventas Totales
                </span>
                <span className="text-xs font-bold text-success bg-success-bg border border-success-border px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Activo</span>
                </span>
              </div>
              <p className="text-3xl font-black text-accent tabular-nums">
                {formatCurrency(reporteVentas.total)}
              </p>
              <p className="text-xs text-ink-muted mt-1">
                {pluralizar(reporteVentas.nVentas, 'pedido registrado', 'pedidos registrados')} en este período
              </p>
            </div>

            {/* Desglose por método de pago */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface border border-line rounded-2xl p-4 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-chip-accent-bg text-accent flex items-center justify-center mb-2">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-xs text-ink-muted font-bold block">En Efectivo</span>
                <span className="text-lg font-black text-ink mt-0.5 block tabular-nums">
                  {formatCurrency(reporteVentas.efectivo)}
                </span>
              </div>

              <div className="bg-surface border border-line rounded-2xl p-4 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-info-bg text-info flex items-center justify-center mb-2">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="text-xs text-ink-muted font-bold block">En Yape / Plin</span>
                <span className="text-lg font-black text-ink mt-0.5 block tabular-nums">
                  {formatCurrency(reporteVentas.yape)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Platos Más Vendidos */}
        {topPlatos.length > 0 && (
          <div className="bg-surface border border-line rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-accent" />
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
          </div>
        )}

        {/* 3. Historial de Cierres de Caja */}
        {cierres.length > 0 && (
          <div className="bg-surface border border-line rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent" />
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

                  <div className="text-right">
                    <span className="font-black text-ink block tabular-nums">
                      {formatCurrency(cierre.totalVentas)}
                    </span>
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded-full uppercase ${
                        cierre.estadoCuadre === 'Cuadra'
                          ? 'bg-success-bg text-success'
                          : 'bg-warning-bg text-warning'
                      }`}
                    >
                      {cierre.estadoCuadre}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
