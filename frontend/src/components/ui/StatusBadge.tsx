import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Ban,
  Lock,
  Flame,
  type LucideIcon,
} from 'lucide-react';

export type StatusIntent = 'success' | 'danger' | 'warning' | 'neutral';

export interface StatusBadgeProps {
  status: boolean | string;
  intent?: StatusIntent;
  variant?: string;
  icon?: LucideIcon;
  label?: string;
  className?: string;
  activeLabel?: string;
  inactiveLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  intent,
  icon: CustomIcon,
  label: customLabel,
  className = '',
  activeLabel = 'Activo',
  inactiveLabel = 'Inactivo',
}) => {
  const isBoolean = typeof status === 'boolean';
  const rawText = isBoolean ? (status ? activeLabel : inactiveLabel) : String(status);
  const displayLabel = customLabel || rawText;
  const normalized = rawText.trim().toLowerCase();

  // Automatic intent resolution if not explicitly provided
  let resolvedIntent: StatusIntent = intent || 'neutral';

  if (!intent) {
    if (
      normalized === 'activo' ||
      normalized === 'activa' ||
      normalized === 'vigente' ||
      normalized === 'libre' ||
      normalized === 'abierta' ||
      normalized === 'listo' ||
      normalized === 'lista' ||
      normalized === 'entregado' ||
      normalized === 'cuadra' ||
      normalized === 'pagado' ||
      normalized === 'emitido' ||
      normalized === 'true'
    ) {
      resolvedIntent = 'success';
    } else if (
      normalized === 'inactivo' ||
      normalized === 'inactiva' ||
      normalized === 'anulada' ||
      normalized === 'anulado' ||
      normalized === 'bloqueado' ||
      normalized === 'desactivado' ||
      normalized === 'faltante' ||
      normalized === 'cancelado' ||
      normalized === 'agotado' ||
      normalized === 'anterior sin cerrar' ||
      normalized === 'false'
    ) {
      resolvedIntent = 'danger';
    } else if (
      normalized === 'con ajustes' ||
      normalized === 'sobrante' ||
      normalized === 'en preparacion' ||
      normalized === 'en preparación' ||
      normalized === 'en curso' ||
      normalized === 'pendiente' ||
      normalized === 'ocupada' ||
      normalized === 'ocupado' ||
      normalized === 'reservada' ||
      normalized === 'reservado'
    ) {
      resolvedIntent = 'warning';
    } else {
      resolvedIntent = 'neutral';
    }
  }

  // Resolve default Lucide icon according to semantic meaning
  let IconComponent: LucideIcon = CustomIcon || CheckCircle2;

  if (!CustomIcon) {
    if (resolvedIntent === 'success') {
      IconComponent = CheckCircle2;
    } else if (resolvedIntent === 'danger') {
      IconComponent = normalized === 'anulada' || normalized === 'anulado' || normalized === 'cancelado'
        ? Ban
        : XCircle;
    } else if (resolvedIntent === 'warning') {
      if (normalized === 'en preparacion' || normalized === 'en preparación') {
        IconComponent = Flame;
      } else if (normalized === 'pendiente' || normalized === 'en curso') {
        IconComponent = Clock;
      } else {
        IconComponent = AlertTriangle;
      }
    } else {
      IconComponent = normalized === 'cerrada' || normalized === 'cerrado' ? Lock : Clock;
    }
  }

  // Styles with strict WCAG AA contrast (ratio >= 4.5:1 against respective tinted backgrounds)
  const intentStyles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    danger: 'bg-rose-50 text-rose-800 border-rose-300',
    warning: 'bg-amber-50 text-amber-900 border-amber-300',
    neutral: 'bg-stone-100 text-stone-700 border-stone-300',
  };

  const iconStyles = {
    success: 'text-emerald-700',
    danger: 'text-rose-700',
    warning: 'text-amber-700',
    neutral: 'text-stone-600',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-2xs whitespace-nowrap transition-colors ${intentStyles[resolvedIntent]} ${className}`}
    >
      <IconComponent className={`w-3.5 h-3.5 shrink-0 ${iconStyles[resolvedIntent]}`} aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;
