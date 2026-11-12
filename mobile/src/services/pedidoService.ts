import { apiClient } from './apiClient';
import type {
  ProductoItem,
  RegistrarPedidoMesaRequest,
  RegistrarPedidoLlevarRequest,
  RegistrarPedidoResultDto,
  ListarPedidosResponseDto,
  PedidoItemDto
} from '../types/pedido';

interface BackendProductoMenu {
  id: string;
  nombre: string;
  categoria?: string;
  precio?: number;
  agotado?: boolean;
  disponible?: boolean;
  esMenuDelDia?: boolean;
}

interface BackendProductoDisponible {
  id: string;
  nombre: string;
  tipo?: string;
  categoria?: string;
  precio?: number;
  activo?: boolean;
}

export const pedidoService = {
  obtenerCatalogo: async (buscar?: string, categoria?: string): Promise<ProductoItem[]> => {
    try {
      const res = await apiClient.get<BackendProductoMenu[]>('/pedidos/catalogo-pedido');
      if (Array.isArray(res)) {
        return res.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          precio: typeof p.precio === 'number' ? p.precio : 0,
          categoria: p.categoria || 'Carta',
          disponible: !p.agotado && p.disponible !== false,
          esMenuDelDia: Boolean(p.esMenuDelDia),
        }));
      }
    } catch {
      // Fallback a productos disponibles si catalogo-pedido no responde
    }

    const q = new URLSearchParams();
    if (buscar) q.append('buscar', buscar);
    if (categoria) q.append('categoria', categoria);
    const qs = q.toString() ? `?${q.toString()}` : '';

    const fallback = await apiClient.get<BackendProductoDisponible[]>(`/productos/disponibles${qs}`);
    if (Array.isArray(fallback)) {
      return fallback.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        precio: typeof p.precio === 'number' ? p.precio : 0,
        categoria: p.categoria || p.tipo || 'Carta',
        disponible: p.activo !== false,
        esMenuDelDia: p.tipo === 'MenuDia' || p.categoria === 'Menú del Día',
      }));
    }
    return [];
  },

  listarPedidos: async (params?: { soloMios?: boolean; estado?: string }): Promise<PedidoItemDto[]> => {
    const q = new URLSearchParams();
    if (params?.soloMios) q.append('soloMios', 'true');
    if (params?.estado) q.append('estado', params.estado);
    const qs = q.toString() ? `?${q.toString()}` : '';

    const res = await apiClient.get<ListarPedidosResponseDto | PedidoItemDto[]>(`/pedidos${qs}`);
    if (Array.isArray(res)) {
      return res;
    }
    if (res && Array.isArray(res.items)) {
      return res.items;
    }
    return [];
  },

  registrarPedidoMesa: async (
    request: RegistrarPedidoMesaRequest
  ): Promise<RegistrarPedidoResultDto> => {
    const solicitudId = request.solicitudId || (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-mesa-${Date.now()}`);

    const payload = {
      solicitudId,
      mesaId: request.mesaId,
      lineas: request.lineas,
      notas: request.notas,
    };

    return apiClient.post<RegistrarPedidoResultDto>('/pedidos/mesa', payload);
  },

  registrarPedidoLlevar: async (
    request: RegistrarPedidoLlevarRequest
  ): Promise<RegistrarPedidoResultDto> => {
    const solicitudId = request.solicitudId || (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-llevar-${Date.now()}`);

    const payload = {
      solicitudId,
      referencia: request.referencia || 'Cliente Mostrador',
      lineas: request.lineas,
    };

    return apiClient.post<RegistrarPedidoResultDto>('/pedidos/llevar', payload);
  }
};
