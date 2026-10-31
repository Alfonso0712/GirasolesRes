import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnularVentaModal } from '../AnularVentaModal';
import type { VentaDetalle } from '../../../types/venta';

describe('AnularVentaModal - Pruebas de Caracterización y Validación de Anulación', () => {
  const mockVenta: VentaDetalle = {
    ventaId: 'v-200',
    comprobanteId: 'c-200',
    comprobante: 'B001-00055',
    fechaHoraUtc: '2026-10-30T14:00:00Z',
    fechaHoraFormateada: '30/10/2026 14:00',
    pedidoId: 'p-20',
    pedidoNumero: 20,
    tipo: 'Mesa',
    mesa: 'Mesa 1',
    cajero: 'Ana Cajera',
    estado: 'Vigente',
    cajaCerrada: false,
    total: 45.00,
    metodo: 'Efectivo',
    lineas: [],
  };

  it('debe renderizar el diálogo de anulación con snapshot representativo', () => {
    const { container } = render(
      <AnularVentaModal
        isOpen={true}
        onClose={vi.fn()}
        venta={mockVenta}
        onConfirmar={vi.fn().mockResolvedValue(undefined)}
        loading={false}
      />
    );

    expect(screen.getByRole('heading', { name: /Anular Venta B001-00055/i })).toBeInTheDocument();
    expect(screen.getByText(/Dejar el pedido por cobrar/i)).toBeInTheDocument();
    expect(screen.getByText(/Anular también el pedido/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('debe habilitar el botón de anular cuando el motivo tiene entre 5 y 100 caracteres', () => {
    const onConfirmar = vi.fn().mockResolvedValue(undefined);

    render(
      <AnularVentaModal
        isOpen={true}
        onClose={vi.fn()}
        venta={mockVenta}
        onConfirmar={onConfirmar}
        loading={false}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Anular venta/i });
    expect(submitBtn).toBeDisabled();

    // Seleccionar motivo rápido
    const motivoRapidoBtn = screen.getByText('Error en método de pago');
    fireEvent.click(motivoRapidoBtn);

    expect(submitBtn).not.toBeDisabled();
  });
});
