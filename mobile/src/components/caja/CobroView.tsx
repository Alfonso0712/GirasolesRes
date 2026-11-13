import React, { useState } from 'react';
import {
  Receipt,
  Banknote,
  Smartphone,
  Check,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { cobroService } from '../../services/cobroService';
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

export interface CobroViewProps {
  pedidos: PedidoPendienteCobro[];
  cajaActual: CajaActualResponseDto | null;
  cargando: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onCobroExitoso?: () => void;
}

export const CobroView: React.FC<CobroViewProps> = ({
  pedidos,
  cajaActual,
  cargando,
  error,
  onRefresh,
  onCobroExitoso,
}) => {
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoPendienteCobro | null>(null);

  // Estado del cobro
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo');
  const [montoRecibido, setMontoRecibido] = useState<string>('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [errorCobro, setErrorCobro] = useState<string | null>(null);

  const { triggerSuccess, triggerLight, triggerError } = useHaptics();
  const { mostrar } = useToast();

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
      if (onCobroExitoso) {
        onCobroExitoso();
      } else {
        await onRefresh();
      }
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
        onRefresh={onRefresh}
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

      {error && (
        <div className="p-4">
          <ErrorState
            mensaje={error}
            onRetry={onRefresh}
          />
        </div>
      )}

      {/* 2. Lista de Cuentas Pendientes */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {cargando && pedidos.length === 0 && (
          <SkeletonList count={4} />
        )}

        {!error && !cargando && pedidos.length === 0 && (
          <EmptyState
            icon={Receipt}
            titulo="No hay cobros pendientes"
            subtitulo="Todas las mesas y pedidos para llevar se encuentran al día."
          />
        )}

        {pedidos.map((p) => {
          return (
            <Card
              key={p.pedidoId}
              interactive={!cajaCerrada}
              accent="none"
              onClick={!cajaCerrada ? () => handleAbrirCobro(p) : undefined}
              className="flex items-center justify-between select-none"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-ink">{p.mesaNombre}</h3>
                </div>
                <div className="text-xs text-ink-muted mt-1 space-y-0.5">
                  <p>Mozo: {p.mozoNombre}</p>
                  <p>{pluralizar(p.cantidadLineas, 'ítem', 'ítems')} en la orden</p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-1.5">
                <span className="text-xl font-black text-accent tabular-nums">
                  {formatCurrency(p.total)}
                </span>
                <StatusBadge estado="Pendiente" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* 3. Modal Táctil de Cobro Rápido */}
      <BottomSheet
        isOpen={Boolean(pedidoSeleccionado)}
        onClose={() => setPedidoSeleccionado(null)}
        title={pedidoSeleccionado ? `Cobro · ${pedidoSeleccionado.mesaNombre}` : ''}
      >
        {pedidoSeleccionado && (
          <div className="space-y-4">
            {errorCobro && (
              <div className="p-3 bg-danger-bg border border-danger-border rounded-xl text-danger text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorCobro}</span>
              </div>
            )}

            {/* Total a pagar */}
            <div className="bg-canvas border border-line rounded-2xl p-4 text-center">
              <span className="text-xs text-ink-muted block uppercase tracking-wider font-bold">
                Total de la Cuenta
              </span>
              <span className="text-3xl font-black text-accent tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>

            {/* Selector de Método de Pago */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  triggerLight();
                  setMetodoPago('Efectivo');
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold text-xs transition-colors min-h-[48px] ${
                  metodoPago === 'Efectivo'
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-canvas text-ink border-line'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerLight();
                  setMetodoPago('Yape');
                  setMontoRecibido(total.toString());
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold text-xs transition-colors min-h-[48px] ${
                  metodoPago === 'Yape'
                    ? 'bg-info text-white border-info shadow-xs'
                    : 'bg-canvas text-ink border-line'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Yape / Plin</span>
              </button>
            </div>

            {/* Flujo Efectivo con Teclado Numérico */}
            {metodoPago === 'Efectivo' ? (
              <div className="space-y-3">
                <div className="bg-canvas border border-line rounded-2xl p-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-ink-muted block">Recibido</span>
                    <span className="text-lg font-black text-ink tabular-nums">
                      {formatCurrency(numRecibido)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-ink-muted block">
                      {saldoFaltante > 0 ? 'Falta cobrar' : 'Vuelto exacto'}
                    </span>
                    <span
                      className={`text-lg font-black tabular-nums ${
                        saldoFaltante > 0 ? 'text-danger' : 'text-success'
                      }`}
                    >
                      {saldoFaltante > 0 ? formatCurrency(saldoFaltante) : formatCurrency(vuelto)}
                    </span>
                  </div>
                </div>

                {/* Accesos rápidos de efectivo */}
                <div className="flex gap-2">
                  {[total, 20, 50, 100].map((monto) => (
                    <button
                      key={monto}
                      type="button"
                      onClick={() => {
                        triggerLight();
                        setMontoRecibido(monto.toString());
                      }}
                      className="flex-1 py-1.5 bg-canvas border border-line rounded-lg text-xs font-bold text-ink active:scale-95 transition-all"
                    >
                      {monto === total ? 'Exacto' : `S/ ${monto}`}
                    </button>
                  ))}
                </div>

                <Numpad
                  value={montoRecibido}
                  onChange={(val) => setMontoRecibido(val)}
                  enterLabel="Cobrar Cuenta"
                  onEnter={handleSolicitarConfirmacion}
                />
              </div>
            ) : (
              /* Flujo Digital (Yape / Plin) */
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-info-bg/30 border border-info-border/50 rounded-2xl text-center space-y-1">
                  <Smartphone className="w-8 h-8 text-info mx-auto" />
                  <p className="text-xs font-bold text-ink">
                    Monto exacto a cobrar: {formatCurrency(total)}
                  </p>
                  <p className="text-xs text-ink-muted">
                    Verifique en el aplicativo que la transferencia o pago QR figure como completado.
                  </p>
                </div>

                <Button
                  fullWidth
                  size="lg"
                  onClick={handleSolicitarConfirmacion}
                  className="flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Confirmar Pago Digital</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      {/* 4. Confirmación Definitiva */}
      <ConfirmSheet
        isOpen={mostrarConfirmacion}
        onCancelar={() => setMostrarConfirmacion(false)}
        titulo="Confirmar Cobro y Emisión"
        mensaje={`¿Confirma el cobro de ${formatCurrency(total)} mediante ${metodoPago}? ${
          metodoPago === 'Efectivo' && vuelto > 0 ? `Vuelto a entregar: ${formatCurrency(vuelto)}.` : ''
        }`}
        etiquetaConfirmar="Sí, Procesar Cobro"
        etiquetaCancelar="Volver"
        onConfirmar={handleEjecutarCobro}
        cargando={procesando}
      />
    </div>
  );
};
