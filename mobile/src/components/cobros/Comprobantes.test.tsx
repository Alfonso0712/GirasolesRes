// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CobroExitoSheet } from './CobroExitoSheet';
import { ComprobanteAcciones } from './ComprobanteAcciones';
import { EnviarWhatsAppSheet } from './EnviarWhatsAppSheet';
import { VentaDetalleSheet } from '../caja/VentaDetalleSheet';
import { comprobanteService } from '../../services/comprobanteService';
import type { VentaDetalle } from '../../types/venta';

vi.mock('../../services/comprobanteService', () => ({
  comprobanteService: {
    descargarPdfComprobante: vi.fn(),
  },
}));

vi.mock('../../utils/archivos', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/archivos')>();
  return {
    ...actual,
    abrirPdf: vi.fn().mockResolvedValue('visor'),
    guardarPdf: vi.fn().mockResolvedValue('documentos'),
    compartirPdf: vi.fn().mockResolvedValue(undefined),
  };
});

const ventaMockBase: VentaDetalle = {
  ventaId: 'v-001',
  comprobante: 'B001-000105',
  fechaHoraUtc: '2026-11-14T17:00:00Z',
  fechaHoraFormateada: '14/11/2026 12:00',
  pedidoNumero: 14,
  tipo: 'Salón / Mesa',
  mesa: 'Mesa 3',
  total: 60,
  metodo: 'Efectivo',
  montoRecibido: 100,
  vuelto: 40,
  cajero: 'María Quispe',
  estado: 'Vigente',
  cajaCerrada: false,
  lineas: [
    {
      cantidad: 2,
      productoNombre: 'Lomo Saltado',
      precioUnitario: 30,
      subtotal: 60,
    },
  ],
};

