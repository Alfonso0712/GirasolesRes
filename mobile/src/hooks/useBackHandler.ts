import { useEffect } from 'react';

export type BackHandler = () => boolean | void;

// Pila LIFO de manejadores: el último registrado se ejecuta primero
const handlersStack: BackHandler[] = [];

/**
 * Registra un manejador en el tope de la pila y retorna la función para desuscribirse.
 */
export function pushBackHandler(handler: BackHandler): () => void {
  handlersStack.push(handler);
  return () => {
    const index = handlersStack.lastIndexOf(handler);
    if (index >= 0) {
      handlersStack.splice(index, 1);
    }
  };
}

/**
 * Ejecuta el manejador en el tope de la pila.
 * Retorna true si un manejador consumió el evento, o false si la pila estaba vacía / ninguno lo consumió.
 */
export function executeTopBackHandler(): boolean {
  for (let i = handlersStack.length - 1; i >= 0; i--) {
    const handler = handlersStack[i];
    const fueManejado = handler();
    // Si retorna explícitamente false, permite que continúe; si no (void o true), se considera manejado
    if (fueManejado !== false) {
      return true;
    }
  }
  return false;
}

/**
 * Hook para registrar un manejador del botón Atrás mientras la condición 'estaActivo' sea verdadera.
 */
export function useBackHandler(estaActivo: boolean, handler: BackHandler): void {
  useEffect(() => {
    if (!estaActivo) return;
    const unregister = pushBackHandler(handler);
    return unregister;
  }, [estaActivo, handler]);
}
