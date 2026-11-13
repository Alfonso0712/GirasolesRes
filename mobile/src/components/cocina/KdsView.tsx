import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle2, Flame } from 'lucide-react';
import { comandaService } from '../../services/comandaService';
import type { ComandaItem } from '../../types/comanda';
import { useHaptics } from '../../hooks/useHaptics';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { FilterChipBar } from '../ui/FilterChipBar';
import { SkeletonList } from '../ui/Skeleton';
import { PageHeader } from '../layout/PageHeader';
import { pluralizar } from '../../utils/format';

export const KdsView: React.FC = () => {
  const [comandas, setComandas] = useState<ComandaItem[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'enPreparacion'>('todas');

  const { triggerSuccess, triggerLight } = useHaptics();

  const cargarComandas = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await comandaService.listarComandas();
      setComandas([...(data.pendientes || []), ...(data.enPreparacion || [])]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar las comandas de cocina';
      setError(msg);
      setComandas([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarComandas();
    const interval = setInterval(cargarComandas, 15000); // Auto-refresco cada 15s en cocina
    return () => clearInterval(interval);
  }, []);

  const handleCambiarEstado = async (id: string, nuevoEstado: 'enPreparacion' | 'lista') => {
    triggerSuccess();
    try {
      await comandaService.actualizarEstado(id, nuevoEstado);
    } catch {
      // Optimistic update
    }
    setComandas((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
        .filter((c) => c.estado !== 'lista')
    );
  };

  const comandasFiltradas = comandas.filter((c) => {
    if (filtro === 'pendientes') return c.estado === 'pendiente';
    if (filtro === 'enPreparacion') return c.estado === 'enPreparacion';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {/* 1. Encabezado KDS */}
      <PageHeader
        title="Pantalla KDS Cocina"
        subtitle={pluralizar(comandas.length, 'comanda en proceso', 'comandas en proceso')}
        icon={<ChefHat className="w-5 h-5 text-white" aria-hidden="true" />}
        onRefresh={cargarComandas}
        isRefreshing={cargando}
      />

      {/* 2. Filtros de Estado */}
      <div className="bg-surface border-b border-line px-4 py-2 shrink-0">
        <FilterChipBar
          chips={[
            { id: 'todas', label: 'Todas', count: comandas.length },
            { id: 'pendientes', label: 'Pendientes', count: comandas.filter((c) => c.estado === 'pendiente').length },
            { id: 'enPreparacion', label: 'En preparación', count: comandas.filter((c) => c.estado === 'enPreparacion').length },
          ]}
          activeId={filtro}
          onSelect={(id) => {
            triggerLight();
            setFiltro(id as typeof filtro);
          }}
        />
      </div>

      {/* 3. Grid de Comandas KDS */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {error && (
          <ErrorState
            mensaje={error}
            onRetry={cargarComandas}
            className="my-4"
          />
        )}

        {cargando && comandas.length === 0 && (
          <SkeletonList count={4} />
        )}

        {!error && !cargando && comandasFiltradas.length === 0 && (
          <EmptyState
            icon={ChefHat}
            titulo="Cocina al día"
            subtitulo="No hay comandas pendientes en cocina."
          />
        )}

        {comandasFiltradas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comandasFiltradas.map((comanda) => {
              const esCritico = comanda.minutosEspera >= 20;
              const esAlerta = comanda.minutosEspera >= 10 && !esCritico;
              const estadoCanonico = comanda.estado === 'pendiente' ? 'Pendiente' : 'En preparación';

              return (
                <Card
                  key={comanda.id}
                  accent={esCritico ? 'danger' : esAlerta ? 'warning' : comanda.estado === 'pendiente' ? 'warning' : 'info'}
                  className="flex flex-col justify-between shadow-sm select-none p-0 overflow-hidden"
                >
                  {/* Cabecera de comanda */}
                  <div
                    className={`p-3.5 flex items-center justify-between border-b ${
                      esCritico
                        ? 'bg-danger-bg text-danger border-danger-border'
                        : esAlerta
                        ? 'bg-warning-bg text-warning border-warning-border'
                        : 'bg-canvas text-ink border-line'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold uppercase tracking-wider block">
                          Comanda #{comanda.numero}
                        </span>
                        <StatusBadge estado={estadoCanonico} />
                      </div>
                      <h3 className="text-base font-extrabold">{comanda.mesaNombre}</h3>
                    </div>

                    <div className="text-right flex items-center gap-1 font-black text-sm">
                      <Clock className="w-4 h-4" aria-hidden="true" />
                      <span>{pluralizar(comanda.minutosEspera, 'minuto', 'minutos')}</span>
                    </div>
                  </div>

                  {/* Lista de platos en tamaño legible para cocina */}
                  <div className="p-4 space-y-3 flex-1">
                    {comanda.lineas.map((l, idx) => (
                      <div key={idx} className="border-b border-line/60 pb-2 last:border-0">
                        <p className="text-base font-black text-ink">{l.nombre}</p>
                        {l.observaciones && (
                          <p className="text-xs font-bold text-danger bg-danger-bg/60 border border-danger-border/40 px-2 py-0.5 rounded-md mt-1 inline-block">
                            Nota: {l.observaciones}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Botón táctil gigante (mínimo 56px) para cocinero con guantes */}
                  <div className="p-3 bg-canvas border-t border-line">
                    {comanda.estado === 'pendiente' ? (
                      <button
                        type="button"
                        onClick={() => handleCambiarEstado(comanda.id, 'enPreparacion')}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-black py-4 rounded-xl min-h-[56px] text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 shadow-md cursor-pointer"
                      >
                        <Flame className="w-5 h-5" aria-hidden="true" />
                        <span>Empezar Preparación</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCambiarEstado(comanda.id, 'lista')}
                        className="w-full bg-success hover:opacity-90 text-white font-black py-4 rounded-xl min-h-[56px] text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 shadow-md cursor-pointer"
                      >
                        <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                        <span>Marcar Listo para Servir</span>
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
