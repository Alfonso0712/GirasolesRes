import React, { useState, useEffect } from 'react';
import { Utensils, Clock, PlusCircle, Receipt } from 'lucide-react';
import { mesaService } from '../../services/mesaService';
import type { MesaItem } from '../../types/mesa';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { FilterChipBar } from '../ui/FilterChipBar';
import { SkeletonList } from '../ui/Skeleton';
import { PageHeader } from '../layout/PageHeader';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { useHaptics } from '../../hooks/useHaptics';
import { formatCurrency, pluralizar } from '../../utils/format';

interface MesasViewProps {
  onAbrirPedidoMesa: (mesa: MesaItem) => void;
  onNavigateToCobro?: (mesaId: string) => void;
}

export const MesasView: React.FC<MesasViewProps> = ({
  onAbrirPedidoMesa,
  onNavigateToCobro,
}) => {
  const [mesas, setMesas] = useState<MesaItem[]>([]);
  const [filtro, setFiltro] = useState<'todas' | 'libres' | 'ocupadas'>('todas');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<MesaItem | null>(null);

  const { triggerLight } = useHaptics();

  const cargarMesas = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await mesaService.getMesas();
      setMesas(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar las mesas del salón';
      setError(msg);
      setMesas([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMesas();
  }, []);

  const mesasFiltradas = mesas.filter((m) => {
    if (!m.activa) return false;
    if (filtro === 'libres') return m.ocupacion === 'Libre';
    if (filtro === 'ocupadas') return m.ocupacion === 'Ocupada';
    return true;
  });

  const libresCount = mesas.filter((m) => m.activa && m.ocupacion === 'Libre').length;
  const ocupadasCount = mesas.filter((m) => m.activa && m.ocupacion === 'Ocupada').length;

  const handleMesaClick = (mesa: MesaItem) => {
    triggerLight();
    if (mesa.ocupacion === 'Libre') {
      onAbrirPedidoMesa(mesa);
    } else {
      setMesaSeleccionada(mesa);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {/* 1. Encabezado y Filtros */}
      <PageHeader
        title="Salón y Mesas"
        subtitle={`${pluralizar(libresCount, 'libre', 'libres')} · ${pluralizar(ocupadasCount, 'ocupada', 'ocupadas')}`}
        icon={<Utensils className="w-5 h-5 text-white" aria-hidden="true" />}
        onRefresh={cargarMesas}
        isRefreshing={cargando}
      />

      <div className="bg-surface border-b border-line px-4 py-2 shrink-0">
        <FilterChipBar
          chips={[
            { id: 'todas', label: 'Todas', count: mesas.length },
            { id: 'libres', label: 'Libres', count: libresCount },
            { id: 'ocupadas', label: 'Ocupadas', count: ocupadasCount },
          ]}
          activeId={filtro}
          onSelect={(id) => {
            triggerLight();
            setFiltro(id as 'todas' | 'libres' | 'ocupadas');
          }}
        />
      </div>

      {/* 2. Grilla Táctil de Mesas (2 col en celular, 3-4 col en tablet) */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {error && (
          <ErrorState
            mensaje={error}
            onRetry={cargarMesas}
            className="my-4"
          />
        )}

        {cargando && mesas.length === 0 && (
          <SkeletonList count={6} />
        )}

        {!error && !cargando && mesasFiltradas.length === 0 && (
          <EmptyState
            titulo="No hay mesas disponibles"
            subtitulo="No se encontraron mesas activas en el salón según el filtro seleccionado."
          />
        )}

        {mesasFiltradas.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {mesasFiltradas.map((mesa) => {
              const esLibre = mesa.ocupacion === 'Libre';
              return (
                <Card
                  key={mesa.id}
                  interactive
                  accent={esLibre ? 'success' : 'warning'}
                  onClick={() => handleMesaClick(mesa)}
                  padding="sm"
                  className="flex flex-col justify-between min-h-[116px] pl-3.5"
                >
                  <div className="flex items-center justify-between gap-1.5 w-full">
                    <span className="text-base font-extrabold text-ink whitespace-nowrap truncate min-w-0 flex-1">
                      {mesa.nombre}
                    </span>
                    <div className="shrink-0">
                      <StatusBadge estado={mesa.ocupacion} />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
                    <span className="truncate max-w-[110px]">
                      {esLibre ? 'Disponible' : (mesa.mozo ? `Mozo: ${mesa.mozo}` : 'Sin mozo asignado')}
                    </span>

                    {!esLibre && mesa.minutosOcupada && (
                      <span className="inline-flex items-center gap-1 font-bold text-danger shrink-0">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{pluralizar(mesa.minutosOcupada, 'min', 'mins')}</span>
                      </span>
                    )}
                  </div>

                  {!esLibre && typeof mesa.totalPendiente === 'number' && (
                    <div className="mt-1 text-right text-xs font-black text-accent tabular-nums">
                      {formatCurrency(mesa.totalPendiente)}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Bottom Sheet de Acciones para Mesa Ocupada */}
      <BottomSheet
        isOpen={Boolean(mesaSeleccionada)}
        onClose={() => setMesaSeleccionada(null)}
        title={mesaSeleccionada ? `${mesaSeleccionada.nombre} (Ocupada)` : ''}
      >
        {mesaSeleccionada && (
          <div className="space-y-4">
            <div className="bg-canvas border border-line rounded-2xl p-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-ink-muted">Total acumulado</p>
                <p className="text-xl font-black text-accent tabular-nums">
                  {formatCurrency(mesaSeleccionada.totalPendiente || 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-muted">Tiempo en mesa</p>
                <p className="text-sm font-bold text-ink">
                  {pluralizar(mesaSeleccionada.minutosOcupada || 0, 'minuto', 'minutos')}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <Button
                fullWidth
                size="lg"
                onClick={() => {
                  const m = mesaSeleccionada;
                  setMesaSeleccionada(null);
                  onAbrirPedidoMesa(m);
                }}
                className="flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Agregar Más Platos a la Mesa</span>
              </Button>

              {onNavigateToCobro && (
                <Button
                  fullWidth
                  size="lg"
                  variant="secondary"
                  onClick={() => {
                    const id = mesaSeleccionada.id;
                    setMesaSeleccionada(null);
                    onNavigateToCobro(id);
                  }}
                  className="flex items-center justify-center gap-2"
                >
                  <Receipt className="w-5 h-5" />
                  <span>Cobrar / Emitir Comprobante</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};
