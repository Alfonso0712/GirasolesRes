import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContadorDenominacionesModal } from '../ContadorDenominacionesModal';

describe('ContadorDenominacionesModal - Pruebas de Caracterización y Cálculo de Denominaciones', () => {
  it('debe renderizar billetes y monedas con snapshot fiel', () => {
    const { container } = render(
      <ContadorDenominacionesModal
        isOpen={true}
        onClose={vi.fn()}
        onAplicarTotal={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: 'Contador de Billetes y Monedas' })).toBeInTheDocument();
    expect(screen.getByText('Billetes (S/)')).toBeInTheDocument();
    expect(screen.getByText('Monedas (S/)')).toBeInTheDocument();
    expect(screen.getByText('S/ 200')).toBeInTheDocument();
    expect(screen.getByText('S/ 0.10')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('debe sumar en tiempo real las denominaciones y aplicar el total', () => {
    const handleAplicar = vi.fn();
    const handleClose = vi.fn();

    render(
      <ContadorDenominacionesModal
        isOpen={true}
        onClose={handleClose}
        onAplicarTotal={handleAplicar}
      />
    );

    const inputs = screen.getAllByPlaceholderText('0');
    // Primer input: billete de 200
    fireEvent.change(inputs[0], { target: { value: '2' } });
    // Segundo input: billete de 100
    fireEvent.change(inputs[1], { target: { value: '1' } });

    // 2 * 200 + 1 * 100 = 500
    expect(screen.getByText('S/ 500.00')).toBeInTheDocument();

    const aplicarBtn = screen.getByRole('button', { name: /USAR ESTE TOTAL/i });
    fireEvent.click(aplicarBtn);

    expect(handleAplicar).toHaveBeenCalledWith(500);
    expect(handleClose).toHaveBeenCalled();
  });
});
