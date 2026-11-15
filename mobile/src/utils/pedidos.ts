import type {
  LineaBorrador,
  LineaPedidoRequest,
  ProductoMenuPedidoDto,
} from '../types/pedido';
import type { MenuCompletoDiaDto, MenuDiaResponseDto } from '../types/menuDia';
import { MAX_CANTIDAD_POR_LINEA } from '../config/constantes';

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
const CAMPOS_TEXTO_BORRADOR = ['id', 'nombre', 'observacion'] as const;
const CAMPOS_NUMERO_BORRADOR = ['precioUnitario', 'cantidad', 'subtotal'] as const;

/**
 * RN-140: Los componentes de menú no se pueden ordenar como productos individuales de carta.
 */
export function esProductoDeCarta(prod: ProductoMenuPedidoDto): boolean {
  if (prod.rol && prod.rol.trim() !== '') return false;
  if (!prod.categoria) return false;
  return !ROLES_COMPONENTE_SET.has(prod.categoria.trim().toLowerCase());
}

/**
 * Valida estructuralmente un elemento recuperado desde sessionStorage para el borrador de pedido.
 */
export function esLineaBorrador(valor: unknown): valor is LineaBorrador {
  if (typeof valor !== 'object' || valor === null) return false;
  const registro: object = valor;
  const tieneCamposTexto = CAMPOS_TEXTO_BORRADOR.every((k) => typeof Reflect.get(registro, k) === 'string');
  const tieneCamposNumero = CAMPOS_NUMERO_BORRADOR.every((k) => typeof Reflect.get(registro, k) === 'number');
  return tieneCamposTexto && tieneCamposNumero;
}

/**
 * Construye la lista ordenada de categorías disponibles excluyendo componentes de menú.
 */
export function obtenerCategoriasCatalogo(
  catalogo: ProductoMenuPedidoDto[],
  menuDia: MenuDiaResponseDto | null
): string[] {
  const catsSet = new Set<string>();
  catalogo.filter(esProductoDeCarta).forEach((p) => {
    if (p.categoria && p.categoria.trim()) {
      catsSet.add(p.categoria.trim());
    }
  });
  const lista = Array.from(catsSet).sort();
  const tieneMenus = Boolean(menuDia?.definido && (menuDia.menusCompletos?.length ?? 0) > 0);
  return ['Todas', ...(tieneMenus ? ['Menús'] : []), ...lista];
}

/**
 * Filtra los menús completos del día según la categoría activa y la consulta de búsqueda.
 */
export function filtrarMenusCatalogo(
  menuDia: MenuDiaResponseDto | null,
  categoriaActiva: string,
  busqueda: string
): MenuCompletoDiaDto[] {
  if (!menuDia?.definido || !menuDia.menusCompletos?.length) return [];
  if (categoriaActiva !== 'Todas' && categoriaActiva !== 'Menús') return [];
  const query = busqueda.trim().toLowerCase();
  if (!query) return menuDia.menusCompletos;
  return menuDia.menusCompletos.filter((m) => m.nombre.toLowerCase().includes(query));
}

/**
 * Filtra los productos de carta según RN-140, la categoría activa y el texto buscado.
 */
export function filtrarProductosCatalogo(
  catalogo: ProductoMenuPedidoDto[],
  categoriaActiva: string,
  busqueda: string
): ProductoMenuPedidoDto[] {
  if (categoriaActiva === 'Menús') return [];
  const query = busqueda.trim().toLowerCase();
  return catalogo.filter((p) => {
    if (!esProductoDeCarta(p)) return false;
    if (categoriaActiva !== 'Todas' && p.categoria !== categoriaActiva) return false;
    return query ? p.nombre.toLowerCase().includes(query) : true;
  });
}

export interface ResultadoAgregarProducto {
  lineas: LineaBorrador[];
  error?: 'agotado' | 'limite';
}

/**
 * Agrega una unidad de producto de carta al borrador validando disponibilidad y límite por línea.
 */
export function agregarProductoALineas(
  lineas: LineaBorrador[],
  producto: ProductoMenuPedidoDto
): ResultadoAgregarProducto {
  if (producto.agotado) return { lineas, error: 'agotado' };

  const idx = lineas.findIndex((l) => l.productoId === producto.id);
  if (idx >= 0) {
    if (lineas[idx].cantidad >= MAX_CANTIDAD_POR_LINEA) {
      return { lineas, error: 'limite' };
    }
    const next = [...lineas];
    const nuevaCant = next[idx].cantidad + 1;
    next[idx] = { ...next[idx], cantidad: nuevaCant, subtotal: nuevaCant * next[idx].precioUnitario };
    return { lineas: next };
  }

  return {
    lineas: [
      ...lineas,
      {
        id: `prod-${producto.id}-${Date.now()}`,
        productoId: producto.id,
        nombre: producto.nombre,
        precioUnitario: producto.precio,
        cantidad: 1,
        observacion: '',
        subtotal: producto.precio,
        agotado: producto.agotado,
      },
    ],
  };
}

/**
 * Ajusta la cantidad de una línea del borrador o la elimina si llega a cero.
 */
export function modificarCantidadEnLineas(
  lineas: LineaBorrador[],
  lineaId: string,
  delta: number
): { lineas: LineaBorrador[]; errorLimite: boolean } {
  const linea = lineas.find((l) => l.id === lineaId);
  if (!linea) return { lineas, errorLimite: false };
  if (delta > 0 && linea.cantidad >= MAX_CANTIDAD_POR_LINEA) {
    return { lineas, errorLimite: true };
  }

  const next = lineas
    .map((l) => {
      if (l.id !== lineaId) return l;
      const nueva = l.cantidad + delta;
      return nueva > 0 ? { ...l, cantidad: nueva, subtotal: nueva * l.precioUnitario } : null;
    })
    .filter((l): l is LineaBorrador => l !== null);

  return { lineas: next, errorLimite: false };
}

/**
 * Actualiza la observación de cocina para una línea puntual.
 */
export function actualizarObservacionEnLineas(
  lineas: LineaBorrador[],
  lineaId: string,
  observacion: string
): LineaBorrador[] {
  return lineas.map((l) => (l.id === lineaId ? { ...l, observacion } : l));
}

/**
 * Mapea las líneas de borrador de UI al contrato de envío esperado por la API de pedidos.
 */
export function mapearLineasPedidoPayload(lineas: LineaBorrador[]): LineaPedidoRequest[] {
  return lineas.map((l) => ({
    productoId: l.productoId,
    menuCompletoId: l.menuCompletoId,
    elecciones: l.elecciones?.map((e) => ({
      parte: e.parte,
      productoId: e.productoId,
    })),
    cantidad: l.cantidad,
    observacion: l.observacion || undefined,
  }));
}

/**
 * Genera el identificador idempotente de solicitud para registro o ampliación de pedido.
 */
export function generarSolicitudId(prefijo: string): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefijo}-${Date.now()}`;
}
