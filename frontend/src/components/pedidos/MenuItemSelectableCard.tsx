import React from 'react';
import { Plus, Minus } from 'lucide-react';

export interface MenuItemSelectableCardProps {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  cantEnBorrador: number;
  esAgotado?: boolean;
  onAgregar: () => void;
  onDisminuir?: () => void;
}

export const MenuItemSelectableCard: React.FC<MenuItemSelectableCardProps> = ({
  nombre,
  categoria,
  precio,
  cantEnBorrador,
  esAgotado = false,
  onAgregar,
  onDisminuir,
}) => {
  return (
    <div
      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between relative ${
        esAgotado
          ? 'bg-neutral-100/70 border-neutral-300/80 text-neutral-500 select-none opacity-65'
          : cantEnBorrador > 0
          ? 'bg-amber-50/40 border-[#D35400] shadow-xs'
          : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-xs'
      }`}
    >
      {/* Insignia de Cantidad seleccionada */}
      {cantEnBorrador > 0 && !esAgotado && (
        <span className="absolute -top-2 -right-2 bg-[#D35400] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-xs tabular-nums">
          {cantEnBorrador}
        </span>
      )}

      <div>
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-sans font-semibold text-sm sm:text-base lg:text-lg text-[#2C1A0E] leading-snug break-words">
            {nombre}
          </h4>
          {esAgotado && (
            <span className="shrink-0 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
              Agotado
            </span>
          )}
        </div>
        <span className="block text-xs sm:text-sm text-[#7C6F66] mt-0.5">
          {categoria}
        </span>
      </div>

      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
        <span className="whitespace-nowrap font-bold tabular-nums text-base xl:text-lg text-neutral-800">
          S/ {precio.toFixed(2)}
        </span>

        {/* Controles táctiles accesibles (mínimo 44px de área táctil) */}
        <div className="flex items-center gap-1.5">
          {cantEnBorrador > 0 && onDisminuir && (
            <button
              type="button"
              onClick={onDisminuir}
              className="w-10 h-10 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              aria-label={`Disminuir ${nombre}`}
              title="Disminuir cantidad"
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          <button
            type="button"
            onClick={onAgregar}
            disabled={esAgotado}
            aria-disabled={esAgotado}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              esAgotado
                ? 'bg-neutral-200 text-neutral-500 border border-neutral-300 cursor-not-allowed opacity-60'
                : 'bg-[#D35400] hover:bg-[#B84600] text-white shadow-xs cursor-pointer active:scale-95'
            }`}
            aria-label={`Agregar ${nombre}`}
            title={esAgotado ? 'Plato agotado - No disponible' : 'Agregar plato al pedido'}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemSelectableCard;
