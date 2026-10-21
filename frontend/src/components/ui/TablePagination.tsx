import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  entityName?: string;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  entityName = 'registros',
  onPageChange,
  className = '',
}) => {
  if (totalItems === 0) return null;

  const start = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={`px-4 sm:px-6 py-3.5 bg-[#FAF7F4] border-t border-[#E5E0DB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-neutral-600 select-none ${className}`}
    >
      <div className="font-medium text-neutral-600">
        Mostrando <span className="font-bold text-[#2C1A0E] tabular-nums">{start}</span> a{' '}
        <span className="font-bold text-[#2C1A0E] tabular-nums">{end}</span> de{' '}
        <span className="font-bold text-[#2C1A0E] tabular-nums">{totalItems}</span> {entityName}
      </div>

      <div className="flex items-center gap-3">
        <span className="font-medium text-neutral-600">
          Página <span className="font-bold text-[#2C1A0E] tabular-nums">{currentPage}</span> de{' '}
          <span className="font-bold text-[#2C1A0E] tabular-nums">{Math.max(1, totalPages)}</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Página anterior"
            className="p-2 min-h-[38px] min-w-[38px] rounded-xl border border-neutral-200/90 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-700 transition-colors shadow-2xs flex items-center justify-center cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Página siguiente"
            className="p-2 min-h-[38px] min-w-[38px] rounded-xl border border-neutral-200/90 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-700 transition-colors shadow-2xs flex items-center justify-center cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
