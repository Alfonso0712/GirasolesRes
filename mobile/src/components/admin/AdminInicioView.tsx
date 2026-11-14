import React, { useMemo } from 'react';
import {
  LayoutDashboard,
  Utensils,
  Lock,
  BarChart3,
  AlertTriangle,
  Clock,
  DollarSign,
  Smartphone,
  TrendingUp,
  Receipt,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import type { InicioDashboardData, AlertaInicio } from '../../types/inicio';
import { PageHeader } from '../layout/PageHeader';
import { Card } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { StatusBadge } from '../ui/StatusBadge';
import { SkeletonList } from '../ui/Skeleton';
import { ErrorState } from '../ui/ErrorState';
import { formatCurrency, pluralizar } from '../../utils/format';
import { useHaptics } from '../../hooks/useHaptics';

export interface AdminInicioViewProps {
  datos: InicioDashboardData | null;
  cargando: boolean;
  error: string | null;
  actualizadoEn: Date | null;
  onRefresh: () => void | Promise<void>;
  onNavigate: (tabId: string) => void;
}

export const AdminInicioView: React.FC<AdminInicioViewProps> = ({
  datos,
  cargando,
  error,
  actualizadoEn,
  onRefresh,
  onNavigate,
}) => {
  const { triggerLight } = useHaptics();

  const textoActualizado = useMemo(() => {
    if (!actualizadoEn) return 'Panel general del restaurante';
    const segundos = Math.max(0, Math.floor((Date.now() - actualizadoEn.getTime()) / 1000));
    if (segundos < 60) {
      return `Actualizado hace ${segundos} s`;
    }
    const minutos = Math.floor(segundos / 60);
    return `Actualizado hace ${pluralizar(minutos, 'minuto', 'minutos')}`;
  }, [actualizadoEn]);

  const bloques = datos?.bloques || {};
  const ventasHoy = bloques.ventasHoy?.estado === 'ok' ? bloques.ventasHoy.datos : null;
  const mesas = bloques.mesas?.estado === 'ok' ? bloques.mesas.datos : null;
  const caja = bloques.caja?.estado === 'ok' ? bloques.caja.datos : null;
  const alertas: AlertaInicio[] = bloques.alertas?.estado === 'ok' ? (bloques.alertas.datos || []) : [];

  const ticketPromedio = useMemo(() => {
    if (!ventasHoy || !ventasHoy.nVentas || ventasHoy.nVentas <= 0) return 0;
    return ventasHoy.total / ventasHoy.nVentas;
  }, [ventasHoy]);

  const totalMesas = (mesas?.libres || 0) + (mesas?.ocupadas || 0);

  const resolverAlertaIcono = (tipo: string) => {
    switch (tipo) {
      case 'caja_abierta_ayer':
      case 'caja_no_abierta':
        return <Lock className="w-4 h-4 text-warning" aria-hidden="true" />;
      case 'comanda_demorada':
        return <Clock className="w-4 h-4 text-danger" aria-hidden="true" />;
      case 'platos_agotados':
        return <AlertTriangle className="w-4 h-4 text-warning" aria-hidden="true" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-warning" aria-hidden="true" />;
    }
  };

  const resolverDestinoAlerta = (enlace: string) => {
    if (enlace.includes('caja')) return 'caja';
    if (enlace.includes('salon') || enlace.includes('mesas')) return 'salon';
    if (enlace.includes('reportes')) return 'reportes';
    return null;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {/* 1. Encabezado */}
      <PageHeader
        title="Inicio"
        subtitle={textoActualizado}
        icon={<LayoutDashboard className="w-5 h-5 text-white" aria-hidden="true" />}
        onRefresh={onRefresh}
        isRefreshing={cargando}
      />

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {error && (
          <ErrorState
            mensaje={error}
            onRetry={onRefresh}
            className="my-2"
          />
        )}

        {cargando && !datos && (
          <div className="space-y-4">
            <SkeletonList count={4} />
          </div>
        )}

        {/* 2. Accesos Rápidos */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Accesos Rápidos
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => {
                triggerLight();
                onNavigate('salon');
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface border border-line hover:border-primary/40 active:scale-98 transition-all min-h-[72px] text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1.5">
                <Utensils className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold text-ink">Salón</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerLight();
                onNavigate('caja');
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface border border-line hover:border-primary/40 active:scale-98 transition-all min-h-[72px] text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-1.5">
                <Lock className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold text-ink">Caja</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerLight();
                onNavigate('reportes');
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface border border-line hover:border-primary/40 active:scale-98 transition-all min-h-[72px] text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-info/10 text-info flex items-center justify-center mb-1.5">
                <BarChart3 className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold text-ink">Reportes</span>
            </button>
          </div>
        </div>

        {/* 3. Sección de Alertas Operativas */}
        {alertas.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Alertas del Restaurante
            </h2>
            <div className="space-y-2">
              {alertas.map((alerta, idx) => {
                const destino = resolverDestinoAlerta(alerta.enlace);
                return (
                  <Card
                    key={idx}
                    accent={alerta.tipo.includes('demorada') ? 'danger' : 'warning'}
                    padding="sm"
                    className="flex items-center justify-between gap-3"
                    onClick={
                      destino
                        ? () => {
                            triggerLight();
                            onNavigate(destino);
                          }
                        : undefined
                    }
                    interactive={Boolean(destino)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0">{resolverAlertaIcono(alerta.tipo)}</div>
                      <p className="text-xs font-bold text-ink leading-tight break-words min-w-0">
                        {alerta.texto}
                      </p>
                    </div>
                    {destino && (
                      <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Resumen de Ventas y Rendimiento */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Ventas de Hoy
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              titulo="Total Ventas Hoy"
              valor={ventasHoy ? formatCurrency(ventasHoy.total) : 'S/ 0.00'}
              subtitulo={pluralizar(ventasHoy?.nVentas || 0, 'transacción', 'transacciones')}
              icon={<Receipt className="w-4 h-4 text-accent" aria-hidden="true" />}
            />

            <StatCard
              titulo="Ticket Promedio"
              valor={formatCurrency(ticketPromedio)}
              subtitulo="Por venta realizada"
              icon={<TrendingUp className="w-4 h-4 text-success" aria-hidden="true" />}
            />

            <StatCard
              titulo="Efectivo"
              valor={ventasHoy ? formatCurrency(ventasHoy.efectivo) : 'S/ 0.00'}
              icon={<DollarSign className="w-4 h-4 text-accent" aria-hidden="true" />}
            />

            <StatCard
              titulo="Yape / Plin"
              valor={ventasHoy ? formatCurrency(ventasHoy.yape) : 'S/ 0.00'}
              icon={<Smartphone className="w-4 h-4 text-info" aria-hidden="true" />}
            />
          </div>
        </div>

        {/* 5. Estado de Salón y Caja */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Operaciones en Vivo
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card
              accent="none"
              padding="md"
              className="flex items-center justify-between"
              onClick={() => {
                triggerLight();
                onNavigate('salon');
              }}
              interactive
            >
              <div>
                <span className="text-xs text-ink-muted block">Salón</span>
                <span className="text-lg font-black text-ink">
                  {mesas ? `${mesas.ocupadas} de ${totalMesas}` : '0 de 0'}
                </span>
                <span className="text-xs text-ink-muted block mt-0.5">Mesas ocupadas</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-canvas border border-line flex items-center justify-center text-primary">
                <Utensils className="w-5 h-5" aria-hidden="true" />
              </div>
            </Card>

            <Card
              accent="none"
              padding="md"
              className="flex items-center justify-between"
              onClick={() => {
                triggerLight();
                onNavigate('caja');
              }}
              interactive
            >
              <div>
                <span className="text-xs text-ink-muted block">Caja</span>
                <span className="text-lg font-black text-ink block">
                  {caja?.estado || 'Sin abrir'}
                </span>
                <div className="mt-1">
                  <StatusBadge estado={caja?.estado === 'Abierta' ? 'Abierta' : 'Cerrada'} />
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-canvas border border-line flex items-center justify-center text-accent">
                <Lock className="w-5 h-5" aria-hidden="true" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
