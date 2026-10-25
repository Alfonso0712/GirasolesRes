import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Smartphone,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Search,
  Loader2,
} from 'lucide-react';
import { cobroService } from '../../services/cobroService';
import type { PedidoPendienteCobro, CobroRequest, TipoComprobante } from '../../types/cobro';

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
      } catch (err: any) {
        setDocFeedback({
          tipo: 'error',
          texto: 'No se encontró el DNI o hubo un problema de conexión. Puede escribir el nombre manualmente.',
        });
      } finally {
        setBuscandoDoc(false);
      }
    } else if (tipoComprobante === 'Factura') {
      if (docLimpio.length !== 11 || !/^\d+$/.test(docLimpio) || (!docLimpio.startsWith('10') && !docLimpio.startsWith('20'))) {
        setDocFeedback({ tipo: 'error', texto: 'El RUC debe tener 11 dígitos y comenzar con 10 o 20.' });
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
      } catch (err: any) {
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
    } catch (err: any) {
      setErrorLocal(err.message || 'Error al procesar el cobro.');
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
          {/* Total Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-200/70 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Total a Cobrar
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-accent tracking-tight">
                S/ {total.toFixed(2)}
              </div>
              {tipoComprobante !== 'Ticket' && (
                <div className="text-xs text-neutral-600 mt-0.5 font-medium">
                  Op. Gravada: S/ {(total / 1.18).toFixed(2)} · IGV (18%): S/ {(total - total / 1.18).toFixed(2)}
                </div>
              )}
            </div>
            <div className="text-right">
              <span
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1 ${
                  pedido.estaListo
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}
              >
                {pedido.estaListo ? 'Listo para entrega' : 'En cocina / Salón'}
              </span>
            </div>
          </div>

          {!pedido.estaListo && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
              <span>
                <strong>Esperando a cocina:</strong> Este pedido aún no ha sido marcado como <strong>Listo</strong>. No se puede emitir el cobro hasta que cocina termine la preparación.
              </span>
            </div>
          )}

          {errorLocal && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorLocal}</span>
            </div>
          )}

          {/* Selector de Tipo de Comprobante */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Tipo de Comprobante
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTipoComprobante('Ticket')}
                className={`p-2.5 rounded-xl border text-center font-semibold text-xs transition-all cursor-pointer ${
                  tipoComprobante === 'Ticket'
                    ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                    : 'bg-surface hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                <div className="font-bold">Ticket</div>
                <div className="text-xs opacity-75 font-normal">Sin validez fiscal</div>
              </button>

              <button
                type="button"
                onClick={() => setTipoComprobante('Boleta')}
                className={`p-2.5 rounded-xl border text-center font-semibold text-xs transition-all cursor-pointer ${
                  tipoComprobante === 'Boleta'
                    ? 'bg-primary text-white border-accent shadow-2xs'
                    : 'bg-surface hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                <div className="font-bold">Boleta</div>
                <div className="text-xs opacity-75 font-normal">Persona Natural</div>
              </button>

              <button
                type="button"
                onClick={() => setTipoComprobante('Factura')}
                className={`p-2.5 rounded-xl border text-center font-semibold text-xs transition-all cursor-pointer ${
                  tipoComprobante === 'Factura'
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-2xs'
                    : 'bg-surface hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                <div className="font-bold">Factura</div>
                <div className="text-xs opacity-75 font-normal">Con RUC (Empresa)</div>
              </button>
            </div>
          </div>

          {/* Campos específicos de Boleta */}
          {tipoComprobante === 'Boleta' && (
            <div className="p-3.5 bg-neutral-50/80 rounded-xl border border-neutral-200/80 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Modalidad de Boleta:</span>
                <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-neutral-200 text-xs">
                  <button
                    type="button"
                    disabled={esExigidoDocumentoPorMonto}
                    onClick={() => setModoBoleta('simple')}
                    className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                      modoBoleta === 'simple'
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'text-neutral-600 hover:text-neutral-900'
                    } ${esExigidoDocumentoPorMonto ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    Simple
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoBoleta('dni')}
                    className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                      modoBoleta === 'dni'
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Con DNI
                  </button>
                </div>
              </div>

              {esExigidoDocumentoPorMonto && (
                <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                  <span>Por normativa SUNAT, ventas mayores o iguales a S/ 700.00 requieren DNI o RUC.</span>
                </div>
              )}

              {(modoBoleta === 'dni' || esExigidoDocumentoPorMonto) && (
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Número de DNI (8 dígitos)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={8}
                        value={numDoc}
                        onChange={(e) => setNumDoc(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ej. 44444444"
                        className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-accent text-sm tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={handleConsultarDocumento}
                        disabled={buscandoDoc || numDoc.trim().length !== 8}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {buscandoDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        <span>Consultar</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Nombre o Titular
                    </label>
                    <input
                      type="text"
                      value={razonSocial}
                      onChange={(e) => setRazonSocial(e.target.value)}
                      placeholder="Nombres y Apellidos"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-accent text-sm bg-surface"
                    />
                  </div>

                  {docFeedback && (
                    <div
                      className={`text-xs p-2 rounded-lg ${
                        docFeedback.tipo === 'ok'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {docFeedback.texto}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Campos específicos de Factura */}
          {tipoComprobante === 'Factura' && (
            <div className="p-3.5 bg-neutral-50/80 rounded-xl border border-neutral-200/80 space-y-2.5 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Número de RUC (11 dígitos, inicia con 10 o 20)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={11}
                    value={numDoc}
                    onChange={(e) => setNumDoc(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ej. 20131312955"
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-[#1E3A8A] text-sm tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={handleConsultarDocumento}
                    disabled={buscandoDoc || numDoc.trim().length !== 11}
                    className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {buscandoDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Consultar</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Razón Social <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  placeholder="Razón Social de la Empresa"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-[#1E3A8A] text-sm bg-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Dirección Fiscal
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Dirección Fiscal (Opcional)"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-[#1E3A8A] text-xs bg-surface"
                />
              </div>

              {docFeedback && (
                <div
                  className={`text-xs p-2 rounded-lg ${
                    docFeedback.tipo === 'ok'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {docFeedback.texto}
                </div>
              )}
            </div>
          )}

          {/* Método de Pago Selector */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Seleccione Medio de Pago
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMetodo('efectivo')}
                className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 font-semibold text-sm transition-all cursor-pointer ${
                  metodo === 'efectivo'
                    ? 'bg-ink-fill text-white border-ink-fill shadow-2xs'
                    : 'bg-surface hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                <DollarSign className="w-5 h-5 shrink-0" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodo('yape')}
                className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 font-semibold text-sm transition-all cursor-pointer ${
                  metodo === 'yape'
                    ? 'bg-[#732282] text-white border-[#732282] shadow-sm'
                    : 'bg-surface hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                <Smartphone className="w-5 h-5 shrink-0" />
                <span>Yape / QR</span>
              </button>
            </div>
          </div>

          {/* Sección Efectivo */}
          {metodo === 'efectivo' && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-150">
              <div>
                <label
                  htmlFor="monto-recibido-input"
                  className="block text-xs font-semibold text-ink mb-1.5"
                >
                  Monto Recibido del Cliente (S/) <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-neutral-500">
                    S/
                  </span>
                  <input
                    id="monto-recibido-input"
                    type="number"
                    step="0.10"
                    min="0"
                    max="9999.99"
                    value={montoRecibidoStr}
                    onChange={(e) => setMontoRecibidoStr(e.target.value)}
                    autoFocus
                    disabled={loading}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent/20 text-ink text-xl font-bold font-sans tabular-nums"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Botones de sugerencia rápida */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Acceso rápido:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(total)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-surface hover:bg-neutral-50 text-xs font-semibold font-sans tabular-nums text-neutral-700 shadow-2xs transition-colors cursor-pointer"
                  >
                    Exacto (S/ {total.toFixed(2)})
                  </button>
                  {[20, 50, 100].map((b) => (
                    <button
                      key={b}
                      type="button"
                      disabled={b < total}
                      onClick={() => handleQuickAmount(b)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold font-sans tabular-nums transition-colors cursor-pointer ${
                        b < total
                          ? 'border-neutral-100 bg-neutral-100/50 text-neutral-500 cursor-not-allowed'
                          : 'border-neutral-200 bg-surface hover:bg-neutral-50 text-neutral-700 shadow-2xs'
                      }`}
                    >
                      S/ {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resumen de Vuelto */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Vuelto a entregar
                  </span>
                  <div
                    className={`text-xl font-bold font-sans tabular-nums tracking-tight ${
                      montoRecibido < total ? 'text-danger' : 'text-emerald-700'
                    }`}
                  >
                    S/ {vuelto.toFixed(2)}
                  </div>
                </div>
                {montoRecibido < total && (
                  <span className="text-xs text-danger font-semibold">
                    Faltan S/ {faltante.toFixed(2)}
                  </span>
                )}
                {montoRecibido >= total && (
                  <span className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Pago cubierto
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Sección Yape */}
          {metodo === 'yape' && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200/80 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    id="yape-confirm-check"
                    type="checkbox"
                    checked={yapeConfirmado}
                    onChange={(e) => setYapeConfirmado(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#732282] border-neutral-300 rounded-sm focus:ring-[#732282] cursor-pointer"
                  />
                  <label
                    htmlFor="yape-confirm-check"
                    className="text-xs font-medium text-purple-950 leading-relaxed cursor-pointer"
                  >
                    <span className="font-bold text-[#732282]">
                      Confirmación de recepción en Yape:
                    </span>{' '}
                    Verifiqué que el monto de{' '}
                    <span className="font-bold">S/ {total.toFixed(2)}</span> fue acreditado
                    correctamente en la cuenta del restaurante.
                  </label>
                </div>
              </div>

              <div>
                <label
                  htmlFor="yape-ref-input"
                  className="block text-xs font-bold text-ink uppercase tracking-wider mb-1"
                >
                  Número de operación / Referencia (Opcional)
                </label>
                <input
                  id="yape-ref-input"
                  type="text"
                  maxLength={20}
                  value={yapeReferencia}
                  onChange={(e) => setYapeReferencia(e.target.value)}
                  disabled={loading}
                  placeholder="Ej. 128492"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-accent text-neutral-900 text-sm tabular-nums"
                />
              </div>
            </div>
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

