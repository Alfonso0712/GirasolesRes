import React from 'react';
import { Check } from 'lucide-react';

interface PedidosToastProps {
  mensaje: string | null;
  onClose: () => void;
}

export const PedidosToast: React.FC<PedidosToastProps> = ({ mensaje, onClose }) => {
  if (!mensaje) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-in slide-in-from-bottom-4 fade-in duration-200"
    >
      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
        <Check className="w-4 h-4 stroke-[3]" />
      </div>
      <span className="text-xs font-semibold tracking-wide">{mensaje}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-3 text-neutral-500 hover:text-white text-base leading-none p-1 cursor-pointer"
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
};
