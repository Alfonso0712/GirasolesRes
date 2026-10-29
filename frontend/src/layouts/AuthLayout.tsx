import React from 'react';
import { AuthBrandPanel } from '../components/layout/AuthBrandPanel';
import { useHandedness } from '../hooks/useHandedness';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { isLeftHanded, toggleHandedness } = useHandedness();

  return (
    <div
      className={`h-dvh max-h-dvh w-full flex flex-col ${
        isLeftHanded ? 'lg:flex-row-reverse' : 'lg:flex-row'
      } bg-surface overflow-hidden select-none`}
    >
      {/* Encabezado superior para pantallas móviles (< lg) */}
      <header
        className={`lg:hidden bg-[#3A2211] px-4 py-2.5 flex items-center ${
          isLeftHanded ? 'flex-row-reverse' : ''
        } justify-between shadow-sm border-b border-ink-fill shrink-0`}
      >
        <div className="flex items-center gap-2.5">
          <img
            src="/favicon.png"
            alt="Isotipo Girasoles"
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
          <img
            src="/LOGO_GIRASOLES.png"
            alt="Girasoles Restaurante"
            className="h-5 w-auto object-contain"
          />
        </div>
        <button
          type="button"
          onClick={() => toggleHandedness()}
          className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 flex items-center gap-1 transition-colors cursor-pointer"
          title={isLeftHanded ? 'Cambiar a modo diestro' : 'Cambiar a modo zurdo'}
        >
          <span>{isLeftHanded ? '✋ Zurdo' : '👉 Diestro'}</span>
        </button>
      </header>

      {/* 1. Panel de Marca (60% en pantallas grandes) */}
      <AuthBrandPanel />

      {/* 2. Panel de formulario: Contenedor con alineación vertical centrada */}
      <main className="w-full lg:w-[40%] lg:max-w-[40%] lg:basis-[40%] bg-surface flex flex-col items-center justify-center px-6 sm:px-10 lg:px-10 xl:px-14 py-[clamp(0.75rem,2vh,1.5rem)] h-full shrink-0 grow-0 overflow-y-auto lg:overflow-hidden relative">
        {/* Toggle ergonómico flotante para pantallas grandes */}
        <div className={`w-full max-w-md hidden lg:flex ${isLeftHanded ? 'justify-start' : 'justify-end'} mb-1`}>
          <button
            type="button"
            onClick={() => toggleHandedness()}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-ink-muted hover:text-ink transition-colors cursor-pointer border border-line"
            title={isLeftHanded ? 'Cambiar a modo diestro' : 'Cambiar a modo zurdo'}
          >
            <span>{isLeftHanded ? '✋ Modo Zurdo' : '👉 Modo Diestro'}</span>
          </button>
        </div>
        <div className="w-full max-w-md flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
