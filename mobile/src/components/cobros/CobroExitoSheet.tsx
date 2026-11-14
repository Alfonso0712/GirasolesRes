import React, { useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { MetodoPago, TipoComprobante } from '../../types/cobro';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { ComprobanteAcciones } from './ComprobanteAcciones';
import { formatCurrency } from '../../utils/format';
import { useHaptics } from '../../hooks/useHaptics';

export interface DatosCobroExitoso {
  ventaId: string;
  numeroComprobante: string;
  tipoComprobante: TipoComprobante;
  destino: string;
  metodoPago: MetodoPago;
  total: number;
  montoRecibido?: number;
  vuelto?: number;
  fechaHora: string;
}

export interface CobroExitoSheetProps {
  isOpen: boolean;
  datos: DatosCobroExitoso | null;
  onListo: () => void;
}

export const CobroExitoSheet: React.FC<CobroExitoSheetProps> = ({
  isOpen,
  datos,
  onListo,
}) => {
  const { triggerSuccess } = useHaptics();
  const listoBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isOpen && datos) {
      triggerSuccess();
      listoBtnRef.current?.focus();
      const timer = setTimeout(() => {
        listoBtnRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, datos, triggerSuccess]);

  if (!isOpen || !datos) return null;

  const esEfectivo = datos.metodoPago === 'Efectivo';
  const montoRecibido = datos.montoRecibido ?? datos.total;
  const vuelto = datos.vuelto ?? Math.max(0, montoRecibido - datos.total);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onListo}
      closeOnBackdrop={false}
      title="Cobro registrado"
    >
      <div className="space-y-4">
        {/* Encabezado de confirmación con ícono y número de comprobante */}
        <div className="bg-canvas border border-line rounded-2xl p-4 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-success-bg text-success border border-success-border flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
          </div>

          <p className="text-sm font-extrabold text-success">Cobro registrado</p>

          <p
            aria-label={`Comprobante número ${datos.numeroComprobante}`}
            className="text-xl font-black text-ink tabular-nums tracking-tight"
          >
            {datos.numeroComprobante}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs font-bold text-ink-muted">
            <span className="px-2.5 py-1 rounded-lg bg-surface border border-line text-ink">
              {datos.tipoComprobante}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-surface border border-line text-ink">
              {datos.destino}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-surface border border-line text-ink">
              {datos.metodoPago}
            </span>
          </div>
        </div>

        {/* Resumen de montos y vuelto */}
        <div className="bg-canvas border border-line rounded-2xl p-3.5 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-ink-muted">Total cobrado</span>
            <span className="text-lg font-black text-accent tabular-nums">
              {formatCurrency(datos.total)}
            </span>
          </div>

          {esEfectivo && (
            <div className="pt-2 border-t border-line space-y-1.5">
              <div className="flex justify-between items-center text-ink-muted">
                <span>Recibido {formatCurrency(montoRecibido)}</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(montoRecibido)}
                </span>
              </div>
              <div className="flex justify-between items-center rounded-xl bg-success-bg border border-success-border px-3 py-2 text-success font-extrabold">
                <span>Vuelto {formatCurrency(vuelto)}</span>
                <span className="text-base font-black tabular-nums">
                  {formatCurrency(vuelto)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Acciones sobre el comprobante (Imprimir, Guardar PDF, Compartir PDF, WhatsApp) */}
        <ComprobanteAcciones
          venta={{
            ventaId: datos.ventaId,
            numero: datos.numeroComprobante,
            total: datos.total,
            fecha: datos.fechaHora,
            esCopia: false,
          }}
        />

        {/* Botón primario Listo de ancho completo */}
        <div className="pt-1">
          <Button
            ref={listoBtnRef}
            type="button"
            fullWidth
            size="lg"
            variant="primary"
            onClick={onListo}
            aria-label="Listo, cerrar comprobante y volver a cobros pendientes"
            className="min-h-[48px]"
          >
            <span>Listo</span>
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
