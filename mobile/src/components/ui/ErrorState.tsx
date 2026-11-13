import React from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  titulo?: string;
  mensaje?: string;
  onRetry?: () => void;
  textoBoton?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  titulo = 'No se pudo cargar la información',
  mensaje = 'Ocurrió un error al cargar los datos. Verifique su conexión e intente nuevamente.',
  onRetry,
  textoBoton = 'Reintentar',
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-surface border border-line ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-danger-bg text-danger border border-danger-border flex items-center justify-center mb-3 shrink-0">
        <AlertCircle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-ink mb-1">{titulo}</h3>
      <p className="text-xs text-ink-muted max-w-xs mb-4 leading-relaxed">{mensaje}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          icon={<RotateCw className="w-4 h-4" aria-hidden="true" />}
          className="inline-flex items-center gap-2 border-line hover:bg-canvas"
        >
          {textoBoton}
        </Button>
      )}
    </div>
  );
};
