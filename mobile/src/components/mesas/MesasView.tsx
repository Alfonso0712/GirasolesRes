import React, { useState, useMemo } from 'react';
import { Utensils, Clock, PlusCircle, Receipt, SlidersHorizontal, Plus, Pencil, Power } from 'lucide-react';
import type { MesaItem } from '../../types/mesa';
import type { RolUsuario } from '../../types/auth';
import { puede } from '../../config/permisos';
import { BottomSheet } from '../ui/BottomSheet';
import { ConfirmSheet } from '../ui/ConfirmSheet';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Card } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { StatusBadge } from '../ui/StatusBadge';
import { FilterChipBar } from '../ui/FilterChipBar';
import { Skeleton, SkeletonList } from '../ui/Skeleton';
import { PageHeader } from '../layout/PageHeader';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { useHaptics } from '../../hooks/useHaptics';
import { formatCurrency, pluralizar } from '../../utils/format';
import { naturalCompare } from '../../utils/canonico';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { MesaFormSheet } from './MesaFormSheet';

export interface MesasViewProps {
  mesas: MesaItem[];
  cargando: boolean;
  cargandoPedidos?: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onAbrirPedidoMesa: (mesa: MesaItem) => void;
  onNavigateToCobro?: (mesaId: string) => void;
  rol?: RolUsuario;
  modoGestion?: boolean;
  onToggleModoGestion?: (modo: boolean) => void;
  mostrarInactivas?: boolean;
  onToggleMostrarInactivas?: (mostrar: boolean) => void;
  onCrearMesa?: (nombre: string) => Promise<void>;
  onEditarMesa?: (id: string, nombre: string) => Promise<void>;
  onCambiarEstadoMesa?: (id: string, activa: boolean) => Promise<void>;
}

