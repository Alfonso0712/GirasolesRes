import React, { useState } from 'react';
import { CalendarCheck, AlertTriangle, Search, UtensilsCrossed, X } from 'lucide-react';
import type { PlatoMenuDiaDto } from '../../services/menuDiaService';
import { useHaptics } from '../../hooks/useHaptics';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { Card } from '../ui/Card';
import { FilterChipBar } from '../ui/FilterChipBar';
import { SkeletonList } from '../ui/Skeleton';
import { PageHeader } from '../layout/PageHeader';
import { ConfirmSheet } from '../ui/ConfirmSheet';
import { useToast } from '../../context/ToastContext';
import { pluralizar } from '../../utils/format';

export interface MenuDiaViewProps {
  platos: PlatoMenuDiaDto[];
  cargando: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onCambiarDisponibilidad: (productoId: string, nuevoAgotado: boolean) => Promise<void>;
  puedeModificar?: boolean;
}

export const MenuDiaView: React.FC<MenuDiaViewProps> = ({
  platos,
  cargando,
  error,
  onRefresh,
  onCambiarDisponibilidad,
  puedeModificar = true,
}) => {
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'todos' | 'disponibles' | 'agotados'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [platoParaAgotar, setPlatoParaAgotar] = useState<PlatoMenuDiaDto | null>(null);

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();
  const { mostrar } = useToast();

  const ejecutarCambioDisponibilidad = async (plato: PlatoMenuDiaDto, nuevoAgotado: boolean) => {
    if (!puedeModificar) return;
    triggerLight();
    setProcesandoId(plato.productoId);

    try {
      await onCambiarDisponibilidad(plato.productoId, nuevoAgotado);
      triggerSuccess();
      if (nuevoAgotado) {
        mostrar({
          tipo: 'aviso',
          mensaje: `${plato.nombre} marcado como AGOTADO para los mozos`,
        });
      } else {
        mostrar({
          tipo: 'exito',
          mensaje: `${plato.nombre} restablecido como DISPONIBLE`,
        });
      }
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'Error al actualizar disponibilidad';
      mostrar({ tipo: 'error', mensaje: msg });
    } finally {
      setProcesandoId(null);
    }
  };

  const platosFiltrados = platos.filter((p) => {
    const query = busqueda.trim().toLowerCase();
    const coincideBusqueda =
      query === '' ||
      p.nombre.toLowerCase().includes(query) ||
      p.categoria.toLowerCase().includes(query);

    if (!coincideBusqueda) return false;
    if (filtro === 'disponibles') return !p.agotado;
    if (filtro === 'agotados') return p.agotado;
    return true;
  });

  const disponiblesCount = platos.filter((p) => !p.agotado).length;
  const agotadosCount = platos.filter((p) => p.agotado).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {/* 1. Encabezado */}
      <PageHeader
        title="Control de Platos (Cocina)"
        subtitle={`${pluralizar(disponiblesCount, 'plato disponible', 'platos disponibles')} · ${pluralizar(agotadosCount, 'agotado', 'agotados')}`}
        icon={<CalendarCheck className="w-5 h-5 text-white" aria-hidden="true" />}
        onRefresh={onRefresh}
        isRefreshing={cargando}
      />

      {/* 2. Barra de Búsqueda Rápida Táctil */}
      <div className="bg-surface border-b border-line px-4 py-2.5 shrink-0 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar plato o categoría..."
            className="w-full bg-canvas border border-line rounded-xl pl-9 pr-9 py-2.5 text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:ring-2 focus:ring-accent"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-ink-muted hover:text-ink cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Filtros de Estado */}
      <div className="bg-surface border-b border-line px-4 py-2 shrink-0">
        <FilterChipBar
          chips={[
            { id: 'todos', label: 'Todos', count: platos.length },
            { id: 'disponibles', label: 'Disponibles', count: disponiblesCount },
            { id: 'agotados', label: 'Agotados', count: agotadosCount },
          ]}
          activeId={filtro}
          onSelect={(id) => {
            triggerLight();
            setFiltro(id as typeof filtro);
          }}
        />
      </div>

      {/* 4. Lista de Platos y Acciones de Disponibilidad */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {error && (
          <ErrorState
            mensaje={error}
            onRetry={onRefresh}
            className="my-4"
          />
        )}

        {cargando && platos.length === 0 && (
          <SkeletonList count={6} />
        )}

        {!error && !cargando && platosFiltrados.length === 0 && (
          <EmptyState
            icon={UtensilsCrossed}
            titulo="No se encontraron platos"
            subtitulo="No hay platos registrados en el menú del día que coincidan con la búsqueda."
          />
        )}

        {platosFiltrados.map((plato) => {
          const esAgotado = plato.agotado;
          const estaProcesando = procesandoId === plato.productoId;

          return (
            <Card
              key={plato.productoId}
              accent={esAgotado ? 'danger' : 'success'}
              className={`flex items-center justify-between select-none ${
                esAgotado ? 'bg-danger-bg/20' : ''
              }`}
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <h3 className={`text-base font-extrabold leading-snug break-words min-w-0 ${esAgotado ? 'text-ink-muted line-through' : 'text-ink'}`}>
                    {plato.nombre}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-ink-muted font-medium">
                    {plato.categoria}
                  </span>
                  {esAgotado && (
                    <span className="text-xs font-black text-danger bg-danger-bg border border-danger-border px-1.5 py-0.5 rounded-sm">
                      AGOTADO
                    </span>
                  )}
                </div>
              </div>

              {/* Botón táctil para alternar agotado */}
              {puedeModificar && (
                <div className="shrink-0">
                  {esAgotado ? (
                    <button
                      type="button"
                      disabled={estaProcesando}
                      onClick={() => void ejecutarCambioDisponibilidad(plato, false)}
                      aria-label={`Marcar ${plato.nombre} como disponible`}
                      className="bg-success text-white font-black text-xs px-3.5 py-2.5 rounded-xl min-h-[44px] flex items-center gap-1.5 active:scale-95 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <span>Habilitar</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={estaProcesando}
                      onClick={() => {
                        triggerLight();
                        setPlatoParaAgotar(plato);
                      }}
                      aria-label={`Marcar ${plato.nombre} como agotado`}
                      className="bg-danger-bg text-danger border border-danger-border font-black text-xs px-3.5 py-2.5 rounded-xl min-h-[44px] flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Agotar</span>
                    </button>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* 5. Modal de Confirmación para Agotar Plato */}
      <ConfirmSheet
        isOpen={Boolean(platoParaAgotar)}
        onCancelar={() => setPlatoParaAgotar(null)}
        titulo={`¿Marcar ${platoParaAgotar?.nombre || ''} como agotado?`}
        mensaje="No se podrán tomar nuevos pedidos de este plato."
        etiquetaConfirmar="Marcar Agotado"
        etiquetaCancelar="Cancelar"
        tono="peligro"
        onConfirmar={() => {
          if (!platoParaAgotar) return;
          const p = platoParaAgotar;
          setPlatoParaAgotar(null);
          void ejecutarCambioDisponibilidad(p, true);
        }}
      />
    </div>
  );
};
