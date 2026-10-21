import React, { useState, useEffect, useRef } from 'react';
import { X, KeyRound, AlertCircle } from 'lucide-react';
import { cambiarContrasenaPropiaService } from '../../services/authService';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSuccess: (nuevoToken: string, mensaje: string) => void;
  onForceLogoutDueToFailedAttempts: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  token,
  onSuccess,
  onForceLogoutDueToFailedAttempts
}) => {
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');

  // RV-29: Mostrar / ocultar contraseña independiente en cada campo
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const contrasenaActualRef = useRef<HTMLInputElement>(null);

  // Reiniciar estado y foco inicial en Contraseña actual (Sección 7)
  useEffect(() => {
    if (isOpen) {
      setContrasenaActual('');
      setNuevaContrasena('');
      setConfirmarContrasena('');
      setMostrarActual(false);
      setMostrarNueva(false);
      setMostrarConfirmar(false);
      setErrores({});
      setErrorServidor(null);
      setGuardando(false);

      setTimeout(() => {
        contrasenaActualRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Soporte para cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    // RV-23: Contraseña actual obligatoria
    if (!contrasenaActual) {
      nuevosErrores.contrasenaActual = 'Ingrese su contraseña actual.'; // MSG-44
    }

    // RV-24: Nueva contraseña obligatoria y entre 8 y 64 caracteres
    if (!nuevaContrasena) {
      nuevosErrores.nuevaContrasena = 'La contraseña debe tener entre 8 y 64 caracteres.'; // MSG-14
    } else if (nuevaContrasena.length < 8 || nuevaContrasena.length > 64) {
      nuevosErrores.nuevaContrasena = 'La contraseña debe tener entre 8 y 64 caracteres.'; // MSG-14
    } else if (contrasenaActual && nuevaContrasena === contrasenaActual) {
      // RV-26: Nueva distinta de la actual
      nuevosErrores.nuevaContrasena = 'La nueva contraseña debe ser distinta de la actual.'; // MSG-46
    }

    // RV-25: Confirmación igual a nueva contraseña
    if (!confirmarContrasena) {
      nuevosErrores.confirmarContrasena = 'Las contraseñas no coinciden.'; // MSG-15
    } else if (confirmarContrasena !== nuevaContrasena) {
      nuevosErrores.confirmarContrasena = 'Las contraseñas no coinciden.'; // MSG-15
    }

    setErrores(nuevosErrores);

    // RV-27: El foco va al primer campo con error
    if (nuevosErrores.contrasenaActual) {
      contrasenaActualRef.current?.focus();
      return false;
    }

    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorServidor(null);

    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      const res = await cambiarContrasenaPropiaService(
        contrasenaActual,
        nuevaContrasena,
        token
      );

      // Éxito: entrega nuevo token y actualiza sesión (RN-22)
      onSuccess(res.token, res.message);
      onClose();
    } catch (err: any) {
      // RN-17 / E-51: Cinco intentos consecutivos cierran la sesión (423 Locked)
      if (err.status === 423 || err.message?.includes('Por seguridad se cerró su sesión')) {
        onClose();
        onForceLogoutDueToFailedAttempts();
        return;
      }

      // RV-30: Contraseña actual incorrecta (MSG-45) - no borra los demás campos
      if (err.field === 'contrasenaActual' || err.message?.includes('contraseña actual no es correcta')) {
        setErrores((prev) => ({
          ...prev,
          contrasenaActual: 'La contraseña actual no es correcta. Revise lo escrito e intente nuevamente.' // MSG-45
        }));
        contrasenaActualRef.current?.focus();
      } else if (err.field === 'nuevaContrasena' || err.message?.includes('distinta de la actual')) {
        setErrores((prev) => ({
          ...prev,
          nuevaContrasena: 'La nueva contraseña debe ser distinta de la actual.' // MSG-46
        }));
      } else {
        setErrorServidor(err.message || 'No se pudo completar la operación. Intente nuevamente.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D35400] flex items-center justify-center border border-amber-200/50">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 id="change-password-title" className="text-xl font-sans font-bold text-[#2C1A0E]">
                Cambiar contraseña
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Actualice su clave de acceso personal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn" aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        {errorServidor && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorServidor}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contraseña actual */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Contraseña actual <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={contrasenaActualRef}
                type={mostrarActual ? 'text' : 'password'}
                value={contrasenaActual}
                onChange={(e) => {
                  setContrasenaActual(e.target.value);
                  if (errores.contrasenaActual) setErrores({ ...errores, contrasenaActual: '' });
                }}
                placeholder="Ingrese su clave actual"
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-sm text-neutral-800 focus:outline-none transition-colors ${
                  errores.contrasenaActual
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-neutral-300 focus:border-[#D35400] focus:ring-2 focus:ring-amber-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setMostrarActual(!mostrarActual)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D35400] hover:text-[#B84600] px-2 py-1 rounded transition-colors cursor-pointer"
              >
                {mostrarActual ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {errores.contrasenaActual && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errores.contrasenaActual}</p>
            )}
          </div>

          {/* Nueva contraseña */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Nueva contraseña <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={mostrarNueva ? 'text' : 'password'}
                value={nuevaContrasena}
                onChange={(e) => {
                  setNuevaContrasena(e.target.value);
                  if (errores.nuevaContrasena) setErrores({ ...errores, nuevaContrasena: '' });
                }}
                placeholder="Mínimo 8 caracteres"
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-sm text-neutral-800 focus:outline-none transition-colors ${
                  errores.nuevaContrasena
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-neutral-300 focus:border-[#D35400] focus:ring-2 focus:ring-amber-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setMostrarNueva(!mostrarNueva)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D35400] hover:text-[#B84600] px-2 py-1 rounded transition-colors cursor-pointer"
              >
                {mostrarNueva ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {errores.nuevaContrasena && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errores.nuevaContrasena}</p>
            )}
          </div>

          {/* Confirmar nueva contraseña */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Confirmar nueva contraseña <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={mostrarConfirmar ? 'text' : 'password'}
                value={confirmarContrasena}
                onChange={(e) => {
                  setConfirmarContrasena(e.target.value);
                  if (errores.confirmarContrasena) setErrores({ ...errores, confirmarContrasena: '' });
                }}
                placeholder="Repita la nueva contraseña"
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-sm text-neutral-800 focus:outline-none transition-colors ${
                  errores.confirmarContrasena
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-neutral-300 focus:border-[#D35400] focus:ring-2 focus:ring-amber-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D35400] hover:text-[#B84600] px-2 py-1 rounded transition-colors cursor-pointer"
              >
                {mostrarConfirmar ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {errores.confirmarContrasena && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errores.confirmarContrasena}</p>
            )}
          </div>

          {/* Action buttons */}
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
              className={`px-6 py-2.5 rounded-xl bg-[#C74E00] hover:bg-[#B84600] text-white text-sm font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer ${
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
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;

