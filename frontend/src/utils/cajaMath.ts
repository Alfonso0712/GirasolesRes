/**
 * Utilidades matemáticas y validaciones puras para el arqueo y cierre de caja.
 */

export const parseContado = (input: string): number | null => {
  if (!input.trim()) return null;
  const norm = input.replace(',', '.');
  const parsed = parseFloat(norm);
  return isNaN(parsed) || parsed < 0 ? null : Math.round(parsed * 100) / 100;
};

export const calcularDiferenciaCierre = (
  contado: number | null,
  efectivoEsperado: number | undefined
): number | null => {
  if (contado === null || efectivoEsperado === undefined) return null;
  return Math.round((contado - efectivoEsperado) * 100) / 100;
};

export interface ValidarCierreResult {
  ok: boolean;
  contado?: number;
  obs?: string;
  error?: string;
}

export const validarCierreCaja = (
  contadoNumerico: number | null,
  observacion: string
): ValidarCierreResult => {
  if (contadoNumerico === null) {
    return { ok: false, error: 'Ingrese el efectivo contado.' };
  }
  if (contadoNumerico > 99999.99) {
    return { ok: false, error: 'El monto no puede superar S/ 99,999.99.' };
  }
  if (observacion.length > 200) {
    return { ok: false, error: 'La observación no puede superar los 200 caracteres.' };
  }
  return { ok: true, contado: contadoNumerico, obs: observacion.trim() };
};
