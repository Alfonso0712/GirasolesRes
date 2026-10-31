import React, { useState, useEffect } from 'react';
import { cobroService } from '../../services/cobroService';
import type { PedidoPendienteCobro, CobroRequest, TipoComprobante } from '../../types/cobro';
import {
  CobroBannerTotal,
  CobroTipoComprobanteSelector,
  CobroDocumentoClienteSection,
  CobroMetodoPagoSelector,
  CobroEfectivoSection,
  CobroYapeSection,
  CobroModalHeader,
  CobroModalFooter,
  validarYConstruirPayloadCobro,
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

    const { error, payload } = validarYConstruirPayloadCobro({
      pedido,
      total,
      tipoComprobante,
      modoBoleta,
      esExigidoDocumentoPorMonto,
      numDoc,
      razonSocial,
      direccion,
      metodo,
      montoRecibido,
      faltante,
      yapeConfirmado,
      yapeReferencia,
      solicitudId,
    });

    if (error || !payload) {
      setErrorLocal(error || 'Datos de cobro inválidos.');
      return;
    }

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
        <CobroModalHeader
          pedido={pedido}
          loading={loading}
          onClose={onClose}
        />

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
          <CobroModalFooter
            onClose={onClose}
            loading={loading}
            canSubmit={canSubmit}
            tipoComprobante={tipoComprobante}
          />
        </form>
      </div>
    </div>
  );
};
