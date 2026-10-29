import React from 'react';

export interface QuickActionCardProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  disabledTooltip?: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * Componente unificado de accesos rápidos para todos los dashboards (RV-151).
 * Garantiza consistencia geométrica, tipográfica y de contraste (WCAG AA).
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
    'relative group w-full h-full min-h-[88px] p-4 rounded-2xl border text-left transition-colors flex items-center gap-3.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const stateStyles = disabled
    ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed shadow-none focus-visible:ring-neutral-400'
    : isPrimary
    ? 'bg-primary text-white border-transparent shadow-xs hover:bg-primary-hover hover:shadow-sm cursor-pointer focus-visible:ring-primary'
    : 'bg-surface text-neutral-800 border-neutral-200/80 shadow-xs hover:bg-canvas hover:border-accent/40 hover:text-neutral-900 hover:shadow-sm cursor-pointer focus-visible:ring-accent';

  const iconContainerStyles = disabled
    ? 'bg-neutral-200/70 text-neutral-400 border border-neutral-200'
    : isPrimary
    ? 'bg-white/20 text-white border border-white/25'
    : 'bg-canvas text-accent border border-neutral-200/60 group-hover:border-accent/30 group-hover:bg-chip-accent-bg';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      aria-label={ariaLabel || label}
      className={`${baseStyles} ${stateStyles} ${className}`.trim()}
    >
      <div
        className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors ${iconContainerStyles}`}
        aria-hidden="true"
      >
        <Icon className="w-5 h-5 shrink-0" />
      </div>

      <span className="flex-1 min-w-0 text-sm font-semibold uppercase tracking-wide leading-snug line-clamp-2 break-normal">
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
