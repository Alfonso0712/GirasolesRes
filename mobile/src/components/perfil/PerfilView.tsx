import React, { useState, Suspense, lazy } from 'react';
import {
  Shield,
  Moon,
  Sun,
  Vibrate,
  LogOut,
  Globe,
  Pencil,
  Volume2,
  Smartphone,
  KeyRound,
  BookOpen,
} from 'lucide-react';
import type { UserSession } from '../../types/auth';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { ConfirmSheet } from '../ui/ConfirmSheet';
import { CambiarContrasenaSheet } from './CambiarContrasenaSheet';
import { GuiaUsoSheet } from './GuiaUsoSheet';
import { getApiBaseUrl } from '../../services/apiClient';
import { useHaptics } from '../../hooks/useHaptics';
import { useHandedness } from '../../hooks/useHandedness';
import { MODO_DEMO } from '../../config/appConfig';
import { formatearMarcaCompilacion } from '../../config/serverConfig';
import { reproducirSonidoKds, sonSonidosKdsHabilitados } from '../../utils/audioKds';
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
  const [mostrarCambiarPass, setMostrarCambiarPass] = useState(false);
  const [mostrarGuiaUso, setMostrarGuiaUso] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [sonidoHabilitado, setSonidoHabilitado] = useState(() => sonSonidosKdsHabilitados());
  const [avisoHaptics, setAvisoHaptics] = useState<string | null>(null);

  const { isLeftHanded, setHandedness } = useHandedness();
  const {
    hapticsHabilitado,
    setHapticsHabilitado,
    triggerLight,
    probarHaptics,
  } = useHaptics();

  const handleToggleHaptics = () => {
    const nuevo = !hapticsHabilitado;
    setHapticsHabilitado(nuevo);
    setAvisoHaptics(null);
    if (nuevo) {
      void probarHaptics();
    }
  };

  const handleProbarHaptics = async () => {
    if (!hapticsHabilitado) return;
    setAvisoHaptics(null);
    const vibro = await probarHaptics();
    if (!vibro) {
      setAvisoHaptics(
        'Este dispositivo no admite la vibración o está desactivada en los ajustes del sistema.'
      );
    }
  };

  const handleToggleSonido = () => {
    triggerLight();
    const nuevo = !sonidoHabilitado;
    setSonidoHabilitado(nuevo);
    localStorage.setItem('kds_sonido_activado', nuevo ? 'true' : 'false');
    if (nuevo) {
      reproducirSonidoKds('pendiente', true);
    }
  };

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
      <Card className="p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
          {session.nombre.charAt(0)}
        </div>
        <div>
          <h2 className="text-base font-extrabold text-ink">
            {session.nombre} {session.apellido}
          </h2>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-accent bg-chip-accent-bg border border-chip-accent-border px-2.5 py-0.5 rounded-full mt-1">
            <Shield className="w-3 h-3" aria-hidden="true" />
            <span>Rol: {session.rol}</span>
          </span>
          <p className="text-xs text-ink-muted mt-1">{session.correo}</p>
        </div>
      </Card>

      {/* 2. Preferencias de Pantalla */}
      <Card className="p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
          Ajustes del Terminal Móvil
        </h3>

        {/* Modo Oscuro */}
        <div className="flex items-center justify-between min-h-[48px] gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-canvas border border-line flex items-center justify-center text-ink shrink-0">
              {isDark ? <Moon className="w-5 h-5 text-accent" aria-hidden="true" /> : <Sun className="w-5 h-5 text-ink" aria-hidden="true" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink">Modo Oscuro</p>
              <p className="text-xs text-ink-muted">Recomendado para turnos nocturnos y pantallas KDS</p>
            </div>
          </div>
          <Switch
            checked={isDark}
            onChange={() => onToggleDarkMode()}
            aria-label="Alternar modo oscuro"
          />
        </div>

        {/* Respuesta Háptica con interruptor y botón Probar */}
        <div className="pt-2 border-t border-line space-y-2">
          <div className="flex items-center justify-between min-h-[48px] gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-canvas border border-line flex items-center justify-center text-ink shrink-0">
                <Vibrate className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">Respuesta Háptica</p>
                <p className="text-xs text-ink-muted">
                  Vibración táctil al interactuar y confirmar acciones
                </p>
              </div>
            </div>
            <Switch
              checked={hapticsHabilitado}
              onChange={() => handleToggleHaptics()}
              aria-label="Alternar respuesta háptica"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pl-14">
            <span className="text-xs text-ink-muted">
              {hapticsHabilitado
                ? 'Active el botón para verificar la vibración del equipo.'
                : 'Active la respuesta háptica para probarla'}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={!hapticsHabilitado}
              onClick={() => void handleProbarHaptics()}
              className="min-h-[44px] shrink-0"
            >
              Probar
            </Button>
          </div>

          {avisoHaptics && (
            <p
              role="status"
              className="text-xs font-medium text-notice-text bg-notice-bg border border-notice-border rounded-xl px-3 py-2"
            >
              {avisoHaptics}
            </p>
          )}
        </div>

        {/* Sonido de avisos KDS / Pedidos */}
        <div className="flex items-center justify-between pt-2 border-t border-line min-h-[48px] gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-canvas border border-line flex items-center justify-center text-ink shrink-0">
              <Volume2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink">Sonido de Avisos</p>
              <p className="text-xs text-ink-muted">Alertas sonoras para nuevas comandas y pedidos listos</p>
            </div>
          </div>
          <Switch
            checked={sonidoHabilitado}
            onChange={() => handleToggleSonido()}
            aria-label="Alternar sonido de avisos"
          />
        </div>

        {/* Orientación de Interfaz (Diestro / Zurdo) */}
        <div className="pt-2 border-t border-line space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-canvas border border-line flex items-center justify-center text-ink">
              <Smartphone className="w-5 h-5 text-accent" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Orientación de Manejo</p>
              <p className="text-xs text-ink-muted">Alinea acciones táctiles para uso diestro o zurdo</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                triggerLight();
                setHandedness('right');
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all min-h-[44px] ${
                !isLeftHanded
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-canvas text-ink border-line'
              }`}
            >
              Modo Diestro
            </button>

            <button
              type="button"
              onClick={() => {
                triggerLight();
                setHandedness('left');
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all min-h-[44px] ${
                isLeftHanded
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-canvas text-ink border-line'
              }`}
            >
              Modo Zurdo
            </button>
          </div>
        </div>
      </Card>

      {/* Seguridad de Cuenta (Exclusivo Administrador, RN-16) */}
      {session.rol === 'Administrador' && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-4 h-4 text-accent" aria-hidden="true" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Seguridad de Cuenta
            </h3>
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            Como administrador, puede cambiar su clave de acceso directamente desde este terminal móvil.
          </p>

          <Button
            size="md"
            fullWidth
            variant="outline"
            onClick={() => {
              triggerLight();
              setMostrarCambiarPass(true);
            }}
            className="flex items-center justify-center gap-2 min-h-[44px]"
          >
            <KeyRound className="w-4 h-4" />
            <span>Cambiar Mi Contraseña</span>
          </Button>

          <CambiarContrasenaSheet
            isOpen={mostrarCambiarPass}
            onClose={() => setMostrarCambiarPass(false)}
            onForzarLogout={onLogout}
          />
        </Card>
      )}

      {/* Manual del Terminal / Guía Rápida de Uso */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-accent" aria-hidden="true" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Manual del Terminal
          </h3>
        </div>

        <p className="text-xs text-ink-muted leading-relaxed">
          Consulte los procedimientos paso a paso y flujos clave asignados a su rol de {session.rol}.
        </p>

        <Button
          size="md"
          fullWidth
          variant="outline"
          onClick={() => {
            triggerLight();
            setMostrarGuiaUso(true);
          }}
          className="flex items-center justify-center gap-2 min-h-[44px]"
        >
          <BookOpen className="w-4 h-4" />
          <span>Ver Guía Rápida de Uso</span>
        </Button>

        <GuiaUsoSheet
          isOpen={mostrarGuiaUso}
          onClose={() => setMostrarGuiaUso(false)}
          rol={session.rol}
        />
      </Card>

      {/* 3. Conexión de Red / Servidor Backend (Exclusivo para Modo Demostración) */}
      {MODO_DEMO && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-ink">
              <Globe className="w-4 h-4 text-accent" aria-hidden="true" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Servidor de Backend (.NET 8)
              </h3>
            </div>
            <span className="text-xs uppercase font-semibold text-warning bg-warning-bg border border-warning-border px-2 py-0.5 rounded-full">
              Demo
            </span>
          </div>
          <p className="text-xs text-ink-muted break-all font-mono bg-canvas p-2.5 rounded-xl border border-line">
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
            icon={<Pencil className="w-5 h-5 shrink-0" aria-hidden="true" />}
            className="min-h-[44px]"
          >
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
        </Card>
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
        <p className="text-xs text-ink-muted">Terminal Móvil v1.0.0</p>
        {MODO_DEMO && (
          <p className="text-xs text-ink-muted mt-0.5 font-medium">
            {formatearMarcaCompilacion()}
          </p>
        )}
      </div>

      {/* 4. Botón de Cerrar Sesión */}
      <div className="pt-2">
        <Button
          fullWidth
          size="lg"
          variant="danger-outline"
          onClick={() => {
            triggerLight();
            setMostrarConfirmLogout(true);
          }}
          icon={<LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />}
        >
          <span>Cerrar Sesión</span>
        </Button>
      </div>

      {/* Confirmación de Cierre de Sesión */}
      <ConfirmSheet
        isOpen={mostrarConfirmLogout}
        titulo="Cerrar Sesión"
        mensaje="¿Está seguro de que desea cerrar sesión? Tendrá que ingresar nuevamente sus credenciales para acceder a la aplicación."
        etiquetaConfirmar="Cerrar Sesión"
        tono="peligro"
        cargando={cerrandoSesion}
        onConfirmar={handleConfirmarCierre}
        onCancelar={() => setMostrarConfirmLogout(false)}
      />
    </div>
  );
};
