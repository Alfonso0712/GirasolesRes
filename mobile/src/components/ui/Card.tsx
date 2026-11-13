import React from 'react';
import { useHaptics } from '../../hooks/useHaptics';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'interactive';
  interactive?: boolean;
  accent?: 'none' | 'success' | 'warning' | 'danger' | 'info';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  interactive,
  accent = 'none',
  padding = 'md',
  className = '',
  onClick,
  ...props
}) => {
  const { triggerLight } = useHaptics();

  const isInteractive = variant === 'interactive' || Boolean(interactive) || Boolean(onClick);

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  const accentStyles = {
    none: '',
    success: 'border-l-4 border-l-success',
    warning: 'border-l-4 border-l-warning',
    danger: 'border-l-4 border-l-danger',
    info: 'border-l-4 border-l-info',
  };

  const interactiveStyles = isInteractive
    ? 'cursor-pointer active:scale-[0.99] hover:border-line-strong active:bg-canvas transition-all focus-visible:ring-2 focus-visible:ring-accent outline-hidden select-none'
    : '';

  const handleClick = () => {
    if (!isInteractive || !onClick) return;
    triggerLight();
    onClick();
  };

  return (
    <div
      {...props}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`bg-surface border border-line rounded-2xl shadow-xs ${paddingStyles[padding]} ${accentStyles[accent]} ${interactiveStyles} ${className}`}
    >
      {children}
    </div>
  );
};
