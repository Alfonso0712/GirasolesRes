import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  ROLES_COMPONENTE,
  esProductoDeCarta,
  esLineaBorrador,
  obtenerCategoriasCatalogo,
  filtrarMenusCatalogo,
  filtrarProductosCatalogo,
  agregarProductoALineas,
  modificarCantidadEnLineas,
  actualizarObservacionEnLineas,
  mapearLineasPedidoPayload,
  generarSolicitudId,
} from './pedidos';
import type { LineaBorrador, ProductoMenuPedidoDto } from '../types/pedido';
import type { MenuDiaResponseDto } from '../types/menuDia';

function crearProducto(overrides: Partial<ProductoMenuPedidoDto> = {}): ProductoMenuPedidoDto {
  return {
    id: 'p1',
    nombre: 'Lomo Saltado',
    categoria: 'Segundo de Carta',
    precio: 28,
    agotado: false,
    disponible: true,
    rol: null,
    ...overrides,
  };
}

describe('utils/pedidos (RN-140 componentes vs productos de carta)', () => {
  it('incluye los 5 roles canónicos de componente en minúsculas', () => {
    expect(ROLES_COMPONENTE).toEqual([
      'bebidadesayuno',
      'platodesayuno',
      'sopa',
      'entrada',
      'segundo',
    ]);
  });

  it('rechaza productos con rol explícito de componente aunque tengan categoría distinta', () => {
    expect(esProductoDeCarta(crearProducto({ rol: 'Entrada', categoria: 'Entradas' }))).toBe(false);
    expect(esProductoDeCarta(crearProducto({ rol: 'Sopa' }))).toBe(false);
  });

  it('rechaza productos cuya categoría coincida con un rol de componente sin importar mayúsculas o espacios', () => {
    expect(esProductoDeCarta(crearProducto({ categoria: 'BebidaDesayuno' }))).toBe(false);
    expect(esProductoDeCarta(crearProducto({ categoria: '  PlatoDesayuno  ' }))).toBe(false);
    expect(esProductoDeCarta(crearProducto({ categoria: 'SOPA' }))).toBe(false);
    expect(esProductoDeCarta(crearProducto({ categoria: 'Entrada' }))).toBe(false);
    expect(esProductoDeCarta(crearProducto({ categoria: 'Segundo' }))).toBe(false);
  });

  it('rechaza productos sin categoría o con categoría vacía', () => {
    expect(esProductoDeCarta(crearProducto({ categoria: '' }))).toBe(false);
  });

  it('acepta productos reales de carta sin rol de componente y con espacios en blanco en rol', () => {
    expect(esProductoDeCarta(crearProducto({ rol: '   ', categoria: 'Platos a la Carta' }))).toBe(true);
    expect(esProductoDeCarta(crearProducto({ rol: undefined, categoria: 'Bebidas' }))).toBe(true);
  });
});

describe('utils/pedidos helpers de borrador y filtrado', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const lineaBase: LineaBorrador = {
    id: 'l-1',
    productoId: 'p1',
    nombre: 'Lomo Saltado',
    precioUnitario: 28,
    cantidad: 2,
    observacion: '',
    subtotal: 56,
  };

  it('valida estructura de LineaBorrador y rechaza entradas inválidas', () => {
    expect(esLineaBorrador(null)).toBe(false);
    expect(esLineaBorrador('texto')).toBe(false);
    expect(esLineaBorrador({ id: '1', nombre: 2 })).toBe(false);
    expect(esLineaBorrador(lineaBase)).toBe(true);
  });

  it('calcula categorías dinámicas y filtra menús y productos por búsqueda', () => {
    const menuDia: MenuDiaResponseDto = {
      fecha: '2026-11-14',
      definido: true,
      esFindeOFeriado: false,
      menusCompletos: [
        { id: 'm1', nombre: 'Menú Ejecutivo', precio: 18, incluye: 'Sopa + Segundo', pasos: [] },
      ],
      grupos: [],
    };
    const catalogo = [
      crearProducto({ id: 'p1', nombre: 'Lomo', categoria: 'Platos a la Carta' }),
      crearProducto({ id: 'p2', nombre: 'Chicha', categoria: 'Bebidas' }),
      crearProducto({ id: 'p3', nombre: 'Sopa Criolla', categoria: 'Sopa', rol: 'Sopa' }),
    ];

    expect(obtenerCategoriasCatalogo(catalogo, menuDia)).toEqual(['Todas', 'Menús', 'Bebidas', 'Platos a la Carta']);
    expect(obtenerCategoriasCatalogo(catalogo, null)).toEqual(['Todas', 'Bebidas', 'Platos a la Carta']);

    expect(filtrarMenusCatalogo(null, 'Todas', '')).toEqual([]);
    expect(filtrarMenusCatalogo(menuDia, 'Bebidas', '')).toEqual([]);
    expect(filtrarMenusCatalogo(menuDia, 'Menús', '')).toHaveLength(1);
    expect(filtrarMenusCatalogo(menuDia, 'Todas', 'ejecutivo')).toHaveLength(1);

    expect(filtrarProductosCatalogo(catalogo, 'Menús', '')).toEqual([]);
    expect(filtrarProductosCatalogo(catalogo, 'Bebidas', 'chicha').map((p) => p.id)).toEqual(['p2']);
    expect(filtrarProductosCatalogo(catalogo, 'Todas', '').map((p) => p.id)).toEqual(['p1', 'p2']);
  });

  it('gestiona líneas (agotado, nuevo, incrementar, límite 20, disminuir, eliminar, nota y payload)', () => {
    expect(agregarProductoALineas([], crearProducto({ agotado: true })).error).toBe('agotado');
    const agregado = agregarProductoALineas([], crearProducto({ id: 'p1', precio: 15 }));
    expect(agregado.lineas).toHaveLength(1);

    const incrementado = agregarProductoALineas([lineaBase], crearProducto({ id: 'p1', precio: 28 }));
    expect(incrementado.lineas[0].cantidad).toBe(3);

    expect(agregarProductoALineas([{ ...lineaBase, cantidad: 20 }], crearProducto({ id: 'p1' })).error).toBe('limite');
    expect(modificarCantidadEnLineas([lineaBase], 'inexistente', 1).lineas).toEqual([lineaBase]);
    expect(modificarCantidadEnLineas([{ ...lineaBase, cantidad: 20 }], 'l-1', 1).errorLimite).toBe(true);
    expect(modificarCantidadEnLineas([{ ...lineaBase, cantidad: 1 }], 'l-1', -1).lineas).toEqual([]);

    const conNota = actualizarObservacionEnLineas([lineaBase], 'l-1', 'Sin cebolla');
    expect(conNota[0].observacion).toBe('Sin cebolla');

    const payload = mapearLineasPedidoPayload([
      ...conNota,
      { id: 'm1', menuCompletoId: 'mc1', elecciones: [{ parte: 'Segundo', productoId: 'p9', productoNombre: 'Seco' }], nombre: 'Menú', precioUnitario: 18, cantidad: 1, observacion: '', subtotal: 18 },
    ]);
    expect(payload[0].observacion).toBe('Sin cebolla');
    expect(payload[1].elecciones).toEqual([{ parte: 'Segundo', productoId: 'p9' }]);
    expect(payload[1].observacion).toBeUndefined();

    expect(generarSolicitudId('sol-test')).toBeTruthy();
    vi.stubGlobal('crypto', {});
    expect(generarSolicitudId('sol-test')).toMatch(/^sol-test-\d+$/);
  });
});
