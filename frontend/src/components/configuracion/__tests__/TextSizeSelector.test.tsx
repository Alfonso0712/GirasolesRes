import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextSizeSelector } from '../TextSizeSelector';

describe('TextSizeSelector Component', () => {
  it('debe renderizar las tres opciones de tamaño con sus etiquetas y porcentajes', () => {
    const handleChange = vi.fn();
    render(<TextSizeSelector value="normal" onChange={handleChange} />);

    expect(screen.getByRole('radiogroup', { name: /tamaño del texto/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^normal$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^grande$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^muy grande$/i })).toBeInTheDocument();

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('112.5%')).toBeInTheDocument();
    expect(screen.getByText('125%')).toBeInTheDocument();
  });

  it('debe marcar la opción activa con aria-checked="true"', () => {
    const { rerender } = render(<TextSizeSelector value="normal" onChange={vi.fn()} />);

    expect(screen.getByRole('radio', { name: /^normal$/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /^grande$/i })).toHaveAttribute('aria-checked', 'false');

    rerender(<TextSizeSelector value="grande" onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: /^grande$/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /^normal$/i })).toHaveAttribute('aria-checked', 'false');
  });

  it('debe llamar a onChange al hacer clic en otra opción', () => {
    const handleChange = vi.fn();
    render(<TextSizeSelector value="normal" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('radio', { name: /^grande$/i }));
    expect(handleChange).toHaveBeenCalledWith('grande');

    fireEvent.click(screen.getByRole('radio', { name: /^muy grande$/i }));
    expect(handleChange).toHaveBeenCalledWith('muy-grande');
  });

  it('debe permitir navegar entre opciones con las flechas del teclado', () => {
    const handleChange = vi.fn();
    render(<TextSizeSelector value="normal" onChange={handleChange} />);

    const radioNormal = screen.getByRole('radio', { name: /^normal$/i });
    radioNormal.focus();

    fireEvent.keyDown(radioNormal, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenCalledWith('grande');

    fireEvent.keyDown(radioNormal, { key: 'ArrowLeft' });
    expect(handleChange).toHaveBeenCalledWith('muy-grande');
  });
});
