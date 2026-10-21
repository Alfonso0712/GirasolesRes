import React from 'react';
import { Printer, Download, X, CheckCircle2 } from 'lucide-react';
import type { ComprobanteDetalle } from '../../types/cobro';

interface TicketComprobanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  comprobante: ComprobanteDetalle | null;
  onDescargarTxt: () => Promise<void>;
  descargando?: boolean;
}

export const TicketComprobanteModal: React.FC<TicketComprobanteModalProps> = ({
  isOpen,
  onClose,
  comprobante,
  onDescargarTxt,
  descargando = false,
}) => {
  if (!isOpen || !comprobante) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-ticket-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200/80 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="shrink-0 p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="modal-ticket-title"
                className="text-base font-sans font-bold text-[#2C1A0E] tracking-tight"
              >
                Comprobante Emitido
              </h2>
              <p className="text-xs text-neutral-500 font-mono">
                {comprobante.numeroFormateado}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Cerrar vista de ticket"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Preview (80mm styling) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-100/50 flex justify-center">
          <div className="w-full max-w-[340px] bg-white border border-neutral-200 shadow-md p-5 rounded-lg text-neutral-800 font-mono text-xs leading-relaxed print:shadow-none print:border-none print:max-w-none">
            {/* Cabecera Térmica */}
            <div className="text-center pb-3 border-b border-dashed border-neutral-300">
              <h3 className="font-bold text-sm text-neutral-900 tracking-wider">
                RESTAURANTE GIRASOLES
              </h3>
              <p className="text-xs text-neutral-500">RUC: 20481234567</p>
              <p className="text-xs text-neutral-500">Av. Principal 123 - Ayacucho</p>
              {comprobante.esCopia && (
                <div className="mt-1 inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-xs font-bold">
                  *** COPIA ***
                </div>
              )}
            </div>

            {/* Metadatos */}
            <div className="py-2.5 border-b border-dashed border-neutral-300 space-y-0.5 text-xs">
              <div className="text-center font-bold text-xs text-[#D35400] pb-1">
                {comprobante.tipoComprobante === 'Factura'
                  ? 'FACTURA ELECTRÓNICA'
                  : comprobante.tipoComprobante === 'Boleta'
                  ? 'BOLETA DE VENTA ELECTRÓNICA'
                  : 'TICKET DE VENTA'}
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">COMPROBANTE:</span>
                <span className="font-bold">{comprobante.numeroFormateado}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">FECHA/HORA:</span>
                <span>{comprobante.fechaHoraFormateada}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">CAJERO(A):</span>
                <span>{comprobante.cajeroNombre}</span>
              </div>
              {comprobante.numDocReceptor && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">{comprobante.tipoDocReceptor || 'DOC'}:</span>
                  <span className="font-bold">{comprobante.numDocReceptor}</span>
                </div>
              )}
              {comprobante.razonSocialReceptor && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">CLIENTE:</span>
                  <span className="font-semibold text-right max-w-[200px] truncate">{comprobante.razonSocialReceptor}</span>
                </div>
              )}
              {comprobante.direccionReceptor && (
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">DIR:</span>
                  <span className="text-right max-w-[200px] truncate">{comprobante.direccionReceptor}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">PEDIDO:</span>
                <span>N.º {comprobante.pedidoNumero} ({comprobante.tipoPedido})</span>
              </div>
              {comprobante.mesaNombre && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">MESA:</span>
                  <span className="font-semibold">{comprobante.mesaNombre}</span>
                </div>
              )}
              {comprobante.referencia && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">REF:</span>
                  <span>{comprobante.referencia}</span>
                </div>
              )}
            </div>

            {/* Tabla de Productos */}
            <div className="py-2.5 border-b border-dashed border-neutral-300">
              <div className="flex justify-between text-xs font-bold text-neutral-500 pb-1 border-b border-neutral-200 mb-1.5">
                <span className="w-8">CANT</span>
                <span className="flex-1 px-1">DESCRIPCIÓN</span>
                <span className="w-12 text-right">P.U.</span>
                <span className="w-14 text-right">TOTAL</span>
              </div>
              <div className="space-y-1">
                {comprobante.lineas.map((l, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs">
                      <span className="w-8 font-semibold">{l.cantidad}</span>
                      <span className="flex-1 px-1 truncate font-medium">{l.productoNombre}</span>
                      <span className="w-12 text-right">{l.precioUnitario.toFixed(2)}</span>
                      <span className="w-14 text-right font-semibold">{l.subtotal.toFixed(2)}</span>
                    </div>
                    {l.elecciones && (
                      <div className="text-xs text-neutral-500 pl-8 italic">
                        {l.elecciones}{l.incluye ? ` (incluye ${l.incluye})` : ''}
                      </div>
                    )}
                    {l.observacion && (
                      <div className="text-xs text-neutral-500 pl-8 italic">
                        * {l.observacion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totales y Medio de Pago */}
            <div className="py-2.5 border-b border-dashed border-neutral-300 space-y-1 text-xs">
              {(comprobante.tipoComprobante === 'Boleta' || comprobante.tipoComprobante === 'Factura') && (
                <>
                  <div className="flex justify-between text-xs text-neutral-600">
                    <span>OP. GRAVADA:</span>
                    <span>S/ {(comprobante.opGravada ?? (comprobante.total / 1.18)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-600">
                    <span>I.G.V. (18%):</span>
                    <span>S/ {(comprobante.igv ?? (comprobante.total - comprobante.total / 1.18)).toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-bold text-sm text-neutral-900 pt-0.5">
                <span>TOTAL A PAGAR:</span>
                <span>S/ {comprobante.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-600">
                <span>MÉTODO DE PAGO:</span>
                <span className="font-semibold">{comprobante.metodoPago}</span>
              </div>
              {comprobante.metodoPago === 'Efectivo' && comprobante.montoRecibido != null && (
                <>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>MONTO RECIBIDO:</span>
                    <span>S/ {comprobante.montoRecibido.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-700 font-bold">
                    <span>VUELTO ENTREGADO:</span>
                    <span>S/ {(comprobante.vuelto ?? 0).toFixed(2)}</span>
                  </div>
                </>
              )}
              {comprobante.metodoPago === 'Yape' && comprobante.yapeReferencia && (
                <div className="flex justify-between text-xs text-neutral-600">
                  <span>REF. YAPE:</span>
                  <span className="font-mono">{comprobante.yapeReferencia}</span>
                </div>
              )}
            </div>

            {/* Pie de ticket */}
            <div className="pt-3 text-center text-xs text-neutral-500 space-y-1">
              <p className="font-semibold uppercase">{comprobante.leyenda}</p>
              <p className="font-medium">¡Gracias por su preferencia!</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 p-4 border-t border-neutral-100 flex items-center justify-between gap-2 bg-white">
          <button
            type="button"
            onClick={onDescargarTxt}
            disabled={descargando}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{descargando ? 'Descargando PDF...' : 'Descargar PDF'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-[#2C1A0E] hover:bg-[#482813] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#D35400] hover:bg-[#B84600] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

