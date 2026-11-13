import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconVariant?: 'primary' | 'success' | 'warning' | 'info';
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconVariant = 'primary',
  className = '',
  onClick,
}) => {
  const iconVariants = {
    primary: 'bg-chip-accent-bg text-accent',
    success: 'bg-success-bg text-success',
    warning: 'bg-warning-bg text-warning',
    info: 'bg-info-bg text-info',
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`bg-surface border border-line rounded-2xl p-4 shadow-xs flex flex-col justify-between ${
        onClick ? 'cursor-pointer active:scale-98 transition-transform' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted truncate">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconVariants[iconVariant]}`}>
            <Icon className="w-4 h-4" aria-hidden="true" />
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-black text-ink tracking-tight tabular-nums">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-ink-muted mt-1 leading-snug">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
