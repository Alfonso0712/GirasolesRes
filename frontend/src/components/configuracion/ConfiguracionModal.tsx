import React from 'react';
import { Settings } from 'lucide-react';
import { ModalWrapper, Button } from '../ui';
import type { UserSession } from '../../types/auth';
import { SeccionPerfil } from './SeccionPerfil';
import { SeccionApariencia } from './SeccionApariencia';
import { SeccionPosicionMenu } from './SeccionPosicionMenu';
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
  const effectiveToken = session?.token || token;
  const rol = session?.rol || 'Administrador';

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
      <div className="space-y-4 select-none max-h-[calc(85vh-160px)] pr-1">
        {session && (
          <SeccionPerfil session={session} onCambiarPassword={handleAbrirPassword} />
        )}

        <SeccionApariencia token={effectiveToken} />

        <SeccionPosicionMenu token={effectiveToken} usuario={session?.usuario} />

        <SeccionAvisos rol={rol} />

        <SeccionAyuda rol={rol} />
      </div>
    </ModalWrapper>
  );
};

export default ConfiguracionModal;
