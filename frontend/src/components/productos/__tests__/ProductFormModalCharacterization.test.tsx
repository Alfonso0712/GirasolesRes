import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductFormModal } from '../ProductFormModal';
import type { ProductoItem } from '../../../types/producto';

describe('ProductFormModal - Pruebas de Caracterización y Formularios', () => {
  it('debe renderizar en modo nuevo producto con snapshot representativo', () => {
    const { container } = render(
      <ProductFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        producto={null}
      />
    );

    expect(screen.getByText(/Nuevo Producto o Componente/i)).toBeInTheDocument();
    expect(screen.getByText(/Producto de carta/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Componente de menú/i).length).toBeGreaterThan(0);

    const btnSubmit = screen.getByRole('button', { name: /Guardar producto/i });
    expect(btnSubmit).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });

  it('debe renderizar en modo edición con datos precargados y enviar cambios', async () => {
    const mockProducto: ProductoItem = {
      id: 'p-101',
      nombre: 'Lomo Saltado Clásico',
      tipo: 'Carta',
      categoria: 'PlatosExtras',
      precio: 38.0,
      activo: true,
    };

    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <ProductFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        producto={mockProducto}
      />
    );

    expect(screen.getByText(/Editar Producto/i)).toBeInTheDocument();
    const inputNombre = screen.getByDisplayValue('Lomo Saltado Clásico');
    expect(inputNombre).toBeInTheDocument();

    const inputPrecio = screen.getByDisplayValue('38.00');
    expect(inputPrecio).toBeInTheDocument();

    fireEvent.change(inputPrecio, { target: { value: '42.00' } });

    const btnGuardar = screen.getByRole('button', { name: /Guardar cambios/i });
    fireEvent.click(btnGuardar);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Lomo Saltado Clásico',
          precio: 42.0,
        })
      );
    });

    expect(container).toMatchSnapshot();
  });
});
