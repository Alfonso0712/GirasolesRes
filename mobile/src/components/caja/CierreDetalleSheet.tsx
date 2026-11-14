import React from 'react';
import {
  Lock,
  Unlock,
  Clock,
  User,
  AlertTriangle,
} from 'lucide-react';
import type { CierreDetalleDto } from '../../types/caja';
import { BottomSheet } from '../ui/BottomSheet';
import { StatusBadge } from '../ui/StatusBadge';
import { formatCurrency, pluralizar } from '../../utils/format';
import { formatLimaFechaHora } from '../../utils/fechas';

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
  if (!isOpen) return null;

  const esAbierta = cierre?.estado?.toLowerCase() === 'abierta';
  const dif = cierre?.diferencia !== undefined && cierre?.diferencia !== null ? Number(cierre.diferencia) : 0;
  const tieneAjustes = Boolean(cierre?.ajustesPosteriores && cierre.ajustesPosteriores.length > 0);
  const platos = cierre?.platosVendidos || cierre?.platos || [];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={cierre ? `Cierre · ${formatLimaFechaHora(cierre.fechaCierreLocal || cierre.fechaCierre || cierre.fechaApertura)}` : 'Detalle de Cierre'}
    >
      {cargando || !cierre ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-ink-muted">
          <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold">Cargando balance del turno...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cabecera del turno */}
          <div className="bg-canvas border border-line rounded-2xl p-3.5 space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    esAbierta ? 'bg-success-bg text-success' : 'bg-primary/10 text-primary'
                  }`}
                >
                  {esAbierta ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
                    Acta de Turno
                  </span>
                  <h3 className="text-base font-extrabold text-ink">
                    {formatLimaFechaHora(cierre.fechaCierreLocal || cierre.fechaCierre || cierre.fechaAperturaLocal || cierre.fechaApertura)}
                  </h3>
                </div>
              </div>
              <StatusBadge estado={cierre.estadoCuadre || (esAbierta ? 'Abierta' : 'Cerrada')} />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line text-xs text-ink-muted">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 shrink-0 text-ink-muted" />
                <span>Apertura: {formatLimaFechaHora(cierre.fechaAperturaLocal || cierre.fechaApertura)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 shrink-0 text-ink-muted" />
                <span>Cajero: {cierre.cajeroApertura}</span>
              </div>
            </div>

            {cierre.cajeroCierre && cierre.cajeroCierre !== cierre.cajeroApertura && (
              <div className="text-3xs text-ink-muted flex items-center gap-1.5 pt-0.5">
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
                <span className="font-bold text-ink tabular-nums">{formatCurrency(cierre.montoInicial)}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Ventas en Efectivo:</span>
                <span className="font-bold text-ink tabular-nums">{formatCurrency(cierre.ventasEfectivo)}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Ventas Digitales (Yape / Plin):</span>
                <span className="font-bold text-ink tabular-nums">{formatCurrency(cierre.ventasYape)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-ink border-t border-line pt-1.5">
                <span>Total Facturado ({pluralizar(cierre.cantidadVentas, 'venta', 'ventas')}):</span>
                <span className="text-accent tabular-nums">{formatCurrency(cierre.totalVentas)}</span>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-3 border border-line space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-ink-muted">Efectivo Esperado en Caja:</span>
                <span className="text-ink tabular-nums">{formatCurrency(cierre.efectivoEsperado)}</span>
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
                    <span className="text-info font-black">Sobrante de {formatCurrency(dif)}</span>
                  ) : (
                    <span className="text-danger font-black">Faltante de {formatCurrency(Math.abs(dif))}</span>
                  )}
                </div>
              </div>
            </div>

            {cierre.observacion && (
              <div className="p-2.5 bg-surface border border-line rounded-xl text-xs space-y-0.5">
                <span className="text-3xs font-bold text-ink-muted block uppercase">Observación de Cierre</span>
                <p className="text-ink italic">«{cierre.observacion}»</p>
              </div>
            )}
          </div>

          {/* Ajustes posteriores (ventas anuladas después del cierre) */}
          {tieneAjustes && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-warning font-bold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Ajustes Posteriores al Cierre ({cierre.ajustesPosteriores!.length})</span>
              </div>

              <div className="divide-y divide-line bg-canvas rounded-xl border border-warning/40 overflow-hidden">
                {cierre.ajustesPosteriores!.map((a) => (
                  <div key={a.ventaId} className="p-3 text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-ink">{a.comprobante}</span>
                      <span className="text-danger tabular-nums">-{formatCurrency(a.total)}</span>
                    </div>
                    {a.motivo && (
                      <p className="text-3xs text-ink-muted italic">«{a.motivo}»</p>
                    )}
                    <div className="flex justify-between text-3xs text-ink-muted pt-0.5">
                      <span>Anulado por: {a.usuarioAnulacion || 'Administrador'}</span>
                      <span>{formatLimaFechaHora(a.fechaAnulacion || a.fechaVentaLocal)}</span>
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
                  <div key={idx} className="p-2.5 text-xs flex justify-between items-center">
                    <span className="text-ink font-medium">
                      <strong className="font-extrabold text-ink mr-1">{p.cantidad}x</strong>
                      {p.nombre}
                    </span>
                    <span className="font-bold text-accent tabular-nums">
                      {formatCurrency(p.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nota informativa de PDF */}
          <p className="text-3xs text-ink-muted text-center pt-1">
            El reporte de balance y arqueo en PDF con firmas de responsabilidad está disponible en la versión web.
          </p>
        </div>
      )}
    </BottomSheet>
  );
};