import React from 'react';
import { X } from 'lucide-react';

export interface UserFormHeaderProps {
  isEdit: boolean;
  usuarioNombre?: string;
  onClose: () => void;
}

export const UserFormHeader: React.FC<UserFormHeaderProps> = ({
  isEdit,
  usuarioNombre,
  onClose,
}) => {
  return (
    <div className="shrink-0 flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
      <div>
        <h2 id="modal-title" className="text-xl font-sans font-bold text-ink">
          {isEdit ? `Editar usuario - ${usuarioNombre}` : 'Nuevo usuario'}
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          {isEdit
            ? 'Modifique los datos, el rol o asigne una nueva contraseña (opcional).'
            : 'Complete los datos requeridos para habilitar el nuevo acceso.'}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar modal"
        className="modal-close-btn"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
