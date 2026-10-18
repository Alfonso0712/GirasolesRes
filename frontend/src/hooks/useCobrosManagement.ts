import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { cobroService } from '../services/cobroService';
import { cajaService } from '../services/cajaService';
import type {
  CajaEstado,
  CajaActualResponseDto,
} from '../types/caja';
import type {
  PedidoPendienteCobro,
  CobroRequest,
  ComprobanteDetalle,
} from '../types/cobro';

export function useCobrosManagement(token: string, onCajaEstadoChange?: () => void) {
  const [cajaEstado, setCajaEstado] = useState<CajaEstado | null>(null);
  const [cajaActual, setCajaActual] = useState<CajaActualResponseDto | null>(null);
  const [pedidos, setPedidos] = useState<PedidoPendienteCobro[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [segundosTranscurridos, setSegundosTranscurridos] = useState<number>(0);

  const timerSegundosRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'mesa' | 'llevar' | 'listos'>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  // Modales
  const [abrirCajaModalOpen, setAbrirCajaModalOpen] = useState<boolean>(false);
  const [cerrarCajaModalOpen, setCerrarCajaModalOpen] = useState<boolean>(false);
  const [cobroModalOpen, setCobroModalOpen] = useState<boolean>(false);
  const [pedidoParaCobro, setPedidoParaCobro] = useState<PedidoPendienteCobro | null>(null);

  const [ticketModalOpen, setTicketModalOpen] = useState<boolean>(false);
  const [comprobanteActual, setComprobanteActual] = useState<ComprobanteDetalle | null>(null);

  // Estados de proceso
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
  const cargarDatos = useCallback(
    async (silencioso = false) => {
      if (!token) return;
      if (!silencioso) setCargando(true);
      setErrorCarga(null);

      try {
        // 1. Consultar estado actual completo de caja (CUS 13)
        const actual = await cajaService.obtenerActual(token);
        setCajaActual(actual);

        const esAbierta = actual.estado === 'abierta';
        setCajaEstado({
          estaAbierta: esAbierta,
          cajaId: actual.apertura?.cajaId || null,
          montoApertura: actual.apertura?.montoInicial || null,
          fechaAperturaUtc: actual.apertura?.fechaAperturaUtc || actual.apertura?.fechaApertura || null,
          fechaAperturaLocal: actual.apertura?.fechaAperturaLocal || null,
          cajeroNombre: actual.apertura?.nombreUsuarioApertura || null,
          estadoOperativo: actual.estado,
        });

        if (!esAbierta) {
          setPedidos([]);
          setSegundosTranscurridos(0);
          return;
        }

        // 2. Si caja está abierta, consultar pedidos pendientes de cobro
        const items = await cobroService.obtenerPedidosPendientes(token);
        setPedidos(items);
        setSegundosTranscurridos(0);
      } catch (err: any) {
        if (err.status === 409 && err.message?.includes('caja')) {
          setCajaEstado({ estaAbierta: false, estadoOperativo: 'sinCaja' });
          setPedidos([]);
        } else {
          setErrorCarga(err.message || 'Error al conectar con el servidor.');
        }
      } finally {
        if (!silencioso) setCargando(false);
      }
    },
    [token]
  );

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Polling cada 15 segundos y contador de segundos (RNF-27)
  useEffect(() => {
    timerSegundosRef.current = setInterval(() => {
      setSegundosTranscurridos((prev) => prev + 1);
    }, 1000);

    intervalRef.current = setInterval(() => {
      cargarDatos(true);
    }, 15000);

    return () => {
      if (timerSegundosRef.current) clearInterval(timerSegundosRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cargarDatos]);

  // Apertura de caja completada (desde modal CUS 13.1)
  const handleCajaAbierta = async (_monto: number, msg: string) => {
    mostrarExito(msg);
    await cargarDatos();
    onCajaEstadoChange?.();
  };

  // Cierre de caja completado (desde modal CUS 13.2)
  const handleCierreCompletado = async () => {
    mostrarExito('Caja cerrada con éxito.');
    await cargarDatos();
    onCajaEstadoChange?.();
  };

  // Iniciar cobro de un pedido con guardas estrictas (MSG-135, MSG-168)
  const handleIniciarCobro = (pedido: PedidoPendienteCobro) => {
    if (cajaEstado?.estadoOperativo === 'anteriorSinCerrar') {
      const fecha = cajaActual?.apertura?.fechaAperturaLocal || 'un día anterior';
      mostrarError(`Hay una caja del ${fecha} sin cerrar. Ciérrela antes de abrir una nueva o cobrar.`); // MSG-168
      setCerrarCajaModalOpen(true);
      return;
    }

    if (!cajaEstado?.estaAbierta || cajaEstado?.estadoOperativo === 'sinCaja') {
      mostrarError('Debe abrir la caja antes de cobrar.'); // MSG-135
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

      // Refrescar lista de pedidos pendientes y resumen contable
      await cargarDatos();
      onCajaEstadoChange?.();
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
    cajaActual,
    pedidos: pedidosFiltrados,
    totalPedidos: pedidos.length,
    totalPorCobrar,
    totalListos,
    cargando,
    segundosTranscurridos,
    errorCarga,
    filtroTipo,
    setFiltroTipo,
    busqueda,
    setBusqueda,
    // Modales
    abrirCajaModalOpen,
    setAbrirCajaModalOpen,
    cerrarCajaModalOpen,
    setCerrarCajaModalOpen,
    cobroModalOpen,
    setCobroModalOpen,
    pedidoParaCobro,
    ticketModalOpen,
    setTicketModalOpen,
    comprobanteActual,
    // Procesos
    procesandoCobro,
    descargandoTxt,
    // Acciones
    cargarDatos,
    handleCajaAbierta,
    handleCierreCompletado,
    handleIniciarCobro,
    handleConfirmarCobro,
    handleDescargarTxt,
    // Toasts
    avisoExito,
    avisoError,
    setAvisoError,
  };
}
