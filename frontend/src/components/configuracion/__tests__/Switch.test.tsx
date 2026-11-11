import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '../Switch';

describe('Switch Component', () => {
  it('debe renderizar la etiqueta y la descripción', () => {
    render(
      <Switch
        checked={false}
        onChange={vi.fn()}
        label="Reducir animaciones"
        description="Minimiza los movimientos"
      />
    );

    expect(screen.getByText('Reducir animaciones')).toBeInTheDocument();
    expect(screen.getByText('Minimiza los movimientos')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Reducir animaciones' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  it('debe invocar onChange con true al hacer clic cuando está desactivado', () => {
    const handleChange = vi.fn();
    render(
      <Switch
        checked={false}
        onChange={handleChange}
        label="Probar switch"
      />
    );

    fireEvent.click(screen.getByRole('switch', { name: 'Probar switch' }));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('debe responder a la barra espaciadora y Enter', () => {
    const handleChange = vi.fn();
    render(
      <Switch
        checked={true}
        onChange={handleChange}
        label="Accesible"
      />
    );

    const switchBtn = screen.getByRole('switch', { name: 'Accesible' });
    fireEvent.keyDown(switchBtn, { key: ' ' });
    expect(handleChange).toHaveBeenCalledWith(false);

    fireEvent.keyDown(switchBtn, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('no debe invocar onChange si está deshabilitado', () => {
    const handleChange = vi.fn();
    render(
      <Switch
        checked={false}
        onChange={handleChange}
        label="Deshabilitado"
        disabled
      />
    );

    fireEvent.click(screen.getByRole('switch', { name: 'Deshabilitado' }));
    expect(handleChange).not.toHaveBeenCalled();
  });
});
