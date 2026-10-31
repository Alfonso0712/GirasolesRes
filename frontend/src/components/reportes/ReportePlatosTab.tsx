import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type {
  ReportePlatosResponse,
  ItemPlatoVendido,
  CriterioOrdenPlatos,
} from '../../types/reporte';
import { CATEGORIA_LABELS, CATEGORIA_BADGE_LABELS } from '../../types/producto';
import { formatCurrency } from '../../utils/formatters';
import { DataTable, TableHead, TableBody } from '../ui';

export interface ReportePlatosTabProps {
  reportePlatos: ReportePlatosResponse | null;
  platosOrdenados: ItemPlatoVendido[];
  ordenPlatos: CriterioOrdenPlatos;
  setOrdenPlatos: (o: CriterioOrdenPlatos) => void;
  onClearProductoFiltro: () => void;
}

export const ReportePlatosTab: React.FC<ReportePlatosTabProps> = ({
  reportePlatos,
  platosOrdenados,
  ordenPlatos,
  setOrdenPlatos,
  onClearProductoFiltro,
}) => {
  return (
    <>
      {/* Indicador de Cuadre con Ventas (RV-140 / RN-120 / MSG-197 / MSG-198) */}
      {reportePlatos && (
        <div
          className={`p-4 rounded-2xl border shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors ${
            reportePlatos.coincide
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/90 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-3">
            {reportePlatos.coincide ? (
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide opacity-80">
                Estado de Cuadre de Platos con Ventas
              </p>
              <p className="text-sm font-semibold mt-0.5">
                {reportePlatos.coincide
                  ? `Cuadra con ventas: el monto de los platos coincide con el total vendido (${formatCurrency(reportePlatos.totalVentas)}).`
                  : `El monto de los platos (S/ ${reportePlatos.totalMonto.toFixed(2)}) no coincide con el total vendido (S/ ${reportePlatos.totalVentas.toFixed(2)}). Diferencia: S/ ${Math.abs(reportePlatos.totalMonto - reportePlatos.totalVentas).toFixed(2)}. Informe al equipo técnico.`}
              </p>
            </div>
          </div>

          <div className="text-right sm:self-auto shrink-0 pl-12 sm:pl-0">
            <span className="text-xs text-neutral-500 font-sans block">Total Platos / Ventas</span>
            <span className="font-sans font-bold tabular-nums text-sm text-ink">
              {formatCurrency(reportePlatos.totalMonto)}
            </span>
          </div>
        </div>
      )}

      {/* Tarjetas Resumen Principales de Platos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-surface rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Total Platos Vendidos
          </span>
          <span className="font-sans font-bold text-2xl sm:text-3xl text-ink tabular-nums mt-1">
            {reportePlatos ? reportePlatos.totalPlatos : '0'}
          </span>
          <span className="text-xs text-neutral-500 mt-1">Suma de raciones servidas</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Monto Total de Platos
          </span>
          <span className="font-sans font-bold text-2xl sm:text-3xl text-accent tabular-nums mt-1">
            {formatCurrency(reportePlatos?.totalMonto)}
          </span>
          <span className="text-xs text-neutral-500 mt-1">Calculado por precio en comanda</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Total en Ventas Registradas
          </span>
          <span className="font-sans font-bold text-2xl sm:text-3xl text-neutral-800 tabular-nums mt-1">
            {formatCurrency(reportePlatos?.totalVentas)}
          </span>
          <span className="text-xs text-neutral-500 mt-1">Ventas vigentes del período</span>
        </div>
      </div>

      {/* Subtotales por Categoría (RV-138 / Desayuno, Almuerzo, Otro) */}
      {reportePlatos?.subtotales && reportePlatos.subtotales.length > 0 && (
        <div className="bg-surface p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
            Subtotales por Categoría
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {reportePlatos.subtotales.map((sub) => (
              <div
                key={sub.categoria}
                className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-200/70 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-ink block">
                    {CATEGORIA_LABELS[sub.categoria] || sub.categoria}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {sub.cantidad} {sub.cantidad === 1 ? 'plato' : 'platos'}
                  </span>
                </div>
                <span className="font-sans font-bold text-sm text-accent tabular-nums">
                  {formatCurrency(sub.monto)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vista 14.3: Detalle por Día del Producto Seleccionado */}
      {reportePlatos?.porDia && reportePlatos.porDia.length > 0 && (
        <div className="bg-surface p-4 rounded-2xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-accent">
                Desglose Diario del Plato
              </p>
              <p className="text-sm font-semibold text-ink mt-0.5">
                Ventas diarias del producto en el rango consultado
              </p>
            </div>
            <button
              type="button"
              onClick={onClearProductoFiltro}
              className="text-xs text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
            >
              Ver todos los platos
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {reportePlatos.porDia.map((d) => (
              <div
                key={d.fecha}
                className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-center"
              >
                <span className="text-xs font-medium text-neutral-500 block">{d.fecha}</span>
                <span className="text-base font-bold text-ink font-sans tabular-nums block mt-0.5">
                  {d.cantidad} un.
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barra de Ordenamiento de Platos (RV-138) */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
          Listado de Platos ({platosOrdenados.length})
        </span>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-medium">Ordenar por:</span>
          <select
            value={ordenPlatos}
            onChange={(e) => setOrdenPlatos(e.target.value as CriterioOrdenPlatos)}
            className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-surface text-xs font-semibold text-neutral-700 cursor-pointer focus:outline-none"
          >
            <option value="cantidad">Mayor cantidad</option>
            <option value="monto">Mayor monto (S/)</option>
            <option value="nombre">Nombre (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Tabla de Platos Vendidos con DataTable */}
      <DataTable
        isEmpty={platosOrdenados.length === 0}
        emptyTitle="No hay datos de platos vendidos"
        emptyMessage="No se registraron ventas de platos para el período seleccionado."
        minWidth="min-w-[650px]"
      >
        <TableHead>
          <tr>
            <th scope="col" className="py-3 px-4">Producto</th>
            <th scope="col" className="py-3 px-4">Categoría</th>
            <th scope="col" className="py-3 px-4 text-center">Estado</th>
            <th scope="col" className="py-3 px-4 text-right">Cantidad Vendida</th>
            <th scope="col" className="py-3 px-4 text-right">Monto Total</th>
          </tr>
        </TableHead>
        <TableBody>
          {platosOrdenados.map((item) => (
            <tr key={item.productoId} className="hover:bg-neutral-50/60 transition-colors border-b border-line-soft">
              <td className="py-3 px-4 font-semibold text-sm text-ink">
                <span>{item.producto}</span>
                {!item.activo && (
                  <span className="ml-2 text-xs font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 rounded px-1.5 py-0.5">
                    inactivo
                  </span>
                )}
              </td>
              <td className="py-3 px-4">
                <span
                  className="inline-flex items-center justify-center rounded-lg text-xs font-medium py-1 px-2.5 border shadow-2xs bg-neutral-50 text-neutral-700 border-neutral-200"
                  title={CATEGORIA_LABELS[item.categoria] || item.categoria}
                >
                  {CATEGORIA_BADGE_LABELS[item.categoria] || item.categoria}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`inline-flex items-center justify-center rounded-lg text-xs font-medium py-1 px-2.5 border shadow-2xs ${
                    item.activo
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                  }`}
                >
                  {item.activo ? 'Activo' : 'Desactivado'}
                </span>
              </td>
              <td className="py-3 px-4 text-right font-sans font-semibold tabular-nums text-sm text-ink">
                {item.cantidad}
              </td>
              <td className="py-3 px-4 text-right font-sans font-semibold tabular-nums text-sm text-accent">
                {formatCurrency(item.monto)}
              </td>
            </tr>
          ))}
        </TableBody>
      </DataTable>
    </>
  );
};
