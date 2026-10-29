import { useSyncExternalStore } from 'react';

export type Handedness = 'right' | 'left';

const PREFIX = 'girasoles_handedness_';
const DEVICE_KEY = 'girasoles_handedness';

export function getDeviceHandedness(): Handedness {
  try {
    const saved = localStorage.getItem(DEVICE_KEY);
    if (saved === 'left' || saved === 'right') {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'right';
}

function getActiveUsername(): string | null {
  try {
    const sessionRaw = localStorage.getItem('girasoles_session');
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (parsed && typeof parsed.usuario === 'string') {
        return parsed.usuario.toLowerCase().trim();
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function getHandednessForUser(username?: string): Handedness {
  const user = (username || getActiveUsername())?.toLowerCase().trim();
  if (!user) {
    // Pantalla pública sin usuario identificado (ej. Login)
    return getDeviceHandedness();
  }
  try {
    const saved = localStorage.getItem(`${PREFIX}${user}`);
    if (saved === 'left' || saved === 'right') {
      return saved;
    }
  } catch {
    // ignore
  }
  // Un usuario específico sin configuración previa siempre inicia diestro
  return 'right';
}

function getInitialHandedness(): Handedness {
  const activeUser = getActiveUsername();
  if (activeUser) {
    return getHandednessForUser(activeUser);
  }
  return getDeviceHandedness();
}

let currentHandedness: Handedness = getInitialHandedness();
const listeners = new Set<() => void>();

function applyHandednessClass(handedness: Handedness) {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('left-handed', handedness === 'left');
    document.documentElement.setAttribute('data-handedness', handedness);
  }
}

// Ensure handedness class is applied on module load
applyHandednessClass(currentHandedness);

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function setHandedness(handedness: Handedness, username?: string) {
  const user = (username || getActiveUsername())?.toLowerCase().trim();
  try {
    localStorage.setItem(DEVICE_KEY, handedness);
    if (user) {
      localStorage.setItem(`${PREFIX}${user}`, handedness);
    }
  } catch {
    // ignore quota errors
  }

  if (currentHandedness !== handedness) {
    currentHandedness = handedness;
    applyHandednessClass(handedness);
    emitChange();
  }
}

/**
 * Aplica la preferencia del usuario especificado (llamado al iniciar sesión o restaurar sesión)
 */
export function applyUserHandedness(username?: string) {
  const userHandedness = getHandednessForUser(username);
  if (currentHandedness !== userHandedness) {
    currentHandedness = userHandedness;
    applyHandednessClass(userHandedness);
    emitChange();
  }
}

/**
 * Restablece a la orientación predeterminada (diestro) al cerrar sesión o en tests
 */
export function resetHandednessToDefault() {
  if (currentHandedness !== 'right') {
    currentHandedness = 'right';
    applyHandednessClass('right');
    emitChange();
  }
}

export function toggleHandedness(username?: string) {
  setHandedness(currentHandedness === 'left' ? 'right' : 'left', username);
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): Handedness {
  return currentHandedness;
}

function getServerSnapshot(): Handedness {
  return 'right';
}

export function useHandedness(): {
  handedness: Handedness;
  isLeftHanded: boolean;
  setHandedness: (h: Handedness, username?: string) => void;
  toggleHandedness: (username?: string) => void;
} {
  const handedness = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    handedness,
    isLeftHanded: handedness === 'left',
    setHandedness,
    toggleHandedness,
  };
}
