import React from 'react';
import logoImg from '../assets/logo-girasoles.png';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="h-screen max-h-screen w-full flex flex-col md:flex-row bg-[#FAF7F4] overflow-hidden">
      {/* Panel Izquierdo Figma (AuthShell) */}
      <div className="hidden md:flex md:w-[48%] lg:w-[45%] bg-[#482813] text-white p-8 lg:p-12 flex-col justify-between relative overflow-hidden shrink-0 select-none h-full">
        {/* Arcos decorativos concéntricos del fondo */}
        <div className="absolute -bottom-28 -right-28 w-[380px] h-[380px] rounded-full border-[36px] border-[#5A351D]/35 pointer-events-none" />
        <div className="absolute -bottom-52 -right-52 w-[520px] h-[520px] rounded-full border-[48px] border-[#5A351D]/20 pointer-events-none" />

        {/* Logo superior */}
        <div className="relative z-10">
          <div className="bg-white p-2 rounded-2xl w-fit shadow-md">
            <img src={logoImg} alt="Girasoles Restaurante" className="h-14 lg:h-16 w-auto object-contain" />
          </div>
        </div>

        {/* Titular central */}
        <div className="relative z-10 my-auto py-6 lg:py-8">
          <p className="text-[#E5A358] text-xs font-bold tracking-widest uppercase mb-3">
            SISTEMA DE RESTAURANTE
          </p>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-white leading-[1.12] font-brand-serif mb-4">
            Gestión simple.<br />
            Servicio<br />
            excepcional.
          </h1>
          <p className="text-[#D9C7BC] text-xs lg:text-sm leading-relaxed max-w-sm">
            Una plataforma segura para que cada integrante del equipo acceda a las herramientas que necesita.
          </p>
        </div>

        {/* Pie de página inferior */}
        <div className="relative z-10 pt-2">
          <p className="text-[#A88B79] text-[11px] font-semibold tracking-wider uppercase">
            SEGURIDAD Y CONTROL PARA TODO TU EQUIPO
          </p>
        </div>
      </div>

      {/* Panel Derecho: Contenedor del Formulario */}
      <div className="flex-1 flex items-center justify-center py-4 px-6 sm:px-10 lg:px-14 overflow-y-auto md:overflow-y-hidden h-full">
        <div className="w-full max-w-[400px] flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
