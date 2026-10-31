import React from 'react';
import { Layers, UtensilsCrossed, Edit2, PowerOff, Power } from 'lucide-react';
import { StatusBadge, IconActionButton, DataTable, TableHead, TableBody } from '../ui';
import { ROL_LABELS, CATEGORIA_BADGE_LABELS } from '../../types/producto';
import type { ProductoItem } from '../../types/producto';

export interface ProductTableProps {
  productos: ProductoItem[];
  cargando: boolean;
  errorCarga: string | null;
  onRetry: () => void;
  hayFiltrosActivos: boolean;
  onQuitarFiltros: () => void;
  productoResaltadoId: string | null;
  onAbrirEditar: (prod: ProductoItem, anchor?: HTMLButtonElement | null) => void;
  onAbrirConfirmacion: (
    prod: ProductoItem,
    tipo: 'activar' | 'desactivar',
    anchor?: HTMLButtonElement | null
  ) => void;
}

export const obtenerEstiloCategoria = (categoria: string) => {
  switch (categoria) {
    case 'Desayuno':
      return 'bg-amber-50 text-amber-900 border-amber-200/90';
    case 'Almuerzo':
      return 'bg-orange-50 text-orange-900 border-orange-200/90';
    case 'PlatosExtras':
    case 'Platos Extras':
    case 'Platos Extras / A la Carta':
      return 'bg-rose-50 text-rose-900 border-rose-200/90';
    case 'Combinados':
      return 'bg-purple-50 text-purple-900 border-purple-200/90';
    case 'Bebidas':
    case 'Bebidas y Refrescos':
      return 'bg-emerald-50 text-emerald-900 border-emerald-200/90';
    case 'Otro':
    case 'Otros':
      return 'bg-sky-50 text-sky-900 border-sky-200/90';
    default:
      return 'bg-neutral-100 text-neutral-700 border-neutral-200';
  }
};

export const ProductTable: React.FC<ProductTableProps> = ({
  productos,
  cargando,
  errorCarga,
  onRetry,
  hayFiltrosActivos,
  onQuitarFiltros,
  productoResaltadoId,
  onAbrirEditar,
  onAbrirConfirmacion,
}) => {
  return (
    <DataTable
      loading={cargando}
      error={errorCarga}
      onRetry={onRetry}
      isEmpty={productos.length === 0}
      emptyTitle="No se encontraron productos o componentes"
      emptyMessage={
        hayFiltrosActivos
          ? 'No hay registros que coincidan con los filtros aplicados. Pruebe con otro nombre o quite los filtros.'
          : 'Aún no se han registrado productos ni componentes en el sistema.'
      }
      emptyActionLabel={hayFiltrosActivos ? 'Quitar filtros' : undefined}
      onEmptyAction={hayFiltrosActivos ? onQuitarFiltros : undefined}
      minWidth="min-w-[800px]"
    >
      <TableHead>
        <tr>
          <th scope="col" className="py-3 px-4">PRODUCTO / COMPONENTE</th>
          <th scope="col" className="py-3 px-4">TIPO</th>
          <th scope="col" className="py-3 px-4">ROL / CATEGORÍA</th>
          <th scope="col" className="py-3 px-4 text-right">PRECIO</th>
          <th scope="col" className="py-3 px-4">ESTADO</th>
          <th scope="col" className="py-3 px-4 text-right">ACCIONES</th>
        </tr>
      </TableHead>
      <TableBody>
        {productos.map((prod) => {
          const estaResaltado = prod.id === productoResaltadoId;
          const esComponente = prod.tipo === 'Componente';

          return (
            <tr
              key={prod.id}
              className={`transition-colors border-b border-line-soft hover:bg-neutral-50/60 ${
                estaResaltado
                  ? 'bg-amber-50/70 ring-2 ring-inset ring-accent/40'
                  : ''
              }`}
            >
              <td className="py-3 px-4 font-medium text-neutral-900">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      esComponente
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-accent border border-amber-200'
                    }`}
                  >
                    {esComponente ? (
                      <Layers className="w-4 h-4" />
                    ) : (
                      <UtensilsCrossed className="w-4 h-4" />
                    )}
                  </div>
                  <span className="font-semibold text-ink text-sm break-words">
                    {prod.nombre}
                  </span>
                </div>
              </td>

              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                    esComponente
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-neutral-100 text-neutral-800'
                  }`}
                >
                  {esComponente ? 'Componente' : 'Carta'}
                </span>
              </td>

              <td className="py-3 px-4">
                {esComponente ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200/90">
                    Rol: {ROL_LABELS[prod.rol || ''] || prod.rol || 'Segundo'}
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center justify-center rounded-lg text-xs font-medium py-1 px-2.5 border ${obtenerEstiloCategoria(
                      prod.categoria || 'Otro'
                    )} text-center shadow-2xs`}
                  >
                    {CATEGORIA_BADGE_LABELS[prod.categoria || ''] ||
                      prod.categoria ||
                      'Otro'}
                  </span>
                )}
              </td>

              <td className="py-3 px-4 text-right font-medium">
                {prod.precio != null ? (
                  <span className="text-ink font-semibold text-sm tabular-nums whitespace-nowrap">
                    S/ {prod.precio.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-xs text-stone-500 italic">
                    En menú completo
                  </span>
                )}
              </td>

              <td className="py-3 px-4 whitespace-nowrap">
                <StatusBadge
                  status={prod.activo}
                  activeLabel="Activo"
                  inactiveLabel="Inactivo"
                />
              </td>

              <td className="py-3 px-4 text-center whitespace-nowrap">
                <div className="inline-flex items-center justify-center gap-1.5">
                  <IconActionButton
                    icon={Edit2}
                    label="Editar producto o componente"
                    variant="edit"
                    onClick={(e) => onAbrirEditar(prod, e.currentTarget as HTMLButtonElement)}
                  />

                  {prod.activo ? (
                    <IconActionButton
                      icon={PowerOff}
                      label="Desactivar producto"
                      variant="deactivate"
                      onClick={(e) =>
                        onAbrirConfirmacion(
                          prod,
                          'desactivar',
                          e.currentTarget as HTMLButtonElement
                        )
                      }
                    />
                  ) : (
                    <IconActionButton
                      icon={Power}
                      label="Activar producto"
                      variant="activate"
                      onClick={(e) =>
                        onAbrirConfirmacion(
                          prod,
                          'activar',
                          e.currentTarget as HTMLButtonElement
                        )
                      }
                    />
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </TableBody>
    </DataTable>
  );
};
