import React from 'react';
import { SeccionCartaCategoria } from './SeccionCartaCategoria';
import type { CandidatoMenu } from '../../types/menuDia';

export interface MenuDiaCartaTabProps {
  catCartaActiva: string;
  onSelectCategoria: (cat: string) => void;
  cartaDesayunos: CandidatoMenu[];
  cartaAlmuerzos: CandidatoMenu[];
  cartaCombinados: CandidatoMenu[];
  cartaBebidas: CandidatoMenu[];
  cartaOtros: CandidatoMenu[];
  platosCartaSeleccionados: Set<string>;
  onTogglePlatoCarta: (id: string) => void;
  onSelectAllCarta: (ids: string[]) => void;
  onDeselectAllCarta: (ids: string[]) => void;
}

export const MenuDiaCartaTab: React.FC<MenuDiaCartaTabProps> = ({
  catCartaActiva,
  onSelectCategoria,
  cartaDesayunos,
  cartaAlmuerzos,
  cartaCombinados,
  cartaBebidas,
  cartaOtros,
  platosCartaSeleccionados,
  onTogglePlatoCarta,
  onSelectAllCarta,
  onDeselectAllCarta,
}) => {
  return (
    <div className="space-y-6">
      {/* SELECTOR DE CATEGORÍA DE CARTA */}
      <div className="flex gap-2 border-b border-neutral-200 pb-2 overflow-x-auto">
        {[
          {
            id: 'Desayuno',
            label: 'Desayunos de carta',
            count: cartaDesayunos.filter((c) => platosCartaSeleccionados.has(c.id)).length,
            total: cartaDesayunos.length,
          },
          {
            id: 'Almuerzo',
            label: 'Platos / Extras',
            count: cartaAlmuerzos.filter((c) => platosCartaSeleccionados.has(c.id)).length,
            total: cartaAlmuerzos.length,
          },
          {
            id: 'Combinados',
            label: 'Combinados',
            count: cartaCombinados.filter((c) => platosCartaSeleccionados.has(c.id)).length,
            total: cartaCombinados.length,
          },
          {
            id: 'Bebidas',
            label: 'Bebidas',
            count: cartaBebidas.filter((c) => platosCartaSeleccionados.has(c.id)).length,
            total: cartaBebidas.length,
          },
          {
            id: 'Otros',
            label: 'Otros',
            count: cartaOtros.filter((c) => platosCartaSeleccionados.has(c.id)).length,
            total: cartaOtros.length,
          },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategoria(cat.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              catCartaActiva === cat.id
                ? 'bg-fill-strong text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {cat.label} ({cat.count}/{cat.total})
          </button>
        ))}
      </div>

      {/* GRILLA DE PRODUCTOS DE CARTA SEGÚN CATEGORÍA SELECCIONADA */}
      <SeccionCartaCategoria
        categoriaNombre={catCartaActiva}
        items={
          catCartaActiva === 'Desayuno'
            ? cartaDesayunos
            : catCartaActiva === 'Almuerzo'
            ? cartaAlmuerzos
            : catCartaActiva === 'Combinados'
            ? cartaCombinados
            : catCartaActiva === 'Bebidas'
            ? cartaBebidas
            : cartaOtros
        }
        seleccionados={platosCartaSeleccionados}
        onToggle={onTogglePlatoCarta}
        onSelectAll={onSelectAllCarta}
        onDeselectAll={onDeselectAllCarta}
      />
    </div>
  );
};
