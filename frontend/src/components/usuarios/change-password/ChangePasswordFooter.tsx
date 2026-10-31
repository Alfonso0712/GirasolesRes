import React from 'react';

export interface ChangePasswordFooterProps {
  guardando: boolean;
  onClose: () => void;
}

export const ChangePasswordFooter: React.FC<ChangePasswordFooterProps> = ({
  guardando,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-end gap-3 pt-5 border-t border-neutral-100 mt-6">
      <button
        type="button"
        onClick={onClose}
        disabled={guardando}
        className="px-5 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={guardando}
        className={`px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer ${
          guardando ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {guardando ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Guardando…</span>
          </>
        ) : (
          'Guardar'
        )}
      </button>
    </div>
  );
};
