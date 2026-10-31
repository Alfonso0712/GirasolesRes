import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: 'positive' | 'warning' | 'negative' | 'neutral';
  };
  onClick?: () => void;
  className?: string;
  accentColor?: string;
  layout?: 'vertical' | 'horizontal';
  iconBg?: string;
  iconColor?: string;
  children?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  onClick,
  className = '',
  layout = 'vertical',
  iconBg,
  iconColor,
  children,
}) => {
  const badgeColors = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    negative: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  };

  if (layout === 'horizontal') {
    return (
      <div
        onClick={onClick}
        className={`bg-surface rounded-2xl p-4 border border-neutral-200/90 shadow-2xs flex items-center gap-3.5 transition-all ${
          onClick ? 'cursor-pointer hover:border-amber-400 hover:shadow-xs' : ''
        } ${className}`}
      >
        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              iconBg || 'bg-amber-50 border-amber-200'
            } ${iconColor || 'text-accent'}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
            {title}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-sans font-bold text-2xl text-ink tabular-nums">
              {value}
            </span>
            {subtitle && (
              <span className="text-xs text-neutral-500 font-medium">{subtitle}</span>
            )}
          </div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-2xs flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-amber-400 hover:shadow-xs' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              iconBg || 'bg-amber-50 border-amber-200/50'
            } ${iconColor || 'text-accent'}`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-2xl sm:text-3xl font-bold text-ink font-sans tabular-nums">
          {value}
        </span>
        {badge && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              badgeColors[badge.variant || 'neutral']
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <span className="text-xs text-neutral-500 mt-1 font-medium">
          {subtitle}
        </span>
      )}
      {children}
    </div>
  );
};

export default StatCard;
