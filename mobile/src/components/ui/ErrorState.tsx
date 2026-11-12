import React from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  mensaje?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  mensaje = 'Ocurrió un error al cargar la información. Verifique su conexión e intente nuevamente.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-surface border border-line ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mb-3 shrink-0">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-ink mb-1">No se pudo cargar la información</h3>
      <p className="text-xs text-ink-muted max-w-xs mb-4 leading-relaxed">{mensaje}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="inline-flex items-center gap-2 border-line hover:bg-canvas"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Reintentar</span>
        </Button>
      )}
    </div>
  );
};
