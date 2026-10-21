import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { InputField, Button, FormMessage } from '../components/ui';
import { forgotPasswordService, resetPasswordService } from '../services/authService';
import { normalizeText } from '../utils/normalizeText';
import { AuthLayout } from '../layouts/AuthLayout';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBackToLogin }) => {
  const [paso, setPaso] = useState<'solicitar' | 'restablecer' | 'exito'>('solicitar');
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSolicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    const correoNormalizado = normalizeText(correo).toLowerCase();
    setCorreo(correoNormalizado);

    if (!correoNormalizado || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correoNormalizado)) {
      setErrors({ correo: 'Campo obligatorio: ingrese un correo válido.' });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await forgotPasswordService(correoNormalizado);
      setPaso('restablecer');
    } catch (err: any) {
      setMessage(err.message || 'No se pudo enviar el código. Intente nuevamente.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestablecerPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    const newErrors: Record<string, string> = {};
    const codigoLimpio = normalizeText(codigo);

    if (codigoLimpio.length !== 6) {
      newErrors.codigo = 'El código debe tener 6 dígitos numéricos.';
    }

    if (nuevaContrasena.length < 8 || nuevaContrasena.length > 64) {
      newErrors.nuevaPass = 'La contraseña debe tener entre 8 y 64 caracteres.';
    }

    if (nuevaContrasena !== confirmarContrasena) {
      newErrors.confirmarPass = 'Las contraseñas no coinciden.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await resetPasswordService(correo, codigoLimpio, nuevaContrasena);
      setPaso('exito');
    } catch (err: any) {
      setMessage(err.message || 'El código es incorrecto o ha vencido. Solicite uno nuevo.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      {/* Botón Volver con altura reservada para match exacto con LoginPage */}
      <div className="h-8 mb-4 sm:mb-6 flex items-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#482813] hover:text-[#B84500] transition-colors cursor-pointer py-1 px-1.5 -ml-1.5 rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al inicio de sesión</span>
        </button>
      </div>

      {/* Indicador de paso (Paso X de 3) y subtítulo */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[#B84500] text-xs font-bold tracking-widest uppercase">
          RECUPERACIÓN SEGURA
        </span>
        <span className="text-xs font-medium text-[#7C6F66] tabular-nums">
          {paso === 'solicitar' ? 'Paso 1 de 3' : paso === 'restablecer' ? 'Paso 2 de 3' : 'Paso 3 de 3'}
        </span>
      </div>

      {paso === 'solicitar' && (
        <>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2C1A0E] tracking-tight mb-1">
            Recuperar contraseña
          </h2>
          <p className="text-[#7C6F66] text-xs sm:text-sm mb-4">
            Le enviaremos un código de verificación de 6 dígitos a su correo electrónico registrado.
          </p>

          <div className="min-h-[46px] mb-2 flex items-center">
            {message ? (
              <FormMessage type={messageType} message={message} className="p-2.5 w-full rounded-xl" />
            ) : (
              <div className="w-full h-full opacity-0 pointer-events-none select-none" aria-hidden="true" />
            )}
          </div>

          <form onSubmit={handleSolicitarCodigo} noValidate className="space-y-4">
            <InputField
              id="correo"
              name="correo"
              label="Correo electrónico"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              disabled={isSubmitting}
              placeholder="nombre@correo.com"
              required
              error={errors.correo}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Button
              type="submit"
              isSubmitting={isSubmitting}
              variant="primary"
              size="lg"
              className="h-12 min-h-[48px] text-sm font-bold tracking-wider uppercase rounded-xl w-full"
            >
              ENVIAR CÓDIGO
            </Button>
          </form>
        </>
      )}

      {paso === 'restablecer' && (
        <>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2C1A0E] tracking-tight mb-1">
            Nueva contraseña
          </h2>

          {/* Banner informativo de envío de código */}
          <div className="bg-[#FEF9EE] border border-[#FCE8B3] rounded-xl p-3 text-xs text-[#7A4B13] font-medium mb-3">
            Código enviado a <span className="font-bold">{correo}</span>
          </div>

          <div className="min-h-[46px] mb-2 flex items-center">
            {message ? (
              <FormMessage type={messageType} message={message} className="p-2.5 w-full rounded-xl" />
            ) : (
              <div className="w-full h-full opacity-0 pointer-events-none select-none" aria-hidden="true" />
            )}
          </div>

          <form onSubmit={handleRestablecerPassword} noValidate className="space-y-3">
            <InputField
              id="codigo"
              name="codigo"
              label="Código de verificación"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
              disabled={isSubmitting}
              placeholder="000000"
              maxLength={6}
              required
              error={errors.codigo}
              className="tabular-nums tracking-widest text-base font-bold"
            />

            <InputField
              id="nuevaPass"
              name="nuevaPass"
              label="Nueva contraseña"
              type={mostrarPass ? 'text' : 'password'}
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              disabled={isSubmitting}
              placeholder="Mínimo 8 caracteres"
              required
              error={errors.nuevaPass}
              leftIcon={<Lock className="w-4 h-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setMostrarPass(!mostrarPass)}
                  className="text-xs font-bold text-[#B84500] hover:text-[#B84600] px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  {mostrarPass ? 'Ocultar' : 'Mostrar'}
                </button>
              }
            />

            <InputField
              id="confirmarPass"
              name="confirmarPass"
              label="Confirmar contraseña"
              type={mostrarPass ? 'text' : 'password'}
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              disabled={isSubmitting}
              placeholder="Repita la contraseña"
              required
              error={errors.confirmarPass}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="pt-2">
              <Button
                type="submit"
                isSubmitting={isSubmitting}
                variant="primary"
                size="lg"
                className="h-12 min-h-[48px] text-sm font-bold tracking-wider uppercase rounded-xl w-full"
              >
                GUARDAR CONTRASEÑA
              </Button>
            </div>
          </form>
        </>
      )}

      {paso === 'exito' && (
        <div className="text-left py-2 animate-in fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2C1A0E] tracking-tight mb-2">
            Contraseña actualizada
          </h2>

          <div className="w-12 h-12 bg-emerald-100/70 border border-emerald-300 text-emerald-700 rounded-full flex items-center justify-center my-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <p className="text-[#7C6F66] text-xs sm:text-sm leading-relaxed mb-6">
            Su contraseña se actualizó correctamente. Ya puede ingresar con sus nuevas credenciales.
          </p>

          <Button
            type="button"
            onClick={onBackToLogin}
            variant="primary"
            size="lg"
            className="h-12 min-h-[48px] text-sm font-bold tracking-wider uppercase rounded-xl w-full"
          >
            INICIAR SESIÓN
          </Button>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
