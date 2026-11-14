import React, { useState, useEffect, useId } from 'react';
import { MessageCircle, Share2, Info, AlertCircle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { AppLauncher } from '@capacitor/app-launcher';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import {
  normalizarCelularPeru,
  armarMensajeComprobante,
  urlWhatsApp,
} from '../../utils/whatsapp';
import { useHaptics } from '../../hooks/useHaptics';

export interface EnviarWhatsAppSheetProps {
  isOpen: boolean;
  onClose: () => void;
  numeroComprobante: string;
  total: number;
  fecha: string;
  onCompartirPdf: () => void | Promise<void>;
  compartiendoPdf?: boolean;
}

export const EnviarWhatsAppSheet: React.FC<EnviarWhatsAppSheetProps> = ({
  isOpen,
  onClose,
  numeroComprobante,
  total,
  fecha,
  onCompartirPdf,
  compartiendoPdf = false,
}) => {
  const [celular, setCelular] = useState('');
  const [errorCelular, setErrorCelular] = useState<string | null>(null);
  const [abriendo, setAbriendo] = useState(false);

  const inputId = useId();
  const helpId = useId();
  const errorId = useId();
  const { triggerLight, triggerSuccess, triggerError } = useHaptics();

  // Descartar el número inmediatamente al cerrar o abrir la hoja (nunca persiste)
  useEffect(() => {
    if (!isOpen) {
      setCelular('');
      setErrorCelular(null);
      setAbriendo(false);
    }
    return () => {
      setCelular('');
      setErrorCelular(null);
    };
  }, [isOpen]);

  const mensajeVistaPrevia = armarMensajeComprobante({
    numero: numeroComprobante,
    total,
    fecha,
  });

  const handleCambioCelular = (valor: string) => {
    setCelular(valor);
    const recorte = valor.trim();
    if (!recorte) {
      setErrorCelular(null);
      return;
    }
    const normalizado = normalizarCelularPeru(recorte);
    if (!normalizado) {
      setErrorCelular('Ingrese un celular de 9 dígitos que empiece con 9.');
    } else {
      setErrorCelular(null);
    }
  };

  const handleAbrirWhatsApp = async () => {
    const recorte = celular.trim();
    let celularValidado: string | null = null;

    if (recorte) {
      celularValidado = normalizarCelularPeru(recorte);
      if (!celularValidado) {
        triggerError();
        setErrorCelular('Ingrese un celular de 9 dígitos que empiece con 9.');
        return;
      }
    }

    setErrorCelular(null);
    setAbriendo(true);

    try {
      const enlace = urlWhatsApp(celularValidado, mensajeVistaPrevia);
      if (Capacitor.isNativePlatform()) {
        await AppLauncher.openUrl({ url: enlace });
      } else if (typeof window !== 'undefined') {
        window.open(enlace, '_blank', 'noopener,noreferrer');
      }
      triggerSuccess();
      setCelular('');
      onClose();
    } catch {
      triggerError();
      setErrorCelular('No se pudo abrir WhatsApp en este dispositivo.');
    } finally {
      setAbriendo(false);
    }
  };

  const handleCerrar = () => {
    setCelular('');
    setErrorCelular(null);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleCerrar}
      title="Enviar comprobante por WhatsApp"
    >
      <div className="space-y-4">
        {/* Campo de celular opcional (solo vive en memoria local de esta hoja) */}
        <div>
          <label
            htmlFor={inputId}
            className="text-xs font-bold text-ink block mb-1.5"
          >
            Celular del cliente (opcional)
          </label>
          <input
            id={inputId}
            type="tel"
            inputMode="tel"
            maxLength={16}
            autoComplete="off"
            value={celular}
            onChange={(e) => handleCambioCelular(e.target.value)}
            placeholder="Ej. 987 654 321"
            aria-describedby={errorCelular ? `${helpId} ${errorId}` : helpId}
            aria-invalid={Boolean(errorCelular)}
            className={`w-full bg-canvas border rounded-xl px-3.5 py-2.5 text-sm font-mono text-ink placeholder:text-ink-muted focus:outline-hidden min-h-[44px] ${
              errorCelular ? 'border-danger focus:border-danger' : 'border-line focus:border-primary'
            }`}
          />
          <p id={helpId} className="text-xs text-ink-muted mt-1.5">
            9 dígitos. Si lo deja vacío, elegirá el contacto en WhatsApp.
          </p>

          {errorCelular && (
            <div
              id={errorId}
              role="alert"
              className="mt-2 p-2.5 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs font-bold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{errorCelular}</span>
            </div>
          )}
        </div>

        {/* Vista previa del mensaje */}
        <div className="bg-canvas border border-line rounded-2xl p-3.5 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
            Vista previa del mensaje
          </span>
          <pre className="text-xs font-sans text-ink whitespace-pre-wrap break-words leading-relaxed">
            {mensajeVistaPrevia}
          </pre>
        </div>

        {/* Aviso fijo sobre adjunto de PDF */}
        <div className="p-3 rounded-xl bg-surface border border-line flex items-start gap-2.5 text-xs text-ink-muted">
          <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">
            WhatsApp no permite adjuntar el PDF automáticamente: use «Compartir PDF» para enviarlo.
          </p>
        </div>

        {/* Acciones: primario Abrir WhatsApp y secundario Compartir PDF */}
        <div className="flex flex-col gap-2.5 pt-1">
          <Button
            type="button"
            fullWidth
            size="lg"
            variant="primary"
            disabled={abriendo || Boolean(errorCelular)}
            isLoading={abriendo}
            onClick={() => void handleAbrirWhatsApp()}
            aria-label="Abrir WhatsApp para enviar el mensaje del comprobante"
            className="min-h-[48px] flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            <span>Abrir WhatsApp</span>
          </Button>

          <Button
            type="button"
            fullWidth
            size="lg"
            variant="secondary"
            disabled={compartiendoPdf || abriendo}
            isLoading={compartiendoPdf}
            onClick={() => {
              triggerLight();
              void onCompartirPdf();
            }}
            aria-label="Compartir archivo PDF del comprobante"
            className="min-h-[48px] flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" aria-hidden="true" />
            <span>Compartir PDF</span>
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
