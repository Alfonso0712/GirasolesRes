import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  sinConexion: boolean;
}

/**
 * Hook para monitoreo de conectividad de red en tiempo real.
 * Reacciona a eventos online/offline de la ventana, navigator.onLine y
 * fallos de conexión reportados por la capa HTTP (apiClient).
 */
export function useNetworkStatus(onReconexion?: () => void): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  const [falloRedReciente, setFalloRedReciente] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let estabaDesconectado = !navigator.onLine;

    const handleOnline = () => {
      setIsOnline(true);
      setFalloRedReciente(false);
      if (estabaDesconectado) {
        estabaDesconectado = false;
        window.dispatchEvent(new CustomEvent('girasoles:reload-active-view'));
        onReconexion?.();
      }
    };

    const handleOffline = () => {
      estabaDesconectado = true;
      setIsOnline(false);
    };

    const handleNetworkSuccess = () => {
      setFalloRedReciente(false);
      if (navigator.onLine && !isOnline) {
        handleOnline();
      }
    };

    const handleNetworkError = () => {
      setFalloRedReciente(true);
      estabaDesconectado = true;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('girasoles:network-success', handleNetworkSuccess);
    window.addEventListener('girasoles:network-error', handleNetworkError);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('girasoles:network-success', handleNetworkSuccess);
      window.removeEventListener('girasoles:network-error', handleNetworkError);
    };
  }, [isOnline, onReconexion]);

  const sinConexion = !isOnline || falloRedReciente;

  return {
    isOnline: !sinConexion,
    sinConexion,
  };
}
