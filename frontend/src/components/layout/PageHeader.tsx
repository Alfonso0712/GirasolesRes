import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string | string[];
  count?: number;
  countLabel?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumb,
  count,
  countLabel = 'registros',
  badge,
  actions,
  className = '',
}) => {
  const breadcrumbItems = Array.isArray(breadcrumb)
    ? breadcrumb
    : breadcrumb
    ? [breadcrumb]
    : [];

  return (
    <header className={`shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 ${className}`}>
      <div>
        {breadcrumbItems.length > 0 && (
          <nav aria-label="Miga de pan" className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1 select-none">
            {breadcrumbItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-300 shrink-0" aria-hidden="true" />}
                <span className={idx === breadcrumbItems.length - 1 ? 'font-medium text-neutral-600' : 'hover:text-neutral-600'}>
                  {item}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold font-sans text-[#2C1A0E] tracking-tight">
            {title}
          </h1>

          {count !== undefined && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200 tabular-nums shadow-2xs">
              {count} {countLabel}
            </span>
          )}

          {badge}
        </div>

        {subtitle && (
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-normal">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
};

export default PageHeader;
