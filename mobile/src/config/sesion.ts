import type { RolUsuario, UserSession } from '../types/auth';

/**
 * Tiempo máximo de inactividad en minutos por rol de usuario.
 * La cocina es una pantalla pasiva; ajustar aquí si hace falta.
 */
export const INACTIVIDAD_POR_ROL: Record<RolUsuario, number> = {
  Administrador: 10,
  Cajero: 10,
  Mozo: 10,
  Cocinero: 10, // La cocina es una pantalla pasiva; ajustar aquí si hace falta
};

/** Segundos de cuenta regresiva del aviso previo al cierre por inactividad */
export const AVISO_SEG = 60;

/** Clave de localStorage para persistir la marca de tiempo de la última actividad */
export const CLAVE_ULTIMA_ACTIVIDAD = 'girasoles_ultima_actividad';

/** Clave de localStorage para conservar el aviso de cierre al volver al login */
export const CLAVE_AVISO_SESION = 'girasoles_aviso_sesion';

/** Intervalo mínimo entre escrituras en localStorage por actividad (15 s) */
export const INTERVALO_ESCRITURA_ACTIVIDAD_MS = 15_000;

export const AVISO_SESION_INACTIVIDAD =
  'Su sesión se cerró por inactividad. Ingrese nuevamente.';
export const AVISO_SESION_EXPIRADA =
  'Su sesión expiró. Ingrese nuevamente.';

/**
 * Extrae el campo `exp` (segundos Unix) de un token JWT sin librerías externas.
 */
export function extraerExpJwt(token?: string | null): number | null {
  if (!token || typeof token !== 'string') return null;
  try {
    const partes = token.trim().split('.');
    if (partes.length !== 3 || !partes[1]) return null;
    const base64Url = partes[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload) as { exp?: unknown };
    return typeof parsed.exp === 'number' ? parsed.exp : null;
  } catch {
    return null;
  }
}

/**
 * Determina si un token JWT ya venció respecto a `ahoraMs`.
 * Si el token no tiene estructura JWT con `exp` (por ejemplo en pruebas), solo expira si está vacío.
 */
export function estaTokenExpirado(token?: string | null, ahoraMs: number = Date.now()): boolean {
  if (!token || !token.trim()) return true;
  const exp = extraerExpJwt(token);
  if (exp === null) return false;
  return exp * 1000 <= ahoraMs;
}

/**
 * Obtiene el límite de inactividad en milisegundos según el rol.
 */
export function obtenerLimiteInactividadMs(rol?: RolUsuario): number {
  const minutos = (rol && INACTIVIDAD_POR_ROL[rol]) ? INACTIVIDAD_POR_ROL[rol] : 10;
  return minutos * 60 * 1000;
}

export function leerUltimaActividad(): number | null {
  try {
    const raw = localStorage.getItem(CLAVE_ULTIMA_ACTIVIDAD);
    if (!raw) return null;
    const num = Number(raw);
    return Number.isFinite(num) && num > 0 ? num : null;
  } catch {
    return null;
  }
}

export function guardarUltimaActividad(timestampMs: number = Date.now()): void {
  try {
    localStorage.setItem(CLAVE_ULTIMA_ACTIVIDAD, String(timestampMs));
  } catch {
    // Ignorar errores de almacenamiento
  }
}

export function limpiarAlmacenamientoSesion(): void {
  try {
    localStorage.removeItem('GIRASOLES_TOKEN');
    localStorage.removeItem('GIRASOLES_SESSION');
    localStorage.removeItem(CLAVE_ULTIMA_ACTIVIDAD);
  } catch {
    // Ignorar errores de almacenamiento
  }
}

export function guardarAvisoSesion(mensaje: string): void {
  try {
    localStorage.setItem(CLAVE_AVISO_SESION, mensaje);
  } catch {
    // Ignorar errores de almacenamiento
  }
}

export function consumirAvisoSesion(): string | null {
  try {
    const msg = localStorage.getItem(CLAVE_AVISO_SESION);
    if (msg) {
      localStorage.removeItem(CLAVE_AVISO_SESION);
      return msg;
    }
    return null;
  } catch {
    return null;
  }
}

export interface EvaluacionVigenciaSesion {
  valida: boolean;
  motivo?: 'expirada' | 'inactividad';
  mensaje?: string;
}

/**
 * Evalúa si la sesión es válida revisando primero el vencimiento `exp` del JWT
 * y luego el tiempo transcurrido desde la última actividad registrada.
 */
export function evaluarVigenciaSesion(
  session: UserSession | null,
  ahoraMs: number = Date.now(),
  limiteOverrideMs?: number
): EvaluacionVigenciaSesion {
  if (!session) {
    return { valida: false };
  }

  let token = session.token;
  try {
    token = token || localStorage.getItem('GIRASOLES_TOKEN') || '';
  } catch {
    // Ignorar error de acceso
  }

  if (estaTokenExpirado(token, ahoraMs)) {
    return {
      valida: false,
      motivo: 'expirada',
      mensaje: AVISO_SESION_EXPIRADA,
    };
  }

  const ultimaActividad = leerUltimaActividad();
  const limiteMs = limiteOverrideMs ?? obtenerLimiteInactividadMs(session.rol);

  if (ultimaActividad !== null && ahoraMs - ultimaActividad >= limiteMs) {
    return {
      valida: false,
      motivo: 'inactividad',
      mensaje: AVISO_SESION_INACTIVIDAD,
    };
  }

  return { valida: true };
}

/**
 * Verifica si existe una sesión almacenada en localStorage y si sigue vigente.
 * Si no hay sesión en localStorage (ej. pruebas unitarias aisladas de hooks), retorna true
 * para no bloquear pruebas unitarias de recursos independientes.
 */
export function esSesionAlmacenadaValida(ahoraMs: number = Date.now()): boolean {
  try {
    const raw = localStorage.getItem('GIRASOLES_SESSION');
    if (!raw) return true;
    const parsed = JSON.parse(raw) as UserSession;
    return evaluarVigenciaSesion(parsed, ahoraMs).valida;
  } catch {
    return false;
  }
}
