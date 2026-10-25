import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import type { CandidatoMenu } from '../../types/menuDia';

export interface SeccionCartaCategoriaProps {
  categoriaNombre: string;
  items: CandidatoMenu[];
  seleccionados: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onDeselectAll: (ids: string[]) => void;
}

export const SeccionCartaCategoria: React.FC<SeccionCartaCategoriaProps> = ({
  categoriaNombre,
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
    <div className="bg-surface rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
      <div className="px-5 xl:px-6 py-4 bg-neutral-50/70 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-sans font-bold text-neutral-900 text-sm sm:text-base xl:text-lg">
            Categoría: {categoriaNombre}
          </h3>
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
            className="px-3 xl:px-4 py-1.5 xl:py-2 text-xs sm:text-sm xl:text-base font-bold text-neutral-700 hover:text-neutral-900 bg-surface hover:bg-neutral-100 border border-neutral-300 rounded-xl transition-colors cursor-pointer"
          >
            {todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 xl:p-6">
        {items.length === 0 ? (
          <p className="text-xs sm:text-sm text-neutral-500 italic">
            No hay productos registrados en esta categoría de carta.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
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
                      ? 'border-accent bg-orange-50/50 text-accent shadow-xs ring-1 ring-accent'
                      : 'border-neutral-200 bg-surface text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0">
                      {estaSeleccionado ? (
                        <CheckSquare className="w-5 h-5 text-accent" />
                      ) : (
                        <Square className="w-5 h-5 text-neutral-500" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-ink leading-snug break-words">
                      {item.nombre}
                    </span>
                  </div>
                  <span className="text-sm font-bold tabular-nums whitespace-nowrap shrink-0 pl-2 text-neutral-700">
                    S/ {item.precio?.toFixed(2) ?? '0.00'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeccionCartaCategoria;
