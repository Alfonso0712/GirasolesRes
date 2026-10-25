import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle  } from 'lucide-react';
import type { UsuarioItem, CrearUsuarioData, ActualizarUsuarioData, RolUsuario } from '../../types/usuario';

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
    const nuevosErrores: Record<string, string> = {};
    const nombreTrim = nombre.trim();
    const usuarioTrim = usuario.trim();
    const correoTrim = correo.trim();

    // RV-11: Nombre completo
    if (!nombreTrim) {
      nuevosErrores.nombre = 'Ingrese el nombre completo.'; // MSG-19
    } else if (nombreTrim.length < 3 || nombreTrim.length > 60 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(nombreTrim)) {
      nuevosErrores.nombre = 'El nombre debe tener entre 3 y 60 letras y espacios.'; // MSG-20
    }

    // RV-12: Usuario
    if (!usuarioTrim) {
      nuevosErrores.usuario = 'Ingrese su usuario.'; // MSG-01
    } else if (usuarioTrim.length < 3 || usuarioTrim.length > 30 || !/^[a-zA-Z0-9._-]+$/.test(usuarioTrim)) {
      nuevosErrores.usuario = 'El usuario debe tener entre 3 y 30 caracteres, sin espacios.'; // MSG-03
    }

    // RV-15: Rol
    if (!rol) {
      nuevosErrores.rol = 'Seleccione un rol.'; // MSG-22
    }

    // RV-16: Correo obligatorio para Administrador y máx 100 caracteres
    if (rol === 'Administrador' && !correoTrim) {
      nuevosErrores.correo = 'El correo es obligatorio para el administrador.'; // MSG-23
    } else if (correoTrim && correoTrim.length > 100) {
      nuevosErrores.correo = 'El correo no puede tener más de 100 caracteres.';
    } else if (correoTrim && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correoTrim)) {
      nuevosErrores.correo = 'Ingrese un correo válido, por ejemplo: nombre@dominio.com.'; // MSG-12
    }

    // RV-13 y RV-14: Contraseña y confirmación
    if (!isEdit) {
      if (!contrasena) {
        nuevosErrores.contrasena = 'La contraseña debe tener entre 8 y 64 caracteres.'; // MSG-14
      } else if (contrasena.length < 8 || contrasena.length > 64) {
        nuevosErrores.contrasena = 'La contraseña debe tener entre 8 y 64 caracteres.'; // MSG-14
      } else if (contrasena !== confirmarContrasena) {
        nuevosErrores.confirmarContrasena = 'Las contraseñas no coinciden.'; // MSG-15
      }
    } else {
      if (contrasena) {
        if (contrasena.length < 8 || contrasena.length > 64) {
          nuevosErrores.contrasena = 'La contraseña debe tener entre 8 y 64 caracteres.'; // MSG-14
        } else if (contrasena !== confirmarContrasena) {
          nuevosErrores.confirmarContrasena = 'Las contraseñas no coinciden.'; // MSG-15
        }
      }
    }

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
    } catch (err: any) {
      if (err.message) {
        if (err.message.includes('usuario ya está registrado')) {
          setErrores(prev => ({ ...prev, usuario: err.message }));
          usuarioInputRef.current?.focus();
        } else if (err.message.includes('correo ya está asignado')) {
          setErrores(prev => ({ ...prev, correo: err.message }));
          correoInputRef.current?.focus();
        } else {
          setErrorServidor(err.message);
        }
      } else {
        setErrorServidor('No se pudo completar la operación. Intente nuevamente.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-surface rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 relative max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden"
      >
        {/* Header (shrink-0) */}
        <div className="shrink-0 flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
          <div>
            <h2 id="modal-title" className="text-xl font-sans font-bold text-ink">
              {isEdit ? `Editar usuario - ${usuarioAEditar?.nombre}` : 'Nuevo usuario'}
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

        {/* Global Error Banner (shrink-0) */}
        {errorServidor && (
          <div className="shrink-0 mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorServidor}</span>
          </div>
        )}

        {/* Form (flex-1 flex flex-col min-h-0) */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Fields Container */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-1.5 space-y-4 scroll-thin">
            {/* Nombre Completo */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-ink">
                  Nombre completo <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-neutral-500 tabular-nums">
                  {nombre.length}/60
                </span>
              </div>
            <input
              ref={nombreInputRef}
              type="text"
              value={nombre}
              maxLength={60}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errores.nombre) setErrores({ ...errores, nombre: '' });
              }}
              onBlur={() => setNombre(nombre.trim())}
              placeholder="Ej. Ana Torres"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-neutral-800 focus:outline-none transition-colors ${
                errores.nombre
                  ? 'border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-neutral-300 focus:border-accent focus:ring-2 focus:ring-amber-200'
              }`}
            />
            {errores.nombre && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errores.nombre}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Usuario */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-ink">
                  Nombre de usuario <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-neutral-500 tabular-nums">
                  {usuario.length}/30
                </span>
              </div>
              <input
                ref={usuarioInputRef}
                type="text"
                value={usuario}
                maxLength={30}
                onChange={(e) => {
                  setUsuario(e.target.value);
                  if (errores.usuario) setErrores({ ...errores, usuario: '' });
                }}
                onBlur={() => setUsuario(usuario.trim().toLowerCase())}
                placeholder="atorres"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-neutral-800 focus:outline-none transition-colors ${
                  errores.usuario
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-neutral-300 focus:border-accent focus:ring-2 focus:ring-amber-200'
                }`}
              />
              {errores.usuario && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errores.usuario}</p>
              )}
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Rol en el restaurante <span className="text-rose-500">*</span>
              </label>
              <select
                ref={rolSelectRef}
                value={rol}
                onChange={(e) => {
                  setRol(e.target.value as RolUsuario);
                  if (errores.rol) setErrores({ ...errores, rol: '' });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-neutral-800 focus:outline-none transition-colors bg-surface ${
                  errores.rol
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-neutral-300 focus:border-accent focus:ring-2 focus:ring-amber-200'
                }`}
              >
                <option value="Administrador">Administrador</option>
                <option value="Cajero">Cajero</option>
                <option value="Mozo">Mozo</option>
                <option value="Cocinero">Cocinero</option>
              </select>
              {errores.rol && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errores.rol}</p>
              )}
            </div>
          </div>

          {/* Correo electrónico */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Correo electrónico{' '}
              {rol === 'Administrador' ? (
                <span className="text-rose-500">* (obligatorio para Administrador)</span>
              ) : (
                <span className="text-neutral-500 font-normal">(opcional)</span>
              )}
            </label>
            <input
              ref={correoInputRef}
              type="email"
              value={correo}
              maxLength={100}
              onChange={(e) => {
                setCorreo(e.target.value);
                if (errores.correo) setErrores({ ...errores, correo: '' });
              }}
              onBlur={() => setCorreo(correo.trim().toLowerCase())}
              placeholder="ana.torres@girasoles.com"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-neutral-800 focus:outline-none transition-colors ${
                errores.correo
                  ? 'border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-neutral-300 focus:border-accent focus:ring-2 focus:ring-amber-200'
              }`}
            />
            {errores.correo && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errores.correo}</p>
            )}
          </div>

          {/* Contraseña y Confirmar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {isEdit ? 'Nueva contraseña' : 'Contraseña'}{' '}
                {isEdit ? (
                  <span className="text-neutral-500 font-normal">(dejar vacía para no cambiar)</span>
                ) : (
                  <span className="text-rose-500">*</span>
                )}
              </label>
              <div className="relative">
                <input
                  ref={contrasenaInputRef}
                  type={mostrarContrasena ? 'text' : 'password'}
                  value={contrasena}
                  maxLength={64}
                  onChange={(e) => {
                    setContrasena(e.target.value);
                    if (errores.contrasena) setErrores({ ...errores, contrasena: '' });
                  }}
                  placeholder="Mínimo 8 caracteres"
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-sm text-neutral-800 focus:outline-none transition-colors ${
                    errores.contrasena
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-neutral-300 focus:border-accent focus:ring-2 focus:ring-amber-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-accent hover:text-accent px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  {mostrarContrasena ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {errores.contrasena && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errores.contrasena}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Confirmar contraseña{' '}
                {(!isEdit || contrasena) && <span className="text-rose-500">*</span>}
              </label>
              <div className="relative">
                <input
                  ref={confirmarContrasenaInputRef}
                  type={mostrarConfirmar ? 'text' : 'password'}
                  value={confirmarContrasena}
                  maxLength={64}
                  onChange={(e) => {
                    setConfirmarContrasena(e.target.value);
                    if (errores.confirmarContrasena) setErrores({ ...errores, confirmarContrasena: '' });
                  }}
                  placeholder="Repita la contraseña"
                  disabled={isEdit && !contrasena}
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-sm text-neutral-800 focus:outline-none transition-colors ${
                    errores.confirmarContrasena
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-neutral-300 focus:border-accent focus:ring-2 focus:ring-amber-200'
                  } ${isEdit && !contrasena ? 'bg-neutral-100 cursor-not-allowed' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  disabled={isEdit && !contrasena}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-accent hover:text-accent px-2 py-1 rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {mostrarConfirmar ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {errores.confirmarContrasena && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errores.confirmarContrasena}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons (Sticky at bottom of modal) */}
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
      </form>
      </div>
    </div>
  );
};

export default UserFormModal;

