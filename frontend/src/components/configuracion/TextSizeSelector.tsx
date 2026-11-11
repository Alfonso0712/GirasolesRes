import React, { useRef } from 'react';
import { Type, CheckCircle2 } from 'lucide-react';
import { TEXT_SIZE_OPTIONS, type TextSize, type TextSizeOption } from '../../hooks/useTextSize';

export interface TextSizeSelectorProps {
  value: TextSize;
  onChange: (size: TextSize) => void;
  className?: string;
}

const PREVIEW_SIZES: Record<TextSize, string> = {
  normal: 'text-sm font-semibold',
  grande: 'text-lg font-bold',
  'muy-grande': 'text-2xl font-black',
};

export const TextSizeSelector: React.FC<TextSizeSelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const radioRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % TEXT_SIZE_OPTIONS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + TEXT_SIZE_OPTIONS.length) % TEXT_SIZE_OPTIONS.length;
    } else {
      return;
    }

    const nextOption = TEXT_SIZE_OPTIONS[nextIndex];
    onChange(nextOption.id);
    radioRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-8 h-8 rounded-lg bg-brand-tint text-accent flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <Type className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-ink">Tamaño del texto</h3>
          <p className="text-xs text-ink-muted">
            Ajusta el tamaño de las letras en todo el sistema.
          </p>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label="Tamaño del texto"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {TEXT_SIZE_OPTIONS.map((opt: TextSizeOption, index: number) => {
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              ref={(el) => {
                radioRefs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-label={opt.label}
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChange(opt.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative text-center min-h-[96px] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
                isSelected
                  ? 'border-accent bg-brand-tint text-accent shadow-xs ring-1 ring-accent/30'
                  : 'border-line hover:border-line-strong hover:bg-surface-raised bg-surface text-ink'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs text-ink-muted font-medium">{opt.porcentaje}</span>
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-line shrink-0" aria-hidden="true" />
                )}
              </div>

              <span
                className={`${PREVIEW_SIZES[opt.id]} my-1 select-none leading-none`}
                aria-hidden="true"
              >
                {opt.previewLabel}
              </span>

              <span className="text-xs font-bold text-ink mt-1">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TextSizeSelector;
