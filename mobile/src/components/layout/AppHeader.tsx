import React from 'react';
import { Sun, Moon, WifiOff } from 'lucide-react';
import type { UserSession } from '../../types/auth';
import { IconButton } from '../ui/IconButton';
import { MODO_DEMO } from '../../config/appConfig';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import logoEmblema from '../../assets/logo-emblema-256.png';

export interface AppHeaderProps {
  session: UserSession;
  isDark: boolean;
  onToggleDarkMode: () => void;
  sinConexion?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  session,
  isDark,
  onToggleDarkMode,
  sinConexion: propSinConexion,
}) => {
  const { sinConexion: hookSinConexion } = useNetworkStatus();
  const sinConexion = propSinConexion !== undefined ? propSinConexion : hookSinConexion;

  return (
    <div className="relative z-20 shrink-0">
      <header className="min-h-14 bg-brand-dark text-white px-4 py-2 flex items-center justify-between shadow-md safe-top">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={logoEmblema}
            alt="Emblema Restaurante Girasoles"
            width={32}
            height={32}
            decoding="async"
            className="w-8 h-8 rounded-lg object-contain shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-sm font-semibold leading-tight break-words">
              {[session.nombre, session.apellido].filter(Boolean).join(' ').trim() || session.nombre}
            </h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-accent font-semibold">
                {session.rol}
              </span>
              {MODO_DEMO && (
                <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/40 shrink-0">
                  DEMO
                </span>
              )}
            </div>
          </div>
        </div>

        <IconButton
          variant="ghost"
          onClick={onToggleDarkMode}
          aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
          className="w-11 h-11 min-w-[44px] min-h-[44px] text-white hover:bg-white/10 active:bg-white/20 shrink-0"
        >
          {isDark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-white" />}
        </IconButton>
      </header>

      {/* Banner de Estado Sin Conexión */}
      {sinConexion && (
        <div
          role="status"
          aria-live="assertive"
          className="bg-warning-bg text-badge-warning-text border-b border-warning-border px-4 py-1.5 flex items-center justify-center gap-2 text-xs font-bold text-center select-none animate-in fade-in"
        >
          <WifiOff className="w-4 h-4 shrink-0 text-warning" aria-hidden="true" />
          <span>Sin conexión. Algunas acciones no están disponibles.</span>
        </div>
      )}
    </div>
  );
};
