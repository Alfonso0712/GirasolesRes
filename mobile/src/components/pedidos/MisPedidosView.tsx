import React, { useState, useEffect } from 'react';
import { Clock, Utensils } from 'lucide-react';
import { pedidoService } from '../../services/pedidoService';
import type { PedidoItemDto } from '../../types/pedido';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { FilterChipBar } from '../ui/FilterChipBar';
import { SkeletonList } from '../ui/Skeleton';
import { PageHeader } from '../layout/PageHeader';
import { useHaptics } from '../../hooks/useHaptics';
import { formatCurrency } from '../../utils/format';

export const MisPedidosView: React.FC = () => {
  const [pedidos, setPedidos] = useState<PedidoItemDto[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'pendiente' | 'en-preparacion' | 'listo'>('todos');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { triggerLight } = useHaptics();

  const cargarPedidos = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await pedidoService.listarPedidos({ soloMios: true });
      setPedidos(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar sus pedidos registrados';
      setError(msg);
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtro === 'pendiente') return p.estado === 'Pendiente';
    if (filtro === 'en-preparacion') return p.estado === 'En preparación';
    if (filtro === 'listo') return p.estado === 'Listo';
    return true;
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
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden">
      {/* 1. Encabezado */}
      <PageHeader
        title="Pedidos Registrados"
        subtitle="Consumo en curso en salón"
        icon={<Clock className="w-5 h-5 text-white" aria-hidden="true" />}
        onRefresh={cargarPedidos}
        isRefreshing={cargando}
      />

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

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {error && (
          <ErrorState
            mensaje={error}
            onRetry={cargarPedidos}
            className="my-4"
          />
        )}

        {cargando && pedidos.length === 0 && (
          <SkeletonList count={5} />
        )}

        {!error && !cargando && pedidosFiltrados.length === 0 && (
          <EmptyState
            icon={Utensils}
            titulo="Sin pedidos registrados"
            subtitulo="No tiene pedidos registrados que coincidan con el filtro seleccionado."
          />
        )}

        {pedidosFiltrados.map((p) => {
          const mesaOReferencia = p.mesa || p.referencia || `Pedido #${p.numero}`;
          return (
            <Card
              key={p.id}
              accent={getAccentForEstado(p.estado)}
              className="flex items-center justify-between select-none"
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
                <span className="text-base font-black text-accent tabular-nums">
                  {formatCurrency(p.total)}
                </span>
                <StatusBadge estado={p.estado} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
