import React, { useState, useEffect } from 'react';
import {
  Receipt,
  CheckCircle,
  RefreshCw,
  CreditCard,
  Banknote,
  Smartphone,
  Check,
  AlertCircle
} from 'lucide-react';
import { cobroService } from '../../services/cobroService';
import type { PedidoPendienteCobro, MetodoPago } from '../../types/cobro';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Numpad } from '../ui/Numpad';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { useHaptics } from '../../hooks/useHaptics';

export const CobroView: React.FC = () => {
  const [pedidos, setPedidos] = useState<PedidoPendienteCobro[]>([]);
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoPendienteCobro | null>(null);

  // Estado del cobro
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo');
  const [tipoComprobante, setTipoComprobante] = useState<'Boleta' | 'Factura'>('Boleta');
  const [montoRecibido, setMontoRecibido] = useState<string>('');
  const [procesando, setProcesando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [errorCobro, setErrorCobro] = useState<string | null>(null);

  const { triggerSuccess, triggerLight, triggerError } = useHaptics();

  const cargarPedidos = async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const data = await cobroService.obtenerPedidosPendientes();
      setPedidos(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar las cuentas pendientes de cobro';
      setErrorCarga(msg);
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const total = pedidoSeleccionado?.total || 0;
  const numRecibido = parseFloat(montoRecibido) || 0;
  const vuelto = metodoPago === 'Efectivo' ? Math.max(0, numRecibido - total) : 0;
  const saldoFaltante = metodoPago === 'Efectivo' ? Math.max(0, total - numRecibido) : 0;

  const handleProcesarCobro = async () => {
    if (!pedidoSeleccionado) return;
    if (metodoPago === 'Efectivo' && numRecibido < total) {
      triggerError();
      setErrorCobro('El monto recibido en efectivo no puede ser menor al total.');
      return;
    }

    setProcesando(true);
    setErrorCobro(null);
    try {
      await cobroService.procesarCobro({
        pedidoId: pedidoSeleccionado.pedidoId,
        metodoPago,
        tipoComprobante,
        montoRecibido: metodoPago === 'Efectivo' ? numRecibido : total,
      });
      triggerSuccess();
      setMensajeExito(`Cobro de S/ ${total.toFixed(2)} registrado para ${pedidoSeleccionado.mesaNombre}`);
      setPedidoSeleccionado(null);
      cargarPedidos();
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'Error al procesar el cobro';
      setErrorCobro(msg);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden">
      {/* Header */}
      <div className="bg-surface border-b border-line px-5 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-ink leading-tight">Caja y Cobro Rápido</h2>
            <p className="text-xs text-ink-muted">
              {pedidos.length} {pedidos.length === 1 ? 'cuenta por cobrar' : 'cuentas por cobrar'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={cargarPedidos}
          disabled={cargando}
          aria-label="Actualizar cobros"
          className="w-10 h-10 rounded-xl bg-canvas border border-line text-ink flex items-center justify-center active:scale-95 transition-transform"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-primary' : ''}`} />
        </button>
      </div>

      {mensajeExito && (
        <div className="m-4 p-4 rounded-2xl bg-success-bg border border-success-border text-success flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold">{mensajeExito}</span>
          </div>
          <button
            type="button"
            onClick={() => setMensajeExito(null)}
            className="text-xs underline font-bold"
          >
            Aceptar
          </button>
        </div>
      )}

      {errorCarga && (
        <div className="p-4">
          <ErrorState
            mensaje={errorCarga}
            onRetry={cargarPedidos}
          />
        </div>
      )}

      {/* Lista de Cuentas Pendientes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!errorCarga && !cargando && pedidos.length === 0 && (
          <EmptyState
            icon={Receipt}
            titulo="Sin pedidos pendientes"
            subtitulo="No hay pedidos pendientes de cobro."
          />
        )}

        {pedidos.map((p) => (
          <div
            key={p.pedidoId}
            className="bg-surface border border-line rounded-2xl p-4 flex items-center justify-between shadow-xs select-none"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-ink">{p.mesaNombre}</h3>
                <span className="text-[11px] text-ink-muted">
                  ({p.cantidadLineas} {p.cantidadLineas === 1 ? 'plato' : 'platos'})
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">Atendido por: {p.mozoNombre}</p>
              <p className="text-lg font-black text-primary mt-1">S/ {p.total.toFixed(2)}</p>
            </div>

            <Button
              size="md"
              onClick={() => {
                triggerLight();
                setPedidoSeleccionado(p);
                setMontoRecibido(p.total.toString());
                setErrorCobro(null);
              }}
              className="px-5 shrink-0"
            >
              Cobrar
            </Button>
          </div>
        ))}
      </div>

      {/* Bottom Sheet de Cobro Táctil */}
      <BottomSheet
        isOpen={Boolean(pedidoSeleccionado)}
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
                <p className="text-2xl font-black text-primary">S/ {total.toFixed(2)}</p>
              </div>
              {/* Selector de comprobante */}
              <div className="flex gap-1 bg-surface border border-line p-1 rounded-xl">
                {(['Boleta', 'Factura'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { triggerLight(); setTipoComprobante(t); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      tipoComprobante === t ? 'bg-primary text-white shadow-xs' : 'text-ink-muted'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Método de Pago */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'Efectivo' as const, label: 'Efectivo', icon: Banknote },
                { id: 'Yape' as const, label: 'Yape', icon: Smartphone },
                { id: 'Plin' as const, label: 'Plin', icon: Smartphone },
                { id: 'Tarjeta' as const, label: 'Tarjeta', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const activo = metodoPago === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { triggerLight(); setMetodoPago(m.id); }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 active:scale-95 transition-all min-h-[58px] ${
                      activo
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-canvas text-ink-muted border-line hover:text-ink'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-bold">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sección de Efectivo con Numpad táctil y cálculo de vuelto */}
            {metodoPago === 'Efectivo' && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-canvas border border-line p-2 rounded-xl">
                    <span className="text-[11px] text-ink-muted block">Monto Recibido</span>
                    <span className="text-lg font-black text-ink">
                      S/ {montoRecibido ? parseFloat(montoRecibido).toFixed(2) : '0.00'}
                    </span>
                  </div>

                  <div
                    className={`border p-2 rounded-xl ${
                      saldoFaltante > 0
                        ? 'bg-danger-bg border-danger-border text-danger'
                        : 'bg-success-bg border-success-border text-success'
                    }`}
                  >
                    <span className="text-[11px] block">
                      {saldoFaltante > 0 ? 'Falta Pagar' : 'Vuelto'}
                    </span>
                    <span className="text-lg font-black">
                      S/ {saldoFaltante > 0 ? saldoFaltante.toFixed(2) : vuelto.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Numpad
                  value={montoRecibido}
                  onChange={(val) => setMontoRecibido(val)}
                />
              </div>
            )}

            {/* Botón de Confirmación */}
            <Button
              fullWidth
              size="lg"
              isLoading={procesando}
              disabled={metodoPago === 'Efectivo' && saldoFaltante > 0}
              onClick={handleProcesarCobro}
              className="flex items-center justify-center gap-2 mt-2"
            >
              <Check className="w-5 h-5" />
              <span>Emitir {tipoComprobante} (S/ {total.toFixed(2)})</span>
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};
