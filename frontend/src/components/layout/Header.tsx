import React, { useState, useRef, useEffect } from 'react';
import { KeyRound, LogOut, ChevronDown, Menu, Settings } from 'lucide-react';
import type { UserSession } from '../../types/auth';

import { obtenerIniciales } from '../../utils/avatar';
import { ThemeToggle } from './ThemeToggle';
import { useHandedness } from '../../hooks/useHandedness';

interface HeaderProps {
  session?: UserSession | null;
  onLogout?: () => void;
  onCambiarPassword?: () => void;
  onAbrirConfiguracion?: () => void;
  breadcrumbSection?: string | null;
  breadcrumbPage?: string;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  onLogout,
  onCambiarPassword,
  onAbrirConfiguracion,
  breadcrumbSection = null,
  breadcrumbPage = 'Usuarios',
  onToggleSidebar
}) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isLeftHanded } = useHandedness();

  // Cerrar menú al hacer clic afuera
  useEffect(() => {
    if (!menuAbierto) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuAbierto]);

  // Manejo de accesibilidad por teclado (Escape y navegación con flechas)
  useEffect(() => {
    if (!menuAbierto) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuAbierto(false);
        userButtonRef.current?.focus();
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const items = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
        if (!items || items.length === 0) return;

        const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLButtonElement);
        let nextIndex: number;

        if (event.key === 'ArrowDown') {
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        }

        items[nextIndex]?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuAbierto]);

  const esAdmin = session?.rol === 'Administrador';

  return (
    <header
      className={`bg-surface border-b border-neutral-200 dark:border-neutral-700/60 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex ${
        isLeftHanded ? 'flex-row-reverse' : ''
      } justify-between items-center shadow-xs relative shrink-0`}
    >
      {/* Sección Breadcrumbs y Hamburguesa */}
      <div className={`flex items-center gap-2 sm:gap-3 ${isLeftHanded ? 'flex-row-reverse' : ''}`}>
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Abrir menú lateral"
            className="lg:hidden p-2 -ml-1 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium select-none">
          {breadcrumbSection && (
            <>
              <span className="hidden sm:inline">{breadcrumbSection}</span>
              <span className="hidden sm:inline text-neutral-400">/</span>
            </>
          )}
          <span className="text-neutral-800 dark:text-ink font-semibold">{breadcrumbPage}</span>
        </div>
      </div>

      {/* Sección Controles de Usuario y Tema */}
      <div className={`flex items-center gap-2 sm:gap-4 ${isLeftHanded ? 'flex-row-reverse' : ''}`}>
        <ThemeToggle />

        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-200/80" />

        {/* Menú de usuario desplegable */}
        <div className="relative" ref={dropdownRef}>
          <button
            ref={userButtonRef}
            type="button"
            onClick={() => setMenuAbierto((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={menuAbierto}
            aria-label={`Menú de usuario: ${session?.nombre ?? 'Perfil'}`}
            className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 min-h-[44px] ${
              menuAbierto
                ? 'bg-neutral-100 dark:bg-surface-raised border-neutral-200 dark:border-neutral-200/80 shadow-2xs'
                : 'border-transparent hover:border-neutral-200 dark:hover:border-neutral-200/80 hover:bg-neutral-100/70 dark:hover:bg-surface-raised/70'
            }`}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-brand-tint text-accent font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-amber-200/60 shadow-xs">
              {obtenerIniciales(session?.nombre)}
            </div>
            <div className="flex flex-col text-left max-w-[120px] sm:max-w-none">
              <span className="text-xs sm:text-sm font-bold text-ink leading-tight truncate">
                {session?.nombre}
              </span>
              <span className="text-[11px] sm:text-xs text-ink-muted leading-tight">
                {session?.rol}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-ink-muted transition-transform duration-200 shrink-0 ${
                menuAbierto ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {/* Menú desplegable */}
          {menuAbierto && (
            <div
              ref={menuRef}
              role="menu"
              aria-orientation="vertical"
              aria-label="Opciones de usuario"
              className={`absolute ${
                isLeftHanded ? 'left-0' : 'right-0'
              } top-full mt-2 w-52 bg-surface rounded-2xl shadow-xl dark:shadow-black/40 border border-neutral-200 dark:border-neutral-200/80 p-1.5 z-50 animate-in fade-in slide-in-from-top-1`}
            >
              {/* Opción: Configuración y Ergonomía (Modo Zurdo/Diestro y Tema) */}
              {onAbrirConfiguracion && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuAbierto(false);
                    onAbrirConfiguracion();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-ink hover:text-ink hover:bg-neutral-100 dark:hover:bg-surface-raised flex items-center gap-2.5 min-h-[44px] cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60 focus:bg-neutral-100 dark:focus:bg-surface-raised"
                >
                  <Settings className="w-4 h-4 text-ink-muted shrink-0" />
                  <span>Configuración</span>
                </button>
              )}

              {/* RN-16: Solo Administrador puede cambiar contraseña */}
              {esAdmin && onCambiarPassword && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuAbierto(false);
                    onCambiarPassword();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-ink hover:text-ink hover:bg-neutral-100 dark:hover:bg-surface-raised flex items-center gap-2.5 min-h-[44px] cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60 focus:bg-neutral-100 dark:focus:bg-surface-raised"
                >
                  <KeyRound className="w-4 h-4 text-ink-muted shrink-0" />
                  <span>Cambiar contraseña</span>
                </button>
              )}

              {onLogout && (
                <>
                  <div className="my-1 border-t border-neutral-200 dark:border-neutral-200/80" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuAbierto(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-danger hover:text-danger hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 min-h-[44px] cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-danger/60 focus:bg-rose-50 dark:focus:bg-rose-950/40"
                  >
                    <LogOut className="w-4 h-4 text-danger shrink-0" />
                    <span>Cerrar sesión</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
