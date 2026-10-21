import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ReportKpiCardProps {
  label: string;
  value: string;
  subvalue?: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'neutral';
  className?: string;
}

export const ReportKpiCard: React.FC<ReportKpiCardProps> = ({
  label,
  value,
  subvalue,
  icon: Icon,
  variant = 'neutral',
  className = '',
}) => {
  const variantStyles = {
    primary: 'border-amber-300/80 bg-amber-50/40 text-[#2C1A0E]',
    secondary: 'border-emerald-200 bg-emerald-50/40 text-emerald-950',
    neutral: 'border-neutral-200/90 bg-white text-[#2C1A0E]',
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border shadow-2xs flex flex-col justify-between ${variantStyles[variant]} ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-[#D35400] shadow-2xs shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-1">
        <span className="text-2xl sm:text-3xl font-extrabold font-sans tabular-nums text-[#2C1A0E]">
          {value}
        </span>
        {subvalue && (
          <p className="text-xs text-neutral-500 mt-0.5 font-medium">
            {subvalue}
          </p>
        )}
      </div>
    </div>
  );
};

export default ReportKpiCard;