export const MesasView: React.FC<MesasViewProps> = ({
  mesas,
  cargando,
  cargandoPedidos = false,
  error,
  onRefresh,
  onAbrirPedidoMesa,
  onNavigateToCobro,
  rol,
  modoGestion = false,
  onToggleModoGestion,
  mostrarInactivas = false,
  onToggleMostrarInactivas,
  onCrearMesa,
  onEditarMesa,
  onCambiarEstadoMesa,
}) => {
  const [filtro, setFiltro] = useState<'todas' | 'libres' | 'ocupadas' | 'inactivas'>('todas');
  const [mesaSeleccionadaId, setMesaSeleccionadaId] = useState<string | null>(null);

  // Estados para modal de formulario y confirmación
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [mesaAEditar, setMesaAEditar] = useState<MesaItem | null>(null);
  const [mesaParaDesactivar, setMesaParaDesactivar] = useState<MesaItem | null>(null);
  const [desactivando, setDesactivando] = useState(false);

  const { triggerLight, triggerSuccess } = useHaptics();
  const { sinConexion } = useNetworkStatus();

  const puedeGestionar = puede(rol, 'mesas.gestionar');
  const puedeTomarPedido = puede(rol, 'pedidoMesa.crear');
  const puedeCobrar = puede(rol, 'cobros.procesar');
  const esMozo = rol === 'Mozo';

  const mesaSeleccionada = useMemo(() => {
    if (!mesaSeleccionadaId) return null;
    return mesas.find((m) => m.id === mesaSeleccionadaId) || null;
  }, [mesas, mesaSeleccionadaId]);

  // Mesas ordenadas naturalmente
  const mesasOrdenadas = useMemo(() => {
    return [...mesas].sort((a, b) => naturalCompare(a.nombre, b.nombre));
  }, [mesas]);

  // Filtrado de mesas según modo de visualización o gestión
  const mesasFiltradas = useMemo(() => {
    return mesasOrdenadas.filter((m) => {
      if (!modoGestion && !m.activa) return false;
      if (modoGestion && !mostrarInactivas && !m.activa) return false;

      if (filtro === 'libres') return m.activa && m.ocupacion === 'Libre';
      if (filtro === 'ocupadas') return m.activa && m.ocupacion === 'Ocupada';
      if (filtro === 'inactivas') return !m.activa;
      return true;
    });
  }, [mesasOrdenadas, modoGestion, mostrarInactivas, filtro]);

  const libresCount = mesas.filter((m) => m.activa && m.ocupacion === 'Libre').length;
  const ocupadasCount = mesas.filter((m) => m.activa && m.ocupacion === 'Ocupada').length;
  const inactivasCount = mesas.filter((m) => !m.activa).length;

  const handleMesaClick = (mesa: MesaItem) => {
    if (modoGestion) return;
    triggerLight();
    if (mesa.ocupacion === 'Libre') {
      if (puedeTomarPedido) {
        onAbrirPedidoMesa(mesa);
      }
    } else {
      setMesaSeleccionadaId(mesa.id);
    }
  };

  const handleAbrirCrear = () => {
    triggerLight();
    setMesaAEditar(null);
    setFormSheetOpen(true);
  };

  const handleAbrirEditar = (mesa: MesaItem) => {
    triggerLight();
    setMesaAEditar(mesa);
    setFormSheetOpen(true);
  };

  const handleGuardarForm = async (nombre: string) => {
    if (mesaAEditar) {
      if (onEditarMesa) {
        await onEditarMesa(mesaAEditar.id, nombre);
      }
    } else {
      if (onCrearMesa) {
        await onCrearMesa(nombre);
      }
    }
    triggerSuccess();
  };

  const handleActivarDirecto = async (mesa: MesaItem) => {
    triggerLight();
    if (onCambiarEstadoMesa) {
      await onCambiarEstadoMesa(mesa.id, true);
      triggerSuccess();
    }
  };

  const handleConfirmarDesactivar = async () => {
    if (!mesaParaDesactivar || !onCambiarEstadoMesa) return;
    setDesactivando(true);
    try {
      await onCambiarEstadoMesa(mesaParaDesactivar.id, false);
      triggerSuccess();
      setMesaParaDesactivar(null);
    } finally {
      setDesactivando(false);
    }
  };

  const chips = useMemo(() => {
    const base = [
      {
        id: 'todas',
        label: 'Todas',
        count: modoGestion && mostrarInactivas ? mesas.length : libresCount + ocupadasCount,
      },
      { id: 'libres', label: 'Libres', count: libresCount },
      { id: 'ocupadas', label: 'Ocupadas', count: ocupadasCount },
    ];
    if (modoGestion && mostrarInactivas) {
      base.push({ id: 'inactivas', label: 'Inactivas', count: inactivasCount });
    }
    return base;
  }, [modoGestion, mostrarInactivas, mesas.length, libresCount, ocupadasCount, inactivasCount]);

  const tieneDatosMesaSeleccionada = Boolean(
    mesaSeleccionada &&
      ((typeof mesaSeleccionada.totalPendiente === 'number') ||
        (typeof mesaSeleccionada.minutosOcupada === 'number') ||
        (mesaSeleccionada.pedidosMesa && mesaSeleccionada.pedidosMesa.length > 0))
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {/* 1. Encabezado */}
      <PageHeader
        title={modoGestion ? 'Gestionar mesas' : 'Salón y Mesas'}
        subtitle={
          modoGestion
            ? pluralizar(mesas.length, 'mesa', 'mesas')
            : `${pluralizar(libresCount, 'libre', 'libres')} · ${pluralizar(ocupadasCount, 'ocupada', 'ocupadas')}`
        }
        icon={!modoGestion ? <Utensils className="w-5 h-5 text-white" aria-hidden="true" /> : undefined}
        onVolver={
          modoGestion
            ? () => {
                triggerLight();
                onToggleModoGestion?.(false);
              }
            : undefined
        }
        onRefresh={onRefresh}
        isRefreshing={cargando}
        actions={
          !modoGestion && puedeGestionar ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                triggerLight();
                onToggleModoGestion?.(true);
              }}
              className="min-h-[44px] px-3 flex items-center gap-1.5 font-bold"
              aria-label="Gestionar mesas"
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              <span>Gestionar</span>
            </Button>
          ) : undefined
        }
      />

      {/* 2. Barra de Modo Gestión del Administrador */}
      {modoGestion && puedeGestionar && (
        <div className="bg-surface border-b border-line px-4 py-3 shrink-0 space-y-3 barra-accion-mano">
          <Button
            variant="primary"
            fullWidth
            disabled={sinConexion}
            title={sinConexion ? 'Sin conexión a internet' : undefined}
            onClick={handleAbrirCrear}
            className="min-h-[44px] flex items-center justify-center gap-2 font-bold"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>{sinConexion ? 'Sin conexión' : 'Nueva mesa'}</span>
          </Button>

          <div className="flex items-center justify-between pt-2 border-t border-line/60">
            <span className="text-xs font-semibold text-ink">Mostrar inactivas</span>
            <Switch
              checked={mostrarInactivas}
              onChange={(nuevo) => {
                triggerLight();
                onToggleMostrarInactivas?.(nuevo);
              }}
              aria-label="Mostrar mesas inactivas"
            />
          </div>
        </div>
      )}

      {/* 3. Barra de Filtros */}
      <div className="bg-surface border-b border-line px-4 py-2 shrink-0">
        <FilterChipBar
          chips={chips}
          activeId={filtro}
          onSelect={(id) => {
            triggerLight();
            setFiltro(id as 'todas' | 'libres' | 'ocupadas' | 'inactivas');
          }}
        />
      </div>

      {/* 4. Contenido Principal: Lista en Modo Gestión o Cuadrícula en Salón */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {error && (
          <ErrorState
            mensaje={error}
            onRetry={onRefresh}
            className="my-4"
          />
        )}

        {cargando && mesas.length === 0 && (
          <SkeletonList count={6} />
        )}

        {!error && !cargando && mesasFiltradas.length === 0 && (
          <EmptyState
            titulo="No hay mesas disponibles"
            subtitulo={
              modoGestion
                ? 'No se encontraron mesas para el criterio seleccionado. Puede registrar una nueva mesa.'
                : 'No se encontraron mesas activas en el salón según el filtro seleccionado.'
            }
          />
        )}

        {mesasFiltradas.length > 0 && modoGestion ? (
          /* Lista de filas de al menos 64 px en Modo Gestión */
          <div className="space-y-2.5">
            {mesasFiltradas.map((mesa) => {
              const esLibre = mesa.ocupacion === 'Libre';
              const estaActiva = mesa.activa;
              const estadoBadge = !estaActiva ? 'Inactiva' : mesa.ocupacion;
              const tienePedidosAbiertos = mesa.ocupacion === 'Ocupada';

              return (
                <Card
                  key={mesa.id}
                  accent={!estaActiva ? 'none' : esLibre ? 'success' : 'warning'}
                  padding="sm"
                  className={`min-h-16 px-4 py-3 flex items-center justify-between gap-3 ${
                    !estaActiva ? 'opacity-80 bg-fill-subtle' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2.5">
                    <span className="text-base font-semibold text-ink leading-tight break-words">
                      {mesa.nombre}
                    </span>
                    <StatusBadge estado={estadoBadge} />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <IconButton
                      variant="outline"
                      disabled={sinConexion}
                      onClick={() => handleAbrirEditar(mesa)}
                      aria-label={`Editar ${mesa.nombre}`}
                      className="w-11 h-11 min-w-[44px] min-h-[44px]"
                    >
                      <Pencil className="w-4 h-4 text-ink" aria-hidden="true" />
                    </IconButton>

                    {estaActiva ? (
                      <IconButton
                        variant="outline"
                        disabled={tienePedidosAbiertos || sinConexion}
                        onClick={() => {
                          triggerLight();
                          setMesaParaDesactivar(mesa);
                        }}
                        aria-label={`Desactivar ${mesa.nombre}`}
                        title={
                          sinConexion
                            ? 'Sin conexión a internet'
                            : tienePedidosAbiertos
                            ? 'No se puede desactivar una mesa ocupada'
                            : `Desactivar ${mesa.nombre}`
                        }
                        className="w-11 h-11 min-w-[44px] min-h-[44px]"
                      >
                        <Power className="w-4 h-4 text-danger" aria-hidden="true" />
                      </IconButton>
                    ) : (
                      <IconButton
                        variant="outline"
                        disabled={sinConexion}
                        onClick={() => void handleActivarDirecto(mesa)}
                        aria-label={`Activar ${mesa.nombre}`}
                        title={sinConexion ? 'Sin conexión a internet' : `Activar ${mesa.nombre}`}
                        className="w-11 h-11 min-w-[44px] min-h-[44px]"
                      >
                        <Power className="w-4 h-4 text-success" aria-hidden="true" />
                      </IconButton>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          mesasFiltradas.length > 0 && (
            /* Cuadrícula de Salón (todos los roles) */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {mesasFiltradas.map((mesa) => {
                const esLibre = mesa.ocupacion === 'Libre';
                const estaActiva = mesa.activa;
                const interactiva = esLibre ? puedeTomarPedido : true;
                const estadoBadge = !estaActiva ? 'Inactiva' : mesa.ocupacion;

                return (
                  <Card
                    key={mesa.id}
                    interactive={interactiva}
                    accent={!estaActiva ? 'none' : esLibre ? 'success' : 'warning'}
                    onClick={interactiva ? () => handleMesaClick(mesa) : undefined}
                    padding="sm"
                    className={`flex flex-col justify-between min-h-[116px] p-3.5 ${
                      !estaActiva ? 'opacity-80 bg-fill-subtle' : ''
                    }`}
                  >
                    {/* Línea 1: Nombre completo */}
                    <span className="text-lg font-semibold text-ink leading-tight break-words block">
                      {mesa.nombre}
                    </span>

                    {/* Línea 2: StatusBadge */}
                    <div className="mt-2">
                      <StatusBadge estado={estadoBadge} />
                    </div>

                    {/* Línea 3 (Ocupada): En mesa: {minutos} si el dato existe */}
                    {!esLibre &&
                      typeof mesa.minutosOcupada === 'number' &&
                      mesa.minutosOcupada > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-ink-muted">
                          <Clock className="w-3.5 h-3.5 shrink-0 text-danger" aria-hidden="true" />
                          <span>
                            En mesa: {pluralizar(mesa.minutosOcupada, 'minuto', 'minutos')}
                          </span>
                        </div>
                      )}
                  </Card>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* 5. Bottom Sheet de Acciones para Mesa Ocupada */}
      <BottomSheet
        isOpen={Boolean(mesaSeleccionada)}
        onClose={() => setMesaSeleccionadaId(null)}
        title={mesaSeleccionada ? `${mesaSeleccionada.nombre} (Ocupada)` : ''}
      >
        {mesaSeleccionada && (
          <div className="space-y-4">
            {cargandoPedidos && !tieneDatosMesaSeleccionada ? (
              <div className="space-y-3" aria-busy="true">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            ) : (
              <>
                <div className="bg-canvas border border-line rounded-2xl p-4 flex justify-between items-center gap-4">
                  {/* RV-154: El Mozo no ve importes, solo estado y tiempo */}
                  {!esMozo && (
                    <div>
                      <p className="text-xs text-ink-muted">Total acumulado</p>
                      <p className="text-xl font-black text-accent tabular-nums">
                        {typeof mesaSeleccionada.totalPendiente === 'number'
                          ? formatCurrency(mesaSeleccionada.totalPendiente)
                          : '—'}
                      </p>
                    </div>
                  )}
                  <div className={esMozo ? 'text-left' : 'text-right'}>
                    <p className="text-xs text-ink-muted">Tiempo en mesa</p>
                    <p className="text-sm font-bold text-ink">
                      {typeof mesaSeleccionada.minutosOcupada === 'number' &&
                      mesaSeleccionada.minutosOcupada > 0
                        ? pluralizar(mesaSeleccionada.minutosOcupada, 'minuto', 'minutos')
                        : '—'}
                    </p>
                  </div>
                </div>

                {/* Lista de pedidos abiertos de la mesa */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
                    Pedidos de la mesa
                  </span>
                  {mesaSeleccionada.pedidosMesa && mesaSeleccionada.pedidosMesa.length > 0 ? (
                    <div className="divide-y divide-line bg-canvas rounded-2xl border border-line overflow-hidden">
                      {mesaSeleccionada.pedidosMesa.map((ped) => (
                        <div
                          key={ped.id}
                          className="p-3 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-ink">
                              Pedido N.º {ped.numero}
                            </span>
                            <StatusBadge estado={ped.estado === 'EnPreparacion' ? 'En preparación' : ped.estado} />
                          </div>
                          {!esMozo && (
                            <span className="font-bold text-accent tabular-nums shrink-0">
                              {formatCurrency(ped.total)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-canvas rounded-2xl border border-line text-xs text-ink-muted">
                      —
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2.5">
              {puedeTomarPedido && (
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => {
                    const m = mesaSeleccionada;
                    setMesaSeleccionadaId(null);
                    onAbrirPedidoMesa(m);
                  }}
                  className="flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Agregar platos</span>
                </Button>
              )}

              {onNavigateToCobro && puedeCobrar && (
                <Button
                  fullWidth
                  size="lg"
                  variant="primary"
                  onClick={() => {
                    const id = mesaSeleccionada.id;
                    setMesaSeleccionadaId(null);
                    onNavigateToCobro(id);
                  }}
                  className="flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Receipt className="w-5 h-5" />
                  <span>Ir a cobrar</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </BottomSheet>

      {/* 6. Modal de Formulario Crear / Editar Mesa */}
      <MesaFormSheet
        isOpen={formSheetOpen}
        onClose={() => setFormSheetOpen(false)}
        mesaAEditar={mesaAEditar}
        todasLasMesas={mesas}
        onSave={handleGuardarForm}
      />

      {/* 7. ConfirmSheet para Desactivar Mesa */}
      <ConfirmSheet
        isOpen={Boolean(mesaParaDesactivar)}
        titulo={`¿Está seguro de desactivar la mesa ${mesaParaDesactivar?.nombre || ''}?`}
        mensaje="No estará disponible para nuevos pedidos."
        etiquetaConfirmar="Desactivar"
        etiquetaCancelar="Cancelar"
        tono="peligro"
        cargando={desactivando}
        onConfirmar={() => void handleConfirmarDesactivar()}
        onCancelar={() => setMesaParaDesactivar(null)}
      />
    </div>
  );
};
