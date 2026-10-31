import React from 'react';
import { ShieldAlert } from 'lucide-react';

export interface AccesoRestringidoViewProps {
  modulo: 'historial-cierres' | 'reportes';
  onIrAModuloPrincipal: () => void;
}

export const AccesoRestringidoView: React.FC<AccesoRestringidoViewProps> = ({
  modulo,
  onIrAModuloPrincipal,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center">
      <div className="w-16 h-16 bg-rose-50 text-danger rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-sans font-bold text-neutral-800 mb-2">
        Acceso Restringido
      </h2>
      <p className="text-neutral-600 max-w-md mx-auto text-sm">
        {modulo === 'historial-cierres'
          ? 'No tiene permiso para acceder al Historial de Cierres. Este módulo está reservado exclusivamente para el rol Administrador.'
          : 'No tiene permiso para acceder a Reportes. Este módulo está restringido exclusivamente para el rol Administrador.'}
      </p>
      <button
        type="button"
        onClick={onIrAModuloPrincipal}
        className="mt-6 px-4 py-2 bg-primary text-white rounded-xl font-semibold text-xs shadow-sm hover:bg-primary-hover transition-colors cursor-pointer"
      >
        Ir al módulo principal
      </button>
    </div>
  );
};
