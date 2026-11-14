/**
 * Utilidades de normalización y canonicalización de texto para validación
 * de nombres de mesas y búsquedas en el cliente móvil.
 */

export function normalizeText(text: string): string {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

export function canonicalizarMesa(texto: string): string {
  return texto
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

export function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}
