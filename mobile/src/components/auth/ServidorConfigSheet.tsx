// MÓDULO PROTEGIDO: conexión y modo demostración. No modificar sin actualizar mobile/CONNECTION.md y scripts/verify-connection.mjs

import React, { useState, useEffect } from 'react';
import { Globe, RefreshCw, Check, AlertTriangle, AlertCircle, RotateCcw } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import {
  URL_API_POR_DEFECTO,
  obtenerUrlBase,
  guardarUrl,
  restablecerUrl,
  normalizarUrl,
  probarConexion,
} from '../../config/serverConfig';
import { MODO_DEMO } from '../../config/appConfig';
import { useHaptics } from '../../hooks/useHaptics';

interface ServidorConfigSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onGuardado?: (nuevaUrl: string) => void;
}

export const ServidorConfigSheet: React.FC<ServidorConfigSheetProps> = ({
  isOpen,
  onClose,
  onGuardado,
}) => {
  const [urlInput, setUrlInput] = useState<string>(obtenerUrlBase());
  const [probando, setProbando] = useState<boolean>(false);
  const [resultadoPrueba, setResultadoPrueba] = useState<{
    tipo: 'exito' | 'error';
    mensaje: string;
    detalle?: string;
  } | null>(null);
  const [guardadoExitoso, setGuardadoExitoso] = useState<boolean>(false);

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();

  useEffect(() => {
    if (isOpen) {
      setUrlInput(obtenerUrlBase());
      setResultadoPrueba(null);
      setGuardadoExitoso(false);
    }
  }, [isOpen]);

  const validacionActual = normalizarUrl(urlInput);

  const handleProbarConexion = async () => {
    triggerLight();
    const val = normalizarUrl(urlInput);
    if (val.esBloqueado) {
      triggerError();
      setResultadoPrueba({
        tipo: 'error',
        mensaje: 'Esta dirección es el sitio web de Girasoles, no la API.',
        detalle: 'girasolesres.pp.ua es el sitio web y no la API de backend.',
      });
      return;
    }
    if (val.error) {
      triggerError();
      setResultadoPrueba({ tipo: 'error', mensaje: val.error });
      return;
    }

    setProbando(true);
    setResultadoPrueba(null);

    try {
      const res = await probarConexion(urlInput);
      if (res.exito) {
        triggerSuccess();
      } else {
        triggerError();
      }
      setResultadoPrueba({
        tipo: res.tipo,
        mensaje: res.mensaje,
        detalle: res.detalle,
      });
    } finally {
      setProbando(false);
    }
  };

  const handleGuardar = () => {
    triggerLight();
    const val = normalizarUrl(urlInput);
    if (val.esBloqueado) {
      triggerError();
      setResultadoPrueba({
        tipo: 'error',
        mensaje: 'Esta dirección es el sitio web de Girasoles, no la API.',
        detalle: 'No se permite guardar el sitio web como dirección del servidor.',
      });
      return;
    }
    if (val.error) {
      triggerError();
      setResultadoPrueba({ tipo: 'error', mensaje: val.error });
      return;
    }

    const res = guardarUrl(val.url);
    if (!res.ok) {
      triggerError();
      setResultadoPrueba({ tipo: 'error', mensaje: res.error || 'No se pudo guardar la dirección.' });
      return;
    }

    triggerSuccess();
    setGuardadoExitoso(true);
    if (onGuardado) onGuardado(val.url);

    setTimeout(() => {
      setGuardadoExitoso(false);
      onClose();
    }, 700);
  };

  const handleRestablecer = () => {
    triggerLight();
    restablecerUrl();
    const defecto = URL_API_POR_DEFECTO;
    setUrlInput(defecto);
    triggerSuccess();
    setResultadoPrueba({
      tipo: 'exito',
      mensaje: `Dirección restablecida al valor oficial (${defecto}).`,
    });
    if (onGuardado) onGuardado(defecto);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Configuración de Servidor">
      <div className="space-y-4 select-none pb-2">
        {/* Campo de dirección */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-ink">Dirección del servidor</label>
          <div className="relative">
            <Globe className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setResultadoPrueba(null);
              }}
              placeholder={URL_API_POR_DEFECTO}
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-line bg-canvas text-xs font-mono font-medium focus:outline-primary"
            />
          </div>
        </div>

        {/* Advertencia si corresponde al sitio web */}
        {validacionActual.esBloqueado && (
          <div className="p-3 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Esta dirección es el sitio web de Girasoles, no la API.</span>
          </div>
        )}

        {/* Advertencia de conexión sin cifrar */}
        {validacionActual.esInsegura && !validacionActual.esBloqueado && (
          <div className="p-3 rounded-xl bg-warning-bg border border-warning-border text-warning text-xs font-medium flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Conexión sin cifrar: úsela solo para pruebas en red local.</span>
          </div>
        )}

        {/* Mensaje de resultado de prueba o guardado */}
        {resultadoPrueba && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold space-y-1 ${
              resultadoPrueba.tipo === 'exito'
                ? 'bg-success-bg border border-success-border text-success'
                : 'bg-danger-bg border border-danger-border text-danger'
            }`}
          >
            <div className="flex items-start gap-2">
              {resultadoPrueba.tipo === 'exito' ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{resultadoPrueba.mensaje}</span>
            </div>
            {MODO_DEMO && resultadoPrueba.detalle && (
              <p className="text-xs text-ink-muted font-normal pl-6">
                {resultadoPrueba.detalle}
              </p>
            )}
          </div>
        )}

        {guardadoExitoso && (
          <div className="p-3 rounded-xl bg-success-bg border border-success-border text-success text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Dirección guardada correctamente.</span>
          </div>
        )}

        {/* Ayuda con formato y ejemplos en trato de usted */}
        <div className="p-3.5 bg-canvas border border-line rounded-2xl text-xs text-ink-muted space-y-1.5">
          <p className="font-bold text-ink">Instrucciones de configuración:</p>
          <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
            <li>
              <strong className="text-ink">Emulador de Android:</strong>{' '}
              <code className="font-mono bg-surface px-1.5 py-0.5 rounded border border-line">
                http://10.0.2.2:5050/api
              </code>
            </li>
            <li>
              <strong className="text-ink">Celular en la misma red Wi-Fi:</strong>{' '}
              <code className="font-mono bg-surface px-1.5 py-0.5 rounded border border-line">
                http://IP-de-su-PC:5050/api
              </code>
            </li>
            <li>
              <strong className="text-ink">Internet:</strong>{' '}
              <code className="font-mono bg-surface px-1.5 py-0.5 rounded border border-line">
                https://su-dominio/api
              </code>
            </li>
          </ul>
        </div>

        {/* Botones de Acción */}
        <div className="space-y-2 pt-1">
          <Button
            fullWidth
            size="md"
            variant="outline"
            isLoading={probando}
            onClick={handleProbarConexion}
            className="flex items-center justify-center gap-2 min-h-[44px]"
          >
            <RefreshCw className={`w-4 h-4 ${probando ? 'animate-spin' : ''}`} />
            <span>Probar conexión</span>
          </Button>

          <div className="flex gap-2">
            <Button
              size="md"
              variant="outline"
              onClick={handleRestablecer}
              className="flex items-center justify-center gap-1.5 min-h-[44px] shrink-0 px-4"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restablecer</span>
            </Button>
            <Button
              fullWidth
              size="md"
              disabled={validacionActual.esBloqueado || Boolean(validacionActual.error)}
              onClick={handleGuardar}
              className="flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Check className="w-4 h-4" />
              <span>Guardar</span>
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
