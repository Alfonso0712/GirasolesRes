import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import type { UsuarioItem, CrearUsuarioData, ActualizarUsuarioData, RolUsuario } from '../../types/usuario';
import {
  UserFormHeader,
  UserGeneralFields,
  UserCredentialsFields,
  UserFormFooter,
  validarUsuarioForm,
} from './user-form';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioAEditar?: UsuarioItem | null;
  onSave: (data: CrearUsuarioData | ActualizarUsuarioData, isEdit: boolean) => Promise<void>;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  usuarioAEditar,
  onSave
}) => {
  const isEdit = !!usuarioAEditar;

  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState<RolUsuario>('Mozo');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const nombreInputRef = useRef<HTMLInputElement>(null);
  const usuarioInputRef = useRef<HTMLInputElement>(null);
  const rolSelectRef = useRef<HTMLSelectElement>(null);
  const correoInputRef = useRef<HTMLInputElement>(null);
  const contrasenaInputRef = useRef<HTMLInputElement>(null);
  const confirmarContrasenaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (usuarioAEditar) {
        setNombre(usuarioAEditar.nombre);
        setUsuario(usuarioAEditar.usuario);
        setCorreo(usuarioAEditar.correo || '');
        setRol(usuarioAEditar.rol);
        setContrasena('');
        setConfirmarContrasena('');
      } else {
        setNombre('');
        setUsuario('');
        setCorreo('');
        setRol('Mozo');
        setContrasena('');
        setConfirmarContrasena('');
      }
      setErrores({});
      setErrorServidor(null);
      setGuardando(false);

      // RV-18: Auto-focus en el primer campo
      setTimeout(() => {
        nombreInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, usuarioAEditar]);

  // Soporte para cerrar con tecla Escape (RV-20) y Trampa de Foco Accesible (RNF-07 / Shneiderman 2)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Atrapado de foco cíclico dentro del modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusableElements = Array.from(focusables).filter(
          (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validarFormulario = (): boolean => {
    const nuevosErrores = validarUsuarioForm({
      nombre,
      usuario,
      correo,
      rol,
      contrasena,
      confirmarContrasena,
      isEdit,
    });

    setErrores(nuevosErrores);

    // RV-18 / Shneiderman 5: Foco programático en el primer campo con error
    if (Object.keys(nuevosErrores).length > 0) {
      if (nuevosErrores.nombre) {
        nombreInputRef.current?.focus();
      } else if (nuevosErrores.usuario) {
        usuarioInputRef.current?.focus();
      } else if (nuevosErrores.rol) {
        rolSelectRef.current?.focus();
      } else if (nuevosErrores.correo) {
        correoInputRef.current?.focus();
      } else if (nuevosErrores.contrasena) {
        contrasenaInputRef.current?.focus();
      } else if (nuevosErrores.confirmarContrasena) {
        confirmarContrasenaInputRef.current?.focus();
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorServidor(null);

    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      if (isEdit) {
        const payload: ActualizarUsuarioData = {
          nombre: nombre.trim(),
          usuario: usuario.trim().toLowerCase(),
          correo: correo.trim() ? correo.trim().toLowerCase() : undefined,
          rol,
          contrasena: contrasena ? contrasena : undefined
        };
        await onSave(payload, true);
      } else {
        const payload: CrearUsuarioData = {
          nombre: nombre.trim(),
          usuario: usuario.trim().toLowerCase(),
          correo: correo.trim() ? correo.trim().toLowerCase() : undefined,
          contrasena,
          rol
        };
        await onSave(payload, false);
      }
      onClose();
    } catch (err: unknown) {
      const errorObj = err as Error;
      if (errorObj?.message) {
        if (errorObj.message.includes('usuario ya está registrado')) {
          setErrores(prev => ({ ...prev, usuario: errorObj.message }));
          usuarioInputRef.current?.focus();
        } else if (errorObj.message.includes('correo ya está asignado')) {
          setErrores(prev => ({ ...prev, correo: errorObj.message }));
          correoInputRef.current?.focus();
        } else {
          setErrorServidor(errorObj.message);
        }
      } else {
        setErrorServidor('No se pudo completar la operación. Intente nuevamente.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-surface rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 relative max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden"
      >
        {/* Header (shrink-0) */}
        <UserFormHeader
          isEdit={isEdit}
          usuarioNombre={usuarioAEditar?.nombre}
          onClose={onClose}
        />

        {/* Global Error Banner (shrink-0) */}
        {errorServidor && (
          <div className="shrink-0 mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-danger shrink-0" />
            <span>{errorServidor}</span>
          </div>
        )}

        {/* Form (flex-1 flex flex-col min-h-0) */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Fields Container */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-1.5 space-y-4 scroll-thin">
            <UserGeneralFields
              nombre={nombre}
              onNombreChange={(val) => {
                setNombre(val);
                if (errores.nombre) setErrores({ ...errores, nombre: '' });
              }}
              nombreInputRef={nombreInputRef}
              usuario={usuario}
              onUsuarioChange={(val) => {
                setUsuario(val);
                if (errores.usuario) setErrores({ ...errores, usuario: '' });
              }}
              usuarioInputRef={usuarioInputRef}
              rol={rol}
              onRolChange={(val) => {
                setRol(val);
                if (errores.rol) setErrores({ ...errores, rol: '' });
              }}
              rolSelectRef={rolSelectRef}
              correo={correo}
              onCorreoChange={(val) => {
                setCorreo(val);
                if (errores.correo) setErrores({ ...errores, correo: '' });
              }}
              correoInputRef={correoInputRef}
              errores={errores}
            />

            <UserCredentialsFields
              isEdit={isEdit}
              contrasena={contrasena}
              onContrasenaChange={(val) => {
                setContrasena(val);
                if (errores.contrasena) setErrores({ ...errores, contrasena: '' });
              }}
              contrasenaInputRef={contrasenaInputRef}
              confirmarContrasena={confirmarContrasena}
              onConfirmarContrasenaChange={(val) => {
                setConfirmarContrasena(val);
                if (errores.confirmarContrasena) setErrores({ ...errores, confirmarContrasena: '' });
              }}
              confirmarContrasenaInputRef={confirmarContrasenaInputRef}
              mostrarContrasena={mostrarContrasena}
              onToggleMostrarContrasena={() => setMostrarContrasena(!mostrarContrasena)}
              mostrarConfirmar={mostrarConfirmar}
              onToggleMostrarConfirmar={() => setMostrarConfirmar(!mostrarConfirmar)}
              errores={errores}
            />
          </div>

          {/* Action buttons (Sticky at bottom of modal) */}
          <UserFormFooter
            onClose={onClose}
            guardando={guardando}
            isEdit={isEdit}
          />
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;

