import React from 'react';

export interface ChangePasswordFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  mostrar: boolean;
  onToggleMostrar: () => void;
  error?: string;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const ChangePasswordField: React.FC<ChangePasswordFieldProps> = ({
  label,
  value,
  onChange,
  mostrar,
  onToggleMostrar,
  error,
  placeholder,
  inputRef,
}) => {
  return (
    <div>
      <label className="form-label-standard">
        {label + ' '}<span className="text-rose-500">*</span>
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type={mostrar ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-sm text-neutral-800 focus:outline-none transition-colors ${
            error
              ? 'border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
              : 'border-neutral-300 focus:border-accent focus:ring-2 focus:ring-amber-200'
          }`}
        />
        <button
          type="button"
          onClick={onToggleMostrar}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-accent hover:text-accent px-2 py-1 rounded transition-colors cursor-pointer"
        >
          {mostrar ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      {error && (
        <p className="text-xs text-danger mt-1 font-medium">{error}</p>
      )}
    </div>
  );
};
