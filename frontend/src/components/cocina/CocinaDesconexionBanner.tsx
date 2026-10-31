import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface CocinaDesconexionBannerProps {
  sinConexion: boolean;
  segundosSinConexion: number;
  onReintentar: () => void;
}

export const CocinaDesconexionBanner: React.FC<CocinaDesconexionBannerProps> = ({
  sinConexion,
  segundosSinConexion,
  onReintentar,
}) => {
  if (!sinConexion) return null;

  return (
    <div
      role="alert"
      className="bg-amber-600 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md animate-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          Sin conexión: las comandas pueden estar desactualizadas (datos de hace{' '}
          {segundosSinConexion} s).
        </span>
      </div>
      <button
        type="button"
        onClick={onReintentar}
        className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors cursor-pointer"
      >
        Reintentar
      </button>
    </div>
  );
};
