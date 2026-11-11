import { useSyncExternalStore } from 'react';
import { reproducirSonidoKds, type TipoSonidoKds } from '../utils/audioKds';

export type ModoAviso = 'completo' | 'solo-visual' | 'solo-sonoro';

export interface NotificationPrefs {
  sonidoActivado: boolean;
  volumen: number; // 0 a 100
  modoAviso: ModoAviso;
}

export const NOTIF_SONIDO_STORAGE_KEY = 'girasoles_notif_sonido';
export const NOTIF_VOLUMEN_STORAGE_KEY = 'girasoles_notif_volumen';
export const NOTIF_MODO_STORAGE_KEY = 'girasoles_notif_modo';

export const MODOS_AVISO_OPTIONS = [
  { id: 'completo' as const, label: 'Visual y sonoro', description: 'Muestra ventana emergente y reproduce sonido' },
  { id: 'solo-visual' as const, label: 'Solo visual', description: 'Muestra ventana emergente en pantalla sin emitir sonido' },
  { id: 'solo-sonoro' as const, label: 'Solo sonoro', description: 'Emite sonido sin bloquear la pantalla con modal emergente' },
];

export function getInitialNotificationPrefs(): NotificationPrefs {
  let sonidoActivado = true;
  let volumen = 80;
  let modoAviso: ModoAviso = 'completo';

  try {
    const savedSonido = localStorage.getItem(NOTIF_SONIDO_STORAGE_KEY);
    if (savedSonido === 'false') sonidoActivado = false;
    else if (savedSonido === 'true') sonidoActivado = true;

    const savedVolumen = localStorage.getItem(NOTIF_VOLUMEN_STORAGE_KEY);
    if (savedVolumen !== null) {
      const parsed = parseInt(savedVolumen, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        volumen = parsed;
      }
    }

    const savedModo = localStorage.getItem(NOTIF_MODO_STORAGE_KEY);
    if (savedModo === 'solo-visual' || savedModo === 'solo-sonoro' || savedModo === 'completo') {
      modoAviso = savedModo;
    }
  } catch {
    // localStorage no accesible
  }

  return { sonidoActivado, volumen, modoAviso };
}

let currentPrefs: NotificationPrefs = getInitialNotificationPrefs();
const listeners = new Set<() => void>();

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function updateNotificationPrefs(updates: Partial<NotificationPrefs>): void {
  const next = { ...currentPrefs, ...updates };

  try {
    if (updates.sonidoActivado !== undefined) {
      localStorage.setItem(NOTIF_SONIDO_STORAGE_KEY, String(next.sonidoActivado));
    }
    if (updates.volumen !== undefined) {
      localStorage.setItem(NOTIF_VOLUMEN_STORAGE_KEY, String(next.volumen));
    }
    if (updates.modoAviso !== undefined) {
      localStorage.setItem(NOTIF_MODO_STORAGE_KEY, next.modoAviso);
    }
  } catch {
    // Ignorar errores de almacenamiento
  }

  currentPrefs = next;
  emitChange();
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): NotificationPrefs {
  return currentPrefs;
}

function getServerSnapshot(): NotificationPrefs {
  return { sonidoActivado: true, volumen: 80, modoAviso: 'completo' };
}

export function useNotificationPrefs(): {
  prefs: NotificationPrefs;
  setSonidoActivado: (activo: boolean) => void;
  setVolumen: (volumen: number) => void;
  setModoAviso: (modo: ModoAviso) => void;
  probarSonido: (tipo?: TipoSonidoKds) => void;
} {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    prefs,
    setSonidoActivado: (sonidoActivado: boolean) => updateNotificationPrefs({ sonidoActivado }),
    setVolumen: (volumen: number) => updateNotificationPrefs({ volumen }),
    setModoAviso: (modoAviso: ModoAviso) => updateNotificationPrefs({ modoAviso }),
    probarSonido: (tipo: TipoSonidoKds = 'lista') => {
      reproducirSonidoKds(tipo, true, prefs.volumen / 100);
    },
  };
}

export default useNotificationPrefs;
