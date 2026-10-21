import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Tooltip } from './Tooltip';

export type IconActionVariant =
  | 'default'
  | 'view'
  | 'edit'
  | 'download'
  | 'print'
  | 'activate'
  | 'deactivate'
  | 'delete'
  | 'danger'
  | 'warning'
  | 'success';

export interface IconActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: IconActionVariant;
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

  // Paleta semántica con contraste accesible WCAG AA (> 4.5:1 sobre fondo claro)
  const variantClasses: Record<IconActionVariant, string> = {
    default:
      'bg-neutral-100 hover:bg-neutral-200 text-[#334155] border border-neutral-300/80 shadow-2xs',
    view:
      'bg-[#EFF6FF] hover:bg-blue-100 text-[#1D4ED8] border border-[#BFDBFE] hover:border-blue-300 shadow-2xs',
    edit:
      'bg-[#FFFBEB] hover:bg-amber-100 text-[#B84500] border border-[#FDE68A] hover:border-amber-300 shadow-2xs',
    download:
      'bg-[#F1F5F9] hover:bg-slate-200 text-[#334155] border border-[#CBD5E1] hover:border-slate-400 shadow-2xs',
    print:
      'bg-[#F1F5F9] hover:bg-slate-200 text-[#334155] border border-[#CBD5E1] hover:border-slate-400 shadow-2xs',
    activate:
      'bg-[#ECFDF5] hover:bg-emerald-100 text-[#047857] border border-[#A7F3D0] hover:border-emerald-300 shadow-2xs',
    success:
      'bg-[#ECFDF5] hover:bg-emerald-100 text-[#047857] border border-[#A7F3D0] hover:border-emerald-300 shadow-2xs',
    deactivate:
      'bg-[#FEF3C7] hover:bg-amber-100 text-[#92400E] border border-[#FDE68A] hover:border-amber-300 shadow-2xs',
    warning:
      'bg-[#FEF3C7] hover:bg-amber-100 text-[#92400E] border border-[#FDE68A] hover:border-amber-300 shadow-2xs',
    delete:
      'bg-[#FEF2F2] hover:bg-rose-100 text-[#B91C1C] border border-[#FECACA] hover:border-rose-300 shadow-2xs',
    danger:
      'bg-[#FEF2F2] hover:bg-rose-100 text-[#B91C1C] border border-[#FECACA] hover:border-rose-300 shadow-2xs',
  };

  const disabledClasses =
    'bg-[#F3F4F6] text-[#8A8179] border border-[#E5E7EB] cursor-not-allowed shadow-none';

  return (
    <Tooltip content={tooltipText} placement="top">
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`inline-flex items-center justify-center rounded-xl transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#C74E00]/25 ${
          sizeClasses[size]
        } ${disabled ? disabledClasses : variantClasses[variant]} ${className}`}
      >
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      </button>
    </Tooltip>
  );
};

export default IconActionButton;
