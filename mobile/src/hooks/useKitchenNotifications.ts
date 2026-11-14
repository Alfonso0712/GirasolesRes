import { useState, useEffect, useRef, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { avisoService } from '../services/avisoService';
import { reproducirSonidoKds, desbloquearAudioKds } from '../utils/audioKds';
import { useHaptics } from './useHaptics';
import type { RolUsuario } from '../types/auth';
import type { AvisoComandaDto } from '../types/pedido';

export interface UseKitchenNotificationsProps {
  rol?: RolUsuario;
  enabled?: boolean;
  onNuevoAviso?: (aviso: AvisoComandaDto) => void;
}

export function useKitchenNotifications({
  rol,
  enabled = true,
  onNuevoAviso,
}: UseKitchenNotificationsProps) {
  const [avisos, setAvisos] = useState<AvisoComandaDto[]>([]);
  const avisosPreviosRef = useRef<Set<string>>(new Set());
  const primeraCargaRef = useRef<boolean>(true);
  const estaVisibleRef = useRef<boolean>(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { triggerSuccess } = useHaptics();

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

  const puedeConsultar = enabled && (rol === 'Mozo' || rol === 'Cajero' || rol === 'Administrador');

  const consultarAvisos = useCallback(async () => {
    if (!puedeConsultar || !estaVisibleRef.current) return;
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
            triggerSuccess();
            reproducirSonidoKds('lista');
            nuevos.forEach((a) => {
              onNuevoAviso?.(a);
            });
          }
          avisosPreviosRef.current = new Set(lista.map((a) => a.id));
        }
      }
    } catch {
      // Ignorar fallas temporales de red en sondeo
    }
  }, [puedeConsultar, triggerSuccess, onNuevoAviso]);

  const marcarVisto = useCallback(async (id: string) => {
    try {
      await avisoService.marcarAvisoVisto(id);
      setAvisos((prev) => prev.filter((a) => a.id !== id));
      avisosPreviosRef.current.delete(id);
    } catch (err) {
      console.warn('Error al marcar aviso de comanda visto:', err);
    }
  }, []);

  useEffect(() => {
    if (!puedeConsultar) {
      setAvisos([]);
      return;
    }

    consultarAvisos();

    const iniciarTimer = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (estaVisibleRef.current) {
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

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      estaVisibleRef.current = visible;
      if (visible) {
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
        if (isActive) {
          consultarAvisos();
          iniciarTimer();
        } else {
          detenerTimer();
        }
      }).then((handle) => {
        removeAppListener = () => handle.remove();
      });
    }

    return () => {
      detenerTimer();
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
