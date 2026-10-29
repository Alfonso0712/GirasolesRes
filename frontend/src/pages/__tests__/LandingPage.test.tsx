import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LandingPage } from '../LandingPage';
import { landingService } from '../../services/landingService';

describe('LandingPage - Vista de Bienvenida y Carta Pública', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(landingService, 'obtenerCartaPublica').mockResolvedValue([
      {
        id: '1',
        nombre: 'Ceviche Mixto Especial Criollo',
        tipo: 'Carta',
        categoria: 'PlatosExtras',
        precio: 30.0,
        activo: true,
      },
      {
        id: '2',
        nombre: 'Café pasado tradicional',
        tipo: 'Componente',
        categoria: 'Desayuno',
        rol: 'BebidaDesayuno',
        precio: 4.0,
        activo: true,
      },
      {
        id: '3',
        nombre: 'Plato No Definido En Menu',
        tipo: 'Carta',
        categoria: 'PlatosExtras',
        precio: 50.0,
        activo: true,
      },
    ]);

    vi.spyOn(landingService, 'obtenerMenuPublico').mockResolvedValue({
      fecha: '2026-10-29',
      definido: true,
      desayuno: null,
      platos: [
        {
          productoId: '1',
          nombre: 'Ceviche Mixto Especial Criollo',
          categoria: 'PlatosExtras',
          precio: 30.0,
          agotado: false,
        },
      ],
      opciones: [
        {
          productoId: '2',
          nombre: 'Café pasado tradicional',
          rol: 'BebidaDesayuno',
          agotado: false,
        },
      ],
      menusCompletos: [],
    });
  });

  it('debe renderizar el título de bienvenida y los elementos principales', async () => {
    render(<LandingPage onGoToLogin={vi.fn()} />);

    expect(screen.getByText(/El auténtico sabor peruano en/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Restaurante Girasoles/i).length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByText('Ceviche Mixto Especial Criollo')).toBeInTheDocument();
      expect(screen.getByText('Café pasado tradicional')).toBeInTheDocument();
    });
  });

  it('debe mostrar en la carta SOLO los platos definidos en el menú del día', async () => {
    render(<LandingPage onGoToLogin={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Ceviche Mixto Especial Criollo')).toBeInTheDocument();
    });

    // El plato '3' no está definido en el menú del día, por ende NO debe mostrarse
    expect(screen.queryByText('Plato No Definido En Menu')).not.toBeInTheDocument();
  });

  it('no debe mostrar la tarjeta de Boletas y Facturas en servicios', () => {
    render(<LandingPage onGoToLogin={vi.fn()} />);

    expect(screen.queryByText(/Boletas y Facturas/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Yape, Plin & Efectivo/i)).toBeInTheDocument();
    expect(screen.getByText(/Para Llevar y Salón/i)).toBeInTheDocument();
  });

  it('debe invocar onGoToLogin al presionar el botón de ingreso al sistema', () => {
    const onGoToLoginMock = vi.fn();
    render(<LandingPage onGoToLogin={onGoToLoginMock} />);

    const botonesLogin = screen.getAllByRole('button', { name: /iniciar sesi[oó]n/i });
    expect(botonesLogin.length).toBeGreaterThan(0);

    fireEvent.click(botonesLogin[0]);
    expect(onGoToLoginMock).toHaveBeenCalled();
  });

  it('permite buscar platos por nombre en el buscador de la carta', async () => {
    render(<LandingPage onGoToLogin={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Ceviche Mixto Especial Criollo')).toBeInTheDocument();
    });

    const inputBuscador = screen.getByPlaceholderText(/Buscar por nombre/i);
    fireEvent.change(inputBuscador, { target: { value: 'Café' } });

    expect(screen.queryByText('Ceviche Mixto Especial Criollo')).not.toBeInTheDocument();
    expect(screen.getByText('Café pasado tradicional')).toBeInTheDocument();
  });

  it('debe mostrar la tarjeta de información y contacto en el hero con horario, dirección y teléfono', () => {
    render(<LandingPage onGoToLogin={vi.fn()} />);

    expect(screen.getByText('Visítanos o Haz tu Pedido')).toBeInTheDocument();
    expect(screen.getAllByText(/7:00 AM/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Jr. Mariscal Castilla N° 1023').length).toBeGreaterThan(0);
    expect(screen.getAllByText('934 127 923').length).toBeGreaterThan(0);
  });

  it('debe aislar la landing page del modo oscuro removiendo la clase dark del documentElement', () => {
    document.documentElement.classList.add('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    render(<LandingPage onGoToLogin={vi.fn()} />);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
