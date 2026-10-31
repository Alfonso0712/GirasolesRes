import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserFormModal } from '../UserFormModal';
import type { UsuarioItem } from '../../../types/usuario';

describe('UserFormModal - Pruebas de Caracterización y Formularios de Usuario', () => {
  it('debe renderizar en modo nuevo usuario con snapshot fiel', () => {
    const { container } = render(
      <UserFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText(/Nuevo usuario/i)).toBeInTheDocument();
    expect(screen.getByText(/Nombre completo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ej\. Ana Torres/i)).toBeInTheDocument();
    expect(screen.getByText(/Nombre de usuario/i)).toBeInTheDocument();
    expect(screen.getByText(/Rol en el restaurante/i)).toBeInTheDocument();

    const btnGuardar = screen.getByRole('button', { name: /^Guardar$/i });
    expect(btnGuardar).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });

  it('debe renderizar en modo edición con datos de usuario y guardar cambios', async () => {
    const mockUsuario: UsuarioItem = {
      id: 'usr-44',
      nombre: 'Lucía Méndez',
      usuario: 'lmendez',
      rol: 'Cajero',
      correo: 'lucia@girasoles.pe',
      activo: true,
      fechaCreacion: '2026-10-01T12:00:00Z',
    };

    const onSave = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <UserFormModal
        isOpen={true}
        onClose={vi.fn()}
        usuarioAEditar={mockUsuario}
        onSave={onSave}
      />
    );

    expect(screen.getByText(/Editar usuario - Lucía Méndez/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lucía Méndez')).toBeInTheDocument();
    expect(screen.getByDisplayValue('lmendez')).toBeInTheDocument();

    const btnGuardarCambios = screen.getByRole('button', { name: /Guardar cambios/i });
    fireEvent.click(btnGuardarCambios);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Lucía Méndez',
          usuario: 'lmendez',
          rol: 'Cajero',
        }),
        true
      );
    });

    expect(container).toMatchSnapshot();
  });
});
