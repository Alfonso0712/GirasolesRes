import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AbrirCajaModal } from '../AbrirCajaModal';
import { CerrarCajaModal } from '../CerrarCajaModal';
import { CierreDetalleModal } from '../CierreDetalleModal';
import { cajaService } from '../../../services/cajaService';
import type { CierreResumenDto, CierreDetalleDto } from '../../../types/caja';

describe('Caja Modals - Pruebas de Caracterización y Red de Seguridad', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('AbrirCajaModal', () => {
    it('debe renderizar con sugerencia inicial y snapshot idéntico', () => {
      const onCajaAbierta = vi.fn();
      const onClose = vi.fn();

      const { container } = render(
        <AbrirCajaModal
          isOpen={true}
          onClose={onClose}
          onCajaAbierta={onCajaAbierta}
          token="fake-token"
          sugerenciaInicial={120.0}
        />
      );

      expect(screen.getByText(/Apertura de Caja/i)).toBeInTheDocument();
      const input = screen.getByPlaceholderText(/0\.00/i) as HTMLInputElement;
      expect(input.value).toBe('120.00');

      expect(container).toMatchSnapshot();
    });

    it('debe permitir ingresar monto y confirmar apertura', async () => {
      vi.spyOn(cajaService, 'abrirCaja').mockResolvedValue({
        cajaId: 'caja-123',
        montoInicial: 150.0,
        fechaApertura: '2026-10-30T10:00:00Z',
        mensaje: 'Caja abierta con éxito.',
      });

      const onCajaAbierta = vi.fn();
      render(
        <AbrirCajaModal
          isOpen={true}
          onClose={vi.fn()}
          onCajaAbierta={onCajaAbierta}
          token="fake-token"
          sugerenciaInicial={null}
        />
      );

      const input = screen.getByPlaceholderText(/0\.00/i);
      fireEvent.change(input, { target: { value: '150.00' } });

      const btnContinuar = screen.getByRole('button', { name: /Continuar/i });
      fireEvent.click(btnContinuar);

      await waitFor(() => {
        expect(screen.getByText(/Confirmación de Apertura/i)).toBeInTheDocument();
      });

      const btnConfirmar = screen.getByRole('button', { name: /CONFIRMAR APERTURA/i });
      fireEvent.click(btnConfirmar);

      await waitFor(() => {
        expect(onCajaAbierta).toHaveBeenCalledWith(150, 'Caja abierta con éxito.');
      });
    });
  });

  describe('CerrarCajaModal', () => {
    const mockResumen: CierreResumenDto = {
      cajaId: 'caja-test-1',
      fechaApertura: '2026-10-30T08:00:00Z',
      montoInicial: 100.0,
      ventasEfectivo: 250.0,
      ventasYape: 150.0,
      totalVentas: 400.0,
      efectivoEsperado: 350.0,
      cantidadVentas: 12,
      platosVendidos: [
        { nombre: 'Ceviche Mixto', cantidad: 4, total: 120.0 },
        { nombre: 'Arroz con Mariscos', cantidad: 3, total: 90.0 },
      ],
      pedidosPendientes: [],
    };

    it('debe calcular correctamente efectivo esperado, descuadre y vuelto en el arqueo', async () => {
      vi.spyOn(cajaService, 'obtenerResumenCierre').mockResolvedValue(mockResumen);

      const { container } = render(
        <CerrarCajaModal
          isOpen={true}
          onClose={vi.fn()}
          onCierreCompletado={vi.fn()}
          token="fake-token"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Cierre de Caja y Cuadre de Turno/i)).toBeInTheDocument();
      });

      // Validar montos clave del resumen
      expect(screen.getByText(/S\/ 100\.00/)).toBeInTheDocument(); // Monto inicial
      expect(screen.getByText(/S\/ 250\.00/)).toBeInTheDocument(); // Ventas en efectivo
      expect(screen.getByText(/S\/ 150\.00/)).toBeInTheDocument(); // Ventas en Yape
      expect(screen.getByText(/S\/ 350\.00/)).toBeInTheDocument(); // Efectivo esperado

      const inputContado = screen.getByPlaceholderText(/0\.00/i);

      // 1. Caso Cuadre Exacto (S/ 350 contado)
      fireEvent.change(inputContado, { target: { value: '350.00' } });
      expect(screen.getByText(/Cuadra: el efectivo contado coincide con el esperado/i)).toBeInTheDocument();

      // 2. Caso Faltante (S/ 320 contado -> Faltante S/ 30.00)
      fireEvent.change(inputContado, { target: { value: '320.00' } });
      expect(screen.getByText(/Faltante de S\/ 30\.00/i)).toBeInTheDocument();

      // 3. Caso Sobrante (S/ 380 contado -> Sobrante S/ 30.00)
      fireEvent.change(inputContado, { target: { value: '380.00' } });
      expect(screen.getByText(/Sobrante de S\/ 30\.00/i)).toBeInTheDocument();

      expect(container).toMatchSnapshot();
    });
  });

  describe('CierreDetalleModal', () => {
    const mockDetalle: CierreDetalleDto = {
      cajaId: 'caja-historico-99',
      fechaApertura: '2026-10-29T08:00:00Z',
      fechaCierre: '2026-10-29T16:00:00Z',
      cajeroApertura: 'Carlos Cajero',
      cajeroCierre: 'Carlos Cajero',
      montoInicial: 100.0,
      ventasEfectivo: 300.0,
      ventasYape: 200.0,
      totalVentas: 500.0,
      efectivoEsperado: 400.0,
      efectivoContado: 400.0,
      diferencia: 0.0,
      observacion: 'Turno sin incidentes.',
      cantidadVentas: 15,
      platosVendidos: [{ nombre: 'Lomo Saltado', cantidad: 5, total: 150.0 }],
      ajustesPosteriores: [],
    };

    it('debe renderizar detalle histórico con valores numéricos y snapshot consistente', async () => {
      vi.spyOn(cajaService, 'obtenerDetalleCierre').mockResolvedValue(mockDetalle);

      const { container } = render(
        <CierreDetalleModal
          isOpen={true}
          onClose={vi.fn()}
          cajaId="caja-historico-99"
          token="fake-token"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Detalle de Cierre de Caja/i)).toBeInTheDocument();
      });

      expect(screen.getAllByText(/Carlos Cajero/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Turno sin incidentes\./i)).toBeInTheDocument();

      expect(container).toMatchSnapshot();
    });
  });
});
