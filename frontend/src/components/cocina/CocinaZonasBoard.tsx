import React, { type RefObject } from 'react';
import { RotateCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ComandaCard } from './ComandaCard';
import type { ComandaKdsItem } from '../../types/comanda';

export interface CocinaZonasBoardProps {
  cargando: boolean;
  comandas: ComandaKdsItem[];
  errorCarga: string | null;
  onReintentar: () => void;
  comandasPendientes: ComandaKdsItem[];
  comandasEnPreparacion: ComandaKdsItem[];
  comandasNuevas: Record<string, boolean>;
  procesandoIds: Record<string, boolean>;
  onIniciarPreparacion: (comanda: ComandaKdsItem) => void;
  onMarcarComoLista: (comanda: ComandaKdsItem) => void;
  tocandoTarjetaRef: RefObject<boolean | null>;
}

export const CocinaZonasBoard: React.FC<CocinaZonasBoardProps> = ({
  cargando,
  comandas,
  errorCarga,
  onReintentar,
  comandasPendientes,
  comandasEnPreparacion,
  comandasNuevas,
  procesandoIds,
  onIniciarPreparacion,
  onMarcarComoLista,
  tocandoTarjetaRef,
}) => {
  return (
    <div className="w-full">
      {cargando && comandas.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-3">
          <RotateCw className="w-8 h-8 animate-spin text-accent" />
          <span className="text-base font-semibold">Cargando comandas de cocina…</span>
        </div>
      ) : errorCarga && comandas.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
          <h2 className="text-lg font-bold text-neutral-800 mb-1">{errorCarga}</h2>
          <button
            type="button"
            onClick={onReintentar}
            className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      ) : comandas.length === 0 ? (
        /* Estado sin comandas (MSG-124 / Sección 7) */
        <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-surface/70 rounded-3xl border border-dashed border-amber-300 my-auto">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-success flex items-center justify-center mb-4 shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold font-sans text-neutral-800 mb-1">
            No hay comandas pendientes
          </h2>
          <p className="text-sm text-neutral-500 max-w-md">
            Todo al día en cocina. Las nuevas comandas registradas por los mozos o en
            caja aparecerán aquí automáticamente en 5 segundos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
          {/* ZONA 1: PENDIENTES */}
          <section
            aria-label="Comandas Pendientes"
            className="flex flex-col gap-3.5"
            onPointerDown={() => {
              tocandoTarjetaRef.current = true;
            }}
            onPointerUp={() => {
              tocandoTarjetaRef.current = false;
            }}
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                <h2 className="text-lg font-bold font-sans text-neutral-800 uppercase tracking-wide">
                  Pendientes
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900 border border-amber-300">
                {comandasPendientes.length} comanda
                {comandasPendientes.length === 1 ? '' : 's'}
              </span>
            </div>

            {comandasPendientes.length === 0 ? (
              <div className="p-8 text-center bg-surface/60 rounded-3xl border border-neutral-200 text-neutral-500 text-sm">
                No hay comandas en espera de preparación.
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {comandasPendientes.map((c) => (
                  <ComandaCard
                    key={c.id}
                    comanda={c}
                    esNueva={Boolean(comandasNuevas[c.id])}
                    estaProcesando={Boolean(procesandoIds[c.id])}
                    tipoZona="pendiente"
                    onAccionPrincipal={onIniciarPreparacion}
                  />
                ))}
              </div>
            )}
          </section>
          {/* ZONA 2: EN PREPARACIÓN */}
          <section
            aria-label="Comandas En Preparación"
            className="flex flex-col gap-3.5"
            onPointerDown={() => {
              tocandoTarjetaRef.current = true;
            }}
            onPointerUp={() => {
              tocandoTarjetaRef.current = false;
            }}
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
                <h2 className="text-lg font-bold font-sans text-neutral-800 uppercase tracking-wide">
                  En Preparación
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                {comandasEnPreparacion.length} comanda
                {comandasEnPreparacion.length === 1 ? '' : 's'}
              </span>
            </div>

            {comandasEnPreparacion.length === 0 ? (
              <div className="p-8 text-center bg-surface/60 rounded-3xl border border-neutral-200 text-neutral-500 text-sm">
                No hay comandas en preparación en este momento.
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {comandasEnPreparacion.map((c) => (
                  <ComandaCard
                    key={c.id}
                    comanda={c}
                    estaProcesando={Boolean(procesandoIds[c.id])}
                    tipoZona="en_preparacion"
                    onAccionPrincipal={onMarcarComoLista}
                  />
                ))}
              </div>
            )}            </section>
        </div>
      )}
    </div>
  );
};
