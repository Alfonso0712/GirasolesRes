import React from 'react';

export interface UserCredentialsFieldsProps {
  isEdit: boolean;
  contrasena: string;
  onContrasenaChange: (val: string) => void;
  contrasenaInputRef: React.RefObject<HTMLInputElement | null>;
  confirmarContrasena: string;
  onConfirmarContrasenaChange: (val: string) => void;
  confirmarContrasenaInputRef: React.RefObject<HTMLInputElement | null>;
  mostrarContrasena: boolean;
  onToggleMostrarContrasena: () => void;
  mostrarConfirmar: boolean;
  onToggleMostrarConfirmar: () => void;
  errores: Record<string, string>;
}

export const UserCredentialsFields: React.FC<UserCredentialsFieldsProps> = ({
  isEdit,
  contrasena,
  onContrasenaChange,
  contrasenaInputRef,
  confirmarContrasena,
  onConfirmarContrasenaChange,
  confirmarContrasenaInputRef,
  mostrarContrasena,
  onToggleMostrarContrasena,
  mostrarConfirmar,
  onToggleMostrarConfirmar,
  errores,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-1">
      <div>
        <div className="flex items-center justify-between mb-1.5 min-h-[20px]">
          <label className="form-label-standard !mb-0">
            {isEdit ? 'Nueva contraseña' : 'Contraseña'}{' '}
            {isEdit ? (
              <span className="text-neutral-500 font-normal text-xs">(opcional)</span>
            ) : (
              <span className="text-rose-500">*</span>
            )}
          </label>
        </div>
        <div className="relative">
          <input
            ref={contrasenaInputRef}
            type={mostrarContrasena ? 'text' : 'password'}
            value={contrasena}
            maxLength={64}
            onChange={(e) => onContrasenaChange(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className={`w-full min-h-[44px] pl-3.5 pr-12 py-2.5 rounded-xl border text-sm text-ink focus:outline-none transition-colors ${
              errores.contrasena
                ? 'border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                : 'border-neutral-300 focus:border-accent focus:ring-2 focus:ring-amber-200'
            }`}
          />
          <button
            type="button"
            onClick={onToggleMostrarContrasena}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-accent hover:text-accent px-2 py-1 rounded transition-colors cursor-pointer"
          >
            {mostrarContrasena ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        {errores.contrasena && (
          <p className="text-xs text-danger mt-1 font-medium">{errores.contrasena}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5 min-h-[20px]">
          <label className="form-label-standard !mb-0">
            Confirmar contraseña{' '}
            {(!isEdit || contrasena) && <span className="text-rose-500">*</span>}
          </label>
        </div>
        <div className="relative">
          <input
            ref={confirmarContrasenaInputRef}
            type={mostrarConfirmar ? 'text' : 'password'}
            value={confirmarContrasena}
            maxLength={64}
            onChange={(e) => onConfirmarContrasenaChange(e.target.value)}
            placeholder="Repita la contraseña"
            disabled={isEdit && !contrasena}
            className={`w-full min-h-[44px] pl-3.5 pr-12 py-2.5 rounded-xl border text-sm text-ink focus:outline-none transition-colors ${
              errores.confirmarContrasena
                ? 'border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                : 'border-neutral-300 focus:border-accent focus:ring-2 focus:ring-amber-200'
            } ${isEdit && !contrasena ? 'bg-neutral-100 dark:bg-neutral-800/40 opacity-60 cursor-not-allowed' : ''}`}
          />
          <button
            type="button"
            onClick={onToggleMostrarConfirmar}
            disabled={isEdit && !contrasena}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-accent hover:text-accent px-2 py-1 rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {mostrarConfirmar ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        {errores.confirmarContrasena && (
          <p className="text-xs text-danger mt-1 font-medium">{errores.confirmarContrasena}</p>
        )}
      </div>
    </div>
  );
};
