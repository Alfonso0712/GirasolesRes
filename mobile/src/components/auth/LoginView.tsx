import React, { useState, Suspense, lazy } from 'react';
import { Lock, User, Globe, AlertCircle, Eye, EyeOff, Pencil } from 'lucide-react';
import { Button } from '../ui/Button';
import { authService } from '../../services/authService';
import { getApiBaseUrl } from '../../services/apiClient';
import type { UserSession } from '../../types/auth';
import { useHaptics } from '../../hooks/useHaptics';
import { MODO_DEMO } from '../../config/appConfig';
import { ServidorConfigSheet } from './ServidorConfigSheet';
import logoEmblema from '../../assets/logo-emblema-256.png';

const DemoQuickAccess = (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true')
  ? lazy(() => import('./DemoQuickAccess').then((m) => ({ default: m.DemoQuickAccess })))
  : null;

interface LoginViewProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarSheetServidor, setMostrarSheetServidor] = useState(false);
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();

  const handleLogin = async (user: string, pass: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const session = await authService.login(user, pass);
      triggerSuccess();
      onLoginSuccess(session);
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'Credenciales incorrectas';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (user: string, pass: string) => {
    setUsuario(user);
    setContrasena(pass);
    handleLogin(user, pass);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6 max-w-md mx-auto w-full min-h-full overflow-y-auto safe-top safe-bottom">
      <div className="w-full my-auto space-y-4">
        {/* 1. Header con Logo y Etiqueta de Modo Demostración */}
        <div className="pt-2 pb-2 text-center flex flex-col items-center">
          <div className="w-20 h-20 mx-auto mb-2.5 p-1 rounded-2xl bg-surface border border-line shadow-xs flex items-center justify-center">
            <img
              src={logoEmblema}
              alt="Restaurante Girasoles"
              width={72}
              height={72}
              decoding="async"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-xl font-extrabold text-ink tracking-tight">Restaurante Girasoles</h1>
          <p className="text-xs text-ink-muted mt-0.5 font-medium">Terminal Móvil y Tablet Operativo</p>

          {MODO_DEMO && (
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-warning-bg border border-warning-border text-warning text-[11px] font-bold mt-2 shadow-2xs">
              <span>Modo demostración</span>
            </div>
          )}
        </div>

        {/* 2. Formulario de Acceso */}
        <div className="bg-surface border border-line rounded-3xl p-5 shadow-xs space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-ink">Usuario</label>
            <div className="relative">
              <User className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ej. mozo1"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-line bg-canvas text-sm font-medium focus:outline-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-ink">Contraseña</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type={mostrarContrasena ? 'text' : 'password'}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-line bg-canvas text-sm font-medium focus:outline-primary"
              />
              <button
                type="button"
                onClick={() => {
                  triggerLight();
                  setMostrarContrasena(!mostrarContrasena);
                }}
                aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Ver contraseña'}
                className="absolute right-2 top-1.5 w-10 h-10 flex items-center justify-center text-ink-muted hover:text-ink active:scale-95 transition-transform"
              >
                {mostrarContrasena ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            fullWidth
            size="lg"
            isLoading={isLoading}
            onClick={() => handleLogin(usuario, contrasena)}
          >
            Ingresar al Sistema
          </Button>

          {/* Bloque exclusivo para modo demostración */}
          {MODO_DEMO && DemoQuickAccess && (
            <Suspense fallback={null}>
              <DemoQuickAccess onQuickLogin={handleQuickLogin} />
            </Suspense>
          )}
        </div>

        {/* 3. Configuración de Conexión al Backend y Pie de Demostración */}
        {MODO_DEMO && (
          <div className="pt-2 text-center space-y-1">
            <p className="text-[11px] font-medium text-ink-muted">
              Versión de demostración
            </p>
            <button
              type="button"
              onClick={() => {
                triggerLight();
                setMostrarSheetServidor(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-primary transition-colors min-h-[44px] px-3 py-2 rounded-xl active:scale-95"
            >
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>Servidor: {apiUrl}</span>
              <Pencil className="w-3.5 h-3.5 text-ink-muted" />
            </button>

            <ServidorConfigSheet
              isOpen={mostrarSheetServidor}
              onClose={() => setMostrarSheetServidor(false)}
              onGuardado={(nueva) => setApiUrl(nueva)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
