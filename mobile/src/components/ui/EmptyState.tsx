import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  titulo: string;
  subtitulo?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  titulo,
  subtitulo,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-surface border border-line ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-chip-accent-bg text-accent border border-chip-accent-border flex items-center justify-center mb-3 shrink-0">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-ink mb-1">{titulo}</h3>
      {subtitulo && (
        <p className="text-xs text-ink-muted max-w-xs leading-relaxed mb-4">{subtitulo}</p>
      )}
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
};
