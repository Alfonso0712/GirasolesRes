import React from 'react';
import { Sliders, PanelLeft, PanelRight, CheckCircle2 } from 'lucide-react';
import { useHandedness, type Handedness } from '../../hooks/useHandedness';
import { actualizarOrientacion } from '../../services/perfilService';
import { SettingsSection } from './SettingsSection';

export interface SeccionPosicionMenuProps {
  token?: string;
  usuario?: string;
  className?: string;
}

export const SeccionPosicionMenu: React.FC<SeccionPosicionMenuProps> = ({
  token,
  usuario,
  className = '',
}) => {
  const { handedness, setHandedness } = useHandedness();
  const isLeft = handedness === 'left';

  const handleSelectHandedness = (newHandedness: Handedness) => {
    setHandedness(newHandedness, usuario);
    try {
      actualizarOrientacion(newHandedness, token).catch(() => {});
    } catch {
      // Ignorar errores síncronos
    }
  };

  return (
    <SettingsSection
      id="seccion-posicion-menu"
      icon={Sliders}
      title="Posición del menú y navegación"
      description="Acomoda la barra lateral en el lado de la pantalla que te resulte más accesible."
      className={className}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Opción Diestro */}
        <button
          type="button"
          role="radio"
          aria-checked={!isLeft}
          aria-label="Modo Diestro"
          onClick={() => handleSelectHandedness('right')}
          className={`flex flex-col justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left min-h-[5.5rem] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
            !isLeft
              ? 'border-accent bg-brand-tint text-accent shadow-xs ring-1 ring-accent/30'
              : 'border-line hover:border-line-strong hover:bg-surface-raised bg-surface text-ink'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex items-center gap-1.5">
              <PanelLeft className="w-4 h-4 text-ink-muted" />
              <span className="text-xs sm:text-sm font-bold text-ink">Modo Diestro</span>
            </div>
            {!isLeft ? (
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
            ) : (
              <span className="w-4 h-4 rounded-full border border-line shrink-0" aria-hidden="true" />
            )}
          </div>

          <div className="my-1 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-line/60">
            <div className="flex gap-1 h-9 w-full text-[11px] font-bold">
              <div className="w-1/3 rounded bg-stone-300 dark:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center text-center px-1">
                Menú
              </div>
              <div className="flex-1 rounded bg-white dark:bg-neutral-900 border border-line/40 flex items-center justify-center text-ink-muted text-center px-1 font-medium">
                Pantalla
              </div>
            </div>
          </div>

          <p className="text-[11px] text-ink-muted mt-1 leading-snug">
            Menú de navegación a la <strong>izquierda</strong>.
          </p>
        </button>

        {/* Opción Zurdo */}
        <button
          type="button"
          role="radio"
          aria-checked={isLeft}
          aria-label="Modo Zurdo"
          onClick={() => handleSelectHandedness('left')}
          className={`flex flex-col justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left min-h-[5.5rem] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
            isLeft
              ? 'border-accent bg-brand-tint text-accent shadow-xs ring-1 ring-accent/30'
              : 'border-line hover:border-line-strong hover:bg-surface-raised bg-surface text-ink'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex items-center gap-1.5">
              <PanelRight className="w-4 h-4 text-accent" />
              <span className="text-xs sm:text-sm font-bold text-ink">Modo Zurdo</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-accent/15 text-accent">
                Ergonómico
              </span>
            </div>
            {isLeft ? (
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
            ) : (
              <span className="w-4 h-4 rounded-full border border-line shrink-0" aria-hidden="true" />
            )}
          </div>

          <div className="my-1 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-line/60">
            <div className="flex gap-1 h-9 w-full text-[11px] font-bold">
              <div className="flex-1 rounded bg-white dark:bg-neutral-900 border border-line/40 flex items-center justify-center text-ink-muted text-center px-1 font-medium">
                Pantalla
              </div>
              <div className="w-1/3 rounded bg-stone-300 dark:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center text-center px-1">
                Menú
              </div>
            </div>
          </div>

          <p className="text-[11px] text-ink-muted mt-1 leading-snug">
            Menú de navegación a la <strong>derecha</strong> para alcance zurdo.
          </p>
        </button>
      </div>
    </SettingsSection>
  );
};

export default SeccionPosicionMenu;
