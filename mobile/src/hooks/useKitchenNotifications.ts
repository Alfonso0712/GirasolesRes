import { useState, useEffect, useRef, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { esSesionAlmacenadaValida } from '../config/sesion';
import { puede } from '../config/permisos';
import { avisoService } from '../services/avisoService';
import { reproducirSonidoKds, desbloquearAudioKds } from '../utils/audioKds';
import { esApiError, extraerEstadoError } from '../utils/errores';
import { useHaptics } from './useHaptics';
import { useAccionConAviso } from './useAccionConAviso';
import type { RolUsuario } from '../types/auth';
import type { AvisoComandaDto } from '../types/pedido';

export interface UseKitchenNotificationsProps {
  rol?: RolUsuario;
  enabled?: boolean;
  onNuevoAviso?: (aviso: AvisoComandaDto) => void;
}

export function useKitchenNotifications({
  rol,
  enabled: estaHabilitado = true,
  onNuevoAviso,
}: UseKitchenNotificationsProps) {
  const [avisos, setAvisos] = useState<AvisoComandaDto[]>([]);
  const avisosPreviosRef = useRef<Set<string>>(new Set());
  const primeraCargaRef = useRef<boolean>(true);
  const estaVisibleRef = useRef<boolean>(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { triggerSuccess } = useHaptics();
  const { ejecutar } = useAccionConAviso();
  const triggerSuccessRef = useRef(triggerSuccess);
  triggerSuccessRef.current = triggerSuccess;

  const onNuevoAvisoRef = useRef(onNuevoAviso);
  onNuevoAvisoRef.current = onNuevoAviso;

  // Desbloqueo preventivo de AudioContext en cualquier interacción
  useEffect(() => {
    const unlock = () => desbloquearAudioKds();
    window.addEventListener('click', unlock, { passive: true, once: true });
    window.addEventListener('touchstart', unlock, { passive: true, once: true });
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  const puedeConsultar = estaHabilitado && puede(rol, 'avisos.consultar');

  const consultarAvisos = useCallback(async () => {
    if (!puedeConsultar || !estaVisibleRef.current || !esSesionAlmacenadaValida()) return;
    try {
      const lista = await avisoService.obtenerAvisosPendientes();
      if (Array.isArray(lista)) {
        setAvisos(lista);

        if (primeraCargaRef.current) {
          primeraCargaRef.current = false;
          avisosPreviosRef.current = new Set(lista.map((a) => a.id));
        } else {
          // Detectar avisos que no estaban en el sondeo previo
          const nuevos = lista.filter((a) => !avisosPreviosRef.current.has(a.id));
          if (nuevos.length > 0) {
            triggerSuccessRef.current();
            reproducirSonidoKds('lista');
            nuevos.forEach((a) => {
              onNuevoAvisoRef.current?.(a);
            });
          }
          avisosPreviosRef.current = new Set(lista.map((a) => a.id));
        }
      }
    } catch (err: unknown) {
      const status = esApiError(err) ? err.status : extraerEstadoError(err);
      if (status === 401) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('girasoles:unauthorized'));
        }
      }
      // Ignorar fallas temporales de red en sondeo
    }
  }, [puedeConsultar]);

  const marcarVisto = useCallback(
    async (id: string) => {
      const estaMarcadoVisto = await ejecutar(() => avisoService.marcarAvisoVisto(id), {
        mensajeError: 'No se pudo marcar el aviso como visto.',
        reintentar: () => marcarVisto(id),
      });
      if (estaMarcadoVisto) {
        setAvisos((prev) => prev.filter((a) => a.id !== id));
        avisosPreviosRef.current.delete(id);
      }
    },
    [ejecutar]
  );

  useEffect(() => {
    if (!puedeConsultar || !esSesionAlmacenadaValida()) {
      setAvisos([]);
      return;
    }

    consultarAvisos();

    const iniciarTimer = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (estaVisibleRef.current && esSesionAlmacenadaValida()) {
          consultarAvisos();
        }
      }, 5000);
    };

    const detenerTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    iniciarTimer();

    const handleUnauthorized = () => {
      detenerTimer();
      setAvisos([]);
    };
    window.addEventListener('girasoles:unauthorized', handleUnauthorized);

    const handleVisibilityChange = () => {
      const estaVisible = document.visibilityState === 'visible';
      estaVisibleRef.current = estaVisible;
      if (estaVisible && esSesionAlmacenadaValida()) {
        consultarAvisos();
        iniciarTimer();
      } else {
        detenerTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    let removeAppListener: (() => void) | null = null;
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        estaVisibleRef.current = isActive;
        if (isActive && esSesionAlmacenadaValida()) {
          consultarAvisos();
          iniciarTimer();
        } else {
          detenerTimer();
        }
      }).then((suscripcionListener) => {
        removeAppListener = () => suscripcionListener.remove();
      });
    }

    return () => {
      detenerTimer();
      window.removeEventListener('girasoles:unauthorized', handleUnauthorized);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (removeAppListener) removeAppListener();
    };
  }, [puedeConsultar, consultarAvisos]);

  return {
    avisos,
    conteoAvisos: avisos.length,
    marcarVisto,
    recargarAvisos: consultarAvisos,
  };
}
