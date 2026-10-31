import React from 'react';

export interface LoginDemoProfilesProps {
  onSelectDemo: (user: string, pass: string) => void;
}

export const LoginDemoProfiles: React.FC<LoginDemoProfilesProps> = ({ onSelectDemo }) => {
  return (
    <div className="mt-[clamp(0.5rem,1.5vh,1rem)] border border-dashed border-demo-border rounded-2xl p-[clamp(0.5rem,1.2vh,0.75rem)] bg-neutral-50/70 text-left">
      <p className="font-bold text-xs text-ink">Acceso de demostración</p>
      <p className="text-xs text-ink-muted mt-0.5 mb-1.5">Seleccione un perfil para probar el acceso rápido</p>

      <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-demo-divider">
        <button
          type="button"
          onClick={() => onSelectDemo('admin', 'Password123!')}
          className="px-2.5 py-1 bg-chip-accent-bg hover:bg-chip-accent-hover text-accent border border-chip-accent-border rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          Administrador
        </button>
        <button
          type="button"
          onClick={() => onSelectDemo('atorres', 'Password123!')}
          className="px-2.5 py-1 bg-surface hover:bg-neutral-100 text-ink border border-line rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          Cajero
        </button>
        <button
          type="button"
          onClick={() => onSelectDemo('lperez', 'Password123!')}
          className="px-2.5 py-1 bg-surface hover:bg-neutral-100 text-ink border border-line rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          Mozo
        </button>
        <button
          type="button"
          onClick={() => onSelectDemo('msoto', 'Password123!')}
          className="px-2.5 py-1 bg-surface hover:bg-neutral-100 text-ink border border-line rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          Cocinero
        </button>
        <button
          type="button"
          onClick={() => onSelectDemo('crojas', 'Password123!')}
          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          title="Cuenta de demostración inactiva"
        >
          Inactivo
        </button>
      </div>
    </div>
  );
};
