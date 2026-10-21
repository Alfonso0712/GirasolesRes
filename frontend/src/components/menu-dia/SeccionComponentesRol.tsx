import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import type { CandidatoMenu } from '../../types/menuDia';

export interface SeccionComponentesRolProps {
  titulo: string;
  icon: React.ComponentType<{ className?: string }>;
  items: CandidatoMenu[];
  seleccionados: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onDeselectAll: (ids: string[]) => void;
}

export const SeccionComponentesRol: React.FC<SeccionComponentesRolProps> = ({
  titulo,
  icon: Icon,
  items,
  seleccionados,
  onToggle,
  onSelectAll,
  onDeselectAll
}) => {
  const ids = items.map((i) => i.id);
  const seleccionadosCount = items.filter((i) => seleccionados.has(i.id)).length;
  const todosSeleccionados = items.length > 0 && seleccionadosCount === items.length;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
      <div className="px-5 xl:px-6 py-4 bg-neutral-50/70 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-xl bg-orange-100 text-[#B84500] flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 xl:w-6 xl:h-6" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-neutral-900 text-sm sm:text-base xl:text-lg">
              {titulo}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs sm:text-sm xl:text-base font-semibold text-neutral-600 mr-1 sm:mr-2">
            {seleccionadosCount} de {items.length}
          </span>
          <button
            type="button"
            onClick={() =>
              todosSeleccionados ? onDeselectAll(ids) : onSelectAll(ids)
            }
            className="px-3 xl:px-4 py-1.5 xl:py-2 text-xs sm:text-sm xl:text-base font-bold text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl transition-colors cursor-pointer"
          >
            {todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 xl:p-6">
        {items.length === 0 ? (
          <p className="text-xs sm:text-sm text-neutral-500 italic">
            No hay componentes registrados con este rol. Regístrelos en Carta y Menú &gt; Productos.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {items.map((item) => {
              const estaSeleccionado = seleccionados.has(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggle(item.id)}
                  aria-pressed={estaSeleccionado}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer min-h-[56px] ${
                    estaSeleccionado
                      ? 'border-[#D35400] bg-orange-50/50 text-[#B84500] shadow-xs ring-1 ring-[#D35400]'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0">
                      {estaSeleccionado ? (
                        <CheckSquare className="w-5 h-5 text-[#B84500]" />
                      ) : (
                        <Square className="w-5 h-5 text-neutral-500" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-[#2C1A0E] leading-snug break-words">
                      {item.nombre}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeccionComponentesRol;
