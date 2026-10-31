import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const SidebarFooter: React.FC = () => {
  return (
    <div className="shrink-0 pt-3 xl:pt-3.5 border-t border-sidebar-line flex items-center gap-3 mt-1">
      <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
      <div>
        <p className="text-xs font-semibold text-white tracking-wide">Acceso protegido</p>
        <p className="text-xs text-[#FDE68A]/70">Sesión segura y activa</p>
      </div>
    </div>
  );
};
