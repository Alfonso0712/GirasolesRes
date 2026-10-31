import React from 'react';
import {
  Utensils,
  UtensilsCrossed,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';
import { SolesIcon } from '../../ui/SolesIcon';
import type {
  BloqueVentasHoy,
  BloquePlatosHoy,
  BloquePedidosPorEstado,
  BloqueMesas,
} from '../../../types/inicio';

export interface AdminKpiCardsProps {
  ventasHoyRes?: { estado: string; datos?: BloqueVentasHoy };
  platosHoyRes?: { estado: string; datos?: BloquePlatosHoy };
  pedidosRes?: { estado: string; datos?: BloquePedidosPorEstado };
  mesasRes?: { estado: string; datos?: BloqueMesas };
  ventasHoy: BloqueVentasHoy | null;
  platosHoy: BloquePlatosHoy | null;
  pedidos: BloquePedidosPorEstado | null;
  mesas: BloqueMesas | null;
  onNavigate: (pagina: string) => void;
  renderBloqueError: (nombre: string) => React.ReactNode;
}

export const AdminKpiCards: React.FC<AdminKpiCardsProps> = ({
  ventasHoyRes,
  platosHoyRes,
  pedidosRes,
  mesasRes,
  ventasHoy,
  platosHoy,
  pedidos,
  mesas,
  onNavigate,
  renderBloqueError,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Tarjeta 1: Ventas de Hoy */}
      {ventasHoyRes?.estado === 'error' ? (
        renderBloqueError('ventasHoy')
      ) : (
        <div
          onClick={() => onNavigate('reportes')}
          className="p-5 bg-surface border border-neutral-200/80 rounded-2xl shadow-xs hover:shadow-md hover:border-accent transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Ventas de Hoy
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-accent flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <SolesIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mb-1">
              S/ {(ventasHoy?.total ?? 0).toFixed(2)}
            </div>
            {ventasHoy?.nVentas === 0 ? (
              <p className="text-xs text-neutral-500 italic mt-1">
                Todavía no hay ventas registradas hoy.
              </p>
            ) : (
              <div className="text-xs text-neutral-600 space-y-0.5 mt-2">
                <div className="flex justify-between">
                  <span>Efectivo:</span>
                  <span className="font-semibold tabular-nums">S/ {(ventasHoy?.efectivo ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Yape / Digital:</span>
                  <span className="font-semibold tabular-nums">S/ {(ventasHoy?.yape ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-100 text-xs text-neutral-500">
                  <span>Total ventas:</span>
                  <span className="font-medium">{ventasHoy?.nVentas ?? 0}</span>
                </div>
              </div>
            )}
          </div>
          <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-accent font-semibold">
            <span>Ver reporte de hoy</span>
            <ChevronRight className="w-4 h-4 group-hover:text-accent transition-colors" />
          </div>
        </div>
      )}

      {/* Tarjeta 2: Platos Vendidos */}
      {platosHoyRes?.estado === 'error' ? (
        renderBloqueError('platosHoy')
      ) : (
        <div
          onClick={() => onNavigate('reportes')}
          className="p-5 bg-surface border border-neutral-200/80 rounded-2xl shadow-xs hover:shadow-md hover:border-accent transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Platos Vendidos Hoy
              </span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-accent flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mb-1">
              {platosHoy?.total ?? 0} <span className="text-sm font-normal text-neutral-500">unidades</span>
            </div>
            <p className="text-xs text-neutral-600 mt-2">
              {platosHoy?.principales && platosHoy.principales.length > 0
                ? `Plato líder: ${platosHoy.principales[0].producto} (${platosHoy.principales[0].cantidad})`
                : 'Sin platos servidos aún hoy.'}
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-accent font-semibold">
            <span>Ver detalle de platos</span>
            <ChevronRight className="w-4 h-4 group-hover:text-accent transition-colors" />
          </div>
        </div>
      )}

      {/* Tarjeta 3: Pedidos por Estado */}
      {pedidosRes?.estado === 'error' ? (
        renderBloqueError('pedidosPorEstado')
      ) : (
        <div
          onClick={() => onNavigate('pedidos')}
          className="p-5 bg-surface border border-neutral-200/80 rounded-2xl shadow-xs hover:shadow-md hover:border-accent transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Pedidos de Hoy
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mb-1">
              {(pedidos?.pendiente ?? 0) + (pedidos?.enPreparacion ?? 0) + (pedidos?.listo ?? 0) + (pedidos?.pagado ?? 0)} <span className="text-sm font-normal text-neutral-500">total</span>
            </div>
            <div className="text-xs text-neutral-600 space-y-0.5 mt-2">
              <div className="flex justify-between">
                <span>En curso / Cocina:</span>
                <span className="font-semibold tabular-nums text-amber-700">
                  {(pedidos?.pendiente ?? 0) + (pedidos?.enPreparacion ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Listos / Por cobrar:</span>
                <span className="font-semibold tabular-nums text-blue-700">
                  {pedidos?.porCobrar ?? 0}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-accent font-semibold">
            <span>Gestionar pedidos</span>
            <ChevronRight className="w-4 h-4 group-hover:text-accent transition-colors" />
          </div>
        </div>
      )}

      {/* Tarjeta 4: Mesas del Salón */}
      {mesasRes?.estado === 'error' ? (
        renderBloqueError('mesas')
      ) : (
        <div
          onClick={() => onNavigate('mesas')}
          className="p-5 bg-surface border border-neutral-200/80 rounded-2xl shadow-xs hover:shadow-md hover:border-accent transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Mesas y Salón
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <Utensils className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-sans tabular-nums text-neutral-900 mb-1">
              {mesas?.libres ?? 0} <span className="text-sm font-normal text-emerald-700">libres</span>
            </div>
            <div className="text-xs text-neutral-600 space-y-0.5 mt-2">
              <div className="flex justify-between">
                <span>Mesas ocupadas:</span>
                <span className="font-semibold tabular-nums text-rose-700">{mesas?.ocupadas ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total mesas:</span>
                <span className="font-semibold tabular-nums">{(mesas?.libres ?? 0) + (mesas?.ocupadas ?? 0)}</span>
              </div>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-accent font-semibold">
            <span>Ver salón de mesas</span>
            <ChevronRight className="w-4 h-4 group-hover:text-accent transition-colors" />
          </div>
        </div>
      )}
    </div>
  );
};
