import React from 'react';
import { useHaptics } from '../../hooks/useHaptics';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  variant?: 'ghost' | 'outline' | 'primary';
  size?: 'md' | 'lg';
  isLoading?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  'aria-label': ariaLabel,
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  disabled,
  onClick,
  className = '',
  ...props
}) => {
  const { triggerLight } = useHaptics();

  const sizeStyles = {
    md: 'w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-base',
    lg: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl text-lg',
  };

  const variantStyles = {
    ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-canvas active:bg-canvas',
    outline: 'bg-surface border border-line text-ink-muted hover:text-ink hover:border-line-strong active:bg-canvas shadow-2xs',
    primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-hover shadow-xs',
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
      aria-label={ariaLabel}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={`inline-flex items-center justify-center shrink-0 transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus-visible:ring-2 focus-visible:ring-accent outline-hidden ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {isLoading ? (
        <svg className="animate-spin w-5 h-5 text-current" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : (
        children
      )}
    </button>
  );
};
