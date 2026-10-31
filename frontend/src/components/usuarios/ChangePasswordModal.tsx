import React, { useState, useEffect, useRef } from 'react';
import { X, KeyRound, AlertCircle } from 'lucide-react';
import { cambiarContrasenaPropiaService } from '../../services/authService';
import {
  validarChangePasswordForm,
  ChangePasswordField,
  ChangePasswordFooter
} from './change-password';

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
    const nuevosErrores = validarChangePasswordForm(contrasenaActual, nuevaContrasena, confirmarContrasena);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-accent flex items-center justify-center border border-amber-200/50">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 id="change-password-title" className="text-xl font-sans font-bold text-ink">
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
            <AlertCircle className="w-4 h-4 text-danger shrink-0" />
            <span>{errorServidor}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <ChangePasswordField
            label="Contraseña actual"
            value={contrasenaActual}
            onChange={(val) => {
              setContrasenaActual(val);
              if (errores.contrasenaActual) setErrores({ ...errores, contrasenaActual: '' });
            }}
            mostrar={mostrarActual}
            onToggleMostrar={() => setMostrarActual(!mostrarActual)}
            error={errores.contrasenaActual}
            placeholder="Ingrese su clave actual"
            inputRef={contrasenaActualRef}
          />

          <ChangePasswordField
            label="Nueva contraseña"
            value={nuevaContrasena}
            onChange={(val) => {
              setNuevaContrasena(val);
              if (errores.nuevaContrasena) setErrores({ ...errores, nuevaContrasena: '' });
            }}
            mostrar={mostrarNueva}
            onToggleMostrar={() => setMostrarNueva(!mostrarNueva)}
            error={errores.nuevaContrasena}
            placeholder="Mínimo 8 caracteres"
          />

          <ChangePasswordField
            label="Confirmar nueva contraseña"
            value={confirmarContrasena}
            onChange={(val) => {
              setConfirmarContrasena(val);
              if (errores.confirmarContrasena) setErrores({ ...errores, confirmarContrasena: '' });
            }}
            mostrar={mostrarConfirmar}
            onToggleMostrar={() => setMostrarConfirmar(!mostrarConfirmar)}
            error={errores.confirmarContrasena}
            placeholder="Repita la nueva contraseña"
          />

          <ChangePasswordFooter
            guardando={guardando}
            onClose={onClose}
          />
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
