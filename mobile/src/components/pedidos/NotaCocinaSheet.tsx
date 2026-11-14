import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { useHaptics } from '../../hooks/useHaptics';

export interface NotaCocinaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  nombrePlato: string;
  notaInicial?: string;
  onGuardarNota: (nota: string) => void;
}

export const NotaCocinaSheet: React.FC<NotaCocinaSheetProps> = ({
  isOpen,
  onClose,
  nombrePlato,
  notaInicial = '',
  onGuardarNota,
}) => {
  const [nota, setNota] = useState<string>(notaInicial);
  const { triggerLight } = useHaptics();

  useEffect(() => {
    if (isOpen) {
      setNota(notaInicial || '');
    }
  }, [isOpen, notaInicial]);

  if (!isOpen) return null;

  const handleGuardar = () => {
    triggerLight();
    onGuardarNota(nota.trim());
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Nota para Cocina">
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold text-accent uppercase tracking-wider block">
            Plato seleccionado:
          </span>
          <p className="text-sm font-extrabold text-ink">{nombrePlato}</p>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="nota-linea" className="font-bold text-ink-muted">
              Indicaciones especiales:
            </label>
            <span className="text-ink-muted font-mono">{nota.length}/100</span>
          </div>
          <input
            id="nota-linea"
            type="text"
            maxLength={100}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Ej. Sin sal, término medio, bien caliente..."
            className="w-full bg-canvas border border-line rounded-xl px-3 py-2.5 text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-primary"
            autoFocus
          />
        </div>

        <div className="flex gap-2.5 pt-2">
          <Button
            size="md"
            variant="outline"
            onClick={onClose}
            className="flex-1 min-h-[48px]"
          >
            <span>Cancelar</span>
          </Button>

          <Button
            size="md"
            variant="primary"
            onClick={handleGuardar}
            className="flex-1 min-h-[48px]"
          >
            <span>Guardar Nota</span>
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
