import { apiClient } from './apiClient';
import type {
  ProductoItem,
  RegistrarPedidoMesaRequest,
  RegistrarPedidoLlevarRequest,
  RegistrarPedidoResultDto,
  ListarPedidosResponseDto,
  PedidoItemDto
} from '../types/pedido';

interface ProductoMenuPedidoDto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  agotado: boolean;
  disponible: boolean;
  rol?: string | null;
}

export const pedidoService = {
  obtenerCatalogo: async (buscar?: string, categoria?: string): Promise<ProductoItem[]> => {
    const res = await apiClient.get<ProductoMenuPedidoDto[]>('/pedidos/catalogo-pedido');
    if (!Array.isArray(res)) {
      return [];
    }

    let lista = res.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      precio: typeof p.precio === 'number' ? p.precio : 0,
      categoria: p.categoria || 'Carta',
      disponible: !p.agotado && p.disponible !== false,
      esMenuDelDia: p.categoria === 'Menú del Día',
    }));

    if (buscar && buscar.trim()) {
      const b = buscar.trim().toLowerCase();
      lista = lista.filter((p) => p.nombre.toLowerCase().includes(b));
    }
    if (categoria && categoria.trim() && categoria !== 'Todos') {
      lista = lista.filter((p) => p.categoria.toLowerCase() === categoria.trim().toLowerCase());
    }

    return lista;
  },

  listarPedidos: async (params?: { soloMios?: boolean; estado?: string }): Promise<PedidoItemDto[]> => {
    const q = new URLSearchParams();
    if (params?.soloMios) q.append('soloMios', 'true');
    if (params?.estado) q.append('estado', params.estado);
    const qs = q.toString() ? `?${q.toString()}` : '';

    const res = await apiClient.get<ListarPedidosResponseDto>(`/pedidos${qs}`);
    if (Array.isArray(res?.items)) {
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
