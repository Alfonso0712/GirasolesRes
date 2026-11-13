import React, { useState, Suspense, lazy } from 'react';
import { Shield, Moon, Sun, Vibrate, LogOut, Globe, Pencil } from 'lucide-react';
import type { UserSession } from '../../types/auth';
import { Button } from '../ui/Button';
import { BottomSheet } from '../ui/BottomSheet';
import { getApiBaseUrl } from '../../services/apiClient';
import { useHaptics } from '../../hooks/useHaptics';
import { MODO_DEMO } from '../../config/appConfig';
import logoEmblema from '../../assets/logo-emblema-256.png';

const ServidorConfigSheet = (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true')
  ? lazy(() => import('../auth/ServidorConfigSheet').then((m) => ({ default: m.ServidorConfigSheet })))
  : null;

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
  const [mostrarSheetServidor, setMostrarSheetServidor] = useState(false);
  const [mostrarConfirmLogout, setMostrarConfirmLogout] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const { triggerLight } = useHaptics();

  const handleConfirmarCierre = async () => {
    setCerrandoSesion(true);
    try {
      await onLogout();
    } finally {
      setCerrandoSesion(false);
      setMostrarConfirmLogout(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-canvas pb-28">
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
          Ajustes del Terminal Móvil
        </h3>

        {/* Modo Oscuro */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-canvas border border-line flex items-center justify-center text-ink">
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Modo Oscuro</p>
              <p className="text-[11px] text-ink-muted">Recomendado para turnos nocturnos y pantallas KDS</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label="Alternar modo oscuro"
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
              <p className="text-sm font-bold text-ink">Respuesta Háptica</p>
              <p className="text-[11px] text-ink-muted">Vibración táctil al interactuar y confirmar acciones</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={triggerLight}>
            Probar
          </Button>
        </div>
      </div>

      {/* 3. Conexión de Red / Servidor Backend (Exclusivo para Modo Demostración) */}
      {MODO_DEMO && (
        <div className="bg-surface border border-line rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-ink">
              <Globe className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Servidor de Backend (.NET 8)
              </h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-warning bg-warning-bg border border-warning-border px-2 py-0.5 rounded-full">
              Demo
            </span>
          </div>
          <p className="text-xs text-ink-muted truncate font-mono bg-canvas p-2.5 rounded-xl border border-line">
            {apiUrl}
          </p>
          <Button
            size="sm"
            fullWidth
            variant="outline"
            onClick={() => {
              triggerLight();
              setMostrarSheetServidor(true);
            }}
            className="flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Configurar Dirección del Servidor</span>
          </Button>

          {ServidorConfigSheet && (
            <Suspense fallback={null}>
              <ServidorConfigSheet
                isOpen={mostrarSheetServidor}
                onClose={() => setMostrarSheetServidor(false)}
                onGuardado={(nueva) => setApiUrl(nueva)}
              />
            </Suspense>
          )}
        </div>
      )}

      {/* Marca y Versión del Terminal */}
      <div className="py-2 text-center flex flex-col items-center justify-center opacity-85 select-none">
        <img
          src={logoEmblema}
          alt="Logo Girasoles"
          width={40}
          height={40}
          decoding="async"
          className="w-10 h-10 object-contain mb-1 rounded-lg"
        />
        <p className="text-xs font-bold text-ink">Restaurante Girasoles</p>
        <p className="text-[10px] text-ink-muted">Terminal Móvil v1.0.0</p>
      </div>

      {/* 4. Botón de Cerrar Sesión */}
      <div className="pt-2">
        <Button
          fullWidth
          size="lg"
          variant="danger"
          onClick={() => {
            triggerLight();
            setMostrarConfirmLogout(true);
          }}
          className="flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>

      {/* Bottom Sheet de Confirmación de Cierre de Sesión */}
      <BottomSheet
        isOpen={mostrarConfirmLogout}
        onClose={() => setMostrarConfirmLogout(false)}
        title="Cerrar Sesión"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
            <LogOut className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-extrabold text-ink mb-1">
              ¿Está seguro de que desea cerrar sesión?
            </h3>
            <p className="text-xs text-ink-muted">
              Tendrá que ingresar nuevamente sus credenciales para acceder a la aplicación.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              disabled={cerrandoSesion}
              onClick={() => setMostrarConfirmLogout(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="md"
              isLoading={cerrandoSesion}
              onClick={handleConfirmarCierre}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
