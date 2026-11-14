import React, { useState } from 'react';
import { Ban, AlertCircle } from 'lucide-react';
import type { DetallePedidoCompletoDto, PedidoItemDto } from '../../types/pedido';
import { pedidoService } from '../../services/pedidoService';
import { BottomSheet } from '../ui/BottomSheet';
import { ConfirmSheet } from '../ui/ConfirmSheet';
import { Button } from '../ui/Button';
import { useHaptics } from '../../hooks/useHaptics';
import { useToast } from '../../context/ToastContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export interface AnularPedidoSheetProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: DetallePedidoCompletoDto | PedidoItemDto | null;
  onAnulacionExitosa: () => void;
}

const MOTIVOS_PREDEFINIDOS = [
  'Cliente se retiró del local',
  'Error involuntario al digitar comanda',
  'Platos solicitados agotados en cocina',
  'Cambio total de orden por el cliente',
];

export const AnularPedidoSheet: React.FC<AnularPedidoSheetProps> = ({
  isOpen,
  onClose,
  pedido,
  onAnulacionExitosa,
}) => {
  const [motivo, setMotivo] = useState<string>('');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [mostrarConfirmar, setMostrarConfirmar] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();
  const { mostrar } = useToast();
  const { sinConexion } = useNetworkStatus();

  if (!isOpen || !pedido) return null;

  const handleValidarYContinuar = () => {
    if (sinConexion) {
      triggerError();
      setErrorValidacion('Sin conexión a internet. No se puede anular pedidos.');
      return;
    }
    const texto = motivo.trim();
    if (texto.length < 5 || texto.length > 100) {
      triggerError();
      setErrorValidacion('Indique el motivo de la anulación (entre 5 y 100 caracteres).');
      return;
    }
    setErrorValidacion(null);
    triggerLight();
    setMostrarConfirmar(true);
  };

  const handleEjecutarAnulacion = async () => {
    setProcesando(true);
    try {
      const res = await pedidoService.anularPedido(pedido.id, {
        solicitudId: `sol-anular-${Date.now()}`,
        motivo: motivo.trim(),
      });

      triggerSuccess();
      mostrar({
        tipo: 'exito',
        mensaje: res.message || `Pedido N.º ${pedido.numero} anulado.`,
      });
      setMostrarConfirmar(false);
      onClose();
      onAnulacionExitosa();
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'No se pudo anular el pedido.';
      mostrar({
        tipo: 'error',
        mensaje: msg,
      });
      setMostrarConfirmar(false);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <BottomSheet
        isOpen={isOpen && !mostrarConfirmar}
        onClose={onClose}
        title={`Anular Pedido #${pedido.numero}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-ink-muted leading-relaxed">
            Especifique el motivo por el cual se cancelará la orden. Esta acción cancelará las comandas en cocina y liberará la mesa.
          </p>

          {/* Accesos rápidos de motivo */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
              Motivos frecuentes:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {MOTIVOS_PREDEFINIDOS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    triggerLight();
                    setMotivo(m);
                    setErrorValidacion(null);
                  }}
                  className="bg-canvas hover:bg-line/40 border border-line rounded-xl px-2.5 py-1.5 text-xs text-ink font-medium text-left active:scale-95 transition-all"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Campo de texto de motivo con contador */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="motivo-anulacion" className="font-bold text-ink-muted">
                Motivo detallado:
              </label>
              <span className={`font-mono ${motivo.trim().length < 5 || motivo.trim().length > 100 ? 'text-danger' : 'text-ink-muted'}`}>
                {motivo.trim().length}/100
              </span>
            </div>

            <textarea
              id="motivo-anulacion"
              rows={3}
              maxLength={100}
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (errorValidacion) setErrorValidacion(null);
              }}
              placeholder="Describa el motivo de anulación (mínimo 5 caracteres)..."
              className="w-full bg-canvas border border-line rounded-xl p-3 text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-danger resize-none"
            />

            {errorValidacion && (
              <p className="text-xs font-bold text-danger flex items-center gap-1.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{errorValidacion}</span>
              </p>
            )}
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              size="md"
              variant="outline"
              onClick={onClose}
              className="flex-1 min-h-[48px]"
            >
              <span>Volver</span>
            </Button>

            <Button
              size="md"
              variant="danger"
              disabled={motivo.trim().length < 5 || sinConexion}
              title={sinConexion ? 'Sin conexión a internet' : undefined}
              onClick={handleValidarYContinuar}
              className="flex-1 flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Ban className="w-4 h-4" />
              <span>{sinConexion ? 'Sin conexión' : 'Continuar Anulación'}</span>
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Confirmación Definitiva */}
      <ConfirmSheet
        isOpen={mostrarConfirmar}
        onCancelar={() => setMostrarConfirmar(false)}
        titulo="Confirmar Anulación"
        mensaje={`¿Está seguro de anular el pedido N.º ${pedido.numero}? Esta acción cancelará las comandas en cocina y es irreversible.`}
        etiquetaConfirmar="Sí, anular pedido"
        etiquetaCancelar="Volver"
        tono="peligro"
        onConfirmar={handleEjecutarAnulacion}
        cargando={procesando}
      />
    </>
  );
};
