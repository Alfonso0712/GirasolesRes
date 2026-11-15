/**
 * Reglas fiscales SUNAT para cálculo de IGV y umbral obligatorio de DNI en boletas.
 */

const FACTOR_IGV = 1.18;
export const UMBRAL_DNI_BOLETA = 700;

/**
 * Calcula la operación gravada (base imponible sin IGV 18%).
 * Respeta el valor precalculado del servidor cuando existe (> 0).
 */
export function calcularOpGravada(total: number, opGravadaReportada?: number | null): number {
  return opGravadaReportada || total / FACTOR_IGV;
}

/**
 * Calcula el IGV (18%) contenido en un importe total.
 * Respeta el valor precalculado del servidor cuando existe (> 0).
 */
export function calcularIgv(total: number, igvReportado?: number | null): number {
  return igvReportado || total - total / FACTOR_IGV;
}

/**
 * Determina si una boleta requiere DNI obligatorio por superar o igualar S/ 700.00 (norma SUNAT).
 */
export function requiereDniBoleta(total: number): boolean {
  return typeof total === 'number' && !Number.isNaN(total) && total >= UMBRAL_DNI_BOLETA;
}
