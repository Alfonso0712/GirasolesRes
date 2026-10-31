import React from 'react';
import { Coffee, UtensilsCrossed, Soup, Sparkles } from 'lucide-react';
import { SolesIcon } from '../ui/SolesIcon';
import { ROL_LABELS } from '../../types/producto';
import type { MenuCompletoItem, MenuCompletoParteItem } from '../../types/menuCompleto';

export interface MenuCatalogoCardProps {
  menu: MenuCompletoItem;
  onModificarPrecio: (menu: MenuCompletoItem) => void;
  onCambiarEstado: (menu: MenuCompletoItem) => void;
}

export const MenuCatalogoCard: React.FC<MenuCatalogoCardProps> = ({
  menu: m,
  onModificarPrecio,
  onCambiarEstado,
}) => {
  const icono =
    m.id === 1 ? (
      <Coffee className="w-5 h-5 text-amber-700" />
    ) : m.id === 2 ? (
      <UtensilsCrossed className="w-5 h-5 text-orange-700" />
    ) : (
      <Soup className="w-5 h-5 text-rose-700" />
    );

  return (
    <div
      key={m.id}
      className={`bg-surface rounded-2xl border p-6 xl:p-7 flex flex-col justify-between shadow-sm transition-all hover:shadow-md ${
        m.activo ? 'border-neutral-200/90' : 'border-neutral-200 bg-neutral-50/70 opacity-80'
      }`}
    >
      <div>
        {/* Cabecera de la tarjeta */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-canvas border border-amber-900/10 flex items-center justify-center">
              {icono}
            </div>
            <div>
              <h3 className="font-sans font-bold text-base sm:text-lg lg:text-xl text-ink leading-snug break-words">
                {m.nombre}
              </h3>
              <span className="text-xs text-neutral-500 font-medium">
                Fórmula #{m.id}
              </span>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
              m.activo
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-neutral-100 text-neutral-500 border-neutral-200'
            }`}
          >
            {m.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Precio */}
        <div className="mt-5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 flex items-baseline justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Precio actual
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-accent">S/</span>
            <span className="text-2xl font-sans font-bold tabular-nums whitespace-nowrap text-accent">
              {m.precio.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Incluye adicional */}
        {m.incluye && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50/70 border border-emerald-200/60 px-3 py-1.5 rounded-lg font-medium">
            <Sparkles className="w-3.5 h-3.5 text-success shrink-0" />
            <span>Incluye: {m.incluye}</span>
          </div>
        )}

        {/* Desglose de Partes que lo componen */}
        <div className="mt-4 space-y-2">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Componentes requeridos ({m.partes.length})
          </p>
          <div className="space-y-1.5">
            {m.partes.map((p: MenuCompletoParteItem) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-neutral-50/80 border border-neutral-100 text-neutral-700"
              >
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-xs">
                    {p.orden}
                  </span>
                  {p.nombre}
                </span>
                <span className="text-xs text-neutral-500 tabular-nums">
                  {p.rolesPermitidos.map((r: string) => ROL_LABELS[r] || r).join(' o ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones del menú completo */}
      <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onModificarPrecio(m)}
          className="flex-1 py-2 px-3 rounded-xl bg-surface border border-neutral-200 text-neutral-800 hover:bg-neutral-50 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:border-accent"
        >
          <SolesIcon className="w-3.5 h-3.5 text-accent" />
          <span>Modificar precio</span>
        </button>

        <button
          type="button"
          onClick={() => onCambiarEstado(m)}
          className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            m.activo
              ? 'bg-amber-50 text-accent border-amber-200 hover:bg-amber-100'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          {m.activo ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </div>
  );
};

export default MenuCatalogoCard;
