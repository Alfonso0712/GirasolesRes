import React, { useState } from 'react';
import { Clock, Utensils, CheckCircle2 } from 'lucide-react';
import type { PedidoItemDto, DetallePedidoCompletoDto } from '../../types/pedido';
import type { RolUsuario } from '../../types/auth';
import { DetallePedidoSheet } from './DetallePedidoSheet';
import { AnularPedidoSheet } from './AnularPedidoSheet';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { FilterChipBar } from '../ui/FilterChipBar';
import { SkeletonList } from '../ui/Skeleton';
import { PageHeader } from '../layout/PageHeader';
import { useHaptics } from '../../hooks/useHaptics';
import { formatCurrency, pluralizar } from '../../utils/format';

export interface MisPedidosViewProps {
  pedidos: PedidoItemDto[];
  cargando: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  rol?: RolUsuario;
  usuarioIdActual?: string;
  onAgregarPlatos?: (pedido: DetallePedidoCompletoDto) => void;
  esMozo?: boolean;
  conteoAvisosListos?: number;
}

export const MisPedidosView: React.FC<MisPedidosViewProps> = ({
  pedidos,
  cargando,
  error,
  onRefresh,
  rol = 'Mozo',
  usuarioIdActual,
  onAgregarPlatos,
  esMozo = false,
  conteoAvisosListos = 0,
}) => {
  const [filtro, setFiltro] = useState<'todos' | 'pendiente' | 'en-preparacion' | 'listo'>('todos');
  const [pedidoDetalleId, setPedidoDetalleId] = useState<string | null>(null);
  const [pedidoParaAnular, setPedidoParaAnular] = useState<DetallePedidoCompletoDto | PedidoItemDto | null>(null);

  const { triggerLight } = useHaptics();

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtro === 'pendiente') return p.estado === 'Pendiente';
    if (filtro === 'en-preparacion') return p.estado === 'En preparación';
    if (filtro === 'listo') return p.estado === 'Listo';
    return true;
  });

  // Los pedidos 'Listos' se muestran primero (N-C 3)
  const pedidosOrdenados = [...pedidosFiltrados].sort((a, b) => {
    if (a.estado === 'Listo' && b.estado !== 'Listo') return -1;
    if (a.estado !== 'Listo' && b.estado === 'Listo') return 1;
    return 0;
  });

  const getAccentForEstado = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'warning' as const;
      case 'En preparación':
        return 'info' as const;
      case 'Listo':
        return 'success' as const;
      case 'Anulado':
        return 'danger' as const;
      default:
        return 'none' as const;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {/* 1. Encabezado */}
      <PageHeader
        title="Pedidos Registrados"
        subtitle="Consumo en curso en salón y mostrador"
        icon={<Clock className="w-5 h-5 text-white" aria-hidden="true" />}
        onRefresh={onRefresh}
        isRefreshing={cargando}
      />

      {/* Banner de Aviso de Pedidos Listos en Cocina */}
      {conteoAvisosListos > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="bg-success-bg border-b border-success-border px-4 py-2.5 flex items-center justify-between text-success animate-in fade-in shrink-0"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="text-xs font-black">
              ¡Tiene {conteoAvisosListos} {pluralizar(conteoAvisosListos, 'pedido listo', 'pedidos listos')} en cocina!
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerLight();
              setFiltro('listo');
            }}
            className="text-xs font-black underline uppercase tracking-wider cursor-pointer min-h-[44px] px-2 flex items-center"
          >
            Ver
          </button>
        </div>
      )}

      {/* 2. Filtros de Estado */}
      <div className="bg-surface border-b border-line px-4 py-2 shrink-0">
        <FilterChipBar
          chips={[
            { id: 'todos', label: 'Todos', count: pedidos.length },
            { id: 'pendiente', label: 'Pendientes', count: pedidos.filter((p) => p.estado === 'Pendiente').length },
            { id: 'en-preparacion', label: 'En preparación', count: pedidos.filter((p) => p.estado === 'En preparación').length },
            { id: 'listo', label: 'Listos', count: pedidos.filter((p) => p.estado === 'Listo').length },
          ]}
          activeId={filtro}
          onSelect={(id) => {
            triggerLight();
            setFiltro(id as typeof filtro);
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {error && (
          <ErrorState
            mensaje={error}
            onRetry={onRefresh}
            className="my-4"
          />
        )}

        {cargando && pedidos.length === 0 && (
          <SkeletonList count={5} />
        )}

        {!error && !cargando && pedidosOrdenados.length === 0 && (
          <EmptyState
            icon={Utensils}
            titulo="Sin pedidos registrados"
            subtitulo="No tiene pedidos registrados que coincidan con el filtro seleccionado."
          />
        )}

        {pedidosOrdenados.map((p) => {
          const mesaOReferencia = p.mesa || p.referencia || `Pedido #${p.numero}`;
          return (
            <Card
              key={p.id}
              accent={getAccentForEstado(p.estado)}
              interactive={true}
              onClick={() => {
                triggerLight();
                setPedidoDetalleId(p.id);
              }}
              className="flex items-center justify-between select-none cursor-pointer active:scale-98 transition-transform min-h-[56px]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-ink">{mesaOReferencia}</h3>
                  <span className="text-xs text-accent font-bold bg-chip-accent-bg px-2 py-0.5 rounded-full border border-chip-accent-border">
                    #{p.numero}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-ink-muted mt-1">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Hora: {p.hora || 'En curso'} · Mozo: {p.registradoPor}</span>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-1.5">
                {/* Regla RV-154: Mozo no ve montos económicos de pedidos */}
                {!esMozo && (
                  <span className="text-base font-black text-accent tabular-nums">
                    {formatCurrency(p.total)}
                  </span>
                )}
                <StatusBadge estado={p.estado} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* 3. Bottom Sheet de Detalle Completo del Pedido */}
      <DetallePedidoSheet
        isOpen={Boolean(pedidoDetalleId)}
        onClose={() => setPedidoDetalleId(null)}
        pedidoId={pedidoDetalleId}
        rol={rol}
        usuarioIdActual={usuarioIdActual}
        onAgregarPlatos={(det) => {
          setPedidoDetalleId(null);
          onAgregarPlatos?.(det);
        }}
        onSolicitarAnular={(det) => {
          setPedidoDetalleId(null);
          setPedidoParaAnular(det);
        }}
      />

      {/* 4. Bottom Sheet de Anulación Justificada */}
      <AnularPedidoSheet
        isOpen={Boolean(pedidoParaAnular)}
        onClose={() => setPedidoParaAnular(null)}
        pedido={pedidoParaAnular}
        onAnulacionExitosa={() => {
          setPedidoParaAnular(null);
          void onRefresh();
        }}
      />
    </div>
  );
};
