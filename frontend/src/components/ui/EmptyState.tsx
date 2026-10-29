import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox, WifiOff, RefreshCw } from 'lucide-react';
import { CONNECTION_ERROR_MESSAGE } from '../../services/apiClient';

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

export interface ConnectionErrorStateProps {
  message?: string;
  onRetry: () => void;
  retrying?: boolean;
  className?: string;
}

export const ConnectionErrorState: React.FC<ConnectionErrorStateProps> = ({
  message = CONNECTION_ERROR_MESSAGE,
  onRetry,
  retrying = false,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`flex-1 flex flex-col items-center justify-center min-h-[400px] p-6 text-center ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-accent mb-4 shadow-2xs">
        <WifiOff className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-bold font-sans text-ink mb-2">
        Error de conexión
      </h2>
      <p className="text-sm text-ink-muted max-w-md mb-6">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm shadow-xs hover:bg-primary-hover transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60"
      >
        <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
        <span>Reintentar</span>
      </button>
    </div>
  );
};

export default EmptyState;
