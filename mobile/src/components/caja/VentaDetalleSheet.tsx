import React, { useState } from 'react';
import {
  AlertTriangle,
  User,
  Clock,
  Ban,
  Building2,
  MapPin,
} from 'lucide-react';
import type { VentaDetalle } from '../../types/venta';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { ConfirmSheet } from '../ui/ConfirmSheet';
import { formatCurrency } from '../../utils/format';
import { useHaptics } from '../../hooks/useHaptics';

export interface VentaDetalleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  venta: VentaDetalle | null;
  cargando: boolean;
  esAdmin?: boolean;
  onAnularVenta?: (ventaId: string, motivo: string, destinoPedido: string) => Promise<void>;
  anulando?: boolean;
}

const MOTIVOS_RAPIDOS = [
  'Error de digitación',
  'Cambio de comprobante',
  'Cliente canceló consumo',
  'Cobro duplicado',
];

export const VentaDetalleSheet: React.FC<VentaDetalleSheetProps> = ({
  isOpen,
  onClose,
  venta,
  cargando,
  esAdmin = false,
  onAnularVenta,
  anulando = false,
}) => {
  const [modalAnular, setModalAnular] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [destinoPedido, setDestinoPedido] = useState<'porCobrar' | 'anular'>('porCobrar');
  const [confirmarPeligro, setConfirmarPeligro] = useState(false);
  const [errorMotivo, setErrorMotivo] = useState<string | null>(null);

  const { triggerLight, triggerError } = useHaptics();

  if (!isOpen) return null;

  const esAnulada = venta?.estado === 'Anulada' || venta?.estado === 'anulada';
  const puedeAnular = esAdmin && !esAnulada && !venta?.cajaCerrada && Boolean(onAnularVenta);

  const handleAbrirAnulacion = () => {
    triggerLight();
    setMotivo('');
    setDestinoPedido('porCobrar');
    setErrorMotivo(null);
    setModalAnular(true);
  };

  const handleValidarAnulacion = () => {
    const trimmed = motivo.trim();
    if (trimmed.length < 5 || trimmed.length > 100) {
      triggerError();
      setErrorMotivo('El motivo de anulación debe tener entre 5 y 100 caracteres.');
      return;
    }
    setErrorMotivo(null);
    triggerLight();
    setConfirmarPeligro(true);
  };

  const handleEjecutarAnulacion = async () => {
    if (!venta || !onAnularVenta) return;
    try {
      await onAnularVenta(venta.ventaId, motivo.trim(), destinoPedido);
      setConfirmarPeligro(false);
      setModalAnular(false);
      onClose();
    } catch {
      // Error handled by parent toast
      setConfirmarPeligro(false);
    }
  };

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title={venta ? `Comprobante ${venta.comprobante}` : 'Detalle de Venta'}
      >
        {cargando || !venta ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-ink-muted">
            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold">Cargando detalles del comprobante...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cabecera del comprobante */}
            <div className="bg-canvas border border-line rounded-2xl p-3.5 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-3xs font-bold uppercase tracking-wider text-ink-muted block">
                    {venta.tipoComprobante || 'Comprobante Electrónico'}
                  </span>
                  <h3 className="text-lg font-black text-ink">{venta.comprobante}</h3>
                  <span className="text-xs text-ink-muted">Pedido #{venta.pedidoNumero} ({venta.tipo})</span>
                </div>
                <StatusBadge estado={venta.estado} />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line text-xs text-ink-muted">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-ink-muted" />
                  <span>{venta.fechaHoraFormateada}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 shrink-0 text-ink-muted" />
                  <span>Cajero: {venta.cajero}</span>
                </div>
              </div>

              {/* Información del Receptor si existe */}
              {(venta.numDocReceptor || venta.razonSocialReceptor) && (
                <div className="pt-2 border-t border-line text-xs space-y-0.5 text-ink-muted">
                  <div className="flex items-center gap-1.5 font-bold text-ink">
                    <Building2 className="w-3.5 h-3.5 shrink-0 text-accent" />
                    <span>
                      {venta.tipoDocReceptor || 'DOC'}: {venta.numDocReceptor}
                    </span>
                  </div>
                  {venta.razonSocialReceptor && (
                    <p className="text-ink pl-5">{venta.razonSocialReceptor}</p>
                  )}
                  {venta.direccionReceptor && (
                    <p className="text-3xs text-ink-muted pl-5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{venta.direccionReceptor}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Banner de Anulación si fue anulada */}
            {esAnulada && (
              <div className="p-3 bg-danger-bg border border-danger/30 rounded-xl space-y-1 text-xs text-danger">
                <div className="flex items-center gap-2 font-bold">
                  <Ban className="w-4 h-4 shrink-0" />
                  <span>Comprobante Anulado Fiscalmente</span>
                </div>
                {venta.motivoAnulacion && (
                  <p className="text-3xs">
                    <span className="font-bold">Motivo:</span> {venta.motivoAnulacion}
                  </p>
                )}
                <div className="text-3xs text-danger/80 flex justify-between pt-0.5">
                  <span>Por: {venta.usuarioAnulacion || 'Administrador'}</span>
                  {venta.fechaHoraAnulacionFormateada && (
                    <span>{venta.fechaHoraAnulacionFormateada}</span>
                  )}
                </div>
              </div>
            )}

            {/* Líneas de consumo */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
                Detalle del Consumo
              </span>

              <div className="divide-y divide-line bg-canvas rounded-xl border border-line overflow-hidden">
                {venta.lineas.map((linea, idx) => (
                  <div key={idx} className="p-2.5 text-xs flex justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <p className="font-bold text-ink">
                        {linea.cantidad}x {linea.productoNombre}
                      </p>
                      {linea.observacion && (
                        <p className="text-3xs text-ink-muted italic">«{linea.observacion}»</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-ink tabular-nums">
                        {formatCurrency(linea.subtotal)}
                      </span>
                      <span className="text-3xs text-ink-muted block">
                        c/u {formatCurrency(linea.precioUnitario)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales y Liquidación */}
            <div className="bg-canvas border border-line rounded-2xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-ink-muted">
                <span>Op. Gravada:</span>
                <span className="tabular-nums font-semibold">
                  {formatCurrency(venta.opGravada || (venta.total / 1.18))}
                </span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>IGV (18%):</span>
                <span className="tabular-nums font-semibold">
                  {formatCurrency(venta.igv || (venta.total - (venta.total / 1.18)))}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-ink border-t border-line pt-2">
                <span>Total Comprobante:</span>
                <span className="text-accent tabular-nums">{formatCurrency(venta.total)}</span>
              </div>

              <div className="flex justify-between text-3xs text-ink-muted pt-1 border-t border-line">
                <span>Método: {venta.metodo}</span>
                {venta.vuelto !== null && venta.vuelto !== undefined && venta.vuelto > 0 && (
                  <span>Vuelto: {formatCurrency(venta.vuelto)}</span>
                )}
                {venta.yapeReferencia && (
                  <span>Ref: {venta.yapeReferencia}</span>
                )}
              </div>
            </div>

            {/* Aviso informativo de PDF */}
            <p className="text-3xs text-ink-muted text-center">
              La descarga del comprobante en formato PDF con firma y QR se encuentra disponible en la versión web.
            </p>

            {/* Acción de anulación exclusiva para Administrador */}
            {puedeAnular && (
              <Button
                fullWidth
                size="lg"
                variant="danger"
                onClick={handleAbrirAnulacion}
                className="flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Ban className="w-5 h-5" />
                <span>Anular Venta / Comprobante</span>
              </Button>
            )}

            {venta.cajaCerrada && !esAnulada && (
              <p className="text-3xs text-ink-muted text-center italic">
                La caja de este turno ya fue cerrada. El comprobante no se puede anular.
              </p>
            )}
          </div>
        )}
      </BottomSheet>

      {/* Modal de Anulación de Venta (Administrador) */}
      <BottomSheet
        isOpen={modalAnular}
        onClose={() => setModalAnular(false)}
        title="Anulación de Venta"
      >
        {venta && (
          <div className="space-y-4">
            <div className="p-3 bg-danger-bg border border-danger/30 rounded-xl text-xs text-danger flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-danger" />
              <div>
                <p className="font-bold">Anulación de {venta.comprobante}</p>
                <p>
                  Esta operación generará un asiento fiscal de anulación y afectará el balance de caja.
                </p>
              </div>
            </div>

            {errorMotivo && (
              <p className="text-xs font-bold text-danger bg-danger-bg p-2 rounded-xl">
                {errorMotivo}
              </p>
            )}

            {/* Destino del Pedido */}
            <div>
              <span className="text-xs font-bold text-ink block mb-1.5">
                Destino del Pedido:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerLight();
                    setDestinoPedido('porCobrar');
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all min-h-[48px] ${
                    destinoPedido === 'porCobrar'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-canvas text-ink border-line'
                  }`}
                >
                  <p className="font-extrabold">Listo para cobrar</p>
                  <p className="text-3xs opacity-80 mt-0.5">El pedido regresa a cobranza</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerLight();
                    setDestinoPedido('anular');
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all min-h-[48px] ${
                    destinoPedido === 'anular'
                      ? 'bg-danger text-white border-danger shadow-xs'
                      : 'bg-canvas text-ink border-line'
                  }`}
                >
                  <p className="font-extrabold">Anular pedido</p>
                  <p className="text-3xs opacity-80 mt-0.5">Se cancela definitivamente</p>
                </button>
              </div>
            </div>

            {/* Motivo de Anulación */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="motivo-anulacion" className="text-xs font-bold text-ink">
                  Motivo de Anulación (5-100 caracteres) *
                </label>
                <span className="text-3xs text-ink-muted">
                  {motivo.length}/100
                </span>
              </div>
              <input
                id="motivo-anulacion"
                type="text"
                maxLength={100}
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  setErrorMotivo(null);
                }}
                placeholder="Indique el motivo técnico o comercial..."
                className="w-full bg-canvas border border-line rounded-xl px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-primary min-h-[44px]"
              />

              {/* Botones rápidos de motivo */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {MOTIVOS_RAPIDOS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      triggerLight();
                      setMotivo(m);
                      setErrorMotivo(null);
                    }}
                    className="text-3xs font-semibold px-2.5 py-1 rounded-lg bg-surface border border-line text-ink-muted hover:text-ink active:scale-95 transition-all min-h-[32px]"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              variant="danger"
              disabled={motivo.trim().length < 5 || motivo.trim().length > 100}
              onClick={handleValidarAnulacion}
              className="min-h-[48px]"
            >
              Continuar a Confirmación
            </Button>
          </div>
        )}
      </BottomSheet>

      {/* Confirmación Peligrosa Final */}
      <ConfirmSheet
        isOpen={confirmarPeligro}
        onCancelar={() => setConfirmarPeligro(false)}
        titulo="¿Confirmar Anulación de Comprobante?"
        mensaje={
          venta
            ? `¿Está seguro de anular el comprobante ${venta.comprobante} por ${formatCurrency(venta.total)}? Se generará un asiento de anulación fiscal y no se puede deshacer.`
            : ''
        }
        etiquetaConfirmar="Sí, Anular Definitivamente"
        etiquetaCancelar="Volver"
        tono="peligro"
        onConfirmar={handleEjecutarAnulacion}
        cargando={anulando}
      />
    </>
  );
};