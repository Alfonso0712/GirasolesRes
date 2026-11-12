import React, { useState, useEffect } from 'react';
import { Lock, Unlock, RefreshCw, AlertCircle, DollarSign, Smartphone, Check, ArrowRight } from 'lucide-react';
import { cajaService } from '../../services/cajaService';
import type { CajaActualResponseDto, CierreResumenDto } from '../../types/caja';
import { Button } from '../ui/Button';
import { BottomSheet } from '../ui/BottomSheet';
import { Numpad } from '../ui/Numpad';
import { useHaptics } from '../../hooks/useHaptics';

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
  const [resumenCierre, setResumenCierre] = useState<CierreResumenDto | null>(null);
  const [efectivoContado, setEfectivoContado] = useState('');
  const [observacion, setObservacion] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();

  const cargarCaja = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await cajaService.obtenerActual();
      setCajaActual(data);
    } catch (err: any) {
      // Mock para pruebas si la API está desconectada
      setCajaActual({
        estado: 'abierta',
        apertura: {
          cajaId: 'caja-demo-1',
          fechaApertura: new Date().toISOString(),
          fechaAperturaLocal: '12/11/2026 08:00 AM',
          montoInicial: 100.00,
          idUsuarioApertura: 'u1',
          nombreUsuarioApertura: 'Ana Torres (Cajero)'
        },
        resumenParcial: {
          totalVentas: 345.50,
          totalEfectivo: 210.00,
          totalYape: 135.50,
          cantidadVentas: 8
        },
        sugerenciaMontoInicial: 100
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCaja();
  }, []);

  const handleAbrirCaja = async () => {
    const num = parseFloat(montoApertura) || 0;
    if (num <= 0) {
      triggerError();
      setError('El monto inicial debe ser mayor a 0');
      return;
    }
    setProcesando(true);
    try {
      await cajaService.abrirCaja(num);
      triggerSuccess();
      setModalAbrir(false);
      setMensajeExito(`Caja abierta con éxito con fondo de S/ ${num.toFixed(2)}`);
      cargarCaja();
    } catch (err: any) {
      triggerError();
      setError(err?.message || 'Error al abrir caja');
    } finally {
      setProcesando(false);
    }
  };

  const iniciarCierre = async () => {
    triggerLight();
    setProcesando(true);
    try {
      const resumen = await cajaService.obtenerResumenCierre();
      setResumenCierre(resumen);
      setEfectivoContado(resumen.efectivoEsperado.toString());
      setModalCerrar(true);
    } catch {
      // Mock para cierre
      const mockResumen: CierreResumenDto = {
        cajaId: cajaActual?.apertura?.cajaId || 'caja-1',
        fechaApertura: cajaActual?.apertura?.fechaApertura || new Date().toISOString(),
        montoInicial: cajaActual?.apertura?.montoInicial || 100,
        ventasEfectivo: cajaActual?.resumenParcial?.totalEfectivo || 210,
        ventasYape: cajaActual?.resumenParcial?.totalYape || 135.50,
        totalVentas: cajaActual?.resumenParcial?.totalVentas || 345.50,
        efectivoEsperado: (cajaActual?.apertura?.montoInicial || 100) + (cajaActual?.resumenParcial?.totalEfectivo || 210),
        cantidadVentas: cajaActual?.resumenParcial?.cantidadVentas || 8
      };
      setResumenCierre(mockResumen);
      setEfectivoContado(mockResumen.efectivoEsperado.toString());
      setModalCerrar(true);
    } finally {
      setProcesando(false);
    }
  };

  const handleConfirmarCierre = async () => {
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
      setModalCerrar(false);
      setMensajeExito('Cierre de caja completado con éxito');
      cargarCaja();
    } catch (err: any) {
      triggerError();
      setError(err?.message || 'Error al cerrar caja');
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
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden">
      {/* Header */}
      <div className="bg-surface border-b border-line px-5 py-3 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-ink leading-tight">Gestión de Caja</h2>
          <p className="text-xs text-ink-muted">Apertura, arqueo y cierre del turno</p>
        </div>
        <button
          type="button"
          onClick={cargarCaja}
          disabled={cargando}
          className="w-10 h-10 rounded-xl bg-canvas border border-line flex items-center justify-center text-ink active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-primary' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensajeExito && (
          <div className="p-4 rounded-2xl bg-success-bg border border-success-border text-success flex items-center justify-between">
            <span className="text-xs font-bold">{mensajeExito}</span>
            <button type="button" onClick={() => setMensajeExito(null)} className="text-xs font-bold underline">
              OK
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-danger-bg border border-danger-border text-danger text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Tarjeta de Estado de Caja */}
        <div className="bg-surface border border-line rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  estaAbierta ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'
                }`}
              >
                {estaAbierta ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
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

            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase ${
                estaAbierta
                  ? 'bg-success-bg text-success border border-success-border'
                  : 'bg-danger-bg text-danger border border-danger-border'
              }`}
            >
              {estaAbierta ? 'Abierta' : 'Cerrada'}
            </span>
          </div>

          {estaAbierta && apertura && (
            <div className="border-t border-line pt-3 text-xs space-y-1 text-ink-muted">
              <p>
                <span className="font-bold text-ink">Cajero:</span> {apertura.nombreUsuarioApertura}
              </p>
              <p>
                <span className="font-bold text-ink">Fondo Inicial:</span> S/ {apertura.montoInicial.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* 2. Métricas del Turno Actual (Solo si está abierta) */}
        {estaAbierta && parcial && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Ventas del Turno
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface border border-line rounded-2xl p-4 shadow-xs">
                <span className="text-xs text-ink-muted font-bold block">Total Facturado</span>
                <span className="text-xl font-black text-primary block mt-1">
                  S/ {parcial.totalVentas.toFixed(2)}
                </span>
                <span className="text-[11px] text-ink-muted mt-0.5 block">{parcial.cantidadVentas} comprobantes</span>
              </div>

              <div className="bg-surface border border-line rounded-2xl p-4 shadow-xs">
                <span className="text-xs text-ink-muted font-bold block">Efectivo en Caja</span>
                <span className="text-xl font-black text-success block mt-1">
                  S/ {(apertura!.montoInicial + parcial.totalEfectivo).toFixed(2)}
                </span>
                <span className="text-[11px] text-ink-muted mt-0.5 block">Incluye fondo inicial</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface border border-line rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-chip-accent-bg text-primary flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-ink-muted block font-semibold">Ventas Efectivo</span>
                  <span className="text-sm font-extrabold text-ink">S/ {parcial.totalEfectivo.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-surface border border-line rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-info-bg text-info flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-ink-muted block font-semibold">Ventas Yape / Plin</span>
                  <span className="text-sm font-extrabold text-ink">S/ {parcial.totalYape.toFixed(2)}</span>
                </div>
              </div>
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
            <span className="text-3xl font-black text-primary">
              S/ {montoApertura ? parseFloat(montoApertura).toFixed(2) : '0.00'}
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
                <span className="font-bold">S/ {resumenCierre.montoInicial.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">Ventas Efectivo:</span>
                <span className="font-bold">S/ {resumenCierre.ventasEfectivo.toFixed(2)}</span>
              </div>
              <div className="border-t border-line pt-2 flex justify-between items-center">
                <span className="text-xs font-black text-ink">Efectivo Esperado:</span>
                <span className="text-xl font-black text-primary">
                  S/ {esperado.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Comparación Contado vs Esperado */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-canvas border border-line p-2 rounded-xl">
                <span className="text-[11px] text-ink-muted block">Efectivo Contado</span>
                <span className="text-lg font-black text-ink">
                  S/ {efectivoContado ? parseFloat(efectivoContado).toFixed(2) : '0.00'}
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
                <span className="text-[11px] block">
                  {dif === 0 ? 'Cuadra Exacto' : dif < 0 ? 'Faltante' : 'Sobrante'}
                </span>
                <span className="text-lg font-black">
                  S/ {Math.abs(dif).toFixed(2)}
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
              onClick={handleConfirmarCierre}
              className="flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>Confirmar Cierre de Caja</span>
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};
