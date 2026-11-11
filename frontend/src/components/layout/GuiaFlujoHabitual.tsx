import React from 'react';

export interface GuiaFlujoHabitualProps {
  pasos: string[];
}

const TITULO = 'Flujo de trabajo habitual';

/** Lista ordenada y numerada con los pasos habituales del rol. */
export const GuiaFlujoHabitual: React.FC<GuiaFlujoHabitualProps> = ({ pasos }) => {
  if (pasos.length === 0) return null;

  return (
    <section aria-label={TITULO}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">{TITULO}</h3>
      <ol className="space-y-2">
        {pasos.map((paso, posicion) => (
          <li key={paso} className="flex items-center gap-3 text-sm text-ink">
            <span
              className="w-6 h-6 rounded-full bg-brand-tint text-accent text-xs font-bold flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              {posicion + 1}
            </span>
            <span>{paso}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default GuiaFlujoHabitual;
