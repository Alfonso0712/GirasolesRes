import { useState, useEffect, useCallback } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const CLAVE_HAPTICS = 'girasoles_haptics';

function sonHapticsHabilitados(): boolean {
  try {
    const val = localStorage.getItem(CLAVE_HAPTICS);
    if (val === null) return true; // Activada por defecto
    return val !== 'false';
  } catch {
    return true;
  }
}

async function ejecutarConRespaldo(
  accionNativa: () => Promise<void>,
  duracionRespaldoMs: number = 20
): Promise<boolean> {
  if (!sonHapticsHabilitados()) {
    return false;
  }

  try {
    await accionNativa();
    return true;
  } catch {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        const tieneVibracion = navigator.vibrate(duracionRespaldoMs);
        return Boolean(tieneVibracion);
      }
    } catch {
      // Ignorar errores del navegador
    }
    return false;
  }
}

export function useHaptics() {
  const [estaHapticsHabilitado, setHapticsState] = useState<boolean>(() => sonHapticsHabilitados());

  useEffect(() => {
    const handleSync = () => {
      setHapticsState(sonHapticsHabilitados());
    };
    window.addEventListener('girasoles:haptics-change', handleSync);
    return () => {
      window.removeEventListener('girasoles:haptics-change', handleSync);
    };
  }, []);

  const setHapticsHabilitado = useCallback((estaActivo: boolean) => {
    try {
      localStorage.setItem(CLAVE_HAPTICS, estaActivo ? 'true' : 'false');
    } catch {
      // Ignorar error de almacenamiento
    }
    setHapticsState(estaActivo);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('girasoles:haptics-change'));
    }
  }, []);

  const triggerLight = useCallback(async (): Promise<boolean> => {
    return ejecutarConRespaldo(() => Haptics.impact({ style: ImpactStyle.Light }), 20);
  }, []);

  const triggerMedium = useCallback(async (): Promise<boolean> => {
    return ejecutarConRespaldo(() => Haptics.impact({ style: ImpactStyle.Medium }), 20);
  }, []);

  const triggerSuccess = useCallback(async (): Promise<boolean> => {
    return ejecutarConRespaldo(
      () => Haptics.notification({ type: NotificationType.Success }),
      20
    );
  }, []);

  const triggerError = useCallback(async (): Promise<boolean> => {
    return ejecutarConRespaldo(
      () => Haptics.notification({ type: NotificationType.Error }),
      20
    );
  }, []);

  const probarHaptics = useCallback(async (): Promise<boolean> => {
    return ejecutarConRespaldo(() => Haptics.impact({ style: ImpactStyle.Medium }), 20);
  }, []);

  return {
    hapticsHabilitado: estaHapticsHabilitado,
    setHapticsHabilitado,
    triggerLight,
    triggerMedium,
    triggerSuccess,
    triggerError,
    probarHaptics,
  };
}
