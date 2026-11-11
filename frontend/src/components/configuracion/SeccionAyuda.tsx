import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import type { RolUsuario } from '../../types/auth';
import { GUIA_RAPIDA_POR_ROL, type TareaAyuda } from './ayudaContenido';

export interface SeccionAyudaProps {
  rol: RolUsuario;
  className?: string;
}

export const SeccionAyuda: React.FC<SeccionAyudaProps> = ({
  rol,
  className = '',
}) => {
  const guia = GUIA_RAPIDA_POR_ROL[rol];
  const [tareaAbiertaId, setTareaAbiertaId] = useState<string | null>(
    guia?.tareas[0]?.id ?? null
  );

  const toggleTarea = (id: string) => {
    setTareaAbiertaId((prev) => (prev === id ? null : id));
  };

  return (
    <section className={`space-y-4 ${className}`} aria-labelledby="seccion-ayuda-titulo">
      <div className="flex items-center gap-2 pb-2 border-b border-line">
        <div
          className="w-8 h-8 rounded-lg bg-brand-tint text-accent flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <HelpCircle className="w-4 h-4" />
        </div>
        <div>
          <h3 id="seccion-ayuda-titulo" className="text-sm font-bold text-ink">
            Ayuda y procedimientos frecuentes
          </h3>
          <p className="text-xs text-ink-muted">
            Guía rápida de tareas principales orientadas al rol de {rol}.
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-surface-raised border border-line">
        <p className="text-xs text-ink-muted leading-relaxed">
          {guia.resumen}
        </p>
      </div>

      {/* Acordeón de tareas */}
      <div className="space-y-2.5">
        {guia.tareas.map((tarea: TareaAyuda) => {
          const estaAbierta = tareaAbiertaId === tarea.id;
          const contentId = `ayuda-content-${tarea.id}`;
          const headerId = `ayuda-header-${tarea.id}`;

          return (
            <div
              key={tarea.id}
              className="rounded-2xl border border-line bg-surface overflow-hidden transition-all shadow-2xs"
            >
              <button
                id={headerId}
                type="button"
                aria-expanded={estaAbierta}
                aria-controls={contentId}
                onClick={() => toggleTarea(tarea.id)}
                className="w-full text-left p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-surface-raised transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-ink">
                    {tarea.titulo}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-ink-muted mt-0.5 leading-snug">
                    {tarea.descripcionBreve}
                  </p>
                </div>

                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-line text-ink-muted transition-transform duration-200 ${
                    estaAbierta ? 'rotate-180 bg-brand-tint text-accent border-accent/30' : ''
                  }`}
                  aria-hidden="true"
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {estaAbierta && (
                <div
                  id={contentId}
                  role="region"
                  aria-labelledby={headerId}
                  className="px-4 pb-4 pt-1 border-t border-line/60 bg-surface-raised/40 animate-in fade-in duration-150"
                >
                  <ol className="space-y-2.5 mt-2">
                    {tarea.pasos.map((paso: string, index: number) => (
                      <li key={index} className="flex items-start gap-2.5 text-xs text-ink leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-brand-tint text-accent text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-amber-200/60">
                          {index + 1}
                        </span>
                        <span className="flex-1 min-w-0 pt-0.5">{paso}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SeccionAyuda;
