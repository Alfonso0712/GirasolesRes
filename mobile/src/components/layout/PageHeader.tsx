import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  etiquetas?: React.ReactNode;
  onVolver?: () => void;
  actualizadoEn?: Date | string | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

function calcularTiempoRelativo(fecha: Date | string): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const ahora = new Date();
  const diffSec = Math.max(0, Math.floor((ahora.getTime() - d.getTime()) / 1000));

  if (isNaN(diffSec)) return '';
  if (diffSec < 15) return 'Actualizado recién';
  if (diffSec < 60) return `Actualizado hace ${diffSec} s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Actualizado hace ${diffMin} min`;
  return `Actualizado a las ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
  etiquetas,
  onVolver,
  actualizadoEn,
  onRefresh,
  isRefreshing = false,
}) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!actualizadoEn) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, [actualizadoEn]);

  const textoActualizado = actualizadoEn ? calcularTiempoRelativo(actualizadoEn) : null;

  return (
    <header className="bg-surface border-b border-line px-4 py-3 shrink-0 space-y-2">
      {/* Fila 1: navegación/ícono + título flex-1 min-w-0 + acciones solo ícono (44 px) */}
      <div className="handed-header flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {onVolver && (
            <IconButton
              variant="ghost"
              onClick={onVolver}
              aria-label="Volver"
              className="w-11 h-11 min-w-[44px] min-h-[44px] shrink-0 -ml-1 text-ink"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </IconButton>
          )}

          {!onVolver && icon && (
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
              {icon}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-ink leading-tight line-clamp-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-ink-muted leading-snug line-clamp-2 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {(actions || onRefresh) && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}

            {onRefresh && (
              <IconButton
                variant="outline"
                onClick={onRefresh}
                isLoading={isRefreshing}
                aria-label={`Actualizar ${title}`}
                className="w-11 h-11 min-w-[44px] min-h-[44px]"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-accent' : 'text-ink'}`}
                  aria-hidden="true"
                />
              </IconButton>
            )}
          </div>
        )}
      </div>

      {/* Fila 2: etiquetas de estado y marca temporal a ancho completo */}
      {(etiquetas || textoActualizado) && (
        <div
          data-testid="page-header-etiquetas"
          className="flex flex-wrap items-center gap-2 w-full"
        >
          {etiquetas}
          {textoActualizado && (
            <span className="text-xs text-ink-faint font-medium leading-tight">
              {textoActualizado}
            </span>
          )}
        </div>
      )}
    </header>
  );
};
