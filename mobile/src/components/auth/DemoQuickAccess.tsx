import React from 'react';
import { Shield, Utensils, ChefHat, Receipt } from 'lucide-react';
import { DEMO_ACCOUNTS, type DemoAccount } from '../../config/demoAccounts';

interface DemoQuickAccessProps {
  onQuickLogin: (usuario: string, contrasena: string) => void;
}

const ICONS: Record<DemoAccount['rol'], React.ComponentType<{ className?: string }>> = {
  Admin: Shield,
  Mozo: Utensils,
  Cocinero: ChefHat,
  Cajero: Receipt,
};

export const DemoQuickAccess: React.FC<DemoQuickAccessProps> = ({ onQuickLogin }) => {
  return (
    <>
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-line"></div>
        <span className="shrink-0 px-3 text-xs font-semibold text-ink-muted uppercase">
          Acceso Rápido por Rol
        </span>
        <div className="flex-grow border-t border-line"></div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {DEMO_ACCOUNTS.map((acc) => {
          const Icon = ICONS[acc.rol];
          return (
            <button
              key={acc.rol}
              type="button"
              onClick={() => onQuickLogin(acc.usuario, acc.contrasena)}
              className="p-2 min-h-[44px] rounded-xl border border-line bg-canvas hover:border-primary text-center active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Icon className="w-4 h-4 text-accent mx-auto mb-1" />
              <span className="text-xs font-bold block text-ink leading-tight break-words">{acc.rol}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
