import React, { useState } from 'react';
import { Utensils, ChefHat, Receipt, Shield, Lock, User, Globe, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { authService } from '../../services/authService';
import { getApiBaseUrl, setApiBaseUrl } from '../../services/apiClient';
import type { UserSession } from '../../types/auth';
import { useHaptics } from '../../hooks/useHaptics';
import logoGirasoles from '../../assets/logo.png';

interface LoginViewProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarConfigUrl, setMostrarConfigUrl] = useState(false);
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());

  const { triggerSuccess, triggerError } = useHaptics();

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

  const handleSaveApiUrl = () => {
    setApiBaseUrl(apiUrl);
    setMostrarConfigUrl(false);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 max-w-md mx-auto w-full overflow-y-auto safe-top safe-bottom">
      {/* 1. Header con Logo */}
      <div className="pt-6 pb-4 text-center">
        <div className="w-20 h-20 mx-auto mb-2.5 p-1 rounded-2xl bg-surface border border-line shadow-xs flex items-center justify-center">
          <img
            src={logoGirasoles}
            alt="Restaurante Girasoles"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-xl font-extrabold text-ink tracking-tight">Restaurante Girasoles</h1>
        <p className="text-xs text-ink-muted mt-0.5 font-medium">Terminal Móvil y Tablet Operativo</p>
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
            <User className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5" />
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
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5" />
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-line bg-canvas text-sm font-medium focus:outline-primary"
            />
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

        {/* Bloque exclusivo para entorno de desarrollo */}
        {import.meta.env.DEV && (
          <>
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-line"></div>
              <span className="shrink-0 px-3 text-[11px] font-bold text-ink-muted uppercase">
                Acceso Rápido por Rol
              </span>
              <div className="flex-grow border-t border-line"></div>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'Password123!')}
                className="p-2 rounded-xl border border-line bg-canvas hover:border-primary text-center active:scale-95 transition-all"
              >
                <Shield className="w-4 h-4 text-primary mx-auto mb-1" />
                <span className="text-[10px] font-bold block text-ink truncate">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('lperez', 'Password123!')}
                className="p-2 rounded-xl border border-line bg-canvas hover:border-primary text-center active:scale-95 transition-all"
              >
                <Utensils className="w-4 h-4 text-primary mx-auto mb-1" />
                <span className="text-[10px] font-bold block text-ink truncate">Mozo</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('msoto', 'Password123!')}
                className="p-2 rounded-xl border border-line bg-canvas hover:border-primary text-center active:scale-95 transition-all"
              >
                <ChefHat className="w-4 h-4 text-primary mx-auto mb-1" />
                <span className="text-[10px] font-bold block text-ink truncate">Cocinero</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('atorres', 'Password123!')}
                className="p-2 rounded-xl border border-line bg-canvas hover:border-primary text-center active:scale-95 transition-all"
              >
                <Receipt className="w-4 h-4 text-primary mx-auto mb-1" />
                <span className="text-[10px] font-bold block text-ink truncate">Cajero</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 3. Configuración de Conexión al Backend (Solo en desarrollo) */}
      {import.meta.env.DEV && (
        <div className="pt-4 text-center">
          {!mostrarConfigUrl ? (
            <button
              type="button"
              onClick={() => setMostrarConfigUrl(true)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted hover:text-primary transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Servidor: {apiUrl}</span>
            </button>
          ) : (
            <div className="bg-surface border border-line rounded-2xl p-3 text-left space-y-2 animate-in fade-in">
              <label className="text-[11px] font-bold text-ink">URL de la API (.NET 8):</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://girasolesres.pp.ua/api"
                className="w-full px-3 py-2 rounded-lg border border-line text-xs font-mono bg-canvas"
              />
              <div className="flex gap-2">
                <Button size="sm" fullWidth onClick={handleSaveApiUrl}>
                  Guardar URL
                </Button>
                <Button size="sm" variant="outline" onClick={() => setMostrarConfigUrl(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
