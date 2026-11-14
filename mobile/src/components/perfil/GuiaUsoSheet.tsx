import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import type { RolUsuario } from '../../types/auth';
import { GUIA_USO_POR_ROL } from '../../data/guiaUsoData';
import { BottomSheet } from '../ui/BottomSheet';
import { useHaptics } from '../../hooks/useHaptics';

export interface GuiaUsoSheetProps {
  isOpen: boolean;
  onClose: () => void;
  rol: RolUsuario;
}

export const GuiaUsoSheet: React.FC<GuiaUsoSheetProps> = ({
  isOpen,
  onClose,
  rol,
}) => {
  const guia = GUIA_USO_POR_ROL[rol] || GUIA_USO_POR_ROL.Mozo;
  const [tareaExpandida, setTareaExpandida] = useState<string | null>(
    guia.tareas[0]?.id || null
  );

  const { triggerLight } = useHaptics();

  if (!isOpen) return null;

  const handleToggleTarea = (id: string) => {
    triggerLight();
    setTareaExpandida((prev) => (prev === id ? null : id));
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Guía Rápida de Uso">
      <div className="space-y-4">
        {/* Resumen del Rol */}
        <div className="bg-canvas border border-line rounded-2xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-ink">
            <Sparkles className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Perfil: {guia.rol}
            </h3>
          </div>
          <p className="text-xs text-ink leading-relaxed">{guia.resumen}</p>
        </div>

        {/* Tareas Principales */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
            Flujos y Procedimientos ({guia.tareas.length})
          </span>

          {guia.tareas.map((tarea, idx) => {
            const abierta = tareaExpandida === tarea.id;
            return (
              <div
                key={tarea.id}
                className="bg-canvas border border-line rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => handleToggleTarea(tarea.id)}
                  className="w-full p-3 flex items-center justify-between text-left cursor-pointer min-h-[48px]"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="w-6 h-6 rounded-lg bg-surface border border-line text-accent font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ink leading-snug break-words">{tarea.titulo}</p>
                      <p className="text-xs text-ink-muted line-clamp-2">{tarea.descripcionBreve}</p>
                    </div>
                  </div>

                  <div className="p-1 text-ink-muted shrink-0">
                    {abierta ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {abierta && (
                  <div className="px-3 pb-3 pt-1 border-t border-line space-y-2 text-xs bg-surface/50">
                    <p className="text-xs text-ink-muted font-bold uppercase">
                      Pasos de ejecución:
                    </p>
                    <ol className="space-y-2">
                      {tarea.pasos.map((paso, pasoIdx) => (
                        <li key={pasoIdx} className="flex items-start gap-2 text-xs leading-relaxed text-ink">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                          <span>{paso}</span>
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
    </BottomSheet>
  );
};