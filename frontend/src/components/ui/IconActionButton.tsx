import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface IconActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
  disabledReason?: string;
  className?: string;
  size?: 'sm' | 'md';
  type?: 'button' | 'submit' | 'reset';
}

export const IconActionButton: React.FC<IconActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  disabled = false,
  disabledReason,
  className = '',
  size = 'md',
  type = 'button',
}) => {
  const tooltipText = disabled && disabledReason ? disabledReason : label;

  const sizeClasses = {
    sm: 'w-9 h-9 min-h-[36px] min-w-[36px]',
    md: 'w-10 h-10 min-h-[40px] min-w-[40px]',
  };

  const variantClasses = {
    default:
      'bg-white hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900 border-neutral-200/90 hover:border-neutral-300 shadow-2xs',
    danger:
      'bg-white hover:bg-rose-50 text-neutral-700 hover:text-rose-700 border-neutral-200/90 hover:border-rose-300 shadow-2xs',
    success:
      'bg-white hover:bg-emerald-50 text-neutral-700 hover:text-emerald-700 border-neutral-200/90 hover:border-emerald-300 shadow-2xs',
    warning:
      'bg-white hover:bg-amber-50 text-neutral-700 hover:text-amber-800 border-neutral-200/90 hover:border-amber-300 shadow-2xs',
  };

  const disabledClasses =
    'bg-neutral-100/80 text-neutral-400 border-neutral-200 cursor-not-allowed opacity-60 shadow-none';

  return (
    <div className="relative group inline-flex items-center justify-center">
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`inline-flex items-center justify-center rounded-xl border transition-all active:scale-[0.97] focus:outline-hidden focus:ring-2 focus:ring-[#C74E00]/25 ${sizeClasses[size]} ${
          disabled ? disabledClasses : variantClasses[variant]
        } ${className}`}
      >
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      </button>

      {/* Accessible Tooltip */}
      <div
        role="tooltip"
        className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex group-focus-within:flex items-center px-2 py-1 text-xs font-medium text-white bg-[#2C1A0E] rounded-md shadow-md whitespace-nowrap z-30 transition-opacity"
      >
        <span>{tooltipText}</span>
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#2C1A0E] rotate-45" />
      </div>
    </div>
  );
};

export default IconActionButton;
