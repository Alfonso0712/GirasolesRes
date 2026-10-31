import React from 'react';
import { CardMenuCompletoDia } from './CardMenuCompletoDia';
import type { CandidatoMenu } from '../../types/menuDia';

export interface MenuDiaMenusCompletosTabProps {
  menusCompletosHabilitados: Set<number>;
  onToggleMenuCompleto: (id: number) => void;
  opcionesSeleccionadas: Set<string>;
  compBebidasDesayuno: CandidatoMenu[];
  compPlatosDesayuno: CandidatoMenu[];
  compSopas: CandidatoMenu[];
  compEntradas: CandidatoMenu[];
  compSegundos: CandidatoMenu[];
}

export const MenuDiaMenusCompletosTab: React.FC<MenuDiaMenusCompletosTabProps> = ({
  menusCompletosHabilitados,
  onToggleMenuCompleto,
  opcionesSeleccionadas,
  compBebidasDesayuno,
  compPlatosDesayuno,
  compSopas,
  compEntradas,
  compSegundos,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. DESAYUNO COMPLETO */}
        <CardMenuCompletoDia
          id={1}
          nombre="Desayuno completo"
          precio={7.0}
          incluye="Pan"
          habilitado={menusCompletosHabilitados.has(1)}
          onToggle={() => onToggleMenuCompleto(1)}
          partes={[
            {
              nombre: 'Bebida',
              opciones: compBebidasDesayuno
                .filter((c) => opcionesSeleccionadas.has(c.id))
                .map((c) => c.nombre),
            },
            {
              nombre: 'Plato',
              opciones: compPlatosDesayuno
                .filter((c) => opcionesSeleccionadas.has(c.id))
                .map((c) => c.nombre),
            },
          ]}
        />

        {/* 2. ALMUERZO COMPLETO */}
        <CardMenuCompletoDia
          id={2}
          nombre="Almuerzo completo"
          precio={8.0}
          incluye="Refresco del día"
          habilitado={menusCompletosHabilitados.has(2)}
          onToggle={() => onToggleMenuCompleto(2)}
          partes={[
            {
              nombre: 'Sopa o entrada',
              opciones: [...compSopas, ...compEntradas]
                .filter((c) => opcionesSeleccionadas.has(c.id))
                .map((c) => c.nombre),
            },
            {
              nombre: 'Segundo',
              opciones: compSegundos
                .filter((c) => opcionesSeleccionadas.has(c.id))
                .map((c) => c.nombre),
            },
          ]}
        />

        {/* 3. SOLO SEGUNDO */}
        <CardMenuCompletoDia
          id={3}
          nombre="Solo segundo"
          precio={7.0}
          incluye="Refresco del día"
          habilitado={menusCompletosHabilitados.has(3)}
          onToggle={() => onToggleMenuCompleto(3)}
          partes={[
            {
              nombre: 'Segundo',
              opciones: compSegundos
                .filter((c) => opcionesSeleccionadas.has(c.id))
                .map((c) => c.nombre),
            },
          ]}
        />
      </div>
    </div>
  );
};