describe('Comprobantes tras el cobro y reimpresión en Ventas (V-B, V-C, V-D)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('CobroExitoSheet', () => {
    it('muestra número, tipo, destino, total, recibido y vuelto cuando el método es Efectivo y enfoca Listo', () => {
      const onListo = vi.fn();
      render(
        <CobroExitoSheet
          isOpen={true}
          onListo={onListo}
          datos={{
            ventaId: 'v-100',
            numeroComprobante: 'B001-000088',
            tipoComprobante: 'Boleta',
            destino: 'Mesa 4',
            metodoPago: 'Efectivo',
            total: 42.5,
            montoRecibido: 50,
            vuelto: 7.5,
            fechaHora: '14/11/2026 12:30',
          }}
        />
      );

      expect(screen.getByText('B001-000088')).toBeTruthy();
      expect(screen.getByText('Boleta')).toBeTruthy();
      expect(screen.getByText('Mesa 4')).toBeTruthy();
      expect(screen.getByText('S/ 42.50')).toBeTruthy();
      expect(screen.getByText('Recibido S/ 50.00')).toBeTruthy();
      expect(screen.getByText('Vuelto S/ 7.50')).toBeTruthy();

      const btnListo = screen.getByRole('button', {
        name: /Listo, cerrar comprobante/i,
      });
      expect(document.activeElement).toBe(btnListo);
    });

    it('no muestra fila de vuelto cuando el método es Yape', () => {
      render(
        <CobroExitoSheet
          isOpen={true}
          onListo={vi.fn()}
          datos={{
            ventaId: 'v-101',
            numeroComprobante: 'T001-000012',
            tipoComprobante: 'Ticket',
            destino: 'Para llevar',
            metodoPago: 'Yape',
            total: 25,
            fechaHora: '14/11/2026 12:35',
          }}
        />
      );

      expect(screen.getByText('T001-000012')).toBeTruthy();
      expect(screen.getByText('Para llevar')).toBeTruthy();
      expect(screen.queryByText(/Vuelto S\//i)).toBeNull();
    });
  });

  describe('ComprobanteAcciones', () => {
    it('muestra estado "Generando…" y deshabilita todos los botones mientras genera el PDF', async () => {
      let resolverDescarga!: (b: Blob) => void;
      const promesaDescarga = new Promise<Blob>((resolve) => {
        resolverDescarga = resolve;
      });
      vi.mocked(comprobanteService.descargarPdfComprobante).mockReturnValue(promesaDescarga);

      render(
        <ComprobanteAcciones
          venta={{
            ventaId: 'v-200',
            numero: 'F001-000004',
            total: 120,
            fecha: '14/11/2026 13:00',
            esCopia: false,
          }}
        />
      );

      const btnImprimir = screen.getByRole('button', { name: 'Imprimir comprobante' });
      const btnGuardar = screen.getByRole('button', { name: 'Guardar comprobante en PDF' });
      const btnCompartir = screen.getByRole('button', { name: 'Compartir comprobante en PDF' });
      const btnWhatsApp = screen.getByRole('button', { name: 'Enviar comprobante por WhatsApp' });

      fireEvent.click(btnGuardar);

      expect(screen.getByText('Generando…')).toBeTruthy();
      expect((btnImprimir as HTMLButtonElement).disabled).toBe(true);
      expect((btnGuardar as HTMLButtonElement).disabled).toBe(true);
      expect((btnCompartir as HTMLButtonElement).disabled).toBe(true);
      expect((btnWhatsApp as HTMLButtonElement).disabled).toBe(true);

      resolverDescarga(new Blob(['%PDF-1.4'], { type: 'application/pdf' }));

      await waitFor(() => {
        expect(screen.getByText('Guardar PDF')).toBeTruthy();
        expect((btnImprimir as HTMLButtonElement).disabled).toBe(false);
      });
    });

    it('deshabilita las acciones y muestra "Comprobante anulado." cuando la venta está anulada', () => {
      render(
        <ComprobanteAcciones
          venta={{
            ventaId: 'v-201',
            numero: 'B001-000099',
            total: 35,
            fecha: '14/11/2026 13:10',
            esCopia: true,
            anulada: true,
          }}
        />
      );

      expect(screen.getByText('Comprobante anulado.')).toBeTruthy();
      expect(
        (screen.getByRole('button', { name: 'Imprimir comprobante' }) as HTMLButtonElement).disabled
      ).toBe(true);
      expect(
        (screen.getByRole('button', { name: 'Guardar comprobante en PDF' }) as HTMLButtonElement)
          .disabled
      ).toBe(true);
    });
  });

  describe('EnviarWhatsAppSheet', () => {
    it('valida el celular en línea y NO persiste el número en almacenamiento ni al reabrir', () => {
      const onClose = vi.fn();
      const { rerender } = render(
        <EnviarWhatsAppSheet
          isOpen={true}
          onClose={onClose}
          numeroComprobante="B001-000050"
          total={45}
          fecha="14/11/2026 13:15"
          onCompartirPdf={vi.fn()}
        />
      );

      const input = screen.getByLabelText(/Celular del cliente/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: '81234567' } });

      expect(
        screen.getByText('Ingrese un celular de 9 dígitos que empiece con 9.')
      ).toBeTruthy();
      expect(
        (
          screen.getByRole('button', {
            name: /Abrir WhatsApp para enviar el mensaje/i,
          }) as HTMLButtonElement
        ).disabled
      ).toBe(true);

      // Ingresar un celular válido
      fireEvent.change(input, { target: { value: '987 654 321' } });
      expect(
        screen.queryByText('Ingrese un celular de 9 dígitos que empiece con 9.')
      ).toBeNull();

      // Verificar que no se guardó en localStorage ni sessionStorage
      expect(localStorage.length).toBe(0);
      expect(sessionStorage.length).toBe(0);

      // Cerrar y volver a abrir: el campo debe estar limpio
      rerender(
        <EnviarWhatsAppSheet
          isOpen={false}
          onClose={onClose}
          numeroComprobante="B001-000050"
          total={45}
          fecha="14/11/2026 13:15"
          onCompartirPdf={vi.fn()}
        />
      );
      rerender(
        <EnviarWhatsAppSheet
          isOpen={true}
          onClose={onClose}
          numeroComprobante="B001-000050"
          total={45}
          fecha="14/11/2026 13:15"
          onCompartirPdf={vi.fn()}
        />
      );

      const inputReabierto = screen.getByLabelText(/Celular del cliente/i) as HTMLInputElement;
      expect(inputReabierto.value).toBe('');
    });
  });

  describe('Permisos de visibilidad por rol en VentaDetalleSheet', () => {
    it('muestra ComprobanteAcciones para Cajero y Administrador', () => {
      const { unmount } = render(
        <VentaDetalleSheet
          isOpen={true}
          onClose={vi.fn()}
          venta={ventaMockBase}
          cargando={false}
          rol="Cajero"
        />
      );
      expect(screen.getByRole('button', { name: 'Imprimir comprobante' })).toBeTruthy();
      unmount();

      render(
        <VentaDetalleSheet
          isOpen={true}
          onClose={vi.fn()}
          venta={ventaMockBase}
          cargando={false}
          esAdmin={true}
          rol="Administrador"
        />
      );
      expect(screen.getByRole('button', { name: 'Imprimir comprobante' })).toBeTruthy();
    });

    it('oculta ComprobanteAcciones para Mozo y Cocinero', () => {
      const { unmount } = render(
        <VentaDetalleSheet
          isOpen={true}
          onClose={vi.fn()}
          venta={ventaMockBase}
          cargando={false}
          rol="Mozo"
        />
      );
      expect(screen.queryByRole('button', { name: 'Imprimir comprobante' })).toBeNull();
      unmount();

      render(
        <VentaDetalleSheet
          isOpen={true}
          onClose={vi.fn()}
          venta={ventaMockBase}
          cargando={false}
          rol="Cocinero"
        />
      );
      expect(screen.queryByRole('button', { name: 'Imprimir comprobante' })).toBeNull();
    });
  });
});
