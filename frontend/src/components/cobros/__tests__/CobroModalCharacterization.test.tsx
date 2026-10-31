import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CobroModal } from '../CobroModal';
import type { PedidoPendienteCobro } from '../../../types/cobro';

describe('CobroModal - Pruebas de Caracterización y Cálculos Financieros', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockPedido: PedidoPendienteCobro = {
    pedidoId: 'pedido-101',
    numero: 42,
    tipo: 'Mesa',
    mesa: 'Mesa 3',
    hora: '14:20',
    estado: 'Servido',
    total: 65.0,
    estaListo: true,
  };

  it('debe renderizar el modal con los montos del pedido y snapshot representativo', () => {
    const onConfirmarCobro = vi.fn();
    const onClose = vi.fn();

    const { container } = render(
      <CobroModal
        isOpen={true}
        onClose={onClose}
        pedido={mockPedido}
        onConfirmarCobro={onConfirmarCobro}
        token="test-token"
      />
    );

    expect(screen.getByText(/Pedido N\.º/i)).toBeInTheDocument();
    expect(screen.getByText(/42/i)).toBeInTheDocument();
    expect(screen.getByText(/Salón · Mesa 3/i)).toBeInTheDocument();
    expect(screen.getAllByText(/65\.00/i).length).toBeGreaterThan(0);

    expect(container).toMatchSnapshot();
  });

  it('debe calcular exactamente el vuelto y el faltante al variar el monto recibido en efectivo', () => {
    const onConfirmarCobro = vi.fn();
    render(
      <CobroModal
        isOpen={true}
        onClose={vi.fn()}
        pedido={mockPedido}
        onConfirmarCobro={onConfirmarCobro}
        token="test-token"
      />
    );

    const inputMonto = screen.getByLabelText(/Monto Recibido del Cliente/i);

    // 1. Pago exacto: S/ 65.00 recibido -> Vuelto S/ 0.00
    expect(inputMonto).toHaveValue(65.0);
    expect(screen.getByText(/Vuelto a entregar/i)).toBeInTheDocument();
    expect(screen.getByText(/S\/ 0\.00/i)).toBeInTheDocument();

    // 2. Pago con billete de S/ 100.00 -> Vuelto exacto S/ 35.00
    fireEvent.change(inputMonto, { target: { value: '100.00' } });
    expect(screen.getByText(/S\/ 35\.00/i)).toBeInTheDocument();

    // 3. Monto insuficiente: S/ 50.00 -> Falta S/ 15.00 y botón confirmar deshabilitado
    fireEvent.change(inputMonto, { target: { value: '50.00' } });
    expect(screen.getByText(/Faltan S\/ 15\.00/i)).toBeInTheDocument();
    const btnConfirmar = screen.getByRole('button', { name: /Emitir Ticket/i });
    expect(btnConfirmar).toBeDisabled();
  });

  it('debe conmutar a método Yape y exigir confirmación de recepción', async () => {
    const onConfirmarCobro = vi.fn().mockResolvedValue(undefined);
    render(
      <CobroModal
        isOpen={true}
        onClose={vi.fn()}
        pedido={mockPedido}
        onConfirmarCobro={onConfirmarCobro}
        token="test-token"
      />
    );

    // Cambiar a Yape
    const btnYape = screen.getByRole('button', { name: /Yape \/ QR/i });
    fireEvent.click(btnYape);

    expect(screen.getByText(/Confirmación de recepción en Yape/i)).toBeInTheDocument();
    const btnConfirmar = screen.getByRole('button', { name: /Emitir Ticket/i });
    expect(btnConfirmar).toBeDisabled();

    // Checkbox de verificación
    const checkConfirmacion = screen.getByRole('checkbox');
    fireEvent.click(checkConfirmacion);

    expect(btnConfirmar).not.toBeDisabled();
    fireEvent.click(btnConfirmar);

    await waitFor(() => {
      expect(onConfirmarCobro).toHaveBeenCalledWith(
        expect.objectContaining({
          pedidoId: 'pedido-101',
          metodo: 'yape',
          totalMostrado: 65.0,
          yapeConfirmado: true,
        })
      );
    });
  });
});
