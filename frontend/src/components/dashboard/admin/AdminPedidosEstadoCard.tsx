import React from 'react';
import { ClipboardList, ArrowRight } from 'lucide-react';
import type { BloquePedidosPorEstado } from '../../../types/inicio';

export interface AdminPedidosEstadoCardProps {
  pedidosRes: any;
  pedidos: BloquePedidosPorEstado | null;
  onNavigate: (pagina: string, params?: any) => void;
  renderBloqueError: (nombre: string) => React.ReactNode;
}

export const AdminPedidosEstadoCard: React.FC<AdminPedidosEstadoCardProps> = ({
  pedidosRes,
  pedidos,
  onNavigate,
  renderBloqueError
}) => {
  return (
    <div className="bg-surface border border-neutral-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
          <h3 className="font-sans font-bold text-neutral-800 text-sm flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-info" />
            <span>Estado de Pedidos</span>
          </h3>
          <span className="text-xs font-semibold text-neutral-500">Operación</span>
        </div>

        {pedidosRes?.estado === 'error' ? (
          renderBloqueError('pedidosPorEstado')
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {/* Pendientes */}
            <button
              type="button"
              onClick={() => onNavigate('pedidos', { estado: 'pendiente' })}
              className="p-3 rounded-xl border border-neutral-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-left cursor-pointer group"
            >
              <span className="text-xs font-medium text-neutral-500 block">Pendientes</span>
              <span className="text-lg font-bold tabular-nums text-amber-700">
                {pedidos?.pendiente ?? 0}
              </span>
            </button>

            {/* En preparación */}
            <button
              type="button"
              onClick={() => onNavigate('pedidos', { estado: 'en_preparacion' })}
              className="p-3 rounded-xl border border-neutral-200 hover:border-orange-400 hover:bg-orange-50/50 transition-all text-left cursor-pointer group"
            >
              <span className="text-xs font-medium text-neutral-500 block">En Cocina</span>
              <span className="text-lg font-bold tabular-nums text-accent">
                {pedidos?.enPreparacion ?? 0}
              </span>
            </button>

            {/* Listos */}
            <button
              type="button"
              onClick={() => onNavigate('pedidos', { estado: 'listo' })}
              className="p-3 rounded-xl border border-neutral-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left cursor-pointer group"
            >
              <span className="text-xs font-medium text-neutral-500 block">Listos</span>
              <span className="text-lg font-bold tabular-nums text-blue-700">
                {pedidos?.listo ?? 0}
              </span>
            </button>

            {/* Por cobrar */}
            <button
              type="button"
              onClick={() => onNavigate('pedidos', { estado: 'listo' })}
              className="p-3 rounded-xl border border-neutral-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all text-left cursor-pointer group"
            >
              <span className="text-xs font-medium text-neutral-500 block">Por Cobrar</span>
              <span className="text-lg font-bold tabular-nums text-purple-700">
                {pedidos?.porCobrar ?? 0}
              </span>
            </button>

            {/* Pagados */}
            <button
              type="button"
              onClick={() => onNavigate('pedidos', { estado: 'pagado' })}
              className="p-3 rounded-xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left cursor-pointer group"
            >
              <span className="text-xs font-medium text-neutral-500 block">Pagados</span>
              <span className="text-lg font-bold tabular-nums text-neutral-700">
                {pedidos?.pagado ?? 0}
              </span>
            </button>

            {/* Anulado */}
            <button
              type="button"
              onClick={() => onNavigate('pedidos', { estado: 'anulado' })}
              className="p-3 rounded-xl border border-neutral-200 hover:border-rose-400 hover:bg-rose-50/50 transition-all text-left cursor-pointer group"
            >
              <span className="text-xs font-medium text-neutral-500 block">Anulados</span>
              <span className="text-lg font-bold tabular-nums text-rose-700">
                {pedidos?.anulado ?? 0}
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
        <span>Gestión completa en Pedidos</span>
        <ArrowRight className="w-3.5 h-3.5 text-accent" />
      </div>
    </div>
  );
};
