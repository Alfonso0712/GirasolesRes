import React from 'react';
import {
  CheckCircle2,
  Clock,
  Power,
  PowerOff,
  Edit2,
  PlusCircle,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import type { MesaItem } from '../../types/mesa';

interface MesaCardProps {
  mesa: MesaItem;
  esAdmin: boolean;
  esMozo: boolean;
  esCajero: boolean;
  isHighlighted?: boolean;
  onEditar?: (mesa: MesaItem, e?: React.MouseEvent) => void;
  onCambiarEstado?: (mesa: MesaItem, accion: 'activar' | 'desactivar', e?: React.MouseEvent) => void;
  onAccionRol?: (mesa: MesaItem, accion: string) => void;
}

export const MesaCard: React.FC<MesaCardProps> = ({
  mesa,
  esAdmin,
  esMozo,
  esCajero,
  isHighlighted = false,
  onEditar,
  onCambiarEstado,
  onAccionRol
}) => {
  const esLibre = mesa.ocupacion === 'Libre';
  const esOcupada = mesa.ocupacion === 'Ocupada';
  const esInactiva = !mesa.activa;

  // RV-58: Colorimetría semántica e icono diferenciado según Design System
  let estiloCard = 'bg-surface border-neutral-200/90 text-neutral-800 shadow-2xs hover:shadow-md';
  let badgeColor = 'bg-neutral-100 text-neutral-600 border-neutral-200';
  let IconoEstado = CheckCircle2;

  if (esInactiva) {
    estiloCard = 'bg-neutral-100/70 border-neutral-200/80 text-neutral-500 opacity-80';
    badgeColor = 'bg-neutral-200/60 text-neutral-500 border-neutral-300';
    IconoEstado = PowerOff;
  } else if (esLibre) {
    estiloCard = 'bg-emerald-50/40 border-emerald-200/90 text-emerald-950 shadow-2xs hover:border-emerald-400 hover:shadow-md';
    badgeColor = 'bg-emerald-100/80 text-emerald-800 border-emerald-200';
    IconoEstado = CheckCircle2;
  } else if (esOcupada) {
    estiloCard = 'bg-amber-50/40 border-amber-200/90 text-amber-950 shadow-2xs hover:border-amber-400 hover:shadow-md';
    badgeColor = 'bg-amber-100/80 text-accent border-amber-200';
    IconoEstado = Clock;
  }

  // Resaltado temporal post-mutación (Shneiderman 3)
  const claseResaltado = isHighlighted
    ? 'ring-2 ring-accent ring-offset-2 scale-[1.02] transition-transform duration-300'
    : 'transition-all duration-200';

  const handleClickCard = () => {
    if (esInactiva) return;

    if (esMozo || esAdmin) {
      if (esLibre) onAccionRol?.(mesa, 'REGISTRAR PEDIDO');
      else if (esOcupada) onAccionRol?.(mesa, 'OPCIONES_MESA_OCUPADA');
    } else if (esCajero && esOcupada) {
      onAccionRol?.(mesa, 'COBRAR');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClickCard();
    }
  };

  return (
    <div
      role="article"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`rounded-2xl border p-3.5 sm:p-4 flex flex-col justify-between min-h-[140px] h-auto relative select-none ${estiloCard} ${claseResaltado}`}
    >
      {/* Encabezado de la Tarjeta con Flexbox Limpio (Título + Badge a la izquierda, Acciones Admin a la derecha) */}
      <div className="flex justify-between items-start gap-2 mb-1.5">
        <div className="flex flex-col gap-1 min-w-0">
          <h3
            className="font-sans font-semibold text-sm sm:text-base lg:text-lg text-ink tabular-nums break-words leading-snug line-clamp-2"
            title={mesa.nombre}
          >
            {mesa.nombre}
          </h3>
          <span
            className={`px-2 py-0.5 text-xs font-semibold rounded-lg border shadow-2xs inline-flex items-center gap-1 w-fit ${badgeColor}`}
          >
            <IconoEstado className="w-3 h-3 shrink-0" />
            <span>{esInactiva ? 'Inactiva' : mesa.ocupacion}</span>
          </span>
        </div>

        {/* Acciones Administrativas en la cabecera (Editar y Desactivar/Activar) */}
        {esAdmin && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditar?.(mesa, e);
              }}
              title={`Editar ${mesa.nombre}`}
              aria-label={`Editar ${mesa.nombre}`}
              className="w-7 h-7 rounded-lg border border-neutral-200 bg-surface hover:bg-neutral-100 text-neutral-600 shadow-2xs inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-neutral-600" />
            </button>

            <button
              type="button"
              disabled={mesa.activa && esOcupada}
              onClick={(e) => {
                e.stopPropagation();
                if (mesa.activa && esOcupada) return;
                onCambiarEstado?.(mesa, mesa.activa ? 'desactivar' : 'activar', e);
              }}
              title={
                !mesa.activa
                  ? `Activar ${mesa.nombre}`
                  : esOcupada
                  ? 'No se puede desactivar una mesa ocupada'
                  : `Desactivar ${mesa.nombre}`
              }
              aria-label={
                !mesa.activa
                  ? `Activar ${mesa.nombre}`
                  : esOcupada
                  ? 'No se puede desactivar una mesa ocupada'
                  : `Desactivar ${mesa.nombre}`
              }
              className={`w-7 h-7 rounded-lg border shadow-2xs inline-flex items-center justify-center transition-colors ${
                !mesa.activa
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 cursor-pointer'
                  : esOcupada
                  ? 'bg-neutral-100 border-neutral-200 text-neutral-500 cursor-not-allowed opacity-60'
                  : 'bg-amber-50 hover:bg-amber-100 text-accent border-amber-200 cursor-pointer'
              }`}
            >
              {mesa.activa ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Descripción con texto flexible */}
      <p
        className="text-xs sm:text-sm text-ink-muted font-sans break-words line-clamp-2 mb-2 w-full"
        title={esInactiva ? 'No disponible en salón' : esLibre ? 'Lista para comensales' : 'Con pedido en curso'}
      >
        {esInactiva ? 'No disponible en salón' : esLibre ? 'Lista para comensales' : 'Con pedido en curso'}
      </p>

      {/* Contenido / Botones de Acción según Rol */}
      <div className="pt-2 border-t border-neutral-200/50 flex items-center justify-between gap-2 mt-auto">
        {/* Acciones de Mozo y Administrador */}
        {(esMozo || esAdmin) && (
          <div className="w-full">
            {esInactiva ? (
              <div className="w-full h-8 flex items-center justify-center text-xs text-neutral-500 font-medium">
                Mesa inactiva
              </div>
            ) : esLibre ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAccionRol?.(mesa, 'REGISTRAR PEDIDO');
                }}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar pedido</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAccionRol?.(mesa, 'AGREGAR PRODUCTOS');
                }}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Agregar productos</span>
              </button>
            )}
          </div>
        )}

        {/* Acciones de Cajero */}
        {esCajero && !esInactiva && (
          <div className="w-full">
            {esOcupada ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAccionRol?.(mesa, 'COBRAR');
                }}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold bg-ink-fill hover:bg-sidebar text-white flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>Cobrar mesa</span>
              </button>
            ) : (
              <div className="w-full py-2 text-center text-xs text-neutral-500 font-medium">
                Sin consumo activo
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

