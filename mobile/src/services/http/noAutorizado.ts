// MÓDULO PROTEGIDO: conexión. No modificar sin actualizar mobile/CONNECTION.md y scripts/verify-connection.mjs

export type UnauthorizedHandler = () => void;

let onUnauthorizedCallback: UnauthorizedHandler | null = null;

export function setOnUnauthorizedCallback(handler: UnauthorizedHandler | null): void {
  onUnauthorizedCallback = handler;
}

export function manejarNoAutorizado(): void {
  try {
    localStorage.removeItem('GIRASOLES_TOKEN');
    localStorage.removeItem('GIRASOLES_SESSION');
  } catch {
    // Ignorar errores de acceso a almacenamiento
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('girasoles:unauthorized'));
  }

  if (onUnauthorizedCallback) {
    try {
      onUnauthorizedCallback();
    } catch {
      // Ignorar errores del callback
    }
  }
}
