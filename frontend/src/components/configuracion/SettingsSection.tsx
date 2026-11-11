import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface SettingsSectionProps {
  id?: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  id,
  icon: Icon,
  title,
  description,
  children,
  className = '',
}) => {
  const titleId = id ? `${id}-titulo` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={`bg-surface rounded-2xl border border-line p-4 sm:p-5 shadow-xs flex flex-col gap-4 text-ink ${className}`}
    >
      <div className="flex items-center gap-2.5 pb-2.5 border-b border-line">
        <div
          className="w-8 h-8 rounded-lg bg-brand-tint text-accent flex items-center justify-center shrink-0 border border-amber-200/50 shadow-2xs"
          aria-hidden="true"
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h2 id={titleId} className="text-sm font-bold text-ink truncate">
            {title}
          </h2>
          <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {children}
      </div>
    </section>
  );
};

export default SettingsSection;
