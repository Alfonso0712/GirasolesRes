import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComandaCard } from '../ComandaCard';
import type { ComandaKdsItem } from '../../../types/comanda';

describe('ComandaCard - Pruebas de Caracterización y Estados KDS', () => {
  const mockComandaMesa: ComandaKdsItem = {
    id: 'cmd-01',
    pedidoNumero: 18,
    tipo: 'Mesa',
    mesa: 'Mesa 4',
    referencia: null,
    horaLlegada: '13:45',
    fechaHoraLlegadaUtc: '2026-10-30T18:45:00Z',
    estado: 'Pendiente',
    etiqueta: null,
    esAdicional: false,
    numeroAdicional: 0,
    modificada: false,
    registradoPor: 'Juan Mozo',
    minutosEspera: 8,
    esDemora: false,
    lineas: [
      {
        producto: 'Seco de Pollo Criollo',
        cantidad: 2,
        observacion: 'Frejoles bien calientes',
      },
    ],
  };

  it('debe renderizar la comanda en zona pendiente con botón de empezar preparación y snapshot fiel', () => {
    const onAccionPrincipal = vi.fn();

    const { container } = render(
      <ComandaCard
        comanda={mockComandaMesa}
        tipoZona="pendiente"
        onAccionPrincipal={onAccionPrincipal}
      />
    );

    expect(screen.getByText(/N\.º 18/i)).toBeInTheDocument();
    expect(screen.getByText(/Mesa 4/i)).toBeInTheDocument();
    expect(screen.getByText(/Seco de Pollo Criollo/i)).toBeInTheDocument();
    expect(screen.getByText(/Obs: Frejoles bien calientes/i)).toBeInTheDocument();

    const btnAccion = screen.getByRole('button', { name: /INICIAR PREPARACIÓN/i });
    expect(btnAccion).toBeInTheDocument();
    fireEvent.click(btnAccion);
    expect(onAccionPrincipal).toHaveBeenCalledWith(mockComandaMesa);

    expect(container).toMatchSnapshot();
  });

  it('debe renderizar en zona de preparación con botón marcar como lista', () => {
    const onAccionPrincipal = vi.fn();
    const comandaEnPrep: ComandaKdsItem = {
      ...mockComandaMesa,
      estado: 'EnPreparacion',
      minutosEspera: 16,
      esDemora: true,
    };

    const { container } = render(
      <ComandaCard
        comanda={comandaEnPrep}
        tipoZona="en_preparacion"
        onAccionPrincipal={onAccionPrincipal}
      />
    );

    expect(screen.getByText(/Demora/i)).toBeInTheDocument();
    const btnLista = screen.getByRole('button', { name: /MARCAR COMO LISTA/i });
    expect(btnLista).toBeInTheDocument();
    fireEvent.click(btnLista);
    expect(onAccionPrincipal).toHaveBeenCalledWith(comandaEnPrep);

    expect(container).toMatchSnapshot();
  });
});
