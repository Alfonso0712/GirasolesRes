import React, { useState, useRef, useEffect } from 'react';
import { Lock, User } from 'lucide-react';
import { InputField } from '../components/ui';
import { Button } from '../components/ui';
import { FormMessage } from '../components/ui';
import { loginService } from '../services/authService';
import { normalizeText } from '../utils/normalizeText';
import type { UserSession } from '../types/auth';

interface LoginPageProps {
  onSuccess: (session: UserSession) => void;
  onForgotPasswordClick: () => void;
  initialBanner?: { type: 'success' | 'error' | 'info' | 'warning'; message: string } | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onForgotPasswordClick,
  initialBanner,
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
    <div className="h-screen max-h-screen w-full flex flex-col lg:flex-row bg-white overflow-hidden select-none">
      {/* Encabezado superior para pantallas móviles (< lg) */}
      <header className="lg:hidden bg-[#3A2211] px-5 py-3.5 flex items-center justify-center gap-3 shadow-sm border-b border-[#2C1A0E] shrink-0">
        <img
          src="/favicon.png"
          alt="Isotipo Girasoles"
          className="w-9 h-9 rounded-full object-cover shrink-0"
        />
        <img
          src="/LOGO_GIRASOLES.png"
          alt="Girasoles Restaurante"
          className="h-6 w-auto object-contain"
        />
      </header>

      {/* 1. Panel Izquierdo: Branding y Tipografía (60% en pantallas grandes) */}
      <aside className="hidden lg:flex lg:w-[60%] lg:max-w-[60%] lg:basis-[60%] text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden shrink-0 grow-0 select-none h-full bg-[#2C1A0E]">
        {/* Fotografía gastronómica de fondo */}
        <img
          src="/bg-login-gastronomia.png"
          alt="Gastronomía Restaurante Girasoles"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0"
        />

        {/* Superposición con color café corporativo cálido y semitransparente */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(36, 20, 11, 0.70) 0%, rgba(58, 34, 17, 0.52) 50%, rgba(44, 26, 14, 0.72) 100%)',
          }}
          aria-hidden="true"
        />
        {/* Cabecera de Logo superior izquierda */}
        <div className="relative z-10 flex items-center gap-3.5">
          <img
            src="/favicon.png"
            alt="Isotipo Girasoles"
            className="w-12 h-12 rounded-full object-cover shrink-0 shadow-md"
          />
          <img
            src="/LOGO_GIRASOLES.png"
            alt="Girasoles Restaurante"
            className="h-8 w-auto object-contain"
          />
        </div>

        {/* Textos Centrales alineados a la izquierda y centrados verticalmente */}
        <div className="relative z-10 my-auto py-8 max-w-xl text-left">
          <div className="mb-4">
            <span className="text-[#B84500] font-bold tracking-widest text-xs uppercase block mb-2">
              BIENVENIDOS A:
            </span>
            <div className="w-12 h-0.5 bg-[#D35400] rounded-full" />
          </div>

          <h1 className="font-bold text-5xl lg:text-6xl text-white leading-tight mb-5 tracking-tight">
            GIRASOLESRES.<br />
          </h1>

          <p className="text-white/80 font-sans text-base lg:text-lg max-w-md leading-relaxed">
            Restaurante de comida criolla y gastronomía peruana, preparada con cariño y servida con calidad.
          </p>
        </div>

        {/* Pie de página inferior sutil */}
        <footer className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
          <span>Restaurante Girasoles &copy; {new Date().getFullYear()}</span>
          <span className="font-medium tracking-wide">Punto de Venta Profesional</span>
        </footer>
      </aside>

      {/* 2. Panel Derecho: Formulario Enfocado (40% en pantallas grandes sin scrollbars) */}
      <main className="w-full lg:w-[40%] lg:max-w-[40%] lg:basis-[40%] bg-white flex flex-col justify-center items-center px-6 sm:px-10 lg:px-12 xl:px-16 py-6 h-full shrink-0 grow-0 overflow-y-auto lg:overflow-hidden">
        <div className="w-full max-w-[390px] flex flex-col justify-center my-auto">
          {/* Encabezado del Formulario */}
          <div className="mb-3 text-left">
            <span className="text-[#B84500] text-xs font-bold tracking-widest uppercase block mb-1">
              BIENVENIDO
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2C1A0E] tracking-tight mb-1">
              Iniciar sesión
            </h2>
            <p className="text-[#7C6F66] text-xs sm:text-sm">
              Ingrese su usuario y contraseña para acceder al sistema.
            </p>
          </div>

          {/* Slot reservado para mensajes para prevenir layout shift (salto de scroll vertical) */}
          <div className="min-h-[46px] mb-2 flex items-center">
            {message ? (
              <FormMessage type={messageType} message={message} className="p-2.5 w-full rounded-xl" />
            ) : (
              <div className="w-full h-full opacity-0 pointer-events-none select-none" aria-hidden="true" />
            )}
          </div>

          {/* Formulario Principal */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3">
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
                  className="text-xs font-bold text-[#B84500] hover:text-[#B84600] px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  {mostrarContrasena ? 'Ocultar' : 'Mostrar'}
                </button>
              }
            />

            {capsLockActivo && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-medium">
                Mayúsculas activadas.
              </p>
            )}

            {/* Botón INGRESAR (Altura mínima 48px para ergonomía táctil) */}
            <div className="pt-1.5">
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
                className="text-[#B84500] text-xs sm:text-sm font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-[#D35400] rounded py-1 px-2"
              >
                ¿Olvidó su contraseña?
              </button>
            </div>
          </form>

          {/* Tarjeta de Acceso de Demostración Limpia (Solo en entorno de desarrollo) */}
          {import.meta.env.DEV && (
            <div className="mt-4 sm:mt-5 border border-dashed border-[#D5CCC3] rounded-2xl p-3 bg-neutral-50/70 text-left">
              <p className="font-bold text-xs text-[#2C1A0E]">Acceso de demostración</p>
              <p className="text-xs text-[#7C6F66] mt-0.5 mb-2">Seleccione un perfil para probar el acceso rápido</p>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#EFEAE5]">
                <button
                  type="button"
                  onClick={() => cargarDemo('admin', 'Password123!')}
                  className="px-2.5 py-1 bg-[#FFF6EE] hover:bg-[#FFEAD8] text-[#B84600] border border-[#FAD8BE] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Administrador
                </button>
                <button
                  type="button"
                  onClick={() => cargarDemo('atorres', 'Password123!')}
                  className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-[#482813] border border-[#E5E0DB] rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Cajero
                </button>
                <button
                  type="button"
                  onClick={() => cargarDemo('lperez', 'Password123!')}
                  className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-[#482813] border border-[#E5E0DB] rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Mozo
                </button>
                <button
                  type="button"
                  onClick={() => cargarDemo('msoto', 'Password123!')}
                  className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-[#482813] border border-[#E5E0DB] rounded-lg text-xs font-medium transition-colors cursor-pointer"
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
          )}
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

