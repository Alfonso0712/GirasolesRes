import { useState, useEffect, useCallback, useMemo } from 'react';
import { cobroService } from '../services/cobroService';
import { cajaService } from '../services/cajaService';
import type { CajaEstado } from '../types/caja';
import type {
  PedidoPendienteCobro,
  CobroRequest,
  ComprobanteDetalle,
} from '../types/cobro';

export function useCobrosManagement(token: string) {
  const [cajaEstado, setCajaEstado] = useState<CajaEstado | null>(null);
  const [pedidos, setPedidos] = useState<PedidoPendienteCobro[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'mesa' | 'llevar' | 'listos'>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  // Modales
  const [abrirCajaModalOpen, setAbrirCajaModalOpen] = useState<boolean>(false);
  const [cobroModalOpen, setCobroModalOpen] = useState<boolean>(false);
  const [pedidoParaCobro, setPedidoParaCobro] = useState<PedidoPendienteCobro | null>(null);

  const [ticketModalOpen, setTicketModalOpen] = useState<boolean>(false);
  const [comprobanteActual, setComprobanteActual] = useState<ComprobanteDetalle | null>(null);

  // Estados de proceso
  const [procesandoCaja, setProcesandoCaja] = useState<boolean>(false);
  const [procesandoCobro, setProcesandoCobro] = useState<boolean>(false);
  const [descargandoTxt, setDescargandoTxt] = useState<boolean>(false);

  // Toasts
  const [avisoExito, setAvisoExito] = useState<string | null>(null);
  const [avisoError, setAvisoError] = useState<string | null>(null);

  const mostrarExito = useCallback((msg: string) => {
    setAvisoExito(msg);
    setTimeout(() => setAvisoExito(null), 4000);
  }, []);

  const mostrarError = useCallback((msg: string) => {
    setAvisoError(msg);
    setTimeout(() => setAvisoError(null), 5000);
  }, []);

  // Cargar estado de caja y pedidos pendientes
  const cargarDatos = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    setErrorCarga(null);

    try {
      // 1. Consultar estado de caja
      const estadoCaja = await cajaService.obtenerEstadoCaja(token);
      setCajaEstado(estadoCaja);

      if (!estadoCaja.estaAbierta) {
        setPedidos([]);
        return;
      }

      // 2. Si caja está abierta, consultar pedidos pendientes de cobro
      const items = await cobroService.obtenerPedidosPendientes(token);
      setPedidos(items);
    } catch (err: any) {
      if (err.status === 409 && err.message?.includes('caja')) {
        setCajaEstado({ estaAbierta: false });
        setPedidos([]);
      } else {
        setErrorCarga(err.message || 'Error al conectar con el servidor.');
      }
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Apertura de caja
  const handleAbrirCaja = async (montoApertura: number) => {
    setProcesandoCaja(true);
    try {
      const nuevoEstado = await cajaService.abrirCaja({ montoApertura }, token);
      setCajaEstado(nuevoEstado);
      mostrarExito('Caja abierta correctamente. Ya puede registrar cobros.');
      // Refrescar pedidos
      const items = await cobroService.obtenerPedidosPendientes(token);
      setPedidos(items);
    } catch (err: any) {
      throw err;
    } finally {
      setProcesandoCaja(false);
    }
  };

  // Iniciar cobro de un pedido
  const handleIniciarCobro = (pedido: PedidoPendienteCobro) => {
    if (!cajaEstado?.estaAbierta) {
      setAbrirCajaModalOpen(true);
      return;
    }
    setPedidoParaCobro(pedido);
    setCobroModalOpen(true);
  };

  // Confirmar cobro
  const handleConfirmarCobro = async (request: CobroRequest) => {
    setProcesandoCobro(true);
    try {
      const resultado = await cobroService.procesarCobro(request, token);

      // Obtener detalle completo del comprobante para visualización
      const comprobante = await cobroService.obtenerComprobante(resultado.ventaId, false, token);
      setComprobanteActual(comprobante);

      // Cerrar modal de cobro y abrir ticket térmico
      setCobroModalOpen(false);
      setPedidoParaCobro(null);
      setTicketModalOpen(true);

      mostrarExito(resultado.mensaje || 'Cobro registrado y ticket emitido.');

      // Refrescar lista de pedidos pendientes
      await cargarDatos();
    } catch (err: any) {
      throw err;
    } finally {
      setProcesandoCobro(false);
    }
  };

  // Descarga de ticket térmico
  const handleDescargarTxt = async () => {
    if (!comprobanteActual) return;
    setDescargandoTxt(true);
    try {
      await cobroService.descargarComprobanteTxt(
        comprobanteActual.ventaId,
        comprobanteActual.esCopia,
        token
      );
      mostrarExito('Ticket descargado en formato de texto térmico.');
    } catch (err: any) {
      mostrarError(err.message || 'Error al descargar el archivo.');
    } finally {
      setDescargandoTxt(false);
    }
  };

  // Filtrado reactivo en memoria
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      // Filtro por tipo o estado
      if (filtroTipo === 'mesa' && p.tipo.toLowerCase() !== 'mesa') return false;
      if (filtroTipo === 'llevar' && p.tipo.toLowerCase() === 'mesa') return false;
      if (filtroTipo === 'listos' && !p.estaListo) return false;

      // Filtro de búsqueda textual
      if (busqueda.trim()) {
        const query = busqueda.trim().toLowerCase();
        const coincideNum = p.numero.toString().includes(query);
        const coincideMesa = (p.mesa || '').toLowerCase().includes(query);
        const coincideRef = (p.referencia || '').toLowerCase().includes(query);
        const coincideTotal = p.total.toFixed(2).includes(query);
        return coincideNum || coincideMesa || coincideRef || coincideTotal;
      }

      return true;
    });
  }, [pedidos, filtroTipo, busqueda]);

  const totalPorCobrar = useMemo(() => {
    return pedidos.reduce((acc, curr) => acc + Number(curr.total), 0);
  }, [pedidos]);

  const totalListos = useMemo(() => {
    return pedidos.filter((p) => p.estaListo).length;
  }, [pedidos]);

  return {
    cajaEstado,
    pedidos: pedidosFiltrados,
    totalPedidos: pedidos.length,
    totalPorCobrar,
    totalListos,
    cargando,
    errorCarga,
    filtroTipo,
    setFiltroTipo,
    busqueda,
    setBusqueda,
    // Modales
    abrirCajaModalOpen,
    setAbrirCajaModalOpen,
    cobroModalOpen,
    setCobroModalOpen,
    pedidoParaCobro,
    ticketModalOpen,
    setTicketModalOpen,
    comprobanteActual,
    // Procesos
    procesandoCaja,
    procesandoCobro,
    descargandoTxt,
    // Acciones
    cargarDatos,
    handleAbrirCaja,
    handleIniciarCobro,
    handleConfirmarCobro,
    handleDescargarTxt,
    // Toasts
    avisoExito,
    avisoError,
    setAvisoError,
  };
}
