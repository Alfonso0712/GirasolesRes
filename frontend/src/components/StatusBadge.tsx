import React from 'react';

export interface StatusBadgeProps {
  status: boolean | string;
  variant?: 'dot' | 'pill' | 'fixed';
  className?: string;
  activeLabel?: string;
  inactiveLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'dot',
  className = '',
  activeLabel = 'Activo',
  inactiveLabel = 'Inactivo',
}) => {
  const isBoolean = typeof status === 'boolean';
  const label = isBoolean ? (status ? activeLabel : inactiveLabel) : status;
  const normalized = String(label).trim().toLowerCase();

  const isPositive =
    normalized === 'activo' ||
    normalized === 'libre' ||
    normalized === 'abierta' ||
    normalized === 'listo' ||
    normalized === 'entregado' ||
    normalized === 'cuadra' ||
    normalized === 'emitido' ||
    normalized === 'pagado';

  const isWarning =
    normalized === 'ocupada' ||
    normalized === 'ocupado' ||
    normalized === 'pendiente' ||
    normalized === 'en preparacion' ||
    normalized === 'en preparación' ||
    normalized === 'sobrante' ||
    normalized === 'en curso';

  const isNegative =
    normalized === 'inactivo' ||
    normalized === 'bloqueado' ||
    normalized === 'desactivado' ||
    normalized === 'cerrada' ||
    normalized === 'cancelado' ||
    normalized === 'faltante' ||
    normalized === 'anulado' ||
    normalized === 'anterior sin cerrar';

  // Variant: Dot indicator (ideal for tables matching UsersApp standard)
  if (variant === 'dot') {
    const dotColor = isPositive
      ? 'bg-emerald-500'
      : isWarning
      ? 'bg-amber-500'
      : isNegative
      ? 'bg-rose-500'
      : 'bg-neutral-400';

    const textColor = isPositive
      ? 'text-emerald-700'
      : isWarning
      ? 'text-amber-700'
      : isNegative
      ? 'text-rose-700'
      : 'text-neutral-500';

    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className={`w-2 h-2 rounded-full ${dotColor}`} aria-hidden="true" />
        <span className={`text-xs font-semibold ${textColor}`}>
          {label}
        </span>
      </div>
    );
  }

  // Variant: Fixed size pill (w-28 h-7) for strict tabular alignments
  if (variant === 'fixed') {
    let colorClasses = 'bg-stone-50 text-stone-600 border-stone-200';
    if (isPositive) {
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    } else if (isWarning) {
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-300';
    } else if (isNegative) {
      colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
    }

    return (
      <span
        className={`w-28 h-7 inline-flex items-center justify-center rounded-lg text-xs font-semibold border ${colorClasses} text-center shadow-2xs ${className}`}
      >
        {label}
      </span>
    );
  }

  // Variant: Standard rounded-full pill (Cards & Banners)
  let pillClasses = 'bg-stone-50 text-stone-700 border-stone-200';
  let dotClasses = 'bg-stone-400';

  if (isPositive) {
    pillClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotClasses = 'bg-emerald-500';
  } else if (isWarning) {
    pillClasses = 'bg-amber-50 text-amber-800 border-amber-200';
    dotClasses = 'bg-amber-500';
  } else if (isNegative) {
    pillClasses = 'bg-rose-50 text-rose-800 border-rose-200';
    dotClasses = 'bg-rose-500';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${pillClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClasses}`} aria-hidden="true" />
      {label}
    </span>
  );
};

export default StatusBadge;
