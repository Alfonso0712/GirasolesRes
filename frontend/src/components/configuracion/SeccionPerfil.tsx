import React from 'react';
import { User, KeyRound, ShieldCheck } from 'lucide-react';
import type { UserSession } from '../../types/auth';
import { obtenerIniciales } from '../../utils/avatar';

export interface SeccionPerfilProps {
  session: UserSession;
  onCambiarPassword?: () => void;
  className?: string;
}

export const SeccionPerfil: React.FC<SeccionPerfilProps> = ({
  session,
  onCambiarPassword,
  className = '',
}) => {
  const esAdmin = session.rol === 'Administrador';
  const correo = (session as { correo?: string }).correo;

  return (
    <section className={`space-y-4 ${className}`} aria-labelledby="seccion-perfil-titulo">
      <div className="flex items-center gap-2 pb-2 border-b border-line">
        <div
          className="w-8 h-8 rounded-lg bg-brand-tint text-accent flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <User className="w-4 h-4" />
        </div>
        <div>
          <h3 id="seccion-perfil-titulo" className="text-sm font-bold text-ink">
            Mi perfil
          </h3>
          <p className="text-xs text-ink-muted">
            Datos de su cuenta y credenciales activas en la sesión actual.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-line bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-brand-tint text-accent font-bold text-base flex items-center justify-center shrink-0 border border-amber-200/60 shadow-xs">
            {obtenerIniciales(session.nombre)}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-ink truncate">{session.nombre}</h4>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <span className="text-xs text-ink-muted">@{session.usuario}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-accent/10 text-accent">
                <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                {session.rol}
              </span>
              {correo && (
                <span className="text-xs text-ink-muted truncate">
                  {correo}
                </span>
              )}
            </div>
          </div>
        </div>

        {esAdmin && onCambiarPassword && (
          <button
            type="button"
            onClick={onCambiarPassword}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-accent border border-accent/30 hover:bg-brand-tint/60 transition-colors cursor-pointer shrink-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
          >
            <KeyRound className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Cambiar contraseña</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default SeccionPerfil;
