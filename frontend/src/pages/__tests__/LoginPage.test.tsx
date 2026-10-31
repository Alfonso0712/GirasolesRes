import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginPage } from '../LoginPage';

describe('LoginPage - Navegación y Heurísticas de Usabilidad', () => {
  it('no debe renderizar el enlace inferior "Volver a la Carta del Restaurante"', () => {
    const onBackToLanding = vi.fn();
    render(
      <LoginPage
        onSuccess={vi.fn()}
        onForgotPasswordClick={vi.fn()}
        onBackToLanding={onBackToLanding}
      />
    );

    expect(screen.queryByText(/Volver a la Carta del Restaurante/i)).toBeNull();
  });

  it('debe permitir volver a la landing al presionar el logo de la marca', () => {
    const onBackToLanding = vi.fn();
    render(
      <LoginPage
        onSuccess={vi.fn()}
        onForgotPasswordClick={vi.fn()}
        onBackToLanding={onBackToLanding}
      />
    );

    const logoButtons = screen.getAllByRole('button', { name: /Volver a la carta del restaurante/i });
    expect(logoButtons.length).toBeGreaterThan(0);

    fireEvent.click(logoButtons[0]);
    expect(onBackToLanding).toHaveBeenCalledTimes(1);
  });

  it('debe coincidir con snapshot representativo de login', () => {
    const { container } = render(
      <LoginPage
        onSuccess={vi.fn()}
        onForgotPasswordClick={vi.fn()}
        onBackToLanding={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /INGRESAR/i })).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
