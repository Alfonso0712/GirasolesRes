// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  normalizarCelularPeru,
  armarMensajeComprobante,
  urlWhatsApp,
} from './whatsapp';
import { nombreArchivoComprobante, sanitizarNombrePdf } from './archivos';
import { useComprobanteAcciones } from '../hooks/useComprobanteAcciones';
import { comprobanteService } from '../services/comprobanteService';

vi.mock('../services/comprobanteService', () => ({
  comprobanteService: {
    descargarPdfComprobante: vi.fn(),
  },
}));

vi.mock('./archivos', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./archivos')>();
  return {
    ...actual,
    abrirPdf: vi.fn().mockResolvedValue('visor'),
    guardarPdf: vi.fn().mockResolvedValue('documentos'),
    compartirPdf: vi.fn().mockResolvedValue(undefined),
  };
});

describe('Utilidades de WhatsApp y archivos de comprobante (V-A)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normalizarCelularPeru', () => {
    it('acepta 9 dígitos válidos que empiezan con 9', () => {
      expect(normalizarCelularPeru('987654321')).toBe('987654321');
    });

    it('acepta espacios, guiones y prefijos +51 o 51', () => {
      expect(normalizarCelularPeru('987 654 321')).toBe('987654321');
      expect(normalizarCelularPeru('987-654-321')).toBe('987654321');
      expect(normalizarCelularPeru('+51 987 654 321')).toBe('987654321');
      expect(normalizarCelularPeru('+51-987-654-321')).toBe('987654321');
      expect(normalizarCelularPeru('51987654321')).toBe('987654321');
      expect(normalizarCelularPeru('51 987-654-321')).toBe('987654321');
    });

    it('rechaza números de 8 o 10 dígitos y los que no empiezan con 9', () => {
      expect(normalizarCelularPeru('98765432')).toBeNull();
      expect(normalizarCelularPeru('9876543210')).toBeNull();
      expect(normalizarCelularPeru('887654321')).toBeNull();
      expect(normalizarCelularPeru('+51 887654321')).toBeNull();
      expect(normalizarCelularPeru('')).toBeNull();
      expect(normalizarCelularPeru('   ')).toBeNull();
      expect(normalizarCelularPeru('98765abcd')).toBeNull();
    });
  });

  describe('armarMensajeComprobante', () => {
    it('arma el mensaje exacto sin DNI ni RUC', () => {
      const msg = armarMensajeComprobante({
        numero: 'B001-000042',
        total: 48.5,
        fecha: '14/11/2026 13:25:59',
      });

      expect(msg).toBe(
        'Restaurante Girasoles\nComprobante B001-000042\nFecha: 14/11/2026 13:25\nTotal: S/ 48.50\nGracias por su preferencia.'
      );
      expect(msg).not.toMatch(/DNI|RUC/i);
    });
  });

  describe('urlWhatsApp', () => {
    it('construye enlace con código 51 cuando hay celular válido', () => {
      const msg = 'Restaurante Girasoles\nComprobante T001-000001';
      const url = urlWhatsApp('987 654 321', msg);
      expect(url).toBe(`https://wa.me/51987654321?text=${encodeURIComponent(msg)}`);
    });

    it('construye enlace sin teléfono cuando el celular es null o vacío', () => {
      const msg = 'Restaurante Girasoles\nComprobante T001-000001';
      expect(urlWhatsApp(null, msg)).toBe(`https://wa.me/?text=${encodeURIComponent(msg)}`);
      expect(urlWhatsApp('', msg)).toBe(`https://wa.me/?text=${encodeURIComponent(msg)}`);
    });
  });

  describe('nombreArchivoComprobante y sanitizarNombrePdf', () => {
    it('genera comprobante-{numero}.pdf sin caracteres inválidos', () => {
      expect(nombreArchivoComprobante('B001-000123')).toBe('comprobante-B001-000123.pdf');
      expect(nombreArchivoComprobante('F001/000123:*?"<>|')).toBe('comprobante-F001-000123.pdf');
      expect(sanitizarNombrePdf('mi archivo / raro?.pdf')).toBe('mi-archivo-raro.pdf');
    });
  });

  describe('useComprobanteAcciones', () => {
    it('descarga el PDF una sola vez y reutiliza el Blob en memoria entre Imprimir, Guardar y Compartir', async () => {
      const blobFalso = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
      vi.mocked(comprobanteService.descargarPdfComprobante).mockResolvedValue(blobFalso);

      const { result } = renderHook(() =>
        useComprobanteAcciones({
          ventaId: 'venta-123',
          numero: 'B001-000009',
          total: 35,
          fecha: '14/11/2026 12:00',
          esCopia: false,
        })
      );

      await act(async () => {
        await result.current.imprimir();
      });
      expect(result.current.estados.imprimir).toBe('ok');

      await act(async () => {
        await result.current.guardar();
      });
      expect(result.current.estados.guardar).toBe('ok');

      await act(async () => {
        await result.current.compartir();
      });
      expect(result.current.estados.compartir).toBe('ok');

      expect(comprobanteService.descargarPdfComprobante).toHaveBeenCalledTimes(1);
      expect(comprobanteService.descargarPdfComprobante).toHaveBeenCalledWith('venta-123', {
        copia: false,
      });
    });
  });
});
