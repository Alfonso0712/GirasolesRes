import React, { useState } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { perfilService } from '../../services/perfilService';
import { BottomSheet } from '../ui/BottomSheet';
import { SheetActions } from '../ui/SheetActions';
import { useHaptics } from '../../hooks/useHaptics';
import { useToast } from '../../context/ToastContext';

export interface CambiarContrasenaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onContrasenaCambiada?: () => void;
  onForzarLogout?: () => void;
}

export const CambiarContrasenaSheet: React.FC<CambiarContrasenaSheetProps> = ({
  isOpen,
  onClose,
  onContrasenaCambiada,
  onForzarLogout,
}) => {
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');

  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();
  const { mostrar } = useToast();

  if (!isOpen) return null;

  const resetCampos = () => {
    setContrasenaActual('');
    setNuevaContrasena('');
    setConfirmarContrasena('');
    setError(null);
  };

  const handleCerrar = () => {
    resetCampos();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validaciones locales de formato
    if (!contrasenaActual.trim()) {
      triggerError();
      setError('Ingrese su contraseña actual.');
      return;
    }

    if (nuevaContrasena.length < 8 || nuevaContrasena.length > 64) {
      triggerError();
      setError('La nueva contraseña debe tener entre 8 y 64 caracteres.');
      return;
    }

    if (nuevaContrasena === contrasenaActual) {
      triggerError();
      setError('La nueva contraseña debe ser diferente a la contraseña actual.');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      triggerError();
      setError('La confirmación de la contraseña no coincide.');
      return;
    }

    setProcesando(true);
    triggerLight();

    try {
      const res = await perfilService.cambiarContrasena({
        contrasenaActual: contrasenaActual.trim(),
        nuevaContrasena: nuevaContrasena.trim(),
        confirmarContrasena: confirmarContrasena.trim(),
      });

      triggerSuccess();
      mostrar({
        tipo: 'exito',
        mensaje: res.message || 'Contraseña actualizada exitosamente.',
      });
      resetCampos();
      onClose();
      onContrasenaCambiada?.();
    } catch (err: unknown) {
      triggerError();
      let errorMsg = 'Error al actualizar la contraseña.';

      if (err && typeof err === 'object') {
        const anyErr = err as { status?: number; mensaje?: string; message?: string };
        if (anyErr.status === 423) {
          mostrar({
            tipo: 'error',
            mensaje: anyErr.mensaje || anyErr.message || 'Demasiados intentos fallidos. Su sesión ha sido bloqueada.',
          });
          resetCampos();
          onClose();
          onForzarLogout?.();
          return;
        }
        errorMsg = anyErr.mensaje || anyErr.message || errorMsg;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleCerrar} title="Cambiar Contraseña">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-bg border border-danger/30 rounded-xl flex items-start gap-2.5 text-xs text-danger">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Contraseña Actual */}
        <div>
          <label htmlFor="pass-actual" className="text-xs font-bold text-ink block mb-1">
            Contraseña Actual *
          </label>
          <div className="relative">
            <input
              id="pass-actual"
              type={mostrarActual ? 'text' : 'password'}
              value={contrasenaActual}
              onChange={(e) => setContrasenaActual(e.target.value)}
              placeholder="Ingrese su clave actual"
              className="w-full bg-canvas border border-line rounded-xl px-3 py-2 pr-10 text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-primary min-h-[44px]"
            />
            <button
              type="button"
              onClick={() => setMostrarActual(!mostrarActual)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-ink-muted hover:text-ink min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              aria-label={mostrarActual ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {mostrarActual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Nueva Contraseña */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="pass-nueva" className="text-xs font-bold text-ink">
              Nueva Contraseña (8-64 caracteres) *
            </label>
            <span className="text-xs text-ink-muted">{nuevaContrasena.length}/64</span>
          </div>
          <div className="relative">
            <input
              id="pass-nueva"
              type={mostrarNueva ? 'text' : 'password'}
              maxLength={64}
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full bg-canvas border border-line rounded-xl px-3 py-2 pr-10 text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-primary min-h-[44px]"
            />
            <button
              type="button"
              onClick={() => setMostrarNueva(!mostrarNueva)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-ink-muted hover:text-ink min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              aria-label={mostrarNueva ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {mostrarNueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirmar Nueva Contraseña */}
        <div>
          <label htmlFor="pass-confirmar" className="text-xs font-bold text-ink block mb-1">
            Confirmar Nueva Contraseña *
          </label>
          <div className="relative">
            <input
              id="pass-confirmar"
              type={mostrarConfirmar ? 'text' : 'password'}
              maxLength={64}
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              placeholder="Repita la nueva clave"
              className="w-full bg-canvas border border-line rounded-xl px-3 py-2 pr-10 text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-primary min-h-[44px]"
            />
            <button
              type="button"
              onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-ink-muted hover:text-ink min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              aria-label={mostrarConfirmar ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {mostrarConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <SheetActions
          secondaryLabel="Cancelar"
          primaryLabel="Guardar"
          primaryType="submit"
          primaryVariant="primary"
          isLoading={procesando}
          primaryDisabled={!contrasenaActual || !nuevaContrasena || !confirmarContrasena}
          primaryIcon={<KeyRound className="w-4 h-4" />}
          onSecondary={handleCerrar}
        />
      </form>
    </BottomSheet>
  );
};