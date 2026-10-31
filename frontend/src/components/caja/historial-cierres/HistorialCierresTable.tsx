import React from 'react';
import { Eye, Download } from 'lucide-react';
import {
  StatusBadge,
  IconActionButton,
  DataTable,
  TableHead,
  TableBody,
} from '../../ui';
import { formatCurrency } from '../../../utils/formatters';
import type { HistorialCierresItemDto } from '../../../types/caja';

export interface HistorialCierresTableProps {
  cierres: HistorialCierresItemDto[];
  cargando: boolean;
  errorCarga: string | null;
  onRetry: () => void;
  tieneFiltrosActivos: boolean;
  onLimpiarFiltros: () => void;
  descargandoPdfId: string | null;
  onVerDetalle: (cajaId: string) => void;
  onDescargarPdf: (cajaId: string) => void;
}

/**
 * Detecta defensivamente si el registro de caja corresponde a una caja actualmente abierta.
 */
export const esCajaAbierta = (c: HistorialCierresItemDto): boolean => {
  return (
    c.esAbierta === true ||
    c.estado?.toLowerCase() === 'abierta' ||
    (!c.fechaCierre && (c.montoCierre === null || c.montoCierre === undefined))
  );
};

export const HistorialCierresTable: React.FC<HistorialCierresTableProps> = ({
  cierres,
  cargando,
  errorCarga,
  onRetry,
  tieneFiltrosActivos,
  onLimpiarFiltros,
  descargandoPdfId,
  onVerDetalle,
  onDescargarPdf,
}) => {
  return (
    <DataTable
      loading={cargando}
      error={errorCarga}
      onRetry={onRetry}
      isEmpty={cierres.length === 0}
      emptyTitle="No se encontraron cierres de caja"
      emptyMessage={
        tieneFiltrosActivos
          ? 'No hay registros que coincidan con los filtros aplicados. Intente ajustar el rango de fechas o el cajero.'
          : 'Aún no se han registrado turnos o cierres de caja en el sistema.'
      }
      emptyActionLabel={tieneFiltrosActivos ? 'Ver todos los cierres' : undefined}
      onEmptyAction={tieneFiltrosActivos ? onLimpiarFiltros : undefined}
      minWidth="min-w-[900px]"
    >
      <TableHead>
        <tr>
          <th scope="col" className="px-3 py-3.5">Turno</th>
          <th scope="col" className="px-3 py-3.5">Cajero(a)</th>
          <th scope="col" className="px-3 py-3.5 text-right">Monto inicial</th>
          <th scope="col" className="px-3 py-3.5 text-right">Efectivo</th>
          <th scope="col" className="px-3 py-3.5 text-right">Yape</th>
          <th scope="col" className="px-3 py-3.5 text-right">Total ventas</th>
          <th scope="col" className="px-3 py-3.5 text-right">Contado</th>
          <th scope="col" className="px-3 py-3.5 text-right">Diferencia</th>
          <th scope="col" className="px-3 py-3.5 text-center">Estado</th>
          <th scope="col" className="px-3 py-3.5 text-center">Acciones</th>
        </tr>
      </TableHead>

      <TableBody>
        {cierres.map((c) => {
          const abierta = esCajaAbierta(c);
          const diferenciaNum =
            c.diferencia !== null && c.diferencia !== undefined ? Number(c.diferencia) : null;
          const cajaId = c.cajaId || c.id || c.cierreId || '';
          const fechaAperturaStr =
            c.fechaAperturaLocal ||
            (c.fechaApertura
              ? new Date(c.fechaApertura).toLocaleString('es-PE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—');
          const fechaCierreStr =
            c.fechaCierreLocal ||
            (c.fechaCierre
              ? new Date(c.fechaCierre).toLocaleString('es-PE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : null);

          return (
            <tr
              key={cajaId}
              className={`hover:bg-neutral-50/70 transition-colors border-b border-line-soft ${
                abierta ? 'bg-emerald-50/30' : ''
              }`}
            >
              {/* Turno en dos líneas: Apertura y Cierre */}
              <td className="px-3 py-3">
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-ink whitespace-nowrap">
                    Apertura: {fechaAperturaStr}
                  </span>
                  <span className="text-xs text-neutral-500 whitespace-nowrap mt-0.5">
                    {abierta ? 'En curso' : `Cierre: ${fechaCierreStr || '—'}`}
                  </span>
                </div>
              </td>

              {/* Cajero */}
              <td className="px-3 py-3 font-semibold text-sm text-ink whitespace-nowrap">
                {c.cajero || c.cajeroApertura || 'Cajero'}
              </td>

              {/* Monto Inicial */}
              <td className="px-3 py-3 text-right font-medium text-sm text-neutral-700 tabular-nums whitespace-nowrap">
                {formatCurrency(c.montoInicial)}
              </td>

              {/* Efectivo */}
              <td className="px-3 py-3 text-right font-medium text-sm text-ink tabular-nums whitespace-nowrap">
                {formatCurrency(c.ventasEfectivo ?? c.efectivo)}
              </td>

              {/* Yape */}
              <td className="px-3 py-3 text-right font-medium text-sm text-purple-900 tabular-nums whitespace-nowrap">
                {formatCurrency(c.ventasYape ?? c.yape)}
              </td>

              {/* Total Ventas */}
              <td className="px-3 py-3 text-right font-semibold text-sm text-accent tabular-nums whitespace-nowrap">
                {formatCurrency(c.totalVentas ?? c.total)}
              </td>

              {/* Contado */}
              <td className="px-3 py-3 text-right font-medium text-sm text-ink tabular-nums whitespace-nowrap">
                {abierta ? (
                  <span className="text-neutral-400 font-normal">—</span>
                ) : c.efectivoContado !== null && c.efectivoContado !== undefined ? (
                  <span className="tabular-nums font-semibold">{formatCurrency(Number(c.efectivoContado))}</span>
                ) : (
                  '—'
                )}
              </td>

              {/* Diferencia / Cuadre con StatusBadge */}
              <td className="px-3 py-3 text-right tabular-nums whitespace-nowrap">
                {abierta ? (
                  <span className="text-neutral-400 font-normal">—</span>
                ) : diferenciaNum === null ? (
                  <span className="text-neutral-400">—</span>
                ) : diferenciaNum === 0 ? (
                  <StatusBadge status="Cuadra" label="Cuadra · S/ 0.00" intent="success" />
                ) : diferenciaNum > 0 ? (
                  <StatusBadge status="Sobrante" label={`+ ${formatCurrency(diferenciaNum)}`} intent="warning" />
                ) : (
                  <StatusBadge status="Faltante" label={`- ${formatCurrency(Math.abs(diferenciaNum))}`} intent="danger" />
                )}
              </td>

              {/* Estado con StatusBadge */}
              <td className="px-3 py-3 text-center whitespace-nowrap">
                {abierta ? (
                  <StatusBadge status="Abierta" intent="success" />
                ) : c.conAjustes || c.tieneAjustesPosteriores ? (
                  <StatusBadge status="Con ajustes" intent="warning" />
                ) : (
                  <StatusBadge status="Cerrada" intent="neutral" />
                )}
              </td>

              {/* Acciones con IconActionButton */}
              <td className="px-3 py-3 text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-1.5">
                  <IconActionButton
                    icon={Eye}
                    label="Ver detalle del cierre"
                    variant="view"
                    onClick={() => onVerDetalle(cajaId)}
                  />

                  <IconActionButton
                    icon={Download}
                    label="Descargar acta de cierre"
                    variant="download"
                    disabled={abierta || descargandoPdfId === cajaId}
                    disabledReason={abierta ? 'No disponible mientras la caja esté abierta' : 'Descargando...'}
                    onClick={() => onDescargarPdf(cajaId)}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </TableBody>
    </DataTable>
  );
};
