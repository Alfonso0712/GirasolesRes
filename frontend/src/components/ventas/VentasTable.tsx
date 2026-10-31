import React from 'react';
import { Eye, ShoppingBag, Utensils, Smartphone } from 'lucide-react';
import { SolesIcon } from '../ui/SolesIcon';
import { StatusBadge, IconActionButton, DataTable, TableHead, TableBody } from '../ui';
import { formatCurrency } from '../../utils/formatters';
import type { VentaItem } from '../../types/venta';

export interface VentasTableProps {
  ventas: VentaItem[];
  cargando: boolean;
  errorCarga: string | null;
  onRetry: () => void;
  tieneFiltrosActivos: boolean;
  onLimpiarFiltros: () => void;
  onVerDetalle: (ventaId: string) => void;
}

export const VentasTable: React.FC<VentasTableProps> = ({
  ventas,
  cargando,
  errorCarga,
  onRetry,
  tieneFiltrosActivos,
  onLimpiarFiltros,
  onVerDetalle,
}) => {
  return (
    <DataTable
      loading={cargando}
      error={errorCarga}
      onRetry={onRetry}
      isEmpty={ventas.length === 0}
      emptyTitle="No se encontraron ventas"
      emptyMessage={
        tieneFiltrosActivos
          ? 'No hay registros que coincidan con los filtros aplicados. Pruebe con otra fecha, tipo o número de comprobante.'
          : 'Aún no se han registrado ventas en el sistema.'
      }
      emptyActionLabel={tieneFiltrosActivos ? 'Quitar filtros' : undefined}
      onEmptyAction={tieneFiltrosActivos ? onLimpiarFiltros : undefined}
      minWidth="min-w-[900px]"
    >
      <TableHead>
        <tr>
          <th scope="col" className="py-3.5 px-4">Comprobante</th>
          <th scope="col" className="py-3.5 px-4">Fecha y hora</th>
          <th scope="col" className="py-3.5 px-4">Pedido</th>
          <th scope="col" className="py-3.5 px-4">Destino</th>
          <th scope="col" className="py-3.5 px-4">Método</th>
          <th scope="col" className="py-3.5 px-4 text-right">Total</th>
          <th scope="col" className="py-3.5 px-4 w-36">Cajero(a)</th>
          <th scope="col" className="py-3.5 px-4 text-center">Estado</th>
          <th scope="col" className="py-3.5 px-4 text-center">Acciones</th>
        </tr>
      </TableHead>
      <TableBody>
        {ventas.map((v) => {
          const esAnulada = v.estado === 'Anulada';
          return (
            <tr
              key={v.ventaId}
              className={`transition-colors border-b border-line-soft ${
                esAnulada
                  ? 'bg-stone-50 hover:bg-stone-100/70 text-stone-700'
                  : 'hover:bg-neutral-50/70 bg-surface text-neutral-800'
              }`}
            >
              {/* Comprobante */}
              <td className="py-3 px-4">
                <div className="flex flex-col gap-0.5 items-start">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 text-xs font-semibold rounded uppercase tracking-wider ${
                        v.comprobante.startsWith('F')
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : v.comprobante.startsWith('B')
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                      }`}
                    >
                      {v.comprobante.startsWith('F') ? 'Factura' : v.comprobante.startsWith('B') ? 'Boleta' : 'Ticket'}
                    </span>
                    <span className={`tabular-nums font-semibold text-sm ${esAnulada ? 'text-stone-700' : 'text-ink'}`}>
                      {v.comprobante}
                    </span>
                  </div>
                  {(v.clienteDocumento || v.clienteNombre) && (
                    <span className="text-xs text-stone-500 truncate max-w-[170px]" title={`${v.clienteDocumento ? v.clienteDocumento + ' - ' : ''}${v.clienteNombre || ''}`}>
                      {v.clienteDocumento ? `${v.clienteDocumento} · ` : ''}{v.clienteNombre || ''}
                    </span>
                  )}
                </div>
              </td>

              {/* Fecha y Hora */}
              <td className="py-3 px-4 tabular-nums text-xs text-stone-600 whitespace-nowrap">
                {v.fechaHoraFormateada}
              </td>

              {/* Pedido N.º */}
              <td className="py-3 px-4 tabular-nums font-semibold text-sm text-ink">
                #{v.pedidoNumero}
              </td>

              {/* Destino (Mesa o Llevar) */}
              <td className="py-3 px-4">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                  {v.tipo === 'Para Llevar' ? (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span className="truncate max-w-[120px]" title={v.referencia || 'Para Llevar'}>
                        {v.referencia ? `Llevar (${v.referencia})` : 'Para Llevar'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Utensils className="w-3.5 h-3.5 text-info shrink-0" />
                      <span>{v.mesa || 'Salón'}</span>
                    </>
                  )}
                </span>
              </td>

              {/* Método de Pago */}
              <td className="py-3 px-4">
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg inline-flex items-center gap-1 border ${
                    v.metodo === 'Efectivo'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-purple-50 text-purple-800 border-purple-200'
                  }`}
                >
                  {v.metodo === 'Efectivo' ? (
                    <SolesIcon className="w-3 h-3 text-emerald-700" />
                  ) : (
                    <Smartphone className="w-3 h-3 text-purple-700" />
                  )}
                  <span>{v.metodo}</span>
                </span>
              </td>

              {/* Total con alto contraste WCAG AA */}
              <td className="py-3 px-4 text-right tabular-nums font-semibold text-sm whitespace-nowrap">
                <span className={esAnulada ? 'text-stone-700 font-semibold' : 'text-ink'}>
                  {formatCurrency(v.total)}
                </span>
              </td>

              {/* Cajero */}
              <td className="py-3 px-4 text-sm font-medium text-ink truncate max-w-36 w-36" title={v.cajero}>
                {v.cajero}
              </td>

              {/* Estado con StatusBadge */}
              <td className="py-3 px-4 text-center whitespace-nowrap">
                <StatusBadge
                  status={v.estado}
                  intent={esAnulada ? 'danger' : 'success'}
                />
              </td>

              {/* Acción Ver Detalle con IconActionButton */}
              <td className="py-3 px-4 text-center whitespace-nowrap">
                <IconActionButton
                  icon={Eye}
                  label="Ver detalle de la venta"
                  variant="view"
                  onClick={() => onVerDetalle(v.ventaId)}
                />
              </td>
            </tr>
          );
        })}
      </TableBody>
    </DataTable>
  );
};
