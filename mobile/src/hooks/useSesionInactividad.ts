import { useState, useEffect, useRef, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import type { UserSession } from '../types/auth';
import { authService } from '../services/authService';
import { setOnUnauthorizedCallback } from '../services/apiClient';
import {
  AVISO_SEG,
  INTERVALO_ESCRITURA_ACTIVIDAD_MS,
  AVISO_SESION_INACTIVIDAD,
  AVISO_SESION_EXPIRADA,
  obtenerLimiteInactividadMs,
  leerUltimaActividad,
  guardarUltimaActividad,
  limpiarAlmacenamientoSesion,
  guardarAvisoSesion,
  estaTokenExpirado,
} from '../config/sesion';

export interface UseSesionInactividadOptions {
  session: UserSession | null;
  activeTab?: string;
  onLogout: (motivo?: string) => Promise<void> | void;
  /** Límite total de inactividad en ms (por defecto según INACTIVIDAD_POR_ROL: 10 min) */
  limiteInactividadMs?: number;
  /** Umbral en ms para mostrar el aviso previo (por defecto: límite - AVISO_SEG) */
  inactivityThresholdMs?: number;
  /** Segundos de cuenta regresiva del aviso (por defecto: AVISO_SEG = 60) */
  warningCountdownSeconds?: number;
}

export interface UseSesionInactividadReturn {
  avisoInactividadVisible: boolean;
  segundosRestantes: number;
  renovando: boolean;
  continuarSesion: () => Promise<void>;
  cerrarSesionInactividad: () => Promise<void>;
  registrarActividad: () => void;
}

export const useSesionInactividad = ({
  session,
  onLogout,
  limiteInactividadMs,
  inactivityThresholdMs,
  warningCountdownSeconds = AVISO_SEG,
}: UseSesionInactividadOptions): UseSesionInactividadReturn => {
  const limiteTotalMs =
    limiteInactividadMs ??
    (inactivityThresholdMs !== undefined
      ? inactivityThresholdMs + warningCountdownSeconds * 1000
      : obtenerLimiteInactividadMs(session?.rol));

  const umbralAvisoMs =
    inactivityThresholdMs ??
    Math.max(1000, limiteTotalMs - warningCountdownSeconds * 1000);

  const [avisoInactividadVisible, setAvisoInactividadVisible] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(warningCountdownSeconds);
  const [renovando, setRenovando] = useState(false);

  const ultimaActividadRef = useRef<number>(Date.now());
  const ultimaEscrituraRef = useRef<number>(0);
  const avisoAbiertoRef = useRef<boolean>(false);
  const cerrandoRef = useRef<boolean>(false);
  avisoAbiertoRef.current = avisoInactividadVisible;

  const onLogoutRef = useRef(onLogout);
  onLogoutRef.current = onLogout;

  const ejecutarCierreForzado = useCallback(async (mensaje: string) => {
    if (cerrandoRef.current) return;
    cerrandoRef.current = true;
    setAvisoInactividadVisible(false);
    limpiarAlmacenamientoSesion();
    guardarAvisoSesion(mensaje);
    await onLogoutRef.current(mensaje);
  }, []);

  /**
   * Verifica de inmediato si el token venció (exp) o si se superó el límite de inactividad.
   * Retorna true si la sesión sigue vigente, o false si se disparó el cierre.
   */
  const verificarVigenciaInmediata = useCallback((): boolean => {
    if (!session || cerrandoRef.current) return false;

    const ahora = Date.now();
    let token = session.token;
    try {
      token = localStorage.getItem('GIRASOLES_TOKEN') || session.token;
    } catch {
      // Ignorar error de lectura
    }

    if (estaTokenExpirado(token, ahora)) {
      void ejecutarCierreForzado(AVISO_SESION_EXPIRADA);
      return false;
    }

    const almacenada = leerUltimaActividad();
    const ultima = almacenada !== null ? almacenada : ultimaActividadRef.current;

    if (ahora - ultima >= limiteTotalMs) {
      void ejecutarCierreForzado(AVISO_SESION_INACTIVIDAD);
      return false;
    }

    if (ahora - ultima >= umbralAvisoMs && !avisoAbiertoRef.current) {
      const restanteMs = Math.max(1000, limiteTotalMs - (ahora - ultima));
      const segs = Math.min(warningCountdownSeconds, Math.ceil(restanteMs / 1000));
      setSegundosRestantes(segs);
      setAvisoInactividadVisible(true);
    }

    return true;
  }, [session, limiteTotalMs, umbralAvisoMs, warningCountdownSeconds, ejecutarCierreForzado]);

  // Registrar actividad del usuario (limitando escritura en localStorage a 1 vez cada 15 s)
  const registrarActividad = useCallback(() => {
    if (!session || avisoAbiertoRef.current || cerrandoRef.current) return;
    const ahora = Date.now();
    ultimaActividadRef.current = ahora;
    if (ahora - ultimaEscrituraRef.current >= INTERVALO_ESCRITURA_ACTIVIDAD_MS) {
      ultimaEscrituraRef.current = ahora;
      guardarUltimaActividad(ahora);
    }
  }, [session]);

  // Inicializar estado al montar o cambiar de sesión
  useEffect(() => {
    if (!session) {
      cerrandoRef.current = false;
      setAvisoInactividadVisible(false);
      return;
    }

    cerrandoRef.current = false;
    const ahora = Date.now();
    const previa = leerUltimaActividad();

    // Verificar si la sesión guardada ya está vencida por exp o por inactividad
    let token = session.token;
    try {
      token = localStorage.getItem('GIRASOLES_TOKEN') || session.token;
    } catch {
      // Ignorar
    }

    if (estaTokenExpirado(token, ahora)) {
      void ejecutarCierreForzado(AVISO_SESION_EXPIRADA);
      return;
    }

    if (previa !== null && ahora - previa >= limiteTotalMs) {
      void ejecutarCierreForzado(AVISO_SESION_INACTIVIDAD);
      return;
    }

    const baseActividad = previa !== null ? previa : ahora;
    ultimaActividadRef.current = baseActividad;
    if (previa === null) {
      ultimaEscrituraRef.current = ahora;
      guardarUltimaActividad(ahora);
    }
  }, [session, limiteTotalMs, ejecutarCierreForzado]);

  // Suscripción global a respuestas 401 (apiClient, useRecurso, avisos, polling)
  useEffect(() => {
    if (!session) {
      setOnUnauthorizedCallback(null);
      return;
    }

    const handleUnauthorized = () => {
      void ejecutarCierreForzado(AVISO_SESION_EXPIRADA);
    };

    setOnUnauthorizedCallback(handleUnauthorized);
    window.addEventListener('girasoles:unauthorized', handleUnauthorized);

    return () => {
      setOnUnauthorizedCallback(null);
      window.removeEventListener('girasoles:unauthorized', handleUnauthorized);
    };
  }, [session, ejecutarCierreForzado]);

  // Escuchar eventos de interacción, retorno al primer plano y verificación periódica
  useEffect(() => {
    if (!session) return;

    const eventos = ['mousemove', 'touchstart', 'pointerdown', 'mousedown', 'keydown', 'scroll', 'click'];

    const handleInteraction = () => {
      registrarActividad();
    };

    eventos.forEach((ev) => window.addEventListener(ev, handleInteraction, { passive: true }));

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        verificarVigenciaInmediata();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    let removeAppListener: (() => void) | null = null;
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          verificarVigenciaInmediata();
        }
      }).then((handle) => {
        removeAppListener = () => handle.remove();
      });
    }

    const interval = setInterval(() => {
      if (cerrandoRef.current) return;

      const ahora = Date.now();
      let token = session.token;
      try {
        token = localStorage.getItem('GIRASOLES_TOKEN') || session.token;
      } catch {
        // Ignorar
      }

      if (estaTokenExpirado(token, ahora)) {
        void ejecutarCierreForzado(AVISO_SESION_EXPIRADA);
        return;
      }

      const almacenada = leerUltimaActividad();
      const ultima =
        almacenada !== null
          ? Math.max(almacenada, ultimaActividadRef.current)
          : ultimaActividadRef.current;

      const transcurrido = ahora - ultima;

      if (transcurrido >= limiteTotalMs) {
        void ejecutarCierreForzado(AVISO_SESION_INACTIVIDAD);
        return;
      }

      if (!avisoAbiertoRef.current && transcurrido >= umbralAvisoMs) {
        setSegundosRestantes(warningCountdownSeconds);
        setAvisoInactividadVisible(true);
      }
    }, 1000);

    return () => {
      eventos.forEach((ev) => window.removeEventListener(ev, handleInteraction));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (removeAppListener) removeAppListener();
      clearInterval(interval);
    };
  }, [
    session,
    limiteTotalMs,
    umbralAvisoMs,
    warningCountdownSeconds,
    registrarActividad,
    verificarVigenciaInmediata,
    ejecutarCierreForzado,
  ]);

  const cerrarSesionInactividad = useCallback(async () => {
    await ejecutarCierreForzado(AVISO_SESION_INACTIVIDAD);
  }, [ejecutarCierreForzado]);

  // Cuenta regresiva de 60 s cuando el aviso está visible
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

  // Continuar sesión: renueva actividad en memoria y localStorage, y solicita nuevo token
  const continuarSesion = useCallback(async () => {
    setRenovando(true);
    const ahora = Date.now();
    ultimaActividadRef.current = ahora;
    ultimaEscrituraRef.current = ahora;
    guardarUltimaActividad(ahora);
    try {
      await authService.renovarToken();
    } catch {
      // Si falla por red, mantener sesión activa localmente
    } finally {
      const marcaFinal = Date.now();
      ultimaActividadRef.current = marcaFinal;
      ultimaEscrituraRef.current = marcaFinal;
      guardarUltimaActividad(marcaFinal);
      setAvisoInactividadVisible(false);
      setSegundosRestantes(warningCountdownSeconds);
      setRenovando(false);
    }
  }, [warningCountdownSeconds]);

  return {
    avisoInactividadVisible,
    segundosRestantes,
    renovando,
    continuarSesion,
    cerrarSesionInactividad,
    registrarActividad,
  };
};
