import type { ProductoMenuPedidoDto } from '../types/pedido';

/**
 * Identificadores normalizados de categorías/roles reservados para componentes de Menú Completo (RN-140).
 */
export const ROLES_COMPONENTE = [
  'bebidadesayuno',
  'platodesayuno',
  'sopa',
  'entrada',
  'segundo',
] as const;

const ROLES_COMPONENTE_SET = new Set<string>(ROLES_COMPONENTE);

/**
 * RN-140: Los componentes de menú no se pueden ordenar como productos individuales de carta.
 */
export function esProductoDeCarta(prod: ProductoMenuPedidoDto): boolean {
  if (prod.rol && prod.rol.trim() !== '') return false;
  if (!prod.categoria) return false;
  return !ROLES_COMPONENTE_SET.has(prod.categoria.trim().toLowerCase());
}
