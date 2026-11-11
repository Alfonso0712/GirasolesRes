import React from 'react';
import { CircleHelp } from 'lucide-react';

export interface GuiaButtonProps {
  onClick: () => void;
  variant?: 'desktop' | 'mobile';
}

const ETIQUETA = 'Guía';
const ARIA_LABEL = 'Abrir guía del sistema';
const TITULO = 'Ver guía del sistema';

/**
 * Botón de presentación que abre la guía del sistema. Replica proporciones,
 * tipografía y colores de ThemeToggle para que ambos se vean como pareja.
 */
export const GuiaButton: React.FC<GuiaButtonProps> = ({ onClick, variant = 'desktop' }) => {
  if (variant === 'mobile') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ARIA_LABEL}
        aria-haspopup="dialog"
        title={TITULO}
        className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-raised flex items-center gap-2.5 min-h-[44px] cursor-pointer transition-colors"
      >
        <CircleHelp className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
        <span>{ETIQUETA}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ARIA_LABEL}
      aria-haspopup="dialog"
      title={TITULO}
      className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors cursor-pointer min-h-[44px] sm:min-h-0"
    >
      <CircleHelp className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-hidden="true" />
      <span>{ETIQUETA}</span>
    </button>
  );
};

export default GuiaButton;
