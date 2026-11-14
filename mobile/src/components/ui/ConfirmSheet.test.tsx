import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmSheet } from './ConfirmSheet';

describe('ConfirmSheet - Hoja modal de confirmación', () => {
  it('no debe renderizar nada cuando isOpen es false', () => {
    const { container } = render(
      <ConfirmSheet
        isOpen={false}
        titulo="¿Anular pedido?"
        mensaje="Esta acción no se puede deshacer."
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar título, mensaje y botones al estar abierto', () => {
    render(
      <ConfirmSheet
        isOpen={true}
        titulo="¿Cerrar turno de caja?"
        mensaje="Se emitirá el arqueo definitivo."
        etiquetaConfirmar="Cerrar Caja"
        etiquetaCancelar="Volver"
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    // Puede aparecer en el encabezado del bottom sheet y en el cuerpo del diálogo
    expect(screen.getAllByText('¿Cerrar turno de caja?').length).toBeGreaterThan(0);
    expect(screen.getByText('Se emitirá el arqueo definitivo.')).toBeInTheDocument();
    expect(screen.getByText('Cerrar Caja')).toBeInTheDocument();
    expect(screen.getByText('Volver')).toBeInTheDocument();
  });

  it('debe ejecutar los callbacks al hacer clic en Confirmar o Cancelar', () => {
    const onConfirmar = vi.fn();
    const onCancelar = vi.fn();

    render(
      <ConfirmSheet
        isOpen={true}
        titulo="¿Confirmar acción?"
        mensaje="Detalle de confirmación"
        etiquetaConfirmar="Aceptar"
        etiquetaCancelar="Descartar"
        onConfirmar={onConfirmar}
        onCancelar={onCancelar}
      />
    );

    fireEvent.click(screen.getByText('Aceptar'));
    expect(onConfirmar).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Descartar'));
    expect(onCancelar).toHaveBeenCalledTimes(1);
  });

  it('debe deshabilitar botones y mostrar estado de carga si cargando es true', () => {
    render(
      <ConfirmSheet
        isOpen={true}
        titulo="Procesando"
        mensaje="Guardando cambios..."
        cargando={true}
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    const btnConfirmar = screen.getByRole('button', { name: /confirmar/i });
    expect(btnConfirmar).toBeDisabled();
  });
});
