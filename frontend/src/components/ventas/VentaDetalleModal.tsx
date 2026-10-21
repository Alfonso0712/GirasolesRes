import React, { useEffect } from 'react';
import {
  Receipt,
  X,
  Download,
  Ban,
  Utensils,
  DollarSign,
  Smartphone,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import type { VentaDetalle } from '../../types/venta';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 text-neutral-800 shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-200/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
              esAnulada ? 'bg-neutral-100 text-neutral-400 border-neutral-200' : 'bg-amber-50 text-[#D35400] border-amber-200'
            }`}>
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D35400]">
                  DETALLE DE VENTA
                </span>
                {venta && (
                  <span
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-md border flex items-center gap-1 ${
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
              <h2 id="titulo-detalle-venta" className="text-xl font-sans font-bold text-[#2C1A0E]">
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
              <span className="w-6 h-6 border-2 border-[#D35400]/20 border-t-[#D35400] rounded-full animate-spin" />
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
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Esta venta fue ANULADA y no suma en los totales ni cierre de caja.</span>
                  </div>
                  <div className="pl-6 text-[11px] text-rose-950 space-y-0.5">
                    <p><strong>Motivo:</strong> {venta.motivoAnulacion || 'Sin motivo especificado'}</p>
                    <p><strong>Anulado por:</strong> {venta.usuarioAnulacion || 'Administrador'} · {venta.fechaHoraAnulacionFormateada || 'Fecha no registrada'}</p>
                    <p><strong>Destino del pedido:</strong> {venta.destinoPedido === 'porCobrar' ? 'Devuelto a pendiente de cobro en caja' : 'Pedido anulado permanentemente'}</p>
                  </div>
                </div>
              )}

              {/* Tarjeta de Datos Generales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-neutral-50/70 rounded-xl border border-neutral-200/70 text-xs">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-neutral-400 block">Fecha y Hora</span>
                  <span className="font-semibold text-neutral-800 tabular-nums">{venta.fechaHoraFormateada}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-neutral-400 block">Pedido N.º</span>
                  <span className="font-semibold text-neutral-800 tabular-nums">#{venta.pedidoNumero}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-neutral-400 block">Destino</span>
                  <span className="font-semibold text-neutral-800">
                    {venta.tipo} {venta.mesa ? `· ${venta.mesa}` : ''}
                  </span>
                  {venta.referencia && (
                    <span className="text-[10px] text-neutral-500 block truncate" title={venta.referencia}>
                      Ref: {venta.referencia}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-neutral-400 block">Cajero(a)</span>
                  <span className="font-semibold text-neutral-800">{venta.cajero}</span>
                </div>
              </div>

              {/* Receptor Fiscal (SUNAT / RENIEC) */}
              {(venta.numDocReceptor || venta.razonSocialReceptor) && (
                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/80 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                      Datos del Receptor Fiscal ({venta.tipoDocReceptor || (venta.numDocReceptor?.length === 11 ? 'RUC' : 'DNI')})
                    </span>
                    <span className="px-2 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md">
                      {venta.comprobante.startsWith('F') ? 'Factura' : venta.comprobante.startsWith('B') ? 'Boleta' : 'Comprobante'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-neutral-800">
                    <div>
                      <span className="text-neutral-500 font-medium">N.º Documento: </span>
                      <span className="tabular-nums font-bold text-neutral-900">{venta.numDocReceptor}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 font-medium">Nombre / Razón Social: </span>
                      <span className="font-semibold text-neutral-900">{venta.razonSocialReceptor || 'No especificado'}</span>
                    </div>
                  </div>
                  {venta.direccionReceptor && (
                    <div className="pt-1 text-[11px] text-neutral-700">
                      <span className="text-neutral-500 font-medium">Dirección Fiscal: </span>
                      <span>{venta.direccionReceptor}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tabla de Consumo (Líneas) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#482813] mb-2 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-[#D35400]" />
                  <span>Platos y Bebidas Consumidos</span>
                </h3>
                <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#FAF7F4] text-[#7C6F66] font-semibold text-xs uppercase tracking-wider border-b border-[#E5E0DB]">
                      <tr>
                        <th className="py-2.5 px-3 text-left w-14">Cant.</th>
                        <th className="py-2.5 px-3 text-left">Descripción</th>
                        <th className="py-2.5 px-3 text-right w-24">P. Unit.</th>
                        <th className="py-2.5 px-3 text-right w-24">Importe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE6] bg-white text-sm">
                      {venta.lineas.map((linea, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/50 border-b border-[#F0EBE6]">
                          <td className="py-2.5 px-3 tabular-nums font-semibold text-center text-[#2C1A0E] text-sm">
                            {linea.cantidad}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-sm text-[#2C1A0E]">{linea.productoNombre}</span>
                            {linea.elecciones && (
                              <span className="text-xs text-stone-500 italic block mt-0.5">
                                {linea.elecciones}{linea.incluye ? ` (incluye ${linea.incluye})` : ''}
                              </span>
                            )}
                            {linea.observacion && (
                              <span className="text-xs text-stone-500 block mt-0.5">
                                Obs: {linea.observacion}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-sm text-stone-600">
                            S/ {linea.precioUnitario.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-sm text-[#2C1A0E]">
                            S/ {linea.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Desglose Fiscal y de Pago */}
              <div className="p-3.5 bg-amber-50/30 rounded-xl border border-amber-200/60 text-xs space-y-3">
                {/* Desglose Tributario */}
                <div className="space-y-1 pb-2 border-b border-amber-200/50 text-[11px]">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Op. Gravada (Base imponible):</span>
                    <span className="tabular-nums font-semibold text-neutral-800">
                      S/ {(venta.opGravada ?? Number((venta.total / 1.18).toFixed(2))).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>I.G.V. (18%):</span>
                    <span className="tabular-nums font-semibold text-neutral-800">
                      S/ {(venta.igv ?? Number((venta.total - (venta.total / 1.18)).toFixed(2))).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-1 border-t border-amber-200/30">
                    <span className="font-bold text-[#482813]">TOTAL COBRADO:</span>
                    <span className="font-sans font-bold text-lg text-[#D35400] tabular-nums whitespace-nowrap">
                      S/ {venta.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Métodos de Pago */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-neutral-600">
                  <div>
                    <span className="text-neutral-400 block uppercase font-medium">Método de Pago</span>
                    <span className="font-bold text-[#2C1A0E] flex items-center gap-1 mt-0.5">
                      {venta.metodo === 'Efectivo' ? (
                        <>
                          <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Efectivo</span>
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-3.5 h-3.5 text-purple-700" />
                          <span>Yape / QR</span>
                        </>
                      )}
                    </span>
                  </div>
                  {venta.metodo === 'Efectivo' ? (
                    <>
                      <div>
                        <span className="text-neutral-400 block uppercase font-medium">Monto Recibido</span>
                        <span className="font-semibold text-neutral-800 tabular-nums">
                          S/ {(venta.montoRecibido ?? venta.total).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block uppercase font-medium">Vuelto Entregado</span>
                        <span className="font-semibold text-neutral-800 tabular-nums">
                          S/ {(venta.vuelto ?? 0).toFixed(2)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div>
                      <span className="text-neutral-400 block uppercase font-medium">Ref. Yape</span>
                      <span className="font-semibold text-neutral-800 tabular-nums">
                        {venta.yapeReferencia || 'No registrada'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Barra de Acciones del Detalle */}
        <div className="pt-3 border-t border-neutral-200/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {/* Botón Descargar PDF (RV-117, RN-104) */}
            <button
              type="button"
              disabled={loading || !venta || descargandoTicket}
              onClick={() => venta && onDescargarTicket(venta.ventaId, true)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#D35400]" />
              <span>{descargandoTicket ? 'Descargando PDF...' : 'Descargar PDF (Copia)'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón Anular Venta (RV-112: Solo Admin en ventas Vigentes) */}
            {esAdmin && venta && !esAnulada && (
              <button
                type="button"
                onClick={onAbrirAnular}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Anular Venta</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

