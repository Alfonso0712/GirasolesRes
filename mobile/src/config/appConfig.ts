/**
 * Configuración global del modo demostración para Restaurante Girasoles Mobile.
 * MODO_DEMO es verdadero en entorno de desarrollo local (DEV) o cuando la variable
 * VITE_DEMO_MODE está explícitamente configurada en 'true' (build:demo).
 */
export const MODO_DEMO: boolean =
  import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true';
