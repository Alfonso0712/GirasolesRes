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
  mesaId: string;
  lineas: {
    productoId: string;
    cantidad: number;
    observaciones?: string;
  }[];
}

export interface RegistrarPedidoResultDto {
  pedidoId: string;
  numeroComanda: number;
  total: number;
  mensaje: string;
}
