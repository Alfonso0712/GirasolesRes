import React from 'react';
import { Banknote, Smartphone } from 'lucide-react';
import { SolesIcon } from '../../ui/SolesIcon';
import { formatCurrency } from '../../../utils/formatters';
import type { CierreDetalleDto } from '../../../types/caja';

export interface CierreMetricasSectionProps {
  detalle: CierreDetalleDto;
  esAbierta: boolean;
  diferenciaNum: number | null;
}

export const CierreMetricasSection: React.FC<CierreMetricasSectionProps> = ({
  detalle,
  esAbierta,
  diferenciaNum,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 break-inside-avoid">
      {/* Tarjeta A: Resumen de Ventas Facturadas */}
      <div className="p-4 bg-surface border border-neutral-200 rounded-xl shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-ink flex items-center gap-1.5">
            <SolesIcon className="w-4 h-4 text-accent" />
            Flujo de Ventas del Turno
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center text-neutral-600">
            <span>Monto Inicial (Apertura):</span>
            <span className="font-bold text-neutral-800 tabular-nums">
              {formatCurrency(detalle.montoInicial)}
            </span>
          </div>

          <div className="flex justify-between items-center text-neutral-600">
            <span className="flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5 text-stone-500" />
              Ventas en Efectivo:
            </span>
            <span className="font-bold text-ink tabular-nums">
              {formatCurrency(detalle.ventasEfectivo)}
            </span>
          </div>

          <div className="flex justify-between items-center text-neutral-600">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-purple-600" />
              Ventas por Yape / QR:
            </span>
            <span className="font-bold text-purple-900 tabular-nums">
              {formatCurrency(detalle.ventasYape)}
            </span>
          </div>

          <div className="pt-2 border-t border-neutral-200 flex justify-between items-center font-bold text-sm">
            <span className="text-ink">Total de ventas facturadas:</span>
            <span className="text-accent text-base tabular-nums">
              {formatCurrency(detalle.totalVentas)}
            </span>
          </div>
        </div>
      </div>

      {/* Tarjeta B: Arqueo Físico y Cuadratura de Efectivo */}
      <div className="p-4 bg-surface border border-neutral-200 rounded-xl shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-ink flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-accent" />
            Arqueo y Cuadratura de Efectivo
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center text-neutral-600">
            <span>Efectivo Físico Esperado:</span>
            <span className="font-bold text-ink tabular-nums">
              {formatCurrency(detalle.efectivoEsperado ?? (detalle.montoInicial + detalle.ventasEfectivo))}
            </span>
          </div>

          <div className="flex justify-between items-center text-neutral-600">
            <span>Efectivo Físico Contado:</span>
            <span className="font-bold text-stone-900 tabular-nums">
              {esAbierta ? (
                <span className="text-stone-500 font-normal">—</span>
              ) : detalle.efectivoContado !== null && detalle.efectivoContado !== undefined ? (
                <span className="tabular-nums">{formatCurrency(Number(detalle.efectivoContado))}</span>
              ) : (
                '—'
              )}
            </span>
          </div>

          <div className="flex justify-between items-center text-neutral-600">
            <span>Diferencia de Cuadre:</span>
            <span className="font-bold tabular-nums">
              {esAbierta ? (
                <span className="text-stone-500 font-normal">—</span>
              ) : diferenciaNum === null ? (
                '—'
              ) : diferenciaNum === 0 ? (
                <span className="tabular-nums">S/ 0.00</span>
              ) : (
                <span className="tabular-nums">{`${diferenciaNum > 0 ? '+' : ''}S/ ${diferenciaNum.toFixed(2)}`}</span>
              )}
            </span>
          </div>

          {/* Badge de Estado de Cuadre */}
          <div className="pt-2 border-t border-neutral-200">
            <div
              className={`p-2.5 rounded-lg border text-center font-bold text-xs tracking-wider uppercase tabular-nums ${
                esAbierta
                  ? 'bg-stone-50 border-neutral-200 text-neutral-500'
                  : diferenciaNum === null
                  ? 'bg-stone-50 border-neutral-200 text-neutral-500'
                  : diferenciaNum === 0
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                  : diferenciaNum > 0
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-rose-100 border-rose-300 text-rose-900'
              }`}
            >
              {esAbierta
                ? 'Estado: Turno en curso (Sin Arqueo)'
                : diferenciaNum === null
                ? 'Estado: Sin Arqueo'
                : diferenciaNum === 0
                ? 'Estado: Cuadra (S/ 0.00)'
                : diferenciaNum > 0
                ? <span className="tabular-nums">{`Estado: Sobrante (+S/ ${diferenciaNum.toFixed(2)})`}</span>
                : <span className="tabular-nums">{`Estado: Faltante (-S/ ${Math.abs(diferenciaNum).toFixed(2)})`}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CierreMetricasSection;
