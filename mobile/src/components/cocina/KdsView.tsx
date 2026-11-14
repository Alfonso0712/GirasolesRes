import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChefHat, Clock, CheckCircle2, Flame, AlertTriangle, RotateCcw, X } from 'lucide-react';
import type { ComandaKdsItem } from '../../types/comanda';
import { useHaptics } from '../../hooks/useHaptics';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { FilterChipBar } from '../ui/FilterChipBar';
import { SkeletonList } from '../ui/Skeleton';
import { PageHeader } from '../layout/PageHeader';
import { pluralizar } from '../../utils/format';
import { reproducirSonidoKds } from '../../utils/audioKds';

export interface KdsViewProps {
  comandas: ComandaKdsItem[];
  cargando: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onCambiarEstado: (id: string, nuevoEstado: 'enPreparacion' | 'lista') => Promise<void>;
  onDeshacer?: (id: string) => Promise<void>;
  onShowToast?: (mensaje: string) => void;
}

interface UndoAccion {
  comandaId: string;
  pedidoNumero: number;
  nuevoEstado: 'enPreparacion' | 'lista';
  segundosRestantes: number;
}

export const KdsView: React.FC<KdsViewProps> = ({
  comandas,
  cargando,
  error,
  onRefresh,
  onCambiarEstado,
  onDeshacer,
  onShowToast,
}) => {
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'enPreparacion'>('todas');
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [undoAccion, setUndoAccion] = useState<UndoAccion | null>(null);
  const [deshaciendo, setDeshaciendo] = useState(false);

  const { triggerSuccess, triggerLight, triggerError } = useHaptics();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Temporizador de 10 segundos para deshacer
  useEffect(() => {
    if (!undoAccion) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setUndoAccion((prev) => {
        if (!prev) return null;
        if (prev.segundosRestantes <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onShowToast?.('El tiempo para deshacer la acción ha expirado.');
          return null;
        }
        return { ...prev, segundosRestantes: prev.segundosRestantes - 1 };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [undoAccion, onShowToast]);

  const handleAccionEstado = async (comanda: ComandaKdsItem, nuevoEstado: 'enPreparacion' | 'lista') => {
    triggerLight();
    setProcesandoId(comanda.id);
    try {
      await onCambiarEstado(comanda.id, nuevoEstado);
      triggerSuccess();
      reproducirSonidoKds(nuevoEstado === 'enPreparacion' ? 'preparacion' : 'lista');

      // Iniciar cuenta regresiva de 10 segundos para deshacer
      setUndoAccion({
        comandaId: comanda.id,
        pedidoNumero: comanda.pedidoNumero,
        nuevoEstado,
        segundosRestantes: 10,
      });
    } catch {
      triggerError();
    } finally {
      setProcesandoId(null);
    }
  };

  const handleEjecutarDeshacer = async () => {
    if (!undoAccion || !onDeshacer) return;
    setDeshaciendo(true);
    triggerLight();
    try {
      await onDeshacer(undoAccion.comandaId);
      triggerSuccess();
      onShowToast?.('Estado revertido con éxito.');
      setUndoAccion(null);
    } catch {
      triggerError();
    } finally {
      setDeshaciendo(false);
    }
  };

  // Filtrado de comandas
  const comandasFiltradas = useMemo(() => {
    return comandas.filter((c) => {
      // Ignorar comandas que ya están en estado Lista si vinieran en el listado
      if (c.estado === 'Lista') return false;
      if (filtro === 'pendientes') return c.estado === 'Pendiente';
      if (filtro === 'enPreparacion') return c.estado === 'EnPreparacion';
      return true;
    });
  }, [comandas, filtro]);

  // Ordenamiento: las más antiguas primero (mayor tiempo de espera)
  const comandasOrdenadas = useMemo(() => {
    return [...comandasFiltradas].sort((a, b) => {
      // Priorizar mayor tiempo de espera
      if (b.minutosEspera !== a.minutosEspera) {
        return b.minutosEspera - a.minutosEspera;
      }
      return new Date(a.fechaHoraLlegadaUtc).getTime() - new Date(b.fechaHoraLlegadaUtc).getTime();
    });
  }, [comandasFiltradas]);

  const pendientesCount = comandas.filter((c) => c.estado === 'Pendiente').length;
  const enPreparacionCount = comandas.filter((c) => c.estado === 'EnPreparacion').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0 relative">
      {/* 1. Encabezado KDS */}
      <PageHeader
        title="Pantalla KDS Cocina"
        subtitle={pluralizar(comandasOrdenadas.length, 'comanda activa', 'comandas activas')}
        icon={<ChefHat className="w-5 h-5 text-white" aria-hidden="true" />}
        onRefresh={onRefresh}
        isRefreshing={cargando}
      />

      {/* 2. Filtros de Estado */}
      <div className="bg-surface border-b border-line px-4 py-2 shrink-0">
        <FilterChipBar
          chips={[
            { id: 'todas', label: 'Todas', count: pendientesCount + enPreparacionCount },
            { id: 'pendientes', label: 'Pendientes', count: pendientesCount },
            { id: 'enPreparacion', label: 'En preparación', count: enPreparacionCount },
          ]}
          activeId={filtro}
          onSelect={(id) => {
            triggerLight();
            setFiltro(id as typeof filtro);
          }}
        />
      </div>

      {/* 3. Grid de Comandas KDS */}
      <div className="flex-1 overflow-y-auto p-4 pb-28">
        {error && (
          <ErrorState
            mensaje={error}
            onRetry={onRefresh}
            className="my-4"
          />
        )}

        {cargando && comandas.length === 0 && (
          <SkeletonList count={4} />
        )}

        {!error && !cargando && comandasOrdenadas.length === 0 && (
          <EmptyState
            icon={ChefHat}
            titulo="No hay comandas pendientes en este momento"
            subtitulo="La cocina está al día. Las nuevas comandas aparecerán automáticamente aquí."
          />
        )}

        {comandasOrdenadas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comandasOrdenadas.map((comanda) => {
              const esDemora = comanda.esDemora || comanda.minutosEspera > 15;
              const esPendiente = comanda.estado === 'Pendiente';
              const estaProcesando = procesandoId === comanda.id;

              // Destino de la comanda
              const destino =
                comanda.tipo === 'ParaLlevar'
                  ? `Para Llevar ${comanda.referencia ? `(${comanda.referencia})` : ''}`
                  : (comanda.mesa || 'Mesa');

              return (
                <Card
                  key={comanda.id}
                  accent={esDemora ? 'danger' : esPendiente ? 'warning' : 'info'}
                  className={`flex flex-col justify-between shadow-sm select-none p-0 overflow-hidden transition-all ${
                    esDemora ? 'border-2 border-danger' : ''
                  }`}
                >
                  {/* Cabecera de comanda con identificación clara */}
                  <div
                    className={`p-3.5 flex items-center justify-between border-b ${
                      esDemora
                        ? 'bg-danger-bg text-danger border-danger-border'
                        : esPendiente
                        ? 'bg-warning-bg/50 text-ink border-warning-border'
                        : 'bg-canvas text-ink border-line'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="text-xs font-black uppercase tracking-wider block text-ink">
                          Pedido N.º {comanda.pedidoNumero}
                        </span>
                        <StatusBadge estado={esPendiente ? 'Pendiente' : 'En preparación'} />

                        {comanda.esAdicional && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-accent text-white uppercase tracking-wider">
                            Adicional {comanda.numeroAdicional > 0 ? `#${comanda.numeroAdicional}` : ''}
                          </span>
                        )}

                        {comanda.modificada && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-warning text-white uppercase tracking-wider">
                            Modificada
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-extrabold text-ink leading-tight break-words">{destino}</h3>
                    </div>

                    {/* Tiempo de espera con alerta de demora si supera los 15 minutos */}
                    <div className="shrink-0 text-right">
                      {esDemora ? (
                        <div
                          className="flex items-center gap-1 font-black text-xs text-danger bg-danger-bg px-2 py-1 rounded-lg border border-danger-border animate-pulse motion-reduce:animate-none"
                          role="alert"
                          aria-label={`Comanda demorada: ${comanda.minutosEspera} minutos de espera`}
                        >
                          <AlertTriangle className="w-4 h-4 shrink-0 text-danger" aria-hidden="true" />
                          <span className="font-extrabold uppercase">Demorada · {comanda.minutosEspera} min</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 font-bold text-xs text-ink-muted">
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{comanda.minutosEspera} min</span>
                        </div>
                      )}

                      {comanda.horaLlegada && (
                        <p className="text-xs text-ink-muted mt-0.5">{comanda.horaLlegada}</p>
                      )}
                    </div>
                  </div>

                  {/* Lista de platos y observaciones para cocina */}
                  <div className="p-4 space-y-3 flex-1 bg-surface">
                    {comanda.lineas.map((linea, idx) => (
                      <div key={idx} className="border-b border-line/60 pb-2.5 last:border-0 last:pb-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-base font-black text-ink">
                            <span className="text-accent mr-1.5">{linea.cantidad}×</span>
                            {linea.producto}
                          </span>
                        </div>

                        {linea.elecciones && (
                          <p className="text-xs text-ink-muted mt-0.5 italic">
                            Opciones: {linea.elecciones}
                          </p>
                        )}

                        {linea.incluye && (
                          <p className="text-xs text-ink-muted mt-0.5">
                            Incluye: {linea.incluye}
                          </p>
                        )}

                        {linea.observacion && (
                          <div className="mt-1.5 text-xs font-bold text-danger bg-danger-bg/70 border border-danger-border/60 px-2.5 py-1 rounded-lg">
                            <span className="uppercase text-xs tracking-wider block text-danger/80">Nota especial:</span>
                            {linea.observacion}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Botón táctil gigante (mínimo 56px) para interactuar en cocina */}
                  <div className="p-3 bg-canvas border-t border-line">
                    {esPendiente ? (
                      <button
                        type="button"
                        disabled={estaProcesando}
                        onClick={() => void handleAccionEstado(comanda, 'enPreparacion')}
                        aria-label={`Empezar preparación del pedido número ${comanda.pedidoNumero}`}
                        className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-black py-4 rounded-xl min-h-[56px] text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 shadow-md cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-accent outline-hidden"
                      >
                        <Flame className="w-5 h-5" aria-hidden="true" />
                        <span>{estaProcesando ? 'Iniciando...' : 'Empezar a Preparar'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={estaProcesando}
                        onClick={() => void handleAccionEstado(comanda, 'lista')}
                        aria-label={`Marcar como listo el pedido número ${comanda.pedidoNumero}`}
                        className="w-full bg-success hover:opacity-90 disabled:opacity-50 text-white font-black py-4 rounded-xl min-h-[56px] text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 shadow-md cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-accent outline-hidden"
                      >
                        <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                        <span>{estaProcesando ? 'Completando...' : 'Marcar Listo'}</span>
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Barra Flotante de Deshacer (10 Segundos) */}
      {undoAccion && (
        <div
          role="region"
          aria-live="polite"
          aria-label="Opción para deshacer acción de cocina"
          className="absolute bottom-20 left-4 right-4 z-40 bg-ink text-surface rounded-2xl p-3.5 shadow-2xl border border-line flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold leading-tight break-words min-w-0">
                Pedido N.º {undoAccion.pedidoNumero} marcado como{' '}
                {undoAccion.nuevoEstado === 'enPreparacion' ? 'en preparación' : 'listo'}
              </span>
              <span className="text-xs font-extrabold text-accent shrink-0 tabular-nums">
                ({undoAccion.segundosRestantes}s)
              </span>
            </div>

            {/* Barra de progreso de cuenta regresiva */}
            <div className="w-full bg-surface/20 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(undoAccion.segundosRestantes / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={deshaciendo}
              onClick={() => void handleEjecutarDeshacer()}
              className="min-h-[44px] px-3 bg-accent text-white hover:opacity-90 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-surface"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>{deshaciendo ? 'Revirtiendo...' : 'Deshacer'}</span>
            </button>
            <button
              type="button"
              onClick={() => setUndoAccion(null)}
              className="min-h-[44px] min-w-[44px] p-2 text-surface/70 hover:text-surface flex items-center justify-center rounded-xl cursor-pointer"
              aria-label="Cerrar aviso de deshacer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
