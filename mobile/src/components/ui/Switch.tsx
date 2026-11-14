import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label': string;
  id?: string;
  className?: string;
}

/**
 * Interruptor accesible (role="switch", aria-checked) con objetivo táctil mínimo de 44 px
 * y pista (track) con borde y contraste visible tanto en modo claro como en modo oscuro.
 */
export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
  id,
  className = '',
}) => {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onChange(!checked);
        }
      }}
      className={`min-h-11 min-w-12 inline-flex items-center justify-center rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent shrink-0 transition-opacity ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`.trim()}
    >
      <span
        aria-hidden="true"
        className={`relative inline-flex w-12 h-7 items-center rounded-full p-0.5 border-2 transition-colors duration-200 ${
          checked
            ? 'bg-primary border-primary'
            : 'bg-line border-ink-faint/50'
        }`}
      >
        <span
          className={`inline-block w-5 h-5 rounded-full bg-surface border border-line shadow-xs transform transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
};
