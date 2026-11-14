import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  DollarSign,
  Smartphone,
  Check,
  ArrowRight,
  Receipt,
  History,
  Info,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { cajaService } from '../../services/cajaService';
import { ventaService } from '../../services/ventaService';
import type {
  CajaActualResponseDto,
  CierreResumenDto,
  HistorialCierresItemDto,
  CierreDetalleDto,
} from '../../types/caja';
import type { VentaItem, VentaDetalle } from '../../types/venta';
import type { RolUsuario } from '../../types/auth';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { StatusBadge } from '../ui/StatusBadge';
import { BottomSheet } from '../ui/BottomSheet';
import { ConfirmSheet } from '../ui/ConfirmSheet';
import { PageHeader } from '../layout/PageHeader';
import { Numpad } from '../ui/Numpad';
import { ErrorState } from '../ui/ErrorState';
import { SkeletonList } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { FilterChipBar } from '../ui/FilterChipBar';
import { VentaDetalleSheet } from './VentaDetalleSheet';
import { CierreDetalleSheet } from './CierreDetalleSheet';
import { useHaptics } from '../../hooks/useHaptics';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, pluralizar } from '../../utils/format';
import { formatLimaFechaHora } from '../../utils/fechas';
import { puede } from '../../config/permisos';

export interface CajaTurnoViewProps {
  cajaActual: CajaActualResponseDto | null;
  cargando: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onNavigateToCobros?: () => void;
  rol?: RolUsuario;
}

