import React, { useState, useEffect } from 'react';
import { Clock, Plus, Ban } from 'lucide-react';
import type { DetallePedidoCompletoDto } from '../../types/pedido';
import type { RolUsuario } from '../../types/auth';
import { pedidoService } from '../../services/pedidoService';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { SkeletonList } from '../ui/Skeleton';
import { ErrorState } from '../ui/ErrorState';
import { formatCurrency, pluralizar } from '../../utils/format';
import { puede } from '../../config/permisos';
import { useHaptics } from '../../hooks/useHaptics';

export interface DetallePedidoSheetProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: string | null;
  rol: RolUsuario;
  usuarioIdActual?: string;
  onAgregarPlatos?: (pedido: DetallePedidoCompletoDto) => void;
  onSolicitarAnular?: (pedido: DetallePedidoCompletoDto) => void;
}

export const DetallePedidoSheet: React.FC<DetallePedidoSheetProps> = ({
  isOpen,
  onClose,
  pedidoId,
  rol,
  usuarioIdActual,
  onAgregarPlatos,
  onSolicitarAnular,
}) => {
  const [pedido, setPedido] = useState<DetallePedidoCompletoDto | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { triggerLight } = useHaptics();
  const esMozo = rol === 'Mozo';
  const esAdmin = rol === 'Administrador';

  useEffect(() => {
    if (isOpen && pedidoId) {
      setCargando(true);
      setError(null);
      pedidoService.obtenerDetalleCompleto(pedidoId)
        .then((data) => setPedido(data))
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Error al consultar el detalle del pedido';
          setError(msg);
          setPedido(null);
        })
        .finally(() => setCargando(false));
    } else {
      setPedido(null);
      setError(null);
    }
  }, [isOpen, pedidoId]);

  if (!isOpen) return null;

  const noModificable = pedido?.estado === 'Pagado' || pedido?.estado === 'Anulado';
  // RN-65: Mozo/Cajero solo pueden anular sus propios pedidos; Administrador puede anular cualquiera
  const esCreador = usuarioIdActual && pedido?.usuarioId ? usuarioIdActual === pedido.usuarioId : true;
  const puedeAnular = puede(rol, 'pedidos.anular') && !noModificable && (esAdmin || esCreador);
  const puedeAmpliar = (rol === 'Mozo' || rol === 'Administrador') && !noModificable;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={pedido ? `Pedido #${pedido.numero}` : 'Detalle del Pedido'}
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {cargando && <SkeletonList count={4} />}

        {error && (
          <ErrorState
            mensaje={error}
            onRetry={() => {
              if (pedidoId) {
                setCargando(true);
                pedidoService.obtenerDetalleCompleto(pedidoId)
                  .then((data) => setPedido(data))
                  .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error'))
                  .finally(() => setCargando(false));
              }
            }}
          />
        )}

        {pedido && (
          <>
            {/* 1. Cabecera del Detalle */}
            <div className="bg-canvas border border-line rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-ink">
                    {pedido.tipo === 'Mesa' ? `Mesa: ${pedido.mesa || 'Salón'}` : `Para Llevar: ${pedido.referencia || 'Cliente'}`}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted mt-0.5">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{pedido.hora || 'En curso'} · Mozo: {pedido.registradoPor}</span>
                  </div>
                </div>
                <StatusBadge estado={pedido.estado} />
              </div>

              {/* Total solo visible si no es Mozo (RV-154) */}
              {!esMozo && (
                <div className="border-t border-line pt-2 flex justify-between items-center text-xs">
                  <span className="font-bold text-ink-muted">Total del Pedido:</span>
                  <span className="text-base font-black text-accent tabular-nums">
                    {formatCurrency(pedido.total)}
                  </span>
                </div>
              )}
            </div>

            {/* Motivo de anulación si fue anulado */}
            {pedido.estado === 'Anulado' && pedido.motivoAnulacion && (
              <div className="p-3 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs space-y-1">
                <span className="font-bold uppercase tracking-wider block">Motivo de Anulación:</span>
                <p>{pedido.motivoAnulacion}</p>
              </div>
            )}

            {/* 2. Lista de Líneas / Platos */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                {pluralizar(pedido.lineas.length, 'Plato en Comanda', 'Platos en Comanda')}
              </h4>

              <div className="divide-y divide-line bg-surface border border-line rounded-2xl p-3">
                {pedido.lineas.map((linea, idx) => (
                  <div key={linea.detalleId || idx} className="py-2.5 first:pt-1 last:pb-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-xs font-black text-accent bg-primary/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          {linea.cantidad}x
                        </span>
                        <div>
                          <p className="text-xs font-bold text-ink leading-tight">
                            {linea.nombre}
                          </p>
                          {linea.elecciones && linea.elecciones.length > 0 && (
                            <p className="text-xs text-ink-muted mt-0.5 leading-snug">
                              {linea.elecciones.map((e) => e.productoNombre).join(' + ')}
                            </p>
                          )}
                          {linea.observacion && (
                            <p className="text-xs font-bold text-danger bg-danger-bg/50 border border-danger-border/30 px-2 py-0.5 rounded-md mt-1 inline-block">
                              Nota: {linea.observacion}
                            </p>
                          )}
                        </div>
                      </div>

                      {!esMozo && (
                        <span className="text-xs font-black text-accent tabular-nums shrink-0">
                          {formatCurrency(linea.subtotal)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Acciones Disponibles */}
            <div className="space-y-2 pt-2">
              {puedeAmpliar && onAgregarPlatos && (
                <Button
                  fullWidth
                  size="md"
                  onClick={() => {
                    triggerLight();
                    onClose();
                    onAgregarPlatos(pedido);
                  }}
                  className="flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Más Platos</span>
                </Button>
              )}

              {puedeAnular && onSolicitarAnular && (
                <Button
                  fullWidth
                  size="md"
                  variant="danger-outline"
                  onClick={() => {
                    triggerLight();
                    onSolicitarAnular(pedido);
                  }}
                  className="flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Ban className="w-4 h-4" />
                  <span>Anular Pedido</span>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  );
};
