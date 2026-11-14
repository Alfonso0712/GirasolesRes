import React, { useState } from 'react';
import {
  Receipt,
  Banknote,
  Smartphone,
  Check,
  AlertCircle,
  Lock,
  Search,
  FileText,
  CheckSquare,
  Square,
} from 'lucide-react';
import { cobroService } from '../../services/cobroService';
import type { PedidoPendienteCobro, MetodoPago, TipoComprobante } from '../../types/cobro';
import type { CajaActualResponseDto } from '../../types/caja';
import { BottomSheet } from '../ui/BottomSheet';
import { ConfirmSheet } from '../ui/ConfirmSheet';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { SkeletonList } from '../ui/Skeleton';
import { PageHeader } from '../layout/PageHeader';
import { Numpad } from '../ui/Numpad';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { useHaptics } from '../../hooks/useHaptics';
import { useToast } from '../../context/ToastContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { formatCurrency, pluralizar } from '../../utils/format';

export interface CobroViewProps {
  pedidos: PedidoPendienteCobro[];
  cajaActual: CajaActualResponseDto | null;
  cargando: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onCobroExitoso?: () => void;
}

export const CobroView: React.FC<CobroViewProps> = ({
  pedidos,
  cajaActual,
  cargando,
  error,
  onRefresh,
  onCobroExitoso,
}) => {
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoPendienteCobro | null>(null);

  // Tipo de comprobante
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>('Ticket');
  const [numDocReceptor, setNumDocReceptor] = useState('');
  const [razonSocialReceptor, setRazonSocialReceptor] = useState('');
  const [direccionReceptor, setDireccionReceptor] = useState('');
  const [consultandoDoc, setConsultandoDoc] = useState(false);
  const [errorConsultaDoc, setErrorConsultaDoc] = useState<string | null>(null);

  // Estado del cobro
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo');
  const [montoRecibido, setMontoRecibido] = useState<string>('');
  const [yapeConfirmado, setYapeConfirmado] = useState(false);
  const [yapeReferencia, setYapeReferencia] = useState('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [errorCobro, setErrorCobro] = useState<string | null>(null);

  const { triggerSuccess, triggerLight, triggerError } = useHaptics();
  const { mostrar } = useToast();
  const { sinConexion } = useNetworkStatus();

  const total = pedidoSeleccionado?.total || 0;
  const numRecibido = parseFloat(montoRecibido) || 0;
  const vuelto = metodoPago === 'Efectivo' ? Math.max(0, numRecibido - total) : 0;
  const saldoFaltante = metodoPago === 'Efectivo' ? Math.max(0, total - numRecibido) : 0;

  const cajaCerrada = cajaActual && cajaActual.estado !== 'abierta';

  const resetFormulario = () => {
    setTipoComprobante('Ticket');
    setNumDocReceptor('');
    setRazonSocialReceptor('');
    setDireccionReceptor('');
    setConsultandoDoc(false);
    setErrorConsultaDoc(null);
    setMetodoPago('Efectivo');
    setYapeConfirmado(false);
    setYapeReferencia('');
    setErrorCobro(null);
    setMostrarConfirmacion(false);
  };

  const handleAbrirCobro = (p: PedidoPendienteCobro) => {
    triggerLight();
    setPedidoSeleccionado(p);
    resetFormulario();
    setMontoRecibido(p.total.toString());
  };

  const handleConsultarDocumento = async () => {
    const doc = numDocReceptor.trim();
    setErrorConsultaDoc(null);

    if (tipoComprobante === 'Boleta') {
      if (doc.length !== 8 || !/^\d{8}$/.test(doc)) {
        triggerError();
        setErrorConsultaDoc('El DNI debe tener 8 dígitos numéricos.');
        return;
      }
      setConsultandoDoc(true);
      try {
        triggerLight();
        const res = await cobroService.consultarDni(doc);
        if (res && res.nombreCompleto) {
          setRazonSocialReceptor(res.nombreCompleto);
          triggerSuccess();
          mostrar({ tipo: 'exito', mensaje: `DNI validado: ${res.nombreCompleto}` });
        }
      } catch (err: unknown) {
        triggerError();
        const msg = err instanceof Error ? err.message : 'No se encontró información para el DNI ingresado.';
        setErrorConsultaDoc(msg);
      } finally {
        setConsultandoDoc(false);
      }
    } else if (tipoComprobante === 'Factura') {
      if (doc.length !== 11 || !/^(10|20)\d{9}$/.test(doc)) {
        triggerError();
        setErrorConsultaDoc('El RUC debe tener 11 dígitos y comenzar con 10 o 20.');
        return;
      }
      setConsultandoDoc(true);
      try {
        triggerLight();
        const res = await cobroService.consultarRuc(doc);
        if (res) {
          if (res.razonSocial) setRazonSocialReceptor(res.razonSocial);
          if (res.direccion) setDireccionReceptor(res.direccion);
          triggerSuccess();
          mostrar({ tipo: 'exito', mensaje: `RUC validado: ${res.razonSocial}` });
        }
      } catch (err: unknown) {
        triggerError();
        const msg = err instanceof Error ? err.message : 'No se encontró información para el RUC ingresado.';
        setErrorConsultaDoc(msg);
      } finally {
        setConsultandoDoc(false);
      }
    }
  };

  const handleSolicitarConfirmacion = () => {
    if (!pedidoSeleccionado) return;
    setErrorCobro(null);

    // 1. Validaciones SUNAT según tipo de comprobante
    if (tipoComprobante === 'Boleta') {
      const doc = numDocReceptor.trim();
      if (total >= 700 && (!doc || doc.length !== 8 || !/^\d{8}$/.test(doc))) {
        triggerError();
        setErrorCobro('Las boletas de S/ 700 o más exigen el DNI del cliente (8 dígitos).');
        return;
      }
      if (doc && (doc.length !== 8 || !/^\d{8}$/.test(doc))) {
        triggerError();
        setErrorCobro('El DNI debe tener 8 dígitos numéricos.');
        return;
      }
    } else if (tipoComprobante === 'Factura') {
      const doc = numDocReceptor.trim();
      if (!doc || doc.length !== 11 || !/^(10|20)\d{9}$/.test(doc)) {
        triggerError();
        setErrorCobro('El RUC debe tener 11 dígitos y comenzar con 10 o 20.');
        return;
      }
      if (!razonSocialReceptor.trim()) {
        triggerError();
        setErrorCobro('La razón social es obligatoria para emitir una Factura.');
        return;
      }
    }

    // 2. Validaciones de método de pago
    if (metodoPago === 'Efectivo') {
      if (numRecibido < total) {
        triggerError();
        setErrorCobro('El monto recibido es menor al total a cobrar.');
        return;
      }
      if (numRecibido > 9999.99) {
        triggerError();
        setErrorCobro('El monto recibido no puede exceder S/ 9,999.99.');
        return;
      }
    } else if (metodoPago === 'Yape') {
      if (!yapeConfirmado) {
        triggerError();
        setErrorCobro('Debe confirmar que verificó el pago en la aplicación de Yape/Plin.');
        return;
      }
      if (yapeReferencia.trim().length > 20) {
        triggerError();
        setErrorCobro('El código de referencia de Yape no puede superar 20 caracteres.');
        return;
      }
    }

    if (sinConexion) {
      triggerError();
      setErrorCobro('Sin conexión a internet. No se puede procesar el cobro.');
      return;
    }

    triggerLight();
    setMostrarConfirmacion(true);
  };

  const handleEjecutarCobro = async () => {
    if (!pedidoSeleccionado) return;

    setProcesando(true);
    setErrorCobro(null);

    const solicitudId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sol-cobro-${Date.now()}`;

    const payloadDocReceptor =
      tipoComprobante === 'Factura'
        ? 'RUC'
        : tipoComprobante === 'Boleta' && numDocReceptor.trim()
        ? 'DNI'
        : null;

    try {
      const res = await cobroService.procesarCobro({
        solicitudId,
        pedidoId: pedidoSeleccionado.pedidoId,
        totalMostrado: total,
        metodo: metodoPago,
        montoRecibido: metodoPago === 'Efectivo' ? numRecibido : total,
        yapeConfirmado: metodoPago === 'Yape' ? yapeConfirmado : undefined,
        yapeReferencia: metodoPago === 'Yape' && yapeReferencia.trim() ? yapeReferencia.trim() : undefined,
        tipoComprobante,
        tipoDocReceptor: payloadDocReceptor,
        numDocReceptor: numDocReceptor.trim() || null,
        razonSocialReceptor: razonSocialReceptor.trim() || null,
        direccionReceptor: tipoComprobante === 'Factura' && direccionReceptor.trim() ? direccionReceptor.trim() : null,
      });

      triggerSuccess();
      const numComprobante = res.comprobante?.numeroFormateado || (res.comprobante?.serie ? `${res.comprobante.serie}-${res.comprobante.numero}` : '');
      const msg = res.mensaje || `Cobro de ${formatCurrency(total)} registrado exitosamente.${numComprobante ? ` Comprobante ${numComprobante} emitido.` : ''}`;
      mostrar({
        tipo: 'exito',
        mensaje: msg,
      });
      setMostrarConfirmacion(false);
      setPedidoSeleccionado(null);
      resetFormulario();
      if (onCobroExitoso) {
        onCobroExitoso();
      } else {
        await onRefresh();
      }
    } catch (err: unknown) {
      triggerError();
      const msg = err instanceof Error ? err.message : 'No se pudo procesar el cobro.';
      setErrorCobro(msg);
      setMostrarConfirmacion(false);
    } finally {
      setProcesando(false);
    }
  };

  const renderFormularioCobro = () => (
          <div className="space-y-4">
            {errorCobro && (
              <div className="p-3 bg-danger-bg border border-danger-border rounded-xl text-danger text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorCobro}</span>
              </div>
            )}

            {/* Total a pagar */}
            <div className="bg-canvas border border-line rounded-2xl p-3.5 text-center">
              <span className="text-xs text-ink-muted block uppercase tracking-wider font-bold">
                Total de la Cuenta
              </span>
              <span className="text-3xl font-black text-accent tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>

            {/* Selector de Tipo de Comprobante */}
            <div>
              <span className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
                Tipo de Comprobante
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['Ticket', 'Boleta', 'Factura'] as TipoComprobante[]).map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => {
                      triggerLight();
                      setTipoComprobante(tipo);
                      setErrorConsultaDoc(null);
                      setErrorCobro(null);
                    }}
                    className={`py-2 px-2.5 rounded-xl border font-bold text-xs transition-colors min-h-[44px] flex flex-col items-center justify-center ${
                      tipoComprobante === tipo
                        ? 'bg-primary text-white border-primary shadow-2xs'
                        : 'bg-canvas text-ink border-line'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 mb-0.5" />
                    <span>{tipo}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Campos de Receptor según Tipo de Comprobante */}
            {tipoComprobante === 'Boleta' && (
              <div className="bg-canvas border border-line rounded-2xl p-3 space-y-2.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="doc-dni" className="text-xs font-bold text-ink">
                    DNI del Cliente {total >= 700 ? '(Obligatorio por ley S/ 700+)' : '(Opcional)'}
                  </label>
                  {total >= 700 && (
                    <span className="text-xs font-extrabold text-danger bg-danger-bg px-1.5 py-0.5 rounded">
                      Exigido SUNAT
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    id="doc-dni"
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    value={numDocReceptor}
                    onChange={(e) => {
                      setNumDocReceptor(e.target.value.replace(/\D/g, ''));
                      setErrorConsultaDoc(null);
                    }}
                    placeholder="8 dígitos"
                    className="flex-1 bg-surface border border-line rounded-xl px-3 py-2 text-xs font-mono text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-primary min-h-[44px]"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={numDocReceptor.trim().length !== 8 || consultandoDoc}
                    isLoading={consultandoDoc}
                    onClick={handleConsultarDocumento}
                    className="min-h-[44px] px-3 shrink-0 flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Consultar</span>
                  </Button>
                </div>

                {errorConsultaDoc && (
                  <p className="text-xs text-danger font-semibold">{errorConsultaDoc}</p>
                )}

                <div>
                  <label htmlFor="nombre-dni" className="text-xs font-bold text-ink-muted block mb-1">
                    Nombre o Razón Social (Opcional):
                  </label>
                  <input
                    id="nombre-dni"
                    type="text"
                    value={razonSocialReceptor}
                    onChange={(e) => setRazonSocialReceptor(e.target.value)}
                    placeholder="Nombre completo del cliente"
                    className="w-full bg-surface border border-line rounded-xl px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-primary min-h-[44px]"
                  />
                </div>
              </div>
            )}

            {tipoComprobante === 'Factura' && (
              <div className="bg-canvas border border-line rounded-2xl p-3 space-y-2.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="doc-ruc" className="text-xs font-bold text-ink">
                    RUC de la Empresa (Obligatorio)
                  </label>
                  <span className="text-xs font-extrabold text-accent bg-accent-bg px-1.5 py-0.5 rounded">
                    10 o 20
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    id="doc-ruc"
                    type="text"
                    inputMode="numeric"
                    maxLength={11}
                    value={numDocReceptor}
                    onChange={(e) => {
                      setNumDocReceptor(e.target.value.replace(/\D/g, ''));
                      setErrorConsultaDoc(null);
                    }}
                    placeholder="11 dígitos"
                    className="flex-1 bg-surface border border-line rounded-xl px-3 py-2 text-xs font-mono text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-primary min-h-[44px]"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={numDocReceptor.trim().length !== 11 || consultandoDoc}
                    isLoading={consultandoDoc}
                    onClick={handleConsultarDocumento}
                    className="min-h-[44px] px-3 shrink-0 flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Consultar</span>
                  </Button>
                </div>

                {errorConsultaDoc && (
                  <p className="text-xs text-danger font-semibold">{errorConsultaDoc}</p>
                )}

                <div>
                  <label htmlFor="razon-ruc" className="text-xs font-bold text-ink-muted block mb-1">
                    Razón Social *
                  </label>
                  <input
                    id="razon-ruc"
                    type="text"
                    value={razonSocialReceptor}
                    onChange={(e) => setRazonSocialReceptor(e.target.value)}
                    placeholder="Razón Social registrada en SUNAT"
                    className="w-full bg-surface border border-line rounded-xl px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-primary min-h-[44px]"
                  />
                </div>

                <div>
                  <label htmlFor="dir-ruc" className="text-xs font-bold text-ink-muted block mb-1">
                    Dirección Fiscal (Opcional)
                  </label>
                  <input
                    id="dir-ruc"
                    type="text"
                    value={direccionReceptor}
                    onChange={(e) => setDireccionReceptor(e.target.value)}
                    placeholder="Dirección fiscal para comprobante"
                    className="w-full bg-surface border border-line rounded-xl px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-primary min-h-[44px]"
                  />
                </div>
              </div>
            )}

            {/* Selector de Método de Pago */}
            <div>
              <span className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
                Método de Pago
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    triggerLight();
                    setMetodoPago('Efectivo');
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold text-xs transition-colors min-h-[48px] ${
                    metodoPago === 'Efectivo'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-canvas text-ink border-line'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Efectivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerLight();
                    setMetodoPago('Yape');
                    setMontoRecibido(total.toString());
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold text-xs transition-colors min-h-[48px] ${
                    metodoPago === 'Yape'
                      ? 'bg-info text-white border-info shadow-xs'
                      : 'bg-canvas text-ink border-line'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Yape / Plin</span>
                </button>
              </div>
            </div>

            {/* Flujo Efectivo con Teclado Numérico */}
            {metodoPago === 'Efectivo' ? (
              <div className="space-y-3">
                <div className="bg-canvas border border-line rounded-2xl p-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-ink-muted block">Recibido</span>
                    <span className="text-lg font-black text-ink tabular-nums">
                      {formatCurrency(numRecibido)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-ink-muted block">
                      {saldoFaltante > 0 ? 'Falta cobrar' : 'Vuelto exacto'}
                    </span>
                    <span
                      className={`text-lg font-black tabular-nums ${
                        saldoFaltante > 0 ? 'text-danger' : 'text-success'
                      }`}
                    >
                      {saldoFaltante > 0 ? formatCurrency(saldoFaltante) : formatCurrency(vuelto)}
                    </span>
                  </div>
                </div>

                {/* Accesos rápidos de efectivo */}
                <div className="flex gap-2">
                  {[total, 20, 50, 100].map((monto) => (
                    <button
                      key={monto}
                      type="button"
                      onClick={() => {
                        triggerLight();
                        setMontoRecibido(monto.toString());
                      }}
                      className="flex-1 py-2 bg-canvas border border-line rounded-xl text-xs font-bold text-ink active:scale-95 transition-all min-h-[44px]"
                    >
                      {monto === total ? 'Exacto' : `S/ ${monto}`}
                    </button>
                  ))}
                </div>

                <Numpad
                  value={montoRecibido}
                  onChange={(val) => setMontoRecibido(val)}
                  enterLabel="Cobrar Cuenta"
                  onEnter={handleSolicitarConfirmacion}
                />
              </div>
            ) : (
              /* Flujo Digital (Yape / Plin) */
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-info-bg/30 border border-info-border/50 rounded-2xl text-center space-y-1">
                  <Smartphone className="w-7 h-7 text-info mx-auto" />
                  <p className="text-xs font-bold text-ink">
                    Monto exacto a cobrar: {formatCurrency(total)}
                  </p>
                  <p className="text-xs text-ink-muted">
                    Verifique en la app bancaria la acreditación antes de emitir el comprobante.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerLight();
                    setYapeConfirmado(!yapeConfirmado);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-canvas border border-line rounded-xl text-left cursor-pointer min-h-[48px]"
                >
                  {yapeConfirmado ? (
                    <CheckSquare className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-ink-muted shrink-0" />
                  )}
                  <span className="text-xs font-bold text-ink">
                    Pago verificado en la app de Yape/Plin
                  </span>
                </button>

                <div>
                  <label htmlFor="ref-yape" className="text-xs font-bold text-ink-muted block mb-1">
                    Código de Referencia / Operación (Opcional, máx 20 caracteres):
                  </label>
                  <input
                    id="ref-yape"
                    type="text"
                    maxLength={20}
                    value={yapeReferencia}
                    onChange={(e) => setYapeReferencia(e.target.value)}
                    placeholder="Ej. 12345678"
                    className="w-full bg-canvas border border-line rounded-xl px-3 py-2 text-xs font-mono text-ink placeholder:text-ink-muted focus:outline-hidden focus:border-primary min-h-[44px]"
                  />
                </div>

                <Button
                  fullWidth
                  size="lg"
                  disabled={!yapeConfirmado || sinConexion}
                  title={sinConexion ? 'Sin conexión a internet' : undefined}
                  onClick={handleSolicitarConfirmacion}
                  className="flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Check className="w-5 h-5" />
                  <span>{sinConexion ? 'Sin conexión para cobrar' : 'Confirmar Cobro Digital'}</span>
                </Button>
              </div>
            )}
          </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-hidden min-h-0">
      {/* 1. Encabezado */}
      <PageHeader
        title="Caja y Cobro Rápido"
        subtitle={pluralizar(pedidos.length, 'cuenta por cobrar', 'cuentas por cobrar')}
        icon={<Receipt className="w-5 h-5 text-white" aria-hidden="true" />}
        onRefresh={onRefresh}
        isRefreshing={cargando}
      />

      {/* Contenedor principal con lista y detalle en tableta (md:) */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Panel izquierdo: Lista de Cuentas Pendientes */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

      {cajaCerrada && (
        <div className="m-4 p-4 rounded-2xl bg-danger-bg border border-danger-border text-danger flex items-center gap-3">
          <Lock className="w-5 h-5 shrink-0" aria-hidden="true" />
          <p className="text-xs font-bold leading-relaxed">
            No se puede registrar cobros porque la caja está cerrada. Un cajero debe realizar la apertura de caja.
          </p>
        </div>
      )}

      {error && (
        <div className="p-4">
          <ErrorState
            mensaje={error}
            onRetry={onRefresh}
          />
        </div>
      )}

      {/* 2. Lista de Cuentas Pendientes */}
          <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-6 space-y-3">
        {cargando && pedidos.length === 0 && (
          <SkeletonList count={4} />
        )}

        {!error && !cargando && pedidos.length === 0 && (
          <EmptyState
            icon={Receipt}
            titulo="No hay cobros pendientes"
            subtitulo="Todas las mesas y pedidos para llevar se encuentran al día."
          />
        )}

        {pedidos.map((p) => {
          const seleccionado = pedidoSeleccionado?.pedidoId === p.pedidoId;
          return (
            <Card
              key={p.pedidoId}
              interactive={!cajaCerrada}
              accent="none"
              onClick={!cajaCerrada ? () => handleAbrirCobro(p) : undefined}
              className={`flex items-center justify-between select-none ${
                seleccionado ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-ink">{p.mesaNombre}</h3>
                </div>
                <div className="text-xs text-ink-muted mt-1 space-y-0.5">
                  <p>Mozo: {p.mozoNombre}</p>
                  <p>{pluralizar(p.cantidadLineas, 'ítem', 'ítems')} en la orden</p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-1.5">
                <span className="text-xl font-black text-accent tabular-nums">
                  {formatCurrency(p.total)}
                </span>
                <StatusBadge estado="Pendiente" />
              </div>
            </Card>
          );
        })}
      </div>

        </div>

        {/* Panel derecho: Detalle de Cobro siempre visible en tableta / desktop */}
        <aside
          aria-label="Detalle y procesamiento de cobro"
          className="hidden md:flex md:w-[420px] lg:w-[460px] flex-col border-l border-line bg-surface min-h-0 shrink-0"
        >
          <div className="p-4 border-b border-line flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-accent" aria-hidden="true" />
              <h3 className="text-sm font-extrabold text-ink">
                {pedidoSeleccionado ? `Cobro · ${pedidoSeleccionado.mesaNombre}` : 'Detalle de Cobro'}
              </h3>
            </div>
            {pedidoSeleccionado && (
              <span className="text-xs font-black text-accent tabular-nums">
                {formatCurrency(pedidoSeleccionado.total)}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!pedidoSeleccionado ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-ink-muted">
                <Receipt className="w-12 h-12 stroke-1 text-ink-muted/40 mb-2" aria-hidden="true" />
                <p className="text-sm font-bold">Sin cuenta seleccionada</p>
                <p className="text-xs text-ink-muted mt-1">
                  Seleccione una cuenta pendiente de la lista izquierda para procesar el comprobante y cobro.
                </p>
              </div>
            ) : (
              renderFormularioCobro()
            )}
          </div>
        </aside>
      </div>

      {/* 3. Modal Táctil de Cobro y Comprobante (Solo móvil) */}
      <div className="md:hidden">
        <BottomSheet
          isOpen={Boolean(pedidoSeleccionado)}
          onClose={() => setPedidoSeleccionado(null)}
          title={pedidoSeleccionado ? `Cobro · ${pedidoSeleccionado.mesaNombre}` : ''}
        >
          {pedidoSeleccionado && renderFormularioCobro()}
        </BottomSheet>
      </div>

      {/* 4. Confirmación Definitiva */}
      <ConfirmSheet
        isOpen={mostrarConfirmacion}
        onCancelar={() => setMostrarConfirmacion(false)}
        titulo="¿Confirmar Cobro?"
        mensaje={`¿Confirmar cobro de ${formatCurrency(total)} mediante ${metodoPago}? Se emitirá el comprobante ${tipoComprobante}.${
          metodoPago === 'Efectivo' && vuelto > 0 ? ` Vuelto a entregar: ${formatCurrency(vuelto)}.` : ''
        }`}
        etiquetaConfirmar="Sí, Procesar Cobro"
        etiquetaCancelar="Volver"
        onConfirmar={handleEjecutarCobro}
        cargando={procesando}
      />
    </div>
  );
};
