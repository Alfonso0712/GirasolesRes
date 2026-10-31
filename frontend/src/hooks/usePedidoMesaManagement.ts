import { useState, useEffect, useCallback } from 'react';
import { usePedidoCart } from './usePedidoCart';
import { pedidoService } from '../services/pedidoService';
import { getMesasService } from '../services/mesaService';
import { menuDiaService } from '../services/menuDiaService';
import type { MesaItem } from '../types/mesa';
import type { MenuCompletoDia } from '../types/menuDia';
import type {
  ProductoMenuPedido,
  PedidoResponseDto,
  RegistrarPedidoResultDto,
  AgregarLineasResultDto
} from '../types/pedido';

import { getMenusCompletosService } from '../services/menuCompletoService';

interface UsePedidoMesaManagementProps {
  token: string;
  mesaIdInicial?: string | null;
  modoInicial?: 'nuevo' | 'ampliacion';
  pedidoIdInicial?: string | null;
  onLogout: (banner?: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void;
}

export function usePedidoMesaManagement({
  token,
  mesaIdInicial,
  modoInicial,
  pedidoIdInicial,
  onLogout,
}: UsePedidoMesaManagementProps) {
  const [cargando, setCargando] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [menuDefinido, setMenuDefinido] = useState(true);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [erroresLineas, setErroresLineas] = useState<Record<string, string>>({});

  // Catálogo, Menús Completos y Mesas
  const [catalogo, setCatalogo] = useState<ProductoMenuPedido[]>([]);
  const [menusCompletos, setMenusCompletos] = useState<MenuCompletoDia[]>([]);
  const [mesasLibres, setMesasLibres] = useState<MesaItem[]>([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<MesaItem | null>(null);
  const [mesaInvalida, setMesaInvalida] = useState<boolean>(
    () => !mesaIdInicial || !String(mesaIdInicial).trim()
  );

  // Modo de operación: nuevo pedido (CUS07.1) o ampliación (CUS07.2)
  const [modo, setModo] = useState<'nuevo' | 'ampliacion'>('nuevo');
  const [pedidoExistente, setPedidoExistente] = useState<PedidoResponseDto | null>(null);

  // Filtros de UI
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [modalExitoOpen, setModalExitoOpen] = useState(false);
  const [exitoData, setExitoData] = useState<{
    numeroPedido: number;
    mesaNombre: string;
    total: number;
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
    agregarProducto,
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

  const confirmarDescarte = () => {
    confirmarDescarteCart();
    setErrorGeneral(null);
    setErroresLineas({});
  };

  const esErrorSesionVencida = (err: any): boolean => {
    return err?.status === 401 || err?.message?.toLowerCase().includes('sesión expiró');
  };

  // Carga inicial de datos
  const cargarDatos = useCallback(async () => {
    const mesaIdLimpio = mesaIdInicial ? String(mesaIdInicial).trim() : '';
    if (!mesaIdLimpio) {
      setMesaSeleccionada(null);
      setMesaInvalida(true);
      setCargando(false);
      return;
    }

    setCargando(true);
    setErrorGeneral(null);
    setMesaInvalida(false);

    try {
      const [prods, mesas, menuHoy, menusCompletosActivos] = await Promise.all([
        pedidoService.obtenerCatalogoPedido(token),
        getMesasService({ estado: 'libre' }, token),
        menuDiaService.obtenerMenuHoy(token).catch(() => null),
        getMenusCompletosService(true, token).catch(() => [])
      ]);

      setMenuDefinido(true); // RN-142: Sin menú del día definido no se bloquean ventas
      setCatalogo(prods);
      setMesasLibres(mesas);

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

      let m = mesas.find((item) => String(item.id).toLowerCase() === mesaIdLimpio.toLowerCase());
      if (!m) {
        const todas = await getMesasService({}, token);
        m = todas.find((item) => String(item.id).toLowerCase() === mesaIdLimpio.toLowerCase());
      }

      if (!m || !m.activa) {
        setMesaSeleccionada(null);
        setMesaInvalida(true);
        return;
      }

      if (modoInicial !== 'ampliacion') {
        setModo('nuevo');
        setMesaSeleccionada(m);
        setMesaInvalida(false);
        if (!mesas.some((item) => String(item.id).toLowerCase() === String(m!.id).toLowerCase())) {
          setMesasLibres((prev) => [m!, ...prev]);
        }
      } else {
        if (m.ocupacion !== 'Ocupada') {
          setMesaSeleccionada(null);
          setMesaInvalida(true);
          return;
        }
        try {
          if (pedidoIdInicial) {
            const detalle = await pedidoService.obtenerPedidoPorId(pedidoIdInicial, token);
            if (!detalle || detalle.estado === 'Pagado' || detalle.estado === 'Anulado') {
              setMesaSeleccionada(null);
              setMesaInvalida(true);
              return;
            }
            setModo('ampliacion');
            setPedidoExistente(detalle);
            setMesaSeleccionada({
              id: m.id,
              nombre: detalle.mesaNombre || m.nombre,
              ocupacion: 'Ocupada',
              activa: true
            });
            setMesaInvalida(false);
          } else {
            const pedidos = await pedidoService.obtenerPedidosActivosPorMesa(mesaIdLimpio, token);
            if (!pedidos || pedidos.length === 0) {
              setMesaSeleccionada(null);
              setMesaInvalida(true);
              return;
            }
            const targetId = pedidos[0].id;
            const detalle = await pedidoService.obtenerPedidoPorId(targetId, token);
            if (!detalle || detalle.estado === 'Pagado' || detalle.estado === 'Anulado') {
              setMesaSeleccionada(null);
              setMesaInvalida(true);
              return;
            }
            setModo('ampliacion');
            setPedidoExistente(detalle);
            setMesaSeleccionada({
              id: m.id,
              nombre: detalle.mesaNombre || m.nombre,
              ocupacion: 'Ocupada',
              activa: true
            });
            setMesaInvalida(false);
          }
        } catch (innerErr: any) {
          if (esErrorSesionVencida(innerErr)) {
            throw innerErr;
          }
          setMesaSeleccionada(null);
          setMesaInvalida(true);
          return;
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
  }, [token, mesaIdInicial, modoInicial, pedidoIdInicial, onLogout]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Polling de 30 segundos para refresco de catálogo (RNF-23)
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

        // Validar si algún producto en el borrador pasó a estar agotado
        const agotadosIds = new Set(prods.filter((p) => p.agotado || !p.disponible).map((p) => p.id));
        if (agotadosIds.size > 0) {
          setLineasBorrador((prev) =>
            prev.map((linea) => {
              if (linea.productoId && agotadosIds.has(linea.productoId)) {
                return { ...linea, agotado: true };
              }
              return linea;
            })
          );

          setErroresLineas((prev) => {
            const next = { ...prev };
            lineasBorrador.forEach((l) => {
              if (l.productoId && agotadosIds.has(l.productoId)) {
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

  const reiniciarParaNuevoPedido = () => {
    limpiarCarrito();
    setMesaSeleccionada(null);
    setModo('nuevo');
    setPedidoExistente(null);
    setErrorGeneral(null);
    setErroresLineas({});
    setModalExitoOpen(false);
    setExitoData(null);
    cargarDatos();
  };

  const totalGeneralConExistente = totalCalculado + (pedidoExistente?.total || 0);

  // Registro en el servidor (soporta productos de carta y menús completos con elecciones)
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
      const lineasPayload = lineasBorrador.map((l) => ({
        productoId: l.productoId ?? undefined,
        menuCompletoId: l.menuCompletoId ?? undefined,
        elecciones: l.elecciones?.map((e) => ({
          parte: e.parte,
          productoId: e.productoId
        })),
        cantidad: l.cantidad,
        observacion: l.observacion?.trim() || undefined
      }));

      if (modo === 'nuevo') {
        const payload = {
          solicitudId: solicitudIdRef.current,
          mesaId: mesaSeleccionada.id,
          lineas: lineasPayload,
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
          lineas: lineasPayload
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
        } else if (err.codigo === 'platos_agotados' || err.codigo === 'opcion_agotada') {
          setErrorGeneral(err.message || 'Hay platos u opciones agotadas en su pedido. Revise las líneas marcadas.');
          if (Array.isArray(err.productosAgotados)) {
            const nuevosErrores: Record<string, string> = {};
            setLineasBorrador((prev) =>
              prev.map((l) => {
                if (l.productoId && err.productosAgotados.includes(l.productoId)) {
                  nuevosErrores[l.productoId] = `${l.nombre} se agotó. Elija otro plato.`;
                  return { ...l, agotado: true };
                }
                return l;
              })
            );
            setErroresLineas(nuevosErrores);
          }
        } else {
          setErrorGeneral(err.message || 'Conflicto al procesar el pedido. Intente nuevamente.');
        }
        return;
      }

      setErrorGeneral(err.message || 'No se pudo registrar el pedido. Su pedido sigue en pantalla; intente nuevamente.');
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
    menusCompletos,
    mesasLibres,
    mesaSeleccionada,
    setMesaSeleccionada,
    mesaInvalida,
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
    agregarMenuCompleto,
    repetirLinea,
    disminuirProducto,
    disminuirLinea,
    actualizarCantidad,
    actualizarCantidadByIndex,
    quitarLinea,
    quitarLineaByIndex,
    abrirModalNota,
    abrirModalNotaByIndex,
    guardarNota,
    guardarNotaByIndex,
    solicitarDescarte,
    confirmarDescarte,
    reiniciarParaNuevoPedido,
    totalCalculado,
    totalGeneralConExistente,
    cantidadTotalProductos,
    registrarPedido,
    menuDefinido,
    cargarDatos
  };
}
