import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { InputField } from '../components/ui';
import { Button } from '../components/ui';
import { FormMessage } from '../components/ui';
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
      {/* Volver al inicio de sesión (Vega 1.png) */}
      <button
        type="button"
        onClick={onBackToLogin}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#482813] hover:text-[#B84500] mb-4 sm:mb-6 transition-colors"
      >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio de sesión
          </button>

          <p className="text-[#B84500] text-xs font-bold tracking-widest uppercase mb-1">
            RECUPERACIÓN SEGURA
          </p>

          {paso === 'solicitar' && (
            <>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#2C1A0E] tracking-tight mb-2">
                Recuperar contraseña
              </h2>
              <p className="text-[#7C6F66] text-sm mb-6">
                Le enviaremos un código de verificación al correo registrado.
              </p>

              <FormMessage type={messageType} message={message} />

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

                <Button type="submit" isSubmitting={isSubmitting} variant="primary">
                  ENVIAR CÓDIGO
                </Button>
              </form>
            </>
          )}

          {paso === 'restablecer' && (
            <>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#2C1A0E] tracking-tight mb-2">
                Recuperar contraseña
              </h2>

              {/* Banner informativo de envío de código (Vega 2.png) */}
              <div className="bg-[#FEF9EE] border border-[#FCE8B3] rounded-xl p-3.5 text-xs text-[#7A4B13] font-medium mb-6">
                Código enviado a <span className="font-bold">{correo}</span>
              </div>

              <FormMessage type={messageType} message={message} />

              <form onSubmit={handleRestablecerPassword} noValidate className="space-y-4">
                <InputField
                  id="codigo"
                  name="codigo"
                  label="Código de verificación"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                  disabled={isSubmitting}
                  placeholder="000 000"
                  maxLength={6}
                  required
                  error={errors.codigo}
                  className="tabular-nums tracking-widest text-base"
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
                      className="text-xs font-bold text-[#B84500] hover:text-[#B84600] px-2 py-1 rounded"
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

                <Button type="submit" isSubmitting={isSubmitting} variant="primary">
                  GUARDAR
                </Button>
              </form>
            </>
          )}

          {paso === 'exito' && (
            <div className="text-left py-4 animate-in fade-in">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#2C1A0E] tracking-tight mb-4">
                Contraseña actualizada
              </h2>

              <div className="w-12 h-12 bg-emerald-100/70 border border-emerald-300 text-emerald-700 rounded-full flex items-center justify-center my-6">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <p className="text-[#7C6F66] text-sm leading-relaxed mb-8">
                Su contraseña se actualizó correctamente. Ya puede ingresar con sus nuevas credenciales.
              </p>

              <Button type="button" onClick={onBackToLogin} variant="primary">
                VOLVER AL LOGIN
              </Button>
            </div>
          )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;

