import React from 'react';
import { Lock } from 'lucide-react';
import logoGirasoles from '../../assets/LOGO_GIRASOLES.png';

export interface LandingFooterProps {
  onGoToLogin: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onGoToLogin }) => {
  return (
    <footer className="bg-[#26150A] text-stone-400 text-xs py-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src="/favicon.png"
            alt="Isotipo Girasoles"
            className="w-10 h-10 rounded-2xl object-cover shrink-0 shadow-md ring-1 ring-white/20"
          />
          <div className="flex flex-col">
            <img
              src={logoGirasoles}
              alt="Restaurante Girasoles"
              className="h-6 sm:h-7 w-auto object-contain drop-shadow-xs mb-1"
            />
            <p className="font-semibold text-stone-200">
              Restaurante Girasoles © 2026 • RUC 20481234567
            </p>
            <p className="text-stone-400 text-[11px]">
              Comida criolla preparada con cariño y servida con calidad.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onGoToLogin}
            className="text-amber-400 hover:text-white font-semibold underline underline-offset-2 flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Ingreso al Sistema POS GirasolesRes</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
