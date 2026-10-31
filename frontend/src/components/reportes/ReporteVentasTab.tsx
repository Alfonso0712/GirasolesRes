import React from 'react';
import { TrendingUp, Smartphone, ReceiptText, AlertCircle, AlertTriangle } from 'lucide-react';
import { SolesIcon } from '../ui/SolesIcon';
import type { ReporteVentasResponse } from '../../types/reporte';
import { formatCurrency } from '../../utils/formatters';
import { DataTable, TableHead, TableBody } from '../ui';

export interface ReporteVentasTabProps {
  reporteVentas: ReporteVentasResponse | null;
  onNavigateToCierres?: () => void;
}

export const ReporteVentasTab: React.FC<ReporteVentasTabProps> = ({
  reporteVentas,
  onNavigateToCierres,
}) => {
  return (
    <>
      {/* 4 Tarjetas de Resumen Financiero (RV-136) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-surface rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Total General
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-accent flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="font-sans font-bold text-2xl sm:text-3xl text-accent tabular-nums mt-2">
            {formatCurrency(reporteVentas?.total)}
          </span>
          <span className="text-xs text-neutral-500 mt-1">Ingresos brutos vigentes</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Total en Efectivo
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <SolesIcon className="w-4 h-4" />
            </div>
          </div>
          <span className="font-sans font-bold text-2xl sm:text-3xl text-emerald-700 tabular-nums mt-2">
            {formatCurrency(reporteVentas?.efectivo)}
          </span>
          <span className="text-xs text-neutral-500 mt-1">Cobros en caja física</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Total por Yape
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <span className="font-sans font-bold text-2xl sm:text-3xl text-purple-700 tabular-nums mt-2">
            {formatCurrency(reporteVentas?.yape)}
          </span>
          <span className="text-xs text-neutral-500 mt-1">Billeteras electrónicas</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Cantidad de Ventas
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ReceiptText className="w-4 h-4" />
            </div>
          </div>
          <span className="font-sans font-bold text-2xl sm:text-3xl text-ink tabular-nums mt-2">
            {reporteVentas ? reporteVentas.nVentas : '0'}
          </span>
          <span className="text-xs text-neutral-500 mt-1">Comprobantes vigentes</span>
        </div>
      </div>

      {/* Aviso Informativo de Ventas Anuladas (RV-135 / RN-117 / MSG-199) */}
      {reporteVentas && reporteVentas.anuladas.cantidad > 0 && (
        <div className="p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-danger shrink-0" />
          <span>
            <strong>Ventas Anuladas:</strong> Incluye {reporteVentas.anuladas.cantidad} venta(s)
            anulada(s) por {formatCurrency(reporteVentas.anuladas.monto)} que no se suman a los
            totales.
          </span>
        </div>
      )}

      {/* Tabla Detalle de Ventas por Día (RV-136, RV-137, RN-121) */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
          Detalle por Día ({reporteVentas?.porDia.length || 0} fechas)
        </span>
      </div>

      {/* Tabla Detalle de Ventas por Día con DataTable */}
      <DataTable
        isEmpty={!reporteVentas || reporteVentas.porDia.length === 0}
        emptyTitle="No hay datos de ventas por día"
        emptyMessage="No se registraron ventas para las fechas seleccionadas."
        minWidth="min-w-[700px]"
      >
        <TableHead>
          <tr>
            <th scope="col" className="py-3 px-4">Fecha</th>
            <th scope="col" className="py-3 px-4 text-center">N.° Ventas</th>
            <th scope="col" className="py-3 px-4 text-right">Efectivo</th>
            <th scope="col" className="py-3 px-4 text-right">Yape</th>
            <th scope="col" className="py-3 px-4 text-right">Total Día</th>
            <th scope="col" className="py-3 px-4 text-center">Estado / Cierre</th>
          </tr>
        </TableHead>
        <TableBody>
          {reporteVentas?.porDia.map((d) => (
            <tr key={d.fecha} className="hover:bg-neutral-50/60 transition-colors border-b border-line-soft">
              <td className="py-3 px-4 font-semibold text-sm text-ink">{d.fecha}</td>
              <td className="py-3 px-4 text-center font-sans font-medium text-sm tabular-nums">
                {d.nVentas}
              </td>
              <td className="py-3 px-4 text-right font-sans font-medium text-sm tabular-nums text-emerald-700">
                {formatCurrency(d.efectivo)}
              </td>
              <td className="py-3 px-4 text-right font-sans font-medium text-sm tabular-nums text-purple-700">
                {formatCurrency(d.yape)}
              </td>
              <td className="py-3 px-4 text-right font-sans font-semibold text-sm tabular-nums text-accent">
                {formatCurrency(d.total)}
              </td>
              <td className="py-3 px-4 text-center">
                {d.conAjustes ? (
                  <button
                    type="button"
                    onClick={onNavigateToCierres}
                    title="Este día incluye anulaciones posteriores al cierre de caja. Vea el historial de cierres."
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold px-2.5 py-1 bg-amber-50 text-accent border border-amber-300 shadow-2xs hover:bg-amber-100 cursor-pointer transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                    <span>Con ajustes</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-lg text-xs font-medium px-2.5 py-1 bg-neutral-50 text-neutral-600 border border-neutral-200">
                    Normal
                  </span>
                )}
              </td>
            </tr>
          ))}
        </TableBody>
      </DataTable>
    </>
  );
};
