const CATEGORIA_PRESENTATION_MAP: Record<string, string> = {
  Todas: 'Todas',
  'Menús Completos': 'Menús completos',
  MenusCompletos: 'Menús completos',
  'Menús completos': 'Menús completos',
  Desayuno: 'Desayuno',
  Almuerzo: 'Almuerzo',
  PlatosExtras: 'Platos extras',
  'Platos Extras': 'Platos extras',
  'Platos extras': 'Platos extras',
  Combinados: 'Combinados',
  Bebidas: 'Bebidas',
  Otro: 'Otro',
  Otros: 'Otros',
  BebidaDesayuno: 'Bebida desayuno',
  PlatoDesayuno: 'Plato desayuno',
  Sopa: 'Sopa',
  Entrada: 'Entrada',
  Segundo: 'Segundo',
};

/**
 * Convierte el nombre técnico de una categoría o rol de producto en una
 * etiqueta legible para la capa de presentación (ej. "PlatosExtras" -> "Platos extras",
 * "BebidaDesayuno" -> "Bebida desayuno") sin modificar los datos subyacentes.
 */
export function formatCategoriaLabel(categoria: string): string {
  if (!categoria) return '';
  const trimmed = categoria.trim();
  if (CATEGORIA_PRESENTATION_MAP[trimmed]) {
    return CATEGORIA_PRESENTATION_MAP[trimmed];
  }

  const spaced = trimmed
    .replace(/([a-záéíóúñ0-9])([A-ZÁÉÍÓÚÑ])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}
