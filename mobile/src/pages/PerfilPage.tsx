import React from 'react';
import { PerfilView } from '../components/perfil/PerfilView';
import type { UserSession } from '../types/auth';

export interface PerfilPageProps {
  session: UserSession;
  isDark: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => Promise<void>;
}

export const PerfilPage: React.FC<PerfilPageProps> = ({
  session,
  isDark,
  onToggleDarkMode,
  onLogout,
}) => {
  return (
    <PerfilView
      session={session}
      isDark={isDark}
      onToggleDarkMode={onToggleDarkMode}
      onLogout={onLogout}
    />
  );
};

export default PerfilPage;
