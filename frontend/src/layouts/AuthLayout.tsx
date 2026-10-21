import React from 'react';
import { AuthBrandPanel } from '../components/layout/AuthBrandPanel';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="h-dvh max-h-dvh w-full flex flex-col lg:flex-row bg-white overflow-hidden select-none">
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

      {/* 2. Panel Derecho: Contenedor con alineación vertical centrada y clamp sin scroll parásito */}
      <main className="w-full lg:w-[40%] lg:max-w-[40%] lg:basis-[40%] bg-white flex flex-col items-center justify-center px-6 sm:px-10 lg:px-10 xl:px-14 py-[clamp(0.75rem,2vh,1.5rem)] h-full shrink-0 grow-0 overflow-y-auto lg:overflow-hidden">
        <div className="w-full max-w-md flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
