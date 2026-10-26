import React from 'react';
import type {
  BloqueComandasCocinero,
  BloqueAgotadosCocinero
} from '../../types/inicio';
import {
  ChefHat,
  Utensils,
  Clock,
  ChevronRight
} from 'lucide-react';

export interface DashboardCocineroViewProps {
  bloques: Record<string, any>;
  onNavigate: (pagina: string, params?: any) => void;
  renderBloqueError: (nombre: string) => React.ReactNode;
}

export const DashboardCocineroView: React.FC<DashboardCocineroViewProps> = ({
  bloques,
  onNavigate,
  renderBloqueError
}) => {
  const comandasRes = bloques.comandas;
  const agotadosRes = bloques.agotados;

  const comandas: BloqueComandasCocinero | null = comandasRes?.estado === 'ok' ? comandasRes.datos : null;
  const agotados: BloqueAgotadosCocinero | null = agotadosRes?.estado === 'ok' ? agotadosRes.datos : null;

  const tieneDemora = (comandas?.masAntiguaMinutos ?? 0) >= 15;

  return (
    <div className="space-y-6">
      {/* Alerta si hay demoras de preparación (RV-152, E-365) */}
      {tieneDemora && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-4 text-amber-900 shadow-xs animate-pulse">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-warning shrink-0" />
            <div>
              <p className="text-sm font-bold">
                Atención: hay comandas con más de 15 minutos de espera ({comandas?.masAntiguaMinutos} min).
              </p>
              <p className="text-xs text-amber-700">
                Priorice las órdenes más antiguas para reducir el tiempo del servicio.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('cocina')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
          >
            Ver Comandas
          </button>
        </div>
      )}

      {/* ACCESOS RÁPIDOS DEL COCINERO */}
      <div className="bg-surface border border-neutral-200/80 rounded-2xl p-5 shadow-xs">
        <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
          Operación de Cocina KDS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onNavigate('cocina')}
            className="p-4 bg-primary text-white hover:bg-primary-hover rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer min-h-[48px]"
          >
            <ChefHat className="w-5 h-5" />
            <span>PANTALLA DE COMANDAS (KDS)</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('menu-dia')}
            className="p-4 bg-surface border border-neutral-200/80 hover:border-accent rounded-xl font-bold text-sm text-neutral-800 hover:text-accent shadow-xs hover:shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer min-h-[48px]"
          >
            <Utensils className="w-5 h-5 text-accent" />
            <span>MARCAR PLATOS AGOTADOS / MENÚ</span>
          </button>
        </div>
      </div>

      {/* INDICADORES DEL COCINERO (RV-154: Sin montos económicos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Comandas Activas */}
        {comandasRes?.estado === 'error' ? (
          renderBloqueError('comandas')
        ) : (
          <div
            onClick={() => onNavigate('cocina')}
            className="p-5 bg-surface border border-neutral-200/80 rounded-2xl shadow-xs hover:border-accent hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Comandas por Preparar
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  tieneDemora ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {tieneDemora ? 'Demora' : 'Ritmo Normal'}
                </span>
              </div>
              <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mb-1">
                {(comandas?.pendientes ?? 0) + (comandas?.enPreparacion ?? 0)} <span className="text-sm font-normal text-neutral-500">en cocina</span>
              </div>
              <div className="text-xs text-neutral-600 space-y-1 mt-3">
                <div className="flex justify-between">
                  <span>Pendientes por iniciar:</span>
                  <span className="font-semibold tabular-nums text-neutral-800">{comandas?.pendientes ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>En preparación en fogón:</span>
                  <span className="font-semibold tabular-nums text-orange-700">{comandas?.enPreparacion ?? 0}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-100">
                  <span>Espera de la comanda más antigua:</span>
                  <span className={`font-bold tabular-nums ${tieneDemora ? 'text-rose-700' : 'text-neutral-700'}`}>
                    {comandas?.masAntiguaMinutos ?? 0} min
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-accent font-semibold">
              <span>Abrir pantalla de cocina</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}

        {/* Platos Agotados */}
        {agotadosRes?.estado === 'error' ? (
          renderBloqueError('agotados')
        ) : (
          <div
            onClick={() => onNavigate('menu-dia')}
            className="p-5 bg-surface border border-neutral-200/80 rounded-2xl shadow-xs hover:border-accent hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Platos Agotados Hoy
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  (agotados?.cantidad ?? 0) > 0 ? 'bg-rose-100 text-rose-800' : 'bg-neutral-100 text-neutral-700'
                }`}>
                  {agotados?.cantidad ?? 0} agotados
                </span>
              </div>
              {agotados && agotados.cantidad > 0 ? (
                <div className="space-y-1.5 mt-2">
                  <p className="text-xs text-neutral-500">Platos marcados como sin stock:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {agotados.platos.map((plato, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-xs font-semibold"
                      >
                        {plato}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-500 mt-2">
                  Todos los platos del menú del día están disponibles para el salón.
                </p>
              )}
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-accent font-semibold">
              <span>Gestionar disponibilidad</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCocineroView;
