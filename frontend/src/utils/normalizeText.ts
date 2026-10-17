/**
 * Utilidad de normalización de cadenas (Semana 07).
 * Elimina espacios en blanco al inicio, final y dobles espacios internos.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}
