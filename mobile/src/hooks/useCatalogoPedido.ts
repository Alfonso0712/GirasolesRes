import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ProductoMenuPedidoDto } from '../types/pedido';
import type { MenuDiaResponseDto } from '../types/menuDia';
import { pedidoService } from '../services/pedidoService';
import { menuDiaService } from '../services/menuDiaService';
import {
  obtenerCategoriasCatalogo,
  filtrarMenusCatalogo,
  filtrarProductosCatalogo,
} from '../utils/pedidos';
import { mensajeDeError } from '../utils/errores';

export interface UseCatalogoPedidoOptions {
  menuDiaInicial?: MenuDiaResponseDto | null;
  onCargarAdicional?: () => Promise<void>;
}

function useFiltrosCatalogo(
  catalogo: ProductoMenuPedidoDto[],
  menuDia: MenuDiaResponseDto | null
) {
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setBusquedaDebounced(busqueda), 250);
    return () => clearTimeout(handler);
  }, [busqueda]);

  const categoriasDinamicas = useMemo(() => obtenerCategoriasCatalogo(catalogo, menuDia), [catalogo, menuDia]);
  const menusFiltrados = useMemo(() => filtrarMenusCatalogo(menuDia, categoriaActiva, busquedaDebounced), [menuDia, categoriaActiva, busquedaDebounced]);
  const productosFiltrados = useMemo(() => filtrarProductosCatalogo(catalogo, categoriaActiva, busquedaDebounced), [catalogo, categoriaActiva, busquedaDebounced]);

  return { categoriaActiva, setCategoriaActiva, busqueda, setBusqueda, categoriasDinamicas, menusFiltrados, productosFiltrados };
}

/**
 * Carga y filtra el catálogo de productos y menús del día para la toma de pedidos.
 */
export function useCatalogoPedido(options: UseCatalogoPedidoOptions = {}) {
  const { menuDiaInicial = null, onCargarAdicional } = options;
  const [catalogo, setCatalogo] = useState<ProductoMenuPedidoDto[]>([]);
  const [menuDia, setMenuDia] = useState<MenuDiaResponseDto | null>(
    () => menuDiaInicial ?? menuDiaService.obtenerMenuHoyCacheado()
  );
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const cargarDatos = useCallback(async (usarCache = true) => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const [prods, menu] = await Promise.all([
        pedidoService.obtenerCatalogoPedido(),
        menuDiaService.obtenerMenuHoy({ usarCache }).catch(() => null),
        onCargarAdicional ? onCargarAdicional() : Promise.resolve(),
      ]);
      setCatalogo(prods || []);
      setMenuDia(menu);
    } catch (err: unknown) {
      setErrorCarga(mensajeDeError(err, 'Error al cargar los productos disponibles'));
      setCatalogo([]);
    } finally {
      setCargando(false);
    }
  }, [onCargarAdicional]);

  useEffect(() => {
    void cargarDatos(true);
    const onUpdate = () => void cargarDatos(false);
    window.addEventListener('girasoles:menu-dia-actualizado', onUpdate);
    return () => window.removeEventListener('girasoles:menu-dia-actualizado', onUpdate);
  }, [cargarDatos]);

  const filtros = useFiltrosCatalogo(catalogo, menuDia);
  return { catalogo, menuDia, cargando, errorCarga, cargarDatos, ...filtros };
}
