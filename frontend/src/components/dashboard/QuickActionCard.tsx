import React from 'react';

export interface QuickActionCardProps {
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  disabledTooltip?: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * Componente unificado de accesos rápidos para todos los dashboards (RV-151).
 * Altura fija h-16 (64 px), padding px-4 py-2, contenedor de icono 32x32 y WCAG AA.
 */
export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  label,
  icon: Icon,
  onClick,
  variant = 'secondary',
  disabled = false,
  disabledTooltip,
  ariaLabel,
  className = '',
}) => {
  const isPrimary = variant === 'primary';

  const baseStyles =
    'relative group w-full h-16 px-4 py-2 rounded-2xl border text-left transition-colors flex items-center gap-3 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 shrink-0';

  const stateStyles = disabled
    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 border-line cursor-not-allowed shadow-none focus-visible:ring-neutral-400'
    : isPrimary
    ? 'bg-primary text-white border-transparent shadow-xs hover:bg-primary-hover hover:shadow-sm cursor-pointer focus-visible:ring-primary'
    : 'bg-surface text-ink border-line shadow-xs hover:bg-canvas hover:border-accent/40 hover:shadow-sm cursor-pointer focus-visible:ring-accent';

  const iconContainerStyles = disabled
    ? 'bg-neutral-200/70 dark:bg-neutral-700/70 text-neutral-400 dark:text-neutral-500 border border-line'
    : isPrimary
    ? 'bg-white/20 text-white border border-white/25'
    : 'bg-canvas text-accent border border-line group-hover:border-accent/40 group-hover:bg-chip-accent-bg';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      aria-label={ariaLabel || label}
      className={`${baseStyles} ${stateStyles} ${className}`.trim()}
    >
      <div
        className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-colors ${iconContainerStyles}`}
        aria-hidden="true"
      >
        <Icon className="w-[18px] h-[18px] shrink-0" size={18} />
      </div>

      <span className="flex-1 min-w-0 text-sm font-semibold uppercase tracking-wide leading-tight line-clamp-2 break-words hyphens-none">
        {label}
      </span>

      {disabled && disabledTooltip && (
        <span
          role="tooltip"
          className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-fill-strong text-white text-xs px-2.5 py-1 rounded-md shadow-md whitespace-nowrap z-20 pointer-events-none"
        >
          {disabledTooltip}
        </span>
      )}
    </button>
  );
};

export default QuickActionCard;
