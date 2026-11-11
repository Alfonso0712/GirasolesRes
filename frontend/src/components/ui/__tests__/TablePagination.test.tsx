import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  TablePagination,
  calcularNumerosPaginacion
} from '../TablePagination';

describe('TablePagination y función pura calcularNumerosPaginacion', () => {
  describe('calcularNumerosPaginacion (Función Pura)', () => {
    it('retorna arreglo vacío si totalPages <= 1', () => {
      expect(calcularNumerosPaginacion(1, 1)).toEqual([]);
      expect(calcularNumerosPaginacion(1, 0)).toEqual([]);
    });

    it('retorna todos los números correlativos si totalPages <= 7', () => {
      expect(calcularNumerosPaginacion(1, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(calcularNumerosPaginacion(3, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(calcularNumerosPaginacion(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('retorna inicio continuo y ellipsis al final cuando currentPage <= 3 en > 7 páginas', () => {
      // Ejemplo del prompt: 1 2 3 4 … 8 (at page 2)
      expect(calcularNumerosPaginacion(2, 8)).toEqual([1, 2, 3, 4, 'ellipsis', 8]);
      expect(calcularNumerosPaginacion(1, 8)).toEqual([1, 2, 3, 4, 'ellipsis', 8]);
      expect(calcularNumerosPaginacion(3, 8)).toEqual([1, 2, 3, 4, 'ellipsis', 8]);
    });

    it('retorna ellipsis en ambos extremos cuando currentPage está en el medio', () => {
      // Ejemplo del prompt: 1 … 4 5 6 … 12 (at page 5)
      expect(calcularNumerosPaginacion(5, 12)).toEqual([
        1,
        'ellipsis',
        4,
        5,
        6,
        'ellipsis',
        12,
      ]);
      // Caso 100 páginas en la 50
      expect(calcularNumerosPaginacion(50, 100)).toEqual([
        1,
        'ellipsis',
        49,
        50,
        51,
        'ellipsis',
        100,
      ]);
    });

    it('retorna ellipsis al inicio y final continuo cuando currentPage está cerca del final', () => {
      // Ejemplo del prompt: 1 … 9 10 11 12 (at page 11)
      expect(calcularNumerosPaginacion(11, 12)).toEqual([
        1,
        'ellipsis',
        9,
        10,
        11,
        12,
      ]);
      expect(calcularNumerosPaginacion(12, 12)).toEqual([
        1,
        'ellipsis',
        9,
        10,
        11,
        12,
      ]);
      expect(calcularNumerosPaginacion(10, 12)).toEqual([
        1,
        'ellipsis',
        9,
        10,
        11,
        12,
      ]);
    });
  });

  describe('Componente TablePagination', () => {
    it('no renderiza nada si totalItems === 0', () => {
      const { container } = render(
        <TablePagination
          currentPage={1}
          totalPages={0}
          totalItems={0}
          onPageChange={vi.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('mantiene compatibilidad retroactiva: sin onPageSizeChange no muestra selector ni números', () => {
      render(
        <TablePagination
          currentPage={2}
          totalPages={5}
          totalItems={50}
          itemsPerPage={10}
          entityName="usuarios"
          onPageChange={vi.fn()}
        />
      );

      // No debe existir el selector "Mostrar:"
      expect(screen.queryByLabelText(/filas por página/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/mostrar:/i)).not.toBeInTheDocument();

      // No debe existir ningún botón de número de página directo
      expect(screen.queryByRole('button', { name: 'Ir a la página 1' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Ir a la página 2' })).not.toBeInTheDocument();

      // Debe mostrar el contador y el texto de página clásica
      expect(screen.getByText(/mostrando/i)).toBeInTheDocument();
      expect(screen.getByText(/página/i)).toBeInTheDocument();
    });

    it('renderiza selector de tamaño y opciones con textos "N por página"', () => {
      const onPageSizeChange = vi.fn();
      render(
        <TablePagination
          currentPage={1}
          totalPages={5}
          totalItems={100}
          pageSize={20}
          pageSizeOptions={[10, 20, 50]}
          onPageSizeChange={onPageSizeChange}
          entityName="ventas"
          onPageChange={vi.fn()}
        />
      );

      const select = screen.getByLabelText(/filas por página/i) as HTMLSelectElement;
      expect(select).toBeInTheDocument();
      expect(select.value).toBe('20');

      expect(screen.getByRole('option', { name: '10 por página' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '20 por página' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '50 por página' })).toBeInTheDocument();

      fireEvent.change(select, { target: { value: '50' } });
      expect(onPageSizeChange).toHaveBeenCalledWith(50);
    });

    it('asegura que el tamaño actual siempre esté incluido en las opciones del selector', () => {
      render(
        <TablePagination
          currentPage={1}
          totalPages={3}
          totalItems={45}
          pageSize={15}
          pageSizeOptions={[10, 20, 50]}
          onPageSizeChange={vi.fn()}
          onPageChange={vi.fn()}
        />
      );

      expect(screen.getByRole('option', { name: '15 por página' })).toBeInTheDocument();
    });

    it('renderiza números de página clicables y resalta la página actual con aria-current="page"', () => {
      const onPageChange = vi.fn();
      render(
        <TablePagination
          currentPage={2}
          totalPages={5}
          totalItems={50}
          pageSize={10}
          pageSizeOptions={[10, 20, 50]}
          onPageSizeChange={vi.fn()}
          entityName="usuarios"
          onPageChange={onPageChange}
        />
      );

      const page2Btn = screen.getByRole('button', { name: 'Ir a la página 2' });
      expect(page2Btn).toHaveAttribute('aria-current', 'page');
      expect(page2Btn).toHaveClass('bg-primary');
      expect(page2Btn).toHaveClass('text-white');

      const page4Btn = screen.getByRole('button', { name: 'Ir a la página 4' });
      expect(page4Btn).not.toHaveAttribute('aria-current');

      fireEvent.click(page4Btn);
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('si hay 1 sola página, no muestra números de página pero sí el selector', () => {
      render(
        <TablePagination
          currentPage={1}
          totalPages={1}
          totalItems={5}
          pageSize={10}
          pageSizeOptions={[10, 20, 50]}
          onPageSizeChange={vi.fn()}
          entityName="usuarios"
          onPageChange={vi.fn()}
        />
      );

      expect(screen.getByLabelText(/filas por página/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /ir a la página/i })).not.toBeInTheDocument();
    });

    it('deshabilita flecha anterior en primera página y flecha siguiente en última página', () => {
      const onPageChange = vi.fn();
      const { rerender } = render(
        <TablePagination
          currentPage={1}
          totalPages={3}
          totalItems={30}
          pageSize={10}
          onPageSizeChange={vi.fn()}
          onPageChange={onPageChange}
        />
      );

      const prevBtn = screen.getByRole('button', { name: 'Página anterior' });
      const nextBtn = screen.getByRole('button', { name: 'Página siguiente' });

      expect(prevBtn).toBeDisabled();
      expect(nextBtn).not.toBeDisabled();

      fireEvent.click(nextBtn);
      expect(onPageChange).toHaveBeenCalledWith(2);

      // Re-render en última página
      rerender(
        <TablePagination
          currentPage={3}
          totalPages={3}
          totalItems={30}
          pageSize={10}
          onPageSizeChange={vi.fn()}
          onPageChange={onPageChange}
        />
      );

      expect(prevBtn).not.toBeDisabled();
      expect(nextBtn).toBeDisabled();

      fireEvent.click(prevBtn);
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('cumple con atributos de accesibilidad de navegación y aria-live', () => {
      render(
        <TablePagination
          currentPage={1}
          totalPages={4}
          totalItems={40}
          pageSize={10}
          onPageSizeChange={vi.fn()}
          entityName="cierres"
          onPageChange={vi.fn()}
        />
      );

      const nav = screen.getByRole('navigation', { name: 'Paginación' });
      expect(nav).toBeInTheDocument();

      const liveCounter = screen.getByText(/mostrando/i);
      expect(liveCounter).toHaveAttribute('aria-live', 'polite');
    });
  });
});
