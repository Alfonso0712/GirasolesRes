import { useState, useEffect, useCallback, useRef } from 'react';
import { pedidoService } from '../services/pedidoService';
import { getMenusCompletosService } from '../services/menuCompletoService';
import { menuDiaService } from '../services/menuDiaService';
import type { MenuCompletoDia } from '../types/menuDia';
import type {
  ProductoMenuPedido,
  LineaBorrador,
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

  // Líneas del pedido en armado (borrador)
  const [lineasBorrador, setLineasBorrador] = useState<LineaBorrador[]>([]);

  // Filtros de UI
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [modalDescartarOpen, setModalDescartarOpen] = useState(false);
  const [modalExitoOpen, setModalExitoOpen] = useState(false);
  const [exitoData, setExitoData] = useState<{
    pedidoId: string;
    numeroPedido: number;
    total: number;
    comandaId: string;
    referencia?: string;
  } | null>(null);

  const [modalNotaOpen, setModalNotaOpen] = useState(false);
  const [lineaParaNota, setLineaParaNota] = useState<LineaBorrador | null>(null);
  const [lineaIndexParaNota, setLineaIndexParaNota] = useState<number | null>(null);

  // UUID de solicitud para idempotencia (RNF-21)
  const solicitudIdRef = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-llevar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );

  const generarNuevoSolicitudId = () => {
    solicitudIdRef.current =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `sol-llevar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
              .filter(prod => p.rolesPermitidos.some(r => prod.categoria.toLowerCase().includes(r.toLowerCase())))
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
        const [prods, menuHoy] = await Promise.all([
          pedidoService.obtenerCatalogoPedido(token),
          menuDiaService.obtenerMenuHoy(token).catch(() => null)
        ]);
        setCatalogo(prods);
        if (menuHoy?.menusCompletos) {
          setMenusCompletos(menuHoy.menusCompletos);
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

  // Agregar producto al borrador (RV-61, RV-62, RV-63)
  const agregarProducto = (producto: ProductoMenuPedido, observacion = '') => {
    if (producto.agotado) {
      setErrorGeneral(`El plato ${producto.nombre} se agotó. Elija otro plato.`); // MSG-225
      return;
    }

    const obsTrim = observacion.trim();

    setLineasBorrador((prev) => {
      const index = prev.findIndex(
        (l) => l.productoId === producto.id && l.observacion.toLowerCase() === obsTrim.toLowerCase()
      );

      if (index >= 0) {
        const lineaActual = prev[index];
        const nuevaCantidad = Math.min(20, lineaActual.cantidad + 1); // Tope máximo 20 (RV-62)
        const nuevaLinea: LineaBorrador = {
          ...lineaActual,
          cantidad: nuevaCantidad,
          subtotal: Number((nuevaCantidad * lineaActual.precioUnitario).toFixed(2))
        };
        const nuevo = [...prev];
        nuevo[index] = nuevaLinea;
        return nuevo;
      }

      const nuevaLinea: LineaBorrador = {
        id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productoId: producto.id,
        nombre: producto.nombre,
        precioUnitario: producto.precio,
        cantidad: 1,
        observacion: obsTrim,
        subtotal: producto.precio,
        agotado: false
      };

      return [...prev, nuevaLinea];
    });
  };

  // Agregar menú completo al borrador (RV-164 / RV-165)
  const agregarMenuCompleto = (
    menu: MenuCompletoDia,
    elecciones: { parte: string; productoId: string; productoNombre: string }[],
    observacion = ''
  ) => {
    setErrorGeneral(null);
    const obsTrim = observacion.trim();

    setLineasBorrador((prev) => {
      const index = prev.findIndex((l) => {
        if (l.menuCompletoId !== menu.id) return false;
        if ((l.observacion || '').trim().toLowerCase() !== obsTrim.toLowerCase()) return false;
        if (!l.elecciones || l.elecciones.length !== elecciones.length) return false;
        return elecciones.every((e) =>
          l.elecciones!.some(
            (le) =>
              le.parte.toLowerCase() === e.parte.toLowerCase() &&
              le.productoId.toLowerCase() === e.productoId.toLowerCase()
          )
        );
      });

      if (index >= 0) {
        const lineaActual = prev[index];
        const nuevaCantidad = Math.min(20, lineaActual.cantidad + 1);
        const nuevaLinea: LineaBorrador = {
          ...lineaActual,
          cantidad: nuevaCantidad,
          subtotal: Number((nuevaCantidad * lineaActual.precioUnitario).toFixed(2))
        };
        const nuevo = [...prev];
        nuevo[index] = nuevaLinea;
        return nuevo;
      }

      const nuevaLinea: LineaBorrador = {
        id: `mc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        menuCompletoId: menu.id,
        nombre: menu.nombre,
        incluye: menu.incluye,
        precioUnitario: menu.precio,
        cantidad: 1,
        observacion: obsTrim,
        subtotal: menu.precio,
        agotado: false,
        elecciones: elecciones
      };

      return [...prev, nuevaLinea];
    });
  };

  // Repetir combinación en un toque (RV-165)
  const repetirLinea = (lineaIndex: number) => {
    setErrorGeneral(null);
    setLineasBorrador((prev) => {
      if (lineaIndex < 0 || lineaIndex >= prev.length) return prev;
      const linea = prev[lineaIndex];
      if (linea.cantidad >= 20) return prev;
      const nuevaCantidad = linea.cantidad + 1;
      const copia = [...prev];
      copia[lineaIndex] = {
        ...linea,
        cantidad: nuevaCantidad,
        subtotal: Number((nuevaCantidad * linea.precioUnitario).toFixed(2))
      };
      return copia;
    });
  };

  const disminuirLinea = (lineaIndex: number) => {
    setErrorGeneral(null);
    setLineasBorrador((prev) => {
      if (lineaIndex < 0 || lineaIndex >= prev.length) return prev;
      const linea = prev[lineaIndex];
      if (linea.cantidad > 1) {
        const nuevaCantidad = linea.cantidad - 1;
        const copia = [...prev];
        copia[lineaIndex] = {
          ...linea,
          cantidad: nuevaCantidad,
          subtotal: Number((nuevaCantidad * linea.precioUnitario).toFixed(2))
        };
        return copia;
      }
      return prev.filter((_, i) => i !== lineaIndex);
    });
  };

  const actualizarCantidadByIndex = (lineaIndex: number, cantidad: number) => {
    if (cantidad < 1 || cantidad > 20) return;
    setErrorGeneral(null);
    setLineasBorrador((prev) => {
      if (lineaIndex < 0 || lineaIndex >= prev.length) return prev;
      const copia = [...prev];
      copia[lineaIndex] = {
        ...copia[lineaIndex],
        cantidad,
        subtotal: Number((cantidad * copia[lineaIndex].precioUnitario).toFixed(2))
      };
      return copia;
    });
  };

  const quitarLineaByIndex = (lineaIndex: number) => {
    setLineasBorrador((prev) => prev.filter((_, i) => i !== lineaIndex));
  };

  const disminuirProducto = (productoId: string, observacion = '') => {
    const obsTrim = observacion.trim();
    setLineasBorrador((prev) => {
      const index = prev.findIndex(
        (l) => l.productoId === productoId && l.observacion.toLowerCase() === obsTrim.toLowerCase()
      );
      if (index === -1) return prev;
      const lineaActual = prev[index];
      if (lineaActual.cantidad > 1) {
        const nuevaCantidad = lineaActual.cantidad - 1;
        const copia = [...prev];
        copia[index] = {
          ...lineaActual,
          cantidad: nuevaCantidad,
          subtotal: Number((nuevaCantidad * lineaActual.precioUnitario).toFixed(2))
        };
        return copia;
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const actualizarCantidad = (productoId: string, cantidad: number, observacion = '') => {
    if (cantidad < 1 || cantidad > 20) return;
    const obsTrim = observacion.trim();
    setLineasBorrador((prev) => {
      const index = prev.findIndex(
        (l) => l.productoId === productoId && l.observacion.toLowerCase() === obsTrim.toLowerCase()
      );
      if (index === -1) return prev;
      const copia = [...prev];
      copia[index] = {
        ...copia[index],
        cantidad,
        subtotal: Number((cantidad * copia[index].precioUnitario).toFixed(2))
      };
      return copia;
    });
  };

  const quitarLinea = (productoId: string, observacion = '') => {
    const obsTrim = observacion.trim();
    setLineasBorrador((prev) =>
      prev.filter((l) => !(l.productoId === productoId && l.observacion.toLowerCase() === obsTrim.toLowerCase()))
    );
  };

  const abrirModalNota = (linea: LineaBorrador) => {
    const idx = lineasBorrador.indexOf(linea);
    setLineaParaNota(linea);
    setLineaIndexParaNota(idx >= 0 ? idx : null);
    setModalNotaOpen(true);
  };

  const abrirModalNotaByIndex = (index: number) => {
    if (index >= 0 && index < lineasBorrador.length) {
      setLineaParaNota(lineasBorrador[index]);
      setLineaIndexParaNota(index);
      setModalNotaOpen(true);
    }
  };

  const guardarNota = (nuevaObservacion: string) => {
    if (lineaIndexParaNota !== null && lineaIndexParaNota >= 0 && lineaIndexParaNota < lineasBorrador.length) {
      guardarNotaByIndex(lineaIndexParaNota, nuevaObservacion);
      return;
    }
    if (!lineaParaNota) return;
    const obsTrim = nuevaObservacion.trim();
    setLineasBorrador((prev) => {
      const index = prev.findIndex(
        (l) =>
          l.productoId === lineaParaNota.productoId &&
          l.menuCompletoId === lineaParaNota.menuCompletoId &&
          l.observacion.toLowerCase() === lineaParaNota.observacion.toLowerCase()
      );
      if (index === -1) return prev;
      const copia = [...prev];
      copia[index] = { ...copia[index], observacion: obsTrim };
      return copia;
    });
    setModalNotaOpen(false);
    setLineaParaNota(null);
    setLineaIndexParaNota(null);
  };

  const guardarNotaByIndex = (lineaIndex: number, nuevaObservacion: string) => {
    setLineasBorrador((prev) => {
      if (lineaIndex < 0 || lineaIndex >= prev.length) return prev;
      const copia = [...prev];
      copia[lineaIndex] = {
        ...copia[lineaIndex],
        observacion: nuevaObservacion.trim()
      };
      return copia;
    });
    setModalNotaOpen(false);
    setLineaParaNota(null);
    setLineaIndexParaNota(null);
  };

  const solicitarDescarte = () => {
    if (lineasBorrador.length > 0 || referencia.trim().length > 0) {
      setModalDescartarOpen(true);
    }
  };

  const confirmarDescarte = () => {
    setLineasBorrador([]);
    setReferencia('');
    setErrorReferencia(null);
    setErrorGeneral(null);
    setErroresLineas({});
    generarNuevoSolicitudId();
    setModalDescartarOpen(false);
  };

  const reiniciarParaNuevoPedido = () => {
    setLineasBorrador([]);
    setReferencia('');
    setErrorReferencia(null);
    setErrorGeneral(null);
    setErroresLineas({});
    generarNuevoSolicitudId();
    setModalExitoOpen(false);
    setExitoData(null);
    cargarDatos();
  };

  // Cálculos totales
  const totalCalculado = lineasBorrador.reduce((acc, l) => acc + l.subtotal, 0);
  const cantidadTotalProductos = lineasBorrador.reduce((acc, l) => acc + l.cantidad, 0);

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
