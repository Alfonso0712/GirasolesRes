import { useState, useEffect, useCallback } from 'react';
import { usePedidoCart } from './usePedidoCart';
import { pedidoService } from '../services/pedidoService';
import { getMenusCompletosService } from '../services/menuCompletoService';
import { menuDiaService } from '../services/menuDiaService';
import type { MenuCompletoDia } from '../types/menuDia';
import type {
  ProductoMenuPedido,
  RegistrarPedidoLlevarResultDto
} from '../types/pedido';

interface UsePedidoLlevarManagementProps {
  token: string;
  onLogout: (banner?: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void;
}

export function usePedidoLlevarManagement({
  token,
  onLogout,
}: UsePedidoLlevarManagementProps) {
  const [cargando, setCargando] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [menuDefinido, setMenuDefinido] = useState(true);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [erroresLineas, setErroresLineas] = useState<Record<string, string>>({});

  // Catálogo de productos y Menús Completos
  const [catalogo, setCatalogo] = useState<ProductoMenuPedido[]>([]);
  const [menusCompletos, setMenusCompletos] = useState<MenuCompletoDia[]>([]);

  // Referencia opcional del cliente (RV-73: máx 30 caracteres)
  const [referencia, setReferencia] = useState('');
  const [errorReferencia, setErrorReferencia] = useState<string | null>(null);
  // Filtros de UI
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [modalExitoOpen, setModalExitoOpen] = useState(false);
  const [exitoData, setExitoData] = useState<{
    pedidoId: string;
    numeroPedido: number;
    total: number;
    comandaId: string;
    referencia?: string;
  } | null>(null);

  // Motor común de carrito de pedidos (Fase 5)
  const {
    lineasBorrador,
    setLineasBorrador,
    notas,
    setNotas,
    modalDescartarOpen,
    setModalDescartarOpen,
    modalNotaOpen,
    setModalNotaOpen,
    lineaParaNota,
    solicitudIdRef,
    agregarProducto: agregarProductoCart,
    agregarMenuCompleto,
    repetirLinea,
    disminuirLinea,
    actualizarCantidadByIndex,
    quitarLineaByIndex,
    disminuirProducto,
    actualizarCantidad,
    quitarLinea,
    abrirModalNota,
    abrirModalNotaByIndex,
    guardarNota,
    guardarNotaByIndex,
    solicitarDescarte,
    confirmarDescarte: confirmarDescarteCart,
    limpiarCarrito,
    totalCalculado,
    cantidadTotalProductos,
  } = usePedidoCart({
    onClearErrors: () => setErrorGeneral(null),
    onRemoveErrorLinea: (id) => {
      setErroresLineas((prev) => {
        if (!prev[id]) return prev;
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    },
  });

  const agregarProducto = (producto: ProductoMenuPedido) => {
    if (producto.agotado) {
      setErrorGeneral(`El plato ${producto.nombre} se agotó. Elija otro plato.`);
      return;
    }
    agregarProductoCart(producto);
  };

  const confirmarDescarte = () => {
    confirmarDescarteCart();
    setReferencia('');
    setErrorGeneral(null);
    setErrorReferencia(null);
    setErroresLineas({});
  };

  const esErrorSesionVencida = (err: any): boolean => {
    return err?.status === 401 || err?.message?.toLowerCase().includes('sesión expiró');
  };

  // Carga inicial del catálogo de productos y menú del día (RN-35 / CUS05)
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorGeneral(null);

    try {
      const [prods, menuHoy, menusCompletosActivos] = await Promise.all([
        pedidoService.obtenerCatalogoPedido(token),
        menuDiaService.obtenerMenuHoy(token).catch(() => null),
        getMenusCompletosService(true, token).catch(() => [])
      ]);
      setMenuDefinido(true); // RN-142: Sin menú del día definido no se bloquean ventas
      setCatalogo(prods);
      if (menuHoy?.menusCompletos && menuHoy.menusCompletos.length > 0) {
        setMenusCompletos(menuHoy.menusCompletos);
      } else if (menusCompletosActivos && menusCompletosActivos.length > 0) {
        setMenusCompletos(menusCompletosActivos.map(m => ({
          id: m.id,
          nombre: m.nombre,
          precio: m.precio,
          incluye: m.incluye ?? null,
          disponible: true,
          motivoNoDisponible: null,
          partes: m.partes.map(p => ({
            id: p.id,
            nombre: p.nombre,
            orden: p.orden,
            rolesPermitidos: p.rolesPermitidos,
            opciones: prods
              .filter(prod => p.rolesPermitidos.some(r =>
                (prod.categoria && prod.categoria.toLowerCase().includes(r.toLowerCase())) ||
                (prod.rol && prod.rol.toLowerCase().includes(r.toLowerCase()))
              ))
              .map(prod => ({
                productoId: prod.id,
                nombre: prod.nombre,
                agotado: prod.agotado
              }))
          }))
        })));
      }
    } catch (err: any) {
      if (esErrorSesionVencida(err)) {
        onLogout({
          type: 'warning',
          message: 'Su sesión expiró. Inicie sesión nuevamente.'
        });
        return;
      }
      setErrorGeneral('No se pudo cargar el catálogo de productos. Verifique su conexión.');
    } finally {
      setCargando(false);
    }
  }, [token, onLogout]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Polling de 30 segundos para refresco de catálogo
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [prods, menuHoy, menusCompletosActivos] = await Promise.all([
          pedidoService.obtenerCatalogoPedido(token),
          menuDiaService.obtenerMenuHoy(token).catch(() => null),
          getMenusCompletosService(true, token).catch(() => [])
        ]);
        setCatalogo(prods);
        if (menuHoy?.menusCompletos && menuHoy.menusCompletos.length > 0) {
          setMenusCompletos(menuHoy.menusCompletos);
        } else if (menusCompletosActivos && menusCompletosActivos.length > 0) {
          setMenusCompletos(menusCompletosActivos.map(m => ({
            id: m.id,
            nombre: m.nombre,
            precio: m.precio,
            incluye: m.incluye ?? null,
            disponible: true,
            motivoNoDisponible: null,
            partes: m.partes.map(p => ({
              id: p.id,
              nombre: p.nombre,
              orden: p.orden,
              rolesPermitidos: p.rolesPermitidos,
              opciones: prods
                .filter(prod => p.rolesPermitidos.some(r =>
                  (prod.categoria && prod.categoria.toLowerCase().includes(r.toLowerCase())) ||
                  (prod.rol && prod.rol.toLowerCase().includes(r.toLowerCase()))
                ))
                .map(prod => ({
                  productoId: prod.id,
                  nombre: prod.nombre,
                  agotado: prod.agotado
                }))
            }))
          })));
        }
      } catch (err: any) {
        if (esErrorSesionVencida(err)) {
          onLogout({ type: 'warning', message: 'Su sesión expiró. Ingrese nuevamente.' });
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [token, onLogout]);

  // Manejador del cambio en la referencia del cliente con validación en vivo (RV-73 / MSG-109)
  const handleCambioReferencia = (valor: string) => {
    setReferencia(valor);
    if (valor.length > 30) {
      setErrorReferencia('La referencia no puede superar los 30 caracteres.'); // MSG-109
    } else {
      setErrorReferencia(null);
    }
  };

  const reiniciarParaNuevoPedido = () => {
    limpiarCarrito();
    setReferencia('');
    setErrorReferencia(null);
    setErrorGeneral(null);
    setErroresLineas({});
    setModalExitoOpen(false);
    setExitoData(null);
    cargarDatos();
  };

  // Enviar pedido para llevar al backend (RN-57, RN-58, RN-59, RN-60, RNF-21)
  const registrarPedidoLlevar = async () => {
    if (lineasBorrador.length === 0) {
      setErrorGeneral('Agregue al menos un producto al pedido.');
      return;
    }

    if (referencia.trim().length > 30) {
      setErrorReferencia('La referencia no puede superar los 30 caracteres.');
      return;
    }

    const lineaInvalida = lineasBorrador.find((l) => l.cantidad < 1 || l.cantidad > 20);
    if (lineaInvalida) {
      setErrorGeneral('La cantidad debe ser un número entero entre 1 y 20.');
      return;
    }

    const lineaObsInvalida = lineasBorrador.find((l) => l.observacion.length > 100);
    if (lineaObsInvalida) {
      setErrorGeneral('La observación no puede superar los 100 caracteres.');
      return;
    }

    setRegistrando(true);
    setErrorGeneral(null);
    setErroresLineas({});

    try {
      const refFinal = referencia.trim();
      const resultado: RegistrarPedidoLlevarResultDto = await pedidoService.registrarPedidoLlevar(
        {
          solicitudId: solicitudIdRef.current,
          referencia: refFinal || undefined,
          lineas: lineasBorrador.map((l) => ({
            productoId: l.productoId ?? undefined,
            menuCompletoId: l.menuCompletoId ?? undefined,
            elecciones: l.elecciones?.map((e) => ({
              parte: e.parte,
              productoId: e.productoId
            })),
            cantidad: l.cantidad,
            observacion: l.observacion.trim() || undefined
          }))
        },
        token
      );

      setExitoData({
        pedidoId: resultado.pedidoId,
        numeroPedido: resultado.numero,
        total: resultado.total,
        comandaId: resultado.comandaId,
        referencia: refFinal || undefined
      });
      setModalExitoOpen(true);
    } catch (err: any) {
      if (esErrorSesionVencida(err)) {
        onLogout({
          type: 'warning',
          message: 'Su sesión expiró. Inicie sesión nuevamente.'
        });
        return;
      }

      if (err.status === 409 && err.productosAgotados) {
        const agotados: string[] = err.productosAgotados;
        const mapaErrores: Record<string, string> = {};

        agotados.forEach((pid) => {
          mapaErrores[pid] = 'Este plato se ha agotado. Quítelo o cámbielo.';
        });

        setErroresLineas(mapaErrores);

        setLineasBorrador((prev) =>
          prev.map((l) => ({
            ...l,
            agotado: l.productoId && agotados.includes(l.productoId) ? true : l.agotado
          }))
        );

        setCatalogo((prev) =>
          prev.map((p) => (agotados.includes(p.id) ? { ...p, agotado: true } : p))
        );

        setErrorGeneral(
          err.message || 'Hay platos agotados en su pedido. Quite o cambie las líneas marcadas.'
        );
        return;
      }

      if (err.status === 403) {
        setErrorGeneral('No tiene permiso para usar esta función. Solo el Cajero puede registrar pedidos para llevar.');
        return;
      }

      setErrorGeneral(
        err.message || 'No se pudo registrar el pedido para llevar. Su pedido sigue en pantalla; intente nuevamente.'
      );
    } finally {
      setRegistrando(false);
    }
  };

  // Filtrado de catálogo
  const categorias = [
    'Todas',
    ...(menusCompletos.length > 0 ? ['Menús Completos'] : []),
    ...Array.from(new Set(catalogo.map((p) => p.categoria).filter(Boolean)))
  ];

  const catalogoFiltrado = catalogo.filter((p) => {
    const coincideCategoria = categoriaActiva === 'Todas' || p.categoria === categoriaActiva;
    const coincideBusqueda =
      busqueda.trim() === '' ||
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  return {
    cargando,
    registrando,
    errorGeneral,
    setErrorGeneral,
    erroresLineas,
    catalogoFiltrado,
    menusCompletos,
    categorias,
    categoriaActiva,
    setCategoriaActiva,
    busqueda,
    setBusqueda,
    referencia,
    handleCambioReferencia,
    errorReferencia,
    notas,
    setNotas,
    lineasBorrador,
    agregarProducto,
    agregarMenuCompleto,
    repetirLinea,
    disminuirLinea,
    actualizarCantidadByIndex,
    quitarLineaByIndex,
    actualizarCantidad,
    disminuirProducto,
    quitarLinea,
    totalCalculado,
    cantidadTotalProductos,
    modalDescartarOpen,
    setModalDescartarOpen,
    modalExitoOpen,
    setModalExitoOpen,
    exitoData,
    modalNotaOpen,
    setModalNotaOpen,
    lineaParaNota,
    abrirModalNota,
    abrirModalNotaByIndex,
    guardarNota,
    guardarNotaByIndex,
    solicitarDescarte,
    confirmarDescarte,
    descartarPedido: confirmarDescarte,
    reiniciarParaNuevoPedido,
    iniciarNuevoPedido: reiniciarParaNuevoPedido,
    registrarPedidoLlevar,
    menuDefinido,
    cargarDatos,
    recargarCatalogo: cargarDatos
  };
}
