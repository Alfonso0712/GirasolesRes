import React from 'react';
import { Clock } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';

export interface InactivitySheetProps {
  isOpen: boolean;
  segundosRestantes: number;
  renovando: boolean;
  onContinuar: () => void | Promise<void>;
  onCerrar: () => void | Promise<void>;
}

export const InactivitySheet: React.FC<InactivitySheetProps> = ({
  isOpen,
  segundosRestantes,
  renovando,
  onContinuar,
  onCerrar,
}) => {
  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  const tiempoFormateado = `${minutos}:${segundos.toString().padStart(2, '0')}`;

  return (
    <BottomSheet isOpen={isOpen} onClose={() => {}} title="Aviso de inactividad">
      <div className="space-y-4 text-center">
        <div className="w-14 h-14 rounded-full bg-warning-bg text-badge-warning-text border border-warning-border flex items-center justify-center mx-auto">
          <Clock className="w-7 h-7 animate-pulse" aria-hidden="true" />
        </div>

        <div>
          <h3 className="text-base font-extrabold text-ink mb-1.5">
            Su sesión está por expirar
          </h3>
          <p className="text-xs text-ink-muted leading-relaxed max-w-sm mx-auto">
            Su sesión vencerá en{' '}
            <strong className="text-accent font-black tabular-nums">{tiempoFormateado}</strong> por inactividad.
          </p>
          <p className="text-xs text-ink-muted mt-1">
            ¿Desea continuar trabajando en el sistema?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            disabled={renovando}
            onClick={onCerrar}
            className="w-full min-h-[44px]"
          >
            Cerrar Sesión
          </Button>

          <Button
            variant="primary"
            size="md"
            isLoading={renovando}
            onClick={onContinuar}
            className="w-full min-h-[44px]"
          >
            Continuar Sesión
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
