import React, { useState } from 'react';
import { Shield, Moon, Sun, Vibrate, LogOut, Globe, Check } from 'lucide-react';
import type { UserSession } from '../../types/auth';
import { Button } from '../ui/Button';
import { getApiBaseUrl, setApiBaseUrl } from '../../services/apiClient';
import { useHaptics } from '../../hooks/useHaptics';

interface PerfilViewProps {
  session: UserSession;
  isDark: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

export const PerfilView: React.FC<PerfilViewProps> = ({
  session,
  isDark,
  onToggleDarkMode,
  onLogout,
}) => {
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [guardado, setGuardado] = useState(false);

  const { triggerLight, triggerSuccess } = useHaptics();

  const handleGuardarUrl = () => {
    setApiBaseUrl(apiUrl);
    triggerSuccess();
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-canvas">
      {/* 1. Tarjeta de Usuario */}
      <div className="bg-surface border border-line rounded-3xl p-5 shadow-xs flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
          {session.nombre.charAt(0)}
        </div>
        <div>
          <h2 className="text-base font-extrabold text-ink">
            {session.nombre} {session.apellido}
          </h2>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full mt-1">
            <Shield className="w-3 h-3" />
            <span>Rol: {session.rol}</span>
          </span>
          <p className="text-xs text-ink-muted mt-1">{session.correo}</p>
        </div>
      </div>

      {/* 2. Preferencias de Pantalla */}
      <div className="bg-surface border border-line rounded-3xl p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
          Ajustes de Terminal Móvil
        </h3>

        {/* Modo Oscuro */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-canvas border border-line flex items-center justify-center text-ink">
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Modo Oscuro</p>
              <p className="text-[11px] text-ink-muted">Recomendado para turnos noche y tablets KDS</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleDarkMode}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              isDark ? 'bg-primary' : 'bg-line'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isDark ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Test de Vibración Háptica */}
        <div className="flex items-center justify-between pt-2 border-t border-line">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-canvas border border-line flex items-center justify-center text-ink">
              <Vibrate className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Feedback Háptico</p>
              <p className="text-[11px] text-ink-muted">Vibración al tocar y confirmar pedidos</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={triggerLight}>
            Probar
          </Button>
        </div>
      </div>

      {/* 3. Conexión de Red / Servidor Backend */}
      <div className="bg-surface border border-line rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-ink">
          <Globe className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Servidor de Backend (.NET 8)
          </h3>
        </div>
        <p className="text-xs text-ink-muted">
          En emulador Android usá <code className="bg-canvas px-1 rounded font-mono">10.0.2.2:5050</code>. En celular físico por Wi-Fi usá la IP de tu PC.
        </p>
        <div className="space-y-2">
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-line bg-canvas focus:outline-primary"
          />
          <Button size="sm" fullWidth variant="outline" onClick={handleGuardarUrl}>
            {guardado ? (
              <span className="inline-flex items-center gap-1.5 text-success">
                <Check className="w-4 h-4" />
                <span>URL Guardada</span>
              </span>
            ) : (
              <span>Guardar Nueva Dirección</span>
            )}
          </Button>
        </div>
      </div>

      {/* 4. Botón de Cerrar Sesión */}
      <div className="pt-2">
        <Button
          fullWidth
          size="lg"
          variant="danger"
          onClick={onLogout}
          className="flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>
    </div>
  );
};
