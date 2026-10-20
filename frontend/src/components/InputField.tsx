import React, { forwardRef, useState } from 'react';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  rightElement?: React.ReactNode;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  error = '',
  rightElement,
  leftIcon,
  isPassword = false,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || name;
  const [showPassword, setShowPassword] = useState(false);

  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const renderRightElement = rightElement ? (
    rightElement
  ) : isPassword ? (
    <button
        type="button"
        tabIndex={0}
        onClick={() => setShowPassword(!showPassword)}
        className="text-xs font-bold text-[#D35400] hover:text-[#B84600] px-2 py-1 rounded transition-colors cursor-pointer"
      >
        {showPassword ? 'Ocultar' : 'Mostrar'}
      </button>
  ) : null;

  return (
    <div className={`mb-4 text-left ${className}`}>
      <label htmlFor={inputId} className="block text-xs sm:text-sm font-semibold text-[#2C1A0E] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9C8F84]">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          ref={ref}
          name={name}
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full min-h-[48px] py-3 rounded-xl border text-sm transition-all duration-150 outline-none text-[#2C1A0E] placeholder:text-[#A89F96] ${
            leftIcon ? 'pl-10' : 'pl-4'
          } ${renderRightElement ? 'pr-12' : 'pr-4'} ${
            error
              ? 'border-red-500 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-[#E5E0DB] bg-white focus:border-[#D35400] focus:ring-2 focus:ring-[#D35400]/20'
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />

        {renderRightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
            {renderRightElement}
          </div>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-red-500 text-xs mt-1.5 font-medium">
          {error}
        </p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