export const CajaTurnoView: React.FC<CajaTurnoViewProps> = ({
  cajaActual,
  cargando,
  error,
  onRefresh,
  onNavigateToCobros,
  rol = 'Cajero',
}) => {
  const esAdmin = rol === 'Administrador';
  const puedeOperarCaja = puede(rol, 'caja.abrir') && puede(rol, 'caja.cerrar');
  const { sinConexion } = useNetworkStatus();

  // Control de pestaña principal: 'turno' | 'ventas' | 'cierres'
  const [seccion, setSeccion] = useState<'turno' | 'ventas' | 'cierres'>('turno');

  // Filtros de ventas (Hoy, Ayer, 7 días) y búsqueda
  const [filtroVentas, setFiltroVentas] = useState<'hoy' | 'ayer' | '7dias'>('hoy');
  const [busquedaVentas, setBusquedaVentas] = useState('');
  const [paginaVentas, setPaginaVentas] = useState(1);
  const [totalVentas, setTotalVentas] = useState(0);
  const [ventas, setVentas] = useState<VentaItem[]>([]);
  const [cargandoVentas, setCargandoVentas] = useState(false);
  const [errorVentas, setErrorVentas] = useState<string | null>(null);

  // Detalle y Anulación de Venta
  const [sheetVentaAbierta, setSheetVentaAbierta] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState<VentaDetalle | null>(null);
  const [cargandoDetalleVenta, setCargandoDetalleVenta] = useState(false);
  const [anulandoVenta, setAnulandoVenta] = useState(false);

  // Historial de cierres (solo Administrador)
  const [cierres, setCierres] = useState<HistorialCierresItemDto[]>([]);
  const [cargandoCierres, setCargandoCierres] = useState(false);
  const [errorCierres, setErrorCierres] = useState<string | null>(null);
  const [sheetCierreAbierta, setSheetCierreAbierta] = useState(false);
  const [cierreDetalle, setCierreDetalle] = useState<CierreDetalleDto | null>(null);
  const [cargandoDetalleCierre, setCargandoDetalleCierre] = useState(false);

  // Modales de operación de caja (Cajero)
  const [modalAbrir, setModalAbrir] = useState(false);
  const [montoApertura, setMontoApertura] = useState('100');
  const [modalCerrar, setModalCerrar] = useState(false);
  const [confirmarApertura, setConfirmarApertura] = useState(false);
  const [confirmarCierre, setConfirmarCierre] = useState(false);
  const [resumenCierre, setResumenCierre] = useState<CierreResumenDto | null>(null);
  const [efectivoContado, setEfectivoContado] = useState('');
  const [observacion, setObservacion] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();
  const { mostrar } = useToast();

  const obtenerRangoFechasVentas = () => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const hoy = new Date();

    let desde = toYMD(hoy);
    let hasta = toYMD(hoy);

    if (filtroVentas === 'ayer') {
      const ayer = new Date(hoy);
      ayer.setDate(ayer.getDate() - 1);
      desde = toYMD(ayer);
      hasta = toYMD(ayer);
    } else if (filtroVentas === '7dias') {
      const sieteDias = new Date(hoy);
      sieteDias.setDate(sieteDias.getDate() - 7);
      desde = toYMD(sieteDias);
    }
    return { desde, hasta };
  };

  const cargarVentas = async (pagina = 1, append = false) => {
    const { desde, hasta } = obtenerRangoFechasVentas();
    setCargandoVentas(true);
    setErrorVentas(null);
    try {
      const res = await ventaService.listarVentas({
        desde,
        hasta,
        busqueda: busquedaVentas.trim() || undefined,
        pagina,
        tamano: 20,
      });
      if (append) {
        setVentas((prev) => [...prev, ...(res.items || [])]);
      } else {
        setVentas(res.items || []);
      }
      setTotalVentas(res.total || 0);
      setPaginaVentas(pagina);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar ventas';
      setErrorVentas(msg);
      if (!append) setVentas([]);
    } finally {
      setCargandoVentas(false);
    }
  };

  // Carga de ventas cuando se activa la sección de ventas
  useEffect(() => {
    if (seccion === 'ventas') {
      void cargarVentas(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seccion, filtroVentas, busquedaVentas]);

  const handleVerDetalleVenta = async (ventaId: string) => {
    triggerLight();
    setSheetVentaAbierta(true);
    setCargandoDetalleVenta(true);
    setVentaDetalle(null);
    try {
      const d = await ventaService.obtenerDetalleVenta(ventaId);
      setVentaDetalle(d);
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'No se pudo obtener el detalle de la venta.';
      mostrar({ tipo: 'error', mensaje: msg });
      setSheetVentaAbierta(false);
    } finally {
      setCargandoDetalleVenta(false);
    }
  };

  const handleAnularVenta = async (ventaId: string, motivoStr: string, destinoPedidoStr: string) => {
    const solicitudId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-anular-${Date.now()}`;
    setAnulandoVenta(true);
    try {
      const res = await ventaService.anularVenta(ventaId, {
        solicitudId,
        motivo: motivoStr,
        destinoPedido: destinoPedidoStr,
      });
      triggerSuccess();
      mostrar({
        tipo: 'exito',
        mensaje: res.mensaje || `Comprobante ${res.comprobante} anulado con éxito.`,
      });
      cargarVentas(1, false);
      onRefresh();
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'Error al anular la venta.';
      mostrar({ tipo: 'error', mensaje: msg });
      throw err;
    } finally {
      setAnulandoVenta(false);
    }
  };

  // Carga de historial de cierres cuando se activa la sección de cierres (Admin)
  useEffect(() => {
    if (seccion !== 'cierres' || !esAdmin) return;

    let cancelado = false;
    setCargandoCierres(true);
    setErrorCierres(null);

    cajaService.obtenerHistorialCierres()
      .then((res) => {
        if (!cancelado) {
          setCierres(res.items || []);
        }
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          const msg = err instanceof Error ? err.message : 'Error al consultar historial de cierres';
          setErrorCierres(msg);
          setCierres([]);
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoCierres(false);
      });

    return () => {
      cancelado = true;
    };
  }, [seccion, esAdmin]);

  const handleVerDetalleCierre = async (cajaId: string) => {
    if (!cajaId) return;
    triggerLight();
    setSheetCierreAbierta(true);
    setCargandoDetalleCierre(true);
    setCierreDetalle(null);
    try {
      const d = await cajaService.obtenerDetalleCierre(cajaId);
      setCierreDetalle(d);
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'No se pudo obtener el detalle del cierre.';
      mostrar({ tipo: 'error', mensaje: msg });
      setSheetCierreAbierta(false);
    } finally {
      setCargandoDetalleCierre(false);
    }
  };

  const handleAbrirCaja = () => {
    if (sinConexion) {
      triggerError();
      setErrorModal('No se puede abrir caja sin conexión a internet.');
      return;
    }
    if (!montoApertura || montoApertura.trim() === '') {
      triggerError();
      setErrorModal('El monto inicial de apertura es obligatorio.');
      return;
    }
    const num = parseFloat(montoApertura);
    if (isNaN(num) || num < 0.00 || Number(num.toFixed(2)) !== num) {
      triggerError();
      setErrorModal('El monto debe ser mayor o igual a 0.00 y tener máximo 2 decimales.');
      return;
    }
    if (num > 99999.99) {
      triggerError();
      setErrorModal('El monto no puede superar S/ 99,999.99.');
      return;
    }
    setErrorModal(null);
    setConfirmarApertura(true);
  };

  const ejecutarApertura = async () => {
    if (sinConexion) {
      mostrar({ tipo: 'error', mensaje: 'Sin conexión a internet. Intente nuevamente cuando se restablezca.' });
      return;
    }
    const num = parseFloat(montoApertura) || 0;
    setProcesando(true);
    try {
      await cajaService.abrirCaja(num);
      triggerSuccess();
      setConfirmarApertura(false);
      setModalAbrir(false);
      mostrar({
        tipo: 'exito',
        mensaje: `Caja abierta con éxito con fondo inicial de ${formatCurrency(num)}.`,
      });
      await onRefresh();
    } catch (err: unknown) {
      triggerError();
      let msg = 'Error al abrir caja';
      if (err instanceof Error) {
        msg = err.message;
      }
      setErrorModal(msg);
      setConfirmarApertura(false);
    } finally {
      setProcesando(false);
    }
  };

  const iniciarCierre = async () => {
    if (sinConexion) {
      mostrar({ tipo: 'error', mensaje: 'Sin conexión a internet. No se puede iniciar el cierre de caja.' });
      return;
    }
    triggerLight();
    setProcesando(true);
    setErrorModal(null);
    try {
      const resumen = await cajaService.obtenerResumenCierre();
      setResumenCierre(resumen);
      setEfectivoContado(resumen.efectivoEsperado.toString());
      setModalCerrar(true);
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'No se pudo obtener el resumen de cierre de caja';
      mostrar({ tipo: 'error', mensaje: msg });
    } finally {
      setProcesando(false);
    }
  };

  const handleVerificarCierre = () => {
    if (sinConexion) {
      triggerError();
      setErrorModal('No se puede cerrar la caja sin conexión a internet.');
      return;
    }
    if (!efectivoContado || efectivoContado.trim() === '') {
      triggerError();
      setErrorModal('Debe ingresar el efectivo contado.');
      return;
    }
    const contado = parseFloat(efectivoContado);
    if (isNaN(contado) || contado < 0.00 || Number(contado.toFixed(2)) !== contado) {
      triggerError();
      setErrorModal('El monto debe ser mayor o igual a 0.00 y tener máximo 2 decimales.');
      return;
    }
    if (contado > 99999.99) {
      triggerError();
      setErrorModal('El monto no puede superar S/ 99,999.99.');
      return;
    }
    if (observacion.trim().length > 200) {
      triggerError();
      setErrorModal('La observación no puede superar los 200 caracteres.');
      return;
    }
    setErrorModal(null);
    setConfirmarCierre(true);
  };

  const ejecutarCierre = async () => {
    if (sinConexion) {
      mostrar({ tipo: 'error', mensaje: 'Sin conexión a internet. Intente nuevamente cuando se restablezca.' });
      return;
    }
    if (!resumenCierre) return;
    const contado = parseFloat(efectivoContado);
    if (isNaN(contado) || contado < 0.00 || Number(contado.toFixed(2)) !== contado) {
      setErrorModal('El monto debe ser mayor o igual a 0.00 y tener máximo 2 decimales.');
      return;
    }
    if (contado > 99999.99) {
      setErrorModal('El monto no puede superar S/ 99,999.99.');
      return;
    }
    if (observacion.trim().length > 200) {
      setErrorModal('La observación no puede superar los 200 caracteres.');
      return;
    }

    setProcesando(true);
    try {
      await cajaService.cerrarCaja({
        efectivoContado: contado,
        efectivoEsperadoMostrado: resumenCierre.efectivoEsperado,
        observacion: observacion.trim() || undefined,
      });
      triggerSuccess();
      setConfirmarCierre(false);
      setModalCerrar(false);
      mostrar({
        tipo: 'exito',
        mensaje: 'Caja cerrada con éxito. Arqueo registrado.',
      });
      await onRefresh();
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'Error al cerrar caja';
      if (msg.toLowerCase().includes('concurrente') || msg.toLowerCase().includes('actualizado')) {
        try {
          const nuevoResumen = await cajaService.obtenerResumenCierre();
          setResumenCierre(nuevoResumen);
        } catch {
          // ignorar
        }
      }
      setErrorModal(msg);
      setConfirmarCierre(false);
    } finally {
      setProcesando(false);
    }
  };

  const esAnteriorSinCerrar = cajaActual?.estado === 'anteriorSinCerrar' || cajaActual?.estado === 'sin_cerrar';
  const estaAbierta = cajaActual?.estado === 'abierta';
  const apertura = cajaActual?.apertura;
  const parcial = cajaActual?.resumenParcial;

  const esperado = resumenCierre?.efectivoEsperado || 0;
  const contadoNum = parseFloat(efectivoContado) || 0;
  const dif = contadoNum - esperado;
  const pedidosPendientes = resumenCierre?.pedidosPendientes || [];
  const tienePendientes = pedidosPendientes.length > 0 || ((resumenCierre?.pedidosPendientesCobro ?? 0) > 0);

  // Chips para control segmentado
  const chipsSeccion = [
    { id: 'turno', label: 'Turno' },
    { id: 'ventas', label: 'Ventas' },
    ...(esAdmin ? [{ id: 'cierres', label: 'Cierres' }] : []),
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {/* 1. Encabezado */}
      <PageHeader
        title="Gestión de Caja"
        subtitle={estaAbierta ? 'Caja abierta y operativa' : 'Caja cerrada'}
        icon={<Lock className="w-5 h-5 text-white" aria-hidden="true" />}
        onRefresh={onRefresh}
        isRefreshing={cargando}
      />

      {/* 2. Control Segmentado de Sección */}
      <div className="bg-surface border-b border-line px-4 py-2 shrink-0">
        <FilterChipBar
          chips={chipsSeccion}
          activeId={seccion}
          onSelect={(id) => {
            triggerLight();
            setSeccion(id as typeof seccion);
          }}
        />
      </div>

      {/* 3. Contenido según la sección seleccionada */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {/* SECCIÓN 1: TURNO ACTUAL */}
        {seccion === 'turno' && (
          <>
            {error && (
              <ErrorState
                mensaje={error}
                onRetry={onRefresh}
                className="my-4"
              />
            )}

            {cargando && !cajaActual && (
              <SkeletonList count={3} />
            )}

            {cajaActual && (
              <>
                {/* Tarjeta de Estado del Turno */}
                <Card
                  accent={esAnteriorSinCerrar ? 'danger' : estaAbierta ? 'success' : 'danger'}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          esAnteriorSinCerrar
                            ? 'bg-danger-bg text-danger'
                            : estaAbierta
                            ? 'bg-success-bg text-success'
                            : 'bg-danger-bg text-danger'
                        }`}
                      >
                        {esAnteriorSinCerrar ? (
                          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
                        ) : estaAbierta ? (
                          <Unlock className="w-6 h-6" aria-hidden="true" />
                        ) : (
                          <Lock className="w-6 h-6" aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
                          Estado del Turno
                        </span>
                        <h3 className="text-lg font-black text-ink">
                          {esAnteriorSinCerrar
                            ? 'Turno Anterior Sin Cerrar'
                            : estaAbierta
                            ? 'Caja Abierta y Operativa'
                            : 'Caja Cerrada'}
                        </h3>
                      </div>
                    </div>

                    <StatusBadge
                      estado={
                        esAnteriorSinCerrar
                          ? 'Inactiva'
                          : estaAbierta
                          ? 'Abierta'
                          : 'Cerrada'
                      }
                    />
                  </div>

                  {esAnteriorSinCerrar && (
                    <div className="p-3 bg-danger-bg border border-danger/30 rounded-xl flex items-start gap-2.5 text-xs text-danger">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Turno pendiente de cierre</p>
                        <p>Existe un turno anterior sin cerrar. Debe realizar el cierre antes de abrir una nueva caja.</p>
                      </div>
                    </div>
                  )}

                  {estaAbierta && apertura && (
                    <div className="border-t border-line pt-3 text-xs space-y-1 text-ink-muted">
                      <p>
                        <span className="font-bold text-ink">Cajero:</span> {apertura.nombreUsuarioApertura}
                      </p>
                      <p>
                        <span className="font-bold text-ink">Fondo Inicial:</span> {formatCurrency(apertura.montoInicial)}
                      </p>
                    </div>
                  )}
                </Card>

                {/* Métricas del Turno Actual */}
                {estaAbierta && parcial && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                      Ventas del Turno
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <StatCard
                        titulo="Total Facturado"
                        valor={formatCurrency(parcial.totalVentas)}
                        subtitulo={pluralizar(parcial.cantidadVentas, 'comprobante', 'comprobantes')}
                      />

                      <StatCard
                        titulo="Efectivo en Caja"
                        valor={formatCurrency(apertura!.montoInicial + parcial.totalEfectivo)}
                        subtitulo="Incluye fondo inicial"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <StatCard
                        titulo="Ventas Efectivo"
                        valor={formatCurrency(parcial.totalEfectivo)}
                        icon={<DollarSign className="w-4 h-4 text-accent" aria-hidden="true" />}
                      />

                      <StatCard
                        titulo="Ventas Yape / Plin"
                        valor={formatCurrency(parcial.totalYape)}
                        icon={<Smartphone className="w-4 h-4 text-info" aria-hidden="true" />}
                      />
                    </div>
                  </div>
                )}

                {/* Acciones de Operación por Rol */}
                <div className="space-y-3 pt-2">
                  {!puedeOperarCaja ? (
                    /* Administrador: Solo lectura informativa */
                    <div className="bg-surface border border-line rounded-2xl p-4 flex items-center gap-3 text-ink-muted">
                      <Info className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />
                      <p className="text-xs leading-relaxed">
                        La apertura y el cierre de caja los realiza el Cajero.
                      </p>
                    </div>
                  ) : esAnteriorSinCerrar ? (
                    /* Turno anterior sin cerrar: Botón cerrar caja pendiente */
                    <Button
                      fullWidth
                      size="lg"
                      variant="danger"
                      isLoading={procesando}
                      onClick={iniciarCierre}
                      className="flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <Lock className="w-5 h-5" />
                      <span>Cerrar caja pendiente</span>
                    </Button>
                  ) : !estaAbierta ? (
                    /* Cajero: Abrir caja */
                    <Button
                      fullWidth
                      size="lg"
                      onClick={() => {
                        triggerLight();
                        setErrorModal(null);
                        setModalAbrir(true);
                      }}
                      className="flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <Unlock className="w-5 h-5" />
                      <span>Abrir Caja de Turno</span>
                    </Button>
                  ) : (
                    /* Cajero: Ir a cobros o Cerrar caja */
                    <div className="space-y-2.5">
                      {onNavigateToCobros && (
                        <Button
                          fullWidth
                          size="lg"
                          onClick={onNavigateToCobros}
                          className="flex items-center justify-center gap-2 min-h-[44px]"
                        >
                          <span>Ir a Cobros Pendientes</span>
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      )}

                      <Button
                        fullWidth
                        size="lg"
                        variant="danger"
                        isLoading={procesando}
                        onClick={iniciarCierre}
                        className="flex items-center justify-center gap-2 min-h-[44px]"
                      >
                        <Lock className="w-5 h-5" />
                        <span>Realizar Cierre de Caja / Arqueo</span>
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* SECCIÓN 2: VENTAS (LISTA CON DETALLE Y ANULACIÓN) */}
        {seccion === 'ventas' && (
          <div className="space-y-3">
            {/* Buscador de comprobante */}
            <div className="relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                maxLength={15}
                value={busquedaVentas}
                onChange={(e) => setBusquedaVentas(e.target.value)}
                placeholder="Buscar comprobante (ej. B001)..."
                className="w-full bg-surface border border-line rounded-xl pl-9 pr-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-primary min-h-[44px]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFiltroVentas('hoy')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border min-h-[44px] ${
                  filtroVentas === 'hoy'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-ink-muted border-line'
                }`}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => setFiltroVentas('ayer')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border min-h-[44px] ${
                  filtroVentas === 'ayer'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-ink-muted border-line'
                }`}
              >
                Ayer
              </button>
              <button
                type="button"
                onClick={() => setFiltroVentas('7dias')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border min-h-[44px] ${
                  filtroVentas === '7dias'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-ink-muted border-line'
                }`}
              >
                Últimos 7 días
              </button>
            </div>

            {errorVentas && (
              <ErrorState mensaje={errorVentas} className="my-2" />
            )}

            {cargandoVentas && paginaVentas === 1 && <SkeletonList count={4} />}

            {!cargandoVentas && !errorVentas && ventas.length === 0 && (
              <EmptyState
                icon={Receipt}
                titulo="Sin ventas registradas"
                subtitulo="No se encontraron comprobantes de venta en el período seleccionado."
              />
            )}

            {ventas.map((v) => (
              <Card
                key={v.ventaId}
                interactive
                accent="none"
                padding="sm"
                onClick={() => handleVerDetalleVenta(v.ventaId)}
                className="space-y-1 select-none"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-ink">{v.comprobante}</span>
                    <span className="text-xs text-ink-muted">Pedido #{v.pedidoNumero}</span>
                  </div>
                  <StatusBadge estado={v.estado} />
                </div>
                <div className="flex justify-between items-center text-xs text-ink-muted pt-1 border-t border-line">
                  <span>{formatLimaFechaHora(v.fechaHoraFormateada || v.fechaHora)} · {v.metodo}</span>
                  <span className="text-sm font-black text-accent tabular-nums">
                    {formatCurrency(v.total)}
                  </span>
                </div>
              </Card>
            ))}

            {/* Paginación progresiva */}
            {ventas.length < totalVentas && (
              <Button
                fullWidth
                variant="outline"
                size="md"
                disabled={cargandoVentas}
                isLoading={cargandoVentas}
                onClick={() => cargarVentas(paginaVentas + 1, true)}
                className="min-h-[44px] mt-2"
              >
                <span>Cargar más comprobantes ({ventas.length} de {totalVentas})</span>
              </Button>
            )}
          </div>
        )}

        {/* SECCIÓN 3: CIERRES (HISTORIAL SOLO LECTURA PARA ADMINISTRADOR) */}
        {seccion === 'cierres' && esAdmin && (
          <div className="space-y-3">
            {errorCierres && (
              <ErrorState mensaje={errorCierres} className="my-2" />
            )}

            {cargandoCierres && <SkeletonList count={4} />}

            {!cargandoCierres && !errorCierres && cierres.length === 0 && (
              <EmptyState
                icon={History}
                titulo="Sin cierres registrados"
                subtitulo="No se registran actas de cierre de caja en el sistema."
              />
            )}

            {cierres.map((c) => (
              <Card
                key={c.cajaId}
                interactive
                accent="none"
                padding="sm"
                onClick={() => handleVerDetalleCierre(c.cajaId)}
                className="space-y-2 select-none"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-extrabold text-ink">{formatLimaFechaHora(c.fechaCierre || c.fechaApertura)}</span>
                  <StatusBadge estado={c.estadoCuadre || 'Cuadra'} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted pt-1 border-t border-line">
                  <div>
                    <span className="block text-ink-muted">Cajero:</span>
                    <span className="font-bold text-ink">{c.cajero}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-ink-muted">Total Ventas:</span>
                    <span className="font-bold text-accent tabular-nums">
                      {formatCurrency(c.totalVentas)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-ink-muted">
                  <span>Fondo Inicial: {formatCurrency(c.montoInicial)}</span>
                  <span>Diferencia: {formatCurrency(c.diferencia)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Apertura de Caja */}
      <BottomSheet
        isOpen={modalAbrir}
        onClose={() => setModalAbrir(false)}
        title="Apertura de Caja"
      >
        <div className="space-y-4">
          {errorModal && (
            <p className="text-xs font-bold text-danger bg-danger-bg p-2 rounded-xl">
              {errorModal}
            </p>
          )}

          <p className="text-xs text-ink-muted">
            Ingrese el fondo inicial en soles con el que empieza el turno:
          </p>

          <div className="bg-canvas border border-line rounded-2xl p-3 text-center">
            <span className="text-xs text-ink-muted block">Monto Inicial</span>
            <span className="text-3xl font-black text-accent tabular-nums">
              {formatCurrency(parseFloat(montoApertura) || 0)}
            </span>
          </div>

          <Numpad
            value={montoApertura}
            onChange={(val) => setMontoApertura(val)}
            enterLabel="Confirmar Apertura"
            onEnter={handleAbrirCaja}
          />
        </div>
      </BottomSheet>

      {/* Modal Cierre de Caja y Arqueo */}
      <BottomSheet
        isOpen={modalCerrar}
        onClose={() => setModalCerrar(false)}
        title="Arqueo y Cierre Definitivo"
      >
        {resumenCierre && (
          <div className="space-y-4">
            {errorModal && (
              <p className="text-xs font-bold text-danger bg-danger-bg p-2 rounded-xl">
                {errorModal}
              </p>
            )}

            {/* Si existen pedidos pendientes, se bloquea el cierre (RV-122, MSG-174) */}
            {tienePendientes ? (
              <div className="space-y-3">
                <div className="p-3 bg-danger-bg border border-danger/30 rounded-xl flex items-start gap-2.5 text-xs text-danger">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-danger" />
                  <div>
                    <p className="font-bold">No se puede cerrar la caja: hay pedidos pendientes</p>
                    <p>
                      Hay {pedidosPendientes.length} pedido(s) pendiente(s) de cobro. Cobre o anule todos los pedidos antes de cerrar la caja.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-line bg-canvas rounded-xl border border-line overflow-hidden max-h-48 overflow-y-auto">
                  {pedidosPendientes.map((p) => (
                    <div key={p.pedidoId} className="p-3 flex items-center justify-between text-xs gap-3">
                      <div>
                        <span className="font-bold text-ink">Pedido #{p.numero}</span>
                        <span className="text-ink-muted ml-2">
                          ({p.tipo} · {p.mesa || 'Sin mesa'})
                        </span>
                      </div>
                      <span className="font-bold text-danger tabular-nums">
                        {formatCurrency(p.total)}
                      </span>
                    </div>
                  ))}
                </div>

                {onNavigateToCobros && (
                  <Button
                    fullWidth
                    size="lg"
                    onClick={() => {
                      setModalCerrar(false);
                      onNavigateToCobros();
                    }}
                    className="flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <span>Ir a Cobros Pendientes</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="bg-canvas border border-line rounded-2xl p-3.5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-muted">Fondo Inicial:</span>
                    <span className="font-bold tabular-nums">{formatCurrency(resumenCierre.montoInicial)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-muted">Ventas Efectivo:</span>
                    <span className="font-bold tabular-nums">{formatCurrency(resumenCierre.ventasEfectivo)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-muted">Ventas Yape / Plin:</span>
                    <span className="font-bold tabular-nums">{formatCurrency(resumenCierre.ventasYape)}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-line pt-2 font-bold">
                    <span>Efectivo Esperado:</span>
                    <span className="text-accent tabular-nums">{formatCurrency(esperado)}</span>
                  </div>
                </div>

                <div className="bg-canvas border border-line rounded-2xl p-3 text-center">
                  <span className="text-xs text-ink-muted block">Efectivo Contado</span>
                  <span className="text-3xl font-black text-accent tabular-nums">
                    {formatCurrency(contadoNum)}
                  </span>
                  <div className="mt-1">
                    {dif === 0 ? (
                      <span className="text-xs font-bold text-success flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Cuadra exactamente</span>
                      </span>
                    ) : dif > 0 ? (
                      <span className="text-xs font-bold text-info">
                        Sobrante de {formatCurrency(dif)}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-danger">
                        Faltante de {formatCurrency(Math.abs(dif))}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="obs-cierre" className="block text-xs font-bold text-ink-muted">
                      Observación (opcional):
                    </label>
                    <span className="text-3xs text-ink-muted">
                      {observacion.length}/200
                    </span>
                  </div>
                  <input
                    id="obs-cierre"
                    type="text"
                    maxLength={200}
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Ej. Billetes deteriorados..."
                    className="w-full bg-canvas border border-line rounded-xl px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-primary min-h-[44px]"
                  />
                </div>

                <Numpad
                  value={efectivoContado}
                  onChange={(val) => setEfectivoContado(val)}
                  enterLabel="Confirmar Cierre"
                  onEnter={handleVerificarCierre}
                />
              </>
            )}
          </div>
        )}
      </BottomSheet>

      {/* Confirmación Apertura */}
      <ConfirmSheet
        isOpen={confirmarApertura}
        onCancelar={() => setConfirmarApertura(false)}
        titulo="Confirmar Apertura de Caja"
        mensaje={`¿Confirmar apertura de caja con un fondo inicial de ${formatCurrency(parseFloat(montoApertura) || 0)}?`}
        etiquetaConfirmar="Sí, Abrir Caja"
        etiquetaCancelar="Volver"
        onConfirmar={ejecutarApertura}
        cargando={procesando}
      />

      {/* Confirmación Cierre */}
      <ConfirmSheet
        isOpen={confirmarCierre}
        onCancelar={() => setConfirmarCierre(false)}
        titulo="¿Confirmar Cierre de Caja?"
        mensaje={`¿Cerrar la caja? No podrá cobrar hasta abrir una nueva y el cierre no se puede deshacer. Efectivo esperado: ${formatCurrency(esperado)}, contado: ${formatCurrency(contadoNum)}${dif === 0 ? ' (Cuadra)' : dif > 0 ? ` (+${formatCurrency(dif)})` : ` (-${formatCurrency(Math.abs(dif))})`}.`}
        etiquetaConfirmar="Sí, Cerrar Caja"
        etiquetaCancelar="Cancelar"
        tono="peligro"
        onConfirmar={ejecutarCierre}
        cargando={procesando}
      />

      {/* Detalle y Anulación de Venta (Administrador y Cajero) */}
      <VentaDetalleSheet
        isOpen={sheetVentaAbierta}
        onClose={() => setSheetVentaAbierta(false)}
        venta={ventaDetalle}
        cargando={cargandoDetalleVenta}
        esAdmin={esAdmin}
        onAnularVenta={handleAnularVenta}
        anulando={anulandoVenta}
      />

      {/* Detalle de Cierre de Caja (Administrador) */}
      <CierreDetalleSheet
        isOpen={sheetCierreAbierta}
        onClose={() => setSheetCierreAbierta(false)}
        cierre={cierreDetalle}
        cargando={cargandoDetalleCierre}
      />
    </div>
  );
};
