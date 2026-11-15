/**
 * Reglas de cálculo de arqueo y efectivo esperado en caja.
 */

/**
 * Calcula el efectivo esperado parcial en caja sumando el fondo inicial de apertura
 * (0 si no hay dato) y el total recaudado en efectivo.
 */
export function calcularEfectivoEsperado(
  montoInicial: number | undefined | null,
  totalEfectivo: number
): number {
  return (montoInicial ?? 0) + totalEfectivo;
}
