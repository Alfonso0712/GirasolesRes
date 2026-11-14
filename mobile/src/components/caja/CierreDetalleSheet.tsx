import React, { useState } from 'react';
import {
  FileText,
  User,
  Calendar,
  AlertTriangle,
  FileDown,
} from 'lucide-react';
import type { CierreDetalleDto } from '../../types/caja';
import { cajaService } from '../../services/cajaService';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { SkeletonList } from '../ui/Skeleton';
import { useHaptics } from '../../hooks/useHaptics';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, pluralizar } from '../../utils/format';
import { formatLimaFechaHora, obtenerHoyLimaYMD } from '../../utils/fechas';
import { compartirPdf } from '../../utils/archivos';

export interface CierreDetalleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cierre: CierreDetalleDto | null;
  cargando: boolean;
}

export const CierreDetalleSheet: React.FC<CierreDetalleSheetProps> = ({
  isOpen,
  onClose,
  cierre,
  cargando,
}) => {
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [errorPdf, setErrorPdf] = useState<string | null>(null);
  const { triggerLight, triggerSuccess, triggerError } = useHaptics();
  const { mostrar } = useToast();

  if (!isOpen) return null;

  const dif = cierre?.diferencia || 0;
  const estadoCuadre =
    cierre?.estadoCuadre ||
    (dif === 0 ? 'Cuadra' : dif > 0 ? 'Sobrante' : 'Faltante');

  const platos = cierre?.platos || cierre?.platosVendidos || [];
  const tieneAjustes =
    cierre?.ajustesPosteriores && cierre.ajustesPosteriores.length > 0;

  const handleDescargarActaPdf = async () => {
    if (!cierre) return;
    const idCierre = cierre.cajaId || cierre.id || cierre.cierreId;
    if (!idCierre) return;

    triggerLight();
    setDescargandoPdf(true);
    setErrorPdf(null);

    try {
      const blob = await cajaService.descargarCierrePdf(idCierre);
      const fechaRef = cierre.fechaCierre || cierre.fechaApertura;
      const fechaParsed = fechaRef ? new Date(fechaRef) : new Date();
      const fechaYmd = isNaN(fechaParsed.getTime())
        ? obtenerHoyLimaYMD()
        : obtenerHoyLimaYMD(fechaParsed);

      await compartirPdf(blob, `acta-cierre_${fechaYmd}.pdf`);
      triggerSuccess();
      mostrar({ tipo: 'exito', mensaje: 'Acta de cierre en PDF generada correctamente.' });
    } catch (err: unknown) {
      triggerError();
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'No se pudo descargar el acta de cierre en PDF.';
      setErrorPdf(msg);
      mostrar({ tipo: 'error', mensaje: msg });
    } finally {
      setDescargandoPdf(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de Acta de Cierre"
    >
      {cargando || !cierre ? (
        <SkeletonList count={4} />
      ) : (
        <div className="space-y-4">
          {/* Cabecera del turno */}
          <div className="bg-canvas border border-line rounded-2xl p-3.5 space-y-2">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-1.5 text-ink">
                <FileText className="w-4 h-4 text-accent shrink-0" />
                <span className="text-sm font-black">Acta de Arqueo y Cierre</span>
              </div>
              <StatusBadge estado={estadoCuadre} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted pt-1 border-t border-line">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-ink-muted" />
                <span>Apertura: {formatLimaFechaHora(cierre.fechaApertura)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-ink-muted" />
                <span>Cierre: {formatLimaFechaHora(cierre.fechaCierre)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 shrink-0 text-ink-muted" />
                <span>Cajero: {cierre.cajeroApertura}</span>
              </div>
            </div>

            {cierre.cajeroCierre && cierre.cajeroCierre !== cierre.cajeroApertura && (
              <div className="text-xs text-ink-muted flex items-center gap-1.5 pt-0.5">
                <User className="w-3 h-3 shrink-0" />
                <span>Cierre realizado por: {cierre.cajeroCierre}</span>
              </div>
            )}
          </div>

          {/* Balance contable y arqueo de efectivo */}
          <div className="bg-canvas border border-line rounded-2xl p-3.5 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
              Balance y Arqueo
            </span>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-ink-muted">
                <span>Fondo Inicial de Apertura:</span>
                <span className="font-bold text-ink tabular-nums">
                  {formatCurrency(cierre.montoInicial)}
                </span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Ventas en Efectivo:</span>
                <span className="font-bold text-ink tabular-nums">
                  {formatCurrency(cierre.ventasEfectivo)}
                </span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Ventas Digitales (Yape / Plin):</span>
                <span className="font-bold text-ink tabular-nums">
                  {formatCurrency(cierre.ventasYape)}
                </span>
              </div>
              <div className="flex justify-between font-extrabold text-ink border-t border-line pt-1.5">
                <span>
                  Total Facturado ({pluralizar(cierre.cantidadVentas, 'venta', 'ventas')}):
                </span>
                <span className="text-accent tabular-nums">
                  {formatCurrency(cierre.totalVentas)}
                </span>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-3 border border-line space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-ink-muted">Efectivo Esperado en Caja:</span>
                <span className="text-ink tabular-nums">
                  {formatCurrency(cierre.efectivoEsperado)}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-ink-muted">Efectivo Contado (Arqueo):</span>
                <span className="text-accent tabular-nums">
                  {formatCurrency(cierre.efectivoContado ?? cierre.efectivoEsperado)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-line font-black">
                <span>Resultado del Cuadre:</span>
                <div className="text-right">
                  {dif === 0 ? (
                    <span className="text-success font-black">Cuadra exactamente</span>
                  ) : dif > 0 ? (
                    <span className="text-info font-black">
                      Sobrante de {formatCurrency(dif)}
                    </span>
                  ) : (
                    <span className="text-danger font-black">
                      Faltante de {formatCurrency(Math.abs(dif))}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {cierre.observacion && (
              <div className="p-2.5 bg-surface border border-line rounded-xl text-xs space-y-0.5">
                <span className="text-xs font-bold text-ink-muted block uppercase">
                  Observación de Cierre
                </span>
                <p className="text-ink italic">«{cierre.observacion}»</p>
              </div>
            )}
          </div>

          {/* Ajustes posteriores (ventas anuladas después del cierre) */}
          {tieneAjustes && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-warning font-bold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Ajustes Posteriores al Cierre ({cierre.ajustesPosteriores!.length})
                </span>
              </div>

              <div className="divide-y divide-line bg-canvas rounded-xl border border-warning/40 overflow-hidden">
                {cierre.ajustesPosteriores!.map((a) => (
                  <div key={a.ventaId} className="p-3 text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-ink">{a.comprobante}</span>
                      <span className="text-danger tabular-nums">
                        -{formatCurrency(a.total)}
                      </span>
                    </div>
                    {a.motivo && (
                      <p className="text-xs text-ink-muted italic">«{a.motivo}»</p>
                    )}
                    <div className="flex justify-between text-xs text-ink-muted pt-0.5">
                      <span>Anulado por: {a.usuarioAnulacion || 'Administrador'}</span>
                      <span>
                        {formatLimaFechaHora(a.fechaAnulacion || a.fechaVentaLocal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platos más vendidos del turno */}
          {platos.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
                Platos Vendidos en el Turno ({platos.length})
              </span>

              <div className="divide-y divide-line bg-canvas rounded-xl border border-line overflow-hidden max-h-48 overflow-y-auto">
                {platos.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 text-xs flex justify-between items-center gap-2"
                  >
                    <span className="text-ink font-medium break-words">
                      <strong className="font-extrabold text-ink mr-1">{p.cantidad}x</strong>
                      {p.nombre}
                    </span>
                    <span className="font-bold text-accent tabular-nums shrink-0">
                      {formatCurrency(p.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errorPdf && (
            <p role="alert" className="text-xs font-semibold text-danger text-center">
              {errorPdf}
            </p>
          )}

          {/* Botón Descargar acta en PDF */}
          <Button
            fullWidth
            variant="primary"
            disabled={descargandoPdf}
            onClick={() => void handleDescargarActaPdf()}
            className="min-h-[48px] flex items-center justify-center gap-2 font-bold"
          >
            <FileDown className="w-4 h-4" aria-hidden="true" />
            <span>{descargandoPdf ? 'Generando PDF…' : 'Descargar acta en PDF'}</span>
          </Button>
        </div>
      )}
    </BottomSheet>
  );
};
