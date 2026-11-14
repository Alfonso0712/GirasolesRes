/**
 * Utilidades para formato uniforme de moneda y pluralización en la aplicación móvil de Restaurante Girasoles.
 */

export function formatCurrency(amount: number): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `S/ ${safeAmount.toFixed(2)}`;
}

/**
 * Formatea una cantidad junto a su sustantivo en singular o plural.
 * Contrato: `pluralizar(n, 'plato', 'platos')` devuelve `"1 plato"` o `"3 platos"` (incluye el número `n`).
 * Nunca se debe anteponer `n` fuera de la llamada a `pluralizar`.
 */
export function pluralizar(count: number, singular: string, plural?: string): string {
  const safeCount = typeof count === 'number' && !isNaN(count) ? count : 0;
  const cleanSingular = singular.replace(/^\d+\s+/, '').trim();
  const cleanPlural = plural
    ? plural.replace(/^\d+\s+/, '').trim()
    : cleanSingular.endsWith('s')
    ? cleanSingular
    : `${cleanSingular}s`;
  return safeCount === 1 ? `1 ${cleanSingular}` : `${safeCount} ${cleanPlural}`;
}
