import React from 'react';
import { pluralizar } from '../../utils/format';

export interface BannerBorradorMesaProps {
  cantidadPlatos: number;
  onDescartar: () => void;
  onContinuar: () => void;
}

/**
 * Aviso contextual para recuperar o descartar un borrador guardado en sessionStorage por mesa.
 */
export const BannerBorradorMesa: React.FC<BannerBorradorMesaProps> = ({
  cantidadPlatos,
  onDescartar,
  onContinuar,
}) => (
  <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-ink">
        Tiene un pedido sin registrar ({pluralizar(cantidadPlatos, 'plato', 'platos')}).
      </p>
      <p className="text-xs text-ink-muted">¿Desea continuarlo?</p>
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        type="button"
        onClick={onDescartar}
        className="px-2.5 py-1.5 rounded-lg border border-line bg-surface text-ink text-xs font-bold active:scale-95 cursor-pointer min-h-[44px]"
      >
        Descartar
      </button>
      <button
        type="button"
        onClick={onContinuar}
        className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold active:scale-95 cursor-pointer min-h-[44px]"
      >
        Continuar
      </button>
    </div>
  </div>
);
