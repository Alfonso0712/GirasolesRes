import { useState, useEffect, useRef, useCallback } from 'react';
import type { UserSession } from '../types/auth';
import { authService } from '../services/authService';

export const INACTIVIDAD_LIMITE_MS = 28 * 60 * 1000; // 28 minutos
export const CUENTA_REGRESIVA_SEGUNDOS = 120; // 2 minutos

export interface UseSessionLifecycleOptions {
  session: UserSession | null;
  activeTab: string;
  onLogout: (motivo?: string) => Promise<void> | void;
  inactivityThresholdMs?: number;
  warningCountdownSeconds?: number;
}

export interface UseSessionLifecycleReturn {
  avisoInactividadVisible: boolean;
  segundosRestantes: number;
  renovando: boolean;
  continuarSesion: () => Promise<void>;
  cerrarSesionInactividad: () => Promise<void>;
}

export const useSessionLifecycle = ({
  session,
  activeTab,
  onLogout,
  inactivityThresholdMs = INACTIVIDAD_LIMITE_MS,
  warningCountdownSeconds = CUENTA_REGRESIVA_SEGUNDOS,
}: UseSessionLifecycleOptions): UseSessionLifecycleReturn => {
  const [avisoInactividadVisible, setAvisoInactividadVisible] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(warningCountdownSeconds);
  const [renovando, setRenovando] = useState(false);

  const ultimaActividadRef = useRef<number>(Date.now());
  const avisoAbiertoRef = useRef<boolean>(false);
  avisoAbiertoRef.current = avisoInactividadVisible;

  // Registrar actividad por interacción del usuario
  const registrarActividad = useCallback(() => {
    if (!avisoAbiertoRef.current) {
      ultimaActividadRef.current = Date.now();
    }
  }, []);

  // Escuchar eventos de interacción del usuario
  useEffect(() => {
    if (!session) return;

    const eventos = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'pointerdown'];
    let throttleTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleUserInteraction = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          registrarActividad();
          throttleTimeout = null;
        }, 1000);
      }
    };

    eventos.forEach((e) => window.addEventListener(e, handleUserInteraction, { passive: true }));

    // Verificación periódica de inactividad cada segundo
    const interval = setInterval(() => {
      // Exención para la pantalla de Cocina con rol Cocinero (KDS ininterrumpido)
      if (activeTab === 'cocina' && session.rol === 'Cocinero') {
        ultimaActividadRef.current = Date.now();
        return;
      }

      if (!avisoAbiertoRef.current) {
        const transcurrido = Date.now() - ultimaActividadRef.current;
        if (transcurrido >= inactivityThresholdMs) {
          setAvisoInactividadVisible(true);
          setSegundosRestantes(warningCountdownSeconds);
        }
      }
    }, 1000);

    return () => {
      eventos.forEach((e) => window.removeEventListener(e, handleUserInteraction));
      if (throttleTimeout) clearTimeout(throttleTimeout);
      clearInterval(interval);
    };
  }, [session, activeTab, inactivityThresholdMs, warningCountdownSeconds, registrarActividad]);

  // Manejador de cierre por inactividad
  const cerrarSesionInactividad = useCallback(async () => {
    setAvisoInactividadVisible(false);
    await onLogout('Su sesión expiró por inactividad. Ingrese nuevamente.');
  }, [onLogout]);

  // Cuenta regresiva mientras el aviso está activo
  useEffect(() => {
    if (!avisoInactividadVisible) return;

    const timer = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void cerrarSesionInactividad();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [avisoInactividadVisible, cerrarSesionInactividad]);

  // Continuar sesión: renueva token y reinicia temporizador
  const continuarSesion = useCallback(async () => {
    setRenovando(true);
    try {
      await authService.renovarToken();
    } catch {
      // Si falla por red u otra causa, permitir continuar con sesión local
    } finally {
      ultimaActividadRef.current = Date.now();
      setAvisoInactividadVisible(false);
      setRenovando(false);
    }
  }, []);

  return {
    avisoInactividadVisible,
    segundosRestantes,
    renovando,
    continuarSesion,
    cerrarSesionInactividad,
  };
};
