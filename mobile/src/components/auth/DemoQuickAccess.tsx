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
        <span className="shrink-0 px-3 text-[11px] font-bold text-ink-muted uppercase">
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
              className="p-2 rounded-xl border border-line bg-canvas hover:border-primary text-center active:scale-95 transition-all"
            >
              <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
              <span className="text-[10px] font-bold block text-ink truncate">{acc.rol}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
