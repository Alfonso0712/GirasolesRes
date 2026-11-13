import React, { useState, useEffect } from 'react';
import { Globe, RefreshCw, Check, AlertTriangle, AlertCircle, RotateCcw } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { DEFAULT_API_BASE, getApiBaseUrl, setApiBaseUrl } from '../../services/apiClient';
import { useHaptics } from '../../hooks/useHaptics';

interface ServidorConfigSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onGuardado?: (nuevaUrl: string) => void;
}

interface ResultadoValidacion {
  url: string;
  esInsegura: boolean;
  error?: string;
}

function normalizarUrl(raw: string): ResultadoValidacion {
  let url = raw.trim();
  if (!url) {
    return { url: '', esInsegura: false, error: 'Ingrese una dirección de servidor válida.' };
  }
  if (!/^https?:\/\//i.test(url)) {
    return { url: '', esInsegura: false, error: 'La dirección debe comenzar con http:// o https://' };
  }
  url = url.replace(/\/+$/, '');
  try {
    const parsed = new URL(url);
    if (parsed.pathname === '' || parsed.pathname === '/') {
      url = `${url}/api`;
    }
  } catch {
    return { url: '', esInsegura: false, error: 'Formato de dirección URL inválido.' };
  }
  const esInsegura = url.startsWith('http://');
  return { url, esInsegura };
}

export const ServidorConfigSheet: React.FC<ServidorConfigSheetProps> = ({
  isOpen,
  onClose,
  onGuardado,
}) => {
  const [urlInput, setUrlInput] = useState<string>(getApiBaseUrl());
  const [probando, setProbando] = useState<boolean>(false);
  const [resultadoPrueba, setResultadoPrueba] = useState<{
    tipo: 'exito' | 'error' | 'advertencia';
    mensaje: string;
  } | null>(null);
  const [guardadoExitoso, setGuardadoExitoso] = useState<boolean>(false);

  const { triggerLight, triggerSuccess, triggerError } = useHaptics();

  useEffect(() => {
    if (isOpen) {
      setUrlInput(getApiBaseUrl());
      setResultadoPrueba(null);
      setGuardadoExitoso(false);
    }
  }, [isOpen]);

  const validacionActual = normalizarUrl(urlInput);

  const handleProbarConexion = async () => {
    triggerLight();
    const val = normalizarUrl(urlInput);
    if (val.error) {
      triggerError();
      setResultadoPrueba({ tipo: 'error', mensaje: val.error });
      return;
    }

    setProbando(true);
    setResultadoPrueba(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const endpoint = val.url.endsWith('/mesas') ? val.url : `${val.url}/mesas`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Cualquier respuesta 401 o 200 = Conexión correcta
      if (res.status === 200 || res.status === 401) {
        triggerSuccess();
        setResultadoPrueba({
          tipo: 'exito',
          mensaje: 'Conexión correcta con el servidor de Girasoles.',
        });
      } else if (res.status === 404) {
        triggerError();
        setResultadoPrueba({
          tipo: 'error',
          mensaje: 'El servidor respondió, pero la ruta de la API no existe. Revise la dirección.',
        });
      } else {
        triggerSuccess();
        setResultadoPrueba({
          tipo: 'exito',
          mensaje: `El servidor respondió con código ${res.status}. Conexión alcanzada.`,
        });
      }
    } catch {
      clearTimeout(timeoutId);
      triggerError();
      setResultadoPrueba({
        tipo: 'error',
        mensaje: 'No se pudo conectar con el servidor. Verifique la dirección y su conexión.',
      });
    } finally {
      setProbando(false);
    }
  };

  const handleGuardar = () => {
    triggerLight();
    const val = normalizarUrl(urlInput);
    if (val.error) {
      triggerError();
      setResultadoPrueba({ tipo: 'error', mensaje: val.error });
      return;
    }

    setApiBaseUrl(val.url);
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
    setApiBaseUrl('');
    const defecto = DEFAULT_API_BASE;
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
              placeholder="https://girasolesres.pp.ua/api"
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-line bg-canvas text-xs font-mono font-medium focus:outline-primary"
            />
          </div>
        </div>

        {/* Advertencia de conexión sin cifrar */}
        {validacionActual.esInsegura && (
          <div className="p-3 rounded-xl bg-warning-bg border border-warning-border text-warning text-xs font-medium flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Conexión sin cifrar: úsela solo para pruebas en red local.</span>
          </div>
        )}

        {/* Mensaje de resultado de prueba o guardado */}
        {resultadoPrueba && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
              resultadoPrueba.tipo === 'exito'
                ? 'bg-success-bg border border-success-border text-success'
                : 'bg-danger-bg border border-danger-border text-danger'
            }`}
          >
            {resultadoPrueba.tipo === 'exito' ? (
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{resultadoPrueba.mensaje}</span>
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
          <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
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
