import { apiClient } from './apiClient';
import type {
  ProductoItem,
  PaginacionProductos,
  CrearProductoData,
  ActualizarProductoData,
  CambiarEstadoProductoResponse
} from '../types/producto';

const BASE_URL = '/api/productos';

export async function getProductosService(
  busqueda?: string,
  categoria?: string,
  estado?: string,
  pagina = 1,
  tamano = 10,
  token?: string,
  tipo?: string,
  rol?: string
): Promise<PaginacionProductos> {
  const params = new URLSearchParams();
  if (busqueda?.trim()) params.append('busqueda', busqueda.trim());
  if (categoria && categoria !== 'Todas') params.append('categoria', categoria);
  if (tipo && tipo !== 'Todos') params.append('tipo', tipo);
  if (rol && rol !== 'Todos') params.append('rol', rol);
  if (estado && estado !== 'Todos') {
    params.append('estado', estado === 'Activo' ? 'true' : 'false');
  }
  params.append('pagina', pagina.toString());
  params.append('tamano', tamano.toString());

  return apiClient.get<PaginacionProductos>(`${BASE_URL}?${params.toString()}`, token);
}

export async function getProductoPorIdService(
  id: string,
  token?: string
): Promise<ProductoItem> {
  return apiClient.get<ProductoItem>(`${BASE_URL}/${id}`, token);
}

export async function crearProductoService(
  data: CrearProductoData,
  token?: string
): Promise<ProductoItem> {
  return apiClient.post<ProductoItem>(BASE_URL, data, token);
}

export async function actualizarProductoService(
  id: string,
  data: ActualizarProductoData,
  token?: string
): Promise<ProductoItem> {
  return apiClient.put<ProductoItem>(`${BASE_URL}/${id}`, data, token);
}

export async function cambiarEstadoProductoService(
  id: string,
  activo: boolean,
  token?: string
): Promise<CambiarEstadoProductoResponse> {
  return apiClient.patch<CambiarEstadoProductoResponse>(
    `${BASE_URL}/${id}/estado`,
    { activo },
    token
  );
}

export async function getProductosDisponiblesService(
  categoria?: string,
  tipo?: string,
  rol?: string,
  token?: string
): Promise<ProductoItem[]> {
  const params = new URLSearchParams();
  if (categoria && categoria !== 'Todas') params.append('categoria', categoria);
  if (tipo && tipo !== 'Todos') params.append('tipo', tipo);
  if (rol && rol !== 'Todos') params.append('rol', rol);
  return apiClient.get<ProductoItem[]>(
    `${BASE_URL}/disponibles?${params.toString()}`,
    token
  );
}
