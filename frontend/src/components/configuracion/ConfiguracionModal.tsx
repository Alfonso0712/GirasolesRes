import React from 'react';
import { Settings, CheckCircle2, Sliders } from 'lucide-react';
import { ModalWrapper, Button } from '../ui';
import { useHandedness, type Handedness } from '../../hooks/useHandedness';
import { actualizarOrientacion } from '../../services/perfilService';

interface ConfiguracionModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
}

export const ConfiguracionModal: React.FC<ConfiguracionModalProps> = ({
  isOpen,
  onClose,
  token,
}) => {
  const { handedness, setHandedness } = useHandedness();

  const handleSelectHandedness = (newHandedness: Handedness) => {
    setHandedness(newHandedness);
    try {
      actualizarOrientacion(newHandedness, token).catch(() => {
        // En caso de fallo de red o error de servidor, no revertir el estado visible
      });
    } catch {
      // Ignorar errores síncronos
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración"
      subtitle="Personalice la orientación ergonómica de su estación de trabajo."
      icon={Settings}
      maxWidth="md"
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
      <div className="space-y-4 select-none">
        <div className="flex items-center gap-2 mb-1">
          <Sliders className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-ink">
            Modo para Zurdos
          </h3>
        </div>
        <p className="text-xs text-ink-muted mb-3">
          Adapta la interfaz invirtiendo la barra lateral, comanda y paneles de acción para un alcance natural con la mano izquierda en pantallas táctiles y escritorios.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tarjeta Diestro */}
          <button
            type="button"
            onClick={() => handleSelectHandedness('right')}
            className={`flex flex-col text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
              handedness === 'right'
                ? 'border-accent bg-accent/5 dark:bg-accent/10 shadow-xs ring-1 ring-accent/20'
                : 'border-line hover:border-line-strong hover:bg-neutral-50 dark:hover:bg-neutral-800/40 bg-surface'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                Modo Diestro
              </span>
              {handedness === 'right' && (
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              Navegación a la izquierda y comanda/acciones primarias a la derecha. Predeterminado.
            </p>
          </button>

          {/* Tarjeta Zurdo */}
          <button
            type="button"
            onClick={() => handleSelectHandedness('left')}
            className={`flex flex-col text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
              handedness === 'left'
                ? 'border-accent bg-accent/5 dark:bg-accent/10 shadow-xs ring-1 ring-accent/20'
                : 'border-line hover:border-line-strong hover:bg-neutral-50 dark:hover:bg-neutral-800/40 bg-surface'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                Modo Zurdo
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-accent/15 text-accent">
                  Ergonómico
                </span>
              </span>
              {handedness === 'left' && (
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              Barra lateral a la derecha, comanda de pedidos y botones de cobro a la izquierda.
            </p>
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ConfiguracionModal;
