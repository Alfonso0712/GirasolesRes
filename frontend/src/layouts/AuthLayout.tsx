import React from 'react';
import { AuthBrandPanel } from '../components/layout/AuthBrandPanel';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="h-screen max-h-screen w-full flex flex-col lg:flex-row bg-white overflow-hidden select-none">
      {/* Encabezado superior para pantallas móviles (< lg) */}
      <header className="lg:hidden bg-[#3A2211] px-5 py-3.5 flex items-center justify-center gap-3 shadow-sm border-b border-[#2C1A0E] shrink-0">
        <img
          src="/favicon.png"
          alt="Isotipo Girasoles"
          className="w-9 h-9 rounded-full object-cover shrink-0"
        />
        <img
          src="/LOGO_GIRASOLES.png"
          alt="Girasoles Restaurante"
          className="h-6 w-auto object-contain"
        />
      </header>

      {/* 1. Panel Izquierdo Unificado: AuthBrandPanel (60% en pantallas grandes) */}
      <AuthBrandPanel />

      {/* 2. Panel Derecho: Contenedor con alineación vertical fija desde arriba y ancho uniforme */}
      <main className="w-full lg:w-[40%] lg:max-w-[40%] lg:basis-[40%] bg-white flex flex-col items-center px-6 sm:px-10 lg:px-12 xl:px-16 pt-8 sm:pt-12 pb-6 h-full shrink-0 grow-0 overflow-y-auto">
        <div className="w-full max-w-md flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
