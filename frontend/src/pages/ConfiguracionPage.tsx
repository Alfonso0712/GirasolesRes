import React from 'react';
import type { UserSession } from '../types/auth';
import { PageHeader, PageContainer } from '../components/layout';
import {
  SeccionPerfil,
  SeccionApariencia,
  SeccionPosicionMenu,
  SeccionAvisos,
  SeccionAyuda,
} from '../components/configuracion';

export interface ConfiguracionPageProps {
  session: UserSession;
  onLogout?: () => void;
  onCambiarPassword?: () => void;
}

export const ConfiguracionPage: React.FC<ConfiguracionPageProps> = ({
  session,
  onCambiarPassword,
}) => {
  return (
    <div className="flex-1 overflow-y-auto w-full scroll-thin">
      <PageContainer maxWidth="max-w-[92rem]" className="pb-12">
        <PageHeader
          title="Configuración"
          subtitle="Personaliza la accesibilidad, apariencia y ergonomía de tu estación de trabajo."
        />

        <div className="@container w-full select-none space-y-4">
          <div className="grid grid-cols-1 @[69rem]:grid-cols-2 gap-4 items-start">
            {/* Columna izquierda: Mi perfil, luego Avisos y sonido */}
            <div className="flex flex-col gap-4 min-w-0">
              <SeccionPerfil session={session} onCambiarPassword={onCambiarPassword} />
              <SeccionAvisos rol={session.rol} />
            </div>

            {/* Columna derecha: Apariencia, luego Posición del menú */}
            <div className="flex flex-col gap-4 min-w-0">
              <SeccionApariencia token={session.token} />
              <SeccionPosicionMenu token={session.token} usuario={session.usuario} />
            </div>
          </div>

          {/* Ancho completo debajo: Ayuda y procedimientos frecuentes */}
          <div className="w-full">
            <SeccionAyuda rol={session.rol} />
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default ConfiguracionPage;
