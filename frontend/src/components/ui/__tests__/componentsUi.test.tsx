import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  StatCard,
  FilterBar,
  ConfirmModal,
  DiscardChangesModal,
  EmptyState,
} from '../index';
import { SolesIcon } from '../SolesIcon';

describe('components/ui - Pruebas de Componentes Reutilizables', () => {
  describe('StatCard', () => {
    it('renderiza título, valor y subtítulo en modo vertical por defecto', () => {
      render(
        <StatCard
          title="Ventas del Día"
          value="S/ 1,250.00"
          subtitle="45 pedidos atendidos"
          icon={SolesIcon}
        />
      );

      expect(screen.getByText('Ventas del Día')).toBeInTheDocument();
      expect(screen.getByText('S/ 1,250.00')).toBeInTheDocument();
      expect(screen.getByText('45 pedidos atendidos')).toBeInTheDocument();
    });

    it('renderiza en modo horizontal cuando se especifica', () => {
      render(
        <StatCard
          title="Total Recaudado"
          value="S/ 890.00"
          subtitle="ventas"
          layout="horizontal"
          icon={SolesIcon}
        />
      );

      expect(screen.getByText('Total Recaudado')).toBeInTheDocument();
      expect(screen.getByText('S/ 890.00')).toBeInTheDocument();
    });
  });

  describe('FilterBar', () => {
    it('permite ingresar texto y limpiar búsqueda', () => {
      const onSearchChange = vi.fn();
      const { rerender } = render(
        <FilterBar
          searchValue="Pollo"
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar plato..."
        />
      );

      const input = screen.getByPlaceholderText('Buscar plato...');
      expect(input).toHaveValue('Pollo');

      const clearBtn = screen.getByRole('button', { name: /limpiar búsqueda/i });
      fireEvent.click(clearBtn);
      expect(onSearchChange).toHaveBeenCalledWith('');

      rerender(
        <FilterBar
          searchValue=""
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar plato..."
        />
      );

      expect(screen.queryByRole('button', { name: /limpiar búsqueda/i })).not.toBeInTheDocument();
    });
  });

  describe('ConfirmModal (Genérico y Específico)', () => {
    it('renderiza en modo genérico con título y confirmación', () => {
      const onConfirm = vi.fn();
      const onClose = vi.fn();

      render(
        <ConfirmModal
          isOpen={true}
          title="¿Desea cerrar el turno?"
          subtitle="No podrá revertir esta acción."
          confirmText="Cerrar turno"
          onConfirm={onConfirm}
          onClose={onClose}
        />
      );

      expect(screen.getByText('¿Desea cerrar el turno?')).toBeInTheDocument();
      expect(screen.getByText('No podrá revertir esta acción.')).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: /cerrar turno/i });
      fireEvent.click(confirmBtn);
      expect(onConfirm).toHaveBeenCalled();
    });

    it('renderiza en modo usuario desactivar con compatibilidad total', () => {
      const onConfirm = vi.fn();
      const onClose = vi.fn();

      render(
        <ConfirmModal
          isOpen={true}
          tipo="desactivar"
          nombreUsuario="Juan Pérez"
          onConfirm={onConfirm}
          onClose={onClose}
        />
      );

      expect(screen.getByText('¿Desactivar a Juan Pérez?')).toBeInTheDocument();
    });
  });

  describe('DiscardChangesModal', () => {
    it('renderiza con textos por defecto y confirma descarte', () => {
      const onConfirm = vi.fn();
      const onClose = vi.fn();

      render(
        <DiscardChangesModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );

      expect(screen.getByText('Tiene cambios sin guardar')).toBeInTheDocument();
      const discardBtn = screen.getByRole('button', { name: /descartar cambios/i });
      fireEvent.click(discardBtn);
      expect(onConfirm).toHaveBeenCalled();
    });

    it('permite personalizar textos', () => {
      render(
        <DiscardChangesModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Modificaciones pendientes"
          confirmText="Salir sin guardar"
        />
      );

      expect(screen.getByText('Modificaciones pendientes')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /salir sin guardar/i })).toBeInTheDocument();
    });
  });

  describe('EmptyState', () => {
    it('renderiza título, descripción y botón de acción', () => {
      const onAction = vi.fn();

      render(
        <EmptyState
          title="No hay productos"
          description="Agregue productos al catálogo para comenzar."
          actionLabel="Crear Producto"
          onAction={onAction}
        />
      );

      expect(screen.getByText('No hay productos')).toBeInTheDocument();
      expect(screen.getByText('Agregue productos al catálogo para comenzar.')).toBeInTheDocument();

      const actionBtn = screen.getByRole('button', { name: /crear producto/i });
      fireEvent.click(actionBtn);
      expect(onAction).toHaveBeenCalled();
    });
  });
});
