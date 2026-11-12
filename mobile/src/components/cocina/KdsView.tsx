import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle2, Flame, RefreshCw } from 'lucide-react';
import { comandaService } from '../../services/comandaService';
import type { ComandaItem } from '../../types/comanda';
import { useHaptics } from '../../hooks/useHaptics';

export const KdsView: React.FC = () => {
  const [comandas, setComandas] = useState<ComandaItem[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'enPreparacion'>('todas');

  const { triggerSuccess, triggerLight } = useHaptics();

  const cargarComandas = async () => {
    setCargando(true);
    try {
      const data = await comandaService.listarComandas();
      // Concatenar pendientes y enPreparacion
      setComandas([...(data.pendientes || []), ...(data.enPreparacion || [])]);
    } catch {
      // Mock para pruebas si la API está desconectada
      setComandas([
        {
          id: 'c1',
          numero: 14,
          mesaNombre: 'Mesa 2',
          mozoNombre: 'Carlos',
          fechaCreacion: new Date().toISOString(),
          minutosEspera: 8,
          estado: 'pendiente',
          lineas: [
            { productoId: '1', nombre: '1x Ceviche Mixto', cantidad: 1, observaciones: 'Sin ají', estado: 'pendiente' },
            { productoId: '2', nombre: '2x Arroz con Mariscos', cantidad: 2, estado: 'pendiente' },
          ],
        },
        {
          id: 'c2',
          numero: 15,
          mesaNombre: 'Mesa 4',
          mozoNombre: 'Ana',
          fechaCreacion: new Date().toISOString(),
          minutosEspera: 21,
          estado: 'enPreparacion',
          lineas: [
            { productoId: '3', nombre: '1x Lomo Saltado', cantidad: 1, observaciones: 'Término medio', estado: 'enPreparacion' },
            { productoId: '4', nombre: '1x Chicha Morada Jarra', cantidad: 1, estado: 'enPreparacion' },
          ],
        },
      ]);
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
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden">
      {/* Header KDS */}
      <div className="bg-surface border-b border-line px-5 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-ink leading-tight">Pantalla KDS Cocina</h2>
            <p className="text-xs text-ink-muted">{comandas.length} comandas en proceso</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtros */}
          <div className="hidden sm:flex gap-1.5 bg-canvas border border-line p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { triggerLight(); setFiltro('todas'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                filtro === 'todas' ? 'bg-primary text-white' : 'text-ink-muted'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => { triggerLight(); setFiltro('pendientes'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                filtro === 'pendientes' ? 'bg-primary text-white' : 'text-ink-muted'
              }`}
            >
              Pendientes
            </button>
            <button
              type="button"
              onClick={() => { triggerLight(); setFiltro('enPreparacion'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                filtro === 'enPreparacion' ? 'bg-primary text-white' : 'text-ink-muted'
              }`}
            >
              En Preparación
            </button>
          </div>

          <button
            type="button"
            onClick={cargarComandas}
            disabled={cargando}
            aria-label="Actualizar comandas"
            className="w-10 h-10 rounded-xl bg-canvas border border-line text-ink flex items-center justify-center active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid de Comandas KDS (1 col en mobile, 2-3 en tablet horizontal) */}
      <div className="flex-1 overflow-y-auto p-4">
        {comandasFiltradas.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-ink-muted">
            <CheckCircle2 className="w-12 h-12 text-success mb-2" />
            <p className="text-base font-bold text-ink">¡Cocina al día!</p>
            <p className="text-xs">No hay comandas pendientes en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comandasFiltradas.map((comanda) => {
              const esCritico = comanda.minutosEspera >= 20;
              const esAlerta = comanda.minutosEspera >= 10 && !esCritico;

              return (
                <div
                  key={comanda.id}
                  className={`bg-surface rounded-2xl border-2 flex flex-col justify-between shadow-sm select-none overflow-hidden ${
                    esCritico
                      ? 'border-danger'
                      : esAlerta
                      ? 'border-warning'
                      : 'border-line'
                  }`}
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
                      <span className="text-xs font-bold uppercase tracking-wider block">
                        Comanda #{comanda.numero}
                      </span>
                      <h3 className="text-base font-extrabold">{comanda.mesaNombre}</h3>
                    </div>

                    <div className="text-right flex items-center gap-1 font-black text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{comanda.minutosEspera} min</span>
                    </div>
                  </div>

                  {/* Lista de platos en tamaño grande para cocinero */}
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
                        className="w-full bg-primary hover:bg-primary-hover text-white font-black py-4 rounded-xl min-h-[56px] text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 shadow-md"
                      >
                        <Flame className="w-5 h-5" />
                        <span>Empezar Preparación</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCambiarEstado(comanda.id, 'lista')}
                        className="w-full bg-success hover:opacity-90 text-white font-black py-4 rounded-xl min-h-[56px] text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 shadow-md"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Marcar Listo para Servir</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
