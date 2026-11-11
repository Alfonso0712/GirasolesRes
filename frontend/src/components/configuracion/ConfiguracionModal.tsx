import React from 'react';
import { Settings, Sliders, CheckCircle2 } from 'lucide-react';
import { ModalWrapper, Button } from '../ui';
import type { UserSession } from '../../types/auth';
import { useHandedness, type Handedness } from '../../hooks/useHandedness';
import { actualizarOrientacion } from '../../services/perfilService';
import { SeccionPerfil } from './SeccionPerfil';
import { SeccionApariencia } from './SeccionApariencia';
import { SeccionAvisos } from './SeccionAvisos';
import { SeccionAyuda } from './SeccionAyuda';

export interface ConfiguracionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: UserSession | null;
  token?: string;
  onCambiarPassword?: () => void;
}

export const ConfiguracionModal: React.FC<ConfiguracionModalProps> = ({
  isOpen,
  onClose,
  session,
  token,
  onCambiarPassword,
}) => {
  const { handedness, setHandedness } = useHandedness();
  const effectiveToken = session?.token || token;
  const rol = session?.rol || 'Administrador';

  const handleSelectHandedness = (newHandedness: Handedness) => {
    setHandedness(newHandedness, session?.usuario);
    try {
      actualizarOrientacion(newHandedness, effectiveToken).catch(() => {});
    } catch {
      // Ignorar errores síncronos
    }
  };

  const handleAbrirPassword = () => {
    onClose();
    onCambiarPassword?.();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración"
      subtitle="Personalice la accesibilidad, apariencia y ergonomía de su estación de trabajo."
      icon={Settings}
      maxWidth="lg"
      footer={
        <div className="flex justify-end w-full">
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold cursor-pointer"
          >
            Listo
          </Button>
        </div>
      }
    >
      <div className="space-y-6 select-none max-h-[calc(85vh-160px)] pr-1">
        {session && (
          <>
            <SeccionPerfil session={session} onCambiarPassword={handleAbrirPassword} />
            <div className="border-t border-line" />
          </>
        )}

        <SeccionApariencia token={effectiveToken} />
        <div className="border-t border-line" />

        <section className="space-y-3" aria-labelledby="seccion-uso-modal-titulo">
          <div className="flex items-center gap-2 pb-2 border-b border-line">
            <div className="w-8 h-8 rounded-lg bg-brand-tint text-accent flex items-center justify-center shrink-0" aria-hidden="true">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 id="seccion-uso-modal-titulo" className="text-sm font-bold text-ink">Uso y ergonomía</h3>
              <p className="text-xs text-ink-muted">Adapte la orientación de la barra de navegación para su mano dominante.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleSelectHandedness('right')}
              className={`flex flex-col text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                handedness === 'right'
                  ? 'border-accent bg-accent/5 dark:bg-accent/10 shadow-xs ring-1 ring-accent/20'
                  : 'border-line hover:border-line-strong hover:bg-neutral-50 dark:hover:bg-neutral-800/40 bg-surface'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-ink">Modo Diestro</span>
                {handedness === 'right' && <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />}
              </div>
              <p className="text-[11px] text-ink-muted leading-relaxed">Navegación a la izquierda y comanda a la derecha. Predeterminado.</p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectHandedness('left')}
              className={`flex flex-col text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                handedness === 'left'
                  ? 'border-accent bg-accent/5 dark:bg-accent/10 shadow-xs ring-1 ring-accent/20'
                  : 'border-line hover:border-line-strong hover:bg-neutral-50 dark:hover:bg-neutral-800/40 bg-surface'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  Modo Zurdo
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-accent/15 text-accent">Ergonómico</span>
                </span>
                {handedness === 'left' && <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />}
              </div>
              <p className="text-[11px] text-ink-muted leading-relaxed">Barra lateral a la derecha, comanda y botones de cobro a la izquierda.</p>
            </button>
          </div>
        </section>

        <div className="border-t border-line" />
        <SeccionAvisos rol={rol} />
        <div className="border-t border-line" />
        <SeccionAyuda rol={rol} />
      </div>
    </ModalWrapper>
  );
};

export default ConfiguracionModal;
