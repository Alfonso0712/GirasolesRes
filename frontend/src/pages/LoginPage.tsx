import React, { useState, useRef, useEffect } from 'react';
import { Lock, User } from 'lucide-react';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { FormMessage } from '../components/FormMessage';
import { loginService } from '../services/authService';
import { normalizeText } from '../utils/normalizeText';
import { AuthLayout } from '../layouts/AuthLayout';
import type { UserSession } from '../types/auth';

interface LoginPageProps {
  onSuccess: (session: UserSession) => void;
  onForgotPasswordClick: () => void;
  initialBanner?: { type: 'success' | 'error' | 'info' | 'warning'; message: string } | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onForgotPasswordClick,
  initialBanner
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
        newErrors.usuario = 'Campo obligatorio'; // Como en Vega.png
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
      // Mostrar mensaje del catálogo o genérico de credenciales
      setMessage(err.message || 'USUARIO O CONTRASEÑA INCORRECTOS');
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
    <AuthLayout>
      {/* Encabezado del Formulario */}
      <div className="mb-3 sm:mb-4 text-left">
            <p className="text-[#D35400] text-xs font-bold tracking-widest uppercase mb-1">
              BIENVENIDO
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2C1A0E] font-brand-serif tracking-tight mb-1 sm:mb-1.5">
              Iniciar sesión
            </h2>
            <p className="text-[#7C6F66] text-xs sm:text-sm">
              Ingrese su usuario y contraseña para acceder al sistema.
            </p>
          </div>

          {/* Banner de error / éxito (Vega 1.png) */}
          <FormMessage type={messageType} message={message} className="p-2.5 mb-3" />

          <form onSubmit={handleSubmit} noValidate className="space-y-3 sm:space-y-3.5">
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
                  className="text-xs font-bold text-[#D35400] hover:text-[#B84600] px-2 py-1 rounded transition-colors"
                >
                  {mostrarContrasena ? 'Ocultar' : 'Mostrar'}
                </button>
              }
            />

            {capsLockActivo && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg -mt-1.5 mb-1.5 font-medium">
                Mayúsculas activadas.
              </p>
            )}

            {/* Botón INGRESAR */}
            <Button type="submit" isSubmitting={isSubmitting} variant="primary">
              INGRESAR
            </Button>

            {/* Enlace Recuperar Contraseña */}
            <div className="text-center pt-1.5">
              <button
                type="button"
                onClick={onForgotPasswordClick}
                className="text-[#D35400] text-xs sm:text-sm font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-[#D35400] rounded py-1 px-2"
              >
                ¿Olvidó su contraseña?
              </button>
            </div>
          </form>

          {/* Tarjeta de Acceso de Demostración (Figma AuthShell) */}
          <div className="mt-4 sm:mt-5 border border-dashed border-[#D5CCC3] rounded-2xl p-3 bg-white/70 text-left">
            <p className="font-bold text-xs text-[#2C1A0E]">Acceso de demostración</p>
            <p className="text-[11px] text-[#7C6F66] mt-0.5 mb-2">Administrador · sin credenciales</p>
            
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#EFEAE5]">
              <button
                type="button"
                onClick={() => cargarDemo('admin', 'Password123!')}
                className="px-2.5 py-1 bg-[#FFF6EE] hover:bg-[#FFEAD8] text-[#B84600] border border-[#FAD8BE] rounded-lg text-xs font-semibold transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => cargarDemo('atorres', 'Password123!')}
                className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-[#482813] border border-[#E5E0DB] rounded-lg text-xs font-medium transition-colors"
              >
                Cajero
              </button>
              <button
                type="button"
                onClick={() => cargarDemo('lperez', 'Password123!')}
                className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-[#482813] border border-[#E5E0DB] rounded-lg text-xs font-medium transition-colors"
              >
                Mozo
              </button>
              <button
                type="button"
                onClick={() => cargarDemo('msoto', 'Password123!')}
                className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-[#482813] border border-[#E5E0DB] rounded-lg text-xs font-medium transition-colors"
              >
                Cocinero
              </button>
              <button
                type="button"
                onClick={() => cargarDemo('crojas', 'Password123!')}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium transition-colors"
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
