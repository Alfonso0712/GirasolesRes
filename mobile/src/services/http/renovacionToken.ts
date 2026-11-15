// MÓDULO PROTEGIDO: conexión. No modificar sin actualizar mobile/CONNECTION.md y scripts/verify-connection.mjs

import { obtenerUrlBase } from '../../config/serverConfig';

let renewalPromise: Promise<string | null> | null = null;

function parseJwtExp(token: string): number | null {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed: unknown = JSON.parse(jsonPayload);
    if (typeof parsed === 'object' && parsed !== null && 'exp' in parsed && typeof parsed.exp === 'number') {
      return parsed.exp;
    }
    return null;
  } catch {
    return null;
  }
}

function updateStoredToken(newToken: string): void {
  try {
    localStorage.setItem('GIRASOLES_TOKEN', newToken);
    const rawSession = localStorage.getItem('GIRASOLES_SESSION');
    if (!rawSession) return;
    const parsed: unknown = JSON.parse(rawSession);
    if (typeof parsed === 'object' && parsed !== null) {
      localStorage.setItem('GIRASOLES_SESSION', JSON.stringify({ ...parsed, token: newToken }));
    }
  } catch {
    // Ignorar errores de acceso a almacenamiento
  }
}

function extraerTokenRespuesta(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null;
  if ('token' in data && typeof data.token === 'string' && data.token) {
    return data.token;
  }
  if ('data' in data && typeof data.data === 'object' && data.data !== null) {
    const nested = data.data;
    if ('token' in nested && typeof nested.token === 'string' && nested.token) {
      return nested.token;
    }
  }
  return null;
}

async function solicitarRenovacion(currentToken: string): Promise<string | null> {
  try {
    const base = obtenerUrlBase();
    const cleanBase = base.endsWith('/api') ? base : `${base}/api`;
    const res = await fetch(`${cleanBase}/auth/renovar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const nuevoToken = extraerTokenRespuesta(data);
    if (nuevoToken) {
      updateStoredToken(nuevoToken);
      return nuevoToken;
    }
    return null;
  } catch {
    return null;
  } finally {
    renewalPromise = null;
  }
}

async function intentarRenovarToken(currentToken: string): Promise<string | null> {
  if (renewalPromise) return renewalPromise;
  renewalPromise = solicitarRenovacion(currentToken);
  return renewalPromise;
}

export function esRutaAuthEspecial(endpoint: string): boolean {
  return (
    endpoint.includes('/auth/login') ||
    endpoint.includes('/auth/logout') ||
    endpoint.includes('/auth/renovar')
  );
}

export async function resolverTokenPeticion(
  tokenExplicito?: string,
  evitarRenovacion: boolean = false
): Promise<string | undefined> {
  const authToken = tokenExplicito || localStorage.getItem('GIRASOLES_TOKEN') || undefined;
  if (!authToken || evitarRenovacion) return authToken;

  const exp = parseJwtExp(authToken);
  if (exp === null) return authToken;

  const segundosRestantes = exp - Math.floor(Date.now() / 1000);
  if (segundosRestantes > 0 && segundosRestantes < 300) {
    return (await intentarRenovarToken(authToken)) ?? authToken;
  }
  return authToken;
}
