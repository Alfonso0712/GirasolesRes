export interface ProductoItem {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagenUrl?: string;
  disponible: boolean;
  esMenuDelDia?: boolean;
}

export interface LineaPedidoItem {
  productoId: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  observaciones?: string;
}

export interface RegistrarPedidoMesaRequest {
  solicitudId?: string;
  mesaId: string;
  lineas: {
    productoId: string;
    cantidad: number;
    observaciones?: string;
  }[];
  notas?: string;
}

export interface RegistrarPedidoLlevarRequest {
  solicitudId?: string;
  referencia?: string;
  lineas: {
    productoId: string;
    cantidad: number;
    observaciones?: string;
  }[];
}

export interface RegistrarPedidoResultDto {
  pedidoId: string;
  numero: number;
  total?: number;
  comandaId?: string;
  mesaNombre?: string;
  mensaje?: string;
}

export interface PedidoItemDto {
  id: string;
  numero: number;
  tipo: string;
  mesa?: string;
  referencia?: string;
  hora: string;
  total: number;
  estado: string;
  registradoPor: string;
  usuarioId?: string;
  esMio?: boolean;
  cantidadLineas?: number;
}

export interface ListarPedidosResponseDto {
  items: PedidoItemDto[];
  total?: number;
}
