import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { SheetActions } from './SheetActions';

export interface ConfirmSheetProps {
  isOpen: boolean;
  titulo: string;
  mensaje: string;
  etiquetaConfirmar?: string;
  etiquetaCancelar?: string;
  tono?: 'normal' | 'peligro';
  cargando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
  isOpen,
  titulo,
  mensaje,
  etiquetaConfirmar = 'Confirmar',
  etiquetaCancelar = 'Cancelar',
  tono = 'normal',
  cargando = false,
  onConfirmar,
  onCancelar,
}) => {
  const esPeligro = tono === 'peligro';

  return (
    <BottomSheet isOpen={isOpen} onClose={onCancelar} title={titulo}>
      <div className="space-y-4 text-center">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
            esPeligro
              ? 'bg-danger-bg text-danger border border-danger-border'
              : 'bg-warning-bg text-warning border border-warning-border'
          }`}
        >
          {esPeligro ? (
            <AlertCircle className="w-7 h-7" aria-hidden="true" />
          ) : (
            <AlertTriangle className="w-7 h-7" aria-hidden="true" />
          )}
        </div>

        <div>
          <h3 className="text-base font-extrabold text-ink mb-1.5">{titulo}</h3>
          <p className="text-xs text-ink-muted leading-relaxed max-w-sm mx-auto">{mensaje}</p>
        </div>

        <SheetActions
          secondaryLabel={etiquetaCancelar}
          primaryLabel={etiquetaConfirmar}
          primaryVariant={esPeligro ? 'danger' : 'primary'}
          isLoading={cargando}
          onSecondary={onCancelar}
          onPrimary={onConfirmar}
        />
      </div>
    </BottomSheet>
  );
};
