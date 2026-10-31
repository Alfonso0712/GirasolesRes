import React from 'react';
import { X } from 'lucide-react';
import logoGirasoles from '../../../assets/LOGO_GIRASOLES.png';

interface SidebarHeaderProps {
  onCloseMobile?: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onCloseMobile }) => {
  return (
    <div className="shrink-0 flex items-center justify-between pb-3 xl:pb-4 border-b border-sidebar-line mb-2">
      <div className="flex-1 flex items-center py-1">
        <img
          src={logoGirasoles}
          alt="Girasoles Restaurante"
          className="h-10 sm:h-11 xl:h-12 w-auto max-w-[190px] xl:max-w-[210px] object-contain drop-shadow-xs"
        />
      </div>
      {onCloseMobile && (
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Cerrar menú"
          className="lg:hidden p-2 text-[#FDE68A]/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shrink-0 ml-2"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
