/**
 * Reglas de cálculo para indicadores y gráficos de reportes gerenciales.
 */

/**
 * Calcula el porcentaje (4% a 100%) para la barra visual del ranking de platos vendidos.
 */
export function calcularPorcentajeBarraRanking(cantidad: number, maxCantidad: number): number {
  if (maxCantidad <= 0) return 4;
  return Math.max(4, Math.min(100, Math.round((cantidad / maxCantidad) * 100)));
}
