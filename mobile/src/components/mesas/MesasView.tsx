import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, PlusCircle, Receipt } from 'lucide-react';
import { mesaService } from '../../services/mesaService';
import type { MesaItem } from '../../types/mesa';
import { Badge } from '../ui/Badge';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
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
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden">
      {/* 1. Barra de Estado del Salón y Filtros */}
      <div className="bg-surface border-b border-line px-4 py-3 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-ink">Salón de Mesas</h2>
            <p className="text-xs text-ink-muted">
              {pluralizar(libresCount, 'libre', 'libres')} · {pluralizar(ocupadasCount, 'ocupada', 'ocupadas')}
            </p>
          </div>
          <button
            type="button"
            onClick={cargarMesas}
            disabled={cargando}
            aria-label="Actualizar mesas"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-canvas border border-line text-ink-muted hover:text-ink flex items-center justify-center active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-accent"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-accent' : ''}`} />
          </button>
        </div>

        {/* Chips de Filtro Horizontal Táctil */}
        <div className="flex gap-2">
          {[
            { id: 'todas' as const, label: `Todas (${mesas.length})` },
            { id: 'libres' as const, label: `Libres (${libresCount})` },
            { id: 'ocupadas' as const, label: `Ocupadas (${ocupadasCount})` },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                triggerLight();
                setFiltro(f.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                filtro === f.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-canvas text-ink-muted hover:text-ink border border-line'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Grilla Táctil de Mesas (2 col en celular, 3-4 col en tablet) */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <ErrorState
            mensaje={error}
            onRetry={cargarMesas}
            className="my-4"
          />
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
                <button
                  key={mesa.id}
                  type="button"
                  onClick={() => handleMesaClick(mesa)}
                  className={`p-3.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between min-h-[110px] shadow-xs select-none ${
                    esLibre
                      ? 'bg-surface border-success-border/70 hover:border-success'
                      : 'bg-surface border-danger-border/70 hover:border-danger'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base font-extrabold text-ink">{mesa.nombre}</span>
                    <Badge variant={esLibre ? 'success' : 'danger'}>
                      {mesa.ocupacion}
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
                    <span className="truncate max-w-[110px]">
                      {esLibre ? 'Disponible' : (mesa.mozo ? `Mozo: ${mesa.mozo}` : 'Sin mozo asignado')}
                    </span>

                    {!esLibre && mesa.minutosOcupada && (
                      <span className="inline-flex items-center gap-1 font-bold text-danger shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{pluralizar(mesa.minutosOcupada, 'min', 'mins')}</span>
                      </span>
                    )}
                  </div>

                  {!esLibre && typeof mesa.totalPendiente === 'number' && (
                    <div className="mt-1 text-right text-xs font-black text-accent tabular-nums">
                      {formatCurrency(mesa.totalPendiente)}
                    </div>
                  )}
                </button>
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
