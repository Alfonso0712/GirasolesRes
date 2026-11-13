import React from 'react';
import { useHaptics } from '../../hooks/useHaptics';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  disabled,
  onClick,
  className = '',
  ...props
}) => {
  const { triggerLight } = useHaptics();

  const baseStyles =
    'relative inline-flex items-center justify-center font-bold select-none touch-manipulation rounded-xl transition-all duration-150 active:scale-98 disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus-visible:ring-2 focus-visible:ring-accent outline-hidden';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-2.5 min-h-[44px]',
    md: 'text-sm px-4 py-3 min-h-[48px]',
    lg: 'text-base px-5 py-3.5 min-h-[56px]',
  };

  const variantStyles = {
    primary: 'bg-primary text-white shadow-xs hover:bg-primary-hover active:bg-primary-hover',
    secondary: 'bg-brand-surface text-white shadow-xs hover:opacity-90',
    danger: 'bg-danger text-white shadow-xs hover:opacity-90',
    outline: 'border border-line bg-surface text-ink hover:bg-canvas active:bg-canvas',
    ghost: 'bg-transparent text-ink hover:bg-canvas active:bg-canvas',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    triggerLight();
    onClick?.(e);
  };

  return (
    <button
      {...props}
      type={props.type || 'button'}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </span>
      )}
    </button>
  );
};
