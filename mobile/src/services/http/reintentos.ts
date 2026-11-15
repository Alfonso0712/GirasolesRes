// MÓDULO PROTEGIDO: conexión. No modificar sin actualizar mobile/CONNECTION.md y scripts/verify-connection.mjs

import { ApiError } from './errorHttp';

const DEMORAS_REINTENTO = [1000, 2000, 4000] as const;

function esFalloReintentable(err: unknown): boolean {
  return (
    err instanceof ApiError &&
    (err.tipo === 'sin-respuesta' || err.tipo === 'timeout' || err.status === 0)
  );
}

/**
 * Ejecuta una consulta GET con reintentos y espera creciente exponencial (1 s, 2 s, 4 s; máx 3 reintentos).
 * Exclusivo para consultas idempotentes (GET); nunca se aplica a mutaciones ni operaciones de dinero o pedidos.
 */
export async function ejecutarConReintentos<T>(
  operacion: () => Promise<T>,
  intentosMaximos: number = 3
): Promise<T> {
  let intento = 0;

  while (true) {
    try {
      return await operacion();
    } catch (err: unknown) {
      intento++;
      if (esFalloReintentable(err) && intento <= intentosMaximos) {
        const espera = DEMORAS_REINTENTO[intento - 1] ?? 4000;
        await new Promise((resolve) => setTimeout(resolve, espera));
        continue;
      }
      throw err;
    }
  }
}
