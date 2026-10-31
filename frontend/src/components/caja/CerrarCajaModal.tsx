import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ContadorDenominacionesModal } from './ContadorDenominacionesModal';
import {
  ConfirmarCierreModal,
  CierreExitoSection,
  CerrarCajaHeader,
  CerrarCajaFooter,
  CerrarCajaFormBody,
  useCerrarCajaModal,
} from './cerrar-caja';

export interface CerrarCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCierreCompletado: () => void;
  token: string;
  onCobrarPedido?: (pedidoId: string) => void;
}

export const CerrarCajaModal: React.FC<CerrarCajaModalProps> = ({
  isOpen,
  onClose,
  onCierreCompletado,
  token,
  onCobrarPedido,
}) => {
  const {
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
  } = useCerrarCajaModal({
    isOpen,
    token,
    onClose,
    onCierreCompletado,
  });

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cerrar-caja-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fill-strong/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="bg-surface border border-neutral-200 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Encabezado */}
        <CerrarCajaHeader
          procesandoCierre={procesandoCierre}
          onClose={onClose}
        />

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-ink">
          {resultadoCierre ? (
            /* Vista de Éxito / Entregable de Cierre (RNF-48, MSG-181) */
            <CierreExitoSection
              resultadoCierre={resultadoCierre}
              descargandoPdf={descargandoPdf}
              onDescargarPdf={handleDescargarPdf}
            />
          ) : cargandoResumen ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-500">
              <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold">Calculando resumen contable en vivo…</p>
            </div>
          ) : errorCarga ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">Error al cargar datos de la caja</p>
                <p>{errorCarga}</p>
                <button
                  type="button"
                  onClick={cargarResumen}
                  className="mt-2 text-xs font-bold text-red-800 underline cursor-pointer"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : (
            /* Vista del Proceso de Cierre */
            <CerrarCajaFormBody
              errorServidor={errorServidor}
              resumen={resumen}
              tienePedidosPendientes={tienePedidosPendientes}
              onClose={onClose}
              onCobrarPedido={onCobrarPedido}
              onAbrirContador={() => setContadorModalOpen(true)}
              inputContadoRef={inputContadoRef}
              efectivoContadoInput={efectivoContadoInput}
              onEfectivoChange={(val) => {
                setEfectivoContadoInput(val);
                if (errorServidor) setErrorServidor(null);
              }}
              diferenciaCalculada={diferenciaCalculada}
              contadoNumerico={contadoNumerico}
              observacion={observacion}
              onObservacionChange={setObservacion}
            />
          )}

          {/* Diálogo Modal de Confirmación MSG-180 (RV-127 / E-306) */}
          <ConfirmarCierreModal
            isOpen={pasoConfirmacion}
            resumen={resumen}
            contadoNumerico={contadoNumerico}
            diferenciaCalculada={diferenciaCalculada}
            procesandoCierre={procesandoCierre}
            onCancel={() => setPasoConfirmacion(false)}
            onConfirm={handleConfirmarCierre}
            confirmDialogRef={confirmDialogRef}
            cancelBtnRef={cancelBtnRef}
          />
        </div>

        {/* Footer principal del modal */}
        <CerrarCajaFooter
          resultadoCierre={resultadoCierre}
          onClose={onClose}
          cargandoResumen={cargandoResumen}
          tienePedidosPendientes={tienePedidosPendientes}
          contadoNumerico={contadoNumerico}
          observacionLength={observacion.length}
          onAvanzarConfirmacion={handleAvanzarConfirmacion}
        />
      </div>

      {/* Modal Contador de Denominaciones */}
      <ContadorDenominacionesModal
        isOpen={contadorModalOpen}
        onClose={() => setContadorModalOpen(false)}
        onAplicarTotal={(tot) => {
          setEfectivoContadoInput(tot.toFixed(2));
          if (errorServidor) setErrorServidor(null);
        }}
      />
    </div>
  );
};

export default CerrarCajaModal;
