import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { cobroService } from '../../services/cobroService';
import type { PedidoPendienteCobro, CobroRequest, TipoComprobante } from '../../types/cobro';
import {
  CobroBannerTotal,
  CobroTipoComprobanteSelector,
  CobroDocumentoClienteSection,
  CobroMetodoPagoSelector,
  CobroEfectivoSection,
  CobroYapeSection,
} from './cobro-modal';

interface CobroModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: PedidoPendienteCobro | null;
  onConfirmarCobro: (request: CobroRequest) => Promise<void>;
  loading?: boolean;
  token?: string;
}

export const CobroModal: React.FC<CobroModalProps> = ({
  isOpen,
  onClose,
  pedido,
  onConfirmarCobro,
  loading = false,
  token = '',
}) => {
  const [metodo, setMetodo] = useState<'efectivo' | 'yape'>('efectivo');
  const [montoRecibidoStr, setMontoRecibidoStr] = useState<string>('');
  const [yapeConfirmado, setYapeConfirmado] = useState<boolean>(false);
  const [yapeReferencia, setYapeReferencia] = useState<string>('');
  const [solicitudId, setSolicitudId] = useState<string>('');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Estados de comprobante tributario
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>('Ticket');
  const [modoBoleta, setModoBoleta] = useState<'simple' | 'dni'>('simple');
  const [numDoc, setNumDoc] = useState<string>('');
  const [razonSocial, setRazonSocial] = useState<string>('');
  const [direccion, setDireccion] = useState<string>('');
  const [buscandoDoc, setBuscandoDoc] = useState<boolean>(false);
  const [docFeedback, setDocFeedback] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const total = pedido ? Number(pedido.total) : 0;
  const montoRecibido = parseFloat(montoRecibidoStr);
  const vuelto = !isNaN(montoRecibido) && montoRecibido >= total ? montoRecibido - total : 0;
  const faltante = !isNaN(montoRecibido) && montoRecibido < total ? total - montoRecibido : 0;
  const esExigidoDocumentoPorMonto = total >= 700;

  // Generar nuevo ID de idempotencia y resetear formulario al abrir modal
  useEffect(() => {
    if (isOpen && pedido) {
      setMetodo('efectivo');
      setMontoRecibidoStr(total.toFixed(2));
      setYapeConfirmado(false);
      setYapeReferencia('');
      setErrorLocal(null);
      setTipoComprobante('Ticket');
      setModoBoleta(total >= 700 ? 'dni' : 'simple');
      setNumDoc('');
      setRazonSocial('');
      setDireccion('');
      setDocFeedback(null);
      setSolicitudId(
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `cobro-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      );
    }
  }, [isOpen, pedido, total]);

  // Si supera S/ 700 y está en Boleta Simple, forzar Boleta con DNI
  useEffect(() => {
    if (esExigidoDocumentoPorMonto && tipoComprobante === 'Boleta' && modoBoleta === 'simple') {
      setModoBoleta('dni');
    }
  }, [esExigidoDocumentoPorMonto, tipoComprobante, modoBoleta]);

  if (!isOpen || !pedido) return null;

  const handleQuickAmount = (val: number) => {
    setMontoRecibidoStr(val.toFixed(2));
  };

  const handleConsultarDocumento = async () => {
    if (!token) return;
    const docLimpio = numDoc.trim();
    setDocFeedback(null);

    if (tipoComprobante === 'Boleta') {
      if (docLimpio.length !== 8 || !/^\d+$/.test(docLimpio)) {
        setDocFeedback({ tipo: 'error', texto: 'El DNI debe tener exactamente 8 dígitos numéricos.' });
        return;
      }
      setBuscandoDoc(true);
      try {
        const res = await cobroService.consultarDni(docLimpio, token);
        setRazonSocial(res.nombreCompleto);
        setDocFeedback({ tipo: 'ok', texto: `Titular verificado: ${res.nombreCompleto}` });
      } catch {
        setDocFeedback({
          tipo: 'error',
          texto: 'No se encontró el DNI o hubo un problema de conexión. Puede escribir el nombre manualmente.',
        });
      } finally {
        setBuscandoDoc(false);
      }
    } else if (tipoComprobante === 'Factura') {
      if (docLimpio.length !== 11 || !/^\d+$/.test(docLimpio) || (!docLimpio.startsWith('10') && !docLimpio.startsWith('20'))) {
        setDocFeedback({ tipo: 'error', texto: 'El RUC debe tener 11 dígitos numéricos y comenzar con 10 o 20.' });
        return;
      }
      setBuscandoDoc(true);
      try {
        const res = await cobroService.consultarRuc(docLimpio, token);
        setRazonSocial(res.razonSocial);
        if (res.direccion) {
          setDireccion(res.direccion);
        }
        setDocFeedback({ tipo: 'ok', texto: `Razón Social: ${res.razonSocial}` });
      } catch {
        setDocFeedback({
          tipo: 'error',
          texto: 'No se encontró el RUC o hubo un problema de conexión. Puede ingresar los datos manualmente.',
        });
      } finally {
        setBuscandoDoc(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    // Validación de comprobante
    if (tipoComprobante === 'Factura') {
      const ruc = numDoc.trim();
      if (ruc.length !== 11 || !/^\d+$/.test(ruc) || (!ruc.startsWith('10') && !ruc.startsWith('20'))) {
        setErrorLocal('Para emitir Factura se requiere un RUC válido de 11 dígitos (iniciando con 10 o 20).');
        return;
      }
      if (!razonSocial.trim()) {
        setErrorLocal('La Razón Social es obligatoria para emitir una Factura.');
        return;
      }
    } else if (tipoComprobante === 'Boleta') {
      if (esExigidoDocumentoPorMonto || modoBoleta === 'dni') {
        const dni = numDoc.trim();
        if (dni.length !== 8 || !/^\d+$/.test(dni)) {
          setErrorLocal('Para esta boleta se requiere ingresar un DNI válido de 8 dígitos.');
          return;
        }
      }
    }

    // Validación de medio de pago
    if (metodo === 'efectivo') {
      if (isNaN(montoRecibido) || montoRecibido <= 0) {
        setErrorLocal('Ingrese un monto recibido válido.');
        return;
      }
      if (montoRecibido < total) {
        setErrorLocal(`El monto recibido es insuficiente. Faltan S/ ${faltante.toFixed(2)}.`);
        return;
      }
      if (montoRecibido > 9999.99) {
        setErrorLocal('El monto recibido no puede exceder S/ 9,999.99.');
        return;
      }
    } else if (metodo === 'yape') {
      if (!yapeConfirmado) {
        setErrorLocal('Debe confirmar la verificación del pago en el aplicativo Yape.');
        return;
      }
      if (yapeReferencia && yapeReferencia.trim().length > 20) {
        setErrorLocal('La referencia de Yape no puede tener más de 20 caracteres.');
        return;
      }
    }

    if (!pedido?.estaListo) {
      setErrorLocal('No se puede cobrar el pedido porque aún se encuentra en preparación en cocina.');
      return;
    }

    const payload: CobroRequest = {
      pedidoId: pedido.pedidoId,
      solicitudId,
      totalMostrado: total,
      metodo,
      montoRecibido: metodo === 'efectivo' ? montoRecibido : total,
      yapeConfirmado: metodo === 'yape' ? true : undefined,
      yapeReferencia: metodo === 'yape' && yapeReferencia.trim() ? yapeReferencia.trim() : undefined,
      tipoComprobante,
      tipoDocReceptor:
        tipoComprobante === 'Factura'
          ? 'RUC'
          : tipoComprobante === 'Boleta' && (modoBoleta === 'dni' || esExigidoDocumentoPorMonto)
          ? 'DNI'
          : null,
      numDocReceptor:
        (tipoComprobante === 'Factura' ||
          (tipoComprobante === 'Boleta' && (modoBoleta === 'dni' || esExigidoDocumentoPorMonto))) &&
        numDoc.trim()
          ? numDoc.trim()
          : null,
      razonSocialReceptor:
        tipoComprobante === 'Factura' ||
        (tipoComprobante === 'Boleta' && (modoBoleta === 'dni' || esExigidoDocumentoPorMonto))
          ? razonSocial.trim() || undefined
          : tipoComprobante === 'Boleta'
          ? 'CLIENTES VARIOS'
          : undefined,
      direccionReceptor: tipoComprobante === 'Factura' && direccion.trim() ? direccion.trim() : undefined,
    };

    try {
      await onConfirmarCobro(payload);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      setErrorLocal(msg || 'Error al procesar el cobro.');
    }
  };

  const docValido =
    tipoComprobante === 'Ticket' ||
    (tipoComprobante === 'Boleta' && modoBoleta === 'simple' && !esExigidoDocumentoPorMonto) ||
    (tipoComprobante === 'Boleta' && (modoBoleta === 'dni' || esExigidoDocumentoPorMonto) && numDoc.trim().length === 8) ||
    (tipoComprobante === 'Factura' && numDoc.trim().length === 11 && razonSocial.trim().length > 0);

  const canSubmit =
    !loading &&
    !buscandoDoc &&
    Boolean(pedido?.estaListo) &&
    docValido &&
    ((metodo === 'efectivo' && !isNaN(montoRecibido) && montoRecibido >= total) ||
      (metodo === 'yape' && yapeConfirmado));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cobro-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-surface rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200/80 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="shrink-0 p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-accent bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Cobro en Caja
              </span>
              <span className="text-xs text-neutral-500">·</span>
              <span className="text-xs text-neutral-500 tabular-nums">
                Hora: {pedido.hora}
              </span>
            </div>
            <h2
              id="modal-cobro-title"
              className="text-xl font-sans font-bold text-ink tracking-tight"
            >
              Pedido N.º {pedido.numero}
            </h2>
            <p className="text-xs text-neutral-500">
              {pedido.tipo === 'Mesa' ? `Salón · ${pedido.mesa || 'Mesa'}` : 'Pedido Para Llevar'}
              {pedido.referencia && ` · Ref: ${pedido.referencia}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="modal-close-btn"
            aria-label="Cerrar modal de cobro"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <CobroBannerTotal
            pedido={pedido}
            total={total}
            tipoComprobante={tipoComprobante}
            errorLocal={errorLocal}
          />

          <CobroTipoComprobanteSelector
            tipoComprobante={tipoComprobante}
            setTipoComprobante={setTipoComprobante}
          />

          <CobroDocumentoClienteSection
            tipoComprobante={tipoComprobante}
            modoBoleta={modoBoleta}
            setModoBoleta={setModoBoleta}
            esExigidoDocumentoPorMonto={esExigidoDocumentoPorMonto}
            numDoc={numDoc}
            setNumDoc={setNumDoc}
            razonSocial={razonSocial}
            setRazonSocial={setRazonSocial}
            direccion={direccion}
            setDireccion={setDireccion}
            buscandoDoc={buscandoDoc}
            docFeedback={docFeedback}
            onConsultarDocumento={handleConsultarDocumento}
          />

          <CobroMetodoPagoSelector
            metodo={metodo}
            setMetodo={setMetodo}
          />

          {metodo === 'efectivo' && (
            <CobroEfectivoSection
              total={total}
              montoRecibidoStr={montoRecibidoStr}
              setMontoRecibidoStr={setMontoRecibidoStr}
              loading={loading}
              onQuickAmount={handleQuickAmount}
              montoRecibido={montoRecibido}
              vuelto={vuelto}
              faltante={faltante}
            />
          )}

          {metodo === 'yape' && (
            <CobroYapeSection
              total={total}
              yapeConfirmado={yapeConfirmado}
              setYapeConfirmado={setYapeConfirmado}
              yapeReferencia={yapeReferencia}
              setYapeReferencia={setYapeReferencia}
              loading={loading}
            />
          )}

          {/* Footer Controls */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer min-h-[44px]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-2 min-h-[44px] ${
                canSubmit
                  ? tipoComprobante === 'Factura'
                    ? 'bg-[#1E3A8A] hover:bg-[#1E40AF] cursor-pointer'
                    : 'bg-primary hover:bg-primary-hover cursor-pointer'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-70'
              }`}
            >
              {loading ? (
                <span>Emitiendo comprobante...</span>
              ) : (
                <>
                  <span>
                    Emitir {tipoComprobante === 'Ticket' ? 'Ticket' : tipoComprobante === 'Boleta' ? 'Boleta' : 'Factura'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
