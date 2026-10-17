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
import type { MesaItem } from '../types/mesa';

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
  let estiloCard = 'bg-white border-neutral-200/90 text-neutral-800 shadow-2xs hover:shadow-md';
  let badgeColor = 'bg-neutral-100 text-neutral-600 border-neutral-200';
  let IconoEstado = CheckCircle2;

  if (esInactiva) {
    estiloCard = 'bg-neutral-100/70 border-neutral-200/80 text-neutral-400 opacity-80';
    badgeColor = 'bg-neutral-200/60 text-neutral-500 border-neutral-300';
    IconoEstado = PowerOff;
  } else if (esLibre) {
    estiloCard = 'bg-emerald-50/40 border-emerald-200/90 text-emerald-950 shadow-2xs hover:border-emerald-400 hover:shadow-md';
    badgeColor = 'bg-emerald-100/80 text-emerald-800 border-emerald-200';
    IconoEstado = CheckCircle2;
  } else if (esOcupada) {
    estiloCard = 'bg-amber-50/40 border-amber-200/90 text-amber-950 shadow-2xs hover:border-amber-400 hover:shadow-md';
    badgeColor = 'bg-amber-100/80 text-[#B84600] border-amber-200';
    IconoEstado = Clock;
  }

  // Resaltado temporal post-mutación (Shneiderman 3)
  const claseResaltado = isHighlighted
    ? 'ring-2 ring-[#D35400] ring-offset-2 scale-[1.02] transition-transform duration-300'
    : 'transition-all duration-200';

  const handleClickCard = () => {
    if (esInactiva) return;

    if (esMozo) {
      if (esLibre) onAccionRol?.(mesa, 'REGISTRAR PEDIDO');
      else if (esOcupada) onAccionRol?.(mesa, 'AGREGAR PRODUCTOS');
    } else if (esCajero && esOcupada) {
      onAccionRol?.(mesa, 'COBRAR');
    } else if (esAdmin) {
      onEditar?.(mesa);
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
      className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between min-h-[140px] sm:min-h-[150px] relative select-none ${estiloCard} ${claseResaltado}`}
    >
      {/* Encabezado de la Tarjeta: Nombre + Badge Estado */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-bold text-lg sm:text-xl truncate text-[#2C1A0E]" title={mesa.nombre}>
            {mesa.nombre}
          </h3>
          <span className="text-[11px] text-[#7C6F66] font-sans">
            {esInactiva ? 'No disponible en salón' : esLibre ? 'Lista para comensales' : 'Con pedido en curso'}
          </span>
        </div>

        {/* RV-58: Insignia con texto ("Libre" / "Ocupada" / "Inactiva") + icono y ancho fijo */}
        <span
          className={`shrink-0 w-28 h-7 inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold border shadow-2xs ${badgeColor}`}
        >
          <IconoEstado className="w-3.5 h-3.5" />
          <span>{esInactiva ? 'Inactiva' : mesa.ocupacion}</span>
        </span>
      </div>

      {/* Contenido / Botones de Acción según Rol */}
      <div className="pt-2 border-t border-neutral-200/50 flex items-center justify-between gap-2 mt-auto">
        {/* Acciones de Administrador */}
        {esAdmin && (
          <div className="flex items-center gap-1.5 w-full justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditar?.(mesa, e);
              }}
              title={`Editar ${mesa.nombre}`}
              aria-label={`Editar ${mesa.nombre}`}
              className="w-8 h-8 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-2xs inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4 text-neutral-600" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCambiarEstado?.(mesa, mesa.activa ? 'desactivar' : 'activar', e);
              }}
              title={
                mesa.activa
                  ? esOcupada
                    ? `No se puede desactivar ${mesa.nombre}: tiene un pedido pendiente de cobro`
                    : `Desactivar ${mesa.nombre}`
                  : `Activar ${mesa.nombre}`
              }
              aria-label={
                mesa.activa
                  ? `Desactivar ${mesa.nombre}`
                  : `Activar ${mesa.nombre}`
              }
              className={`w-8 h-8 rounded-lg border shadow-2xs inline-flex items-center justify-center transition-colors cursor-pointer ${
                mesa.activa
                  ? 'bg-amber-50 hover:bg-amber-100 text-[#B84600] border-amber-200'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              {mesa.activa ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Acciones de Mozo */}
        {esMozo && !esInactiva && (
          <div className="w-full">
            {esLibre ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAccionRol?.(mesa, 'REGISTRAR PEDIDO');
                }}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold bg-[#D35400] hover:bg-[#B84600] text-white flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
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
                className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold bg-[#2C1A0E] hover:bg-[#482813] text-white flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>Cobrar mesa</span>
              </button>
            ) : (
              <div className="w-full py-2 text-center text-xs text-neutral-400 font-medium">
                Sin consumo activo
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
