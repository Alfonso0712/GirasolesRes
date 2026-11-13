import React from 'react';
import { useHaptics } from '../../hooks/useHaptics';

export interface NavTabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

export interface BottomNavProps {
  tabs: NavTabItem[];
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  badges?: Record<string, number>;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  tabs,
  currentTab,
  onSelectTab,
  badges = {},
}) => {
  const { triggerLight } = useHaptics();

  return (
    <nav
      aria-label="Navegación principal"
      className="h-16 bg-surface border-t border-line px-2 flex items-center justify-around shrink-0 shadow-lg select-none safe-bottom"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const activo = currentTab === tab.id;
        const badgeCount = badges[tab.id] || 0;

        return (
          <button
            key={tab.id}
            type="button"
            aria-current={activo ? 'page' : undefined}
            onClick={() => {
              triggerLight();
              onSelectTab(tab.id);
            }}
            className={`relative flex flex-col items-center justify-center min-w-[52px] h-14 px-1.5 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-xl ${
              activo ? 'text-accent font-bold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {/* Indicador visual activo superior */}
            {activo && (
              <span
                aria-hidden="true"
                className="absolute top-0 w-8 h-1 bg-primary rounded-full animate-in fade-in zoom-in-75 duration-200"
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
            <span className="text-xs leading-tight truncate max-w-[72px] mt-0.5">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
