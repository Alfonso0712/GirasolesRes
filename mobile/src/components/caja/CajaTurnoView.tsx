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
} from 'lucide-react';
import { cajaService } from '../../services/cajaService';
import { ventaService } from '../../services/ventaService';
import type { CajaActualResponseDto, CierreResumenDto, HistorialCierresItemDto } from '../../types/caja';
import type { VentaItem } from '../../types/venta';
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
import { useHaptics } from '../../hooks/useHaptics';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, pluralizar } from '../../utils/format';
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

  // Control de pestaña principal: 'turno' | 'ventas' | 'cierres'
  const [seccion, setSeccion] = useState<'turno' | 'ventas' | 'cierres'>('turno');

  // Filtros de ventas (Hoy, Ayer, 7 días)
  const [filtroVentas, setFiltroVentas] = useState<'hoy' | 'ayer' | '7dias'>('hoy');
  const [ventas, setVentas] = useState<VentaItem[]>([]);
  const [cargandoVentas, setCargandoVentas] = useState(false);
  const [errorVentas, setErrorVentas] = useState<string | null>(null);

  // Historial de cierres (solo Administrador)
  const [cierres, setCierres] = useState<HistorialCierresItemDto[]>([]);
  const [cargandoCierres, setCargandoCierres] = useState(false);
  const [errorCierres, setErrorCierres] = useState<string | null>(null);

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

  // Carga de ventas cuando se activa la sección de ventas
  useEffect(() => {
    if (seccion !== 'ventas') return;

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

    let cancelado = false;
    setCargandoVentas(true);
    setErrorVentas(null);

    ventaService.listarVentas({ desde, hasta })
      .then((res) => {
        if (!cancelado) {
          setVentas(res.items || []);
        }
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          const msg = err instanceof Error ? err.message : 'Error al consultar ventas';
          setErrorVentas(msg);
          setVentas([]);
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoVentas(false);
      });

    return () => {
      cancelado = true;
    };
  }, [seccion, filtroVentas]);

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

  const handleAbrirCaja = () => {
    const num = parseFloat(montoApertura) || 0;
    if (num <= 0) {
      triggerError();
      setErrorModal('El monto inicial debe ser mayor a 0');
      return;
    }
    setErrorModal(null);
    setConfirmarApertura(true);
  };

  const ejecutarApertura = async () => {
    const num = parseFloat(montoApertura) || 0;
    setProcesando(true);
    try {
      await cajaService.abrirCaja(num);
      triggerSuccess();
      setConfirmarApertura(false);
      setModalAbrir(false);
      mostrar({
        tipo: 'exito',
        mensaje: `Caja abierta con éxito con fondo de ${formatCurrency(num)}`,
      });
      await onRefresh();
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'Error al abrir caja';
      setErrorModal(msg);
      setConfirmarApertura(false);
    } finally {
      setProcesando(false);
    }
  };

  const iniciarCierre = async () => {
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

  const ejecutarCierre = async () => {
    if (!resumenCierre) return;
    const contado = parseFloat(efectivoContado) || 0;
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
        mensaje: 'Cierre de caja completado con éxito',
      });
      await onRefresh();
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'Error al cerrar caja';
      setErrorModal(msg);
      setConfirmarCierre(false);
    } finally {
      setProcesando(false);
    }
  };

  const estaAbierta = cajaActual?.estado === 'abierta';
  const apertura = cajaActual?.apertura;
  const parcial = cajaActual?.resumenParcial;

  const esperado = resumenCierre?.efectivoEsperado || 0;
  const contadoNum = parseFloat(efectivoContado) || 0;
  const dif = contadoNum - esperado;

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
                  accent={estaAbierta ? 'success' : 'danger'}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          estaAbierta ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'
                        }`}
                      >
                        {estaAbierta ? <Unlock className="w-6 h-6" aria-hidden="true" /> : <Lock className="w-6 h-6" aria-hidden="true" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
                          Estado del Turno
                        </span>
                        <h3 className="text-lg font-black text-ink">
                          {estaAbierta ? 'Caja Abierta y Operativa' : 'Caja Cerrada'}
                        </h3>
                      </div>
                    </div>

                    <StatusBadge estado={estaAbierta ? 'Abierta' : 'Cerrada'} />
                  </div>

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
                      className="flex items-center justify-center gap-2"
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
                          className="flex items-center justify-center gap-2"
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
                        className="flex items-center justify-center gap-2"
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

        {/* SECCIÓN 2: VENTAS (LISTA SOLO LECTURA) */}
        {seccion === 'ventas' && (
          <div className="space-y-3">
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

            {cargandoVentas && <SkeletonList count={4} />}

            {!cargandoVentas && !errorVentas && ventas.length === 0 && (
              <EmptyState
                icon={Receipt}
                titulo="Sin ventas registradas"
                subtitulo="No se encontraron comprobantes de venta en el período seleccionado."
              />
            )}

            {ventas.map((v) => (
              <Card key={v.ventaId} accent="none" padding="sm" className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-ink">{v.comprobante}</span>
                    <span className="text-xs text-ink-muted">Pedido #{v.pedidoNumero}</span>
                  </div>
                  <StatusBadge estado={v.estado} />
                </div>
                <div className="flex justify-between items-center text-xs text-ink-muted pt-1 border-t border-line">
                  <span>{v.fechaHoraFormateada || v.fechaHora} · {v.metodo}</span>
                  <span className="text-sm font-black text-accent tabular-nums">
                    {formatCurrency(v.total)}
                  </span>
                </div>
              </Card>
            ))}
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
              <Card key={c.cajaId} accent="none" padding="sm" className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-extrabold text-ink">{c.fechaCierre || c.fechaApertura}</span>
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

            <div className="bg-canvas border border-line rounded-2xl p-3.5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">Fondo Inicial:</span>
                <span className="font-bold tabular-nums">{formatCurrency(resumenCierre.montoInicial)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">Ventas Efectivo:</span>
                <span className="font-bold tabular-nums">{formatCurrency(resumenCierre.ventasEfectivo)}</span>
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
              <label htmlFor="obs-cierre" className="block text-xs font-bold text-ink-muted mb-1">
                Observación (opcional):
              </label>
              <input
                id="obs-cierre"
                type="text"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Ej. Billetes deteriorados..."
                className="w-full bg-canvas border border-line rounded-xl px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-primary"
              />
            </div>

            <Numpad
              value={efectivoContado}
              onChange={(val) => setEfectivoContado(val)}
              enterLabel="Confirmar Cierre"
              onEnter={() => setConfirmarCierre(true)}
            />
          </div>
        )}
      </BottomSheet>

      {/* Confirmación Apertura */}
      <ConfirmSheet
        isOpen={confirmarApertura}
        onCancelar={() => setConfirmarApertura(false)}
        titulo="Confirmar Fondo Inicial"
        mensaje={`¿Confirma la apertura de caja con un fondo inicial de ${formatCurrency(parseFloat(montoApertura) || 0)}?`}
        etiquetaConfirmar="Sí, Abrir Caja"
        etiquetaCancelar="Volver"
        onConfirmar={ejecutarApertura}
        cargando={procesando}
      />

      {/* Confirmación Cierre */}
      <ConfirmSheet
        isOpen={confirmarCierre}
        onCancelar={() => setConfirmarCierre(false)}
        titulo="Confirmar Cierre Definitivo"
        mensaje={`Se cerrará el turno actual con un total contado de ${formatCurrency(contadoNum)}. Esta acción registrará el acta formal de cierre y no se puede deshacer.`}
        etiquetaConfirmar="Sí, Cerrar Caja"
        etiquetaCancelar="Volver"
        tono="peligro"
        onConfirmar={ejecutarCierre}
        cargando={procesando}
      />
    </div>
  );
};
