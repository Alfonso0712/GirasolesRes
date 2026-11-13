import React from 'react';
import {
  CheckCircle2,
  Clock,
  PowerOff,
  Flame,
  Ban,
  Unlock,
  Lock,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';

export type StatusCategory = 'mesa' | 'pedido' | 'caja' | 'general';

export interface StatusBadgeProps {
  status?: string | boolean;
  estado?: string | boolean;
  category?: StatusCategory;
  className?: string;
  label?: string;
}

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

function resolveStatus(status: string | boolean, category?: StatusCategory): StatusConfig {
  const text = typeof status === 'boolean' ? (status ? 'Activo' : 'Inactivo') : status.trim();
  const lower = text.toLowerCase();

  // 1. Estados de Mesa (CUS06)
  if (category === 'mesa' || lower === 'libre' || lower === 'ocupada' || lower === 'inactiva') {
    if (lower === 'libre') {
      return { label: 'Libre', icon: CheckCircle2, variant: 'success' };
    }
    if (lower === 'ocupada') {
      return { label: 'Ocupada', icon: Clock, variant: 'warning' };
    }
    if (lower === 'inactiva') {
      return { label: 'Inactiva', icon: PowerOff, variant: 'neutral' };
    }
  }

  // 2. Estados de Caja (CUS13)
  if (
    category === 'caja' ||
    lower === 'abierta' ||
    lower === 'cerrada' ||
    lower === 'anterior sin cerrar' ||
    lower === 'anteriorsincerrar' ||
    lower === 'sincaja'
  ) {
    if (lower === 'abierta') {
      return { label: 'Abierta', icon: Unlock, variant: 'success' };
    }
    if (lower === 'cerrada' || lower === 'sincaja') {
      return { label: 'Cerrada', icon: Lock, variant: 'neutral' };
    }
    if (lower.includes('anterior') || lower.includes('sin cerrar')) {
      return { label: 'Anterior sin cerrar', icon: AlertTriangle, variant: 'warning' };
    }
  }

  // 3. Estados de Pedido (CUS07..CUS09)
  if (lower === 'pendiente' || lower === 'en curso') {
    return { label: 'Pendiente', icon: Clock, variant: 'warning' };
  }
  if (lower === 'en preparacion' || lower === 'en preparación') {
    return { label: 'En preparación', icon: Flame, variant: 'warning' };
  }
  if (lower === 'listo' || lower === 'lista') {
    return { label: 'Listo', icon: CheckCircle2, variant: 'success' };
  }
  if (lower === 'pagado') {
    return { label: 'Pagado', icon: CheckCircle2, variant: 'success' };
  }
  if (lower === 'anulado' || lower === 'anulada') {
    return { label: 'Anulado', icon: Ban, variant: 'danger' };
  }
  if (lower === 'listo · pagado') {
    return { label: 'Listo · Pagado', icon: CheckCircle2, variant: 'success' };
  }
  if (lower.includes('pagado · en')) {
    return { label: 'Pagado · En preparación', icon: Flame, variant: 'warning' };
  }
  if (lower.includes('pagado · pendiente')) {
    return { label: 'Pagado · Pendiente', icon: Clock, variant: 'warning' };
  }

  // 4. Fallback General
  if (lower === 'activo' || lower === 'activa' || lower === 'cuadra') {
    return { label: text, icon: CheckCircle2, variant: 'success' };
  }
  if (lower === 'inactivo' || lower === 'inactiva' || lower === 'agotado' || lower === 'desactivada') {
    return { label: text, icon: Ban, variant: 'danger' };
  }

  return { label: text, icon: Clock, variant: 'neutral' };
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  estado,
  category,
  className = '',
  label: customLabel,
}) => {
  const finalStatus = (status ?? estado ?? '') as string | boolean;
  const config = resolveStatus(finalStatus, category);
  const Icon = config.icon;
  const label = customLabel || config.label;

  const variantStyles = {
    success: 'bg-success-bg text-success border-success-border',
    warning: 'bg-warning-bg text-warning border-warning-border',
    danger: 'bg-danger-bg text-danger border-danger-border',
    info: 'bg-info-bg text-info border-info-border',
    neutral: 'bg-canvas text-ink-muted border-line',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border tracking-wide uppercase select-none whitespace-nowrap shadow-2xs ${variantStyles[config.variant]} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
