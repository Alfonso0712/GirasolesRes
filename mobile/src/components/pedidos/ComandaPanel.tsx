import React from 'react';
import { Receipt } from 'lucide-react';
import { pluralizar } from '../../utils/format';
import { ContenidoComanda } from './ContenidoComanda';
import type { ContenidoComandaProps } from './ContenidoComanda';

export interface ComandaPanelProps {
  contenido: ContenidoComandaProps;
  tituloAside: string;
  ariaLabelAside: string;
  vacioTitulo: string;
  vacioSubtitulo: string;
}

/**
 * Panel lateral de comanda/orden en tablet y escritorio compartido entre salón y llevar.
 */
export const ComandaPanel: React.FC<ComandaPanelProps> = ({
  contenido,
  tituloAside,
  ariaLabelAside,
  vacioTitulo,
  vacioSubtitulo,
}) => {
  const { lineas, totalItems } = contenido.config;

  return (
    <aside
      aria-label={ariaLabelAside}
      className="hidden md:flex md:w-80 lg:w-96 flex-col border-l border-line bg-surface min-h-0 shrink-0"
    >
      <div className="p-4 border-b border-line flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-accent" aria-hidden="true" />
          <h3 className="text-sm font-extrabold text-ink">{tituloAside}</h3>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {pluralizar(totalItems, 'ítem', 'ítems')}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {lineas.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-ink-muted">
            <Receipt className="w-12 h-12 stroke-1 text-ink-muted/40 mb-2" aria-hidden="true" />
            <p className="text-sm font-bold">{vacioTitulo}</p>
            <p className="text-xs text-ink-muted mt-1">{vacioSubtitulo}</p>
          </div>
        ) : (
          <ContenidoComanda {...contenido} />
        )}
      </div>
    </aside>
  );
};
