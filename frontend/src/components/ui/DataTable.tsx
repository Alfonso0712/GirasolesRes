import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { EmptyState } from './EmptyState';

export interface DataTableProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  className?: string;
  minWidth?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  children,
  loading = false,
  error = null,
  onRetry,
  isEmpty = false,
  emptyTitle = 'No hay registros disponibles',
  emptyMessage = 'No se encontraron datos que coincidan con los filtros aplicados.',
  emptyActionLabel,
  onEmptyAction,
  className = '',
  minWidth = 'min-w-[900px]',
}) => {
  return (
    <div
      className={`w-full overflow-hidden bg-surface rounded-2xl border border-neutral-200/90 shadow-2xs ${className}`}
    >
      <div className="overflow-x-auto [scrollbar-width:thin]">
        {error ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3 border border-rose-200">
              <AlertCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h4 className="text-base font-bold text-ink mb-1">
              Error al cargar los datos
            </h4>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-md mb-4 font-normal">
              {error}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs font-semibold shadow-2xs transition-colors cursor-pointer min-h-[40px]"
              >
                <RotateCcw className="w-4 h-4 text-accent" />
                <span>Reintentar carga</span>
              </button>
            )}
          </div>
        ) : loading ? (
          <div className="p-6 space-y-3">
            <div className="h-10 bg-neutral-100 rounded-xl animate-pulse" />
            <div className="h-12 bg-neutral-50 rounded-xl animate-pulse" />
            <div className="h-12 bg-neutral-50 rounded-xl animate-pulse" />
            <div className="h-12 bg-neutral-50 rounded-xl animate-pulse" />
            <div className="h-12 bg-neutral-50 rounded-xl animate-pulse" />
          </div>
        ) : isEmpty ? (
          <div className="py-8">
            <EmptyState
              title={emptyTitle}
              description={emptyMessage}
              actionLabel={emptyActionLabel}
              onAction={onEmptyAction}
            />
          </div>
        ) : (
          <table className={`w-full text-left border-collapse ${minWidth}`}>
            {children}
          </table>
        )}
      </div>
    </div>
  );
};

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <thead
    className={`sticky top-0 z-10 bg-canvas text-ink-muted text-xs uppercase font-semibold tracking-wider border-b border-line select-none ${className}`}
  >
    {children}
  </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <tbody className={`divide-y divide-line-soft text-sm text-ink ${className}`}>
    {children}
  </tbody>
);

export const TableRow: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => (
  <tr
    onClick={onClick}
    className={`hover:bg-neutral-50/60 transition-colors ${
      onClick ? 'cursor-pointer' : ''
    } ${className}`}
  >
    {children}
  </tr>
);

export const TableHeaderCell: React.FC<{
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}> = ({ children, align = 'left', className = '' }) => {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted ${alignClass} ${className}`}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<{
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  tabular?: boolean;
}> = ({ children, align = 'left', className = '', tabular = false }) => {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <td
      className={`px-4 py-3.5 text-sm ${alignClass} ${tabular ? 'tabular-nums' : ''} ${className}`}
    >
      {children}
    </td>
  );
};

export default DataTable;
