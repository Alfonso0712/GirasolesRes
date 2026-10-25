import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  icon: Icon,
  variant = 'secondary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs rounded-lg min-h-[34px] gap-1.5',
    md: 'px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl min-h-[38px] gap-2',
    lg: 'px-4 py-2.5 text-sm sm:text-base font-bold rounded-xl min-h-[44px] gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-hover border-transparent shadow-xs',
    secondary: 'bg-surface hover:bg-neutral-50 text-neutral-700 border-neutral-200 border shadow-2xs',
    danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200 border',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 border-transparent',
    outline: 'bg-transparent text-accent border-accent border hover:bg-orange-50/50',
  };

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`w-4 h-4 shrink-0 ${loading ? 'animate-spin' : ''}`} />}
      {children}
    </button>
  );
};

export default ActionButton;
