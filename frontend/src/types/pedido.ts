export interface EleccionOpcionRequest {
  parte: string;
  productoId: string;
}

export interface EleccionOpcionResponseDto {
  parte: string;
  productoId: string;
  productoNombre: string;
}

export interface LineaPedidoRequest {
  productoId?: string | null;
  menuCompletoId?: number | null;
  elecciones?: EleccionOpcionRequest[];
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
  productoId?: string | null;
  menuCompletoId?: number | null;
  productoNombre: string;
  incluye?: string | null;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  observacion?: string;
  elecciones?: EleccionOpcionResponseDto[];
}

export interface PedidoAbiertoMesaDto {
  id: string;
  numero: number;
  estado: string;
  total: number;
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
  id?: string;
  productoId?: string | null;
  menuCompletoId?: number | null;
  nombre: string;
  incluye?: string | null;
  precioUnitario: number;
  cantidad: number;
  observacion: string;
  subtotal: number;
  agotado?: boolean;
  elecciones?: {
    parte: string;
    productoId: string;
    productoNombre: string;
  }[];
}

// CUS09: Tipos para Gestión de Pedidos
export interface PedidoItemDto {
  id: string;
  numero: number;
  tipo: string;
  mesa: string | null;
  referencia: string | null;
  hora: string;
  total: number;
  estado: string;
  registradoPor: string;
  usuarioId: string;
  esMio: boolean;
  puedeModificar: boolean;
  puedeAnular: boolean;
  motivoDeshabilitado: string | null;
}

export interface ResumenEstadosDto {
  pendiente: number;
  enPreparacion: number;
  listo: number;
  pagado: number;
  anulado: number;
}

export interface ListarPedidosResponseDto {
  items: PedidoItemDto[];
  total: number;
  resumen: ResumenEstadosDto;
}

export interface LineaDetalleDto {
  detalleId: string;
  productoId?: string | null;
  menuCompletoId?: number | null;
  nombre: string;
  incluye?: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  observacion?: string;
  elecciones?: EleccionOpcionResponseDto[];
}

export interface ComandaDetalleDto {
  comandaId: string;
  numero: number;
  estado: string;
  esAdicional: boolean;
  modificada: boolean;
  fechaHora: string;
}

export interface DetallePedidoCompletoDto {
  id: string;
  numero: number;
  tipo: string;
  mesa: string | null;
  referencia: string | null;
  hora: string;
  total: number;
  estado: string;
  registradoPor: string;
  usuarioId: string;
  motivoAnulacion: string | null;
  lineas: LineaDetalleDto[];
  comandas: ComandaDetalleDto[];
}

export interface ModificarPedidoRequest {
  lineas: LineaPedidoRequest[];
}

export interface AnularPedidoRequest {
  solicitudId: string;
  motivo: string;
}

export interface AvisoComandaDto {
  id: string;
  pedidoId: string;
  numero: number;
  tipo: string;
  mesa: string | null;
  referencia: string | null;
  hora: string;
}

export interface ListarPedidosFiltros {
  fecha?: string;
  estado?: string;
  tipo?: string;
  mesaId?: string;
  soloMios?: boolean;
  pagina?: number;
  tamano?: number;
}

