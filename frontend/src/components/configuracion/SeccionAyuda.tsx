import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import type { RolUsuario } from '../../types/auth';
import { GUIA_RAPIDA_POR_ROL, type TareaAyuda } from './ayudaContenido';
import { SettingsSection } from './SettingsSection';

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
    <SettingsSection
      id="seccion-ayuda"
      icon={HelpCircle}
      title="Ayuda y procedimientos frecuentes"
      description={`Guía rápida de tareas principales orientadas al rol de ${rol}.`}
      className={className}
    >
      <div className="p-3 rounded-xl bg-surface-raised/60 border border-line">
        <p className="text-xs text-ink-muted leading-relaxed">
          {guia.resumen}
        </p>
      </div>

      {/* Acordeón de tareas con soporte de 2 columnas en pantallas amplias */}
      <div className="@container w-full">
        <div className="grid grid-cols-1 @[48rem]:grid-cols-2 gap-3 items-start">
          {guia.tareas.map((tarea: TareaAyuda) => {
            const estaAbierta = tareaAbiertaId === tarea.id;
            const contentId = `ayuda-content-${tarea.id}`;
            const headerId = `ayuda-header-${tarea.id}`;

            return (
              <div
                key={tarea.id}
                className="rounded-xl border border-line bg-surface overflow-hidden transition-all shadow-2xs self-start"
              >
                <button
                  id={headerId}
                  type="button"
                  aria-expanded={estaAbierta}
                  aria-controls={contentId}
                  onClick={() => toggleTarea(tarea.id)}
                  className="w-full text-left p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-surface-raised transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-ink leading-snug">
                      {tarea.titulo}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-ink-muted mt-0.5 leading-snug">
                      {tarea.descripcionBreve}
                    </p>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-line text-ink-muted transition-transform duration-200 ${
                      estaAbierta ? 'rotate-180 bg-brand-tint text-accent border-accent/30' : ''
                    }`}
                    aria-hidden="true"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {estaAbierta && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={headerId}
                    className="px-3.5 pb-3.5 pt-1 border-t border-line/60 bg-surface-raised/40 animate-in fade-in duration-150"
                  >
                    <ol className="space-y-2 mt-2">
                      {tarea.pasos.map((paso: string, index: number) => (
                        <li key={index} className="flex items-start gap-2.5 text-xs text-ink leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-brand-tint text-accent text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-amber-200/60 shadow-2xs">
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
      </div>
    </SettingsSection>
  );
};

export default SeccionAyuda;
