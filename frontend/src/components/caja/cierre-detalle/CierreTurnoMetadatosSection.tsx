import React from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { formatCurrency, formatLimaFecha } from '../../../utils/formatters';
import type { CierreDetalleDto } from '../../../types/caja';

export interface CierreTurnoMetadatosSectionProps {
  detalle: CierreDetalleDto;
}

export const CierreTurnoMetadatosSection: React.FC<CierreTurnoMetadatosSectionProps> = ({
  detalle,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs break-inside-avoid">
      <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-neutral-200 pb-3 sm:pb-0 sm:pr-3">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-accent" /> Apertura del Turno
        </span>
        <p className="font-bold text-stone-900 text-sm mt-0.5">
          {detalle.fechaAperturaLocal || formatLimaFecha(detalle.fechaApertura)}
        </p>
        <p className="text-neutral-600 flex items-center gap-1">
          <User className="w-3 h-3 text-stone-500" />
          Cajero(a): <strong>{detalle.cajeroApertura || 'Cajero'}</strong>
        </p>
        <p className="text-neutral-500 text-xs">
          Fondo inicial: <strong className="text-neutral-800 tabular-nums">{formatCurrency(detalle.montoInicial)}</strong>
        </p>
      </div>

      <div className="space-y-1.5 pt-1 sm:pt-0 sm:pl-2">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-accent" /> Cierre y Cuadre
        </span>
        <p className="font-bold text-stone-900 text-sm mt-0.5">
          {detalle.fechaCierreLocal ||
            (detalle.fechaCierre
              ? formatLimaFecha(detalle.fechaCierre)
              : 'Turno en curso (Abierta)')}
        </p>
        <p className="text-neutral-600 flex items-center gap-1">
          <User className="w-3 h-3 text-stone-500" />
          Cerrado por: <strong>{detalle.cajeroCierre || '—'}</strong>
        </p>
        <p className="text-neutral-500 text-xs">
          Transacciones: <strong className="text-neutral-800">{detalle.cantidadVentas ?? 0} ventas emitidas</strong>
        </p>
      </div>
    </div>
  );
};
