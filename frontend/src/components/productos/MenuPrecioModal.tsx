import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { SolesIcon } from '../ui/SolesIcon';
import type { MenuCompletoItem } from '../../types/menuCompleto';

export interface MenuPrecioModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: MenuCompletoItem | null;
  nuevoPrecioStr: string;
  onPrecioChange: (val: string) => void;
  errorPrecio: string | null;
  guardando: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const MenuPrecioModal: React.FC<MenuPrecioModalProps> = ({
  isOpen,
  onClose,
  menu,
  nuevoPrecioStr,
  onPrecioChange,
  errorPrecio,
  guardando,
  onSubmit,
}) => {
  if (!isOpen || !menu) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-surface rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-accent flex items-center justify-center">
              <SolesIcon className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-base text-ink">
              Modificar Precio
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <p className="text-xs text-neutral-500 font-medium">Menú completo:</p>
            <p className="font-bold text-sm text-neutral-900">{menu.nombre}</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Precio anterior: S/ {menu.precio.toFixed(2)}
            </p>
          </div>

          <div>
            <label
              htmlFor="nuevo-precio-menu"
              className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
            >
              Nuevo Precio (S/) <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 font-semibold text-sm">
                S/
              </span>
              <input
                id="nuevo-precio-menu"
                type="text"
                inputMode="decimal"
                autoFocus
                value={nuevoPrecioStr}
                onChange={(e) => onPrecioChange(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-sans font-medium focus:border-accent focus:ring-2 focus:ring-amber-200 outline-none"
                disabled={guardando}
              />
            </div>
            {errorPrecio && (
              <p className="mt-1 text-xs text-danger font-medium">{errorPrecio}</p>
            )}
            <p className="mt-1 text-xs text-neutral-500">
              Mayor a S/ 0.00 y no superior a S/ 999.99.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-3.5 py-2 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando…</span>
                </>
              ) : (
                'Guardar precio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuPrecioModal;
