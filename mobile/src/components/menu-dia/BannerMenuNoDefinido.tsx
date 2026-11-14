import React from 'react';
import { AlertTriangle, CalendarCheck } from 'lucide-react';
import type { RolUsuario } from '../../types/auth';
import { puede } from '../../config/permisos';
import { Button } from '../ui/Button';
import { useHaptics } from '../../hooks/useHaptics';

export const TEXTO_MENU_NO_DEFINIDO_ADMIN =
  'El menú de hoy aún no está definido. Defina el menú diario para que el personal pueda registrar comandas de salón y para llevar.';

export const TEXTO_MENU_NO_DEFINIDO_OPERATIVO =
  'Todavía no se definió el menú del día. Los menús completos no estarán disponibles.';

export interface BannerMenuNoDefinidoProps {
  rol?: RolUsuario;
  onDefinirMenu?: () => void;
  className?: string;
}

export const BannerMenuNoDefinido: React.FC<BannerMenuNoDefinidoProps> = ({
  rol,
  onDefinirMenu,
  className = '',
}) => {
  const { triggerLight } = useHaptics();
  const puedeDefinir = puede(rol, 'menuDia.definir');

  return (
    <div
      role="status"
      aria-label="Aviso de estado del menú del día"
      className={`p-3.5 rounded-2xl bg-warning-bg border border-warning-border text-badge-warning-text flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${className}`.trim()}
    >
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs font-semibold leading-snug break-words">
          {puedeDefinir ? TEXTO_MENU_NO_DEFINIDO_ADMIN : TEXTO_MENU_NO_DEFINIDO_OPERATIVO}
        </p>
      </div>

      {puedeDefinir && onDefinirMenu && (
        <Button
          type="button"
          variant="primary"
          size="sm"
          icon={<CalendarCheck className="w-4 h-4" aria-hidden="true" />}
          onClick={() => {
            triggerLight();
            onDefinirMenu();
          }}
          className="min-h-11 px-3 text-xs font-bold shrink-0 self-end sm:self-center"
        >
          Definir menú
        </Button>
      )}
    </div>
  );
};
