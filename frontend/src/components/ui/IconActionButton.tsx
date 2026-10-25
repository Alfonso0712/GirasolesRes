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
      'bg-neutral-100 hover:bg-neutral-200 text-action-default-text border border-neutral-300/80 shadow-2xs',
    view:
      'bg-action-info-bg hover:bg-action-info-hover-bg text-action-info-text border border-action-info-border hover:border-action-info-hover-border shadow-2xs',
    edit:
      'bg-action-edit-bg hover:bg-action-edit-hover-bg text-accent border border-action-edit-border hover:border-action-edit-hover-border shadow-2xs',
    download:
      'bg-action-download-bg hover:bg-action-download-hover-bg text-action-download-text border border-action-download-border hover:border-action-download-hover-border shadow-2xs',
    print:
      'bg-action-download-bg hover:bg-action-download-hover-bg text-action-download-text border border-action-download-border hover:border-action-download-hover-border shadow-2xs',
    activate:
      'bg-action-success-bg hover:bg-action-success-hover-bg text-action-success-text border border-action-success-border hover:border-action-success-hover-border shadow-2xs',
    success:
      'bg-action-success-bg hover:bg-action-success-hover-bg text-action-success-text border border-action-success-border hover:border-action-success-hover-border shadow-2xs',
    deactivate:
      'bg-action-warning-bg hover:bg-action-warning-hover-bg text-action-warning-text border border-action-warning-border hover:border-action-warning-hover-border shadow-2xs',
    warning:
      'bg-action-warning-bg hover:bg-action-warning-hover-bg text-action-warning-text border border-action-warning-border hover:border-action-warning-hover-border shadow-2xs',
    delete:
      'bg-action-danger-bg hover:bg-action-danger-hover-bg text-action-danger-text border border-action-danger-border hover:border-action-danger-hover-border shadow-2xs',
    danger:
      'bg-action-danger-bg hover:bg-action-danger-hover-bg text-action-danger-text border border-action-danger-border hover:border-action-danger-hover-border shadow-2xs',
  };

  const disabledClasses =
    'bg-action-disabled-bg text-action-disabled-text border border-action-disabled-border cursor-not-allowed shadow-none';

  return (
    <Tooltip content={tooltipText} placement="top">
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`inline-flex items-center justify-center rounded-xl transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-accent/25 ${
          sizeClasses[size]
        } ${disabled ? disabledClasses : variantClasses[variant]} ${className}`}
      >
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      </button>
    </Tooltip>
  );
};

export default IconActionButton;
