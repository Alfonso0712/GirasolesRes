import { useState, useEffect, useCallback, useRef } from 'react';
import { pedidoService } from '../services/pedidoService';
import { menuDiaService } from '../services/menuDiaService';
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

  // Catálogo de productos disponibles
  const [catalogo, setCatalogo] = useState<ProductoMenuPedido[]>([]);

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

  // Carga inicial del catálogo de productos (RN-35 / CUS05)
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorGeneral(null);

    try {
      const [prods, menuHoy] = await Promise.all([
        pedidoService.obtenerCatalogoPedido(token),
        menuDiaService.obtenerMenuHoy(token).catch(() => null)
      ]);
      const esDefinido = menuHoy ? menuHoy.definido : prods.length > 0;
      setMenuDefinido(esDefinido);
      setCatalogo(prods);
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
      setErrorGeneral(`El plato "${producto.nombre}" se encuentra agotado.`); // MSG-79
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

    // Limpiar errores si existían en esa línea
    if (erroresLineas[producto.id]) {
      setErroresLineas((prev) => {
        const copy = { ...prev };
        delete copy[producto.id];
        return copy;
      });
    }
  };

  // Modificar cantidad exacta (1 a 20) (RV-62 / MSG-98)
  const actualizarCantidad = (productoId: string, cantidad: number, observacion = '') => {
    if (cantidad < 1 || cantidad > 20) return;

    setLineasBorrador((prev) =>
      prev.map((l) => {
        if (l.productoId === productoId && l.observacion === observacion) {
          return {
            ...l,
            cantidad,
            subtotal: Number((cantidad * l.precioUnitario).toFixed(2))
          };
        }
        return l;
      })
    );
  };

  // Disminuir en 1 la cantidad o quitar si llega a 0
  const disminuirProducto = (productoId: string, observacion = '') => {
    setLineasBorrador((prev) => {
      const linea = prev.find(
        (l) => l.productoId === productoId && l.observacion === observacion
      );
      if (!linea) return prev;

      if (linea.cantidad <= 1) {
        return prev.filter((l) => !(l.productoId === productoId && l.observacion === observacion));
      }

      return prev.map((l) => {
        if (l.productoId === productoId && l.observacion === observacion) {
          const nuevaCant = l.cantidad - 1;
          return {
            ...l,
            cantidad: nuevaCant,
            subtotal: Number((nuevaCant * l.precioUnitario).toFixed(2))
          };
        }
        return l;
      });
    });
  };

  // Quitar línea completa del borrador
  const quitarLinea = (productoId: string, observacion = '') => {
    setLineasBorrador((prev) =>
      prev.filter((l) => !(l.productoId === productoId && l.observacion === observacion))
    );
    if (erroresLineas[productoId]) {
      setErroresLineas((prev) => {
        const copy = { ...prev };
        delete copy[productoId];
        return copy;
      });
    }
  };

  // Abrir modal de nota por ítem
  const abrirModalNota = (linea: LineaBorrador) => {
    setLineaParaNota(linea);
    setModalNotaOpen(true);
  };

  // Guardar nota del ítem (RV-64: máx 100 caracteres)
  const guardarNota = (nuevaNota: string) => {
    if (!lineaParaNota) return;

    const notaLimpia = nuevaNota.trim();
    if (notaLimpia.length > 100) return; // MSG-99

    setLineasBorrador((prev) => {
      const sinOriginal = prev.filter(
        (l) =>
          !(l.productoId === lineaParaNota.productoId && l.observacion === lineaParaNota.observacion)
      );

      const existeDestino = sinOriginal.find(
        (l) =>
          l.productoId === lineaParaNota.productoId &&
          l.observacion.toLowerCase() === notaLimpia.toLowerCase()
      );

      if (existeDestino) {
        const fusionadaCant = Math.min(20, existeDestino.cantidad + lineaParaNota.cantidad);
        return sinOriginal.map((l) =>
          l === existeDestino
            ? {
                ...l,
                cantidad: fusionadaCant,
                subtotal: Number((fusionadaCant * l.precioUnitario).toFixed(2))
              }
            : l
        );
      }

      const lineaActualizada: LineaBorrador = {
        ...lineaParaNota,
        observacion: notaLimpia
      };

      return [...sinOriginal, lineaActualizada];
    });

    setModalNotaOpen(false);
    setLineaParaNota(null);
  };

  // Calcular totales reactivos
  const totalCalculado = Number(
    lineasBorrador.reduce((sum, l) => sum + l.subtotal, 0).toFixed(2)
  );

  const cantidadTotalProductos = lineasBorrador.reduce((sum, l) => sum + l.cantidad, 0);

  // Descartar pedido actual (RV-68 / MSG-102)
  const descartarPedido = () => {
    setLineasBorrador([]);
    setReferencia('');
    setErrorReferencia(null);
    setErroresLineas({});
    setErrorGeneral(null);
    generarNuevoSolicitudId();
    setModalDescartarOpen(false);
  };

  // Iniciar nuevo pedido limpio (E-160 / RV-74)
  const iniciarNuevoPedido = () => {
    setLineasBorrador([]);
    setReferencia('');
    setErrorReferencia(null);
    setErroresLineas({});
    setErrorGeneral(null);
    generarNuevoSolicitudId();
    setModalExitoOpen(false);
    setExitoData(null);
  };

  // Enviar pedido para llevar al backend (RN-57, RN-58, RN-59, RN-60, RNF-21)
  const registrarPedidoLlevar = async () => {
    // Validaciones locales
    if (lineasBorrador.length === 0) {
      setErrorGeneral('Agregue al menos un producto al pedido.'); // MSG-97
      return;
    }

    if (referencia.trim().length > 30) {
      setErrorReferencia('La referencia no puede superar los 30 caracteres.'); // MSG-109
      return;
    }

    const lineaInvalida = lineasBorrador.find((l) => l.cantidad < 1 || l.cantidad > 20);
    if (lineaInvalida) {
      setErrorGeneral('La cantidad debe ser un número entero entre 1 y 20.'); // MSG-98
      return;
    }

    const lineaObsInvalida = lineasBorrador.find((l) => l.observacion.length > 100);
    if (lineaObsInvalida) {
      setErrorGeneral('La observación no puede superar los 100 caracteres.'); // MSG-99
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
            productoId: l.productoId,
            cantidad: l.cantidad,
            observacion: l.observacion.trim() || undefined
          }))
        },
        token
      );

      // Éxito: abrir modal de confirmación (Vista 8.2 / MSG-110 / RV-74)
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

      // Conflicto de platos agotados (409 Conflict / RV-65 / MSG-79 / MSG-103)
      if (err.status === 409 && err.productosAgotados) {
        const agotados: string[] = err.productosAgotados;
        const mapaErrores: Record<string, string> = {};

        agotados.forEach((pid) => {
          mapaErrores[pid] = 'Este plato se ha agotado. Quítelo o cámbielo.';
        });

        setErroresLineas(mapaErrores);

        // Actualizar visualmente en el borrador y en el catálogo local
        setLineasBorrador((prev) =>
          prev.map((l) => ({
            ...l,
            agotado: agotados.includes(l.productoId) ? true : l.agotado
          }))
        );

        setCatalogo((prev) =>
          prev.map((p) => (agotados.includes(p.id) ? { ...p, agotado: true } : p))
        );

        setErrorGeneral(
          err.message ||
            'Hay platos agotados en su pedido. Quite o cambie las líneas marcadas.' // MSG-103
        );
        return;
      }

      // Error 403: Rol no permitido (RN-57 / MSG-39)
      if (err.status === 403) {
        setErrorGeneral('No tiene permiso para usar esta función. Solo el Cajero puede registrar pedidos para llevar.');
        return;
      }

      // Error 400: Validación inválida
      if (err.status === 400) {
        setErrorGeneral(err.message || 'Verifique los datos del pedido antes de continuar.');
        return;
      }

      // Error 500 o fallo de conexión: MSG-111
      setErrorGeneral(
        'No se pudo registrar el pedido para llevar. Su pedido sigue en pantalla; intente nuevamente.' // MSG-111
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
    actualizarCantidad,
    disminuirProducto,
    quitarLinea,
    totalCalculado,
    cantidadTotalProductos,
    modalDescartarOpen,
    setModalDescartarOpen,
    descartarPedido,
    modalExitoOpen,
    setModalExitoOpen,
    exitoData,
    iniciarNuevoPedido,
    registrarPedidoLlevar,
    modalNotaOpen,
    setModalNotaOpen,
    lineaParaNota,
    abrirModalNota,
    guardarNota,
    menuDefinido,
    recargarCatalogo: cargarDatos
  };
}
