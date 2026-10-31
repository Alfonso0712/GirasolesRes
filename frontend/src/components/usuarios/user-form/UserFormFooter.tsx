import React from 'react';

export interface UserFormFooterProps {
  onClose: () => void;
  guardando: boolean;
  isEdit: boolean;
}

export const UserFormFooter: React.FC<UserFormFooterProps> = ({
  onClose,
  guardando,
  isEdit,
}) => {
  return (
    <div className="shrink-0 flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 mt-4 bg-surface">
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
        ) : isEdit ? (
          'Guardar cambios'
        ) : (
          'Guardar'
        )}
      </button>
    </div>
  );
};
