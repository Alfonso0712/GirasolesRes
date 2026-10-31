import React from 'react';
import { Utensils, ShoppingBag, CheckCircle2, ChefHat } from 'lucide-react';
import { SolesIcon } from '../ui/SolesIcon';
import { DataTable, TableHead, TableBody } from '../ui';
import { formatCurrency } from '../../utils/formatters';
import type { PedidoPendienteCobro } from '../../types/cobro';

export interface CobrosTableProps {
  pedidos: PedidoPendienteCobro[];
  cargando: boolean;
  errorCarga: string | null;
  onRetry: () => void;
  cajaCerrada: boolean;
  busqueda: string;
  onIniciarCobro: (pedido: PedidoPendienteCobro) => void;
}

export const CobrosTable: React.FC<CobrosTableProps> = ({
  pedidos,
  cargando,
  errorCarga,
  onRetry,
  cajaCerrada,
  busqueda,
  onIniciarCobro,
}) => {
  return (
    <DataTable
      loading={cargando}
      error={errorCarga}
      onRetry={onRetry}
      isEmpty={pedidos.length === 0}
      emptyTitle="No hay pedidos pendientes de cobro"
      emptyMessage={
        cajaCerrada
          ? 'Abra la caja para consultar y registrar cobros.'
          : busqueda
          ? 'No se encontraron pedidos con ese criterio de búsqueda.'
          : 'Todos los pedidos tomados han sido cobrados o no registran consumos activos.'
      }
      minWidth="min-w-[850px]"
    >
      <TableHead>
        <tr>
          <th scope="col" className="py-3 px-4">N.º Pedido</th>
          <th scope="col" className="py-3 px-4">Destino</th>
          <th scope="col" className="py-3 px-4">Hora</th>
          <th scope="col" className="py-3 px-4">Estado Cocina</th>
          <th scope="col" className="py-3 px-4 text-right">Total a Cobrar</th>
          <th scope="col" className="py-3 px-4 text-center">Acción</th>
        </tr>
      </TableHead>
      <TableBody>
        {pedidos.map((p) => {
          const esMesa = p.tipo.toLowerCase() === 'mesa';

          return (
            <tr
              key={p.pedidoId}
              className={`transition-colors border-b border-line-soft hover:bg-neutral-50/70 ${
                p.estaListo ? 'bg-emerald-50/25' : ''
              }`}
            >
              {/* N.º Pedido */}
              <td className="py-3 px-4 font-semibold font-sans tabular-nums text-sm text-ink">
                #{p.numero}
              </td>

              {/* Destino */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  {esMesa ? (
                    <Utensils className="w-4 h-4 text-accent" />
                  ) : (
                    <ShoppingBag className="w-4 h-4 text-accent" />
                  )}
                  <span className="font-semibold text-sm text-ink">
                    {esMesa ? p.mesa || 'Mesa' : 'Para Llevar'}
                  </span>
                </div>
                {p.referencia && (
                  <span className="text-xs text-stone-500 italic block mt-0.5">
                    Ref: {p.referencia}
                  </span>
                )}
              </td>

              {/* Hora */}
              <td className="py-3 px-4 text-xs font-sans tabular-nums text-stone-600">
                {p.hora}
              </td>

              {/* Estado Cocina */}
              <td className="py-3 px-4">
                {p.estaListo ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Listo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                    <ChefHat className="w-3.5 h-3.5" />
                    En preparación
                  </span>
                )}
              </td>

              {/* Total a Cobrar */}
              <td className="py-3 px-4 text-right font-sans font-semibold tabular-nums text-sm text-accent">
                {formatCurrency(p.total)}
              </td>

              {/* Acción */}
              <td className="py-3.5 px-4 text-center">
                {p.estaListo ? (
                  <button
                    type="button"
                    onClick={() => onIniciarCobro(p)}
                    title={`Cobrar pedido #${p.numero}`}
                    aria-label={`Cobrar pedido #${p.numero}`}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer mx-auto min-h-[44px]"
                  >
                    <SolesIcon className="w-4 h-4" />
                    <span>Cobrar</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    title="Esperando que cocina termine la preparación"
                    aria-label={`Pedido #${p.numero} en cocina - esperando a cocina`}
                    className="px-3.5 py-2 rounded-xl bg-neutral-100 text-neutral-500 border border-neutral-200 text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed mx-auto min-h-[44px]"
                  >
                    <ChefHat className="w-4 h-4 text-neutral-500" />
                    <span>Esperando a cocina</span>
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </TableBody>
    </DataTable>
  );
};
