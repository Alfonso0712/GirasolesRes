import React from 'react';

interface PageLoaderProps {
  fullScreen?: boolean;
  mensaje?: string;
}

/**
 * Indicador de carga mínimo compartido para verificación de sesión y Suspense de páginas.
 * Reutiliza el contenedor y fondo del layout principal (bg-canvas) sin añadir estilos nuevos.
 */
export const PageLoader: React.FC<PageLoaderProps> = ({ fullScreen = false, mensaje }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`${
        fullScreen ? 'min-h-screen' : 'min-h-[60vh]'
      } w-full bg-canvas flex flex-col items-center justify-center p-6 text-center`}
    >
      <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-accent mb-3 animate-pulse">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
      {mensaje && <p className="text-sm font-semibold text-ink">{mensaje}</p>}
    </div>
  );
};
