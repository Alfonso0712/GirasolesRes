import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme, type Theme } from '../../hooks/useTheme';
import { actualizarTema } from '../../services/perfilService';

export interface ThemeToggleProps {
  inMobileMenu?: boolean;
  onAction?: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ inMobileMenu = false, onAction }) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Activar modo claro' : 'Activar modo oscuro';
  const textLabel = isDark ? 'Modo claro' : 'Modo oscuro';

  const handleClick = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    onAction?.();

    // Guardar en backend sin await bloqueante
    try {
      actualizarTema(next).catch(() => {
        // En caso de fallo de red, 400 o 5xx, no revertir el tema visible
      });
    } catch {
      // Ignorar errores síncronos
    }
  };

  if (inMobileMenu) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        title={label}
        className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-ink-muted hover:text-ink hover:bg-neutral-100 flex items-center gap-2.5 min-h-[44px] cursor-pointer transition-colors"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-ink-muted shrink-0" />
        ) : (
          <Moon className="w-4 h-4 text-ink-muted shrink-0" />
        )}
        <span>{textLabel}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors cursor-pointer"
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 text-ink-muted shrink-0" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-ink-muted shrink-0" />
      )}
      <span>{textLabel}</span>
    </button>
  );
};

export default ThemeToggle;
