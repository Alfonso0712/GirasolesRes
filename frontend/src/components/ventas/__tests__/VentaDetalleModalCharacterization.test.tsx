import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VentaDetalleModal } from '../VentaDetalleModal';
import type { VentaDetalle } from '../../../types/venta';

describe('VentaDetalleModal - Pruebas de Caracterización y Comprobante', () => {
  const mockVenta: VentaDetalle = {
    ventaId: 'v-101',
    comprobanteId: 'comp-101',
    comprobante: 'B001-00042',
    fechaHoraUtc: '2026-10-30T13:30:00Z',
    fechaHoraFormateada: '30/10/2026 13:30',
    pedidoNumero: 15,
    pedidoId: 'p-15',
    cajaCerrada: false,
    tipo: 'Mesa',
    mesa: 'Mesa 4',
    referencia: 'Cerca a la ventana',
    cajero: 'Ana Cajera',
    estado: 'Vigente',
    total: 65.50,
    opGravada: 55.51,
    igv: 9.99,
    metodo: 'Efectivo',
    montoRecibido: 100.00,
    vuelto: 34.50,
    numDocReceptor: '72345678',
    razonSocialReceptor: 'Juan Perez',
    tipoDocReceptor: 'DNI',
    direccionReceptor: 'Av. Sol 123',
    lineas: [
      {
        productoNombre: 'Lomo Saltado',
        cantidad: 1,
        precioUnitario: 35.00,
        subtotal: 35.00,
        elecciones: 'Término medio',
        observacion: 'Sin cebolla',
      },
      {
        productoNombre: 'Menú Completo Criollo',
        cantidad: 1,
        precioUnitario: 22.00,
        subtotal: 22.00,
        elecciones: 'Entrada: Sopa criolla · Segundo: Ají de gallina',
        incluye: 'Chicha Morada',
      },
      {
        productoNombre: 'Chicha Morada 1L',
        cantidad: 1,
        precioUnitario: 8.50,
        subtotal: 8.50,
      },
    ],
  };

  it('debe renderizar el detalle de venta completa con snapshot fiel', () => {
    const { container } = render(
      <VentaDetalleModal
        isOpen={true}
        onClose={vi.fn()}
        venta={mockVenta}
        loading={false}
        esAdmin={true}
        onAbrirAnular={vi.fn()}
        onDescargarTicket={vi.fn().mockResolvedValue(undefined)}
        descargandoTicket={false}
      />
    );

    expect(screen.getByText('Comprobante B001-00042')).toBeInTheDocument();
    expect(screen.getByText('Lomo Saltado')).toBeInTheDocument();
    expect(screen.getByText('Menú Completo Criollo')).toBeInTheDocument();
    expect(screen.getByText('S/ 65.50')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Anular venta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Descargar PDF/i })).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
