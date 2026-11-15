import { describe, it, expect } from 'vitest';
import { ROLES_COMPONENTE, esProductoDeCarta } from './pedidos';
import type { ProductoMenuPedidoDto } from '../types/pedido';

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
