import React from 'react';
import { Delete } from 'lucide-react';
import { useHaptics } from '../../hooks/useHaptics';

interface NumpadProps {
  value: string;
  onChange: (val: string) => void;
  onEnter?: () => void;
  enterLabel?: string;
}

export const Numpad: React.FC<NumpadProps> = ({
  value,
  onChange,
  onEnter,
  enterLabel = 'Confirmar',
}) => {
  const { triggerLight } = useHaptics();

  const handleDigit = (digit: string) => {
    triggerLight();
    if (digit === '.' && value.includes('.')) return;
    if (value === '0' && digit !== '.') {
      onChange(digit);
    } else {
      onChange(value + digit);
    }
  };

  const handleClear = () => {
    triggerLight();
    onChange('');
  };

  const handleBackspace = () => {
    triggerLight();
    onChange(value.slice(0, -1));
  };

  const handlePreset = (amount: number) => {
    triggerLight();
    onChange(amount.toString());
  };

  return (
    <div className="w-full space-y-2 select-none">
      {/* Botones de montos rápidos en soles */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        {[10, 20, 50, 100].map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => handlePreset(amt)}
            className="py-2 rounded-lg bg-chip-accent-bg border border-chip-accent-border text-primary font-bold text-xs active:scale-95 transition-transform"
          >
            S/ {amt}
          </button>
        ))}
      </div>

      {/* Grilla numérica 3x4 */}
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(d)}
            className="h-14 rounded-xl bg-surface border border-line text-ink font-extrabold text-xl shadow-xs active:scale-95 active:bg-canvas transition-all flex items-center justify-center"
          >
            {d}
          </button>
        ))}

        <button
          type="button"
          onClick={handleBackspace}
          aria-label="Borrar dígito"
          className="h-14 rounded-xl bg-surface border border-line text-danger font-bold shadow-xs active:scale-95 active:bg-danger-bg transition-all flex items-center justify-center"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      {/* Fila de acción */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          type="button"
          onClick={handleClear}
          className="h-12 rounded-xl bg-canvas border border-line text-ink-muted font-bold text-xs active:scale-95 transition-transform flex items-center justify-center"
        >
          Limpiar
        </button>

        {onEnter && (
          <button
            type="button"
            onClick={() => {
              triggerLight();
              onEnter();
            }}
            className="col-span-2 h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-xs active:scale-95 transition-transform flex items-center justify-center"
          >
            {enterLabel}
          </button>
        )}
      </div>
    </div>
  );
};
