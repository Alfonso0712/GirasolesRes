import React, { useState, useRef, useEffect } from 'react';
import { Lock, User } from 'lucide-react';
import { InputField, Button, FormMessage } from '../components/ui';
import { AuthLayout } from '../layouts/AuthLayout';
import { loginService } from '../services/authService';
import { normalizeText } from '../utils/normalizeText';
import type { UserSession } from '../types/auth';

interface LoginPageProps {
  onSuccess: (session: UserSession) => void;
  onForgotPasswordClick: () => void;
  initialBanner?: { type: 'success' | 'error' | 'info' | 'warning'; message: string } | null;
  onBackToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onForgotPasswordClick,
  initialBanner,
  onBackToLanding,
}) => {
  const [formData, setFormData] = useState({
    usuario: '',
    contrasena: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState(initialBanner?.message || '');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | 'warning' | ''>(
    initialBanner?.type || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [capsLockActivo, setCapsLockActivo] = useState(false);

  const usuarioRef = useRef<HTMLInputElement>(null);
  const contrasenaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usuarioRef.current?.focus();
  }, []);

  useEffect(() => {
    if (initialBanner) {
      setMessage(initialBanner.message);
      setMessageType(initialBanner.type);
    }
  }, [initialBanner]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBlurUsuario = () => {
    const normalized = normalizeText(formData.usuario);
    setFormData((prev) => ({ ...prev, usuario: normalized }));
    validateField('usuario', normalized);
  };

  const validateField = (field: string, val: string): boolean => {
    const newErrors = { ...errors };

    if (field === 'usuario') {
      if (!val) {
        newErrors.usuario = 'Campo obligatorio';
      } else if (!/^[a-zA-Z0-9._-]{3,30}$/.test(val)) {
        newErrors.usuario = 'El usuario debe tener entre 3 y 30 caracteres, sin espacios.';
      } else {
        delete newErrors.usuario;
      }
    }

    if (field === 'contrasena') {
      if (!val) {
        newErrors.contrasena = 'Campo obligatorio';
      } else {
        delete newErrors.contrasena;
      }
    }

    setErrors(newErrors);
    return !newErrors[field as keyof typeof newErrors];
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const usuarioLimpio = normalizeText(formData.usuario);

    if (!usuarioLimpio) {
      newErrors.usuario = 'Campo obligatorio';
    } else if (!/^[a-zA-Z0-9._-]{3,30}$/.test(usuarioLimpio)) {
      newErrors.usuario = 'El usuario debe tener entre 3 y 30 caracteres, sin espacios.';
    }

    if (!formData.contrasena) {
      newErrors.contrasena = 'Campo obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    const usuarioLimpio = normalizeText(formData.usuario);
    setFormData((prev) => ({ ...prev, usuario: usuarioLimpio }));

    if (!validateForm()) {
      if (!usuarioLimpio) {
        usuarioRef.current?.focus();
      } else {
        contrasenaRef.current?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await loginService(usuarioLimpio, formData.contrasena);

      setMessage('Ingreso correcto. Redirigiendo…');
      setMessageType('success');

      setTimeout(() => {
        onSuccess(session);
      }, 700);
    } catch (err: any) {
      setFormData((prev) => ({ ...prev, contrasena: '' }));
      contrasenaRef.current?.focus();

      setMessageType('error');
      setMessage(err.message || 'Usuario o contraseña incorrectos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDownContrasena = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockActivo(e.getModifierState('CapsLock'));
  };

  const cargarDemo = (user: string, pass: string) => {
    setFormData({ usuario: user, contrasena: pass });
    setErrors({});
    setMessage('');
    setMessageType('');
  };

  return (
    <AuthLayout onLogoClick={onBackToLanding}>
      {/* Posición reservada para alinear exactamente con el enlace Volver de ForgotPasswordPage */}
      <div className="h-[clamp(0.5rem,1.5vh,1.5rem)] mb-[clamp(0.25rem,1vh,0.75rem)] pointer-events-none" aria-hidden="true" />

      {/* Encabezado del Formulario */}
      <div className="mb-[clamp(0.5rem,1.5vh,1rem)] text-left">
        <span className="text-accent text-xs font-bold tracking-widest uppercase block mb-1">
          BIENVENIDO
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-1">
          Iniciar sesión
        </h2>
        <p className="text-ink-muted text-xs sm:text-sm">
          Ingrese su usuario y contraseña para acceder al sistema.
        </p>
      </div>

      {/* Slot reservado para mensajes para prevenir layout shift (salto de scroll vertical) */}
      <div className="min-h-[clamp(2rem,3.5vh,2.75rem)] mb-[clamp(0.25rem,1vh,0.5rem)] flex items-center">
        {message ? (
          <FormMessage type={messageType} message={message} className="p-2 w-full rounded-xl" />
        ) : (
          <div className="w-full h-full opacity-0 pointer-events-none select-none" aria-hidden="true" />
        )}
      </div>

      {/* Formulario Principal */}
      <form onSubmit={handleSubmit} noValidate className="space-y-[clamp(0.25rem,0.8vh,0.5rem)]">
        {/* Input Usuario */}
        <InputField
          id="usuario"
          ref={usuarioRef}
          name="usuario"
          label="Usuario"
          value={formData.usuario}
          onChange={handleChange}
          onBlur={handleBlurUsuario}
          disabled={isSubmitting}
          placeholder="Ingrese su usuario"
          required
          error={errors.usuario}
          leftIcon={<User className="w-4 h-4" />}
        />

        {/* Input Contraseña */}
        <InputField
          id="contrasena"
          ref={contrasenaRef}
          name="contrasena"
          label="Contraseña"
          type={mostrarContrasena ? 'text' : 'password'}
          value={formData.contrasena}
          onChange={handleChange}
          onKeyDown={handleKeyDownContrasena}
          onKeyUp={handleKeyDownContrasena}
          disabled={isSubmitting}
          placeholder="Ingrese su contraseña"
          required
          error={errors.contrasena}
          leftIcon={<Lock className="w-4 h-4" />}
          rightElement={
            <button
              type="button"
              tabIndex={0}
              onClick={() => setMostrarContrasena(!mostrarContrasena)}
              className="text-xs font-bold text-accent hover:text-accent px-2 py-1 rounded transition-colors cursor-pointer"
            >
              {mostrarContrasena ? 'Ocultar' : 'Mostrar'}
            </button>
          }
        />

        {capsLockActivo && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl font-medium">
            Mayúsculas activadas.
          </p>
        )}

        {/* Botón INGRESAR (Altura mínima 48px para ergonomía táctil) */}
        <div className="pt-1">
          <Button
            type="submit"
            isSubmitting={isSubmitting}
            variant="primary"
            size="lg"
            className="h-12 min-h-[48px] text-sm font-bold tracking-wider uppercase rounded-xl w-full"
          >
            INGRESAR
          </Button>
        </div>

        {/* Enlace Recuperar Contraseña */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-accent text-xs sm:text-sm font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-accent rounded py-1 px-2 cursor-pointer"
          >
            ¿Olvidó su contraseña?
          </button>
        </div>
      </form>

      {/* Tarjeta de Acceso de Demostración Limpia */}
      <div className="mt-[clamp(0.5rem,1.5vh,1rem)] border border-dashed border-demo-border rounded-2xl p-[clamp(0.5rem,1.2vh,0.75rem)] bg-neutral-50/70 text-left">
          <p className="font-bold text-xs text-ink">Acceso de demostración</p>
          <p className="text-xs text-ink-muted mt-0.5 mb-1.5">Seleccione un perfil para probar el acceso rápido</p>

          <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-demo-divider">
            <button
              type="button"
              onClick={() => cargarDemo('admin', 'Password123!')}
              className="px-2.5 py-1 bg-chip-accent-bg hover:bg-chip-accent-hover text-accent border border-chip-accent-border rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Administrador
            </button>
            <button
              type="button"
              onClick={() => cargarDemo('atorres', 'Password123!')}
              className="px-2.5 py-1 bg-surface hover:bg-neutral-100 text-ink border border-line rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Cajero
            </button>
            <button
              type="button"
              onClick={() => cargarDemo('lperez', 'Password123!')}
              className="px-2.5 py-1 bg-surface hover:bg-neutral-100 text-ink border border-line rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Mozo
            </button>
            <button
              type="button"
              onClick={() => cargarDemo('msoto', 'Password123!')}
              className="px-2.5 py-1 bg-surface hover:bg-neutral-100 text-ink border border-line rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Cocinero
            </button>
            <button
              type="button"
              onClick={() => cargarDemo('crojas', 'Password123!')}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title="Cuenta de demostración inactiva"
            >
              Inactivo
            </button>
          </div>
        </div>


    </AuthLayout>
  );
};

export default LoginPage;
