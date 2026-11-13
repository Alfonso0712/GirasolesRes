import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title?: string;
  titulo?: string;
  value?: string | number;
  valor?: string | number;
  subtitle?: string;
  subtitulo?: string;
  icon?: LucideIcon | React.ReactNode;
  iconVariant?: 'primary' | 'success' | 'warning' | 'info';
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  titulo,
  value,
  valor,
  subtitle,
  subtitulo,
  icon,
  iconVariant = 'primary',
  className = '',
  onClick,
}) => {
  const finalTitle = title ?? titulo ?? '';
  const finalValue = value ?? valor ?? '';
  const finalSubtitle = subtitle ?? subtitulo;

  const iconVariants = {
    primary: 'bg-chip-accent-bg text-accent',
    success: 'bg-success-bg text-success',
    warning: 'bg-warning-bg text-warning',
    info: 'bg-info-bg text-info',
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as LucideIcon;
    return <IconComponent className="w-4 h-4" aria-hidden="true" />;
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
          {finalTitle}
        </span>
        {icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconVariants[iconVariant]}`}>
            {renderIcon()}
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-black text-ink tracking-tight tabular-nums">
          {finalValue}
        </p>
        {finalSubtitle && (
          <p className="text-xs text-ink-muted mt-1 leading-snug">
            {finalSubtitle}
          </p>
        )}
      </div>
    </div>
  );
};
