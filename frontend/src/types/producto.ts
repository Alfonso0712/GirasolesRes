export type CategoriaProducto = 'Desayuno' | 'Almuerzo' | 'Otro';

export interface ProductoItem {
  id: string;
  nombre: string;
  categoria: CategoriaProducto;
  precio: number;
  activo: boolean;
}

export interface PaginacionProductos {
  items: ProductoItem[];
  total: number;
}

export interface CrearProductoData {
  nombre: string;
  categoria: CategoriaProducto;
  precio: number;
}

export interface ActualizarProductoData {
  nombre: string;
  categoria: CategoriaProducto;
  precio: number;
}

export interface CambiarEstadoProductoResponse {
  activo: boolean;
  retiradoDelMenu: boolean;
}
