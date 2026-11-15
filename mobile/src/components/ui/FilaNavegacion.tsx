import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Card } from './Card';

export interface FilaNavegacionProps {
  icono: React.ReactNode;
  titulo: string;
  descripcion?: string;
  etiqueta?: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
}

/**
 * Fila interactiva de navegación con ícono izquierdo de 48 px, bloque de texto flex-1 min-w-0
 * (con etiqueta debajo del texto para evitar colapsos horizontales) y flecha derecha centrada.
 */
export const FilaNavegacion: React.FC<FilaNavegacionProps> = ({
  icono,
  titulo,
  descripcion,
  etiqueta,
  onClick,
  ariaLabel,
  className = '',
}) => {
  return (
    <Card
      accent="none"
      padding="none"
      interactive
      onClick={onClick}
      aria-label={ariaLabel}
      className={`min-h-16 px-4 py-3.5 flex items-center gap-3.5 ${className}`.trim()}
    >
      <div
        aria-hidden="true"
        className="w-12 h-12 rounded-2xl bg-primary/10 text-accent flex items-center justify-center shrink-0"
      >
        {icono}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-ink leading-snug">
          {titulo}
        </h3>
        {descripcion && (
          <p className="text-sm text-ink-muted leading-snug line-clamp-3 mt-0.5">
            {descripcion}
          </p>
        )}
        {etiqueta && (
          <div className="inline-flex flex-wrap items-center gap-2 mt-2">
            {etiqueta}
          </div>
        )}
      </div>

      <ChevronRight
        className="w-5 h-5 text-ink-muted shrink-0"
        aria-hidden="true"
      />
    </Card>
  );
};
