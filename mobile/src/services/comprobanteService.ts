import { apiClient } from './apiClient';

export interface OpcionesDescargaComprobante {
  copia?: boolean;
}

/**
 * Servicio de descarga del comprobante de venta en formato PDF.
 * - Primera emisión tras el cobro (`copia = false`): consume `GET /api/cobros/comprobantes/{ventaId}/pdf?copia=false`
 *   de `CobrosController` (`[Authorize(Roles = "Cajero")]`).
 * - Reimpresión desde el historial de ventas (`copia = true`): consume `GET /api/ventas/{id}/ticket?copia=true`
 *   de `VentasController` (`[Authorize(Roles = "Cajero,Administrador")]`).
 * Sin rutas de respaldo.
 */
export const comprobanteService = {
  descargarPdfComprobante: async (
    id: string,
    opciones?: OpcionesDescargaComprobante
  ): Promise<Blob> => {
    const esCopia = Boolean(opciones?.copia);
    const idSeguro = encodeURIComponent(id);

    if (esCopia) {
      return apiClient.descargarArchivo(`/ventas/${idSeguro}/ticket?copia=true`);
    }

    return apiClient.descargarArchivo(`/cobros/comprobantes/${idSeguro}/pdf?copia=false`);
  },
};
