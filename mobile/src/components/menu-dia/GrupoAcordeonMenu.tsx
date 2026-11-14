import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import type { CandidatoMenuDto } from '../../types/menuDia';
import { Switch } from '../ui/Switch';
import { StatusBadge } from '../ui/StatusBadge';
import { formatCurrency } from '../../utils/format';
import { formatearContadorGrupo } from '../../utils/menuDia';
import { useHaptics } from '../../hooks/useHaptics';

export interface GrupoAcordeonMenuProps {
  clave: string;
  titulo: string;
  items: CandidatoMenuDto[];
  seleccionadosSet: ReadonlySet<string>;
  agotadosPorId: Record<string, boolean>;
  mostrarPrecio?: boolean;
  abiertoInicial?: boolean;
  onToggleItem: (item: CandidatoMenuDto) => void;
  onToggleGrupo: (items: CandidatoMenuDto[]) => void;
}

export const GrupoAcordeonMenu: React.FC<GrupoAcordeonMenuProps> = ({
  clave,
  titulo,
  items,
  seleccionadosSet,
  agotadosPorId,
  mostrarPrecio = false,
  abiertoInicial = true,
  onToggleItem,
  onToggleGrupo,
}) => {
  const [abierto, setAbierto] = useState<boolean>(abiertoInicial);
  const { triggerLight } = useHaptics();

  const seleccionadosCount = items.filter((i) => seleccionadosSet.has(i.id)).length;
  const todosSeleccionados = items.length > 0 && seleccionadosCount === items.length;
  const textoContador = formatearContadorGrupo(seleccionadosCount, items.length);
  const panelId = `panel-grupo-${clave}`;

  return (
    <section className="bg-surface rounded-2xl border border-line overflow-hidden shadow-2xs">
      {/* Cabecera del acordeón con título, contador "x de y" y Switch "Seleccionar todos" */}
      <div className="px-4 py-3 bg-canvas/60 border-b border-line flex items-center justify-between gap-2">
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={panelId}
          onClick={() => {
            triggerLight();
            setAbierto((prev) => !prev);
          }}
          className="flex-1 min-h-11 flex items-center justify-between gap-2 text-left rounded-xl px-1 py-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
        >
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-ink leading-snug break-words">
              {titulo}
            </h3>
            <span
              aria-label={`Seleccionados ${textoContador}`}
              className="text-xs font-semibold text-ink-muted block mt-0.5 tabular-nums"
            >
              {textoContador}
            </span>
          </div>
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted shrink-0">
            {abierto ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </span>
        </button>

        {items.length > 0 && (
          <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-line">
            <span className="text-xs font-semibold text-ink-muted">
              Seleccionar todos
            </span>
            <Switch
              checked={todosSeleccionados}
              onChange={() => {
                triggerLight();
                onToggleGrupo(items);
              }}
              aria-label={`Seleccionar todos en ${titulo}`}
            />
          </div>
        )}
      </div>

      {/* Cuerpo desplegable del acordeón */}
      {abierto && (
        <div id={panelId} className="divide-y divide-line">
          {items.length === 0 ? (
            <p className="px-4 py-4 text-xs text-ink-muted italic">
              No hay productos registrados en este grupo.
            </p>
          ) : (
            items.map((item) => {
              const estaSeleccionado = seleccionadosSet.has(item.id);
              const estaAgotado = Boolean(agotadosPorId[item.id]);

              return (
                <button
                  key={item.id}
                  type="button"
                  role="checkbox"
                  aria-checked={estaSeleccionado}
                  onClick={() => {
                    triggerLight();
                    onToggleItem(item);
                  }}
                  className={`w-full min-h-14 px-4 py-2.5 flex items-center justify-between gap-3 text-left transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent cursor-pointer ${
                    estaSeleccionado
                      ? 'bg-primary/8 text-ink'
                      : 'bg-surface text-ink hover:bg-canvas/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Casilla táctil con objetivo mínimo de 44x44 px */}
                    <span
                      aria-hidden="true"
                      className="min-w-11 min-h-11 -ml-1.5 flex items-center justify-center shrink-0"
                    >
                      <span
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          estaSeleccionado
                            ? 'bg-primary border-primary text-white'
                            : 'bg-surface border-ink-faint'
                        }`}
                      >
                        {estaSeleccionado && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                    </span>

                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-bold text-ink leading-snug break-words block">
                        {item.nombre}
                      </span>
                      {estaAgotado && (
                        <div className="mt-1">
                          <StatusBadge estado="Agotado" />
                        </div>
                      )}
                    </div>
                  </div>

                  {mostrarPrecio && item.precio != null && item.precio > 0 && (
                    <span className="text-sm font-extrabold text-accent tabular-nums whitespace-nowrap shrink-0">
                      {formatCurrency(item.precio)}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </section>
  );
};
