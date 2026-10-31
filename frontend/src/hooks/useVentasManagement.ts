import { useState, useEffect, useCallback, useRef } from 'react';
import { ventaService } from '../services/ventaService';
import { formatDateIso } from '../utils/formatters';
import type {
  VentaItem,
  ResumenVentas,
  VentaDetalle,
  AnularVentaRequest
} from '../types/venta';

interface UseVentasManagementProps {
  token: string;
  esAdmin: boolean;
  esCajero: boolean;
}

export function useVentasManagement({ token, esAdmin, esCajero }: UseVentasManagementProps) {
  const [ventas, setVentas] = useState<VentaItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [resumen, setResumen] = useState<ResumenVentas>({
    vigentes: 0,
    totalVigente: 0,
    efectivo: 0,
    yape: 0,
    anuladas: 0
  });

  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [segundosTranscurridos, setSegundosTranscurridos] = useState<number>(0);

  // Filtros
  const [busqueda, setBusqueda] = useState<string>('');
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [filtroTipoComprobante, setFiltroTipoComprobante] = useState<'todos' | 'ticket' | 'boleta' | 'factura'>('todos');

  // Formato YYYY-MM-DD en hora local Perú
  const getHoyString = () => formatDateIso(new Date());

  const [desde, setDesde] = useState<string>(getHoyString());
  const [hasta, setHasta] = useState<string>(getHoyString());
  const [errorFechas, setErrorFechas] = useState<string | null>(null);
  const [pagina, setPagina] = useState<number>(1);
  const tamano = 20;

  // Modales
  const [detalleModalOpen, setDetalleModalOpen] = useState<boolean>(false);
  const [cargandoDetalle, setCargandoDetalle] = useState<boolean>(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaDetalle | null>(null);

  const [anularModalOpen, setAnularModalOpen] = useState<boolean>(false);
  const [procesandoAnulacion, setProcesandoAnulacion] = useState<boolean>(false);
  const [descargandoTicket, setDescargandoTicket] = useState<boolean>(false);

  // Avisos Toasts
  const [avisoExito, setAvisoExito] = useState<string | null>(null);
  const [avisoError, setAvisoError] = useState<string | null>(null);

  const timerSegundosRef = useRef<any>(null);

  const mostrarExito = useCallback((msg: string) => {
    setAvisoExito(msg);
    setTimeout(() => setAvisoExito(null), 4000);
  }, []);

  const mostrarError = useCallback((msg: string) => {
    setAvisoError(msg);
    setTimeout(() => setAvisoError(null), 5000);
  }, []);

  // Validación cliente de filtros
  const validarFiltros = useCallback((): boolean => {
    setErrorBusqueda(null);
    setErrorFechas(null);

    // Búsqueda: comprobante, DNI, RUC o cliente (hasta 50 caracteres)
    if (busqueda.trim()) {
      const b = busqueda.trim();
      if (b.length > 50 || !/^[a-zA-Z0-9\-\s\.\,ñÑáéíóúÁÉÍÓÚ]+$/.test(b)) {
        setErrorBusqueda('La búsqueda contiene caracteres no válidos o supera los 50 caracteres.');
        return false;
      }
    }

    if (desde && hasta) {
      const dDesde = new Date(desde + 'T00:00:00');
      const dHasta = new Date(hasta + 'T00:00:00');
      const dHoy = new Date(getHoyString() + 'T00:00:00');

      if (dDesde > dHasta) {
        setErrorFechas('La fecha "desde" no puede ser posterior a "hasta".');
        return false;
      }

      if (dDesde > dHoy || dHasta > dHoy) {
        setErrorFechas('El rango no puede superar los 31 días ni incluir fechas futuras.');
        return false;
      }

      const diffDays = Math.round((dHasta.getTime() - dDesde.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 31) {
        setErrorFechas('El rango no puede superar los 31 días ni incluir fechas futuras.');
        return false;
      }

      if (esCajero && !esAdmin) {
        const dLimiteCajero = new Date(dHoy);
        dLimiteCajero.setDate(dLimiteCajero.getDate() - 7);
        if (dDesde < dLimiteCajero) {
          setErrorFechas('Solo puede consultar las ventas de los últimos 7 días.');
          return false;
        }
      }
    }

    return true;
  }, [busqueda, desde, hasta, esCajero, esAdmin]);

  // Cargar ventas
  const cargarVentas = useCallback(async (silencioso = false) => {
    if (!token) return;
    if (!validarFiltros()) return;

    if (!silencioso) setCargando(true);
    setErrorCarga(null);

    try {
      const resp = await ventaService.listarVentas(
        {
          busqueda: busqueda.trim() || undefined,
          desde: desde || undefined,
          hasta: hasta || undefined,
          pagina,
          tamano
        },
        token
      );

      setVentas(resp.items);
      setTotal(resp.total);
      setResumen(resp.resumen);
      setSegundosTranscurridos(0);
    } catch (err: any) {
      setErrorCarga(err.message || 'No se pudieron cargar las ventas. Intente nuevamente.');
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, [token, busqueda, desde, hasta, pagina, tamano, validarFiltros]);

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  // Contador de segundos transcurridos
  useEffect(() => {
    timerSegundosRef.current = setInterval(() => {
      setSegundosTranscurridos((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerSegundosRef.current) clearInterval(timerSegundosRef.current);
    };
  }, []);

  // Filtros rápidos de fecha
  const setFiltroRapido = (tipo: 'hoy' | 'ayer' | 'semana' | 'mes') => {
    const hoy = new Date();

    if (tipo === 'hoy') {
      const hStr = formatDateIso(hoy);
      setDesde(hStr);
      setHasta(hStr);
      setPagina(1);
    } else if (tipo === 'ayer') {
      const ayer = new Date(hoy);
      ayer.setDate(ayer.getDate() - 1);
      const aStr = formatDateIso(ayer);
      setDesde(aStr);
      setHasta(aStr);
      setPagina(1);
    } else if (tipo === 'semana') {
      const hace7 = new Date(hoy);
      hace7.setDate(hace7.getDate() - 7);
      setDesde(formatDateIso(hace7));
      setHasta(formatDateIso(hoy));
      setPagina(1);
    } else if (tipo === 'mes') {
      const hace30 = new Date(hoy);
      hace30.setDate(hace30.getDate() - 30);
      setDesde(formatDateIso(hace30));
      setHasta(formatDateIso(hoy));
      setPagina(1);
    }
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setErrorBusqueda(null);
    setFiltroTipoComprobante('todos');
    const hoyStr = getHoyString();
    setDesde(hoyStr);
    setHasta(hoyStr);
    setErrorFechas(null);
    setPagina(1);
  };

  // Abrir detalle
  const handleVerDetalle = async (ventaId: string) => {
    setCargandoDetalle(true);
    setDetalleModalOpen(true);
    try {
      const detalle = await ventaService.obtenerDetalleVenta(ventaId, token);
      setVentaSeleccionada(detalle);
    } catch (err: any) {
      mostrarError(err.message || 'Error al obtener el detalle de la venta.');
      setDetalleModalOpen(false);
    } finally {
      setCargandoDetalle(false);
    }
  };

  // Anular venta
  const handleConfirmarAnulacion = async (motivo: string, destinoPedido: 'porCobrar' | 'anular') => {
    if (!ventaSeleccionada) return;
    setProcesandoAnulacion(true);

    try {
      const request: AnularVentaRequest = {
        solicitudId: `anul-${ventaSeleccionada.ventaId}-${Date.now()}`,
        motivo: motivo.trim(),
        destinoPedido
      };

      const resp = await ventaService.anularVenta(ventaSeleccionada.ventaId, request, token);

      mostrarExito(resp.mensaje);
      setAnularModalOpen(false);
      setDetalleModalOpen(false);

      // Refrescar lista
      await cargarVentas(true);
    } catch (err: any) {
      mostrarError(err.message || 'No se pudo anular la venta. La venta sigue vigente; intente nuevamente.');
      throw err;
    } finally {
      setProcesandoAnulacion(false);
    }
  };

  // Descargar / reimprimir comprobante PDF
  const handleDescargarComprobante = async (ventaId: string, esCopia = true) => {
    setDescargandoTicket(true);
    try {
      await ventaService.descargarTicketPdf(ventaId, esCopia, token);
      mostrarExito('Comprobante PDF descargado exitosamente.');
    } catch (err: any) {
      mostrarError(err.message || 'Error al descargar el comprobante en PDF.');
    } finally {
      setDescargandoTicket(false);
    }
  };

  return {
    ventas,
    total,
    resumen,
    cargando,
    errorCarga,
    segundosTranscurridos,
    busqueda,
    setBusqueda,
    errorBusqueda,
    filtroTipoComprobante,
    setFiltroTipoComprobante,
    desde,
    setDesde,
    hasta,
    setHasta,
    errorFechas,
    pagina,
    setPagina,
    tamano,
    cargarVentas,
    limpiarFiltros,
    setFiltroRapido,
    detalleModalOpen,
    setDetalleModalOpen,
    cargandoDetalle,
    ventaSeleccionada,
    handleVerDetalle,
    anularModalOpen,
    setAnularModalOpen,
    procesandoAnulacion,
    handleConfirmarAnulacion,
    descargandoTicket,
    handleDescargarComprobante,
    avisoExito,
    avisoError,
    setAvisoError
  };
}
