import React from 'react';
import {
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react';
import { SolesIcon } from '../ui/SolesIcon';
import type {
  EstadoOperativoCaja,
  AperturaCajaDto,
  ResumenParcialCajaDto,
  CajaActualResponseDto,
} from '../../types/caja';

export interface CajaStatusBannerProps {
  cajaActual?: CajaActualResponseDto | null;
  estado?: EstadoOperativoCaja;
  apertura?: AperturaCajaDto | null;
  resumenParcial?: ResumenParcialCajaDto | null;
  mensaje?: string | null;
  rolUsuario?: string;
  onAbrirCaja: () => void;
  onCerrarCaja: () => void;
  loading?: boolean;
}

export const CajaStatusBanner: React.FC<CajaStatusBannerProps> = ({
  cajaActual,
  estado: propEstado,
  apertura: propApertura,
  resumenParcial: propResumenParcial,
  mensaje: propMensaje,
  rolUsuario = 'Cajero',
  onAbrirCaja,
  onCerrarCaja,
  loading = false,
}) => {
  // Consolidar props directas o del objeto cajaActual
  const estado: EstadoOperativoCaja = propEstado || cajaActual?.estado || 'sinCaja';
  const apertura = propApertura !== undefined ? propApertura : (cajaActual?.apertura ?? null);
  const resumen = propResumenParcial !== undefined ? propResumenParcial : (cajaActual?.resumenParcial ?? null);
  const mensajeServidor = propMensaje || cajaActual?.mensaje || cajaActual?.message;

  const esCajero = rolUsuario === 'Cajero';
  const esCajeroOAdmin = rolUsuario === 'Cajero' || rolUsuario === 'Administrador';

  // Formato amigable de hora
  const formatearHoraApertura = (isoDate?: string, localStr?: string) => {
    if (localStr) return localStr;
    if (!isoDate) return '--:--';
    try {
      const d = new Date(isoDate);
      return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoDate;
    }
  };

  // --------------------------------------------------------------------------
  // ESTADO 1: ANTERIOR SIN CERRAR (MSG-168) - BLOQUEO CRÍTICO
  // --------------------------------------------------------------------------
  if (estado === 'anteriorSinCerrar') {
    const fechaAperturaStr = apertura?.fechaAperturaLocal || apertura?.fechaApertura?.substring(0, 10) || 'un día anterior';
    const textoMensaje = mensajeServidor || `Hay una caja del ${fechaAperturaStr} sin cerrar. Ciérrela antes de abrir una nueva o cobrar.`;

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="shrink-0 p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-200"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-200 text-rose-800 shrink-0 whitespace-nowrap">
                Bloqueo Operativo: Caja anterior sin cerrar
              </span>
              <h3 className="font-sans font-bold text-base sm:text-lg text-rose-900">
                Caja anterior sin cerrar
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-rose-800 mt-1 font-medium">
              {textoMensaje}
            </p>
            <p className="text-xs text-danger mt-0.5">
              No es posible aperturar un nuevo turno ni cobrar pedidos hasta que la jornada previa sea conciliada y cerrada.
            </p>
          </div>
        </div>

        {esCajeroOAdmin && (
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            <button
              type="button"
              onClick={onCerrarCaja}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer min-h-[44px] flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>CERRAR CAJA PENDIENTE</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ESTADO 2: ABIERTA (OPERATIVA)
  // --------------------------------------------------------------------------
  if (estado === 'abierta') {
    const hora = formatearHoraApertura(apertura?.fechaApertura, apertura?.fechaAperturaLocal);
    const usuario = apertura?.nombreUsuarioApertura || 'Cajero';

    return (
      <div
        role="region"
        aria-label="Estado de caja operativa"
        className="shrink-0 p-4 sm:p-5 rounded-2xl bg-surface-success border border-emerald-200/90 text-emerald-950 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-in fade-in duration-200"
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
            <Unlock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Caja Abierta
              </span>
              <span className="text-xs text-neutral-500">· Turno vigente</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-emerald-900 mt-1 flex items-center gap-2 flex-wrap">
              <span>Caja abierta desde las <strong>{hora}</strong> por <strong>{usuario}</strong>.</span>
              {apertura?.montoInicial !== undefined && (
                <span className="text-neutral-600">
                  (Fondo inicial: <strong className="tabular-nums">S/ {apertura.montoInicial.toFixed(2)}</strong>)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Resumen contable rápido y botón de cierre */}
        <div className="flex items-center gap-4 flex-wrap justify-between lg:justify-end">
          {resumen && (
            <div className="flex items-center gap-3 text-xs bg-surface/80 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-2xs tabular-nums">
              <div>
                <span className="text-neutral-500 block text-xs uppercase font-bold">Ventas ({resumen.cantidadVentas})</span>
                <span className="font-bold text-ink">S/ {resumen.totalVentas.toFixed(2)}</span>
              </div>
              <div className="h-6 w-px bg-neutral-200" />
              <div>
                <span className="text-neutral-500 block text-xs uppercase font-bold">Efectivo</span>
                <span className="font-bold text-neutral-700">S/ {resumen.totalEfectivo.toFixed(2)}</span>
              </div>
              <div className="h-6 w-px bg-neutral-200" />
              <div>
                <span className="text-neutral-500 block text-xs uppercase font-bold">Yape</span>
                <span className="font-bold text-neutral-700">S/ {resumen.totalYape.toFixed(2)}</span>
              </div>
            </div>
          )}

          {esCajeroOAdmin && (
            <button
              type="button"
              onClick={onCerrarCaja}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-stone-300 bg-surface hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer min-h-[44px] flex items-center gap-1.5"
            >
              <Lock className="w-4 h-4 text-stone-500" />
              <span>Cerrar caja</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ESTADO 3: SIN CAJA (MSG-166)
  // --------------------------------------------------------------------------
  const textoMensaje = mensajeServidor || 'Todavía no hay caja abierta. Ábrala para empezar a cobrar.'; // MSG-166

  return (
    <div
      role="region"
      aria-label="Aviso de caja cerrada"
      className="shrink-0 p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 animate-in fade-in duration-200"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-100 text-accent flex items-center justify-center shrink-0 border border-amber-200/80 shadow-2xs">
          <Lock className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-200 text-amber-800 shrink-0 whitespace-nowrap">
              Caja Inactiva
            </span>
            <h4 className="font-bold text-sm sm:text-base text-ink">
              {textoMensaje}
            </h4>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            Debe registrar el fondo inicial para habilitar el cobro de pedidos en salón y comandas para llevar.
          </p>
        </div>
      </div>

      {esCajero && (
        <button
          type="button"
          onClick={onAbrirCaja}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer shrink-0 min-h-[44px] flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <SolesIcon className="w-4 h-4" />
          <span>ABRIR CAJA</span>
        </button>
      )}
    </div>
  );
};

export default CajaStatusBanner;
