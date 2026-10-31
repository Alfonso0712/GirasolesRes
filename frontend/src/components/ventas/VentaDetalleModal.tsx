import React, { useEffect } from 'react';
import {
  ReceiptText,
  X,
  Ban,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import type { VentaDetalle } from '../../types/venta';
import {
  VentaDatosGenerales,
  VentaLineasTable,
  VentaDesgloseFiscal,
  VentaDetalleFooter
} from './detalle';


interface VentaDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  venta: VentaDetalle | null;
  loading: boolean;
  esAdmin: boolean;
  onAbrirAnular: () => void;
  onDescargarTicket: (ventaId: string, esCopia?: boolean) => Promise<void>;
  descargandoTicket: boolean;
}

export const VentaDetalleModal: React.FC<VentaDetalleModalProps> = ({
  isOpen,
  onClose,
  venta,
  loading,
  esAdmin,
  onAbrirAnular,
  onDescargarTicket,
  descargandoTicket
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const esAnulada = venta?.estado === 'Anulada';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-detalle-venta"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-surface rounded-2xl max-w-2xl w-full p-6 text-neutral-800 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-200/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
              esAnulada ? 'bg-neutral-100 text-neutral-500 border-neutral-200' : 'bg-amber-50 text-accent border-amber-200'
            }`}>
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  DETALLE DE VENTA
                </span>
                {venta && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-md border flex items-center gap-1 ${
                      esAnulada
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {esAnulada ? <Ban className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    <span>{venta.estado}</span>
                  </span>
                )}
              </div>
              <h2 id="titulo-detalle-venta" className="text-xl font-sans font-bold text-ink">
                {loading ? 'Cargando comprobante…' : venta ? `Comprobante ${venta.comprobante}` : 'Detalle'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-neutral-500">
              <span className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
              <p className="text-xs">Cargando información de la venta…</p>
            </div>
          ) : !venta ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No se pudo obtener la información de la venta.
            </div>
          ) : (
            <>
              {/* Alerta de Anulación (RN-99) */}
              {esAnulada && (
                <div className="p-4 bg-rose-50/80 rounded-xl border border-rose-200/90 text-xs text-rose-900 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
                    <span>Esta venta fue ANULADA y no suma en los totales ni cierre de caja.</span>
                  </div>
                  <div className="pl-6 text-xs text-rose-950 space-y-0.5">
                    <p><strong>Motivo:</strong> {venta.motivoAnulacion || 'Sin motivo especificado'}</p>
                    <p><strong>Anulado por:</strong> {venta.usuarioAnulacion || 'Administrador'} · {venta.fechaHoraAnulacionFormateada || 'Fecha no registrada'}</p>
                    <p><strong>Destino del pedido:</strong> {venta.destinoPedido === 'porCobrar' ? 'Devuelto a pendiente de cobro en caja' : 'Pedido anulado permanentemente'}</p>
                  </div>
                </div>
              )}

              <VentaDatosGenerales venta={venta} />

              <VentaLineasTable lineas={venta.lineas} />

              <VentaDesgloseFiscal venta={venta} />
            </>
          )}
        </div>

        {/* Barra de Acciones del Detalle */}
        <VentaDetalleFooter
          venta={venta}
          loading={loading}
          esAdmin={esAdmin}
          descargandoTicket={descargandoTicket}
          onDescargarTicket={onDescargarTicket}
          onAbrirAnular={onAbrirAnular}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

