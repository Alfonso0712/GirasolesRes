import { useSyncExternalStore } from 'react';
import { perfilService } from '../services/perfilService';

export type Handedness = 'right' | 'left';

const DEVICE_KEY = 'girasoles_handedness';

export function getDeviceHandedness(): Handedness {
  try {
    const saved = localStorage.getItem(DEVICE_KEY);
    if (saved === 'left' || saved === 'zurdo') {
      return 'left';
    }
    if (saved === 'right' || saved === 'diestro') {
      return 'right';
    }
  } catch {
    // ignorar error de acceso a storage
  }
  return 'right';
}

let currentHandedness: Handedness = getDeviceHandedness();
const listeners = new Set<() => void>();

export function applyHandednessClass(handedness: Handedness) {
  if (typeof document !== 'undefined' && document.documentElement) {
    const esZurdo = handedness === 'left';
    document.documentElement.classList.toggle('zurdo', esZurdo);
    document.documentElement.classList.toggle('diestro', !esZurdo);
    document.documentElement.classList.toggle('left-handed', esZurdo);
    document.documentElement.setAttribute('data-handedness', handedness);
  }
}

// Aplicar al cargar el módulo
applyHandednessClass(currentHandedness);

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function setHandedness(handedness: Handedness) {
  try {
    localStorage.setItem(DEVICE_KEY, handedness);
  } catch {
    // ignorar
  }

  currentHandedness = handedness;
  applyHandednessClass(handedness);
  emitChange();
  // Sincronización asíncrona no bloqueante con el backend
  void perfilService.actualizarOrientacion(handedness);
}

export function toggleHandedness() {
  setHandedness(currentHandedness === 'left' ? 'right' : 'left');
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
  orientacion: 'diestro' | 'zurdo';
  isLeftHanded: boolean;
  setHandedness: (h: Handedness) => void;
  toggleHandedness: () => void;
} {
  const handedness = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    handedness,
    orientacion: handedness === 'left' ? 'zurdo' : 'diestro',
    isLeftHanded: handedness === 'left',
    setHandedness,
    toggleHandedness,
  };
}
