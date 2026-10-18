export interface LineaPedidoRequest {
  productoId: string;
  cantidad: number;
  observacion?: string;
}

export interface RegistrarPedidoMesaRequest {
  solicitudId: string;
  mesaId: string;
  lineas: LineaPedidoRequest[];
  notas?: string;
}

export interface RegistrarPedidoLlevarRequest {
  solicitudId: string;
  referencia?: string;
  lineas: LineaPedidoRequest[];
}

export interface AgregarLineasPedidoRequest {
  solicitudId: string;
  lineas: LineaPedidoRequest[];
}

export interface RegistrarPedidoResultDto {
  pedidoId: string;
  numero: number;
  total: number;
  comandaId: string;
  mesaNombre: string;
}

export interface RegistrarPedidoLlevarResultDto {
  pedidoId: string;
  numero: number;
  total: number;
  comandaId: string;
}

export interface AgregarLineasResultDto {
  total: number;
  comandaId: string;
  numeroPedido: number;
}

export interface LineaPedidoResponseDto {
  id: string;
  productoId: string;
  productoNombre: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  observacion?: string;
}

export interface PedidoResponseDto {
  id: string;
  numero: number;
  fechaOperativa: string;
  fechaHora: string;
  estado: string;
  tipo: string;
  total: number;
  notas?: string;
  mesaId?: string;
  mesaNombre?: string;
  mozoId: string;
  mozoNombre: string;
  lineas: LineaPedidoResponseDto[];
}

export interface ProductoMenuPedido {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  agotado: boolean;
  disponible: boolean;
}

export interface LineaBorrador {
  productoId: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  observacion: string;
  subtotal: number;
  agotado?: boolean;
}
