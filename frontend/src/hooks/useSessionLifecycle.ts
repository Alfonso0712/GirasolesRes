import { useState, useEffect, useRef, useCallback } from 'react';
import { logoutService, renovarTokenService } from '../services/authService';
import { validateJwtToken, SESSION_EXPIRED_MESSAGE } from '../services/apiClient';
import type { UserSession } from '../types/auth';

// RN-20: 30 minutos totales de inactividad. Advertencia a los 28 minutos (RV-32)
export const INACTIVITY_THRESHOLD_MS = 28 * 60 * 1000;

export interface UseSessionLifecycleProps {
  session: UserSession;
  paginaActiva: string;
  onLogout: (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => void;
  onUpdateSession: (session: UserSession) => void;
}

export function useSessionLifecycle({
  session,
  paginaActiva,
  onLogout,
  onUpdateSession,
}: UseSessionLifecycleProps) {
  const [mostrarModalLogout, setMostrarModalLogout] = useState(false);
  const [cerrandoLogout, setCerrandoLogout] = useState(false);
  const [mostrarModalInactividad, setMostrarModalInactividad] = useState(false);

  // Referencia para temporizador de inactividad
  const ultimaActividadRef = useRef<number>(Date.now());

  // Registrar eventos de interacción de usuario (RV-32 / RN-20)
  const registrarActividad = useCallback(() => {
    if (!mostrarModalInactividad) {
      ultimaActividadRef.current = Date.now();
    }
  }, [mostrarModalInactividad]);

  useEffect(() => {
    const eventos = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    let throttleTimeout: ReturnType<typeof setTimeout> | null = null;

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
      if (!validateJwtToken(session.token, 0).valid) {
        setMostrarModalInactividad(false);
        setMostrarModalLogout(false);
        onLogout({
          type: 'warning',
          message: SESSION_EXPIRED_MESSAGE,
        });
        return;
      }

      if (paginaActiva === 'cocina' && session.rol === 'Cocinero') {
        ultimaActividadRef.current = Date.now();
        return;
      }

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
  }, [mostrarModalInactividad, mostrarModalLogout, registrarActividad, paginaActiva, session.rol, session.token, onLogout]);

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
        message: 'Sesión cerrada correctamente.',
      });
    }
  };

  // Continuar sesión tras aviso de inactividad (RV-32 / RN-20 / Vista 3.1b)
  const handleContinuarSesion = async () => {
    try {
      const nuevoToken = await renovarTokenService(session.token);
      onUpdateSession({ ...session, token: nuevoToken });
      ultimaActividadRef.current = Date.now();
      setMostrarModalInactividad(false);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 401 || !validateJwtToken(session.token, 10).valid) {
        setMostrarModalInactividad(false);
        onLogout({
          type: 'warning',
          message: SESSION_EXPIRED_MESSAGE,
        });
        return;
      }
      console.warn('No se pudo renovar token, continuando con token actual:', err);
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
      message: 'Su sesión expiró por inactividad. Ingrese nuevamente.',
    });
  };

  return {
    mostrarModalLogout,
    setMostrarModalLogout,
    cerrandoLogout,
    mostrarModalInactividad,
    setMostrarModalInactividad,
    handleConfirmLogout,
    handleContinuarSesion,
    handleTimeoutInactividad,
  };
}
