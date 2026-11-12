/**
 * Utilidades para formato uniforme de moneda y pluralización en la aplicación móvil de Restaurante Girasoles.
 */

export function formatCurrency(amount: number): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `S/ ${safeAmount.toFixed(2)}`;
}

export function pluralizar(count: number, singular: string, plural?: string): string {
  const pluralFinal = plural ?? (singular.endsWith('s') ? singular : `${singular}s`);
  return count === 1 ? `1 ${singular}` : `${count} ${pluralFinal}`;
}
