import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type PaginationItem = number | 'ellipsis';

/**
 * Calcula los números de página a mostrar según las reglas de usabilidad:
 * - 1 página o menos: ningún número (solo flechas/selector).
 * - Hasta 7 páginas: se muestran todos los números correlativos.
 * - Más de 7 páginas: primera, última, actual y sus vecinas inmediatas con 'ellipsis' en los saltos.
 */
export function calcularNumerosPaginacion(
  currentPage: number,
  totalPages: number
): PaginationItem[] {
  if (totalPages <= 1) {
    return [];
  }
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Más de 7 páginas
  // Caso 1: Actual cerca del inicio (1, 2, 3) -> 1, 2, 3, 4, ..., totalPages
  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis', totalPages];
  }

  // Caso 2: Actual cerca del final -> 1, ..., N-3, N-2, N-1, N
  if (currentPage >= totalPages - 2) {
    return [
      1,
      'ellipsis',
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // Caso 3: En el medio -> 1, ..., cur-1, cur, cur+1, ..., totalPages
  return [
    1,
    'ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis',
    totalPages,
  ];
}

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (newPageSize: number) => void;
  entityName?: string;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  entityName = 'registros',
  onPageChange,
  className = '',
}) => {
  if (totalItems === 0) return null;

  const effectivePageSize = pageSize ?? itemsPerPage;
  const start = Math.min((currentPage - 1) * effectivePageSize + 1, totalItems);
  const end = Math.min(currentPage * effectivePageSize, totalItems);

  // Opciones del selector: siempre incluye el tamaño actual garantizado
  const baseOptions = pageSizeOptions || [5, 10, 20, 50];
  const options = Array.from(new Set([...baseOptions, effectivePageSize])).sort(
    (a, b) => a - b
  );

  const mostrarSelector = Boolean(onPageSizeChange && pageSize !== undefined);
  const mostrarNumeros = Boolean(onPageSizeChange && totalPages > 1);
  const pageNumbers = mostrarNumeros
    ? calcularNumerosPaginacion(currentPage, totalPages)
    : [];

  return (
    <div
      role="navigation"
      aria-label="Paginación"
      className={`px-4 sm:px-6 py-3.5 bg-canvas border-t border-line flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-neutral-600 select-none ${className}`}
    >
      {/* Lado izquierdo: Selector 'Mostrar:' y contador 'Mostrando X a Y de Z' */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-start">
        {mostrarSelector && (
          <div className="flex items-center gap-1.5">
            <label
              htmlFor={`table-page-size-${entityName}`}
              className="font-medium text-neutral-600 whitespace-nowrap"
            >
              Mostrar:
            </label>
            <select
              id={`table-page-size-${entityName}`}
              aria-label="Filas por página"
              value={effectivePageSize}
              onChange={(e) => onPageSizeChange!(Number(e.target.value))}
              className="rounded-xl border border-neutral-200/90 bg-surface text-ink px-2.5 py-1.5 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer shadow-2xs transition-colors"
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} por página
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="font-medium text-neutral-600" aria-live="polite">
          Mostrando <span className="font-bold text-ink tabular-nums">{start}</span> a{' '}
          <span className="font-bold text-ink tabular-nums">{end}</span> de{' '}
          <span className="font-bold text-ink tabular-nums">{totalItems}</span> {entityName}
        </div>
      </div>

      {/* Lado derecho: Botones de navegación y números de página */}
      <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-center md:justify-end">
        {/* Texto 'Página N de M': visible siempre en móvil (< sm) o cuando no hay números */}
        <span
          className={`font-medium text-neutral-600 ${
            mostrarNumeros ? 'sm:sr-only' : ''
          }`}
        >
          Página <span className="font-bold text-ink tabular-nums">{currentPage}</span> de{' '}
          <span className="font-bold text-ink tabular-nums">{Math.max(1, totalPages)}</span>
        </span>

        <div className="flex items-center gap-1.5">
          {/* Botón Página Anterior */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Página anterior"
            className="p-2 min-h-[40px] min-w-[40px] rounded-xl border border-neutral-200/90 bg-surface hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-700 transition-colors shadow-2xs flex items-center justify-center cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Números de página interactivos (visibles desde sm hacia arriba) */}
          {mostrarNumeros && (
            <div className="hidden sm:flex items-center gap-1.5">
              {pageNumbers.map((item, idx) => {
                if (item === 'ellipsis') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      aria-hidden="true"
                      className="min-h-[40px] min-w-[32px] flex items-center justify-center text-neutral-400 font-bold select-none text-sm"
                    >
                      …
                    </span>
                  );
                }

                const isCurrent = item === currentPage;
                return (
                  <button
                    key={`page-${item}`}
                    type="button"
                    onClick={() => onPageChange(item)}
                    aria-label={`Ir a la página ${item}`}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`p-2 min-h-[40px] min-w-[40px] rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-center cursor-pointer active:scale-95 tabular-nums ${
                      isCurrent
                        ? 'bg-primary text-white border-primary font-bold shadow-xs'
                        : 'border-neutral-200/90 bg-surface hover:bg-neutral-100 text-neutral-700 font-medium shadow-2xs'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          )}

          {/* Botón Página Siguiente */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Página siguiente"
            className="p-2 min-h-[40px] min-w-[40px] rounded-xl border border-neutral-200/90 bg-surface hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-700 transition-colors shadow-2xs flex items-center justify-center cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
