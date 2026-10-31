import React from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import type { AlertaInicio } from '../../../types/inicio';

export interface AdminAlertsSectionProps {
  alertasRes: any;
  alertas: AlertaInicio[];
  onNavigate: (pagina: string, params?: any) => void;
  renderBloqueError: (nombre: string) => React.ReactNode;
}

export const AdminAlertsSection: React.FC<AdminAlertsSectionProps> = ({
  alertasRes,
  alertas,
  onNavigate,
  renderBloqueError
}) => {
  return (
    <div>
      {alertasRes?.estado === 'error' ? (
        renderBloqueError('alertas')
      ) : alertas.length > 0 ? (
        <div className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
            Alertas de Atención Inmediata ({alertas.length})
          </h2>
          <div className="space-y-2">
            {alertas.map((alerta, idx) => {
              const esCaja = alerta.tipo === 'caja_anterior';
              return (
                <div
                  key={`${alerta.tipo}-${idx}`}
                  className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all ${
                    esCaja
                      ? 'bg-rose-50/90 border-rose-300 text-rose-900'
                      : alerta.tipo === 'comandas_demora'
                      ? 'bg-amber-50/90 border-amber-300 text-amber-900'
                      : 'bg-orange-50/70 border-orange-200 text-orange-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      esCaja ? 'bg-rose-200/80 text-rose-700' : 'bg-amber-200/80 text-amber-700'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{alerta.texto}</p>
                      <p className="text-xs opacity-75 mt-0.5">
                        Prioridad {alerta.prioridad} · Requiere gestión del administrador
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate(alerta.enlace)}
                    className={`self-end sm:self-auto px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer min-h-[36px] flex items-center gap-1.5 shrink-0 ${
                      esCaja
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-primary hover:bg-primary-hover text-white'
                    }`}
                  >
                    <span>Resolver</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Todo en orden:</span> no hay alertas por atender en este momento.
          </div>
        </div>
      )}
    </div>
  );
};
