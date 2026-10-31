import React from 'react';
import { RotateCcw, Utensils, AlertCircle, Filter, Plus } from 'lucide-react';
import type { MesaItem } from '../../types/mesa';
import { MesaCard } from './MesaCard';

interface MesaGridProps {
  cargando: boolean;
  errorCarga: string | null;
  mesas: MesaItem[];
  todasLasMesas: MesaItem[];
  mesaResaltadaId: string | null;
  esAdmin: boolean;
  esMozo: boolean;
  esCajero: boolean;
  onReintentar: () => void;
  onAbrirCrear: () => void;
  onLimpiarFiltro: () => void;
  onEditar: (mesa: MesaItem) => void;
  onCambiarEstado: (mesa: MesaItem, accion: 'activar' | 'desactivar', e?: React.MouseEvent) => void;
  onAccionRol: (mesa: MesaItem, accion: string) => void;
}

export const MesaGrid: React.FC<MesaGridProps> = ({
  cargando,
  errorCarga,
  mesas,
  todasLasMesas,
  mesaResaltadaId,
  esAdmin,
  esMozo,
  esCajero,
  onReintentar,
  onAbrirCrear,
  onLimpiarFiltro,
  onEditar,
  onCambiarEstado,
  onAccionRol
}) => {
  return (
    <div className="w-full bg-surface rounded-2xl border border-neutral-200/80 p-3.5 sm:p-4 lg:p-5 flex flex-col shadow-2xs">
      <div className="w-full">
        {/* Estado de Carga Inicial (Skeletons) */}
        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`mesa-skeleton-${i}`}
                className="rounded-2xl border border-neutral-200/60 p-4 min-h-[140px] flex flex-col justify-between animate-pulse bg-neutral-50/70"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="w-16 h-5 bg-neutral-200 rounded-md" />
                  <div className="w-20 h-6 bg-neutral-200 rounded-lg" />
                </div>
                <div className="w-full h-8 bg-neutral-200/80 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : errorCarga && mesas.length === 0 ? (
          /* Estado de Error Total sin datos (MSG-94) */
          <div className="py-12 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-danger flex items-center justify-center mb-4 border border-rose-200">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="font-sans font-bold text-lg text-ink mb-1">
              No se pudieron cargar las mesas
            </h3>
            <p className="text-xs text-ink-muted max-w-sm mb-4">
              Intente nuevamente para sincronizar el estado del salón con el servidor.
            </p>
            <button
              type="button"
              onClick={onReintentar}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-2xs hover:bg-primary-hover transition-colors cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reintentar</span>
            </button>
          </div>
        ) : todasLasMesas.length === 0 ? (
          /* Estado: Sin mesas registradas (MSG-91 / MSG-92) */
          <div className="py-12 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-accent flex items-center justify-center mb-4 border border-amber-200">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="font-sans font-bold text-lg text-ink mb-1">
              No hay mesas registradas
            </h3>
            <p className="text-xs text-ink-muted max-w-sm mb-4">
              {esAdmin
                ? 'Use "Nueva mesa" para registrar la primera mesa del salón.'
                : 'Pida a la administradora que registre las mesas del local.'}
            </p>
            {esAdmin && (
              <button
                type="button"
                onClick={onAbrirCrear}
                className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-2xs hover:bg-primary-hover transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva mesa</span>
              </button>
            )}
          </div>
        ) : mesas.length === 0 ? (
          /* Estado: Sin resultados con el filtro (MSG-93) */
          <div className="py-12 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-500 flex items-center justify-center mb-3 border border-neutral-200">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-bold text-base text-ink mb-1">
              No hay mesas con ese estado
            </h3>
            <p className="text-xs text-ink-muted max-w-sm mb-4">
              Cambie el filtro para visualizar otras mesas disponibles en el salón.
            </p>
            <button
              type="button"
              onClick={onLimpiarFiltro}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Ver todas las mesas
            </button>
          </div>
        ) : (
          /* Cuadrícula de Tarjetas de Mesas en orden natural (RNF-18 / CUS06.2) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4">
            {mesas.map((mesa) => (
              <MesaCard
                key={mesa.id}
                mesa={mesa}
                esAdmin={esAdmin}
                esMozo={esMozo}
                esCajero={esCajero}
                isHighlighted={mesaResaltadaId === mesa.id}
                onEditar={onEditar}
                onCambiarEstado={onCambiarEstado}
                onAccionRol={onAccionRol}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
