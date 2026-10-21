import React from 'react';
import type {
  BloqueMesas,
  BloqueSimpleCantidad
} from '../../types/inicio';
import {
  CheckCircle2,
  Utensils,
  UtensilsCrossed,
  Clock,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';

export interface DashboardMozoViewProps {
  bloques: Record<string, any>;
  onNavigate: (pagina: string, params?: any) => void;
  renderBloqueError: (nombre: string) => React.ReactNode;
}

export const DashboardMozoView: React.FC<DashboardMozoViewProps> = ({
  bloques,
  onNavigate,
  renderBloqueError
}) => {
  const mesasRes = bloques.mesas;
  const enCursoRes = bloques.misPedidosEnCurso;
  const misListosRes = bloques.misListos;

  const mesas: BloqueMesas | null = mesasRes?.estado === 'ok' ? mesasRes.datos : null;
  const enCurso: BloqueSimpleCantidad | null = enCursoRes?.estado === 'ok' ? enCursoRes.datos : null;
  const misListos: BloqueSimpleCantidad | null = misListosRes?.estado === 'ok' ? misListosRes.datos : null;

  return (
    <div className="space-y-6">
      {/* Aviso prioritario si tiene pedidos listos por recoger */}
      {misListos && misListos.cantidad > 0 ? (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-4 text-emerald-900 shadow-xs animate-pulse">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">¡Tiene {misListos.cantidad} pedido(s) listos en cocina!</p>
              <p className="text-xs text-emerald-700">Por favor, acérquese a recogerlos para servir a los comensales.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('pedidos', { estado: 'listo' })}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
          >
            Ver Pedidos
          </button>
        </div>
      ) : (
        <div className="p-3.5 bg-neutral-50 border border-neutral-200/80 rounded-xl text-neutral-600 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-neutral-500 shrink-0" />
          <span>No tiene pedidos listos por recoger.</span>
        </div>
      )}

      {/* ACCESOS RÁPIDOS DEL MOZO */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs">
        <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
          Acciones Operativas del Salón
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onNavigate('pedido-mesa')}
            className="p-4 bg-[#C74E00] text-white hover:bg-[#b84500] rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer min-h-[48px]"
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span>NUEVO PEDIDO DE MESA</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('mesas')}
            className="p-4 bg-white border border-neutral-200/80 hover:border-[#D35400] rounded-xl font-bold text-sm text-neutral-800 hover:text-[#B84500] shadow-xs hover:shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer min-h-[48px]"
          >
            <LayoutGrid className="w-5 h-5 text-[#B84500]" />
            <span>VER MESAS Y SALÓN</span>
          </button>
        </div>
      </div>

      {/* INDICADORES DEL MOZO (RV-154: Sin montos económicos) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Mesas Libres y Ocupadas */}
        {mesasRes?.estado === 'error' ? (
          renderBloqueError('mesas')
        ) : (
          <div
            onClick={() => onNavigate('mesas')}
            className="p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:border-[#D35400] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Estado de Mesas
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-sans tabular-nums text-emerald-700 mb-1">
                {mesas?.libres ?? 0} <span className="text-sm font-normal text-neutral-500">libres</span>
              </div>
              <p className="text-xs text-neutral-600 mt-2">
                Ocupadas: <strong className="text-rose-700 tabular-nums">{mesas?.ocupadas ?? 0}</strong> mesas
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-[#B84500] font-semibold">
              <span>Ir al mapa de mesas</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}

        {/* Mis Pedidos en Curso */}
        {enCursoRes?.estado === 'error' ? (
          renderBloqueError('misPedidosEnCurso')
        ) : (
          <div
            onClick={() => onNavigate('pedidos')}
            className="p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:border-[#D35400] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Mis Pedidos en Curso
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mb-1">
                {enCurso?.cantidad ?? 0} <span className="text-sm font-normal text-neutral-500">activos</span>
              </div>
              <p className="text-xs text-neutral-600 mt-2">
                Pedidos tomados por usted en preparación o pendientes.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-[#B84500] font-semibold">
              <span>Ver mis pedidos</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}

        {/* Mis Pedidos Listos */}
        {misListosRes?.estado === 'error' ? (
          renderBloqueError('misListos')
        ) : (
          <div
            onClick={() => onNavigate('pedidos', { estado: 'listo' })}
            className="p-5 bg-white border border-neutral-200/80 rounded-2xl shadow-xs hover:border-[#D35400] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Mis Pedidos Listos
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mb-1">
                {misListos?.cantidad ?? 0} <span className="text-sm font-normal text-neutral-500">por recoger</span>
              </div>
              <p className="text-xs text-neutral-600 mt-2">
                Platos listos en cocina esperando ser servidos.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-[#B84500] font-semibold">
              <span>Ver pedidos listos</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardMozoView;
