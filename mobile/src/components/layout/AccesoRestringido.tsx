import React from 'react';
import { ShieldAlert, Home } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export interface AccesoRestringidoProps {
  onVolverAlInicio: () => void;
  mensaje?: string;
}

export const AccesoRestringido: React.FC<AccesoRestringidoProps> = ({
  onVolverAlInicio,
  mensaje = 'Su rol no tiene acceso a esta sección.',
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-canvas">
      <Card className="max-w-sm w-full p-6 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-danger-bg border border-danger-border flex items-center justify-center text-danger">
          <ShieldAlert className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-base font-extrabold text-ink">Acceso restringido</h2>
          <p className="text-xs text-ink-muted leading-relaxed">{mensaje}</p>
        </div>
        <Button
          fullWidth
          size="md"
          variant="primary"
          onClick={onVolverAlInicio}
          className="flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          <span>Volver al inicio</span>
        </Button>
      </Card>
    </div>
  );
};
