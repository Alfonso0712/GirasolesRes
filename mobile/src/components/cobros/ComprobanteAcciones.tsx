import React, { useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Ban,
} from 'lucide-react';
import {
  useComprobanteAcciones,
  type DatosComprobanteAccion,
} from '../../hooks/useComprobanteAcciones';
import { EnviarWhatsAppSheet } from './EnviarWhatsAppSheet';
import { useHaptics } from '../../hooks/useHaptics';

export interface ComprobanteAccionesProps {
  venta: DatosComprobanteAccion | null;
}

export const ComprobanteAcciones: React.FC<ComprobanteAccionesProps> = ({ venta }) => {
  const [whatsAppAbierto, setWhatsAppAbierto] = useState(false);
  const { triggerLight } = useHaptics();

  const {
    accionActiva,
    ocupado,
    errorMensaje,
    avisoExito,
    imprimir,
    guardar,
    compartir,
  } = useComprobanteAcciones(venta);

  if (!venta) return null;

  const esAnulada = Boolean(venta.anulada);
  const deshabilitado = esAnulada || ocupado;

  return (
    <div className="space-y-3" aria-label="Acciones del comprobante">
      {esAnulada && (
        <div
          role="status"
          className="p-3 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs font-bold flex items-center gap-2"
        >
          <Ban className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Comprobante anulado.</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {/* 1. Imprimir */}
        <button
          type="button"
          disabled={deshabilitado}
          onClick={() => void imprimir()}
          aria-label="Imprimir comprobante"
          className="min-h-[52px] px-3 py-2.5 rounded-xl border border-line bg-surface hover:bg-canvas text-ink font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <Printer className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
          <span>{accionActiva === 'imprimir' ? 'Generando…' : 'Imprimir'}</span>
        </button>

        {/* 2. Guardar PDF */}
        <button
          type="button"
          disabled={deshabilitado}
          onClick={() => void guardar()}
          aria-label="Guardar comprobante en PDF"
          className="min-h-[52px] px-3 py-2.5 rounded-xl border border-line bg-surface hover:bg-canvas text-ink font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <Download className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
          <span>{accionActiva === 'guardar' ? 'Generando…' : 'Guardar PDF'}</span>
        </button>

        {/* 3. Compartir PDF */}
        <button
          type="button"
          disabled={deshabilitado}
          onClick={() => void compartir()}
          aria-label="Compartir comprobante en PDF"
          className="min-h-[52px] px-3 py-2.5 rounded-xl border border-line bg-surface hover:bg-canvas text-ink font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
          <span>{accionActiva === 'compartir' ? 'Generando…' : 'Compartir PDF'}</span>
        </button>

        {/* 4. WhatsApp */}
        <button
          type="button"
          disabled={deshabilitado}
          onClick={() => {
            triggerLight();
            setWhatsAppAbierto(true);
          }}
          aria-label="Enviar comprobante por WhatsApp"
          className="min-h-[52px] px-3 py-2.5 rounded-xl border border-line bg-surface hover:bg-canvas text-ink font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
          <span>WhatsApp</span>
        </button>
      </div>

      {errorMensaje && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs font-bold flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{errorMensaje}</span>
        </div>
      )}

      {avisoExito && !errorMensaje && (
        <div
          role="status"
          aria-live="polite"
          className="p-2.5 rounded-xl bg-success-bg border border-success-border text-success text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{avisoExito}</span>
        </div>
      )}

      <EnviarWhatsAppSheet
        isOpen={whatsAppAbierto}
        onClose={() => setWhatsAppAbierto(false)}
        numeroComprobante={venta.numero}
        total={venta.total}
        fecha={venta.fecha}
        onCompartirPdf={compartir}
        compartiendoPdf={accionActiva === 'compartir'}
      />
    </div>
  );
};
