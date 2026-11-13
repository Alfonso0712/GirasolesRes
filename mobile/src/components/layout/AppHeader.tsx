import React from 'react';
import { Sun, Moon } from 'lucide-react';
import type { UserSession } from '../../types/auth';
import { IconButton } from '../ui/IconButton';
import { MODO_DEMO } from '../../config/appConfig';
import logoEmblema from '../../assets/logo-emblema-256.png';

export interface AppHeaderProps {
  session: UserSession;
  isDark: boolean;
  onToggleDarkMode: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  session,
  isDark,
  onToggleDarkMode,
}) => {
  return (
    <header className="h-14 bg-brand-dark text-white px-4 flex items-center justify-between shrink-0 shadow-md safe-top">
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
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-extrabold leading-tight tracking-wide truncate">
              Girasoles Res
            </h1>
            {MODO_DEMO && (
              <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/40">
                Demo
              </span>
            )}
          </div>
          <p className="text-xs text-accent uppercase font-semibold truncate max-w-[200px] sm:max-w-xs">
            {session.rol} · {session.nombre}
          </p>
        </div>
      </div>

      <IconButton
        variant="ghost"
        onClick={onToggleDarkMode}
        aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
        className="w-11 h-11 text-white hover:bg-white/10"
      >
        {isDark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-white" />}
      </IconButton>
    </header>
  );
};
