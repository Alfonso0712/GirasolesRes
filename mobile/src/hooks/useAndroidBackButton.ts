import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { executeTopBackHandler } from './useBackHandler';

interface UseAndroidBackButtonOptions {
  currentTab: string;
  initialTab: string;
  onGoToInitialTab: () => void;
  showToast: (mensaje: string) => void;
}

/**
 * Hook que registra el oyente del botón Atrás de Android a nivel de aplicación en plataformas nativas.
 * Aplica las 4 prioridades canónicas:
 * 1. Modales y BottomSheets abiertos.
 * 2. Descarte o retroceso de subvistas con cambios sin guardar.
 * 3. Retorno a la pestaña inicial del rol si está en una pestaña secundaria.
 * 4. Doble pulsación en 2 s en la pestaña inicial para salir de la aplicación.
 */
export function useAndroidBackButton({
  currentTab,
  initialTab,
  onGoToInitialTab,
  showToast,
}: UseAndroidBackButtonOptions): void {
  const lastBackPressRef = useRef<number>(0);

  // Referencias mutables para mantener los valores actualizados sin recrear el listener nativo
  const currentTabRef = useRef(currentTab);
  currentTabRef.current = currentTab;

  const initialTabRef = useRef(initialTab);
  initialTabRef.current = initialTab;

  const onGoToInitialTabRef = useRef(onGoToInitialTab);
  onGoToInitialTabRef.current = onGoToInitialTab;

  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let isSubscribed = true;

    const setupListener = async () => {
      const handle = await CapacitorApp.addListener('backButton', () => {
        // Prioridad 1 y 2: Intentar ejecutar manejadores en la pila (modales, BottomSheets o subvistas)
        const handledByStack = executeTopBackHandler();
        if (handledByStack) {
          return;
        }

        // Prioridad 3: Si no está en la pestaña inicial del rol, volver a ella
        if (currentTabRef.current !== initialTabRef.current) {
          onGoToInitialTabRef.current();
          return;
        }

        // Prioridad 4: Si ya está en la pestaña inicial, confirmación de 2 s para salir
        const now = Date.now();
        if (now - lastBackPressRef.current < 2000) {
          void CapacitorApp.exitApp();
        } else {
          lastBackPressRef.current = now;
          showToastRef.current('Presione de nuevo para salir');
        }
      });

      if (!isSubscribed) {
        void handle.remove();
      }

      return handle;
    };

    const handlePromise = setupListener();

    return () => {
      isSubscribed = false;
      void handlePromise.then((h) => h?.remove());
    };
  }, []);
}
