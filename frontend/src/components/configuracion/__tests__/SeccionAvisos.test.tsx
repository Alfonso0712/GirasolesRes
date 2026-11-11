import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeccionAvisos } from '../SeccionAvisos';

describe('SeccionAvisos Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe mostrar el título de comanda lista para Mozo, Cajero y Administrador', () => {
    render(<SeccionAvisos rol="Mozo" />);
    expect(screen.getByText(/aviso de comanda lista para recoger/i)).toBeInTheDocument();
  });

  it('debe mostrar el título de nueva comanda entrante para Cocinero', () => {
    render(<SeccionAvisos rol="Cocinero" />);
    expect(screen.getByText(/aviso de nueva comanda entrante/i)).toBeInTheDocument();
  });

  it('debe permitir activar y desactivar sonido con el switch', () => {
    render(<SeccionAvisos rol="Mozo" />);
    const switchSonido = screen.getByRole('switch', { name: /sonido en avisos/i });
    expect(switchSonido).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(switchSonido);
    expect(switchSonido).toHaveAttribute('aria-checked', 'false');
  });

  it('debe contener slider de volumen y botón para probar sonido', () => {
    render(<SeccionAvisos rol="Cocinero" />);
    expect(screen.getByRole('slider', { name: /volumen de alertas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /probar sonido/i })).toBeInTheDocument();
  });

  it('debe permitir seleccionar el modo de aviso (Visual y sonoro, Solo visual, Solo sonoro)', () => {
    render(<SeccionAvisos rol="Cajero" />);
    expect(screen.getByRole('radio', { name: /^visual y sonoro$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^solo visual$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^solo sonoro$/i })).toBeInTheDocument();

    const radioSoloVisual = screen.getByRole('radio', { name: /^solo visual$/i });
    fireEvent.click(radioSoloVisual);
    expect(radioSoloVisual).toHaveAttribute('aria-checked', 'true');
  });
});
