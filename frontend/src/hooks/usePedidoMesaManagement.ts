import { useState, useEffect, useCallback, useRef } from 'react';
import { pedidoService } from '../services/pedidoService';
import { getMesasService } from '../services/mesaService';
import type { MesaItem } from '../types/mesa';
import type {
  ProductoMenuPedido,
  LineaBorrador,
  PedidoResponseDto,
  RegistrarPedidoResultDto,
  AgregarLineasResultDto
} from '../types/pedido';

interface UsePedidoMesaManagementProps {
  token: string;
  mesaIdInicial?: string | null;
  onLogout: (banner?: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void;
}

export function usePedidoMesaManagement({
  token,
  mesaIdInicial,
  onLogout,
}: UsePedidoMesaManagementProps) {
  const [cargando, setCargando] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [erroresLineas, setErroresLineas] = useState<Record<string, string>>({});

  // Catálogo y Mesas
  const [catalogo, setCatalogo] = useState<ProductoMenuPedido[]>([]);
  const [mesasLibres, setMesasLibres] = useState<MesaItem[]>([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<MesaItem | null>(null);

  // Modo de operación: nuevo pedido (CUS07.1) o ampliación (CUS07.2)
  const [modo, setModo] = useState<'nuevo' | 'ampliacion'>('nuevo');
  const [pedidoExistente, setPedidoExistente] = useState<PedidoResponseDto | null>(null);

  // Líneas del pedido en armado (borrador)
  const [lineasBorrador, setLineasBorrador] = useState<LineaBorrador[]>([]);
  const [notas, setNotas] = useState('');

  // Filtros de UI
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [modalDescartarOpen, setModalDescartarOpen] = useState(false);
  const [modalExitoOpen, setModalExitoOpen] = useState(false);
  const [exitoData, setExitoData] = useState<{
    numeroPedido: number;
    mesaNombre: string;
    total: number;
  } | null>(null);

  const [modalNotaOpen, setModalNotaOpen] = useState(false);
  const [lineaParaNota, setLineaParaNota] = useState<LineaBorrador | null>(null);

  // UUID de solicitud para idempotencia (RNF-21)
  const solicitudIdRef = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );

  const generarNuevoSolicitudId = () => {
    solicitudIdRef.current =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `sol-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const esErrorSesionVencida = (err: any): boolean => {
    return err?.status === 401 || err?.message?.toLowerCase().includes('sesión expiró');
  };

  // Carga inicial de datos
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorGeneral(null);

    try {
      const [prods, mesas] = await Promise.all([
        pedidoService.obtenerCatalogoPedido(token),
        getMesasService({ estado: 'libre' }, token)
      ]);

      setCatalogo(prods);
      setMesasLibres(mesas);

      if (mesaIdInicial) {
        // Verificar si la mesa ya tiene un pedido activo (deriva a ampliación CUS07.2)
        try {
          const pedidoActivo = await pedidoService.obtenerPedidoActivoPorMesa(mesaIdInicial, token);
          if (pedidoActivo) {
            setModo('ampliacion');
            setPedidoExistente(pedidoActivo);
            setMesaSeleccionada({
              id: mesaIdInicial,
              nombre: pedidoActivo.mesaNombre || 'Mesa',
              ocupacion: 'Ocupada',
              activa: true
            });
          } else {
            let m = mesas.find((item) => String(item.id).toLowerCase() === String(mesaIdInicial).toLowerCase());
            if (!m) {
              const todas = await getMesasService({}, token);
              m = todas.find((item) => String(item.id).toLowerCase() === String(mesaIdInicial).toLowerCase());
            }
            if (m) {
              const mesaEncontrada = m;
              if (!mesas.some((item) => String(item.id).toLowerCase() === String(mesaEncontrada.id).toLowerCase())) {
                setMesasLibres((prev) => [mesaEncontrada, ...prev]);
              }
              setMesaSeleccionada(mesaEncontrada);
            }
          }
        } catch {
          let m = mesas.find((item) => String(item.id).toLowerCase() === String(mesaIdInicial).toLowerCase());
          if (!m) {
            try {
              const todas = await getMesasService({}, token);
              m = todas.find((item) => String(item.id).toLowerCase() === String(mesaIdInicial).toLowerCase());
            } catch {
              // fallback
            }
          }
          if (m) {
            const mesaEncontrada = m;
            if (!mesas.some((item) => String(item.id).toLowerCase() === String(mesaEncontrada.id).toLowerCase())) {
              setMesasLibres((prev) => [mesaEncontrada, ...prev]);
            }
            setMesaSeleccionada(mesaEncontrada);
          }
        }
      }
    } catch (err: any) {
      if (esErrorSesionVencida(err)) {
        onLogout({ type: 'warning', message: 'Su sesión expiró. Ingrese nuevamente.' });
        return;
      }
      setErrorGeneral('No se pudo cargar la información del menú o mesas. Intente nuevamente.');
    } finally {
      setCargando(false);
    }
  }, [token, mesaIdInicial, onLogout]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Polling de 30 segundos para refresco de catálogo (RNF-23)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const prods = await pedidoService.obtenerCatalogoPedido(token);
        setCatalogo(prods);

        // Validar si algún producto en el borrador pasó a estar agotado
        const agotadosIds = new Set(prods.filter((p) => p.agotado || !p.disponible).map((p) => p.id));
        if (agotadosIds.size > 0) {
          setLineasBorrador((prev) =>
            prev.map((linea) => {
              if (agotadosIds.has(linea.productoId)) {
                return { ...linea, agotado: true };
              }
              return linea;
            })
          );

          setErroresLineas((prev) => {
            const next = { ...prev };
            lineasBorrador.forEach((l) => {
              if (agotadosIds.has(l.productoId)) {
                next[l.productoId] = `${l.nombre} se agotó. Elija otro plato.`;
              }
            });
            return next;
          });
        }
      } catch (err: any) {
        if (esErrorSesionVencida(err)) {
          onLogout({ type: 'warning', message: 'Su sesión expiró. Ingrese nuevamente.' });
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [token, lineasBorrador, onLogout]);

  // Acciones sobre el pedido en armado
  const agregarProducto = (prod: ProductoMenuPedido) => {
    if (prod.agotado || !prod.disponible) return;

    setErrorGeneral(null);

    setLineasBorrador((prev) => {
      // Regla: Si tiene la misma observación (vacía inicialmente), suma cantidad; máx 20
      const index = prev.findIndex(
        (l) => l.productoId === prod.id && (!l.observacion || l.observacion.trim() === '')
      );

      if (index >= 0) {
        const linea = prev[index];
        if (linea.cantidad >= 20) return prev;
        const nuevaCantidad = linea.cantidad + 1;
        const copia = [...prev];
        copia[index] = {
          ...linea,
          cantidad: nuevaCantidad,
          subtotal: Number((nuevaCantidad * linea.precioUnitario).toFixed(2))
        };
        return copia;
      }

      return [
        ...prev,
        {
          productoId: prod.id,
          nombre: prod.nombre,
          precioUnitario: prod.precio,
          cantidad: 1,
          observacion: '',
          subtotal: prod.precio,
          agotado: false
        }
      ];
    });

    // Limpiar error previo en la línea
    if (erroresLineas[prod.id]) {
      setErroresLineas((prev) => {
        const copy = { ...prev };
        delete copy[prod.id];
        return copy;
      });
    }
  };

  const disminuirProducto = (productoId: string, observacion = '') => {
    setErrorGeneral(null);

    setLineasBorrador((prev) => {
      const index = prev.findIndex(
        (l) => l.productoId === productoId && l.observacion === observacion
      );

      if (index < 0) return prev;

      const linea = prev[index];
      if (linea.cantidad > 1) {
        const nuevaCantidad = linea.cantidad - 1;
        const copia = [...prev];
        copia[index] = {
          ...linea,
          cantidad: nuevaCantidad,
          subtotal: Number((nuevaCantidad * linea.precioUnitario).toFixed(2))
        };
        return copia;
      }

      // Si llega a 0, se remueve la línea
      return prev.filter((_, i) => i !== index);
    });
  };

  const actualizarCantidad = (productoId: string, cantidad: number, observacion = '') => {
    if (cantidad < 1 || cantidad > 20) return;

    setErrorGeneral(null);

    setLineasBorrador((prev) => {
      const index = prev.findIndex(
        (l) => l.productoId === productoId && l.observacion === observacion
      );
      if (index < 0) return prev;

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
    setLineasBorrador((prev) =>
      prev.filter((l) => !(l.productoId === productoId && l.observacion === observacion))
    );
    setErroresLineas((prev) => {
      const copy = { ...prev };
      delete copy[productoId];
      return copy;
    });
  };

  const abrirModalNota = (linea: LineaBorrador) => {
    setLineaParaNota(linea);
    setModalNotaOpen(true);
  };

  const guardarNota = (nuevaObservacion: string) => {
    if (!lineaParaNota) return;

    setLineasBorrador((prev) => {
      const index = prev.findIndex(
        (l) =>
          l.productoId === lineaParaNota.productoId &&
          l.observacion === lineaParaNota.observacion
      );
      if (index < 0) return prev;

      const copia = [...prev];
      copia[index] = {
        ...copia[index],
        observacion: nuevaObservacion.trim()
      };
      return copia;
    });

    setModalNotaOpen(false);
    setLineaParaNota(null);
  };

  const solicitarDescarte = () => {
    if (lineasBorrador.length > 0) {
      setModalDescartarOpen(true);
    }
  };

  const confirmarDescarte = () => {
    setLineasBorrador([]);
    setNotas('');
    setErrorGeneral(null);
    setErroresLineas({});
    generarNuevoSolicitudId();
    setModalDescartarOpen(false);
  };

  const reiniciarParaNuevoPedido = () => {
    setLineasBorrador([]);
    setNotas('');
    setMesaSeleccionada(null);
    setModo('nuevo');
    setPedidoExistente(null);
    setErrorGeneral(null);
    setErroresLineas({});
    generarNuevoSolicitudId();
    setModalExitoOpen(false);
    setExitoData(null);
    cargarDatos();
  };

  // Cálculos totales en memoria
  const totalCalculado = lineasBorrador.reduce((acc, l) => acc + l.subtotal, 0);
  const totalGeneralConExistente = totalCalculado + (pedidoExistente?.total || 0);
  const cantidadTotalProductos = lineasBorrador.reduce((acc, l) => acc + l.cantidad, 0);

  // Registro en el servidor
  const registrarPedido = async (_onSuccess?: () => void) => {
    setErrorGeneral(null);

    // Validación RV-60: Mesa obligatoria
    if (!mesaSeleccionada) {
      setErrorGeneral('Seleccione una mesa libre.');
      return;
    }

    // Validación RV-61: Al menos una línea
    if (lineasBorrador.length === 0) {
      setErrorGeneral('Agregue al menos un producto al pedido.');
      return;
    }

    // Validación de platos agotados marcados
    const platosAgotados = lineasBorrador.filter((l) => l.agotado);
    if (platosAgotados.length > 0) {
      setErrorGeneral('Hay platos agotados en su pedido. Quite o cambie las líneas marcadas.');
      return;
    }

    setRegistrando(true);

    try {
      if (modo === 'nuevo') {
        const payload = {
          solicitudId: solicitudIdRef.current,
          mesaId: mesaSeleccionada.id,
          lineas: lineasBorrador.map((l) => ({
            productoId: l.productoId,
            cantidad: l.cantidad,
            observacion: l.observacion || undefined
          })),
          notas: notas.trim() || undefined
        };

        const res: RegistrarPedidoResultDto = await pedidoService.registrarPedidoMesa(payload, token);

        setExitoData({
          numeroPedido: res.numero,
          mesaNombre: res.mesaNombre,
          total: res.total
        });
        setModalExitoOpen(true);
      } else if (modo === 'ampliacion' && pedidoExistente) {
        const payload = {
          solicitudId: solicitudIdRef.current,
          lineas: lineasBorrador.map((l) => ({
            productoId: l.productoId,
            cantidad: l.cantidad,
            observacion: l.observacion || undefined
          }))
        };

        const res: AgregarLineasResultDto = await pedidoService.agregarLineas(
          pedidoExistente.id,
          payload,
          token
        );

        setExitoData({
          numeroPedido: res.numeroPedido,
          mesaNombre: mesaSeleccionada.nombre,
          total: res.total
        });
        setModalExitoOpen(true);
      }
    } catch (err: any) {
      if (esErrorSesionVencida(err)) {
        onLogout({ type: 'warning', message: 'Su sesión expiró. Ingrese nuevamente.' });
        return;
      }

      if (err.status === 409) {
        if (err.codigo === 'mesa_ocupada') {
          setErrorGeneral(err.message || 'La mesa ya tiene un pedido abierto. Agregue productos a ese pedido.');
        } else if (err.codigo === 'platos_agotados') {
          setErrorGeneral(err.message || 'Hay platos agotados en su pedido. Quite o cambie las líneas marcadas.');
          if (Array.isArray(err.productosAgotados)) {
            const nuevosErrores: Record<string, string> = {};
            setLineasBorrador((prev) =>
              prev.map((l) => {
                if (err.productosAgotados.includes(l.productoId)) {
                  nuevosErrores[l.productoId] = `${l.nombre} se agotó. Elija otro plato.`;
                  return { ...l, agotado: true };
                }
                return l;
              })
            );
            setErroresLineas(nuevosErrores);
          }
        } else if (err.codigo === 'pedido_cerrado') {
          setErrorGeneral('El pedido ya no puede modificarse porque fue pagado o anulado.');
        } else {
          setErrorGeneral(err.message || 'Conflicto al procesar el pedido.');
        }
      } else if (err.status === 400) {
        setErrorGeneral(err.message || 'Datos del pedido inválidos. Revise las líneas.');
      } else {
        setErrorGeneral(
          modo === 'nuevo'
            ? 'No se pudo registrar el pedido. Su pedido sigue en pantalla; intente nuevamente.'
            : 'No se pudieron agregar los productos. El pedido no cambió; intente nuevamente.'
        );
      }
    } finally {
      setRegistrando(false);
    }
  };

  return {
    cargando,
    registrando,
    errorGeneral,
    setErrorGeneral,
    erroresLineas,
    catalogo,
    mesasLibres,
    mesaSeleccionada,
    setMesaSeleccionada,
    modo,
    pedidoExistente,
    lineasBorrador,
    notas,
    setNotas,
    categoriaActiva,
    setCategoriaActiva,
    busqueda,
    setBusqueda,
    modalDescartarOpen,
    setModalDescartarOpen,
    modalExitoOpen,
    setModalExitoOpen,
    exitoData,
    modalNotaOpen,
    setModalNotaOpen,
    lineaParaNota,
    agregarProducto,
    disminuirProducto,
    actualizarCantidad,
    quitarLinea,
    abrirModalNota,
    guardarNota,
    solicitarDescarte,
    confirmarDescarte,
    reiniciarParaNuevoPedido,
    totalCalculado,
    totalGeneralConExistente,
    cantidadTotalProductos,
    registrarPedido,
    cargarDatos
  };
}
