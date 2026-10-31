import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { CierreResumenDto } from '../../../types/caja';
import { PedidosPendientesCierreAlert } from './PedidosPendientesCierreAlert';
import { ResumenContableCards } from './ResumenContableCards';
import { ArqueoEfectivoSection } from './ArqueoEfectivoSection';
import { CerrarCajaDesgloseSection } from './CerrarCajaDesgloseSection';

interface CerrarCajaFormBodyProps {
  errorServidor: string | null;
  resumen: CierreResumenDto | null;
  tienePedidosPendientes: boolean;
  onClose: () => void;
  onCobrarPedido?: (pedidoId: string) => void;
  onAbrirContador: () => void;
  inputContadoRef: React.RefObject<HTMLInputElement | null>;
  efectivoContadoInput: string;
  onEfectivoChange: (val: string) => void;
  diferenciaCalculada: number | null;
  contadoNumerico: number | null;
  observacion: string;
  onObservacionChange: (val: string) => void;
}

export const CerrarCajaFormBody: React.FC<CerrarCajaFormBodyProps> = ({
  errorServidor,
  resumen,
  tienePedidosPendientes,
  onClose,
  onCobrarPedido,
  onAbrirContador,
  inputContadoRef,
  efectivoContadoInput,
  onEfectivoChange,
  diferenciaCalculada,
  contadoNumerico,
  observacion,
  onObservacionChange,
}) => {
  return (
    <>
      {errorServidor && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Aviso del Sistema</p>
            <p>{errorServidor}</p>
          </div>
        </div>
      )}

      {/* Bloqueo por Pedidos Pendientes (RV-122, RN-110, MSG-174) */}
      {tienePedidosPendientes && resumen && (
        <PedidosPendientesCierreAlert
          pedidosPendientes={resumen.pedidosPendientes}
          onClose={onClose}
          onCobrarPedido={onCobrarPedido}
        />
      )}

      {/* Tarjetas de Resumen Contable (5 Métricas Clave, RV-123) */}
      {resumen && <ResumenContableCards resumen={resumen} />}

      {/* Conteo de Efectivo y Diferencia (RV-124, RV-125) */}
      <ArqueoEfectivoSection
        tienePedidosPendientes={tienePedidosPendientes}
        onAbrirContador={onAbrirContador}
        inputContadoRef={inputContadoRef}
        efectivoContadoInput={efectivoContadoInput}
        onEfectivoChange={onEfectivoChange}
        diferenciaCalculada={diferenciaCalculada}
        contadoNumerico={contadoNumerico}
        efectivoEsperado={resumen?.efectivoEsperado}
        observacion={observacion}
        onObservacionChange={onObservacionChange}
      />

      {/* Desglose en 3 Bloques (D-017, RN-138, E-401): Carta, Menús Completos y Componentes */}
      {resumen && <CerrarCajaDesgloseSection resumen={resumen} />}
    </>
  );
};
