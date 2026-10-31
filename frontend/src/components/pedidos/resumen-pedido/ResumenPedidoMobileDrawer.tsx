import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '../../ui';
import type { LineaBorrador } from '../../../types/pedido';

export interface ResumenPedidoMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  lineasBorrador: LineaBorrador[];
  cantidadTotalProductos: number;
  totalFinal: number;
  modo: 'nuevo' | 'ampliacion';
  notas: string;
  onNotasChange?: (notas: string) => void;
  children: React.ReactNode;
}

export const ResumenPedidoMobileDrawer: React.FC<ResumenPedidoMobileDrawerProps> = ({
  isOpen,
  onClose,
  titulo,
  lineasBorrador,
  cantidadTotalProductos,
  totalFinal,
  modo,
  notas,
  onNotasChange,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 bg-fill-strong/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
      <div className="bg-surface rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-t border-neutral-200 dark:border-neutral-200/80">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-200/80 flex justify-between items-center bg-brand-tint border-t-4 border-t-primary">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <div>
              <h3 className="font-sans font-bold text-base text-ink">{titulo}</h3>
              <p className="text-xs text-ink-muted tabular-nums">
                {lineasBorrador.length} items · {cantidadTotalProductos} platos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar resumen"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 scroll-thin bg-surface">
          {children}
        </div>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-200/80 bg-canvas dark:bg-surface-warm/30 shrink-0 space-y-3">
          {modo === 'nuevo' && onNotasChange && (
            <div>
              <label
                htmlFor="notas-pedido-movil"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Notas generales del pedido (opcional):
              </label>
              <input
                id="notas-pedido-movil"
                type="text"
                maxLength={100}
                value={notas}
                onChange={(e) => onNotasChange(e.target.value)}
                placeholder="Ej: Servir todo junto, sin cubiertos..."
                className="w-full px-3 py-1.5 text-xs bg-surface border border-neutral-200 dark:border-neutral-200/80 rounded-lg text-ink placeholder:text-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
              />
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-neutral-200/80">
            <div>
              <span className="text-xs font-bold text-ink uppercase tracking-wide block">
                Total a Cobrar:
              </span>
              <span className="font-extrabold text-lg text-emerald-700 dark:text-emerald-400 tabular-nums">
                S/ {totalFinal.toFixed(2)}
              </span>
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={onClose}
              className="bg-sidebar hover:bg-[#341b0b] text-white text-xs px-5 py-2.5 min-h-[44px]"
            >
              Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
