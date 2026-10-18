import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  isSubmitting?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  disabled = false,
  type = 'button',
  variant = 'primary',
  isSubmitting = false,
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'w-full min-h-[48px] py-3 px-5 rounded-xl font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 text-sm';

  const variants = {
    primary: 'bg-[#D35400] hover:bg-[#B84600] active:bg-[#9E3B00] text-white focus:ring-[#D35400] shadow-md shadow-orange-900/15',
    secondary: 'bg-white hover:bg-neutral-50 text-[#2C1A0E] border border-[#E5E0DB] focus:ring-neutral-400',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white focus:ring-rose-500',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isSubmitting}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Ingresando…
        </span>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
