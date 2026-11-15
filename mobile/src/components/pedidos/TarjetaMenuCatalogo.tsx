import React from 'react';
import { Plus } from 'lucide-react';
import type { MenuCompletoDiaDto } from '../../types/menuDia';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/format';

export interface TarjetaMenuCatalogoProps {
  menu: MenuCompletoDiaDto;
  esMozo?: boolean;
  onArmar: (menu: MenuCompletoDiaDto) => void;
}

/**
 * Tarjeta presentacional para seleccionar y armar un Menú Completo del día.
 */
export const TarjetaMenuCatalogo: React.FC<TarjetaMenuCatalogoProps> = ({
  menu,
  esMozo = false,
  onArmar,
}) => (
  <Card accent="info" className="handed-card p-3.5 flex items-center justify-between gap-3 shadow-xs select-none">
    <div className="handed-card-info flex-1 min-w-0 pr-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        <h3 className="text-sm font-extrabold text-ink leading-snug">{menu.nombre}</h3>
        <span className="text-xs font-bold bg-chip-accent-bg text-accent border border-chip-accent-border px-1.5 py-0.5 rounded">
          Menú Completo
        </span>
      </div>
      <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">
        {menu.incluye || 'Entrada / Sopa + Segundo + Bebida'}
      </p>
      {!esMozo ? (
        <p className="text-xs font-extrabold text-accent mt-1 tabular-nums">{formatCurrency(menu.precio)}</p>
      ) : (
        <p className="text-xs font-semibold text-ink-muted mt-1">Platos a elección</p>
      )}
    </div>
    <button
      type="button"
      onClick={() => onArmar(menu)}
      aria-label={`Armar ${menu.nombre}`}
      title={`Armar ${menu.nombre}`}
      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-primary text-white flex items-center justify-center active:scale-95 shadow-xs shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent outline-hidden"
    >
      <Plus className="w-5 h-5" aria-hidden="true" />
    </button>
  </Card>
);
