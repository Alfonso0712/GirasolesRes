import React from 'react';
import { useHaptics } from '../../hooks/useHaptics';

export interface NavTabItem {
  id: string;
  label?: string;
  etiqueta?: string;
  icon?: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  icono?: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

export interface BottomNavProps {
  tabs: NavTabItem[];
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  badges?: Record<string, number>;
  className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  tabs,
  currentTab,
  onSelectTab,
  badges = {},
  className = '',
}) => {
  const { triggerLight } = useHaptics();

  return (
    <nav
      aria-label="Navegación principal"
      className={`relative z-20 min-h-16 md:min-h-full md:w-20 bg-surface border-t md:border-t-0 md:border-r border-line px-2 md:px-1 py-1 md:py-4 flex flex-row md:flex-col items-center justify-around md:justify-start md:gap-3 shrink-0 shadow-lg select-none safe-bottom md:safe-left ${className}`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icono || tab.icon;
        const texto = tab.etiqueta || tab.label;
        const activo = currentTab === tab.id;
        const badgeCount = badges[tab.id] || 0;

        if (!Icon) return null;

        return (
          <button
            key={tab.id}
            type="button"
            aria-current={activo ? 'page' : undefined}
            onClick={() => {
              triggerLight();
              onSelectTab(tab.id);
            }}
            className={`relative flex flex-col items-center justify-center min-w-[52px] md:w-full h-14 md:h-16 px-1.5 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-xl ${
              activo ? 'text-accent font-bold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {/* Indicador visual activo (superior en móvil, lateral izquierdo en tablet) */}
            {activo && (
              <span
                aria-hidden="true"
                className="absolute top-0 md:top-2 md:bottom-2 md:left-0 w-8 md:w-1 h-1 md:h-auto bg-primary rounded-full animate-in fade-in zoom-in-75 duration-200"
              />
            )}

            {/* Icono con Badge */}
            <div className="relative flex items-center justify-center">
              <Icon className="w-6 h-6" aria-hidden="true" />
              {badgeCount > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-xs font-black flex items-center justify-center leading-none shadow-xs">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </div>

            {/* Etiqueta */}
            <span className="text-xs leading-tight truncate max-w-[72px] md:max-w-none mt-0.5 text-center">
              {texto}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
