import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Banknote,
  Smartphone,
  Check,
  AlertCircle,
  Lock
} from 'lucide-react';
import { cobroService } from '../../services/cobroService';
import { cajaService } from '../../services/cajaService';
import type { PedidoPendienteCobro, MetodoPago } from '../../types/cobro';
import type { CajaActualResponseDto } from '../../types/caja';
import { BottomSheet } from '../ui/BottomSheet';
import { ConfirmSheet } from '../ui/ConfirmSheet';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { SkeletonList } from '../ui/Skeleton';
import { PageHeader } from '../layout/PageHeader';
import { Numpad } from '../ui/Numpad';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { useHaptics } from '../../hooks/useHaptics';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, pluralizar } from '../../utils/format';

export const CobroView: React.FC = () => {
  const [pedidos, setPedidos] = useState<PedidoPendienteCobro[]>([]);
  const [cajaActual, setCajaActual] = useState<CajaActualResponseDto | null>(null);
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoPendienteCobro | null>(null);

  // Estado del cobro
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo');
  const [montoRecibido, setMontoRecibido] = useState<string>('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [errorCobro, setErrorCobro] = useState<string | null>(null);

  const { triggerSuccess, triggerLight, triggerError } = useHaptics();
  const { mostrar } = useToast();

  const cargarDatos = async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const [listaPedidos, estadoCaja] = await Promise.all([
        cobroService.obtenerPedidosPendientes(),
        cajaService.obtenerEstadoActual().catch(() => null),
      ]);
      setPedidos(listaPedidos || []);
      setCajaActual(estadoCaja);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar las cuentas pendientes de cobro';
      setErrorCarga(msg);
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const total = pedidoSeleccionado?.total || 0;
  const numRecibido = parseFloat(montoRecibido) || 0;
  const vuelto = metodoPago === 'Efectivo' ? Math.max(0, numRecibido - total) : 0;
  const saldoFaltante = metodoPago === 'Efectivo' ? Math.max(0, total - numRecibido) : 0;

  const cajaCerrada = cajaActual && cajaActual.estado !== 'abierta';

  const handleAbrirCobro = (p: PedidoPendienteCobro) => {
    triggerLight();
    setPedidoSeleccionado(p);
    setMontoRecibido(p.total.toString());
    setMetodoPago('Efectivo');
    setErrorCobro(null);
    setMostrarConfirmacion(false);
  };

  const handleSolicitarConfirmacion = () => {
    if (!pedidoSeleccionado) return;
    if (metodoPago === 'Efectivo' && numRecibido < total) {
      triggerError();
      setErrorCobro('El monto recibido en efectivo no puede ser menor al total.');
      return;
    }
    setErrorCobro(null);
    triggerLight();
    setMostrarConfirmacion(true);
  };

  const handleEjecutarCobro = async () => {
    if (!pedidoSeleccionado) return;

    setProcesando(true);
    setErrorCobro(null);

    const solicitudId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-cobro-${Date.now()}`;

    try {
      const res = await cobroService.procesarCobro({
        solicitudId,
        pedidoId: pedidoSeleccionado.pedidoId,
        totalMostrado: total,
        metodo: metodoPago,
        montoRecibido: metodoPago === 'Efectivo' ? numRecibido : total,
        tipoComprobante: 'Ticket',
      });

      triggerSuccess();
      const msg = res.mensaje || `Cobro de ${formatCurrency(total)} registrado exitosamente.`;
      mostrar({
        tipo: 'exito',
        mensaje: msg,
      });
      setMostrarConfirmacion(false);
      setPedidoSeleccionado(null);
      cargarDatos();
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'No se pudo procesar el cobro.';
      setErrorCobro(msg);
      setMostrarConfirmacion(false);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {/* 1. Encabezado */}
      <PageHeader
        title="Caja y Cobro Rápido"
        subtitle={pluralizar(pedidos.length, 'cuenta por cobrar', 'cuentas por cobrar')}
        icon={<Receipt className="w-5 h-5 text-white" aria-hidden="true" />}
        onRefresh={cargarDatos}
        isRefreshing={cargando}
      />

      {cajaCerrada && (
        <div className="m-4 p-4 rounded-2xl bg-danger-bg border border-danger-border text-danger flex items-center gap-3">
          <Lock className="w-5 h-5 shrink-0" aria-hidden="true" />
          <p className="text-xs font-bold leading-relaxed">
            No se puede registrar cobros porque la caja está cerrada. Un cajero debe realizar la apertura de caja.
          </p>
        </div>
      )}

      {errorCarga && (
        <div className="p-4">
          <ErrorState
            mensaje={errorCarga}
            onRetry={cargarDatos}
          />
        </div>
      )}

      {/* 2. Lista de Cuentas Pendientes */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {cargando && pedidos.length === 0 && (
          <SkeletonList count={4} />
        )}

        {!errorCarga && !cargando && pedidos.length === 0 && (
          <EmptyState
            icon={Receipt}
            titulo="Sin pedidos pendientes"
            subtitulo="No hay pedidos pendientes de cobro."
          />
        )}

        {pedidos.map((p) => (
          <Card
            key={p.pedidoId}
            accent="warning"
            className="flex items-center justify-between shadow-xs select-none"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-ink">{p.mesaNombre}</h3>
                <StatusBadge estado="Pendiente" />
              </div>
              <p className="text-xs text-ink-muted mt-1">
                {pluralizar(p.cantidadLineas, 'plato', 'platos')} · Mozo: {p.mozoNombre}
              </p>
              <p className="text-lg font-black text-accent mt-1 tabular-nums">{formatCurrency(p.total)}</p>
            </div>

            <Button
              size="md"
              disabled={Boolean(cajaCerrada)}
              onClick={() => handleAbrirCobro(p)}
              className="px-5 shrink-0"
            >
              Cobrar
            </Button>
          </Card>
        ))}
      </div>

      {/* Bottom Sheet de Cobro Táctil */}
      <BottomSheet
        isOpen={Boolean(pedidoSeleccionado && !mostrarConfirmacion)}
        onClose={() => setPedidoSeleccionado(null)}
        title={pedidoSeleccionado ? `Cobrar ${pedidoSeleccionado.mesaNombre}` : ''}
      >
        {pedidoSeleccionado && (
          <div className="space-y-4">
            {errorCobro && (
              <div className="p-3 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorCobro}</span>
              </div>
            )}

            {/* Monto a Cobrar */}
            <div className="p-3.5 rounded-2xl bg-canvas border border-line flex justify-between items-center">
              <div>
                <p className="text-xs text-ink-muted">Total de la Cuenta</p>
                <p className="text-2xl font-black text-accent tabular-nums">{formatCurrency(total)}</p>
              </div>

              {/* Selector de comprobante: móvil solo emite Ticket */}
              <div className="text-right">
                <span className="text-xs font-bold text-ink bg-surface border border-line px-3 py-1.5 rounded-xl block">
                  Ticket de Venta
                </span>
                <span className="text-xs text-ink-muted mt-1 block">
                  Boleta / Factura: Disponible en la versión web
                </span>
              </div>
            </div>

            {/* Selector de Método de Pago */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Efectivo' as const, label: 'Efectivo', icon: Banknote },
                { id: 'Yape' as const, label: 'Yape', icon: Smartphone },
              ].map((m) => {
                const Icon = m.icon;
                const activo = metodoPago === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      triggerLight();
                      setMetodoPago(m.id);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[50px] ${
                      activo
                        ? 'bg-primary text-white border-primary shadow-xs font-bold'
                        : 'bg-canvas text-ink-muted border-line hover:text-ink font-semibold'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sección de Efectivo con Numpad táctil y cálculo de vuelto */}
            {metodoPago === 'Efectivo' && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-canvas border border-line p-2 rounded-xl">
                    <span className="text-xs text-ink-muted block">Monto Recibido</span>
                    <span className="text-lg font-black text-ink tabular-nums">
                      {formatCurrency(parseFloat(montoRecibido) || 0)}
                    </span>
                  </div>

                  <div
                    className={`border p-2 rounded-xl ${
                      saldoFaltante > 0
                        ? 'bg-danger-bg border-danger-border text-danger'
                        : 'bg-success-bg border-success-border text-success'
                    }`}
                  >
                    <span className="text-xs block font-semibold">
                      {saldoFaltante > 0 ? 'Falta Pagar' : 'Vuelto'}
                    </span>
                    <span className="text-lg font-black tabular-nums">
                      {formatCurrency(saldoFaltante > 0 ? saldoFaltante : vuelto)}
                    </span>
                  </div>
                </div>

                <Numpad
                  value={montoRecibido}
                  onChange={(val) => setMontoRecibido(val)}
                />
              </div>
            )}

            {/* Botón para solicitar confirmación */}
            <Button
              fullWidth
              size="lg"
              disabled={metodoPago === 'Efectivo' && saldoFaltante > 0}
              onClick={handleSolicitarConfirmacion}
              className="flex items-center justify-center gap-2 mt-2"
            >
              <Check className="w-5 h-5" />
              <span>Continuar al Cobro ({formatCurrency(total)})</span>
            </Button>
          </div>
        )}
      </BottomSheet>

      {/* Confirmación Definitiva de Cobro */}
      <ConfirmSheet
        isOpen={Boolean(mostrarConfirmacion && pedidoSeleccionado)}
        titulo="Confirmar Cobro"
        mensaje={`¿Desea registrar el cobro de ${formatCurrency(total)} mediante ${metodoPago} para ${pedidoSeleccionado?.mesaNombre}?${
          metodoPago === 'Efectivo' ? ` Vuelto a entregar: ${formatCurrency(vuelto)}.` : ''
        } Esta operación no se puede deshacer.`}
        etiquetaConfirmar="Confirmar Cobro"
        cargando={procesando}
        onConfirmar={handleEjecutarCobro}
        onCancelar={() => setMostrarConfirmacion(false)}
      />
    </div>
  );
};
