import type {
  CajaActualResponseDto,
  AbrirCajaRequestDto,
  AbrirCajaResponseDto,
  CierreResumenDto,
  CerrarCajaRequestDto,
  CerrarCajaResponseDto,
  ListarCierresResponseDto,
  CierreDetalleDto,
  CajaEstado,
  AbrirCajaRequest,
} from '../types/caja';
import { apiClient } from './apiClient';

export const cajaService = {
  /**
   * CUS 13.1 / HU34: Consulta el estado operativo actual de la caja, apertura activa,
   * ventas parciales acumuladas y sugerencia de monto inicial.
   */
  async obtenerActual(token: string): Promise<CajaActualResponseDto> {
    return apiClient.get<CajaActualResponseDto>('/api/caja/actual', token);
  },

  /**
   * CUS 13.1 / HU34: Apertura de caja con fondo inicial y token de idempotencia.
   */
  async abrirCaja(data: AbrirCajaRequestDto, token: string): Promise<AbrirCajaResponseDto> {
    const json = await apiClient.post<any>('/api/caja/abrir', data, token);
    return {
      ...json,
      usuarioApertura: json.usuarioApertura || json.nombreUsuarioApertura,
    };
  },

  /**
   * CUS 13.2 / HU35: Consulta el resumen de ventas vigentes, pedidos pendientes y balance esperado.
   */
  async obtenerResumenCierre(token: string): Promise<CierreResumenDto> {
    return apiClient.get<CierreResumenDto>('/api/caja/cierre/resumen', token);
  },

  /**
   * CUS 13.2 / HU35: Ejecuta el cierre definitivo y arqueo atómico de la caja.
   */
  async cerrarCaja(data: CerrarCajaRequestDto, token: string): Promise<CerrarCajaResponseDto> {
    return apiClient.post<CerrarCajaResponseDto>('/api/caja/cerrar', data, token);
  },

  /**
   * CUS 13.3 / HU36: Consulta el historial paginado de cierres de caja (Solo Administrador).
   */
  async obtenerHistorialCierres(
    params: { desde?: string; hasta?: string; pagina?: number; tamano?: number },
    token: string
  ): Promise<ListarCierresResponseDto> {
    const query = new URLSearchParams();
    if (params.desde) query.append('desde', params.desde);
    if (params.hasta) query.append('hasta', params.hasta);
    if (params.pagina) query.append('pagina', params.pagina.toString());
    if (params.tamano) query.append('tamano', params.tamano.toString());
    const qs = query.toString() ? `?${query.toString()}` : '';

    return apiClient.get<ListarCierresResponseDto>(`/api/caja/cierres${qs}`, token);
  },

  /**
   * CUS 13.3 / HU36 / Vista 13.4: Obtiene el detalle modal completo de un cierre histórico con platos y ajustes posteriores.
   */
  async obtenerDetalleCierre(cajaId: string, token: string): Promise<CierreDetalleDto> {
    return apiClient.get<CierreDetalleDto>(`/api/caja/cierres/${cajaId}`, token);
  },

  /**
   * CUS 13.2 / HU35 / RNF-48: Descarga el comprobante PDF de 1 página del cierre.
   */
  async descargarCierrePdf(cajaId: string, token: string): Promise<void> {
    const blob = await apiClient.getBlob(`/api/caja/cierres/${cajaId}/pdf`, token);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cierre_Caja_${cajaId.substring(0, 8)}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // ==========================================
  // Métodos de compatibilidad con CUS 11 previo
  // ==========================================

  async obtenerEstadoCaja(token: string): Promise<CajaEstado> {
    try {
      const res = await this.obtenerActual(token);
      return {
        estaAbierta: res.estado === 'abierta',
        cajaId: res.apertura?.cajaId || null,
        montoApertura: res.apertura?.montoInicial || null,
        fechaAperturaUtc: res.apertura?.fechaAperturaUtc || res.apertura?.fechaApertura || null,
        fechaAperturaLocal: res.apertura?.fechaAperturaLocal || null,
        cajeroNombre: res.apertura?.nombreUsuarioApertura || null,
        estadoOperativo: res.estado,
      };
    } catch {
      return { estaAbierta: false, estadoOperativo: 'sinCaja' };
    }
  },

  async abrirCajaCompat(data: AbrirCajaRequest, token: string): Promise<CajaEstado> {
    const res = await this.abrirCaja(
      {
        solicitudId: crypto.randomUUID(),
        montoInicial: data.montoApertura,
      },
      token
    );

    return {
      estaAbierta: true,
      cajaId: res.cajaId,
      montoApertura: res.montoInicial,
      fechaAperturaUtc: res.fechaAperturaUtc || res.fechaApertura,
      cajeroNombre: res.nombreUsuarioApertura || res.usuarioApertura,
      estadoOperativo: 'abierta',
    };
  },
};
