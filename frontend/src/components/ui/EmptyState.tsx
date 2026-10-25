import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-surface/70 rounded-3xl border border-dashed border-amber-300 my-auto ${className}`}>
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-50 text-accent flex items-center justify-center mb-4 shadow-xs border border-amber-200/60">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold font-sans text-neutral-800 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
