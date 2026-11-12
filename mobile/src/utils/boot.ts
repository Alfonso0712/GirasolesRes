/**
 * Utilidad de control de pantalla de arranque (#boot) para Restaurante Girasoles.
 * Garantiza un tiempo mínimo visible de 600 ms y transición de salida suave (250 ms)
 * para evitar parpadeos visuales al inicializar la aplicación.
 */

const bootStartTime: number =
  (typeof window !== 'undefined' && (window as unknown as { __bootStartTime?: number }).__bootStartTime) ||
  (typeof performance !== 'undefined' ? performance.now() : Date.now());

const MIN_BOOT_DURATION_MS = 600;
const FADE_OUT_DURATION_MS = 250;

let isReady = false;

export function markAppReady(): void {
  if (isReady) return;
  isReady = true;

  const bootEl = document.getElementById('boot');
  if (!bootEl) return;

  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const elapsed = now - bootStartTime;
  const remaining = Math.max(0, MIN_BOOT_DURATION_MS - elapsed);

  setTimeout(() => {
    bootEl.style.transition = `opacity ${FADE_OUT_DURATION_MS}ms ease, visibility ${FADE_OUT_DURATION_MS}ms ease`;
    bootEl.style.opacity = '0';
    bootEl.style.pointerEvents = 'none';

    setTimeout(() => {
      bootEl.remove();
    }, FADE_OUT_DURATION_MS);
  }, remaining);
}
