import React from 'react';
import { Eye, Trash2, Utensils, ShoppingBag } from 'lucide-react';
import { SolesIcon } from '../ui/SolesIcon';
import { StatusBadge, IconActionButton, DataTable, TableHead, TableBody } from '../ui';
import { formatCurrency } from '../../utils/formatters';
import type { PedidoItemDto } from '../../types/pedido';

export interface PedidosTableProps {
  cargando: boolean;
  errorCarga: string | null;
  onRecargar: () => void;
  pedidos: PedidoItemDto[];
  hayFiltrosActivos: boolean;
  onLimpiarFiltros: () => void;
  rolUsuario: string;
  onVerDetalle: (pedidoId: string) => void;
  onNavigateToCobro?: (pedidoId: string) => void;
  onAbrirAnular: (pedido: PedidoItemDto) => void;
}

export const PedidosTable: React.FC<PedidosTableProps> = ({
  cargando,
  errorCarga,
  onRecargar,
  pedidos,
  hayFiltrosActivos,
  onLimpiarFiltros,
  rolUsuario,
  onVerDetalle,
  onNavigateToCobro,
  onAbrirAnular,
}) => {
  return (
    <DataTable
      loading={cargando}
      error={errorCarga}
      onRetry={onRecargar}
      isEmpty={pedidos.length === 0}
      emptyTitle="No se encontraron pedidos"
      emptyMessage={
        hayFiltrosActivos
          ? 'No hay pedidos que coincidan con los filtros aplicados. Pruebe con otro filtro o restablezca la búsqueda.'
          : 'Todavía no hay pedidos hoy.'
      }
      emptyActionLabel={hayFiltrosActivos ? 'Quitar filtros' : undefined}
      onEmptyAction={hayFiltrosActivos ? onLimpiarFiltros : undefined}
      minWidth="min-w-[850px]"
    >
      <TableHead>
        <tr>
          <th scope="col" className="py-3 px-4">N.º</th>
          <th scope="col" className="py-3 px-4">Destino</th>
          <th scope="col" className="py-3 px-4">Hora</th>
          <th scope="col" className="py-3 px-4">Registrado por</th>
          <th scope="col" className="py-3 px-4">Estado</th>
          <th scope="col" className="py-3 px-4 text-right">Total</th>
          <th scope="col" className="py-3 px-4 text-center">Acciones</th>
        </tr>
      </TableHead>
      <TableBody>
        {pedidos.map((p) => {
          const esAnulado = p.estado.toLowerCase().includes('anulado');
          const esPagado = p.estado.toLowerCase().includes('pagado');
          const esListo = p.estado.toLowerCase() === 'listo';

          return (
            <tr
              key={p.id}
              className={`transition-colors border-b border-line-soft ${
                esAnulado
                  ? 'opacity-60 bg-neutral-50/70'
                  : p.esMio
                  ? 'bg-amber-50/20 hover:bg-amber-50/40'
                  : 'hover:bg-neutral-50/60'
              } ${esListo ? 'ring-1 ring-emerald-300' : ''}`}
            >
              <td className="py-3 px-4 font-semibold tabular-nums text-sm text-ink">
                #{p.numero}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  {p.tipo === 'Mesa' ? (
                    <Utensils className="w-4 h-4 text-accent" />
                  ) : (
                    <ShoppingBag className="w-4 h-4 text-orange-600" />
                  )}
                  <span className="font-semibold text-sm text-ink">
                    {p.tipo === 'Mesa' ? (p.mesa || 'Mesa') : 'Para llevar'}
                  </span>
                </div>
                {p.tipo !== 'Mesa' && p.referencia && (
                  <span className="text-xs text-stone-500 italic block">
                    Ref: {p.referencia}
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-stone-600 text-xs tabular-nums">
                {p.hora}
              </td>
              <td className="py-3 px-4 text-stone-700 text-xs">
                <div className="flex items-center gap-1.5">
                  <span>{p.registradoPor}</span>
                  {p.esMio && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-accent font-semibold text-xs">
                      Mío
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                <StatusBadge status={p.estado} />
              </td>
              <td className="py-3 px-4 text-right font-semibold tabular-nums text-sm text-ink">
                {formatCurrency(p.total)}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <IconActionButton
                    icon={Eye}
                    label="Ver detalle del pedido"
                    variant="view"
                    onClick={() => onVerDetalle(p.id)}
                  />

                  {rolUsuario === 'Cajero' && (
                    <IconActionButton
                      icon={SolesIcon}
                      label="Cobrar pedido en caja"
                      variant="activate"
                      disabled={esPagado || esAnulado}
                      disabledReason={
                        esPagado
                          ? 'El pedido ya fue pagado'
                          : esAnulado
                          ? 'El pedido está anulado'
                          : 'Cobrar pedido en caja'
                      }
                      onClick={() => onNavigateToCobro?.(p.id)}
                    />
                  )}

                  <IconActionButton
                    icon={Trash2}
                    label="Anular pedido"
                    variant="delete"
                    disabled={!p.puedeAnular}
                    disabledReason={p.motivoDeshabilitado || 'Anular pedido'}
                    onClick={() => onAbrirAnular(p)}
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
