import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserSession } from '../types/auth';
import type {
  ProductoItem,
  CrearProductoData,
  ActualizarProductoData
} from '../types/producto';
import {
  getProductosService,
  crearProductoService,
  actualizarProductoService,
  cambiarEstadoProductoService
} from '../services/productoService';
import type { ApiClientError } from '../services/apiClient';

interface UseProductsManagementProps {
  session: UserSession;
  onLogout?: (banner?: {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }) => void;
}

export function useProductsManagement({ session, onLogout }: UseProductsManagementProps) {
  // Estado de lista y paginación (RF-11 / RNF-11)
  const [productos, setProductos] = useState<ProductoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const tamano = 10;

  // Filtros (RF-11 / RV-40)
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todas');
  const [filtroEstado, setFiltroEstado] = useState<string>('Todos');

  // Estados de carga y error (H-01 / MSG-67)
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Avisos y alertas temporales de 4s (H-01 / RV-28)
  const [avisoExito, setAvisoExito] = useState<string | null>(null);
  const [avisoError, setAvisoError] = useState<string | null>(null);
  const [productoResaltadoId, setProductoResaltadoId] = useState<string | null>(null);

  // Modales
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState<ProductoItem | null>(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmTipo, setConfirmTipo] = useState<'activar' | 'desactivar'>('desactivar');
  const [productoAConfirmar, setProductoAConfirmar] = useState<ProductoItem | null>(null);
  const [procesandoConfirm, setProcesandoConfirm] = useState(false);

  // Referencias para retorno de foco accesible (RV-38 / RV-41)
  const botonOrigenRef = useRef<HTMLButtonElement | null>(null);

  // RN-23: Validación de rol Administrador
  const esAdmin = session.rol === 'Administrador';

  // Manejo de sesión expirada (HTTP 401)
  const esErrorSesionVencida = (err: any) => {
    return (
      (err as ApiClientError)?.status === 401 ||
      err?.message?.includes('401') ||
      err?.message?.toLowerCase().includes('sesión') ||
      err?.message?.toLowerCase().includes('expiró')
    );
  };

  const manejarError401 = useCallback(
    (err: any) => {
      if (esErrorSesionVencida(err) && onLogout) {
        onLogout({
          type: 'warning',
          message: 'Su sesión expiró. Ingrese nuevamente.'
        });
        return true;
      }
      return false;
    },
    [onLogout]
  );

  // Carga de productos desde el servidor
  const cargarProductos = useCallback(async () => {
    if (!esAdmin) return;
    setCargando(true);
    setErrorCarga(null);

    try {
      const data = await getProductosService(
        busqueda,
        filtroCategoria,
        filtroEstado,
        pagina,
        tamano,
        session.token
      );
      setProductos(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      if (manejarError401(err)) return;
      // MSG-67: No se pudo cargar la lista de productos
      setErrorCarga(err.message || 'No se pudo cargar la lista de productos. Intente nuevamente.');
    } finally {
      setCargando(false);
    }
  }, [busqueda, filtroCategoria, filtroEstado, pagina, tamano, session.token, esAdmin, manejarError401]);

  // RV-40: Búsqueda con debounce de 300 ms
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarProductos();
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda, filtroCategoria, filtroEstado, pagina, cargarProductos]);

  const handleQuitarFiltros = () => {
    setBusqueda('');
    setFiltroCategoria('Todas');
    setFiltroEstado('Todos');
    setPagina(1);
  };

  const handleAbrirNuevo = (btnEl?: HTMLButtonElement | null) => {
    botonOrigenRef.current = btnEl || null;
    setProductoAEditar(null);
    setFormModalOpen(true);
  };

  const handleAbrirEditar = (producto: ProductoItem, btnEl?: HTMLButtonElement | null) => {
    botonOrigenRef.current = btnEl || null;
    setProductoAEditar(producto);
    setFormModalOpen(true);
  };

  const handleGuardarProducto = async (data: CrearProductoData | ActualizarProductoData) => {
    try {
      if (productoAEditar) {
        // CUS04.3: Editar producto
        const actualizado = await actualizarProductoService(productoAEditar.id, data, session.token);
        setFormModalOpen(false);
        setAvisoExito('Producto actualizado correctamente.'); // MSG-58
        setProductoResaltadoId(actualizado.id);
        cargarProductos();
      } else {
        // CUS04.1: Registrar producto
        const nuevo = await crearProductoService(data as CrearProductoData, session.token);
        setFormModalOpen(false);
        setAvisoExito('Producto registrado correctamente.'); // MSG-57
        setProductoResaltadoId(nuevo.id);
        setPagina(1);
        cargarProductos();
      }

      // Limpiar foco y aviso tras 4s
      setTimeout(() => setAvisoExito(null), 4000);
      setTimeout(() => setProductoResaltadoId(null), 5000);
      botonOrigenRef.current?.focus();
    } catch (err: any) {
      if (manejarError401(err)) return;
      throw err; // El modal maneja los errores a nivel de campo (MSG-51 a MSG-56)
    }
  };

  const handleAbrirConfirmacion = (
    producto: ProductoItem,
    tipo: 'activar' | 'desactivar',
    btnEl?: HTMLButtonElement | null
  ) => {
    botonOrigenRef.current = btnEl || null;
    setProductoAConfirmar(producto);
    setConfirmTipo(tipo);
    setConfirmModalOpen(true);
  };

  const handleConfirmarAccion = async () => {
    if (!productoAConfirmar) return;
    setProcesandoConfirm(true);
    setAvisoError(null);

    try {
      const nuevoEstado = confirmTipo === 'activar';
      await cambiarEstadoProductoService(productoAConfirmar.id, nuevoEstado, session.token);

      setConfirmModalOpen(false);
      setAvisoExito(nuevoEstado ? 'Producto activado.' : 'Producto desactivado.'); // MSG-64 / MSG-63
      setTimeout(() => setAvisoExito(null), 4000);
      cargarProductos();
      botonOrigenRef.current?.focus();
    } catch (err: any) {
      if (manejarError401(err)) return;
      setAvisoError(err.message || 'No se pudo completar la operación. Intente nuevamente.'); // MSG-38
      setTimeout(() => setAvisoError(null), 4000);
    } finally {
      setProcesandoConfirm(false);
    }
  };

  return {
    productos,
    total,
    pagina,
    setPagina,
    tamano,
    busqueda,
    setBusqueda,
    filtroCategoria,
    setFiltroCategoria,
    filtroEstado,
    setFiltroEstado,
    cargando,
    errorCarga,
    cargarProductos,
    avisoExito,
    setAvisoExito,
    avisoError,
    setAvisoError,
    productoResaltadoId,
    formModalOpen,
    setFormModalOpen,
    productoAEditar,
    confirmModalOpen,
    setConfirmModalOpen,
    confirmTipo,
    productoAConfirmar,
    procesandoConfirm,
    esAdmin,
    handleQuitarFiltros,
    handleAbrirNuevo,
    handleAbrirEditar,
    handleGuardarProducto,
    handleAbrirConfirmacion,
    handleConfirmarAccion
  };
}
