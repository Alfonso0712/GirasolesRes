/**
 * Extrae las iniciales de un nombre completo para representación en avatares.
 * Si tiene 2 o más palabras, toma la primera letra de cada una (máximo 2).
 * Si tiene 1 palabra, toma las dos primeras letras.
 * Si es nulo o vacío, retorna 'US'.
 */
export function obtenerIniciales(nombre?: string | null): string {
  if (!nombre) return 'US';
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return nombre.substring(0, 2).toUpperCase();
}
