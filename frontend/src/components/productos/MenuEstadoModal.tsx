import React from 'react';
import { Power, PowerOff } from 'lucide-react';
import type { MenuCompletoItem } from '../../types/menuCompleto';

export interface MenuEstadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: MenuCompletoItem | null;
  guardando: boolean;
  onConfirm: () => void;
}

export const MenuEstadoModal: React.FC<MenuEstadoModalProps> = ({
  isOpen,
  onClose,
  menu,
  guardando,
  onConfirm,
}) => {
  if (!isOpen || !menu) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-surface rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200 text-center">
        <div
          className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${
            menu.activo ? 'bg-amber-50 text-accent' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {menu.activo ? <PowerOff className="w-6 h-6" /> : <Power className="w-6 h-6" />}
        </div>

        <h3 className="font-sans font-bold text-lg text-ink mb-2">
          {menu.activo ? '¿Desactivar menú completo?' : '¿Activar menú completo?'}
        </h3>

        <p className="text-xs text-neutral-600 leading-relaxed mb-6">
          {menu.activo
            ? `¿Desactivar el menú completo "${menu.nombre}"? No se podrá pedir hasta activarlo, pero se conservará su historial.`
            : `¿Activar nuevamente "${menu.nombre}" para que esté disponible en los pedidos de salón y para llevar?`}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={guardando}
            className={`px-4 py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm transition-all cursor-pointer ${
              menu.activo ? 'bg-primary hover:bg-primary-hover' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {guardando
              ? 'Guardando…'
              : menu.activo
              ? 'Sí, desactivar'
              : 'Sí, activar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuEstadoModal;
