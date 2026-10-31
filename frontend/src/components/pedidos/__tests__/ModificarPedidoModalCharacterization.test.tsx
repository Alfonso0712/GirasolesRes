import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ModificarPedidoModal } from '../ModificarPedidoModal';
import type { DetallePedidoCompletoDto, ProductoMenuPedido } from '../../../types/pedido';

describe('ModificarPedidoModal - Pruebas de Caracterización', () => {
  const mockPedido: DetallePedidoCompletoDto = {
    id: 'ped-1',
    numero: 42,
    tipo: 'Mesa',
    mesa: 'Mesa 4',
    referencia: null,
    hora: '12:00 PM',
    registradoPor: 'Juan',
    usuarioId: 'u-1',
    motivoAnulacion: null,
    estado: 'Pendiente',
    total: 25.00,
    comandas: [],
    lineas: [
      {
        detalleId: 'det-1',
        productoId: 'prod-1',
        nombre: 'Lomo Saltado',
        precioUnitario: 25.00,
        cantidad: 1,
        observacion: 'Término medio',
        subtotal: 25.00,
      },
    ],
  };

  const mockCatalogo: ProductoMenuPedido[] = [
    {
      id: 'prod-1',
      nombre: 'Lomo Saltado',
      precio: 25.00,
      categoria: 'Criollo',
      agotado: false,
      disponible: true,
    },
    {
      id: 'prod-2',
      nombre: 'Chicha Morada 1L',
      precio: 10.00,
      categoria: 'Bebidas',
      agotado: false,
      disponible: true,
    },
    {
      id: 'prod-3',
      nombre: 'Ceviche Mixto',
      precio: 30.00,
      categoria: 'Marinos',
      agotado: true,
      disponible: false,
    },
  ];

  it('debe renderizar el modal con lineas del pedido y catalogo coincidiendo con snapshot', () => {
    const { container } = render(
      <ModificarPedidoModal
        pedido={mockPedido}
        isOpen={true}
        onClose={vi.fn()}
        catalogoProductos={mockCatalogo}
        onGuardarModificacion={vi.fn()}
      />
    );
    expect(screen.getByText('Modificar Pedido N.º 42')).toBeInTheDocument();
    expect(screen.getAllByText('Lomo Saltado').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Chicha Morada 1L')).toBeInTheDocument();
    expect(screen.getByText('Agotado')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
