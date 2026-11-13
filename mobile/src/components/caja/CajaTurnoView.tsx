import React, { useState, useEffect } from 'react';
import { Lock, Unlock, DollarSign, Smartphone, Check, ArrowRight } from 'lucide-react';
import { cajaService } from '../../services/cajaService';
import type { CajaActualResponseDto, CierreResumenDto } from '../../types/caja';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { StatusBadge } from '../ui/StatusBadge';
import { BottomSheet } from '../ui/BottomSheet';
import { ConfirmSheet } from '../ui/ConfirmSheet';
import { PageHeader } from '../layout/PageHeader';
import { Numpad } from '../ui/Numpad';
import { ErrorState } from '../ui/ErrorState';
import { useHaptics } from '../../hooks/useHaptics';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, pluralizar } from '../../utils/format';

interface CajaTurnoViewProps {
  onNavigateToCobros?: () => void;
}

export const CajaTurnoView: React.FC<CajaTurnoViewProps> = ({ onNavigateToCobros }) => {
  const [cajaActual, setCajaActual] = useState<CajaActualResponseDto | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const [modalAbrir, setModalAbrir] = useState(false);
  const [montoApertura, setMontoApertura] = useState('100');
  const [modalCerrar, setModalCerrar] = useState(false);
  const [confirmarApertura, setConfirmarApertura] = useState(false);
  const [confirmarCierre, setConfirmarCierre] = useState(false);
  const [resumenCierre, setResumenCierre] = useState<CierreResumenDto | null>(null);
  const [efectivoContado, setEfectivoContado] = useState('');
  const [observacion, setObservacion] = useState('');
  const [procesando, setProcesando] = useState(false);

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();
  const { mostrar } = useToast();

  const cargarCaja = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await cajaService.obtenerActual();
      setCajaActual(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar el estado de la caja';
      setError(msg);
      setCajaActual(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCaja();
  }, []);

  const handleAbrirCaja = () => {
    const num = parseFloat(montoApertura) || 0;
    if (num <= 0) {
      triggerError();
      setError('El monto inicial debe ser mayor a 0');
      return;
    }
    setError(null);
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
      cargarCaja();
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'Error al abrir caja';
      setError(msg);
      setConfirmarApertura(false);
    } finally {
      setProcesando(false);
    }
  };

  const iniciarCierre = async () => {
    triggerLight();
    setProcesando(true);
    setError(null);
    try {
      const resumen = await cajaService.obtenerResumenCierre();
      setResumenCierre(resumen);
      setEfectivoContado(resumen.efectivoEsperado.toString());
      setModalCerrar(true);
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'No se pudo obtener el resumen de cierre de caja';
      setError(msg);
    } finally {
      setProcesando(false);
    }
  };

  const handleSolicitarCierre = () => {
    if (!resumenCierre) return;
    setConfirmarCierre(true);
  };

  const ejecutarCierre = async () => {
    if (!resumenCierre) return;
    const contado = parseFloat(efectivoContado) || 0;
    setProcesando(true);
    try {
      await cajaService.cerrarCaja({
        efectivoContado: contado,
        efectivoEsperadoMostrado: resumenCierre.efectivoEsperado,
        observacion: observacion.trim() || undefined
      });
      triggerSuccess();
      setConfirmarCierre(false);
      setModalCerrar(false);
      mostrar({
        tipo: 'exito',
        mensaje: 'Cierre de caja completado con éxito',
      });
      cargarCaja();
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'Error al cerrar caja';
      setError(msg);
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

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {/* 1. Encabezado */}
      <PageHeader
        title="Gestión de Caja"
        subtitle={estaAbierta ? 'Caja abierta y operativa' : 'Caja cerrada'}
        icon={<Lock className="w-5 h-5 text-white" aria-hidden="true" />}
        onRefresh={cargarCaja}
        isRefreshing={cargando}
      />

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {error && (
          <ErrorState
            mensaje={error}
            onRetry={cargarCaja}
            className="my-4"
          />
        )}

        {/* 1. Tarjeta de Estado de Caja */}
        {cajaActual && (
          <>
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

            {/* 2. Métricas del Turno Actual (Solo si está abierta) */}
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

            {/* 3. Acciones de Operación */}
            <div className="space-y-3 pt-2">
              {!estaAbierta ? (
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => {
                    triggerLight();
                    setModalAbrir(true);
                  }}
                  className="flex items-center justify-center gap-2"
                >
                  <Unlock className="w-5 h-5" />
                  <span>Abrir Caja de Turno</span>
                </Button>
              ) : (
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
      </div>

      {/* Modal Apertura de Caja */}
      <BottomSheet
        isOpen={modalAbrir}
        onClose={() => setModalAbrir(false)}
        title="Apertura de Caja"
      >
        <div className="space-y-4">
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
            <div className="bg-canvas border border-line rounded-2xl p-3.5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">Fondo Inicial:</span>
                <span className="font-bold tabular-nums">{formatCurrency(resumenCierre.montoInicial)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">Ventas Efectivo:</span>
                <span className="font-bold tabular-nums">{formatCurrency(resumenCierre.ventasEfectivo)}</span>
              </div>
              <div className="border-t border-line pt-2 flex justify-between items-center">
                <span className="text-xs font-black text-ink">Efectivo Esperado:</span>
                <span className="text-xl font-black text-accent tabular-nums">
                  {formatCurrency(esperado)}
                </span>
              </div>
            </div>

            {/* Comparación Contado vs Esperado */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-canvas border border-line p-2 rounded-xl">
                <span className="text-xs text-ink-muted block">Efectivo Contado</span>
                <span className="text-lg font-black text-ink tabular-nums">
                  {formatCurrency(parseFloat(efectivoContado) || 0)}
                </span>
              </div>

              <div
                className={`border p-2 rounded-xl ${
                  dif === 0
                    ? 'bg-success-bg border-success-border text-success'
                    : dif < 0
                    ? 'bg-danger-bg border-danger-border text-danger'
                    : 'bg-warning-bg border-warning-border text-warning'
                }`}
              >
                <span className="text-xs font-bold block">
                  {dif === 0 ? 'Cuadra Exacto' : dif < 0 ? 'Faltante' : 'Sobrante'}
                </span>
                <span className="text-lg font-black tabular-nums">
                  {formatCurrency(Math.abs(dif))}
                </span>
              </div>
            </div>

            <Numpad
              value={efectivoContado}
              onChange={(val) => setEfectivoContado(val)}
            />

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Observación (Opcional)</label>
              <input
                type="text"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Ej. Billetes deteriorados o descuadre justificado"
                className="w-full text-xs px-3 py-2 rounded-xl border border-line bg-canvas focus:outline-primary"
              />
            </div>

            <Button
              fullWidth
              size="lg"
              variant="danger"
              isLoading={procesando}
              onClick={handleSolicitarCierre}
              className="flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>Confirmar Cierre de Caja</span>
            </Button>
          </div>
        )}
      </BottomSheet>

      {/* Confirmación de Apertura */}
      <ConfirmSheet
        isOpen={confirmarApertura}
        titulo="Confirmar Apertura"
        mensaje={`¿Confirmar apertura de caja con un fondo inicial de ${formatCurrency(parseFloat(montoApertura) || 0)}?`}
        etiquetaConfirmar="Confirmar Apertura"
        cargando={procesando}
        onConfirmar={ejecutarApertura}
        onCancelar={() => setConfirmarApertura(false)}
      />

      {/* Confirmación de Cierre */}
      <ConfirmSheet
        isOpen={confirmarCierre}
        titulo="Asentar Cierre Definitivo"
        mensaje="¿Está seguro de asentar el cierre definitivo de caja? Esta operación es inmutable y no podrá registrar más cobros."
        etiquetaConfirmar="Asentar Cierre"
        tono="peligro"
        cargando={procesando}
        onConfirmar={ejecutarCierre}
        onCancelar={() => setConfirmarCierre(false)}
      />
    </div>
  );
};
