import React, { useState, useRef, useEffect } from 'react';
import { KeyRound, LogOut, ChevronDown, Menu } from 'lucide-react';
import type { UserSession } from '../../types/auth';

import { obtenerIniciales } from '../../utils/avatar';

interface HeaderProps {
  session?: UserSession | null;
  onLogout?: () => void;
  onCambiarPassword?: () => void;
  breadcrumbSection?: string | null;
  breadcrumbPage?: string;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  onLogout,
  onCambiarPassword,
  breadcrumbSection = null,
  breadcrumbPage = 'Usuarios',
  onToggleSidebar
}) => {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar menú móvil al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuMovilAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const esAdmin = session?.rol === 'Administrador';

  return (
    <header className="bg-white border-b border-neutral-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex justify-between items-center shadow-xs relative shrink-0">
      {/* Left side: Hamburger (mobile/tablet) + Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Abrir menú lateral"
            className="lg:hidden p-2 -ml-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-neutral-500 font-medium select-none">
          {breadcrumbSection && (
            <>
              <span className="hidden sm:inline">{breadcrumbSection}</span>
              <span className="hidden sm:inline text-neutral-400">/</span>
            </>
          )}
          <span className="text-neutral-800 font-semibold">{breadcrumbPage}</span>
        </div>
      </div>

      {/* User section */}
      <div className="relative" ref={dropdownRef}>
        {/* Desktop View */}
        <div className="hidden md:flex items-center gap-6">
          {session && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FFF3E0] text-[#B84500] font-bold text-sm flex items-center justify-center shrink-0 border border-amber-200/60 shadow-xs">
                {obtenerIniciales(session.nombre)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-neutral-800 leading-tight">
                  {session.nombre}
                </span>
                <span className="text-xs text-neutral-500 leading-tight">
                  {session.rol}
                </span>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-6 w-px bg-neutral-200" />

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {/* RN-16: Solo el Administrador puede cambiar su contraseña desde la barra superior */}
            {esAdmin && onCambiarPassword && (
              <button
                type="button"
                onClick={onCambiarPassword}
                className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
                <span>Cambiar contraseña</span>
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-neutral-500 hover:text-rose-600" />
                <span>Cerrar sesión</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile View: Avatar button with dropdown (Shneiderman 2, touch target >= 44px) */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 min-h-[44px] cursor-pointer"
            aria-expanded={menuMovilAbierto}
            aria-label="Menú de perfil de usuario"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FFF3E0] text-[#B84500] font-bold text-xs flex items-center justify-center border border-amber-200/60">
              {obtenerIniciales(session?.nombre)}
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          </button>

          {/* Mobile Dropdown Menu */}
          {menuMovilAbierto && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-200 p-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                <p className="text-xs font-bold text-neutral-900 truncate">{session?.nombre}</p>
                <p className="text-xs text-neutral-500">{session?.rol}</p>
              </div>

              {esAdmin && onCambiarPassword && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuMovilAbierto(false);
                    onCambiarPassword();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-100 flex items-center gap-2.5 min-h-[44px]"
                >
                  <KeyRound className="w-4 h-4 text-neutral-500" />
                  <span>Cambiar contraseña</span>
                </button>
              )}

              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuMovilAbierto(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Cerrar sesión</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

