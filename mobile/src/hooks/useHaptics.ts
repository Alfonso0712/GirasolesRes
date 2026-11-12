import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export function useHaptics() {
  const triggerLight = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Ignorar en navegadores web que no soporten Haptics API
      if ('vibrate' in navigator) {
        navigator.vibrate(15);
      }
    }
  };

  const triggerMedium = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }
  };

  const triggerSuccess = async () => {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      if ('vibrate' in navigator) {
        navigator.vibrate([20, 50, 20]);
      }
    }
  };

  const triggerError = async () => {
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch {
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50]);
      }
    }
  };

  return { triggerLight, triggerMedium, triggerSuccess, triggerError };
}
