import { apiClient } from './apiClient';
import type {
  ProductoMenuPedidoDto,
  RegistrarPedidoMesaRequest,
  RegistrarPedidoLlevarRequest,
  RegistrarPedidoResultDto,
  RegistrarPedidoLlevarResultDto,
  AgregarLineasPedidoRequest,
  AgregarLineasResultDto,
  PedidoAbiertoMesaDto,
  DetallePedidoCompletoDto,
  AnularPedidoRequest,
  ListarPedidosResponseDto,
  PedidoItemDto,
  AvisoComandaDto,
} from '../types/pedido';

export const pedidoService = {
  /**
   * Obtiene los productos disponibles para la toma de pedidos (carta y opciones).
   */
  obtenerCatalogoPedido: async (): Promise<ProductoMenuPedidoDto[]> => {
    const res = await apiClient.get<ProductoMenuPedidoDto[]>('/pedidos/catalogo-pedido');
    return Array.isArray(res) ? res : [];
  },

  /**
   * Alias de compatibilidad transitoria.
   */
  obtenerCatalogo: async (): Promise<ProductoMenuPedidoDto[]> => {
    return pedidoService.obtenerCatalogoPedido();
  },

  /**
   * Consulta los pedidos activos en una mesa para detectar si está abierta y obtener su ID (MSG-95).
   */
  obtenerPedidosActivosPorMesa: async (mesaId: string): Promise<PedidoAbiertoMesaDto[]> => {
    const res = await apiClient.get<PedidoAbiertoMesaDto[]>(`/pedidos/mesa/${mesaId}/activo`);
    return Array.isArray(res) ? res : [];
  },

  /**
   * Registra un nuevo pedido de mesa (CUS07.1).
   */
  registrarPedidoMesa: async (
    request: RegistrarPedidoMesaRequest
  ): Promise<RegistrarPedidoResultDto> => {
    const solicitudId = request.solicitudId || (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-mesa-${Date.now()}`);

    return apiClient.post<RegistrarPedidoResultDto>('/pedidos/mesa', {
      ...request,
      solicitudId,
    });
  },

  /**
   * Registra un pedido para llevar en caja (CUS08).
   */
  registrarPedidoLlevar: async (
    request: RegistrarPedidoLlevarRequest
  ): Promise<RegistrarPedidoLlevarResultDto> => {
    const solicitudId = request.solicitudId || (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-llevar-${Date.now()}`);

    return apiClient.post<RegistrarPedidoLlevarResultDto>('/pedidos/llevar', {
      ...request,
      solicitudId,
    });
  },

  /**
   * Agrega líneas/productos adicionales a un pedido existente en mesa ocupada (CUS07.2).
   */
  agregarLineas: async (
    pedidoId: string,
    request: AgregarLineasPedidoRequest
  ): Promise<AgregarLineasResultDto> => {
    const solicitudId = request.solicitudId || (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-ampliar-${Date.now()}`);

    return apiClient.post<AgregarLineasResultDto>(`/pedidos/${pedidoId}/lineas`, {
      ...request,
      solicitudId,
    });
  },

  /**
   * Consulta el detalle completo de un pedido con líneas y comandas asociadas (CUS09.1).
   */
  obtenerDetalleCompleto: async (pedidoId: string): Promise<DetallePedidoCompletoDto> => {
    return apiClient.get<DetallePedidoCompletoDto>(`/pedidos/${pedidoId}`);
  },

  /**
   * Anula un pedido con justificación obligatoria de 5 a 100 caracteres (CUS09.2).
   */
  anularPedido: async (
    pedidoId: string,
    request: AnularPedidoRequest
  ): Promise<{ success: boolean; message: string }> => {
    const solicitudId = request.solicitudId || (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-anular-${Date.now()}`);

    return apiClient.post<{ success: boolean; message: string }>(`/pedidos/${pedidoId}/anular`, {
      ...request,
      solicitudId,
    });
  },

  /**
   * Lista los pedidos del día con filtros.
   */
  listarPedidos: async (params?: {
    soloMios?: boolean;
    estado?: string;
    mesaId?: string;
    tamano?: number;
  }): Promise<PedidoItemDto[]> => {
    const q = new URLSearchParams();
    if (params?.soloMios) q.append('soloMios', 'true');
    if (params?.estado) q.append('estado', params.estado);
    if (params?.mesaId) q.append('mesaId', params.mesaId);
    if (params?.tamano) q.append('tamano', String(params.tamano));
    const qs = q.toString() ? `?${q.toString()}` : '';

    const res = await apiClient.get<ListarPedidosResponseDto>(`/pedidos${qs}`);
    if (Array.isArray(res?.items)) {
      return res.items;
    }
    return [];
  },

  /**
   * Consulta los avisos de comanda lista pendientes (CUS09.3).
   */
  obtenerAvisosPendientes: async (): Promise<AvisoComandaDto[]> => {
    return apiClient.get<AvisoComandaDto[]>('/avisos');
  },

  /**
   * Marca un aviso como visto tras cerrarlo en pantalla (CUS09.3).
   */
  marcarAvisoVisto: async (id: string): Promise<void> => {
    await apiClient.post(`/avisos/${id}/visto`);
  },
};
