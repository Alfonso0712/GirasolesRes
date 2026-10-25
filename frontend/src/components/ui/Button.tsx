import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  isSubmitting?: boolean;
  submittingText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  disabled = false,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth,
  isSubmitting = false,
  submittingText,
  className = '',
  ...props
}, ref) => {
  const isExplicitWidth = fullWidth !== undefined
    ? (fullWidth ? 'w-full' : 'w-auto')
    : (className.includes('w-') ? '' : (size === 'icon' ? '' : 'w-full'));

  const sizeStyles = {
    sm: 'min-h-[36px] py-1.5 px-3 text-xs rounded-lg',
    md: 'min-h-[44px] py-2.5 px-4 text-sm rounded-xl',
    lg: 'min-h-[48px] py-3 px-5 text-sm sm:text-base rounded-xl font-bold uppercase tracking-wider',
    icon: 'min-h-[40px] min-w-[40px] p-2 rounded-xl aspect-square',
  };

  const variants = {
    primary: 'bg-primary hover:bg-primary-hover active:bg-[#9E3B00] text-white focus:ring-accent shadow-md shadow-orange-900/15',
    secondary: 'bg-surface hover:bg-neutral-50 text-ink border border-line-strong focus:ring-neutral-400 shadow-2xs',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white focus:ring-rose-500 shadow-md shadow-rose-900/15',
    success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white focus:ring-emerald-500 shadow-md shadow-emerald-900/15',
    outline: 'bg-transparent hover:bg-canvas text-ink border border-line-strong focus:ring-accent/30',
    ghost: 'bg-transparent hover:bg-stone-100 text-ink focus:ring-stone-300',
  };

  const baseStyles = 'font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isSubmitting}
      className={`${baseStyles} ${isExplicitWidth} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          {submittingText || 'Ingresando…'}
        </span>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
