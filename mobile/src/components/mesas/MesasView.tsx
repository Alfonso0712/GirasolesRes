import React, { useState, useMemo } from 'react';
import { Utensils, Clock, PlusCircle, Receipt, SlidersHorizontal, Plus, Pencil, Power, X } from 'lucide-react';
import type { MesaItem } from '../../types/mesa';
import type { RolUsuario } from '../../types/auth';
import { puede } from '../../config/permisos';
import { BottomSheet } from '../ui/BottomSheet';
import { ConfirmSheet } from '../ui/ConfirmSheet';
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
import { naturalCompare } from '../../utils/canonico';
import { MesaFormSheet } from './MesaFormSheet';

export interface MesasViewProps {
  mesas: MesaItem[];
  cargando: boolean;
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
  const [mesaSeleccionada, setMesaSeleccionada] = useState<MesaItem | null>(null);

  // Estados para modal de formulario y confirmación
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [mesaAEditar, setMesaAEditar] = useState<MesaItem | null>(null);
  const [mesaParaDesactivar, setMesaParaDesactivar] = useState<MesaItem | null>(null);
  const [desactivando, setDesactivando] = useState(false);

  const { triggerLight, triggerSuccess } = useHaptics();

  const puedeGestionar = puede(rol, 'mesas.gestionar');
  const puedeTomarPedido = puede(rol, 'pedidoMesa.crear');
  const puedeCobrar = puede(rol, 'cobros.procesar');

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
    if (modoGestion) return; // En modo gestión el clic de tarjeta no abre pedido
    triggerLight();
    if (mesa.ocupacion === 'Libre') {
      if (puedeTomarPedido) {
        onAbrirPedidoMesa(mesa);
      }
    } else {
      setMesaSeleccionada(mesa);
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
      { id: 'todas', label: 'Todas', count: modoGestion && mostrarInactivas ? mesas.length : libresCount + ocupadasCount },
      { id: 'libres', label: 'Libres', count: libresCount },
      { id: 'ocupadas', label: 'Ocupadas', count: ocupadasCount },
    ];
    if (modoGestion && mostrarInactivas) {
      base.push({ id: 'inactivas', label: 'Inactivas', count: inactivasCount });
    }
    return base;
  }, [modoGestion, mostrarInactivas, mesas.length, libresCount, ocupadasCount, inactivasCount]);

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {/* 1. Encabezado y Filtros */}
      <PageHeader
        title={modoGestion ? 'Gestión de Mesas' : 'Salón y Mesas'}
        subtitle={
          modoGestion
            ? `${mesas.length} ${pluralizar(mesas.length, 'mesa registrada', 'mesas registradas')}`
            : `${pluralizar(libresCount, 'libre', 'libres')} · ${pluralizar(ocupadasCount, 'ocupada', 'ocupadas')}`
        }
        icon={<Utensils className="w-5 h-5 text-white" aria-hidden="true" />}
        onRefresh={onRefresh}
        isRefreshing={cargando}
        actions={
          puedeGestionar ? (
            <Button
              variant={modoGestion ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                triggerLight();
                onToggleModoGestion?.(!modoGestion);
              }}
              className="min-h-[44px] px-3 flex items-center gap-1.5 font-bold"
              aria-label={modoGestion ? 'Salir de modo gestión de mesas' : 'Gestionar mesas'}
            >
              {modoGestion ? (
                <>
                  <X className="w-4 h-4" aria-hidden="true" />
                  <span>Salir</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                  <span>Gestionar</span>
                </>
              )}
            </Button>
          ) : undefined
        }
      />

      {/* 2. Banner de Modo Gestión del Administrador */}
      {modoGestion && puedeGestionar && (
        <div className="bg-surface border-b border-line px-4 py-3 shrink-0 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-black text-ink">Modo gestión de mesas</p>
              <p className="text-2xs text-ink-muted">Cree, edite o cambie la disponibilidad de mesas.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAbrirCrear}
              className="min-h-[44px] px-3 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Nueva Mesa</span>
            </Button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-line/60">
            <span className="text-xs font-semibold text-ink">Mostrar inactivas</span>
            <button
              type="button"
              role="switch"
              aria-checked={mostrarInactivas}
              onClick={() => {
                triggerLight();
                onToggleMostrarInactivas?.(!mostrarInactivas);
              }}
              className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-accent ${
                mostrarInactivas ? 'bg-accent' : 'bg-fill-muted'
              }`}
            >
              <span className="sr-only">Mostrar mesas inactivas</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-surface shadow-md ring-0 transition duration-200 ease-in-out ${
                  mostrarInactivas ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
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

      {/* 4. Grilla Táctil de Mesas */}
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

        {mesasFiltradas.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {mesasFiltradas.map((mesa) => {
              const esLibre = mesa.ocupacion === 'Libre';
              const estaActiva = mesa.activa;
              const interactiva = modoGestion ? false : (esLibre ? puedeTomarPedido : true);

              // Estado de la mesa para el badge
              const estadoBadge = !estaActiva ? 'Inactiva' : mesa.ocupacion;
              const tienePedidosAbiertos = mesa.ocupacion === 'Ocupada';

              return (
                <Card
                  key={mesa.id}
                  interactive={interactiva}
                  accent={!estaActiva ? 'none' : (esLibre ? 'success' : 'warning')}
                  onClick={interactiva ? () => handleMesaClick(mesa) : undefined}
                  padding="sm"
                  className={`flex flex-col justify-between min-h-[128px] pl-3.5 ${
                    !estaActiva ? 'opacity-80 bg-fill-subtle' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 w-full">
                    <span className="text-base font-extrabold text-ink whitespace-nowrap truncate min-w-0 flex-1">
                      {mesa.nombre}
                    </span>
                    <div className="shrink-0">
                      <StatusBadge estado={estadoBadge} />
                    </div>
                  </div>

                  {!modoGestion ? (
                    <>
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
                    </>
                  ) : (
                    /* Controles de Administración en la Tarjeta */
                    <div className="mt-4 pt-2.5 border-t border-line/60 flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAbrirEditar(mesa);
                        }}
                        className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-bold"
                        aria-label={`Editar mesa ${mesa.nombre}`}
                      >
                        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Editar</span>
                      </Button>

                      {estaActiva ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={tienePedidosAbiertos}
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerLight();
                            setMesaParaDesactivar(mesa);
                          }}
                          className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-bold ${
                            tienePedidosAbiertos ? 'opacity-50 cursor-not-allowed' : 'text-danger hover:bg-danger-bg'
                          }`}
                          title={tienePedidosAbiertos ? 'Tiene pedidos abiertos' : 'Desactivar mesa'}
                          aria-label={
                            tienePedidosAbiertos
                              ? `No se puede desactivar ${mesa.nombre}: tiene pedidos abiertos`
                              : `Desactivar mesa ${mesa.nombre}`
                          }
                        >
                          <Power className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{tienePedidosAbiertos ? 'Ocupada' : 'Desactivar'}</span>
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleActivarDirecto(mesa);
                          }}
                          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-bold text-success hover:bg-success-bg"
                          aria-label={`Activar mesa ${mesa.nombre}`}
                        >
                          <Power className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Activar</span>
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Bottom Sheet de Acciones para Mesa Ocupada (Modo Salón Normal) */}
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
              {puedeTomarPedido && (
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => {
                    const m = mesaSeleccionada;
                    setMesaSeleccionada(null);
                    onAbrirPedidoMesa(m);
                  }}
                  className="flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Agregar Más Platos a la Mesa</span>
                </Button>
              )}

              {onNavigateToCobro && puedeCobrar && (
                <Button
                  fullWidth
                  size="lg"
                  variant="secondary"
                  onClick={() => {
                    const id = mesaSeleccionada.id;
                    setMesaSeleccionada(null);
                    onNavigateToCobro(id);
                  }}
                  className="flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Receipt className="w-5 h-5" />
                  <span>Cobrar / Emitir Comprobante</span>
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
