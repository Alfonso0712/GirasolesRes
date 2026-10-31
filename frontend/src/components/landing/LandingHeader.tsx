import React from 'react';
import { LogIn, Menu as MenuIcon } from 'lucide-react';
import logoGirasoles from '../../assets/LOGO_GIRASOLES.png';

export interface LandingHeaderProps {
  onGoToLogin: () => void;
  mobileMenuAbierto: boolean;
  setMobileMenuAbierto: (abierto: boolean) => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onGoToLogin,
  mobileMenuAbierto,
  setMobileMenuAbierto,
}) => {
  return (
    <header className="bg-[#3A2211] text-white shadow-lg border-b border-white/10 sticky top-0 z-40 backdrop-blur-md bg-[#3A2211]/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:p-4">
        {/* Logo Oficial del Sistema */}
        <a href="#inicio" className="flex items-center gap-3.5 group focus:outline-none">
          <img
            src="/favicon.png"
            alt="Isotipo Girasoles"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover shrink-0 shadow-md ring-2 ring-amber-400/30 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <img
              src={logoGirasoles}
              alt="Restaurante Girasoles"
              className="h-8 sm:h-9 md:h-10 w-auto object-contain drop-shadow-md"
            />
            <span className="text-[10px] sm:text-[11px] text-amber-200/80 tracking-wide font-medium -mt-1 hidden sm:block">
              Sabor Tradicional & Calidad
            </span>
          </div>
        </a>

        {/* Menú de navegación desktop */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-white/80">
          <a href="#inicio" className="hover:text-amber-400 transition-colors">
            Inicio
          </a>
          <a href="#menus-del-dia" className="hover:text-amber-400 transition-colors">
            Menús del Día
          </a>
          <a href="#carta" className="hover:text-amber-400 transition-colors">
            Carta Completa
          </a>
          <a href="#nosotros" className="hover:text-amber-400 transition-colors">
            Nosotros
          </a>
          <a href="#servicios" className="hover:text-amber-400 transition-colors">
            Servicios & Pagos
          </a>
          <a href="#contacto" className="hover:text-amber-400 transition-colors">
            Horarios y Local
          </a>
        </nav>

        {/* Botón de Acción Principal (Login) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onGoToLogin}
            className="min-h-[42px] sm:min-h-[44px] px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#D35400] to-amber-600 hover:from-[#B84700] hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 shrink-0"
          >
            <LogIn className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Iniciar Sesión</span>
            <span className="sm:hidden">Iniciar Sesión</span>
          </button>

          {/* Botón menú móvil */}
          <button
            onClick={() => setMobileMenuAbierto(!mobileMenuAbierto)}
            className="lg:hidden p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Abrir menú de navegación"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {mobileMenuAbierto && (
        <div className="lg:hidden bg-[#2E1A0C] border-t border-white/10 px-4 pt-3 pb-5 space-y-2">
          <a
            href="#inicio"
            onClick={() => setMobileMenuAbierto(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-amber-400 hover:bg-white/10"
          >
            Inicio
          </a>
          <a
            href="#menus-del-dia"
            onClick={() => setMobileMenuAbierto(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-amber-400 hover:bg-white/10"
          >
            Menús del Día
          </a>
          <a
            href="#carta"
            onClick={() => setMobileMenuAbierto(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-amber-400 hover:bg-white/10"
          >
            Carta Completa
          </a>
          <a
            href="#nosotros"
            onClick={() => setMobileMenuAbierto(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-amber-400 hover:bg-white/10"
          >
            Nosotros
          </a>
          <a
            href="#servicios"
            onClick={() => setMobileMenuAbierto(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-amber-400 hover:bg-white/10"
          >
            Servicios & Pagos
          </a>
          <a
            href="#contacto"
            onClick={() => setMobileMenuAbierto(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-amber-400 hover:bg-white/10"
          >
            Horarios y Ubicación
          </a>
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setMobileMenuAbierto(false);
                onGoToLogin();
              }}
              className="w-full py-3 rounded-xl bg-[#D35400] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Iniciar Sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
