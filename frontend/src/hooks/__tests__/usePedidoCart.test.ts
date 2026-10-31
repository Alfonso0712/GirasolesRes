import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePedidoCart } from '../usePedidoCart';
import type { ProductoMenuPedido } from '../../types/pedido';
import type { MenuCompletoDia } from '../../types/menuDia';

describe('usePedidoCart - Motor Común de Carrito de Pedidos', () => {
  const mockProducto1: ProductoMenuPedido = {
    id: 'prod-1',
    nombre: 'Lomo Saltado',
    precio: 25.0,
    categoria: 'Segundo',
    disponible: true,
    agotado: false,
  };

  const mockProducto2: ProductoMenuPedido = {
    id: 'prod-2',
    nombre: 'Chicha Morada',
    precio: 5.0,
    categoria: 'Bebida',
    disponible: true,
    agotado: false,
  };

  const mockMenuCompleto: MenuCompletoDia = {
    id: 1,
    nombre: 'Almuerzo Ejecutivo',
    precio: 18.0,
    incluye: 'Sopa + Segundo + Refresco',
    disponible: true,
    motivoNoDisponible: null,
    partes: [],
  };

  it('inicia con carrito vacío y total en 0', () => {
    const { result } = renderHook(() => usePedidoCart());

    expect(result.current.lineasBorrador).toEqual([]);
    expect(result.current.totalCalculado).toBe(0);
    expect(result.current.cantidadTotalProductos).toBe(0);
    expect(result.current.notas).toBe('');
  });

  it('agrega productos de carta, incrementa cantidad y calcula subtotales', () => {
    const { result } = renderHook(() => usePedidoCart());

    act(() => {
      result.current.agregarProducto(mockProducto1);
    });

    expect(result.current.lineasBorrador).toHaveLength(1);
    expect(result.current.lineasBorrador[0].cantidad).toBe(1);
    expect(result.current.lineasBorrador[0].subtotal).toBe(25.0);
    expect(result.current.totalCalculado).toBe(25.0);

    // Agregar de nuevo el mismo producto suma cantidad
    act(() => {
      result.current.agregarProducto(mockProducto1);
    });

    expect(result.current.lineasBorrador).toHaveLength(1);
    expect(result.current.lineasBorrador[0].cantidad).toBe(2);
    expect(result.current.lineasBorrador[0].subtotal).toBe(50.0);
    expect(result.current.totalCalculado).toBe(50.0);

    // Agregar segundo producto
    act(() => {
      result.current.agregarProducto(mockProducto2);
    });

    expect(result.current.lineasBorrador).toHaveLength(2);
    expect(result.current.totalCalculado).toBe(55.0);
    expect(result.current.cantidadTotalProductos).toBe(3);
  });

  it('permite disminuir y quitar productos por índice o productoId', () => {
    const { result } = renderHook(() => usePedidoCart());

    act(() => {
      result.current.agregarProducto(mockProducto1);
      result.current.agregarProducto(mockProducto1);
    });

    expect(result.current.lineasBorrador[0].cantidad).toBe(2);

    act(() => {
      result.current.disminuirLinea(0);
    });
    expect(result.current.lineasBorrador[0].cantidad).toBe(1);

    act(() => {
      result.current.disminuirLinea(0);
    });
    expect(result.current.lineasBorrador).toHaveLength(0);
    expect(result.current.totalCalculado).toBe(0);
  });

  it('agrega menú completo con elecciones y agrupa si son idénticas', () => {
    const { result } = renderHook(() => usePedidoCart());

    const elecciones1 = [
      { parte: 'Sopa', productoId: 'p-sopa', productoNombre: 'Sopa Criolla' },
      { parte: 'Segundo', productoId: 'p-lomo', productoNombre: 'Lomo Saltado' },
    ];

    act(() => {
      result.current.agregarMenuCompleto(mockMenuCompleto, elecciones1, 'Sin sal');
    });

    expect(result.current.lineasBorrador).toHaveLength(1);
    expect(result.current.lineasBorrador[0].menuCompletoId).toBe(1);
    expect(result.current.lineasBorrador[0].cantidad).toBe(1);
    expect(result.current.lineasBorrador[0].observacion).toBe('Sin sal');
    expect(result.current.totalCalculado).toBe(18.0);

    // Mismo menú con mismas elecciones e indicación suma cantidad (RV-164)
    act(() => {
      result.current.agregarMenuCompleto(mockMenuCompleto, elecciones1, 'Sin sal');
    });

    expect(result.current.lineasBorrador).toHaveLength(1);
    expect(result.current.lineasBorrador[0].cantidad).toBe(2);
    expect(result.current.lineasBorrador[0].subtotal).toBe(36.0);
    expect(result.current.totalCalculado).toBe(36.0);

    // Mismo menú con diferente nota crea nueva línea
    act(() => {
      result.current.agregarMenuCompleto(mockMenuCompleto, elecciones1, 'Bien caliente');
    });

    expect(result.current.lineasBorrador).toHaveLength(2);
    expect(result.current.totalCalculado).toBe(54.0);
  });

  it('permite abrir modal de nota, guardar nota en una línea y descartar el pedido', () => {
    const { result } = renderHook(() => usePedidoCart());

    act(() => {
      result.current.agregarProducto(mockProducto1);
    });

    act(() => {
      result.current.abrirModalNotaByIndex(0);
    });

    expect(result.current.modalNotaOpen).toBe(true);
    expect(result.current.lineaParaNota?.nombre).toBe('Lomo Saltado');

    act(() => {
      result.current.guardarNotaByIndex(0, 'Término medio');
    });

    expect(result.current.modalNotaOpen).toBe(false);
    expect(result.current.lineasBorrador[0].observacion).toBe('Término medio');

    // Descartar pedido
    act(() => {
      result.current.solicitarDescarte();
    });
    expect(result.current.modalDescartarOpen).toBe(true);

    act(() => {
      result.current.confirmarDescarte();
    });

    expect(result.current.modalDescartarOpen).toBe(false);
    expect(result.current.lineasBorrador).toHaveLength(0);
    expect(result.current.totalCalculado).toBe(0);
  });
});
