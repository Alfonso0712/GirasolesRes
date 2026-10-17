import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { PageContainer } from '../components/PageContainer';
import { UsersPage } from './UsersPage';
import { LogoutModal } from '../components/LogoutModal';
import { InactivityModal } from '../components/InactivityModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { logoutService, renovarTokenService } from '../services/authService';
import { Users, DollarSign, Utensils, ChefHat, CheckCircle2, Check } from 'lucide-react';
import type { UserSession } from '../types/auth';

interface HomePageProps {
  session: UserSession;
  onLogout: (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => void;
  onUpdateSession: (session: UserSession) => void;
}

// RN-20: 30 minutos totales de inactividad. Advertencia a los 28 minutos (RV-32)
const INACTIVITY_THRESHOLD_MS = 28 * 60 * 1000;

export const HomePage: React.FC<HomePageProps> = ({
  session,
  onLogout,
  onUpdateSession
}) => {
  // Para Administrador abre el módulo de Usuarios (CUS-02) por defecto como en el prototipo
  const [paginaActiva, setPaginaActiva] = useState(
    session.rol === 'Administrador' ? 'usuarios' : 'inicio'
  );

  // Estados de Modales del CUS-03
  const [mostrarModalLogout, setMostrarModalLogout] = useState(false);
  const [cerrandoLogout, setCerrandoLogout] = useState(false);

  const [mostrarModalInactividad, setMostrarModalInactividad] = useState(false);
  const [mostrarModalPassword, setMostrarModalPassword] = useState(false);

  // RV-28: Mensaje flotante de confirmación (Toast) durante 4 segundos
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  // Referencia para temporizador de inactividad
  const ultimaActividadRef = useRef<number>(Date.now());

  // Registrar eventos de interacción de usuario (RV-32 / RN-20)
  const registrarActividad = useCallback(() => {
    // Si el modal de inactividad está visible, la interacción pasiva no lo cierra;
    // se requiere que el usuario haga clic en CONTINUAR según RV-32.
    if (!mostrarModalInactividad) {
      ultimaActividadRef.current = Date.now();
    }
  }, [mostrarModalInactividad]);

  useEffect(() => {
    const eventos = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    let throttleTimeout: any = null;

    const handleUserEvent = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          registrarActividad();
          throttleTimeout = null;
        }, 1000);
      }
    };

    eventos.forEach((e) => window.addEventListener(e, handleUserEvent, { passive: true }));

    // Verificación periódica cada segundo
    const interval = setInterval(() => {
      if (!mostrarModalInactividad && !mostrarModalLogout) {
        const transcurrido = Date.now() - ultimaActividadRef.current;
        if (transcurrido >= INACTIVITY_THRESHOLD_MS) {
          setMostrarModalInactividad(true);
        }
      }
    }, 1000);

    return () => {
      eventos.forEach((e) => window.removeEventListener(e, handleUserEvent));
      if (throttleTimeout) clearTimeout(throttleTimeout);
      clearInterval(interval);
    };
  }, [mostrarModalInactividad, mostrarModalLogout, registrarActividad]);

  // Cierre de sesión manual (HU-08 / RF-02 / Vista 3.1)
  const handleConfirmLogout = async () => {
    setCerrandoLogout(true);
    try {
      await logoutService('manual', session.token);
    } catch (err) {
      console.warn('Error al revocar token en backend:', err);
    } finally {
      setCerrandoLogout(false);
      setMostrarModalLogout(false);
      onLogout({
        type: 'success',
        message: 'Sesión cerrada correctamente.' // MSG-41
      });
    }
  };

  // Continuar sesión tras aviso de inactividad (RV-32 / RN-20 / Vista 3.1b)
  const handleContinuarSesion = async () => {
    try {
      const nuevoToken = await renovarTokenService(session.token);
      onUpdateSession({ ...session, token: nuevoToken });
    } catch (err) {
      console.warn('No se pudo renovar token, continuando con token actual:', err);
    } finally {
      ultimaActividadRef.current = Date.now();
      setMostrarModalInactividad(false);
    }
  };

  // Timeout de inactividad (120 s transcurridos en modal sin acción)
  const handleTimeoutInactividad = async () => {
    setMostrarModalInactividad(false);
    try {
      await logoutService('inactividad', session.token);
    } catch (err) {
      console.warn('Error en logout por inactividad:', err);
    }
    onLogout({
      type: 'warning',
      message: 'Su sesión expiró por inactividad. Ingrese nuevamente.' // MSG-43
    });
  };

  // Éxito al cambiar contraseña (HU-09 / RF-07 / Vista 3.2)
  const handlePasswordSuccess = (nuevoToken: string, mensaje: string) => {
    onUpdateSession({ ...session, token: nuevoToken });
    setToastMensaje(mensaje || 'Contraseña actualizada correctamente.'); // MSG-47
    setTimeout(() => {
      setToastMensaje(null);
    }, 4000); // 4 segundos exactos (RV-28)
  };

  // Bloqueo por 5 intentos fallidos consecutivos (RN-17 / E-51)
  const handleForceLogoutDueToFailedAttempts = () => {
    setMostrarModalPassword(false);
    onLogout({
      type: 'error',
      message: 'Por seguridad se cerró su sesión. Superó los 5 intentos fallidos.' // MSG-48
    });
  };

  return (
    <MainLayout
      session={session}
      onLogout={() => setMostrarModalLogout(true)}
      onCambiarPassword={() => setMostrarModalPassword(true)}
      paginaActiva={paginaActiva}
      onSelectPagina={(p) => setPaginaActiva(p)}
    >
      {paginaActiva === 'usuarios' && session.rol === 'Administrador' ? (
        <UsersPage session={session} onLogout={onLogout} />
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent pr-1">
          <PageContainer
            title={`Bienvenido/a, ${session.nombre}`}
            subtitle={`Panel Operativo SPA - Perfil activo: ${session.rol}`}
          >
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Sesión Iniciada con éxito.</strong> Token JWT vigente por 30 minutos (RNF-02). Clean Architecture y estructura modular SPA integradas según los estándares de la asignatura.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {session.rol === 'Administrador' && (
                <div
                  onClick={() => setPaginaActiva('usuarios')}
                  className="p-6 bg-white border border-neutral-200/80 rounded-2xl hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-neutral-800 font-serif">Gestión de Usuarios</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Administración de cuentas, roles, estados y auditoría (CUS-02).
                  </p>
                </div>
              )}

              {(session.rol === 'Administrador' || session.rol === 'Cajero') && (
                <div
                  onClick={() => setPaginaActiva('caja')}
                  className="p-6 bg-white border border-neutral-200/80 rounded-2xl hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-neutral-800 font-serif">Caja y Facturación</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Apertura, cobros y cierres de turno de caja.
                  </p>
                </div>
              )}

              {(session.rol === 'Administrador' || session.rol === 'Mozo') && (
                <div
                  onClick={() => setPaginaActiva('mesas')}
                  className="p-6 bg-white border border-neutral-200/80 rounded-2xl hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-neutral-800 font-serif">Mesas y Comandas</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Toma ágil de pedidos en salón y estado de preparación.
                  </p>
                </div>
              )}

              {(session.rol === 'Administrador' || session.rol === 'Cocinero') && (
                <div
                  onClick={() => setPaginaActiva('cocina')}
                  className="p-6 bg-white border border-neutral-200/80 rounded-2xl hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-neutral-800 font-serif">Cocina en Vivo (KDS)</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Monitor de comandas y despacho en tiempo real.
                  </p>
                </div>
              )}
            </div>
          </PageContainer>
        </div>
      )}

      {/* Vista 3.1: Modal de confirmación para cerrar sesión (MSG-40 / RV-31) */}
      <LogoutModal
        isOpen={mostrarModalLogout}
        onClose={() => setMostrarModalLogout(false)}
        onConfirm={handleConfirmLogout}
        loading={cerrandoLogout}
      />

      {/* Vista 3.1b: Modal de aviso de inactividad (MSG-42 / RV-32 / RN-20) */}
      <InactivityModal
        isOpen={mostrarModalInactividad}
        onContinue={handleContinuarSesion}
        onTimeout={handleTimeoutInactividad}
      />

      {/* Vista 3.2: Modal de cambio de contraseña propia (HU-09 / RF-07) */}
      <ChangePasswordModal
        isOpen={mostrarModalPassword}
        onClose={() => setMostrarModalPassword(false)}
        token={session.token}
        onSuccess={handlePasswordSuccess}
        onForceLogoutDueToFailedAttempts={handleForceLogoutDueToFailedAttempts}
      />

      {/* Notificación flotante de confirmación (MSG-47 / RV-28 - 4 segundos) */}
      {toastMensaje && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#1B4332] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-in slide-in-from-bottom-4 fade-in duration-200"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-xs font-semibold tracking-wide">{toastMensaje}</span>
          <button
            type="button"
            onClick={() => setToastMensaje(null)}
            className="ml-3 text-neutral-400 hover:text-white text-base leading-none p-1 cursor-pointer"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      )}
    </MainLayout>
  );
};

export default HomePage;
