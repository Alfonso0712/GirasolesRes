import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { cajaService } from '../../../services/cajaService';
import type { CierreResumenDto, CerrarCajaResponseDto } from '../../../types/caja';
import {
  parseContado,
  calcularDiferenciaCierre,
  validarCierreCaja,
} from '../../../utils/cajaMath';

interface UseCerrarCajaModalParams {
  isOpen: boolean;
  token: string;
  onClose: () => void;
  onCierreCompletado: () => void;
}

export function useCerrarCajaModal({
  isOpen,
  token,
  onClose,
  onCierreCompletado,
}: UseCerrarCajaModalParams) {
  const [cargandoResumen, setCargandoResumen] = useState<boolean>(true);
  const [resumen, setResumen] = useState<CierreResumenDto | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Formulario
  const [efectivoContadoInput, setEfectivoContadoInput] = useState<string>('');
  const [observacion, setObservacion] = useState<string>('');
  const [contadorModalOpen, setContadorModalOpen] = useState<boolean>(false);

  // Pasos de UI
  const [pasoConfirmacion, setPasoConfirmacion] = useState<boolean>(false);
  const [procesandoCierre, setProcesandoCierre] = useState<boolean>(false);
  const [descargandoPdf, setDescargandoPdf] = useState<boolean>(false);
  const [resultadoCierre, setResultadoCierre] = useState<CerrarCajaResponseDto | null>(null);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const inputContadoRef = useRef<HTMLInputElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmDialogRef = useRef<HTMLDivElement>(null);

  // Cargar resumen contable al abrir
  const cargarResumen = useCallback(async () => {
    setCargandoResumen(true);
    setErrorCarga(null);
    setErrorServidor(null);
    setPasoConfirmacion(false);
    setResultadoCierre(null);

    try {
      const data = await cajaService.obtenerResumenCierre(token);
      setResumen(data);
      // Pre-sugerir contado vacío para que el cajero cuente conscientemente
      setEfectivoContadoInput('');
      setObservacion('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al obtener el resumen de cierre.';
      setErrorCarga(msg);
    } finally {
      setCargandoResumen(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      cargarResumen();
    } else {
      setResultadoCierre(null);
      setErrorCarga(null);
      setErrorServidor(null);
      setPasoConfirmacion(false);
    }
  }, [isOpen, cargarResumen]);

  // Foco inicial en input de efectivo contado al abrir
  useEffect(() => {
    if (isOpen && !pasoConfirmacion && !resultadoCierre && !cargandoResumen) {
      setTimeout(() => {
        inputContadoRef.current?.focus();
      }, 50);
    }
  }, [isOpen, pasoConfirmacion, resultadoCierre, cargandoResumen]);

  // Foco en cancelar cuando se abre el diálogo de confirmación (RV-127 / E-306)
  useEffect(() => {
    if (pasoConfirmacion) {
      setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
    }
  }, [pasoConfirmacion]);

  // Focus trap y tecla Escape global
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (contadorModalOpen) return; // Contador maneja sus propias teclas

      if (e.key === 'Escape' && !procesandoCierre) {
        e.preventDefault();
        if (pasoConfirmacion) {
          setPasoConfirmacion(false);
        } else {
          onClose();
        }
        return;
      }

      if (e.key === 'Tab') {
        const container = pasoConfirmacion
          ? confirmDialogRef.current || modalRef.current
          : modalRef.current;
        if (!container) return;
        const focusableElements = container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, contadorModalOpen, pasoConfirmacion, procesandoCierre, onClose]);

  // Cálculo de diferencia en vivo
  const contadoNumerico = useMemo(
    () => parseContado(efectivoContadoInput),
    [efectivoContadoInput]
  );

  const diferenciaCalculada = useMemo(
    () => calcularDiferenciaCierre(contadoNumerico, resumen?.efectivoEsperado),
    [resumen?.efectivoEsperado, contadoNumerico]
  );

  const tienePedidosPendientes = (resumen?.pedidosPendientes?.length ?? 0) > 0;

  const validarCierre = (): { contado: number; obs: string } | null => {
    const res = validarCierreCaja(contadoNumerico, observacion);
    if (!res.ok) {
      setErrorServidor(res.error || 'Datos no válidos.');
      return null;
    }
    setErrorServidor(null);
    return { contado: res.contado!, obs: res.obs! };
  };

  const handleAvanzarConfirmacion = () => {
    const v = validarCierre();
    if (v !== null) {
      setPasoConfirmacion(true);
    }
  };

  const handleConfirmarCierre = async () => {
    if (procesandoCierre) return; // Guard contra doble clic rápido (RV-121, E-309)

    const v = validarCierre();
    if (v === null || !resumen) {
      setPasoConfirmacion(false);
      return;
    }

    setProcesandoCierre(true);
    setErrorServidor(null);

    try {
      const solicitudId = crypto.randomUUID();
      const res = await cajaService.cerrarCaja(
        {
          solicitudId,
          efectivoContado: v.contado,
          efectivoEsperadoMostrado: resumen.efectivoEsperado,
          observacion: v.obs || undefined,
        },
        token
      );

      setResultadoCierre(res);
      setPasoConfirmacion(false);
      onCierreCompletado();
    } catch (err: any) {
      if (err.codigo === 'caja_concurrencia' || err.codigo === 'totales_cambiaron') {
        // RV-129 / MSG-189
        setErrorServidor(
          err.message || 'Los totales cambiaron mientras contaba. Revise el resumen antes de cerrar.'
        );
        // Recargar resumen preservando el monto contado ingresado
        try {
          const nuevoResumen = await cajaService.obtenerResumenCierre(token);
          setResumen(nuevoResumen);
        } catch {
          // ignore
        }
      } else if (err.codigo === 'pedidos_pendientes') {
        setErrorServidor(
          err.message || 'No se puede cerrar la caja: hay pedidos pendientes de cobro.' // MSG-174
        );
        cargarResumen();
      } else {
        setErrorServidor(
          err.message || 'No se pudo cerrar la caja. La caja sigue abierta; intente nuevamente.' // MSG-183
        );
      }
      setPasoConfirmacion(false);
    } finally {
      setProcesandoCierre(false);
    }
  };

  const handleDescargarPdf = async () => {
    const cajaId = resultadoCierre?.cajaId || resumen?.cajaId;
    if (!cajaId || descargandoPdf) return;
    setDescargandoPdf(true);
    try {
      await cajaService.descargarCierrePdf(cajaId, token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al descargar el PDF.';
      alert(msg);
    } finally {
      setDescargandoPdf(false);
    }
  };

  return {
    cargandoResumen,
    resumen,
    errorCarga,
    cargarResumen,
    efectivoContadoInput,
    setEfectivoContadoInput,
    observacion,
    setObservacion,
    contadorModalOpen,
    setContadorModalOpen,
    pasoConfirmacion,
    setPasoConfirmacion,
    procesandoCierre,
    descargandoPdf,
    resultadoCierre,
    errorServidor,
    setErrorServidor,
    inputContadoRef,
    cancelBtnRef,
    modalRef,
    confirmDialogRef,
    contadoNumerico,
    diferenciaCalculada,
    tienePedidosPendientes,
    handleAvanzarConfirmacion,
    handleConfirmarCierre,
    handleDescargarPdf,
  };
}
