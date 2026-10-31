import React from 'react';
import { CupSoda, ChefHat, Soup, Salad, UtensilsCrossed } from 'lucide-react';
import { SeccionComponentesRol } from './SeccionComponentesRol';
import type { CandidatoMenu } from '../../types/menuDia';

export interface MenuDiaOpcionesTabProps {
  compBebidasDesayuno: CandidatoMenu[];
  compPlatosDesayuno: CandidatoMenu[];
  compSopas: CandidatoMenu[];
  compEntradas: CandidatoMenu[];
  compSegundos: CandidatoMenu[];
  opcionesSeleccionadas: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onDeselectAll: (ids: string[]) => void;
}

export const MenuDiaOpcionesTab: React.FC<MenuDiaOpcionesTabProps> = ({
  compBebidasDesayuno,
  compPlatosDesayuno,
  compSopas,
  compEntradas,
  compSegundos,
  opcionesSeleccionadas,
  onToggle,
  onSelectAll,
  onDeselectAll,
}) => {
  return (
    <div className="space-y-6">
      {/* SECCIÓN 1: BEBIDAS DE DESAYUNO */}
      <SeccionComponentesRol
        titulo="Bebidas de Desayuno"
        icon={CupSoda}
        items={compBebidasDesayuno}
        seleccionados={opcionesSeleccionadas}
        onToggle={onToggle}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
      />

      {/* SECCIÓN 2: PLATOS DE DESAYUNO */}
      <SeccionComponentesRol
        titulo="Platos de Desayuno"
        icon={ChefHat}
        items={compPlatosDesayuno}
        seleccionados={opcionesSeleccionadas}
        onToggle={onToggle}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
      />

      {/* SECCIÓN 3: SOPAS */}
      <SeccionComponentesRol
        titulo="Sopas del Día"
        icon={Soup}
        items={compSopas}
        seleccionados={opcionesSeleccionadas}
        onToggle={onToggle}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
      />

      {/* SECCIÓN 4: ENTRADAS */}
      <SeccionComponentesRol
        titulo="Entradas del Día"
        icon={Salad}
        items={compEntradas}
        seleccionados={opcionesSeleccionadas}
        onToggle={onToggle}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
      />

      {/* SECCIÓN 5: SEGUNDOS */}
      <SeccionComponentesRol
        titulo="Segundos del Día"
        icon={UtensilsCrossed}
        items={compSegundos}
        seleccionados={opcionesSeleccionadas}
        onToggle={onToggle}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
      />
    </div>
  );
};
