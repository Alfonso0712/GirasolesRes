import React from 'react';

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

      {/* 1. Panel Izquierdo: Branding y Tipografía (60% en pantallas grandes) */}
      <aside className="hidden lg:flex lg:w-3/5 bg-[#3A2211] text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden shrink-0 select-none h-full">
        {/* Cabecera de Logo superior izquierda */}
        <div className="relative z-10 flex items-center gap-3.5">
          <img
            src="/favicon.png"
            alt="Isotipo Girasoles"
            className="w-12 h-12 rounded-full object-cover shrink-0 shadow-md"
          />
          <img
            src="/LOGO_GIRASOLES.png"
            alt="Girasoles Restaurante"
            className="h-8 w-auto object-contain"
          />
        </div>

        {/* Textos Centrales alineados a la izquierda y centrados verticalmente */}
        <div className="relative z-10 my-auto py-8 max-w-xl text-left">
          <div className="mb-4">
            <span className="text-[#D35400] font-bold tracking-widest text-xs uppercase block mb-2">
              SISTEMA DE RESTAURANTE
            </span>
            <div className="w-12 h-0.5 bg-[#D35400] rounded-full" />
          </div>

          <h1 className="font-brand-serif text-5xl lg:text-6xl text-white leading-tight mb-5 tracking-tight">
            Gestión simple.<br />
            Servicio excepcional.
          </h1>

          <p className="text-white/80 font-sans text-base lg:text-lg max-w-md leading-relaxed">
            Plataforma integral de punto de venta, gestión de salón, pedidos y control operativo en tiempo real.
          </p>
        </div>

        {/* Pie de página inferior sutil */}
        <footer className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
          <span>Restaurante Girasoles &copy; {new Date().getFullYear()}</span>
          <span className="font-medium tracking-wide">Punto de Venta Profesional</span>
        </footer>
      </aside>

      {/* 2. Panel Derecho: Formulario Enfocado (40% en pantallas grandes) */}
      <main className="w-full lg:w-2/5 bg-white flex flex-col justify-center items-center px-6 sm:px-10 lg:px-12 xl:px-16 py-6 h-full overflow-y-auto lg:overflow-hidden">
        <div className="w-full max-w-[390px] flex flex-col justify-center my-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
