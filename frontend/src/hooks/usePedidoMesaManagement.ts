import { useState, useEffect, useCallback, useRef } from 'react';
import { pedidoService } from '../services/pedidoService';
import { getMesasService } from '../services/mesaService';
import { menuDiaService } from '../services/menuDiaService';
import type { MesaItem } from '../types/mesa';
import type { MenuCompletoDia } from '../types/menuDia';
import type {
  ProductoMenuPedido,
  LineaBorrador,
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
  const [lineaIndexParaNota, setLineaIndexParaNota] = useState<number | null>(null);

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
              .filter(prod => p.rolesPermitidos.some(r => prod.categoria.toLowerCase().includes(r.toLowerCase())))
              .map(prod => ({
                productoId: prod.id,
                nombre: prod.nombre,
                agotado: prod.agotado
              }))
          }))
        })));
      }

      if (mesaIdInicial) {
        if (modoInicial === 'nuevo') {
          setModo('nuevo');
          let m = mesas.find((item) => String(item.id).toLowerCase() === String(mesaIdInicial).toLowerCase());
          if (!m) {
            const todas = await getMesasService({}, token);
            m = todas.find((item) => String(item.id).toLowerCase() === String(mesaIdInicial).toLowerCase());
          }
          if (m) {
            setMesaSeleccionada(m);
            if (!mesas.some((item) => String(item.id).toLowerCase() === String(m!.id).toLowerCase())) {
              setMesasLibres((prev) => [m!, ...prev]);
            }
          }
        } else {
          // Verificar si la mesa ya tiene un pedido activo (deriva a ampliación CUS07.2)
          try {
            if (pedidoIdInicial) {
              const detalle = await pedidoService.obtenerPedidoPorId(pedidoIdInicial, token);
              setModo('ampliacion');
              setPedidoExistente(detalle);
              setMesaSeleccionada({
                id: mesaIdInicial,
                nombre: detalle.mesaNombre || 'Mesa',
                ocupacion: 'Ocupada',
                activa: true
              });
            } else {
              const pedidos = await pedidoService.obtenerPedidosActivosPorMesa(mesaIdInicial, token);
              if (pedidos && pedidos.length > 0) {
                const targetId = pedidos[0].id;
                const detalle = await pedidoService.obtenerPedidoPorId(targetId, token);
                setModo('ampliacion');
                setPedidoExistente(detalle);
                setMesaSeleccionada({
                  id: mesaIdInicial,
                  nombre: detalle.mesaNombre || 'Mesa',
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
        const [prods, menuHoy] = await Promise.all([
          pedidoService.obtenerCatalogoPedido(token),
          menuDiaService.obtenerMenuHoy(token).catch(() => null)
        ]);

        setCatalogo(prods);
        if (menuHoy?.menusCompletos) {
          setMenusCompletos(menuHoy.menusCompletos);
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

  // Agregar producto de carta al borrador
  const agregarProducto = (prod: ProductoMenuPedido) => {
    if (prod.agotado || !prod.disponible) return;

    setErrorGeneral(null);

    setLineasBorrador((prev) => {
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
          id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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

    if (erroresLineas[prod.id]) {
      setErroresLineas((prev) => {
        const copy = { ...prev };
        delete copy[prod.id];
        return copy;
      });
    }
  };

  // Agregar menú completo al borrador (RV-164 / RV-165)
  const agregarMenuCompleto = (
    menu: MenuCompletoDia,
    elecciones: { parte: string; productoId: string; productoNombre: string }[],
    observacion = ''
  ) => {
    setErrorGeneral(null);
    const obsNormalizada = observacion.trim();

    setLineasBorrador((prev) => {
      // Regla RV-164: Si coincide menú, observación y elecciones exactas, suma la cantidad
      const index = prev.findIndex((l) => {
        if (l.menuCompletoId !== menu.id) return false;
        if ((l.observacion || '').trim().toLowerCase() !== obsNormalizada.toLowerCase()) return false;
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

      const nuevaLinea: LineaBorrador = {
        id: `mc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        menuCompletoId: menu.id,
        nombre: menu.nombre,
        incluye: menu.incluye,
        precioUnitario: menu.precio,
        cantidad: 1,
        observacion: obsNormalizada,
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

  // Métodos retrocompatibles basados en productoId
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

    setLineasBorrador((prev) => {
      const index = prev.findIndex(
        (l) =>
          l.productoId === lineaParaNota.productoId &&
          l.menuCompletoId === lineaParaNota.menuCompletoId &&
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
